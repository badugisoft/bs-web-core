var fs = require('fs');
var path = require('path');
var orm = require('orm');
var readdir = require(path.join(__dirname, 'read-dir'));

function loadModels(app, connStr, dir) {
    app.use(orm.express(connStr, {
        define: function (db, models, next) {
            readdir(dir, '.json').forEach(function(file){
                var name = path.basename(file, '.json').toCamelCase(true);
                models[name] = db.define(name, require(path.resolve(file)));
            });
            next();
        }
    }));
}

module.exports = exports = loadModels;
