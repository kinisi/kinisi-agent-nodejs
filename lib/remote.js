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
            tgt[o] = generalExtend(tgt[o], src[o]);
        });
    }

    return tgt;
}

// mutates target to include values of source
function generalExtend(tgt, src) {
    tgt = (tgt === undefined) ? {} : tgt;
    src = (src === undefined) ? {} : src;
    if(typeof tgt == "object" && typeof src == "object") {
        // iterate over src keys
        Object.keys(src).forEach(function(k) {
            tgt[k] = generalExtend(tgt[k], src[k]);
        });
    } else {
        // Target or source is a primitive value, so just assign `tgt` to `src`.
        // Since primitives are pass-by-value, (operations do not mutate the value outside this scope), 
        // callers should assign the return value to the target: `tgt = generalExtend(tgt, src);`
        tgt = src;
    }

    return tgt;
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
