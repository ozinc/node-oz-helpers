import conf from './lib/conf';
import logger from './lib/logger';
import statsd from './lib/statsd';

declare module 'node-oz-helpers' {
  export const getConf: typeof conf.getInstance;
  export const getLogger: typeof logger.getInstance;
  export const getStatsD: typeof statsd.getInstance;
}
