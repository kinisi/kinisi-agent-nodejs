var events = require("events");
var util = require("util");

var Listener = function(options) {
    console.log(options);
    this.connected = false;
}

var dummydata = {
    "class":"TPV",
    "tag":"RMC",
    "device":"stdin",
    "mode":3,
    "time":new Date().toISOString(),
    "ept":0.005,
    "lat": 40.6609478,
    "lon": -73.9751039,
    "alt":1.320,
    "epx":8.636,
    "epy":7.507,
    "epv":29.336,
    "track":0.0000,
    "speed":0.000,
    "climb":0.000,
    "counter": 0
}


util.inherits(Listener, events.EventEmitter);

Listener.prototype.connect = function(callback) { this.connected ^= 1; process.nextTick(callback); };
Listener.prototype.isConnected = function() { return !!this.connected; };
Listener.prototype.disconnect = function(callback) { this.connected ^= 1; process.nextTick(callback); };
Listener.prototype.watch = function() {
    var self = this;

    self.timer = setInterval(function() { 
        self.emit("TPV", dummydata);
        dummydata.counter++;
        dummydata.time = new Date().toISOString();
    }, 1000);
};

Listener.prototype.unwatch = function() {
    clearInterval(this.timer);
};

module.exports.Listener = Listener;
