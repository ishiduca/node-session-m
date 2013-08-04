var path   = require('path');
var QUnit  = require(path.join( __dirname, './qunit/driver')).QUnit;
var is     = QUnit.strictEqual;

var Cookie = require(path.join( __dirname, '../lib/cookie')).Cookie;

QUnit.module('cookie = new Cookie(http.ServerRequest, http.ServerResponse)', {
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
    }
});

test('cookieObject = cookie.parse(httpServerRequest)', function () {
    var req = this.req, res = this.res;
    var encodedSessionID = encodeURIComponent('せっくす');
    var encodedKEY       = encodeURIComponent('q=a&b');
    req.headers = {cookie: 'A=a; SessionID=' + encodedSessionID + '; KEY=' + encodedKEY};

    var cookie = new Cookie(req, res);

    ok(cookie);
    is(cookie.get('A'), 'a');
    is(cookie.get('SessionID'), 'せっくす');
    is(cookie.get('KEY'), 'q=a&b');
});
test('setCookieString = cookie.stringify(key, val, option) - 1: option.HttpOnly が null の時', function () {
    var cookie = new Cookie(this.req, this.res);
    is( cookie.stringify('key1', 'val1', {HttpOnly: null, path: '/hoge'})
      , 'key1=val1; HttpOnly; path=/hoge' ||
        'key1=val1; path=/hoge; HttpOnly'
    );
});
test('setCookieString = cookie.stringify(key, val, option) - 2: option.expires の値は エンコーディングされていない', function () {
    var cookie = new Cookie(this.req, this.res);
    var now = (new Date()).toUTCString();
    is( cookie.stringify('key1', 'val1', {HttpOnly: null, expires: now})
      , 'key1=val1; HttpOnly; expires=' + now ||
        'key1=val1; expires=' + now + '; HttpOnly'
    );
});
test('setCookieString = cookie.stringify(key, val, option) - 3: key=きー, val=<a href="#">top</a> の時、key と val は encodeURIComponent された値', function () {
    var cookie = new Cookie(this.req, this.res);
    var key = encodeURIComponent('きー');
    var val = encodeURIComponent('<a href="#">top</a>');

    is( cookie.stringify('きー', '<a href="#">top</a>', {HttpOnly: null})
      , key + "=" + val + "; HttpOnly"
    );
});
test('res.writeHead(200);', function () {
    var cookie = new Cookie(this.req, this.res);
    cookie.set('key1', 'val1', {path: '/private'});
    cookie.remove('key2');

    this.res.writeHead(200);

    var setCookie = this.result['Set-Cookie'];

    ok(setCookie);
    is(setCookie.length, 2);
    deepEqual(setCookie[0], 'key1=val1; path=/private');
    deepEqual(setCookie[1]
      , 'key2=1; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT' ||
        'key2=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' );

});
