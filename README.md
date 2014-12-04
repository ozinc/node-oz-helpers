# OZ's NodeJS Helpers
> A collection of small helpers used across OZ's NodeJS modules.

## How To Use

Install it and add it to `package.json`:

```bash
npm install node-oz-helpers --save
```

Require it somewhere in your NodeJS module:

```javascript
var helpers = require('node-oz-helpers');
var log = helpers.getLogger();
var conf = helpers.getConf();
var statsd = helpers.getStatsD();
```

Or, if you only want to use one of the helpers:

```javascript
var log = require('node-oz-helpers').getLogger();
```

## A List of Helpers

This small library currently implements three very-well defined and isolated helpers, namely:

* **StatsD** - statsd client wrapper with added benefits.
* **Logger** - a thin wrapper around bunyan.
* **Conf** - a lightweight abstraction of environment variables, with some sugar.

## Logger Helper

The logger is a really simple Bunyan logger that more and less only provides access to a Bunyan logging instance which prints to stdout. Behind the scenes it automagically reads the name and version of your application from your `package.json` and passes that along with all log lines.

```javascript
// Requires the helper.
var log = require('node-oz-helpers').getLogger();

// Logs something to stdout!
log.info({ n: 42 }, 'Love you guys!');
```

## Configuration Helper

The environment config helper is a thin wrapper wrapping the environment configuration. First and foremost, it presents a simple API to _access configuration described in the environment_. It also allows the user to manually define user-defined configuration values. Note that user-defined configuration takes precedence over environment-based configuration, meaning that if both the user and the environment defines the same configuration key, the helper will return the user-defined one.

Some examples of the API:

```javascript
// Requires the helper.
var conf = require('node-oz-helpers').getConf();

// Fetch the value of 'PORT' which should come from the environment.
var port = conf.get('PORT');
// => Basically just fetches process.env.PORT

// Fetch the value of 'name' which is the name of your application and is automagically
// read from your app's package.json file.
var name = conf.get('name');

// If you want you can set your own user-defined configuration. The conf helper will first look
// in the user-defined configuration BEFORE the environment configuration.
conf.set('delay', 9000);
// ... some code here ...
conf.get('delay');
// => 9000

// Fetch the value of 'PORT' and default to some value if the key does neither exist
// in the user-defined nor the environment-defined configuration.
var port = conf.get('PORT', 3000);
```

You can also tell the helper that some configuration keys are required, as follows:

```javascript
// Requires the helper.
var conf = require('node-oz-helpers').getConf();

// Tell the helper to fail-hard if no configuration exists for 'PORT' and 'REDISTOGO_URL'.
conf.required(['PORT', 'REDISTOGO_URL']);

// The call to .required() will throw an error if any of the specified configuration keys do not
// exist. I'm not sure if this is the best way around it, but it is a way.
```

## StatsD helper

The StatsD helper is based on [our fork](https://github.com/krummi/node-statsd/commits/master) of the `sivy/node-statsd` statsd client for NodeJS which — obviously — allows developers to send metrics to a StatsD server. Additionally, the helper adds support for some very-nice-to-have extra features:

  * It logs the metrics being sent to stdout when `NODE_ENV=development`.
  * It allows you to initialize it with a URL instead of a `host`/`port` combo.
  * It adds a connect-based middleware that can be added to routes to automagically provide response-time metrics on that specific route.

#### API

Some examples of the StatsD helper in use:

```javascript
// Initializes the helper from a STATSD_URL (e.g. statsd://localhost:8125/).
var statsd = require('node-oz-helpers').getStatsD({
  url: conf.get('STATSD_URL'),
  prefix: 'awesome_module_z'
});

// Alternatively use the (host, port) tuple.
var statsd = require('node-oz-helpers').getStatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'awesome_module_z'
});

// If you provide no options, the helper will do one of two things depending on the state:
// (1) If you have already initialized the helper it will use that configuration.
// (2) If you have not initialized the helper, it default to debug mode and thus NOT send metrics.
var statsd = require('node-oz-helpers').getStatsD();

// Then you can just use the sivy/node-statsd API to send some metrics!
statsd.timing('response_time', 125);
statsd.increment('no_of_visits');
statsd.gauge('load_avg', 0.35);

// The sivy/node-statsd also supports DogStatsD metrics, i.e. histograms and tags.
statsd.histogram('response_time', 235, ['route:/users/', 'method:GET']);
```

For those unfamiliar with DogStatsD, [here](http://docs.datadoghq.com/guides/dogstatsd/) are some docs.

Another nice feature of this library is the "debug mode" which logs metrics to stdout instead of delivering them to a StatsD server:

```javascript
// Initializes the lib from the STATSD_URL in debug mode.
var log = require('node-oz-helpers').getLogger();
var statsd = require('node-oz-helpers').getStatsD({
  debug: true
});

// Doing this will now log to stdout instead of delivering the metrics to a StatsD server.
statsd.histogram('what', 1337, 0.25, ['method:GET', 'route:/users/']);
// => statsd.histogram(what, 1337, 0.25, ['method:GET', 'route:/users/'])
```

The third nice feature of the library is the connect-based middleware it has built-in. This feature allows anyone to instrument their Express/Restify-based routes with response-time metrics in a super simple manner. The library will not only record the total time it takes to serve requests, it also offers so called `checkpoints`. This feature is probably best explained by an example:

```javascript
// Initializes the helper from a STATSD_URL (e.g. statsd://localhost:8125/).
var statsd = require('node-oz-helpers').getStatsD({
  url: conf.get('STATSD_URL'),
  prefix: 'awesome_module_z'
});

// Instruments a route with our middleware!
app.get('/users/:id/channels', statsd.middleware('requests'), function (req, res) {
  var userId = req.params.id;

  User.getUserById(userId)
  .then(function (user) {

    // The middleware adds a function to the request object that allows us to create new
    // "checkpoints". Here we create one indicating that the database call is finished.
    req.checkpoint('getUser');

    // The middleware also adds a function to the request object that allows us to add custom tags
    // to the current request handler.
    req.addTag('userType:paid');

    return Channels.getChannelsForUser(userId);
  })
  .then(function (channels) {

    // Here we create another checkpoint.
    req.checkpoint('getChannels');

    res.status(200).json(channels));
  });
});
```

If you initialize the StatsD helper to be in "debug mode" you will see something like this in the console:

```
statsd.histogram('user_z.requests', 736, ['method:get', 'route:/users/$id/chanenls', 'part:getUser', 'userType:paid'])
statsd.histogram('user_z.requests', 129, ['method:get', 'route:/users/$id/channels', 'part:getChannels', 'userType:paid'])
statsd.histogram('user_z.requests.total', 867, ['method:get', 'route:/users/$id/channels', 'status:200', 'userType:paid'])
```

And obviously if you are not in debug mode you can see pretty graphs in DataDog that are created from this:

![DataDog](https://cloud.githubusercontent.com/assets/331083/5029925/5539dc3c-6b43-11e4-9ab3-6ca6a6064a80.png)

**Note** that presently you need to manually instrument each and every route that you want to get metrics for with `statsd.middleware(key)`. There are valid reasons for this and we are looking for ways to make it such that you can just type `app.use(statsd.middleware)` once and it will then use it for all of the routes.

### Gotchas

There are some gotchas regarding the statsd helper that all stem from the fact that we want to keep it in such a way that _when you have initialized the options of it once, you probably do not want to initialize them again but rather just always use the same configuration_. One of the main gotchas is that the order in which you require stuff that uses the statsd helper matters. This means that if you have the following two files:

```javascript
// server.js (the application's entrypoint)

if (conf.get('NODE_ENV') === 'production') {
  statsd = helpers.getStatsD({ url: conf.get('STATSD_URL'), prefix: conf.get('name') });
} else {
  statsd = helpers.getStatsD({ debug: true, logger: log, prefix: conf.get('name') });
}

var db = require('./repositories/db.js');
```
```javascript
// db.js (the application's entrypoint)

statsd = require('node-oz-helpers').getStatsD();
```

The `statsd` variable in `db.js` would use the same configuration as the one in `server.js`. **Now if you would change `server.js` as follows:**


```javascript
// server.js (the application's entrypoint)

var db = require('./repositories/db.js');

if (conf.get('NODE_ENV') === 'production') {
  statsd = helpers.getStatsD({ url: conf.get('STATSD_URL'), prefix: conf.get('name') });
} else {
  statsd = helpers.getStatsD({ debug: true, logger: log, prefix: conf.get('name') });
}
```

You would use the default configuration from `db.js` in `server.js` which means that nothing would work!

Due to this reason we throw an exception letting you know when you do this. Sawry.

### TODO

* Add default tags to the mix.
* Find a way to just add the StatsD middleware once and not for every route.
