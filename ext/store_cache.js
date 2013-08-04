var path  = require('path');
var QUnit = require(path.join( __dirname, './qunit/driver')).QUnit;
var is    = QUnit.strictEqual;

var Store = require(path.join( __dirname, '../lib/store'));
var mem   = new (require('memcache').Client)(11211, 'localhost');

QUnit.module('setup', {
    setup: function () {
        mem.connect();

        var store = this.store = new Store(mem);

        Store.extend('set', function (key, val, cb) {
            this.trait.set(key, val, cb);
        });

        Store.extend('get', function (key, cb) {
            this.trait.get(key, cb)
        });

        Store.extend('remove', function (key, cb) {
            this.trait.delete(key, cb);
        });
    }
  , teardown: function () {
        mem.close();
    }
});
test('', function () {
    var store = this.store;
    ok(store);
    ok(store.trait);
    ok(store.set);
    ok(store.get)
    ok(store.remove);

    stop();

    var store = this.store;
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
