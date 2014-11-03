'use strict';

var bunyan = require('bunyan');

var instance;

function initialize(name, version) {
  if (name === undefined || version === undefined) {
    throw new Error('You need to provide a name and version.');
  }
  if (instance !== undefined) {
    throw new Error('No need to initialize the helper twice.');
  }
  instance = bunyan.createLogger({
    name: name,
    streams: [ { stream: process.stdout, level: 'trace' } ],
    serializers: bunyan.stdSerializers
  });
}

function proxy(functionName) {
  return function () {
    // Has initialization took place?
    if (instance === undefined) {
      throw new Error('You need to initialize the logger first with a name and version.');
    }
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    var func = instance[functionName];
    func.apply(instance, arguments);
  };
}

// For debugging purposes.
function reset() {
  instance = undefined;
}

/**
 * Exports.
 */
module.exports.initialize = initialize;
module.exports.trace = proxy('trace');
module.exports.debug = proxy('debug');
module.exports.info = proxy('info');
module.exports.warn = proxy('warn');
module.exports.error = proxy('error');

// For debugging purposes:
module.exports.reset = reset;
