// This module reads files from a configured directory,
// then POSTs the contents of each to a configured endpoint.
// It then archives the files to a configured directory
/* Directory Sync */
var config = require("config");
var fs = require("fs");
var path = require("path");
var http = require("http");
var remote = require("./remote");

// mock conditional
if(process.env.NODE_ENV == "mock") {
    require("../mock/kinisi-server");
}

var sentinel = { 
    timeout: null
};

var duty = module.exports.duty = function() {
    // each file has it's own POST-able content
    fs.readdir(config.commit_dir, function(err, files) {
        if(err) { 
            console.error(err);
            return;
        }
        
        if(config.debug) {
            console.log("Found " + files.length + " files.");
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

        var req = http.request(opts, function(res) {

            // change the sync interval if the server sends configuration
            remote.parse(res, function(err, result) {
                // restart sync duty with new configuration
                if(result) {
                    stop();
                    start();
                }
            });
            
            // syncing strategy? 
            // take two periods-worth (2 * sync.interval / sample.interval), with a max of 100.
            var syncSize = Math.min(100, 2 * Math.ceil(config.sync.interval / config.sample.interval));
            files.slice(0,syncSize).forEach(function(filename) {
                postDataPoint(filename);
            });
        })
        
        req.on("error", function(e) {
            console.error("Checkup error: " + e.message);
        });

        req.end();
    });

    start();
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
            if(config.debug) {
                console.log("Archived " + filename);
            }
        });

        if(callback instanceof Function) callback();
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        if(callback instanceof Function) callback(e, null);
    });

    // write file to request body
    fs.readFile(path.join(config.commit_dir, filename), { encoding: "utf8"}, function(err, data) {
        req.end(data);
    });
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
