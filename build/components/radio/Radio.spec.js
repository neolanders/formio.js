'use strict';

var _Radio = require('./Radio');

var _index = require('./fixtures/index');

var _harness = require('../../../test/harness');

describe('Radio Component', function () {
  it('Should build a radio component', function (done) {
    _harness.Harness.testCreate(_Radio.RadioComponent, _index.components.comp1).then(function (component) {
      _harness.Harness.testElements(component, 'input[type="radio"]', 4);
      done();
    });
  });
});