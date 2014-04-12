var config = require("config");
var logger = require("./logger");

var shell = "bash";

module.exports = {
    config: function(options) { 
        shell = options.shell || shell;
    },

    exec:  function(cmd, callback) {

        var terminal = require("child_process").spawn(shell);
        var _output = "";
        var output = null;
        var exitcode = null;
        var tryend = function () {
            if ((output != null) && (exitcode != null)) {
                if(exitcode != 0 || config.debug) {
                    logger.info("child process exited with code", exitcode);
                }
                !!callback && callback(exitcode, output);
                output = null;
                exitcode = null;
            }
        }

        terminal.stdout.on("data", function (data) {
            _output += data;
        });
        terminal.stdout.on("end", function () {
            output = _output;
            _output = null;
            tryend();
        });

        terminal.on("exit", function (code) {
            exitcode = code;
            tryend();
        });

        if(config.debug) { 
            logger.info("Sending:", cmd);
        }

        terminal.stdin.write(cmd + "\n");
        terminal.stdin.end();
    }
}
