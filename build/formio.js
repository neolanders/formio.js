'use strict';

// Intentionally use native-promise-only here... Other promise libraries (es6-promise)
// duck-punch the global Promise definition which messes up Angular 2 since it
// also duck-punches the global Promise definition. For now, keep native-promise-only.

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("native-promise-only");
require('whatwg-fetch');
var EventEmitter = require('eventemitter2').EventEmitter2;
var copy = require('shallow-copy');

/**
 * The Formio interface class.
 *
 *   let formio = new Formio('https://examples.form.io/example');
 */

var Formio = function () {
  function Formio(path) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Formio);

    if (options.hasOwnProperty('base')) {
      this.base = options.base;
    } else if (Formio.baseUrl) {
      this.base = Formio.baseUrl;
    } else {
      this.base = window.location.href.match(/http[s]?:\/\/api./)[0];
    }

    if (options.hasOwnProperty('formOnly')) {
      this.isFormOnly = options.formOnly;
    } else if (Formio.formOnly) {
      this.isFormOnly = Formio.formOnly;
    } else {
      this.isFormOnly = false;
    }

    // Ensure we have an instance of Formio.
    if (!(this instanceof Formio)) {
      return new Formio(path);
    }
    if (!path) {
      // Allow user to create new projects if this was instantiated without
      // a url
      this.projectUrl = this.base + '/project';
      this.projectsUrl = this.base + '/project';
      this.projectId = false;
      this.query = '';
      return;
    }

    // Initialize our variables.
    this.projectsUrl = '';
    this.projectUrl = '';
    this.projectId = '';
    this.formUrl = '';
    this.formsUrl = '';
    this.formId = '';
    this.submissionsUrl = '';
    this.submissionUrl = '';
    this.submissionId = '';
    this.actionsUrl = '';
    this.actionId = '';
    this.actionUrl = '';
    this.query = '';

    // Normalize to an absolute path.
    if (path.indexOf('http') !== 0 && path.indexOf('//') !== 0) {
      path = this.base + path;
    }

    var hostparts = Formio.getUrlParts(path);
    var parts = [];
    var hostName = hostparts[1] + hostparts[2];
    path = hostparts.length > 3 ? hostparts[3] : '';
    var queryparts = path.split('?');
    if (queryparts.length > 1) {
      path = queryparts[0];
      this.query = '?' + queryparts[1];
    }

    // Register a specific path.
    var registerPath = function registerPath(name, base) {
      _this[name + 'sUrl'] = base + '/' + name;
      var regex = new RegExp('\/' + name + '\/([^/]+)');
      if (path.search(regex) !== -1) {
        parts = path.match(regex);
        _this[name + 'Url'] = parts ? base + parts[0] : '';
        _this[name + 'Id'] = parts.length > 1 ? parts[1] : '';
        base += parts[0];
      }
      return base;
    };

    // Register an array of items.
    var registerItems = function registerItems(items, base, staticBase) {
      for (var i in items) {
        if (items.hasOwnProperty(i)) {
          var item = items[i];
          if (item instanceof Array) {
            registerItems(item, base, true);
          } else {
            var newBase = registerPath(item, base);
            base = staticBase ? base : newBase;
          }
        }
      }
    };

    this.projectUrl = hostName;
    if (!this.isFormOnly) {
      // Determine the projectUrl and projectId
      if (path.search(/(^|\/)(project)($|\/)/) !== -1) {
        // Get project id as project/:projectId.
        registerItems(['project'], hostName);
      } else if (hostName === this.base) {
        // Get project id as first part of path (subdirectory).
        if (hostparts.length > 3 && path.split('/').length > 1) {
          var pathParts = path.split('/');
          pathParts.shift(); // Throw away the first /.
          this.projectId = pathParts.shift();
          path = '/' + pathParts.join('/');
          this.projectUrl = hostName + '/' + this.projectId;
        }
      } else {
        // Get project id from subdomain.
        if (hostparts.length > 2 && (hostparts[2].split('.').length > 2 || hostName.indexOf('localhost') !== -1)) {
          this.projectUrl = hostName;
          this.projectId = hostparts[2].split('.')[0];
        }
      }
      this.projectsUrl = this.projectsUrl || this.base + '/project';
    }

    // Configure Form urls and form ids.
    if (path.search(/(^|\/)(project|form)($|\/)/) !== -1) {
      registerItems(['form', ['submission', 'action']], this.projectUrl);
    } else {
      var subRegEx = new RegExp('\/(submission|action)($|\/.*)');
      var subs = path.match(subRegEx);
      this.pathType = subs && subs.length > 1 ? subs[1] : '';
      path = path.replace(subRegEx, '');
      path = path.replace(/\/$/, '');
      this.formsUrl = this.projectUrl + '/form';
      this.formUrl = this.projectUrl + path;
      this.formId = path.replace(/^\/+|\/+$/g, '');
      var items = ['submission', 'action'];
      for (var i in items) {
        if (items.hasOwnProperty(i)) {
          var item = items[i];
          this[item + 'sUrl'] = this.projectUrl + path + '/' + item;
          if (this.pathType === item && subs.length > 2 && subs[2]) {
            this[item + 'Id'] = subs[2].replace(/^\/+|\/+$/g, '');
            this[item + 'Url'] = this.projectUrl + path + subs[0];
          }
        }
      }
    }

    // Set the app url if it is not set.
    if (!Formio.appUrlSet) {
      Formio.appUrl = this.projectUrl;
    }
  }

  _createClass(Formio, [{
    key: 'delete',
    value: function _delete(type, opts) {
      var _id = type + 'Id';
      var _url = type + 'Url';
      if (!this[_id]) {
        Promise.reject('Nothing to delete');
      }
      Formio.cache = {};
      return this.makeRequest(type, this[_url], 'delete', null, opts);
    }
  }, {
    key: 'index',
    value: function index(type, query, opts) {
      var _url = type + 'Url';
      query = query || '';
      if (query && (typeof query === 'undefined' ? 'undefined' : _typeof(query)) === 'object') {
        query = '?' + Formio.serialize(query.params);
      }
      return this.makeRequest(type, this[_url] + query, 'get', null, opts);
    }
  }, {
    key: 'save',
    value: function save(type, data, opts) {
      var _id = type + 'Id';
      var _url = type + 'Url';
      var method = this[_id] || data._id ? 'put' : 'post';
      var reqUrl = this[_id] ? this[_url] : this[type + 'sUrl'];
      if (!this[_id] && data._id && method === 'put') {
        reqUrl += '/' + data._id;
      }
      Formio.cache = {};
      return this.makeRequest(type, reqUrl + this.query, method, data, opts);
    }
  }, {
    key: 'load',
    value: function load(type, query, opts) {
      var _id = type + 'Id';
      var _url = type + 'Url';
      if (query && (typeof query === 'undefined' ? 'undefined' : _typeof(query)) === 'object') {
        query = Formio.serialize(query.params);
      }
      if (query) {
        query = this.query ? this.query + '&' + query : '?' + query;
      } else {
        query = this.query;
      }
      if (!this[_id]) {
        return Promise.reject('Missing ' + _id);
      }
      return this.makeRequest(type, this[_url] + query, 'get', null, opts);
    }
  }, {
    key: 'makeRequest',
    value: function makeRequest(type, url, method, data, opts) {
      method = (method || 'GET').toUpperCase();
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var requestArgs = {
        formio: this,
        type: type,
        url: url,
        method: method,
        data: data,
        opts: opts
      };

      var request = Formio.pluginWait('preRequest', requestArgs).then(function () {
        return Formio.pluginGet('request', requestArgs).then(function (result) {
          if (result === null || result === undefined) {
            return Formio.request(url, method, data, opts.header, opts);
          }
          return result;
        });
      });

      return Formio.pluginAlter('wrapRequestPromise', request, requestArgs);
    }
  }, {
    key: 'loadProject',
    value: function loadProject(query, opts) {
      return this.load('project', query, opts);
    }
  }, {
    key: 'saveProject',
    value: function saveProject(data, opts) {
      return this.save('project', data, opts);
    }
  }, {
    key: 'deleteProject',
    value: function deleteProject(opts) {
      return this.delete('project', opts);
    }
  }, {
    key: 'loadForm',
    value: function loadForm(query, opts) {
      return this.load('form', query, opts);
    }
  }, {
    key: 'saveForm',
    value: function saveForm(data, opts) {
      return this.save('form', data, opts);
    }
  }, {
    key: 'deleteForm',
    value: function deleteForm(opts) {
      return this.delete('form', opts);
    }
  }, {
    key: 'loadForms',
    value: function loadForms(query, opts) {
      return this.index('forms', query, opts);
    }
  }, {
    key: 'loadSubmission',
    value: function loadSubmission(query, opts) {
      return this.load('submission', query, opts);
    }
  }, {
    key: 'saveSubmission',
    value: function saveSubmission(data, opts) {
      return this.save('submission', data, opts);
    }
  }, {
    key: 'deleteSubmission',
    value: function deleteSubmission(opts) {
      return this.delete('submission', opts);
    }
  }, {
    key: 'loadSubmissions',
    value: function loadSubmissions(query, opts) {
      return this.index('submissions', query, opts);
    }
  }, {
    key: 'loadAction',
    value: function loadAction(query, opts) {
      return this.load('action', query, opts);
    }
  }, {
    key: 'saveAction',
    value: function saveAction(data, opts) {
      return this.save('action', data, opts);
    }
  }, {
    key: 'deleteAction',
    value: function deleteAction(opts) {
      return this.delete('action', opts);
    }
  }, {
    key: 'loadActions',
    value: function loadActions(query, opts) {
      return this.index('actions', query, opts);
    }
  }, {
    key: 'availableActions',
    value: function availableActions() {
      return this.makeRequest('availableActions', this.formUrl + '/actions');
    }
  }, {
    key: 'actionInfo',
    value: function actionInfo() {
      return this.makeRequest('actionInfo', this.formUrl + '/actions/' + name);
    }
  }, {
    key: 'uploadFile',
    value: function uploadFile(storage, file, fileName, dir, progressCallback, url) {
      var requestArgs = {
        provider: storage,
        method: 'upload',
        file: file,
        fileName: fileName,
        dir: dir
      };
      var request = Formio.pluginWait('preRequest', requestArgs).then(function () {
        return Formio.pluginGet('fileRequest', requestArgs).then(function (result) {
          if (storage && (result === null || result === undefined)) {
            if (Formio.providers.storage.hasOwnProperty(storage)) {
              var provider = new Formio.providers.storage[storage](this);
              return provider.uploadFile(file, fileName, dir, progressCallback, url);
            } else {
              throw 'Storage provider not found';
            }
          }
          return result || { url: '' };
        }.bind(this));
      }.bind(this));

      return Formio.pluginAlter('wrapFileRequestPromise', request, requestArgs);
    }
  }, {
    key: 'downloadFile',
    value: function downloadFile(file) {
      var requestArgs = {
        method: 'download',
        file: file
      };

      var request = Formio.pluginWait('preRequest', requestArgs).then(function () {
        return Formio.pluginGet('fileRequest', requestArgs).then(function (result) {
          if (file.storage && (result === null || result === undefined)) {
            if (Formio.providers.storage.hasOwnProperty(file.storage)) {
              var provider = new Formio.providers.storage[file.storage](this);
              return provider.downloadFile(file);
            } else {
              throw 'Storage provider not found';
            }
          }
          return result || { url: '' };
        }.bind(this));
      }.bind(this));

      return Formio.pluginAlter('wrapFileRequestPromise', request, requestArgs);
    }
  }], [{
    key: 'loadProjects',
    value: function loadProjects(query, opts) {
      query = query || '';
      if ((typeof query === 'undefined' ? 'undefined' : _typeof(query)) === 'object') {
        query = '?' + serialize(query.params);
      }
      return Formio.makeStaticRequest(Formio.baseUrl + '/project' + query);
    }
  }, {
    key: 'getUrlParts',
    value: function getUrlParts(url) {
      var regex = '^(http[s]?:\\/\\/)';
      if (this.base && url.indexOf(this.base) === 0) {
        regex += '(' + this.base.replace(/^http[s]?:\/\//, '') + ')';
      } else {
        regex += '([^/]+)';
      }
      regex += '($|\\/.*)';
      return url.match(new RegExp(regex));
    }
  }, {
    key: 'serialize',
    value: function serialize(obj) {
      var str = [];
      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      }return str.join("&");
    }
  }, {
    key: 'makeStaticRequest',
    value: function makeStaticRequest(url, method, data, opts) {
      method = (method || 'GET').toUpperCase();
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }
      var requestArgs = {
        url: url,
        method: method,
        data: data
      };

      var request = Formio.pluginWait('preRequest', requestArgs).then(function () {
        return Formio.pluginGet('staticRequest', requestArgs).then(function (result) {
          if (result === null || result === undefined) {
            return Formio.request(url, method, data, opts.header, opts);
          }
          return result;
        });
      });

      return Formio.pluginAlter('wrapStaticRequestPromise', request, requestArgs);
    }
  }, {
    key: 'request',
    value: function request(url, method, data, header, opts) {
      if (!url) {
        return Promise.reject('No url provided');
      }
      method = (method || 'GET').toUpperCase();

      // For reverse compatibility, if they provided the ignoreCache parameter,
      // then change it back to the options format where that is a parameter.
      if (typeof opts === 'boolean') {
        opts = { ignoreCache: opts };
      }
      if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
        opts = {};
      }

      var cacheKey = btoa(url);

      return new Promise(function (resolve, reject) {
        // Get the cached promise to save multiple loads.
        if (!opts.ignoreCache && method === 'GET' && Formio.cache.hasOwnProperty(cacheKey)) {
          return resolve(Formio.cache[cacheKey]);
        }

        resolve(new Promise(function (resolve, reject) {
          // Set up and fetch request
          var headers = header || new Headers({
            'Accept': 'application/json',
            'Content-type': 'application/json; charset=UTF-8'
          });
          var token = Formio.getToken();
          if (token && !opts.noToken) {
            headers.append('x-jwt-token', token);
          }

          var options = {
            method: method,
            headers: headers,
            mode: 'cors'
          };
          if (data) {
            options.body = JSON.stringify(data);
          }

          resolve(fetch(url, options));
        }).catch(function (err) {
          err.message = 'Could not connect to API server (' + err.message + ')';
          err.networkError = true;
          throw err;
        }).then(function (response) {
          if (!response.ok) {
            if (response.status === 440) {
              Formio.setToken(null);
              Formio.events.emit('formio.sessionExpired', response.body);
            } else if (response.status === 401) {
              Formio.events.emit('formio.unauthorized', response.body);
            }
            // Parse and return the error as a rejected promise to reject this promise
            return (response.headers.get('content-type').indexOf('application/json') !== -1 ? response.json() : response.text()).then(function (error) {
              throw error;
            });
          }

          // Handle fetch results
          var token = response.headers.get('x-jwt-token');
          if (response.status >= 200 && response.status < 300 && token && token !== '') {
            Formio.setToken(token);
          }
          // 204 is no content. Don't try to .json() it.
          if (response.status === 204) {
            return {};
          }
          return (response.headers.get('content-type').indexOf('application/json') !== -1 ? response.json() : response.text()).then(function (result) {
            // Add some content-range metadata to the result here
            var range = response.headers.get('content-range');
            if (range && (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
              range = range.split('/');
              if (range[0] !== '*') {
                var skipLimit = range[0].split('-');
                result.skip = Number(skipLimit[0]);
                result.limit = skipLimit[1] - skipLimit[0] + 1;
              }
              result.serverCount = range[1] === '*' ? range[1] : Number(range[1]);
            }

            if (!opts.getHeaders) {
              return result;
            }

            var headers = {};
            response.headers.forEach(function (item, key) {
              headers[key] = item;
            });

            return new Promise(function (resolve, reject) {
              resolve({ result: result, headers: headers });
            });
          });
        }).catch(function (err) {
          if (err === 'Bad Token') {
            Formio.setToken(null);
            Formio.events.emit('formio.badToken', err);
          }
          if (Formio.cache.hasOwnProperty(cacheKey)) {
            // Remove failed promises from cache
            delete Formio.cache[cacheKey];
          }
          // Propagate error so client can handle accordingly
          throw err;
        }));
      }).then(function (result) {
        // Save the cache
        if (method === 'GET') {
          Formio.cache[cacheKey] = Promise.resolve(result);
        }

        // Shallow copy result so modifications don't end up in cache
        if (Array.isArray(result)) {
          var resultCopy = result.map(copy);
          resultCopy.skip = result.skip;
          resultCopy.limit = result.limit;
          resultCopy.serverCount = result.serverCount;
          return resultCopy;
        }
        return copy(result);
      });
    }
  }, {
    key: 'setToken',
    value: function setToken(token) {
      token = token || '';
      if (token === this.token) {
        return;
      }
      this.token = token;
      if (!token) {
        Formio.setUser(null);
        // iOS in private browse mode will throw an error but we can't detect ahead of time that we are in private mode.
        try {
          return localStorage.removeItem('formioToken');
        } catch (err) {
          return;
        }
      }
      // iOS in private browse mode will throw an error but we can't detect ahead of time that we are in private mode.
      try {
        localStorage.setItem('formioToken', token);
      } catch (err) {
        // Do nothing.
      }
      return Formio.currentUser(); // Run this so user is updated if null
    }
  }, {
    key: 'getToken',
    value: function getToken() {
      if (this.token) {
        return this.token;
      }
      try {
        var token = localStorage.getItem('formioToken') || '';
        this.token = token;
        return token;
      } catch (e) {
        return '';
      }
    }
  }, {
    key: 'setUser',
    value: function setUser(user) {
      if (!user) {
        this.setToken(null);
        // iOS in private browse mode will throw an error but we can't detect ahead of time that we are in private mode.
        try {
          return localStorage.removeItem('formioUser');
        } catch (err) {
          return;
        }
      }
      // iOS in private browse mode will throw an error but we can't detect ahead of time that we are in private mode.
      try {
        localStorage.setItem('formioUser', JSON.stringify(user));
      } catch (err) {
        // Do nothing.
      }
    }
  }, {
    key: 'getUser',
    value: function getUser() {
      try {
        return JSON.parse(localStorage.getItem('formioUser') || null);
      } catch (e) {
        return;
      }
    }
  }, {
    key: 'setFormOnly',
    value: function setFormOnly(formOnly) {
      Formio.formOnly = !!formOnly;
    }
  }, {
    key: 'getFormOnly',
    value: function getFormOnly() {
      return Formio.formOnly;
    }
  }, {
    key: 'setBaseUrl',
    value: function setBaseUrl(url) {
      Formio.baseUrl = url;
      if (!Formio.appUrlSet) {
        Formio.appUrl = url;
      }
    }
  }, {
    key: 'getBaseUrl',
    value: function getBaseUrl() {
      return Formio.baseUrl;
    }
  }, {
    key: 'setApiUrl',
    value: function setApiUrl(url) {
      return Formio.setBaseUrl(url);
    }
  }, {
    key: 'getApiUrl',
    value: function getApiUrl() {
      return Formio.getBaseUrl();
    }
  }, {
    key: 'setAppUrl',
    value: function setAppUrl(url) {
      Formio.appUrl = url;
      Formio.appUrlSet = true;
    }
  }, {
    key: 'getAppUrl',
    value: function getAppUrl() {
      return Formio.appUrl;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      Formio.cache = {};
    }
  }, {
    key: 'noop',
    value: function noop() {}
  }, {
    key: 'identity',
    value: function identity(value) {
      return value;
    }
  }, {
    key: 'deregisterPlugin',
    value: function deregisterPlugin(plugin) {
      var beforeLength = Formio.plugins.length;
      Formio.plugins = Formio.plugins.filter(function (p) {
        if (p !== plugin && p.__name !== plugin) return true;
        (p.deregister || Formio.noop).call(p, Formio);
        return false;
      });
      return beforeLength !== Formio.plugins.length;
    }
  }, {
    key: 'registerPlugin',
    value: function registerPlugin(plugin, name) {
      Formio.plugins.push(plugin);
      Formio.plugins.sort(function (a, b) {
        return (b.priority || 0) - (a.priority || 0);
      });
      plugin.__name = name;
      (plugin.init || Formio.noop).call(plugin, Formio);
    }
  }, {
    key: 'getPlugin',
    value: function getPlugin(name) {
      return Formio.plugins.reduce(function (result, plugin) {
        if (result) return result;
        if (plugin.__name === name) return plugin;
      }, null);
    }
  }, {
    key: 'pluginWait',
    value: function pluginWait(pluginFn) {
      var args = [].slice.call(arguments, 1);
      return Promise.all(Formio.plugins.map(function (plugin) {
        return (plugin[pluginFn] || Formio.noop).apply(plugin, args);
      }));
    }
  }, {
    key: 'pluginGet',
    value: function pluginGet(pluginFn) {
      var args = [].slice.call(arguments, 0);
      var callPlugin = function callPlugin(index, pluginFn) {
        var plugin = Formio.plugins[index];
        if (!plugin) return Promise.resolve(null);
        return Promise.resolve((plugin && plugin[pluginFn] || Formio.noop).apply(plugin, [].slice.call(arguments, 2))).then(function (result) {
          if (result !== null && result !== undefined) return result;
          return callPlugin.apply(null, [index + 1].concat(args));
        });
      };
      return callPlugin.apply(null, [0].concat(args));
    }
  }, {
    key: 'pluginAlter',
    value: function pluginAlter(pluginFn, value) {
      var args = [].slice.call(arguments, 2);
      return Formio.plugins.reduce(function (value, plugin) {
        return (plugin[pluginFn] || Formio.identity).apply(plugin, [value].concat(args));
      }, value);
    }
  }, {
    key: 'currentUser',
    value: function currentUser() {
      var url = Formio.baseUrl + '/current';
      var user = this.getUser();
      if (user) {
        return Formio.pluginAlter('wrapStaticRequestPromise', Promise.resolve(user), {
          url: url,
          method: 'GET'
        });
      }
      var token = this.getToken();
      if (!token) {
        return Formio.pluginAlter('wrapStaticRequestPromise', Promise.resolve(null), {
          url: url,
          method: 'GET'
        });
      }
      return Formio.makeStaticRequest(url).then(function (response) {
        Formio.setUser(response);
        return response;
      });
    }
  }, {
    key: 'logout',
    value: function logout() {
      var onLogout = function onLogout(result) {
        Formio.setToken(null);
        Formio.setUser(null);
        Formio.clearCache();
        return result;
      };
      return Formio.makeStaticRequest(Formio.baseUrl + '/logout').then(onLogout).catch(onLogout);
    }

    /**
     * Attach an HTML form to Form.io.
     *
     * @param form
     */

  }, {
    key: 'form',
    value: function form(_form, options, done) {
      // Fix the parameters.
      if (!done && typeof options === 'function') {
        done = options;
        options = {};
      }

      done = done || function () {
        console.log(arguments);
      };
      options = options || {};

      // IF they provide a jquery object, then select the element.
      if (_form.jquery) {
        _form = _form[0];
      }
      if (!_form) {
        return done('Invalid Form');
      }

      var getAction = function getAction() {
        return options.form || _form.getAttribute('action');
      };

      /**
       * Returns the current submission object.
       * @returns {{data: {}}}
       */
      var getSubmission = function getSubmission() {
        var submission = { data: {} };
        var setValue = function setValue(path, value) {
          var isArray = path.substr(-2) === '[]';
          if (isArray) {
            path = path.replace('[]', '');
          }
          var paths = path.replace(/\[|\]\[/g, '.').replace(/\]$/g, '').split('.');
          var current = submission;
          while (path = paths.shift()) {
            if (!paths.length) {
              if (isArray) {
                if (!current[path]) {
                  current[path] = [];
                }
                current[path].push(value);
              } else {
                current[path] = value;
              }
            } else {
              if (!current[path]) {
                current[path] = {};
              }
              current = current[path];
            }
          }
        };

        // Get the form data from this form.
        var formData = new FormData(_form);
        var entries = formData.entries();
        var entry = null;
        while (entry = entries.next().value) {
          setValue(entry[0], entry[1]);
        }
        return submission;
      };

      // Submits the form.
      var submit = function submit(event) {
        if (event) {
          event.preventDefault();
        }
        var action = getAction();
        if (!action) {
          return;
        }
        new Formio(action).saveSubmission(getSubmission()).then(function (sub) {
          done(null, sub);
        }, done);
      };

      // Attach formio to the provided form.
      if (_form.attachEvent) {
        _form.attachEvent('submit', submit);
      } else {
        _form.addEventListener('submit', submit);
      }

      return {
        submit: submit,
        getAction: getAction,
        getSubmission: getSubmission
      };
    }
  }, {
    key: 'fieldData',
    value: function fieldData(data, component) {
      if (!data) {
        return '';
      }
      if (!component || !component.key) {
        return data;
      }
      if (component.key.indexOf('.') !== -1) {
        var value = data;
        var parts = component.key.split('.');
        var key = '';
        for (var i = 0; i < parts.length; i++) {
          key = parts[i];

          // Handle nested resources
          if (value.hasOwnProperty('_id')) {
            value = value.data;
          }

          // Return if the key is not found on the value.
          if (!value.hasOwnProperty(key)) {
            return;
          }

          // Convert old single field data in submissions to multiple
          if (key === parts[parts.length - 1] && component.multiple && !Array.isArray(value[key])) {
            value[key] = [value[key]];
          }

          // Set the value of this key.
          value = value[key];
        }
        return value;
      } else {
        // Convert old single field data in submissions to multiple
        if (component.multiple && !Array.isArray(data[component.key])) {
          data[component.key] = [data[component.key]];
        }
        return data[component.key];
      }
    }
  }]);

  return Formio;
}();

// Define all the static properties.


exports.Formio = Formio;
Formio.baseUrl = 'https://api.form.io';
Formio.appUrl = Formio.baseUrl;
Formio.appUrlSet = false;
Formio.plugins = [];
Formio.cache = {};
Formio.providers = require('./providers');
Formio.events = new EventEmitter({
  wildcard: false,
  maxListeners: 0
});

module.exports = global.Formio = Formio;