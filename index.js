var Session = module.exports.Session = require('./lib/session');
var Store   = module.exports.Store   = require('./lib/store');
module.exports.Cookie = require('./lib/cookie');

module.exports.MemSession = function () {
    Store.use(Store.cache);

    ['set', 'get', 'remove'].forEach(function (method) {
        Store.extend(method, function () {
            return this.trait[method].apply(this.trait, arguments);
        });
    });

    Session.use(new Store);

    return Session;
};

module.exports.FileSession = function (dir) {
    if (typeof dir !== 'string')
        throw new Error('"dir" must be directory path');

    var path = require('path');
    var fs   = require('fs');

    var tmp  = {
        _store: dir
      , set: _set
      , get: _get
      , remove: _remove
    };

    function _set (key, val, cb, timeout) {
        var that = this;

        fs.writeFile(path.join(this._store, key), val, 'utf8', cb);

        if (typeof timeout === 'number' && timeout > 0) {
            setTimeout(function () {
                that.remove(key, function (err) {
                    err ? console.error(err)
                        : console.log('Store.trait.remove - "%s"', key)
                    ;
                });
            }, timeout);
        }
    }

    function _get (key, cb) {
        var file = path.join(this._store, key);
        fs.exists(file, function (exists) {
            exists ? fs.readFile(file, 'utf8', cb)
                   : cb(null, null)
            ;
        });
    }

    function _remove (key, cb) {
        var file = path.join(this._store, key);
        fs.exists(file, function (exists) {
            exists ? fs.unlink(file, cb) : cb(null);
        });
    }


    Store.use(tmp);
    ['set', 'get', 'remove'].forEach(function (method) {
        Store.extend(method, function () {
            this.trait[method].apply(this.trait, arguments);
        });
    });

    Session.use(new Store);
    return Session;
};
