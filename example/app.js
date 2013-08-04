#!/usr/bin/env node
"use strict";

var path    = require('path');
var http    = require('http');
var Session = require(path.join( __dirname, '../index')).FileSession(
    path.join( __dirname, '_tmp')
);

function onError (err, res) {
    res.writeHead(500);
    res.end([err.name, err.message].join(': '));
    console.error(err);
}

function favicon (res) {
    res.writeHead(200, {"content-type": "image/x-icon"});
    res.end();
}

function expire (session, res) {
    session.expire(function (err) {
        if (err) return onError(err, res);

        res.writeHead(200);
        res.end('session("' + session.id + '") removed');
        console.log('session("%s") removed', session.id);
    });
}

function addCount (count, session, res) {
    session.set(count, function (err) {
        if (err) return onError(res, err);

        res.writeHead(200);
        res.end(String(count));
        console.log('session("%s") - count %d', session.id, count);
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
            addCount(++count, session, res);
        }
    });
};

http.createServer(app).listen(3000, function () {
    console.log('server start to listen on port "3000"');
});
