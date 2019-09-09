import conf from './lib/conf';
import logger from './lib/logger';
import statsd from './lib/statsd';

declare module 'node-oz-helpers' {
  export const getConf: typeof conf;
  export const getLogger: typeof logger;
  export const getStatsD: typeof statsd;
}
