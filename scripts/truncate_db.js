var lup = require("levelup"), 
config = require("config"), 
db = lup(config.commit_dir + "/leveldb"), 
r = 0,
done = false,
rs = db.createReadStream();
rs.pause();
var src = rs.on("data", function(d) { r++; }).on("close", function() { done = true; console.log("Deleted",r,"records"); });
var dst = rs.pipe(db.createWriteStream({ "type": "del" }));
rs.resume();
var ts = setInterval(function() { if(done) clearInterval(ts) }, 100);
console.log("Truncating database...");
