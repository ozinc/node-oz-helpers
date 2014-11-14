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
var conf = helpers.conf;
var statsd = helpers.statsd;
```

Or, if you only want to use one of the helpers:

```javascript
var statsd = require('node-oz-helpers').statsd;
```

## The Helpers

The helpers that this library defines are by-definiton small and well-defined.

### StatsD helper

The StatsD helper is based on [our fork](https://github.com/krummi/node-statsd/commits/master) of the `sivy/node-statsd` statsd client for NodeJS which — obviously — allows developers to send metrics to a StatsD server. Additionally, the helper adds support for some very-nice-to-have extra features:

  * It logs the metrics being sent to stdout when `NODE_ENV=development`.
  * It allows you to initialize it with a URL instead of a `host`/`port` combo.
  * It adds a connect-based middleware that can be added to routes to automagically provide response-time metrics on that specific route.

#### API

Some examples of the StatsD helper in use:

```javascript
// Requires the helper.
var statsd = require('node-oz-helpers').statsd;

// Helper initialization - this is required (or else an error will be thrown)!

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

For those unfamiliar with DogStatsD, [here](http://docs.datadoghq.com/guides/dogstatsd/) are some docs.

Another nice feature of this library is the "debug mode" which logs metrics to stdout instead of delivering them to a StatsD server:

```javascript
// Requires the helper.
var statsd = require('node-oz-helpers').statsd;
var log = require('node-oz-helpers').logger;

// Initializes the lib from the STATSD_URL in debug mode with a Bunyan logger associated to it.
statsd.initialize({ debug: true, logger: log });

// Doing this will now log to stdout instead of delivering metrics to a StatsD server.
statsd.histogram('what', 1337, 0.25, ['method:GET', 'route:/users/']);
// => statsd.histogram(what, 1337, 0.25, ['method:GET', 'route:/users/'])
```

The third nice feature of the library is the connect-based middleware it has built in. This feature allows anyone to instrument their Express/Restify-based routes with response-time metrics in a super simple manner. The library will not only record the total time it takes to serve requests, it also offers so called `checkpoints`. This feature is probably best explained by an example:

```javascript
// Requires and initializes the helper.
var statsd = require('node-oz-helpers').statsd;
statsd.initialize({ prefix: 'user_z' });

// Instruments a route with our middleware!
app.get('/users/:id/channels', statsd.middleware('requests'), function (req, res) {
  var userId = req.params.id;

  User.getUserById(userId)
  .then(function (user) {

    // The middleware adds a function to the request object that allows us to create new
    // "checkpoints". Here we create one indicating that the database call is finished.
    req.checkpoint('getUser');

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
statsd.histogram('user_z.requests', 736, ['method:get', 'route:/users/$id/chanenls', 'part:getUser'])
statsd.histogram('user_z.requests', 129, ['method:get', 'route:/users/$id/channels', 'part:getChannels'])
statsd.histogram('user_z.requests.total', 867, ['method:get', 'route:/users/$id/channels', 'status:200'])
```

And obviously if you are not in debug mode you can see pretty graphs in DataDog that are created from this:

![DataDog](https://cloud.githubusercontent.com/assets/331083/5029925/5539dc3c-6b43-11e4-9ab3-6ca6a6064a80.png)

**Note** that presently you need to manually instrument each and every route that you want to get metrics for with `statsd.middleware(key)`. There are good reasons for this and we are looking for ways to make it such that you can just type `app.use(statsd.middleware)` once and it will then use it for all of the routes.

#### TODO

* Add default tags to the mix.
* Find a way to just add the StatsD middleware once and not for every route.

### Configuration Helper

The environment config helper is a thin wrapper wrapping the environment configuration. First and foremost, it presents a simple API to access configuration described in the environment. It also allows the user to manually define user-defined configuration values. Note that user-defined configuration takes precendence over environment-based configuration. This means that if both the user and the environment defines the same configuration key, the helper will return the user-defined one.

The configuration helper also looks for a `.env` file in the root of your project and automatically imports all of the `KEY=VALUE` pairs from there and makes them available via the `.get()` function.

Some examples of the API:

```javascript
// Requires the helper.
var conf = require('node-oz-helpers').conf;

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
var conf = require('node-oz-helpers').conf;

// Omit the call to .initialize() as we don't want to specify any user-defined configuration.

// Tell the helper to fail-hard if no configuration exists for 'PORT' and 'REDISTOGO_URL'.
conf.required(['PORT', 'REDISTOGO_URL']);

// The call to .required() will throw an error if any of the specified configuration keys do not exist.
```

### Logger Helper

The logger is a really simple Bunyan logger that more and less only provides access to a Bunyan logging instance which prints to stdout.

```javascript
// Requires the helper.
var log = require('node-oz-helpers').logger;

// Helper initialization - this is required (or else an error will be thrown)!
var name = 'playlist_z'; // The name of your module.
var version = '0.0.1'; // The version of your module.
log.initialize(name, version);

// Logs something to stdout!
log.info({ n: 42 }, 'Love you guys!');
```
