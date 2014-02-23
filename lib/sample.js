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
var db = require("./db");

var sentinel = {
    samples: [],
    timeout: null
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

    // collect samples in memory so they are available
    // for a sampling strategy later on (during flushing)
    sentinel.samples.push(data);
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
            writeData();

        }, (config.sample.duration || 10) * 1000);
        
        start();
    } else {
        // continuous sampling mode, add "flush" on TPV events:
        listener.on("TPV", writeData);
    }
}

function writeData() {
    // sampling strategy?
    // for now, take the last item
    var selected = sentinel.samples.slice(-1);
    
    // write the samples
    selected.forEach(function(sample) {
        db.write(Date.now(), sample);
    });

    // clear the sample buffer
    sentinel.samples = [];
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

