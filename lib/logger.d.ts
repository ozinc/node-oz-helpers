import { NextFunction, Request, Response } from 'express';

declare function getInstance(options: any): typeof globalThis;
interface RequestTimed extends Request {
    _startAt: [number, number];
}
declare function requestLogger(options: any): (req: RequestTimed, res: Response, next: NextFunction) => void;
declare const _default: {
    getInstance: typeof getInstance;
    requestLogger: typeof requestLogger;
    trace: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    fatal: (...args: any[]) => void;
};
export default _default;
