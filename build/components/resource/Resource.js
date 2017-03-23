'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResourceComponent = undefined;

var _Select = require('../select/Select');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResourceComponent = exports.ResourceComponent = function (_SelectComponent) {
  _inherits(ResourceComponent, _SelectComponent);

  function ResourceComponent(component, options, data) {
    _classCallCheck(this, ResourceComponent);

    var _this = _possibleConstructorReturn(this, (ResourceComponent.__proto__ || Object.getPrototypeOf(ResourceComponent)).call(this, component, options, data));

    _this.component.dataSrc = 'resource';
    _this.component.data = {
      resource: _this.component.resource
    };
    return _this;
  }

  return ResourceComponent;
}(_Select.SelectComponent);