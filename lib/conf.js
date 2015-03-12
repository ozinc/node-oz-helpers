'use strict';

var nconf = require('nconf');
var _ = require('lodash');
var appRoot = require('app-root-path');

// Reads in the environment-defined configuration.
nconf.env();

var userDefinedOptions = {};
var that = this;
var initialized = false;

function getInstance() {
  if (!initialized) {
    // Automatically read in the name/version from the package.json OF THE ROOT app and put it into
    // the user defined options.
    var pkgInfo = require(appRoot + '/package.json');
    userDefinedOptions.name = pkgInfo.name;
    userDefinedOptions.version = pkgInfo.version;
    initialized = true;
  }
  return that;
}

function required(args) {
  if (!_.isArray(args) && !_.isString(args)) {
    throw new Error('The required field should contain an array or a string.');
  }
  if (_.isString(args)) {
    if (!has(args)) {
      throw new Error('Missing configuration key: ' + args);
    }
  }

  // args must be an array.
  args.forEach(function (key) {
    if (!has(key)) {
      throw new Error('Missing configuration key: ' + key);
    }
  });
}

function get(key, defaultValue) {
  // (1) Check the user-defined options.
  if (_.has(userDefinedOptions, key)) {
    return userDefinedOptions[key];
  }

  // (2) Check the environment-defined options.
  var val = nconf.get(key);

  if (val === undefined && defaultValue !== undefined) {
    return defaultValue;
  }
  return val;
}

function set(key, value) {
  userDefinedOptions[key] = value;
}

function has(key) {
  var value = get(key);
  return value !== undefined;
}

// For testing purposes.
function reset() {
  userDefinedOptions = {};
  nconf.env();
}

/**
 * Exports.
 */
module.exports.getInstance = getInstance;
module.exports.required = required;
module.exports.get = get;
module.exports.set = set;
module.exports.has = has;

module.exports.reset = reset;
