(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.missionClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],2:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

Request.prototype.parse = function(fn){
  this._parser = fn;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename || file.name);
  return this;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this.getHeader('Content-Type');
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

Request.prototype.then = function (fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":1,"reduce":2}],4:[function(require,module,exports){
(function (Buffer){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ApiClient = factory(root.superagent);
  }
}(this, function(superagent) {
  'use strict';

  /**
   * @module invoker/ApiClient
   * @version 1.0.0
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:invoker/ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default http://127.0.0.1:3050/
     */
    this.basePath = '/'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;

    /**
     * If set to false an additional timestamp parameter is added to all API GET calls to
     * prevent browser caching
     * @type {Boolean}
     * @default true
     */
    this.cache = true;
  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js (but not in runtime like browserify)
    if (typeof window === 'undefined' &&
        typeof require === 'function' &&
        require('fs') &&
        param instanceof require('fs').ReadStream) {
      return true;
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:invoker/ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null || response.status == 204) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null || (typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length)) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @returns {Promise} A {@link https://www.promisejs.org/|Promise} object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
        queryParams['_'] = new Date().getTime();
    }
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
      if(contentType != 'multipart/form-data') {
        request.type(contentType);
      }
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(this.normalizeParams(formParams));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }

    return new Promise(function(resolve, reject) {
      request.end(function(error, response) {
        if (error) {
          reject(error);
        } else {
          try {
            var data = _this.deserialize(response, returnType);
            resolve(data);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type.
   */
  exports.convertToType = function(data, type) {
    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(type)) {
          // for array type like: ['String']
          var itemType = type[0];
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:invoker/ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":48,"fs":46,"superagent":3}],5:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse200'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/InlineResponse200'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.CallbackApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse200);
  }
}(this, function(ApiClient, InlineResponse200) {
  'use strict';

  /**
   * Callback service.
   * @module invoker/api/CallbackApi
   * @version 1.0.0
   */

  /**
   * Constructs a new CallbackApi. 
   * @alias module:invoker/api/CallbackApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;



    /**
     * 获取回传对象数据
     * 获取回传对象数据
     * @param {String} id 返回id
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @param {Number} opts.offset 结果数据偏移记录 (default to 0)
     * @param {Number} opts.limit 结果数据记录数限制 (default to 500)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse200}
     */
    this.getCallbackObject = function(id, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id == undefined || id == null) {
        throw new Error("Missing the required parameter 'id' when calling getCallbackObject");
      }


      var pathParams = {
      };
      var queryParams = {
        'id': id,
        'offset': opts['offset'],
        'limit': opts['limit']
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse200;

      return this.apiClient.callApi(
        '/callback/object', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/InlineResponse200":19}],6:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2001', 'invoker/model/InlineResponse2002', 'invoker/model/InlineResponse2003', 'invoker/model/InlineResponse2004', 'invoker/model/InlineResponse2005', 'invoker/model/ObjectConfig'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/InlineResponse2001'), require('../model/InlineResponse2002'), require('../model/InlineResponse2003'), require('../model/InlineResponse2004'), require('../model/InlineResponse2005'), require('../model/ObjectConfig'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ConfigApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2001, root.SwaggerJsClient.InlineResponse2002, root.SwaggerJsClient.InlineResponse2003, root.SwaggerJsClient.InlineResponse2004, root.SwaggerJsClient.InlineResponse2005, root.SwaggerJsClient.ObjectConfig);
  }
}(this, function(ApiClient, InlineResponse2001, InlineResponse2002, InlineResponse2003, InlineResponse2004, InlineResponse2005, ObjectConfig) {
  'use strict';

  /**
   * Config service.
   * @module invoker/api/ConfigApi
   * @version 1.0.0
   */

  /**
   * Constructs a new ConfigApi. 
   * @alias module:invoker/api/ConfigApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;



    /**
     * 通过入参获取相关api信息
     * 通过入参获取相关api信息
     * @param {Array.<String>} params 参数ID列表
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2005}
     */
    this.getApiConfig = function(params, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'params' is set
      if (params == undefined || params == null) {
        throw new Error("Missing the required parameter 'params' when calling getApiConfig");
      }


      var pathParams = {
      };
      var queryParams = {
        'params': this.apiClient.buildCollectionParam(params, 'csv')
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2005;

      return this.apiClient.callApi(
        '/config/api-by-param', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 获取全部字段类型列表
     * 获取全部字段类型列表
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2001}
     */
    this.getConfigAll = function(opts) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2001;

      return this.apiClient.callApi(
        '/config/type', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 通过字段内容获取对应的类型列表
     * 通过字段内容获取对应的类型列表
     * @param {Array.<String>} fields 字段内容列表
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2002}
     */
    this.getFieldType = function(fields, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'fields' is set
      if (fields == undefined || fields == null) {
        throw new Error("Missing the required parameter 'fields' when calling getFieldType");
      }


      var pathParams = {
      };
      var queryParams = {
        'fields': this.apiClient.buildCollectionParam(fields, 'csv')
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2002;

      return this.apiClient.callApi(
        '/config/type/field', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 获取标准对象配置
     * 获取标准对象配置
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2004}
     */
    this.getObjectConfig = function(opts) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2004;

      return this.apiClient.callApi(
        '/config/object', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 提交用户自定义对象配置
     * 提交用户自定义对象配置
     * @param {module:invoker/model/ObjectConfig} objectConfig 对象配置
     * @param {Boolean} save 是否保存
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2003}
     */
    this.postCustomObjectConfig = function(objectConfig, save, opts) {
      opts = opts || {};
      var postBody = objectConfig;

      // verify the required parameter 'objectConfig' is set
      if (objectConfig == undefined || objectConfig == null) {
        throw new Error("Missing the required parameter 'objectConfig' when calling postCustomObjectConfig");
      }

      // verify the required parameter 'save' is set
      if (save == undefined || save == null) {
        throw new Error("Missing the required parameter 'save' when calling postCustomObjectConfig");
      }


      var pathParams = {
      };
      var queryParams = {
        'save': save
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2003;

      return this.apiClient.callApi(
        '/config/object/custom', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/InlineResponse2001":20,"../model/InlineResponse2002":26,"../model/InlineResponse2003":29,"../model/InlineResponse2004":30,"../model/InlineResponse2005":31,"../model/ObjectConfig":37}],7:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/EventInfo', 'invoker/model/Info', 'invoker/model/InlineResponse20010', 'invoker/model/InlineResponse20011', 'invoker/model/InlineResponse20012'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/EventInfo'), require('../model/Info'), require('../model/InlineResponse20010'), require('../model/InlineResponse20011'), require('../model/InlineResponse20012'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.EventApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.EventInfo, root.SwaggerJsClient.Info, root.SwaggerJsClient.InlineResponse20010, root.SwaggerJsClient.InlineResponse20011, root.SwaggerJsClient.InlineResponse20012);
  }
}(this, function(ApiClient, EventInfo, Info, InlineResponse20010, InlineResponse20011, InlineResponse20012) {
  'use strict';

  /**
   * Event service.
   * @module invoker/api/EventApi
   * @version 1.0.0
   */

  /**
   * Constructs a new EventApi. 
   * @alias module:invoker/api/EventApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;



    /**
     * 通过id删除事件
     * @param {String} eventID 事件id
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse20010}
     */
    this.deleteEventByID = function(eventID, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'eventID' is set
      if (eventID == undefined || eventID == null) {
        throw new Error("Missing the required parameter 'eventID' when calling deleteEventByID");
      }


      var pathParams = {
        'eventID': eventID
      };
      var queryParams = {
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse20010;

      return this.apiClient.callApi(
        '/event/{eventID}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 创建用户自定义查询事件
     * @param {String} mID 会战ID
     * @param {module:invoker/model/EventInfo} eventInfo 
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse20012}
     */
    this.postCustomEvent = function(mID, eventInfo, opts) {
      opts = opts || {};
      var postBody = eventInfo;

      // verify the required parameter 'mID' is set
      if (mID == undefined || mID == null) {
        throw new Error("Missing the required parameter 'mID' when calling postCustomEvent");
      }

      // verify the required parameter 'eventInfo' is set
      if (eventInfo == undefined || eventInfo == null) {
        throw new Error("Missing the required parameter 'eventInfo' when calling postCustomEvent");
      }


      var pathParams = {
      };
      var queryParams = {
        'mID': mID
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse20012;

      return this.apiClient.callApi(
        '/event/customApi', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 修改节点信息
     * @param {module:invoker/model/Info} info 
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse20011}
     */
    this.updateNodeInfo = function(info, opts) {
      opts = opts || {};
      var postBody = info;

      // verify the required parameter 'info' is set
      if (info == undefined || info == null) {
        throw new Error("Missing the required parameter 'info' when calling updateNodeInfo");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse20011;

      return this.apiClient.callApi(
        '/event/nodeInfo', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/EventInfo":16,"../model/Info":18,"../model/InlineResponse20010":21,"../model/InlineResponse20011":22,"../model/InlineResponse20012":23}],8:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2008', 'invoker/model/InlineResponse2009'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/InlineResponse2008'), require('../model/InlineResponse2009'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ObjectApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2008, root.SwaggerJsClient.InlineResponse2009);
  }
}(this, function(ApiClient, InlineResponse2008, InlineResponse2009) {
  'use strict';

  /**
   * Object service.
   * @module invoker/api/ObjectApi
   * @version 1.0.0
   */

  /**
   * Constructs a new ObjectApi. 
   * @alias module:invoker/api/ObjectApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;



    /**
     * 通过对象ID获取对象详情
     * 通过对象ID获取对象详情
     * @param {String} id 标准对象ID
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2008}
     */
    this.getObjectView = function(id, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id == undefined || id == null) {
        throw new Error("Missing the required parameter 'id' when calling getObjectView");
      }


      var pathParams = {
      };
      var queryParams = {
        'id': id
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2008;

      return this.apiClient.callApi(
        '/objects/view', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 通过对象ID获取对象详情
     * 通过对象ID获取对象详情
     * @param {String} id 标准对象ID
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2008}
     */
    this.getObjectsDetail = function(id, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id == undefined || id == null) {
        throw new Error("Missing the required parameter 'id' when calling getObjectsDetail");
      }


      var pathParams = {
      };
      var queryParams = {
        'id': id
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2008;

      return this.apiClient.callApi(
        '/objects/detail', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 获取标准对象列表
     * 获取标准对象列表
     * @param {String} meetingID 会战ID
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2009}
     */
    this.getObjectsInfo = function(meetingID, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'meetingID' is set
      if (meetingID == undefined || meetingID == null) {
        throw new Error("Missing the required parameter 'meetingID' when calling getObjectsInfo");
      }


      var pathParams = {
      };
      var queryParams = {
        'meetingID': meetingID
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2009;

      return this.apiClient.callApi(
        '/objects', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/InlineResponse2008":34,"../model/InlineResponse2009":35}],9:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2007', 'invoker/model/Params4Api'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/InlineResponse2007'), require('../model/Params4Api'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.RedirectApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2007, root.SwaggerJsClient.Params4Api);
  }
}(this, function(ApiClient, InlineResponse2007, Params4Api) {
  'use strict';

  /**
   * Redirect service.
   * @module invoker/api/RedirectApi
   * @version 1.0.0
   */

  /**
   * Constructs a new RedirectApi. 
   * @alias module:invoker/api/RedirectApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;




    this.test = function(opts){
        var postBody = {};
        var pathParams = {};
        var queryParams = {};
        var headerParams = {
            'Authorization': opts['authorization']
        };
        var formParams = {};

        var authNames = [];
        var contentTypes = ['application/json'];
        var accepts = ['application/json'];
        var returnType = InlineResponse2007;
        return this.apiClient.callApi(
            '/redirect/test','POST',
            pathParams, queryParams, headerParams, formParams, postBody,
            authNames, contentTypes, accepts, returnType
        )
    };

    /**
     * 调用api查询
     * 调用api查询
     * @param {String} redirectID 跳转Api ID
     * @param {String} mID 会战ID
     * @param {module:invoker/model/Params4Api} params 
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @param {Number} opts.queryOffset 分页起始记录偏移量
     * @param {Number} opts.queryLimit 分页最大记录条数
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2007}
     */
    this.redirectApi = function(redirectID, mID, params, opts) {
      opts = opts || {};
      var postBody = params;

      // verify the required parameter 'redirectID' is set
      if (redirectID == undefined || redirectID == null) {
        throw new Error("Missing the required parameter 'redirectID' when calling redirectApi");
      }

      // verify the required parameter 'mID' is set
      if (mID == undefined || mID == null) {
        throw new Error("Missing the required parameter 'mID' when calling redirectApi");
      }

      // verify the required parameter 'params' is set
      if (params == undefined || params == null) {
        throw new Error("Missing the required parameter 'params' when calling redirectApi");
      }


      var pathParams = {
        'redirectID': redirectID
      };
      var queryParams = {
        'mID': mID,
        'queryOffset': opts['queryOffset'],
        'queryLimit': opts['queryLimit']
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2007;

      return this.apiClient.callApi(
        '/redirect/api/{redirectID}', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/InlineResponse2007":33,"../model/Params4Api":41}],10:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2006', 'invoker/model/InlineResponse2007'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/InlineResponse2006'), require('../model/InlineResponse2007'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ResultApi = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2006, root.SwaggerJsClient.InlineResponse2007);
  }
}(this, function(ApiClient, InlineResponse2006, InlineResponse2007) {
  'use strict';

  /**
   * Result service.
   * @module invoker/api/ResultApi
   * @version 1.0.0
   */

  /**
   * Constructs a new ResultApi. 
   * @alias module:invoker/api/ResultApi
   * @class
   * @param {module:invoker/ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:invoker/ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;



    /**
     * 获取自定义查询结果数据
     * @param {String} id 数据ID
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2006}
     */
    this.getCustomResult = function(id, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id == undefined || id == null) {
        throw new Error("Missing the required parameter 'id' when calling getCustomResult");
      }


      var pathParams = {
      };
      var queryParams = {
        'id': id
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2006;

      return this.apiClient.callApi(
        '/result/custom', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }


    /**
     * 获取结果数据详情
     * 获取结果数据详情
     * @param {String} id 结果数据ID
     * @param {Object} opts Optional parameters
     * @param {String} opts.authorization token字串
     * @param {Number} opts.offset 结果数据偏移记录 (default to 0)
     * @param {Number} opts.limit 结果数据记录数限制 (default to 500)
     * @return {Promise} a {@link https://www.promisejs.org/|Promise}, with data of type {@link module:invoker/model/InlineResponse2007}
     */
    this.getResultDetail = function(id, opts) {
      opts = opts || {};
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id == undefined || id == null) {
        throw new Error("Missing the required parameter 'id' when calling getResultDetail");
      }


      var pathParams = {
      };
      var queryParams = {
        'id': id,
        'offset': opts['offset'],
        'limit': opts['limit']
      };
      var headerParams = {
        'Authorization': opts['authorization']
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = InlineResponse2007;

      return this.apiClient.callApi(
        '/result/detail', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType
      );
    }
  };

  return exports;
}));

},{"../ApiClient":4,"../model/InlineResponse2006":32,"../model/InlineResponse2007":33}],11:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ApiInfo', 'invoker/model/ApiInfoApiList', 'invoker/model/ApiInfoParameters', 'invoker/model/CustomResult', 'invoker/model/EventInfo', 'invoker/model/EventcustomApiResult', 'invoker/model/Info', 'invoker/model/InlineResponse200', 'invoker/model/InlineResponse2001', 'invoker/model/InlineResponse20010', 'invoker/model/InlineResponse20011', 'invoker/model/InlineResponse20012', 'invoker/model/InlineResponse20012D', 'invoker/model/InlineResponse2001D', 'invoker/model/InlineResponse2002', 'invoker/model/InlineResponse2002D', 'invoker/model/InlineResponse2002TypeList', 'invoker/model/InlineResponse2003', 'invoker/model/InlineResponse2004', 'invoker/model/InlineResponse2005', 'invoker/model/InlineResponse2006', 'invoker/model/InlineResponse2007', 'invoker/model/InlineResponse2008', 'invoker/model/InlineResponse2009', 'invoker/model/InlineResponse200D', 'invoker/model/ObjectConfig', 'invoker/model/ObjectDetail', 'invoker/model/ObjectInfo', 'invoker/model/ObjectParam', 'invoker/model/Params4Api', 'invoker/model/Params4ApiInner', 'invoker/model/Params4ApiInnerFrom', 'invoker/model/ResultDetail', 'invoker/model/Ri', 'invoker/api/CallbackApi', 'invoker/api/ConfigApi', 'invoker/api/EventApi', 'invoker/api/ObjectApi', 'invoker/api/RedirectApi', 'invoker/api/ResultApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/ApiInfo'), require('./model/ApiInfoApiList'), require('./model/ApiInfoParameters'), require('./model/CustomResult'), require('./model/EventInfo'), require('./model/EventcustomApiResult'), require('./model/Info'), require('./model/InlineResponse200'), require('./model/InlineResponse2001'), require('./model/InlineResponse20010'), require('./model/InlineResponse20011'), require('./model/InlineResponse20012'), require('./model/InlineResponse20012D'), require('./model/InlineResponse2001D'), require('./model/InlineResponse2002'), require('./model/InlineResponse2002D'), require('./model/InlineResponse2002TypeList'), require('./model/InlineResponse2003'), require('./model/InlineResponse2004'), require('./model/InlineResponse2005'), require('./model/InlineResponse2006'), require('./model/InlineResponse2007'), require('./model/InlineResponse2008'), require('./model/InlineResponse2009'), require('./model/InlineResponse200D'), require('./model/ObjectConfig'), require('./model/ObjectDetail'), require('./model/ObjectInfo'), require('./model/ObjectParam'), require('./model/Params4Api'), require('./model/Params4ApiInner'), require('./model/Params4ApiInnerFrom'), require('./model/ResultDetail'), require('./model/Ri'), require('./api/CallbackApi'), require('./api/ConfigApi'), require('./api/EventApi'), require('./api/ObjectApi'), require('./api/RedirectApi'), require('./api/ResultApi'));
  }
}(function(ApiClient, ApiInfo, ApiInfoApiList, ApiInfoParameters, CustomResult, EventInfo, EventcustomApiResult, Info, InlineResponse200, InlineResponse2001, InlineResponse20010, InlineResponse20011, InlineResponse20012, InlineResponse20012D, InlineResponse2001D, InlineResponse2002, InlineResponse2002D, InlineResponse2002TypeList, InlineResponse2003, InlineResponse2004, InlineResponse2005, InlineResponse2006, InlineResponse2007, InlineResponse2008, InlineResponse2009, InlineResponse200D, ObjectConfig, ObjectDetail, ObjectInfo, ObjectParam, Params4Api, Params4ApiInner, Params4ApiInnerFrom, ResultDetail, Ri, CallbackApi, ConfigApi, EventApi, ObjectApi, RedirectApi, ResultApi) {
  'use strict';

  /**
   * .<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var SwaggerJsClient = require('invoker/index'); // See note below*.
   * var xxxSvc = new SwaggerJsClient.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new SwaggerJsClient.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['invoker/index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new SwaggerJsClient.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new SwaggerJsClient.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module invoker/index
   * @version 1.0.0
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:invoker/ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The ApiInfo model constructor.
     * @property {module:invoker/model/ApiInfo}
     */
    ApiInfo: ApiInfo,
    /**
     * The ApiInfoApiList model constructor.
     * @property {module:invoker/model/ApiInfoApiList}
     */
    ApiInfoApiList: ApiInfoApiList,
    /**
     * The ApiInfoParameters model constructor.
     * @property {module:invoker/model/ApiInfoParameters}
     */
    ApiInfoParameters: ApiInfoParameters,
    /**
     * The CustomResult model constructor.
     * @property {module:invoker/model/CustomResult}
     */
    CustomResult: CustomResult,
    /**
     * The EventInfo model constructor.
     * @property {module:invoker/model/EventInfo}
     */
    EventInfo: EventInfo,
    /**
     * The EventcustomApiResult model constructor.
     * @property {module:invoker/model/EventcustomApiResult}
     */
    EventcustomApiResult: EventcustomApiResult,
    /**
     * The Info model constructor.
     * @property {module:invoker/model/Info}
     */
    Info: Info,
    /**
     * The InlineResponse200 model constructor.
     * @property {module:invoker/model/InlineResponse200}
     */
    InlineResponse200: InlineResponse200,
    /**
     * The InlineResponse2001 model constructor.
     * @property {module:invoker/model/InlineResponse2001}
     */
    InlineResponse2001: InlineResponse2001,
    /**
     * The InlineResponse20010 model constructor.
     * @property {module:invoker/model/InlineResponse20010}
     */
    InlineResponse20010: InlineResponse20010,
    /**
     * The InlineResponse20011 model constructor.
     * @property {module:invoker/model/InlineResponse20011}
     */
    InlineResponse20011: InlineResponse20011,
    /**
     * The InlineResponse20012 model constructor.
     * @property {module:invoker/model/InlineResponse20012}
     */
    InlineResponse20012: InlineResponse20012,
    /**
     * The InlineResponse20012D model constructor.
     * @property {module:invoker/model/InlineResponse20012D}
     */
    InlineResponse20012D: InlineResponse20012D,
    /**
     * The InlineResponse2001D model constructor.
     * @property {module:invoker/model/InlineResponse2001D}
     */
    InlineResponse2001D: InlineResponse2001D,
    /**
     * The InlineResponse2002 model constructor.
     * @property {module:invoker/model/InlineResponse2002}
     */
    InlineResponse2002: InlineResponse2002,
    /**
     * The InlineResponse2002D model constructor.
     * @property {module:invoker/model/InlineResponse2002D}
     */
    InlineResponse2002D: InlineResponse2002D,
    /**
     * The InlineResponse2002TypeList model constructor.
     * @property {module:invoker/model/InlineResponse2002TypeList}
     */
    InlineResponse2002TypeList: InlineResponse2002TypeList,
    /**
     * The InlineResponse2003 model constructor.
     * @property {module:invoker/model/InlineResponse2003}
     */
    InlineResponse2003: InlineResponse2003,
    /**
     * The InlineResponse2004 model constructor.
     * @property {module:invoker/model/InlineResponse2004}
     */
    InlineResponse2004: InlineResponse2004,
    /**
     * The InlineResponse2005 model constructor.
     * @property {module:invoker/model/InlineResponse2005}
     */
    InlineResponse2005: InlineResponse2005,
    /**
     * The InlineResponse2006 model constructor.
     * @property {module:invoker/model/InlineResponse2006}
     */
    InlineResponse2006: InlineResponse2006,
    /**
     * The InlineResponse2007 model constructor.
     * @property {module:invoker/model/InlineResponse2007}
     */
    InlineResponse2007: InlineResponse2007,
    /**
     * The InlineResponse2008 model constructor.
     * @property {module:invoker/model/InlineResponse2008}
     */
    InlineResponse2008: InlineResponse2008,
    /**
     * The InlineResponse2009 model constructor.
     * @property {module:invoker/model/InlineResponse2009}
     */
    InlineResponse2009: InlineResponse2009,
    /**
     * The InlineResponse200D model constructor.
     * @property {module:invoker/model/InlineResponse200D}
     */
    InlineResponse200D: InlineResponse200D,
    /**
     * The ObjectConfig model constructor.
     * @property {module:invoker/model/ObjectConfig}
     */
    ObjectConfig: ObjectConfig,
    /**
     * The ObjectDetail model constructor.
     * @property {module:invoker/model/ObjectDetail}
     */
    ObjectDetail: ObjectDetail,
    /**
     * The ObjectInfo model constructor.
     * @property {module:invoker/model/ObjectInfo}
     */
    ObjectInfo: ObjectInfo,
    /**
     * The ObjectParam model constructor.
     * @property {module:invoker/model/ObjectParam}
     */
    ObjectParam: ObjectParam,
    /**
     * The Params4Api model constructor.
     * @property {module:invoker/model/Params4Api}
     */
    Params4Api: Params4Api,
    /**
     * The Params4ApiInner model constructor.
     * @property {module:invoker/model/Params4ApiInner}
     */
    Params4ApiInner: Params4ApiInner,
    /**
     * The Params4ApiInnerFrom model constructor.
     * @property {module:invoker/model/Params4ApiInnerFrom}
     */
    Params4ApiInnerFrom: Params4ApiInnerFrom,
    /**
     * The ResultDetail model constructor.
     * @property {module:invoker/model/ResultDetail}
     */
    ResultDetail: ResultDetail,
    /**
     * The Ri model constructor.
     * @property {module:invoker/model/Ri}
     */
    Ri: Ri,
    /**
     * The CallbackApi service constructor.
     * @property {module:invoker/api/CallbackApi}
     */
    CallbackApi: CallbackApi,
    /**
     * The ConfigApi service constructor.
     * @property {module:invoker/api/ConfigApi}
     */
    ConfigApi: ConfigApi,
    /**
     * The EventApi service constructor.
     * @property {module:invoker/api/EventApi}
     */
    EventApi: EventApi,
    /**
     * The ObjectApi service constructor.
     * @property {module:invoker/api/ObjectApi}
     */
    ObjectApi: ObjectApi,
    /**
     * The RedirectApi service constructor.
     * @property {module:invoker/api/RedirectApi}
     */
    RedirectApi: RedirectApi,
    /**
     * The ResultApi service constructor.
     * @property {module:invoker/api/ResultApi}
     */
    ResultApi: ResultApi
  };

  return exports;
}));

},{"./ApiClient":4,"./api/CallbackApi":5,"./api/ConfigApi":6,"./api/EventApi":7,"./api/ObjectApi":8,"./api/RedirectApi":9,"./api/ResultApi":10,"./model/ApiInfo":12,"./model/ApiInfoApiList":13,"./model/ApiInfoParameters":14,"./model/CustomResult":15,"./model/EventInfo":16,"./model/EventcustomApiResult":17,"./model/Info":18,"./model/InlineResponse200":19,"./model/InlineResponse2001":20,"./model/InlineResponse20010":21,"./model/InlineResponse20011":22,"./model/InlineResponse20012":23,"./model/InlineResponse20012D":24,"./model/InlineResponse2001D":25,"./model/InlineResponse2002":26,"./model/InlineResponse2002D":27,"./model/InlineResponse2002TypeList":28,"./model/InlineResponse2003":29,"./model/InlineResponse2004":30,"./model/InlineResponse2005":31,"./model/InlineResponse2006":32,"./model/InlineResponse2007":33,"./model/InlineResponse2008":34,"./model/InlineResponse2009":35,"./model/InlineResponse200D":36,"./model/ObjectConfig":37,"./model/ObjectDetail":38,"./model/ObjectInfo":39,"./model/ObjectParam":40,"./model/Params4Api":41,"./model/Params4ApiInner":42,"./model/Params4ApiInnerFrom":43,"./model/ResultDetail":44,"./model/Ri":45}],12:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ApiInfoApiList'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ApiInfoApiList'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ApiInfo = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ApiInfoApiList);
  }
}(this, function(ApiClient, ApiInfoApiList) {
  'use strict';




  /**
   * The ApiInfo model module.
   * @module invoker/model/ApiInfo
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ApiInfo</code>.
   * api信息
   * @alias module:invoker/model/ApiInfo
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>ApiInfo</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ApiInfo} obj Optional instance to populate.
   * @return {module:invoker/model/ApiInfo} The populated <code>ApiInfo</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('sysID')) {
        obj['sysID'] = ApiClient.convertToType(data['sysID'], 'String');
      }
      if (data.hasOwnProperty('sysTitle')) {
        obj['sysTitle'] = ApiClient.convertToType(data['sysTitle'], 'String');
      }
      if (data.hasOwnProperty('sysVersion')) {
        obj['sysVersion'] = ApiClient.convertToType(data['sysVersion'], 'String');
      }
      if (data.hasOwnProperty('sysDesc')) {
        obj['sysDesc'] = ApiClient.convertToType(data['sysDesc'], 'String');
      }
      if (data.hasOwnProperty('apiList')) {
        obj['apiList'] = ApiClient.convertToType(data['apiList'], [ApiInfoApiList]);
      }
    }
    return obj;
  }

  /**
   * 系统ID
   * @member {String} sysID
   */
  exports.prototype['sysID'] = undefined;
  /**
   * 系统名称
   * @member {String} sysTitle
   */
  exports.prototype['sysTitle'] = undefined;
  /**
   * 系统版本
   * @member {String} sysVersion
   */
  exports.prototype['sysVersion'] = undefined;
  /**
   * 系统描述
   * @member {String} sysDesc
   */
  exports.prototype['sysDesc'] = undefined;
  /**
   * api信息列表
   * @member {Array.<module:invoker/model/ApiInfoApiList>} apiList
   */
  exports.prototype['apiList'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ApiInfoApiList":13}],13:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ApiInfoParameters'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ApiInfoParameters'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ApiInfoApiList = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ApiInfoParameters);
  }
}(this, function(ApiClient, ApiInfoParameters) {
  'use strict';




  /**
   * The ApiInfoApiList model module.
   * @module invoker/model/ApiInfoApiList
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ApiInfoApiList</code>.
   * api信息
   * @alias module:invoker/model/ApiInfoApiList
   * @class
   */
  var exports = function() {
    var _this = this;







  };

  /**
   * Constructs a <code>ApiInfoApiList</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ApiInfoApiList} obj Optional instance to populate.
   * @return {module:invoker/model/ApiInfoApiList} The populated <code>ApiInfoApiList</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('desc')) {
        obj['desc'] = ApiClient.convertToType(data['desc'], 'String');
      }
      if (data.hasOwnProperty('summary')) {
        obj['summary'] = ApiClient.convertToType(data['summary'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('method')) {
        obj['method'] = ApiClient.convertToType(data['method'], 'String');
      }
      if (data.hasOwnProperty('parameters')) {
        obj['parameters'] = ApiClient.convertToType(data['parameters'], [ApiInfoParameters]);
      }
    }
    return obj;
  }

  /**
   * api描述
   * @member {String} desc
   */
  exports.prototype['desc'] = undefined;
  /**
   * api简述
   * @member {String} summary
   */
  exports.prototype['summary'] = undefined;
  /**
   * api url
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * api类型
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * api方法
   * @member {String} method
   */
  exports.prototype['method'] = undefined;
  /**
   * 参数信息列表
   * @member {Array.<module:invoker/model/ApiInfoParameters>} parameters
   */
  exports.prototype['parameters'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ApiInfoParameters":14}],14:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ApiInfoParameters = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ApiInfoParameters model module.
   * @module invoker/model/ApiInfoParameters
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ApiInfoParameters</code>.
   * 参数信息
   * @alias module:invoker/model/ApiInfoParameters
   * @class
   */
  var exports = function() {
    var _this = this;







  };

  /**
   * Constructs a <code>ApiInfoParameters</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ApiInfoParameters} obj Optional instance to populate.
   * @return {module:invoker/model/ApiInfoParameters} The populated <code>ApiInfoParameters</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('isArray')) {
        obj['isArray'] = ApiClient.convertToType(data['isArray'], 'Boolean');
      }
      if (data.hasOwnProperty('required')) {
        obj['required'] = ApiClient.convertToType(data['required'], 'Boolean');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('desc')) {
        obj['desc'] = ApiClient.convertToType(data['desc'], 'String');
      }
      if (data.hasOwnProperty('params')) {
        obj['params'] = ApiClient.convertToType(data['params'], ['String']);
      }
    }
    return obj;
  }

  /**
   * 是否数组
   * @member {Boolean} isArray
   */
  exports.prototype['isArray'] = undefined;
  /**
   * 是否必要
   * @member {Boolean} required
   */
  exports.prototype['required'] = undefined;
  /**
   * 参数ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 参数类型
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * 参数描述
   * @member {String} desc
   */
  exports.prototype['desc'] = undefined;
  /**
   * 可填参数ID列表
   * @member {Array.<String>} params
   */
  exports.prototype['params'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],15:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.CustomResult = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CustomResult model module.
   * @module invoker/model/CustomResult
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>CustomResult</code>.
   * 用户自定义查询结果数据
   * @alias module:invoker/model/CustomResult
   * @class
   */
  var exports = function() {
    var _this = this;










  };

  /**
   * Constructs a <code>CustomResult</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/CustomResult} obj Optional instance to populate.
   * @return {module:invoker/model/CustomResult} The populated <code>CustomResult</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('userID')) {
        obj['userID'] = ApiClient.convertToType(data['userID'], 'String');
      }
      if (data.hasOwnProperty('userName')) {
        obj['userName'] = ApiClient.convertToType(data['userName'], 'String');
      }
      if (data.hasOwnProperty('sysTitle')) {
        obj['sysTitle'] = ApiClient.convertToType(data['sysTitle'], 'String');
      }
      if (data.hasOwnProperty('actionDesc')) {
        obj['actionDesc'] = ApiClient.convertToType(data['actionDesc'], 'String');
      }
      if (data.hasOwnProperty('params')) {
        obj['params'] = ApiClient.convertToType(data['params'], Object);
      }
      if (data.hasOwnProperty('resultInfo')) {
        obj['resultInfo'] = ApiClient.convertToType(data['resultInfo'], Object);
      }
      if (data.hasOwnProperty('dict')) {
        obj['dict'] = ApiClient.convertToType(data['dict'], Object);
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], Object);
      }
    }
    return obj;
  }

  /**
   * 返回数据ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 操作人ID
   * @member {String} userID
   */
  exports.prototype['userID'] = undefined;
  /**
   * 操作人名称
   * @member {String} userName
   */
  exports.prototype['userName'] = undefined;
  /**
   * 起始系统名称
   * @member {String} sysTitle
   */
  exports.prototype['sysTitle'] = undefined;
  /**
   * 行为描述
   * @member {String} actionDesc
   */
  exports.prototype['actionDesc'] = undefined;
  /**
   * 请求数据
   * @member {Object} params
   */
  exports.prototype['params'] = undefined;
  /**
   * 返回数据信息
   * @member {Object} resultInfo
   */
  exports.prototype['resultInfo'] = undefined;
  /**
   * 返回数据字典
   * @member {Object} dict
   */
  exports.prototype['dict'] = undefined;
  /**
   * 返回数据
   * @member {Object} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],16:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/EventcustomApiResult'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./EventcustomApiResult'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.EventInfo = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.EventcustomApiResult);
  }
}(this, function(ApiClient, EventcustomApiResult) {
  'use strict';




  /**
   * The EventInfo model module.
   * @module invoker/model/EventInfo
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>EventInfo</code>.
   * @alias module:invoker/model/EventInfo
   * @class
   */
  var exports = function() {
    var _this = this;





  };

  /**
   * Constructs a <code>EventInfo</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/EventInfo} obj Optional instance to populate.
   * @return {module:invoker/model/EventInfo} The populated <code>EventInfo</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('sysTitle')) {
        obj['sysTitle'] = ApiClient.convertToType(data['sysTitle'], 'String');
      }
      if (data.hasOwnProperty('actionDesc')) {
        obj['actionDesc'] = ApiClient.convertToType(data['actionDesc'], 'String');
      }
      if (data.hasOwnProperty('params')) {
        obj['params'] = ApiClient.convertToType(data['params'], [Object]);
      }
      if (data.hasOwnProperty('result')) {
        obj['result'] = EventcustomApiResult.constructFromObject(data['result']);
      }
    }
    return obj;
  }

  /**
   * 系统标题
   * @member {String} sysTitle
   */
  exports.prototype['sysTitle'] = undefined;
  /**
   * 行为描述
   * @member {String} actionDesc
   */
  exports.prototype['actionDesc'] = undefined;
  /**
   * 查询参数列表
   * @member {Array.<Object>} params
   */
  exports.prototype['params'] = undefined;
  /**
   * @member {module:invoker/model/EventcustomApiResult} result
   */
  exports.prototype['result'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./EventcustomApiResult":17}],17:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.EventcustomApiResult = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The EventcustomApiResult model module.
   * @module invoker/model/EventcustomApiResult
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>EventcustomApiResult</code>.
   * 结果数据
   * @alias module:invoker/model/EventcustomApiResult
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>EventcustomApiResult</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/EventcustomApiResult} obj Optional instance to populate.
   * @return {module:invoker/model/EventcustomApiResult} The populated <code>EventcustomApiResult</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('header')) {
        obj['header'] = ApiClient.convertToType(data['header'], Object);
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], Object);
      }
    }
    return obj;
  }

  /**
   * label和id的对应字典
   * @member {Object} header
   */
  exports.prototype['header'] = undefined;
  /**
   * 以label为key的json结构
   * @member {Object} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],18:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.Info = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Info model module.
   * @module invoker/model/Info
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Info</code>.
   * @alias module:invoker/model/Info
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>Info</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/Info} obj Optional instance to populate.
   * @return {module:invoker/model/Info} The populated <code>Info</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('eventID')) {
        obj['eventID'] = ApiClient.convertToType(data['eventID'], 'String');
      }
      if (data.hasOwnProperty('nodeID')) {
        obj['nodeID'] = ApiClient.convertToType(data['nodeID'], 'String');
      }
      if (data.hasOwnProperty('nodeType')) {
        obj['nodeType'] = ApiClient.convertToType(data['nodeType'], 'String');
      }
      if (data.hasOwnProperty('fieldName')) {
        obj['fieldName'] = ApiClient.convertToType(data['fieldName'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'String');
      }
    }
    return obj;
  }

  /**
   * event id
   * @member {String} eventID
   */
  exports.prototype['eventID'] = undefined;
  /**
   * node id
   * @member {String} nodeID
   */
  exports.prototype['nodeID'] = undefined;
  /**
   * node type
   * @member {String} nodeType
   */
  exports.prototype['nodeType'] = undefined;
  /**
   * fieldName
   * @member {String} fieldName
   */
  exports.prototype['fieldName'] = undefined;
  /**
   * value
   * @member {String} value
   */
  exports.prototype['value'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],19:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse200D', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./InlineResponse200D'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse200 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse200D, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, InlineResponse200D, Ri) {
  'use strict';




  /**
   * The InlineResponse200 model module.
   * @module invoker/model/InlineResponse200
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse200</code>.
   * @alias module:invoker/model/InlineResponse200
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse200</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse200} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse200} The populated <code>InlineResponse200</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = InlineResponse200D.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/InlineResponse200D} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./InlineResponse200D":36,"./Ri":45}],20:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2001D', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./InlineResponse2001D'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2001 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2001D, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, InlineResponse2001D, Ri) {
  'use strict';




  /**
   * The InlineResponse2001 model module.
   * @module invoker/model/InlineResponse2001
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2001</code>.
   * @alias module:invoker/model/InlineResponse2001
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2001</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2001} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2001} The populated <code>InlineResponse2001</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], [InlineResponse2001D]);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {Array.<module:invoker/model/InlineResponse2001D>} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./InlineResponse2001D":25,"./Ri":45}],21:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse20010 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, Ri) {
  'use strict';




  /**
   * The InlineResponse20010 model module.
   * @module invoker/model/InlineResponse20010
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse20010</code>.
   * @alias module:invoker/model/InlineResponse20010
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse20010</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse20010} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse20010} The populated <code>InlineResponse20010</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * 被删除的事件id
   * @member {String} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./Ri":45}],22:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse20011 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, Ri) {
  'use strict';




  /**
   * The InlineResponse20011 model module.
   * @module invoker/model/InlineResponse20011
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse20011</code>.
   * @alias module:invoker/model/InlineResponse20011
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse20011</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse20011} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse20011} The populated <code>InlineResponse20011</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * value
   * @member {String} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./Ri":45}],23:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse20012D', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./InlineResponse20012D'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse20012 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse20012D, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, InlineResponse20012D, Ri) {
  'use strict';




  /**
   * The InlineResponse20012 model module.
   * @module invoker/model/InlineResponse20012
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse20012</code>.
   * @alias module:invoker/model/InlineResponse20012
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse20012</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse20012} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse20012} The populated <code>InlineResponse20012</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = InlineResponse20012D.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/InlineResponse20012D} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./InlineResponse20012D":24,"./Ri":45}],24:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse20012D = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The InlineResponse20012D model module.
   * @module invoker/model/InlineResponse20012D
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse20012D</code>.
   * 事件信息
   * @alias module:invoker/model/InlineResponse20012D
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse20012D</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse20012D} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse20012D} The populated <code>InlineResponse20012D</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('eventId')) {
        obj['eventId'] = ApiClient.convertToType(data['eventId'], 'String');
      }
      if (data.hasOwnProperty('nodes')) {
        obj['nodes'] = ApiClient.convertToType(data['nodes'], ['String']);
      }
    }
    return obj;
  }

  /**
   * 事件id
   * @member {String} eventId
   */
  exports.prototype['eventId'] = undefined;
  /**
   * 事件中的节点信息
   * @member {Array.<String>} nodes
   */
  exports.prototype['nodes'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],25:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2001D = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The InlineResponse2001D model module.
   * @module invoker/model/InlineResponse2001D
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2001D</code>.
   * 字段类型信息
   * @alias module:invoker/model/InlineResponse2001D
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2001D</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2001D} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2001D} The populated <code>InlineResponse2001D</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('label')) {
        obj['label'] = ApiClient.convertToType(data['label'], 'String');
      }
    }
    return obj;
  }

  /**
   * 类型ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 类型名称
   * @member {String} label
   */
  exports.prototype['label'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],26:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2002D', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./InlineResponse2002D'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2002 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2002D, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, InlineResponse2002D, Ri) {
  'use strict';




  /**
   * The InlineResponse2002 model module.
   * @module invoker/model/InlineResponse2002
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2002</code>.
   * @alias module:invoker/model/InlineResponse2002
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2002</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2002} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2002} The populated <code>InlineResponse2002</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], [InlineResponse2002D]);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * 字段类型信息
   * @member {Array.<module:invoker/model/InlineResponse2002D>} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./InlineResponse2002D":27,"./Ri":45}],27:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/InlineResponse2002TypeList'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./InlineResponse2002TypeList'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2002D = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.InlineResponse2002TypeList);
  }
}(this, function(ApiClient, InlineResponse2002TypeList) {
  'use strict';




  /**
   * The InlineResponse2002D model module.
   * @module invoker/model/InlineResponse2002D
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2002D</code>.
   * @alias module:invoker/model/InlineResponse2002D
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2002D</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2002D} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2002D} The populated <code>InlineResponse2002D</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('field')) {
        obj['field'] = ApiClient.convertToType(data['field'], 'String');
      }
      if (data.hasOwnProperty('typeList')) {
        obj['typeList'] = ApiClient.convertToType(data['typeList'], [InlineResponse2002TypeList]);
      }
    }
    return obj;
  }

  /**
   * 字段
   * @member {String} field
   */
  exports.prototype['field'] = undefined;
  /**
   * @member {Array.<module:invoker/model/InlineResponse2002TypeList>} typeList
   */
  exports.prototype['typeList'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./InlineResponse2002TypeList":28}],28:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2002TypeList = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The InlineResponse2002TypeList model module.
   * @module invoker/model/InlineResponse2002TypeList
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2002TypeList</code>.
   * @alias module:invoker/model/InlineResponse2002TypeList
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2002TypeList</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2002TypeList} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2002TypeList} The populated <code>InlineResponse2002TypeList</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('label')) {
        obj['label'] = ApiClient.convertToType(data['label'], 'String');
      }
    }
    return obj;
  }

  /**
   * 类型ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 类型名称
   * @member {String} label
   */
  exports.prototype['label'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],29:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ObjectConfig', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ObjectConfig'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2003 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ObjectConfig, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ObjectConfig, Ri) {
  'use strict';




  /**
   * The InlineResponse2003 model module.
   * @module invoker/model/InlineResponse2003
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2003</code>.
   * @alias module:invoker/model/InlineResponse2003
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2003</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2003} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2003} The populated <code>InlineResponse2003</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ObjectConfig.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/ObjectConfig} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ObjectConfig":37,"./Ri":45}],30:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ObjectConfig', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ObjectConfig'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2004 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ObjectConfig, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ObjectConfig, Ri) {
  'use strict';




  /**
   * The InlineResponse2004 model module.
   * @module invoker/model/InlineResponse2004
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2004</code>.
   * @alias module:invoker/model/InlineResponse2004
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2004</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2004} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2004} The populated <code>InlineResponse2004</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], [ObjectConfig]);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {Array.<module:invoker/model/ObjectConfig>} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ObjectConfig":37,"./Ri":45}],31:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ApiInfo', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ApiInfo'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2005 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ApiInfo, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ApiInfo, Ri) {
  'use strict';




  /**
   * The InlineResponse2005 model module.
   * @module invoker/model/InlineResponse2005
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2005</code>.
   * @alias module:invoker/model/InlineResponse2005
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2005</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2005} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2005} The populated <code>InlineResponse2005</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], [ApiInfo]);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {Array.<module:invoker/model/ApiInfo>} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ApiInfo":12,"./Ri":45}],32:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/CustomResult', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./CustomResult'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2006 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.CustomResult, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, CustomResult, Ri) {
  'use strict';




  /**
   * The InlineResponse2006 model module.
   * @module invoker/model/InlineResponse2006
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2006</code>.
   * @alias module:invoker/model/InlineResponse2006
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2006</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2006} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2006} The populated <code>InlineResponse2006</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = CustomResult.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/CustomResult} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./CustomResult":15,"./Ri":45}],33:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ResultDetail', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ResultDetail'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2007 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ResultDetail, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ResultDetail, Ri) {
  'use strict';




  /**
   * The InlineResponse2007 model module.
   * @module invoker/model/InlineResponse2007
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2007</code>.
   * @alias module:invoker/model/InlineResponse2007
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2007</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2007} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2007} The populated <code>InlineResponse2007</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ResultDetail.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/ResultDetail} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ResultDetail":44,"./Ri":45}],34:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ObjectDetail', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ObjectDetail'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2008 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ObjectDetail, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ObjectDetail, Ri) {
  'use strict';




  /**
   * The InlineResponse2008 model module.
   * @module invoker/model/InlineResponse2008
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2008</code>.
   * @alias module:invoker/model/InlineResponse2008
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2008</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2008} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2008} The populated <code>InlineResponse2008</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ObjectDetail.constructFromObject(data['d']);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {module:invoker/model/ObjectDetail} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ObjectDetail":38,"./Ri":45}],35:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ObjectInfo', 'invoker/model/Ri'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ObjectInfo'), require('./Ri'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse2009 = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ObjectInfo, root.SwaggerJsClient.Ri);
  }
}(this, function(ApiClient, ObjectInfo, Ri) {
  'use strict';




  /**
   * The InlineResponse2009 model module.
   * @module invoker/model/InlineResponse2009
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse2009</code>.
   * @alias module:invoker/model/InlineResponse2009
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse2009</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse2009} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse2009} The populated <code>InlineResponse2009</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('ri')) {
        obj['ri'] = Ri.constructFromObject(data['ri']);
      }
      if (data.hasOwnProperty('d')) {
        obj['d'] = ApiClient.convertToType(data['d'], [ObjectInfo]);
      }
    }
    return obj;
  }

  /**
   * @member {module:invoker/model/Ri} ri
   */
  exports.prototype['ri'] = undefined;
  /**
   * @member {Array.<module:invoker/model/ObjectInfo>} d
   */
  exports.prototype['d'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ObjectInfo":39,"./Ri":45}],36:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.InlineResponse200D = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The InlineResponse200D model module.
   * @module invoker/model/InlineResponse200D
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>InlineResponse200D</code>.
   * @alias module:invoker/model/InlineResponse200D
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>InlineResponse200D</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/InlineResponse200D} obj Optional instance to populate.
   * @return {module:invoker/model/InlineResponse200D} The populated <code>InlineResponse200D</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('object')) {
        obj['object'] = ApiClient.convertToType(data['object'], Object);
      }
    }
    return obj;
  }

  /**
   * 对象类型
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * 更具对象类型填充对象
   * @member {Object} object
   */
  exports.prototype['object'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],37:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/ObjectParam'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ObjectParam'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ObjectConfig = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.ObjectParam);
  }
}(this, function(ApiClient, ObjectParam) {
  'use strict';




  /**
   * The ObjectConfig model module.
   * @module invoker/model/ObjectConfig
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ObjectConfig</code>.
   * 标准对象配置信息
   * @alias module:invoker/model/ObjectConfig
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>ObjectConfig</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ObjectConfig} obj Optional instance to populate.
   * @return {module:invoker/model/ObjectConfig} The populated <code>ObjectConfig</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('label')) {
        obj['label'] = ApiClient.convertToType(data['label'], 'String');
      }
      if (data.hasOwnProperty('params')) {
        obj['params'] = ApiClient.convertToType(data['params'], [ObjectParam]);
      }
    }
    return obj;
  }

  /**
   * 配置ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 配置名称
   * @member {String} label
   */
  exports.prototype['label'] = undefined;
  /**
   * 字段列表
   * @member {Array.<module:invoker/model/ObjectParam>} params
   */
  exports.prototype['params'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./ObjectParam":40}],38:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ObjectDetail = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ObjectDetail model module.
   * @module invoker/model/ObjectDetail
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ObjectDetail</code>.
   * 对象详情
   * @alias module:invoker/model/ObjectDetail
   * @class
   */
  var exports = function() {
    var _this = this;










  };

  /**
   * Constructs a <code>ObjectDetail</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ObjectDetail} obj Optional instance to populate.
   * @return {module:invoker/model/ObjectDetail} The populated <code>ObjectDetail</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('sendUserID')) {
        obj['sendUserID'] = ApiClient.convertToType(data['sendUserID'], 'String');
      }
      if (data.hasOwnProperty('sendUserName')) {
        obj['sendUserName'] = ApiClient.convertToType(data['sendUserName'], 'String');
      }
      if (data.hasOwnProperty('sendTime')) {
        obj['sendTime'] = ApiClient.convertToType(data['sendTime'], 'String');
      }
      if (data.hasOwnProperty('messageID')) {
        obj['messageID'] = ApiClient.convertToType(data['messageID'], 'String');
      }
      if (data.hasOwnProperty('meetingID')) {
        obj['meetingID'] = ApiClient.convertToType(data['meetingID'], 'String');
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], Object);
      }
    }
    return obj;
  }

  /**
   * 对象ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 对象名称
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * 对象类型
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * 发送者用户ID
   * @member {String} sendUserID
   */
  exports.prototype['sendUserID'] = undefined;
  /**
   * 发送者用户名
   * @member {String} sendUserName
   */
  exports.prototype['sendUserName'] = undefined;
  /**
   * 发送时间
   * @member {String} sendTime
   */
  exports.prototype['sendTime'] = undefined;
  /**
   * 消息ID
   * @member {String} messageID
   */
  exports.prototype['messageID'] = undefined;
  /**
   * 会战ID
   * @member {String} meetingID
   */
  exports.prototype['meetingID'] = undefined;
  /**
   * 数据内容
   * @member {Object} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],39:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ObjectInfo = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ObjectInfo model module.
   * @module invoker/model/ObjectInfo
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ObjectInfo</code>.
   * 对象信息
   * @alias module:invoker/model/ObjectInfo
   * @class
   */
  var exports = function() {
    var _this = this;









  };

  /**
   * Constructs a <code>ObjectInfo</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ObjectInfo} obj Optional instance to populate.
   * @return {module:invoker/model/ObjectInfo} The populated <code>ObjectInfo</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('sendUserID')) {
        obj['sendUserID'] = ApiClient.convertToType(data['sendUserID'], 'String');
      }
      if (data.hasOwnProperty('sendUserName')) {
        obj['sendUserName'] = ApiClient.convertToType(data['sendUserName'], 'String');
      }
      if (data.hasOwnProperty('sendTime')) {
        obj['sendTime'] = ApiClient.convertToType(data['sendTime'], 'String');
      }
      if (data.hasOwnProperty('messageID')) {
        obj['messageID'] = ApiClient.convertToType(data['messageID'], 'String');
      }
      if (data.hasOwnProperty('meetingID')) {
        obj['meetingID'] = ApiClient.convertToType(data['meetingID'], 'String');
      }
    }
    return obj;
  }

  /**
   * 对象ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 对象名称
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * 对象类型
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * 发送者用户ID
   * @member {String} sendUserID
   */
  exports.prototype['sendUserID'] = undefined;
  /**
   * 发送者用户名
   * @member {String} sendUserName
   */
  exports.prototype['sendUserName'] = undefined;
  /**
   * 发送时间
   * @member {String} sendTime
   */
  exports.prototype['sendTime'] = undefined;
  /**
   * 消息ID
   * @member {String} messageID
   */
  exports.prototype['messageID'] = undefined;
  /**
   * 会战ID
   * @member {String} meetingID
   */
  exports.prototype['meetingID'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],40:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ObjectParam = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ObjectParam model module.
   * @module invoker/model/ObjectParam
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ObjectParam</code>.
   * 标准对象字段信息
   * @alias module:invoker/model/ObjectParam
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>ObjectParam</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ObjectParam} obj Optional instance to populate.
   * @return {module:invoker/model/ObjectParam} The populated <code>ObjectParam</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('label')) {
        obj['label'] = ApiClient.convertToType(data['label'], 'String');
      }
    }
    return obj;
  }

  /**
   * 字段ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 字段名称
   * @member {String} label
   */
  exports.prototype['label'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],41:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/Params4ApiInner'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Params4ApiInner'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.Params4Api = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.Params4ApiInner);
  }
}(this, function(ApiClient, Params4ApiInner) {
  'use strict';




  /**
   * The Params4Api model module.
   * @module invoker/model/Params4Api
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Params4Api</code>.
   * @alias module:invoker/model/Params4Api
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Params4Api</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/Params4Api} obj Optional instance to populate.
   * @return {module:invoker/model/Params4Api} The populated <code>Params4Api</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, 'Params4ApiInner');

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":4,"./Params4ApiInner":42}],42:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient', 'invoker/model/Params4ApiInnerFrom'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Params4ApiInnerFrom'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.Params4ApiInner = factory(root.SwaggerJsClient.ApiClient, root.SwaggerJsClient.Params4ApiInnerFrom);
  }
}(this, function(ApiClient, Params4ApiInnerFrom) {
  'use strict';




  /**
   * The Params4ApiInner model module.
   * @module invoker/model/Params4ApiInner
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Params4ApiInner</code>.
   * @alias module:invoker/model/Params4ApiInner
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>Params4ApiInner</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/Params4ApiInner} obj Optional instance to populate.
   * @return {module:invoker/model/Params4ApiInner} The populated <code>Params4ApiInner</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('from')) {
        obj['from'] = ApiClient.convertToType(data['from'], [Params4ApiInnerFrom]);
      }
    }
    return obj;
  }

  /**
   * 目标API字段ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 来源数据信息
   * @member {Array.<module:invoker/model/Params4ApiInnerFrom>} from
   */
  exports.prototype['from'] = undefined;



  return exports;
}));



},{"../ApiClient":4,"./Params4ApiInnerFrom":43}],43:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.Params4ApiInnerFrom = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Params4ApiInnerFrom model module.
   * @module invoker/model/Params4ApiInnerFrom
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Params4ApiInnerFrom</code>.
   * @alias module:invoker/model/Params4ApiInnerFrom
   * @class
   */
  var exports = function() {
    var _this = this;





  };

  /**
   * Constructs a <code>Params4ApiInnerFrom</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/Params4ApiInnerFrom} obj Optional instance to populate.
   * @return {module:invoker/model/Params4ApiInnerFrom} The populated <code>Params4ApiInnerFrom</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'String');
      }
      if (data.hasOwnProperty('objectID')) {
        obj['objectID'] = ApiClient.convertToType(data['objectID'], 'String');
      }
      if (data.hasOwnProperty('objectType')) {
        obj['objectType'] = ApiClient.convertToType(data['objectType'], 'String');
      }
    }
    return obj;
  }

  /**
   * 来源数据字段ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 来源数据字段值
   * @member {String} value
   */
  exports.prototype['value'] = undefined;
  /**
   * 来源数据主体id
   * @member {String} objectID
   */
  exports.prototype['objectID'] = undefined;
  /**
   * 来源数据主体类型
   * @member {String} objectType
   */
  exports.prototype['objectType'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],44:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.ResultDetail = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ResultDetail model module.
   * @module invoker/model/ResultDetail
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ResultDetail</code>.
   * 返回数据详情
   * @alias module:invoker/model/ResultDetail
   * @class
   */
  var exports = function() {
    var _this = this;














  };

  /**
   * Constructs a <code>ResultDetail</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/ResultDetail} obj Optional instance to populate.
   * @return {module:invoker/model/ResultDetail} The populated <code>ResultDetail</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('userID')) {
        obj['userID'] = ApiClient.convertToType(data['userID'], 'String');
      }
      if (data.hasOwnProperty('userName')) {
        obj['userName'] = ApiClient.convertToType(data['userName'], 'String');
      }
      if (data.hasOwnProperty('srcSystemID')) {
        obj['srcSystemID'] = ApiClient.convertToType(data['srcSystemID'], 'String');
      }
      if (data.hasOwnProperty('srcSystemTitle')) {
        obj['srcSystemTitle'] = ApiClient.convertToType(data['srcSystemTitle'], 'String');
      }
      if (data.hasOwnProperty('dstSystemID')) {
        obj['dstSystemID'] = ApiClient.convertToType(data['dstSystemID'], 'String');
      }
      if (data.hasOwnProperty('dstSystemTitle')) {
        obj['dstSystemTitle'] = ApiClient.convertToType(data['dstSystemTitle'], 'String');
      }
      if (data.hasOwnProperty('api')) {
        obj['api'] = ApiClient.convertToType(data['api'], 'String');
      }
      if (data.hasOwnProperty('method')) {
        obj['method'] = ApiClient.convertToType(data['method'], 'String');
      }
      if (data.hasOwnProperty('params')) {
        obj['params'] = ApiClient.convertToType(data['params'], Object);
      }
      if (data.hasOwnProperty('resultInfo')) {
        obj['resultInfo'] = ApiClient.convertToType(data['resultInfo'], Object);
      }
      if (data.hasOwnProperty('dict')) {
        obj['dict'] = ApiClient.convertToType(data['dict'], Object);
      }
      if (data.hasOwnProperty('data')) {
        obj['data'] = ApiClient.convertToType(data['data'], [Object]);
      }
    }
    return obj;
  }

  /**
   * 返回数据ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * 操作人ID
   * @member {String} userID
   */
  exports.prototype['userID'] = undefined;
  /**
   * 操作人名称
   * @member {String} userName
   */
  exports.prototype['userName'] = undefined;
  /**
   * 起始系统ID
   * @member {String} srcSystemID
   */
  exports.prototype['srcSystemID'] = undefined;
  /**
   * 起始系统名称
   * @member {String} srcSystemTitle
   */
  exports.prototype['srcSystemTitle'] = undefined;
  /**
   * 目的系统ID
   * @member {String} dstSystemID
   */
  exports.prototype['dstSystemID'] = undefined;
  /**
   * 目的系统名称
   * @member {String} dstSystemTitle
   */
  exports.prototype['dstSystemTitle'] = undefined;
  /**
   * 目的系统应用api hash
   * @member {String} api
   */
  exports.prototype['api'] = undefined;
  /**
   * 目的系统应用方法
   * @member {String} method
   */
  exports.prototype['method'] = undefined;
  /**
   * 请求数据
   * @member {Object} params
   */
  exports.prototype['params'] = undefined;
  /**
   * 返回数据信息
   * @member {Object} resultInfo
   */
  exports.prototype['resultInfo'] = undefined;
  /**
   * 返回数据字典
   * @member {Object} dict
   */
  exports.prototype['dict'] = undefined;
  /**
   * 返回数据
   * @member {Array.<Object>} data
   */
  exports.prototype['data'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],45:[function(require,module,exports){
/**
 * 协同会战
 * 协同会战接口
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['invoker/ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.SwaggerJsClient) {
      root.SwaggerJsClient = {};
    }
    root.SwaggerJsClient.Ri = factory(root.SwaggerJsClient.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Ri model module.
   * @module invoker/model/Ri
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Ri</code>.
   * 返回状态信息
   * @alias module:invoker/model/Ri
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>Ri</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:invoker/model/Ri} obj Optional instance to populate.
   * @return {module:invoker/model/Ri} The populated <code>Ri</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('rc')) {
        obj['rc'] = ApiClient.convertToType(data['rc'], 'Number');
      }
      if (data.hasOwnProperty('msg')) {
        obj['msg'] = ApiClient.convertToType(data['msg'], 'String');
      }
    }
    return obj;
  }

  /**
   * 返回码，1为成功
   * @member {Number} rc
   */
  exports.prototype['rc'] = undefined;
  /**
   * 返回状态描述
   * @member {String} msg
   */
  exports.prototype['msg'] = undefined;



  return exports;
}));



},{"../ApiClient":4}],46:[function(require,module,exports){

},{}],47:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],48:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":47,"ieee754":49}],49:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}]},{},[11])(11)
});