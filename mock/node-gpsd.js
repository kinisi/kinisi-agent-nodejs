var events = require("events");
var util = require("util");

var Listener = function(options) {
    console.log(options);
}

var dummydata = {
    "class": "TPV",
    "lat": 40.213,
    "lon": 23.541,
    "epv": 0.450,
    "counter": 0
};

util.inherits(Listener, events.EventEmitter);

Listener.prototype.connect = function(callback) { process.nextTick(callback); };
Listener.prototype.disconnect = function() { };
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
