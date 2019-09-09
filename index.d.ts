import conf from './lib/conf';
import logger from './lib/logger';
import statsd, { Config as StatsdConfig } from './lib/statsd';

export interface LoggerConfig {
  disabled?: boolean;
}

declare module 'node-oz-helpers' {
  export function getConf(): typeof conf;
  export function getLogger(config?: LoggerConfig): typeof logger;
  export function getStatsD(config?: StatsdConfig): typeof statsd;
}
