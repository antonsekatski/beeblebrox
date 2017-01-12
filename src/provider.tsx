import * as React from 'react'

import Store from './store'

export interface ProviderProps {
  store: Store
}

export default class Provider extends React.Component<ProviderProps, any> {
  private store: Store

  constructor(props: ProviderProps, context: any) {
    super(props, context)
    this.store = props.store
  }

  static childContextTypes = {
    store: React.PropTypes.object
  }

  getChildContext() {
    return { store: this.store }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
