'use strict';

var should = require('should');
var sinon = require('sinon');
var statsd = require('../lib/statsd');

describe('the statsd helper\'s', function () {
  afterEach(function () {
    statsd.reset();
  })
  describe('#getInstance', function () {
    it('should correctly parse an url if provided with one', function () {
      statsd.getInstance({ url: 'statsd://localhost:1337/' })
      statsd.getInstanceInfo().host.should.equal('localhost');
      statsd.getInstanceInfo().port.should.equal(1337);
    });
    it('should throw an error if provided with both url and host/port', function () {
      (function () {
        statsd.getInstance({ url: 'statsd://localhost:1337/', host: 'mbl.is', port: 80 });
      }).should.throw();
    });
    it('should not send metrics without initialization', function () {
      (function () {
        statsd.timing('testing', 5);
      }).should.throw();
    })
  })
  describe('#debugMode', function () {
    it('should only log to stdout', function () {
      var log = {
        debug: sinon.stub()
      };
      statsd.getInstance({ debug: true, logger: log });
      statsd.histogram('what', 1337);
      log.debug.calledOnce.should.be.true
    });

    it('should log to stdout when asked to', function () {
      statsd.getInstance({ debug: true, prefix: 'awesome_z' });
      statsd.histogram('what', 1337, 0.25, ['method:GET', 'route:/users/']);
    });

  })
});
