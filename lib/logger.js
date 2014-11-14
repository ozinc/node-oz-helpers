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
    version: version,
    streams: [ { stream: process.stdout, level: 'trace' } ],
    serializers: bunyan.stdSerializers
  });
}

function proxy(functionName) {
  return function () {
    // Are we running unit tests? Do not log.
    if (process.env.NODE_ENV === 'test') {
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
module.exports.fatal = proxy('fatal');

// For debugging purposes:
module.exports.reset = reset;
