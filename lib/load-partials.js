var fs = require('fs');
var path = require('path');
var hbs = require('hbs');
var readdir = require('./read-dir');

function loadPartials(dir, autoReload) {
    readdir(dir, '.hbs').forEach(function(file){
        var name = path.join(path.dirname(file), path.basename(file, '.hbs')).substr(dir.length + 1);
        hbs.registerPartial(name, fs.readFileSync(path.resolve(file), 'utf8'));
    });

    if (autoReload !== false) {
        fs.watch(dir, { recursive: true }, function(event, filename){
            if (event === 'change') {
                var file = path.join(dir, filename);
                var name = path.join(path.dirname(file), path.basename(file, '.hbs')).substr(dir.length + 1);
                hbs.registerPartial(name, fs.readFileSync(path.resolve(file), 'utf8'));
            }
        });
    }
}

module.exports = exports = loadPartials;
