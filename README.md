# node-session-m

a session manager based http-cookie.

## usage


count up app. store based memory

```js
var http = require('http');
var Session = require('Session').MemSession();

function favicon (res) {
    res.writeHead(200, {'content-type': 'image/x-icon'});
    res.end();
}

function onError (err, res) {
    res.writeHead(500);
    res.end(err.name + ': ' + err.message);
    console.error(err);
}

function expire (session, res) {
    session.expire(function (err) {
        if (err) return onError(err, res);

        res.writeHead(200);
        res.end('session(' + session.id + ') removed');
        console.log('session(%s) removed', session.id);
    });
}

function countup (count, session, res) {
    session.set(count, function (err) {
        if (err) return onError(err, res);

        res.writeHead(200);
        res.end('session(' + session.id + ') - ' + count);
        console.log('session(%s) - %d', session.id, count);
    });
}

var app = function (req, res) {
    if (req.url === '/favicon.ico') return favicon(res);

    var session = new Session(req, res);

    session.get(function (err, count) {
        if (err) return onError(err, res);

        count || (count = 0);

        if (req.url === '/remove') {
            expire(session, res);
        }

        else {
            countup(++count, session, res);
        }
    });
};

http.createServer(app).listen(3000);
```

### want to use file.

```js
var tmpDir  = __dirname + '/tmp';
var Session = require('Session').FileSession( tmpDir );
```

## use custom store.

middleware.js (ex use memcache)
```js
module.exports = function (args) {
    var mem = new (require('memcache').Client)(arg.port, arg.host);
    var mod = require('Session');
    mod.Store.use(mem);

    // require method - set, get, remove
    mod.Store.extend('set', function (key, val, cb, timeout) {
        this.trait.set(key, val, cb, timeout);
    });

    mod.Store.extend('get', function (key, cb) {
        this.trait.get(key, cb);
    });

    mod.Store.extend('remove', function (key, cb) {
        this.trait.delete(key, cb);
    });

 
     mod.Session.use(new mod.Store);

     mem.connection();

     return mod.Session;
 };
 ```

 app.js
 ```js
 var Session = require('./middleware')({port: 11211, host: 'localhost'});
 ...
 ```
