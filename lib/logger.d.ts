import { NextFunction, Request, Response } from 'express';

declare function getInstance(options: any): typeof globalThis;
interface RequestTimed extends Request {
    _startAt: [number, number];
}
declare function requestLogger(options: any): (req: RequestTimed, res: Response, next: NextFunction) => void;
declare const _default: {
    getInstance: typeof getInstance;
    requestLogger: typeof requestLogger;
    
    trace(): boolean;
    trace(error: Error, ...params: any[]): void;
    trace(obj: Object, ...params: any[]): void;
    trace(format: any, ...params: any[]): void;

    debug(): boolean;
    debug(error: Error, ...params: any[]): void;
    debug(obj: Object, ...params: any[]): void;
    debug(format: any, ...params: any[]): void;

    info(): boolean;
    info(error: Error, ...params: any[]): void;
    info(obj: Object, ...params: any[]): void;
    info(format: any, ...params: any[]): void;

    warn(): boolean;
    warn(error: Error, ...params: any[]): void;
    warn(obj: Object, ...params: any[]): void;
    warn(format: any, ...params: any[]): void;

    error(): boolean;
    error(error: Error, ...params: any[]): void;
    error(obj: Object, ...params: any[]): void;
    error(format: any, ...params: any[]): void;

    fatal(): boolean;
    fatal(error: Error, ...params: any[]): void;
    fatal(obj: Object, ...params: any[]): void;
    fatal(format: any, ...params: any[]): void;
};
export default _default;
