var path   = require('path');
var QUnit  = require(path.join( __dirname, './qunit/driver')).QUnit;
var is     = QUnit.strictEqual;

var Session = require(path.join( __dirname, '../lib/session')).Session;
var Store   = require(path.join( __dirname, '../lib/store')).Store;

QUnit.module('session = new Session(http.ServerRequest, http.ServerResponse, option)', {
    setup: function () {
        var stream = require('stream');
        var req = this.req = new stream.Stream;
        var res = this.res = new stream.Stream;

        req.readable = true;
        res.writable = true;

        req.headers = {};

        res.headers = {};
        res.statusCode = 200;
        res.body = '';

        var that = this;
        res.setHeader = function (key, val) {
            this.headers[key] = val;
            return this;
        };
        res.writeHead = function (statusCode, headers) {
            if (this.ended) return console.error("[error]response ended");
            var _merge = function (_headers, key) {
                _headers[key] = headers[key]; return _headers;
            };
            this.headers = Object.keys(headers || {}).reduce(_merge, this.headers);

            that.result = this.headers;
        };
        res.write = function (chunk) {
            if (this.ended) return console.error("[error]response ended");
            if (! this.writable) return;
            if (chunk) this.body += String(chunk);
        };
        res.end = function (chunk) {
            this.write(chunk);
            this.ended = true;
            this.writable = false;
        };

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

	var session;
    ok(Session);
	ok(session = new Session(this.req, this.res, {store: this.store}));
	is(session.keyname, 'mSessionID');
	var sid = session.id;
	ok(session.id);

	session.get(function (err, ses) {
		if (err) {
			console.error(err);
			return start();
		}

		ok(! ses, 'not login');
		start();
	});
});
