var config = require("config");
var sample = require("./lib/sample");
var sync = require("./lib/sync");
var logger = require("./lib/logger");
var remote = require("./lib/remote");
var terminal = require("./lib/terminal");

var main = function() {
  // print some nice startup info
  logger.log("Environment:", process.env.NODE_ENV || "default");
  logger.log("Startup Configuration:", JSON.stringify(config, null, "\t"));

  // start sample and sync loops
  sample.start();
  sync.start();

};

var deviceid_setup = function(callback) {
  // Supported software platforms
  var id_cmds = {
    'rpi-linux': ["stat /etc/issue", "cat /proc/cpuinfo | grep Serial | cut -d : -f 2 | tr -d ' ' | tr -d '\\n'"],
    'mac-osx': ["which sw_vers", "ioreg -rd1 -c IOPlatformExpertDevice | grep UUID | cut -d = -f 2 | tr -d '\"' | tr -d ' ' | tr -d '\\n'"], // Watch for that inner quote (") escape
  };

  // Update the configuration with the device id
  var extend_config_cmd = function(cmd, ostype) {
    terminal.exec(cmd, function (code, result) {
      // Update the device id
      remote.generalExtend(config, {"device": {"id":result, "ostype":ostype}})
      logger.log("Device id: ", config.device.id, "OS type: ", config.device.ostype);
    });
  }

  // Search for the architecture-specific device id
  var id_cmd = null;
  Object.keys(id_cmds).forEach(function (key) {
    if (id_cmd != null) {
      return;
    }
    terminal.exec(id_cmds[key][0], function (code, result) {
      if (code == 0) {
	id_cmd = id_cmds[key][1];
        extend_config_cmd(id_cmd, key)
      }
    });
  })

  // Start main()
  callback();

};

// setup last-ditch exception handler
process.on("uncaughtException", function (ex) {
  logger.log("Caught unhandled exception: ", ex);
});

// Start the agent
deviceid_setup(main);
