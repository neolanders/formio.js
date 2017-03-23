'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormioWizard = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _nativePromiseOnly = require('native-promise-only');

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _formio = require('./formio.form');

var _formio2 = _interopRequireDefault(_formio);

var _formio3 = require('./formio');

var _formio4 = _interopRequireDefault(_formio3);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormioWizard = exports.FormioWizard = function (_FormioForm) {
  _inherits(FormioWizard, _FormioForm);

  function FormioWizard(element, options) {
    _classCallCheck(this, FormioWizard);

    var _this = _possibleConstructorReturn(this, (FormioWizard.__proto__ || Object.getPrototypeOf(FormioWizard)).call(this, element, options));

    _this.pages = [];
    _this.page = 0;
    return _this;
  }

  _createClass(FormioWizard, [{
    key: 'setPage',
    value: function setPage(num) {
      if (num >= 0 && num < this.pages.length) {
        this.page = num;
        return _get(FormioWizard.prototype.__proto__ || Object.getPrototypeOf(FormioWizard.prototype), 'setForm', this).call(this, this.currentPage());
      }
      return _nativePromiseOnly2.default.reject('Page not found');
    }
  }, {
    key: 'nextPage',
    value: function nextPage() {
      this.setPage(this.page + 1);
    }
  }, {
    key: 'prevPage',
    value: function prevPage() {
      this.setPage(this.page - 1);
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      _get(FormioWizard.prototype.__proto__ || Object.getPrototypeOf(FormioWizard.prototype), 'cancel', this).call(this);
      this.setPage(0);
    }
  }, {
    key: 'currentPage',
    value: function currentPage() {
      if (this.page >= 0 && this.page < this.pages.length) {
        return this.pages[this.page];
      }
      this.page = 0;
      return this.pages.length ? this.pages[0] : { components: [] };
    }
  }, {
    key: 'setForm',
    value: function setForm(form) {
      var _this2 = this;

      this.pages = [];
      (0, _each2.default)(form.components, function (component) {
        if (component.type === 'panel') {
          _this2.pages.push(component);
        }
      });
      return this.setPage(this.page);
    }
  }, {
    key: 'build',
    value: function build() {
      this.createWizardHeader();
      _get(FormioWizard.prototype.__proto__ || Object.getPrototypeOf(FormioWizard.prototype), 'build', this).call(this);
      this.createWizardNav();
    }
  }, {
    key: 'hasButton',
    value: function hasButton(name) {
      if (name === 'next') {
        return this.page + 1 < this.pages.length;
      }
      if (name === 'previous') {
        return this.page > 0;
      }
      if (name === 'submit') {
        return this.page === this.pages.length - 1;
      }
      return true;
    }
  }, {
    key: 'createWizardHeader',
    value: function createWizardHeader() {
      var _this3 = this;

      this.wizardHeader = this.ce('wizardHeader', 'ul', {
        class: 'pagination'
      });

      (0, _each2.default)(this.pages, function (page, i) {
        var pageButton = _this3.ce('pageButton', 'li', {
          class: i === _this3.page ? 'active' : 'disabled'
        });

        var pageLabel = _this3.ce('pageLabel', 'span');
        var pageTitle = i === _this3.page ? page.title : i + 1;
        if (!pageTitle) {
          pageTitle = i + 1;
        }
        pageLabel.appendChild(_this3.text(pageTitle));
        pageButton.appendChild(pageLabel);
        _this3.wizardHeader.appendChild(pageButton);
      });

      this.element.appendChild(this.wizardHeader);
    }
  }, {
    key: 'createWizardNav',
    value: function createWizardNav() {
      var _this4 = this;

      this.wizardNav = this.ce('wizardNav', 'ul', {
        class: 'list-inline'
      });

      (0, _each2.default)([{ name: 'cancel', method: 'cancel', class: 'btn btn-default' }, { name: 'previous', method: 'prevPage', class: 'btn btn-primary' }, { name: 'next', method: 'nextPage', class: 'btn btn-primary' }, { name: 'submit', method: 'submit', class: 'btn btn-primary' }], function (button) {
        if (!_this4.hasButton(button.name)) {
          return;
        }
        var buttonWrapper = _this4.ce('wizardNavButton', 'li');
        var buttonProp = button.name + 'Button';
        _this4[buttonProp] = _this4.ce(buttonProp, 'button', {
          class: button.class
        });
        _this4[buttonProp].appendChild(_this4.text(_this4.t(button.name)));
        _this4.addEventListener(_this4[buttonProp], 'click', function (event) {
          event.preventDefault();
          _this4[button.method]();
        });
        buttonWrapper.appendChild(_this4[buttonProp]);
        _this4.wizardNav.appendChild(buttonWrapper);
      });

      // Add the wizard navigation
      this.element.appendChild(this.wizardNav);
    }
  }]);

  return FormioWizard;
}(_formio2.default);

FormioWizard.setBaseUrl = _formio4.default.setBaseUrl;
FormioWizard.setApiUrl = _formio4.default.setApiUrl;
FormioWizard.setAppUrl = _formio4.default.setAppUrl;

module.exports = global.FormioWizard = FormioWizard;