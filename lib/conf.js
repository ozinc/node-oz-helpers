'use strict';

var nconf = require('nconf');
var _ = require('lodash');

// Reads in the environment-defined configuration.
nconf.env();

var userDefinedOptions = {};

function initialize(options) {
  if (options) {
    if (!_.isObject(options)) {
      throw new Error('options needs to be an object.');
    }
    userDefinedOptions = _.extend(userDefinedOptions, options);
  }
}

function required(args) {
  if (!_.isArray(args) && !_.isString(args)) {
    throw new Error('The required field should contain an array or a string.');
  }
  if (_.isString(args)) {
    if (!has(args)) {
      throw new Error('Missing configuration key: ' + key);
    }
  }

  // args must be an array.
  args.required.forEach(function (key) {
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

// For debugging purposes.
function reset() {
  userDefinedOptions = {};
  nconf.env();
}

/**
 * Exports.
 */
module.exports.initialize = initialize;
module.exports.get = get;
module.exports.set = set;
module.exports.has = has;

// For debugging purposes.
module.exports.reset = reset;
