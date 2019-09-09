import { NextFunction, Request, Response } from 'express';

export interface Config {
    debug?: boolean | any;
    cacheDns?: boolean;
    logger?: { debug: any };
    prefix?: string;
    url?: string;
    host?: string;
    port?: number;
    global_tags?: string[];
}

export type Callback = (error?: Error, bytes?: Buffer) => void;

declare function getInstance(obj: Config): typeof globalThis;
/**
 * An connect middleware that sends metrics on the route timings to statsd.
 * @param key the statsd key to use.
 * @returns {measure} the middleware.
 */
declare function middleware(key?: string): (req: Request, res: Response, next: NextFunction) => void;
declare function getInstanceInfo(): {
    host: string | undefined;
    port: number | undefined;
};
declare function reset(): void;
declare const _default: {
    getInstance: typeof getInstance;
    getInstanceInfo: typeof getInstanceInfo;
    reset: typeof reset;
    middleware: typeof middleware;
    timing(stat: string | string[], time: number, sampleRate?: number, tags?: string[], callback?: Callback): void;
    timing(stat: string | string[], time: number, sampleRateOrTags?: number | string [], callback?: Callback): void;
    timing(stat: string | string[], time: number, callback?: Callback): void;
    increment(stat: string | string[], value?: number, sampleRate?: number, tags?: string[], callback?: Callback): void;
    increment(stat: string | string[], value: any, sampleRateOrTags?: number | string [], callback?: Callback): void;
    increment(stat: string | string[], value: any, callback?: Callback): void;
    decrement(stat: string | string[], value?: number, sampleRate?: number, tags?: string[], callback?: Callback): void;
    decrement(stat: string | string[], value?: number, sampleRateOrTags?: number | string[], callback?: Callback): void;
    decrement(stat: string | string[], value?: number, callback?: Callback): void;
    gauge(stat: string | string[], value: number, sampleRate?: number, tags?: string[], callback?: Callback): void;
    gauge(stat: string | string[], value: number, sampleRateOrTags?: number | string [], callback?: Callback): void;
    gauge(stat: string | string[], value: number, callback?: Callback): void;
    histogram(stat: string | string[], value: any, sampleRate?: number, tags?: string[], callback?: Callback): void;
    histogram(stat: string | string[], value: any, sampleRateOrTags?: number | string [], callback?: Callback): void;
    histogram(stat: string | string[], value: any, callback?: Callback): void;
    unique(stat: string | string[], value: any, sampleRate?: number, tags?: string[], callback?: Callback): void;
    unique(stat: string | string[], value: any, sampleRateOrTags?: number | string [], callback?: Callback): void;
    unique(stat: string | string[], value: any, callback?: Callback): void;
    set(stat: string | string[], value: any, sampleRate?: number, tags?: string[], callback?: Callback): void;
    set(stat: string | string[], value: any, sampleRateOrTags?: number | string [], callback?: Callback): void;
    set(stat: string | string[], value: any, callback?: Callback): void;
    close: () => void;
};
export default _default;
