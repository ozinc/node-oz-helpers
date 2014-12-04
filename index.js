'use strict';

module.exports = {
  getLogger: require('./lib/statsd').getStatsD,
  logger: require('./lib/logger').getLogger,
  conf: require('./lib/conf').getConf
};
