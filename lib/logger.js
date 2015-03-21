'use strict';

var bunyan = require('bunyan');
var appRoot = require('app-root-path');
var onFinished = require('on-finished');

var that = this;
var loggingDisabled = false;
var instance;

function getInstance(options) {

  // Automatically read in the name/version from the package.json OF THE ROOT app and put it into
  // the user defined options.
  var pkgInfo = require(appRoot + '/package.json');

  // Currently there is only one options: To disable logging altogether.
  if (options && options.disabled) {
    loggingDisabled = true;
  }

  // Create the bunyan instance, defaults to the 'debug' log-level.
  instance = bunyan.createLogger({
    name: pkgInfo.name + ' @ ' + pkgInfo.version,
    streams: [ { stream: process.stdout, level: process.env.LOGLEVEL || 'debug' } ],
    serializers: bunyan.stdSerializers
  });

  return that;
}

function proxy(functionName) {
  return function () {
    // Are we running in a test environment? Do not log.
    if (process.env.NODE_ENV === 'test' || process.env.LOG == 'false') {
      return;
    }

    // Has logging been disabled? Do not log.
    if (loggingDisabled) {
      return;
    }

    // Has initialization took place?
    if (instance === undefined) {
      throw new Error('You need to initialize the logger first with a name and version.');
    }

    var func = instance[functionName];
    func.apply(instance, arguments);
  };
}

function requestLogger(options) {
  options = options || {};
  return function requestLogger(req, res, next) {

    // Attach a _startAt to the req handler to keep track of when the request arrived.
    req._startAt = process.hrtime();

    // Available upon request:
    var url = req.originalUrl || req.url;
    var method = req.method;
    var ip = getReqIp(req);
    var userAgent = req.headers['user-agent'];
    var requestId = req.headers['x-request-id'];

    // Log upon request?
    if (options.immediate) {
      var onRequest = {
        method: method,
        url: url,
        ip: ip,
        userAgent: userAgent,
        requestId: requestId
      };
      proxy('info')(onRequest, 'in');
    }

    onFinished(res, function (err, res) {
      var statusCode = res._header ? res.statusCode : undefined;
      var ms = getResponseTime(req, res);
      var bytes = res.headers && res.headers['content-length'];

      // I know this is more and less copy paste of the above stuff but we want the keys in THIS
      // order.
      var onResponse = {
        method: method,
        url: url,
        status: statusCode,
        ms: ms,
        bytes: bytes,
        ip: ip,
        userAgent: userAgent,
        requestId: requestId
      };

      proxy('info')(onResponse, 'out');
    });

    next();
  }
}

function getReqIp(req) {
  return req.ip
  || req._remoteAddress
  || (req.connection && req.connection.remoteAddress)
  || undefined;
}

function getResponseTime(req, res) {
  if (!res._header || !req._startAt) return undefined;
  var diff = process.hrtime(req._startAt);
  var ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return ms.toFixed(0);
}

// For testing purposes.
function reset() {
  instance = undefined;
}

/**
 * Exports.
 */
module.exports.getInstance = getInstance;
module.exports.requestLogger = requestLogger;
module.exports.trace = proxy('trace');
module.exports.debug = proxy('debug');
module.exports.info = proxy('info');
module.exports.warn = proxy('warn');
module.exports.error = proxy('error');
module.exports.fatal = proxy('fatal');

// For testing purposes:
module.exports.reset = reset;
