'use strict';

var bunyan = require('bunyan');

module.exports = bunyan.createLogger({
  name: 'playlist_z',
  streams: [
    {
      stream: process.stdout, level: 'trace'
    }
  ],
  serializers: bunyan.stdSerializers
});
