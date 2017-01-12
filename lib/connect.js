"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require("react");
// export interface Getter {
//   (key: string, defaultValue?: any): any
// }
function connect(WrappedComponent) {
    return _a = (function (_super) {
            __extends(Wrapper, _super);
            function Wrapper(props, context) {
                var _this = _super.call(this, props, context) || this;
                _this.lastVersions = {};
                _this.shouldUpdate = false;
                _this.propsToStore = {};
                var self = _this;
                _this.store = context.store;
                _this.updateHandler = _this.updateHandler.bind(_this);
                if (WrappedComponent.mapPropsToStore && typeof WrappedComponent.mapPropsToStore === 'function') {
                    var props_1 = WrappedComponent.mapPropsToStore();
                    var _loop_1 = function (prop) {
                        Object.defineProperty(this_1.propsToStore, prop, {
                            enumerable: true,
                            get: function () {
                                return self.storeGetter(props_1[prop]);
                            }
                        });
                    };
                    var this_1 = this;
                    for (var prop in props_1) {
                        _loop_1(prop);
                    }
                }
                _this.storeGetter = function (key, defaultValue) {
                    // Subscribe if we haven't already
                    if (!_this.lastVersions.hasOwnProperty(key)) {
                        _this.store.subscribe(key, _this.updateHandler);
                    }
                    // Save last version
                    _this.lastVersions[key] = _this.store.versions[key];
                    return _this.store.stateContext.get(key, defaultValue);
                };
                return _this;
            }
            Wrapper.prototype.componentDidMount = function () {
                this.shouldUpdate = true;
            };
            Wrapper.prototype.componentWillUnmount = function () {
                this.shouldUpdate = false;
            };
            Wrapper.prototype.updateHandler = function () {
                if (this.shouldUpdate)
                    this.forceUpdate();
            };
            Wrapper.prototype.render = function () {
                return React.createElement(WrappedComponent, __assign({}, this.props, this.propsToStore, { store: this.storeGetter, actions: this.store.actions }));
            };
            return Wrapper;
        }(React.Component)),
        // DO NOT FORGET THIS OR ELSE BUSTED
        _a.contextTypes = {
            store: React.PropTypes.object.isRequired
        },
        _a;
    var _a;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connect;
