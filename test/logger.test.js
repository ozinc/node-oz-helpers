'use strict';

var should = require('should');
var sinon = require('sinon');
var statsd = require('../lib/statsd');

var log = require('../lib/logger');

describe('logger', function () {
  // Not much of a test, really.
  it('should initialize correctly', function () {
    log.trace('trace me?');
    log.debug({ smiley: ':D' }, 'bugs, bugs, bugs.');
    log.info('what an info!');
    log.warn({ no: 42 }, 'test me!');
    log.error({ err: new Error('hehe') }, 'should be fine.');
  })
})
