var fs = require('fs');
var path = require('path');
var express = require('express');
var readdir = require(path.join(__dirname, 'read-dir'));

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var OPTIONS = /\/\/#\s*([^\s]+)\s*:\s*([^\s]*)\s*$/mg;

function parseFunction(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var params = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

    var options = {}, match;
    fnStr = func.toString();
    while ((match = OPTIONS.exec(fnStr)) !== null) {
        options[match[1]] = match[2];
    }

    return { params: params || [], options: options, func: func };
}

var io;

function loadControllers(app, server, dir) {
    var rootLength = path.resolve(dir).length;
    var routeList = [], ioList = [];

    readdir(dir, '.js').forEach(function(file){
        var controllersPath = path.resolve(file);
        var relPath = controllersPath.substring(rootLength, controllersPath.length - 3);
        var controllers = require(controllersPath);

        for (var name in controllers) {
            var controllerName = ((controllers.namespace || relPath) + '/' + name)
                .replace(/\/index\//g, '/')
                .replace(/\/index$/g, '')
                .replace(/\/\//g, '/');
            controllerName = controllerName === '' ? '/' : controllerName;

            var controller = controllers[name];
            if ((typeof controller === "function")) {
                var info = parseFunction(controller);
                var isSocketio = info.params.indexOf('$socket') != -1 || info.params.indexOf('$io') != -1;

                if (isSocketio) {
                    info.name = info.options.name || controllerName.substr(1).replace(/\//g, '.');
                    ioList.push(info);
                }
                else {
                    info.path = info.options.path || controllerName;
                    info.methods = !info.options.method ? [controllers.method || 'get'] :
                        info.options.method.split(',').map(function(elem){ return elem.trim(); });

                    info.params.forEach(function(param) {
                        if (param.startsWith('$$')) {
                            info.path += '/:' + param.substr(2);
                        }
                    });

                    info.path = info.path.replace(/\/\//g, '/');

                    routeList.push(info);
                }
            }
        }

    });

    var router = express.Router();

    routeList.forEach(function(elem) {
        elem.methods.forEach(function(method) {
            console.info(method.toUpperCase() + ' :', elem.path);

            router[method](elem.path, function(req, res){
                var args = [], paramIndex = 0;
                elem.params.forEach(function(param) {
                    if (param === '$req') args.push(req);
                    else if (param === '$res') args.push(res);
                    else if (param.startsWith('$$')) args.push(req.params[param.substr(2)]);
                    else if (method === 'post') args.push(req.body[param] || req.query[param]);
                    else if (method === 'get') args.push(req.query[param]);
                    else args.push(null)
                });

                var ret = elem.func.apply(app, args);
                if(!ret.headersSent) {
                    if (ret.toString() === '[object Object]') {
                        res.json(ret);
                    }
                    else if (typeof ret === 'string') {
                        res.locals.config = config;
                        res.render(ret);
                    }
                }
            });
        });
    });

    app.use(router);

    if (ioList.length > 0) {
        ioList.forEach(function(elem) {
            console.info('SOCKETIO :', elem.name);
        });

        io = require('socket.io')(server);
        io.on('connection', function (socket) {
            ioList.forEach(function(elem) {
                socket.on(elem.name, function (data) {
                    var args = [];
                    elem.params.forEach(function(param) {
                        if (param === '$io') args.push(io);
                        else if (param === '$socket') args.push(socket);
                        else args.push(data[param]);
                    });
                    elem.func.apply(app, args);
                });
            });
        });
    }
}

module.exports = exports = loadControllers;
