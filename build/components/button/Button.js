'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Base = require('../base/Base');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ButtonComponent = exports.ButtonComponent = function (_BaseComponent) {
  _inherits(ButtonComponent, _BaseComponent);

  function ButtonComponent() {
    _classCallCheck(this, ButtonComponent);

    return _possibleConstructorReturn(this, (ButtonComponent.__proto__ || Object.getPrototypeOf(ButtonComponent)).apply(this, arguments));
  }

  _createClass(ButtonComponent, [{
    key: 'elementInfo',
    value: function elementInfo() {
      var info = _get(ButtonComponent.prototype.__proto__ || Object.getPrototypeOf(ButtonComponent.prototype), 'elementInfo', this).call(this);
      info.type = 'button';
      info.attr.type = this.component.action;
      info.attr.class = 'btn btn-' + this.component.theme;
      if (this.component.block) {
        info.attr.class += ' btn-block';
      }
      return info;
    }
  }, {
    key: 'build',
    value: function build() {
      var _this2 = this;

      this.element = this.ce('element', this.info.type, this.info.attr);
      if (this.component.label) {
        this.label = this.text(this.component.label);
        this.element.appendChild(this.label);
      }
      this.on('submit', function () {
        _this2.loading = false;
        _this2.element.disable = false;
      }, true);
      this.on('error', function () {
        _this2.loading = false;
      }, true);
      this.addEventListener(this.element, 'click', function (event) {
        switch (_this2.component.action) {
          case 'submit':
            _this2.loading = true;
            _this2.element.disable = true;
            event.preventDefault();
            event.stopPropagation();
            _this2.emit('submitButton');
            break;
          case 'event':
            _this2.events.emit(_this2.component.event, _this2.data);
            break;
          case 'reset':
            _this2.emit('resetForm');
            break;
          case 'oauth':
            console.log('OAuth currently not supported.');
            break;
        }
      });
    }
  }, {
    key: 'loading',
    set: function set(loading) {
      this._loading = loading;
      if (!this.loader && loading) {
        this.loader = this.ce('buttonLoader', 'i', {
          class: 'glyphicon glyphicon-refresh glyphicon-spin button-icon-right'
        });
      }
      if (this.loader) {
        if (loading) {
          this.element.appendChild(this.loader);
        } else {
          this.element.removeChild(this.loader);
        }
      }
    }
  }]);

  return ButtonComponent;
}(_Base.BaseComponent);