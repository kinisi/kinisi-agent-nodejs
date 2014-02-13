var config = require("config");
var fs = require("fs");
var path = require("path");
var http = require("http");

// mock switches
var gpsd = require(process.env.NODE_ENV == "mock" ? "./mock/node-gpsd" : "node-gpsd");
if(process.env.NODE_ENV == "mock") {
    require("./mock/kinisi-server");
}

var sentinel = {
    sampling: false,
    samples: [],
    syncing: false
};

// setup listener
var listener = new gpsd.Listener({
    "hostname": "localhost",
    "port": 2947,
    "verbose": true
});

listener.on("TPV", function(data) {
    if(config.debug) {
        console.log("Got data:", data);
    }

    var datapoint = {
        "deviceId": config.device.id,
        "deviceRecord": data
    };

    // collect samples in memory so they are available
    // for a sampling strategy later on (during flushing)
    sentinel.samples.push(datapoint);
});

listener.connect(function() {
    console.log("Connected to GPSD.");
});

// main duties
function sampleDuty() {
    if(!sentinel.sampling) {
        if(config.debug) {
            console.log("Watching GPS...");
        }

        listener.watch();
        
        sentinel.sampling = true;

        // after the configured duration, stop sampling and flush
        setTimeout(function() { 
            if(config.debug) {
                console.log("Unwatching GPS.");
            }
            
            listener.unwatch();

            flushDataPoints(function() {
                sentinel.sampling = false;
            });

        }, (config.sample.duration || 10) * 1000);
    }
}

function syncDuty() {
    if(!sentinel.syncing) {
        // each file has it's own POST-able content
        fs.readdir(config.commit_dir, function(err, files) {
            if(err) { 
                console.error(err);
                return;
            }
            
            if(config.debug) {
                console.log("Found " + files.length + " files.");
            }

            // syncing strategy?
            // for now, just blast them
            files.forEach(function(filename) {
                postDataPoint(filename);
            });

            sentinel.syncing = false;
        });

        sentinel.syncing = true;
    }
}

function flushDataPoints(callback) {
    var async = { 
        "counter": sentinel.samples.length,
        "results": [],
        "callback": function(err, results) { 
            // if err, could buffer in memory
            sentinel.samples = [];
            callback && callback();
        }
    };

    // sampling strategy?
    // for now, take the last item
    sentinel.samples.slice(-1).forEach(function(datapoint) {
        var filename = path.join(config.commit_dir, "TPV" + Date.now() + ".json");
        
        fs.writeFile(filename, JSON.stringify(datapoint), { "encoding": "utf8" }, function(err, result) {
            if(err) { console.error(err); }

            // join these async callbacks to a single aggregated callback
            async.results.push(result);
            if(err || --async.counter == 0) { async.callback(err, async.results); }
        });
    });
}

function postDataPoint(filename, callback) {
    if(config.debug) {
        console.log("Sending " + filename);
    }

    var opts = {
        hostname: config.sync.http.hostname,
        port: config.sync.http.port,
        path: config.sync.http.path,
        method: config.sync.http.method,
        headers: config.sync.http.headers || {},
        agent: false // don't keep connections open, or face the wrath of connection pool saturation (globalAgent)
    };

    var req = http.request(opts, function(res) {
        if(config.debug) {
            console.log("Got response:" + res.statusCode, res.headers);
        }
        
        // archive the file.
        fs.rename(path.join(config.commit_dir, filename), path.join(config.archive_dir, filename), function() {
            console.log("Archived " + filename);
        });

        callback && callback();
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      callback && callback(e, null);
    });

    // write file to request body
    var tempfile = fs.createReadStream(path.join(config.commit_dir, filename));
    tempfile.pipe(req);
}

console.log("Startup:", JSON.stringify(config, null, "\t"));
setInterval(sampleDuty, (config.sample.interval || 30) * 1000);
setInterval(syncDuty, (config.sync.interval || 60) * 1000);
