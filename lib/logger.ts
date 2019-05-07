import appRoot from 'app-root-path';
import bunyan, { LogLevel } from 'bunyan';
import { NextFunction, Request, Response } from 'express';
import onFinished from 'on-finished';

const that = this;
let loggingDisabled = false;
let instance : any;

function getInstance(options : any) {

  // Automatically read in the name/version from the package.json OF THE ROOT app and put it into
  // the user defined options.
  const pkgInfo = require(appRoot + '/package.json');

  // Currently we only support one option: To disable logging altogether.
  if (options && options.disabled) {
    loggingDisabled = true;
  }

  // Create the bunyan instance, defaults to the 'debug' log-level.
  instance = bunyan.createLogger({
    name: pkgInfo.name + ' @ ' + pkgInfo.version,
    streams: [ { stream: process.stdout, level: (process.env.LOGLEVEL || "debug") as LogLevel } ],
    serializers: bunyan.stdSerializers
  });

  return that;
}

function proxy(functionName : string, ...args : any[]) {
  return function () {
    // Are we running in a test environment? Do not log.
    if (process.env.LOG === 'false') {
      return;
    }

    // Has logging been disabled? Do not log.
    if (loggingDisabled) {
      return;
    }

     // Has initialization taken place?
     if (instance === undefined) {
      throw new Error('You need to initialize the logger first with a name and version.');
    }

    const func = instance[functionName];
    func.apply(instance, args);
  };
}

interface RequestTimed extends Request {
  _startAt: [number, number];
}

function requestLogger(options : any) {
  options = options || {};
  return function requestLogger(req : RequestTimed, res : Response, next : NextFunction) {

    // Attach a _startAt to the req handler to keep track of when the request arrived.
    req._startAt = process.hrtime();

    // Available upon request:
    const url = req.originalUrl || req.url;
    const method = req.method;
    const ip = getReqIp(req);
    const userAgent = req.headers['user-agent'];
    const requestId = req.headers['x-request-id'];

    // Log upon request?
    if (options.immediate) {
      const onRequest = {
        method: method,
        url: url,
        ip: ip,
        userAgent: userAgent,
        requestId: requestId
      };
      proxy('info', onRequest, 'in');
    }

    onFinished(res, function (err : Error | null, res: Response) {
      const statusCode = res.header ? res.statusCode : undefined;
      const ms = getResponseTime(req, res);
      const bytes = res.getHeader('content-length');

      // I know this is more and less copy paste of the above stuff but we want the keys in THIS
      // order.
      const onResponse = {
        method: method,
        url: url,
        status: statusCode,
        ms: ms,
        bytes: bytes,
        ip: ip,
        userAgent: userAgent,
        requestId: requestId
      };

      proxy('info', onResponse, 'out');
    });

    next();
  }
}

function getReqIp(req : Request) {
  return req.ip ||
  (req.connection && req.connection.remoteAddress) ||
  undefined;
}

function getResponseTime(req : RequestTimed, res : Response) {
  if (!res.header || !req._startAt) return undefined;
  const diff = process.hrtime(req._startAt);
  const ms = diff[0] * 1e3 + diff[1] * 1e-6;
  return Number(ms.toFixed(0));
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

export default {
  getInstance: getInstance,
  requestLogger: requestLogger,
  trace: proxy('trace'),
  debug: proxy('debug'),
  info: proxy('info'),
  warn: proxy('warn'),
  error: proxy('error'),
  fatal: proxy('fatal')
};

// For testing purposes:
module.exports.reset = reset;
