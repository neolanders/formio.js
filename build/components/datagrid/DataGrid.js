'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataGridComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _cloneDeep2 = require('lodash/cloneDeep');

var _cloneDeep3 = _interopRequireDefault(_cloneDeep2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _Base = require('../base/Base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataGridComponent = exports.DataGridComponent = function (_BaseComponent) {
  _inherits(DataGridComponent, _BaseComponent);

  function DataGridComponent() {
    _classCallCheck(this, DataGridComponent);

    return _possibleConstructorReturn(this, (DataGridComponent.__proto__ || Object.getPrototypeOf(DataGridComponent)).apply(this, arguments));
  }

  _createClass(DataGridComponent, [{
    key: 'build',
    value: function build() {
      var _this2 = this;

      var tableClass = 'table datagrid-table table-bordered form-group formio-data-grid ';
      (0, _each3.default)(['striped', 'bordered', 'hover', 'condensed'], function (prop) {
        if (_this2.component[prop]) {
          tableClass += 'table-' + prop + ' ';
        }
      });
      this.element = this.ce('element', 'table', {
        class: tableClass
      });

      var thead = this.ce('header', 'thead');

      // Build the header.
      var tr = this.ce('headerRow', 'tr');
      (0, _each3.default)(this.component.components, function (comp) {
        var th = _this2.ce('headerColumn', 'th');
        if (comp.validate && comp.validate.required) {
          th.setAttribute('class', 'field-required');
        }
        th.appendChild(_this2.text(comp.label));
        tr.appendChild(th);
      });
      var th = this.ce('headerExtra', 'th');
      tr.appendChild(th);
      thead.appendChild(tr);
      this.element.appendChild(thead);

      // Create the table body.
      this.tbody = this.ce('table', 'tbody');

      // Add a blank row.
      this.addValue();

      // Add the body to the table and to the element.
      this.element.appendChild(this.tbody);
    }
  }, {
    key: 'defaultValue',
    value: function defaultValue() {
      return {};
    }
  }, {
    key: 'buildRows',
    value: function buildRows() {
      var _this3 = this;

      var components = require('../index');
      this.tbody.innerHTML = '';
      this.rows = [];
      (0, _each3.default)(this.data[this.component.key], function (row, index) {
        var tr = _this3.ce('tableRow', 'tr');
        var cols = {};
        (0, _each3.default)(_this3.component.components, function (col) {
          var column = (0, _cloneDeep3.default)(col);
          column.label = false;
          var td = _this3.ce('tableColumn', 'td');
          var comp = components.create(column, _this3.options, row);
          td.appendChild(comp.element);
          if (row.hasOwnProperty(column.key)) {
            comp.setValue(row[column.key]);
          }
          cols[column.key] = comp;
          tr.appendChild(td);
        });
        _this3.rows.push(cols);
        var td = _this3.ce('tableRemoveRow', 'td');
        td.appendChild(_this3.removeButton(index));
        tr.appendChild(td);
        _this3.tbody.appendChild(tr);
      });

      // Add the add button.
      var tr = this.ce('tableAddRow', 'tr');
      var td = this.ce('tableAddColumn', 'td', {
        colspan: this.component.components.length + 1
      });
      td.appendChild(this.addButton());
      tr.appendChild(td);
      this.tbody.appendChild(tr);
    }
  }, {
    key: 'setValue',
    value: function setValue(value, noUpdate, noValidate) {
      if (!value) {
        return;
      }
      if (!(0, _isArray3.default)(value)) {
        return;
      }

      this.value = value;

      // Add needed rows.
      for (var i = this.rows.length; i < value.length; i++) {
        this.addValue();
      }

      (0, _each3.default)(this.rows, function (row, index) {
        if (value.length <= index) {
          return;
        }
        (0, _each3.default)(row, function (col, key) {
          if (!value[index].hasOwnProperty(key)) {
            return;
          }
          col.value = value[index][key];
        });
      });
      if (!noUpdate) {
        this.updateValue(noValidate);
      }
    }

    /**
     * Get the value of this component.
     *
     * @returns {*}
     */

  }, {
    key: 'getValue',
    value: function getValue() {
      var values = [];
      (0, _each3.default)(this.rows, function (row) {
        var value = {};
        (0, _each3.default)(row, function (col) {
          if (col && col.component && col.component.key) {
            value[col.component.key] = col.value;
          }
        });
        values.push(value);
      });
      return values;
    }
  }]);

  return DataGridComponent;
}(_Base.BaseComponent);