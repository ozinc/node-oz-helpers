import appRoot from 'app-root-path';
import lodash from 'lodash';
import nconf from 'nconf';

// Reads in the environment-defined configuration.
nconf.env();

let userDefinedOptions : { [key: string]: string } = {};
const that = this;
let initialized = false;

function getInstance() {
  if (!initialized) {
    // Automatically read in the name/version from the package.json OF THE ROOT app and put it into
    // the user defined options.
    const pkgInfo = require(appRoot + '/package.json');
    userDefinedOptions.name = pkgInfo.name;
    userDefinedOptions.version = pkgInfo.version;
    initialized = true;
  }
  return that;
}

function required(args : string[] | string) {
  if (!lodash.isArray(args) && !lodash.isString(args)) {
    throw new Error('The required field should contain an array or a string.');
  }
  if (typeof args === "string" && lodash.isString(args)) {
    if (!has(args)) {
      throw new Error('Missing configuration key: ' + args);
    }
  }

  // args must be an array.
  if (args instanceof Array && lodash.isArray(args)) {
    args.forEach(function (key : string) {
      if (!has(key)) {
        throw new Error('Missing configuration key: ' + key);
      }
    });
  }
}

function get(key : string, defaultValue? : string) {
  // (1) Check the user-defined options.
  if (lodash.has(userDefinedOptions, key)) {
    return userDefinedOptions[key];
  }

  // (2) Check the environment-defined options.
  let val = nconf.get(key);

  if (val === undefined && defaultValue !== undefined) {
    return defaultValue;
  }
  return val;
}

function set(key : string, value : string) {
  userDefinedOptions[key] = value;
}

function has(key : string) {
  const value = get(key);
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

export default {
  getInstance: getInstance,
  required: required,
  get: get,
  set: set,
  has: has
};

module.exports.reset = reset;
