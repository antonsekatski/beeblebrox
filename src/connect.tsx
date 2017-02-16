import * as React from 'react';

import Store from './store';

export default function connect(WrappedComponent): any {
  class Wrapper extends React.Component<any, any> {
    static preload: any;

    lastVersions: Object = {};
    store: Store;
    storeGetter: (this: Wrapper, key: string, defaultValue?: any) => any;
    shouldUpdate: boolean = false;

    propsToStore = {};

    // DO NOT FORGET THIS OR ELSE BUSTED
    static contextTypes = {
      store: React.PropTypes.object.isRequired,
    };

    constructor(props, context) {
      super(props, context);

      this.store = context.store;

      this.updateHandler = this.updateHandler.bind(this);

      // if (typeof WrappedComponent.preload === 'function') {
      //   WrappedComponent.preload = WrappedComponent.preload.bind(this.store.actions);
      // }

      // if (WrappedComponent.mapPropsToStore && typeof WrappedComponent.mapPropsToStore === 'function') {
      //   const props = WrappedComponent.mapPropsToStore();

      //   for (const prop in props) {
      //     if (props.hasOwnProperty(prop)) {
      //       Object.defineProperty(this.propsToStore, prop, {
      //         enumerable: true,
      //         get() {
      //           return this.storeGetter(props[prop]);
      //         },
      //       });
      //     }
      //   }
      // }

      this.storeGetter = (key: string, defaultValue?: any) => {
        // Subscribe if we haven't already
        if (!this.lastVersions.hasOwnProperty(key)) {
          this.store.subscribe(key, this.updateHandler);
        }

        // Save last version
        this.lastVersions[key] = true;

        return this.store.actionContext.get(key, defaultValue);
      }

      // WrappedComponent.store = (key: string, defaultValue?: any) => {
      //   // Subscribe if we haven't already
      //   if (!this.lastVersions.hasOwnProperty(key)) {
      //     this.store.subscribe(key, this.updateHandler);
      //   }

      //   // Save last version
      //   this.lastVersions[key] = this.store.versions[key];

      //   return this.store.stateContext.get(key, defaultValue);
      // };

      // WrappedComponent.actions = this.store.actions;
    }

    componentDidMount() {
      this.shouldUpdate = true;
    }

    componentWillUnmount() {
      this.shouldUpdate = false;
    }

    updateHandler() {
      if (this.shouldUpdate) { this.forceUpdate(); };
    }

    render() {
      return <WrappedComponent {...this.props} {...this.propsToStore} actions={this.store.actions} store={this.storeGetter} />;
    }
  }

  // Use https://github.com/mridgway/hoist-non-react-statics/blob/master/index.js
  Wrapper.preload = WrappedComponent.preload;

  return Wrapper;
}
