var events = require("events");
var util = require("util");

var Listener = function(options) {
    console.log(options);
    this.connected = false;
}

var dummydata = {
    "class": "TPV",
    "lat": 40.213,
    "lon": 23.541,
    "epv": 0.450,
    "counter": 0
};

util.inherits(Listener, events.EventEmitter);

Listener.prototype.connect = function(callback) { this.connected ^= 1; process.nextTick(callback); };
Listener.prototype.isConnected = function() { return !!this.connected; };
Listener.prototype.disconnect = function(callback) { this.connected ^= 1; process.nextTick(callback); };
Listener.prototype.watch = function() {
    var self = this;

    self.timer = setInterval(function() { 
        self.emit("TPV", JSON.stringify(dummydata));
        dummydata.counter++;
    }, 1000);
};

Listener.prototype.unwatch = function() {
    clearInterval(this.timer);
};

module.exports.Listener = Listener;
