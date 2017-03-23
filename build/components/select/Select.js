'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get2 = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Base = require('../base/Base');

var _choices = require('choices.js');

var _choices2 = _interopRequireDefault(_choices);

var _formio = require('../../formio');

var _formio2 = _interopRequireDefault(_formio);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _get3 = require('lodash/get');

var _get4 = _interopRequireDefault(_get3);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectComponent = exports.SelectComponent = function (_BaseComponent) {
  _inherits(SelectComponent, _BaseComponent);

  function SelectComponent() {
    _classCallCheck(this, SelectComponent);

    return _possibleConstructorReturn(this, (SelectComponent.__proto__ || Object.getPrototypeOf(SelectComponent)).apply(this, arguments));
  }

  _createClass(SelectComponent, [{
    key: 'elementInfo',
    value: function elementInfo() {
      var info = _get2(SelectComponent.prototype.__proto__ || Object.getPrototypeOf(SelectComponent.prototype), 'elementInfo', this).call(this);
      info.type = 'select';
      info.changeEvent = 'change';
      return info;
    }
  }, {
    key: 'createWrapper',
    value: function createWrapper() {
      return false;
    }
  }, {
    key: 'itemTemplate',
    value: function itemTemplate(data) {
      return this.component.template ? this.interpolate(this.component.template, { item: data }) : data.label;
    }
  }, {
    key: 'itemValue',
    value: function itemValue(data) {
      return this.component.valueProperty ? (0, _get4.default)(data, this.component.valueProperty) : data;
    }
  }, {
    key: 'setItems',
    value: function setItems(items) {
      var _this2 = this;

      if (!this.choices) {
        return;
      }
      this.choices._clearChoices();
      (0, _each3.default)(items, function (item) {
        _this2.choices._addChoice(false, false, _this2.itemValue(item), _this2.itemTemplate(item));
      });
      if (this.value) {
        this.setValue(this.value, true);
      }
    }
  }, {
    key: 'loadItems',
    value: function loadItems(url, input, headers, options) {
      var _this3 = this;

      var query = {
        limit: 100,
        skip: 0
      };

      // Allow for url interpolation.
      url = this.interpolate(url, {
        data: this.data,
        formioBase: _formio2.default.getBaseUrl()
      });

      // Add search capability.
      if (this.component.searchField && input) {
        query[this.component.searchField] = input;
      }

      // Add filter capability
      if (this.component.filter) {
        var filter = this.interpolate(this.component.filter, { data: this.data });
        url += (url.indexOf('?') === -1 ? '?' : '&') + filter;
      }

      // If they wish to return only some fields.
      if (this.component.selectFields) {
        query.select = this.component.selectFields;
      }

      // Add the query string.
      url += '?' + _formio2.default.serialize(query);

      // Make the request.
      _formio2.default.request(url, null, null, headers, options).then(function (response) {
        return _this3.setItems(response);
      });
    }
  }, {
    key: 'updateItems',
    value: function updateItems() {
      switch (this.component.dataSrc) {
        case 'values':
          this.component.valueProperty = 'value';
          this.setItems(this.component.data.values);
          break;
        case 'json':
          try {
            this.setItems(JSON.parse(this.component.data.json));
          } catch (error) {
            console.log(error);
          }
          break;
        case 'resource':
          this.loadItems(_formio2.default.getAppUrl() + '/form/' + this.component.data.resource + '/submission');
          break;
        case 'url':
          this.loadItems(this.component.data.url, null, new Headers(), {
            noToken: true
          });
          break;
      }
    }
  }, {
    key: 'addInput',
    value: function addInput(input, container) {
      _get2(SelectComponent.prototype.__proto__ || Object.getPrototypeOf(SelectComponent.prototype), 'addInput', this).call(this, input, container, true);
      if (this.component.multiple) {
        input.setAttribute('multiple', true);
      }
      var self = this;
      this.choices = new _choices2.default(input, {
        placeholder: !!this.component.placeholder,
        placeholderValue: this.component.placeholder,
        removeItemButton: true,
        classNames: {
          containerOuter: 'choices form-group formio-choices',
          containerInner: 'form-control'
        }
      });
      if (this.disabled) {
        this.choices.disable();
      }
      this.updateItems();
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.choices.getValue(true);
    }
  }, {
    key: 'setValue',
    value: function setValue(value, noUpdate, noValidate) {
      this.value = value;
      if (value && this.choices) {
        if (this.choices.store) {
          // Search for the choice.
          var choices = this.choices.store.getChoices();
          var foundChoice = choices.find(function (choice) {
            return choice.value === value;
          });

          // If it is not found, then add it.
          if (!foundChoice) {
            this.choices._addChoice(false, false, this.itemValue(value), this.itemTemplate(value));
          }
        }

        // Now set the value.
        this.choices.setValueByChoice((0, _isArray3.default)(value) ? this.itemValue(value) : [this.itemValue(value)]);
      }
      if (!noUpdate) {
        this.updateValue(noValidate);
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.choices) {
        this.choices.destroy();
      }
    }
  }, {
    key: 'disable',
    set: function set(disable) {
      _set(SelectComponent.prototype.__proto__ || Object.getPrototypeOf(SelectComponent.prototype), 'disable', disable, this);
      if (!this.choices) {
        return;
      }
      if (disable) {
        this.choices.disable();
      } else {
        this.choices.enable();
      }
    }
  }]);

  return SelectComponent;
}(_Base.BaseComponent);