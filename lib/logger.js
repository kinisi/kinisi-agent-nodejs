var fns = [
    "info",
    "log",
    "warn",
    "error"
];

module.exports = {};

fns.forEach(function(fn) {
    module.exports[fn] = function() {
        // call the matching console function, apply the args
        console[fn].apply(null, ["[" + new Date().toISOString() + " ]: "].concat(Array.prototype.slice.call(arguments)));
    };
});

