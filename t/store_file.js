var path   = require('path');
var stream = require('stream');
var fs     = require('fs');
var QUnit  = require(path.join( __dirname, './qunit/driver')).QUnit;
var is     = QUnit.strictEqual;

QUnit.module('setup', {
    setup: function () {
        var dir = path.join( __dirname, 'tmp' );
        this.Session = require(path.join( __dirname, '../index')).FileSession(dir);

        var req = this.req = new stream.Stream;
        var res = this.res = new stream.Stream;

        req.readable = true;
        res.writable = true;

        req.url = 'http://example.com';
        req.headers = {};

        res.haeders = {};
        res.body    = '';
        res.setHeader = function (key, val) {
            this.headers[key] = val;
        };
        res.writeHead = function (statusCode, headers) {
            if (this.ended) return;
            var _merge = function (_headers, key) {
                _headers[key] = headers[key]; return _headers;
            };
            this.headers = Objet.keys(headers || {}).reduce(_merge, this.headers);
        };
        res._write = function (chunk) {
            if (this.ended) return;
            if (! this.writable) return;
            if (chunk) this.body += String(chunk);
            return this;
        };
        res.write = function (chunk) {
            return this._write(chunk);
        };
        res.end = function (chunk) {
            this._write(chunk);
            this.ended   = true;
            this.writable = false;
        };
    }
  , teardown: function () {
    }
});
test('存在しないセッションを獲得しようとするとエラーを返す', function () {
    stop();
    var session = new this.Session(this.req, this.res);

    session.get(function (err, val) {
        ok(! err);
        ok(! val);
        start();
    });
});
test('session.set(val, cb)', function () {
    stop();
    var session = new this.Session(this.req, this.res);

    session.set('this_is_the_man', function (err) {
        var file = path.join(__dirname, 'tmp', session.id);

        session.get(function (err, val) {
            is(val, 'this_is_the_man');

            fs.exists(file, function (exist) {
                ok(exist, 'exists "' + file + '"');

                session.remove(function (err) {

                    fs.exists(file, function (exist) {
                        ok(! exist, 'not exists "' + file + '"');

                        start();
                    });
                });
            });
        });
    });
});
test('session.set(val, cb, timeout)', function () {
    stop();
    var session = new this.Session(this.req, this.res);

    session.set('this_is_val', function (err) {
        var file = path.join(__dirname, 'tmp', session.id);
        fs.exists(file, function (exist) {
            ok(exist, 'before timeout: exists "' + file + '"');

            setTimeout(function () {
                fs.exists(file, function (exist) {
                    ok(! exist, 'after timeout: not exists "' + file + '"');
                    start();
                });
            }, 15);

            session.get(function (err, val) {
                is(val, 'this_is_val', 'val = "this_is_val"');
            });
        });
    }, 10);
});

