var path  = require('path');
var QUnit = require(path.join( __dirname, './qunit/driver')).QUnit;
var is    = QUnit.strictEqual;

var Store = require(path.join( __dirname, '../lib/store'));

test('', function () {
    ok(Store);
    ok(Store.Store);

    var result;
    var mem = { set: function (v) { result = v;} };
    var store = new Store(mem);

    ok(store);
    is(typeof store.trait.set, 'function');

    store.trait.set('TRAIT');

    is(result, 'TRAIT');

    is( typeof Store.extend, 'function');

    Store.extend('set', function (v) {
        this.trait.set([ v, v ].join(' '));
    });

    store.set('TRAIT');

    is( typeof store.set, 'function');
    is(result, 'TRAIT TRAIT');
});

QUnit.module('custom 1', {
    setup: function () {
        var mem = {
            _store: {}
          , set: function (key, val) {
                this._store[key] = val;
                return this;
            }
          , get: function (key) {
                return this._store[key];
            }
          , remove: function (key) {
                delete this._store[key];
                return this;
           }
        };

        var store = this.store = new Store(mem);

        Store.extend('set', function (key, val, cb) {
            this.trait.set(key, val);
            cb(null);
        });

        Store.extend('get', function (key, cb) {
            var val = this.trait.get(key);
            cb(null, val);
        });

        Store.extend('remove', function (key, cb) {
            this.trait.remove(key);
            cb(null);
        });
    }
});
test('', function () {
    stop();

    var store = this.store;

    ok(store);
    ok(store.trait);
    ok(store.set);
    ok(store.get)
    ok(store.remove);

    store.set('test1', 'TEST1', function () {
        store.get('test1', function (err, val) {
            is(val, 'TEST1');

            store.remove('test1', function (err) {
                store.get('test1', function (err, val) {
                    ok(! val);
                    start();
                });
            });
        });
    });
});

QUnit.module('custom 2', {
    setup: function () {
        var store = this.store = new Store(Store.cache);

        ('set get remove').split(' ').forEach(function (method) {
            Store.extend(method, function () {
                this.trait[method].apply(this.trait, arguments);
            });
        });

    }
});
test('', function () {
    stop();

    var store = this.store;

    ok(store);
    ok(store.trait);
    ok(store.set);
    ok(store.get)
    ok(store.remove);

    store.set('test1', 'TEST1', function () {
        store.get('test1', function (err, val) {
            is(val, 'TEST1');

			setTimeout(function () {
                store.get('test1', function (err, val) {
                    ok(! val);
                    start();
                });
            }, 200);
        });
    }, 100);
});
