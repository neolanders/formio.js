"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormioForm = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nativePromiseOnly = require("native-promise-only");

var _nativePromiseOnly2 = _interopRequireDefault(_nativePromiseOnly);

var _formio = require("./formio");

var _formio2 = _interopRequireDefault(_formio);

var _Components = require("./components/Components");

var _debounce2 = require("lodash/debounce");

var _debounce3 = _interopRequireDefault(_debounce2);

var _each2 = require("lodash/each");

var _each3 = _interopRequireDefault(_each2);

var _eventemitter = require("eventemitter2");

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var getOptions = function getOptions(options) {
  options = options || {};
  options.events = new _eventemitter2.default({
    wildcard: false,
    maxListeners: 0
  });
  return options;
};

var FormioForm = exports.FormioForm = function (_FormioComponents) {
  _inherits(FormioForm, _FormioComponents);

  function FormioForm(element, options) {
    _classCallCheck(this, FormioForm);

    var _this = _possibleConstructorReturn(this, (FormioForm.__proto__ || Object.getPrototypeOf(FormioForm)).call(this, null, getOptions(options)));

    _this.type = 'form';
    _this._src = '';
    _this._loading = true;
    _this._submission = {};
    _this.formio = null;
    _this.loader = null;
    _this.alert = null;
    _this.onFormLoad = null;
    _this.onSubmissionLoad = null;
    _this.onFormBuild = null;

    // Promise that executes when the form is rendered and ready.
    _this.ready = new _nativePromiseOnly2.default(function (resolve, reject) {
      _this.readyResolve = resolve;
      _this.readyReject = reject;
    });

    // Trigger submission changes and errors debounced.
    _this.triggerSubmissionChange = (0, _debounce3.default)(_this.onSubmissionChange.bind(_this), 10);
    _this.triggerSubmissionError = (0, _debounce3.default)(_this.onSubmissionError.bind(_this), 10);

    // Set the element (if it is ready).
    _this.onElement = new _nativePromiseOnly2.default(function (resolve) {
      _this.elementResolve = resolve;
      _this.setElement(element);
    });
    return _this;
  }

  _createClass(FormioForm, [{
    key: "setElement",
    value: function setElement(element) {
      if (!element) {
        return;
      }

      // Allow the element to either be a form, or a wrapper.
      if (element.nodeName.toLowerCase() === 'form') {
        this.element = element;
        var classNames = this.element.getAttribute('class');
        classNames += ' formio-form';
        this.element.setAttribute('class', classNames);
      } else {
        this.wrapper = element;
        this.element = this.ce('element', 'form', {
          class: 'formio-form'
        });
        if (this.wrapper) {
          this.wrapper.appendChild(this.element);
        }
      }

      this.elementResolve(element);
    }
  }, {
    key: "setForm",
    value: function setForm(form) {
      var _this2 = this;

      if (form.display === 'wizard') {
        console.warn('You need to instantiate the FormioWizard class to use this form as a wizard.');
      }

      if (this.onFormBuild) {
        return this.onFormBuild.then(function () {
          return _this2.createForm(form);
        });
      }

      // Create the form.
      return this.createForm(form);
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.submission = { data: {} };
    }
  }, {
    key: "createForm",
    value: function createForm(form) {
      var _this3 = this;

      this.component = form;
      this.loading = true;
      return this.onFormBuild = this.render().then(function () {
        return _this3.onLoaded.then(function () {
          _this3.loading = false;
          _this3.readyResolve();
          _this3.setValue(_this3.value);
          _this3.onFormBuild = null;
        }, function (err) {
          return _this3.readyReject(err);
        });
      }, function (err) {
        return _this3.readyReject(err);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      return this.onElement.then(function () {
        _this4.clear();
        return _this4.localize().then(function () {
          _this4.build();
          _this4.on('resetForm', function () {
            return _this4.reset();
          }, true);
          _this4.on('componentChange', function (changed) {
            return _this4.triggerSubmissionChange(changed);
          }, true);
          _this4.on('componentError', function (changed) {
            return _this4.triggerSubmissionError(changed);
          }, true);
          _this4.emit('render');
        });
      });
    }
  }, {
    key: "setAlert",
    value: function setAlert(type, message) {
      if (this.options.noAlerts) {
        return;
      }
      if (this.alert) {
        try {
          this.removeChild(this.alert);
          this.alert = null;
        } catch (err) {}
      }
      if (message) {
        this.alert = this.ce('alert-' + type, 'div', {
          class: 'alert alert-' + type,
          role: 'alert'
        });
        this.alert.innerHTML = message;
      }
      if (!this.alert) {
        return;
      }
      this.prepend(this.alert);
    }
  }, {
    key: "build",
    value: function build() {
      var _this5 = this;

      this.on('submitButton', function () {
        return _this5.submit();
      }, true);
      this.addComponents();
      this.checkConditions(this.getValue());
    }
  }, {
    key: "showErrors",
    value: function showErrors() {
      var errors = this.errors;
      if (!errors.length) {
        this.setAlert(false);
        return;
      }
      var message = '<p>' + this.t('error') + '</p><ul>';
      (0, _each3.default)(errors, function (err) {
        if (err) {
          message += '<li><strong>' + err + '</strong></li>';
        }
      });
      message += '</ul>';
      this.setAlert('danger', message);
      return errors;
    }
  }, {
    key: "onSubmit",
    value: function onSubmit(submission) {
      this.loading = false;
      this.setAlert('success', '<p>' + this.t('complete') + '</p>');
      this.emit('submit', submission);
    }
  }, {
    key: "onSubmissionError",
    value: function onSubmissionError(error) {
      this.loading = false;
      this.showErrors();
      this.emit('error', error);
    }
  }, {
    key: "onSubmissionChange",
    value: function onSubmissionChange(changed) {
      var value = this.submission;
      var errors = this.errors;
      if (!errors.length) {
        this.setAlert(false);
      }
      value.changed = changed;
      this.emit('change', value);
      this.checkConditions(value.data);
    }
  }, {
    key: "reset",
    value: function reset() {
      // Reset the submission data.
      this.submission = { data: {} };
    }
  }, {
    key: "submit",
    value: function submit() {
      var _this6 = this;

      this.loading = true;
      if (!this.formio) {
        return this.onSubmit(this.submission);
      }
      this.formio.saveSubmission(this.submission).then(function (submission) {
        return _this6.onSubmit(submission);
      }).catch(function (err) {
        return _this6.onSubmissionError(err);
      });
    }
  }, {
    key: "src",
    get: function get() {
      return this._src;
    },
    set: function set(value) {
      var _this7 = this;

      if (!value || typeof value !== 'string') {
        return;
      }
      this._src = value;
      this.formio = new _formio2.default(value);
      this.onFormLoad = this.formio.loadForm().then(function (form) {
        return _this7.form = form;
      });
      if (this.formio.submissionId) {
        this.onSubmissionLoad = this.formio.loadSubmission().then(function (submission) {
          return _this7.submission = submission;
        });
      }
    }
  }, {
    key: "onLoaded",
    get: function get() {
      if (!this.onSubmissionLoad && !this.onFormLoad) {
        return _nativePromiseOnly2.default.resolve();
      }
      return this.onSubmissionLoad ? this.onSubmissionLoad : this.onFormLoad;
    }
  }, {
    key: "loading",
    get: function get() {
      return this._loading;
    },
    set: function set(loading) {
      this._loading = loading;
      if (!this.loader && loading) {
        this.loader = this.ce('loaderWrapper', 'div', {
          class: 'loader-wrapper'
        });
        var spinner = this.ce('loader', 'div', {
          class: 'loader text-center'
        });
        this.loader.appendChild(spinner);
      }
      if (this.loader) {
        try {
          if (loading) {
            this.before(this.loader);
          } else {
            this.remove(this.loader);
          }
        } catch (err) {}
      }
    }
  }, {
    key: "form",
    set: function set(form) {
      this.setForm(form);
    }
  }, {
    key: "submission",
    get: function get() {
      this._submission.data = this.getValue();
      return this._submission;
    },
    set: function set(submission) {
      var _this8 = this;

      submission = submission || {};
      this._submission = submission;
      this.value = submission.data;
      this.ready.then(function () {
        return _this8.setValue(_this8.value);
      });
    }
  }]);

  return FormioForm;
}(_Components.FormioComponents);

FormioForm.setBaseUrl = _formio2.default.setBaseUrl;
FormioForm.setApiUrl = _formio2.default.setApiUrl;
FormioForm.setAppUrl = _formio2.default.setAppUrl;

/**
 * Embed this form within the current page.
 * @param embed
 */
FormioForm.embed = function (embed) {
  if (!embed || !embed.src) {
    return null;
  }
  var id = embed.id || 'formio-' + Math.random().toString(36).substring(7);
  var height = embed.height || 500;
  var className = embed.class || 'formio-form-wrapper';
  var code = embed.styles ? '<link rel="stylesheet" href="' + embed.styles + '">' : '';
  code += '<div id="' + id + '" class="' + className + '" style="height:' + height + 'px;"></div>';
  document.write(code);
  var formElement = document.getElementById(id);
  var form = new FormioForm(formElement);
  form.src = embed.src;
  return form;
};

module.exports = global.FormioForm = FormioForm;