module.exports = function (dir) {
    if (typeof dir !== 'string') throw Error('"dir" must be directory path');

    var path = require('path');
    var fs   = require('fs');

    var tmp = {_store: dir};

    tmp.set = function (key, val, cb, timeout) {
        var that = this;

        fs.writeFile(path.join(this._store, key), val, 'utf8', cb);
        if (typeof timeout === 'number' && timeout > 0) {
            setTimeout(function () {
                that.remove(key, function (err) {
                    if (err) return console.error(err);
                    console.log('Store.trait.remove - "%s"', key);
                });
            }, timeout);
        }
    };

    tmp.get = function (key, cb) {
        var file = path.join(this._store, key);
        fs.exists(file, function (exists) {
            exists ? fs.readFile(file, 'utf8', cb)
                   : cb(null, null)
            ;
        });
    };

    tmp.remove = function (key, cb) {
        fs.unlink(path.join(this._store, key), cb);
    };

    var Store = require(path.join( __dirname, '../../lib/store'));
    Store.use(tmp);

    ['set', 'get', 'remove' ].forEach(function (method) {
        Store.extend(method, function () {
            this.trait[method].apply(this.trait, arguments);
        });
    });

    return Store;
};
