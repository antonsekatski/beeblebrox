import { default as Store } from './store';

export default class ActionContext {
  private store: Store;

  list = {} as {
    push<T>(key: string, value: T): void;
    exists<T>(key: string, callback: (value: T) => boolean): boolean;
    remove<T>(key: string, callback: (value: T) => boolean): boolean;
  };

  constructor(store: Store) {
    this.store = store;

    this.list.push = listPush.bind(this);
    this.list.exists = listExists.bind(this);
    this.list.remove = listRemove.bind(this);
  }

  set<T>(key: string, value: T) {
    this.store.state[key] = value;
    this.store.notify(key);
  }

  setex<T>(key: string, value: T, ttl: number) {
    this.store.state[key] = value;
    this.store.setTimer(key, ttl);
    this.store.notify(key);
  }

  get<T>(key: string, defaultValue?: any): T {
    if (!this.store.state.hasOwnProperty(key)) {
      return defaultValue;
    }
    return this.store.state[key];
  }

  del(key: string) {
    const value = this.store.state[key];
    delete this.store.state[key];
    this.store.notify(key);
    return value;
  }
}

function listPush<T>(key: string, value: T) {
  if (!(this.store.state[key] instanceof Array)) { this.store.state[key] = []; }

  this.store.state[key].push(value);
  this.store.notify(key);
}

function listExists<T>(key: string, callback: (value: T) => boolean): boolean {
  if (!(this.store.state[key] instanceof Array)) { return false; }

  return this.store.state[key].some((value) => {
    if (callback(value)) { return true; }
  });
}

function listRemove<T>(key: string, callback: (value: T) => boolean): boolean {
  if (!(this.store.state[key] instanceof Array)) { return false; }

  return this.store.state[key].some((value, index) => {
    if (callback(value)) {
      this.store.state[key].splice(index, 1);
      this.store.notify(key);
      return true;
    }
  });
}