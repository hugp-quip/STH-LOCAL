(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
//var _default = exports["default"] = Godot;
(function () {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = "function" == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw a.code = "MODULE_NOT_FOUND", a;
        }
        var p = n[i] = {
          exports: {}
        };
        e[i][0].call(p.exports, function (r) {
          var n = e[i][1][r];
          return o(n || r);
        }, p, p.exports, r, e, n, t);
      }
      return n[i].exports;
    }
    for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
    return o;
  }
  return r;
})()({
  1: [function (require, module, exports) {
    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout() {
      throw new Error('clearTimeout has not been defined');
    }
    (function () {
      try {
        if (typeof setTimeout === 'function') {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === 'function') {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
          // Some versions of I.E. have different rules for clearTimeout vs setTimeout
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }
    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function (name) {
      return [];
    };
    process.binding = function (name) {
      throw new Error('process.binding is not supported');
    };
    process.cwd = function () {
      return '/';
    };
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function () {
      return 0;
    };
  }, {}],
  2: [function (require, module, exports) {
    (function (setImmediate, clearImmediate) {
      (function () {
        var nextTick = require('process/browser.js').nextTick;
        var apply = Function.prototype.apply;
        var slice = Array.prototype.slice;
        var immediateIds = {};
        var nextImmediateId = 0;

        // DOM APIs, for completeness

        exports.setTimeout = function () {
          return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
        };
        exports.setInterval = function () {
          return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
        };
        exports.clearTimeout = exports.clearInterval = function (timeout) {
          timeout.close();
        };
        function Timeout(id, clearFn) {
          this._id = id;
          this._clearFn = clearFn;
        }
        Timeout.prototype.unref = Timeout.prototype.ref = function () {};
        Timeout.prototype.close = function () {
          this._clearFn.call(window, this._id);
        };

        // Does not start the time, just sets up the members needed.
        exports.enroll = function (item, msecs) {
          clearTimeout(item._idleTimeoutId);
          item._idleTimeout = msecs;
        };
        exports.unenroll = function (item) {
          clearTimeout(item._idleTimeoutId);
          item._idleTimeout = -1;
        };
        exports._unrefActive = exports.active = function (item) {
          clearTimeout(item._idleTimeoutId);
          var msecs = item._idleTimeout;
          if (msecs >= 0) {
            item._idleTimeoutId = setTimeout(function onTimeout() {
              if (item._onTimeout) item._onTimeout();
            }, msecs);
          }
        };

        // That's not how node.js implements it but the exposed api is the same.
        exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function (fn) {
          var id = nextImmediateId++;
          var args = arguments.length < 2 ? false : slice.call(arguments, 1);
          immediateIds[id] = true;
          nextTick(function onNextTick() {
            if (immediateIds[id]) {
              // fn.call() is faster so we optimize for the common use-case
              // @see http://jsperf.com/call-apply-segu
              if (args) {
                fn.apply(null, args);
              } else {
                fn.call(null);
              }
              // Prevent ids from leaking
              exports.clearImmediate(id);
            }
          });
          return id;
        };
        exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function (id) {
          delete immediateIds[id];
        };
      }).call(this);
    }).call(this, require("timers").setImmediate, require("timers").clearImmediate);
  }, {
    "process/browser.js": 1,
    "timers": 2
  }],
  3: [function (require, module, exports) {
    (function (process, setImmediate) {
      (function () {
        "use strict";

        function _construct(t, e, r) {
          if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
          var o = [null];
          o.push.apply(o, e);
          var p = new (t.bind.apply(t, o))();
          return r && _setPrototypeOf(p, r.prototype), p;
        }
        function _setPrototypeOf(t, e) {
          return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
            return t.__proto__ = e, t;
          }, _setPrototypeOf(t, e);
        }
        function _isNativeReflectConstruct() {
          try {
            var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
          } catch (t) {}
          return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
            return !!t;
          })();
        }
        function _regenerator() {
          /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */var e,
            t,
            r = "function" == typeof Symbol ? Symbol : {},
            n = r.iterator || "@@iterator",
            o = r.toStringTag || "@@toStringTag";
          function i(r, n, o, i) {
            var c = n && n.prototype instanceof Generator ? n : Generator,
              u = Object.create(c.prototype);
            return _regeneratorDefine2(u, "_invoke", function (r, n, o) {
              var i,
                c,
                u,
                f = 0,
                p = o || [],
                y = !1,
                G = {
                  p: 0,
                  n: 0,
                  v: e,
                  a: d,
                  f: d.bind(e, 4),
                  d: function d(t, r) {
                    return i = t, c = 0, u = e, G.n = r, a;
                  }
                };
              function d(r, n) {
                for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
                  var o,
                    i = p[t],
                    d = G.p,
                    l = i[2];
                  r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
                }
                if (o || r > 1) return a;
                throw y = !0, n;
              }
              return function (o, p, l) {
                if (f > 1) throw TypeError("Generator is already running");
                for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
                  i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
                  try {
                    if (f = 2, i) {
                      if (c || (o = "next"), t = i[o]) {
                        if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                        if (!t.done) return t;
                        u = t.value, c < 2 && (c = 0);
                      } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                      i = e;
                    } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
                  } catch (t) {
                    i = e, c = 1, u = t;
                  } finally {
                    f = 1;
                  }
                }
                return {
                  value: t,
                  done: y
                };
              };
            }(r, o, i), !0), u;
          }
          var a = {};
          function Generator() {}
          function GeneratorFunction() {}
          function GeneratorFunctionPrototype() {}
          t = Object.getPrototypeOf;
          var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () {
              return this;
            }), t),
            u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
          function f(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
          }
          return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () {
            return this;
          }), _regeneratorDefine2(u, "toString", function () {
            return "[object Generator]";
          }), (_regenerator = function _regenerator() {
            return {
              w: i,
              m: f
            };
          })();
        }
        function _regeneratorDefine2(e, r, n, t) {
          var i = Object.defineProperty;
          try {
            i({}, "", {});
          } catch (e) {
            i = 0;
          }
          _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) {
            function o(r, n) {
              _regeneratorDefine2(e, r, function (e) {
                return this._invoke(r, n, e);
              });
            }
            r ? i ? i(e, r, {
              value: n,
              enumerable: !t,
              configurable: !t,
              writable: !t
            }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
          }, _regeneratorDefine2(e, r, n, t);
        }
        function asyncGeneratorStep(n, t, e, r, o, a, c) {
          try {
            var i = n[a](c),
              u = i.value;
          } catch (n) {
            return void e(n);
          }
          i.done ? t(u) : Promise.resolve(u).then(r, o);
        }
        function _asyncToGenerator(n) {
          return function () {
            var t = this,
              e = arguments;
            return new Promise(function (r, o) {
              var a = n.apply(t, e);
              function _next(n) {
                asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
              }
              function _throw(n) {
                asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
              }
              _next(void 0);
            });
          };
        }
        function _createForOfIteratorHelper(r, e) {
          var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
          if (!t) {
            if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
              t && (r = t);
              var _n = 0,
                F = function F() {};
              return {
                s: F,
                n: function n() {
                  return _n >= r.length ? {
                    done: !0
                  } : {
                    done: !1,
                    value: r[_n++]
                  };
                },
                e: function e(r) {
                  throw r;
                },
                f: F
              };
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
          }
          var o,
            a = !0,
            u = !1;
          return {
            s: function s() {
              t = t.call(r);
            },
            n: function n() {
              var r = t.next();
              return a = r.done, r;
            },
            e: function e(r) {
              u = !0, o = r;
            },
            f: function f() {
              try {
                a || null == t["return"] || t["return"]();
              } finally {
                if (u) throw o;
              }
            }
          };
        }
        function _defineProperties(e, r) {
          for (var t = 0; t < r.length; t++) {
            var o = r[t];
            o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
          }
        }
        function _createClass(e, r, t) {
          return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
            writable: !1
          }), e;
        }
        function _toPropertyKey(t) {
          var i = _toPrimitive(t, "string");
          return "symbol" == _typeof(i) ? i : i + "";
        }
        function _toPrimitive(t, r) {
          if ("object" != _typeof(t) || !t) return t;
          var e = t[Symbol.toPrimitive];
          if (void 0 !== e) {
            var i = e.call(t, r || "default");
            if ("object" != _typeof(i)) return i;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === r ? String : Number)(t);
        }
        function _classCallCheck(a, n) {
          if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
        }
        function _toConsumableArray(r) {
          return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
        }
        function _nonIterableSpread() {
          throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        function _unsupportedIterableToArray(r, a) {
          if (r) {
            if ("string" == typeof r) return _arrayLikeToArray(r, a);
            var t = {}.toString.call(r).slice(8, -1);
            return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
          }
        }
        function _iterableToArray(r) {
          if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
        }
        function _arrayWithoutHoles(r) {
          if (Array.isArray(r)) return _arrayLikeToArray(r);
        }
        function _arrayLikeToArray(r, a) {
          (null == a || a > r.length) && (a = r.length);
          for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
          return n;
        }
        function _typeof(o) {
          "@babel/helpers - typeof";

          return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
            return typeof o;
          } : function (o) {
            return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
          }, _typeof(o);
        }
        var Godot = function (_document$currentScri) {
          var _scriptName = typeof document != 'undefined' ? (_document$currentScri = document.currentScript) === null || _document$currentScri === void 0 ? void 0 : _document$currentScri.src : undefined;
          return function () {
            var moduleArg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var moduleRtn;
            var Module = moduleArg;
            var readyPromiseResolve, readyPromiseReject;
            var readyPromise = new Promise(function (resolve, reject) {
              readyPromiseResolve = resolve;
              readyPromiseReject = reject;
            });
            var ENVIRONMENT_IS_WEB = (typeof window === "undefined" ? "undefined" : _typeof(window)) == "object";
            var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
            var ENVIRONMENT_IS_NODE = (typeof process === "undefined" ? "undefined" : _typeof(process)) == "object" && _typeof(process.versions) == "object" && typeof process.versions.node == "string";
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = function quit_(status, toThrow) {
              throw toThrow;
            };
            var scriptDirectory = "";
            function locateFile(path) {
              if (Module["locateFile"]) {
                return Module["locateFile"](path, scriptDirectory);
              }
              return scriptDirectory + path;
            }
            var readAsync, readBinary;
            if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
              if (ENVIRONMENT_IS_WORKER) {
                scriptDirectory = self.location.href;
              } else if (typeof document != "undefined" && document.currentScript) {
                scriptDirectory = document.currentScript.src;
              }
              if (_scriptName) {
                scriptDirectory = _scriptName;
              }
              if (scriptDirectory.startsWith("blob:")) {
                scriptDirectory = "";
              } else {
                scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
              }
              {
                if (ENVIRONMENT_IS_WORKER) {
                  readBinary = function readBinary(url) {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    xhr.responseType = "arraybuffer";
                    xhr.send(null);
                    return new Uint8Array(xhr.response);
                  };
                }
                readAsync = function readAsync(url) {
                  return fetch(url, {
                    credentials: "same-origin"
                  }).then(function (response) {
                    if (response.ok) {
                      return response.arrayBuffer();
                    }
                    return Promise.reject(new Error(response.status + " : " + response.url));
                  });
                };
              }
            } else {}
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.error.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;
            var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAP64, HEAPU64, HEAPF64;
            function updateMemoryViews() {
              var b = wasmMemory.buffer;
              Module["HEAP8"] = HEAP8 = new Int8Array(b);
              Module["HEAP16"] = HEAP16 = new Int16Array(b);
              Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
              Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
              Module["HEAP32"] = HEAP32 = new Int32Array(b);
              Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
              Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
              Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
              Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
              Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
            }
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATEXIT__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;
            var runtimeExited = false;
            function preRun() {
              if (Module["preRun"]) {
                if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                while (Module["preRun"].length) {
                  addOnPreRun(Module["preRun"].shift());
                }
              }
              callRuntimeCallbacks(__ATPRERUN__);
            }
            function initRuntime() {
              runtimeInitialized = true;
              if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
              FS.ignorePermissions = false;
              TTY.init();
              callRuntimeCallbacks(__ATINIT__);
            }
            function preMain() {
              callRuntimeCallbacks(__ATMAIN__);
            }
            function exitRuntime() {
              _funcs_on_exit();
              callRuntimeCallbacks(__ATEXIT__);
              FS.quit();
              TTY.shutdown();
              IDBFS.quit();
              runtimeExited = true;
            }
            function postRun() {
              if (Module["postRun"]) {
                if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                while (Module["postRun"].length) {
                  addOnPostRun(Module["postRun"].shift());
                }
              }
              callRuntimeCallbacks(__ATPOSTRUN__);
            }
            function addOnPreRun(cb) {
              __ATPRERUN__.unshift(cb);
            }
            function addOnInit(cb) {
              __ATINIT__.unshift(cb);
            }
            function addOnPostRun(cb) {
              __ATPOSTRUN__.unshift(cb);
            }
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;
            function getUniqueRunDependency(id) {
              return id;
            }
            function addRunDependency(id) {
              var _Module$monitorRunDep;
              runDependencies++;
              (_Module$monitorRunDep = Module["monitorRunDependencies"]) === null || _Module$monitorRunDep === void 0 || _Module$monitorRunDep.call(Module, runDependencies);
            }
            function removeRunDependency(id) {
              var _Module$monitorRunDep2;
              runDependencies--;
              (_Module$monitorRunDep2 = Module["monitorRunDependencies"]) === null || _Module$monitorRunDep2 === void 0 || _Module$monitorRunDep2.call(Module, runDependencies);
              if (runDependencies == 0) {
                if (runDependencyWatcher !== null) {
                  clearInterval(runDependencyWatcher);
                  runDependencyWatcher = null;
                }
                if (dependenciesFulfilled) {
                  var callback = dependenciesFulfilled;
                  dependenciesFulfilled = null;
                  callback();
                }
              }
            }
            function abort(what) {
              var _Module$onAbort;
              (_Module$onAbort = Module["onAbort"]) === null || _Module$onAbort === void 0 || _Module$onAbort.call(Module, what);
              what = "Aborted(" + what + ")";
              err(what);
              ABORT = true;
              EXITSTATUS = 1;
              what += ". Build with -sASSERTIONS for more info.";
              var e = new WebAssembly.RuntimeError(what);
              readyPromiseReject(e);
              throw e;
            }
            var dataURIPrefix = "data:application/octet-stream;base64,";
            var isDataURI = function isDataURI(filename) {
              return filename.startsWith(dataURIPrefix);
            };
            function findWasmBinary() {
              var f = "godot.web.template_debug.wasm32.nothreads.wasm";
              if (!isDataURI(f)) {
                return locateFile(f);
              }
              return f;
            }
            var wasmBinaryFile;
            function getBinarySync(file) {
              if (file == wasmBinaryFile && wasmBinary) {
                return new Uint8Array(wasmBinary);
              }
              if (readBinary) {
                return readBinary(file);
              }
              throw "both async and sync fetching of the wasm failed";
            }
            function getBinaryPromise(binaryFile) {
              if (!wasmBinary) {
                return readAsync(binaryFile).then(function (response) {
                  return new Uint8Array(response);
                }, function () {
                  return getBinarySync(binaryFile);
                });
              }
              return Promise.resolve().then(function () {
                return getBinarySync(binaryFile);
              });
            }
            function instantiateArrayBuffer(binaryFile, imports, receiver) {
              return getBinaryPromise(binaryFile).then(function (binary) {
                return WebAssembly.instantiate(binary, imports);
              }).then(receiver, function (reason) {
                err("failed to asynchronously prepare wasm: ".concat(reason));
                abort(reason);
              });
            }
            function instantiateAsync(binary, binaryFile, imports, callback) {
              if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && typeof fetch == "function") {
                return fetch(binaryFile, {
                  credentials: "same-origin"
                }).then(function (response) {
                  var result = WebAssembly.instantiateStreaming(response, imports);
                  return result.then(callback, function (reason) {
                    err("wasm streaming compile failed: ".concat(reason));
                    err("falling back to ArrayBuffer instantiation");
                    return instantiateArrayBuffer(binaryFile, imports, callback);
                  });
                });
              }
              return instantiateArrayBuffer(binaryFile, imports, callback);
            }
            function getWasmImports() {
              return {
                a: wasmImports
              };
            }
            function createWasm() {
              var info = getWasmImports();
              function receiveInstance(instance, module) {
                wasmExports = instance.exports;
                wasmMemory = wasmExports["hf"];
                updateMemoryViews();
                wasmTable = wasmExports["rf"];
                addOnInit(wasmExports["jf"]);
                removeRunDependency("wasm-instantiate");
                return wasmExports;
              }
              addRunDependency("wasm-instantiate");
              function receiveInstantiationResult(result) {
                receiveInstance(result["instance"]);
              }
              if (Module["instantiateWasm"]) {
                try {
                  return Module["instantiateWasm"](info, receiveInstance);
                } catch (e) {
                  err("Module.instantiateWasm callback failed with error: ".concat(e));
                  readyPromiseReject(e);
                }
              }
              if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
              instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult)["catch"](readyPromiseReject);
              return {};
            }
            function ExitStatus(status) {
              this.name = "ExitStatus";
              this.message = "Program terminated with exit(".concat(status, ")");
              this.status = status;
            }
            var callRuntimeCallbacks = function callRuntimeCallbacks(callbacks) {
              while (callbacks.length > 0) {
                callbacks.shift()(Module);
              }
            };
            function getValue(ptr) {
              var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "i8";
              if (type.endsWith("*")) type = "*";
              switch (type) {
                case "i1":
                  return HEAP8[ptr];
                case "i8":
                  return HEAP8[ptr];
                case "i16":
                  return HEAP16[ptr >> 1];
                case "i32":
                  return HEAP32[ptr >> 2];
                case "i64":
                  return HEAP64[ptr >> 3];
                case "float":
                  return HEAPF32[ptr >> 2];
                case "double":
                  return HEAPF64[ptr >> 3];
                case "*":
                  return HEAPU32[ptr >> 2];
                default:
                  abort("invalid type for getValue: ".concat(type));
              }
            }
            var noExitRuntime = Module["noExitRuntime"] || false;
            function setValue(ptr, value) {
              var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "i8";
              if (type.endsWith("*")) type = "*";
              switch (type) {
                case "i1":
                  HEAP8[ptr] = value;
                  break;
                case "i8":
                  HEAP8[ptr] = value;
                  break;
                case "i16":
                  HEAP16[ptr >> 1] = value;
                  break;
                case "i32":
                  HEAP32[ptr >> 2] = value;
                  break;
                case "i64":
                  HEAP64[ptr >> 3] = BigInt(value);
                  break;
                case "float":
                  HEAPF32[ptr >> 2] = value;
                  break;
                case "double":
                  HEAPF64[ptr >> 3] = value;
                  break;
                case "*":
                  HEAPU32[ptr >> 2] = value;
                  break;
                default:
                  abort("invalid type for setValue: ".concat(type));
              }
            }
            var wasmTable;
            var getWasmTableEntry = function getWasmTableEntry(funcPtr) {
              return wasmTable.get(funcPtr);
            };
            var ___call_sighandler = function ___call_sighandler(fp, sig) {
              return getWasmTableEntry(fp)(sig);
            };
            var PATH = {
              isAbs: function isAbs(path) {
                return path.charAt(0) === "/";
              },
              splitPath: function splitPath(filename) {
                var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                return splitPathRe.exec(filename).slice(1);
              },
              normalizeArray: function normalizeArray(parts, allowAboveRoot) {
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                  var last = parts[i];
                  if (last === ".") {
                    parts.splice(i, 1);
                  } else if (last === "..") {
                    parts.splice(i, 1);
                    up++;
                  } else if (up) {
                    parts.splice(i, 1);
                    up--;
                  }
                }
                if (allowAboveRoot) {
                  for (; up; up--) {
                    parts.unshift("..");
                  }
                }
                return parts;
              },
              normalize: function normalize(path) {
                var isAbsolute = PATH.isAbs(path),
                  trailingSlash = path.substr(-1) === "/";
                path = PATH.normalizeArray(path.split("/").filter(function (p) {
                  return !!p;
                }), !isAbsolute).join("/");
                if (!path && !isAbsolute) {
                  path = ".";
                }
                if (path && trailingSlash) {
                  path += "/";
                }
                return (isAbsolute ? "/" : "") + path;
              },
              dirname: function dirname(path) {
                var result = PATH.splitPath(path),
                  root = result[0],
                  dir = result[1];
                if (!root && !dir) {
                  return ".";
                }
                if (dir) {
                  dir = dir.substr(0, dir.length - 1);
                }
                return root + dir;
              },
              basename: function basename(path) {
                if (path === "/") return "/";
                path = PATH.normalize(path);
                path = path.replace(/\/$/, "");
                var lastSlash = path.lastIndexOf("/");
                if (lastSlash === -1) return path;
                return path.substr(lastSlash + 1);
              },
              join: function join() {
                for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) {
                  paths[_key] = arguments[_key];
                }
                return PATH.normalize(paths.join("/"));
              },
              join2: function join2(l, r) {
                return PATH.normalize(l + "/" + r);
              }
            };
            var initRandomFill = function initRandomFill() {
              if ((typeof crypto === "undefined" ? "undefined" : _typeof(crypto)) == "object" && typeof crypto["getRandomValues"] == "function") {
                return function (view) {
                  return crypto.getRandomValues(view);
                };
              } else abort("initRandomDevice");
            };
            var _randomFill = function randomFill(view) {
              return (_randomFill = initRandomFill())(view);
            };
            var PATH_FS = {
              resolve: function resolve() {
                var resolvedPath = "",
                  resolvedAbsolute = false;
                for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                  var path = i >= 0 ? i < 0 || arguments.length <= i ? undefined : arguments[i] : FS.cwd();
                  if (typeof path != "string") {
                    throw new TypeError("Arguments to path.resolve must be strings");
                  } else if (!path) {
                    return "";
                  }
                  resolvedPath = path + "/" + resolvedPath;
                  resolvedAbsolute = PATH.isAbs(path);
                }
                resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function (p) {
                  return !!p;
                }), !resolvedAbsolute).join("/");
                return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
              },
              relative: function relative(from, to) {
                from = PATH_FS.resolve(from).substr(1);
                to = PATH_FS.resolve(to).substr(1);
                function trim(arr) {
                  var start = 0;
                  for (; start < arr.length; start++) {
                    if (arr[start] !== "") break;
                  }
                  var end = arr.length - 1;
                  for (; end >= 0; end--) {
                    if (arr[end] !== "") break;
                  }
                  if (start > end) return [];
                  return arr.slice(start, end - start + 1);
                }
                var fromParts = trim(from.split("/"));
                var toParts = trim(to.split("/"));
                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                  if (fromParts[i] !== toParts[i]) {
                    samePartsLength = i;
                    break;
                  }
                }
                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                  outputParts.push("..");
                }
                outputParts = outputParts.concat(toParts.slice(samePartsLength));
                return outputParts.join("/");
              }
            };
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : undefined;
            var UTF8ArrayToString = function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
              var endIdx = idx + maxBytesToRead;
              var endPtr = idx;
              while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
              if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
              }
              var str = "";
              while (idx < endPtr) {
                var u0 = heapOrArray[idx++];
                if (!(u0 & 128)) {
                  str += String.fromCharCode(u0);
                  continue;
                }
                var u1 = heapOrArray[idx++] & 63;
                if ((u0 & 224) == 192) {
                  str += String.fromCharCode((u0 & 31) << 6 | u1);
                  continue;
                }
                var u2 = heapOrArray[idx++] & 63;
                if ((u0 & 240) == 224) {
                  u0 = (u0 & 15) << 12 | u1 << 6 | u2;
                } else {
                  u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
                }
                if (u0 < 65536) {
                  str += String.fromCharCode(u0);
                } else {
                  var ch = u0 - 65536;
                  str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
                }
              }
              return str;
            };
            var FS_stdin_getChar_buffer = [];
            var lengthBytesUTF8 = function lengthBytesUTF8(str) {
              var len = 0;
              for (var i = 0; i < str.length; ++i) {
                var c = str.charCodeAt(i);
                if (c <= 127) {
                  len++;
                } else if (c <= 2047) {
                  len += 2;
                } else if (c >= 55296 && c <= 57343) {
                  len += 4;
                  ++i;
                } else {
                  len += 3;
                }
              }
              return len;
            };
            var stringToUTF8Array = function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
              if (!(maxBytesToWrite > 0)) return 0;
              var startIdx = outIdx;
              var endIdx = outIdx + maxBytesToWrite - 1;
              for (var i = 0; i < str.length; ++i) {
                var u = str.charCodeAt(i);
                if (u >= 55296 && u <= 57343) {
                  var u1 = str.charCodeAt(++i);
                  u = 65536 + ((u & 1023) << 10) | u1 & 1023;
                }
                if (u <= 127) {
                  if (outIdx >= endIdx) break;
                  heap[outIdx++] = u;
                } else if (u <= 2047) {
                  if (outIdx + 1 >= endIdx) break;
                  heap[outIdx++] = 192 | u >> 6;
                  heap[outIdx++] = 128 | u & 63;
                } else if (u <= 65535) {
                  if (outIdx + 2 >= endIdx) break;
                  heap[outIdx++] = 224 | u >> 12;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63;
                } else {
                  if (outIdx + 3 >= endIdx) break;
                  heap[outIdx++] = 240 | u >> 18;
                  heap[outIdx++] = 128 | u >> 12 & 63;
                  heap[outIdx++] = 128 | u >> 6 & 63;
                  heap[outIdx++] = 128 | u & 63;
                }
              }
              heap[outIdx] = 0;
              return outIdx - startIdx;
            };
            function intArrayFromString(stringy, dontAddNull, length) {
              var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
              var u8array = new Array(len);
              var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
              if (dontAddNull) u8array.length = numBytesWritten;
              return u8array;
            }
            var FS_stdin_getChar = function FS_stdin_getChar() {
              if (!FS_stdin_getChar_buffer.length) {
                var result = null;
                if (typeof window != "undefined" && typeof window.prompt == "function") {
                  result = window.prompt("Input: ");
                  if (result !== null) {
                    result += "\n";
                  }
                } else {}
                if (!result) {
                  return null;
                }
                FS_stdin_getChar_buffer = intArrayFromString(result, true);
              }
              return FS_stdin_getChar_buffer.shift();
            };
            var TTY = {
              ttys: [],
              init: function init() {},
              shutdown: function shutdown() {},
              register: function register(dev, ops) {
                TTY.ttys[dev] = {
                  input: [],
                  output: [],
                  ops: ops
                };
                FS.registerDevice(dev, TTY.stream_ops);
              },
              stream_ops: {
                open: function open(stream) {
                  var tty = TTY.ttys[stream.node.rdev];
                  if (!tty) {
                    throw new FS.ErrnoError(43);
                  }
                  stream.tty = tty;
                  stream.seekable = false;
                },
                close: function close(stream) {
                  stream.tty.ops.fsync(stream.tty);
                },
                fsync: function fsync(stream) {
                  stream.tty.ops.fsync(stream.tty);
                },
                read: function read(stream, buffer, offset, length, pos) {
                  if (!stream.tty || !stream.tty.ops.get_char) {
                    throw new FS.ErrnoError(60);
                  }
                  var bytesRead = 0;
                  for (var i = 0; i < length; i++) {
                    var result;
                    try {
                      result = stream.tty.ops.get_char(stream.tty);
                    } catch (e) {
                      throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                      throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result;
                  }
                  if (bytesRead) {
                    stream.node.timestamp = Date.now();
                  }
                  return bytesRead;
                },
                write: function write(stream, buffer, offset, length, pos) {
                  if (!stream.tty || !stream.tty.ops.put_char) {
                    throw new FS.ErrnoError(60);
                  }
                  try {
                    for (var i = 0; i < length; i++) {
                      stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                    }
                  } catch (e) {
                    throw new FS.ErrnoError(29);
                  }
                  if (length) {
                    stream.node.timestamp = Date.now();
                  }
                  return i;
                }
              },
              default_tty_ops: {
                get_char: function get_char(tty) {
                  return FS_stdin_getChar();
                },
                put_char: function put_char(tty, val) {
                  if (val === null || val === 10) {
                    out(UTF8ArrayToString(tty.output, 0));
                    tty.output = [];
                  } else {
                    if (val != 0) tty.output.push(val);
                  }
                },
                fsync: function fsync(tty) {
                  if (tty.output && tty.output.length > 0) {
                    out(UTF8ArrayToString(tty.output, 0));
                    tty.output = [];
                  }
                },
                ioctl_tcgets: function ioctl_tcgets(tty) {
                  return {
                    c_iflag: 25856,
                    c_oflag: 5,
                    c_cflag: 191,
                    c_lflag: 35387,
                    c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  };
                },
                ioctl_tcsets: function ioctl_tcsets(tty, optional_actions, data) {
                  return 0;
                },
                ioctl_tiocgwinsz: function ioctl_tiocgwinsz(tty) {
                  return [24, 80];
                }
              },
              default_tty1_ops: {
                put_char: function put_char(tty, val) {
                  if (val === null || val === 10) {
                    err(UTF8ArrayToString(tty.output, 0));
                    tty.output = [];
                  } else {
                    if (val != 0) tty.output.push(val);
                  }
                },
                fsync: function fsync(tty) {
                  if (tty.output && tty.output.length > 0) {
                    err(UTF8ArrayToString(tty.output, 0));
                    tty.output = [];
                  }
                }
              }
            };
            var mmapAlloc = function mmapAlloc(size) {
              abort();
            };
            var MEMFS = {
              ops_table: null,
              mount: function mount(_mount) {
                return MEMFS.createNode(null, "/", 16384 | 511, 0);
              },
              createNode: function createNode(parent, name, mode, dev) {
                if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
                  throw new FS.ErrnoError(63);
                }
                MEMFS.ops_table || (MEMFS.ops_table = {
                  dir: {
                    node: {
                      getattr: MEMFS.node_ops.getattr,
                      setattr: MEMFS.node_ops.setattr,
                      lookup: MEMFS.node_ops.lookup,
                      mknod: MEMFS.node_ops.mknod,
                      rename: MEMFS.node_ops.rename,
                      unlink: MEMFS.node_ops.unlink,
                      rmdir: MEMFS.node_ops.rmdir,
                      readdir: MEMFS.node_ops.readdir,
                      symlink: MEMFS.node_ops.symlink
                    },
                    stream: {
                      llseek: MEMFS.stream_ops.llseek
                    }
                  },
                  file: {
                    node: {
                      getattr: MEMFS.node_ops.getattr,
                      setattr: MEMFS.node_ops.setattr
                    },
                    stream: {
                      llseek: MEMFS.stream_ops.llseek,
                      read: MEMFS.stream_ops.read,
                      write: MEMFS.stream_ops.write,
                      allocate: MEMFS.stream_ops.allocate,
                      mmap: MEMFS.stream_ops.mmap,
                      msync: MEMFS.stream_ops.msync
                    }
                  },
                  link: {
                    node: {
                      getattr: MEMFS.node_ops.getattr,
                      setattr: MEMFS.node_ops.setattr,
                      readlink: MEMFS.node_ops.readlink
                    },
                    stream: {}
                  },
                  chrdev: {
                    node: {
                      getattr: MEMFS.node_ops.getattr,
                      setattr: MEMFS.node_ops.setattr
                    },
                    stream: FS.chrdev_stream_ops
                  }
                });
                var node = FS.createNode(parent, name, mode, dev);
                if (FS.isDir(node.mode)) {
                  node.node_ops = MEMFS.ops_table.dir.node;
                  node.stream_ops = MEMFS.ops_table.dir.stream;
                  node.contents = {};
                } else if (FS.isFile(node.mode)) {
                  node.node_ops = MEMFS.ops_table.file.node;
                  node.stream_ops = MEMFS.ops_table.file.stream;
                  node.usedBytes = 0;
                  node.contents = null;
                } else if (FS.isLink(node.mode)) {
                  node.node_ops = MEMFS.ops_table.link.node;
                  node.stream_ops = MEMFS.ops_table.link.stream;
                } else if (FS.isChrdev(node.mode)) {
                  node.node_ops = MEMFS.ops_table.chrdev.node;
                  node.stream_ops = MEMFS.ops_table.chrdev.stream;
                }
                node.timestamp = Date.now();
                if (parent) {
                  parent.contents[name] = node;
                  parent.timestamp = node.timestamp;
                }
                return node;
              },
              getFileDataAsTypedArray: function getFileDataAsTypedArray(node) {
                if (!node.contents) return new Uint8Array(0);
                if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
                return new Uint8Array(node.contents);
              },
              expandFileStorage: function expandFileStorage(node, newCapacity) {
                var prevCapacity = node.contents ? node.contents.length : 0;
                if (prevCapacity >= newCapacity) return;
                var CAPACITY_DOUBLING_MAX = 1024 * 1024;
                newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
                if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
                var oldContents = node.contents;
                node.contents = new Uint8Array(newCapacity);
                if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
              },
              resizeFileStorage: function resizeFileStorage(node, newSize) {
                if (node.usedBytes == newSize) return;
                if (newSize == 0) {
                  node.contents = null;
                  node.usedBytes = 0;
                } else {
                  var oldContents = node.contents;
                  node.contents = new Uint8Array(newSize);
                  if (oldContents) {
                    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
                  }
                  node.usedBytes = newSize;
                }
              },
              node_ops: {
                getattr: function getattr(node) {
                  var attr = {};
                  attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
                  attr.ino = node.id;
                  attr.mode = node.mode;
                  attr.nlink = 1;
                  attr.uid = 0;
                  attr.gid = 0;
                  attr.rdev = node.rdev;
                  if (FS.isDir(node.mode)) {
                    attr.size = 4096;
                  } else if (FS.isFile(node.mode)) {
                    attr.size = node.usedBytes;
                  } else if (FS.isLink(node.mode)) {
                    attr.size = node.link.length;
                  } else {
                    attr.size = 0;
                  }
                  attr.atime = new Date(node.timestamp);
                  attr.mtime = new Date(node.timestamp);
                  attr.ctime = new Date(node.timestamp);
                  attr.blksize = 4096;
                  attr.blocks = Math.ceil(attr.size / attr.blksize);
                  return attr;
                },
                setattr: function setattr(node, attr) {
                  if (attr.mode !== undefined) {
                    node.mode = attr.mode;
                  }
                  if (attr.timestamp !== undefined) {
                    node.timestamp = attr.timestamp;
                  }
                  if (attr.size !== undefined) {
                    MEMFS.resizeFileStorage(node, attr.size);
                  }
                },
                lookup: function lookup(parent, name) {
                  throw FS.genericErrors[44];
                },
                mknod: function mknod(parent, name, mode, dev) {
                  return MEMFS.createNode(parent, name, mode, dev);
                },
                rename: function rename(old_node, new_dir, new_name) {
                  if (FS.isDir(old_node.mode)) {
                    var new_node;
                    try {
                      new_node = FS.lookupNode(new_dir, new_name);
                    } catch (e) {}
                    if (new_node) {
                      for (var i in new_node.contents) {
                        throw new FS.ErrnoError(55);
                      }
                    }
                  }
                  delete old_node.parent.contents[old_node.name];
                  old_node.parent.timestamp = Date.now();
                  old_node.name = new_name;
                  new_dir.contents[new_name] = old_node;
                  new_dir.timestamp = old_node.parent.timestamp;
                },
                unlink: function unlink(parent, name) {
                  delete parent.contents[name];
                  parent.timestamp = Date.now();
                },
                rmdir: function rmdir(parent, name) {
                  var node = FS.lookupNode(parent, name);
                  for (var i in node.contents) {
                    throw new FS.ErrnoError(55);
                  }
                  delete parent.contents[name];
                  parent.timestamp = Date.now();
                },
                readdir: function readdir(node) {
                  var entries = [".", ".."];
                  for (var _i = 0, _Object$keys = Object.keys(node.contents); _i < _Object$keys.length; _i++) {
                    var key = _Object$keys[_i];
                    entries.push(key);
                  }
                  return entries;
                },
                symlink: function symlink(parent, newname, oldpath) {
                  var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
                  node.link = oldpath;
                  return node;
                },
                readlink: function readlink(node) {
                  if (!FS.isLink(node.mode)) {
                    throw new FS.ErrnoError(28);
                  }
                  return node.link;
                }
              },
              stream_ops: {
                read: function read(stream, buffer, offset, length, position) {
                  var contents = stream.node.contents;
                  if (position >= stream.node.usedBytes) return 0;
                  var size = Math.min(stream.node.usedBytes - position, length);
                  if (size > 8 && contents.subarray) {
                    buffer.set(contents.subarray(position, position + size), offset);
                  } else {
                    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
                  }
                  return size;
                },
                write: function write(stream, buffer, offset, length, position, canOwn) {
                  if (buffer.buffer === HEAP8.buffer) {
                    canOwn = false;
                  }
                  if (!length) return 0;
                  var node = stream.node;
                  node.timestamp = Date.now();
                  if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                    if (canOwn) {
                      node.contents = buffer.subarray(offset, offset + length);
                      node.usedBytes = length;
                      return length;
                    } else if (node.usedBytes === 0 && position === 0) {
                      node.contents = buffer.slice(offset, offset + length);
                      node.usedBytes = length;
                      return length;
                    } else if (position + length <= node.usedBytes) {
                      node.contents.set(buffer.subarray(offset, offset + length), position);
                      return length;
                    }
                  }
                  MEMFS.expandFileStorage(node, position + length);
                  if (node.contents.subarray && buffer.subarray) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                  } else {
                    for (var i = 0; i < length; i++) {
                      node.contents[position + i] = buffer[offset + i];
                    }
                  }
                  node.usedBytes = Math.max(node.usedBytes, position + length);
                  return length;
                },
                llseek: function llseek(stream, offset, whence) {
                  var position = offset;
                  if (whence === 1) {
                    position += stream.position;
                  } else if (whence === 2) {
                    if (FS.isFile(stream.node.mode)) {
                      position += stream.node.usedBytes;
                    }
                  }
                  if (position < 0) {
                    throw new FS.ErrnoError(28);
                  }
                  return position;
                },
                allocate: function allocate(stream, offset, length) {
                  MEMFS.expandFileStorage(stream.node, offset + length);
                  stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
                },
                mmap: function mmap(stream, length, position, prot, flags) {
                  if (!FS.isFile(stream.node.mode)) {
                    throw new FS.ErrnoError(43);
                  }
                  var ptr;
                  var allocated;
                  var contents = stream.node.contents;
                  if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
                    allocated = false;
                    ptr = contents.byteOffset;
                  } else {
                    if (position > 0 || position + length < contents.length) {
                      if (contents.subarray) {
                        contents = contents.subarray(position, position + length);
                      } else {
                        contents = Array.prototype.slice.call(contents, position, position + length);
                      }
                    }
                    allocated = true;
                    ptr = mmapAlloc(length);
                    if (!ptr) {
                      throw new FS.ErrnoError(48);
                    }
                    HEAP8.set(contents, ptr);
                  }
                  return {
                    ptr: ptr,
                    allocated: allocated
                  };
                },
                msync: function msync(stream, buffer, offset, length, mmapFlags) {
                  MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
                  return 0;
                }
              }
            };
            var asyncLoad = function asyncLoad(url, onload, onerror, noRunDep) {
              var dep = !noRunDep ? getUniqueRunDependency("al ".concat(url)) : "";
              readAsync(url).then(function (arrayBuffer) {
                onload(new Uint8Array(arrayBuffer));
                if (dep) removeRunDependency(dep);
              }, function (err) {
                if (onerror) {
                  onerror();
                } else {
                  throw "Loading data file \"".concat(url, "\" failed.");
                }
              });
              if (dep) addRunDependency(dep);
            };
            var FS_createDataFile = function FS_createDataFile(parent, name, fileData, canRead, canWrite, canOwn) {
              FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
            };
            var preloadPlugins = Module["preloadPlugins"] || [];
            var FS_handledByPreloadPlugin = function FS_handledByPreloadPlugin(byteArray, fullname, finish, onerror) {
              if (typeof Browser != "undefined") Browser.init();
              var handled = false;
              preloadPlugins.forEach(function (plugin) {
                if (handled) return;
                if (plugin["canHandle"](fullname)) {
                  plugin["handle"](byteArray, fullname, finish, onerror);
                  handled = true;
                }
              });
              return handled;
            };
            var FS_createPreloadedFile = function FS_createPreloadedFile(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
              var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
              var dep = getUniqueRunDependency("cp ".concat(fullname));
              function processData(byteArray) {
                function finish(byteArray) {
                  preFinish === null || preFinish === void 0 || preFinish();
                  if (!dontCreateFile) {
                    FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
                  }
                  onload === null || onload === void 0 || onload();
                  removeRunDependency(dep);
                }
                if (FS_handledByPreloadPlugin(byteArray, fullname, finish, function () {
                  onerror === null || onerror === void 0 || onerror();
                  removeRunDependency(dep);
                })) {
                  return;
                }
                finish(byteArray);
              }
              addRunDependency(dep);
              if (typeof url == "string") {
                asyncLoad(url, processData, onerror);
              } else {
                processData(url);
              }
            };
            var FS_modeStringToFlags = function FS_modeStringToFlags(str) {
              var flagModes = {
                r: 0,
                "r+": 2,
                w: 512 | 64 | 1,
                "w+": 512 | 64 | 2,
                a: 1024 | 64 | 1,
                "a+": 1024 | 64 | 2
              };
              var flags = flagModes[str];
              if (typeof flags == "undefined") {
                throw new Error("Unknown file open mode: ".concat(str));
              }
              return flags;
            };
            var FS_getMode = function FS_getMode(canRead, canWrite) {
              var mode = 0;
              if (canRead) mode |= 292 | 73;
              if (canWrite) mode |= 146;
              return mode;
            };
            var IDBFS = {
              dbs: {},
              indexedDB: function (_indexedDB) {
                function indexedDB() {
                  return _indexedDB.apply(this, arguments);
                }
                indexedDB.toString = function () {
                  return _indexedDB.toString();
                };
                return indexedDB;
              }(function () {
                if (typeof indexedDB != "undefined") return indexedDB;
                var ret = null;
                if ((typeof window === "undefined" ? "undefined" : _typeof(window)) == "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                return ret;
              }),
              DB_VERSION: 21,
              DB_STORE_NAME: "FILE_DATA",
              queuePersist: function queuePersist(mount) {
                function onPersistComplete() {
                  if (mount.idbPersistState === "again") startPersist();else mount.idbPersistState = 0;
                }
                function startPersist() {
                  mount.idbPersistState = "idb";
                  IDBFS.syncfs(mount, false, onPersistComplete);
                }
                if (!mount.idbPersistState) {
                  mount.idbPersistState = setTimeout(startPersist, 0);
                } else if (mount.idbPersistState === "idb") {
                  mount.idbPersistState = "again";
                }
              },
              mount: function mount(_mount2) {
                var _mount2$opts;
                var mnt = MEMFS.mount(_mount2);
                if (_mount2 !== null && _mount2 !== void 0 && (_mount2$opts = _mount2.opts) !== null && _mount2$opts !== void 0 && _mount2$opts.autoPersist) {
                  mnt.idbPersistState = 0;
                  var memfs_node_ops = mnt.node_ops;
                  mnt.node_ops = Object.assign({}, mnt.node_ops);
                  mnt.node_ops.mknod = function (parent, name, mode, dev) {
                    var node = memfs_node_ops.mknod(parent, name, mode, dev);
                    node.node_ops = mnt.node_ops;
                    node.idbfs_mount = mnt.mount;
                    node.memfs_stream_ops = node.stream_ops;
                    node.stream_ops = Object.assign({}, node.stream_ops);
                    node.stream_ops.write = function (stream, buffer, offset, length, position, canOwn) {
                      stream.node.isModified = true;
                      return node.memfs_stream_ops.write(stream, buffer, offset, length, position, canOwn);
                    };
                    node.stream_ops.close = function (stream) {
                      var n = stream.node;
                      if (n.isModified) {
                        IDBFS.queuePersist(n.idbfs_mount);
                        n.isModified = false;
                      }
                      if (n.memfs_stream_ops.close) return n.memfs_stream_ops.close(stream);
                    };
                    return node;
                  };
                  mnt.node_ops.mkdir = function () {
                    return IDBFS.queuePersist(mnt.mount), memfs_node_ops.mkdir.apply(memfs_node_ops, arguments);
                  };
                  mnt.node_ops.rmdir = function () {
                    return IDBFS.queuePersist(mnt.mount), memfs_node_ops.rmdir.apply(memfs_node_ops, arguments);
                  };
                  mnt.node_ops.symlink = function () {
                    return IDBFS.queuePersist(mnt.mount), memfs_node_ops.symlink.apply(memfs_node_ops, arguments);
                  };
                  mnt.node_ops.unlink = function () {
                    return IDBFS.queuePersist(mnt.mount), memfs_node_ops.unlink.apply(memfs_node_ops, arguments);
                  };
                  mnt.node_ops.rename = function () {
                    return IDBFS.queuePersist(mnt.mount), memfs_node_ops.rename.apply(memfs_node_ops, arguments);
                  };
                }
                return mnt;
              },
              syncfs: function syncfs(mount, populate, callback) {
                IDBFS.getLocalSet(mount, function (err, local) {
                  if (err) return callback(err);
                  IDBFS.getRemoteSet(mount, function (err, remote) {
                    if (err) return callback(err);
                    var src = populate ? remote : local;
                    var dst = populate ? local : remote;
                    IDBFS.reconcile(src, dst, callback);
                  });
                });
              },
              quit: function quit() {
                Object.values(IDBFS.dbs).forEach(function (value) {
                  return value.close();
                });
                IDBFS.dbs = {};
              },
              getDB: function getDB(name, callback) {
                var db = IDBFS.dbs[name];
                if (db) {
                  return callback(null, db);
                }
                var req;
                try {
                  req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
                } catch (e) {
                  return callback(e);
                }
                if (!req) {
                  return callback("Unable to connect to IndexedDB");
                }
                req.onupgradeneeded = function (e) {
                  var db = e.target.result;
                  var transaction = e.target.transaction;
                  var fileStore;
                  if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
                    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
                  } else {
                    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
                  }
                  if (!fileStore.indexNames.contains("timestamp")) {
                    fileStore.createIndex("timestamp", "timestamp", {
                      unique: false
                    });
                  }
                };
                req.onsuccess = function () {
                  db = req.result;
                  IDBFS.dbs[name] = db;
                  callback(null, db);
                };
                req.onerror = function (e) {
                  callback(e.target.error);
                  e.preventDefault();
                };
              },
              getLocalSet: function getLocalSet(mount, callback) {
                var entries = {};
                function isRealDir(p) {
                  return p !== "." && p !== "..";
                }
                function toAbsolute(root) {
                  return function (p) {
                    return PATH.join2(root, p);
                  };
                }
                var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
                while (check.length) {
                  var path = check.pop();
                  var stat;
                  try {
                    stat = FS.stat(path);
                  } catch (e) {
                    return callback(e);
                  }
                  if (FS.isDir(stat.mode)) {
                    check.push.apply(check, _toConsumableArray(FS.readdir(path).filter(isRealDir).map(toAbsolute(path))));
                  }
                  entries[path] = {
                    timestamp: stat.mtime
                  };
                }
                return callback(null, {
                  type: "local",
                  entries: entries
                });
              },
              getRemoteSet: function getRemoteSet(mount, callback) {
                var entries = {};
                IDBFS.getDB(mount.mountpoint, function (err, db) {
                  if (err) return callback(err);
                  try {
                    var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readonly");
                    transaction.onerror = function (e) {
                      callback(e.target.error);
                      e.preventDefault();
                    };
                    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
                    var index = store.index("timestamp");
                    index.openKeyCursor().onsuccess = function (event) {
                      var cursor = event.target.result;
                      if (!cursor) {
                        return callback(null, {
                          type: "remote",
                          db: db,
                          entries: entries
                        });
                      }
                      entries[cursor.primaryKey] = {
                        timestamp: cursor.key
                      };
                      cursor["continue"]();
                    };
                  } catch (e) {
                    return callback(e);
                  }
                });
              },
              loadLocalEntry: function loadLocalEntry(path, callback) {
                var stat, node;
                try {
                  var lookup = FS.lookupPath(path);
                  node = lookup.node;
                  stat = FS.stat(path);
                } catch (e) {
                  return callback(e);
                }
                if (FS.isDir(stat.mode)) {
                  return callback(null, {
                    timestamp: stat.mtime,
                    mode: stat.mode
                  });
                } else if (FS.isFile(stat.mode)) {
                  node.contents = MEMFS.getFileDataAsTypedArray(node);
                  return callback(null, {
                    timestamp: stat.mtime,
                    mode: stat.mode,
                    contents: node.contents
                  });
                } else {
                  return callback(new Error("node type not supported"));
                }
              },
              storeLocalEntry: function storeLocalEntry(path, entry, callback) {
                try {
                  if (FS.isDir(entry["mode"])) {
                    FS.mkdirTree(path, entry["mode"]);
                  } else if (FS.isFile(entry["mode"])) {
                    FS.writeFile(path, entry["contents"], {
                      canOwn: true
                    });
                  } else {
                    return callback(new Error("node type not supported"));
                  }
                  FS.chmod(path, entry["mode"]);
                  FS.utime(path, entry["timestamp"], entry["timestamp"]);
                } catch (e) {
                  return callback(e);
                }
                callback(null);
              },
              removeLocalEntry: function removeLocalEntry(path, callback) {
                try {
                  var stat = FS.stat(path);
                  if (FS.isDir(stat.mode)) {
                    FS.rmdir(path);
                  } else if (FS.isFile(stat.mode)) {
                    FS.unlink(path);
                  }
                } catch (e) {
                  return callback(e);
                }
                callback(null);
              },
              loadRemoteEntry: function loadRemoteEntry(store, path, callback) {
                var req = store.get(path);
                req.onsuccess = function (event) {
                  return callback(null, event.target.result);
                };
                req.onerror = function (e) {
                  callback(e.target.error);
                  e.preventDefault();
                };
              },
              storeRemoteEntry: function storeRemoteEntry(store, path, entry, callback) {
                try {
                  var req = store.put(entry, path);
                } catch (e) {
                  callback(e);
                  return;
                }
                req.onsuccess = function (event) {
                  return callback();
                };
                req.onerror = function (e) {
                  callback(e.target.error);
                  e.preventDefault();
                };
              },
              removeRemoteEntry: function removeRemoteEntry(store, path, callback) {
                var req = store["delete"](path);
                req.onsuccess = function (event) {
                  return callback();
                };
                req.onerror = function (e) {
                  callback(e.target.error);
                  e.preventDefault();
                };
              },
              reconcile: function reconcile(src, dst, callback) {
                var total = 0;
                var create = [];
                Object.keys(src.entries).forEach(function (key) {
                  var e = src.entries[key];
                  var e2 = dst.entries[key];
                  if (!e2 || e["timestamp"].getTime() != e2["timestamp"].getTime()) {
                    create.push(key);
                    total++;
                  }
                });
                var remove = [];
                Object.keys(dst.entries).forEach(function (key) {
                  if (!src.entries[key]) {
                    remove.push(key);
                    total++;
                  }
                });
                if (!total) {
                  return callback(null);
                }
                var errored = false;
                var db = src.type === "remote" ? src.db : dst.db;
                var transaction = db.transaction([IDBFS.DB_STORE_NAME], "readwrite");
                var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
                function done(err) {
                  if (err && !errored) {
                    errored = true;
                    return callback(err);
                  }
                }
                transaction.onerror = transaction.onabort = function (e) {
                  done(e.target.error);
                  e.preventDefault();
                };
                transaction.oncomplete = function (e) {
                  if (!errored) {
                    callback(null);
                  }
                };
                create.sort().forEach(function (path) {
                  if (dst.type === "local") {
                    IDBFS.loadRemoteEntry(store, path, function (err, entry) {
                      if (err) return done(err);
                      IDBFS.storeLocalEntry(path, entry, done);
                    });
                  } else {
                    IDBFS.loadLocalEntry(path, function (err, entry) {
                      if (err) return done(err);
                      IDBFS.storeRemoteEntry(store, path, entry, done);
                    });
                  }
                });
                remove.sort().reverse().forEach(function (path) {
                  if (dst.type === "local") {
                    IDBFS.removeLocalEntry(path, done);
                  } else {
                    IDBFS.removeRemoteEntry(store, path, done);
                  }
                });
              }
            };
            var FS = {
              root: null,
              mounts: [],
              devices: {},
              streams: [],
              nextInode: 1,
              nameTable: null,
              currentPath: "/",
              initialized: false,
              ignorePermissions: true,
              ErrnoError: /*#__PURE__*/_createClass(function ErrnoError(errno) {
                _classCallCheck(this, ErrnoError);
                this.name = "ErrnoError";
                this.errno = errno;
              }),
              genericErrors: {},
              filesystems: null,
              syncFSRequests: 0,
              FSStream: /*#__PURE__*/function () {
                function FSStream() {
                  _classCallCheck(this, FSStream);
                  this.shared = {};
                }
                return _createClass(FSStream, [{
                  key: "object",
                  get: function get() {
                    return this.node;
                  },
                  set: function set(val) {
                    this.node = val;
                  }
                }, {
                  key: "isRead",
                  get: function get() {
                    return (this.flags & 2097155) !== 1;
                  }
                }, {
                  key: "isWrite",
                  get: function get() {
                    return (this.flags & 2097155) !== 0;
                  }
                }, {
                  key: "isAppend",
                  get: function get() {
                    return this.flags & 1024;
                  }
                }, {
                  key: "flags",
                  get: function get() {
                    return this.shared.flags;
                  },
                  set: function set(val) {
                    this.shared.flags = val;
                  }
                }, {
                  key: "position",
                  get: function get() {
                    return this.shared.position;
                  },
                  set: function set(val) {
                    this.shared.position = val;
                  }
                }]);
              }(),
              FSNode: /*#__PURE__*/function () {
                function FSNode(parent, name, mode, rdev) {
                  _classCallCheck(this, FSNode);
                  if (!parent) {
                    parent = this;
                  }
                  this.parent = parent;
                  this.mount = parent.mount;
                  this.mounted = null;
                  this.id = FS.nextInode++;
                  this.name = name;
                  this.mode = mode;
                  this.node_ops = {};
                  this.stream_ops = {};
                  this.rdev = rdev;
                  this.readMode = 292 | 73;
                  this.writeMode = 146;
                }
                return _createClass(FSNode, [{
                  key: "read",
                  get: function get() {
                    return (this.mode & this.readMode) === this.readMode;
                  },
                  set: function set(val) {
                    val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
                  }
                }, {
                  key: "write",
                  get: function get() {
                    return (this.mode & this.writeMode) === this.writeMode;
                  },
                  set: function set(val) {
                    val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
                  }
                }, {
                  key: "isFolder",
                  get: function get() {
                    return FS.isDir(this.mode);
                  }
                }, {
                  key: "isDevice",
                  get: function get() {
                    return FS.isChrdev(this.mode);
                  }
                }]);
              }(),
              lookupPath: function lookupPath(path) {
                var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                path = PATH_FS.resolve(path);
                if (!path) return {
                  path: "",
                  node: null
                };
                var defaults = {
                  follow_mount: true,
                  recurse_count: 0
                };
                opts = Object.assign(defaults, opts);
                if (opts.recurse_count > 8) {
                  throw new FS.ErrnoError(32);
                }
                var parts = path.split("/").filter(function (p) {
                  return !!p;
                });
                var current = FS.root;
                var current_path = "/";
                for (var i = 0; i < parts.length; i++) {
                  var islast = i === parts.length - 1;
                  if (islast && opts.parent) {
                    break;
                  }
                  current = FS.lookupNode(current, parts[i]);
                  current_path = PATH.join2(current_path, parts[i]);
                  if (FS.isMountpoint(current)) {
                    if (!islast || islast && opts.follow_mount) {
                      current = current.mounted.root;
                    }
                  }
                  if (!islast || opts.follow) {
                    var count = 0;
                    while (FS.isLink(current.mode)) {
                      var link = FS.readlink(current_path);
                      current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                      var lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count + 1
                      });
                      current = lookup.node;
                      if (count++ > 40) {
                        throw new FS.ErrnoError(32);
                      }
                    }
                  }
                }
                return {
                  path: current_path,
                  node: current
                };
              },
              getPath: function getPath(node) {
                var path;
                while (true) {
                  if (FS.isRoot(node)) {
                    var mount = node.mount.mountpoint;
                    if (!path) return mount;
                    return mount[mount.length - 1] !== "/" ? "".concat(mount, "/").concat(path) : mount + path;
                  }
                  path = path ? "".concat(node.name, "/").concat(path) : node.name;
                  node = node.parent;
                }
              },
              hashName: function hashName(parentid, name) {
                var hash = 0;
                for (var i = 0; i < name.length; i++) {
                  hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
                }
                return (parentid + hash >>> 0) % FS.nameTable.length;
              },
              hashAddNode: function hashAddNode(node) {
                var hash = FS.hashName(node.parent.id, node.name);
                node.name_next = FS.nameTable[hash];
                FS.nameTable[hash] = node;
              },
              hashRemoveNode: function hashRemoveNode(node) {
                var hash = FS.hashName(node.parent.id, node.name);
                if (FS.nameTable[hash] === node) {
                  FS.nameTable[hash] = node.name_next;
                } else {
                  var current = FS.nameTable[hash];
                  while (current) {
                    if (current.name_next === node) {
                      current.name_next = node.name_next;
                      break;
                    }
                    current = current.name_next;
                  }
                }
              },
              lookupNode: function lookupNode(parent, name) {
                var errCode = FS.mayLookup(parent);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                var hash = FS.hashName(parent.id, name);
                for (var node = FS.nameTable[hash]; node; node = node.name_next) {
                  var nodeName = node.name;
                  if (node.parent.id === parent.id && nodeName === name) {
                    return node;
                  }
                }
                return FS.lookup(parent, name);
              },
              createNode: function createNode(parent, name, mode, rdev) {
                var node = new FS.FSNode(parent, name, mode, rdev);
                FS.hashAddNode(node);
                return node;
              },
              destroyNode: function destroyNode(node) {
                FS.hashRemoveNode(node);
              },
              isRoot: function isRoot(node) {
                return node === node.parent;
              },
              isMountpoint: function isMountpoint(node) {
                return !!node.mounted;
              },
              isFile: function isFile(mode) {
                return (mode & 61440) === 32768;
              },
              isDir: function isDir(mode) {
                return (mode & 61440) === 16384;
              },
              isLink: function isLink(mode) {
                return (mode & 61440) === 40960;
              },
              isChrdev: function isChrdev(mode) {
                return (mode & 61440) === 8192;
              },
              isBlkdev: function isBlkdev(mode) {
                return (mode & 61440) === 24576;
              },
              isFIFO: function isFIFO(mode) {
                return (mode & 61440) === 4096;
              },
              isSocket: function isSocket(mode) {
                return (mode & 49152) === 49152;
              },
              flagsToPermissionString: function flagsToPermissionString(flag) {
                var perms = ["r", "w", "rw"][flag & 3];
                if (flag & 512) {
                  perms += "w";
                }
                return perms;
              },
              nodePermissions: function nodePermissions(node, perms) {
                if (FS.ignorePermissions) {
                  return 0;
                }
                if (perms.includes("r") && !(node.mode & 292)) {
                  return 2;
                } else if (perms.includes("w") && !(node.mode & 146)) {
                  return 2;
                } else if (perms.includes("x") && !(node.mode & 73)) {
                  return 2;
                }
                return 0;
              },
              mayLookup: function mayLookup(dir) {
                if (!FS.isDir(dir.mode)) return 54;
                var errCode = FS.nodePermissions(dir, "x");
                if (errCode) return errCode;
                if (!dir.node_ops.lookup) return 2;
                return 0;
              },
              mayCreate: function mayCreate(dir, name) {
                try {
                  var node = FS.lookupNode(dir, name);
                  return 20;
                } catch (e) {}
                return FS.nodePermissions(dir, "wx");
              },
              mayDelete: function mayDelete(dir, name, isdir) {
                var node;
                try {
                  node = FS.lookupNode(dir, name);
                } catch (e) {
                  return e.errno;
                }
                var errCode = FS.nodePermissions(dir, "wx");
                if (errCode) {
                  return errCode;
                }
                if (isdir) {
                  if (!FS.isDir(node.mode)) {
                    return 54;
                  }
                  if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                    return 10;
                  }
                } else {
                  if (FS.isDir(node.mode)) {
                    return 31;
                  }
                }
                return 0;
              },
              mayOpen: function mayOpen(node, flags) {
                if (!node) {
                  return 44;
                }
                if (FS.isLink(node.mode)) {
                  return 32;
                } else if (FS.isDir(node.mode)) {
                  if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                    return 31;
                  }
                }
                return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
              },
              MAX_OPEN_FDS: 4096,
              nextfd: function nextfd() {
                for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
                  if (!FS.streams[fd]) {
                    return fd;
                  }
                }
                throw new FS.ErrnoError(33);
              },
              getStreamChecked: function getStreamChecked(fd) {
                var stream = FS.getStream(fd);
                if (!stream) {
                  throw new FS.ErrnoError(8);
                }
                return stream;
              },
              getStream: function getStream(fd) {
                return FS.streams[fd];
              },
              createStream: function createStream(stream) {
                var fd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
                stream = Object.assign(new FS.FSStream(), stream);
                if (fd == -1) {
                  fd = FS.nextfd();
                }
                stream.fd = fd;
                FS.streams[fd] = stream;
                return stream;
              },
              closeStream: function closeStream(fd) {
                FS.streams[fd] = null;
              },
              dupStream: function dupStream(origStream) {
                var _stream$stream_ops, _stream$stream_ops$du;
                var fd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
                var stream = FS.createStream(origStream, fd);
                (_stream$stream_ops = stream.stream_ops) === null || _stream$stream_ops === void 0 || (_stream$stream_ops$du = _stream$stream_ops.dup) === null || _stream$stream_ops$du === void 0 || _stream$stream_ops$du.call(_stream$stream_ops, stream);
                return stream;
              },
              chrdev_stream_ops: {
                open: function open(stream) {
                  var _stream$stream_ops$op, _stream$stream_ops2;
                  var device = FS.getDevice(stream.node.rdev);
                  stream.stream_ops = device.stream_ops;
                  (_stream$stream_ops$op = (_stream$stream_ops2 = stream.stream_ops).open) === null || _stream$stream_ops$op === void 0 || _stream$stream_ops$op.call(_stream$stream_ops2, stream);
                },
                llseek: function llseek() {
                  throw new FS.ErrnoError(70);
                }
              },
              major: function major(dev) {
                return dev >> 8;
              },
              minor: function minor(dev) {
                return dev & 255;
              },
              makedev: function makedev(ma, mi) {
                return ma << 8 | mi;
              },
              registerDevice: function registerDevice(dev, ops) {
                FS.devices[dev] = {
                  stream_ops: ops
                };
              },
              getDevice: function getDevice(dev) {
                return FS.devices[dev];
              },
              getMounts: function getMounts(mount) {
                var mounts = [];
                var check = [mount];
                while (check.length) {
                  var m = check.pop();
                  mounts.push(m);
                  check.push.apply(check, _toConsumableArray(m.mounts));
                }
                return mounts;
              },
              syncfs: function syncfs(populate, callback) {
                if (typeof populate == "function") {
                  callback = populate;
                  populate = false;
                }
                FS.syncFSRequests++;
                if (FS.syncFSRequests > 1) {
                  err("warning: ".concat(FS.syncFSRequests, " FS.syncfs operations in flight at once, probably just doing extra work"));
                }
                var mounts = FS.getMounts(FS.root.mount);
                var completed = 0;
                function doCallback(errCode) {
                  FS.syncFSRequests--;
                  return callback(errCode);
                }
                function done(errCode) {
                  if (errCode) {
                    if (!done.errored) {
                      done.errored = true;
                      return doCallback(errCode);
                    }
                    return;
                  }
                  if (++completed >= mounts.length) {
                    doCallback(null);
                  }
                }
                mounts.forEach(function (mount) {
                  if (!mount.type.syncfs) {
                    return done(null);
                  }
                  mount.type.syncfs(mount, populate, done);
                });
              },
              mount: function mount(type, opts, mountpoint) {
                var root = mountpoint === "/";
                var pseudo = !mountpoint;
                var node;
                if (root && FS.root) {
                  throw new FS.ErrnoError(10);
                } else if (!root && !pseudo) {
                  var lookup = FS.lookupPath(mountpoint, {
                    follow_mount: false
                  });
                  mountpoint = lookup.path;
                  node = lookup.node;
                  if (FS.isMountpoint(node)) {
                    throw new FS.ErrnoError(10);
                  }
                  if (!FS.isDir(node.mode)) {
                    throw new FS.ErrnoError(54);
                  }
                }
                var mount = {
                  type: type,
                  opts: opts,
                  mountpoint: mountpoint,
                  mounts: []
                };
                var mountRoot = type.mount(mount);
                mountRoot.mount = mount;
                mount.root = mountRoot;
                if (root) {
                  FS.root = mountRoot;
                } else if (node) {
                  node.mounted = mount;
                  if (node.mount) {
                    node.mount.mounts.push(mount);
                  }
                }
                return mountRoot;
              },
              unmount: function unmount(mountpoint) {
                var lookup = FS.lookupPath(mountpoint, {
                  follow_mount: false
                });
                if (!FS.isMountpoint(lookup.node)) {
                  throw new FS.ErrnoError(28);
                }
                var node = lookup.node;
                var mount = node.mounted;
                var mounts = FS.getMounts(mount);
                Object.keys(FS.nameTable).forEach(function (hash) {
                  var current = FS.nameTable[hash];
                  while (current) {
                    var next = current.name_next;
                    if (mounts.includes(current.mount)) {
                      FS.destroyNode(current);
                    }
                    current = next;
                  }
                });
                node.mounted = null;
                var idx = node.mount.mounts.indexOf(mount);
                node.mount.mounts.splice(idx, 1);
              },
              lookup: function lookup(parent, name) {
                return parent.node_ops.lookup(parent, name);
              },
              mknod: function mknod(path, mode, dev) {
                var lookup = FS.lookupPath(path, {
                  parent: true
                });
                var parent = lookup.node;
                var name = PATH.basename(path);
                if (!name || name === "." || name === "..") {
                  throw new FS.ErrnoError(28);
                }
                var errCode = FS.mayCreate(parent, name);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.mknod) {
                  throw new FS.ErrnoError(63);
                }
                return parent.node_ops.mknod(parent, name, mode, dev);
              },
              create: function create(path, mode) {
                mode = mode !== undefined ? mode : 438;
                mode &= 4095;
                mode |= 32768;
                return FS.mknod(path, mode, 0);
              },
              mkdir: function mkdir(path, mode) {
                mode = mode !== undefined ? mode : 511;
                mode &= 511 | 512;
                mode |= 16384;
                return FS.mknod(path, mode, 0);
              },
              mkdirTree: function mkdirTree(path, mode) {
                var dirs = path.split("/");
                var d = "";
                for (var i = 0; i < dirs.length; ++i) {
                  if (!dirs[i]) continue;
                  d += "/" + dirs[i];
                  try {
                    FS.mkdir(d, mode);
                  } catch (e) {
                    if (e.errno != 20) throw e;
                  }
                }
              },
              mkdev: function mkdev(path, mode, dev) {
                if (typeof dev == "undefined") {
                  dev = mode;
                  mode = 438;
                }
                mode |= 8192;
                return FS.mknod(path, mode, dev);
              },
              symlink: function symlink(oldpath, newpath) {
                if (!PATH_FS.resolve(oldpath)) {
                  throw new FS.ErrnoError(44);
                }
                var lookup = FS.lookupPath(newpath, {
                  parent: true
                });
                var parent = lookup.node;
                if (!parent) {
                  throw new FS.ErrnoError(44);
                }
                var newname = PATH.basename(newpath);
                var errCode = FS.mayCreate(parent, newname);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.symlink) {
                  throw new FS.ErrnoError(63);
                }
                return parent.node_ops.symlink(parent, newname, oldpath);
              },
              rename: function rename(old_path, new_path) {
                var old_dirname = PATH.dirname(old_path);
                var new_dirname = PATH.dirname(new_path);
                var old_name = PATH.basename(old_path);
                var new_name = PATH.basename(new_path);
                var lookup, old_dir, new_dir;
                lookup = FS.lookupPath(old_path, {
                  parent: true
                });
                old_dir = lookup.node;
                lookup = FS.lookupPath(new_path, {
                  parent: true
                });
                new_dir = lookup.node;
                if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
                if (old_dir.mount !== new_dir.mount) {
                  throw new FS.ErrnoError(75);
                }
                var old_node = FS.lookupNode(old_dir, old_name);
                var relative = PATH_FS.relative(old_path, new_dirname);
                if (relative.charAt(0) !== ".") {
                  throw new FS.ErrnoError(28);
                }
                relative = PATH_FS.relative(new_path, old_dirname);
                if (relative.charAt(0) !== ".") {
                  throw new FS.ErrnoError(55);
                }
                var new_node;
                try {
                  new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {}
                if (old_node === new_node) {
                  return;
                }
                var isdir = FS.isDir(old_node.mode);
                var errCode = FS.mayDelete(old_dir, old_name, isdir);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                if (!old_dir.node_ops.rename) {
                  throw new FS.ErrnoError(63);
                }
                if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
                  throw new FS.ErrnoError(10);
                }
                if (new_dir !== old_dir) {
                  errCode = FS.nodePermissions(old_dir, "w");
                  if (errCode) {
                    throw new FS.ErrnoError(errCode);
                  }
                }
                FS.hashRemoveNode(old_node);
                try {
                  old_dir.node_ops.rename(old_node, new_dir, new_name);
                  old_node.parent = new_dir;
                } catch (e) {
                  throw e;
                } finally {
                  FS.hashAddNode(old_node);
                }
              },
              rmdir: function rmdir(path) {
                var lookup = FS.lookupPath(path, {
                  parent: true
                });
                var parent = lookup.node;
                var name = PATH.basename(path);
                var node = FS.lookupNode(parent, name);
                var errCode = FS.mayDelete(parent, name, true);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.rmdir) {
                  throw new FS.ErrnoError(63);
                }
                if (FS.isMountpoint(node)) {
                  throw new FS.ErrnoError(10);
                }
                parent.node_ops.rmdir(parent, name);
                FS.destroyNode(node);
              },
              readdir: function readdir(path) {
                var lookup = FS.lookupPath(path, {
                  follow: true
                });
                var node = lookup.node;
                if (!node.node_ops.readdir) {
                  throw new FS.ErrnoError(54);
                }
                return node.node_ops.readdir(node);
              },
              unlink: function unlink(path) {
                var lookup = FS.lookupPath(path, {
                  parent: true
                });
                var parent = lookup.node;
                if (!parent) {
                  throw new FS.ErrnoError(44);
                }
                var name = PATH.basename(path);
                var node = FS.lookupNode(parent, name);
                var errCode = FS.mayDelete(parent, name, false);
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                if (!parent.node_ops.unlink) {
                  throw new FS.ErrnoError(63);
                }
                if (FS.isMountpoint(node)) {
                  throw new FS.ErrnoError(10);
                }
                parent.node_ops.unlink(parent, name);
                FS.destroyNode(node);
              },
              readlink: function readlink(path) {
                var lookup = FS.lookupPath(path);
                var link = lookup.node;
                if (!link) {
                  throw new FS.ErrnoError(44);
                }
                if (!link.node_ops.readlink) {
                  throw new FS.ErrnoError(28);
                }
                return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
              },
              stat: function stat(path, dontFollow) {
                var lookup = FS.lookupPath(path, {
                  follow: !dontFollow
                });
                var node = lookup.node;
                if (!node) {
                  throw new FS.ErrnoError(44);
                }
                if (!node.node_ops.getattr) {
                  throw new FS.ErrnoError(63);
                }
                return node.node_ops.getattr(node);
              },
              lstat: function lstat(path) {
                return FS.stat(path, true);
              },
              chmod: function chmod(path, mode, dontFollow) {
                var node;
                if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                    follow: !dontFollow
                  });
                  node = lookup.node;
                } else {
                  node = path;
                }
                if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63);
                }
                node.node_ops.setattr(node, {
                  mode: mode & 4095 | node.mode & ~4095,
                  timestamp: Date.now()
                });
              },
              lchmod: function lchmod(path, mode) {
                FS.chmod(path, mode, true);
              },
              fchmod: function fchmod(fd, mode) {
                var stream = FS.getStreamChecked(fd);
                FS.chmod(stream.node, mode);
              },
              chown: function chown(path, uid, gid, dontFollow) {
                var node;
                if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                    follow: !dontFollow
                  });
                  node = lookup.node;
                } else {
                  node = path;
                }
                if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63);
                }
                node.node_ops.setattr(node, {
                  timestamp: Date.now()
                });
              },
              lchown: function lchown(path, uid, gid) {
                FS.chown(path, uid, gid, true);
              },
              fchown: function fchown(fd, uid, gid) {
                var stream = FS.getStreamChecked(fd);
                FS.chown(stream.node, uid, gid);
              },
              truncate: function truncate(path, len) {
                if (len < 0) {
                  throw new FS.ErrnoError(28);
                }
                var node;
                if (typeof path == "string") {
                  var lookup = FS.lookupPath(path, {
                    follow: true
                  });
                  node = lookup.node;
                } else {
                  node = path;
                }
                if (!node.node_ops.setattr) {
                  throw new FS.ErrnoError(63);
                }
                if (FS.isDir(node.mode)) {
                  throw new FS.ErrnoError(31);
                }
                if (!FS.isFile(node.mode)) {
                  throw new FS.ErrnoError(28);
                }
                var errCode = FS.nodePermissions(node, "w");
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                node.node_ops.setattr(node, {
                  size: len,
                  timestamp: Date.now()
                });
              },
              ftruncate: function ftruncate(fd, len) {
                var stream = FS.getStreamChecked(fd);
                if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(28);
                }
                FS.truncate(stream.node, len);
              },
              utime: function utime(path, atime, mtime) {
                var lookup = FS.lookupPath(path, {
                  follow: true
                });
                var node = lookup.node;
                node.node_ops.setattr(node, {
                  timestamp: Math.max(atime, mtime)
                });
              },
              open: function open(path, flags, mode) {
                if (path === "") {
                  throw new FS.ErrnoError(44);
                }
                flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
                if (flags & 64) {
                  mode = typeof mode == "undefined" ? 438 : mode;
                  mode = mode & 4095 | 32768;
                } else {
                  mode = 0;
                }
                var node;
                if (_typeof(path) == "object") {
                  node = path;
                } else {
                  path = PATH.normalize(path);
                  try {
                    var lookup = FS.lookupPath(path, {
                      follow: !(flags & 131072)
                    });
                    node = lookup.node;
                  } catch (e) {}
                }
                var created = false;
                if (flags & 64) {
                  if (node) {
                    if (flags & 128) {
                      throw new FS.ErrnoError(20);
                    }
                  } else {
                    node = FS.mknod(path, mode, 0);
                    created = true;
                  }
                }
                if (!node) {
                  throw new FS.ErrnoError(44);
                }
                if (FS.isChrdev(node.mode)) {
                  flags &= ~512;
                }
                if (flags & 65536 && !FS.isDir(node.mode)) {
                  throw new FS.ErrnoError(54);
                }
                if (!created) {
                  var errCode = FS.mayOpen(node, flags);
                  if (errCode) {
                    throw new FS.ErrnoError(errCode);
                  }
                }
                if (flags & 512 && !created) {
                  FS.truncate(node, 0);
                }
                flags &= ~(128 | 512 | 131072);
                var stream = FS.createStream({
                  node: node,
                  path: FS.getPath(node),
                  flags: flags,
                  seekable: true,
                  position: 0,
                  stream_ops: node.stream_ops,
                  ungotten: [],
                  error: false
                });
                if (stream.stream_ops.open) {
                  stream.stream_ops.open(stream);
                }
                if (Module["logReadFiles"] && !(flags & 1)) {
                  if (!FS.readFiles) FS.readFiles = {};
                  if (!(path in FS.readFiles)) {
                    FS.readFiles[path] = 1;
                  }
                }
                return stream;
              },
              close: function close(stream) {
                if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8);
                }
                if (stream.getdents) stream.getdents = null;
                try {
                  if (stream.stream_ops.close) {
                    stream.stream_ops.close(stream);
                  }
                } catch (e) {
                  throw e;
                } finally {
                  FS.closeStream(stream.fd);
                }
                stream.fd = null;
              },
              isClosed: function isClosed(stream) {
                return stream.fd === null;
              },
              llseek: function llseek(stream, offset, whence) {
                if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8);
                }
                if (!stream.seekable || !stream.stream_ops.llseek) {
                  throw new FS.ErrnoError(70);
                }
                if (whence != 0 && whence != 1 && whence != 2) {
                  throw new FS.ErrnoError(28);
                }
                stream.position = stream.stream_ops.llseek(stream, offset, whence);
                stream.ungotten = [];
                return stream.position;
              },
              read: function read(stream, buffer, offset, length, position) {
                if (length < 0 || position < 0) {
                  throw new FS.ErrnoError(28);
                }
                if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8);
                }
                if ((stream.flags & 2097155) === 1) {
                  throw new FS.ErrnoError(8);
                }
                if (FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(31);
                }
                if (!stream.stream_ops.read) {
                  throw new FS.ErrnoError(28);
                }
                var seeking = typeof position != "undefined";
                if (!seeking) {
                  position = stream.position;
                } else if (!stream.seekable) {
                  throw new FS.ErrnoError(70);
                }
                var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
                if (!seeking) stream.position += bytesRead;
                return bytesRead;
              },
              write: function write(stream, buffer, offset, length, position, canOwn) {
                if (length < 0 || position < 0) {
                  throw new FS.ErrnoError(28);
                }
                if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8);
                }
                if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(8);
                }
                if (FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(31);
                }
                if (!stream.stream_ops.write) {
                  throw new FS.ErrnoError(28);
                }
                if (stream.seekable && stream.flags & 1024) {
                  FS.llseek(stream, 0, 2);
                }
                var seeking = typeof position != "undefined";
                if (!seeking) {
                  position = stream.position;
                } else if (!stream.seekable) {
                  throw new FS.ErrnoError(70);
                }
                var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
                if (!seeking) stream.position += bytesWritten;
                return bytesWritten;
              },
              allocate: function allocate(stream, offset, length) {
                if (FS.isClosed(stream)) {
                  throw new FS.ErrnoError(8);
                }
                if (offset < 0 || length <= 0) {
                  throw new FS.ErrnoError(28);
                }
                if ((stream.flags & 2097155) === 0) {
                  throw new FS.ErrnoError(8);
                }
                if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
                  throw new FS.ErrnoError(43);
                }
                if (!stream.stream_ops.allocate) {
                  throw new FS.ErrnoError(138);
                }
                stream.stream_ops.allocate(stream, offset, length);
              },
              mmap: function mmap(stream, length, position, prot, flags) {
                if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
                  throw new FS.ErrnoError(2);
                }
                if ((stream.flags & 2097155) === 1) {
                  throw new FS.ErrnoError(2);
                }
                if (!stream.stream_ops.mmap) {
                  throw new FS.ErrnoError(43);
                }
                return stream.stream_ops.mmap(stream, length, position, prot, flags);
              },
              msync: function msync(stream, buffer, offset, length, mmapFlags) {
                if (!stream.stream_ops.msync) {
                  return 0;
                }
                return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
              },
              ioctl: function ioctl(stream, cmd, arg) {
                if (!stream.stream_ops.ioctl) {
                  throw new FS.ErrnoError(59);
                }
                return stream.stream_ops.ioctl(stream, cmd, arg);
              },
              readFile: function readFile(path) {
                var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                opts.flags = opts.flags || 0;
                opts.encoding = opts.encoding || "binary";
                if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
                  throw new Error("Invalid encoding type \"".concat(opts.encoding, "\""));
                }
                var ret;
                var stream = FS.open(path, opts.flags);
                var stat = FS.stat(path);
                var length = stat.size;
                var buf = new Uint8Array(length);
                FS.read(stream, buf, 0, length, 0);
                if (opts.encoding === "utf8") {
                  ret = UTF8ArrayToString(buf, 0);
                } else if (opts.encoding === "binary") {
                  ret = buf;
                }
                FS.close(stream);
                return ret;
              },
              writeFile: function writeFile(path, data) {
                var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
                opts.flags = opts.flags || 577;
                var stream = FS.open(path, opts.flags, opts.mode);
                if (typeof data == "string") {
                  var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
                  var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
                  FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
                } else if (ArrayBuffer.isView(data)) {
                  FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
                } else {
                  throw new Error("Unsupported data type");
                }
                FS.close(stream);
              },
              cwd: function cwd() {
                return FS.currentPath;
              },
              chdir: function chdir(path) {
                var lookup = FS.lookupPath(path, {
                  follow: true
                });
                if (lookup.node === null) {
                  throw new FS.ErrnoError(44);
                }
                if (!FS.isDir(lookup.node.mode)) {
                  throw new FS.ErrnoError(54);
                }
                var errCode = FS.nodePermissions(lookup.node, "x");
                if (errCode) {
                  throw new FS.ErrnoError(errCode);
                }
                FS.currentPath = lookup.path;
              },
              createDefaultDirectories: function createDefaultDirectories() {
                FS.mkdir("/tmp");
                FS.mkdir("/home");
                FS.mkdir("/home/web_user");
              },
              createDefaultDevices: function createDefaultDevices() {
                FS.mkdir("/dev");
                FS.registerDevice(FS.makedev(1, 3), {
                  read: function read() {
                    return 0;
                  },
                  write: function write(stream, buffer, offset, length, pos) {
                    return length;
                  }
                });
                FS.mkdev("/dev/null", FS.makedev(1, 3));
                TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
                TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
                FS.mkdev("/dev/tty", FS.makedev(5, 0));
                FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                var randomBuffer = new Uint8Array(1024),
                  randomLeft = 0;
                var randomByte = function randomByte() {
                  if (randomLeft === 0) {
                    randomLeft = _randomFill(randomBuffer).byteLength;
                  }
                  return randomBuffer[--randomLeft];
                };
                FS.createDevice("/dev", "random", randomByte);
                FS.createDevice("/dev", "urandom", randomByte);
                FS.mkdir("/dev/shm");
                FS.mkdir("/dev/shm/tmp");
              },
              createSpecialDirectories: function createSpecialDirectories() {
                FS.mkdir("/proc");
                var proc_self = FS.mkdir("/proc/self");
                FS.mkdir("/proc/self/fd");
                FS.mount({
                  mount: function mount() {
                    var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                    node.node_ops = {
                      lookup: function lookup(parent, name) {
                        var fd = +name;
                        var stream = FS.getStreamChecked(fd);
                        var ret = {
                          parent: null,
                          mount: {
                            mountpoint: "fake"
                          },
                          node_ops: {
                            readlink: function readlink() {
                              return stream.path;
                            }
                          }
                        };
                        ret.parent = ret;
                        return ret;
                      }
                    };
                    return node;
                  }
                }, {}, "/proc/self/fd");
              },
              createStandardStreams: function createStandardStreams() {
                if (Module["stdin"]) {
                  FS.createDevice("/dev", "stdin", Module["stdin"]);
                } else {
                  FS.symlink("/dev/tty", "/dev/stdin");
                }
                if (Module["stdout"]) {
                  FS.createDevice("/dev", "stdout", null, Module["stdout"]);
                } else {
                  FS.symlink("/dev/tty", "/dev/stdout");
                }
                if (Module["stderr"]) {
                  FS.createDevice("/dev", "stderr", null, Module["stderr"]);
                } else {
                  FS.symlink("/dev/tty1", "/dev/stderr");
                }
                var stdin = FS.open("/dev/stdin", 0);
                var stdout = FS.open("/dev/stdout", 1);
                var stderr = FS.open("/dev/stderr", 1);
              },
              staticInit: function staticInit() {
                [44].forEach(function (code) {
                  FS.genericErrors[code] = new FS.ErrnoError(code);
                  FS.genericErrors[code].stack = "<generic error, no stack>";
                });
                FS.nameTable = new Array(4096);
                FS.mount(MEMFS, {}, "/");
                FS.createDefaultDirectories();
                FS.createDefaultDevices();
                FS.createSpecialDirectories();
                FS.filesystems = {
                  MEMFS: MEMFS,
                  IDBFS: IDBFS
                };
              },
              init: function init(input, output, error) {
                FS.init.initialized = true;
                Module["stdin"] = input || Module["stdin"];
                Module["stdout"] = output || Module["stdout"];
                Module["stderr"] = error || Module["stderr"];
                FS.createStandardStreams();
              },
              quit: function quit() {
                FS.init.initialized = false;
                _fflush2(0);
                for (var i = 0; i < FS.streams.length; i++) {
                  var stream = FS.streams[i];
                  if (!stream) {
                    continue;
                  }
                  FS.close(stream);
                }
              },
              findObject: function findObject(path, dontResolveLastLink) {
                var ret = FS.analyzePath(path, dontResolveLastLink);
                if (!ret.exists) {
                  return null;
                }
                return ret.object;
              },
              analyzePath: function analyzePath(path, dontResolveLastLink) {
                try {
                  var lookup = FS.lookupPath(path, {
                    follow: !dontResolveLastLink
                  });
                  path = lookup.path;
                } catch (e) {}
                var ret = {
                  isRoot: false,
                  exists: false,
                  error: 0,
                  name: null,
                  path: null,
                  object: null,
                  parentExists: false,
                  parentPath: null,
                  parentObject: null
                };
                try {
                  var lookup = FS.lookupPath(path, {
                    parent: true
                  });
                  ret.parentExists = true;
                  ret.parentPath = lookup.path;
                  ret.parentObject = lookup.node;
                  ret.name = PATH.basename(path);
                  lookup = FS.lookupPath(path, {
                    follow: !dontResolveLastLink
                  });
                  ret.exists = true;
                  ret.path = lookup.path;
                  ret.object = lookup.node;
                  ret.name = lookup.node.name;
                  ret.isRoot = lookup.path === "/";
                } catch (e) {
                  ret.error = e.errno;
                }
                return ret;
              },
              createPath: function createPath(parent, path, canRead, canWrite) {
                parent = typeof parent == "string" ? parent : FS.getPath(parent);
                var parts = path.split("/").reverse();
                while (parts.length) {
                  var part = parts.pop();
                  if (!part) continue;
                  var current = PATH.join2(parent, part);
                  try {
                    FS.mkdir(current);
                  } catch (e) {}
                  parent = current;
                }
                return current;
              },
              createFile: function createFile(parent, name, properties, canRead, canWrite) {
                var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                var mode = FS_getMode(canRead, canWrite);
                return FS.create(path, mode);
              },
              createDataFile: function createDataFile(parent, name, data, canRead, canWrite, canOwn) {
                var path = name;
                if (parent) {
                  parent = typeof parent == "string" ? parent : FS.getPath(parent);
                  path = name ? PATH.join2(parent, name) : parent;
                }
                var mode = FS_getMode(canRead, canWrite);
                var node = FS.create(path, mode);
                if (data) {
                  if (typeof data == "string") {
                    var arr = new Array(data.length);
                    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                    data = arr;
                  }
                  FS.chmod(node, mode | 146);
                  var stream = FS.open(node, 577);
                  FS.write(stream, data, 0, data.length, 0, canOwn);
                  FS.close(stream);
                  FS.chmod(node, mode);
                }
              },
              createDevice: function createDevice(parent, name, input, output) {
                var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
                var mode = FS_getMode(!!input, !!output);
                if (!FS.createDevice.major) FS.createDevice.major = 64;
                var dev = FS.makedev(FS.createDevice.major++, 0);
                FS.registerDevice(dev, {
                  open: function open(stream) {
                    stream.seekable = false;
                  },
                  close: function close(stream) {
                    var _output$buffer;
                    if (output !== null && output !== void 0 && (_output$buffer = output.buffer) !== null && _output$buffer !== void 0 && _output$buffer.length) {
                      output(10);
                    }
                  },
                  read: function read(stream, buffer, offset, length, pos) {
                    var bytesRead = 0;
                    for (var i = 0; i < length; i++) {
                      var result;
                      try {
                        result = input();
                      } catch (e) {
                        throw new FS.ErrnoError(29);
                      }
                      if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                      }
                      if (result === null || result === undefined) break;
                      bytesRead++;
                      buffer[offset + i] = result;
                    }
                    if (bytesRead) {
                      stream.node.timestamp = Date.now();
                    }
                    return bytesRead;
                  },
                  write: function write(stream, buffer, offset, length, pos) {
                    for (var i = 0; i < length; i++) {
                      try {
                        output(buffer[offset + i]);
                      } catch (e) {
                        throw new FS.ErrnoError(29);
                      }
                    }
                    if (length) {
                      stream.node.timestamp = Date.now();
                    }
                    return i;
                  }
                });
                return FS.mkdev(path, mode, dev);
              },
              forceLoadFile: function forceLoadFile(obj) {
                if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
                if (typeof XMLHttpRequest != "undefined") {
                  throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
                } else {
                  try {
                    obj.contents = readBinary(obj.url);
                    obj.usedBytes = obj.contents.length;
                  } catch (e) {
                    throw new FS.ErrnoError(29);
                  }
                }
              },
              createLazyFile: function createLazyFile(parent, name, url, canRead, canWrite) {
                var LazyUint8Array = /*#__PURE__*/function () {
                  function LazyUint8Array() {
                    _classCallCheck(this, LazyUint8Array);
                    this.lengthKnown = false;
                    this.chunks = [];
                  }
                  return _createClass(LazyUint8Array, [{
                    key: "get",
                    value: function get(idx) {
                      if (idx > this.length - 1 || idx < 0) {
                        return undefined;
                      }
                      var chunkOffset = idx % this.chunkSize;
                      var chunkNum = idx / this.chunkSize | 0;
                      return this.getter(chunkNum)[chunkOffset];
                    }
                  }, {
                    key: "setDataGetter",
                    value: function setDataGetter(getter) {
                      this.getter = getter;
                    }
                  }, {
                    key: "cacheLength",
                    value: function cacheLength() {
                      var xhr = new XMLHttpRequest();
                      xhr.open("HEAD", url, false);
                      xhr.send(null);
                      if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                      var datalength = Number(xhr.getResponseHeader("Content-length"));
                      var header;
                      var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                      var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                      var chunkSize = 1024 * 1024;
                      if (!hasByteServing) chunkSize = datalength;
                      var doXHR = function doXHR(from, to) {
                        if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                        if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", url, false);
                        if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                        xhr.responseType = "arraybuffer";
                        if (xhr.overrideMimeType) {
                          xhr.overrideMimeType("text/plain; charset=x-user-defined");
                        }
                        xhr.send(null);
                        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                        if (xhr.response !== undefined) {
                          return new Uint8Array(xhr.response || []);
                        }
                        return intArrayFromString(xhr.responseText || "", true);
                      };
                      var lazyArray = this;
                      lazyArray.setDataGetter(function (chunkNum) {
                        var start = chunkNum * chunkSize;
                        var end = (chunkNum + 1) * chunkSize - 1;
                        end = Math.min(end, datalength - 1);
                        if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                          lazyArray.chunks[chunkNum] = doXHR(start, end);
                        }
                        if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
                        return lazyArray.chunks[chunkNum];
                      });
                      if (usesGzip || !datalength) {
                        chunkSize = datalength = 1;
                        datalength = this.getter(0).length;
                        chunkSize = datalength;
                        out("LazyFiles on gzip forces download of the whole file when length is accessed");
                      }
                      this._length = datalength;
                      this._chunkSize = chunkSize;
                      this.lengthKnown = true;
                    }
                  }, {
                    key: "length",
                    get: function get() {
                      if (!this.lengthKnown) {
                        this.cacheLength();
                      }
                      return this._length;
                    }
                  }, {
                    key: "chunkSize",
                    get: function get() {
                      if (!this.lengthKnown) {
                        this.cacheLength();
                      }
                      return this._chunkSize;
                    }
                  }]);
                }();
                if (typeof XMLHttpRequest != "undefined") {
                  if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                  var lazyArray = new LazyUint8Array();
                  var properties = {
                    isDevice: false,
                    contents: lazyArray
                  };
                } else {
                  var properties = {
                    isDevice: false,
                    url: url
                  };
                }
                var node = FS.createFile(parent, name, properties, canRead, canWrite);
                if (properties.contents) {
                  node.contents = properties.contents;
                } else if (properties.url) {
                  node.contents = null;
                  node.url = properties.url;
                }
                Object.defineProperties(node, {
                  usedBytes: {
                    get: function get() {
                      return this.contents.length;
                    }
                  }
                });
                var stream_ops = {};
                var keys = Object.keys(node.stream_ops);
                keys.forEach(function (key) {
                  var fn = node.stream_ops[key];
                  stream_ops[key] = function () {
                    FS.forceLoadFile(node);
                    return fn.apply(void 0, arguments);
                  };
                });
                function writeChunks(stream, buffer, offset, length, position) {
                  var contents = stream.node.contents;
                  if (position >= contents.length) return 0;
                  var size = Math.min(contents.length - position, length);
                  if (contents.slice) {
                    for (var i = 0; i < size; i++) {
                      buffer[offset + i] = contents[position + i];
                    }
                  } else {
                    for (var i = 0; i < size; i++) {
                      buffer[offset + i] = contents.get(position + i);
                    }
                  }
                  return size;
                }
                stream_ops.read = function (stream, buffer, offset, length, position) {
                  FS.forceLoadFile(node);
                  return writeChunks(stream, buffer, offset, length, position);
                };
                stream_ops.mmap = function (stream, length, position, prot, flags) {
                  FS.forceLoadFile(node);
                  var ptr = mmapAlloc(length);
                  if (!ptr) {
                    throw new FS.ErrnoError(48);
                  }
                  writeChunks(stream, HEAP8, ptr, length, position);
                  return {
                    ptr: ptr,
                    allocated: true
                  };
                };
                node.stream_ops = stream_ops;
                return node;
              }
            };
            var UTF8ToString = function UTF8ToString(ptr, maxBytesToRead) {
              return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
            };
            var SYSCALLS = {
              DEFAULT_POLLMASK: 5,
              calculateAt: function calculateAt(dirfd, path, allowEmpty) {
                if (PATH.isAbs(path)) {
                  return path;
                }
                var dir;
                if (dirfd === -100) {
                  dir = FS.cwd();
                } else {
                  var dirstream = SYSCALLS.getStreamFromFD(dirfd);
                  dir = dirstream.path;
                }
                if (path.length == 0) {
                  if (!allowEmpty) {
                    throw new FS.ErrnoError(44);
                  }
                  return dir;
                }
                return PATH.join2(dir, path);
              },
              doStat: function doStat(func, path, buf) {
                var stat = func(path);
                HEAP32[buf >> 2] = stat.dev;
                HEAP32[buf + 4 >> 2] = stat.mode;
                HEAPU32[buf + 8 >> 2] = stat.nlink;
                HEAP32[buf + 12 >> 2] = stat.uid;
                HEAP32[buf + 16 >> 2] = stat.gid;
                HEAP32[buf + 20 >> 2] = stat.rdev;
                HEAP64[buf + 24 >> 3] = BigInt(stat.size);
                HEAP32[buf + 32 >> 2] = 4096;
                HEAP32[buf + 36 >> 2] = stat.blocks;
                var atime = stat.atime.getTime();
                var mtime = stat.mtime.getTime();
                var ctime = stat.ctime.getTime();
                HEAP64[buf + 40 >> 3] = BigInt(Math.floor(atime / 1e3));
                HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3;
                HEAP64[buf + 56 >> 3] = BigInt(Math.floor(mtime / 1e3));
                HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3;
                HEAP64[buf + 72 >> 3] = BigInt(Math.floor(ctime / 1e3));
                HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3;
                HEAP64[buf + 88 >> 3] = BigInt(stat.ino);
                return 0;
              },
              doMsync: function doMsync(addr, stream, len, flags, offset) {
                if (!FS.isFile(stream.node.mode)) {
                  throw new FS.ErrnoError(43);
                }
                if (flags & 2) {
                  return 0;
                }
                var buffer = HEAPU8.slice(addr, addr + len);
                FS.msync(stream, buffer, offset, len, flags);
              },
              getStreamFromFD: function getStreamFromFD(fd) {
                var stream = FS.getStreamChecked(fd);
                return stream;
              },
              varargs: undefined,
              getStr: function getStr(ptr) {
                var ret = UTF8ToString(ptr);
                return ret;
              }
            };
            function ___syscall_chdir(path) {
              try {
                path = SYSCALLS.getStr(path);
                FS.chdir(path);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_chmod(path, mode) {
              try {
                path = SYSCALLS.getStr(path);
                FS.chmod(path, mode);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_faccessat(dirfd, path, amode, flags) {
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                if (amode & ~7) {
                  return -28;
                }
                var lookup = FS.lookupPath(path, {
                  follow: true
                });
                var node = lookup.node;
                if (!node) {
                  return -44;
                }
                var perms = "";
                if (amode & 4) perms += "r";
                if (amode & 2) perms += "w";
                if (amode & 1) perms += "x";
                if (perms && FS.nodePermissions(node, perms)) {
                  return -2;
                }
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_fchmod(fd, mode) {
              try {
                FS.fchmod(fd, mode);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function syscallGetVarargI() {
              var ret = HEAP32[+SYSCALLS.varargs >> 2];
              SYSCALLS.varargs += 4;
              return ret;
            }
            var syscallGetVarargP = syscallGetVarargI;
            function ___syscall_fcntl64(fd, cmd, varargs) {
              SYSCALLS.varargs = varargs;
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                switch (cmd) {
                  case 0:
                    {
                      var arg = syscallGetVarargI();
                      if (arg < 0) {
                        return -28;
                      }
                      while (FS.streams[arg]) {
                        arg++;
                      }
                      var newStream;
                      newStream = FS.dupStream(stream, arg);
                      return newStream.fd;
                    }
                  case 1:
                  case 2:
                    return 0;
                  case 3:
                    return stream.flags;
                  case 4:
                    {
                      var arg = syscallGetVarargI();
                      stream.flags |= arg;
                      return 0;
                    }
                  case 12:
                    {
                      var arg = syscallGetVarargP();
                      var offset = 0;
                      HEAP16[arg + offset >> 1] = 2;
                      return 0;
                    }
                  case 13:
                  case 14:
                    return 0;
                }
                return -28;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_fstat64(fd, buf) {
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                return SYSCALLS.doStat(FS.stat, stream.path, buf);
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            var INT53_MAX = 9007199254740992;
            var INT53_MIN = -9007199254740992;
            var bigintToI53Checked = function bigintToI53Checked(num) {
              return num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
            };
            function ___syscall_ftruncate64(fd, length) {
              length = bigintToI53Checked(length);
              try {
                if (isNaN(length)) return 61;
                FS.ftruncate(fd, length);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            var stringToUTF8 = function stringToUTF8(str, outPtr, maxBytesToWrite) {
              return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
            };
            function ___syscall_getcwd(buf, size) {
              try {
                if (size === 0) return -28;
                var cwd = FS.cwd();
                var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
                if (size < cwdLengthInBytes) return -68;
                stringToUTF8(cwd, buf, size);
                return cwdLengthInBytes;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_getdents64(fd, dirp, count) {
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                stream.getdents || (stream.getdents = FS.readdir(stream.path));
                var struct_size = 280;
                var pos = 0;
                var off = FS.llseek(stream, 0, 1);
                var idx = Math.floor(off / struct_size);
                while (idx < stream.getdents.length && pos + struct_size <= count) {
                  var id;
                  var type;
                  var name = stream.getdents[idx];
                  if (name === ".") {
                    id = stream.node.id;
                    type = 4;
                  } else if (name === "..") {
                    var lookup = FS.lookupPath(stream.path, {
                      parent: true
                    });
                    id = lookup.node.id;
                    type = 4;
                  } else {
                    var child = FS.lookupNode(stream.node, name);
                    id = child.id;
                    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
                  }
                  HEAP64[dirp + pos >> 3] = BigInt(id);
                  HEAP64[dirp + pos + 8 >> 3] = BigInt((idx + 1) * struct_size);
                  HEAP16[dirp + pos + 16 >> 1] = 280;
                  HEAP8[dirp + pos + 18] = type;
                  stringToUTF8(name, dirp + pos + 19, 256);
                  pos += struct_size;
                  idx += 1;
                }
                FS.llseek(stream, idx * struct_size, 0);
                return pos;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_ioctl(fd, op, varargs) {
              SYSCALLS.varargs = varargs;
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                switch (op) {
                  case 21509:
                    {
                      if (!stream.tty) return -59;
                      return 0;
                    }
                  case 21505:
                    {
                      if (!stream.tty) return -59;
                      if (stream.tty.ops.ioctl_tcgets) {
                        var termios = stream.tty.ops.ioctl_tcgets(stream);
                        var argp = syscallGetVarargP();
                        HEAP32[argp >> 2] = termios.c_iflag || 0;
                        HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                        HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                        HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                        for (var i = 0; i < 32; i++) {
                          HEAP8[argp + i + 17] = termios.c_cc[i] || 0;
                        }
                        return 0;
                      }
                      return 0;
                    }
                  case 21510:
                  case 21511:
                  case 21512:
                    {
                      if (!stream.tty) return -59;
                      return 0;
                    }
                  case 21506:
                  case 21507:
                  case 21508:
                    {
                      if (!stream.tty) return -59;
                      if (stream.tty.ops.ioctl_tcsets) {
                        var argp = syscallGetVarargP();
                        var c_iflag = HEAP32[argp >> 2];
                        var c_oflag = HEAP32[argp + 4 >> 2];
                        var c_cflag = HEAP32[argp + 8 >> 2];
                        var c_lflag = HEAP32[argp + 12 >> 2];
                        var c_cc = [];
                        for (var i = 0; i < 32; i++) {
                          c_cc.push(HEAP8[argp + i + 17]);
                        }
                        return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                          c_iflag: c_iflag,
                          c_oflag: c_oflag,
                          c_cflag: c_cflag,
                          c_lflag: c_lflag,
                          c_cc: c_cc
                        });
                      }
                      return 0;
                    }
                  case 21519:
                    {
                      if (!stream.tty) return -59;
                      var argp = syscallGetVarargP();
                      HEAP32[argp >> 2] = 0;
                      return 0;
                    }
                  case 21520:
                    {
                      if (!stream.tty) return -59;
                      return -28;
                    }
                  case 21531:
                    {
                      var argp = syscallGetVarargP();
                      return FS.ioctl(stream, op, argp);
                    }
                  case 21523:
                    {
                      if (!stream.tty) return -59;
                      if (stream.tty.ops.ioctl_tiocgwinsz) {
                        var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                        var argp = syscallGetVarargP();
                        HEAP16[argp >> 1] = winsize[0];
                        HEAP16[argp + 2 >> 1] = winsize[1];
                      }
                      return 0;
                    }
                  case 21524:
                    {
                      if (!stream.tty) return -59;
                      return 0;
                    }
                  case 21515:
                    {
                      if (!stream.tty) return -59;
                      return 0;
                    }
                  default:
                    return -28;
                }
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_lstat64(path, buf) {
              try {
                path = SYSCALLS.getStr(path);
                return SYSCALLS.doStat(FS.lstat, path, buf);
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_mkdirat(dirfd, path, mode) {
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                path = PATH.normalize(path);
                if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
                FS.mkdir(path, mode, 0);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_mknodat(dirfd, path, mode, dev) {
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                switch (mode & 61440) {
                  case 32768:
                  case 8192:
                  case 24576:
                  case 4096:
                  case 49152:
                    break;
                  default:
                    return -28;
                }
                FS.mknod(path, mode, dev);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_newfstatat(dirfd, path, buf, flags) {
              try {
                path = SYSCALLS.getStr(path);
                var nofollow = flags & 256;
                var allowEmpty = flags & 4096;
                flags = flags & ~6400;
                path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
                return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_openat(dirfd, path, flags, varargs) {
              SYSCALLS.varargs = varargs;
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                var mode = varargs ? syscallGetVarargI() : 0;
                return FS.open(path, flags, mode).fd;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                if (bufsize <= 0) return -28;
                var ret = FS.readlink(path);
                var len = Math.min(bufsize, lengthBytesUTF8(ret));
                var endChar = HEAP8[buf + len];
                stringToUTF8(ret, buf, bufsize + 1);
                HEAP8[buf + len] = endChar;
                return len;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_renameat(olddirfd, oldpath, newdirfd, newpath) {
              try {
                oldpath = SYSCALLS.getStr(oldpath);
                newpath = SYSCALLS.getStr(newpath);
                oldpath = SYSCALLS.calculateAt(olddirfd, oldpath);
                newpath = SYSCALLS.calculateAt(newdirfd, newpath);
                FS.rename(oldpath, newpath);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_rmdir(path) {
              try {
                path = SYSCALLS.getStr(path);
                FS.rmdir(path);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_stat64(path, buf) {
              try {
                path = SYSCALLS.getStr(path);
                return SYSCALLS.doStat(FS.stat, path, buf);
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_statfs64(path, size, buf) {
              try {
                path = SYSCALLS.getStr(path);
                HEAP32[buf + 4 >> 2] = 4096;
                HEAP32[buf + 40 >> 2] = 4096;
                HEAP32[buf + 8 >> 2] = 1e6;
                HEAP32[buf + 12 >> 2] = 5e5;
                HEAP32[buf + 16 >> 2] = 5e5;
                HEAP32[buf + 20 >> 2] = FS.nextInode;
                HEAP32[buf + 24 >> 2] = 1e6;
                HEAP32[buf + 28 >> 2] = 42;
                HEAP32[buf + 44 >> 2] = 2;
                HEAP32[buf + 36 >> 2] = 255;
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_symlink(target, linkpath) {
              try {
                target = SYSCALLS.getStr(target);
                linkpath = SYSCALLS.getStr(linkpath);
                FS.symlink(target, linkpath);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            function ___syscall_unlinkat(dirfd, path, flags) {
              try {
                path = SYSCALLS.getStr(path);
                path = SYSCALLS.calculateAt(dirfd, path);
                if (flags === 0) {
                  FS.unlink(path);
                } else if (flags === 512) {
                  FS.rmdir(path);
                } else {
                  abort("Invalid flags passed to unlinkat");
                }
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return -e.errno;
              }
            }
            var __abort_js = function __abort_js() {
              abort("");
            };
            var nowIsMonotonic = 1;
            var __emscripten_get_now_is_monotonic = function __emscripten_get_now_is_monotonic() {
              return nowIsMonotonic;
            };
            var __emscripten_runtime_keepalive_clear = function __emscripten_runtime_keepalive_clear() {
              noExitRuntime = false;
              runtimeKeepaliveCounter = 0;
            };
            function __gmtime_js(time, tmPtr) {
              time = bigintToI53Checked(time);
              var date = new Date(time * 1e3);
              HEAP32[tmPtr >> 2] = date.getUTCSeconds();
              HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
              HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
              HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
              HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
              HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
              HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
              var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
              var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
              HEAP32[tmPtr + 28 >> 2] = yday;
            }
            var isLeapYear = function isLeapYear(year) {
              return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
            };
            var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
            var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            var ydayFromDate = function ydayFromDate(date) {
              var leap = isLeapYear(date.getFullYear());
              var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
              var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
              return yday;
            };
            function __localtime_js(time, tmPtr) {
              time = bigintToI53Checked(time);
              var date = new Date(time * 1e3);
              HEAP32[tmPtr >> 2] = date.getSeconds();
              HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
              HEAP32[tmPtr + 8 >> 2] = date.getHours();
              HEAP32[tmPtr + 12 >> 2] = date.getDate();
              HEAP32[tmPtr + 16 >> 2] = date.getMonth();
              HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
              HEAP32[tmPtr + 24 >> 2] = date.getDay();
              var yday = ydayFromDate(date) | 0;
              HEAP32[tmPtr + 28 >> 2] = yday;
              HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
              var start = new Date(date.getFullYear(), 0, 1);
              var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
              var winterOffset = start.getTimezoneOffset();
              var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
              HEAP32[tmPtr + 32 >> 2] = dst;
            }
            var __tzset_js = function __tzset_js(timezone, daylight, std_name, dst_name) {
              var currentYear = new Date().getFullYear();
              var winter = new Date(currentYear, 0, 1);
              var summer = new Date(currentYear, 6, 1);
              var winterOffset = winter.getTimezoneOffset();
              var summerOffset = summer.getTimezoneOffset();
              var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
              HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
              HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
              var extractZone = function extractZone(timezoneOffset) {
                var sign = timezoneOffset >= 0 ? "-" : "+";
                var absOffset = Math.abs(timezoneOffset);
                var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
                var minutes = String(absOffset % 60).padStart(2, "0");
                return "UTC".concat(sign).concat(hours).concat(minutes);
              };
              var winterName = extractZone(winterOffset);
              var summerName = extractZone(summerOffset);
              if (summerOffset < winterOffset) {
                stringToUTF8(winterName, std_name, 17);
                stringToUTF8(summerName, dst_name, 17);
              } else {
                stringToUTF8(winterName, dst_name, 17);
                stringToUTF8(summerName, std_name, 17);
              }
            };
            var runtimeKeepaliveCounter = 0;
            var runtimeKeepalivePush = function runtimeKeepalivePush() {
              runtimeKeepaliveCounter += 1;
            };
            var _emscripten_set_main_loop_timing = function _emscripten_set_main_loop_timing(mode, value) {
              Browser.mainLoop.timingMode = mode;
              Browser.mainLoop.timingValue = value;
              if (!Browser.mainLoop.func) {
                return 1;
              }
              if (!Browser.mainLoop.running) {
                runtimeKeepalivePush();
                Browser.mainLoop.running = true;
              }
              if (mode == 0) {
                Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
                  var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
                  setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
                };
                Browser.mainLoop.method = "timeout";
              } else if (mode == 1) {
                Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
                  Browser.requestAnimationFrame(Browser.mainLoop.runner);
                };
                Browser.mainLoop.method = "rAF";
              } else if (mode == 2) {
                if (typeof Browser.setImmediate == "undefined") {
                  if (typeof setImmediate == "undefined") {
                    var setImmediates = [];
                    var emscriptenMainLoopMessageId = "setimmediate";
                    var Browser_setImmediate_messageHandler = function Browser_setImmediate_messageHandler(event) {
                      if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                        event.stopPropagation();
                        setImmediates.shift()();
                      }
                    };
                    addEventListener("message", Browser_setImmediate_messageHandler, true);
                    Browser.setImmediate = function Browser_emulated_setImmediate(func) {
                      setImmediates.push(func);
                      if (ENVIRONMENT_IS_WORKER) {
                        var _setImmediates, _Module$_setImmediate;
                        (_Module$_setImmediate = Module[_setImmediates = "setImmediates"]) !== null && _Module$_setImmediate !== void 0 ? _Module$_setImmediate : Module[_setImmediates] = [];
                        Module["setImmediates"].push(func);
                        postMessage({
                          target: emscriptenMainLoopMessageId
                        });
                      } else postMessage(emscriptenMainLoopMessageId, "*");
                    };
                  } else {
                    Browser.setImmediate = setImmediate;
                  }
                }
                Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
                  Browser.setImmediate(Browser.mainLoop.runner);
                };
                Browser.mainLoop.method = "immediate";
              }
              return 0;
            };
            var _emscripten_get_now;
            _emscripten_get_now = function _emscripten_get_now() {
              return performance.now();
            };
            var webgl_enable_ANGLE_instanced_arrays = function webgl_enable_ANGLE_instanced_arrays(ctx) {
              var ext = ctx.getExtension("ANGLE_instanced_arrays");
              if (ext) {
                ctx["vertexAttribDivisor"] = function (index, divisor) {
                  return ext["vertexAttribDivisorANGLE"](index, divisor);
                };
                ctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
                  return ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
                };
                ctx["drawElementsInstanced"] = function (mode, count, type, indices, primcount) {
                  return ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
                };
                return 1;
              }
            };
            var webgl_enable_OES_vertex_array_object = function webgl_enable_OES_vertex_array_object(ctx) {
              var ext = ctx.getExtension("OES_vertex_array_object");
              if (ext) {
                ctx["createVertexArray"] = function () {
                  return ext["createVertexArrayOES"]();
                };
                ctx["deleteVertexArray"] = function (vao) {
                  return ext["deleteVertexArrayOES"](vao);
                };
                ctx["bindVertexArray"] = function (vao) {
                  return ext["bindVertexArrayOES"](vao);
                };
                ctx["isVertexArray"] = function (vao) {
                  return ext["isVertexArrayOES"](vao);
                };
                return 1;
              }
            };
            var webgl_enable_WEBGL_draw_buffers = function webgl_enable_WEBGL_draw_buffers(ctx) {
              var ext = ctx.getExtension("WEBGL_draw_buffers");
              if (ext) {
                ctx["drawBuffers"] = function (n, bufs) {
                  return ext["drawBuffersWEBGL"](n, bufs);
                };
                return 1;
              }
            };
            var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = function webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(ctx) {
              return !!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));
            };
            var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = function webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(ctx) {
              return !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));
            };
            var webgl_enable_WEBGL_multi_draw = function webgl_enable_WEBGL_multi_draw(ctx) {
              return !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
            };
            var getEmscriptenSupportedExtensions = function getEmscriptenSupportedExtensions(ctx) {
              var supportedExtensions = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw"];
              return (ctx.getSupportedExtensions() || []).filter(function (ext) {
                return supportedExtensions.includes(ext);
              });
            };
            var GL = {
              counter: 1,
              buffers: [],
              programs: [],
              framebuffers: [],
              renderbuffers: [],
              textures: [],
              shaders: [],
              vaos: [],
              contexts: [],
              offscreenCanvases: {},
              queries: [],
              samplers: [],
              transformFeedbacks: [],
              syncs: [],
              stringCache: {},
              stringiCache: {},
              unpackAlignment: 4,
              unpackRowLength: 0,
              recordError: function recordError(errorCode) {
                if (!GL.lastError) {
                  GL.lastError = errorCode;
                }
              },
              getNewId: function getNewId(table) {
                var ret = GL.counter++;
                for (var i = table.length; i < ret; i++) {
                  table[i] = null;
                }
                return ret;
              },
              genObject: function genObject(n, buffers, createFunction, objectTable) {
                for (var i = 0; i < n; i++) {
                  var buffer = GLctx[createFunction]();
                  var id = buffer && GL.getNewId(objectTable);
                  if (buffer) {
                    buffer.name = id;
                    objectTable[id] = buffer;
                  } else {
                    GL.recordError(1282);
                  }
                  HEAP32[buffers + i * 4 >> 2] = id;
                }
              },
              getSource: function getSource(shader, count, string, length) {
                var source = "";
                for (var i = 0; i < count; ++i) {
                  var len = length ? HEAPU32[length + i * 4 >> 2] : undefined;
                  source += UTF8ToString(HEAPU32[string + i * 4 >> 2], len);
                }
                return source;
              },
              createContext: function createContext(canvas, webGLContextAttributes) {
                if (webGLContextAttributes.renderViaOffscreenBackBuffer) webGLContextAttributes["preserveDrawingBuffer"] = true;
                var ctx = webGLContextAttributes.majorVersion > 1 ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes);
                if (!ctx) return 0;
                var handle = GL.registerContext(ctx, webGLContextAttributes);
                return handle;
              },
              enableOffscreenFramebufferAttributes: function enableOffscreenFramebufferAttributes(webGLContextAttributes) {
                webGLContextAttributes.renderViaOffscreenBackBuffer = true;
                webGLContextAttributes.preserveDrawingBuffer = true;
              },
              createOffscreenFramebuffer: function createOffscreenFramebuffer(context) {
                var gl = context.GLctx;
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(36160, fbo);
                context.defaultFbo = fbo;
                context.defaultFboForbidBlitFramebuffer = false;
                if (gl.getContextAttributes().antialias) {
                  context.defaultFboForbidBlitFramebuffer = true;
                }
                context.defaultColorTarget = gl.createTexture();
                context.defaultDepthTarget = gl.createRenderbuffer();
                GL.resizeOffscreenFramebuffer(context);
                gl.bindTexture(3553, context.defaultColorTarget);
                gl.texParameteri(3553, 10241, 9728);
                gl.texParameteri(3553, 10240, 9728);
                gl.texParameteri(3553, 10242, 33071);
                gl.texParameteri(3553, 10243, 33071);
                gl.texImage2D(3553, 0, 6408, gl.canvas.width, gl.canvas.height, 0, 6408, 5121, null);
                gl.framebufferTexture2D(36160, 36064, 3553, context.defaultColorTarget, 0);
                gl.bindTexture(3553, null);
                var depthTarget = gl.createRenderbuffer();
                gl.bindRenderbuffer(36161, context.defaultDepthTarget);
                gl.renderbufferStorage(36161, 33189, gl.canvas.width, gl.canvas.height);
                gl.framebufferRenderbuffer(36160, 36096, 36161, context.defaultDepthTarget);
                gl.bindRenderbuffer(36161, null);
                var vertices = [-1, -1, -1, 1, 1, -1, 1, 1];
                var vb = gl.createBuffer();
                gl.bindBuffer(34962, vb);
                gl.bufferData(34962, new Float32Array(vertices), 35044);
                gl.bindBuffer(34962, null);
                context.blitVB = vb;
                var vsCode = "attribute vec2 pos;" + "varying lowp vec2 tex;" + "void main() { tex = pos * 0.5 + vec2(0.5,0.5); gl_Position = vec4(pos, 0.0, 1.0); }";
                var vs = gl.createShader(35633);
                gl.shaderSource(vs, vsCode);
                gl.compileShader(vs);
                var fsCode = "varying lowp vec2 tex;" + "uniform sampler2D sampler;" + "void main() { gl_FragColor = texture2D(sampler, tex); }";
                var fs = gl.createShader(35632);
                gl.shaderSource(fs, fsCode);
                gl.compileShader(fs);
                var blitProgram = gl.createProgram();
                gl.attachShader(blitProgram, vs);
                gl.attachShader(blitProgram, fs);
                gl.linkProgram(blitProgram);
                context.blitProgram = blitProgram;
                context.blitPosLoc = gl.getAttribLocation(blitProgram, "pos");
                gl.useProgram(blitProgram);
                gl.uniform1i(gl.getUniformLocation(blitProgram, "sampler"), 0);
                gl.useProgram(null);
                context.defaultVao = undefined;
                if (gl.createVertexArray) {
                  context.defaultVao = gl.createVertexArray();
                  gl.bindVertexArray(context.defaultVao);
                  gl.enableVertexAttribArray(context.blitPosLoc);
                  gl.bindVertexArray(null);
                }
              },
              resizeOffscreenFramebuffer: function resizeOffscreenFramebuffer(context) {
                var gl = context.GLctx;
                if (context.defaultColorTarget) {
                  var prevTextureBinding = gl.getParameter(32873);
                  gl.bindTexture(3553, context.defaultColorTarget);
                  gl.texImage2D(3553, 0, 6408, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, 6408, 5121, null);
                  gl.bindTexture(3553, prevTextureBinding);
                }
                if (context.defaultDepthTarget) {
                  var prevRenderBufferBinding = gl.getParameter(36007);
                  gl.bindRenderbuffer(36161, context.defaultDepthTarget);
                  gl.renderbufferStorage(36161, 33189, gl.drawingBufferWidth, gl.drawingBufferHeight);
                  gl.bindRenderbuffer(36161, prevRenderBufferBinding);
                }
              },
              blitOffscreenFramebuffer: function blitOffscreenFramebuffer(context) {
                var gl = context.GLctx;
                var prevScissorTest = gl.getParameter(3089);
                if (prevScissorTest) gl.disable(3089);
                var prevFbo = gl.getParameter(36006);
                if (gl.blitFramebuffer && !context.defaultFboForbidBlitFramebuffer) {
                  gl.bindFramebuffer(36008, context.defaultFbo);
                  gl.bindFramebuffer(36009, null);
                  gl.blitFramebuffer(0, 0, gl.canvas.width, gl.canvas.height, 0, 0, gl.canvas.width, gl.canvas.height, 16384, 9728);
                } else {
                  var draw = function draw() {
                    gl.vertexAttribPointer(context.blitPosLoc, 2, 5126, false, 0, 0);
                    gl.drawArrays(5, 0, 4);
                  };
                  gl.bindFramebuffer(36160, null);
                  var prevProgram = gl.getParameter(35725);
                  gl.useProgram(context.blitProgram);
                  var prevVB = gl.getParameter(34964);
                  gl.bindBuffer(34962, context.blitVB);
                  var prevActiveTexture = gl.getParameter(34016);
                  gl.activeTexture(33984);
                  var prevTextureBinding = gl.getParameter(32873);
                  gl.bindTexture(3553, context.defaultColorTarget);
                  var prevBlend = gl.getParameter(3042);
                  if (prevBlend) gl.disable(3042);
                  var prevCullFace = gl.getParameter(2884);
                  if (prevCullFace) gl.disable(2884);
                  var prevDepthTest = gl.getParameter(2929);
                  if (prevDepthTest) gl.disable(2929);
                  var prevStencilTest = gl.getParameter(2960);
                  if (prevStencilTest) gl.disable(2960);
                  if (context.defaultVao) {
                    var prevVAO = gl.getParameter(34229);
                    gl.bindVertexArray(context.defaultVao);
                    draw();
                    gl.bindVertexArray(prevVAO);
                  } else {
                    var prevVertexAttribPointer = {
                      buffer: gl.getVertexAttrib(context.blitPosLoc, 34975),
                      size: gl.getVertexAttrib(context.blitPosLoc, 34339),
                      stride: gl.getVertexAttrib(context.blitPosLoc, 34340),
                      type: gl.getVertexAttrib(context.blitPosLoc, 34341),
                      normalized: gl.getVertexAttrib(context.blitPosLoc, 34922),
                      pointer: gl.getVertexAttribOffset(context.blitPosLoc, 34373)
                    };
                    var maxVertexAttribs = gl.getParameter(34921);
                    var prevVertexAttribEnables = [];
                    for (var i = 0; i < maxVertexAttribs; ++i) {
                      var prevEnabled = gl.getVertexAttrib(i, 34338);
                      var wantEnabled = i == context.blitPosLoc;
                      if (prevEnabled && !wantEnabled) {
                        gl.disableVertexAttribArray(i);
                      }
                      if (!prevEnabled && wantEnabled) {
                        gl.enableVertexAttribArray(i);
                      }
                      prevVertexAttribEnables[i] = prevEnabled;
                    }
                    draw();
                    for (var i = 0; i < maxVertexAttribs; ++i) {
                      var prevEnabled = prevVertexAttribEnables[i];
                      var nowEnabled = i == context.blitPosLoc;
                      if (prevEnabled && !nowEnabled) {
                        gl.enableVertexAttribArray(i);
                      }
                      if (!prevEnabled && nowEnabled) {
                        gl.disableVertexAttribArray(i);
                      }
                    }
                    gl.bindBuffer(34962, prevVertexAttribPointer.buffer);
                    gl.vertexAttribPointer(context.blitPosLoc, prevVertexAttribPointer.size, prevVertexAttribPointer.type, prevVertexAttribPointer.normalized, prevVertexAttribPointer.stride, prevVertexAttribPointer.offset);
                  }
                  if (prevStencilTest) gl.enable(2960);
                  if (prevDepthTest) gl.enable(2929);
                  if (prevCullFace) gl.enable(2884);
                  if (prevBlend) gl.enable(3042);
                  gl.bindTexture(3553, prevTextureBinding);
                  gl.activeTexture(prevActiveTexture);
                  gl.bindBuffer(34962, prevVB);
                  gl.useProgram(prevProgram);
                }
                gl.bindFramebuffer(36160, prevFbo);
                if (prevScissorTest) gl.enable(3089);
              },
              registerContext: function registerContext(ctx, webGLContextAttributes) {
                var handle = GL.getNewId(GL.contexts);
                var context = {
                  handle: handle,
                  attributes: webGLContextAttributes,
                  version: webGLContextAttributes.majorVersion,
                  GLctx: ctx
                };
                if (ctx.canvas) ctx.canvas.GLctxObject = context;
                GL.contexts[handle] = context;
                if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
                  GL.initExtensions(context);
                }
                if (webGLContextAttributes.renderViaOffscreenBackBuffer) GL.createOffscreenFramebuffer(context);
                return handle;
              },
              makeContextCurrent: function makeContextCurrent(contextHandle) {
                var _GL$currentContext;
                GL.currentContext = GL.contexts[contextHandle];
                Module.ctx = GLctx = (_GL$currentContext = GL.currentContext) === null || _GL$currentContext === void 0 ? void 0 : _GL$currentContext.GLctx;
                return !(contextHandle && !GLctx);
              },
              getContext: function getContext(contextHandle) {
                return GL.contexts[contextHandle];
              },
              deleteContext: function deleteContext(contextHandle) {
                if (GL.currentContext === GL.contexts[contextHandle]) {
                  GL.currentContext = null;
                }
                if (_typeof(JSEvents) == "object") {
                  JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
                }
                if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
                  GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
                }
                GL.contexts[contextHandle] = null;
              },
              initExtensions: function initExtensions(context) {
                context || (context = GL.currentContext);
                if (context.initExtensionsDone) return;
                context.initExtensionsDone = true;
                var GLctx = context.GLctx;
                webgl_enable_ANGLE_instanced_arrays(GLctx);
                webgl_enable_OES_vertex_array_object(GLctx);
                webgl_enable_WEBGL_draw_buffers(GLctx);
                webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
                webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
                if (context.version >= 2) {
                  GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
                }
                if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
                  GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
                }
                webgl_enable_WEBGL_multi_draw(GLctx);
                getEmscriptenSupportedExtensions(GLctx).forEach(function (ext) {
                  if (!ext.includes("lose_context") && !ext.includes("debug")) {
                    GLctx.getExtension(ext);
                  }
                });
              }
            };
            var _emscripten_webgl_do_commit_frame = function _emscripten_webgl_do_commit_frame() {
              if (!GL.currentContext || !GL.currentContext.GLctx) {
                return -3;
              }
              if (GL.currentContext.defaultFbo) {
                GL.blitOffscreenFramebuffer(GL.currentContext);
                return 0;
              }
              if (!GL.currentContext.attributes.explicitSwapControl) {
                return -3;
              }
              return 0;
            };
            var _emscripten_webgl_commit_frame = _emscripten_webgl_do_commit_frame;
            var keepRuntimeAlive = function keepRuntimeAlive() {
              return noExitRuntime || runtimeKeepaliveCounter > 0;
            };
            var _proc_exit = function _proc_exit(code) {
              EXITSTATUS = code;
              if (!keepRuntimeAlive()) {
                var _Module$onExit;
                (_Module$onExit = Module["onExit"]) === null || _Module$onExit === void 0 || _Module$onExit.call(Module, code);
                ABORT = true;
              }
              quit_(code, new ExitStatus(code));
            };
            var exitJS = function exitJS(status, implicit) {
              EXITSTATUS = status;
              if (!keepRuntimeAlive()) {
                exitRuntime();
              }
              _proc_exit(status);
            };
            var _exit = exitJS;
            var handleException = function handleException(e) {
              if (e instanceof ExitStatus || e == "unwind") {
                return EXITSTATUS;
              }
              quit_(1, e);
            };
            var maybeExit = function maybeExit() {
              if (runtimeExited) {
                return;
              }
              if (!keepRuntimeAlive()) {
                try {
                  _exit(EXITSTATUS);
                } catch (e) {
                  handleException(e);
                }
              }
            };
            var runtimeKeepalivePop = function runtimeKeepalivePop() {
              runtimeKeepaliveCounter -= 1;
            };
            var setMainLoop = function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
              Browser.mainLoop.func = browserIterationFunc;
              Browser.mainLoop.arg = arg;
              var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
              function checkIsRunning() {
                if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
                  runtimeKeepalivePop();
                  maybeExit();
                  return false;
                }
                return true;
              }
              Browser.mainLoop.running = false;
              Browser.mainLoop.runner = function Browser_mainLoop_runner() {
                var _SDL$audio, _SDL$audio$queueNewAu;
                if (ABORT) return;
                if (Browser.mainLoop.queue.length > 0) {
                  var start = Date.now();
                  var blocker = Browser.mainLoop.queue.shift();
                  blocker.func(blocker.arg);
                  if (Browser.mainLoop.remainingBlockers) {
                    var remaining = Browser.mainLoop.remainingBlockers;
                    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                    if (blocker.counted) {
                      Browser.mainLoop.remainingBlockers = next;
                    } else {
                      next = next + .5;
                      Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
                    }
                  }
                  Browser.mainLoop.updateStatus();
                  if (!checkIsRunning()) return;
                  setTimeout(Browser.mainLoop.runner, 0);
                  return;
                }
                if (!checkIsRunning()) return;
                Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
                if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
                  Browser.mainLoop.scheduler();
                  return;
                } else if (Browser.mainLoop.timingMode == 0) {
                  Browser.mainLoop.tickStartTime = _emscripten_get_now();
                }
                Browser.mainLoop.runIter(browserIterationFunc);
                if (!checkIsRunning()) return;
                if ((typeof SDL === "undefined" ? "undefined" : _typeof(SDL)) == "object") (_SDL$audio = SDL.audio) === null || _SDL$audio === void 0 || (_SDL$audio$queueNewAu = _SDL$audio.queueNewAudioData) === null || _SDL$audio$queueNewAu === void 0 || _SDL$audio$queueNewAu.call(_SDL$audio);
                Browser.mainLoop.scheduler();
              };
              if (!noSetTiming) {
                if (fps && fps > 0) {
                  _emscripten_set_main_loop_timing(0, 1e3 / fps);
                } else {
                  _emscripten_set_main_loop_timing(1, 1);
                }
                Browser.mainLoop.scheduler();
              }
              if (simulateInfiniteLoop) {
                throw "unwind";
              }
            };
            var callUserCallback = function callUserCallback(func) {
              if (runtimeExited || ABORT) {
                return;
              }
              try {
                func();
                maybeExit();
              } catch (e) {
                handleException(e);
              }
            };
            var _safeSetTimeout = function safeSetTimeout(func, timeout) {
              runtimeKeepalivePush();
              return setTimeout(function () {
                runtimeKeepalivePop();
                callUserCallback(func);
              }, timeout);
            };
            var _warnOnce = function warnOnce(text) {
              _warnOnce.shown || (_warnOnce.shown = {});
              if (!_warnOnce.shown[text]) {
                _warnOnce.shown[text] = 1;
                err(text);
              }
            };
            var Browser = {
              mainLoop: {
                running: false,
                scheduler: null,
                method: "",
                currentlyRunningMainloop: 0,
                func: null,
                arg: 0,
                timingMode: 0,
                timingValue: 0,
                currentFrameNumber: 0,
                queue: [],
                pause: function pause() {
                  Browser.mainLoop.scheduler = null;
                  Browser.mainLoop.currentlyRunningMainloop++;
                },
                resume: function resume() {
                  Browser.mainLoop.currentlyRunningMainloop++;
                  var timingMode = Browser.mainLoop.timingMode;
                  var timingValue = Browser.mainLoop.timingValue;
                  var func = Browser.mainLoop.func;
                  Browser.mainLoop.func = null;
                  setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
                  _emscripten_set_main_loop_timing(timingMode, timingValue);
                  Browser.mainLoop.scheduler();
                },
                updateStatus: function updateStatus() {
                  if (Module["setStatus"]) {
                    var message = Module["statusMessage"] || "Please wait...";
                    var remaining = Browser.mainLoop.remainingBlockers;
                    var expected = Browser.mainLoop.expectedBlockers;
                    if (remaining) {
                      if (remaining < expected) {
                        Module["setStatus"]("{message} ({expected - remaining}/{expected})");
                      } else {
                        Module["setStatus"](message);
                      }
                    } else {
                      Module["setStatus"]("");
                    }
                  }
                },
                runIter: function runIter(func) {
                  var _Module$postMainLoop;
                  if (ABORT) return;
                  if (Module["preMainLoop"]) {
                    var preRet = Module["preMainLoop"]();
                    if (preRet === false) {
                      return;
                    }
                  }
                  callUserCallback(func);
                  (_Module$postMainLoop = Module["postMainLoop"]) === null || _Module$postMainLoop === void 0 || _Module$postMainLoop.call(Module);
                }
              },
              isFullscreen: false,
              pointerLock: false,
              moduleContextCreatedCallbacks: [],
              workers: [],
              init: function init() {
                if (Browser.initted) return;
                Browser.initted = true;
                var imagePlugin = {};
                imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
                  return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
                };
                imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
                  var b = new Blob([byteArray], {
                    type: Browser.getMimetype(name)
                  });
                  if (b.size !== byteArray.length) {
                    b = new Blob([new Uint8Array(byteArray).buffer], {
                      type: Browser.getMimetype(name)
                    });
                  }
                  var url = URL.createObjectURL(b);
                  var img = new Image();
                  img.onload = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    preloadedImages[name] = canvas;
                    URL.revokeObjectURL(url);
                    onload === null || onload === void 0 || onload(byteArray);
                  };
                  img.onerror = function (event) {
                    err("Image ".concat(url, " could not be decoded"));
                    onerror === null || onerror === void 0 || onerror();
                  };
                  img.src = url;
                };
                preloadPlugins.push(imagePlugin);
                var audioPlugin = {};
                audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
                  return !Module.noAudioDecoding && name.substr(-4) in {
                    ".ogg": 1,
                    ".wav": 1,
                    ".mp3": 1
                  };
                };
                audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
                  var done = false;
                  function finish(audio) {
                    if (done) return;
                    done = true;
                    preloadedAudios[name] = audio;
                    onload === null || onload === void 0 || onload(byteArray);
                  }
                  var b = new Blob([byteArray], {
                    type: Browser.getMimetype(name)
                  });
                  var url = URL.createObjectURL(b);
                  var audio = new Audio();
                  audio.addEventListener("canplaythrough", function () {
                    return finish(audio);
                  }, false);
                  audio.onerror = function audio_onerror(event) {
                    if (done) return;
                    err("warning: browser could not fully decode audio ".concat(name, ", trying slower base64 approach"));
                    function encode64(data) {
                      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                      var PAD = "=";
                      var ret = "";
                      var leftchar = 0;
                      var leftbits = 0;
                      for (var i = 0; i < data.length; i++) {
                        leftchar = leftchar << 8 | data[i];
                        leftbits += 8;
                        while (leftbits >= 6) {
                          var curr = leftchar >> leftbits - 6 & 63;
                          leftbits -= 6;
                          ret += BASE[curr];
                        }
                      }
                      if (leftbits == 2) {
                        ret += BASE[(leftchar & 3) << 4];
                        ret += PAD + PAD;
                      } else if (leftbits == 4) {
                        ret += BASE[(leftchar & 15) << 2];
                        ret += PAD;
                      }
                      return ret;
                    }
                    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                    finish(audio);
                  };
                  audio.src = url;
                  _safeSetTimeout(function () {
                    finish(audio);
                  }, 1e4);
                };
                preloadPlugins.push(audioPlugin);
                function pointerLockChange() {
                  Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
                }
                var canvas = Module["canvas"];
                if (canvas) {
                  canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function () {};
                  canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function () {};
                  canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
                  document.addEventListener("pointerlockchange", pointerLockChange, false);
                  document.addEventListener("mozpointerlockchange", pointerLockChange, false);
                  document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
                  document.addEventListener("mspointerlockchange", pointerLockChange, false);
                  if (Module["elementPointerLock"]) {
                    canvas.addEventListener("click", function (ev) {
                      if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault();
                      }
                    }, false);
                  }
                }
              },
              createContext: function createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
                if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
                var ctx;
                var contextHandle;
                if (useWebGL) {
                  var contextAttributes = {
                    antialias: false,
                    alpha: false,
                    majorVersion: typeof WebGL2RenderingContext != "undefined" ? 2 : 1
                  };
                  if (webGLContextAttributes) {
                    for (var attribute in webGLContextAttributes) {
                      contextAttributes[attribute] = webGLContextAttributes[attribute];
                    }
                  }
                  if (typeof GL != "undefined") {
                    contextHandle = GL.createContext(canvas, contextAttributes);
                    if (contextHandle) {
                      ctx = GL.getContext(contextHandle).GLctx;
                    }
                  }
                } else {
                  ctx = canvas.getContext("2d");
                }
                if (!ctx) return null;
                if (setInModule) {
                  Module.ctx = ctx;
                  if (useWebGL) GL.makeContextCurrent(contextHandle);
                  Module.useWebGL = useWebGL;
                  Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
                    return callback();
                  });
                  Browser.init();
                }
                return ctx;
              },
              destroyContext: function destroyContext(canvas, useWebGL, setInModule) {},
              fullscreenHandlersInstalled: false,
              lockPointer: undefined,
              resizeCanvas: undefined,
              requestFullscreen: function requestFullscreen(lockPointer, resizeCanvas) {
                Browser.lockPointer = lockPointer;
                Browser.resizeCanvas = resizeCanvas;
                if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
                if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
                var canvas = Module["canvas"];
                function fullscreenChange() {
                  var _Module$onFullScreen, _Module$onFullscreen;
                  Browser.isFullscreen = false;
                  var canvasContainer = canvas.parentNode;
                  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                    canvas.exitFullscreen = Browser.exitFullscreen;
                    if (Browser.lockPointer) canvas.requestPointerLock();
                    Browser.isFullscreen = true;
                    if (Browser.resizeCanvas) {
                      Browser.setFullscreenCanvasSize();
                    } else {
                      Browser.updateCanvasDimensions(canvas);
                    }
                  } else {
                    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                    canvasContainer.parentNode.removeChild(canvasContainer);
                    if (Browser.resizeCanvas) {
                      Browser.setWindowedCanvasSize();
                    } else {
                      Browser.updateCanvasDimensions(canvas);
                    }
                  }
                  (_Module$onFullScreen = Module["onFullScreen"]) === null || _Module$onFullScreen === void 0 || _Module$onFullScreen.call(Module, Browser.isFullscreen);
                  (_Module$onFullscreen = Module["onFullscreen"]) === null || _Module$onFullscreen === void 0 || _Module$onFullscreen.call(Module, Browser.isFullscreen);
                }
                if (!Browser.fullscreenHandlersInstalled) {
                  Browser.fullscreenHandlersInstalled = true;
                  document.addEventListener("fullscreenchange", fullscreenChange, false);
                  document.addEventListener("mozfullscreenchange", fullscreenChange, false);
                  document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
                  document.addEventListener("MSFullscreenChange", fullscreenChange, false);
                }
                var canvasContainer = document.createElement("div");
                canvas.parentNode.insertBefore(canvasContainer, canvas);
                canvasContainer.appendChild(canvas);
                canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function () {
                  return canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
                } : null) || (canvasContainer["webkitRequestFullScreen"] ? function () {
                  return canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
                } : null);
                canvasContainer.requestFullscreen();
              },
              exitFullscreen: function exitFullscreen() {
                if (!Browser.isFullscreen) {
                  return false;
                }
                var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function () {};
                CFS.apply(document, []);
                return true;
              },
              nextRAF: 0,
              fakeRequestAnimationFrame: function fakeRequestAnimationFrame(func) {
                var now = Date.now();
                if (Browser.nextRAF === 0) {
                  Browser.nextRAF = now + 1e3 / 60;
                } else {
                  while (now + 2 >= Browser.nextRAF) {
                    Browser.nextRAF += 1e3 / 60;
                  }
                }
                var delay = Math.max(Browser.nextRAF - now, 0);
                setTimeout(func, delay);
              },
              requestAnimationFrame: function (_requestAnimationFrame) {
                function requestAnimationFrame(_x) {
                  return _requestAnimationFrame.apply(this, arguments);
                }
                requestAnimationFrame.toString = function () {
                  return _requestAnimationFrame.toString();
                };
                return requestAnimationFrame;
              }(function (func) {
                if (typeof requestAnimationFrame == "function") {
                  requestAnimationFrame(func);
                  return;
                }
                var RAF = Browser.fakeRequestAnimationFrame;
                RAF(func);
              }),
              safeSetTimeout: function safeSetTimeout(func, timeout) {
                return _safeSetTimeout(func, timeout);
              },
              safeRequestAnimationFrame: function safeRequestAnimationFrame(func) {
                runtimeKeepalivePush();
                return Browser.requestAnimationFrame(function () {
                  runtimeKeepalivePop();
                  callUserCallback(func);
                });
              },
              getMimetype: function getMimetype(name) {
                return {
                  jpg: "image/jpeg",
                  jpeg: "image/jpeg",
                  png: "image/png",
                  bmp: "image/bmp",
                  ogg: "audio/ogg",
                  wav: "audio/wav",
                  mp3: "audio/mpeg"
                }[name.substr(name.lastIndexOf(".") + 1)];
              },
              getUserMedia: function getUserMedia(func) {
                var _window;
                (_window = window).getUserMedia || (_window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"]);
                window.getUserMedia(func);
              },
              getMovementX: function getMovementX(event) {
                return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
              },
              getMovementY: function getMovementY(event) {
                return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
              },
              getMouseWheelDelta: function getMouseWheelDelta(event) {
                var delta = 0;
                switch (event.type) {
                  case "DOMMouseScroll":
                    delta = event.detail / 3;
                    break;
                  case "mousewheel":
                    delta = event.wheelDelta / 120;
                    break;
                  case "wheel":
                    delta = event.deltaY;
                    switch (event.deltaMode) {
                      case 0:
                        delta /= 100;
                        break;
                      case 1:
                        delta /= 3;
                        break;
                      case 2:
                        delta *= 80;
                        break;
                      default:
                        throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
                    }
                    break;
                  default:
                    throw "unrecognized mouse wheel event: " + event.type;
                }
                return delta;
              },
              mouseX: 0,
              mouseY: 0,
              mouseMovementX: 0,
              mouseMovementY: 0,
              touches: {},
              lastTouches: {},
              calculateMouseCoords: function calculateMouseCoords(pageX, pageY) {
                var rect = Module["canvas"].getBoundingClientRect();
                var cw = Module["canvas"].width;
                var ch = Module["canvas"].height;
                var scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
                var scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
                var adjustedX = pageX - (scrollX + rect.left);
                var adjustedY = pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                return {
                  x: adjustedX,
                  y: adjustedY
                };
              },
              setMouseCoords: function setMouseCoords(pageX, pageY) {
                var _Browser$calculateMou = Browser.calculateMouseCoords(pageX, pageY),
                  x = _Browser$calculateMou.x,
                  y = _Browser$calculateMou.y;
                Browser.mouseMovementX = x - Browser.mouseX;
                Browser.mouseMovementY = y - Browser.mouseY;
                Browser.mouseX = x;
                Browser.mouseY = y;
              },
              calculateMouseEvent: function calculateMouseEvent(event) {
                if (Browser.pointerLock) {
                  if (event.type != "mousemove" && "mozMovementX" in event) {
                    Browser.mouseMovementX = Browser.mouseMovementY = 0;
                  } else {
                    Browser.mouseMovementX = Browser.getMovementX(event);
                    Browser.mouseMovementY = Browser.getMovementY(event);
                  }
                  Browser.mouseX += Browser.mouseMovementX;
                  Browser.mouseY += Browser.mouseMovementY;
                } else {
                  if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                    var touch = event.touch;
                    if (touch === undefined) {
                      return;
                    }
                    var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
                    if (event.type === "touchstart") {
                      Browser.lastTouches[touch.identifier] = coords;
                      Browser.touches[touch.identifier] = coords;
                    } else if (event.type === "touchend" || event.type === "touchmove") {
                      var last = Browser.touches[touch.identifier];
                      last || (last = coords);
                      Browser.lastTouches[touch.identifier] = last;
                      Browser.touches[touch.identifier] = coords;
                    }
                    return;
                  }
                  Browser.setMouseCoords(event.pageX, event.pageY);
                }
              },
              resizeListeners: [],
              updateResizeListeners: function updateResizeListeners() {
                var canvas = Module["canvas"];
                Browser.resizeListeners.forEach(function (listener) {
                  return listener(canvas.width, canvas.height);
                });
              },
              setCanvasSize: function setCanvasSize(width, height, noUpdates) {
                var canvas = Module["canvas"];
                Browser.updateCanvasDimensions(canvas, width, height);
                if (!noUpdates) Browser.updateResizeListeners();
              },
              windowedWidth: 0,
              windowedHeight: 0,
              setFullscreenCanvasSize: function setFullscreenCanvasSize() {
                if (typeof SDL != "undefined") {
                  var flags = HEAPU32[SDL.screen >> 2];
                  flags = flags | 8388608;
                  HEAP32[SDL.screen >> 2] = flags;
                }
                Browser.updateCanvasDimensions(Module["canvas"]);
                Browser.updateResizeListeners();
              },
              setWindowedCanvasSize: function setWindowedCanvasSize() {
                if (typeof SDL != "undefined") {
                  var flags = HEAPU32[SDL.screen >> 2];
                  flags = flags & ~8388608;
                  HEAP32[SDL.screen >> 2] = flags;
                }
                Browser.updateCanvasDimensions(Module["canvas"]);
                Browser.updateResizeListeners();
              },
              updateCanvasDimensions: function updateCanvasDimensions(canvas, wNative, hNative) {
                if (wNative && hNative) {
                  canvas.widthNative = wNative;
                  canvas.heightNative = hNative;
                } else {
                  wNative = canvas.widthNative;
                  hNative = canvas.heightNative;
                }
                var w = wNative;
                var h = hNative;
                if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
                  if (w / h < Module["forcedAspectRatio"]) {
                    w = Math.round(h * Module["forcedAspectRatio"]);
                  } else {
                    h = Math.round(w / Module["forcedAspectRatio"]);
                  }
                }
                if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
                  var factor = Math.min(screen.width / w, screen.height / h);
                  w = Math.round(w * factor);
                  h = Math.round(h * factor);
                }
                if (Browser.resizeCanvas) {
                  if (canvas.width != w) canvas.width = w;
                  if (canvas.height != h) canvas.height = h;
                  if (typeof canvas.style != "undefined") {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height");
                  }
                } else {
                  if (canvas.width != wNative) canvas.width = wNative;
                  if (canvas.height != hNative) canvas.height = hNative;
                  if (typeof canvas.style != "undefined") {
                    if (w != wNative || h != hNative) {
                      canvas.style.setProperty("width", w + "px", "important");
                      canvas.style.setProperty("height", h + "px", "important");
                    } else {
                      canvas.style.removeProperty("width");
                      canvas.style.removeProperty("height");
                    }
                  }
                }
              }
            };
            var _emscripten_cancel_main_loop = function _emscripten_cancel_main_loop() {
              Browser.mainLoop.pause();
              Browser.mainLoop.func = null;
            };
            var _emscripten_date_now = function _emscripten_date_now() {
              return Date.now();
            };
            var _emscripten_force_exit = function _emscripten_force_exit(status) {
              __emscripten_runtime_keepalive_clear();
              _exit(status);
            };
            var getHeapMax = function getHeapMax() {
              return 2147483648;
            };
            var _emscripten_get_heap_max = function _emscripten_get_heap_max() {
              return getHeapMax();
            };
            var growMemory = function growMemory(size) {
              var b = wasmMemory.buffer;
              var pages = (size - b.byteLength + 65535) / 65536;
              try {
                wasmMemory.grow(pages);
                updateMemoryViews();
                return 1;
              } catch (e) {}
            };
            var _emscripten_resize_heap = function _emscripten_resize_heap(requestedSize) {
              var oldSize = HEAPU8.length;
              requestedSize >>>= 0;
              var maxHeapSize = getHeapMax();
              if (requestedSize > maxHeapSize) {
                return false;
              }
              var alignUp = function alignUp(x, multiple) {
                return x + (multiple - x % multiple) % multiple;
              };
              for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                var replacement = growMemory(newSize);
                if (replacement) {
                  return true;
                }
              }
              return false;
            };
            var JSEvents = {
              removeAllEventListeners: function removeAllEventListeners() {
                while (JSEvents.eventHandlers.length) {
                  JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
                }
                JSEvents.deferredCalls = [];
              },
              registerRemoveEventListeners: function registerRemoveEventListeners() {
                if (!JSEvents.removeEventListenersRegistered) {
                  __ATEXIT__.push(JSEvents.removeAllEventListeners);
                  JSEvents.removeEventListenersRegistered = true;
                }
              },
              inEventHandler: 0,
              deferredCalls: [],
              deferCall: function deferCall(targetFunction, precedence, argsList) {
                function arraysHaveEqualContent(arrA, arrB) {
                  if (arrA.length != arrB.length) return false;
                  for (var i in arrA) {
                    if (arrA[i] != arrB[i]) return false;
                  }
                  return true;
                }
                var _iterator = _createForOfIteratorHelper(JSEvents.deferredCalls),
                  _step;
                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var call = _step.value;
                    if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                      return;
                    }
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }
                JSEvents.deferredCalls.push({
                  targetFunction: targetFunction,
                  precedence: precedence,
                  argsList: argsList
                });
                JSEvents.deferredCalls.sort(function (x, y) {
                  return x.precedence < y.precedence;
                });
              },
              removeDeferredCalls: function removeDeferredCalls(targetFunction) {
                JSEvents.deferredCalls = JSEvents.deferredCalls.filter(function (call) {
                  return call.targetFunction != targetFunction;
                });
              },
              canPerformEventHandlerRequests: function canPerformEventHandlerRequests() {
                if (navigator.userActivation) {
                  return navigator.userActivation.isActive;
                }
                return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
              },
              runDeferredCalls: function runDeferredCalls() {
                if (!JSEvents.canPerformEventHandlerRequests()) {
                  return;
                }
                var deferredCalls = JSEvents.deferredCalls;
                JSEvents.deferredCalls = [];
                var _iterator2 = _createForOfIteratorHelper(deferredCalls),
                  _step2;
                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    var _call;
                    var call = _step2.value;
                    (_call = call).targetFunction.apply(_call, _toConsumableArray(call.argsList));
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
              },
              eventHandlers: [],
              removeAllHandlersOnTarget: function removeAllHandlersOnTarget(target, eventTypeString) {
                for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                  if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
                    JSEvents._removeHandler(i--);
                  }
                }
              },
              _removeHandler: function _removeHandler(i) {
                var h = JSEvents.eventHandlers[i];
                h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
                JSEvents.eventHandlers.splice(i, 1);
              },
              registerOrRemoveHandler: function registerOrRemoveHandler(eventHandler) {
                if (!eventHandler.target) {
                  return -4;
                }
                if (eventHandler.callbackfunc) {
                  eventHandler.eventListenerFunc = function (event) {
                    ++JSEvents.inEventHandler;
                    JSEvents.currentEventHandler = eventHandler;
                    JSEvents.runDeferredCalls();
                    eventHandler.handlerFunc(event);
                    JSEvents.runDeferredCalls();
                    --JSEvents.inEventHandler;
                  };
                  eventHandler.target.addEventListener(eventHandler.eventTypeString, eventHandler.eventListenerFunc, eventHandler.useCapture);
                  JSEvents.eventHandlers.push(eventHandler);
                  JSEvents.registerRemoveEventListeners();
                } else {
                  for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
                      JSEvents._removeHandler(i--);
                    }
                  }
                }
                return 0;
              },
              getNodeNameForTarget: function getNodeNameForTarget(target) {
                if (!target) return "";
                if (target == window) return "#window";
                if (target == screen) return "#screen";
                return (target === null || target === void 0 ? void 0 : target.nodeName) || "";
              },
              fullscreenEnabled: function fullscreenEnabled() {
                return document.fullscreenEnabled || document.webkitFullscreenEnabled;
              }
            };
            var maybeCStringToJsString = function maybeCStringToJsString(cString) {
              return cString > 2 ? UTF8ToString(cString) : cString;
            };
            var specialHTMLTargets = [0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0];
            var findEventTarget = function findEventTarget(target) {
              target = maybeCStringToJsString(target);
              var domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : undefined);
              return domElement;
            };
            var findCanvasEventTarget = findEventTarget;
            var _emscripten_set_canvas_element_size = function _emscripten_set_canvas_element_size(target, width, height) {
              var canvas = findCanvasEventTarget(target);
              if (!canvas) return -4;
              canvas.width = width;
              canvas.height = height;
              if (canvas.GLctxObject) GL.resizeOffscreenFramebuffer(canvas.GLctxObject);
              return 0;
            };
            var _emscripten_set_main_loop = function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
              var browserIterationFunc = getWasmTableEntry(func);
              setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
            };
            var webglPowerPreferences = ["default", "low-power", "high-performance"];
            var _emscripten_webgl_do_create_context = function _emscripten_webgl_do_create_context(target, attributes) {
              var attr32 = attributes >> 2;
              var powerPreference = HEAP32[attr32 + (8 >> 2)];
              var contextAttributes = {
                alpha: !!HEAP8[attributes + 0],
                depth: !!HEAP8[attributes + 1],
                stencil: !!HEAP8[attributes + 2],
                antialias: !!HEAP8[attributes + 3],
                premultipliedAlpha: !!HEAP8[attributes + 4],
                preserveDrawingBuffer: !!HEAP8[attributes + 5],
                powerPreference: webglPowerPreferences[powerPreference],
                failIfMajorPerformanceCaveat: !!HEAP8[attributes + 12],
                majorVersion: HEAP32[attr32 + (16 >> 2)],
                minorVersion: HEAP32[attr32 + (20 >> 2)],
                enableExtensionsByDefault: HEAP8[attributes + 24],
                explicitSwapControl: HEAP8[attributes + 25],
                proxyContextToMainThread: HEAP32[attr32 + (28 >> 2)],
                renderViaOffscreenBackBuffer: HEAP8[attributes + 32]
              };
              var canvas = findCanvasEventTarget(target);
              if (!canvas) {
                return 0;
              }
              if (contextAttributes.explicitSwapControl && !contextAttributes.renderViaOffscreenBackBuffer) {
                contextAttributes.renderViaOffscreenBackBuffer = true;
              }
              var contextHandle = GL.createContext(canvas, contextAttributes);
              return contextHandle;
            };
            var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;
            var _emscripten_webgl_destroy_context = function _emscripten_webgl_destroy_context(contextHandle) {
              if (GL.currentContext == contextHandle) GL.currentContext = 0;
              GL.deleteContext(contextHandle);
            };
            var _emscripten_webgl_enable_extension = function _emscripten_webgl_enable_extension(contextHandle, extension) {
              var context = GL.getContext(contextHandle);
              var extString = UTF8ToString(extension);
              if (extString.startsWith("GL_")) extString = extString.substr(3);
              if (extString == "ANGLE_instanced_arrays") webgl_enable_ANGLE_instanced_arrays(GLctx);
              if (extString == "OES_vertex_array_object") webgl_enable_OES_vertex_array_object(GLctx);
              if (extString == "WEBGL_draw_buffers") webgl_enable_WEBGL_draw_buffers(GLctx);
              if (extString == "WEBGL_draw_instanced_base_vertex_base_instance") webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
              if (extString == "WEBGL_multi_draw_instanced_base_vertex_base_instance") webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
              if (extString == "WEBGL_multi_draw") webgl_enable_WEBGL_multi_draw(GLctx);
              var ext = context.GLctx.getExtension(extString);
              return !!ext;
            };
            var stringToNewUTF8 = function stringToNewUTF8(str) {
              var size = lengthBytesUTF8(str) + 1;
              var ret = _malloc2(size);
              if (ret) stringToUTF8(str, ret, size);
              return ret;
            };
            var _emscripten_webgl_get_supported_extensions = function _emscripten_webgl_get_supported_extensions() {
              return stringToNewUTF8(GLctx.getSupportedExtensions().join(" "));
            };
            var _emscripten_webgl_make_context_current = function _emscripten_webgl_make_context_current(contextHandle) {
              var success = GL.makeContextCurrent(contextHandle);
              return success ? 0 : -5;
            };
            var ENV = {};
            var getExecutableName = function getExecutableName() {
              return thisProgram || "./this.program";
            };
            var _getEnvStrings = function getEnvStrings() {
              if (!_getEnvStrings.strings) {
                var lang = ((typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
                var env = {
                  USER: "web_user",
                  LOGNAME: "web_user",
                  PATH: "/",
                  PWD: "/",
                  HOME: "/home/web_user",
                  LANG: lang,
                  _: getExecutableName()
                };
                for (var x in ENV) {
                  if (ENV[x] === undefined) delete env[x];else env[x] = ENV[x];
                }
                var strings = [];
                for (var x in env) {
                  strings.push("".concat(x, "=").concat(env[x]));
                }
                _getEnvStrings.strings = strings;
              }
              return _getEnvStrings.strings;
            };
            var stringToAscii = function stringToAscii(str, buffer) {
              for (var i = 0; i < str.length; ++i) {
                HEAP8[buffer++] = str.charCodeAt(i);
              }
              HEAP8[buffer] = 0;
            };
            var _environ_get = function _environ_get(__environ, environ_buf) {
              var bufSize = 0;
              _getEnvStrings().forEach(function (string, i) {
                var ptr = environ_buf + bufSize;
                HEAPU32[__environ + i * 4 >> 2] = ptr;
                stringToAscii(string, ptr);
                bufSize += string.length + 1;
              });
              return 0;
            };
            var _environ_sizes_get = function _environ_sizes_get(penviron_count, penviron_buf_size) {
              var strings = _getEnvStrings();
              HEAPU32[penviron_count >> 2] = strings.length;
              var bufSize = 0;
              strings.forEach(function (string) {
                return bufSize += string.length + 1;
              });
              HEAPU32[penviron_buf_size >> 2] = bufSize;
              return 0;
            };
            function _fd_close(fd) {
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                FS.close(stream);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return e.errno;
              }
            }
            function _fd_fdstat_get(fd, pbuf) {
              try {
                var rightsBase = 0;
                var rightsInheriting = 0;
                var flags = 0;
                {
                  var stream = SYSCALLS.getStreamFromFD(fd);
                  var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
                }
                HEAP8[pbuf] = type;
                HEAP16[pbuf + 2 >> 1] = flags;
                HEAP64[pbuf + 8 >> 3] = BigInt(rightsBase);
                HEAP64[pbuf + 16 >> 3] = BigInt(rightsInheriting);
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return e.errno;
              }
            }
            var doReadv = function doReadv(stream, iov, iovcnt, offset) {
              var ret = 0;
              for (var i = 0; i < iovcnt; i++) {
                var ptr = HEAPU32[iov >> 2];
                var len = HEAPU32[iov + 4 >> 2];
                iov += 8;
                var curr = FS.read(stream, HEAP8, ptr, len, offset);
                if (curr < 0) return -1;
                ret += curr;
                if (curr < len) break;
                if (typeof offset != "undefined") {
                  offset += curr;
                }
              }
              return ret;
            };
            function _fd_read(fd, iov, iovcnt, pnum) {
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var num = doReadv(stream, iov, iovcnt);
                HEAPU32[pnum >> 2] = num;
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return e.errno;
              }
            }
            function _fd_seek(fd, offset, whence, newOffset) {
              offset = bigintToI53Checked(offset);
              try {
                if (isNaN(offset)) return 61;
                var stream = SYSCALLS.getStreamFromFD(fd);
                FS.llseek(stream, offset, whence);
                HEAP64[newOffset >> 3] = BigInt(stream.position);
                if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return e.errno;
              }
            }
            var doWritev = function doWritev(stream, iov, iovcnt, offset) {
              var ret = 0;
              for (var i = 0; i < iovcnt; i++) {
                var ptr = HEAPU32[iov >> 2];
                var len = HEAPU32[iov + 4 >> 2];
                iov += 8;
                var curr = FS.write(stream, HEAP8, ptr, len, offset);
                if (curr < 0) return -1;
                ret += curr;
                if (typeof offset != "undefined") {
                  offset += curr;
                }
              }
              return ret;
            };
            function _fd_write(fd, iov, iovcnt, pnum) {
              try {
                var stream = SYSCALLS.getStreamFromFD(fd);
                var num = doWritev(stream, iov, iovcnt);
                HEAPU32[pnum >> 2] = num;
                return 0;
              } catch (e) {
                if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
                return e.errno;
              }
            }
            var _glActiveTexture = function _glActiveTexture(x0) {
              return GLctx.activeTexture(x0);
            };
            var _glAttachShader = function _glAttachShader(program, shader) {
              GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
            };
            var _glBeginTransformFeedback = function _glBeginTransformFeedback(x0) {
              return GLctx.beginTransformFeedback(x0);
            };
            var _glBindBuffer = function _glBindBuffer(target, buffer) {
              if (target == 35051) {
                GLctx.currentPixelPackBufferBinding = buffer;
              } else if (target == 35052) {
                GLctx.currentPixelUnpackBufferBinding = buffer;
              }
              GLctx.bindBuffer(target, GL.buffers[buffer]);
            };
            var _glBindBufferBase = function _glBindBufferBase(target, index, buffer) {
              GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
            };
            var _glBindBufferRange = function _glBindBufferRange(target, index, buffer, offset, ptrsize) {
              GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize);
            };
            var _glBindFramebuffer = function _glBindFramebuffer(target, framebuffer) {
              GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : GL.currentContext.defaultFbo);
            };
            var _glBindRenderbuffer = function _glBindRenderbuffer(target, renderbuffer) {
              GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
            };
            var _glBindTexture = function _glBindTexture(target, texture) {
              GLctx.bindTexture(target, GL.textures[texture]);
            };
            var _glBindVertexArray = function _glBindVertexArray(vao) {
              GLctx.bindVertexArray(GL.vaos[vao]);
            };
            var _glBlendColor = function _glBlendColor(x0, x1, x2, x3) {
              return GLctx.blendColor(x0, x1, x2, x3);
            };
            var _glBlendEquation = function _glBlendEquation(x0) {
              return GLctx.blendEquation(x0);
            };
            var _glBlendFunc = function _glBlendFunc(x0, x1) {
              return GLctx.blendFunc(x0, x1);
            };
            var _glBlendFuncSeparate = function _glBlendFuncSeparate(x0, x1, x2, x3) {
              return GLctx.blendFuncSeparate(x0, x1, x2, x3);
            };
            var _glBlitFramebuffer = function _glBlitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) {
              return GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);
            };
            var _glBufferData = function _glBufferData(target, size, data, usage) {
              if (GL.currentContext.version >= 2) {
                if (data && size) {
                  GLctx.bufferData(target, HEAPU8, usage, data, size);
                } else {
                  GLctx.bufferData(target, size, usage);
                }
                return;
              }
              GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
            };
            var _glBufferSubData = function _glBufferSubData(target, offset, size, data) {
              if (GL.currentContext.version >= 2) {
                size && GLctx.bufferSubData(target, offset, HEAPU8, data, size);
                return;
              }
              GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
            };
            var _glCheckFramebufferStatus = function _glCheckFramebufferStatus(x0) {
              return GLctx.checkFramebufferStatus(x0);
            };
            var _glClear = function _glClear(x0) {
              return GLctx.clear(x0);
            };
            var _glClearBufferfv = function _glClearBufferfv(buffer, drawbuffer, value) {
              GLctx.clearBufferfv(buffer, drawbuffer, HEAPF32, value >> 2);
            };
            var _glClearColor = function _glClearColor(x0, x1, x2, x3) {
              return GLctx.clearColor(x0, x1, x2, x3);
            };
            var _glClearDepthf = function _glClearDepthf(x0) {
              return GLctx.clearDepth(x0);
            };
            var _glColorMask = function _glColorMask(red, green, blue, alpha) {
              GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
            };
            var _glCompileShader = function _glCompileShader(shader) {
              GLctx.compileShader(GL.shaders[shader]);
            };
            var _glCompressedTexImage2D = function _glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
              if (GL.currentContext.version >= 2) {
                if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
                  GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data);
                  return;
                }
                GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, HEAPU8, data, imageSize);
                return;
              }
              GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
            };
            var _glCompressedTexImage3D = function _glCompressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data) {
              if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, imageSize, data);
              } else {
                GLctx.compressedTexImage3D(target, level, internalFormat, width, height, depth, border, HEAPU8, data, imageSize);
              }
            };
            var _glCompressedTexSubImage3D = function _glCompressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) {
              if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
              } else {
                GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, HEAPU8, data, imageSize);
              }
            };
            var _glCopyBufferSubData = function _glCopyBufferSubData(x0, x1, x2, x3, x4) {
              return GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
            };
            var _glCreateProgram = function _glCreateProgram() {
              var id = GL.getNewId(GL.programs);
              var program = GLctx.createProgram();
              program.name = id;
              program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
              program.uniformIdCounter = 1;
              GL.programs[id] = program;
              return id;
            };
            var _glCreateShader = function _glCreateShader(shaderType) {
              var id = GL.getNewId(GL.shaders);
              GL.shaders[id] = GLctx.createShader(shaderType);
              return id;
            };
            var _glCullFace = function _glCullFace(x0) {
              return GLctx.cullFace(x0);
            };
            var _glDeleteBuffers = function _glDeleteBuffers(n, buffers) {
              for (var i = 0; i < n; i++) {
                var id = HEAP32[buffers + i * 4 >> 2];
                var buffer = GL.buffers[id];
                if (!buffer) continue;
                GLctx.deleteBuffer(buffer);
                buffer.name = 0;
                GL.buffers[id] = null;
                if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
                if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
              }
            };
            var _glDeleteFramebuffers = function _glDeleteFramebuffers(n, framebuffers) {
              for (var i = 0; i < n; ++i) {
                var id = HEAP32[framebuffers + i * 4 >> 2];
                var framebuffer = GL.framebuffers[id];
                if (!framebuffer) continue;
                GLctx.deleteFramebuffer(framebuffer);
                framebuffer.name = 0;
                GL.framebuffers[id] = null;
              }
            };
            var _glDeleteProgram = function _glDeleteProgram(id) {
              if (!id) return;
              var program = GL.programs[id];
              if (!program) {
                GL.recordError(1281);
                return;
              }
              GLctx.deleteProgram(program);
              program.name = 0;
              GL.programs[id] = null;
            };
            var _glDeleteQueries = function _glDeleteQueries(n, ids) {
              for (var i = 0; i < n; i++) {
                var id = HEAP32[ids + i * 4 >> 2];
                var query = GL.queries[id];
                if (!query) continue;
                GLctx.deleteQuery(query);
                GL.queries[id] = null;
              }
            };
            var _glDeleteRenderbuffers = function _glDeleteRenderbuffers(n, renderbuffers) {
              for (var i = 0; i < n; i++) {
                var id = HEAP32[renderbuffers + i * 4 >> 2];
                var renderbuffer = GL.renderbuffers[id];
                if (!renderbuffer) continue;
                GLctx.deleteRenderbuffer(renderbuffer);
                renderbuffer.name = 0;
                GL.renderbuffers[id] = null;
              }
            };
            var _glDeleteShader = function _glDeleteShader(id) {
              if (!id) return;
              var shader = GL.shaders[id];
              if (!shader) {
                GL.recordError(1281);
                return;
              }
              GLctx.deleteShader(shader);
              GL.shaders[id] = null;
            };
            var _glDeleteSync = function _glDeleteSync(id) {
              if (!id) return;
              var sync = GL.syncs[id];
              if (!sync) {
                GL.recordError(1281);
                return;
              }
              GLctx.deleteSync(sync);
              sync.name = 0;
              GL.syncs[id] = null;
            };
            var _glDeleteTextures = function _glDeleteTextures(n, textures) {
              for (var i = 0; i < n; i++) {
                var id = HEAP32[textures + i * 4 >> 2];
                var texture = GL.textures[id];
                if (!texture) continue;
                GLctx.deleteTexture(texture);
                texture.name = 0;
                GL.textures[id] = null;
              }
            };
            var _glDeleteVertexArrays = function _glDeleteVertexArrays(n, vaos) {
              for (var i = 0; i < n; i++) {
                var id = HEAP32[vaos + i * 4 >> 2];
                GLctx.deleteVertexArray(GL.vaos[id]);
                GL.vaos[id] = null;
              }
            };
            var _glDepthFunc = function _glDepthFunc(x0) {
              return GLctx.depthFunc(x0);
            };
            var _glDepthMask = function _glDepthMask(flag) {
              GLctx.depthMask(!!flag);
            };
            var _glDisable = function _glDisable(x0) {
              return GLctx.disable(x0);
            };
            var _glDisableVertexAttribArray = function _glDisableVertexAttribArray(index) {
              GLctx.disableVertexAttribArray(index);
            };
            var _glDrawArrays = function _glDrawArrays(mode, first, count) {
              GLctx.drawArrays(mode, first, count);
            };
            var _glDrawArraysInstanced = function _glDrawArraysInstanced(mode, first, count, primcount) {
              GLctx.drawArraysInstanced(mode, first, count, primcount);
            };
            var tempFixedLengthArray = [];
            var _glDrawBuffers = function _glDrawBuffers(n, bufs) {
              var bufArray = tempFixedLengthArray[n];
              for (var i = 0; i < n; i++) {
                bufArray[i] = HEAP32[bufs + i * 4 >> 2];
              }
              GLctx.drawBuffers(bufArray);
            };
            var _glDrawElements = function _glDrawElements(mode, count, type, indices) {
              GLctx.drawElements(mode, count, type, indices);
            };
            var _glDrawElementsInstanced = function _glDrawElementsInstanced(mode, count, type, indices, primcount) {
              GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
            };
            var _glEnable = function _glEnable(x0) {
              return GLctx.enable(x0);
            };
            var _glEnableVertexAttribArray = function _glEnableVertexAttribArray(index) {
              GLctx.enableVertexAttribArray(index);
            };
            var _glEndTransformFeedback = function _glEndTransformFeedback() {
              return GLctx.endTransformFeedback();
            };
            var _glFenceSync = function _glFenceSync(condition, flags) {
              var sync = GLctx.fenceSync(condition, flags);
              if (sync) {
                var id = GL.getNewId(GL.syncs);
                sync.name = id;
                GL.syncs[id] = sync;
                return id;
              }
              return 0;
            };
            var _glFinish = function _glFinish() {
              return GLctx.finish();
            };
            var _glFramebufferRenderbuffer = function _glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
              GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
            };
            var _glFramebufferTexture2D = function _glFramebufferTexture2D(target, attachment, textarget, texture, level) {
              GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
            };
            var _glFramebufferTextureLayer = function _glFramebufferTextureLayer(target, attachment, texture, level, layer) {
              GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
            };
            var _glFrontFace = function _glFrontFace(x0) {
              return GLctx.frontFace(x0);
            };
            var _glGenBuffers = function _glGenBuffers(n, buffers) {
              GL.genObject(n, buffers, "createBuffer", GL.buffers);
            };
            var _glGenFramebuffers = function _glGenFramebuffers(n, ids) {
              GL.genObject(n, ids, "createFramebuffer", GL.framebuffers);
            };
            var _glGenQueries = function _glGenQueries(n, ids) {
              GL.genObject(n, ids, "createQuery", GL.queries);
            };
            var _glGenRenderbuffers = function _glGenRenderbuffers(n, renderbuffers) {
              GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
            };
            var _glGenTextures = function _glGenTextures(n, textures) {
              GL.genObject(n, textures, "createTexture", GL.textures);
            };
            var _glGenVertexArrays = function _glGenVertexArrays(n, arrays) {
              GL.genObject(n, arrays, "createVertexArray", GL.vaos);
            };
            var _glGenerateMipmap = function _glGenerateMipmap(x0) {
              return GLctx.generateMipmap(x0);
            };
            var writeI53ToI64 = function writeI53ToI64(ptr, num) {
              HEAPU32[ptr >> 2] = num;
              var lower = HEAPU32[ptr >> 2];
              HEAPU32[ptr + 4 >> 2] = (num - lower) / 4294967296;
            };
            var webglGetExtensions = function $webglGetExtensions() {
              var exts = getEmscriptenSupportedExtensions(GLctx);
              exts = exts.concat(exts.map(function (e) {
                return "GL_" + e;
              }));
              return exts;
            };
            var emscriptenWebGLGet = function emscriptenWebGLGet(name_, p, type) {
              if (!p) {
                GL.recordError(1281);
                return;
              }
              var ret = undefined;
              switch (name_) {
                case 36346:
                  ret = 1;
                  break;
                case 36344:
                  if (type != 0 && type != 1) {
                    GL.recordError(1280);
                  }
                  return;
                case 34814:
                case 36345:
                  ret = 0;
                  break;
                case 34466:
                  var formats = GLctx.getParameter(34467);
                  ret = formats ? formats.length : 0;
                  break;
                case 33309:
                  if (GL.currentContext.version < 2) {
                    GL.recordError(1282);
                    return;
                  }
                  ret = webglGetExtensions().length;
                  break;
                case 33307:
                case 33308:
                  if (GL.currentContext.version < 2) {
                    GL.recordError(1280);
                    return;
                  }
                  ret = name_ == 33307 ? 3 : 0;
                  break;
              }
              if (ret === undefined) {
                var result = GLctx.getParameter(name_);
                switch (_typeof(result)) {
                  case "number":
                    ret = result;
                    break;
                  case "boolean":
                    ret = result ? 1 : 0;
                    break;
                  case "string":
                    GL.recordError(1280);
                    return;
                  case "object":
                    if (result === null) {
                      switch (name_) {
                        case 34964:
                        case 35725:
                        case 34965:
                        case 36006:
                        case 36007:
                        case 32873:
                        case 34229:
                        case 36662:
                        case 36663:
                        case 35053:
                        case 35055:
                        case 36010:
                        case 35097:
                        case 35869:
                        case 32874:
                        case 36389:
                        case 35983:
                        case 35368:
                        case 34068:
                          {
                            ret = 0;
                            break;
                          }
                        default:
                          {
                            GL.recordError(1280);
                            return;
                          }
                      }
                    } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                      for (var i = 0; i < result.length; ++i) {
                        switch (type) {
                          case 0:
                            HEAP32[p + i * 4 >> 2] = result[i];
                            break;
                          case 2:
                            HEAPF32[p + i * 4 >> 2] = result[i];
                            break;
                          case 4:
                            HEAP8[p + i] = result[i] ? 1 : 0;
                            break;
                        }
                      }
                      return;
                    } else {
                      try {
                        ret = result.name | 0;
                      } catch (e) {
                        GL.recordError(1280);
                        err("GL_INVALID_ENUM in glGet".concat(type, "v: Unknown object returned from WebGL getParameter(").concat(name_, ")! (error: ").concat(e, ")"));
                        return;
                      }
                    }
                    break;
                  default:
                    GL.recordError(1280);
                    err("GL_INVALID_ENUM in glGet".concat(type, "v: Native code calling glGet").concat(type, "v(").concat(name_, ") and it returns ").concat(result, " of type ").concat(_typeof(result), "!"));
                    return;
                }
              }
              switch (type) {
                case 1:
                  writeI53ToI64(p, ret);
                  break;
                case 0:
                  HEAP32[p >> 2] = ret;
                  break;
                case 2:
                  HEAPF32[p >> 2] = ret;
                  break;
                case 4:
                  HEAP8[p] = ret ? 1 : 0;
                  break;
              }
            };
            var _glGetFloatv = function _glGetFloatv(name_, p) {
              return emscriptenWebGLGet(name_, p, 2);
            };
            var _glGetInteger64v = function _glGetInteger64v(name_, p) {
              emscriptenWebGLGet(name_, p, 1);
            };
            var _glGetIntegerv = function _glGetIntegerv(name_, p) {
              return emscriptenWebGLGet(name_, p, 0);
            };
            var _glGetProgramInfoLog = function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
              var log = GLctx.getProgramInfoLog(GL.programs[program]);
              if (log === null) log = "(unknown error)";
              var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
              if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
            };
            var _glGetProgramiv = function _glGetProgramiv(program, pname, p) {
              if (!p) {
                GL.recordError(1281);
                return;
              }
              if (program >= GL.counter) {
                GL.recordError(1281);
                return;
              }
              program = GL.programs[program];
              if (pname == 35716) {
                var log = GLctx.getProgramInfoLog(program);
                if (log === null) log = "(unknown error)";
                HEAP32[p >> 2] = log.length + 1;
              } else if (pname == 35719) {
                if (!program.maxUniformLength) {
                  for (var i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                    program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
                  }
                }
                HEAP32[p >> 2] = program.maxUniformLength;
              } else if (pname == 35722) {
                if (!program.maxAttributeLength) {
                  for (var i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
                    program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
                  }
                }
                HEAP32[p >> 2] = program.maxAttributeLength;
              } else if (pname == 35381) {
                if (!program.maxUniformBlockNameLength) {
                  for (var i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
                    program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
                  }
                }
                HEAP32[p >> 2] = program.maxUniformBlockNameLength;
              } else {
                HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname);
              }
            };
            var _glGetShaderInfoLog = function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
              var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
              if (log === null) log = "(unknown error)";
              var numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
              if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
            };
            var _glGetShaderiv = function _glGetShaderiv(shader, pname, p) {
              if (!p) {
                GL.recordError(1281);
                return;
              }
              if (pname == 35716) {
                var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
                if (log === null) log = "(unknown error)";
                var logLength = log ? log.length + 1 : 0;
                HEAP32[p >> 2] = logLength;
              } else if (pname == 35720) {
                var source = GLctx.getShaderSource(GL.shaders[shader]);
                var sourceLength = source ? source.length + 1 : 0;
                HEAP32[p >> 2] = sourceLength;
              } else {
                HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
              }
            };
            var _glGetString = function _glGetString(name_) {
              var ret = GL.stringCache[name_];
              if (!ret) {
                switch (name_) {
                  case 7939:
                    ret = stringToNewUTF8(webglGetExtensions().join(" "));
                    break;
                  case 7936:
                  case 7937:
                  case 37445:
                  case 37446:
                    var s = GLctx.getParameter(name_);
                    if (!s) {
                      GL.recordError(1280);
                    }
                    ret = s ? stringToNewUTF8(s) : 0;
                    break;
                  case 7938:
                    var glVersion = GLctx.getParameter(7938);
                    if (GL.currentContext.version >= 2) glVersion = "OpenGL ES 3.0 (".concat(glVersion, ")");else {
                      glVersion = "OpenGL ES 2.0 (".concat(glVersion, ")");
                    }
                    ret = stringToNewUTF8(glVersion);
                    break;
                  case 35724:
                    var glslVersion = GLctx.getParameter(35724);
                    var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
                    var ver_num = glslVersion.match(ver_re);
                    if (ver_num !== null) {
                      if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
                      glslVersion = "OpenGL ES GLSL ES ".concat(ver_num[1], " (").concat(glslVersion, ")");
                    }
                    ret = stringToNewUTF8(glslVersion);
                    break;
                  default:
                    GL.recordError(1280);
                }
                GL.stringCache[name_] = ret;
              }
              return ret;
            };
            var _glGetSynciv = function _glGetSynciv(sync, pname, bufSize, length, values) {
              if (bufSize < 0) {
                GL.recordError(1281);
                return;
              }
              if (!values) {
                GL.recordError(1281);
                return;
              }
              var ret = GLctx.getSyncParameter(GL.syncs[sync], pname);
              if (ret !== null) {
                HEAP32[values >> 2] = ret;
                if (length) HEAP32[length >> 2] = 1;
              }
            };
            var _glGetUniformBlockIndex = function _glGetUniformBlockIndex(program, uniformBlockName) {
              return GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));
            };
            var jstoi_q = function jstoi_q(str) {
              return parseInt(str);
            };
            var webglGetLeftBracePos = function webglGetLeftBracePos(name) {
              return name.slice(-1) == "]" && name.lastIndexOf("[");
            };
            var webglPrepareUniformLocationsBeforeFirstUse = function webglPrepareUniformLocationsBeforeFirstUse(program) {
              var uniformLocsById = program.uniformLocsById,
                uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,
                i,
                j;
              if (!uniformLocsById) {
                program.uniformLocsById = uniformLocsById = {};
                program.uniformArrayNamesById = {};
                for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                  var u = GLctx.getActiveUniform(program, i);
                  var nm = u.name;
                  var sz = u.size;
                  var lb = webglGetLeftBracePos(nm);
                  var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
                  var id = program.uniformIdCounter;
                  program.uniformIdCounter += sz;
                  uniformSizeAndIdsByName[arrayName] = [sz, id];
                  for (j = 0; j < sz; ++j) {
                    uniformLocsById[id] = j;
                    program.uniformArrayNamesById[id++] = arrayName;
                  }
                }
              }
            };
            var _glGetUniformLocation = function _glGetUniformLocation(program, name) {
              name = UTF8ToString(name);
              if (program = GL.programs[program]) {
                webglPrepareUniformLocationsBeforeFirstUse(program);
                var uniformLocsById = program.uniformLocsById;
                var arrayIndex = 0;
                var uniformBaseName = name;
                var leftBrace = webglGetLeftBracePos(name);
                if (leftBrace > 0) {
                  arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
                  uniformBaseName = name.slice(0, leftBrace);
                }
                var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
                if (sizeAndId && arrayIndex < sizeAndId[0]) {
                  arrayIndex += sizeAndId[1];
                  if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
                    return arrayIndex;
                  }
                }
              } else {
                GL.recordError(1281);
              }
              return -1;
            };
            var _glLinkProgram = function _glLinkProgram(program) {
              program = GL.programs[program];
              GLctx.linkProgram(program);
              program.uniformLocsById = 0;
              program.uniformSizeAndIdsByName = {};
            };
            var _glPixelStorei = function _glPixelStorei(pname, param) {
              if (pname == 3317) {
                GL.unpackAlignment = param;
              } else if (pname == 3314) {
                GL.unpackRowLength = param;
              }
              GLctx.pixelStorei(pname, param);
            };
            var _glReadBuffer = function _glReadBuffer(x0) {
              return GLctx.readBuffer(x0);
            };
            var computeUnpackAlignedImageSize = function computeUnpackAlignedImageSize(width, height, sizePerPixel) {
              function roundedToNextMultipleOf(x, y) {
                return x + y - 1 & -y;
              }
              var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
              var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
              return height * alignedRowSize;
            };
            var colorChannelsInGlTextureFormat = function colorChannelsInGlTextureFormat(format) {
              var colorChannels = {
                5: 3,
                6: 4,
                8: 2,
                29502: 3,
                29504: 4,
                26917: 2,
                26918: 2,
                29846: 3,
                29847: 4
              };
              return colorChannels[format - 6402] || 1;
            };
            var heapObjectForWebGLType = function heapObjectForWebGLType(type) {
              type -= 5120;
              if (type == 0) return HEAP8;
              if (type == 1) return HEAPU8;
              if (type == 2) return HEAP16;
              if (type == 4) return HEAP32;
              if (type == 6) return HEAPF32;
              if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return HEAPU32;
              return HEAPU16;
            };
            var toTypedArrayIndex = function toTypedArrayIndex(pointer, heap) {
              return pointer >>> 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
            };
            var emscriptenWebGLGetTexPixelData = function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
              var heap = heapObjectForWebGLType(type);
              var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
              var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
              return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
            };
            var _glReadPixels = function _glReadPixels(x, y, width, height, format, type, pixels) {
              if (GL.currentContext.version >= 2) {
                if (GLctx.currentPixelPackBufferBinding) {
                  GLctx.readPixels(x, y, width, height, format, type, pixels);
                  return;
                }
                var heap = heapObjectForWebGLType(type);
                var target = toTypedArrayIndex(pixels, heap);
                GLctx.readPixels(x, y, width, height, format, type, heap, target);
                return;
              }
              var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
              if (!pixelData) {
                GL.recordError(1280);
                return;
              }
              GLctx.readPixels(x, y, width, height, format, type, pixelData);
            };
            var _glRenderbufferStorage = function _glRenderbufferStorage(x0, x1, x2, x3) {
              return GLctx.renderbufferStorage(x0, x1, x2, x3);
            };
            var _glRenderbufferStorageMultisample = function _glRenderbufferStorageMultisample(x0, x1, x2, x3, x4) {
              return GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);
            };
            var _glScissor = function _glScissor(x0, x1, x2, x3) {
              return GLctx.scissor(x0, x1, x2, x3);
            };
            var _glShaderSource = function _glShaderSource(shader, count, string, length) {
              var source = GL.getSource(shader, count, string, length);
              GLctx.shaderSource(GL.shaders[shader], source);
            };
            var _glTexImage2D = function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
              if (GL.currentContext.version >= 2) {
                if (GLctx.currentPixelUnpackBufferBinding) {
                  GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
                  return;
                }
                if (pixels) {
                  var heap = heapObjectForWebGLType(type);
                  var index = toTypedArrayIndex(pixels, heap);
                  GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
                  return;
                }
              }
              var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
              GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
            };
            var _glTexImage3D = function _glTexImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels) {
              if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, pixels);
              } else if (pixels) {
                var heap = heapObjectForWebGLType(type);
                GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, heap, toTypedArrayIndex(pixels, heap));
              } else {
                GLctx.texImage3D(target, level, internalFormat, width, height, depth, border, format, type, null);
              }
            };
            var _glTexParameterf = function _glTexParameterf(x0, x1, x2) {
              return GLctx.texParameterf(x0, x1, x2);
            };
            var _glTexParameteri = function _glTexParameteri(x0, x1, x2) {
              return GLctx.texParameteri(x0, x1, x2);
            };
            var _glTexStorage2D = function _glTexStorage2D(x0, x1, x2, x3, x4) {
              return GLctx.texStorage2D(x0, x1, x2, x3, x4);
            };
            var _glTexSubImage3D = function _glTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) {
              if (GLctx.currentPixelUnpackBufferBinding) {
                GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
              } else if (pixels) {
                var heap = heapObjectForWebGLType(type);
                GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, heap, toTypedArrayIndex(pixels, heap));
              } else {
                GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
              }
            };
            var _glTransformFeedbackVaryings = function _glTransformFeedbackVaryings(program, count, varyings, bufferMode) {
              program = GL.programs[program];
              var vars = [];
              for (var i = 0; i < count; i++) vars.push(UTF8ToString(HEAP32[varyings + i * 4 >> 2]));
              GLctx.transformFeedbackVaryings(program, vars, bufferMode);
            };
            var webglGetUniformLocation = function webglGetUniformLocation(location) {
              var p = GLctx.currentProgram;
              if (p) {
                var webglLoc = p.uniformLocsById[location];
                if (typeof webglLoc == "number") {
                  p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? "[".concat(webglLoc, "]") : ""));
                }
                return webglLoc;
              } else {
                GL.recordError(1282);
              }
            };
            var _glUniform1f = function _glUniform1f(location, v0) {
              GLctx.uniform1f(webglGetUniformLocation(location), v0);
            };
            var _glUniform1i = function _glUniform1i(location, v0) {
              GLctx.uniform1i(webglGetUniformLocation(location), v0);
            };
            var miniTempWebGLIntBuffers = [];
            var _glUniform1iv = function _glUniform1iv(location, count, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniform1iv(webglGetUniformLocation(location), HEAP32, value >> 2, count);
                return;
              }
              if (count <= 288) {
                var view = miniTempWebGLIntBuffers[count];
                for (var i = 0; i < count; ++i) {
                  view[i] = HEAP32[value + 4 * i >> 2];
                }
              } else {
                var view = HEAP32.subarray(value >> 2, value + count * 4 >> 2);
              }
              GLctx.uniform1iv(webglGetUniformLocation(location), view);
            };
            var _glUniform1ui = function _glUniform1ui(location, v0) {
              GLctx.uniform1ui(webglGetUniformLocation(location), v0);
            };
            var _glUniform1uiv = function _glUniform1uiv(location, count, value) {
              count && GLctx.uniform1uiv(webglGetUniformLocation(location), HEAPU32, value >> 2, count);
            };
            var _glUniform2f = function _glUniform2f(location, v0, v1) {
              GLctx.uniform2f(webglGetUniformLocation(location), v0, v1);
            };
            var miniTempWebGLFloatBuffers = [];
            var _glUniform2fv = function _glUniform2fv(location, count, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 2);
                return;
              }
              if (count <= 144) {
                var view = miniTempWebGLFloatBuffers[2 * count];
                for (var i = 0; i < 2 * count; i += 2) {
                  view[i] = HEAPF32[value + 4 * i >> 2];
                  view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                }
              } else {
                var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
              }
              GLctx.uniform2fv(webglGetUniformLocation(location), view);
            };
            var _glUniform2iv = function _glUniform2iv(location, count, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniform2iv(webglGetUniformLocation(location), HEAP32, value >> 2, count * 2);
                return;
              }
              if (count <= 144) {
                var view = miniTempWebGLIntBuffers[2 * count];
                for (var i = 0; i < 2 * count; i += 2) {
                  view[i] = HEAP32[value + 4 * i >> 2];
                  view[i + 1] = HEAP32[value + (4 * i + 4) >> 2];
                }
              } else {
                var view = HEAP32.subarray(value >> 2, value + count * 8 >> 2);
              }
              GLctx.uniform2iv(webglGetUniformLocation(location), view);
            };
            var _glUniform3fv = function _glUniform3fv(location, count, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 3);
                return;
              }
              if (count <= 96) {
                var view = miniTempWebGLFloatBuffers[3 * count];
                for (var i = 0; i < 3 * count; i += 3) {
                  view[i] = HEAPF32[value + 4 * i >> 2];
                  view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                  view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
                }
              } else {
                var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
              }
              GLctx.uniform3fv(webglGetUniformLocation(location), view);
            };
            var _glUniform4f = function _glUniform4f(location, v0, v1, v2, v3) {
              GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3);
            };
            var _glUniform4fv = function _glUniform4fv(location, count, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, value >> 2, count * 4);
                return;
              }
              if (count <= 72) {
                var view = miniTempWebGLFloatBuffers[4 * count];
                var heap = HEAPF32;
                value = value >> 2;
                for (var i = 0; i < 4 * count; i += 4) {
                  var dst = value + i;
                  view[i] = heap[dst];
                  view[i + 1] = heap[dst + 1];
                  view[i + 2] = heap[dst + 2];
                  view[i + 3] = heap[dst + 3];
                }
              } else {
                var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
              }
              GLctx.uniform4fv(webglGetUniformLocation(location), view);
            };
            var _glUniformBlockBinding = function _glUniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding) {
              program = GL.programs[program];
              GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
            };
            var _glUniformMatrix3fv = function _glUniformMatrix3fv(location, count, transpose, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 9);
                return;
              }
              if (count <= 32) {
                var view = miniTempWebGLFloatBuffers[9 * count];
                for (var i = 0; i < 9 * count; i += 9) {
                  view[i] = HEAPF32[value + 4 * i >> 2];
                  view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
                  view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
                  view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
                  view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
                  view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
                  view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
                  view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
                  view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
                }
              } else {
                var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
              }
              GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
            };
            var _glUniformMatrix4fv = function _glUniformMatrix4fv(location, count, transpose, value) {
              if (GL.currentContext.version >= 2) {
                count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, value >> 2, count * 16);
                return;
              }
              if (count <= 18) {
                var view = miniTempWebGLFloatBuffers[16 * count];
                var heap = HEAPF32;
                value = value >> 2;
                for (var i = 0; i < 16 * count; i += 16) {
                  var dst = value + i;
                  view[i] = heap[dst];
                  view[i + 1] = heap[dst + 1];
                  view[i + 2] = heap[dst + 2];
                  view[i + 3] = heap[dst + 3];
                  view[i + 4] = heap[dst + 4];
                  view[i + 5] = heap[dst + 5];
                  view[i + 6] = heap[dst + 6];
                  view[i + 7] = heap[dst + 7];
                  view[i + 8] = heap[dst + 8];
                  view[i + 9] = heap[dst + 9];
                  view[i + 10] = heap[dst + 10];
                  view[i + 11] = heap[dst + 11];
                  view[i + 12] = heap[dst + 12];
                  view[i + 13] = heap[dst + 13];
                  view[i + 14] = heap[dst + 14];
                  view[i + 15] = heap[dst + 15];
                }
              } else {
                var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
              }
              GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
            };
            var _glUseProgram = function _glUseProgram(program) {
              program = GL.programs[program];
              GLctx.useProgram(program);
              GLctx.currentProgram = program;
            };
            var _glVertexAttrib4f = function _glVertexAttrib4f(x0, x1, x2, x3, x4) {
              return GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);
            };
            var _glVertexAttribDivisor = function _glVertexAttribDivisor(index, divisor) {
              GLctx.vertexAttribDivisor(index, divisor);
            };
            var _glVertexAttribI4ui = function _glVertexAttribI4ui(x0, x1, x2, x3, x4) {
              return GLctx.vertexAttribI4ui(x0, x1, x2, x3, x4);
            };
            var _glVertexAttribIPointer = function _glVertexAttribIPointer(index, size, type, stride, ptr) {
              GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
            };
            var _glVertexAttribPointer = function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
              GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
            };
            var _glViewport = function _glViewport(x0, x1, x2, x3) {
              return GLctx.viewport(x0, x1, x2, x3);
            };
            var GodotRuntime = {
              get_func: function get_func(ptr) {
                return wasmTable.get(ptr);
              },
              error: function error() {
                err.apply(null, Array.from(arguments));
              },
              print: function print() {
                out.apply(null, Array.from(arguments));
              },
              malloc: function malloc(p_size) {
                return _malloc2(p_size);
              },
              free: function free(p_ptr) {
                _free2(p_ptr);
              },
              getHeapValue: function getHeapValue(p_ptr, p_type) {
                return getValue(p_ptr, p_type);
              },
              setHeapValue: function setHeapValue(p_ptr, p_value, p_type) {
                setValue(p_ptr, p_value, p_type);
              },
              heapSub: function heapSub(p_heap, p_ptr, p_len) {
                var bytes = p_heap.BYTES_PER_ELEMENT;
                return p_heap.subarray(p_ptr / bytes, p_ptr / bytes + p_len);
              },
              heapSlice: function heapSlice(p_heap, p_ptr, p_len) {
                var bytes = p_heap.BYTES_PER_ELEMENT;
                return p_heap.slice(p_ptr / bytes, p_ptr / bytes + p_len);
              },
              heapCopy: function heapCopy(p_dst, p_src, p_ptr) {
                var bytes = p_src.BYTES_PER_ELEMENT;
                return p_dst.set(p_src, p_ptr / bytes);
              },
              parseString: function parseString(p_ptr) {
                return UTF8ToString(p_ptr);
              },
              parseStringArray: function parseStringArray(p_ptr, p_size) {
                var strings = [];
                var ptrs = GodotRuntime.heapSub(HEAP32, p_ptr, p_size);
                ptrs.forEach(function (ptr) {
                  strings.push(GodotRuntime.parseString(ptr));
                });
                return strings;
              },
              strlen: function strlen(p_str) {
                return lengthBytesUTF8(p_str);
              },
              allocString: function allocString(p_str) {
                var length = GodotRuntime.strlen(p_str) + 1;
                var c_str = GodotRuntime.malloc(length);
                stringToUTF8(p_str, c_str, length);
                return c_str;
              },
              allocStringArray: function allocStringArray(p_strings) {
                var size = p_strings.length;
                var c_ptr = GodotRuntime.malloc(size * 4);
                for (var _i2 = 0; _i2 < size; _i2++) {
                  HEAP32[(c_ptr >> 2) + _i2] = GodotRuntime.allocString(p_strings[_i2]);
                }
                return c_ptr;
              },
              freeStringArray: function freeStringArray(p_ptr, p_len) {
                for (var _i3 = 0; _i3 < p_len; _i3++) {
                  GodotRuntime.free(HEAP32[(p_ptr >> 2) + _i3]);
                }
                GodotRuntime.free(p_ptr);
              },
              stringToHeap: function stringToHeap(p_str, p_ptr, p_len) {
                return stringToUTF8Array(p_str, HEAP8, p_ptr, p_len);
              }
            };
            var GodotConfig = {
              canvas: null,
              locale: "en",
              canvas_resize_policy: 2,
              virtual_keyboard: false,
              persistent_drops: false,
              on_execute: null,
              on_exit: null,
              init_config: function init_config(p_opts) {
                GodotConfig.canvas_resize_policy = p_opts["canvasResizePolicy"];
                GodotConfig.canvas = p_opts["canvas"];
                GodotConfig.locale = p_opts["locale"] || GodotConfig.locale;
                GodotConfig.virtual_keyboard = p_opts["virtualKeyboard"];
                GodotConfig.persistent_drops = !!p_opts["persistentDrops"];
                GodotConfig.on_execute = p_opts["onExecute"];
                GodotConfig.on_exit = p_opts["onExit"];
                if (p_opts["focusCanvas"]) {
                  GodotConfig.canvas.focus();
                }
              },
              locate_file: function locate_file(file) {
                return Module["locateFile"](file);
              },
              clear: function clear() {
                GodotConfig.canvas = null;
                GodotConfig.locale = "en";
                GodotConfig.canvas_resize_policy = 2;
                GodotConfig.virtual_keyboard = false;
                GodotConfig.persistent_drops = false;
                GodotConfig.on_execute = null;
                GodotConfig.on_exit = null;
              }
            };
            var GodotFS = {
              ENOENT: 44,
              _idbfs: false,
              _syncing: false,
              _mount_points: [],
              is_persistent: function is_persistent() {
                return GodotFS._idbfs ? 1 : 0;
              },
              init: function init(persistentPaths) {
                GodotFS._idbfs = false;
                if (!Array.isArray(persistentPaths)) {
                  return Promise.reject(new Error("Persistent paths must be an array"));
                }
                if (!persistentPaths.length) {
                  return Promise.resolve();
                }
                GodotFS._mount_points = persistentPaths.slice();
                function createRecursive(dir) {
                  try {
                    FS.stat(dir);
                  } catch (e) {
                    if (e.errno !== GodotFS.ENOENT) {
                      GodotRuntime.error(e);
                    }
                    FS.mkdirTree(dir);
                  }
                }
                GodotFS._mount_points.forEach(function (path) {
                  createRecursive(path);
                  FS.mount(IDBFS, {}, path);
                });
                return new Promise(function (resolve, reject) {
                  FS.syncfs(true, function (err) {
                    if (err) {
                      GodotFS._mount_points = [];
                      GodotFS._idbfs = false;
                      GodotRuntime.print("IndexedDB not available: ".concat(err.message));
                    } else {
                      GodotFS._idbfs = true;
                    }
                    resolve(err);
                  });
                });
              },
              deinit: function deinit() {
                GodotFS._mount_points.forEach(function (path) {
                  try {
                    FS.unmount(path);
                  } catch (e) {
                    GodotRuntime.print("Already unmounted", e);
                  }
                  if (GodotFS._idbfs && IDBFS.dbs[path]) {
                    IDBFS.dbs[path].close();
                    delete IDBFS.dbs[path];
                  }
                });
                GodotFS._mount_points = [];
                GodotFS._idbfs = false;
                GodotFS._syncing = false;
              },
              sync: function sync() {
                if (GodotFS._syncing) {
                  GodotRuntime.error("Already syncing!");
                  return Promise.resolve();
                }
                GodotFS._syncing = true;
                return new Promise(function (resolve, reject) {
                  FS.syncfs(false, function (error) {
                    if (error) {
                      GodotRuntime.error("Failed to save IDB file system: ".concat(error.message));
                    }
                    GodotFS._syncing = false;
                    resolve(error);
                  });
                });
              },
              copy_to_fs: function copy_to_fs(path, buffer) {
                var idx = path.lastIndexOf("/");
                var dir = "/";
                if (idx > 0) {
                  dir = path.slice(0, idx);
                }
                try {
                  FS.stat(dir);
                } catch (e) {
                  if (e.errno !== GodotFS.ENOENT) {
                    GodotRuntime.error(e);
                  }
                  FS.mkdirTree(dir);
                }
                FS.writeFile(path, new Uint8Array(buffer));
              }
            };
            var GodotOS = {
              request_quit: function request_quit() {},
              _async_cbs: [],
              _fs_sync_promise: null,
              atexit: function atexit(p_promise_cb) {
                GodotOS._async_cbs.push(p_promise_cb);
              },
              cleanup: function cleanup(exit_code) {
                var cb = GodotConfig.on_exit;
                GodotFS.deinit();
                GodotConfig.clear();
                if (cb) {
                  cb(exit_code);
                }
              },
              finish_async: function finish_async(callback) {
                GodotOS._fs_sync_promise.then(function (err) {
                  var promises = [];
                  GodotOS._async_cbs.forEach(function (cb) {
                    promises.push(new Promise(cb));
                  });
                  return Promise.all(promises);
                }).then(function () {
                  return GodotFS.sync();
                }).then(function (err) {
                  setTimeout(function () {
                    callback();
                  }, 0);
                });
              }
            };
            var GodotAudio = {
              MAX_VOLUME_CHANNELS: 8,
              GodotChannel: {
                CHANNEL_L: 0,
                CHANNEL_R: 1,
                CHANNEL_C: 3,
                CHANNEL_LFE: 4,
                CHANNEL_RL: 5,
                CHANNEL_RR: 6,
                CHANNEL_SL: 7,
                CHANNEL_SR: 8
              },
              WebChannel: {
                CHANNEL_L: 0,
                CHANNEL_R: 1,
                CHANNEL_SL: 2,
                CHANNEL_SR: 3,
                CHANNEL_C: 4,
                CHANNEL_LFE: 5
              },
              samples: null,
              Sample: /*#__PURE__*/function () {
                function Sample(params) {
                  var _options$numberOfChan, _options$sampleRate, _options$loopMode, _options$loopBegin, _options$loopEnd;
                  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                  _classCallCheck(this, Sample);
                  this.id = params.id;
                  this._audioBuffer = null;
                  this.numberOfChannels = (_options$numberOfChan = options.numberOfChannels) !== null && _options$numberOfChan !== void 0 ? _options$numberOfChan : 2;
                  this.sampleRate = (_options$sampleRate = options.sampleRate) !== null && _options$sampleRate !== void 0 ? _options$sampleRate : 44100;
                  this.loopMode = (_options$loopMode = options.loopMode) !== null && _options$loopMode !== void 0 ? _options$loopMode : "disabled";
                  this.loopBegin = (_options$loopBegin = options.loopBegin) !== null && _options$loopBegin !== void 0 ? _options$loopBegin : 0;
                  this.loopEnd = (_options$loopEnd = options.loopEnd) !== null && _options$loopEnd !== void 0 ? _options$loopEnd : 0;
                  this.setAudioBuffer(params.audioBuffer);
                }
                return _createClass(Sample, [{
                  key: "getAudioBuffer",
                  value: function getAudioBuffer() {
                    return this._duplicateAudioBuffer();
                  }
                }, {
                  key: "setAudioBuffer",
                  value: function setAudioBuffer(val) {
                    this._audioBuffer = val;
                  }
                }, {
                  key: "clear",
                  value: function clear() {
                    this.setAudioBuffer(null);
                    GodotAudio.Sample["delete"](this.id);
                  }
                }, {
                  key: "_duplicateAudioBuffer",
                  value: function _duplicateAudioBuffer() {
                    if (this._audioBuffer == null) {
                      throw new Error("couldn't duplicate a null audioBuffer");
                    }
                    var channels = new Array(this._audioBuffer.numberOfChannels);
                    for (var _i4 = 0; _i4 < this._audioBuffer.numberOfChannels; _i4++) {
                      var channel = new Float32Array(this._audioBuffer.getChannelData(_i4));
                      channels[_i4] = channel;
                    }
                    var buffer = GodotAudio.ctx.createBuffer(this.numberOfChannels, this._audioBuffer.length, this._audioBuffer.sampleRate);
                    for (var _i5 = 0; _i5 < channels.length; _i5++) {
                      buffer.copyToChannel(channels[_i5], _i5, 0);
                    }
                    return buffer;
                  }
                }], [{
                  key: "getSample",
                  value: function getSample(id) {
                    if (!GodotAudio.samples.has(id)) {
                      throw new ReferenceError("Could not find sample \"".concat(id, "\""));
                    }
                    return GodotAudio.samples.get(id);
                  }
                }, {
                  key: "getSampleOrNull",
                  value: function getSampleOrNull(id) {
                    var _GodotAudio$samples$g;
                    return (_GodotAudio$samples$g = GodotAudio.samples.get(id)) !== null && _GodotAudio$samples$g !== void 0 ? _GodotAudio$samples$g : null;
                  }
                }, {
                  key: "create",
                  value: function create(params) {
                    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    var sample = new GodotAudio.Sample(params, options);
                    GodotAudio.samples.set(params.id, sample);
                    return sample;
                  }
                }, {
                  key: "delete",
                  value: function _delete(id) {
                    GodotAudio.samples["delete"](id);
                  }
                }]);
              }(),
              SampleNodeBus: /*#__PURE__*/function () {
                function SampleNodeBus(bus) {
                  _classCallCheck(this, SampleNodeBus);
                  var NUMBER_OF_WEB_CHANNELS = 6;
                  this._bus = bus;
                  this._channelSplitter = GodotAudio.ctx.createChannelSplitter(NUMBER_OF_WEB_CHANNELS);
                  this._l = GodotAudio.ctx.createGain();
                  this._r = GodotAudio.ctx.createGain();
                  this._sl = GodotAudio.ctx.createGain();
                  this._sr = GodotAudio.ctx.createGain();
                  this._c = GodotAudio.ctx.createGain();
                  this._lfe = GodotAudio.ctx.createGain();
                  this._channelMerger = GodotAudio.ctx.createChannelMerger(NUMBER_OF_WEB_CHANNELS);
                  this._channelSplitter.connect(this._l, GodotAudio.WebChannel.CHANNEL_L).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_L);
                  this._channelSplitter.connect(this._r, GodotAudio.WebChannel.CHANNEL_R).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_R);
                  this._channelSplitter.connect(this._sl, GodotAudio.WebChannel.CHANNEL_SL).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_SL);
                  this._channelSplitter.connect(this._sr, GodotAudio.WebChannel.CHANNEL_SR).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_SR);
                  this._channelSplitter.connect(this._c, GodotAudio.WebChannel.CHANNEL_C).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_C);
                  this._channelSplitter.connect(this._lfe, GodotAudio.WebChannel.CHANNEL_L).connect(this._channelMerger, GodotAudio.WebChannel.CHANNEL_L, GodotAudio.WebChannel.CHANNEL_LFE);
                  this._channelMerger.connect(this._bus.getInputNode());
                }
                return _createClass(SampleNodeBus, [{
                  key: "getInputNode",
                  value: function getInputNode() {
                    return this._channelSplitter;
                  }
                }, {
                  key: "getOutputNode",
                  value: function getOutputNode() {
                    return this._channelMerger;
                  }
                }, {
                  key: "setVolume",
                  value: function setVolume(volume) {
                    var _volume$GodotAudio$Go, _volume$GodotAudio$Go2, _volume$GodotAudio$Go3, _volume$GodotAudio$Go4, _volume$GodotAudio$Go5, _volume$GodotAudio$Go6;
                    if (volume.length !== GodotAudio.MAX_VOLUME_CHANNELS) {
                      throw new Error("Volume length isn't \"".concat(GodotAudio.MAX_VOLUME_CHANNELS, "\", is ").concat(volume.length, " instead"));
                    }
                    this._l.gain.value = (_volume$GodotAudio$Go = volume[GodotAudio.GodotChannel.CHANNEL_L]) !== null && _volume$GodotAudio$Go !== void 0 ? _volume$GodotAudio$Go : 0;
                    this._r.gain.value = (_volume$GodotAudio$Go2 = volume[GodotAudio.GodotChannel.CHANNEL_R]) !== null && _volume$GodotAudio$Go2 !== void 0 ? _volume$GodotAudio$Go2 : 0;
                    this._sl.gain.value = (_volume$GodotAudio$Go3 = volume[GodotAudio.GodotChannel.CHANNEL_SL]) !== null && _volume$GodotAudio$Go3 !== void 0 ? _volume$GodotAudio$Go3 : 0;
                    this._sr.gain.value = (_volume$GodotAudio$Go4 = volume[GodotAudio.GodotChannel.CHANNEL_SR]) !== null && _volume$GodotAudio$Go4 !== void 0 ? _volume$GodotAudio$Go4 : 0;
                    this._c.gain.value = (_volume$GodotAudio$Go5 = volume[GodotAudio.GodotChannel.CHANNEL_C]) !== null && _volume$GodotAudio$Go5 !== void 0 ? _volume$GodotAudio$Go5 : 0;
                    this._lfe.gain.value = (_volume$GodotAudio$Go6 = volume[GodotAudio.GodotChannel.CHANNEL_LFE]) !== null && _volume$GodotAudio$Go6 !== void 0 ? _volume$GodotAudio$Go6 : 0;
                  }
                }, {
                  key: "clear",
                  value: function clear() {
                    this._bus = null;
                    this._channelSplitter.disconnect();
                    this._channelSplitter = null;
                    this._l.disconnect();
                    this._l = null;
                    this._r.disconnect();
                    this._r = null;
                    this._sl.disconnect();
                    this._sl = null;
                    this._sr.disconnect();
                    this._sr = null;
                    this._c.disconnect();
                    this._c = null;
                    this._lfe.disconnect();
                    this._lfe = null;
                    this._channelMerger.disconnect();
                    this._channelMerger = null;
                  }
                }], [{
                  key: "create",
                  value: function create(bus) {
                    return new GodotAudio.SampleNodeBus(bus);
                  }
                }]);
              }(),
              sampleNodes: null,
              SampleNode: /*#__PURE__*/function () {
                function SampleNode(params) {
                  var _options$offset, _options$startTime, _ref, _options$loopMode2, _options$pitchScale, _options$playbackRate;
                  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                  _classCallCheck(this, SampleNode);
                  this.id = params.id;
                  this.streamObjectId = params.streamObjectId;
                  this.offset = (_options$offset = options.offset) !== null && _options$offset !== void 0 ? _options$offset : 0;
                  this._playbackPosition = options.offset;
                  this.startTime = (_options$startTime = options.startTime) !== null && _options$startTime !== void 0 ? _options$startTime : 0;
                  this.isPaused = false;
                  this.isStarted = false;
                  this.isCanceled = false;
                  this.pauseTime = 0;
                  this._playbackRate = 44100;
                  this.loopMode = (_ref = (_options$loopMode2 = options.loopMode) !== null && _options$loopMode2 !== void 0 ? _options$loopMode2 : this.getSample().loopMode) !== null && _ref !== void 0 ? _ref : "disabled";
                  this._pitchScale = (_options$pitchScale = options.pitchScale) !== null && _options$pitchScale !== void 0 ? _options$pitchScale : 1;
                  this._sourceStartTime = 0;
                  this._sampleNodeBuses = new Map();
                  this._source = GodotAudio.ctx.createBufferSource();
                  this._onended = null;
                  this._positionWorklet = null;
                  this.setPlaybackRate((_options$playbackRate = options.playbackRate) !== null && _options$playbackRate !== void 0 ? _options$playbackRate : 44100);
                  this._source.buffer = this.getSample().getAudioBuffer();
                  this._addEndedListener();
                  var bus = GodotAudio.Bus.getBus(params.busIndex);
                  var sampleNodeBus = this.getSampleNodeBus(bus);
                  sampleNodeBus.setVolume(options.volume);
                  this.connectPositionWorklet(options.start)["catch"](function (err) {
                    var newErr = new Error("Failed to create PositionWorklet.");
                    newErr.cause = err;
                    GodotRuntime.error(newErr);
                  });
                }
                return _createClass(SampleNode, [{
                  key: "getPlaybackRate",
                  value: function getPlaybackRate() {
                    return this._playbackRate;
                  }
                }, {
                  key: "getPlaybackPosition",
                  value: function getPlaybackPosition() {
                    return this._playbackPosition;
                  }
                }, {
                  key: "setPlaybackRate",
                  value: function setPlaybackRate(val) {
                    this._playbackRate = val;
                    this._syncPlaybackRate();
                  }
                }, {
                  key: "getPitchScale",
                  value: function getPitchScale() {
                    return this._pitchScale;
                  }
                }, {
                  key: "setPitchScale",
                  value: function setPitchScale(val) {
                    this._pitchScale = val;
                    this._syncPlaybackRate();
                  }
                }, {
                  key: "getSample",
                  value: function getSample() {
                    return GodotAudio.Sample.getSample(this.streamObjectId);
                  }
                }, {
                  key: "getOutputNode",
                  value: function getOutputNode() {
                    return this._source;
                  }
                }, {
                  key: "start",
                  value: function start() {
                    if (this.isStarted) {
                      return;
                    }
                    this._resetSourceStartTime();
                    this._source.start(this.startTime, this.offset);
                    this.isStarted = true;
                  }
                }, {
                  key: "stop",
                  value: function stop() {
                    this.clear();
                  }
                }, {
                  key: "restart",
                  value: function restart() {
                    this.isPaused = false;
                    this.pauseTime = 0;
                    this._resetSourceStartTime();
                    this._restart();
                  }
                }, {
                  key: "pause",
                  value: function pause() {
                    var enable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
                    if (enable) {
                      this._pause();
                      return;
                    }
                    this._unpause();
                  }
                }, {
                  key: "connect",
                  value: function connect(node) {
                    return this.getOutputNode().connect(node);
                  }
                }, {
                  key: "setVolumes",
                  value: function setVolumes(buses, volumes) {
                    for (var busIdx = 0; busIdx < buses.length; busIdx++) {
                      var sampleNodeBus = this.getSampleNodeBus(buses[busIdx]);
                      sampleNodeBus.setVolume(volumes.slice(busIdx * GodotAudio.MAX_VOLUME_CHANNELS, busIdx * GodotAudio.MAX_VOLUME_CHANNELS + GodotAudio.MAX_VOLUME_CHANNELS));
                    }
                  }
                }, {
                  key: "getSampleNodeBus",
                  value: function getSampleNodeBus(bus) {
                    if (!this._sampleNodeBuses.has(bus)) {
                      var sampleNodeBus = GodotAudio.SampleNodeBus.create(bus);
                      this._sampleNodeBuses.set(bus, sampleNodeBus);
                      this._source.connect(sampleNodeBus.getInputNode());
                    }
                    return this._sampleNodeBuses.get(bus);
                  }
                }, {
                  key: "connectPositionWorklet",
                  value: function () {
                    var _connectPositionWorklet = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(start) {
                      return _regenerator().w(function (_context) {
                        while (1) switch (_context.n) {
                          case 0:
                            _context.n = 1;
                            return GodotAudio.audioPositionWorkletPromise;
                          case 1:
                            if (!this.isCanceled) {
                              _context.n = 2;
                              break;
                            }
                            return _context.a(2);
                          case 2:
                            this._source.connect(this.getPositionWorklet());
                            if (start) {
                              this.start();
                            }
                          case 3:
                            return _context.a(2);
                        }
                      }, _callee, this);
                    }));
                    function connectPositionWorklet(_x2) {
                      return _connectPositionWorklet.apply(this, arguments);
                    }
                    return connectPositionWorklet;
                  }()
                }, {
                  key: "getPositionWorklet",
                  value: function getPositionWorklet() {
                    var _this = this;
                    if (this._positionWorklet != null) {
                      return this._positionWorklet;
                    }
                    this._positionWorklet = new AudioWorkletNode(GodotAudio.ctx, "godot-position-reporting-processor");
                    this._positionWorklet.port.onmessage = function (event) {
                      switch (event.data["type"]) {
                        case "position":
                          _this._playbackPosition = parseInt(event.data.data, 10) / _this.getSample().sampleRate + _this.offset;
                          break;
                        default:
                      }
                    };
                    return this._positionWorklet;
                  }
                }, {
                  key: "clear",
                  value: function clear() {
                    this.isCanceled = true;
                    this.isPaused = false;
                    this.pauseTime = 0;
                    if (this._source != null) {
                      this._source.removeEventListener("ended", this._onended);
                      this._onended = null;
                      if (this.isStarted) {
                        this._source.stop();
                      }
                      this._source.disconnect();
                      this._source = null;
                    }
                    var _iterator3 = _createForOfIteratorHelper(this._sampleNodeBuses.values()),
                      _step3;
                    try {
                      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                        var sampleNodeBus = _step3.value;
                        sampleNodeBus.clear();
                      }
                    } catch (err) {
                      _iterator3.e(err);
                    } finally {
                      _iterator3.f();
                    }
                    this._sampleNodeBuses.clear();
                    if (this._positionWorklet) {
                      this._positionWorklet.disconnect();
                      this._positionWorklet.port.onmessage = null;
                      this._positionWorklet.port.postMessage({
                        type: "ended"
                      });
                      this._positionWorklet = null;
                    }
                    GodotAudio.SampleNode["delete"](this.id);
                  }
                }, {
                  key: "_resetSourceStartTime",
                  value: function _resetSourceStartTime() {
                    this._sourceStartTime = GodotAudio.ctx.currentTime;
                  }
                }, {
                  key: "_syncPlaybackRate",
                  value: function _syncPlaybackRate() {
                    this._source.playbackRate.value = this.getPlaybackRate() * this.getPitchScale();
                  }
                }, {
                  key: "_restart",
                  value: function _restart() {
                    if (this._source != null) {
                      this._source.disconnect();
                    }
                    this._source = GodotAudio.ctx.createBufferSource();
                    this._source.buffer = this.getSample().getAudioBuffer();
                    var _iterator4 = _createForOfIteratorHelper(this._sampleNodeBuses.values()),
                      _step4;
                    try {
                      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                        var sampleNodeBus = _step4.value;
                        this.connect(sampleNodeBus.getInputNode());
                      }
                    } catch (err) {
                      _iterator4.e(err);
                    } finally {
                      _iterator4.f();
                    }
                    this._addEndedListener();
                    var pauseTime = this.isPaused ? this.pauseTime : 0;
                    if (this._positionWorklet != null) {
                      this._positionWorklet.port.postMessage({
                        type: "clear"
                      });
                      this._source.connect(this._positionWorklet);
                    }
                    this._source.start(this.startTime, this.offset + pauseTime);
                    this.isStarted = true;
                  }
                }, {
                  key: "_pause",
                  value: function _pause() {
                    if (!this.isStarted) {
                      return;
                    }
                    this.isPaused = true;
                    this.pauseTime = (GodotAudio.ctx.currentTime - this._sourceStartTime) / this.getPlaybackRate();
                    this._source.stop();
                  }
                }, {
                  key: "_unpause",
                  value: function _unpause() {
                    this._restart();
                    this.isPaused = false;
                    this.pauseTime = 0;
                  }
                }, {
                  key: "_addEndedListener",
                  value: function _addEndedListener() {
                    var _this2 = this;
                    if (this._onended != null) {
                      this._source.removeEventListener("ended", this._onended);
                    }
                    var self = this;
                    this._onended = function (_) {
                      if (self.isPaused) {
                        return;
                      }
                      switch (self.getSample().loopMode) {
                        case "disabled":
                          {
                            var id = _this2.id;
                            self.stop();
                            if (GodotAudio.sampleFinishedCallback != null) {
                              var idCharPtr = GodotRuntime.allocString(id);
                              GodotAudio.sampleFinishedCallback(idCharPtr);
                              GodotRuntime.free(idCharPtr);
                            }
                          }
                          break;
                        case "forward":
                        case "backward":
                          self.restart();
                          break;
                        default:
                      }
                    };
                    this._source.addEventListener("ended", this._onended);
                  }
                }], [{
                  key: "getSampleNode",
                  value: function getSampleNode(id) {
                    if (!GodotAudio.sampleNodes.has(id)) {
                      throw new ReferenceError("Could not find sample node \"".concat(id, "\""));
                    }
                    return GodotAudio.sampleNodes.get(id);
                  }
                }, {
                  key: "getSampleNodeOrNull",
                  value: function getSampleNodeOrNull(id) {
                    var _GodotAudio$sampleNod;
                    return (_GodotAudio$sampleNod = GodotAudio.sampleNodes.get(id)) !== null && _GodotAudio$sampleNod !== void 0 ? _GodotAudio$sampleNod : null;
                  }
                }, {
                  key: "stopSampleNode",
                  value: function stopSampleNode(id) {
                    var sampleNode = GodotAudio.SampleNode.getSampleNodeOrNull(id);
                    if (sampleNode == null) {
                      return;
                    }
                    sampleNode.stop();
                  }
                }, {
                  key: "pauseSampleNode",
                  value: function pauseSampleNode(id, enable) {
                    var sampleNode = GodotAudio.SampleNode.getSampleNodeOrNull(id);
                    if (sampleNode == null) {
                      return;
                    }
                    sampleNode.pause(enable);
                  }
                }, {
                  key: "create",
                  value: function create(params) {
                    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    var sampleNode = new GodotAudio.SampleNode(params, options);
                    GodotAudio.sampleNodes.set(params.id, sampleNode);
                    return sampleNode;
                  }
                }, {
                  key: "delete",
                  value: function _delete(id) {
                    GodotAudio.sampleNodes["delete"](id);
                  }
                }]);
              }(),
              buses: null,
              busSolo: null,
              Bus: /*#__PURE__*/function () {
                function Bus() {
                  _classCallCheck(this, Bus);
                  this._sampleNodes = new Set();
                  this.isSolo = false;
                  this._send = null;
                  this._gainNode = GodotAudio.ctx.createGain();
                  this._soloNode = GodotAudio.ctx.createGain();
                  this._muteNode = GodotAudio.ctx.createGain();
                  this._gainNode.connect(this._soloNode).connect(this._muteNode);
                }
                return _createClass(Bus, [{
                  key: "getId",
                  value: function getId() {
                    return GodotAudio.buses.indexOf(this);
                  }
                }, {
                  key: "getVolumeDb",
                  value: function getVolumeDb() {
                    return GodotAudio.linear_to_db(this._gainNode.gain.value);
                  }
                }, {
                  key: "setVolumeDb",
                  value: function setVolumeDb(val) {
                    var linear = GodotAudio.db_to_linear(val);
                    if (isFinite(linear)) {
                      this._gainNode.gain.value = linear;
                    }
                  }
                }, {
                  key: "getSend",
                  value: function getSend() {
                    return this._send;
                  }
                }, {
                  key: "setSend",
                  value: function setSend(val) {
                    this._send = val;
                    if (val == null) {
                      if (this.getId() == 0) {
                        this.getOutputNode().connect(GodotAudio.ctx.destination);
                        return;
                      }
                      throw new Error("Cannot send to \"".concat(val, "\" without the bus being at index 0 (current index: ").concat(this.getId(), ")"));
                    }
                    this.connect(val);
                  }
                }, {
                  key: "getInputNode",
                  value: function getInputNode() {
                    return this._gainNode;
                  }
                }, {
                  key: "getOutputNode",
                  value: function getOutputNode() {
                    return this._muteNode;
                  }
                }, {
                  key: "mute",
                  value: function mute(enable) {
                    this._muteNode.gain.value = enable ? 0 : 1;
                  }
                }, {
                  key: "solo",
                  value: function solo(enable) {
                    if (this.isSolo === enable) {
                      return;
                    }
                    if (enable) {
                      if (GodotAudio.busSolo != null && GodotAudio.busSolo !== this) {
                        GodotAudio.busSolo._disableSolo();
                      }
                      this._enableSolo();
                      return;
                    }
                    this._disableSolo();
                  }
                }, {
                  key: "addSampleNode",
                  value: function addSampleNode(sampleNode) {
                    this._sampleNodes.add(sampleNode);
                    sampleNode.getOutputNode().connect(this.getInputNode());
                  }
                }, {
                  key: "removeSampleNode",
                  value: function removeSampleNode(sampleNode) {
                    this._sampleNodes["delete"](sampleNode);
                    sampleNode.getOutputNode().disconnect();
                  }
                }, {
                  key: "connect",
                  value: function connect(bus) {
                    if (bus == null) {
                      throw new Error("cannot connect to null bus");
                    }
                    this.getOutputNode().disconnect();
                    this.getOutputNode().connect(bus.getInputNode());
                    return bus;
                  }
                }, {
                  key: "clear",
                  value: function clear() {
                    var _this3 = this;
                    GodotAudio.buses = GodotAudio.buses.filter(function (v) {
                      return v !== _this3;
                    });
                  }
                }, {
                  key: "_syncSampleNodes",
                  value: function _syncSampleNodes() {
                    var sampleNodes = Array.from(this._sampleNodes);
                    for (var _i6 = 0; _i6 < sampleNodes.length; _i6++) {
                      var sampleNode = sampleNodes[_i6];
                      sampleNode.getOutputNode().disconnect();
                      sampleNode.getOutputNode().connect(this.getInputNode());
                    }
                  }
                }, {
                  key: "_enableSolo",
                  value: function _enableSolo() {
                    var _this4 = this;
                    this.isSolo = true;
                    GodotAudio.busSolo = this;
                    this._soloNode.gain.value = 1;
                    var otherBuses = GodotAudio.buses.filter(function (otherBus) {
                      return otherBus !== _this4;
                    });
                    for (var _i7 = 0; _i7 < otherBuses.length; _i7++) {
                      var otherBus = otherBuses[_i7];
                      otherBus._soloNode.gain.value = 0;
                    }
                  }
                }, {
                  key: "_disableSolo",
                  value: function _disableSolo() {
                    var _this5 = this;
                    this.isSolo = false;
                    GodotAudio.busSolo = null;
                    this._soloNode.gain.value = 1;
                    var otherBuses = GodotAudio.buses.filter(function (otherBus) {
                      return otherBus !== _this5;
                    });
                    for (var _i8 = 0; _i8 < otherBuses.length; _i8++) {
                      var otherBus = otherBuses[_i8];
                      otherBus._soloNode.gain.value = 1;
                    }
                  }
                }], [{
                  key: "getCount",
                  value: function getCount() {
                    return GodotAudio.buses.length;
                  }
                }, {
                  key: "setCount",
                  value: function setCount(val) {
                    var buses = GodotAudio.buses;
                    if (val === buses.length) {
                      return;
                    }
                    if (val < buses.length) {
                      var deletedBuses = buses.slice(val);
                      for (var _i9 = 0; _i9 < deletedBuses.length; _i9++) {
                        var deletedBus = deletedBuses[_i9];
                        deletedBus.clear();
                      }
                      GodotAudio.buses = buses.slice(0, val);
                      return;
                    }
                    for (var _i0 = GodotAudio.buses.length; _i0 < val; _i0++) {
                      GodotAudio.Bus.create();
                    }
                  }
                }, {
                  key: "getBus",
                  value: function getBus(index) {
                    if (index < 0 || index >= GodotAudio.buses.length) {
                      throw new ReferenceError("invalid bus index \"".concat(index, "\""));
                    }
                    return GodotAudio.buses[index];
                  }
                }, {
                  key: "getBusOrNull",
                  value: function getBusOrNull(index) {
                    if (index < 0 || index >= GodotAudio.buses.length) {
                      return null;
                    }
                    return GodotAudio.buses[index];
                  }
                }, {
                  key: "move",
                  value: function move(fromIndex, toIndex) {
                    var movedBus = GodotAudio.Bus.getBusOrNull(fromIndex);
                    if (movedBus == null) {
                      return;
                    }
                    var buses = GodotAudio.buses.filter(function (_, i) {
                      return i !== fromIndex;
                    });
                    buses.splice(toIndex - 1, 0, movedBus);
                    GodotAudio.buses = buses;
                  }
                }, {
                  key: "addAt",
                  value: function addAt(index) {
                    var newBus = GodotAudio.Bus.create();
                    if (index !== newBus.getId()) {
                      GodotAudio.Bus.move(newBus.getId(), index);
                    }
                  }
                }, {
                  key: "create",
                  value: function create() {
                    var newBus = new GodotAudio.Bus();
                    var isFirstBus = GodotAudio.buses.length === 0;
                    GodotAudio.buses.push(newBus);
                    if (isFirstBus) {
                      newBus.setSend(null);
                    } else {
                      newBus.setSend(GodotAudio.Bus.getBus(0));
                    }
                    return newBus;
                  }
                }]);
              }(),
              sampleFinishedCallback: null,
              ctx: null,
              input: null,
              driver: null,
              interval: 0,
              audioPositionWorkletPromise: null,
              linear_to_db: function linear_to_db(linear) {
                return Math.log(linear) * 8.685889638065037;
              },
              db_to_linear: function db_to_linear(db) {
                return Math.exp(db * .11512925464970228);
              },
              init: function init(mix_rate, latency, onstatechange, onlatencyupdate) {
                GodotAudio.samples = new Map();
                GodotAudio.sampleNodes = new Map();
                GodotAudio.buses = [];
                GodotAudio.busSolo = null;
                var opts = {};
                if (mix_rate) {
                  GodotAudio.sampleRate = mix_rate;
                  opts["sampleRate"] = mix_rate;
                }
                var ctx = new (window.AudioContext || window.webkitAudioContext)(opts);
                GodotAudio.ctx = ctx;
                ctx.onstatechange = function () {
                  var state = 0;
                  switch (ctx.state) {
                    case "suspended":
                      state = 0;
                      break;
                    case "running":
                      state = 1;
                      break;
                    case "closed":
                      state = 2;
                      break;
                    default:
                  }
                  onstatechange(state);
                };
                ctx.onstatechange();
                GodotAudio.interval = setInterval(function () {
                  var computed_latency = 0;
                  if (ctx.baseLatency) {
                    computed_latency += GodotAudio.ctx.baseLatency;
                  }
                  if (ctx.outputLatency) {
                    computed_latency += GodotAudio.ctx.outputLatency;
                  }
                  onlatencyupdate(computed_latency);
                }, 1e3);
                GodotOS.atexit(GodotAudio.close_async);
                var path = GodotConfig.locate_file("godot.audio.position.worklet.js");
                GodotAudio.audioPositionWorkletPromise = ctx.audioWorklet.addModule(path);
                return ctx.destination.channelCount;
              },
              create_input: function create_input(callback) {
                if (GodotAudio.input) {
                  return 0;
                }
                function gotMediaInput(stream) {
                  try {
                    GodotAudio.input = GodotAudio.ctx.createMediaStreamSource(stream);
                    callback(GodotAudio.input);
                  } catch (e) {
                    GodotRuntime.error("Failed creating input.", e);
                  }
                }
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  navigator.mediaDevices.getUserMedia({
                    audio: true
                  }).then(gotMediaInput, function (e) {
                    GodotRuntime.error("Error getting user media.", e);
                  });
                } else {
                  if (!navigator.getUserMedia) {
                    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                  }
                  if (!navigator.getUserMedia) {
                    GodotRuntime.error("getUserMedia not available.");
                    return 1;
                  }
                  navigator.getUserMedia({
                    audio: true
                  }, gotMediaInput, function (e) {
                    GodotRuntime.print(e);
                  });
                }
                return 0;
              },
              close_async: function close_async(resolve, reject) {
                var ctx = GodotAudio.ctx;
                GodotAudio.ctx = null;
                if (!ctx) {
                  resolve();
                  return;
                }
                if (GodotAudio.interval) {
                  clearInterval(GodotAudio.interval);
                  GodotAudio.interval = 0;
                }
                if (GodotAudio.input) {
                  GodotAudio.input.disconnect();
                  GodotAudio.input = null;
                }
                var closed = Promise.resolve();
                if (GodotAudio.driver) {
                  closed = GodotAudio.driver.close();
                }
                closed.then(function () {
                  return ctx.close();
                }).then(function () {
                  ctx.onstatechange = null;
                  resolve();
                })["catch"](function (e) {
                  ctx.onstatechange = null;
                  GodotRuntime.error("Error closing AudioContext", e);
                  resolve();
                });
              },
              start_sample: function start_sample(playbackObjectId, streamObjectId, busIndex, startOptions) {
                GodotAudio.SampleNode.stopSampleNode(playbackObjectId);
                GodotAudio.SampleNode.create({
                  busIndex: busIndex,
                  id: playbackObjectId,
                  streamObjectId: streamObjectId
                }, startOptions);
              },
              stop_sample: function stop_sample(playbackObjectId) {
                GodotAudio.SampleNode.stopSampleNode(playbackObjectId);
              },
              sample_set_pause: function sample_set_pause(playbackObjectId, pause) {
                GodotAudio.SampleNode.pauseSampleNode(playbackObjectId, pause);
              },
              update_sample_pitch_scale: function update_sample_pitch_scale(playbackObjectId, pitchScale) {
                var sampleNode = GodotAudio.SampleNode.getSampleNodeOrNull(playbackObjectId);
                if (sampleNode == null) {
                  return;
                }
                sampleNode.setPitchScale(pitchScale);
              },
              sample_set_volumes_linear: function sample_set_volumes_linear(playbackObjectId, busIndexes, volumes) {
                var sampleNode = GodotAudio.SampleNode.getSampleNodeOrNull(playbackObjectId);
                if (sampleNode == null) {
                  return;
                }
                var buses = busIndexes.map(function (busIndex) {
                  return GodotAudio.Bus.getBus(busIndex);
                });
                sampleNode.setVolumes(buses, volumes);
              },
              set_sample_bus_count: function set_sample_bus_count(count) {
                GodotAudio.Bus.setCount(count);
              },
              remove_sample_bus: function remove_sample_bus(index) {
                var bus = GodotAudio.Bus.getBusOrNull(index);
                if (bus == null) {
                  return;
                }
                bus.clear();
              },
              add_sample_bus: function add_sample_bus(atPos) {
                GodotAudio.Bus.addAt(atPos);
              },
              move_sample_bus: function move_sample_bus(busIndex, toPos) {
                GodotAudio.Bus.move(busIndex, toPos);
              },
              set_sample_bus_send: function set_sample_bus_send(busIndex, sendIndex) {
                var bus = GodotAudio.Bus.getBusOrNull(busIndex);
                if (bus == null) {
                  return;
                }
                var targetBus = GodotAudio.Bus.getBusOrNull(sendIndex);
                if (targetBus == null) {
                  targetBus = GodotAudio.Bus.getBus(0);
                }
                bus.setSend(targetBus);
              },
              set_sample_bus_volume_db: function set_sample_bus_volume_db(busIndex, volumeDb) {
                var bus = GodotAudio.Bus.getBusOrNull(busIndex);
                if (bus == null) {
                  return;
                }
                bus.setVolumeDb(volumeDb);
              },
              set_sample_bus_solo: function set_sample_bus_solo(busIndex, enable) {
                var bus = GodotAudio.Bus.getBusOrNull(busIndex);
                if (bus == null) {
                  return;
                }
                bus.solo(enable);
              },
              set_sample_bus_mute: function set_sample_bus_mute(busIndex, enable) {
                var bus = GodotAudio.Bus.getBusOrNull(busIndex);
                if (bus == null) {
                  return;
                }
                bus.mute(enable);
              }
            };
            function _godot_audio_get_sample_playback_position(playbackObjectIdStrPtr) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              var sampleNode = GodotAudio.SampleNode.getSampleNodeOrNull(playbackObjectId);
              if (sampleNode == null) {
                return 0;
              }
              return sampleNode.getPlaybackPosition();
            }
            function _godot_audio_has_script_processor() {
              return GodotAudio.ctx && GodotAudio.ctx.createScriptProcessor ? 1 : 0;
            }
            function _godot_audio_has_worklet() {
              return GodotAudio.ctx && GodotAudio.ctx.audioWorklet ? 1 : 0;
            }
            function _godot_audio_init(p_mix_rate, p_latency, p_state_change, p_latency_update) {
              var statechange = GodotRuntime.get_func(p_state_change);
              var latencyupdate = GodotRuntime.get_func(p_latency_update);
              var mix_rate = GodotRuntime.getHeapValue(p_mix_rate, "i32");
              var channels = GodotAudio.init(mix_rate, p_latency, statechange, latencyupdate);
              GodotRuntime.setHeapValue(p_mix_rate, GodotAudio.ctx.sampleRate, "i32");
              return channels;
            }
            function _godot_audio_input_start() {
              return GodotAudio.create_input(function (input) {
                input.connect(GodotAudio.driver.get_node());
              });
            }
            function _godot_audio_input_stop() {
              if (GodotAudio.input) {
                var tracks = GodotAudio.input["mediaStream"]["getTracks"]();
                for (var _i1 = 0; _i1 < tracks.length; _i1++) {
                  tracks[_i1]["stop"]();
                }
                GodotAudio.input.disconnect();
                GodotAudio.input = null;
              }
            }
            function _godot_audio_is_available() {
              if (!(window.AudioContext || window.webkitAudioContext)) {
                return 0;
              }
              return 1;
            }
            function _godot_audio_resume() {
              if (GodotAudio.ctx && GodotAudio.ctx.state !== "running") {
                GodotAudio.ctx.resume();
              }
            }
            function _godot_audio_sample_bus_add(atPos) {
              GodotAudio.add_sample_bus(atPos);
            }
            function _godot_audio_sample_bus_move(fromPos, toPos) {
              GodotAudio.move_sample_bus(fromPos, toPos);
            }
            function _godot_audio_sample_bus_remove(index) {
              GodotAudio.remove_sample_bus(index);
            }
            function _godot_audio_sample_bus_set_count(count) {
              GodotAudio.set_sample_bus_count(count);
            }
            function _godot_audio_sample_bus_set_mute(bus, enable) {
              GodotAudio.set_sample_bus_mute(bus, Boolean(enable));
            }
            function _godot_audio_sample_bus_set_send(bus, sendIndex) {
              GodotAudio.set_sample_bus_send(bus, sendIndex);
            }
            function _godot_audio_sample_bus_set_solo(bus, enable) {
              GodotAudio.set_sample_bus_solo(bus, Boolean(enable));
            }
            function _godot_audio_sample_bus_set_volume_db(bus, volumeDb) {
              GodotAudio.set_sample_bus_volume_db(bus, volumeDb);
            }
            function _godot_audio_sample_is_active(playbackObjectIdStrPtr) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              return Number(GodotAudio.sampleNodes.has(playbackObjectId));
            }
            function _godot_audio_sample_register_stream(streamObjectIdStrPtr, framesPtr, framesTotal, loopModeStrPtr, loopBegin, loopEnd) {
              var BYTES_PER_FLOAT32 = 4;
              var streamObjectId = GodotRuntime.parseString(streamObjectIdStrPtr);
              var loopMode = GodotRuntime.parseString(loopModeStrPtr);
              var numberOfChannels = 2;
              var sampleRate = GodotAudio.ctx.sampleRate;
              var subLeft = GodotRuntime.heapSub(HEAPF32, framesPtr, framesTotal);
              var subRight = GodotRuntime.heapSub(HEAPF32, framesPtr + framesTotal * BYTES_PER_FLOAT32, framesTotal);
              var audioBuffer = GodotAudio.ctx.createBuffer(numberOfChannels, framesTotal, sampleRate);
              audioBuffer.copyToChannel(new Float32Array(subLeft), 0, 0);
              audioBuffer.copyToChannel(new Float32Array(subRight), 1, 0);
              GodotAudio.Sample.create({
                id: streamObjectId,
                audioBuffer: audioBuffer
              }, {
                loopBegin: loopBegin,
                loopEnd: loopEnd,
                loopMode: loopMode,
                numberOfChannels: numberOfChannels,
                sampleRate: sampleRate
              });
            }
            function _godot_audio_sample_set_finished_callback(callbackPtr) {
              GodotAudio.sampleFinishedCallback = GodotRuntime.get_func(callbackPtr);
            }
            function _godot_audio_sample_set_pause(playbackObjectIdStrPtr, pause) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              GodotAudio.sample_set_pause(playbackObjectId, Boolean(pause));
            }
            function _godot_audio_sample_set_volumes_linear(playbackObjectIdStrPtr, busesPtr, busesSize, volumesPtr, volumesSize) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              var buses = GodotRuntime.heapSub(HEAP32, busesPtr, busesSize);
              var volumes = GodotRuntime.heapSub(HEAPF32, volumesPtr, volumesSize);
              GodotAudio.sample_set_volumes_linear(playbackObjectId, Array.from(buses), volumes);
            }
            function _godot_audio_sample_start(playbackObjectIdStrPtr, streamObjectIdStrPtr, busIndex, offset, pitchScale, volumePtr) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              var streamObjectId = GodotRuntime.parseString(streamObjectIdStrPtr);
              var volume = GodotRuntime.heapSub(HEAPF32, volumePtr, 8);
              var startOptions = {
                offset: offset,
                volume: volume,
                playbackRate: 1,
                pitchScale: pitchScale,
                start: true
              };
              GodotAudio.start_sample(playbackObjectId, streamObjectId, busIndex, startOptions);
            }
            function _godot_audio_sample_stop(playbackObjectIdStrPtr) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              GodotAudio.stop_sample(playbackObjectId);
            }
            function _godot_audio_sample_stream_is_registered(streamObjectIdStrPtr) {
              var streamObjectId = GodotRuntime.parseString(streamObjectIdStrPtr);
              return Number(GodotAudio.Sample.getSampleOrNull(streamObjectId) != null);
            }
            function _godot_audio_sample_unregister_stream(streamObjectIdStrPtr) {
              var streamObjectId = GodotRuntime.parseString(streamObjectIdStrPtr);
              var sample = GodotAudio.Sample.getSampleOrNull(streamObjectId);
              if (sample != null) {
                sample.clear();
              }
            }
            function _godot_audio_sample_update_pitch_scale(playbackObjectIdStrPtr, pitchScale) {
              var playbackObjectId = GodotRuntime.parseString(playbackObjectIdStrPtr);
              GodotAudio.update_sample_pitch_scale(playbackObjectId, pitchScale);
            }
            var GodotAudioScript = {
              script: null,
              create: function create(buffer_length, channel_count) {
                GodotAudioScript.script = GodotAudio.ctx.createScriptProcessor(buffer_length, 2, channel_count);
                GodotAudio.driver = GodotAudioScript;
                return GodotAudioScript.script.bufferSize;
              },
              start: function start(p_in_buf, p_in_size, p_out_buf, p_out_size, onprocess) {
                GodotAudioScript.script.onaudioprocess = function (event) {
                  var inb = GodotRuntime.heapSub(HEAPF32, p_in_buf, p_in_size);
                  var input = event.inputBuffer;
                  if (GodotAudio.input) {
                    var inlen = input.getChannelData(0).length;
                    for (var ch = 0; ch < 2; ch++) {
                      var data = input.getChannelData(ch);
                      for (var s = 0; s < inlen; s++) {
                        inb[s * 2 + ch] = data[s];
                      }
                    }
                  }
                  onprocess();
                  var outb = GodotRuntime.heapSub(HEAPF32, p_out_buf, p_out_size);
                  var output = event.outputBuffer;
                  var channels = output.numberOfChannels;
                  for (var _ch = 0; _ch < channels; _ch++) {
                    var _data = output.getChannelData(_ch);
                    for (var sample = 0; sample < _data.length; sample++) {
                      _data[sample] = outb[sample * channels + _ch];
                    }
                  }
                };
                GodotAudioScript.script.connect(GodotAudio.ctx.destination);
              },
              get_node: function get_node() {
                return GodotAudioScript.script;
              },
              close: function close() {
                return new Promise(function (resolve, reject) {
                  GodotAudioScript.script.disconnect();
                  GodotAudioScript.script.onaudioprocess = null;
                  GodotAudioScript.script = null;
                  resolve();
                });
              }
            };
            function _godot_audio_script_create(buffer_length, channel_count) {
              var buf_len = GodotRuntime.getHeapValue(buffer_length, "i32");
              try {
                var out_len = GodotAudioScript.create(buf_len, channel_count);
                GodotRuntime.setHeapValue(buffer_length, out_len, "i32");
              } catch (e) {
                GodotRuntime.error("Error starting AudioDriverScriptProcessor", e);
                return 1;
              }
              return 0;
            }
            function _godot_audio_script_start(p_in_buf, p_in_size, p_out_buf, p_out_size, p_cb) {
              var onprocess = GodotRuntime.get_func(p_cb);
              GodotAudioScript.start(p_in_buf, p_in_size, p_out_buf, p_out_size, onprocess);
            }
            var GodotAudioWorklet = {
              promise: null,
              worklet: null,
              ring_buffer: null,
              create: function create(channels) {
                var path = GodotConfig.locate_file("godot.audio.worklet.js");
                GodotAudioWorklet.promise = GodotAudio.ctx.audioWorklet.addModule(path).then(function () {
                  GodotAudioWorklet.worklet = new AudioWorkletNode(GodotAudio.ctx, "godot-processor", {
                    outputChannelCount: [channels]
                  });
                  return Promise.resolve();
                });
                GodotAudio.driver = GodotAudioWorklet;
              },
              start: function start(in_buf, out_buf, state) {
                GodotAudioWorklet.promise.then(function () {
                  var node = GodotAudioWorklet.worklet;
                  node.connect(GodotAudio.ctx.destination);
                  node.port.postMessage({
                    cmd: "start",
                    data: [state, in_buf, out_buf]
                  });
                  node.port.onmessage = function (event) {
                    GodotRuntime.error(event.data);
                  };
                });
              },
              start_no_threads: function start_no_threads(p_out_buf, p_out_size, out_callback, p_in_buf, p_in_size, in_callback) {
                function RingBuffer() {
                  var wpos = 0;
                  var rpos = 0;
                  var pending_samples = 0;
                  var wbuf = new Float32Array(p_out_size);
                  function send(port) {
                    if (pending_samples === 0) {
                      return;
                    }
                    var buffer = GodotRuntime.heapSub(HEAPF32, p_out_buf, p_out_size);
                    var size = buffer.length;
                    var tot_sent = pending_samples;
                    out_callback(wpos, pending_samples);
                    if (wpos + pending_samples >= size) {
                      var high = size - wpos;
                      wbuf.set(buffer.subarray(wpos, size));
                      pending_samples -= high;
                      wpos = 0;
                    }
                    if (pending_samples > 0) {
                      wbuf.set(buffer.subarray(wpos, wpos + pending_samples), tot_sent - pending_samples);
                    }
                    port.postMessage({
                      cmd: "chunk",
                      data: wbuf.subarray(0, tot_sent)
                    });
                    wpos += pending_samples;
                    pending_samples = 0;
                  }
                  this.receive = function (recv_buf) {
                    var buffer = GodotRuntime.heapSub(HEAPF32, p_in_buf, p_in_size);
                    var from = rpos;
                    var to_write = recv_buf.length;
                    var high = 0;
                    if (rpos + to_write >= p_in_size) {
                      high = p_in_size - rpos;
                      buffer.set(recv_buf.subarray(0, high), rpos);
                      to_write -= high;
                      rpos = 0;
                    }
                    if (to_write) {
                      buffer.set(recv_buf.subarray(high, to_write), rpos);
                    }
                    in_callback(from, recv_buf.length);
                    rpos += to_write;
                  };
                  this.consumed = function (size, port) {
                    pending_samples += size;
                    send(port);
                  };
                }
                GodotAudioWorklet.ring_buffer = new RingBuffer();
                GodotAudioWorklet.promise.then(function () {
                  var node = GodotAudioWorklet.worklet;
                  var buffer = GodotRuntime.heapSlice(HEAPF32, p_out_buf, p_out_size);
                  node.connect(GodotAudio.ctx.destination);
                  node.port.postMessage({
                    cmd: "start_nothreads",
                    data: [buffer, p_in_size]
                  });
                  node.port.onmessage = function (event) {
                    if (!GodotAudioWorklet.worklet) {
                      return;
                    }
                    if (event.data["cmd"] === "read") {
                      var read = event.data["data"];
                      GodotAudioWorklet.ring_buffer.consumed(read, GodotAudioWorklet.worklet.port);
                    } else if (event.data["cmd"] === "input") {
                      var buf = event.data["data"];
                      if (buf.length > p_in_size) {
                        GodotRuntime.error("Input chunk is too big");
                        return;
                      }
                      GodotAudioWorklet.ring_buffer.receive(buf);
                    } else {
                      GodotRuntime.error(event.data);
                    }
                  };
                });
              },
              get_node: function get_node() {
                return GodotAudioWorklet.worklet;
              },
              close: function close() {
                return new Promise(function (resolve, reject) {
                  if (GodotAudioWorklet.promise === null) {
                    return;
                  }
                  var p = GodotAudioWorklet.promise;
                  p.then(function () {
                    GodotAudioWorklet.worklet.port.postMessage({
                      cmd: "stop",
                      data: null
                    });
                    GodotAudioWorklet.worklet.disconnect();
                    GodotAudioWorklet.worklet.port.onmessage = null;
                    GodotAudioWorklet.worklet = null;
                    GodotAudioWorklet.promise = null;
                    resolve();
                  })["catch"](function (err) {
                    GodotRuntime.error(err);
                  });
                });
              }
            };
            function _godot_audio_worklet_create(channels) {
              try {
                GodotAudioWorklet.create(channels);
              } catch (e) {
                GodotRuntime.error("Error starting AudioDriverWorklet", e);
                return 1;
              }
              return 0;
            }
            function _godot_audio_worklet_start_no_threads(p_out_buf, p_out_size, p_out_callback, p_in_buf, p_in_size, p_in_callback) {
              var out_callback = GodotRuntime.get_func(p_out_callback);
              var in_callback = GodotRuntime.get_func(p_in_callback);
              GodotAudioWorklet.start_no_threads(p_out_buf, p_out_size, out_callback, p_in_buf, p_in_size, in_callback);
            }
            function _godot_js_config_canvas_id_get(p_ptr, p_ptr_max) {
              GodotRuntime.stringToHeap("#".concat(GodotConfig.canvas.id), p_ptr, p_ptr_max);
            }
            function _godot_js_config_locale_get(p_ptr, p_ptr_max) {
              GodotRuntime.stringToHeap(GodotConfig.locale, p_ptr, p_ptr_max);
            }
            var GodotDisplayCursor = {
              shape: "default",
              visible: true,
              cursors: {},
              set_style: function set_style(style) {
                GodotConfig.canvas.style.cursor = style;
              },
              set_shape: function set_shape(shape) {
                GodotDisplayCursor.shape = shape;
                var css = shape;
                if (shape in GodotDisplayCursor.cursors) {
                  var c = GodotDisplayCursor.cursors[shape];
                  css = "url(\"".concat(c.url, "\") ").concat(c.x, " ").concat(c.y, ", default");
                }
                if (GodotDisplayCursor.visible) {
                  GodotDisplayCursor.set_style(css);
                }
              },
              clear: function clear() {
                GodotDisplayCursor.set_style("");
                GodotDisplayCursor.shape = "default";
                GodotDisplayCursor.visible = true;
                Object.keys(GodotDisplayCursor.cursors).forEach(function (key) {
                  URL.revokeObjectURL(GodotDisplayCursor.cursors[key]);
                  delete GodotDisplayCursor.cursors[key];
                });
              },
              lockPointer: function lockPointer() {
                var canvas = GodotConfig.canvas;
                if (canvas.requestPointerLock) {
                  canvas.requestPointerLock();
                }
              },
              releasePointer: function releasePointer() {
                if (document.exitPointerLock) {
                  document.exitPointerLock();
                }
              },
              isPointerLocked: function isPointerLocked() {
                return document.pointerLockElement === GodotConfig.canvas;
              }
            };
            var GodotEventListeners = {
              handlers: [],
              has: function has(target, event, method, capture) {
                return GodotEventListeners.handlers.findIndex(function (e) {
                  return e.target === target && e.event === event && e.method === method && e.capture === capture;
                }) !== -1;
              },
              add: function add(target, event, method, capture) {
                if (GodotEventListeners.has(target, event, method, capture)) {
                  return;
                }
                function Handler(p_target, p_event, p_method, p_capture) {
                  this.target = p_target;
                  this.event = p_event;
                  this.method = p_method;
                  this.capture = p_capture;
                }
                GodotEventListeners.handlers.push(new Handler(target, event, method, capture));
                target.addEventListener(event, method, capture);
              },
              clear: function clear() {
                GodotEventListeners.handlers.forEach(function (h) {
                  h.target.removeEventListener(h.event, h.method, h.capture);
                });
                GodotEventListeners.handlers.length = 0;
              }
            };
            var _emscripten_webgl_do_get_current_context = function _emscripten_webgl_do_get_current_context() {
              return GL.currentContext ? GL.currentContext.handle : 0;
            };
            var _emscripten_webgl_get_current_context = _emscripten_webgl_do_get_current_context;
            var GodotDisplayScreen = {
              desired_size: [0, 0],
              hidpi: true,
              getPixelRatio: function getPixelRatio() {
                return GodotDisplayScreen.hidpi ? window.devicePixelRatio || 1 : 1;
              },
              isFullscreen: function isFullscreen() {
                var elem = document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
                if (elem) {
                  return elem === GodotConfig.canvas;
                }
                return document.fullscreen || document.mozFullScreen || document.webkitIsFullscreen;
              },
              hasFullscreen: function hasFullscreen() {
                return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
              },
              requestFullscreen: function requestFullscreen() {
                if (!GodotDisplayScreen.hasFullscreen()) {
                  return 1;
                }
                var canvas = GodotConfig.canvas;
                try {
                  var promise = (canvas.requestFullscreen || canvas.msRequestFullscreen || canvas.mozRequestFullScreen || canvas.mozRequestFullscreen || canvas.webkitRequestFullscreen).call(canvas);
                  if (promise) {
                    promise["catch"](function () {});
                  }
                } catch (e) {
                  return 1;
                }
                return 0;
              },
              exitFullscreen: function exitFullscreen() {
                if (!GodotDisplayScreen.isFullscreen()) {
                  return 0;
                }
                try {
                  var promise = document.exitFullscreen();
                  if (promise) {
                    promise["catch"](function () {});
                  }
                } catch (e) {
                  return 1;
                }
                return 0;
              },
              _updateGL: function _updateGL() {
                var gl_context_handle = _emscripten_webgl_get_current_context();
                var gl = GL.getContext(gl_context_handle);
                if (gl) {
                  GL.resizeOffscreenFramebuffer(gl);
                }
              },
              updateSize: function updateSize() {
                var isFullscreen = GodotDisplayScreen.isFullscreen();
                var wantsFullWindow = GodotConfig.canvas_resize_policy === 2;
                var noResize = GodotConfig.canvas_resize_policy === 0;
                var dWidth = GodotDisplayScreen.desired_size[0];
                var dHeight = GodotDisplayScreen.desired_size[1];
                var canvas = GodotConfig.canvas;
                var width = dWidth;
                var height = dHeight;
                if (noResize) {
                  if (canvas.width !== width || canvas.height !== height) {
                    GodotDisplayScreen.desired_size = [canvas.width, canvas.height];
                    GodotDisplayScreen._updateGL();
                    return 1;
                  }
                  return 0;
                }
                var scale = GodotDisplayScreen.getPixelRatio();
                if (isFullscreen || wantsFullWindow) {
                  width = window.innerWidth * scale;
                  height = window.innerHeight * scale;
                }
                var csw = "".concat(width / scale, "px");
                var csh = "".concat(height / scale, "px");
                if (canvas.style.width !== csw || canvas.style.height !== csh || canvas.width !== width || canvas.height !== height) {
                  canvas.width = width;
                  canvas.height = height;
                  canvas.style.width = csw;
                  canvas.style.height = csh;
                  GodotDisplayScreen._updateGL();
                  return 1;
                }
                return 0;
              }
            };
            var GodotDisplayVK = {
              textinput: null,
              textarea: null,
              available: function available() {
                return GodotConfig.virtual_keyboard && "ontouchstart" in window;
              },
              init: function init(input_cb) {
                function create(what) {
                  var elem = document.createElement(what);
                  elem.style.display = "none";
                  elem.style.position = "absolute";
                  elem.style.zIndex = "-1";
                  elem.style.background = "transparent";
                  elem.style.padding = "0px";
                  elem.style.margin = "0px";
                  elem.style.overflow = "hidden";
                  elem.style.width = "0px";
                  elem.style.height = "0px";
                  elem.style.border = "0px";
                  elem.style.outline = "none";
                  elem.readonly = true;
                  elem.disabled = true;
                  GodotEventListeners.add(elem, "input", function (evt) {
                    var c_str = GodotRuntime.allocString(elem.value);
                    input_cb(c_str, elem.selectionEnd);
                    GodotRuntime.free(c_str);
                  }, false);
                  GodotEventListeners.add(elem, "blur", function (evt) {
                    elem.style.display = "none";
                    elem.readonly = true;
                    elem.disabled = true;
                  }, false);
                  GodotConfig.canvas.insertAdjacentElement("beforebegin", elem);
                  return elem;
                }
                GodotDisplayVK.textinput = create("input");
                GodotDisplayVK.textarea = create("textarea");
                GodotDisplayVK.updateSize();
              },
              show: function show(text, type, start, end) {
                if (!GodotDisplayVK.textinput || !GodotDisplayVK.textarea) {
                  return;
                }
                if (GodotDisplayVK.textinput.style.display !== "" || GodotDisplayVK.textarea.style.display !== "") {
                  GodotDisplayVK.hide();
                }
                GodotDisplayVK.updateSize();
                var elem = GodotDisplayVK.textinput;
                switch (type) {
                  case 0:
                    elem.type = "text";
                    elem.inputmode = "";
                    break;
                  case 1:
                    elem = GodotDisplayVK.textarea;
                    break;
                  case 2:
                    elem.type = "text";
                    elem.inputmode = "numeric";
                    break;
                  case 3:
                    elem.type = "text";
                    elem.inputmode = "decimal";
                    break;
                  case 4:
                    elem.type = "tel";
                    elem.inputmode = "";
                    break;
                  case 5:
                    elem.type = "email";
                    elem.inputmode = "";
                    break;
                  case 6:
                    elem.type = "password";
                    elem.inputmode = "";
                    break;
                  case 7:
                    elem.type = "url";
                    elem.inputmode = "";
                    break;
                  default:
                    elem.type = "text";
                    elem.inputmode = "";
                    break;
                }
                elem.readonly = false;
                elem.disabled = false;
                elem.value = text;
                elem.style.display = "block";
                elem.focus();
                elem.setSelectionRange(start, end);
              },
              hide: function hide() {
                if (!GodotDisplayVK.textinput || !GodotDisplayVK.textarea) {
                  return;
                }
                [GodotDisplayVK.textinput, GodotDisplayVK.textarea].forEach(function (elem) {
                  elem.blur();
                  elem.style.display = "none";
                  elem.value = "";
                });
              },
              updateSize: function updateSize() {
                if (!GodotDisplayVK.textinput || !GodotDisplayVK.textarea) {
                  return;
                }
                var rect = GodotConfig.canvas.getBoundingClientRect();
                function update(elem) {
                  elem.style.left = "".concat(rect.left, "px");
                  elem.style.top = "".concat(rect.top, "px");
                  elem.style.width = "".concat(rect.width, "px");
                  elem.style.height = "".concat(rect.height, "px");
                }
                update(GodotDisplayVK.textinput);
                update(GodotDisplayVK.textarea);
              },
              clear: function clear() {
                if (GodotDisplayVK.textinput) {
                  GodotDisplayVK.textinput.remove();
                  GodotDisplayVK.textinput = null;
                }
                if (GodotDisplayVK.textarea) {
                  GodotDisplayVK.textarea.remove();
                  GodotDisplayVK.textarea = null;
                }
              }
            };
            var GodotDisplay = {
              window_icon: "",
              getDPI: function getDPI() {
                var dpi = Math.round(window.devicePixelRatio * 96);
                return dpi >= 96 ? dpi : 96;
              }
            };
            function _godot_js_display_alert(p_text) {
              window.alert(GodotRuntime.parseString(p_text));
            }
            function _godot_js_display_canvas_focus() {
              GodotConfig.canvas.focus();
            }
            function _godot_js_display_canvas_is_focused() {
              return document.activeElement === GodotConfig.canvas;
            }
            function _godot_js_display_clipboard_get(callback) {
              var func = GodotRuntime.get_func(callback);
              try {
                navigator.clipboard.readText().then(function (result) {
                  var ptr = GodotRuntime.allocString(result);
                  func(ptr);
                  GodotRuntime.free(ptr);
                })["catch"](function (e) {});
              } catch (e) {}
            }
            function _godot_js_display_clipboard_set(p_text) {
              var text = GodotRuntime.parseString(p_text);
              if (!navigator.clipboard || !navigator.clipboard.writeText) {
                return 1;
              }
              navigator.clipboard.writeText(text)["catch"](function (e) {
                GodotRuntime.error("Setting OS clipboard is only possible from an input callback for the Web platform. Exception:", e);
              });
              return 0;
            }
            function _godot_js_display_cursor_is_hidden() {
              return !GodotDisplayCursor.visible;
            }
            function _godot_js_display_cursor_is_locked() {
              return GodotDisplayCursor.isPointerLocked() ? 1 : 0;
            }
            function _godot_js_display_cursor_lock_set(p_lock) {
              if (p_lock) {
                GodotDisplayCursor.lockPointer();
              } else {
                GodotDisplayCursor.releasePointer();
              }
            }
            function _godot_js_display_cursor_set_custom_shape(p_shape, p_ptr, p_len, p_hotspot_x, p_hotspot_y) {
              var shape = GodotRuntime.parseString(p_shape);
              var old_shape = GodotDisplayCursor.cursors[shape];
              if (p_len > 0) {
                var png = new Blob([GodotRuntime.heapSlice(HEAPU8, p_ptr, p_len)], {
                  type: "image/png"
                });
                var url = URL.createObjectURL(png);
                GodotDisplayCursor.cursors[shape] = {
                  url: url,
                  x: p_hotspot_x,
                  y: p_hotspot_y
                };
              } else {
                delete GodotDisplayCursor.cursors[shape];
              }
              if (shape === GodotDisplayCursor.shape) {
                GodotDisplayCursor.set_shape(GodotDisplayCursor.shape);
              }
              if (old_shape) {
                URL.revokeObjectURL(old_shape.url);
              }
            }
            function _godot_js_display_cursor_set_shape(p_string) {
              GodotDisplayCursor.set_shape(GodotRuntime.parseString(p_string));
            }
            function _godot_js_display_cursor_set_visible(p_visible) {
              var visible = p_visible !== 0;
              if (visible === GodotDisplayCursor.visible) {
                return;
              }
              GodotDisplayCursor.visible = visible;
              if (visible) {
                GodotDisplayCursor.set_shape(GodotDisplayCursor.shape);
              } else {
                GodotDisplayCursor.set_style("none");
              }
            }
            function _godot_js_display_desired_size_set(width, height) {
              GodotDisplayScreen.desired_size = [width, height];
              GodotDisplayScreen.updateSize();
            }
            function _godot_js_display_fullscreen_cb(callback) {
              var canvas = GodotConfig.canvas;
              var func = GodotRuntime.get_func(callback);
              function change_cb(evt) {
                if (evt.target === canvas) {
                  func(GodotDisplayScreen.isFullscreen());
                }
              }
              GodotEventListeners.add(document, "fullscreenchange", change_cb, false);
              GodotEventListeners.add(document, "mozfullscreenchange", change_cb, false);
              GodotEventListeners.add(document, "webkitfullscreenchange", change_cb, false);
            }
            function _godot_js_display_fullscreen_exit() {
              return GodotDisplayScreen.exitFullscreen();
            }
            function _godot_js_display_fullscreen_request() {
              return GodotDisplayScreen.requestFullscreen();
            }
            function _godot_js_display_has_webgl(p_version) {
              if (p_version !== 1 && p_version !== 2) {
                return false;
              }
              try {
                return !!document.createElement("canvas").getContext(p_version === 2 ? "webgl2" : "webgl");
              } catch (e) {}
              return false;
            }
            function _godot_js_display_is_swap_ok_cancel() {
              var win = ["Windows", "Win64", "Win32", "WinCE"];
              var plat = navigator.platform || "";
              if (win.indexOf(plat) !== -1) {
                return 1;
              }
              return 0;
            }
            function _godot_js_display_notification_cb(callback, p_enter, p_exit, p_in, p_out) {
              var canvas = GodotConfig.canvas;
              var func = GodotRuntime.get_func(callback);
              var notif = [p_enter, p_exit, p_in, p_out];
              ["mouseover", "mouseleave", "focus", "blur"].forEach(function (evt_name, idx) {
                GodotEventListeners.add(canvas, evt_name, function () {
                  func(notif[idx]);
                }, true);
              });
            }
            function _godot_js_display_pixel_ratio_get() {
              return GodotDisplayScreen.getPixelRatio();
            }
            function _godot_js_display_screen_dpi_get() {
              return GodotDisplay.getDPI();
            }
            function _godot_js_display_screen_size_get(width, height) {
              var scale = GodotDisplayScreen.getPixelRatio();
              GodotRuntime.setHeapValue(width, window.screen.width * scale, "i32");
              GodotRuntime.setHeapValue(height, window.screen.height * scale, "i32");
            }
            function _godot_js_display_setup_canvas(p_width, p_height, p_fullscreen, p_hidpi) {
              var canvas = GodotConfig.canvas;
              GodotEventListeners.add(canvas, "contextmenu", function (ev) {
                ev.preventDefault();
              }, false);
              GodotEventListeners.add(canvas, "webglcontextlost", function (ev) {
                alert("WebGL context lost, please reload the page");
                ev.preventDefault();
              }, false);
              GodotDisplayScreen.hidpi = !!p_hidpi;
              switch (GodotConfig.canvas_resize_policy) {
                case 0:
                  GodotDisplayScreen.desired_size = [canvas.width, canvas.height];
                  break;
                case 1:
                  GodotDisplayScreen.desired_size = [p_width, p_height];
                  break;
                default:
                  canvas.style.position = "absolute";
                  canvas.style.top = 0;
                  canvas.style.left = 0;
                  break;
              }
              GodotDisplayScreen.updateSize();
              if (p_fullscreen) {
                GodotDisplayScreen.requestFullscreen();
              }
            }
            function _godot_js_display_size_update() {
              var updated = GodotDisplayScreen.updateSize();
              if (updated) {
                GodotDisplayVK.updateSize();
              }
              return updated;
            }
            function _godot_js_display_touchscreen_is_available() {
              return "ontouchstart" in window;
            }
            function _godot_js_display_tts_available() {
              return "speechSynthesis" in window;
            }
            function _godot_js_display_vk_available() {
              return GodotDisplayVK.available();
            }
            function _godot_js_display_vk_cb(p_input_cb) {
              var input_cb = GodotRuntime.get_func(p_input_cb);
              if (GodotDisplayVK.available()) {
                GodotDisplayVK.init(input_cb);
              }
            }
            function _godot_js_display_vk_hide() {
              GodotDisplayVK.hide();
            }
            function _godot_js_display_vk_show(p_text, p_type, p_start, p_end) {
              var text = GodotRuntime.parseString(p_text);
              var start = p_start > 0 ? p_start : 0;
              var end = p_end > 0 ? p_end : start;
              GodotDisplayVK.show(text, p_type, start, end);
            }
            function _godot_js_display_window_blur_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              GodotEventListeners.add(window, "blur", function () {
                func();
              }, false);
            }
            function _godot_js_display_window_icon_set(p_ptr, p_len) {
              var link = document.getElementById("-gd-engine-icon");
              var old_icon = GodotDisplay.window_icon;
              if (p_ptr) {
                if (link === null) {
                  link = document.createElement("link");
                  link.rel = "icon";
                  link.id = "-gd-engine-icon";
                  document.head.appendChild(link);
                }
                var png = new Blob([GodotRuntime.heapSlice(HEAPU8, p_ptr, p_len)], {
                  type: "image/png"
                });
                GodotDisplay.window_icon = URL.createObjectURL(png);
                link.href = GodotDisplay.window_icon;
              } else {
                if (link) {
                  link.remove();
                }
                GodotDisplay.window_icon = null;
              }
              if (old_icon) {
                URL.revokeObjectURL(old_icon);
              }
            }
            function _godot_js_display_window_size_get(p_width, p_height) {
              GodotRuntime.setHeapValue(p_width, GodotConfig.canvas.width, "i32");
              GodotRuntime.setHeapValue(p_height, GodotConfig.canvas.height, "i32");
            }
            function _godot_js_display_window_title_set(p_data) {
              document.title = GodotRuntime.parseString(p_data);
            }
            function _godot_js_eval(p_js, p_use_global_ctx, p_union_ptr, p_byte_arr, p_byte_arr_write, p_callback) {
              var js_code = GodotRuntime.parseString(p_js);
              var eval_ret = null;
              try {
                if (p_use_global_ctx) {
                  var global_eval = eval;
                  eval_ret = global_eval(js_code);
                } else {
                  eval_ret = eval(js_code);
                }
              } catch (e) {
                GodotRuntime.error(e);
              }
              switch (_typeof(eval_ret)) {
                case "boolean":
                  GodotRuntime.setHeapValue(p_union_ptr, eval_ret, "i32");
                  return 1;
                case "number":
                  GodotRuntime.setHeapValue(p_union_ptr, eval_ret, "double");
                  return 3;
                case "string":
                  GodotRuntime.setHeapValue(p_union_ptr, GodotRuntime.allocString(eval_ret), "*");
                  return 4;
                case "object":
                  if (eval_ret === null) {
                    break;
                  }
                  if (ArrayBuffer.isView(eval_ret) && !(eval_ret instanceof Uint8Array)) {
                    eval_ret = new Uint8Array(eval_ret.buffer);
                  } else if (eval_ret instanceof ArrayBuffer) {
                    eval_ret = new Uint8Array(eval_ret);
                  }
                  if (eval_ret instanceof Uint8Array) {
                    var func = GodotRuntime.get_func(p_callback);
                    var bytes_ptr = func(p_byte_arr, p_byte_arr_write, eval_ret.length);
                    HEAPU8.set(eval_ret, bytes_ptr);
                    return 29;
                  }
                  break;
              }
              return 0;
            }
            var IDHandler = {
              _last_id: 0,
              _references: {},
              get: function get(p_id) {
                return IDHandler._references[p_id];
              },
              add: function add(p_data) {
                var id = ++IDHandler._last_id;
                IDHandler._references[id] = p_data;
                return id;
              },
              remove: function remove(p_id) {
                delete IDHandler._references[p_id];
              }
            };
            var GodotFetch = {
              onread: function onread(id, result) {
                var obj = IDHandler.get(id);
                if (!obj) {
                  return;
                }
                if (result.value) {
                  obj.chunks.push(result.value);
                }
                obj.reading = false;
                obj.done = result.done;
              },
              onresponse: function onresponse(id, response) {
                var _response$body;
                var obj = IDHandler.get(id);
                if (!obj) {
                  return;
                }
                var chunked = false;
                response.headers.forEach(function (value, header) {
                  var v = value.toLowerCase().trim();
                  var h = header.toLowerCase().trim();
                  if (h === "transfer-encoding" && v === "chunked") {
                    chunked = true;
                  }
                });
                obj.status = response.status;
                obj.response = response;
                obj.reader = (_response$body = response.body) === null || _response$body === void 0 ? void 0 : _response$body.getReader();
                obj.chunked = chunked;
              },
              onerror: function onerror(id, err) {
                GodotRuntime.error(err);
                var obj = IDHandler.get(id);
                if (!obj) {
                  return;
                }
                obj.error = err;
              },
              create: function create(method, url, headers, body) {
                var obj = {
                  request: null,
                  response: null,
                  reader: null,
                  error: null,
                  done: false,
                  reading: false,
                  status: 0,
                  chunks: []
                };
                var id = IDHandler.add(obj);
                var init = {
                  method: method,
                  headers: headers,
                  body: body
                };
                obj.request = fetch(url, init);
                obj.request.then(GodotFetch.onresponse.bind(null, id))["catch"](GodotFetch.onerror.bind(null, id));
                return id;
              },
              free: function free(id) {
                var obj = IDHandler.get(id);
                if (!obj) {
                  return;
                }
                IDHandler.remove(id);
                if (!obj.request) {
                  return;
                }
                obj.request.then(function (response) {
                  response.abort();
                })["catch"](function (e) {});
              },
              read: function read(id) {
                var obj = IDHandler.get(id);
                if (!obj) {
                  return;
                }
                if (obj.reader && !obj.reading) {
                  if (obj.done) {
                    obj.reader = null;
                    return;
                  }
                  obj.reading = true;
                  obj.reader.read().then(GodotFetch.onread.bind(null, id))["catch"](GodotFetch.onerror.bind(null, id));
                } else if (obj.reader == null && obj.response.body == null) {
                  obj.reading = true;
                  GodotFetch.onread(id, {
                    value: undefined,
                    done: true
                  });
                }
              }
            };
            function _godot_js_fetch_create(p_method, p_url, p_headers, p_headers_size, p_body, p_body_size) {
              var method = GodotRuntime.parseString(p_method);
              var url = GodotRuntime.parseString(p_url);
              var headers = GodotRuntime.parseStringArray(p_headers, p_headers_size);
              var body = p_body_size ? GodotRuntime.heapSlice(HEAP8, p_body, p_body_size) : null;
              return GodotFetch.create(method, url, headers.map(function (hv) {
                var idx = hv.indexOf(":");
                if (idx <= 0) {
                  return [];
                }
                return [hv.slice(0, idx).trim(), hv.slice(idx + 1).trim()];
              }).filter(function (v) {
                return v.length === 2;
              }), body);
            }
            function _godot_js_fetch_free(id) {
              GodotFetch.free(id);
            }
            function _godot_js_fetch_http_status_get(p_id) {
              var obj = IDHandler.get(p_id);
              if (!obj || !obj.response) {
                return 0;
              }
              return obj.status;
            }
            function _godot_js_fetch_is_chunked(p_id) {
              var obj = IDHandler.get(p_id);
              if (!obj || !obj.response) {
                return -1;
              }
              return obj.chunked ? 1 : 0;
            }
            function _godot_js_fetch_read_chunk(p_id, p_buf, p_buf_size) {
              var obj = IDHandler.get(p_id);
              if (!obj || !obj.response) {
                return 0;
              }
              var to_read = p_buf_size;
              var chunks = obj.chunks;
              while (to_read && chunks.length) {
                var chunk = obj.chunks[0];
                if (chunk.length > to_read) {
                  GodotRuntime.heapCopy(HEAP8, chunk.slice(0, to_read), p_buf);
                  chunks[0] = chunk.slice(to_read);
                  to_read = 0;
                } else {
                  GodotRuntime.heapCopy(HEAP8, chunk, p_buf);
                  to_read -= chunk.length;
                  chunks.pop();
                }
              }
              if (!chunks.length) {
                GodotFetch.read(p_id);
              }
              return p_buf_size - to_read;
            }
            function _godot_js_fetch_read_headers(p_id, p_parse_cb, p_ref) {
              var obj = IDHandler.get(p_id);
              if (!obj || !obj.response) {
                return 1;
              }
              var cb = GodotRuntime.get_func(p_parse_cb);
              var arr = [];
              obj.response.headers.forEach(function (v, h) {
                arr.push("".concat(h, ":").concat(v));
              });
              var c_ptr = GodotRuntime.allocStringArray(arr);
              cb(arr.length, c_ptr, p_ref);
              GodotRuntime.freeStringArray(c_ptr, arr.length);
              return 0;
            }
            function _godot_js_fetch_state_get(p_id) {
              var obj = IDHandler.get(p_id);
              if (!obj) {
                return -1;
              }
              if (obj.error) {
                return -1;
              }
              if (!obj.response) {
                return 0;
              }
              if (obj.reader || obj.response.body == null && !obj.done) {
                return 1;
              }
              if (obj.done) {
                return 2;
              }
              return -1;
            }
            var GodotInputGamepads = {
              samples: [],
              get_pads: function get_pads() {
                try {
                  var pads = navigator.getGamepads();
                  if (pads) {
                    return pads;
                  }
                  return [];
                } catch (e) {
                  return [];
                }
              },
              get_samples: function get_samples() {
                return GodotInputGamepads.samples;
              },
              get_sample: function get_sample(index) {
                var samples = GodotInputGamepads.samples;
                return index < samples.length ? samples[index] : null;
              },
              sample: function sample() {
                var pads = GodotInputGamepads.get_pads();
                var samples = [];
                for (var _i10 = 0; _i10 < pads.length; _i10++) {
                  var pad = pads[_i10];
                  if (!pad) {
                    samples.push(null);
                    continue;
                  }
                  var s = {
                    standard: pad.mapping === "standard",
                    buttons: [],
                    axes: [],
                    connected: pad.connected
                  };
                  for (var b = 0; b < pad.buttons.length; b++) {
                    s.buttons.push(pad.buttons[b].value);
                  }
                  for (var a = 0; a < pad.axes.length; a++) {
                    s.axes.push(pad.axes[a]);
                  }
                  samples.push(s);
                }
                GodotInputGamepads.samples = samples;
              },
              init: function init(onchange) {
                GodotInputGamepads.samples = [];
                function add(pad) {
                  var guid = GodotInputGamepads.get_guid(pad);
                  var c_id = GodotRuntime.allocString(pad.id);
                  var c_guid = GodotRuntime.allocString(guid);
                  onchange(pad.index, 1, c_id, c_guid);
                  GodotRuntime.free(c_id);
                  GodotRuntime.free(c_guid);
                }
                var pads = GodotInputGamepads.get_pads();
                for (var _i11 = 0; _i11 < pads.length; _i11++) {
                  if (pads[_i11]) {
                    add(pads[_i11]);
                  }
                }
                GodotEventListeners.add(window, "gamepadconnected", function (evt) {
                  if (evt.gamepad) {
                    add(evt.gamepad);
                  }
                }, false);
                GodotEventListeners.add(window, "gamepaddisconnected", function (evt) {
                  if (evt.gamepad) {
                    onchange(evt.gamepad.index, 0);
                  }
                }, false);
              },
              get_guid: function get_guid(pad) {
                if (pad.mapping) {
                  return pad.mapping;
                }
                var ua = navigator.userAgent;
                var os = "Unknown";
                if (ua.indexOf("Android") >= 0) {
                  os = "Android";
                } else if (ua.indexOf("Linux") >= 0) {
                  os = "Linux";
                } else if (ua.indexOf("iPhone") >= 0) {
                  os = "iOS";
                } else if (ua.indexOf("Macintosh") >= 0) {
                  os = "MacOSX";
                } else if (ua.indexOf("Windows") >= 0) {
                  os = "Windows";
                }
                var id = pad.id;
                var exp1 = /vendor: ([0-9a-f]{4}) product: ([0-9a-f]{4})/i;
                var exp2 = /^([0-9a-f]+)-([0-9a-f]+)-/i;
                var vendor = "";
                var product = "";
                if (exp1.test(id)) {
                  var match = exp1.exec(id);
                  vendor = match[1].padStart(4, "0");
                  product = match[2].padStart(4, "0");
                } else if (exp2.test(id)) {
                  var _match = exp2.exec(id);
                  vendor = _match[1].padStart(4, "0");
                  product = _match[2].padStart(4, "0");
                }
                if (!vendor || !product) {
                  return "".concat(os, "Unknown");
                }
                return os + vendor + product;
              }
            };
            var GodotInputDragDrop = {
              promises: [],
              pending_files: [],
              add_entry: function add_entry(entry) {
                if (entry.isDirectory) {
                  GodotInputDragDrop.add_dir(entry);
                } else if (entry.isFile) {
                  GodotInputDragDrop.add_file(entry);
                } else {
                  GodotRuntime.error("Unrecognized entry...", entry);
                }
              },
              add_dir: function add_dir(entry) {
                GodotInputDragDrop.promises.push(new Promise(function (resolve, reject) {
                  var reader = entry.createReader();
                  reader.readEntries(function (entries) {
                    for (var _i12 = 0; _i12 < entries.length; _i12++) {
                      GodotInputDragDrop.add_entry(entries[_i12]);
                    }
                    resolve();
                  });
                }));
              },
              add_file: function add_file(entry) {
                GodotInputDragDrop.promises.push(new Promise(function (resolve, reject) {
                  entry.file(function (file) {
                    var reader = new FileReader();
                    reader.onload = function () {
                      var f = {
                        path: file.relativePath || file.webkitRelativePath,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result
                      };
                      if (!f["path"]) {
                        f["path"] = f["name"];
                      }
                      GodotInputDragDrop.pending_files.push(f);
                      resolve();
                    };
                    reader.onerror = function () {
                      GodotRuntime.print("Error reading file");
                      reject();
                    };
                    reader.readAsArrayBuffer(file);
                  }, function (err) {
                    GodotRuntime.print("Error!");
                    reject();
                  });
                }));
              },
              process: function process(resolve, reject) {
                if (GodotInputDragDrop.promises.length === 0) {
                  resolve();
                  return;
                }
                GodotInputDragDrop.promises.pop().then(function () {
                  setTimeout(function () {
                    GodotInputDragDrop.process(resolve, reject);
                  }, 0);
                });
              },
              _process_event: function _process_event(ev, callback) {
                ev.preventDefault();
                if (ev.dataTransfer.items) {
                  for (var _i13 = 0; _i13 < ev.dataTransfer.items.length; _i13++) {
                    var item = ev.dataTransfer.items[_i13];
                    var entry = null;
                    if ("getAsEntry" in item) {
                      entry = item.getAsEntry();
                    } else if ("webkitGetAsEntry" in item) {
                      entry = item.webkitGetAsEntry();
                    }
                    if (entry) {
                      GodotInputDragDrop.add_entry(entry);
                    }
                  }
                } else {
                  GodotRuntime.error("File upload not supported");
                }
                new Promise(GodotInputDragDrop.process).then(function () {
                  var DROP = "/tmp/drop-".concat(parseInt(Math.random() * (1 << 30), 10), "/");
                  var drops = [];
                  var files = [];
                  FS.mkdir(DROP.slice(0, -1));
                  GodotInputDragDrop.pending_files.forEach(function (elem) {
                    var path = elem["path"];
                    GodotFS.copy_to_fs(DROP + path, elem["data"]);
                    var idx = path.indexOf("/");
                    if (idx === -1) {
                      drops.push(DROP + path);
                    } else {
                      var sub = path.substr(0, idx);
                      idx = sub.indexOf("/");
                      if (idx < 0 && drops.indexOf(DROP + sub) === -1) {
                        drops.push(DROP + sub);
                      }
                    }
                    files.push(DROP + path);
                  });
                  GodotInputDragDrop.promises = [];
                  GodotInputDragDrop.pending_files = [];
                  callback(drops);
                  if (GodotConfig.persistent_drops) {
                    GodotOS.atexit(function (resolve, reject) {
                      GodotInputDragDrop.remove_drop(files, DROP);
                      resolve();
                    });
                  } else {
                    GodotInputDragDrop.remove_drop(files, DROP);
                  }
                });
              },
              remove_drop: function remove_drop(files, drop_path) {
                var dirs = [drop_path.substr(0, drop_path.length - 1)];
                files.forEach(function (file) {
                  FS.unlink(file);
                  var dir = file.replace(drop_path, "");
                  var idx = dir.lastIndexOf("/");
                  while (idx > 0) {
                    dir = dir.substr(0, idx);
                    if (dirs.indexOf(drop_path + dir) === -1) {
                      dirs.push(drop_path + dir);
                    }
                    idx = dir.lastIndexOf("/");
                  }
                });
                dirs.sort(function (a, b) {
                  var al = (a.match(/\//g) || []).length;
                  var bl = (b.match(/\//g) || []).length;
                  if (al > bl) {
                    return -1;
                  } else if (al < bl) {
                    return 1;
                  }
                  return 0;
                }).forEach(function (dir) {
                  FS.rmdir(dir);
                });
              },
              handler: function handler(callback) {
                return function (ev) {
                  GodotInputDragDrop._process_event(ev, callback);
                };
              }
            };
            var GodotIME = {
              ime: null,
              active: false,
              focusTimerIntervalId: -1,
              getModifiers: function getModifiers(evt) {
                return evt.shiftKey + 0 + (evt.altKey + 0 << 1) + (evt.ctrlKey + 0 << 2) + (evt.metaKey + 0 << 3);
              },
              ime_active: function ime_active(active) {
                function clearFocusTimerInterval() {
                  clearInterval(GodotIME.focusTimerIntervalId);
                  GodotIME.focusTimerIntervalId = -1;
                }
                function focusTimer() {
                  if (GodotIME.ime == null) {
                    clearFocusTimerInterval();
                    return;
                  }
                  GodotIME.ime.focus();
                }
                if (GodotIME.focusTimerIntervalId > -1) {
                  clearFocusTimerInterval();
                }
                if (GodotIME.ime == null) {
                  return;
                }
                GodotIME.active = active;
                if (active) {
                  GodotIME.ime.style.display = "block";
                  GodotIME.focusTimerIntervalId = setInterval(focusTimer, 100);
                } else {
                  GodotIME.ime.style.display = "none";
                  GodotConfig.canvas.focus();
                }
              },
              ime_position: function ime_position(x, y) {
                if (GodotIME.ime == null) {
                  return;
                }
                var canvas = GodotConfig.canvas;
                var rect = canvas.getBoundingClientRect();
                var rw = canvas.width / rect.width;
                var rh = canvas.height / rect.height;
                var clx = x / rw + rect.x;
                var cly = y / rh + rect.y;
                GodotIME.ime.style.left = "".concat(clx, "px");
                GodotIME.ime.style.top = "".concat(cly, "px");
              },
              init: function init(ime_cb, key_cb, code, key) {
                function key_event_cb(pressed, evt) {
                  var modifiers = GodotIME.getModifiers(evt);
                  GodotRuntime.stringToHeap(evt.code, code, 32);
                  GodotRuntime.stringToHeap(evt.key, key, 32);
                  key_cb(pressed, evt.repeat, modifiers);
                  evt.preventDefault();
                }
                function ime_event_cb(event) {
                  if (GodotIME.ime == null) {
                    return;
                  }
                  switch (event.type) {
                    case "compositionstart":
                      ime_cb(0, null);
                      GodotIME.ime.innerHTML = "";
                      break;
                    case "compositionupdate":
                      {
                        var ptr = GodotRuntime.allocString(event.data);
                        ime_cb(1, ptr);
                        GodotRuntime.free(ptr);
                      }
                      break;
                    case "compositionend":
                      {
                        var _ptr = GodotRuntime.allocString(event.data);
                        ime_cb(2, _ptr);
                        GodotRuntime.free(_ptr);
                        GodotIME.ime.innerHTML = "";
                      }
                      break;
                    default:
                  }
                }
                var ime = document.createElement("div");
                ime.className = "ime";
                ime.style.background = "none";
                ime.style.opacity = 0;
                ime.style.position = "fixed";
                ime.style.textAlign = "left";
                ime.style.fontSize = "1px";
                ime.style.left = "0px";
                ime.style.top = "0px";
                ime.style.width = "100%";
                ime.style.height = "40px";
                ime.style.pointerEvents = "none";
                ime.style.display = "none";
                ime.contentEditable = "true";
                GodotEventListeners.add(ime, "compositionstart", ime_event_cb, false);
                GodotEventListeners.add(ime, "compositionupdate", ime_event_cb, false);
                GodotEventListeners.add(ime, "compositionend", ime_event_cb, false);
                GodotEventListeners.add(ime, "keydown", key_event_cb.bind(null, 1), false);
                GodotEventListeners.add(ime, "keyup", key_event_cb.bind(null, 0), false);
                ime.onblur = function () {
                  this.style.display = "none";
                  GodotConfig.canvas.focus();
                  GodotIME.active = false;
                };
                GodotConfig.canvas.parentElement.appendChild(ime);
                GodotIME.ime = ime;
              },
              clear: function clear() {
                if (GodotIME.ime == null) {
                  return;
                }
                if (GodotIME.focusTimerIntervalId > -1) {
                  clearInterval(GodotIME.focusTimerIntervalId);
                  GodotIME.focusTimerIntervalId = -1;
                }
                GodotIME.ime.remove();
                GodotIME.ime = null;
              }
            };
            var GodotInput = {
              getModifiers: function getModifiers(evt) {
                return evt.shiftKey + 0 + (evt.altKey + 0 << 1) + (evt.ctrlKey + 0 << 2) + (evt.metaKey + 0 << 3);
              },
              computePosition: function computePosition(evt, rect) {
                var canvas = GodotConfig.canvas;
                var rw = canvas.width / rect.width;
                var rh = canvas.height / rect.height;
                var x = (evt.clientX - rect.x) * rw;
                var y = (evt.clientY - rect.y) * rh;
                return [x, y];
              }
            };
            function _godot_js_input_drop_files_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              var dropFiles = function dropFiles(files) {
                var args = files || [];
                if (!args.length) {
                  return;
                }
                var argc = args.length;
                var argv = GodotRuntime.allocStringArray(args);
                func(argv, argc);
                GodotRuntime.freeStringArray(argv, argc);
              };
              var canvas = GodotConfig.canvas;
              GodotEventListeners.add(canvas, "dragover", function (ev) {
                ev.preventDefault();
              }, false);
              GodotEventListeners.add(canvas, "drop", GodotInputDragDrop.handler(dropFiles));
            }
            function _godot_js_input_gamepad_cb(change_cb) {
              var onchange = GodotRuntime.get_func(change_cb);
              GodotInputGamepads.init(onchange);
            }
            function _godot_js_input_gamepad_sample() {
              GodotInputGamepads.sample();
              return 0;
            }
            function _godot_js_input_gamepad_sample_count() {
              return GodotInputGamepads.get_samples().length;
            }
            function _godot_js_input_gamepad_sample_get(p_index, r_btns, r_btns_num, r_axes, r_axes_num, r_standard) {
              var sample = GodotInputGamepads.get_sample(p_index);
              if (!sample || !sample.connected) {
                return 1;
              }
              var btns = sample.buttons;
              var btns_len = btns.length < 16 ? btns.length : 16;
              for (var _i14 = 0; _i14 < btns_len; _i14++) {
                GodotRuntime.setHeapValue(r_btns + (_i14 << 2), btns[_i14], "float");
              }
              GodotRuntime.setHeapValue(r_btns_num, btns_len, "i32");
              var axes = sample.axes;
              var axes_len = axes.length < 10 ? axes.length : 10;
              for (var _i15 = 0; _i15 < axes_len; _i15++) {
                GodotRuntime.setHeapValue(r_axes + (_i15 << 2), axes[_i15], "float");
              }
              GodotRuntime.setHeapValue(r_axes_num, axes_len, "i32");
              var is_standard = sample.standard ? 1 : 0;
              GodotRuntime.setHeapValue(r_standard, is_standard, "i32");
              return 0;
            }
            function _godot_js_input_key_cb(callback, code, key) {
              var func = GodotRuntime.get_func(callback);
              function key_cb(pressed, evt) {
                var modifiers = GodotInput.getModifiers(evt);
                GodotRuntime.stringToHeap(evt.code, code, 32);
                GodotRuntime.stringToHeap(evt.key, key, 32);
                func(pressed, evt.repeat, modifiers);
                evt.preventDefault();
              }
              GodotEventListeners.add(GodotConfig.canvas, "keydown", key_cb.bind(null, 1), false);
              GodotEventListeners.add(GodotConfig.canvas, "keyup", key_cb.bind(null, 0), false);
            }
            function _godot_js_input_mouse_button_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              var canvas = GodotConfig.canvas;
              function button_cb(p_pressed, evt) {
                var rect = canvas.getBoundingClientRect();
                var pos = GodotInput.computePosition(evt, rect);
                var modifiers = GodotInput.getModifiers(evt);
                if (p_pressed) {
                  GodotConfig.canvas.focus();
                }
                if (func(p_pressed, evt.button, pos[0], pos[1], modifiers)) {
                  evt.preventDefault();
                }
              }
              GodotEventListeners.add(canvas, "mousedown", button_cb.bind(null, 1), false);
              GodotEventListeners.add(window, "mouseup", button_cb.bind(null, 0), false);
            }
            function _godot_js_input_mouse_move_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              var canvas = GodotConfig.canvas;
              function move_cb(evt) {
                var rect = canvas.getBoundingClientRect();
                var pos = GodotInput.computePosition(evt, rect);
                var rw = canvas.width / rect.width;
                var rh = canvas.height / rect.height;
                var rel_pos_x = evt.movementX * rw;
                var rel_pos_y = evt.movementY * rh;
                var modifiers = GodotInput.getModifiers(evt);
                func(pos[0], pos[1], rel_pos_x, rel_pos_y, modifiers);
              }
              GodotEventListeners.add(window, "mousemove", move_cb, false);
            }
            function _godot_js_input_mouse_wheel_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              function wheel_cb(evt) {
                if (func(evt["deltaX"] || 0, evt["deltaY"] || 0)) {
                  evt.preventDefault();
                }
              }
              GodotEventListeners.add(GodotConfig.canvas, "wheel", wheel_cb, false);
            }
            function _godot_js_input_paste_cb(callback) {
              var func = GodotRuntime.get_func(callback);
              GodotEventListeners.add(window, "paste", function (evt) {
                var text = evt.clipboardData.getData("text");
                var ptr = GodotRuntime.allocString(text);
                func(ptr);
                GodotRuntime.free(ptr);
              }, false);
            }
            function _godot_js_input_touch_cb(callback, ids, coords) {
              var func = GodotRuntime.get_func(callback);
              var canvas = GodotConfig.canvas;
              function touch_cb(type, evt) {
                if (type === 0) {
                  GodotConfig.canvas.focus();
                }
                var rect = canvas.getBoundingClientRect();
                var touches = evt.changedTouches;
                for (var _i16 = 0; _i16 < touches.length; _i16++) {
                  var touch = touches[_i16];
                  var pos = GodotInput.computePosition(touch, rect);
                  GodotRuntime.setHeapValue(coords + _i16 * 2 * 8, pos[0], "double");
                  GodotRuntime.setHeapValue(coords + (_i16 * 2 + 1) * 8, pos[1], "double");
                  GodotRuntime.setHeapValue(ids + _i16 * 4, touch.identifier, "i32");
                }
                func(type, touches.length);
                if (evt.cancelable) {
                  evt.preventDefault();
                }
              }
              GodotEventListeners.add(canvas, "touchstart", touch_cb.bind(null, 0), false);
              GodotEventListeners.add(canvas, "touchend", touch_cb.bind(null, 1), false);
              GodotEventListeners.add(canvas, "touchcancel", touch_cb.bind(null, 1), false);
              GodotEventListeners.add(canvas, "touchmove", touch_cb.bind(null, 2), false);
            }
            function _godot_js_input_vibrate_handheld(p_duration_ms) {
              if (typeof navigator.vibrate !== "function") {
                GodotRuntime.print("This browser does not support vibration.");
              } else {
                navigator.vibrate(p_duration_ms);
              }
            }
            function _godot_js_is_ime_focused() {
              return GodotIME.active;
            }
            function _godot_js_os_download_buffer(p_ptr, p_size, p_name, p_mime) {
              var buf = GodotRuntime.heapSlice(HEAP8, p_ptr, p_size);
              var name = GodotRuntime.parseString(p_name);
              var mime = GodotRuntime.parseString(p_mime);
              var blob = new Blob([buf], {
                type: mime
              });
              var url = window.URL.createObjectURL(blob);
              var a = document.createElement("a");
              a.href = url;
              a.download = name;
              a.style.display = "none";
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }
            function _godot_js_os_execute(p_json) {
              var json_args = GodotRuntime.parseString(p_json);
              var args = JSON.parse(json_args);
              if (GodotConfig.on_execute) {
                GodotConfig.on_execute(args);
                return 0;
              }
              return 1;
            }
            function _godot_js_os_finish_async(p_callback) {
              var func = GodotRuntime.get_func(p_callback);
              GodotOS.finish_async(func);
            }
            function _godot_js_os_fs_is_persistent() {
              return GodotFS.is_persistent();
            }
            function _godot_js_os_fs_sync(callback) {
              var func = GodotRuntime.get_func(callback);
              GodotOS._fs_sync_promise = GodotFS.sync();
              GodotOS._fs_sync_promise.then(function (err) {
                func();
              });
            }
            function _godot_js_os_has_feature(p_ftr) {
              var ftr = GodotRuntime.parseString(p_ftr);
              var ua = navigator.userAgent;
              if (ftr === "web_macos") {
                return ua.indexOf("Mac") !== -1 ? 1 : 0;
              }
              if (ftr === "web_windows") {
                return ua.indexOf("Windows") !== -1 ? 1 : 0;
              }
              if (ftr === "web_android") {
                return ua.indexOf("Android") !== -1 ? 1 : 0;
              }
              if (ftr === "web_ios") {
                return ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1 || ua.indexOf("iPod") !== -1 ? 1 : 0;
              }
              if (ftr === "web_linuxbsd") {
                return ua.indexOf("CrOS") !== -1 || ua.indexOf("BSD") !== -1 || ua.indexOf("Linux") !== -1 || ua.indexOf("X11") !== -1 ? 1 : 0;
              }
              return 0;
            }
            function _godot_js_os_hw_concurrency_get() {
              var concurrency = navigator.hardwareConcurrency || 1;
              return concurrency < 2 ? concurrency : 2;
            }
            function _godot_js_os_request_quit_cb(p_callback) {
              GodotOS.request_quit = GodotRuntime.get_func(p_callback);
            }
            function _godot_js_os_shell_open(p_uri) {
              window.open(GodotRuntime.parseString(p_uri), "_blank");
            }
            var GodotPWA = {
              hasUpdate: false,
              updateState: function updateState(cb, reg) {
                if (!reg) {
                  return;
                }
                if (!reg.active) {
                  return;
                }
                if (reg.waiting) {
                  GodotPWA.hasUpdate = true;
                  cb();
                }
                GodotEventListeners.add(reg, "updatefound", function () {
                  var installing = reg.installing;
                  GodotEventListeners.add(installing, "statechange", function () {
                    if (installing.state === "installed") {
                      GodotPWA.hasUpdate = true;
                      cb();
                    }
                  });
                });
              }
            };
            function _godot_js_pwa_cb(p_update_cb) {
              if ("serviceWorker" in navigator) {
                try {
                  var cb = GodotRuntime.get_func(p_update_cb);
                  navigator.serviceWorker.getRegistration().then(GodotPWA.updateState.bind(null, cb));
                } catch (e) {
                  GodotRuntime.error("Failed to assign PWA callback", e);
                }
              }
            }
            function _godot_js_pwa_update() {
              if ("serviceWorker" in navigator && GodotPWA.hasUpdate) {
                try {
                  navigator.serviceWorker.getRegistration().then(function (reg) {
                    if (!reg || !reg.waiting) {
                      return;
                    }
                    reg.waiting.postMessage("update");
                  });
                } catch (e) {
                  GodotRuntime.error(e);
                  return 1;
                }
                return 0;
              }
              return 1;
            }
            var GodotRTCDataChannel = {
              connect: function connect(p_id, p_on_open, p_on_message, p_on_error, p_on_close) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                ref.binaryType = "arraybuffer";
                ref.onopen = function (event) {
                  p_on_open();
                };
                ref.onclose = function (event) {
                  p_on_close();
                };
                ref.onerror = function (event) {
                  p_on_error();
                };
                ref.onmessage = function (event) {
                  var buffer;
                  var is_string = 0;
                  if (event.data instanceof ArrayBuffer) {
                    buffer = new Uint8Array(event.data);
                  } else if (event.data instanceof Blob) {
                    GodotRuntime.error("Blob type not supported");
                    return;
                  } else if (typeof event.data === "string") {
                    is_string = 1;
                    var enc = new TextEncoder("utf-8");
                    buffer = new Uint8Array(enc.encode(event.data));
                  } else {
                    GodotRuntime.error("Unknown message type");
                    return;
                  }
                  var len = buffer.length * buffer.BYTES_PER_ELEMENT;
                  var out = GodotRuntime.malloc(len);
                  HEAPU8.set(buffer, out);
                  p_on_message(out, len, is_string);
                  GodotRuntime.free(out);
                };
              },
              close: function close(p_id) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                ref.onopen = null;
                ref.onmessage = null;
                ref.onerror = null;
                ref.onclose = null;
                ref.close();
              },
              get_prop: function get_prop(p_id, p_prop, p_def) {
                var ref = IDHandler.get(p_id);
                return ref && ref[p_prop] !== undefined ? ref[p_prop] : p_def;
              }
            };
            function _godot_js_rtc_datachannel_close(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              GodotRTCDataChannel.close(p_id);
            }
            function _godot_js_rtc_datachannel_connect(p_id, p_ref, p_on_open, p_on_message, p_on_error, p_on_close) {
              var onopen = GodotRuntime.get_func(p_on_open).bind(null, p_ref);
              var onmessage = GodotRuntime.get_func(p_on_message).bind(null, p_ref);
              var onerror = GodotRuntime.get_func(p_on_error).bind(null, p_ref);
              var onclose = GodotRuntime.get_func(p_on_close).bind(null, p_ref);
              GodotRTCDataChannel.connect(p_id, onopen, onmessage, onerror, onclose);
            }
            function _godot_js_rtc_datachannel_destroy(p_id) {
              GodotRTCDataChannel.close(p_id);
              IDHandler.remove(p_id);
            }
            function _godot_js_rtc_datachannel_get_buffered_amount(p_id) {
              return GodotRTCDataChannel.get_prop(p_id, "bufferedAmount", 0);
            }
            function _godot_js_rtc_datachannel_id_get(p_id) {
              return GodotRTCDataChannel.get_prop(p_id, "id", 65535);
            }
            function _godot_js_rtc_datachannel_is_negotiated(p_id) {
              return GodotRTCDataChannel.get_prop(p_id, "negotiated", 65535);
            }
            function _godot_js_rtc_datachannel_is_ordered(p_id) {
              return GodotRTCDataChannel.get_prop(p_id, "ordered", true);
            }
            function _godot_js_rtc_datachannel_label_get(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref || !ref.label) {
                return 0;
              }
              return GodotRuntime.allocString(ref.label);
            }
            function _godot_js_rtc_datachannel_max_packet_lifetime_get(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return 65535;
              }
              if (ref["maxPacketLifeTime"] !== undefined) {
                return ref["maxPacketLifeTime"];
              } else if (ref["maxRetransmitTime"] !== undefined) {
                return ref["maxRetransmitTime"];
              }
              return 65535;
            }
            function _godot_js_rtc_datachannel_max_retransmits_get(p_id) {
              return GodotRTCDataChannel.get_prop(p_id, "maxRetransmits", 65535);
            }
            function _godot_js_rtc_datachannel_protocol_get(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref || !ref.protocol) {
                return 0;
              }
              return GodotRuntime.allocString(ref.protocol);
            }
            function _godot_js_rtc_datachannel_ready_state_get(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return 3;
              }
              switch (ref.readyState) {
                case "connecting":
                  return 0;
                case "open":
                  return 1;
                case "closing":
                  return 2;
                case "closed":
                default:
                  return 3;
              }
            }
            function _godot_js_rtc_datachannel_send(p_id, p_buffer, p_length, p_raw) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return 1;
              }
              var bytes_array = new Uint8Array(p_length);
              for (var _i17 = 0; _i17 < p_length; _i17++) {
                bytes_array[_i17] = GodotRuntime.getHeapValue(p_buffer + _i17, "i8");
              }
              if (p_raw) {
                ref.send(bytes_array.buffer);
              } else {
                var string = new TextDecoder("utf-8").decode(bytes_array);
                ref.send(string);
              }
              return 0;
            }
            var GodotRTCPeerConnection = {
              ConnectionState: {
                "new": 0,
                connecting: 1,
                connected: 2,
                disconnected: 3,
                failed: 4,
                closed: 5
              },
              ConnectionStateCompat: {
                "new": 0,
                checking: 1,
                connected: 2,
                completed: 2,
                disconnected: 3,
                failed: 4,
                closed: 5
              },
              IceGatheringState: {
                "new": 0,
                gathering: 1,
                complete: 2
              },
              SignalingState: {
                stable: 0,
                "have-local-offer": 1,
                "have-remote-offer": 2,
                "have-local-pranswer": 3,
                "have-remote-pranswer": 4,
                closed: 5
              },
              create: function create(config, onConnectionChange, onSignalingChange, onIceGatheringChange, onIceCandidate, onDataChannel) {
                var conn = null;
                try {
                  conn = new RTCPeerConnection(config);
                } catch (e) {
                  GodotRuntime.error(e);
                  return 0;
                }
                var id = IDHandler.add(conn);
                if ("connectionState" in conn && conn["connectionState"] !== undefined) {
                  conn.onconnectionstatechange = function (event) {
                    if (!IDHandler.get(id)) {
                      return;
                    }
                    onConnectionChange(GodotRTCPeerConnection.ConnectionState[conn.connectionState] || 0);
                  };
                } else {
                  conn.oniceconnectionstatechange = function (event) {
                    if (!IDHandler.get(id)) {
                      return;
                    }
                    onConnectionChange(GodotRTCPeerConnection.ConnectionStateCompat[conn.iceConnectionState] || 0);
                  };
                }
                conn.onicegatheringstatechange = function (event) {
                  if (!IDHandler.get(id)) {
                    return;
                  }
                  onIceGatheringChange(GodotRTCPeerConnection.IceGatheringState[conn.iceGatheringState] || 0);
                };
                conn.onsignalingstatechange = function (event) {
                  if (!IDHandler.get(id)) {
                    return;
                  }
                  onSignalingChange(GodotRTCPeerConnection.SignalingState[conn.signalingState] || 0);
                };
                conn.onicecandidate = function (event) {
                  if (!IDHandler.get(id)) {
                    return;
                  }
                  var c = event.candidate;
                  if (!c || !c.candidate) {
                    return;
                  }
                  var candidate_str = GodotRuntime.allocString(c.candidate);
                  var mid_str = GodotRuntime.allocString(c.sdpMid);
                  onIceCandidate(mid_str, c.sdpMLineIndex, candidate_str);
                  GodotRuntime.free(candidate_str);
                  GodotRuntime.free(mid_str);
                };
                conn.ondatachannel = function (event) {
                  if (!IDHandler.get(id)) {
                    return;
                  }
                  var cid = IDHandler.add(event.channel);
                  onDataChannel(cid);
                };
                return id;
              },
              destroy: function destroy(p_id) {
                var conn = IDHandler.get(p_id);
                if (!conn) {
                  return;
                }
                conn.onconnectionstatechange = null;
                conn.oniceconnectionstatechange = null;
                conn.onicegatheringstatechange = null;
                conn.onsignalingstatechange = null;
                conn.onicecandidate = null;
                conn.ondatachannel = null;
                IDHandler.remove(p_id);
              },
              onsession: function onsession(p_id, callback, session) {
                if (!IDHandler.get(p_id)) {
                  return;
                }
                var type_str = GodotRuntime.allocString(session.type);
                var sdp_str = GodotRuntime.allocString(session.sdp);
                callback(type_str, sdp_str);
                GodotRuntime.free(type_str);
                GodotRuntime.free(sdp_str);
              },
              onerror: function onerror(p_id, callback, error) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                GodotRuntime.error(error);
                callback();
              }
            };
            function _godot_js_rtc_pc_close(p_id) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              ref.close();
            }
            function _godot_js_rtc_pc_create(p_config, p_ref, p_on_connection_state_change, p_on_ice_gathering_state_change, p_on_signaling_state_change, p_on_ice_candidate, p_on_datachannel) {
              var wrap = function wrap(p_func) {
                return GodotRuntime.get_func(p_func).bind(null, p_ref);
              };
              return GodotRTCPeerConnection.create(JSON.parse(GodotRuntime.parseString(p_config)), wrap(p_on_connection_state_change), wrap(p_on_signaling_state_change), wrap(p_on_ice_gathering_state_change), wrap(p_on_ice_candidate), wrap(p_on_datachannel));
            }
            function _godot_js_rtc_pc_datachannel_create(p_id, p_label, p_config) {
              try {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return 0;
                }
                var label = GodotRuntime.parseString(p_label);
                var config = JSON.parse(GodotRuntime.parseString(p_config));
                var channel = ref.createDataChannel(label, config);
                return IDHandler.add(channel);
              } catch (e) {
                GodotRuntime.error(e);
                return 0;
              }
            }
            function _godot_js_rtc_pc_destroy(p_id) {
              GodotRTCPeerConnection.destroy(p_id);
            }
            function _godot_js_rtc_pc_ice_candidate_add(p_id, p_mid_name, p_mline_idx, p_sdp) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              var sdpMidName = GodotRuntime.parseString(p_mid_name);
              var sdpName = GodotRuntime.parseString(p_sdp);
              ref.addIceCandidate(new RTCIceCandidate({
                candidate: sdpName,
                sdpMid: sdpMidName,
                sdpMlineIndex: p_mline_idx
              }));
            }
            function _godot_js_rtc_pc_local_description_set(p_id, p_type, p_sdp, p_obj, p_on_error) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              var type = GodotRuntime.parseString(p_type);
              var sdp = GodotRuntime.parseString(p_sdp);
              var onerror = GodotRuntime.get_func(p_on_error).bind(null, p_obj);
              ref.setLocalDescription({
                sdp: sdp,
                type: type
              })["catch"](function (error) {
                GodotRTCPeerConnection.onerror(p_id, onerror, error);
              });
            }
            function _godot_js_rtc_pc_offer_create(p_id, p_obj, p_on_session, p_on_error) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              var onsession = GodotRuntime.get_func(p_on_session).bind(null, p_obj);
              var onerror = GodotRuntime.get_func(p_on_error).bind(null, p_obj);
              ref.createOffer().then(function (session) {
                GodotRTCPeerConnection.onsession(p_id, onsession, session);
              })["catch"](function (error) {
                GodotRTCPeerConnection.onerror(p_id, onerror, error);
              });
            }
            function _godot_js_rtc_pc_remote_description_set(p_id, p_type, p_sdp, p_obj, p_session_created, p_on_error) {
              var ref = IDHandler.get(p_id);
              if (!ref) {
                return;
              }
              var type = GodotRuntime.parseString(p_type);
              var sdp = GodotRuntime.parseString(p_sdp);
              var onerror = GodotRuntime.get_func(p_on_error).bind(null, p_obj);
              var onsession = GodotRuntime.get_func(p_session_created).bind(null, p_obj);
              ref.setRemoteDescription({
                sdp: sdp,
                type: type
              }).then(function () {
                if (type !== "offer") {
                  return Promise.resolve();
                }
                return ref.createAnswer().then(function (session) {
                  GodotRTCPeerConnection.onsession(p_id, onsession, session);
                });
              })["catch"](function (error) {
                GodotRTCPeerConnection.onerror(p_id, onerror, error);
              });
            }
            function _godot_js_set_ime_active(p_active) {
              GodotIME.ime_active(p_active);
            }
            function _godot_js_set_ime_cb(p_ime_cb, p_key_cb, code, key) {
              var ime_cb = GodotRuntime.get_func(p_ime_cb);
              var key_cb = GodotRuntime.get_func(p_key_cb);
              GodotIME.init(ime_cb, key_cb, code, key);
            }
            function _godot_js_set_ime_position(p_x, p_y) {
              GodotIME.ime_position(p_x, p_y);
            }
            function _godot_js_tts_get_voices(p_callback) {
              var func = GodotRuntime.get_func(p_callback);
              try {
                var arr = [];
                var voices = window.speechSynthesis.getVoices();
                for (var _i18 = 0; _i18 < voices.length; _i18++) {
                  arr.push("".concat(voices[_i18].lang, ";").concat(voices[_i18].name));
                }
                var c_ptr = GodotRuntime.allocStringArray(arr);
                func(arr.length, c_ptr);
                GodotRuntime.freeStringArray(c_ptr, arr.length);
              } catch (e) {}
            }
            function _godot_js_tts_is_paused() {
              return window.speechSynthesis.paused;
            }
            function _godot_js_tts_is_speaking() {
              return window.speechSynthesis.speaking;
            }
            function _godot_js_tts_pause() {
              window.speechSynthesis.pause();
            }
            function _godot_js_tts_resume() {
              window.speechSynthesis.resume();
            }
            function _godot_js_tts_speak(p_text, p_voice, p_volume, p_pitch, p_rate, p_utterance_id, p_callback) {
              var func = GodotRuntime.get_func(p_callback);
              function listener_end(evt) {
                evt.currentTarget.cb(1, evt.currentTarget.id, 0);
              }
              function listener_start(evt) {
                evt.currentTarget.cb(0, evt.currentTarget.id, 0);
              }
              function listener_error(evt) {
                evt.currentTarget.cb(2, evt.currentTarget.id, 0);
              }
              function listener_bound(evt) {
                evt.currentTarget.cb(3, evt.currentTarget.id, evt.charIndex);
              }
              var utterance = new SpeechSynthesisUtterance(GodotRuntime.parseString(p_text));
              utterance.rate = p_rate;
              utterance.pitch = p_pitch;
              utterance.volume = p_volume / 100;
              utterance.addEventListener("end", listener_end);
              utterance.addEventListener("start", listener_start);
              utterance.addEventListener("error", listener_error);
              utterance.addEventListener("boundary", listener_bound);
              utterance.id = p_utterance_id;
              utterance.cb = func;
              var voice = GodotRuntime.parseString(p_voice);
              var voices = window.speechSynthesis.getVoices();
              for (var _i19 = 0; _i19 < voices.length; _i19++) {
                if (voices[_i19].name === voice) {
                  utterance.voice = voices[_i19];
                  break;
                }
              }
              window.speechSynthesis.resume();
              window.speechSynthesis.speak(utterance);
            }
            function _godot_js_tts_stop() {
              window.speechSynthesis.cancel();
              window.speechSynthesis.resume();
            }
            var GodotWebMidi = {
              abortControllers: [],
              isListening: false
            };
            function _godot_js_webmidi_close_midi_inputs() {
              var _iterator5 = _createForOfIteratorHelper(GodotWebMidi.abortControllers),
                _step5;
              try {
                for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                  var abortController = _step5.value;
                  abortController.abort();
                }
              } catch (err) {
                _iterator5.e(err);
              } finally {
                _iterator5.f();
              }
              GodotWebMidi.abortControllers = [];
              GodotWebMidi.isListening = false;
            }
            function _godot_js_webmidi_open_midi_inputs(pSetInputNamesCb, pOnMidiMessageCb, pDataBuffer, dataBufferLen) {
              if (GodotWebMidi.is_listening) {
                return 0;
              }
              if (!navigator.requestMIDIAccess) {
                return 2;
              }
              var setInputNamesCb = GodotRuntime.get_func(pSetInputNamesCb);
              var onMidiMessageCb = GodotRuntime.get_func(pOnMidiMessageCb);
              GodotWebMidi.isListening = true;
              navigator.requestMIDIAccess().then(function (midi) {
                var inputs = _toConsumableArray(midi.inputs.values());
                var inputNames = inputs.map(function (input) {
                  return input.name;
                });
                var c_ptr = GodotRuntime.allocStringArray(inputNames);
                setInputNamesCb(inputNames.length, c_ptr);
                GodotRuntime.freeStringArray(c_ptr, inputNames.length);
                inputs.forEach(function (input, i) {
                  var abortController = new AbortController();
                  GodotWebMidi.abortControllers.push(abortController);
                  input.addEventListener("midimessage", function (event) {
                    var status = event.data[0];
                    var data = event.data.slice(1);
                    var size = data.length;
                    if (size > dataBufferLen) {
                      throw new Error("data too big ".concat(size, " > ").concat(dataBufferLen));
                    }
                    HEAPU8.set(data, pDataBuffer);
                    onMidiMessageCb(i, status, pDataBuffer, data.length);
                  }, {
                    signal: abortController.signal
                  });
                });
              });
              return 0;
            }
            var GodotWebSocket = {
              _onopen: function _onopen(p_id, callback, event) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                var c_str = GodotRuntime.allocString(ref.protocol);
                callback(c_str);
                GodotRuntime.free(c_str);
              },
              _onmessage: function _onmessage(p_id, callback, event) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                var buffer;
                var is_string = 0;
                if (event.data instanceof ArrayBuffer) {
                  buffer = new Uint8Array(event.data);
                } else if (event.data instanceof Blob) {
                  GodotRuntime.error("Blob type not supported");
                  return;
                } else if (typeof event.data === "string") {
                  is_string = 1;
                  var enc = new TextEncoder("utf-8");
                  buffer = new Uint8Array(enc.encode(event.data));
                } else {
                  GodotRuntime.error("Unknown message type");
                  return;
                }
                var len = buffer.length * buffer.BYTES_PER_ELEMENT;
                var out = GodotRuntime.malloc(len);
                HEAPU8.set(buffer, out);
                callback(out, len, is_string);
                GodotRuntime.free(out);
              },
              _onerror: function _onerror(p_id, callback, event) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                callback();
              },
              _onclose: function _onclose(p_id, callback, event) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                var c_str = GodotRuntime.allocString(event.reason);
                callback(event.code, c_str, event.wasClean ? 1 : 0);
                GodotRuntime.free(c_str);
              },
              send: function send(p_id, p_data) {
                var ref = IDHandler.get(p_id);
                if (!ref || ref.readyState !== ref.OPEN) {
                  return 1;
                }
                ref.send(p_data);
                return 0;
              },
              bufferedAmount: function bufferedAmount(p_id) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return 0;
                }
                return ref.bufferedAmount;
              },
              create: function create(socket, p_on_open, p_on_message, p_on_error, p_on_close) {
                var id = IDHandler.add(socket);
                socket.onopen = GodotWebSocket._onopen.bind(null, id, p_on_open);
                socket.onmessage = GodotWebSocket._onmessage.bind(null, id, p_on_message);
                socket.onerror = GodotWebSocket._onerror.bind(null, id, p_on_error);
                socket.onclose = GodotWebSocket._onclose.bind(null, id, p_on_close);
                return id;
              },
              close: function close(p_id, p_code, p_reason) {
                var ref = IDHandler.get(p_id);
                if (ref && ref.readyState < ref.CLOSING) {
                  var code = p_code;
                  var reason = p_reason;
                  ref.close(code, reason);
                }
              },
              destroy: function destroy(p_id) {
                var ref = IDHandler.get(p_id);
                if (!ref) {
                  return;
                }
                GodotWebSocket.close(p_id, 3001, "destroyed");
                IDHandler.remove(p_id);
                ref.onopen = null;
                ref.onmessage = null;
                ref.onerror = null;
                ref.onclose = null;
              }
            };
            function _godot_js_websocket_buffered_amount(p_id) {
              return GodotWebSocket.bufferedAmount(p_id);
            }
            function _godot_js_websocket_close(p_id, p_code, p_reason) {
              var code = p_code;
              var reason = GodotRuntime.parseString(p_reason);
              GodotWebSocket.close(p_id, code, reason);
            }
            function _godot_js_websocket_create(p_ref, p_url, p_proto, p_on_open, p_on_message, p_on_error, p_on_close) {
              var on_open = GodotRuntime.get_func(p_on_open).bind(null, p_ref);
              var on_message = GodotRuntime.get_func(p_on_message).bind(null, p_ref);
              var on_error = GodotRuntime.get_func(p_on_error).bind(null, p_ref);
              var on_close = GodotRuntime.get_func(p_on_close).bind(null, p_ref);
              var url = GodotRuntime.parseString(p_url);
              var protos = GodotRuntime.parseString(p_proto);
              var socket = null;
              try {
                if (protos) {
                  socket = new WebSocket(url, protos.split(","));
                } else {
                  socket = new WebSocket(url);
                }
              } catch (e) {
                return 0;
              }
              socket.binaryType = "arraybuffer";
              return GodotWebSocket.create(socket, on_open, on_message, on_error, on_close);
            }
            function _godot_js_websocket_destroy(p_id) {
              GodotWebSocket.destroy(p_id);
            }
            function _godot_js_websocket_send(p_id, p_buf, p_buf_len, p_raw) {
              var bytes_array = new Uint8Array(p_buf_len);
              var i = 0;
              for (i = 0; i < p_buf_len; i++) {
                bytes_array[i] = GodotRuntime.getHeapValue(p_buf + i, "i8");
              }
              var out = bytes_array.buffer;
              if (!p_raw) {
                out = new TextDecoder("utf-8").decode(bytes_array);
              }
              return GodotWebSocket.send(p_id, out);
            }
            var GodotJSWrapper = {
              proxies: null,
              cb_ret: null,
              MyProxy: function MyProxy(val) {
                var id = IDHandler.add(this);
                GodotJSWrapper.proxies.set(val, id);
                var refs = 1;
                this.ref = function () {
                  refs++;
                };
                this.unref = function () {
                  refs--;
                  if (refs === 0) {
                    IDHandler.remove(id);
                    GodotJSWrapper.proxies["delete"](val);
                  }
                };
                this.get_val = function () {
                  return val;
                };
                this.get_id = function () {
                  return id;
                };
              },
              get_proxied: function get_proxied(val) {
                var id = GodotJSWrapper.proxies.get(val);
                if (id === undefined) {
                  var proxy = new GodotJSWrapper.MyProxy(val);
                  return proxy.get_id();
                }
                IDHandler.get(id).ref();
                return id;
              },
              get_proxied_value: function get_proxied_value(id) {
                var proxy = IDHandler.get(id);
                if (proxy === undefined) {
                  return undefined;
                }
                return proxy.get_val();
              },
              variant2js: function variant2js(type, val) {
                switch (type) {
                  case 0:
                    return null;
                  case 1:
                    return Boolean(GodotRuntime.getHeapValue(val, "i64"));
                  case 2:
                    {
                      var heap_value = GodotRuntime.getHeapValue(val, "i64");
                      return heap_value >= Number.MIN_SAFE_INTEGER && heap_value <= Number.MAX_SAFE_INTEGER ? Number(heap_value) : heap_value;
                    }
                  case 3:
                    return Number(GodotRuntime.getHeapValue(val, "double"));
                  case 4:
                    return GodotRuntime.parseString(GodotRuntime.getHeapValue(val, "*"));
                  case 24:
                    return GodotJSWrapper.get_proxied_value(GodotRuntime.getHeapValue(val, "i64"));
                  default:
                    return undefined;
                }
              },
              js2variant: function js2variant(p_val, p_exchange) {
                if (p_val === undefined || p_val === null) {
                  return 0;
                }
                var type = _typeof(p_val);
                if (type === "boolean") {
                  GodotRuntime.setHeapValue(p_exchange, p_val, "i64");
                  return 1;
                } else if (type === "number") {
                  if (Number.isInteger(p_val)) {
                    GodotRuntime.setHeapValue(p_exchange, p_val, "i64");
                    return 2;
                  }
                  GodotRuntime.setHeapValue(p_exchange, p_val, "double");
                  return 3;
                } else if (type === "bigint") {
                  GodotRuntime.setHeapValue(p_exchange, p_val, "i64");
                  return 2;
                } else if (type === "string") {
                  var c_str = GodotRuntime.allocString(p_val);
                  GodotRuntime.setHeapValue(p_exchange, c_str, "*");
                  return 4;
                }
                var id = GodotJSWrapper.get_proxied(p_val);
                GodotRuntime.setHeapValue(p_exchange, id, "i64");
                return 24;
              },
              isBuffer: function isBuffer(obj) {
                return obj instanceof ArrayBuffer || ArrayBuffer.isView(obj);
              }
            };
            function _godot_js_wrapper_create_cb(p_ref, p_func) {
              var func = GodotRuntime.get_func(p_func);
              var id = 0;
              var cb = function cb() {
                if (!GodotJSWrapper.get_proxied_value(id)) {
                  return undefined;
                }
                GodotJSWrapper.cb_ret = null;
                var args = Array.from(arguments);
                var argsProxy = new GodotJSWrapper.MyProxy(args);
                func(p_ref, argsProxy.get_id(), args.length);
                argsProxy.unref();
                var ret = GodotJSWrapper.cb_ret;
                GodotJSWrapper.cb_ret = null;
                return ret;
              };
              id = GodotJSWrapper.get_proxied(cb);
              return id;
            }
            function _godot_js_wrapper_create_object(p_object, p_args, p_argc, p_convert_callback, p_exchange, p_lock, p_free_lock_callback) {
              var name = GodotRuntime.parseString(p_object);
              if (typeof window[name] === "undefined") {
                return -1;
              }
              var convert = GodotRuntime.get_func(p_convert_callback);
              var freeLock = GodotRuntime.get_func(p_free_lock_callback);
              var args = new Array(p_argc);
              for (var _i20 = 0; _i20 < p_argc; _i20++) {
                var type = convert(p_args, _i20, p_exchange, p_lock);
                var lock = GodotRuntime.getHeapValue(p_lock, "*");
                args[_i20] = GodotJSWrapper.variant2js(type, p_exchange);
                if (lock) {
                  freeLock(p_lock, type);
                }
              }
              try {
                var res = _construct(window[name], args);
                return GodotJSWrapper.js2variant(res, p_exchange);
              } catch (e) {
                GodotRuntime.error("Error calling constructor ".concat(name, " with args:"), args, "error:", e);
                return -1;
              }
            }
            function _godot_js_wrapper_interface_get(p_name) {
              var name = GodotRuntime.parseString(p_name);
              if (typeof window[name] !== "undefined") {
                return GodotJSWrapper.get_proxied(window[name]);
              }
              return 0;
            }
            function _godot_js_wrapper_object_call(p_id, p_method, p_args, p_argc, p_convert_callback, p_exchange, p_lock, p_free_lock_callback) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (obj === undefined) {
                return -1;
              }
              var method = GodotRuntime.parseString(p_method);
              var convert = GodotRuntime.get_func(p_convert_callback);
              var freeLock = GodotRuntime.get_func(p_free_lock_callback);
              var args = new Array(p_argc);
              for (var _i21 = 0; _i21 < p_argc; _i21++) {
                var type = convert(p_args, _i21, p_exchange, p_lock);
                var lock = GodotRuntime.getHeapValue(p_lock, "*");
                args[_i21] = GodotJSWrapper.variant2js(type, p_exchange);
                if (lock) {
                  freeLock(p_lock, type);
                }
              }
              try {
                var res = obj[method].apply(obj, args);
                return GodotJSWrapper.js2variant(res, p_exchange);
              } catch (e) {
                GodotRuntime.error("Error calling method ".concat(method, " on:"), obj, "error:", e);
                return -1;
              }
            }
            function _godot_js_wrapper_object_get(p_id, p_exchange, p_prop) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (obj === undefined) {
                return 0;
              }
              if (p_prop) {
                var prop = GodotRuntime.parseString(p_prop);
                try {
                  return GodotJSWrapper.js2variant(obj[prop], p_exchange);
                } catch (e) {
                  GodotRuntime.error("Error getting variable ".concat(prop, " on object"), obj);
                  return 0;
                }
              }
              return GodotJSWrapper.js2variant(obj, p_exchange);
            }
            function _godot_js_wrapper_object_getvar(p_id, p_type, p_exchange) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (obj === undefined) {
                return -1;
              }
              var prop = GodotJSWrapper.variant2js(p_type, p_exchange);
              if (prop === undefined || prop === null) {
                return -1;
              }
              try {
                return GodotJSWrapper.js2variant(obj[prop], p_exchange);
              } catch (e) {
                GodotRuntime.error("Error getting variable ".concat(prop, " on object"), obj, e);
                return -1;
              }
            }
            function _godot_js_wrapper_object_is_buffer(p_id) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              return GodotJSWrapper.isBuffer(obj) ? 1 : 0;
            }
            function _godot_js_wrapper_object_set(p_id, p_name, p_type, p_exchange) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (obj === undefined) {
                return;
              }
              var name = GodotRuntime.parseString(p_name);
              try {
                obj[name] = GodotJSWrapper.variant2js(p_type, p_exchange);
              } catch (e) {
                GodotRuntime.error("Error setting variable ".concat(name, " on object"), obj);
              }
            }
            function _godot_js_wrapper_object_set_cb_ret(p_val_type, p_val_ex) {
              GodotJSWrapper.cb_ret = GodotJSWrapper.variant2js(p_val_type, p_val_ex);
            }
            function _godot_js_wrapper_object_setvar(p_id, p_key_type, p_key_ex, p_val_type, p_val_ex) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (obj === undefined) {
                return -1;
              }
              var key = GodotJSWrapper.variant2js(p_key_type, p_key_ex);
              try {
                obj[key] = GodotJSWrapper.variant2js(p_val_type, p_val_ex);
                return 0;
              } catch (e) {
                GodotRuntime.error("Error setting variable ".concat(key, " on object"), obj);
                return -1;
              }
            }
            function _godot_js_wrapper_object_transfer_buffer(p_id, p_byte_arr, p_byte_arr_write, p_callback) {
              var obj = GodotJSWrapper.get_proxied_value(p_id);
              if (!GodotJSWrapper.isBuffer(obj)) {
                return;
              }
              if (ArrayBuffer.isView(obj) && !(obj instanceof Uint8Array)) {
                obj = new Uint8Array(obj.buffer);
              } else if (obj instanceof ArrayBuffer) {
                obj = new Uint8Array(obj);
              }
              var resizePackedByteArrayAndOpenWrite = GodotRuntime.get_func(p_callback);
              var bytesPtr = resizePackedByteArrayAndOpenWrite(p_byte_arr, p_byte_arr_write, obj.length);
              HEAPU8.set(obj, bytesPtr);
            }
            function _godot_js_wrapper_object_unref(p_id) {
              var proxy = IDHandler.get(p_id);
              if (proxy !== undefined) {
                proxy.unref();
              }
            }
            function _godot_webgl2_glFramebufferTextureMultisampleMultiviewOVR(target, attachment, texture, level, samples, base_view_index, num_views) {
              var context = GL.currentContext;
              if (typeof context.oculusMultiviewExt === "undefined") {
                var _ext = context.GLctx.getExtension("OCULUS_multiview");
                if (!_ext) {
                  GodotRuntime.error("Trying to call glFramebufferTextureMultisampleMultiviewOVR() without the OCULUS_multiview extension");
                  return;
                }
                context.oculusMultiviewExt = _ext;
              }
              var ext = context.oculusMultiviewExt;
              ext.framebufferTextureMultisampleMultiviewOVR(target, attachment, GL.textures[texture], level, samples, base_view_index, num_views);
            }
            function _godot_webgl2_glFramebufferTextureMultiviewOVR(target, attachment, texture, level, base_view_index, num_views) {
              var context = GL.currentContext;
              if (typeof context.multiviewExt === "undefined") {
                var _ext2 = context.GLctx.getExtension("OVR_multiview2");
                if (!_ext2) {
                  GodotRuntime.error("Trying to call glFramebufferTextureMultiviewOVR() without the OVR_multiview2 extension");
                  return;
                }
                context.multiviewExt = _ext2;
              }
              var ext = context.multiviewExt;
              ext.framebufferTextureMultiviewOVR(target, attachment, GL.textures[texture], level, base_view_index, num_views);
            }
            function _godot_webgl2_glGetBufferSubData(target, offset, size, data) {
              var gl_context_handle = _emscripten_webgl_get_current_context();
              var gl = GL.getContext(gl_context_handle);
              if (gl) {
                gl.GLctx["getBufferSubData"](target, offset, HEAPU8, data, size);
              }
            }
            var GodotWebXR = {
              gl: null,
              session: null,
              gl_binding: null,
              layer: null,
              space: null,
              frame: null,
              pose: null,
              view_count: 1,
              input_sources: [,,,,,,,,,,,,,,,],
              touches: [,,,,],
              onsimpleevent: null,
              orig_requestAnimationFrame: null,
              requestAnimationFrame: function requestAnimationFrame(callback) {
                if (GodotWebXR.session && GodotWebXR.space) {
                  var onFrame = function onFrame(time, frame) {
                    GodotWebXR.frame = frame;
                    GodotWebXR.pose = frame.getViewerPose(GodotWebXR.space);
                    callback(time);
                    GodotWebXR.frame = null;
                    GodotWebXR.pose = null;
                  };
                  GodotWebXR.session.requestAnimationFrame(onFrame);
                } else {
                  GodotWebXR.orig_requestAnimationFrame(callback);
                }
              },
              monkeyPatchRequestAnimationFrame: function monkeyPatchRequestAnimationFrame(enable) {
                if (GodotWebXR.orig_requestAnimationFrame === null) {
                  GodotWebXR.orig_requestAnimationFrame = Browser.requestAnimationFrame;
                }
                Browser.requestAnimationFrame = enable ? GodotWebXR.requestAnimationFrame : GodotWebXR.orig_requestAnimationFrame;
              },
              pauseResumeMainLoop: function pauseResumeMainLoop() {
                Browser.mainLoop.pause();
                runtimeKeepalivePush();
                window.setTimeout(function () {
                  runtimeKeepalivePop();
                  Browser.mainLoop.resume();
                }, 0);
              },
              getLayer: function getLayer() {
                var new_view_count = GodotWebXR.pose ? GodotWebXR.pose.views.length : 1;
                var layer = GodotWebXR.layer;
                if (layer && GodotWebXR.view_count === new_view_count) {
                  return layer;
                }
                if (!GodotWebXR.session || !GodotWebXR.gl_binding) {
                  return null;
                }
                var gl = GodotWebXR.gl;
                layer = GodotWebXR.gl_binding.createProjectionLayer({
                  textureType: new_view_count > 1 ? "texture-array" : "texture",
                  colorFormat: gl.RGBA8,
                  depthFormat: gl.DEPTH_COMPONENT24
                });
                GodotWebXR.session.updateRenderState({
                  layers: [layer]
                });
                GodotWebXR.layer = layer;
                GodotWebXR.view_count = new_view_count;
                return layer;
              },
              getSubImage: function getSubImage() {
                if (!GodotWebXR.pose) {
                  return null;
                }
                var layer = GodotWebXR.getLayer();
                if (layer === null) {
                  return null;
                }
                return GodotWebXR.gl_binding.getViewSubImage(layer, GodotWebXR.pose.views[0]);
              },
              getTextureId: function getTextureId(texture) {
                if (texture.name !== undefined) {
                  return texture.name;
                }
                var id = GL.getNewId(GL.textures);
                texture.name = id;
                GL.textures[id] = texture;
                return id;
              },
              addInputSource: function addInputSource(input_source) {
                var name = -1;
                if (input_source.targetRayMode === "tracked-pointer" && input_source.handedness === "left") {
                  name = 0;
                } else if (input_source.targetRayMode === "tracked-pointer" && input_source.handedness === "right") {
                  name = 1;
                } else {
                  for (var _i22 = 2; _i22 < 16; _i22++) {
                    if (!GodotWebXR.input_sources[_i22]) {
                      name = _i22;
                      break;
                    }
                  }
                }
                if (name >= 0) {
                  GodotWebXR.input_sources[name] = input_source;
                  input_source.name = name;
                  if (input_source.targetRayMode === "screen") {
                    var touch_index = -1;
                    for (var _i23 = 0; _i23 < 5; _i23++) {
                      if (!GodotWebXR.touches[_i23]) {
                        touch_index = _i23;
                        break;
                      }
                    }
                    if (touch_index >= 0) {
                      GodotWebXR.touches[touch_index] = input_source;
                      input_source.touch_index = touch_index;
                    }
                  }
                }
                return name;
              },
              removeInputSource: function removeInputSource(input_source) {
                if (input_source.name !== undefined) {
                  var name = input_source.name;
                  if (name >= 0 && name < 16) {
                    GodotWebXR.input_sources[name] = null;
                  }
                  if (input_source.touch_index !== undefined) {
                    var touch_index = input_source.touch_index;
                    if (touch_index >= 0 && touch_index < 5) {
                      GodotWebXR.touches[touch_index] = null;
                    }
                  }
                  return name;
                }
                return -1;
              },
              getInputSourceId: function getInputSourceId(input_source) {
                if (input_source !== undefined) {
                  return input_source.name;
                }
                return -1;
              },
              getTouchIndex: function getTouchIndex(input_source) {
                if (input_source.touch_index !== undefined) {
                  return input_source.touch_index;
                }
                return -1;
              }
            };
            function _godot_webxr_get_bounds_geometry(r_points) {
              if (!GodotWebXR.space || !GodotWebXR.space.boundsGeometry) {
                return 0;
              }
              var point_count = GodotWebXR.space.boundsGeometry.length;
              if (point_count === 0) {
                return 0;
              }
              var buf = GodotRuntime.malloc(point_count * 3 * 4);
              for (var _i24 = 0; _i24 < point_count; _i24++) {
                var point = GodotWebXR.space.boundsGeometry[_i24];
                GodotRuntime.setHeapValue(buf + (_i24 * 3 + 0) * 4, point.x, "float");
                GodotRuntime.setHeapValue(buf + (_i24 * 3 + 1) * 4, point.y, "float");
                GodotRuntime.setHeapValue(buf + (_i24 * 3 + 2) * 4, point.z, "float");
              }
              GodotRuntime.setHeapValue(r_points, buf, "i32");
              return point_count;
            }
            function _godot_webxr_get_color_texture() {
              var subimage = GodotWebXR.getSubImage();
              if (subimage === null) {
                return 0;
              }
              return GodotWebXR.getTextureId(subimage.colorTexture);
            }
            function _godot_webxr_get_depth_texture() {
              var subimage = GodotWebXR.getSubImage();
              if (subimage === null) {
                return 0;
              }
              if (!subimage.depthStencilTexture) {
                return 0;
              }
              return GodotWebXR.getTextureId(subimage.depthStencilTexture);
            }
            function _godot_webxr_get_frame_rate() {
              if (!GodotWebXR.session || GodotWebXR.session.frameRate === undefined) {
                return 0;
              }
              return GodotWebXR.session.frameRate;
            }
            function _godot_webxr_get_projection_for_view(p_view, r_transform) {
              if (!GodotWebXR.session || !GodotWebXR.pose) {
                return false;
              }
              var matrix = GodotWebXR.pose.views[p_view].projectionMatrix;
              for (var _i25 = 0; _i25 < 16; _i25++) {
                GodotRuntime.setHeapValue(r_transform + _i25 * 4, matrix[_i25], "float");
              }
              return true;
            }
            function _godot_webxr_get_render_target_size(r_size) {
              var subimage = GodotWebXR.getSubImage();
              if (subimage === null) {
                return false;
              }
              GodotRuntime.setHeapValue(r_size + 0, subimage.viewport.width, "i32");
              GodotRuntime.setHeapValue(r_size + 4, subimage.viewport.height, "i32");
              return true;
            }
            function _godot_webxr_get_supported_frame_rates(r_frame_rates) {
              if (!GodotWebXR.session || GodotWebXR.session.supportedFrameRates === undefined) {
                return 0;
              }
              var frame_rate_count = GodotWebXR.session.supportedFrameRates.length;
              if (frame_rate_count === 0) {
                return 0;
              }
              var buf = GodotRuntime.malloc(frame_rate_count * 4);
              for (var _i26 = 0; _i26 < frame_rate_count; _i26++) {
                GodotRuntime.setHeapValue(buf + _i26 * 4, GodotWebXR.session.supportedFrameRates[_i26], "float");
              }
              GodotRuntime.setHeapValue(r_frame_rates, buf, "i32");
              return frame_rate_count;
            }
            function _godot_webxr_get_transform_for_view(p_view, r_transform) {
              if (!GodotWebXR.session || !GodotWebXR.pose) {
                return false;
              }
              var views = GodotWebXR.pose.views;
              var matrix;
              if (p_view >= 0) {
                matrix = views[p_view].transform.matrix;
              } else {
                matrix = GodotWebXR.pose.transform.matrix;
              }
              for (var _i27 = 0; _i27 < 16; _i27++) {
                GodotRuntime.setHeapValue(r_transform + _i27 * 4, matrix[_i27], "float");
              }
              return true;
            }
            function _godot_webxr_get_velocity_texture() {
              var subimage = GodotWebXR.getSubImage();
              if (subimage === null) {
                return 0;
              }
              if (!subimage.motionVectorTexture) {
                return 0;
              }
              return GodotWebXR.getTextureId(subimage.motionVectorTexture);
            }
            function _godot_webxr_get_view_count() {
              if (!GodotWebXR.session || !GodotWebXR.pose) {
                return 1;
              }
              var view_count = GodotWebXR.pose.views.length;
              return view_count > 0 ? view_count : 1;
            }
            function _godot_webxr_get_visibility_state() {
              if (!GodotWebXR.session || !GodotWebXR.session.visibilityState) {
                return 0;
              }
              return GodotRuntime.allocString(GodotWebXR.session.visibilityState);
            }
            var _godot_webxr_initialize = function _godot_webxr_initialize(p_session_mode, p_required_features, p_optional_features, p_requested_reference_spaces, p_on_session_started, p_on_session_ended, p_on_session_failed, p_on_input_event, p_on_simple_event) {
              GodotWebXR.monkeyPatchRequestAnimationFrame(true);
              var session_mode = GodotRuntime.parseString(p_session_mode);
              var required_features = GodotRuntime.parseString(p_required_features).split(",").map(function (s) {
                return s.trim();
              }).filter(function (s) {
                return s !== "";
              });
              var optional_features = GodotRuntime.parseString(p_optional_features).split(",").map(function (s) {
                return s.trim();
              }).filter(function (s) {
                return s !== "";
              });
              var requested_reference_space_types = GodotRuntime.parseString(p_requested_reference_spaces).split(",").map(function (s) {
                return s.trim();
              });
              var onstarted = GodotRuntime.get_func(p_on_session_started);
              var onended = GodotRuntime.get_func(p_on_session_ended);
              var onfailed = GodotRuntime.get_func(p_on_session_failed);
              var oninputevent = GodotRuntime.get_func(p_on_input_event);
              var onsimpleevent = GodotRuntime.get_func(p_on_simple_event);
              var session_init = {};
              if (required_features.length > 0) {
                session_init["requiredFeatures"] = required_features;
              }
              if (optional_features.length > 0) {
                session_init["optionalFeatures"] = optional_features;
              }
              navigator.xr.requestSession(session_mode, session_init).then(function (session) {
                GodotWebXR.session = session;
                session.addEventListener("end", function (evt) {
                  onended();
                });
                session.addEventListener("inputsourceschange", function (evt) {
                  evt.added.forEach(GodotWebXR.addInputSource);
                  evt.removed.forEach(GodotWebXR.removeInputSource);
                });
                ["selectstart", "selectend", "squeezestart", "squeezeend"].forEach(function (input_event, index) {
                  session.addEventListener(input_event, function (evt) {
                    GodotWebXR.frame = evt.frame;
                    oninputevent(index, GodotWebXR.getInputSourceId(evt.inputSource));
                    GodotWebXR.frame = null;
                  });
                });
                session.addEventListener("visibilitychange", function (evt) {
                  var c_str = GodotRuntime.allocString("visibility_state_changed");
                  onsimpleevent(c_str);
                  GodotRuntime.free(c_str);
                });
                GodotWebXR.onsimpleevent = onsimpleevent;
                var gl_context_handle = _emscripten_webgl_get_current_context();
                var gl = GL.getContext(gl_context_handle).GLctx;
                GodotWebXR.gl = gl;
                gl.makeXRCompatible().then(function () {
                  GodotWebXR.gl_binding = new XRWebGLBinding(session, gl);
                  GodotWebXR.getLayer();
                  function onReferenceSpaceSuccess(reference_space, reference_space_type) {
                    GodotWebXR.space = reference_space;
                    reference_space.onreset = function (evt) {
                      var c_str = GodotRuntime.allocString("reference_space_reset");
                      onsimpleevent(c_str);
                      GodotRuntime.free(c_str);
                    };
                    GodotWebXR.pauseResumeMainLoop();
                    window.setTimeout(function () {
                      var reference_space_c_str = GodotRuntime.allocString(reference_space_type);
                      var enabled_features = "enabledFeatures" in session ? Array.from(session.enabledFeatures) : [];
                      var enabled_features_c_str = GodotRuntime.allocString(enabled_features.join(","));
                      var environment_blend_mode = "environmentBlendMode" in session ? session.environmentBlendMode : "";
                      var environment_blend_mode_c_str = GodotRuntime.allocString(environment_blend_mode);
                      onstarted(reference_space_c_str, enabled_features_c_str, environment_blend_mode_c_str);
                      GodotRuntime.free(reference_space_c_str);
                      GodotRuntime.free(enabled_features_c_str);
                      GodotRuntime.free(environment_blend_mode_c_str);
                    }, 0);
                  }
                  function requestReferenceSpace() {
                    var reference_space_type = requested_reference_space_types.shift();
                    session.requestReferenceSpace(reference_space_type).then(function (refSpace) {
                      onReferenceSpaceSuccess(refSpace, reference_space_type);
                    })["catch"](function () {
                      if (requested_reference_space_types.length === 0) {
                        var c_str = GodotRuntime.allocString("Unable to get any of the requested reference space types");
                        onfailed(c_str);
                        GodotRuntime.free(c_str);
                      } else {
                        requestReferenceSpace();
                      }
                    });
                  }
                  requestReferenceSpace();
                })["catch"](function (error) {
                  var c_str = GodotRuntime.allocString("Unable to make WebGL context compatible with WebXR: ".concat(error));
                  onfailed(c_str);
                  GodotRuntime.free(c_str);
                });
              })["catch"](function (error) {
                var c_str = GodotRuntime.allocString("Unable to start session: ".concat(error));
                onfailed(c_str);
                GodotRuntime.free(c_str);
              });
            };
            function _godot_webxr_is_session_supported(p_session_mode, p_callback) {
              var session_mode = GodotRuntime.parseString(p_session_mode);
              var cb = GodotRuntime.get_func(p_callback);
              if (navigator.xr) {
                navigator.xr.isSessionSupported(session_mode).then(function (supported) {
                  var c_str = GodotRuntime.allocString(session_mode);
                  cb(c_str, supported ? 1 : 0);
                  GodotRuntime.free(c_str);
                });
              } else {
                var c_str = GodotRuntime.allocString(session_mode);
                cb(c_str, 0);
                GodotRuntime.free(c_str);
              }
            }
            function _godot_webxr_is_supported() {
              return !!navigator.xr;
            }
            var _godot_webxr_uninitialize = function _godot_webxr_uninitialize() {
              if (GodotWebXR.session) {
                GodotWebXR.session.end()["catch"](function (e) {});
              }
              GodotWebXR.session = null;
              GodotWebXR.gl_binding = null;
              GodotWebXR.layer = null;
              GodotWebXR.space = null;
              GodotWebXR.frame = null;
              GodotWebXR.pose = null;
              GodotWebXR.view_count = 1;
              GodotWebXR.input_sources = new Array(16);
              GodotWebXR.touches = new Array(5);
              GodotWebXR.onsimpleevent = null;
              GodotWebXR.monkeyPatchRequestAnimationFrame(false);
              GodotWebXR.pauseResumeMainLoop();
            };
            function _godot_webxr_update_input_source(p_input_source_id, r_target_pose, r_target_ray_mode, r_touch_index, r_has_grip_pose, r_grip_pose, r_has_standard_mapping, r_button_count, r_buttons, r_axes_count, r_axes, r_has_hand_data, r_hand_joints, r_hand_radii) {
              if (!GodotWebXR.session || !GodotWebXR.frame) {
                return 0;
              }
              if (p_input_source_id < 0 || p_input_source_id >= GodotWebXR.input_sources.length || !GodotWebXR.input_sources[p_input_source_id]) {
                return false;
              }
              var input_source = GodotWebXR.input_sources[p_input_source_id];
              var frame = GodotWebXR.frame;
              var space = GodotWebXR.space;
              var target_pose = frame.getPose(input_source.targetRaySpace, space);
              if (!target_pose) {
                return false;
              }
              var target_pose_matrix = target_pose.transform.matrix;
              for (var _i28 = 0; _i28 < 16; _i28++) {
                GodotRuntime.setHeapValue(r_target_pose + _i28 * 4, target_pose_matrix[_i28], "float");
              }
              var target_ray_mode = 0;
              switch (input_source.targetRayMode) {
                case "gaze":
                  target_ray_mode = 1;
                  break;
                case "tracked-pointer":
                  target_ray_mode = 2;
                  break;
                case "screen":
                  target_ray_mode = 3;
                  break;
                default:
              }
              GodotRuntime.setHeapValue(r_target_ray_mode, target_ray_mode, "i32");
              GodotRuntime.setHeapValue(r_touch_index, GodotWebXR.getTouchIndex(input_source), "i32");
              var has_grip_pose = false;
              if (input_source.gripSpace) {
                var grip_pose = frame.getPose(input_source.gripSpace, space);
                if (grip_pose) {
                  var grip_pose_matrix = grip_pose.transform.matrix;
                  for (var _i29 = 0; _i29 < 16; _i29++) {
                    GodotRuntime.setHeapValue(r_grip_pose + _i29 * 4, grip_pose_matrix[_i29], "float");
                  }
                  has_grip_pose = true;
                }
              }
              GodotRuntime.setHeapValue(r_has_grip_pose, has_grip_pose ? 1 : 0, "i32");
              var has_standard_mapping = false;
              var button_count = 0;
              var axes_count = 0;
              if (input_source.gamepad) {
                if (input_source.gamepad.mapping === "xr-standard") {
                  has_standard_mapping = true;
                }
                button_count = Math.min(input_source.gamepad.buttons.length, 10);
                for (var _i30 = 0; _i30 < button_count; _i30++) {
                  GodotRuntime.setHeapValue(r_buttons + _i30 * 4, input_source.gamepad.buttons[_i30].value, "float");
                }
                axes_count = Math.min(input_source.gamepad.axes.length, 10);
                for (var _i31 = 0; _i31 < axes_count; _i31++) {
                  GodotRuntime.setHeapValue(r_axes + _i31 * 4, input_source.gamepad.axes[_i31], "float");
                }
              }
              GodotRuntime.setHeapValue(r_has_standard_mapping, has_standard_mapping ? 1 : 0, "i32");
              GodotRuntime.setHeapValue(r_button_count, button_count, "i32");
              GodotRuntime.setHeapValue(r_axes_count, axes_count, "i32");
              var has_hand_data = false;
              if (input_source.hand && r_hand_joints !== 0 && r_hand_radii !== 0) {
                var hand_joint_array = new Float32Array(25 * 16);
                var hand_radii_array = new Float32Array(25);
                if (frame.fillPoses(input_source.hand.values(), space, hand_joint_array) && frame.fillJointRadii(input_source.hand.values(), hand_radii_array)) {
                  GodotRuntime.heapCopy(HEAPF32, hand_joint_array, r_hand_joints);
                  GodotRuntime.heapCopy(HEAPF32, hand_radii_array, r_hand_radii);
                  has_hand_data = true;
                }
              }
              GodotRuntime.setHeapValue(r_has_hand_data, has_hand_data ? 1 : 0, "i32");
              return true;
            }
            function _godot_webxr_update_target_frame_rate(p_frame_rate) {
              if (!GodotWebXR.session || GodotWebXR.session.updateTargetFrameRate === undefined) {
                return;
              }
              GodotWebXR.session.updateTargetFrameRate(p_frame_rate).then(function () {
                var c_str = GodotRuntime.allocString("display_refresh_rate_changed");
                GodotWebXR.onsimpleevent(c_str);
                GodotRuntime.free(c_str);
              });
            }
            var stackAlloc = function stackAlloc(sz) {
              return _emscripten_stack_alloc(sz);
            };
            var stringToUTF8OnStack = function stringToUTF8OnStack(str) {
              var size = lengthBytesUTF8(str) + 1;
              var ret = stackAlloc(size);
              stringToUTF8(str, ret, size);
              return ret;
            };
            var getCFunc = function getCFunc(ident) {
              var func = Module["_" + ident];
              return func;
            };
            var writeArrayToMemory = function writeArrayToMemory(array, buffer) {
              HEAP8.set(array, buffer);
            };
            var stackSave = function stackSave() {
              return _emscripten_stack_get_current2();
            };
            var stackRestore = function stackRestore(val) {
              return _emscripten_stack_restore(val);
            };
            var ccall = function ccall(ident, returnType, argTypes, args, opts) {
              var toC = {
                string: function string(str) {
                  var ret = 0;
                  if (str !== null && str !== undefined && str !== 0) {
                    ret = stringToUTF8OnStack(str);
                  }
                  return ret;
                },
                array: function array(arr) {
                  var ret = stackAlloc(arr.length);
                  writeArrayToMemory(arr, ret);
                  return ret;
                }
              };
              function convertReturnValue(ret) {
                if (returnType === "string") {
                  return UTF8ToString(ret);
                }
                if (returnType === "boolean") return Boolean(ret);
                return ret;
              }
              var func = getCFunc(ident);
              var cArgs = [];
              var stack = 0;
              if (args) {
                for (var i = 0; i < args.length; i++) {
                  var converter = toC[argTypes[i]];
                  if (converter) {
                    if (stack === 0) stack = stackSave();
                    cArgs[i] = converter(args[i]);
                  } else {
                    cArgs[i] = args[i];
                  }
                }
              }
              var ret = func.apply(void 0, cArgs);
              function onDone(ret) {
                if (stack !== 0) stackRestore(stack);
                return convertReturnValue(ret);
              }
              ret = onDone(ret);
              return ret;
            };
            var cwrap = function cwrap(ident, returnType, argTypes, opts) {
              var numericArgs = !argTypes || argTypes.every(function (type) {
                return type === "number" || type === "boolean";
              });
              var numericRet = returnType !== "string";
              if (numericRet && numericArgs && !opts) {
                return getCFunc(ident);
              }
              return function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }
                return ccall(ident, returnType, argTypes, args, opts);
              };
            };
            FS.createPreloadedFile = FS_createPreloadedFile;
            FS.staticInit();
            Module["requestFullscreen"] = Browser.requestFullscreen;
            Module["requestAnimationFrame"] = Browser.requestAnimationFrame;
            Module["setCanvasSize"] = Browser.setCanvasSize;
            Module["pauseMainLoop"] = Browser.mainLoop.pause;
            Module["resumeMainLoop"] = Browser.mainLoop.resume;
            Module["getUserMedia"] = Browser.getUserMedia;
            Module["createContext"] = Browser.createContext;
            var preloadedImages = {};
            var preloadedAudios = {};
            var GLctx;
            for (var i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));
            var miniTempWebGLIntBuffersStorage = new Int32Array(288);
            for (var i = 0; i <= 288; ++i) {
              miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i);
            }
            var miniTempWebGLFloatBuffersStorage = new Float32Array(288);
            for (var i = 0; i <= 288; ++i) {
              miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
            }
            Module["request_quit"] = function () {
              GodotOS.request_quit();
            };
            Module["onExit"] = GodotOS.cleanup;
            GodotOS._fs_sync_promise = Promise.resolve();
            Module["initConfig"] = GodotConfig.init_config;
            Module["initFS"] = GodotFS.init;
            Module["copyToFS"] = GodotFS.copy_to_fs;
            GodotOS.atexit(function (resolve, reject) {
              GodotDisplayCursor.clear();
              resolve();
            });
            GodotOS.atexit(function (resolve, reject) {
              GodotEventListeners.clear();
              resolve();
            });
            GodotOS.atexit(function (resolve, reject) {
              GodotDisplayVK.clear();
              resolve();
            });
            GodotOS.atexit(function (resolve, reject) {
              GodotIME.clear();
              resolve();
            });
            GodotJSWrapper.proxies = new Map();
            var wasmImports = {
              Kc: ___call_sighandler,
              dd: ___syscall_chdir,
              Ya: ___syscall_chmod,
              ed: ___syscall_faccessat,
              ad: ___syscall_fchmod,
              V: ___syscall_fcntl64,
              $c: ___syscall_fstat64,
              Xc: ___syscall_ftruncate64,
              Vc: ___syscall_getcwd,
              Jc: ___syscall_getdents64,
              Ba: ___syscall_ioctl,
              Zc: ___syscall_lstat64,
              Rc: ___syscall_mkdirat,
              Qc: ___syscall_mknodat,
              Yc: ___syscall_newfstatat,
              Xa: ___syscall_openat,
              Ic: ___syscall_readlinkat,
              Hc: ___syscall_renameat,
              Ua: ___syscall_rmdir,
              _c: ___syscall_stat64,
              Gc: ___syscall_statfs64,
              Fc: ___syscall_symlink,
              Va: ___syscall_unlinkat,
              fd: __abort_js,
              bd: __emscripten_get_now_is_monotonic,
              Nc: __emscripten_runtime_keepalive_clear,
              Oc: __gmtime_js,
              Pc: __localtime_js,
              gd: __tzset_js,
              Pe: _emscripten_cancel_main_loop,
              za: _emscripten_date_now,
              Qe: _emscripten_force_exit,
              Ec: _emscripten_get_heap_max,
              ia: _emscripten_get_now,
              Cc: _emscripten_resize_heap,
              Dc: _emscripten_set_canvas_element_size,
              Ma: _emscripten_set_main_loop,
              Qa: _emscripten_webgl_commit_frame,
              _b: _emscripten_webgl_create_context,
              Ib: _emscripten_webgl_destroy_context,
              Yb: _emscripten_webgl_enable_extension,
              td: _emscripten_webgl_get_supported_extensions,
              Zb: _emscripten_webgl_make_context_current,
              Tc: _environ_get,
              Uc: _environ_sizes_get,
              La: _exit,
              na: _fd_close,
              Wa: _fd_fdstat_get,
              Za: _fd_read,
              Sc: _fd_seek,
              Aa: _fd_write,
              i: _glActiveTexture,
              cb: _glAttachShader,
              ea: _glBeginTransformFeedback,
              b: _glBindBuffer,
              y: _glBindBufferBase,
              Ea: _glBindBufferRange,
              d: _glBindFramebuffer,
              ta: _glBindRenderbuffer,
              c: _glBindTexture,
              e: _glBindVertexArray,
              Md: _glBlendColor,
              J: _glBlendEquation,
              ka: _glBlendFunc,
              D: _glBlendFuncSeparate,
              ha: _glBlitFramebuffer,
              h: _glBufferData,
              R: _glBufferSubData,
              P: _glCheckFramebufferStatus,
              G: _glClear,
              Ga: _glClearBufferfv,
              Q: _glClearColor,
              aa: _glClearDepthf,
              Y: _glColorMask,
              eb: _glCompileShader,
              ld: _glCompressedTexImage2D,
              nd: _glCompressedTexImage3D,
              md: _glCompressedTexSubImage3D,
              pd: _glCopyBufferSubData,
              yd: _glCreateProgram,
              gb: _glCreateShader,
              ma: _glCullFace,
              o: _glDeleteBuffers,
              v: _glDeleteFramebuffers,
              ga: _glDeleteProgram,
              jd: _glDeleteQueries,
              oa: _glDeleteRenderbuffers,
              X: _glDeleteShader,
              lb: _glDeleteSync,
              l: _glDeleteTextures,
              L: _glDeleteVertexArrays,
              U: _glDepthFunc,
              w: _glDepthMask,
              g: _glDisable,
              p: _glDisableVertexAttribArray,
              F: _glDrawArrays,
              Z: _glDrawArraysInstanced,
              la: _glDrawBuffers,
              M: _glDrawElements,
              N: _glDrawElementsInstanced,
              x: _glEnable,
              f: _glEnableVertexAttribArray,
              da: _glEndTransformFeedback,
              kb: _glFenceSync,
              Ed: _glFinish,
              Ja: _glFramebufferRenderbuffer,
              t: _glFramebufferTexture2D,
              $: _glFramebufferTextureLayer,
              ib: _glFrontFace,
              m: _glGenBuffers,
              B: _glGenFramebuffers,
              kd: _glGenQueries,
              Ka: _glGenRenderbuffers,
              r: _glGenTextures,
              K: _glGenVertexArrays,
              id: _glGenerateMipmap,
              qd: _glGetFloatv,
              sd: _glGetInteger64v,
              fa: _glGetIntegerv,
              ud: _glGetProgramInfoLog,
              bb: _glGetProgramiv,
              db: _glGetShaderInfoLog,
              ra: _glGetShaderiv,
              _: _glGetString,
              Od: _glGetSynciv,
              Bd: _glGetUniformBlockIndex,
              Fa: _glGetUniformLocation,
              vd: _glLinkProgram,
              Ca: _glPixelStorei,
              jb: _glReadBuffer,
              Da: _glReadPixels,
              Hd: _glRenderbufferStorage,
              $a: _glRenderbufferStorageMultisample,
              va: _glScissor,
              fb: _glShaderSource,
              q: _glTexImage2D,
              T: _glTexImage3D,
              Ia: _glTexParameterf,
              a: _glTexParameteri,
              Ha: _glTexStorage2D,
              _a: _glTexSubImage3D,
              wd: _glTransformFeedbackVaryings,
              k: _glUniform1f,
              E: _glUniform1i,
              zd: _glUniform1iv,
              u: _glUniform1ui,
              sa: _glUniform1uiv,
              ba: _glUniform2f,
              H: _glUniform2fv,
              ja: _glUniform2iv,
              s: _glUniform3fv,
              O: _glUniform4f,
              C: _glUniform4fv,
              Ad: _glUniformBlockBinding,
              hb: _glUniformMatrix3fv,
              I: _glUniformMatrix4fv,
              n: _glUseProgram,
              ua: _glVertexAttrib4f,
              z: _glVertexAttribDivisor,
              ca: _glVertexAttribI4ui,
              S: _glVertexAttribIPointer,
              j: _glVertexAttribPointer,
              A: _glViewport,
              Ce: _godot_audio_get_sample_playback_position,
              rd: _godot_audio_has_script_processor,
              Dd: _godot_audio_has_worklet,
              ff: _godot_audio_init,
              vc: _godot_audio_input_start,
              oc: _godot_audio_input_stop,
              gf: _godot_audio_is_available,
              pa: _godot_audio_resume,
              Nd: _godot_audio_sample_bus_add,
              Ld: _godot_audio_sample_bus_move,
              Td: _godot_audio_sample_bus_remove,
              ae: _godot_audio_sample_bus_set_count,
              Fd: _godot_audio_sample_bus_set_mute,
              Jd: _godot_audio_sample_bus_set_send,
              Gd: _godot_audio_sample_bus_set_solo,
              Id: _godot_audio_sample_bus_set_volume_db,
              Ne: _godot_audio_sample_is_active,
              Vb: _godot_audio_sample_register_stream,
              Kd: _godot_audio_sample_set_finished_callback,
              We: _godot_audio_sample_set_pause,
              ke: _godot_audio_sample_set_volumes_linear,
              Cb: _godot_audio_sample_start,
              ef: _godot_audio_sample_stop,
              ec: _godot_audio_sample_stream_is_registered,
              Kb: _godot_audio_sample_unregister_stream,
              te: _godot_audio_sample_update_pitch_scale,
              od: _godot_audio_script_create,
              hd: _godot_audio_script_start,
              Cd: _godot_audio_worklet_create,
              xd: _godot_audio_worklet_start_no_threads,
              dc: _godot_js_config_canvas_id_get,
              Fe: _godot_js_config_locale_get,
              Oe: _godot_js_display_alert,
              pc: _godot_js_display_canvas_focus,
              qc: _godot_js_display_canvas_is_focused,
              fc: _godot_js_display_clipboard_get,
              gc: _godot_js_display_clipboard_set,
              sc: _godot_js_display_cursor_is_hidden,
              rc: _godot_js_display_cursor_is_locked,
              xa: _godot_js_display_cursor_lock_set,
              Ta: _godot_js_display_cursor_set_custom_shape,
              tc: _godot_js_display_cursor_set_shape,
              ya: _godot_js_display_cursor_set_visible,
              Bb: _godot_js_display_desired_size_set,
              Nb: _godot_js_display_fullscreen_cb,
              Ab: _godot_js_display_fullscreen_exit,
              zb: _godot_js_display_fullscreen_request,
              $b: _godot_js_display_has_webgl,
              bc: _godot_js_display_is_swap_ok_cancel,
              Lb: _godot_js_display_notification_cb,
              Eb: _godot_js_display_pixel_ratio_get,
              Fb: _godot_js_display_screen_dpi_get,
              Gb: _godot_js_display_screen_size_get,
              cc: _godot_js_display_setup_canvas,
              Mc: _godot_js_display_size_update,
              nc: _godot_js_display_touchscreen_is_available,
              Hb: _godot_js_display_tts_available,
              Pa: _godot_js_display_vk_available,
              Jb: _godot_js_display_vk_cb,
              lc: _godot_js_display_vk_hide,
              mc: _godot_js_display_vk_show,
              Mb: _godot_js_display_window_blur_cb,
              Ra: _godot_js_display_window_icon_set,
              Oa: _godot_js_display_window_size_get,
              Db: _godot_js_display_window_title_set,
              Ve: _godot_js_eval,
              xb: _godot_js_fetch_create,
              Na: _godot_js_fetch_free,
              ub: _godot_js_fetch_http_status_get,
              wb: _godot_js_fetch_is_chunked,
              vb: _godot_js_fetch_read_chunk,
              df: _godot_js_fetch_read_headers,
              wa: _godot_js_fetch_state_get,
              Qb: _godot_js_input_drop_files_cb,
              Pb: _godot_js_input_gamepad_cb,
              yb: _godot_js_input_gamepad_sample,
              ic: _godot_js_input_gamepad_sample_count,
              hc: _godot_js_input_gamepad_sample_get,
              Sb: _godot_js_input_key_cb,
              Xb: _godot_js_input_mouse_button_cb,
              Wb: _godot_js_input_mouse_move_cb,
              Ub: _godot_js_input_mouse_wheel_cb,
              Rb: _godot_js_input_paste_cb,
              Tb: _godot_js_input_touch_cb,
              He: _godot_js_input_vibrate_handheld,
              Sa: _godot_js_is_ime_focused,
              Se: _godot_js_os_download_buffer,
              Le: _godot_js_os_execute,
              sb: _godot_js_os_finish_async,
              De: _godot_js_os_fs_is_persistent,
              Me: _godot_js_os_fs_sync,
              Je: _godot_js_os_has_feature,
              Ke: _godot_js_os_hw_concurrency_get,
              ac: _godot_js_os_request_quit_cb,
              Ie: _godot_js_os_shell_open,
              Ee: _godot_js_pwa_cb,
              Ge: _godot_js_pwa_update,
              rb: _godot_js_rtc_datachannel_close,
              se: _godot_js_rtc_datachannel_connect,
              pe: _godot_js_rtc_datachannel_destroy,
              ue: _godot_js_rtc_datachannel_get_buffered_amount,
              ye: _godot_js_rtc_datachannel_id_get,
              ve: _godot_js_rtc_datachannel_is_negotiated,
              ze: _godot_js_rtc_datachannel_is_ordered,
              re: _godot_js_rtc_datachannel_label_get,
              xe: _godot_js_rtc_datachannel_max_packet_lifetime_get,
              we: _godot_js_rtc_datachannel_max_retransmits_get,
              qe: _godot_js_rtc_datachannel_protocol_get,
              Be: _godot_js_rtc_datachannel_ready_state_get,
              Ae: _godot_js_rtc_datachannel_send,
              qb: _godot_js_rtc_pc_close,
              je: _godot_js_rtc_pc_create,
              ie: _godot_js_rtc_pc_datachannel_create,
              pb: _godot_js_rtc_pc_destroy,
              le: _godot_js_rtc_pc_ice_candidate_add,
              ne: _godot_js_rtc_pc_local_description_set,
              oe: _godot_js_rtc_pc_offer_create,
              me: _godot_js_rtc_pc_remote_description_set,
              kc: _godot_js_set_ime_active,
              Ob: _godot_js_set_ime_cb,
              jc: _godot_js_set_ime_position,
              zc: _godot_js_tts_get_voices,
              Ac: _godot_js_tts_is_paused,
              Bc: _godot_js_tts_is_speaking,
              xc: _godot_js_tts_pause,
              wc: _godot_js_tts_resume,
              yc: _godot_js_tts_speak,
              uc: _godot_js_tts_stop,
              Wc: _godot_js_webmidi_close_midi_inputs,
              cd: _godot_js_webmidi_open_midi_inputs,
              fe: _godot_js_websocket_buffered_amount,
              ee: _godot_js_websocket_close,
              he: _godot_js_websocket_create,
              ob: _godot_js_websocket_destroy,
              ge: _godot_js_websocket_send,
              Ze: _godot_js_wrapper_create_cb,
              Xe: _godot_js_wrapper_create_object,
              Ye: _godot_js_wrapper_interface_get,
              $e: _godot_js_wrapper_object_call,
              bf: _godot_js_wrapper_object_get,
              tb: _godot_js_wrapper_object_getvar,
              Ue: _godot_js_wrapper_object_is_buffer,
              cf: _godot_js_wrapper_object_set,
              _e: _godot_js_wrapper_object_set_cb_ret,
              af: _godot_js_wrapper_object_setvar,
              Te: _godot_js_wrapper_object_transfer_buffer,
              Re: _godot_js_wrapper_object_unref,
              ab: _godot_webgl2_glFramebufferTextureMultisampleMultiviewOVR,
              W: _godot_webgl2_glFramebufferTextureMultiviewOVR,
              qa: _godot_webgl2_glGetBufferSubData,
              be: _godot_webxr_get_bounds_geometry,
              Sd: _godot_webxr_get_color_texture,
              Rd: _godot_webxr_get_depth_texture,
              $d: _godot_webxr_get_frame_rate,
              Ud: _godot_webxr_get_projection_for_view,
              Vd: _godot_webxr_get_render_target_size,
              Zd: _godot_webxr_get_supported_frame_rates,
              mb: _godot_webxr_get_transform_for_view,
              Qd: _godot_webxr_get_velocity_texture,
              nb: _godot_webxr_get_view_count,
              ce: _godot_webxr_get_visibility_state,
              Xd: _godot_webxr_initialize,
              de: _godot_webxr_is_session_supported,
              Yd: _godot_webxr_is_supported,
              Wd: _godot_webxr_uninitialize,
              Pd: _godot_webxr_update_input_source,
              _d: _godot_webxr_update_target_frame_rate,
              Lc: _proc_exit
            };
            var wasmExports = createWasm();
            var _wasm_call_ctors = function ___wasm_call_ctors() {
              return (_wasm_call_ctors = wasmExports["jf"])();
            };
            var _free2 = function _free(a0) {
              return (_free2 = wasmExports["kf"])(a0);
            };
            var __Z14godot_web_mainiPPc = Module["__Z14godot_web_mainiPPc"] = function (a0, a1) {
              return (__Z14godot_web_mainiPPc = Module["__Z14godot_web_mainiPPc"] = wasmExports["lf"])(a0, a1);
            };
            var _main = Module["_main"] = function (a0, a1) {
              return (_main = Module["_main"] = wasmExports["mf"])(a0, a1);
            };
            var _malloc2 = function _malloc(a0) {
              return (_malloc2 = wasmExports["nf"])(a0);
            };
            var _fflush2 = function _fflush(a0) {
              return (_fflush2 = wasmExports["of"])(a0);
            };
            var __emwebxr_on_input_event = Module["__emwebxr_on_input_event"] = function (a0, a1) {
              return (__emwebxr_on_input_event = Module["__emwebxr_on_input_event"] = wasmExports["pf"])(a0, a1);
            };
            var __emwebxr_on_simple_event = Module["__emwebxr_on_simple_event"] = function (a0) {
              return (__emwebxr_on_simple_event = Module["__emwebxr_on_simple_event"] = wasmExports["qf"])(a0);
            };
            var _funcs_on_exit = function ___funcs_on_exit() {
              return (_funcs_on_exit = wasmExports["sf"])();
            };
            var _emscripten_stack_restore = function __emscripten_stack_restore(a0) {
              return (_emscripten_stack_restore = wasmExports["tf"])(a0);
            };
            var _emscripten_stack_alloc = function __emscripten_stack_alloc(a0) {
              return (_emscripten_stack_alloc = wasmExports["uf"])(a0);
            };
            var _emscripten_stack_get_current2 = function _emscripten_stack_get_current() {
              return (_emscripten_stack_get_current2 = wasmExports["vf"])();
            };
            Module["callMain"] = callMain;
            Module["cwrap"] = cwrap;
            var calledRun;
            dependenciesFulfilled = function runCaller() {
              if (!calledRun) run();
              if (!calledRun) dependenciesFulfilled = runCaller;
            };
            function callMain() {
              var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
              var entryFunction = _main;
              args.unshift(thisProgram);
              var argc = args.length;
              var argv = stackAlloc((argc + 1) * 4);
              var argv_ptr = argv;
              args.forEach(function (arg) {
                HEAPU32[argv_ptr >> 2] = stringToUTF8OnStack(arg);
                argv_ptr += 4;
              });
              HEAPU32[argv_ptr >> 2] = 0;
              try {
                var ret = entryFunction(argc, argv);
                exitJS(ret, true);
                return ret;
              } catch (e) {
                return handleException(e);
              }
            }
            function run() {
              var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : arguments_;
              if (runDependencies > 0) {
                return;
              }
              preRun();
              if (runDependencies > 0) {
                return;
              }
              function doRun() {
                var _Module$onRuntimeInit;
                if (calledRun) return;
                calledRun = true;
                Module["calledRun"] = true;
                if (ABORT) return;
                initRuntime();
                preMain();
                readyPromiseResolve(Module);
                (_Module$onRuntimeInit = Module["onRuntimeInitialized"]) === null || _Module$onRuntimeInit === void 0 || _Module$onRuntimeInit.call(Module);
                if (shouldRunNow) callMain(args);
                postRun();
              }
              if (Module["setStatus"]) {
                Module["setStatus"]("Running...");
                setTimeout(function () {
                  setTimeout(function () {
                    Module["setStatus"]("");
                  }, 1);
                  doRun();
                }, 1);
              } else {
                doRun();
              }
            }
            if (Module["preInit"]) {
              if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
              while (Module["preInit"].length > 0) {
                Module["preInit"].pop()();
              }
            }
            var shouldRunNow = false;
            if (Module["noInitialRun"]) shouldRunNow = false;
            run();
            moduleRtn = readyPromise;
            return moduleRtn;
          };
        }();
        if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && (typeof module === "undefined" ? "undefined" : _typeof(module)) === 'object') module.exports = Godot;else if (typeof define === 'function' && define['amd']) define([], function () {
          return Godot;
        });
        var Features = {
          /**
           * Check whether WebGL is available. Optionally, specify a particular version of WebGL to check for.
           *
           * @param {number=} [majorVersion=1] The major WebGL version to check for.
           * @returns {boolean} If the given major version of WebGL is available.
           * @function Engine.isWebGLAvailable
           */
          isWebGLAvailable: function isWebGLAvailable() {
            var majorVersion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
            try {
              return !!document.createElement('canvas').getContext(['webgl', 'webgl2'][majorVersion - 1]);
            } catch (e) {/* Not available */}
            return false;
          },
          /**
           * Check whether the Fetch API available and supports streaming responses.
           *
           * @returns {boolean} If the Fetch API is available and supports streaming responses.
           * @function Engine.isFetchAvailable
           */
          isFetchAvailable: function isFetchAvailable() {
            return 'fetch' in window && 'Response' in window && 'body' in window.Response.prototype;
          },
          /**
           * Check whether the engine is running in a Secure Context.
           *
           * @returns {boolean} If the engine is running in a Secure Context.
           * @function Engine.isSecureContext
           */
          isSecureContext: function isSecureContext() {
            return window['isSecureContext'] === true;
          },
          /**
           * Check whether the engine is cross origin isolated.
           * This value is dependent on Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers sent by the server.
           *
           * @returns {boolean} If the engine is running in a Secure Context.
           * @function Engine.isSecureContext
           */
          isCrossOriginIsolated: function isCrossOriginIsolated() {
            return window['crossOriginIsolated'] === true;
          },
          /**
           * Check whether SharedBufferArray is available.
           *
           * Most browsers require the page to be running in a secure context, and the
           * the server to provide specific CORS headers for SharedArrayBuffer to be available.
           *
           * @returns {boolean} If SharedArrayBuffer is available.
           * @function Engine.isSharedArrayBufferAvailable
           */
          isSharedArrayBufferAvailable: function isSharedArrayBufferAvailable() {
            return 'SharedArrayBuffer' in window;
          },
          /**
           * Check whether the AudioContext supports AudioWorkletNodes.
           *
           * @returns {boolean} If AudioWorkletNode is available.
           * @function Engine.isAudioWorkletAvailable
           */
          isAudioWorkletAvailable: function isAudioWorkletAvailable() {
            return 'AudioContext' in window && 'audioWorklet' in AudioContext.prototype;
          },
          /**
           * Return an array of missing required features (as string).
           *
           * @returns {Array<string>} A list of human-readable missing features.
           * @function Engine.getMissingFeatures
           * @param {{threads: (boolean|undefined)}} supportedFeatures
           */
          getMissingFeatures: function getMissingFeatures() {
            var supportedFeatures = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var _supportedFeatures$th = supportedFeatures['threads'],
              supportsThreads = _supportedFeatures$th === void 0 ? true : _supportedFeatures$th;
            var missing = [];
            if (!Features.isWebGLAvailable(2)) {
              missing.push('WebGL2 - Check web browser configuration and hardware support');
            }
            if (!Features.isFetchAvailable()) {
              missing.push('Fetch - Check web browser version');
            }
            if (!Features.isSecureContext()) {
              missing.push('Secure Context - Check web server configuration (use HTTPS)');
            }
            if (supportsThreads) {
              if (!Features.isCrossOriginIsolated()) {
                missing.push('Cross-Origin Isolation - Check that the web server configuration sends the correct headers.');
              }
              if (!Features.isSharedArrayBufferAvailable()) {
                missing.push('SharedArrayBuffer - Check that the web server configuration sends the correct headers.');
              }
            }

            // Audio is normally optional since we have a dummy fallback.
            return missing;
          }
        };
        var Preloader = /** @constructor */function Preloader() {
          // eslint-disable-line no-unused-vars
          function getTrackedResponse(response, load_status) {
            function onloadprogress(reader, controller) {
              return reader.read().then(function (result) {
                if (load_status.done) {
                  return Promise.resolve();
                }
                if (result.value) {
                  controller.enqueue(result.value);
                  load_status.loaded += result.value.length;
                }
                if (!result.done) {
                  return onloadprogress(reader, controller);
                }
                load_status.done = true;
                return Promise.resolve();
              });
            }
            var reader = response.body.getReader();
            return new Response(new ReadableStream({
              start: function start(controller) {
                onloadprogress(reader, controller).then(function () {
                  controller.close();
                });
              }
            }), {
              headers: response.headers
            });
          }
          function loadFetch(file, tracker, fileSize, raw) {
            tracker[file] = {
              total: fileSize || 0,
              loaded: 0,
              done: false
            };
            return fetch(file).then(function (response) {
              if (!response.ok) {
                return Promise.reject(new Error("Failed loading file '".concat(file, "'")));
              }
              var tr = getTrackedResponse(response, tracker[file]);
              if (raw) {
                return Promise.resolve(tr);
              }
              return tr.arrayBuffer();
            });
          }
          function retry(func) {
            var attempts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            function onerror(err) {
              if (attempts <= 1) {
                return Promise.reject(err);
              }
              return new Promise(function (resolve, reject) {
                setTimeout(function () {
                  retry(func, attempts - 1).then(resolve)["catch"](reject);
                }, 1000);
              });
            }
            return func()["catch"](onerror);
          }
          var DOWNLOAD_ATTEMPTS_MAX = 4;
          var loadingFiles = {};
          var lastProgress = {
            loaded: 0,
            total: 0
          };
          var progressFunc = null;
          var _animateProgress = function animateProgress() {
            var loaded = 0;
            var total = 0;
            var totalIsValid = true;
            var progressIsFinal = true;
            Object.keys(loadingFiles).forEach(function (file) {
              var stat = loadingFiles[file];
              if (!stat.done) {
                progressIsFinal = false;
              }
              if (!totalIsValid || stat.total === 0) {
                totalIsValid = false;
                total = 0;
              } else {
                total += stat.total;
              }
              loaded += stat.loaded;
            });
            if (loaded !== lastProgress.loaded || total !== lastProgress.total) {
              lastProgress.loaded = loaded;
              lastProgress.total = total;
              if (typeof progressFunc === 'function') {
                progressFunc(loaded, total);
              }
            }
            if (!progressIsFinal) {
              requestAnimationFrame(_animateProgress);
            }
          };
          this.animateProgress = _animateProgress;
          this.setProgressFunc = function (callback) {
            progressFunc = callback;
          };
          this.loadPromise = function (file, fileSize) {
            var raw = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            return retry(loadFetch.bind(null, file, loadingFiles, fileSize, raw), DOWNLOAD_ATTEMPTS_MAX);
          };
          this.preloadedFiles = [];
          this.preload = function (pathOrBuffer, destPath, fileSize) {
            var buffer = null;
            if (typeof pathOrBuffer === 'string') {
              var me = this;
              return this.loadPromise(pathOrBuffer, fileSize).then(function (buf) {
                me.preloadedFiles.push({
                  path: destPath || pathOrBuffer,
                  buffer: buf
                });
                return Promise.resolve();
              });
            } else if (pathOrBuffer instanceof ArrayBuffer) {
              buffer = new Uint8Array(pathOrBuffer);
            } else if (ArrayBuffer.isView(pathOrBuffer)) {
              buffer = new Uint8Array(pathOrBuffer.buffer);
            }
            if (buffer) {
              this.preloadedFiles.push({
                path: destPath,
                buffer: pathOrBuffer
              });
              return Promise.resolve();
            }
            return Promise.reject(new Error('Invalid object for preloading'));
          };
        };

        /**
         * An object used to configure the Engine instance based on godot export options, and to override those in custom HTML
         * templates if needed.
         *
         * @header Engine configuration
         * @summary The Engine configuration object. This is just a typedef, create it like a regular object, e.g.:
         *
         * ``const MyConfig = { executable: 'godot', unloadAfterInit: false }``
         *
         * @typedef {Object} EngineConfig
         */
        var EngineConfig = {}; // eslint-disable-line no-unused-vars

        /**
         * @struct
         * @constructor
         * @ignore
         */
        var InternalConfig = function InternalConfig(initConfig) {
          // eslint-disable-line no-unused-vars
          var cfg = /** @lends {InternalConfig.prototype} */{
            /**
             * Whether to unload the engine automatically after the instance is initialized.
             *
             * @memberof EngineConfig
             * @default
             * @type {boolean}
             */
            unloadAfterInit: true,
            /**
             * The HTML DOM Canvas object to use.
             *
             * By default, the first canvas element in the document will be used is none is specified.
             *
             * @memberof EngineConfig
             * @default
             * @type {?HTMLCanvasElement}
             */
            canvas: null,
            /**
             * The name of the WASM file without the extension. (Set by Godot Editor export process).
             *
             * @memberof EngineConfig
             * @default
             * @type {string}
             */
            executable: '',
            /**
             * An alternative name for the game pck to load. The executable name is used otherwise.
             *
             * @memberof EngineConfig
             * @default
             * @type {?string}
             */
            mainPack: null,
            /**
             * Specify a language code to select the proper localization for the game.
             *
             * The browser locale will be used if none is specified. See complete list of
             * :ref:`supported locales <doc_locales>`.
             *
             * @memberof EngineConfig
             * @type {?string}
             * @default
             */
            locale: null,
            /**
             * The canvas resize policy determines how the canvas should be resized by Godot.
             *
             * ``0`` means Godot won't do any resizing. This is useful if you want to control the canvas size from
             * javascript code in your template.
             *
             * ``1`` means Godot will resize the canvas on start, and when changing window size via engine functions.
             *
             * ``2`` means Godot will adapt the canvas size to match the whole browser window.
             *
             * @memberof EngineConfig
             * @type {number}
             * @default
             */
            canvasResizePolicy: 2,
            /**
             * The arguments to be passed as command line arguments on startup.
             *
             * See :ref:`command line tutorial <doc_command_line_tutorial>`.
             *
             * **Note**: :js:meth:`startGame <Engine.prototype.startGame>` will always add the ``--main-pack`` argument.
             *
             * @memberof EngineConfig
             * @type {Array<string>}
             * @default
             */
            args: [],
            /**
             * When enabled, the game canvas will automatically grab the focus when the engine starts.
             *
             * @memberof EngineConfig
             * @type {boolean}
             * @default
             */
            focusCanvas: true,
            /**
             * When enabled, this will turn on experimental virtual keyboard support on mobile.
             *
             * @memberof EngineConfig
             * @type {boolean}
             * @default
             */
            experimentalVK: false,
            /**
             * The progressive web app service worker to install.
             * @memberof EngineConfig
             * @default
             * @type {string}
             */
            serviceWorker: '',
            /**
             * @ignore
             * @type {Array.<string>}
             */
            persistentPaths: ['/userfs'],
            /**
             * @ignore
             * @type {boolean}
             */
            persistentDrops: false,
            /**
             * @ignore
             * @type {Array.<string>}
             */
            gdextensionLibs: [],
            /**
             * @ignore
             * @type {Array.<string>}
             */
            fileSizes: [],
            /**
             * A callback function for handling Godot's ``OS.execute`` calls.
             *
             * This is for example used in the Web Editor template to switch between project manager and editor, and for running the game.
             *
             * @callback EngineConfig.onExecute
             * @param {string} path The path that Godot's wants executed.
             * @param {Array.<string>} args The arguments of the "command" to execute.
             */
            /**
             * @ignore
             * @type {?function(string, Array.<string>)}
             */
            onExecute: null,
            /**
             * A callback function for being notified when the Godot instance quits.
             *
             * **Note**: This function will not be called if the engine crashes or become unresponsive.
             *
             * @callback EngineConfig.onExit
             * @param {number} status_code The status code returned by Godot on exit.
             */
            /**
             * @ignore
             * @type {?function(number)}
             */
            onExit: null,
            /**
             * A callback function for displaying download progress.
             *
             * The function is called once per frame while downloading files, so the usage of ``requestAnimationFrame()``
             * is not necessary.
             *
             * If the callback function receives a total amount of bytes as 0, this means that it is impossible to calculate.
             * Possible reasons include:
             *
             * -  Files are delivered with server-side chunked compression
             * -  Files are delivered with server-side compression on Chromium
             * -  Not all file downloads have started yet (usually on servers without multi-threading)
             *
             * @callback EngineConfig.onProgress
             * @param {number} current The current amount of downloaded bytes so far.
             * @param {number} total The total amount of bytes to be downloaded.
             */
            /**
             * @ignore
             * @type {?function(number, number)}
             */
            onProgress: null,
            /**
             * A callback function for handling the standard output stream. This method should usually only be used in debug pages.
             *
             * By default, ``console.log()`` is used.
             *
             * @callback EngineConfig.onPrint
             * @param {...*} [var_args] A variadic number of arguments to be printed.
             */
            /**
             * @ignore
             * @type {?function(...*)}
             */
            onPrint: function onPrint() {
              console.log.apply(console, Array.from(arguments)); // eslint-disable-line no-console
            },
            /**
             * A callback function for handling the standard error stream. This method should usually only be used in debug pages.
             *
             * By default, ``console.error()`` is used.
             *
             * @callback EngineConfig.onPrintError
             * @param {...*} [var_args] A variadic number of arguments to be printed as errors.
            */
            /**
             * @ignore
             * @type {?function(...*)}
             */
            onPrintError: function onPrintError(var_args) {
              console.error.apply(console, Array.from(arguments)); // eslint-disable-line no-console
            }
          };

          /**
           * @ignore
           * @struct
           * @constructor
           * @param {EngineConfig} opts
           */
          function Config(opts) {
            this.update(opts);
          }
          Config.prototype = cfg;

          /**
           * @ignore
           * @param {EngineConfig} opts
           */
          Config.prototype.update = function (opts) {
            var config = opts || {};
            // NOTE: We must explicitly pass the default, accessing it via
            // the key will fail due to closure compiler renames.
            function parse(key, def) {
              if (typeof config[key] === 'undefined') {
                return def;
              }
              return config[key];
            }
            // Module config
            this.unloadAfterInit = parse('unloadAfterInit', this.unloadAfterInit);
            this.onPrintError = parse('onPrintError', this.onPrintError);
            this.onPrint = parse('onPrint', this.onPrint);
            this.onProgress = parse('onProgress', this.onProgress);

            // Godot config
            this.canvas = parse('canvas', this.canvas);
            this.executable = parse('executable', this.executable);
            this.mainPack = parse('mainPack', this.mainPack);
            this.locale = parse('locale', this.locale);
            this.canvasResizePolicy = parse('canvasResizePolicy', this.canvasResizePolicy);
            this.persistentPaths = parse('persistentPaths', this.persistentPaths);
            this.persistentDrops = parse('persistentDrops', this.persistentDrops);
            this.experimentalVK = parse('experimentalVK', this.experimentalVK);
            this.focusCanvas = parse('focusCanvas', this.focusCanvas);
            this.serviceWorker = parse('serviceWorker', this.serviceWorker);
            this.gdextensionLibs = parse('gdextensionLibs', this.gdextensionLibs);
            this.fileSizes = parse('fileSizes', this.fileSizes);
            this.args = parse('args', this.args);
            this.onExecute = parse('onExecute', this.onExecute);
            this.onExit = parse('onExit', this.onExit);
          };

          /**
           * @ignore
           * @param {string} loadPath
           * @param {Response} response
           */
          Config.prototype.getModuleConfig = function (loadPath, response) {
            var r = response;
            var gdext = this.gdextensionLibs;
            return {
              'print': this.onPrint,
              'printErr': this.onPrintError,
              'thisProgram': this.executable,
              'noExitRuntime': false,
              'dynamicLibraries': ["".concat(loadPath, ".side.wasm")].concat(this.gdextensionLibs),
              'instantiateWasm': function instantiateWasm(imports, onSuccess) {
                function done(result) {
                  onSuccess(result['instance'], result['module']);
                }
                if (typeof WebAssembly.instantiateStreaming !== 'undefined') {
                  WebAssembly.instantiateStreaming(Promise.resolve(r), imports).then(done);
                } else {
                  r.arrayBuffer().then(function (buffer) {
                    WebAssembly.instantiate(buffer, imports).then(done);
                  });
                }
                r = null;
                return {};
              },
              'locateFile': function locateFile(path) {
                if (!path.startsWith('godot.')) {
                  return path;
                } else if (path.endsWith('.audio.worklet.js')) {
                  return "".concat(loadPath, ".audio.worklet.js");
                } else if (path.endsWith('.audio.position.worklet.js')) {
                  return "".concat(loadPath, ".audio.position.worklet.js");
                } else if (path.endsWith('.js')) {
                  return "".concat(loadPath, ".js");
                } else if (path in gdext) {
                  return path;
                } else if (path.endsWith('.side.wasm')) {
                  return "".concat(loadPath, ".side.wasm");
                } else if (path.endsWith('.wasm')) {
                  return "".concat(loadPath, ".wasm");
                }
                return path;
              }
            };
          };

          /**
           * @ignore
           * @param {function()} cleanup
           */
          Config.prototype.getGodotConfig = function (cleanup) {
            // Try to find a canvas
            if (!(this.canvas instanceof HTMLCanvasElement)) {
              var nodes = document.getElementsByTagName('canvas');
              if (nodes.length && nodes[0] instanceof HTMLCanvasElement) {
                var first = nodes[0];
                this.canvas = /** @type {!HTMLCanvasElement} */first;
              }
              if (!this.canvas) {
                throw new Error('No canvas found in page');
              }
            }
            // Canvas can grab focus on click, or key events won't work.
            if (this.canvas.tabIndex < 0) {
              this.canvas.tabIndex = 0;
            }

            // Browser locale, or custom one if defined.
            var locale = this.locale;
            if (!locale) {
              locale = navigator.languages ? navigator.languages[0] : navigator.language;
              locale = locale.split('.')[0];
            }
            locale = locale.replace('-', '_');
            var _onExit = this.onExit;

            // Godot configuration.
            return {
              'canvas': this.canvas,
              'canvasResizePolicy': this.canvasResizePolicy,
              'locale': locale,
              'persistentDrops': this.persistentDrops,
              'virtualKeyboard': this.experimentalVK,
              'focusCanvas': this.focusCanvas,
              'onExecute': this.onExecute,
              'onExit': function onExit(p_code) {
                cleanup(); // We always need to call the cleanup callback to free memory.
                if (typeof _onExit === 'function') {
                  _onExit(p_code);
                }
              }
            };
          };
          return new Config(initConfig);
        };

        /**
         * Projects exported for the Web expose the :js:class:`Engine` class to the JavaScript environment, that allows
         * fine control over the engine's start-up process.
         *
         * This API is built in an asynchronous manner and requires basic understanding
         * of `Promises <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises>`__.
         *
         * @module Engine
         * @header Web export JavaScript reference
         */
        var Engine = function () {
          var preloader = new Preloader();
          var loadPromise = null;
          var loadPath = '';
          var initPromise = null;

          /**
           * @classdesc The ``Engine`` class provides methods for loading and starting exported projects on the Web. For default export
           * settings, this is already part of the exported HTML page. To understand practical use of the ``Engine`` class,
           * see :ref:`Custom HTML page for Web export <doc_customizing_html5_shell>`.
           *
           * @description Create a new Engine instance with the given configuration.
           *
           * @global
           * @constructor
           * @param {EngineConfig} initConfig The initial config for this instance.
           */
          function Engine(initConfig) {
            // eslint-disable-line no-shadow
            this.config = new InternalConfig(initConfig);
            this.rtenv = null;
          }

          /**
           * Load the engine from the specified base path.
           *
           * @param {string} basePath Base path of the engine to load.
           * @param {number=} [size=0] The file size if known.
           * @returns {Promise} A Promise that resolves once the engine is loaded.
           *
           * @function Engine.load
           */
          Engine.load = function (basePath, size) {
            if (loadPromise == null) {
              loadPath = basePath;
              loadPromise = preloader.loadPromise("".concat(loadPath, ".wasm"), size, true);
              requestAnimationFrame(preloader.animateProgress);
            }
            return loadPromise;
          };
          Engine.unload = function () {
            loadPromise = null;
          };
          function SafeEngine(initConfig) {
            var proto = /** @lends Engine.prototype */{
              /**
               * Initialize the engine instance. Optionally, pass the base path to the engine to load it,
               * if it hasn't been loaded yet. See :js:meth:`Engine.load`.
               *
               * @param {string=} basePath Base path of the engine to load.
               * @return {Promise} A ``Promise`` that resolves once the engine is loaded and initialized.
               */
              init: function init(basePath) {
                if (initPromise) {
                  return initPromise;
                }
                if (loadPromise == null) {
                  if (!basePath) {
                    initPromise = Promise.reject(new Error('A base path must be provided when calling `init` and the engine is not loaded.'));
                    return initPromise;
                  }
                  Engine.load(basePath, this.config.fileSizes["".concat(basePath, ".wasm")]);
                }
                var me = this;
                function doInit(promise) {
                  // Care! Promise chaining is bogus with old emscripten versions.
                  // This caused a regression with the Mono build (which uses an older emscripten version).
                  // Make sure to test that when refactoring.
                  return new Promise(function (resolve, reject) {
                    promise.then(function (response) {
                      var cloned = new Response(response.clone().body, {
                        'headers': [['content-type', 'application/wasm']]
                      });
                      Godot(me.config.getModuleConfig(loadPath, cloned)).then(function (module) {
                        var paths = me.config.persistentPaths;
                        module['initFS'](paths).then(function (err) {
                          me.rtenv = module;
                          if (me.config.unloadAfterInit) {
                            Engine.unload();
                          }
                          resolve();
                        });
                      });
                    });
                  });
                }
                preloader.setProgressFunc(this.config.onProgress);
                initPromise = doInit(loadPromise);
                return initPromise;
              },
              /**
               * Load a file so it is available in the instance's file system once it runs. Must be called **before** starting the
               * instance.
               *
               * If not provided, the ``path`` is derived from the URL of the loaded file.
               *
               * @param {string|ArrayBuffer} file The file to preload.
               *
               * If a ``string`` the file will be loaded from that path.
               *
               * If an ``ArrayBuffer`` or a view on one, the buffer will used as the content of the file.
               *
               * @param {string=} path Path by which the file will be accessible. Required, if ``file`` is not a string.
               *
               * @returns {Promise} A Promise that resolves once the file is loaded.
               */
              preloadFile: function preloadFile(file, path) {
                return preloader.preload(file, path, this.config.fileSizes[file]);
              },
              /**
               * Start the engine instance using the given override configuration (if any).
               * :js:meth:`startGame <Engine.prototype.startGame>` can be used in typical cases instead.
               *
               * This will initialize the instance if it is not initialized. For manual initialization, see :js:meth:`init <Engine.prototype.init>`.
               * The engine must be loaded beforehand.
               *
               * Fails if a canvas cannot be found on the page, or not specified in the configuration.
               *
               * @param {EngineConfig} override An optional configuration override.
               * @return {Promise} Promise that resolves once the engine started.
               */
              start: function start(override) {
                this.config.update(override);
                var me = this;
                return me.init().then(function () {
                  if (!me.rtenv) {
                    return Promise.reject(new Error('The engine must be initialized before it can be started'));
                  }
                  var config = {};
                  try {
                    config = me.config.getGodotConfig(function () {
                      me.rtenv = null;
                    });
                  } catch (e) {
                    return Promise.reject(e);
                  }
                  // Godot configuration.
                  me.rtenv['initConfig'](config);

                  // Preload GDExtension libraries.
                  if (me.config.gdextensionLibs.length > 0 && !me.rtenv['loadDynamicLibrary']) {
                    return Promise.reject(new Error('GDExtension libraries are not supported by this engine version. ' + 'Enable "Extensions Support" for your export preset and/or build your custom template with "dlink_enabled=yes".'));
                  }
                  return new Promise(function (resolve, reject) {
                    var _iterator6 = _createForOfIteratorHelper(preloader.preloadedFiles),
                      _step6;
                    try {
                      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                        var file = _step6.value;
                        me.rtenv['copyToFS'](file.path, file.buffer);
                      }
                    } catch (err) {
                      _iterator6.e(err);
                    } finally {
                      _iterator6.f();
                    }
                    preloader.preloadedFiles.length = 0; // Clear memory
                    me.rtenv['callMain'](me.config.args);
                    initPromise = null;
                    me.installServiceWorker();
                    resolve();
                  });
                });
              },
              /**
               * Start the game instance using the given configuration override (if any).
               *
               * This will initialize the instance if it is not initialized. For manual initialization, see :js:meth:`init <Engine.prototype.init>`.
               *
               * This will load the engine if it is not loaded, and preload the main pck.
               *
               * This method expects the initial config (or the override) to have both the :js:attr:`executable` and :js:attr:`mainPack`
               * properties set (normally done by the editor during export).
               *
               * @param {EngineConfig} override An optional configuration override.
               * @return {Promise} Promise that resolves once the game started.
               */
              startGame: function startGame(override) {
                this.config.update(override);
                // Add main-pack argument.
                var exe = this.config.executable;
                var pack = this.config.mainPack || "".concat(exe, ".pck");
                this.config.args = ['--main-pack', pack].concat(this.config.args);
                // Start and init with execName as loadPath if not inited.
                var me = this;
                return Promise.all([this.init(exe), this.preloadFile(pack, pack), /*this.preloadFile("Resources.pck")*/]).then(function () {
                  return me.start.apply(me);
                });
              },
              /**
               * Create a file at the specified ``path`` with the passed as ``buffer`` in the instance's file system.
               *
               * @param {string} path The location where the file will be created.
               * @param {ArrayBuffer} buffer The content of the file.
               */
              copyToFS: function copyToFS(path, buffer) {
                if (this.rtenv == null) {
                  throw new Error('Engine must be inited before copying files');
                }
                this.rtenv['copyToFS'](path, buffer);
              },
              /**
               * Request that the current instance quit.
               *
               * This is akin the user pressing the close button in the window manager, and will
               * have no effect if the engine has crashed, or is stuck in a loop.
               *
               */
              requestQuit: function requestQuit() {
                if (this.rtenv) {
                  this.rtenv['request_quit']();
                }
              },
              /**
               * Install the progressive-web app service worker.
               * @returns {Promise} The service worker registration promise.
               */
              installServiceWorker: function installServiceWorker() {
                if (this.config.serviceWorker && 'serviceWorker' in navigator) {
                  try {
                    return navigator.serviceWorker.register(this.config.serviceWorker);
                  } catch (e) {
                    return Promise.reject(e);
                  }
                }
                return Promise.resolve();
              }
            };
            Engine.prototype = proto;
            // Closure compiler exported instance methods.
            Engine.prototype['init'] = Engine.prototype.init;
            Engine.prototype['preloadFile'] = Engine.prototype.preloadFile;
            Engine.prototype['start'] = Engine.prototype.start;
            Engine.prototype['startGame'] = Engine.prototype.startGame;
            Engine.prototype['copyToFS'] = Engine.prototype.copyToFS;
            Engine.prototype['requestQuit'] = Engine.prototype.requestQuit;
            Engine.prototype['installServiceWorker'] = Engine.prototype.installServiceWorker;
            // Also expose static methods as instance methods
            Engine.prototype['load'] = Engine.load;
            Engine.prototype['unload'] = Engine.unload;
            return new Engine(initConfig);
          }

          // Closure compiler exported static methods.
          SafeEngine['load'] = Engine.load;
          SafeEngine['unload'] = Engine.unload;

          // Feature-detection utilities.
          SafeEngine['isWebGLAvailable'] = Features.isWebGLAvailable;
          SafeEngine['isFetchAvailable'] = Features.isFetchAvailable;
          SafeEngine['isSecureContext'] = Features.isSecureContext;
          SafeEngine['isCrossOriginIsolated'] = Features.isCrossOriginIsolated;
          SafeEngine['isSharedArrayBufferAvailable'] = Features.isSharedArrayBufferAvailable;
          SafeEngine['isAudioWorkletAvailable'] = Features.isAudioWorkletAvailable;
          SafeEngine['getMissingFeatures'] = Features.getMissingFeatures;
          return SafeEngine;
        }();
        if (typeof window !== 'undefined') {
          window['Engine'] = Engine;
        }
      }).call(this);
    }).call(this, require('_process'), require("timers").setImmediate);
  }, {
    "_process": 1,
    "timers": 2
  }]
}, {}, [3]);

},{"_process":1,"process/browser.js":1,"timers":2}],4:[function(require,module,exports){
"use strict";

var GDT = require("./Godot-bundle");
var GODOT_CONFIG = {
  "args": [],
  "canvasResizePolicy": 2,
  "ensureCrossOriginIsolationHeaders": true,
  "executable": "Index",
  "experimentalVK": false,
  "fileSizes": {
    "Index.pck": 92091,//199728,
    "Index.wasm": 52126319
  },
  "focusCanvas": true,
  "gdextensionLibs": []
};
var GODOT_THREADS_ENABLED = false;
//console.log(Object.keys(GDT))

var engine = new Engine(GODOT_CONFIG);
try {
(function () {
  var statusOverlay = document.getElementById('status');
  var statusProgress = document.getElementById('status-progress');
  var statusNotice = document.getElementById('status-notice');
  var initializing = true;
  var statusMode = '';
  function setStatusMode(mode) {
    if (statusMode === mode || !initializing) {
      return;
    }
    if (mode === 'hidden') {
      statusOverlay.remove();
      initializing = false;
      return;
    }
    statusOverlay.style.visibility = 'visible';
    statusProgress.style.display = mode === 'progress' ? 'block' : 'none';
    statusNotice.style.display = mode === 'notice' ? 'block' : 'none';
    statusMode = mode;
  }
  function setStatusNotice(text) {
    while (statusNotice.lastChild) {
      statusNotice.removeChild(statusNotice.lastChild);
    }
    var lines = text.split('\n');
    lines.forEach(function (line) {
      statusNotice.appendChild(document.createTextNode(line));
      statusNotice.appendChild(document.createElement('br'));
    });
  }
  function displayFailureNotice(err) {
    console.error(err);
    if (err instanceof Error) {
      setStatusNotice(err.message);
    } else if (typeof err === 'string') {
      setStatusNotice(err);
    } else {
      setStatusNotice('An unknown error occurred.');
    }
    setStatusMode('notice');
    initializing = false;
  }
  var missing = Engine.getMissingFeatures({
    threads: GODOT_THREADS_ENABLED
  });
  if (missing.length !== 0) {
    if (GODOT_CONFIG['serviceWorker'] && GODOT_CONFIG['ensureCrossOriginIsolationHeaders'] && 'serviceWorker' in navigator) {
      var serviceWorkerRegistrationPromise;
      try {
        serviceWorkerRegistrationPromise = navigator.serviceWorker.getRegistration();
      } catch (err) {
        serviceWorkerRegistrationPromise = Promise.reject(new Error('Service worker registration failed.'));
      }
      // There's a chance that installing the service worker would fix the issue
      Promise.race([serviceWorkerRegistrationPromise.then(function (registration) {
        if (registration != null) {
          return Promise.reject(new Error('Service worker already exists.'));
        }
        return registration;
      }).then(function () {
        return engine.installServiceWorker();
      }),
      // For some reason, `getRegistration()` can stall
      new Promise(function (resolve) {
        setTimeout(function () {
          return resolve();
        }, 2000);
      })]).then(function () {
        // Reload if there was no error.
        window.location.reload();
      })["catch"](function (err) {
        console.error('Error while registering service worker:', err);
      });
    } else {
      // Display the message as usual
      var missingMsg = 'Error\nThe following features required to run Godot projects on the Web are missing:\n';
      displayFailureNotice(missingMsg + missing.join('\n'));
    }
  } else {
    setStatusMode('progress');
    engine.startGame({
      'onProgress': function onProgress(current, total) {
        if (current > 0 && total > 0) {
          statusProgress.value = current;
          statusProgress.max = total;
        } else {
          statusProgress.removeAttribute('value');
          statusProgress.removeAttribute('max');
        }
      }
    }).then(function () {
      setStatusMode('hidden');
    }, displayFailureNotice);
  }
})();
} catch (err) {
  console.log("gameStart error: " + err)
}
},{"./Godot-bundle":3}]},{},[4]);
