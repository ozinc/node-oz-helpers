import conf from './lib/conf';
import logger from './lib/logger';
import statsd from './lib/statsd';

export interface StatsdConfig {
  debug?: boolean | any;
  cacheDns?: boolean;
  logger?: { debug: any };
  prefix?: string;
  url?: string;
  host?: string;
  port?: number;
  global_tags?: string[];
}

declare module 'node-oz-helpers' {
  export function getConf(): typeof conf;
  export function getLogger(): typeof logger;
  export function getStatsD(config: StatsdConfig): typeof statsd;
}
