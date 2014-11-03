'use strict';

var StatsD = require('node-statsd').StatsD;
var urlutil = require('url');
var _ = require('lodash');

var initialized = false;
var debugMode = false;
var logFunction;
var statsd;

function initialize(obj) {
  // Debug mode?
  if (obj.debug) {
    if (obj.logger) {
      logFunction = obj.logger.debug;
    } else {
      logFunction = console.log;
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
      var args = [];
      _.forEach(arguments, function (value) {
        if (_.isArray(value)) {
          var o = [];
          _.forEach(value, function (element) {
            o.push("'" + element + "'");
          });
          args.push('[' + o.join(', ') + ']');
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

module.exports.timing = proxy('timing');
module.exports.increment = proxy('increment');
module.exports.decrement = proxy('decrement');
module.exports.gauge = proxy('gauge');
module.exports.histogram = proxy('histogram');
module.exports.unique = proxy('unique');
module.exports.set = proxy('set');
module.exports.close = proxy('close');
