'use strict';

var should = require('should');
var sinon = require('sinon');
var statsd = require('../lib/statsd');

var log = require('../lib/logger');

// TODO: I'm not in the mood to hi-jack the output of the log commands so I just kind of use
//       my eyes to see if these tests are working or not at the moment. :S

describe('conf logger helper', function () {
  beforeEach(function () {
    log.reset();
  })
  it('should initialize correctly', function () {
    log.getInstance();

    log.trace('never gonna give you up,');
    log.debug({ smiley: ':D' }, 'never gonna let you down,');
    log.info('never gonna run around and desert you.');
    log.warn({ no: 42 }, 'never gonna make you cry,');
    log.error({ err: new Error('err') }, 'never gonna say goodbye,');
    log.fatal({ err: new Error('err') }, 'never gonna tell a lie and hurt you.');
  });
  it('should not log when logging has been disabled', function () {
    log.getInstance({ disabled: true });
    log.debug('TESTING THIS THANG');

  });
});
