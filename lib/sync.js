// This module reads files from a configured directory,
// then POSTs the contents of each to a configured endpoint.
// It then archives the files to a configured directory
/* Directory Sync */
var config = require("config");
var fs = require("fs");
var path = require("path");
var http = require("http");
var remote = require("./remote");
var db = require("./db");

// mock conditional
if(process.env.NODE_ENV == "mock") {
    require("../mock/kinisi-server");
}

var sentinel = { 
    timeout: null
};

var duty = module.exports.duty = function() {

    // syncing strategy? 
    // two periods-worth (4 * sync.interval / sample.interval), with a max of 100.
    var limit = Math.min(100, 4 * Math.ceil(config.sync.interval / config.sample.interval));

    // read the specified number of records out of the db
    // in reverse order, to prioritize sending recent data over older data
    db.read({ 
        "limit": limit,
        "reverse": true,
        "valueEncoding": "json"
    }, function(err, records) {
        if(err) { 
            console.error(err);
            return;
        }
        
        if(config.debug) {
            console.log("Read " + records.length + " data points.");
        }

        if(records.length == 0) {
            return;
        }

        // do the checkup in the sync loop for now (needs to be refactored)
        var opts = {
            hostname: config.checkup.hostname,
            port: config.checkup.port,
            path: config.checkup.path,
            method: config.checkup.method,
            headers: config.checkup.headers || {},
            agent: false // don't keep connections open, or face the wrath of connection pool saturation (globalAgent)
        };

        // set security
        opts.headers["X-Api-Token"] = config.auth.token;
        opts.headers["User-Agent"] = "KinisiAgent/1.0 (" + config.device.id + ")";

        var req = http.request(opts, function(res) {

            // change the sync interval if the server sends configuration
            remote.parse(res, function(err, result) {
                // restart sync duty with new configuration
                stop(); start();
            });
                
            syncData(records);
        }).on("error", function(e) {
            console.error("Checkup error: " + e.message);
        }).end();
    });

    start();
}

function syncData(records) {
    
    var json = {
        "deviceId": config.device.id,
        "deviceRecords": records.map(function(d) { return d.value; })
    };

    if(config.debug) {
        console.log("Sending data:", JSON.stringify(json));
    }

    var opts = {
        hostname: config.sync.http.hostname,
        port: config.sync.http.port,
        path: config.sync.http.path,
        method: config.sync.http.method,
        headers: config.sync.http.headers || {},
        agent: false // don't keep connections open, or face the wrath of connection pool saturation (globalAgent)
    };

    // set security
    opts.headers["X-Api-Token"] = config.auth.token;
    
    var req = http.request(opts, function(res) {
        if(config.debug) {
            console.log("Got response:" + res.statusCode, res.headers);
        }

        // if server indicates success, delete the records.
        if(res.statusCode == 200) {
            db.del(records, function(err) {
                if(err) return console.error(err);
                if(config.debug) { console.info("Synced and deleted " + records.length + " records."); }
            });
        }
    }).on("error", function(e) {
        console.log("problem with sync: " + e.message);
    }).end(JSON.stringify(json));
}

var start = module.exports.start = function() {
    if(config.sync.interval < 2) {
        console.warn("Sync interval must be at least 2 seconds. Setting interval to 2 seconds.");
    }
    sentinel.timeout = setTimeout(duty, (Math.max(config.sync.interval, 2) || 60) * 1000);
}

var stop = module.exports.stop = function() {
    clearTimeout(sentinel.timeout);
}
