// This module creates a listener against [GPSD](http://gpsd.berlios.de/) and
// reads samples according to a configured interval and duration. 
// It then flushes the samples to a configured  directory.
/* GPSD Sample */
var config = require("config");
var fs = require("fs");
var path = require("path");

// mock conditional
var gpsd_src = process.env.NODE_ENV == "mock" ? "../mock/node-gpsd" : "node-gpsd";
var gpsd = require(gpsd_src);

var sentinel = {
    timeout: null,
    samples: []
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

var duty = module.exports.duty = function() {
    if(config.debug) {
        console.log("Watching GPS...");
    }

    listener.watch();

    // after the configured duration, stop sampling and flush
    // obey "non-continuous mode" rules:
    // duration > 1 : sampling duration is longer than 1 second.
    // interval > duration : interval is longer than duration
    if(config.sample.duration > 1 && config.sample.interval > config.sample.duration) {
        
        // setup the end of the sample duration
        setTimeout(function() { 
            if(config.debug) {
                console.log("Unwatching GPS.");
            }
            
            listener.unwatch();
            flushDataPoints();

        }, (config.sample.duration || 10) * 1000);
        
        start();
    } else {
        // continuous sampling mode, add "flush" on TPV events:
        listener.on("TPV", function() { flushDataPoints(); });
    }
}

function flushDataPoints(callback) {

    // sampling strategy?
    // for now, take the last item
    var flushqueue = sentinel.samples.slice(-1),

    // setup a callback after the queue has been flushed
    async = { 
        "counter": flushqueue.length,
        "results": [],
        "callback": function(err, results) { 
            // if err, could buffer in memory
            sentinel.samples = [];
            callback && callback();
        }
    };

    // flush
    flushqueue.forEach(function(datapoint) {
        var filename = path.join(config.commit_dir, "TPV" + Date.now() + ".json");
        
        fs.writeFile(filename, JSON.stringify(datapoint), { "encoding": "utf8" }, function(err, result) {
            if(err) { console.error(err); }

            // join these async callbacks to a single aggregated callback
            async.results.push(result);
            if(err || --async.counter == 0) { async.callback(err, async.results); }
        });
    });
}

var start = module.exports.start = function() {

    if(!listener.isConnected()) {
        listener.connect(function() {
            console.log("Connected to GPSD.");
        });
    }

    if(config.sample.duration > config.sample.interval) {
        console.warn("Sample duration is longer than sample interval. Setting sampling to continuous mode.");
    }
    if(config.sample.interval < 1) {
        console.warn("Sample interval is less than 1 second.  Setting sampling to continuous mode.");
    }
    sentinel.timeout = setTimeout(duty, (Math.max(config.sample.interval, 1) || 30) * 1000);
}

var stop = module.exports.stop = function() {
    
    clearTimeout(sentinel.timeout);

    if(listener.isConnected()) {
        listener.disconnect(function() {
            console.log("Disconnected from GPSD.");
        });
    }
}

