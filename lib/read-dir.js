var fs = require('fs');
var path = require('path');

function loadDir(dir, ext) {
    var res = [];
    var files = fs.readdirSync(path.resolve(dir));
    files.forEach(function(elem) {
        var file = path.join(dir, elem);
        var stat = fs.statSync(path.resolve(file));

        if (stat.isDirectory()) {
            Array.prototype.push.apply(res, loadDir(file, ext));
        }
        else if (ext === undefined || path.extname(elem).toLowerCase() === ext) {
            res.push(file);
        }
    });

    return res;
}

module.exports = exports = loadDir;
