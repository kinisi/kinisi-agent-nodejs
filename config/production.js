module.exports = {
    "debug": false,
    "sample": {
        // in seconds
        "duration": 2,
        "interval": 5
    },
    "sync" : {
        // in seconds
        "interval": 10,
        "maxrecords": 1000,
        // endpoint connection:
        "hostname": "api.kinisi.cc",
        "port": 443,
        "path": "/geoserver/api/import",
        "method": "POST"
    },
    "checkup": {
        "hostname": "api.kinisi.cc",
        "port": 443,
        "path": "/geoserver/api/config",
        "method": "GET"
    },
    "device": {
        "id": "jyang805"
    },
    "auth": {
        "token": "N9yCFXqDJvg6"
    },
    "commit_dir": "/var/log/kinisiagent",
    "archive_dir": "/var/log/kinisiagent/archive"
}
