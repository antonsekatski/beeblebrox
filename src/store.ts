export interface State {
  [index: string]: any
}

export interface Subscriptions {
  [index: string]: (() => void)[]
}

export interface TTL {
  [index: string]: number
}

export interface Versions {
  [index: string]: number
}

export interface Actions {
  [index: string]: any
}

export interface ReactProps {
  store: (key: string, defaultValue?: any) => any
  // cache: (args: { key: string, block: (value: any) => any }) => any
  actions: Actions
}

export default class Store {
  state: State = {}
  ttl: TTL = {}
  versions: Versions = {}
  subscriptions: Subscriptions = {}
  actions = {}
  stateContext: StateContext

  // Can't add new keys or change type, only existing in the initial state
  strict: boolean = false

  debug: boolean = true

  constructor({ state = {}, actions = {} }) {
    this.state = state

    this.stateContext = new StateContext(this.state, this.ttl, this.notify.bind(this))

    this.actions = makeActions(this.stateContext, actions)
  }

  dump() {
    return {
      state: this.state
    }
  }

  subscribe(key: string, handler: () => void): void {
    if (!this.subscriptions.hasOwnProperty(key)) this.subscriptions[key] = []
    this.subscriptions[key].push(handler)
  }

  notify(key: string): void {
    (this.subscriptions[key] || []).forEach(handler => handler())
    this.versions[key] = (this.versions[key] || 0) + 1
    if (this.debug) console.log(key, this.state[key])
  }

  preload(renderProps, req): Promise<{}> {
    return Promise.all(
      renderProps.components
      .filter(component => component && component.preload)
      .reduce((prev, component) => {
        prev.push(new Promise(resolve => {
          component.preload.bind(this.actions)(renderProps.params, req)
          resolve()
        }))
      }, [])
    )
  }
}

export class StateContext {
  // private store: Store

  private state: State
  private ttl: TTL
  private notify: (key: string) => void

  list = <{
    push<T>(key: string, value: T): void
    exists<T>(key: string, callback: (value: T) => boolean): boolean
    remove<T>(key: string, callback: (value: T) => boolean): boolean
  }>{}

  constructor(state: State, ttl: TTL, notify: (key: string) => void) {
    this.state = state
    this.notify = notify

    this.list.push = listPush.bind(this)
    this.list.exists = listExists.bind(this)
    this.list.remove = listRemove.bind(this)
  }

  set<T>(key: string, value: T) {
    this.state[key] = value
    this.notify(key)
  }

  setex<T>(key: string, value: T, ttl: number) {
    this.state[key] = value
    this.ttl[key] = ttl
    this.notify(key)
  }

  get<T>(key: string, defaultValue?: any): T {
    if (!this.state.hasOwnProperty(key)) {
      return defaultValue
    }
    return this.state[key]
  }

  del(key: string) {
    const value = this.state[key]
    delete this.state[key]
    this.notify(key)
    return value
  }
}

function makeActions(stateContext: StateContext, values): any {
  const actions = {}

  Object.keys(values).forEach(key => {
    if (typeof values[key] === 'object') {
      actions[key] = makeActions(stateContext, values[key])
    } else if (typeof values[key] === 'function') {
      actions[key] = (...args) => {
        return new Promise((resolve) => {
          const returnedValue = values[key].bind(stateContext)(...args)
          resolve(returnedValue)
        })
      }
    }
  })

  return actions
}

function listPush<T>(key: string, value: T) {
  if (!(this.state[key] instanceof Array)) this.state[key] = []

  this.state[key].push(value)
  this.notify(key)
}

function listExists<T>(key: string, callback: (value: T) => boolean): boolean {
  if (!(this.state[key] instanceof Array)) return false

  return this.state[key].some(value => {
    if (callback(value)) return true
  })
}

function listRemove<T>(key: string, callback: (value: T) => boolean): boolean {
  if (!(this.state[key] instanceof Array)) return false

  return this.state[key].some((value, index) => {
    if (callback(value)) {
      this.state[key].splice(index, 1)
      this.notify(key)
      return true
    }
  })
}
