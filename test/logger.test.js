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
    log.debug({ smiley: ':D' }, 'never gonna let you down');
    log.info('never gonna run around,');
    log.warn({ no: 42 }, 'and');
    log.error({ err: new Error('hehe') }, 'desert you.');
  });
  it('should not initialize without name/version', function () {
    (function () {
      log.trace('throw me!');
    }).should.throw;
  });
})
