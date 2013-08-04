var qs = require('querystring');

function Cookie (req, res) {
    this.cookie    = this.parse(req);
    this.setCookie = {};

    var that = this;
    var writeHead = res.writeHead;
    res.writeHead = function () {
        that.finalize(this);
        writeHead.apply(this, arguments);
    };
}

module.exports = Cookie;
Cookie.Cookie = Cookie;

Cookie.prototype.parse = function (req) {
    return qs.parse((req.headers.cookie || "").replace(/;\s+/g, '&'));
};
Cookie.prototype.stringify = function (key, val, option) {
    var pair = {}; pair[key] = val;
    var options = Object.keys(option || {}).map(function (key) {
        return (option[key] === null || typeof option[key] === 'undefined')
            ? key : [ key, option[key] ].join('=');
    });
    return [ qs.stringify(pair) ].concat(options).join('; ');
};
Cookie.prototype.get = function (key) {
    return this.cookie[key];
};
Cookie.prototype.set = function (key, value, option) {
    this.setCookie[key] = [ value, option ];
    return this;
};
Cookie.prototype.remove = function (key, option) {
    if (! option) option = {};
    if (! option.path) option.path = '/';
    option.expires = (new Date(0)).toUTCString();
    this.set(key, "1", option);
    return this;
};
Cookie.prototype.finalize = function (res) {
    var that = this;
    var keys = Object.keys(this.setCookie);
    var _map = function (key) {
        return that.stringify(key, that.setCookie[key][0], that.setCookie[key][1]);
    };
    keys.length && res.setHeader('Set-Cookie', keys.map(_map));
    return this;
};
