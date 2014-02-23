var path = require("path");

function userHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

module.exports = {
    "debug": false,
    "sample": {
        // in seconds
        "duration": 5,
        "interval": 10
    },
    "sync" : {
        // in seconds
        "interval": 60,
        "http": { 
            hostname: "ai1.kinisi.cc",
            port: 9090,
            path: "/geoserver/api/import",
            method: "POST",
            headers: { "Content-Type": "application/json" }
        }
    },
    "checkup": {
        hostname: "ai1.kinisi.cc",
        port: 8080,
        path: "/geostore",
        method: "GET"
    },
    "device": {
        "id": "jyang805"
    },
    "auth": {
        "token": "i1KBmvhIEoLK"
    },
    "commit_dir": path.join(userHome(), ".kinisiagent/commit"),
    "archive_dir": path.join(userHome(), ".kinisiagent/archive")
}
