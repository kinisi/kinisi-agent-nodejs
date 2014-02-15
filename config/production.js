var path = require("path");

function userHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

module.exports = {
    "debug": false,
    "sample": {
        // in seconds
        "duration": 10,
        "interval": 30
    },
    "sync" : {
        // in seconds
        "interval": 60,
        "http": { 
            hostname: "ai1.kinisi.cc",
            port: 8080,
            path: "/geostore",
            method: "POST"
        }
    },
    "device": {
        "id": "jyang805"
    },
    "commit_dir": path.join(userHome(), ".kinisiagent/commit"),
    "archive_dir": path.join(userHome(), ".kinisiagent/archive")
}
