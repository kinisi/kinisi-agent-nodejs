var config = require("config");
var path = require("path");
var levelup = require("levelup")

// 1) Create our database, supply location and options.
//    This will create or open the underlying LevelDB store.
var commit_db = levelup(path.join(config.commit_dir, "leveldb"));

module.exports.read = function(options, callback) {
    var bundle = []; 

    db.createReadStream(options)
    .on("data", function (data) { bundle.push(data); })
    .on("error", function (err) { console.log("Error reading from db:", err); callback(err); })
    .on("end", function () { callback(null, bundle); });
};

module.exports.write = function(key, value, callback) {
    commit_db.put(key, value, callback);
};

module.exports.del = function(key, callback) {
    commit_db.del(key, callback);
};
