import ActionContext from './action_context';

export default class Store {
  state: { [index: string]: any } = {};
  ttl: { [index: string]: number } = {};
  subscriptions: { [index: string]: Array<() => void> } = {};
  actions = {};
  actionContext: ActionContext;

  timers: { [index: number]: any } = {};

  // Can't add new keys or change type, only existing in the initial state
  // strict: boolean = false;

  // debug: boolean = true;

  constructor({ state = {}, actions = {} }) {
    this.state = state;

    this.actionContext = new ActionContext(this);

    this.actions = makeActions(this.actionContext, actions);
  }

  dump() {
    return {
      ttl: this.ttl,
      state: this.state,
    };
  }

  subscribe(key: string, handler: () => void): void {
    if (!this.subscriptions.hasOwnProperty(key)) { this.subscriptions[key] = []; }
    this.subscriptions[key].push(handler);
  }

  setTimer(key: string, ttl: number): void {
    this.ttl[key] = ttl;
    this.timers[key] = setTimeout(() => {
      clearTimeout(this.timers[key]);
      delete this.timers[key];
      delete this.ttl[key];
      this.actionContext.del(key);
    }, ttl * 1000); // ttl in seconds
  }

  notify(key: string): void {
    (this.subscriptions[key] || []).forEach((handler) => handler());
  }

  preload({ location, renderProps, req }): Promise<{}> {
    return Promise.all(
      renderProps.components
      .filter((component) => component && component.preload)
      .reduce((accum, component) => {
        const fn = component.preload.bind(this.actions);
        accum.push(fn({ location, params: renderProps.params, req }));
        return accum;
      }, []),
    );
  }
}

function makeActions(actionContext: ActionContext, values): any {
  const actions = {};

  Object.keys(values).forEach((key) => {
    if (typeof values[key] === 'object') {
      actions[key] = makeActions(actionContext, values[key]);
    } else if (typeof values[key] === 'function') {
      actions[key] = values[key].bind(actionContext);
    }
  });

  return actions;
}

// function createAction(fn) {
//   // No need to create a Promise here
//   // if (fn.constructor.name === 'AsyncFunction') {
//   //   return fn;
//   // }
//   return (...args) => new Promise((resolve) => {
//     resolve(fn(...args));
//   });
// }