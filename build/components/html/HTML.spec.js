'use strict';

var _HTML = require('./HTML');

var _index = require('./fixtures/index');

var _harness = require('../../../test/harness');

describe('HTML Component', function () {
  it('Should build an html component', function (done) {
    _harness.Harness.testCreate(_HTML.HTMLComponent, _index.components.comp1).then(function (component) {
      done();
    });
  });
});