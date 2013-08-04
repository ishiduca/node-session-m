var path  = require('path');
var QUnit = require(path.join( __dirname, './qunit/driver')).QUnit;
var is    = QUnit.strictEqual;


QUnit.module('setup', {
    setup: function () {
	    var tmpDir = path.join( __dirname, 'tmp' );
        this.Store = require(path.join( __dirname, 'lib/file' ))(tmpDir);
    }
  , teardown: function () {
    }
});
test('setup success', function () {
    var store = new this.Store;

    ok(store);
    ok(store.trait);
    is(typeof store.set, 'function');
    is(typeof store.get, 'function')
    is(typeof store.remove, 'function');
});
test('get(NOT_EXISTS_SESSION_ID)', function () {
	stop();
	var store = new this.Store;

	store.get('NOT_EXISTS_SESSION_ID', function (err, val) {
		ok(! err);
		ok(! val);
		start();
	});
});
test('get("only.read")', function () {
	stop();
	var store = new this.Store;

	store.get("only.read", function (err, val) {
        is(val, 'session value');
		start();
	});
});
test('set -> get -> remove', function () {
    stop();

	var store = new this.Store;

    store.set('test1', 'TEST1', function () {
        store.get('test1', function (err, val) {
            is(val, 'TEST1');

            store.remove('test1', function (err) {
                store.get('test1', function (err, val) {
                    ok(! err);
                    ok(! val);
                    start();
                });
            });
        });
    });
});
