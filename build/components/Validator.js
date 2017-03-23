'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Validator = undefined;

var _get2 = require('lodash/get');

var _get3 = _interopRequireDefault(_get2);

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _has2 = require('lodash/has');

var _has3 = _interopRequireDefault(_has2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Validator = exports.Validator = {
  get: _get3.default,
  each: _each3.default,
  has: _has3.default,
  boolValue: function boolValue(value) {
    if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    } else {
      return !!value;
    }
  },
  empty: function empty(value) {
    return value == null || value.length === 0;
  },
  name: function name(component) {
    return component.label || component.placeholder || component.key;
  },
  checkValidator: function checkValidator(validator, component, setting, value, data, t) {
    var result = validator.check.call(this, component, setting, value, data);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      return validator.message.call(this, component, setting, t);
    }
    return '';
  },
  validate: function validate(validator, component, value, data, t) {
    if (validator.key && (0, _has3.default)(component, validator.key)) {
      var setting = this.get(component, validator.key);
      return this.checkValidator(validator, component, setting, value, data, t);
    }
    return this.checkValidator(validator, component, null, value, data, t);
  },
  check: function check(validators, component, value, data, t) {
    var _this = this;

    var result = '';
    (0, _each3.default)(validators, function (name) {
      if (_this.validators.hasOwnProperty(name)) {
        var validator = _this.validators[name];
        if (component.multiple && (0, _isArray3.default)(value)) {
          (0, _each3.default)(value, function (val) {
            result = _this.validate(validator, component, val, data, t);
            if (result) {
              return false;
            }
          });
        } else {
          result = _this.validate(validator, component, value, data, t);
        }
        if (result) {
          return false;
        }
      }
    });
    return result;
  },
  validators: {
    required: {
      key: 'validate.required',
      message: function message(component, setting, t) {
        return t('required', { field: this.name(component) });
      },
      check: function check(component, setting, value) {
        var required = Validator.boolValue(setting);
        if (!required) {
          return true;
        }
        return !Validator.empty(value);
      }
    },
    minLength: {
      key: 'validate.minLength',
      message: function message(component, setting, t) {
        return t('minLength', {
          field: this.name(component),
          length: setting - 1
        });
      },
      check: function check(component, setting, value) {
        var minLength = parseInt(setting, 10);
        if (!minLength || typeof value !== 'string') {
          return true;
        }
        return value.length >= minLength;
      }
    },
    maxLength: {
      key: 'validate.maxLength',
      message: function message(component, setting, t) {
        return t('maxLength', {
          field: this.name(component),
          length: setting + 1
        });
      },
      check: function check(component, setting, value) {
        var maxLength = parseInt(setting, 10);
        if (!maxLength || typeof value !== 'string') {
          return true;
        }
        return value.length <= maxLength;
      }
    },
    email: {
      message: function message(component, setting, t) {
        return t('invalid_email', {
          field: this.name(component)
        });
      },
      check: function check(component, setting, value) {
        // From http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(value);
      }
    },
    date: {
      message: function message(component, setting, t) {
        return t('invalid_date', {
          field: this.name(component)
        });
      },
      check: function check(component, setting, value) {
        return value !== 'Invalid date';
      }
    },
    custom: {
      key: 'validate.custom',
      message: function message(component, setting, t) {
        return t('custom', {
          field: this.name(component)
        });
      },
      check: function check(component, setting, value, data) {
        if (!setting) {
          return true;
        }
        var valid = true;
        var custom = setting;
        /*eslint-disable no-unused-vars */
        var input = value;
        /*eslint-enable no-unused-vars */
        custom = custom.replace(/({{\s+(.*)\s+}})/, function (match, $1, $2) {
          return data[$2];
        });

        /* jshint evil: true */
        eval(custom);
        return valid;
      }
    }
  }
};