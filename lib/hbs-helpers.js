var moment = require('moment');

module.exports = exports = {};

// date functions
exports.moment = function() { return moment(); };
exports['moment.format'] = function(date, fmt) { return moment(date).format(fmt || 'YYYY-MM-DD HH:mm:ss'); };

// string functions
exports['string.split'] = function(str, sep) { return str.split(sep); };
exports['string.join'] = function(str, sep) { return str.split(sep); };

// number operators
exports.add = function(a, b) { return a + b; };
exports.sub = function(a, b) { return a - b; };
exports.mul = function(a, b) { return a * b; };
exports.div = function(a, b) { return a / b; };
exports.mod = function(a, b) { return a % b; };
exports.inc = function(a) { return ++a; };
exports.dec = function(a) { return --a; };

// block handling
var blocks = {};
exports.extend = function(name, options) {
    if (!blocks[name]) {
        blocks[name] = [];
    }
    blocks[name].push(options.fn);
};

exports.block = function(name) {
    var res = '';
    if (blocks[name]) {
        blocks[name].forEach(function(fn) { res += fn(); });
        delete blocks[name];
    }
    return res;
};
