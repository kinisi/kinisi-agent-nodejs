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
        "http": { 
            hostname: "localhost",
            port: 5674, // KNSI on the phone pad
            path: "/1.0/gpsd",
            method: "POST"
        }
    },
    "device": {
        "id": "jyang805"
    },
    "commit_dir": "./run/commit",
    "archive_dir": "./run/archive"
}
