'use strict';

var nconf = require('nconf');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

// Reads in the environment-defined configuration.
nconf.env();

var userDefinedOptions = {};

// No need to bring in StringJS as a dependency for this.
function trimString(str) {
  var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  return str.replace(rtrim, '');
}

function loadEnvFile(file) {
  var envFileLines = fs.readFileSync(file, 'utf8').split('\n');
  _.forEach(envFileLines, function (line) {
    if (line.indexOf('=') > 0) {
      var tokens = trimString(line).split('=');
      if (tokens.length !== 2) {
        // Do nothing.
        return;
      }
      // Should this maybe go to the process.env instead? That just does not sound good to me.
      userDefinedOptions[tokens[0]] = tokens[1];
    }
  });
}

function initialize(options) {

  // If we are in development (NODE_ENV=development or NODE_ENV=undefined), we want to check if
  // there is a .env file in the root our project.

  // Okay I know this is pretty stupid but there is actually no bulletproof way of finding what
  // is the root of the project that we are currently running.
  // TODO: But this might be done better by looking for package.json for example.
  if (process.env.NODE_ENV === 'development' && require.main.filename !== undefined) {

    // This could create problems later on.
    // http://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application
    var rootDir = require.main.filename.split('/');

    // Is a dotenv in the directory of our server.js?
    var currentDirEnv = path.join(rootDir.slice(0, -1).join('/'), '.env');
    if (fs.existsSync(currentDirEnv)) {
      loadEnvFile(currentDirEnv);
    }

    // Is it one-level above the server.js directory (this is how it is supposed to be).
    var oneLevelAboveEnv = path.join(rootDir.slice(0, -2).join('/'), '.env');
    if (fs.existsSync(oneLevelAboveEnv)) {
      loadEnvFile(oneLevelAboveEnv);
    }
  }

  // Parse any user-provided options (if any).

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

// For debugging purposes.
function reset() {
  userDefinedOptions = {};
  nconf.env();
}

/**
 * Exports.
 */
module.exports.initialize = initialize;
module.exports.required = required;
module.exports.get = get;
module.exports.set = set;
module.exports.has = has;

// For debugging purposes.
module.exports.reset = reset;
