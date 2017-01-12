/// <reference types="es6-shim" />
export interface State {
    [index: string]: any;
}
export interface Subscriptions {
    [index: string]: (() => void)[];
}
export interface TTL {
    [index: string]: number;
}
export interface Versions {
    [index: string]: number;
}
export interface Actions {
    [index: string]: any;
}
export interface ReactProps {
    store: (key: string, defaultValue?: any) => any;
    actions: Actions;
}
export default class Store {
    state: State;
    ttl: TTL;
    versions: Versions;
    subscriptions: Subscriptions;
    actions: {};
    stateContext: StateContext;
    strict: boolean;
    debug: boolean;
    constructor({state, actions}: {
        state?: {};
        actions?: {};
    });
    dump(): {
        state: State;
    };
    subscribe(key: string, handler: () => void): void;
    notify(key: string): void;
    preload(renderProps: any, req: any): Promise<{}>;
}
export declare class StateContext {
    private state;
    private ttl;
    private notify;
    list: {
        push<T>(key: string, value: T): void;
        exists<T>(key: string, callback: (value: T) => boolean): boolean;
        remove<T>(key: string, callback: (value: T) => boolean): boolean;
    };
    constructor(state: State, ttl: TTL, notify: (key: string) => void);
    set<T>(key: string, value: T): void;
    setex<T>(key: string, value: T, ttl: number): void;
    get<T>(key: string, defaultValue?: any): T;
    del(key: string): any;
}
