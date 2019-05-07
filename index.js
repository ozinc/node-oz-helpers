'use strict';

module.exports = {
  getStatsD: require('./build/statsd').getInstance,
  getLogger: require('./build/logger').getInstance,
  getConf: require('./build/conf').getInstance
};
