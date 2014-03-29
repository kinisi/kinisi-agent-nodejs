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
var logger = require("./logger");
var terminal = require("./terminal");

var sentinel = {
    samples: [],
    interval_timer: [],
    duration_timers: []
};

// setup listener
var listener = new gpsd.Listener({
    "hostname": "localhost",
    "port": 2947,
    "verbose": true
});

// Stubbornly retry if we have GPSD connection issues.
listener.on("error.connection", function(err) {
    logger.error("Encountered \"error.connection\" while trying to connect to GPSd. Retrying in 60 seconds...");
    try { listener.connected = false; stop(); } catch(ex) { }
    setTimeout(start, 60*1000);
});

// Reconnect on GPSD socket errors.  We were probably dropped by the daemon.
listener.on("error.socket", function(err) {
    logger.error("Encountered \"error.socket\". Reconnecting...");
    try { listener.connected = false; stop(); } catch(ex) { }
    start();
});

// listen for data messages
listener.on("TPV", function(data) {
    if(config.debug) {
        logger.log("Got data:", data);
    }

    // collect samples in memory so they are available
    // for a sampling strategy later on (during flushing)
    sentinel.samples.push(data);
});

var duty = module.exports.duty = function() {
    if(config.debug) {
        logger.log("Watching GPS...");
    }

    listener.watch();

    // after the configured duration, stop sampling and flush
    // obey "non-continuous mode" rules:
    // duration > 1 : sampling duration is longer than 1 second.
    // interval > duration : interval is longer than duration
    if(config.sample.duration > 1 && config.sample.interval > config.sample.duration) {
        
        // setup the end of the sample duration
        sentinel.duration_timers.push(setTimeout(function() { 
            if(config.debug) {
                logger.log("Unwatching GPS.");
            }
            
            listener.unwatch();
            writeData();

            // ensure we clean up duration timers
            while(sentinel.duration_timers.length > 0) {
                clearTimeout(sentinel.duration_timers.pop());
            }
        }, (config.sample.duration || 10) * 1000));
        
    } else {
        // continuous sampling mode, add "flush" on TPV events,
        // and stop the interval timer.
        listener.on("TPV", writeData);
        clearInterval(sentinel.interval_timer.pop());
    }
}

function writeData() {
    // sampling strategy:
    // filter for mode > 1, take the last good one
    var selected = sentinel.samples.filter(function(o) {
        return o && o.mode > 1;
    }).slice(-1);

    // send data status to the LED
    // [Reference](http://www.raspberrypi.org/forum/viewtopic.php?f=31&t=12530)
    terminal.exec("echo " + selected.length + " > /sys/class/leds/led0/brightness");
    
    // write the samples
    selected.forEach(function(sample) {
        db.write(Date.now(), JSON.stringify(sample));
    });

    // clear the sample buffer
    sentinel.samples = [];
}

var start = module.exports.start = function() {

    if(!listener.isConnected()) {
        listener.connect(function() {
            logger.log("Connected to GPSD.");
        });
    }

    if(config.sample.duration > config.sample.interval) {
        logger.warn("Sample duration is longer than sample interval. Setting sampling to continuous mode.");
    }
    if(config.sample.interval < 1) {
        logger.warn("Sample interval is less than 1 second.  Setting sampling to continuous mode.");
    }

    // ensure only a single timer exists at any given time
    if(sentinel.interval_timer.length == 0) {
        sentinel.interval_timer.push(setInterval(duty, (Math.max(config.sample.interval, 1) || 30) * 1000));
    } else {
        logger.warn("Sample: A timer already exists!", sentinel.interval_timer);
    }
}

var stop = module.exports.stop = function() {
    
    clearInterval(sentinel.interval_timer.pop());

    if(listener.isConnected()) {
        listener.disconnect(function() {
            logger.log("Disconnected from GPSD.");
        });
    }
}
