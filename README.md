# OZ NodeJS Helper Library
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

The helpers that this library defines are in their nature small and well-defined.

### StatsD helper

The StatsD helper is based on the sivy/node-statsd statsd client for NodeJS which — obviously — allows developers to send metrics to a StatsD server. Additionally, the helper adds support for some nice, OZ-specific features: 
 
  * It logs the metrics being sent to stdout when `NODE_ENV=development`.
  * 

#### API

Some examples of the StatsD helper in use:

```javascript
// Imports the helper:
var statsd = require('oz-node-helpers').statsd;

// Initalizes the lib from the STATSD_URL:
statsd.initialize({ url: conf.get('STATSD_URL'), prefix: 'awesome_module_z' });

// Alternatively use the host, port tuple:
statsd.initialize({ host: 'localhost', port: 8125, prefix: 'awesome_module_z' });

// Then you can just use the sivy/node-statsd API to send some metrics!
statsd.timing('response_time', 125);
statsd.increment('no_of_visits')
statsd.gauge('load_avg', 0.35);

// The sivy/node-statsd 
``` 

#### TODO

* Add default tags to the mix.

### Environment config helper

The environment config helper is a thin wrapper around managing configuration via the environment — exactly what Heroku does! Its API is very simple:

```
.load()

conf.required(['STATSD_URL', 'REDISTOGO_URL']).load();

conf.get('ENV_VARIABLE');