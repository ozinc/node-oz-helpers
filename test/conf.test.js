'use strict';

var should = require('should');
var sinon = require('sinon');
var statsd = require('../lib/statsd');

var conf = require('../lib/conf');

describe('the conf helper\'s', function () {
  beforeEach(function () {
    process.env['MY_CONFIG_KEY'] = 'true';
    conf.reset();
  })
  describe('#getInstance', function () {
    it('should correctly parse the package.json from the root app', function () {
      conf.getInstance();
      conf.get('name').should.equal('node-oz-helpers');
      conf.get('version').should.exist;
    });
  });
  describe('#required', function () {
    it('should throw an exception if some required key is missing', function () {
      (function () {
        conf.required(['STATSD_URL']);
      }).should.throw;
    });
  });
  describe('#get', function () {
    it('should provide a default value when asked to', function () {
      conf.getInstance();
      var url = conf.get('REDISTOGO_URL', 'redis://localhost:9999/');
      url.should.equal('redis://localhost:9999/');
    });
    it('should not have a problem with defaults not existing', function () {
      should.not.exist(conf.get('does-not-exist'));
    });
    it('should provide values from the environment-defined configuration', function () {
      should.exist(conf.get('MY_CONFIG_KEY'));
    });
    it('should prefer user-defined configuration to environment-defined configuration', function () {
      conf.set('MY_CONFIG_KEY', 'false');
      conf.get('MY_CONFIG_KEY').should.equal('false');
    })
  });
  describe('#set', function () {
    it('should properly set values to keys', function () {
      should.not.exist(conf.get('myKey'));
      conf.set('myKey', '<some value>');
      should.exist(conf.get('myKey'))
    })
  });
});
