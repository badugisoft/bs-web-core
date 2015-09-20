var path = require('path');
var fs = require('fs');
var extend = require('extend');
var unflatten = require('flat').unflatten;

function readJson(filePath) {
    return fs.existsSync(filePath) ? unflatten(require(filePath)) : {};
}

function readEnv(envPrefix) {
    var envConfig = {};
    for (var key in process.env) {
        if(key.startsWith(envPrefix) && key.length > envPrefix.length) {
            envConfig[key.substr(envPrefix.length)] = process.env[key];
        }
    }
    return unflatten(envConfig, { delimiter: '_' });
}

function loadConfig(dir, envPrefix) {
    var configPath = path.resolve(dir);
    return extend(true,
        readJson(path.join(configPath, 'default.json')),
        readJson(path.join(configPath, (process.env.NODE_ENV || 'development') + '.json')),
        readJson(path.join(configPath, 'local.json')),
        readEnv(envPrefix || 'XCFG_')
    );
}

module.exports = exports = loadConfig;
