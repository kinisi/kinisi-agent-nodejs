var config = require("config");
var sample = require("./lib/sample");
var sync = require("./lib/sync");

// print some nice startup info
console.log("Environment:", process.env.NODE_ENV || "default");
console.log("Startup Configuration:", JSON.stringify(config, null, "\t"));

// start sample and sync loops
sample.start();
sync.start();

// setup last-ditch exception handler
process.on("uncaughtException", function (ex) {
  console.log("Caught unhandled exception: ", ex);
});
