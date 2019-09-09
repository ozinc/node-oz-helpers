declare function getInstance(): typeof globalThis;
declare function required(args: string[] | string): void;
declare function get(key: string, defaultValue?: string): any;
declare function set(key: string, value: string): void;
declare function has(key: string): boolean;
declare const _default: {
    getInstance: typeof getInstance;
    required: typeof required;
    get: typeof get;
    set: typeof set;
    has: typeof has;
};
export default _default;
