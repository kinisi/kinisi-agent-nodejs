var https = require("https");
var fs = require("fs");
var config = require("config");

// See these issues for why this hack is here:
// https://github.com/joyent/node/issues/5045
// https://github.com/joyent/node/issues/4984
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var ssl = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt'),
  ca: fs.readFileSync(__dirname + '/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var unreliable = https.createServer(ssl, function (req, res) {
    var uhoh = Math.random() < 0.2, msg = "";

    if(req.method == "GET" && Math.random() < 0.2) {
        var json = { 
            "sync": { "interval": parseInt(Math.random() * 8, 10) + 10 }, 
        };

        if(Math.random() < 0.5) {
            json["sample"] = { 
                "interval": parseInt(Math.random() * 3, 10) + 6,
                "duration": parseInt(Math.random() * 3, 10) + 2
            }
        }
        msg = JSON.stringify(json);

    } else {
        if(uhoh) { 
            res.writeHead(500, { "X-Error": "Something Bad Happened" });
        } else {
            res.writeHead(200);
        }
    }
    res.end(msg);

});

function goDown() {
    var downtime = parseInt(Math.random() * 20 + 2, 10);
    unreliable.close();
    console.warn("Kinisi Mock Server is down!", "Will be back in " + downtime + "s");
    setTimeout(goUp, 1000 * downtime);
}

function goUp() {
    var uptime = parseInt(Math.random() * 60 + 20, 10);
    unreliable.listen(config.sync.port, "localhost", 511, function() {
        console.warn("Kinisi Mock Server is up!", "Will go down in " + uptime + "s");
    });
    setTimeout(goDown, 1000 * uptime);
}

goUp();
