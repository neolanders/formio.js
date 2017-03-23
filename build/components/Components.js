'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormioComponents = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _clone2 = require('lodash/clone');

var _clone3 = _interopRequireDefault(_clone2);

var _remove2 = require('lodash/remove');

var _remove3 = _interopRequireDefault(_remove2);

var _nativePromiseOnly = require('native-promise-only');

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _Base = require('./base/Base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormioComponents = exports.FormioComponents = function (_BaseComponent) {
  _inherits(FormioComponents, _BaseComponent);

  function FormioComponents(component, options, data) {
    _classCallCheck(this, FormioComponents);

    var _this = _possibleConstructorReturn(this, (FormioComponents.__proto__ || Object.getPrototypeOf(FormioComponents)).call(this, component, options, data));

    _this.type = 'components';
    _this.components = [];
    _this.hidden = [];
    return _this;
  }

  _createClass(FormioComponents, [{
    key: 'build',
    value: function build() {
      this.createElement();
      this.addComponents();
    }
  }, {
    key: 'everyComponent',
    value: function everyComponent(cb) {
      var _this2 = this;

      (0, _each3.default)(this.components, function (component) {
        if (component.type === 'components') {
          if (component.everyComponent(cb) === false) {
            return false;
          }
        } else if (cb(component, _this2.components) === false) {
          return false;
        }
      });
    }
  }, {
    key: 'eachComponent',
    value: function eachComponent(cb) {
      (0, _each3.default)(this.components, function (component) {
        if (cb(component) === false) {
          return false;
        }
      });
    }
  }, {
    key: 'getComponent',
    value: function getComponent(key, cb) {
      var comp = null;
      this.everyComponent(function (component, components) {
        if (component.component.key === key) {
          comp = component;
          if (cb) {
            cb(component, components);
          }
          return false;
        }
      });
      return comp;
    }
  }, {
    key: 'getComponentById',
    value: function getComponentById(id, cb) {
      var comp = null;
      this.everyComponent(function (component, components) {
        if (component.id === id) {
          comp = component;
          if (cb) {
            cb(component, components);
          }
          return false;
        }
      });
      return comp;
    }
  }, {
    key: 'addComponent',
    value: function addComponent(component, element, data) {
      element = element || this.element;
      data = data || this.data;
      var components = require('./index');
      var comp = components.create(component, this.options, data);
      this.components.push(comp);
      this.setHidden(comp);
      element.appendChild(comp.getElement());
      return comp;
    }
  }, {
    key: 'removeComponent',
    value: function removeComponent(component, components) {
      component.destroy();
      var element = component.getElement();
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      (0, _remove3.default)(components, { id: component.id });
    }
  }, {
    key: 'removeComponentByKey',
    value: function removeComponentByKey(key, cb) {
      var _this3 = this;

      var comp = this.getComponent(key, function (component, components) {
        _this3.removeComponent(component, components);
        if (cb) {
          cb(component, components);
        }
      });
      if (!comp) {
        if (cb) {
          cb(null);
        }
        return null;
      }
    }
  }, {
    key: 'removeComponentById',
    value: function removeComponentById(id, cb) {
      var _this4 = this;

      var comp = this.getComponentById(id, function (component, components) {
        _this4.removeComponent(component, components);
        if (cb) {
          cb(component, components);
        }
      });
      if (!comp) {
        if (cb) {
          cb(null);
        }
        return null;
      }
    }
  }, {
    key: 'addComponents',
    value: function addComponents(element, data) {
      var _this5 = this;

      element = element || this.element;
      data = data || this.data;
      (0, _each3.default)(this.component.components, function (component) {
        return _this5.addComponent(component, element, data);
      });
    }
  }, {
    key: 'checkConditions',
    value: function checkConditions(data) {
      _get(FormioComponents.prototype.__proto__ || Object.getPrototypeOf(FormioComponents.prototype), 'checkConditions', this).call(this, data);
      (0, _each3.default)(this.components, function (comp) {
        return comp.checkConditions(data);
      });
    }
  }, {
    key: 'destroy',
    value: function destroy(all) {
      var _this6 = this;

      _get(FormioComponents.prototype.__proto__ || Object.getPrototypeOf(FormioComponents.prototype), 'destroy', this).call(this, all);
      var components = (0, _clone3.default)(this.components);
      (0, _each3.default)(components, function (comp) {
        return _this6.removeComponent(comp, _this6.components);
      });
    }
  }, {
    key: 'setHidden',
    value: function setHidden(component) {
      if (component.components && component.components.length) {
        component.hideComponents(this.hidden);
      } else {
        component.visible = !this.hidden || this.hidden.indexOf(component.component.key) === -1;
      }
    }
  }, {
    key: 'hideComponents',
    value: function hideComponents(hidden) {
      var _this7 = this;

      this.hidden = hidden;
      this.eachComponent(function (component) {
        return _this7.setHidden(component);
      });
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.data;
    }
  }, {
    key: 'setValue',
    value: function setValue(value, noUpdate, noValidate) {
      if (!value) {
        return;
      }
      this.value = value;
      (0, _each3.default)(this.components, function (component) {
        if (component.input || component.type === 'button') {
          return;
        }

        if (component.type === 'components') {
          component.setValue(value, noUpdate, noValidate);
        } else if (value && value.hasOwnProperty(component.component.key)) {
          component.setValue(value[component.component.key], noUpdate);
        } else {
          component.setValue(null, noUpdate, true);
        }
      });
    }
  }, {
    key: 'disable',
    set: function set(disable) {
      (0, _each3.default)(this.components, function (component) {
        return component.disable = disable;
      });
    }
  }, {
    key: 'errors',
    get: function get() {
      var errors = [];
      (0, _each3.default)(this.components, function (comp) {
        var compErrors = comp.errors;
        if (compErrors.length) {
          errors = errors.concat(compErrors);
        }
      });
      return errors;
    }
  }]);

  return FormioComponents;
}(_Base.BaseComponent);