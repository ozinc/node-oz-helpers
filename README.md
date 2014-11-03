# OZ NodeJS Helpers
> A collection of small helpers used across OZ's NodeJS modules.

## How To Use

Install it and add it to `package.json`:

```bash
npm install oz-node-helpers --save
```

Require it somewhere in your NodeJS module:

```javascript
var helpers = require('oz-node-helpers');
var conf = helpers.conf;
var statsd = helpers.statsd;
```

Or, if you only want to use one of the helpers:

```javascript
var statsd = require('oz-node-helpers').statsd;
```

## The Helpers

The helpers that this library defines are by-definiton small and well-defined.

### StatsD helper

The StatsD helper is based on [our fork](https://github.com/krummi/node-statsd/commits/master) of the `sivy/node-statsd` statsd client for NodeJS which — obviously — allows developers to send metrics to a StatsD server. Additionally, the helper adds support for some nice, more OZ-specific features:

  * It logs the metrics being sent to stdout when `NODE_ENV=development`.
  * It allows you to initialize it with a URL instead of a `host`/`port` combo.

#### API

Some examples of the StatsD helper in use:

```javascript
// Requires the helper.
var statsd = require('oz-node-helpers').statsd;

// Helper initialization - required (or else an error will be thrown)!

// Initializes the lib from the STATSD_URL.
statsd.initialize({ url: conf.get('STATSD_URL'), prefix: 'awesome_module_z' });

// Alternatively use the (host, port) tuple.
statsd.initialize({ host: 'localhost', port: 8125, prefix: 'awesome_module_z' });

// Then you can just use the sivy/node-statsd API to send some metrics!
statsd.timing('response_time', 125);
statsd.increment('no_of_visits');
statsd.gauge('load_avg', 0.35);

// The sivy/node-statsd also supports DogStatsD metrics, i.e. histograms and tags.
statsd.histogram('response_time', 235, ['route:/users/', 'method:GET']);
```

Here are some docs on [DogStatsD](http://docs.datadoghq.com/guides/dogstatsd/).

#### TODO

* Add default tags to the mix.
* Add DataDog/Heroku connect-based middleware to the mix.

### Environment config helper

The environment config helper is a thin wrapper around the [flatiron/nconf](https://github.com/flatiron/nconf) configuration manager. First and foremost, it presents a simple API to access configuration described in the environment. It also allows the user to manually define user-defined configuration values. Note that user-defined configuration **ALWAYS precedes** environment-based configuration. This means that if both the user and the environment defines the same configuration key, the helper will return the user-defined one.

Some examples of the API:

```javascript
// Requires the helper.
var conf = require('oz-node-helpers').conf;

// Helper initialization - optional but advised!

// Initializes the helper with name and version from package.json:
var pkgInfo = require('./package');
conf.initialize({
  name: pkgInfo.name,
  version: pkgInfo.version
});

// If no user-defined configuration is needed you can omit the call to .initialize()!

// Fetch the value of 'name' which will in this case come from the user-defined configuration.
var name = conf.get('name');

// Fetch the value of 'PORT' which will in this case come from environment-defined configuration.
var port = conf.get('PORT');

// Fetch the value of 'PORT' and default to some value if the key does neither exist
// in the user-defined nor the environment-defined configuration.
var port = conf.get('PORT', 3000);
```

You can also tell the helper that some configuration keys need to be there as follows:

```javascript
// Requires the helper.
var conf = require('oz-node-helpers').conf;

// Omit the call to .initialize() as we don't want to specify any user-defined configuration.

// Tell the helper to fail-hard if no configuration exists for 'PORT' and 'REDISTOGO_URL'.
conf.required(['PORT', 'REDISTOGO_URL']);

// The call to .required() will throw an error if any of the specified configuration keys do not exist.
```

### Logger

The logger is a really simple Bunyan logger that more and less only provides access to a Bunyan logging instance which prints to stdout.

```javascript
// Requires the helper.
var log = require('oz-node-helpers').logger;

// Logs something to stdout!
log.info({ n: 42 }, 'Love you guys!');
```
