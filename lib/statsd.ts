import { NextFunction, Request, Response } from 'express';
import lodash from 'lodash';
import { StatsD } from 'node-statsd';
import onHeaders from 'on-headers';
import urlutil from 'url';

import logger from './logger';

const that = this;
let initialized = false;
let debugMode = false;
let logFunction: { (): void; (arg0: string): void; } | undefined;
let statsd: StatsD | undefined;
let debugPrefix: string | undefined;

interface Config {
  port: any;
  host: any;
  url: any;
  prefix: any;
  logger: any;
  cacheDns: boolean;
  debug: boolean;
}

function getInstance(obj: Config) {
  if (!initialized) {
    // Setup default params.
    const o = obj || {
      debug: true
    };

    // Cache DNS by default:
    if (!lodash.has(o, 'cacheDns')) {
      o.cacheDns = true;
    }

    // Debug mode?
    if (o.debug) {
      if (o.logger) {
        logFunction = o.logger.debug;
      } else {
        logFunction = logger.debug;
      }

      if (o.prefix) {
        debugPrefix = o.prefix;
      }
      debugMode = true;
    }

    // If a url is provided; parse it.
    if (o.url) {
      if (o.host || o.port) {
        throw new Error('Declare only one of: [url, host/port].');
      }
      const parsed = urlutil.parse(o.url);
      o.host = parsed.hostname;
      o.port = Number(parsed.port);
      delete o.url;
    }

    // Initialize the statsd instance!
    statsd = new StatsD(o);
    initialized = true;
  } else if (initialized && obj !== undefined && lodash.keys(obj).length > 0) {
    const message = 'Re-initialization of the statsd helper options - probably not what you want!\n'
                + 'See node-oz-helpers\'s README for further details.';
    throw new Error(message);
  }
  return that;
}

function proxy(functionName: string, ...argss : any[]) {
  return function () {
    // Has initialization taken place?
    if (!initialized) {
      throw new Error('You need to initialize statsd first.');
    }

    if (debugMode) {

      // Associate a prefix with the first argument.
      if (debugPrefix !== undefined && argss.length > 0) {
        if (debugPrefix.slice(-1) !== '.') {
          argss[0] = debugPrefix + '.' + argss[0];
        } else {
          argss[0] = debugPrefix + argss[0];
        }
      }
      const args: string[] = [];

      lodash.forEach(argss, function (value) {
        if (lodash.isArray(value)) {
          const o : string[] = [];
          lodash.forEach(value, function (element) {
            o.push("'" + element + "'");
          });
          args.push('[' + o.join(', ') + ']');
        } else if (lodash.isString(value)) {
          args.push('\'' + value + '\'');
        } else {
          args.push(value);
        }
      });

      const s = 'statsd.' + functionName + '(' + args.join(', ') + ')';
      if (logFunction) {
        logFunction(s);
      }
    } else {
      if (statsd) {
        Object.keys(statsd).forEach((key) => {
          const derp : keyof StatsD = key as keyof StatsD;
          if (statsd && key === functionName) {
            const func = statsd[derp];
            if (func.hasOwnProperty('apply')) {
              func.apply(statsd, argss);
            }
          }
        })
        const func = statsd[functionName];
        func.apply(statsd, argss);
      }
    }
  };
}

/**
 * An connect middleware that sends metrics on the route timings to statsd.
 * @param key the statsd key to use.
 * @returns {measure} the middleware.
 */
function middleware(key: string | undefined) {

  // Make key default to 'requests'.
  if (key === undefined || !lodash.isString(key)) {
    key = 'requests';
  }

  function toMillis(hrtime: [number, number] | number[]) {
    const ms = hrtime[0] * 1e3 + hrtime[1] * 1e-6;
    return ms.toFixed(0);
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // We cannot get `req.route` nor `req.method` because the request has not been routed by express at this point
    const extraTags: string[] = [];

    onHeaders(res, function () {
      // When the headers are sent (when someone calls res.send) it is safe to assume the request has been routed
      let route = req.route.path.replace(/\:/g, '$');
      const method = req.method.toLowerCase();
      let tags;

      // add includes to route if existing
      if (req.query.include) {
        route += "?include=" + req.query.include;
      }

      for (let i = 1; i < req.measurements.length; i++) {
        tags = [
          'method:' + method,
          'route:' + route,
          'status:' + res.statusCode,
          'part:' + req.measurements[i].key
        ].concat(extraTags);
        this.histogram(key, Number(req.measurements[i].diff), tags);
      }

      const totalDiff = toMillis(process.hrtime(req.measurements[0].time))
      tags = [
        'method:' + method,
        'route:' + route,
        'status:' + res.statusCode
      ].concat(extraTags);
      this.histogram(key + '.total', Number(totalDiff), tags);
    });

    req.measurements = [ {
      key: 'initial',
      time: process.hrtime(),
      diff: 0
    } ];

    req.addTag = function (tag) {
      extraTags.push(tag);
    };

    req.checkpoint = function (key) {
      const last = this.measurements.slice(-1)[0];
      const diff = toMillis(process.hrtime(last.time));
      this.measurements.push({
        key: key,
        time: process.hrtime(),
        diff: diff
      });
    };

    next();
  };
}

// Mostly for debugging purposes.
function getInstanceInfo() {
  return {
    host: statsd && statsd.host,
    port: statsd && statsd.port
  };
}

// Mostly for debugging purposes.
function reset() {
  initialized = false;
  statsd = undefined;
  debugMode = false;
  logFunction = undefined;
}

/**
 * Exports.
 */
module.exports.getInstance = getInstance;
module.exports.getInstanceInfo = getInstanceInfo;
module.exports.reset = reset;

module.exports.middleware = middleware;

module.exports.timing = proxy('timing');
module.exports.increment = proxy('increment');
module.exports.decrement = proxy('decrement');
module.exports.gauge = proxy('gauge');
module.exports.histogram = proxy('histogram');
module.exports.unique = proxy('unique');
module.exports.set = proxy('set');
module.exports.close = proxy('close');

export default {
  getInstance: getInstance,
  getInstanceInfo: getInstanceInfo,
  reset: reset,
  middleware: middleware,
  timing: proxy('timing'),
  increment: proxy('increment'),
  decrement: proxy('decrement'),
  gauge: proxy('gauge'),
  histogram: proxy('histogram'),
  unique: proxy('unique'),
  set: proxy('set'),
  close: proxy('close')
};
