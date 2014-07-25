var config = require("config");
var sample = require("./lib/sample");
var sync = require("./lib/sync");
var logger = require("./lib/logger");
var remote = require("./lib/remote");
var terminal = require("./lib/terminal");
var mac = require("./lib/mac");
var uuid = require("uuid");

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
    'rpi-linux': ["grep -q 'Serial          :' /proc/cpuinfo", "cat /proc/cpuinfo | grep Serial | cut -d : -f 2 | tr -d ' ' | tr -d '\\n'"],
    'mac-osx': ["which sw_vers", "ioreg -rd1 -c IOPlatformExpertDevice | grep UUID | cut -d = -f 2 | tr -d '\"' | tr -d ' ' | tr -d '\\n'"], // Watch for that inner quote (") escape
    'generic-linux': ["stat /etc/issue",
                      function() {
                        remote.generalExtend(config, {"device": {"id":uuid.v4(), "ostype":'generic-linux'}})
                      }
                     ],
  };

  // Update the configuration with the device id
  var extend_config_cmd = function(cmd, ostype) {
    if (cmd instanceof Function) {
      cmd();
      return;
    }
    terminal.exec(cmd, function (code, result) {
      // Update the device id
      remote.generalExtend(config, {"device": {"id":result, "ostype":ostype}})
      logger.log("Device id: ", config.device.id, "OS type: ", config.device.ostype);
    });
  }

  // Search for the architecture-specific device id if we haven't already set it
  if (config.device.id == "") {
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
  }

  var extend = require('util')._extend;
  // FIXME: Linux specific
  macs = mac.getMACAddresses();
  lh = '00:00:00:00:00:00';
    if (macs.hasOwnProperty('lo') && (macs['lo'] == lh)) {
      delete macs['lo'];
    }
  // Update MACs each time and only send the most recent
  delete config['device']['macs']
  remote.generalExtend(config, {"device": {"macs": macs}});
  logger.log("MAC Addresses: ", config.device.macs);

  // Start main()
  callback();

};

// setup last-ditch exception handler
process.on("uncaughtException", function (ex) {
  logger.log("Caught unhandled exception: ", ex);
});

// Start the agent
deviceid_setup(main);
