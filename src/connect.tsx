import * as React from 'react'
// import hoistStatics from 'hoist-non-react-statics'

import Store from './store'

// export interface Getter {
//   (key: string, defaultValue?: any): any
// }

export default function connect(WrappedComponent): any {
  return class Wrapper extends React.Component<any, any> {
    lastVersions: Object = {}
    store: Store
    storeGetter: (this: Wrapper, key: string, defaultValue?: any) => any
    shouldUpdate: boolean = false

    propsToStore = {}

    // DO NOT FORGET THIS OR ELSE BUSTED
    static contextTypes = {
      store: React.PropTypes.object.isRequired
    }

    constructor(props, context) {
      super(props, context)

      const self = this;

      this.store = context.store

      this.updateHandler = this.updateHandler.bind(this)

      if (WrappedComponent.mapPropsToStore && typeof WrappedComponent.mapPropsToStore === 'function') {
        const props = WrappedComponent.mapPropsToStore()

        for(const prop in props) {
          Object.defineProperty(this.propsToStore, prop, {
            enumerable: true,
            get() {
              return self.storeGetter(props[prop]);
            }
          })
        }
      }

      this.storeGetter = (key: string, defaultValue?: any) => {
        // Subscribe if we haven't already
        if (!this.lastVersions.hasOwnProperty(key)) {
          this.store.subscribe(key, this.updateHandler)
        }

        // Save last version
        this.lastVersions[key] = this.store.versions[key]

        return this.store.stateContext.get(key, defaultValue)
      }
    }

    componentDidMount() {
      this.shouldUpdate = true
    }

    componentWillUnmount() {
      this.shouldUpdate = false
    }

    updateHandler() {
      if (this.shouldUpdate) this.forceUpdate()
    }

    render() {
      return <WrappedComponent {...this.props} {...this.propsToStore} store={this.storeGetter} actions={this.store.actions} />
    }
  }
}
