var lup = require("levelup"), 
config = require("config"), 
db = lup(config.commit_dir + "/leveldb"), 
r = 0, first = null, last = null,
done = false,
rs = db.createReadStream();

var src = rs.on("data", function(d) { 
    if(r == 0) {
        first = d;
    }
    last = d;
    r++; 
}).on("close", function() { 
    done = true; 
    console.log("There are ",r,"records in the database.");
    console.log("First: ", first); 
    console.log("Last:", last);
});

var ts = setInterval(function() { if(done) clearInterval(ts) }, 100);
console.log("Scanning database...");
