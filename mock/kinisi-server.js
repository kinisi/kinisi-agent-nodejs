var http = require("http");
var config = require("config");

var unreliable = http.createServer(function (req, res) {
    var uhoh = Math.random() < 0.2, msg = "";

    if(req.method == "GET" && Math.random() < 0.2) {
        var json = { 
            "sync": { "interval": parseInt(Math.random() * 8, 10) + 2 }, 
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
    unreliable.listen(config.sync.http.port, "localhost", 511, function() {
        console.warn("Kinisi Mock Server is up!", "Will go down in " + uptime + "s");
    });
    setTimeout(goDown, 1000 * uptime);
}

goUp();
