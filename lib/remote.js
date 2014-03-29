// This module parses a response from the configuration endpoint and  
// applies the resulting JSON to the runtime configuration.
/* Remote Control */
var config = require("config");
var logger = require("./logger");

// setup a whitelist of things that can be remote-controlled
var whitelist = [
    "debug",
    "sync",
    "sample",
    "auth"
];

// simple "extend" driver that only copies the whitelist properties
function safeExtend(tgt, src, whitelist) {
    if(whitelist && whitelist.length > 0) {
        Object.keys(src).filter(function(o) { 
            return whitelist.indexOf(o) > -1; 
        }).forEach(function(o,i,a) { 
            generalExtend(tgt[o], src[o]); 
        });
    }

    return tgt;
}

function generalExtend(tgt, src) {
    var tgt = tgt || {}, src = src || {}, ret = tgt;
    var tgtkeys = Object.keys(tgt);
    var newkeys = Object.keys(src).filter(function(o) {return tgtkeys.indexOf(o) < 0; });
    // deep extend existing keys
    tgtkeys.forEach(function(k,i,a) {
        if(typeof tgt[k] == "object" && typeof src[k] == "object") {
            ret[k] = generalExtend(tgt[k], src[k]);
        } else {
            ret[k] = src[k] || tgt[k];
        }
    });
    // add new keys
    newkeys.forEach(function(k,i,a) {
        ret[k] = src[k];
    });
    return ret;
}

// the http response handler
var parse = module.exports.parse = function(res, callback) {
    var json = {}, s = "";
    res.on("data", function(data) { s += data; });
    res.on("end", function() { 
        try {
            if(s.length && /^[{\[]/.test(s)) {
                json = JSON.parse(s);
                logger.info("Got Remote Configuration: ", json);

                // apply changes, subject to whitelisted config options.
                var oldconfig = JSON.parse(JSON.stringify(config));
                var preview = safeExtend(oldconfig, json, whitelist);

                var modified = (JSON.stringify(oldconfig) != JSON.stringify(preview))

                if(modified) {
                    safeExtend(config, json, whitelist)
                }

                callback(null, {
                    modified: modified,
                    previous: oldconfig
                });
            } else {
                callback();
            }
        } catch(ex) {
            logger.error(ex.message);
            callback(ex);
        }
    });
}
