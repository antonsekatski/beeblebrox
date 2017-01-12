"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Provider = (function (_super) {
    __extends(Provider, _super);
    function Provider(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.store = props.store;
        return _this;
    }
    Provider.prototype.getChildContext = function () {
        return { store: this.store };
    };
    Provider.prototype.render = function () {
        return React.Children.only(this.props.children);
    };
    return Provider;
}(React.Component));
Provider.childContextTypes = {
    store: React.PropTypes.object
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Provider;
