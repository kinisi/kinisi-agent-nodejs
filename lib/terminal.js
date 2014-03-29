var config = require("config");
var logger = require("./logger");

var shell = "bash";

module.exports = {
    config: function(options) { 
        shell = options.shell || shell;
    },

    exec:  function(cmd, callback) {
        var terminal = require("child_process").spawn(shell);
        var output = "";
        terminal.stdout.on("data", function (data) {
            output += data;
        });

        terminal.on("exit", function (code) {
            if(code != 0 || config.debug) {
                logger.info("child process exited with code ", code);
            }
            !!callback && callback(code, output);
        });

        if(config.debug) { 
            logger.info("Sending:", cmd);
        }

        terminal.stdin.write(cmd + "\n");
        terminal.stdin.end();
    }
}
