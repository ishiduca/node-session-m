var Cookie = require('./cookie');
var Store  = require('./store');
var crypto = require('crypto');
var events = require('events');
var util   = require('util');
var uuid   = require('node-uuid');

function Session (req, res, option) {
    events.EventEmitter.call(this);

    option || (option = {});

    this.checkStore(this.store = (option.store || Session.Store));

    this.cookie  = new Cookie(req, res);
    this.keyname = option.keyname || 'mSessionID';
    this.secret  = option.secret  || '516f0301c9cf797b51538af584af055b';
    this.maxAge  = this.getMaxAge(option);
    this.id      = this.cookie.get(this.keyname); // sessionID

    if (! this.id) {
        this.id = this.genID();
        this.cookie.set(this.keyname, this.id, this.cookieOption(option.cookie, this.maxAge));
    }
}
Session.use = function (store) {
    Session.Store = store;
};

util.inherits(Session, events.EventEmitter);

Session.prototype.get = function (f) {
    this.store.get(this.id, f);
};
Session.prototype.set = function (session, f, timeout) {
    this.store.set(this.id, session, f, timeout);
};
Session.prototype.remove = function (f) {
    this.store.remove(this.id, f);
};
Session.prototype.expire = function (option, f) {
    var that = this;

    if (typeof f !== 'function') { 
        if (typeof option === 'function') {
            f = option;
            option = {};
        } else {
            throw TypeError('Session.prototype.expire, 2nd argument msub be "function"');
        }
    }

    this.remove(function (err) {
        if (err) return f(err);
        that.cookie.remove(that.keyname, option);
        f(null);
    });
};

Session.prototype.genID = function () {
    var data = uuid.v4().split('-').join('');
    return crypto.createHmac('md5', this.secret).update(data).digest('hex');
};

Session.prototype.getMaxAge = function (option) {
    if (typeof option.maxAge === 'number' && option.maxAge > 0)
        return option.maxAge;

    var now = Date.now();
    if (typeof option.expires === 'number' && option.expires > now)
        return option.expires - now;

    return null;
};
Session.prototype.cookieOption = function (option, maxAge) {
    option || (option = {});
    option.path || (option.path = '/');

    (typeof maxAge === 'number' && maxAge > 0) &&
        (option.expires = (new Date(Date.now() + maxAge)).toUTCString());

    return option;
};
Session.prototype.checkStore = function (store) {
    if (typeof store !== 'object' || store === null)
        throw {
            name: 'Session.prototype.checkStoreError'
          , message: '"store" not found'
        };

    [ 'set', 'get', 'remove' ].forEach(function (method) {
        if (typeof store[method] !== 'function')
            throw {
                name: 'Session.prototype.checkStoreError'
              , message: '"store.' + method + '" must be "function"'
            };
    });
};

module.exports = Session;
module.exports.Session = Session;


