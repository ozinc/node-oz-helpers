'use strict';

var bunyan = require('bunyan');
var appRoot = require('app-root-path');

var loggingDisabled = false;
var instance;

function getInstance(options) {

  // Automagically read in the name/version from the package.json OF THE ROOT app and put it into
  // the user defined options.
  var pkgInfo = require(appRoot + '/package.json');

  // Currently there is only one options: To disable logging altogether.
  if (options && options.disabled) {
    loggingDisabled = true;
  }

  // Create the bunyan instance.
  instance = bunyan.createLogger({
    name: pkgInfo.name,
    version: pkgInfo.version,
    streams: [ { stream: process.stdout, level: 'trace' } ],
    serializers: bunyan.stdSerializers
  });
}

function proxy(functionName) {
  return function () {
    // Are we running unit tests? Do not log.
    /*
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    */

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

// For testing purposes.
function reset() {
  instance = undefined;
}

/**
 * Exports.
 */
module.exports.getInstance = getInstance;
module.exports.trace = proxy('trace');
module.exports.debug = proxy('debug');
module.exports.info = proxy('info');
module.exports.warn = proxy('warn');
module.exports.error = proxy('error');
module.exports.fatal = proxy('fatal');

// For testing purposes:
module.exports.reset = reset;
