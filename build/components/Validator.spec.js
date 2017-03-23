'use strict';

var _Validator = require('./Validator');

var _powerAssert = require('power-assert');

var _powerAssert2 = _interopRequireDefault(_powerAssert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Validator Tests', function () {
  it('Should test for minLength', function () {
    _powerAssert2.default.equal(_Validator.Validator.validators.minLength.check({}, 5, 'test'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.minLength.check({}, 4, 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.minLength.check({}, 3, 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.minLength.check({}, 6, 'test'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.minLength.check({}, 6, ''), false);
  });

  it('Should test for maxLength', function () {
    _powerAssert2.default.equal(_Validator.Validator.validators.maxLength.check({}, 5, 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.maxLength.check({}, 4, 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.maxLength.check({}, 3, 'test'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.maxLength.check({}, 6, 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.maxLength.check({}, 6, ''), true);
  });

  it('Should test for email', function () {
    _powerAssert2.default.equal(_Validator.Validator.validators.email.check({}, '', 'test'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.email.check({}, '', 'test@a'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.email.check({}, '', 'test@example.com'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.email.check({}, '', 'test@a.com'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.email.check({}, '', 'test@a.co'), true);
  });

  it('Should test for required', function () {
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, ''), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, 't'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, false, ''), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, false, 'tes'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, undefined), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, null), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, []), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.required.check({}, true, ['test']), true);
  });

  it('Should test for custom', function () {
    _powerAssert2.default.equal(_Validator.Validator.validators.custom.check({}, 'valid = (input == "test")', 'test'), true);
    _powerAssert2.default.equal(_Validator.Validator.validators.custom.check({}, 'valid = (input == "test")', 'test2'), false);
    _powerAssert2.default.equal(_Validator.Validator.validators.custom.check({}, 'valid = (input == "test") ? true : "Should be false."', 'test2'), 'Should be false.');
    _powerAssert2.default.equal(_Validator.Validator.validators.custom.check({}, 'valid = (input == "test") ? true : "Should be false."', 'test'), true);
  });
});