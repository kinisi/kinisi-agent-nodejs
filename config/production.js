module.exports = {
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
    "commit_dir": "~/.kinisiagent/commit",
    "archive_dir": "~/.kinisiagent/archive"
}
