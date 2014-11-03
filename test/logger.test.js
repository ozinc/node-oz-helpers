'use strict';

var should = require('should');
var sinon = require('sinon');
var statsd = require('../lib/statsd');

var log = require('../lib/logger');

describe('logger', function () {
  beforeEach(function () {
    log.reset();
  })
  it('should initialize correctly', function () {
    log.initialize('playlist_z', '0.1.0');

    log.trace('never gonna give you up,');
    log.debug({ smiley: ':D' }, 'never gonna let you down,');
    log.info('never gonna run around and desert you.');
    log.warn({ no: 42 }, 'never gonna make you cry,');
    log.error({ err: new Error('err') }, 'never gonna say goodbye,');
    log.fatal({ err: new Error('err') }, 'never gonna tell a lie and hurt you.');
  });
  it('should not initialize without name/version', function () {
    (function () {
      log.trace('throw me!');
    }).should.throw;
  });
})
