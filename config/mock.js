module.exports = {
    "debug": true,
    "sample": {
        // in seconds
        "duration": 0,
        "interval": 0
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
        "id": "jyang805"
    },
    "auth": {
        "token": "N9yCFXqDJvg6"
    },
    "commit_dir": "./run/commit",
    "archive_dir": "./run/archive"
}

