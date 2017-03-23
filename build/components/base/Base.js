'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vanilla = require('text-mask-all/vanilla');

var _vanilla2 = _interopRequireDefault(_vanilla);

var _nativePromiseOnly = require('native-promise-only');

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _debounce2 = require('lodash/debounce');

var _debounce3 = _interopRequireDefault(_debounce2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _assign2 = require('lodash/assign');

var _assign3 = _interopRequireDefault(_assign2);

var _clone2 = require('lodash/clone');

var _clone3 = _interopRequireDefault(_clone2);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

var _Validator = require('../Validator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_i18next2.default.initialized = false;

var BaseComponent = function () {
  /**
   *   Initialize a new BaseComponent.
   */
  function BaseComponent(component, options, data) {
    _classCallCheck(this, BaseComponent);

    this.id = component && component.id ? component.id : Math.random().toString(36).substring(7);
    this.options = (0, _clone3.default)(options) || {};
    this.options.i18n = this.options.i18n || require('../../locals/en');
    this.events = this.options.events;
    this.data = data || {};
    this.component = component || {};
    this.element = null;
    this.tbody = null;
    this.label = null;
    this.errorElement = null;
    this.error = '';
    this.inputs = [];
    this.info = null;
    this.value = null;
    this.disabled = false;
    this.inputMask = null;
    this.options.name = this.options.name || 'data';
    this.validators = ['required', 'minLength', 'maxLength', 'custom'];
    this.triggerChange = (0, _debounce3.default)(this.onChange.bind(this), 200);
    this.eventHandlers = [];
    this.eventListeners = [];
    if (this.component) {
      this.type = this.component.type;
      if (this.component.input && this.component.key) {
        this.options.name += '[' + this.component.key + ']';
      }
      this.info = this.elementInfo();
    }
  }

  _createClass(BaseComponent, [{
    key: 't',
    value: function t(text, params) {
      var message = _i18next2.default.t(text, params);
      return message;
    }
  }, {
    key: 'on',
    value: function on(event, cb, internal) {
      if (!this.events) {
        return;
      }
      var type = 'formio.' + event;
      this.eventListeners.push({
        type: type,
        listener: cb,
        internal: internal
      });
      return this.events.on(type, cb);
    }
  }, {
    key: 'emit',
    value: function emit(event, data) {
      this.events.emit('formio.' + event, data);
    }
  }, {
    key: 'getIcon',
    value: function getIcon(name) {
      return this.ce(name + 'Icon', 'i', {
        class: 'glyphicon glyphicon-' + name
      });
    }
  }, {
    key: 'localize',
    value: function localize() {
      var _this = this;

      if (_i18next2.default.initialized) {
        return _nativePromiseOnly2.default.resolve(_i18next2.default);
      }
      _i18next2.default.initialized = true;
      return new _nativePromiseOnly2.default(function (resolve, reject) {
        _i18next2.default.init(_this.options.i18n, function (err, t) {
          if (err) {
            return reject(err);
          }
          resolve(_i18next2.default);
        });
      });
    }

    /**
     * Builds the component.
     */

  }, {
    key: 'build',
    value: function build() {
      this.createElement();
      this.createLabel(this.element);
      if (!this.createWrapper()) {
        this.createInput(this.element);
      }
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }, {
    key: 'createElement',
    value: function createElement() {
      this.element = this.ce('element', 'div', {
        id: this.id,
        class: this.className
      });

      if (this.element) {
        // Ensure you can get the component info from the element.
        this.element.component = this.component;
      }

      return this.element;
    }
  }, {
    key: 'createWrapper',
    value: function createWrapper() {
      if (!this.component.multiple) {
        return false;
      } else {
        var table = this.ce('wrapper', 'table', {
          class: 'table table-bordered'
        });
        this.tbody = this.ce('wrapperBody', 'tbody');
        table.appendChild(this.tbody);

        // Add a default value.
        if (!this.data[this.component.key] || !this.data[this.component.key].length) {
          this.addNewValue();
        }

        // Build the rows.
        this.buildRows();

        // Add the table to the element.
        this.append(table);
        return true;
      }
    }
  }, {
    key: 'defaultValue',
    value: function defaultValue() {
      if (this.component.defaultValue) {
        return this.component.defaultValue;
      }
      return '';
    }
  }, {
    key: 'addNewValue',
    value: function addNewValue() {
      if (!this.data[this.component.key]) {
        this.data[this.component.key] = [];
      }
      if (!(0, _isArray3.default)(this.data[this.component.key])) {
        this.data[this.component.key] = [this.data[this.component.key]];
      }
      this.data[this.component.key].push(this.defaultValue());
    }
  }, {
    key: 'addValue',
    value: function addValue() {
      this.addNewValue();
      this.buildRows();
    }
  }, {
    key: 'removeValue',
    value: function removeValue(index) {
      if (this.data.hasOwnProperty(this.component.key)) {
        this.data[this.component.key].splice(index, 1);
      }
      this.buildRows();
    }
  }, {
    key: 'buildRows',
    value: function buildRows() {
      var _this2 = this;

      if (!this.tbody) {
        return;
      }
      this.inputs = [];
      this.tbody.innerHTML = '';
      (0, _each3.default)(this.data[this.component.key], function (value, index) {
        var tr = _this2.ce('row', 'tr');
        var td = _this2.ce('column', 'td');
        _this2.createInput(td);
        tr.appendChild(td);
        var tdAdd = _this2.ce('columnAdd', 'td');
        tdAdd.appendChild(_this2.removeButton(index));
        tr.appendChild(tdAdd);
        _this2.tbody.appendChild(tr);
      });

      var tr = this.ce('rowAdd', 'tr');
      var td = this.ce('addRowColumn', 'td', {
        colspan: '2'
      });
      td.appendChild(this.addButton());
      tr.appendChild(td);
      this.tbody.appendChild(tr);
    }
  }, {
    key: 'addButton',
    value: function addButton() {
      var _this3 = this;

      var addButton = this.ce('addButton', 'a', {
        class: 'btn btn-primary'
      });
      this.addEventListener(addButton, 'click', function (event) {
        event.preventDefault();
        _this3.addValue();
      });

      var addIcon = this.ce('addIcon', 'span', {
        class: 'glyphicon glyphicon-plus'
      });
      addButton.appendChild(addIcon);
      addButton.appendChild(this.text(this.component.addAnother || ' Add Another'));
      return addButton;
    }
  }, {
    key: 'removeButton',
    value: function removeButton(index) {
      var _this4 = this;

      var removeButton = this.ce('removeButton', 'button', {
        type: 'button',
        class: 'btn btn-default',
        tabindex: '-1'
      });

      this.addEventListener(removeButton, 'click', function (event) {
        event.preventDefault();
        _this4.removeValue(index);
      });

      var removeIcon = this.ce('removeIcon', 'span', {
        class: 'glyphicon glyphicon-remove-circle'
      });
      removeButton.appendChild(removeIcon);
      return removeButton;
    }
  }, {
    key: 'createLabel',
    value: function createLabel(container) {
      if (!this.component.label || this.options.inputsOnly) {
        return;
      }
      this.label = this.ce('label', 'label', {
        class: 'control-label'
      });
      if (this.info.attr.id) {
        this.label.setAttribute('for', this.info.attr.id);
      }
      this.label.appendChild(this.text(this.component.label));
      container.appendChild(this.label);
    }
  }, {
    key: 'createErrorElement',
    value: function createErrorElement() {
      if (!this.errorContainer) {
        return;
      }
      this.errorElement = this.ce('errors', 'div', {
        class: 'formio-errors'
      });
      this.errorContainer.appendChild(this.errorElement);
    }
  }, {
    key: 'addPrefix',
    value: function addPrefix(input, inputGroup) {
      var prefix = null;
      if (this.component.prefix) {
        prefix = this.ce('prefix', 'div', {
          class: 'input-group-addon'
        });
        prefix.appendChild(this.text(this.component.prefix));
        inputGroup.appendChild(prefix);
      }
      return prefix;
    }
  }, {
    key: 'addSuffix',
    value: function addSuffix(input, inputGroup) {
      var suffix = null;
      if (this.component.suffix) {
        suffix = this.ce('suffix', 'div', {
          class: 'input-group-addon'
        });
        suffix.appendChild(this.text(this.component.suffix));
        inputGroup.appendChild(suffix);
      }
      return suffix;
    }
  }, {
    key: 'addInputGroup',
    value: function addInputGroup(input, container) {
      var inputGroup = null;
      if (this.component.prefix || this.component.suffix) {
        inputGroup = this.ce('inputGroup', 'div', {
          class: 'input-group'
        });
        container.appendChild(inputGroup);
      }
      return inputGroup;
    }
  }, {
    key: 'getInputMask',
    value: function getInputMask(mask) {
      if (mask instanceof Array) {
        return mask;
      }
      var maskArray = [];
      for (var i = 0; i < mask.length; i++) {
        switch (mask[i]) {
          case '9':
            maskArray.push(/\d/);
            break;
          case 'A':
            maskArray.push(/[a-zA-Z]/);
            break;
          case '*':
            maskArray.push(/[a-zA-Z0-9]/);
            break;
          default:
            maskArray.push(mask[i]);
            break;
        }
      }
      return maskArray;
    }
  }, {
    key: 'maskPlaceholder',
    value: function maskPlaceholder(mask) {
      return mask.map(function (char) {
        return char instanceof RegExp ? '_' : char;
      }).join('');
    }
  }, {
    key: 'setInputMask',
    value: function setInputMask(input) {
      if (input && this.component.inputMask) {
        var mask = this.getInputMask(this.component.inputMask);
        this.inputMask = (0, _vanilla2.default)({
          inputElement: input,
          mask: mask
        });
        if (!this.component.placeholder) {
          input.setAttribute('placeholder', this.maskPlaceholder(mask));
        }
      }
    }
  }, {
    key: 'createInput',
    value: function createInput(container) {
      var input = this.ce('input', this.info.type, this.info.attr);
      this.setInputMask(input);
      var inputGroup = this.addInputGroup(input, container);
      this.addPrefix(input, inputGroup);
      this.addInput(input, inputGroup || container);
      this.addSuffix(input, inputGroup);
      this.errorContainer = container;
      return inputGroup || input;
    }

    /**
     * Wrapper method to add an event listener to an HTML element.
     *
     * @param obj
     *   The DOM element to add the event to.
     * @param evt
     *   The event name to add.
     * @param func
     *   The callback function to be executed when the listener is triggered.
     */

  }, {
    key: 'addEventListener',
    value: function addEventListener(obj, evt, func) {
      this.eventHandlers.push({ type: evt, func: func });
      if ('addEventListener' in obj) {
        obj.addEventListener(evt, func, false);
      } else if ('attachEvent' in obj) {
        obj.attachEvent('on' + evt, func);
      }
    }

    /**
     * Remove all event handlers.
     */

  }, {
    key: 'destroy',
    value: function destroy(all) {
      var _this5 = this;

      if (this.inputMask) {
        this.inputMask.destroy();
      }
      (0, _each3.default)(this.eventListeners, function (listener) {
        if (all || listener.internal) {
          _this5.events.off(listener.type, listener.listener);
        }
      });
      (0, _each3.default)(this.eventHandlers, function (handler) {
        window.removeEventListener(handler.event, handler.func);
      });
    }

    /**
     * Alias for document.createElement.
     *
     * @param type
     * @returns {*}
     */

  }, {
    key: 'ce',
    value: function ce(name, type, attr) {
      // Allow for template overrides.
      var element = document.createElement(type);
      var compType = this.component.type || this.type;
      if (this.options && this.options.template && (this.options.template[compType] && this.options.template[compType][name] || this.options.template.global && this.options.template.global[name])) {
        var template = (0, _get3.default)(this.options, 'template.' + compType + '.' + name) || (0, _get3.default)(this.options, 'template.global.' + name);
        if (typeof template === 'function') {
          var returnElement = template(this, type, attr, element);
          if (returnElement) {
            return returnElement;
          }
        } else {
          // Assign the attributes.
          (0, _assign3.default)(attr, template);
        }
      }
      if (attr) {
        this.attr(element, attr);
      }
      return element;
    }

    /**
     * Alias to create a text node.
     * @param text
     * @returns {Text}
     */

  }, {
    key: 'text',
    value: function text(_text) {
      return document.createTextNode(_text);
    }

    /**
     * Adds an object of attributes onto an element.
     * @param element
     * @param attr
     */

  }, {
    key: 'attr',
    value: function attr(element, _attr) {
      (0, _each3.default)(_attr, function (value, key) {
        if (typeof value !== 'undefined') {
          element.setAttribute(key, value);
        }
      });
    }

    /**
     * Adds a class to a DOM element.
     *
     * @param element
     *   The element to add a class to.
     * @param className
     *   The name of the class to add.
     */

  }, {
    key: 'addClass',
    value: function addClass(element, className) {
      var cls = element.getAttribute('class');
      cls += ' ' + className;
      element.setAttribute('class', cls);
    }

    /**
     * Remove a class from a DOM element.
     *
     * @param element
     *   The DOM element to remove the class from.
     * @param className
     *   The name of the class that is to be removed.
     */

  }, {
    key: 'removeClass',
    value: function removeClass(element, className) {
      var cls = element.getAttribute('class');
      cls = cls.replace(className, '');
      element.setAttribute('class', cls);
    }

    /**
     * Check for conditionals and hide/show the element based on those conditions.
     */

  }, {
    key: 'checkConditions',
    value: function checkConditions(data) {
      this.show(_utils2.default.checkCondition(this.component, this.data, data));
    }

    /**
     * Add a new input error to this element.
     * @param message
     */

  }, {
    key: 'addInputError',
    value: function addInputError(message) {
      if (this.errorElement) {
        var errorMessage = this.ce('errorMessage', 'p', {
          class: 'help-block'
        });
        errorMessage.appendChild(this.text(message));
        this.errorElement.appendChild(errorMessage);
        this.addClass(this.element, 'has-error');
      }
    }

    /**
     * Hide or Show an element.
     *
     * @param show
     */

  }, {
    key: 'show',
    value: function show(_show) {
      if (this.element) {
        if (_show) {
          this.element.removeAttribute('hidden');
        } else {
          this.element.setAttribute('hidden', true);
        }
      }
    }
  }, {
    key: 'onChange',
    value: function onChange(noValidate) {
      if (!noValidate) {
        this.checkValidity();
      }
      if (this.events) {
        this.emit('componentChange', {
          component: this.component,
          value: this.value
        });
      }
    }

    /**
     * Add new input element listeners.
     *
     * @param input
     */

  }, {
    key: 'addInputEventListener',
    value: function addInputEventListener(input) {
      this.addEventListener(input, this.info.changeEvent, this.updateValue.bind(this));
    }

    /**
     * Add a new input to this comonent.
     *
     * @param input
     * @param container
     * @param name
     */

  }, {
    key: 'addInput',
    value: function addInput(input, container, noSet) {
      if (input && container) {
        this.inputs.push(input);
        input = container.appendChild(input);
        if (input && this.options.readOnly) {
          input.disabled = true;
          input.setAttribute('disabled', 'disabled');
        }
      }
      this.addInputEventListener(input);

      // Reset the values of the inputs.
      if (!noSet && this.data && this.data.hasOwnProperty(this.component.key)) {
        this.setValue(this.data[this.component.key], true);
      }
    }

    /**
     * Get the value at a specific index.
     *
     * @param index
     * @returns {*}
     */

  }, {
    key: 'getValueAt',
    value: function getValueAt(index) {
      return this.inputs[index].value;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      var values = [];
      for (var i in this.inputs) {
        if (!this.component.multiple) {
          this.value = this.getValueAt(i);
          return this.value;
        }
        values.push(this.getValueAt(i));
      }
      this.value = values;
      return values;
    }
  }, {
    key: 'updateValue',
    value: function updateValue(noValidate) {
      var value = this.data[this.component.key];
      var falsey = !value && value !== null && value !== undefined;
      this.data[this.component.key] = this.getValue();
      if (falsey) {
        if (!!this.data[this.component.key]) {
          this.triggerChange(noValidate);
        }
      } else {
        this.triggerChange(noValidate);
      }
    }
  }, {
    key: 'checkValidity',
    value: function checkValidity() {
      // No need to check for errors if there is no input.
      if (!this.component.input) {
        return;
      }

      this.setCustomValidity(_Validator.Validator.check(this.validators, this.component, this.getValidateValue(), this.data, this.t.bind(this)));
    }
  }, {
    key: 'getValidateValue',
    value: function getValidateValue() {
      return this.data[this.component.key];
    }
  }, {
    key: 'interpolate',
    value: function interpolate(string, data) {
      return _utils2.default.interpolate(string, data);
    }
  }, {
    key: 'setCustomValidity',
    value: function setCustomValidity(message) {
      if (this.errorElement && this.errorContainer) {
        this.errorElement.innerHTML = '';
        try {
          this.errorContainer.removeChild(this.errorElement);
        } catch (err) {}
      }
      this.removeClass(this.element, 'has-error');
      this.error = message ? message : '';
      if (message) {
        this.createErrorElement();
        this.addInputError(message);
        if (this.events) {
          this.emit('componentError', {
            component: this.component,
            error: message
          });
        }
      }
      (0, _each3.default)(this.inputs, function (input) {
        if (typeof input.setCustomValidity === 'function') {
          input.setCustomValidity(message);
        }
      });
    }

    /**
     * Set the value at a specific index.
     *
     * @param index
     * @param value
     */

  }, {
    key: 'setValueAt',
    value: function setValueAt(index, value) {
      if (value === null || value === undefined) {
        value = this.defaultValue();
      }
      this.inputs[index].value = value;
    }

    /**
     * Set the value of this component.
     * @param value
     */

  }, {
    key: 'setValue',
    value: function setValue(value, noUpdate, noValidate) {
      this.value = value;
      var isArray = (0, _isArray3.default)(value);
      for (var i in this.inputs) {
        this.setValueAt(i, isArray ? value[i] : value);
      }
      if (!noUpdate) {
        this.updateValue(noValidate);
      }
    }
  }, {
    key: 'selectOptions',
    value: function selectOptions(select, tag, options, defaultValue) {
      var _this6 = this;

      (0, _each3.default)(options, function (option) {
        var attrs = {
          value: option.value
        };
        if (defaultValue !== undefined && option.value === defaultValue) {
          attrs.selected = 'selected';
        }
        var optionElement = _this6.ce(tag, 'option', attrs);
        optionElement.appendChild(_this6.text(option.label));
        select.appendChild(optionElement);
      });
    }
  }, {
    key: 'setSelectValue',
    value: function setSelectValue(select, value) {
      var options = select.querySelectorAll('option');
      (0, _each3.default)(options, function (option) {
        if (option.value === value) {
          option.setAttribute('selected', 'selected');
        } else {
          option.removeAttribute('selected');
        }
      });
      if (select.onchange) {
        select.onchange();
      }
      if (select.onselect) {
        select.onchange();
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.destroy();
      var element = this.getElement();
      if (element) {
        element.innerHTML = '';
      }
    }
  }, {
    key: 'append',
    value: function append(element) {
      if (this.element) {
        this.element.appendChild(element);
      }
    }
  }, {
    key: 'prepend',
    value: function prepend(element) {
      if (this.element) {
        this.element.insertBefore(element, this.element.firstChild);
      }
    }
  }, {
    key: 'before',
    value: function before(element) {
      if (this.element) {
        this.element.parentNode.insertBefore(element, this.element);
      }
    }
  }, {
    key: 'remove',
    value: function remove(element) {
      if (this.element) {
        this.element.parentNode.removeChild(element);
      }
    }
  }, {
    key: 'removeChild',
    value: function removeChild(element) {
      if (this.element) {
        this.element.removeChild(element);
      }
    }

    /**
     * Get the element information.
     */

  }, {
    key: 'elementInfo',
    value: function elementInfo() {
      var _this7 = this;

      var attributes = {
        name: this.options.name,
        type: this.component.inputType || 'text',
        class: 'form-control'
      };
      (0, _each3.default)({
        tabindex: 'tabindex',
        placeholder: 'placeholder'
      }, function (path, prop) {
        var attrValue = (0, _get3.default)(_this7.component, path);
        if (attrValue) {
          attributes[prop] = attrValue;
        }
      });
      return {
        type: 'input',
        component: this.component,
        changeEvent: 'change',
        attr: attributes
      };
    }
  }, {
    key: 'className',
    get: function get() {
      var className = this.component.input ? 'form-group has-feedback ' : '';
      className += 'formio-component formio-component-' + this.component.type + ' ';
      if (this.component.key) {
        className += 'formio-component-' + this.component.key + ' ';
      }
      if (this.component.customClass) {
        className += this.component.customClass;
      }
      if (this.component.input && this.component.validate && this.component.validate.required) {
        className += ' required';
      }
      return className;
    }
  }, {
    key: 'name',
    get: function get() {
      return this.component.label || this.component.placeholder || this.component.key;
    }
  }, {
    key: 'errors',
    get: function get() {
      return this.error ? [this.error] : [];
    }
  }, {
    key: 'visible',
    set: function set(visible) {
      var element = this.getElement();
      if (element) {
        if (visible && this.styles) {
          element.style.visibility = this.styles.visibility;
          element.style.position = this.styles.position;
        } else if (!visible) {
          this.styles = {
            visibility: element.style.visibility,
            position: element.style.position
          };
          element.style.visibility = 'hidden';
          element.style.position = 'absolute';
        }
      }
    }

    /**
     * Disable this component.
     */

  }, {
    key: 'disable',
    set: function set(disable) {
      this.disabled = disable;
      // Disable all input.
      (0, _each3.default)(this.inputs, function (input) {
        input.disabled = disable;
        input.setAttribute('disabled', 'disabled');
      });
    }
  }]);

  return BaseComponent;
}();

exports.BaseComponent = BaseComponent;


BaseComponent.externalLibraries = {};
BaseComponent.requireLibrary = function (name, property, src) {
  if (!BaseComponent.externalLibraries.hasOwnProperty(name)) {
    BaseComponent.externalLibraries[name] = {};
    BaseComponent.externalLibraries[name].ready = new _nativePromiseOnly2.default(function (resolve, reject) {
      BaseComponent.externalLibraries[name].resolve = resolve;
      BaseComponent.externalLibraries[name].reject = reject;
    });

    if (!window[name + 'Callback']) {
      window[name + 'Callback'] = function () {
        this.resolve();
      }.bind(BaseComponent.externalLibraries[name]);
    }

    // See if the plugin already exists.
    var plugin = (0, _get3.default)(window, property);
    if (plugin) {
      BaseComponent.externalLibraries[name].resolve(plugin);
    } else {
      // Add the script to the top page.
      var script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('defer', true);
      script.setAttribute('async', true);
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }
};

BaseComponent.libraryReady = function (name) {
  if (BaseComponent.externalLibraries.hasOwnProperty(name) && BaseComponent.externalLibraries[name].ready) {
    return BaseComponent.externalLibraries[name].ready;
  }

  return _nativePromiseOnly2.default.reject(name + ' library was not required.');
};