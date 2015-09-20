var path = require('path');
var extend = require('extend');
var moment = require('moment');

require(path.join(__dirname, 'lib/polyfill'));

module.exports = exports = {};

exports.startInit = function() {
    this.app = require(path.join(__dirname, 'lib/init-app'))();
    this.hbs = require('hbs');
    this.server = require('http').createServer(this.app);
};

exports.loadConfig = function(dir, envPrefix) {
    global.config = require(path.join(__dirname, 'lib/load-config'))(dir, envPrefix);
};

exports.loadControllers = function(dir) {
    require(path.join(__dirname, 'lib/load-controllers'))(this.app, this.server, dir);

    this.app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
};

exports.loadPartials = function(dir, autoReload) {
    require(path.join(__dirname, 'lib/load-partials'))(dir, autoReload);
};

exports.loadModels = function(connStr, dir) {
    require(path.join(__dirname, 'lib/load-models'))(this.app, connStr, dir);
};

exports.setFavicon = function(file) {
    this.app.use(require('serve-favicon')(path.resolve(file)));
};

exports.setViews = function(dir) {
    this.app.set('views', path.resolve(dir));
};

exports.setStatic = function(dir) {
    this.app.use(require('express').static(path.resolve(dir)));
};

exports.setRedisSession = function(redisOptions, sessionOptions) {
    var session = require('express-session');
    var RedisStore = require('connect-redis')(session);

    redisOptions = extend(true, {
        host: 'localhost',
        port: 6379
    }, redisOptions || {});

    sessionOptions = extend(true, {
        secret: 'tinyweb @#$ secret',
        resave: false,
        saveUninitialized: true,
        store : new RedisStore(redisOptions)
    }, sessionOptions || {});

    this.app.use(session(sessionOptions));
    this.app.use(function(req, res, next){
        if (!req.session.startdAt) {
            req.session.startdAt = moment().format('YYYY-MM-DD HH:mm:ss')
        }
        next();
    })
};

exports.setI18n = function(options) {
    options.directory = path.resolve(options.directory || 'locale');

    var i18n = require("i18n");
    i18n.configure(options);

    this.app.use(i18n.init);
};

exports.setErrorPage = function(page, status) {
    this.app.use(function(err, req, res, next){
        if (!status || status === err.status) {
            res.render(page, err);
            return;
        }

        next();
    });
};

exports.endInit = function() {
    if (this.app.get('env') === 'development') {
        this.app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.json(err);
        });
    }
    this.app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send();
    });

    var hbs = this.hbs;
    var helpers = require(path.resolve(__dirname, 'lib/hbs-helpers'));
    Object.keys(helpers).forEach(function(name) {
        hbs.registerHelper(name, helpers[name]);
    });

    hbs.registerHelper('define', function(name, options) {
        var _options = options;
        hbs.registerHelper(name, function(options){
            return _options.fn(options.hash);
        });
        return '';
    });
};

exports.run = function(options) {
    options = options || {};
    var port = options.port || 3000;
    this.server.listen(port);

    this.server.on('error', function(){
        if (error.syscall !== 'listen') {
          throw error;
        }
        console.error(error);
    });

    this.server.on('listening', function(){
        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
        console.log('Listening on ' + bind);
    });
};
