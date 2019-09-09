import { NextFunction, Request, Response } from 'express';
interface Config {
    port: any;
    host: any;
    url: any;
    prefix: any;
    logger: any;
    cacheDns: boolean;
    debug: boolean;
}
declare function getInstance(obj: Config): typeof globalThis;
/**
 * An connect middleware that sends metrics on the route timings to statsd.
 * @param key the statsd key to use.
 * @returns {measure} the middleware.
 */
declare function middleware(key: string | undefined): (req: Request, res: Response, next: NextFunction) => void;
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
    timing: () => void;
    increment: () => void;
    decrement: () => void;
    gauge: () => void;
    histogram: () => void;
    unique: () => void;
    set: () => void;
    close: () => void;
};
export default _default;
