var config = require("config");
var path = require("path");
var levelup = require("levelup")
var logger = require("./logger");

// 1) Create our database, supply location and options.
//    This will create or open the underlying LevelDB store.
var commit_db = levelup(path.join(config.commit_dir, "leveldb"));

module.exports.read = function(options, callback) {
    var bundle = []; 

    commit_db.createReadStream(options)
    .on("data", function (data) { bundle.push(data); })
    .on("error", function (err) { logger.log("Error reading from db:", err); callback(err); })
    .on("end", function () { callback(null, bundle); });
};

module.exports.write = function(key, value, callback) {
    commit_db.put(key, value, { "sync": true }, callback);
};

module.exports.del = function(data, callback) {
    if(data instanceof Array) {
        var ops = data.map(function(o) { return { "type": "del", "key": o.key }; });
        commit_db.batch(ops, { "sync": true }, callback);
    } else {
        commit_db.del(key, { "sync": true }, callback);
    }
};
