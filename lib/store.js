function Store (trait) {
    this.trait = trait || Store.trait;
}

module.exports = Store;
module.exports.Store = Store;

Store.extend = function (method, f) {
    Store.prototype[method] = function () {
        return f.apply(this, arguments);
    };
};

Store.use = function (trait) {
    Store.trait = trait;
};
//
Store.cache = {
    _store: {}
  , set: function (key, val, f, timeout) {
        this._store[key] = val;
        if (typeof timeout === 'number' && timeout > 0) {
            this.intervalID = setTimeout(function () {
                this.remove(key, function () {
                    console.log('Store.cache.removed: "%s"', key);
                });
            }.bind(this), timeout);
        }
        f(null);
    }
  , get: function (key, f) {
        f(null, this._store[key]);
    }
  , remove: function (key, f) {
        delete this._store[key];
        f(null);
    }
};
