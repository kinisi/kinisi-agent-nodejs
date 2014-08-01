// From http://stackoverflow.com/questions/11173042/can-i-fetch-a-unique-server-machine-identifier-with-node-js
// Seems like a better implementation than the Arp version: https://groups.google.com/forum/#!msg/nodejs/parbPcGGnj0/gcRsfWV3qEMJ

var fs = require('fs'),
    path = require('path');

var getMACAddresses = module.exports.getMACAddresses = function() {
    var macs = {};
    try {
        var devs = fs.readdirSync('/sys/class/net/');
        devs.forEach(function(dev) {
            var fn = path.join('/sys/class/net', dev, 'address');
            if(fs.existsSync(fn)) {
                macs[dev] = fs.readFileSync(fn).toString().trim();
            }
        });
    } catch(ex) {
        console.trace(ex);
    }
    return macs;
}

// if called independently:
if (require.main === module) {
    console.log(getMACAddresses());
}
