"use strict";
var Store = (function () {
    function Store(_a) {
        var _b = _a.state, state = _b === void 0 ? {} : _b, _c = _a.actions, actions = _c === void 0 ? {} : _c;
        this.state = {};
        this.ttl = {};
        this.versions = {};
        this.subscriptions = {};
        this.actions = {};
        // Can't add new keys or change type, only existing in the initial state
        this.strict = false;
        this.debug = true;
        this.state = state;
        this.stateContext = new StateContext(this.state, this.ttl, this.notify.bind(this));
        this.actions = makeActions(this.stateContext, actions);
    }
    Store.prototype.dump = function () {
        return {
            state: this.state
        };
    };
    Store.prototype.subscribe = function (key, handler) {
        if (!this.subscriptions.hasOwnProperty(key))
            this.subscriptions[key] = [];
        this.subscriptions[key].push(handler);
    };
    Store.prototype.notify = function (key) {
        (this.subscriptions[key] || []).forEach(function (handler) { return handler(); });
        this.versions[key] = (this.versions[key] || 0) + 1;
        if (this.debug)
            console.log(key, this.state[key]);
    };
    Store.prototype.preload = function (renderProps, req) {
        var _this = this;
        return Promise.all(renderProps.components
            .filter(function (component) { return component && component.preload; })
            .reduce(function (prev, component) {
            prev.push(new Promise(function (resolve) {
                component.preload.bind(_this.actions)(renderProps.params, req);
                resolve();
            }));
        }, []));
    };
    return Store;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Store;
var StateContext = (function () {
    function StateContext(state, ttl, notify) {
        this.list = {};
        this.state = state;
        this.notify = notify;
        this.list.push = listPush.bind(this);
        this.list.exists = listExists.bind(this);
        this.list.remove = listRemove.bind(this);
    }
    StateContext.prototype.set = function (key, value) {
        this.state[key] = value;
        this.notify(key);
    };
    StateContext.prototype.setex = function (key, value, ttl) {
        this.state[key] = value;
        this.ttl[key] = ttl;
        this.notify(key);
    };
    StateContext.prototype.get = function (key, defaultValue) {
        if (!this.state.hasOwnProperty(key)) {
            return defaultValue;
        }
        return this.state[key];
    };
    StateContext.prototype.del = function (key) {
        var value = this.state[key];
        delete this.state[key];
        this.notify(key);
        return value;
    };
    return StateContext;
}());
exports.StateContext = StateContext;
function makeActions(stateContext, values) {
    var actions = {};
    Object.keys(values).forEach(function (key) {
        if (typeof values[key] === 'object') {
            actions[key] = makeActions(stateContext, values[key]);
        }
        else if (typeof values[key] === 'function') {
            actions[key] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new Promise(function (resolve) {
                    var returnedValue = values[key].bind(stateContext).apply(void 0, args);
                    resolve(returnedValue);
                });
            };
        }
    });
    return actions;
}
function listPush(key, value) {
    if (!(this.state[key] instanceof Array))
        this.state[key] = [];
    this.state[key].push(value);
    this.notify(key);
}
function listExists(key, callback) {
    if (!(this.state[key] instanceof Array))
        return false;
    return this.state[key].some(function (value) {
        if (callback(value))
            return true;
    });
}
function listRemove(key, callback) {
    var _this = this;
    if (!(this.state[key] instanceof Array))
        return false;
    return this.state[key].some(function (value, index) {
        if (callback(value)) {
            _this.state[key].splice(index, 1);
            _this.notify(key);
            return true;
        }
    });
}
