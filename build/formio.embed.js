'use strict';

var _formioForm = require('./formio.form.js');

var _formioForm2 = _interopRequireDefault(_formioForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var query = {};
var scripts = document.getElementsByTagName('script');
var thisScript = scripts[scripts.length - 1];
var scriptSrc = thisScript.src.replace(/^([^\?]+).*/, '$1').split('/');
scriptSrc.pop();
scriptSrc = scriptSrc.join('/');
var queryString = thisScript.src.replace(/^[^\?]+\??/, '');
queryString.replace(/\?/g, '&').split("&").forEach(function (item) {
  query[item.split("=")[0]] = item.split("=")[1] && decodeURIComponent(item.split("=")[1]);
});
query.styles = query.styles || scriptSrc + '/formio.form.min.css';
_formioForm2.default.embed(query);