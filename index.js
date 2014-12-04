'use strict';

module.exports = {
  getStatsD: require('./lib/statsd').getInstance,
  getLogger: require('./lib/logger').getInstance,
  getConf: require('./lib/conf').getInstance
};
