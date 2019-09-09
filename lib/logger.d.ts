import { NextFunction, Request, Response } from 'express';
declare function getInstance(options: any): typeof globalThis;
interface RequestTimed extends Request {
    _startAt: [number, number];
}
declare function requestLogger(options: any): (req: RequestTimed, res: Response, next: NextFunction) => void;
declare const _default: {
    getInstance: typeof getInstance;
    requestLogger: typeof requestLogger;
    trace: () => void;
    debug: () => void;
    info: () => void;
    warn: () => void;
    error: () => void;
    fatal: () => void;
};
export default _default;
