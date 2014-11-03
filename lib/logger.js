'use strict';

var bunyan = require('bunyan');

/**
 * Exports.
 */
module.exports = bunyan.createLogger({
  name: 'playlist_z',
  streams: [
    {
      stream: process.stdout, level: 'trace'
    }
  ],
  serializers: bunyan.stdSerializers
});
