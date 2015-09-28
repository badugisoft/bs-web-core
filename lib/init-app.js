module.exports = exports = function(app) {
    var app = require('express')();

    app.set('view engine', 'hbs');
    app.use(require('body-parser').json());
    app.use(require('body-parser').urlencoded({ extended: false }));
    app.use(require('cookie-parser')());

    return app;
};
