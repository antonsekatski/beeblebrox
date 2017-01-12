/// <reference types="react" />
import * as React from 'react';
import Store from './store';
export interface ProviderProps {
    store: Store;
}
export default class Provider extends React.Component<ProviderProps, any> {
    private store;
    constructor(props: ProviderProps, context: any);
    static childContextTypes: {
        store: React.Requireable<any>;
    };
    getChildContext(): {
        store: Store;
    };
    render(): React.ReactElement<any>;
}
