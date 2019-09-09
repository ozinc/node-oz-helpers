import conf from './lib/conf';
import logger from './lib/logger';
import statsd from './lib/statsd';

declare module 'node-oz-helpers' {
  export function getConf(): typeof conf;
  export function getLogger(): typeof logger;
  export function getStatsD(): typeof statsd;
}
