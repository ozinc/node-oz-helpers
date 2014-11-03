
var StatsD = require('node-statsd').StatsD;
var urlutil = require('url');
// var log = require('./logger');

var initialized = false;
var debugMode = false;
var statsd;

function initialize(obj) {
  // Debug mode?
  if (obj.debug) {
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
      console.log(arguments);
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
