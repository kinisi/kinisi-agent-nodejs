var path = require("path");

module.exports = {
    "debug": false,
    "sample": {
        // in seconds
        "duration": 0,
        "interval": 0
    },
    "sync" : {
        // in seconds
        "interval": 10,
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
    "commit_dir": "/var/log/kinisiagent",
    "archive_dir": "/var/log/kinisiagent/archive"
}
