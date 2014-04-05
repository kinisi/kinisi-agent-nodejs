var config = require("config");
var sample = require("./lib/sample");
var sync = require("./lib/sync");
var logger = require("./lib/logger");
var remote = require("./lib/remote");
var terminal = require("./lib/terminal");

terminal.exec("cat /proc/cpuinfo | grep Serial | cut -d : -f 2 | tr -d ' ' | tr -d '\n'", null, function (code, result) {
  // Update the id to be the rPi serial number
  remote.generalExtend(config, {"device": {"id":result}})

  logger.log("rPi Serial: ", config.device.id);
});

// print some nice startup info
logger.log("Environment:", process.env.NODE_ENV || "default");
logger.log("Startup Configuration:", JSON.stringify(config, null, "\t"));

// start sample and sync loops
sample.start();
sync.start();

// setup last-ditch exception handler
process.on("uncaughtException", function (ex) {
  logger.log("Caught unhandled exception: ", ex);
});
