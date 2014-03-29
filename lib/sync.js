// This module reads files from a configured directory,
// then POSTs the contents of each to a configured endpoint.
// It then archives the files to a configured directory
/* Directory Sync */
var config = require("config");
var fs = require("fs");
var path = require("path");
var querystring = require("querystring");
var https = require("https");
var remote = require("./remote");
var db = require("./db");
var logger = require("./logger");

// mock conditional
if(process.env.NODE_ENV == "mock") {
    require("../mock/kinisi-server");
}

var sentinel = { 
    interval_timer: []
};

var duty = module.exports.duty = function() {

    // syncing strategy? 
    // four periods-worth (4 * sync.interval / sample.interval), with a max of `sync.maxrecords`.
    // if that is successful, keep syncing `sync.maxrecords` until db is empty
    limit = Math.min(config.sync.maxrecords, 4 * Math.ceil(config.sync.interval / config.sample.interval));

    // read the specified number of records out of the db
    // in reverse order, to prioritize sending recent data over older data
    getData(limit, function(records) {
        // do the checkup in the sync loop for now (needs to be refactored)
        var opts = {
            hostname: config.checkup.hostname,
            port: config.checkup.port,
            path: config.checkup.path + "?" + querystring.stringify({
                // authentication:
                "api_token": config.auth.token,
                "device_id": config.device.id
            }),
            method: config.checkup.method,
            headers: config.checkup.headers || {},
            agent: false // don't keep connections open, or face the wrath of connection pool saturation (globalAgent)
        };

        var req = https.request(opts, function(res) {

            // change the sync interval if the server sends configuration
            remote.parse(res, function(err, result) {
                if(err) {
                    return logger.error("Remote parse error:", err);
                }
                // restart sync duty with new configuration
                if(!!result && result.previous.sync.interval != config.sync.interval) {
                    stop(); start();
                }
            });
                
            syncData(records);
        }).on("error", function(e) {
            logger.error("Checkup error: " + e.message);
        }).end();
    });
}

function getData(limit, callback) {
    db.read({
        "limit": limit,
        "reverse": true
    }, function(err, records) {
        if(err) { return logger.error(err); }
        if(config.debug) { logger.log("Read " + records.length + " data points."); }

        callback(records);
    });
}

function syncData(records) {
    
    var json = {
        "deviceId": config.device.id,
        "deviceRecords": records.map(function(r) { return JSON.parse(r.value) } )
    };

    if(config.debug) {
        logger.log("Sending data:", JSON.stringify(json));
    }

    var opts = {
        hostname: config.sync.hostname,
        port: config.sync.port,
        path: config.sync.path,
        method: config.sync.method,
        headers: { 
            "Content-Type": "application/json",
            "X-Api-Token": config.auth.token
        },
        agent: false // don't keep connections open, or face the wrath of connection pool saturation (globalAgent)
    };

    var req = https.request(opts, function(res) {
        var body = "";
        res.on("data", function(chunk) { body += chunk });
        
        if(config.debug) {
            logger.log("Got response:" + res.statusCode, res.headers); 
            res.on("end", function() { logger.info("Body:", body); });
        }

        // if server indicates success, delete the records.
        if(res.statusCode == 200) {
            syncSuccess(records);
        } else if(res.statusCode == 400 && body.indexOf("Duplicate entry") > -1) {
            if(records.length == 1) {
                // the duplicate is this one!  delete it and continue.
                syncSuccess(records);
            } else {
                // upload one by one to find the duplicate 
                getData(1, syncData);
            }
        }
    }).on("error", function(e) {
        logger.log("problem with sync: " + e.message);
    }).end(JSON.stringify(json));
}

function syncSuccess(records) {
    db.del(records, function(err) {
        if(err) return logger.error(err);
        if(config.debug) { logger.info("Deleted " + records.length + " records."); }

        // keep syncing!
        if(records.length > 0) {
            getData(config.sync.maxrecords, syncData);
        }
    });
}

var start = module.exports.start = function() {
    if(config.sync.interval < 2) {
        logger.warn("Sync interval must be at least 2 seconds. Setting interval to 2 seconds.");
    }

    if(sentinel.interval_timer.length == 0) {
        sentinel.interval_timer.push(setInterval(duty, (Math.max(config.sync.interval, 2) || 60) * 1000));
    } else {
        logger.warn("Sync: A timer already exists!", sentinel.interval_timer);
    }
}

var stop = module.exports.stop = function() {
    clearInterval(sentinel.interval_timer.pop());
}
