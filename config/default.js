var auth = require("./auth")

module.exports = {
    "debug": true,
    "sample": {
        // in seconds
        "duration": 2,
        "interval": 5
    },
    "sync" : {
        // in seconds
        "interval": 5,
        "maxrecords": 1000,
        // endpoint settings
        "hostname": "localhost",
        "port": 5674, // KNSI on the phone pad
        "path": "/1.0/gpsd",
        "method": "POST"
    },
    "checkup": {
        "hostname": "localhost",
        "port": 5674, // KNSI on the phone pad
        "path": "/1.0/checkup",
        "method": "GET"
    },
    "device": {
        "id": "",
    },
    "auth": require("./auth"),
    "commit_dir": "./run/commit",
    "archive_dir": "./run/archive"
}
