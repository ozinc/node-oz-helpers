'use strict';

var StatsD = require('node-statsd').StatsD;
var urlutil = require('url');
var _ = require('lodash');
var onHeaders = require('on-headers');

var initialized = false;
var debugMode = false;
var logFunction;
var statsd;
var debugPrefix;

function initialize(obj) {
  // Debug mode?
  if (obj.debug) {
    if (obj.logger) {
      logFunction = obj.logger.debug;
    } else {
      logFunction = console.log;
    }

    if (obj.prefix) {
      debugPrefix = obj.prefix;
    }
    debugMode = true;
  }

  // If a url is provided; parse it.
  if (obj.url) {
    if (obj.host || obj.port) {
      throw new Error('Declare only one of: [url, host/port].');
    }
    var parsed = urlutil.parse(obj.url);
    obj.host = parsed.hostname;
    obj.port = Number(parsed.port);
    delete obj.url;
  }

  // Initialize the statsd instance!
  statsd = new StatsD(obj);
  initialized = true;
}

function proxy(functionName) {
  return function () {
    // Has initialization took place?
    if (!initialized) {
      throw new Error('You need to initialize statsd first.');
    }

    if (debugMode) {

      // Associate a prefix with the first argument.
      if (debugPrefix !== undefined && arguments.length > 0) {
        if (debugPrefix.slice(-1) !== '.') {
          arguments['0'] = debugPrefix + '.' + arguments['0'];
        } else {
          arguments['0'] = debugPrefix + arguments['0'];
        }
      }
      var args = [];

      _.forEach(arguments, function (value) {
        if (_.isArray(value)) {
          var o = [];
          _.forEach(value, function (element) {
            o.push("'" + element + "'");
          });
          args.push('[' + o.join(', ') + ']');
        } else if (_.isString(value)) {
          args.push('\'' + value + '\'');
        } else {
          args.push(value);
        }
      });

      var s = 'statsd.' + functionName + '(' + args.join(', ') + ')';
      logFunction(s);
    } else {
      var func = statsd[functionName];
      func.apply(statsd, arguments);
    }
  };
}

/**
 * An connect middleware that sends metrics on the route timings to statsd.
 * @param key the statsd key to use.
 * @returns {measure} the middleware.
 */
function middleware(key) {

  // Make key default to 'requests'.
  if (key === undefined || !_.isString(key)) {
    key = 'requests';
  }

  var that = this;

  function toMillis(hrtime) {
    var ms = hrtime[0] * 1e3 + hrtime[1] * 1e-6;
    return ms.toFixed(0);
  }

  return function middleware(req, res, next) {
    var route = req.route.path.replace(/\:/g, '$');
    var method = req.method.toLowerCase();
    var extraTags = [];

    onHeaders(res, function () {
      var tags;
      for (var i = 1; i < req.measurements.length; i++) {
        tags = [
          'method:' + method,
          'route:' + route,
          'status:' + res.statusCode,
          'part:' + req.measurements[i].key
        ].concat(extraTags);
        that.histogram(key, Number(req.measurements[i].diff), tags);
      }

      var totalDiff = toMillis(process.hrtime(req.measurements[0].time))
      tags = [
        'method:' + method,
        'route:' + route,
        'status:' + res.statusCode
      ].concat(extraTags);
      that.histogram(key + '.total', Number(totalDiff), tags);
    });

    req.measurements = [ {
      key: 'initial',
      time: process.hrtime(),
      diff: 0
    } ];

    req.addTag = function (tag) {
      extraTags.push(tag);
    };

    req.checkpoint = function (key) {
      var last = this.measurements.slice(-1)[0];
      var diff = toMillis(process.hrtime(last.time));
      this.measurements.push({
        key: key,
        time: process.hrtime(),
        diff: diff
      });
    };

    next();
  };
}

// Mostly for debugging purposes.
function getInstanceInfo() {
  return {
    host: statsd.host,
    port: statsd.port
  };
}

// Mostly for debugging purposes.
function reset() {
  initialized = false;
  statsd = undefined;
  debugMode = false;
  logFunction = undefined;
}

/**
 * Exports.
 */
module.exports.initialize = initialize;
module.exports.getInstanceInfo = getInstanceInfo;
module.exports.reset = reset;

module.exports.middleware = middleware;

module.exports.timing = proxy('timing');
module.exports.increment = proxy('increment');
module.exports.decrement = proxy('decrement');
module.exports.gauge = proxy('gauge');
module.exports.histogram = proxy('histogram');
module.exports.unique = proxy('unique');
module.exports.set = proxy('set');
module.exports.close = proxy('close');
