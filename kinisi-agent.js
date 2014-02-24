var config = require("config");
var sample = require("./lib/sample");
var sync = require("./lib/sync");
var logger = require("./lib/logger");

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
