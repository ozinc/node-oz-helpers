var statsd = require('./lib/statsd').getInstance();
var log = require('./lib/logger').getInstance();
var express = require('express');
var RNG = require('rng');

var app = express();
var rng = new RNG('WhatAWhat');
var requestLogger = require('morgan');
app.use(log.requestLogger());

app.get('/', statsd.middleware('user_z.requests'), function (req, res) {
  setTimeout(function () {
    req.checkpoint('getUser');
    setTimeout(function () {
      req.checkpoint('getChannels');
      res.status(200).end('hay!');
    }, (170 + (rng.normal() * 90)));
  }, (600 + (rng.normal() * 163)));
});
app.listen(9000);
