(function () {
    'use strict';

    const currentTab = () => new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true }, (tabs) => {
            const firstTab = tabs[0];
            if (firstTab) {
                resolve(firstTab.id);
                return;
            }
            reject('No Tab Selected');
        });
    });

    var accessors = /*#__PURE__*/Object.freeze({
        __proto__: null,
        currentTab: currentTab
    });

    var identity = {
        ...chrome.identity,
    };

    const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    const validate = (uuid) => typeof uuid === 'string' && REGEX.test(uuid);
    const rnds8 = new Uint8Array(16);
    const rng = () => {
        {
            if (typeof crypto !== 'undefined') {
                return crypto.getRandomValues(rnds8);
            }
            if (typeof msCrypto !== 'undefined') {
                return msCrypto.getRandomValues(rnds8);
            }
        }
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    };
    const byteToHex = [];
    for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).substr(1));
    }
    const stringify$1 = (arr) => {
        const offset = 0;
        const uuid = `${''}${byteToHex[arr[offset + 0]]}${''}${byteToHex[arr[offset + 1]]}${''}${byteToHex[arr[offset + 2]]}${''}${byteToHex[arr[offset + 3]]}${''}-${''}${byteToHex[arr[offset + 4]]}${''}${byteToHex[arr[offset + 5]]}${''}-${''}${byteToHex[arr[offset + 6]]}${''}${byteToHex[arr[offset + 7]]}${''}-${''}${byteToHex[arr[offset + 8]]}${''}${byteToHex[arr[offset + 9]]}${''}-${''}${byteToHex[arr[offset + 10]]}${''}${byteToHex[arr[offset + 11]]}${''}${byteToHex[arr[offset + 12]]}${''}${byteToHex[arr[offset + 13]]}${''}${byteToHex[arr[offset + 14]]}${''}${byteToHex[arr[offset + 15]]}${''}`
            .toLowerCase();
        if (!validate(uuid)) {
            throw TypeError('Stringified UUID is invalid');
        }
        return uuid;
    };
    const v4 = () => {
        const randoms = rng();
        randoms[6] = (randoms[6] & 0x0f) | 0x40;
        randoms[8] = (randoms[8] & 0x3f) | 0x80;
        return stringify$1(randoms);
    };

    const respond = (message) => {
        chrome.runtime.sendMessage(message);
    };
    const send = (message) => {
        const id = v4();
        chrome.runtime.sendMessage({
            ...message,
            meta: {
                id,
            },
        });
        return id;
    };
    const listen = (type, listener) => {
        const localListener = (message) => {
            if (Array.isArray(type) && type.includes(message.type)) {
                listener(message);
                return;
            }
            if (message.type === type) {
                listener(message);
            }
        };
        if (!chrome.runtime.onMessage.hasListener(localListener)) {
            chrome.runtime.onMessage.addListener(localListener);
        }
        const stopListening = () => {
            hangup$1(listener);
        };
        return stopListening;
    };
    const hangup$1 = (listener) => {
        if (chrome.runtime.onMessage.hasListener(listener)) {
            chrome.runtime.onMessage.removeListener(listener);
        }
    };
    const { sendMessage, ...rest } = chrome.runtime;
    var runtime$1 = {
        ...rest,
        hangup: hangup$1,
        listen,
        respond,
        send,
    };

    const get = (key) => new Promise((resolve) => {
        chrome.storage.local.get(key, (data) => {
            if (Object.keys(data).length === 0) {
                resolve(null);
            }
            resolve(data[key]);
        });
    });
    const getData = async (key) => {
        const response = await get(key);
        if (response) {
            return response.data;
        }
        return null;
    };
    const set = (key, data) => new Promise((resolve) => {
        const storeData = {
            data,
            lastUpdate: Date.now(),
        };
        const store = {
            [key]: storeData,
        };
        chrome.storage.local.set(store, () => {
            resolve(storeData);
        });
    });
    const remove = (key) => {
        chrome.storage.local.remove(key);
    };
    const addListener$1 = (key, listener) => {
        const localListener = (changes, namespace) => {
            const value = changes[key];
            if (value) {
                const { newValue, oldValue } = value;
                const change = {
                    oldValue: oldValue?.data,
                    newValue: newValue?.data,
                };
                listener(change, namespace);
            }
        };
        if (!chrome.storage.onChanged.hasListener(localListener)) {
            chrome.storage.onChanged.addListener(localListener);
        }
        const stopListening = () => {
            hangup(localListener);
        };
        return stopListening;
    };
    const hangup = (listener) => {
        if (chrome.storage.onChanged.hasListener(listener)) {
            chrome.storage.onChanged.removeListener(listener);
        }
    };
    const inferStorage = (unknown, predicate) => predicate(unknown);
    const predicate = {
        githubSettings: (message) => message.key === 'githubSettings',
        filters: (message) => message.key === 'filters',
        linksStandard: (message) => message.key === 'linksStandard',
        linksCustom: (message) => message.key === 'linksCustom',
        linksOrder: (message) => message.key === 'linksOrder',
    };
    const guards = {
        honeybadgerSettings: (message) => message.key === 'honeybadgerSettings',
        jiraSettings: (message) => message.key === 'jiraSettings',
        githubSettings: (message) => message.key === 'githubSettings',
        filters: (message) => message.key === 'filters',
        linksStandard: (message) => message.key === 'linksStandard',
        linksCustom: (message) => message.key === 'linksCustom',
        linksOrder: (message) => message.key === 'linksOrder',
        visibleUnits: (message) => message.key === 'visibleUnits',
        isAuthenticatedMessage: (message, unit) => {
            if (message.type === 'github/IS_AUTHENTICATED' && unit === 'github') {
                return true;
            }
            if (message.type === 'jira/IS_AUTHENTICATED' && unit === 'jira') {
                return true;
            }
            return false;
        },
    };
    var storage$2 = {
        ...chrome.storage,
        guards,
        addListener: addListener$1,
        inferStorage,
        get,
        getData,
        predicate,
        remove,
        set,
    };

    var chrome$1 = {
        ...chrome,
        storage: storage$2,
        runtime: runtime$1,
        accessors,
        identity,
    };

    const hexToRGB = (hex) => {
        const h = parseInt('0x' + hex.slice(1));
        return {
            r: h >> 16 & 255,
            g: h >> 8 & 255,
            b: h & 255,
        };
    };
    const getRGB = (color) => {
        if (!color) {
            return {
                r: 0,
                g: 0,
                b: 0,
            };
        }
        const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        if (color.match(/^rgb/) && match) {
            return {
                r: Number(match[1]),
                g: Number(match[2]),
                b: Number(match[3]),
            };
        }
        return hexToRGB(color);
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

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
    function nextTick(fun) {
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
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser$1 = true;
    var env$1 = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once$1 = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process = {
      nextTick: nextTick,
      title: title,
      browser: browser$1,
      env: env$1,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once$1,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    function getAugmentedNamespace(n) {
    	if (n.__esModule) return n;
    	var a = Object.defineProperty({}, '__esModule', {value: true});
    	Object.keys(n).forEach(function (k) {
    		var d = Object.getOwnPropertyDescriptor(n, k);
    		Object.defineProperty(a, k, d.get ? d : {
    			enumerable: true,
    			get: function () {
    				return n[k];
    			}
    		});
    	});
    	return a;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var reactIs_development = createCommonjsModule(function (module, exports) {



    {
      (function() {

    // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
    // nor polyfill, then a plain number is used for performance.
    var hasSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
    var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
    var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
    var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
    var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
    var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
    var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
    // (unstable) APIs that have been removed. Can we remove the symbols?

    var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
    var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
    var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
    var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
    var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
    var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
    var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
    var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
    var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
    var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
    var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

    function isValidElementType(type) {
      return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
    }

    function typeOf(object) {
      if (typeof object === 'object' && object !== null) {
        var $$typeof = object.$$typeof;

        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = object.type;

            switch (type) {
              case REACT_ASYNC_MODE_TYPE:
              case REACT_CONCURRENT_MODE_TYPE:
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
                return type;

              default:
                var $$typeofType = type && type.$$typeof;

                switch ($$typeofType) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                  case REACT_PROVIDER_TYPE:
                    return $$typeofType;

                  default:
                    return $$typeof;
                }

            }

          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }

      return undefined;
    } // AsyncMode is deprecated along with isAsyncMode

    var AsyncMode = REACT_ASYNC_MODE_TYPE;
    var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

    function isAsyncMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
          hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

          console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
        }
      }

      return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
    }
    function isConcurrentMode(object) {
      return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
    }
    function isContextConsumer(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    }
    function isContextProvider(object) {
      return typeOf(object) === REACT_PROVIDER_TYPE;
    }
    function isElement(object) {
      return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function isForwardRef(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }
    function isFragment(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    }
    function isLazy(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    }
    function isMemo(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    }
    function isPortal(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    }
    function isProfiler(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    }
    function isStrictMode(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }
    function isSuspense(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    }

    exports.AsyncMode = AsyncMode;
    exports.ConcurrentMode = ConcurrentMode;
    exports.ContextConsumer = ContextConsumer;
    exports.ContextProvider = ContextProvider;
    exports.Element = Element;
    exports.ForwardRef = ForwardRef;
    exports.Fragment = Fragment;
    exports.Lazy = Lazy;
    exports.Memo = Memo;
    exports.Portal = Portal;
    exports.Profiler = Profiler;
    exports.StrictMode = StrictMode;
    exports.Suspense = Suspense;
    exports.isAsyncMode = isAsyncMode;
    exports.isConcurrentMode = isConcurrentMode;
    exports.isContextConsumer = isContextConsumer;
    exports.isContextProvider = isContextProvider;
    exports.isElement = isElement;
    exports.isForwardRef = isForwardRef;
    exports.isFragment = isFragment;
    exports.isLazy = isLazy;
    exports.isMemo = isMemo;
    exports.isPortal = isPortal;
    exports.isProfiler = isProfiler;
    exports.isStrictMode = isStrictMode;
    exports.isSuspense = isSuspense;
    exports.isValidElementType = isValidElementType;
    exports.typeOf = typeOf;
      })();
    }
    });

    var reactIs = createCommonjsModule(function (module) {

    {
      module.exports = reactIs_development;
    }
    });

    /*
    object-assign
    (c) Sindre Sorhus
    @license MIT
    */
    /* eslint-disable no-unused-vars */
    var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;

    function toObject(val) {
    	if (val === null || val === undefined) {
    		throw new TypeError('Object.assign cannot be called with null or undefined');
    	}

    	return Object(val);
    }

    function shouldUseNative() {
    	try {
    		if (!Object.assign) {
    			return false;
    		}

    		// Detect buggy property enumeration order in older V8 versions.

    		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
    		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
    		test1[5] = 'de';
    		if (Object.getOwnPropertyNames(test1)[0] === '5') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test2 = {};
    		for (var i = 0; i < 10; i++) {
    			test2['_' + String.fromCharCode(i)] = i;
    		}
    		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
    			return test2[n];
    		});
    		if (order2.join('') !== '0123456789') {
    			return false;
    		}

    		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
    		var test3 = {};
    		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
    			test3[letter] = letter;
    		});
    		if (Object.keys(Object.assign({}, test3)).join('') !==
    				'abcdefghijklmnopqrst') {
    			return false;
    		}

    		return true;
    	} catch (err) {
    		// We don't expect any of the above to throw, but better to be safe.
    		return false;
    	}
    }

    var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    	var from;
    	var to = toObject(target);
    	var symbols;

    	for (var s = 1; s < arguments.length; s++) {
    		from = Object(arguments[s]);

    		for (var key in from) {
    			if (hasOwnProperty.call(from, key)) {
    				to[key] = from[key];
    			}
    		}

    		if (getOwnPropertySymbols$1) {
    			symbols = getOwnPropertySymbols$1(from);
    			for (var i = 0; i < symbols.length; i++) {
    				if (propIsEnumerable.call(from, symbols[i])) {
    					to[symbols[i]] = from[symbols[i]];
    				}
    			}
    		}
    	}

    	return to;
    };

    /** @license React v17.0.2
     * react.production.min.js
     *
     * Copyright (c) Facebook, Inc. and its affiliates.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    createCommonjsModule(function (module, exports) {
    var n=60103,p=60106;exports.Fragment=60107;exports.StrictMode=60108;exports.Profiler=60114;var q=60109,r=60110,t=60112;exports.Suspense=60113;var u=60115,v=60116;
    if("function"===typeof Symbol&&Symbol.for){var w=Symbol.for;n=w("react.element");p=w("react.portal");exports.Fragment=w("react.fragment");exports.StrictMode=w("react.strict_mode");exports.Profiler=w("react.profiler");q=w("react.provider");r=w("react.context");t=w("react.forward_ref");exports.Suspense=w("react.suspense");u=w("react.memo");v=w("react.lazy");}var x="function"===typeof Symbol&&Symbol.iterator;
    function y(a){if(null===a||"object"!==typeof a)return null;a=x&&a[x]||a["@@iterator"];return "function"===typeof a?a:null}function z(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return "Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}
    var A={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B={};function C(a,b,c){this.props=a;this.context=b;this.refs=B;this.updater=c||A;}C.prototype.isReactComponent={};C.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error(z(85));this.updater.enqueueSetState(this,a,b,"setState");};C.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};
    function D(){}D.prototype=C.prototype;function E(a,b,c){this.props=a;this.context=b;this.refs=B;this.updater=c||A;}var F=E.prototype=new D;F.constructor=E;objectAssign(F,C.prototype);F.isPureReactComponent=!0;var G={current:null},H=Object.prototype.hasOwnProperty,I={key:!0,ref:!0,__self:!0,__source:!0};
    function J(a,b,c){var e,d={},k=null,h=null;if(null!=b)for(e in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)H.call(b,e)&&!I.hasOwnProperty(e)&&(d[e]=b[e]);var g=arguments.length-2;if(1===g)d.children=c;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];d.children=f;}if(a&&a.defaultProps)for(e in g=a.defaultProps,g)void 0===d[e]&&(d[e]=g[e]);return {$$typeof:n,type:a,key:k,ref:h,props:d,_owner:G.current}}
    function K(a,b){return {$$typeof:n,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function L(a){return "object"===typeof a&&null!==a&&a.$$typeof===n}function escape(a){var b={"=":"=0",":":"=2"};return "$"+a.replace(/[=:]/g,function(a){return b[a]})}var M=/\/+/g;function N(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
    function O(a,b,c,e,d){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case n:case p:h=!0;}}if(h)return h=a,d=d(h),a=""===e?"."+N(h,0):e,Array.isArray(d)?(c="",null!=a&&(c=a.replace(M,"$&/")+"/"),O(d,b,c,"",function(a){return a})):null!=d&&(L(d)&&(d=K(d,c+(!d.key||h&&h.key===d.key?"":(""+d.key).replace(M,"$&/")+"/")+a)),b.push(d)),1;h=0;e=""===e?".":e+":";if(Array.isArray(a))for(var g=
    0;g<a.length;g++){k=a[g];var f=e+N(k,g);h+=O(k,b,c,f,d);}else if(f=y(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=e+N(k,g++),h+=O(k,b,c,f,d);else if("object"===k)throw b=""+a,Error(z(31,"[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b));return h}function P(a,b,c){if(null==a)return a;var e=[],d=0;O(a,e,"","",function(a){return b.call(c,a,d++)});return e}
    function Q(a){if(-1===a._status){var b=a._result;b=b();a._status=0;a._result=b;b.then(function(b){0===a._status&&(b=b.default,a._status=1,a._result=b);},function(b){0===a._status&&(a._status=2,a._result=b);});}if(1===a._status)return a._result;throw a._result;}var R={current:null};function S(){var a=R.current;if(null===a)throw Error(z(321));return a}var T={ReactCurrentDispatcher:R,ReactCurrentBatchConfig:{transition:0},ReactCurrentOwner:G,IsSomeRendererActing:{current:!1},assign:objectAssign};
    exports.Children={map:P,forEach:function(a,b,c){P(a,function(){b.apply(this,arguments);},c);},count:function(a){var b=0;P(a,function(){b++;});return b},toArray:function(a){return P(a,function(a){return a})||[]},only:function(a){if(!L(a))throw Error(z(143));return a}};exports.Component=C;exports.PureComponent=E;exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=T;
    exports.cloneElement=function(a,b,c){if(null===a||void 0===a)throw Error(z(267,a));var e=objectAssign({},a.props),d=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=G.current);void 0!==b.key&&(d=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)H.call(b,f)&&!I.hasOwnProperty(f)&&(e[f]=void 0===b[f]&&void 0!==g?g[f]:b[f]);}var f=arguments.length-2;if(1===f)e.children=c;else if(1<f){g=Array(f);for(var m=0;m<f;m++)g[m]=arguments[m+2];e.children=g;}return {$$typeof:n,type:a.type,
    key:d,ref:k,props:e,_owner:h}};exports.createContext=function(a,b){void 0===b&&(b=null);a={$$typeof:r,_calculateChangedBits:b,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null};a.Provider={$$typeof:q,_context:a};return a.Consumer=a};exports.createElement=J;exports.createFactory=function(a){var b=J.bind(null,a);b.type=a;return b};exports.createRef=function(){return {current:null}};exports.forwardRef=function(a){return {$$typeof:t,render:a}};exports.isValidElement=L;
    exports.lazy=function(a){return {$$typeof:v,_payload:{_status:-1,_result:a},_init:Q}};exports.memo=function(a,b){return {$$typeof:u,type:a,compare:void 0===b?null:b}};exports.useCallback=function(a,b){return S().useCallback(a,b)};exports.useContext=function(a,b){return S().useContext(a,b)};exports.useDebugValue=function(){};exports.useEffect=function(a,b){return S().useEffect(a,b)};exports.useImperativeHandle=function(a,b,c){return S().useImperativeHandle(a,b,c)};
    exports.useLayoutEffect=function(a,b){return S().useLayoutEffect(a,b)};exports.useMemo=function(a,b){return S().useMemo(a,b)};exports.useReducer=function(a,b,c){return S().useReducer(a,b,c)};exports.useRef=function(a){return S().useRef(a)};exports.useState=function(a){return S().useState(a)};exports.version="17.0.2";
    });

    var react_development = createCommonjsModule(function (module, exports) {

    {
      (function() {

    var _assign = objectAssign;

    // TODO: this is special because it gets imported during build.
    var ReactVersion = '17.0.2';

    // ATTENTION
    // When adding new symbols to this file,
    // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
    // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
    // nor polyfill, then a plain number is used for performance.
    var REACT_ELEMENT_TYPE = 0xeac7;
    var REACT_PORTAL_TYPE = 0xeaca;
    exports.Fragment = 0xeacb;
    exports.StrictMode = 0xeacc;
    exports.Profiler = 0xead2;
    var REACT_PROVIDER_TYPE = 0xeacd;
    var REACT_CONTEXT_TYPE = 0xeace;
    var REACT_FORWARD_REF_TYPE = 0xead0;
    exports.Suspense = 0xead1;
    var REACT_SUSPENSE_LIST_TYPE = 0xead8;
    var REACT_MEMO_TYPE = 0xead3;
    var REACT_LAZY_TYPE = 0xead4;
    var REACT_BLOCK_TYPE = 0xead9;
    var REACT_SERVER_BLOCK_TYPE = 0xeada;
    var REACT_FUNDAMENTAL_TYPE = 0xead5;
    var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
    var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

    if (typeof Symbol === 'function' && Symbol.for) {
      var symbolFor = Symbol.for;
      REACT_ELEMENT_TYPE = symbolFor('react.element');
      REACT_PORTAL_TYPE = symbolFor('react.portal');
      exports.Fragment = symbolFor('react.fragment');
      exports.StrictMode = symbolFor('react.strict_mode');
      exports.Profiler = symbolFor('react.profiler');
      REACT_PROVIDER_TYPE = symbolFor('react.provider');
      REACT_CONTEXT_TYPE = symbolFor('react.context');
      REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
      exports.Suspense = symbolFor('react.suspense');
      REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
      REACT_MEMO_TYPE = symbolFor('react.memo');
      REACT_LAZY_TYPE = symbolFor('react.lazy');
      REACT_BLOCK_TYPE = symbolFor('react.block');
      REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
      REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
      symbolFor('react.scope');
      symbolFor('react.opaque.id');
      REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
      symbolFor('react.offscreen');
      REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
    }

    var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator';
    function getIteratorFn(maybeIterable) {
      if (maybeIterable === null || typeof maybeIterable !== 'object') {
        return null;
      }

      var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

      if (typeof maybeIterator === 'function') {
        return maybeIterator;
      }

      return null;
    }

    /**
     * Keeps track of the current dispatcher.
     */
    var ReactCurrentDispatcher = {
      /**
       * @internal
       * @type {ReactComponent}
       */
      current: null
    };

    /**
     * Keeps track of the current batch's configuration such as how long an update
     * should suspend for if it needs to.
     */
    var ReactCurrentBatchConfig = {
      transition: 0
    };

    /**
     * Keeps track of the current owner.
     *
     * The current owner is the component who should own any components that are
     * currently being constructed.
     */
    var ReactCurrentOwner = {
      /**
       * @internal
       * @type {ReactComponent}
       */
      current: null
    };

    var ReactDebugCurrentFrame = {};
    var currentExtraStackFrame = null;
    function setExtraStackFrame(stack) {
      {
        currentExtraStackFrame = stack;
      }
    }

    {
      ReactDebugCurrentFrame.setExtraStackFrame = function (stack) {
        {
          currentExtraStackFrame = stack;
        }
      }; // Stack implementation injected by the current renderer.


      ReactDebugCurrentFrame.getCurrentStack = null;

      ReactDebugCurrentFrame.getStackAddendum = function () {
        var stack = ''; // Add an extra top frame while an element is being validated

        if (currentExtraStackFrame) {
          stack += currentExtraStackFrame;
        } // Delegate to the injected renderer-specific implementation


        var impl = ReactDebugCurrentFrame.getCurrentStack;

        if (impl) {
          stack += impl() || '';
        }

        return stack;
      };
    }

    /**
     * Used by act() to track whether you're inside an act() scope.
     */
    var IsSomeRendererActing = {
      current: false
    };

    var ReactSharedInternals = {
      ReactCurrentDispatcher: ReactCurrentDispatcher,
      ReactCurrentBatchConfig: ReactCurrentBatchConfig,
      ReactCurrentOwner: ReactCurrentOwner,
      IsSomeRendererActing: IsSomeRendererActing,
      // Used by renderers to avoid bundling object-assign twice in UMD bundles:
      assign: _assign
    };

    {
      ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
    }

    // by calls to these methods by a Babel plugin.
    //
    // In PROD (or in packages without access to React internals),
    // they are left as they are instead.

    function warn(format) {
      {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        printWarning('warn', format, args);
      }
    }
    function error(format) {
      {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        printWarning('error', format, args);
      }
    }

    function printWarning(level, format, args) {
      // When changing this logic, you might want to also
      // update consoleWithStackDev.www.js as well.
      {
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        var stack = ReactDebugCurrentFrame.getStackAddendum();

        if (stack !== '') {
          format += '%s';
          args = args.concat([stack]);
        }

        var argsWithFormat = args.map(function (item) {
          return '' + item;
        }); // Careful: RN currently depends on this prefix

        argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
        // breaks IE9: https://github.com/facebook/react/issues/13610
        // eslint-disable-next-line react-internal/no-production-logging

        Function.prototype.apply.call(console[level], console, argsWithFormat);
      }
    }

    var didWarnStateUpdateForUnmountedComponent = {};

    function warnNoop(publicInstance, callerName) {
      {
        var _constructor = publicInstance.constructor;
        var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
        var warningKey = componentName + "." + callerName;

        if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
          return;
        }

        error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);

        didWarnStateUpdateForUnmountedComponent[warningKey] = true;
      }
    }
    /**
     * This is the abstract API for an update queue.
     */


    var ReactNoopUpdateQueue = {
      /**
       * Checks whether or not this composite component is mounted.
       * @param {ReactClass} publicInstance The instance we want to test.
       * @return {boolean} True if mounted, false otherwise.
       * @protected
       * @final
       */
      isMounted: function (publicInstance) {
        return false;
      },

      /**
       * Forces an update. This should only be invoked when it is known with
       * certainty that we are **not** in a DOM transaction.
       *
       * You may want to call this when you know that some deeper aspect of the
       * component's state has changed but `setState` was not called.
       *
       * This will not invoke `shouldComponentUpdate`, but it will invoke
       * `componentWillUpdate` and `componentDidUpdate`.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {?function} callback Called after component is updated.
       * @param {?string} callerName name of the calling function in the public API.
       * @internal
       */
      enqueueForceUpdate: function (publicInstance, callback, callerName) {
        warnNoop(publicInstance, 'forceUpdate');
      },

      /**
       * Replaces all of the state. Always use this or `setState` to mutate state.
       * You should treat `this.state` as immutable.
       *
       * There is no guarantee that `this.state` will be immediately updated, so
       * accessing `this.state` after calling this method may return the old value.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {object} completeState Next state.
       * @param {?function} callback Called after component is updated.
       * @param {?string} callerName name of the calling function in the public API.
       * @internal
       */
      enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
        warnNoop(publicInstance, 'replaceState');
      },

      /**
       * Sets a subset of the state. This only exists because _pendingState is
       * internal. This provides a merging strategy that is not available to deep
       * properties which is confusing. TODO: Expose pendingState or don't use it
       * during the merge.
       *
       * @param {ReactClass} publicInstance The instance that should rerender.
       * @param {object} partialState Next partial state to be merged with state.
       * @param {?function} callback Called after component is updated.
       * @param {?string} Name of the calling function in the public API.
       * @internal
       */
      enqueueSetState: function (publicInstance, partialState, callback, callerName) {
        warnNoop(publicInstance, 'setState');
      }
    };

    var emptyObject = {};

    {
      Object.freeze(emptyObject);
    }
    /**
     * Base class helpers for the updating state of a component.
     */


    function Component(props, context, updater) {
      this.props = props;
      this.context = context; // If a component has string refs, we will assign a different object later.

      this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
      // renderer.

      this.updater = updater || ReactNoopUpdateQueue;
    }

    Component.prototype.isReactComponent = {};
    /**
     * Sets a subset of the state. Always use this to mutate
     * state. You should treat `this.state` as immutable.
     *
     * There is no guarantee that `this.state` will be immediately updated, so
     * accessing `this.state` after calling this method may return the old value.
     *
     * There is no guarantee that calls to `setState` will run synchronously,
     * as they may eventually be batched together.  You can provide an optional
     * callback that will be executed when the call to setState is actually
     * completed.
     *
     * When a function is provided to setState, it will be called at some point in
     * the future (not synchronously). It will be called with the up to date
     * component arguments (state, props, context). These values can be different
     * from this.* because your function may be called after receiveProps but before
     * shouldComponentUpdate, and this new state, props, and context will not yet be
     * assigned to this.
     *
     * @param {object|function} partialState Next partial state or function to
     *        produce next partial state to be merged with current state.
     * @param {?function} callback Called after state is updated.
     * @final
     * @protected
     */

    Component.prototype.setState = function (partialState, callback) {
      if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
        {
          throw Error( "setState(...): takes an object of state variables to update or a function which returns an object of state variables." );
        }
      }

      this.updater.enqueueSetState(this, partialState, callback, 'setState');
    };
    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     *
     * @param {?function} callback Called after update is complete.
     * @final
     * @protected
     */


    Component.prototype.forceUpdate = function (callback) {
      this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
    };
    /**
     * Deprecated APIs. These APIs used to exist on classic React classes but since
     * we would like to deprecate them, we're not going to move them over to this
     * modern base class. Instead, we define a getter that warns if it's accessed.
     */


    {
      var deprecatedAPIs = {
        isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
        replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
      };

      var defineDeprecationWarning = function (methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function () {
            warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);

            return undefined;
          }
        });
      };

      for (var fnName in deprecatedAPIs) {
        if (deprecatedAPIs.hasOwnProperty(fnName)) {
          defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
        }
      }
    }

    function ComponentDummy() {}

    ComponentDummy.prototype = Component.prototype;
    /**
     * Convenience component with default shallow equality check for sCU.
     */

    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context; // If a component has string refs, we will assign a different object later.

      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }

    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

    _assign(pureComponentPrototype, Component.prototype);

    pureComponentPrototype.isPureReactComponent = true;

    // an immutable object with a single mutable value
    function createRef() {
      var refObject = {
        current: null
      };

      {
        Object.seal(refObject);
      }

      return refObject;
    }

    function getWrappedName(outerType, innerType, wrapperName) {
      var functionName = innerType.displayName || innerType.name || '';
      return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
    }

    function getContextName(type) {
      return type.displayName || 'Context';
    }

    function getComponentName(type) {
      if (type == null) {
        // Host root, text node or just invalid type.
        return null;
      }

      {
        if (typeof type.tag === 'number') {
          error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
        }
      }

      if (typeof type === 'function') {
        return type.displayName || type.name || null;
      }

      if (typeof type === 'string') {
        return type;
      }

      switch (type) {
        case exports.Fragment:
          return 'Fragment';

        case REACT_PORTAL_TYPE:
          return 'Portal';

        case exports.Profiler:
          return 'Profiler';

        case exports.StrictMode:
          return 'StrictMode';

        case exports.Suspense:
          return 'Suspense';

        case REACT_SUSPENSE_LIST_TYPE:
          return 'SuspenseList';
      }

      if (typeof type === 'object') {
        switch (type.$$typeof) {
          case REACT_CONTEXT_TYPE:
            var context = type;
            return getContextName(context) + '.Consumer';

          case REACT_PROVIDER_TYPE:
            var provider = type;
            return getContextName(provider._context) + '.Provider';

          case REACT_FORWARD_REF_TYPE:
            return getWrappedName(type, type.render, 'ForwardRef');

          case REACT_MEMO_TYPE:
            return getComponentName(type.type);

          case REACT_BLOCK_TYPE:
            return getComponentName(type._render);

          case REACT_LAZY_TYPE:
            {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;

              try {
                return getComponentName(init(payload));
              } catch (x) {
                return null;
              }
            }
        }
      }

      return null;
    }

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true
    };
    var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;

    {
      didWarnAboutStringRefs = {};
    }

    function hasValidRef(config) {
      {
        if (hasOwnProperty.call(config, 'ref')) {
          var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }

      return config.ref !== undefined;
    }

    function hasValidKey(config) {
      {
        if (hasOwnProperty.call(config, 'key')) {
          var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }

      return config.key !== undefined;
    }

    function defineKeyPropWarningGetter(props, displayName) {
      var warnAboutAccessingKey = function () {
        {
          if (!specialPropKeyWarningShown) {
            specialPropKeyWarningShown = true;

            error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
          }
        }
      };

      warnAboutAccessingKey.isReactWarning = true;
      Object.defineProperty(props, 'key', {
        get: warnAboutAccessingKey,
        configurable: true
      });
    }

    function defineRefPropWarningGetter(props, displayName) {
      var warnAboutAccessingRef = function () {
        {
          if (!specialPropRefWarningShown) {
            specialPropRefWarningShown = true;

            error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
          }
        }
      };

      warnAboutAccessingRef.isReactWarning = true;
      Object.defineProperty(props, 'ref', {
        get: warnAboutAccessingRef,
        configurable: true
      });
    }

    function warnIfStringRefCannotBeAutoConverted(config) {
      {
        if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
          var componentName = getComponentName(ReactCurrentOwner.current.type);

          if (!didWarnAboutStringRefs[componentName]) {
            error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);

            didWarnAboutStringRefs[componentName] = true;
          }
        }
      }
    }
    /**
     * Factory method to create a new React element. This no longer adheres to
     * the class pattern, so do not use new to call it. Also, instanceof check
     * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
     * if something is a React Element.
     *
     * @param {*} type
     * @param {*} props
     * @param {*} key
     * @param {string|object} ref
     * @param {*} owner
     * @param {*} self A *temporary* helper to detect places where `this` is
     * different from the `owner` when React.createElement is called, so that we
     * can warn. We want to get rid of owner and replace string `ref`s with arrow
     * functions, and as long as `this` and owner are the same, there will be no
     * change in behavior.
     * @param {*} source An annotation object (added by a transpiler or otherwise)
     * indicating filename, line number, and/or other information.
     * @internal
     */


    var ReactElement = function (type, key, ref, self, source, owner, props) {
      var element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type: type,
        key: key,
        ref: ref,
        props: props,
        // Record the component responsible for creating this element.
        _owner: owner
      };

      {
        // The validation flag is currently mutative. We put it on
        // an external backing store so that we can freeze the whole object.
        // This can be replaced with a WeakMap once they are implemented in
        // commonly used development environments.
        element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
        // the validation flag non-enumerable (where possible, which should
        // include every environment we run tests in), so the test framework
        // ignores it.

        Object.defineProperty(element._store, 'validated', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: false
        }); // self and source are DEV only properties.

        Object.defineProperty(element, '_self', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: self
        }); // Two elements created in two different places should be considered
        // equal for testing purposes and therefore we hide it from enumeration.

        Object.defineProperty(element, '_source', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: source
        });

        if (Object.freeze) {
          Object.freeze(element.props);
          Object.freeze(element);
        }
      }

      return element;
    };
    /**
     * Create and return a new ReactElement of the given type.
     * See https://reactjs.org/docs/react-api.html#createelement
     */

    function createElement(type, config, children) {
      var propName; // Reserved names are extracted

      var props = {};
      var key = null;
      var ref = null;
      var self = null;
      var source = null;

      if (config != null) {
        if (hasValidRef(config)) {
          ref = config.ref;

          {
            warnIfStringRefCannotBeAutoConverted(config);
          }
        }

        if (hasValidKey(config)) {
          key = '' + config.key;
        }

        self = config.__self === undefined ? null : config.__self;
        source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

        for (propName in config) {
          if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
          }
        }
      } // Children can be more than one argument, and those are transferred onto
      // the newly allocated props object.


      var childrenLength = arguments.length - 2;

      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);

        for (var i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }

        {
          if (Object.freeze) {
            Object.freeze(childArray);
          }
        }

        props.children = childArray;
      } // Resolve default props


      if (type && type.defaultProps) {
        var defaultProps = type.defaultProps;

        for (propName in defaultProps) {
          if (props[propName] === undefined) {
            props[propName] = defaultProps[propName];
          }
        }
      }

      {
        if (key || ref) {
          var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

          if (key) {
            defineKeyPropWarningGetter(props, displayName);
          }

          if (ref) {
            defineRefPropWarningGetter(props, displayName);
          }
        }
      }

      return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
      return newElement;
    }
    /**
     * Clone and return a new ReactElement using element as the starting point.
     * See https://reactjs.org/docs/react-api.html#cloneelement
     */

    function cloneElement(element, config, children) {
      if (!!(element === null || element === undefined)) {
        {
          throw Error( "React.cloneElement(...): The argument must be a React element, but you passed " + element + "." );
        }
      }

      var propName; // Original props are copied

      var props = _assign({}, element.props); // Reserved names are extracted


      var key = element.key;
      var ref = element.ref; // Self is preserved since the owner is preserved.

      var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
      // transpiler, and the original source is probably a better indicator of the
      // true owner.

      var source = element._source; // Owner will be preserved, unless ref is overridden

      var owner = element._owner;

      if (config != null) {
        if (hasValidRef(config)) {
          // Silently steal the ref from the parent.
          ref = config.ref;
          owner = ReactCurrentOwner.current;
        }

        if (hasValidKey(config)) {
          key = '' + config.key;
        } // Remaining properties override existing props


        var defaultProps;

        if (element.type && element.type.defaultProps) {
          defaultProps = element.type.defaultProps;
        }

        for (propName in config) {
          if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            if (config[propName] === undefined && defaultProps !== undefined) {
              // Resolve default props
              props[propName] = defaultProps[propName];
            } else {
              props[propName] = config[propName];
            }
          }
        }
      } // Children can be more than one argument, and those are transferred onto
      // the newly allocated props object.


      var childrenLength = arguments.length - 2;

      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);

        for (var i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 2];
        }

        props.children = childArray;
      }

      return ReactElement(element.type, key, ref, self, source, owner, props);
    }
    /**
     * Verifies the object is a ReactElement.
     * See https://reactjs.org/docs/react-api.html#isvalidelement
     * @param {?object} object
     * @return {boolean} True if `object` is a ReactElement.
     * @final
     */

    function isValidElement(object) {
      return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }

    var SEPARATOR = '.';
    var SUBSEPARATOR = ':';
    /**
     * Escape and wrap key so it is safe to use as a reactid
     *
     * @param {string} key to be escaped.
     * @return {string} the escaped key.
     */

    function escape(key) {
      var escapeRegex = /[=:]/g;
      var escaperLookup = {
        '=': '=0',
        ':': '=2'
      };
      var escapedString = key.replace(escapeRegex, function (match) {
        return escaperLookup[match];
      });
      return '$' + escapedString;
    }
    /**
     * TODO: Test that a single child and an array with one item have the same key
     * pattern.
     */


    var didWarnAboutMaps = false;
    var userProvidedKeyEscapeRegex = /\/+/g;

    function escapeUserProvidedKey(text) {
      return text.replace(userProvidedKeyEscapeRegex, '$&/');
    }
    /**
     * Generate a key string that identifies a element within a set.
     *
     * @param {*} element A element that could contain a manual key.
     * @param {number} index Index that is used if a manual key is not provided.
     * @return {string}
     */


    function getElementKey(element, index) {
      // Do some typechecking here since we call this blindly. We want to ensure
      // that we don't block potential future ES APIs.
      if (typeof element === 'object' && element !== null && element.key != null) {
        // Explicit key
        return escape('' + element.key);
      } // Implicit key determined by the index in the set


      return index.toString(36);
    }

    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;

      if (type === 'undefined' || type === 'boolean') {
        // All of the above are perceived as null.
        children = null;
      }

      var invokeCallback = false;

      if (children === null) {
        invokeCallback = true;
      } else {
        switch (type) {
          case 'string':
          case 'number':
            invokeCallback = true;
            break;

          case 'object':
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
            }

        }
      }

      if (invokeCallback) {
        var _child = children;
        var mappedChild = callback(_child); // If it's the only child, treat the name as if it was wrapped in an array
        // so that it's consistent if the number of children grows:

        var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;

        if (Array.isArray(mappedChild)) {
          var escapedChildKey = '';

          if (childKey != null) {
            escapedChildKey = escapeUserProvidedKey(childKey) + '/';
          }

          mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
            return c;
          });
        } else if (mappedChild != null) {
          if (isValidElement(mappedChild)) {
            mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            escapedPrefix + ( // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            mappedChild.key && (!_child || _child.key !== mappedChild.key) ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
            escapeUserProvidedKey('' + mappedChild.key) + '/' : '') + childKey);
          }

          array.push(mappedChild);
        }

        return 1;
      }

      var child;
      var nextName;
      var subtreeCount = 0; // Count of children found in the current subtree.

      var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

      if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          nextName = nextNamePrefix + getElementKey(child, i);
          subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
        }
      } else {
        var iteratorFn = getIteratorFn(children);

        if (typeof iteratorFn === 'function') {
          var iterableChildren = children;

          {
            // Warn about using Maps as children
            if (iteratorFn === iterableChildren.entries) {
              if (!didWarnAboutMaps) {
                warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
              }

              didWarnAboutMaps = true;
            }
          }

          var iterator = iteratorFn.call(iterableChildren);
          var step;
          var ii = 0;

          while (!(step = iterator.next()).done) {
            child = step.value;
            nextName = nextNamePrefix + getElementKey(child, ii++);
            subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
          }
        } else if (type === 'object') {
          var childrenString = '' + children;

          {
            {
              throw Error( "Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). If you meant to render a collection of children, use an array instead." );
            }
          }
        }
      }

      return subtreeCount;
    }

    /**
     * Maps children that are typically specified as `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenmap
     *
     * The provided mapFunction(child, index) will be called for each
     * leaf child.
     *
     * @param {?*} children Children tree container.
     * @param {function(*, int)} func The map function.
     * @param {*} context Context for mapFunction.
     * @return {object} Object containing the ordered map of results.
     */
    function mapChildren(children, func, context) {
      if (children == null) {
        return children;
      }

      var result = [];
      var count = 0;
      mapIntoArray(children, result, '', '', function (child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    /**
     * Count the number of children that are typically specified as
     * `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrencount
     *
     * @param {?*} children Children tree container.
     * @return {number} The number of children.
     */


    function countChildren(children) {
      var n = 0;
      mapChildren(children, function () {
        n++; // Don't return anything
      });
      return n;
    }

    /**
     * Iterates through children that are typically specified as `props.children`.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
     *
     * The provided forEachFunc(child, index) will be called for each
     * leaf child.
     *
     * @param {?*} children Children tree container.
     * @param {function(*, int)} forEachFunc
     * @param {*} forEachContext Context for forEachContext.
     */
    function forEachChildren(children, forEachFunc, forEachContext) {
      mapChildren(children, function () {
        forEachFunc.apply(this, arguments); // Don't return anything.
      }, forEachContext);
    }
    /**
     * Flatten a children object (typically specified as `props.children`) and
     * return an array with appropriately re-keyed children.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
     */


    function toArray(children) {
      return mapChildren(children, function (child) {
        return child;
      }) || [];
    }
    /**
     * Returns the first child in a collection of children and verifies that there
     * is only one child in the collection.
     *
     * See https://reactjs.org/docs/react-api.html#reactchildrenonly
     *
     * The current implementation of this function assumes that a single child gets
     * passed without a wrapper, but the purpose of this helper function is to
     * abstract away the particular structure of children.
     *
     * @param {?object} children Child collection structure.
     * @return {ReactElement} The first and only `ReactElement` contained in the
     * structure.
     */


    function onlyChild(children) {
      if (!isValidElement(children)) {
        {
          throw Error( "React.Children.only expected to receive a single React element child." );
        }
      }

      return children;
    }

    function createContext(defaultValue, calculateChangedBits) {
      if (calculateChangedBits === undefined) {
        calculateChangedBits = null;
      } else {
        {
          if (calculateChangedBits !== null && typeof calculateChangedBits !== 'function') {
            error('createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits);
          }
        }
      }

      var context = {
        $$typeof: REACT_CONTEXT_TYPE,
        _calculateChangedBits: calculateChangedBits,
        // As a workaround to support multiple concurrent renderers, we categorize
        // some renderers as primary and others as secondary. We only expect
        // there to be two concurrent renderers at most: React Native (primary) and
        // Fabric (secondary); React DOM (primary) and React ART (secondary).
        // Secondary renderers store their context values on separate fields.
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        // Used to track how many concurrent renderers this context currently
        // supports within in a single renderer. Such as parallel server rendering.
        _threadCount: 0,
        // These are circular
        Provider: null,
        Consumer: null
      };
      context.Provider = {
        $$typeof: REACT_PROVIDER_TYPE,
        _context: context
      };
      var hasWarnedAboutUsingNestedContextConsumers = false;
      var hasWarnedAboutUsingConsumerProvider = false;
      var hasWarnedAboutDisplayNameOnConsumer = false;

      {
        // A separate object, but proxies back to the original context object for
        // backwards compatibility. It has a different $$typeof, so we can properly
        // warn for the incorrect usage of Context as a Consumer.
        var Consumer = {
          $$typeof: REACT_CONTEXT_TYPE,
          _context: context,
          _calculateChangedBits: context._calculateChangedBits
        }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

        Object.defineProperties(Consumer, {
          Provider: {
            get: function () {
              if (!hasWarnedAboutUsingConsumerProvider) {
                hasWarnedAboutUsingConsumerProvider = true;

                error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
              }

              return context.Provider;
            },
            set: function (_Provider) {
              context.Provider = _Provider;
            }
          },
          _currentValue: {
            get: function () {
              return context._currentValue;
            },
            set: function (_currentValue) {
              context._currentValue = _currentValue;
            }
          },
          _currentValue2: {
            get: function () {
              return context._currentValue2;
            },
            set: function (_currentValue2) {
              context._currentValue2 = _currentValue2;
            }
          },
          _threadCount: {
            get: function () {
              return context._threadCount;
            },
            set: function (_threadCount) {
              context._threadCount = _threadCount;
            }
          },
          Consumer: {
            get: function () {
              if (!hasWarnedAboutUsingNestedContextConsumers) {
                hasWarnedAboutUsingNestedContextConsumers = true;

                error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
              }

              return context.Consumer;
            }
          },
          displayName: {
            get: function () {
              return context.displayName;
            },
            set: function (displayName) {
              if (!hasWarnedAboutDisplayNameOnConsumer) {
                warn('Setting `displayName` on Context.Consumer has no effect. ' + "You should set it directly on the context with Context.displayName = '%s'.", displayName);

                hasWarnedAboutDisplayNameOnConsumer = true;
              }
            }
          }
        }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

        context.Consumer = Consumer;
      }

      {
        context._currentRenderer = null;
        context._currentRenderer2 = null;
      }

      return context;
    }

    var Uninitialized = -1;
    var Pending = 0;
    var Resolved = 1;
    var Rejected = 2;

    function lazyInitializer(payload) {
      if (payload._status === Uninitialized) {
        var ctor = payload._result;
        var thenable = ctor(); // Transition to the next state.

        var pending = payload;
        pending._status = Pending;
        pending._result = thenable;
        thenable.then(function (moduleObject) {
          if (payload._status === Pending) {
            var defaultExport = moduleObject.default;

            {
              if (defaultExport === undefined) {
                error('lazy: Expected the result of a dynamic import() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
                'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
              }
            } // Transition to the next state.


            var resolved = payload;
            resolved._status = Resolved;
            resolved._result = defaultExport;
          }
        }, function (error) {
          if (payload._status === Pending) {
            // Transition to the next state.
            var rejected = payload;
            rejected._status = Rejected;
            rejected._result = error;
          }
        });
      }

      if (payload._status === Resolved) {
        return payload._result;
      } else {
        throw payload._result;
      }
    }

    function lazy(ctor) {
      var payload = {
        // We use these fields to store the result.
        _status: -1,
        _result: ctor
      };
      var lazyType = {
        $$typeof: REACT_LAZY_TYPE,
        _payload: payload,
        _init: lazyInitializer
      };

      {
        // In production, this would just set it on the object.
        var defaultProps;
        var propTypes; // $FlowFixMe

        Object.defineProperties(lazyType, {
          defaultProps: {
            configurable: true,
            get: function () {
              return defaultProps;
            },
            set: function (newDefaultProps) {
              error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

              defaultProps = newDefaultProps; // Match production behavior more closely:
              // $FlowFixMe

              Object.defineProperty(lazyType, 'defaultProps', {
                enumerable: true
              });
            }
          },
          propTypes: {
            configurable: true,
            get: function () {
              return propTypes;
            },
            set: function (newPropTypes) {
              error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

              propTypes = newPropTypes; // Match production behavior more closely:
              // $FlowFixMe

              Object.defineProperty(lazyType, 'propTypes', {
                enumerable: true
              });
            }
          }
        });
      }

      return lazyType;
    }

    function forwardRef(render) {
      {
        if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
          error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
        } else if (typeof render !== 'function') {
          error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
        } else {
          if (render.length !== 0 && render.length !== 2) {
            error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
          }
        }

        if (render != null) {
          if (render.defaultProps != null || render.propTypes != null) {
            error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
          }
        }
      }

      var elementType = {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render: render
      };

      {
        var ownName;
        Object.defineProperty(elementType, 'displayName', {
          enumerable: false,
          configurable: true,
          get: function () {
            return ownName;
          },
          set: function (name) {
            ownName = name;

            if (render.displayName == null) {
              render.displayName = name;
            }
          }
        });
      }

      return elementType;
    }

    // Filter certain DOM attributes (e.g. src, href) if their values are empty strings.

    var enableScopeAPI = false; // Experimental Create Event Handle API.

    function isValidElementType(type) {
      if (typeof type === 'string' || typeof type === 'function') {
        return true;
      } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


      if (type === exports.Fragment || type === exports.Profiler || type === REACT_DEBUG_TRACING_MODE_TYPE || type === exports.StrictMode || type === exports.Suspense || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI ) {
        return true;
      }

      if (typeof type === 'object' && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
          return true;
        }
      }

      return false;
    }

    function memo(type, compare) {
      {
        if (!isValidElementType(type)) {
          error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
        }
      }

      var elementType = {
        $$typeof: REACT_MEMO_TYPE,
        type: type,
        compare: compare === undefined ? null : compare
      };

      {
        var ownName;
        Object.defineProperty(elementType, 'displayName', {
          enumerable: false,
          configurable: true,
          get: function () {
            return ownName;
          },
          set: function (name) {
            ownName = name;

            if (type.displayName == null) {
              type.displayName = name;
            }
          }
        });
      }

      return elementType;
    }

    function resolveDispatcher() {
      var dispatcher = ReactCurrentDispatcher.current;

      if (!(dispatcher !== null)) {
        {
          throw Error( "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem." );
        }
      }

      return dispatcher;
    }

    function useContext(Context, unstable_observedBits) {
      var dispatcher = resolveDispatcher();

      {
        if (unstable_observedBits !== undefined) {
          error('useContext() second argument is reserved for future ' + 'use in React. Passing it is not supported. ' + 'You passed: %s.%s', unstable_observedBits, typeof unstable_observedBits === 'number' && Array.isArray(arguments[2]) ? '\n\nDid you call array.map(useContext)? ' + 'Calling Hooks inside a loop is not supported. ' + 'Learn more at https://reactjs.org/link/rules-of-hooks' : '');
        } // TODO: add a more generic warning for invalid values.


        if (Context._context !== undefined) {
          var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
          // and nobody should be using this in existing code.

          if (realContext.Consumer === Context) {
            error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
          } else if (realContext.Provider === Context) {
            error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
          }
        }
      }

      return dispatcher.useContext(Context, unstable_observedBits);
    }
    function useState(initialState) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useState(initialState);
    }
    function useReducer(reducer, initialArg, init) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useReducer(reducer, initialArg, init);
    }
    function useRef(initialValue) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useRef(initialValue);
    }
    function useEffect(create, deps) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useEffect(create, deps);
    }
    function useLayoutEffect(create, deps) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useLayoutEffect(create, deps);
    }
    function useCallback(callback, deps) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useCallback(callback, deps);
    }
    function useMemo(create, deps) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useMemo(create, deps);
    }
    function useImperativeHandle(ref, create, deps) {
      var dispatcher = resolveDispatcher();
      return dispatcher.useImperativeHandle(ref, create, deps);
    }
    function useDebugValue(value, formatterFn) {
      {
        var dispatcher = resolveDispatcher();
        return dispatcher.useDebugValue(value, formatterFn);
      }
    }

    // Helpers to patch console.logs to avoid logging during side-effect free
    // replaying on render function. This currently only patches the object
    // lazily which won't cover if the log function was extracted eagerly.
    // We could also eagerly patch the method.
    var disabledDepth = 0;
    var prevLog;
    var prevInfo;
    var prevWarn;
    var prevError;
    var prevGroup;
    var prevGroupCollapsed;
    var prevGroupEnd;

    function disabledLog() {}

    disabledLog.__reactDisabledLog = true;
    function disableLogs() {
      {
        if (disabledDepth === 0) {
          /* eslint-disable react-internal/no-production-logging */
          prevLog = console.log;
          prevInfo = console.info;
          prevWarn = console.warn;
          prevError = console.error;
          prevGroup = console.group;
          prevGroupCollapsed = console.groupCollapsed;
          prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

          var props = {
            configurable: true,
            enumerable: true,
            value: disabledLog,
            writable: true
          }; // $FlowFixMe Flow thinks console is immutable.

          Object.defineProperties(console, {
            info: props,
            log: props,
            warn: props,
            error: props,
            group: props,
            groupCollapsed: props,
            groupEnd: props
          });
          /* eslint-enable react-internal/no-production-logging */
        }

        disabledDepth++;
      }
    }
    function reenableLogs() {
      {
        disabledDepth--;

        if (disabledDepth === 0) {
          /* eslint-disable react-internal/no-production-logging */
          var props = {
            configurable: true,
            enumerable: true,
            writable: true
          }; // $FlowFixMe Flow thinks console is immutable.

          Object.defineProperties(console, {
            log: _assign({}, props, {
              value: prevLog
            }),
            info: _assign({}, props, {
              value: prevInfo
            }),
            warn: _assign({}, props, {
              value: prevWarn
            }),
            error: _assign({}, props, {
              value: prevError
            }),
            group: _assign({}, props, {
              value: prevGroup
            }),
            groupCollapsed: _assign({}, props, {
              value: prevGroupCollapsed
            }),
            groupEnd: _assign({}, props, {
              value: prevGroupEnd
            })
          });
          /* eslint-enable react-internal/no-production-logging */
        }

        if (disabledDepth < 0) {
          error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
        }
      }
    }

    var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
    var prefix;
    function describeBuiltInComponentFrame(name, source, ownerFn) {
      {
        if (prefix === undefined) {
          // Extract the VM specific prefix used by each line.
          try {
            throw Error();
          } catch (x) {
            var match = x.stack.trim().match(/\n( *(at )?)/);
            prefix = match && match[1] || '';
          }
        } // We use the prefix to ensure our stacks line up with native stack frames.


        return '\n' + prefix + name;
      }
    }
    var reentry = false;
    var componentFrameCache;

    {
      var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
      componentFrameCache = new PossiblyWeakMap();
    }

    function describeNativeComponentFrame(fn, construct) {
      // If something asked for a stack inside a fake render, it should get ignored.
      if (!fn || reentry) {
        return '';
      }

      {
        var frame = componentFrameCache.get(fn);

        if (frame !== undefined) {
          return frame;
        }
      }

      var control;
      reentry = true;
      var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

      Error.prepareStackTrace = undefined;
      var previousDispatcher;

      {
        previousDispatcher = ReactCurrentDispatcher$1.current; // Set the dispatcher in DEV because this might be call in the render function
        // for warnings.

        ReactCurrentDispatcher$1.current = null;
        disableLogs();
      }

      try {
        // This should throw.
        if (construct) {
          // Something should be setting the props in the constructor.
          var Fake = function () {
            throw Error();
          }; // $FlowFixMe


          Object.defineProperty(Fake.prototype, 'props', {
            set: function () {
              // We use a throwing setter instead of frozen or non-writable props
              // because that won't throw in a non-strict mode function.
              throw Error();
            }
          });

          if (typeof Reflect === 'object' && Reflect.construct) {
            // We construct a different control for this case to include any extra
            // frames added by the construct call.
            try {
              Reflect.construct(Fake, []);
            } catch (x) {
              control = x;
            }

            Reflect.construct(fn, [], Fake);
          } else {
            try {
              Fake.call();
            } catch (x) {
              control = x;
            }

            fn.call(Fake.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (x) {
            control = x;
          }

          fn();
        }
      } catch (sample) {
        // This is inlined manually because closure doesn't do it for us.
        if (sample && control && typeof sample.stack === 'string') {
          // This extracts the first frame from the sample that isn't also in the control.
          // Skipping one frame that we assume is the frame that calls the two.
          var sampleLines = sample.stack.split('\n');
          var controlLines = control.stack.split('\n');
          var s = sampleLines.length - 1;
          var c = controlLines.length - 1;

          while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
            // We expect at least one stack frame to be shared.
            // Typically this will be the root most one. However, stack frames may be
            // cut off due to maximum stack limits. In this case, one maybe cut off
            // earlier than the other. We assume that the sample is longer or the same
            // and there for cut off earlier. So we should find the root most frame in
            // the sample somewhere in the control.
            c--;
          }

          for (; s >= 1 && c >= 0; s--, c--) {
            // Next we find the first one that isn't the same which should be the
            // frame that called our sample function and the control.
            if (sampleLines[s] !== controlLines[c]) {
              // In V8, the first line is describing the message but other VMs don't.
              // If we're about to return the first line, and the control is also on the same
              // line, that's a pretty good indicator that our sample threw at same line as
              // the control. I.e. before we entered the sample frame. So we ignore this result.
              // This can happen if you passed a class to function component, or non-function.
              if (s !== 1 || c !== 1) {
                do {
                  s--;
                  c--; // We may still have similar intermediate frames from the construct call.
                  // The next one that isn't the same should be our match though.

                  if (c < 0 || sampleLines[s] !== controlLines[c]) {
                    // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                    var _frame = '\n' + sampleLines[s].replace(' at new ', ' at ');

                    {
                      if (typeof fn === 'function') {
                        componentFrameCache.set(fn, _frame);
                      }
                    } // Return the line we found.


                    return _frame;
                  }
                } while (s >= 1 && c >= 0);
              }

              break;
            }
          }
        }
      } finally {
        reentry = false;

        {
          ReactCurrentDispatcher$1.current = previousDispatcher;
          reenableLogs();
        }

        Error.prepareStackTrace = previousPrepareStackTrace;
      } // Fallback to just using the name if we couldn't make it throw.


      var name = fn ? fn.displayName || fn.name : '';
      var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

      {
        if (typeof fn === 'function') {
          componentFrameCache.set(fn, syntheticFrame);
        }
      }

      return syntheticFrame;
    }
    function describeFunctionComponentFrame(fn, source, ownerFn) {
      {
        return describeNativeComponentFrame(fn, false);
      }
    }

    function shouldConstruct(Component) {
      var prototype = Component.prototype;
      return !!(prototype && prototype.isReactComponent);
    }

    function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

      if (type == null) {
        return '';
      }

      if (typeof type === 'function') {
        {
          return describeNativeComponentFrame(type, shouldConstruct(type));
        }
      }

      if (typeof type === 'string') {
        return describeBuiltInComponentFrame(type);
      }

      switch (type) {
        case exports.Suspense:
          return describeBuiltInComponentFrame('Suspense');

        case REACT_SUSPENSE_LIST_TYPE:
          return describeBuiltInComponentFrame('SuspenseList');
      }

      if (typeof type === 'object') {
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            return describeFunctionComponentFrame(type.render);

          case REACT_MEMO_TYPE:
            // Memo may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

          case REACT_BLOCK_TYPE:
            return describeFunctionComponentFrame(type._render);

          case REACT_LAZY_TYPE:
            {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;

              try {
                // Lazy may contain any component type so we recursively resolve it.
                return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
              } catch (x) {}
            }
        }
      }

      return '';
    }

    var loggedTypeFailures = {};
    var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

    function setCurrentlyValidatingElement(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
        } else {
          ReactDebugCurrentFrame$1.setExtraStackFrame(null);
        }
      }
    }

    function checkPropTypes(typeSpecs, values, location, componentName, element) {
      {
        // $FlowFixMe This is okay but Flow doesn't know it.
        var has = Function.call.bind(Object.prototype.hasOwnProperty);

        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
            // fail the render phase where it didn't fail before. So we log it.
            // After these have been cleaned up, we'll let them throw.

            try {
              // This is intentionally an invariant that gets caught. It's the same
              // behavior as without this statement except with a better message.
              if (typeof typeSpecs[typeSpecName] !== 'function') {
                var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
                err.name = 'Invariant Violation';
                throw err;
              }

              error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
            } catch (ex) {
              error$1 = ex;
            }

            if (error$1 && !(error$1 instanceof Error)) {
              setCurrentlyValidatingElement(element);

              error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

              setCurrentlyValidatingElement(null);
            }

            if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
              // Only monitor this failure once because there tends to be a lot of the
              // same error.
              loggedTypeFailures[error$1.message] = true;
              setCurrentlyValidatingElement(element);

              error('Failed %s type: %s', location, error$1.message);

              setCurrentlyValidatingElement(null);
            }
          }
        }
      }
    }

    function setCurrentlyValidatingElement$1(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          setExtraStackFrame(stack);
        } else {
          setExtraStackFrame(null);
        }
      }
    }

    var propTypesMisspellWarningShown;

    {
      propTypesMisspellWarningShown = false;
    }

    function getDeclarationErrorAddendum() {
      if (ReactCurrentOwner.current) {
        var name = getComponentName(ReactCurrentOwner.current.type);

        if (name) {
          return '\n\nCheck the render method of `' + name + '`.';
        }
      }

      return '';
    }

    function getSourceInfoErrorAddendum(source) {
      if (source !== undefined) {
        var fileName = source.fileName.replace(/^.*[\\\/]/, '');
        var lineNumber = source.lineNumber;
        return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
      }

      return '';
    }

    function getSourceInfoErrorAddendumForProps(elementProps) {
      if (elementProps !== null && elementProps !== undefined) {
        return getSourceInfoErrorAddendum(elementProps.__source);
      }

      return '';
    }
    /**
     * Warn if there's no key explicitly set on dynamic arrays of children or
     * object keys are not valid. This allows us to keep track of children between
     * updates.
     */


    var ownerHasKeyUseWarning = {};

    function getCurrentComponentErrorInfo(parentType) {
      var info = getDeclarationErrorAddendum();

      if (!info) {
        var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

        if (parentName) {
          info = "\n\nCheck the top-level render call using <" + parentName + ">.";
        }
      }

      return info;
    }
    /**
     * Warn if the element doesn't have an explicit key assigned to it.
     * This element is in an array. The array could grow and shrink or be
     * reordered. All children that haven't already been validated are required to
     * have a "key" property assigned to it. Error statuses are cached so a warning
     * will only be shown once.
     *
     * @internal
     * @param {ReactElement} element Element that requires a key.
     * @param {*} parentType element's parent's type.
     */


    function validateExplicitKey(element, parentType) {
      if (!element._store || element._store.validated || element.key != null) {
        return;
      }

      element._store.validated = true;
      var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

      if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
        return;
      }

      ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
      // property, it may be the creator of the child that's responsible for
      // assigning it a key.

      var childOwner = '';

      if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
        // Give the component that originally created this child.
        childOwner = " It was passed a child from " + getComponentName(element._owner.type) + ".";
      }

      {
        setCurrentlyValidatingElement$1(element);

        error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

        setCurrentlyValidatingElement$1(null);
      }
    }
    /**
     * Ensure that every element either is passed in a static location, in an
     * array with an explicit keys property defined, or in an object literal
     * with valid key property.
     *
     * @internal
     * @param {ReactNode} node Statically passed child of any type.
     * @param {*} parentType node's parent's type.
     */


    function validateChildKeys(node, parentType) {
      if (typeof node !== 'object') {
        return;
      }

      if (Array.isArray(node)) {
        for (var i = 0; i < node.length; i++) {
          var child = node[i];

          if (isValidElement(child)) {
            validateExplicitKey(child, parentType);
          }
        }
      } else if (isValidElement(node)) {
        // This element was passed in a valid location.
        if (node._store) {
          node._store.validated = true;
        }
      } else if (node) {
        var iteratorFn = getIteratorFn(node);

        if (typeof iteratorFn === 'function') {
          // Entry iterators used to provide implicit keys,
          // but now we print a separate warning for them later.
          if (iteratorFn !== node.entries) {
            var iterator = iteratorFn.call(node);
            var step;

            while (!(step = iterator.next()).done) {
              if (isValidElement(step.value)) {
                validateExplicitKey(step.value, parentType);
              }
            }
          }
        }
      }
    }
    /**
     * Given an element, validate that its props follow the propTypes definition,
     * provided by the type.
     *
     * @param {ReactElement} element
     */


    function validatePropTypes(element) {
      {
        var type = element.type;

        if (type === null || type === undefined || typeof type === 'string') {
          return;
        }

        var propTypes;

        if (typeof type === 'function') {
          propTypes = type.propTypes;
        } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        type.$$typeof === REACT_MEMO_TYPE)) {
          propTypes = type.propTypes;
        } else {
          return;
        }

        if (propTypes) {
          // Intentionally inside to avoid triggering lazy initializers:
          var name = getComponentName(type);
          checkPropTypes(propTypes, element.props, 'prop', name, element);
        } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
          propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

          var _name = getComponentName(type);

          error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
        }

        if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
          error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
        }
      }
    }
    /**
     * Given a fragment, validate that it can only be provided with fragment props
     * @param {ReactElement} fragment
     */


    function validateFragmentProps(fragment) {
      {
        var keys = Object.keys(fragment.props);

        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];

          if (key !== 'children' && key !== 'key') {
            setCurrentlyValidatingElement$1(fragment);

            error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

            setCurrentlyValidatingElement$1(null);
            break;
          }
        }

        if (fragment.ref !== null) {
          setCurrentlyValidatingElement$1(fragment);

          error('Invalid attribute `ref` supplied to `React.Fragment`.');

          setCurrentlyValidatingElement$1(null);
        }
      }
    }
    function createElementWithValidation(type, props, children) {
      var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
      // succeed and there will likely be errors in render.

      if (!validType) {
        var info = '';

        if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
          info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
        }

        var sourceInfo = getSourceInfoErrorAddendumForProps(props);

        if (sourceInfo) {
          info += sourceInfo;
        } else {
          info += getDeclarationErrorAddendum();
        }

        var typeString;

        if (type === null) {
          typeString = 'null';
        } else if (Array.isArray(type)) {
          typeString = 'array';
        } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
          typeString = "<" + (getComponentName(type.type) || 'Unknown') + " />";
          info = ' Did you accidentally export a JSX literal instead of a component?';
        } else {
          typeString = typeof type;
        }

        {
          error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
        }
      }

      var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
      // TODO: Drop this when these are no longer allowed as the type argument.

      if (element == null) {
        return element;
      } // Skip key warning if the type isn't valid since our key validation logic
      // doesn't expect a non-string/function type and can throw confusing errors.
      // We don't want exception behavior to differ between dev and prod.
      // (Rendering will throw with a helpful message and as soon as the type is
      // fixed, the key warnings will appear.)


      if (validType) {
        for (var i = 2; i < arguments.length; i++) {
          validateChildKeys(arguments[i], type);
        }
      }

      if (type === exports.Fragment) {
        validateFragmentProps(element);
      } else {
        validatePropTypes(element);
      }

      return element;
    }
    var didWarnAboutDeprecatedCreateFactory = false;
    function createFactoryWithValidation(type) {
      var validatedFactory = createElementWithValidation.bind(null, type);
      validatedFactory.type = type;

      {
        if (!didWarnAboutDeprecatedCreateFactory) {
          didWarnAboutDeprecatedCreateFactory = true;

          warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
        } // Legacy hook: remove it


        Object.defineProperty(validatedFactory, 'type', {
          enumerable: false,
          get: function () {
            warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');

            Object.defineProperty(this, 'type', {
              value: type
            });
            return type;
          }
        });
      }

      return validatedFactory;
    }
    function cloneElementWithValidation(element, props, children) {
      var newElement = cloneElement.apply(this, arguments);

      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], newElement.type);
      }

      validatePropTypes(newElement);
      return newElement;
    }

    {

      try {
        var frozenObject = Object.freeze({});
        /* eslint-disable no-new */

        new Map([[frozenObject, null]]);
        new Set([frozenObject]);
        /* eslint-enable no-new */
      } catch (e) {
      }
    }

    var createElement$1 =  createElementWithValidation ;
    var cloneElement$1 =  cloneElementWithValidation ;
    var createFactory =  createFactoryWithValidation ;
    var Children = {
      map: mapChildren,
      forEach: forEachChildren,
      count: countChildren,
      toArray: toArray,
      only: onlyChild
    };

    exports.Children = Children;
    exports.Component = Component;
    exports.PureComponent = PureComponent;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
    exports.cloneElement = cloneElement$1;
    exports.createContext = createContext;
    exports.createElement = createElement$1;
    exports.createFactory = createFactory;
    exports.createRef = createRef;
    exports.forwardRef = forwardRef;
    exports.isValidElement = isValidElement;
    exports.lazy = lazy;
    exports.memo = memo;
    exports.useCallback = useCallback;
    exports.useContext = useContext;
    exports.useDebugValue = useDebugValue;
    exports.useEffect = useEffect;
    exports.useImperativeHandle = useImperativeHandle;
    exports.useLayoutEffect = useLayoutEffect;
    exports.useMemo = useMemo;
    exports.useReducer = useReducer;
    exports.useRef = useRef;
    exports.useState = useState;
    exports.version = ReactVersion;
      })();
    }
    });

    var react = createCommonjsModule(function (module) {

    {
      module.exports = react_development;
    }
    });

    function stylis_min (W) {
      function M(d, c, e, h, a) {
        for (var m = 0, b = 0, v = 0, n = 0, q, g, x = 0, K = 0, k, u = k = q = 0, l = 0, r = 0, I = 0, t = 0, B = e.length, J = B - 1, y, f = '', p = '', F = '', G = '', C; l < B;) {
          g = e.charCodeAt(l);
          l === J && 0 !== b + n + v + m && (0 !== b && (g = 47 === b ? 10 : 47), n = v = m = 0, B++, J++);

          if (0 === b + n + v + m) {
            if (l === J && (0 < r && (f = f.replace(N, '')), 0 < f.trim().length)) {
              switch (g) {
                case 32:
                case 9:
                case 59:
                case 13:
                case 10:
                  break;

                default:
                  f += e.charAt(l);
              }

              g = 59;
            }

            switch (g) {
              case 123:
                f = f.trim();
                q = f.charCodeAt(0);
                k = 1;

                for (t = ++l; l < B;) {
                  switch (g = e.charCodeAt(l)) {
                    case 123:
                      k++;
                      break;

                    case 125:
                      k--;
                      break;

                    case 47:
                      switch (g = e.charCodeAt(l + 1)) {
                        case 42:
                        case 47:
                          a: {
                            for (u = l + 1; u < J; ++u) {
                              switch (e.charCodeAt(u)) {
                                case 47:
                                  if (42 === g && 42 === e.charCodeAt(u - 1) && l + 2 !== u) {
                                    l = u + 1;
                                    break a;
                                  }

                                  break;

                                case 10:
                                  if (47 === g) {
                                    l = u + 1;
                                    break a;
                                  }

                              }
                            }

                            l = u;
                          }

                      }

                      break;

                    case 91:
                      g++;

                    case 40:
                      g++;

                    case 34:
                    case 39:
                      for (; l++ < J && e.charCodeAt(l) !== g;) {
                      }

                  }

                  if (0 === k) break;
                  l++;
                }

                k = e.substring(t, l);
                0 === q && (q = (f = f.replace(ca, '').trim()).charCodeAt(0));

                switch (q) {
                  case 64:
                    0 < r && (f = f.replace(N, ''));
                    g = f.charCodeAt(1);

                    switch (g) {
                      case 100:
                      case 109:
                      case 115:
                      case 45:
                        r = c;
                        break;

                      default:
                        r = O;
                    }

                    k = M(c, r, k, g, a + 1);
                    t = k.length;
                    0 < A && (r = X(O, f, I), C = H(3, k, r, c, D, z, t, g, a, h), f = r.join(''), void 0 !== C && 0 === (t = (k = C.trim()).length) && (g = 0, k = ''));
                    if (0 < t) switch (g) {
                      case 115:
                        f = f.replace(da, ea);

                      case 100:
                      case 109:
                      case 45:
                        k = f + '{' + k + '}';
                        break;

                      case 107:
                        f = f.replace(fa, '$1 $2');
                        k = f + '{' + k + '}';
                        k = 1 === w || 2 === w && L('@' + k, 3) ? '@-webkit-' + k + '@' + k : '@' + k;
                        break;

                      default:
                        k = f + k, 112 === h && (k = (p += k, ''));
                    } else k = '';
                    break;

                  default:
                    k = M(c, X(c, f, I), k, h, a + 1);
                }

                F += k;
                k = I = r = u = q = 0;
                f = '';
                g = e.charCodeAt(++l);
                break;

              case 125:
              case 59:
                f = (0 < r ? f.replace(N, '') : f).trim();
                if (1 < (t = f.length)) switch (0 === u && (q = f.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (f = f.replace(' ', ':')).length), 0 < A && void 0 !== (C = H(1, f, c, d, D, z, p.length, h, a, h)) && 0 === (t = (f = C.trim()).length) && (f = '\x00\x00'), q = f.charCodeAt(0), g = f.charCodeAt(1), q) {
                  case 0:
                    break;

                  case 64:
                    if (105 === g || 99 === g) {
                      G += f + e.charAt(l);
                      break;
                    }

                  default:
                    58 !== f.charCodeAt(t - 1) && (p += P(f, q, g, f.charCodeAt(2)));
                }
                I = r = u = q = 0;
                f = '';
                g = e.charCodeAt(++l);
            }
          }

          switch (g) {
            case 13:
            case 10:
              47 === b ? b = 0 : 0 === 1 + q && 107 !== h && 0 < f.length && (r = 1, f += '\x00');
              0 < A * Y && H(0, f, c, d, D, z, p.length, h, a, h);
              z = 1;
              D++;
              break;

            case 59:
            case 125:
              if (0 === b + n + v + m) {
                z++;
                break;
              }

            default:
              z++;
              y = e.charAt(l);

              switch (g) {
                case 9:
                case 32:
                  if (0 === n + m + b) switch (x) {
                    case 44:
                    case 58:
                    case 9:
                    case 32:
                      y = '';
                      break;

                    default:
                      32 !== g && (y = ' ');
                  }
                  break;

                case 0:
                  y = '\\0';
                  break;

                case 12:
                  y = '\\f';
                  break;

                case 11:
                  y = '\\v';
                  break;

                case 38:
                  0 === n + b + m && (r = I = 1, y = '\f' + y);
                  break;

                case 108:
                  if (0 === n + b + m + E && 0 < u) switch (l - u) {
                    case 2:
                      112 === x && 58 === e.charCodeAt(l - 3) && (E = x);

                    case 8:
                      111 === K && (E = K);
                  }
                  break;

                case 58:
                  0 === n + b + m && (u = l);
                  break;

                case 44:
                  0 === b + v + n + m && (r = 1, y += '\r');
                  break;

                case 34:
                case 39:
                  0 === b && (n = n === g ? 0 : 0 === n ? g : n);
                  break;

                case 91:
                  0 === n + b + v && m++;
                  break;

                case 93:
                  0 === n + b + v && m--;
                  break;

                case 41:
                  0 === n + b + m && v--;
                  break;

                case 40:
                  if (0 === n + b + m) {
                    if (0 === q) switch (2 * x + 3 * K) {
                      case 533:
                        break;

                      default:
                        q = 1;
                    }
                    v++;
                  }

                  break;

                case 64:
                  0 === b + v + n + m + u + k && (k = 1);
                  break;

                case 42:
                case 47:
                  if (!(0 < n + m + v)) switch (b) {
                    case 0:
                      switch (2 * g + 3 * e.charCodeAt(l + 1)) {
                        case 235:
                          b = 47;
                          break;

                        case 220:
                          t = l, b = 42;
                      }

                      break;

                    case 42:
                      47 === g && 42 === x && t + 2 !== l && (33 === e.charCodeAt(t + 2) && (p += e.substring(t, l + 1)), y = '', b = 0);
                  }
              }

              0 === b && (f += y);
          }

          K = x;
          x = g;
          l++;
        }

        t = p.length;

        if (0 < t) {
          r = c;
          if (0 < A && (C = H(2, p, r, d, D, z, t, h, a, h), void 0 !== C && 0 === (p = C).length)) return G + p + F;
          p = r.join(',') + '{' + p + '}';

          if (0 !== w * E) {
            2 !== w || L(p, 2) || (E = 0);

            switch (E) {
              case 111:
                p = p.replace(ha, ':-moz-$1') + p;
                break;

              case 112:
                p = p.replace(Q, '::-webkit-input-$1') + p.replace(Q, '::-moz-$1') + p.replace(Q, ':-ms-input-$1') + p;
            }

            E = 0;
          }
        }

        return G + p + F;
      }

      function X(d, c, e) {
        var h = c.trim().split(ia);
        c = h;
        var a = h.length,
            m = d.length;

        switch (m) {
          case 0:
          case 1:
            var b = 0;

            for (d = 0 === m ? '' : d[0] + ' '; b < a; ++b) {
              c[b] = Z(d, c[b], e).trim();
            }

            break;

          default:
            var v = b = 0;

            for (c = []; b < a; ++b) {
              for (var n = 0; n < m; ++n) {
                c[v++] = Z(d[n] + ' ', h[b], e).trim();
              }
            }

        }

        return c;
      }

      function Z(d, c, e) {
        var h = c.charCodeAt(0);
        33 > h && (h = (c = c.trim()).charCodeAt(0));

        switch (h) {
          case 38:
            return c.replace(F, '$1' + d.trim());

          case 58:
            return d.trim() + c.replace(F, '$1' + d.trim());

          default:
            if (0 < 1 * e && 0 < c.indexOf('\f')) return c.replace(F, (58 === d.charCodeAt(0) ? '' : '$1') + d.trim());
        }

        return d + c;
      }

      function P(d, c, e, h) {
        var a = d + ';',
            m = 2 * c + 3 * e + 4 * h;

        if (944 === m) {
          d = a.indexOf(':', 9) + 1;
          var b = a.substring(d, a.length - 1).trim();
          b = a.substring(0, d).trim() + b + ';';
          return 1 === w || 2 === w && L(b, 1) ? '-webkit-' + b + b : b;
        }

        if (0 === w || 2 === w && !L(a, 1)) return a;

        switch (m) {
          case 1015:
            return 97 === a.charCodeAt(10) ? '-webkit-' + a + a : a;

          case 951:
            return 116 === a.charCodeAt(3) ? '-webkit-' + a + a : a;

          case 963:
            return 110 === a.charCodeAt(5) ? '-webkit-' + a + a : a;

          case 1009:
            if (100 !== a.charCodeAt(4)) break;

          case 969:
          case 942:
            return '-webkit-' + a + a;

          case 978:
            return '-webkit-' + a + '-moz-' + a + a;

          case 1019:
          case 983:
            return '-webkit-' + a + '-moz-' + a + '-ms-' + a + a;

          case 883:
            if (45 === a.charCodeAt(8)) return '-webkit-' + a + a;
            if (0 < a.indexOf('image-set(', 11)) return a.replace(ja, '$1-webkit-$2') + a;
            break;

          case 932:
            if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
              case 103:
                return '-webkit-box-' + a.replace('-grow', '') + '-webkit-' + a + '-ms-' + a.replace('grow', 'positive') + a;

              case 115:
                return '-webkit-' + a + '-ms-' + a.replace('shrink', 'negative') + a;

              case 98:
                return '-webkit-' + a + '-ms-' + a.replace('basis', 'preferred-size') + a;
            }
            return '-webkit-' + a + '-ms-' + a + a;

          case 964:
            return '-webkit-' + a + '-ms-flex-' + a + a;

          case 1023:
            if (99 !== a.charCodeAt(8)) break;
            b = a.substring(a.indexOf(':', 15)).replace('flex-', '').replace('space-between', 'justify');
            return '-webkit-box-pack' + b + '-webkit-' + a + '-ms-flex-pack' + b + a;

          case 1005:
            return ka.test(a) ? a.replace(aa, ':-webkit-') + a.replace(aa, ':-moz-') + a : a;

          case 1e3:
            b = a.substring(13).trim();
            c = b.indexOf('-') + 1;

            switch (b.charCodeAt(0) + b.charCodeAt(c)) {
              case 226:
                b = a.replace(G, 'tb');
                break;

              case 232:
                b = a.replace(G, 'tb-rl');
                break;

              case 220:
                b = a.replace(G, 'lr');
                break;

              default:
                return a;
            }

            return '-webkit-' + a + '-ms-' + b + a;

          case 1017:
            if (-1 === a.indexOf('sticky', 9)) break;

          case 975:
            c = (a = d).length - 10;
            b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(':', 7) + 1).trim();

            switch (m = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
              case 203:
                if (111 > b.charCodeAt(8)) break;

              case 115:
                a = a.replace(b, '-webkit-' + b) + ';' + a;
                break;

              case 207:
              case 102:
                a = a.replace(b, '-webkit-' + (102 < m ? 'inline-' : '') + 'box') + ';' + a.replace(b, '-webkit-' + b) + ';' + a.replace(b, '-ms-' + b + 'box') + ';' + a;
            }

            return a + ';';

          case 938:
            if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
              case 105:
                return b = a.replace('-items', ''), '-webkit-' + a + '-webkit-box-' + b + '-ms-flex-' + b + a;

              case 115:
                return '-webkit-' + a + '-ms-flex-item-' + a.replace(ba, '') + a;

              default:
                return '-webkit-' + a + '-ms-flex-line-pack' + a.replace('align-content', '').replace(ba, '') + a;
            }
            break;

          case 973:
          case 989:
            if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

          case 931:
          case 953:
            if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(':') + 1)).charCodeAt(0) ? P(d.replace('stretch', 'fill-available'), c, e, h).replace(':fill-available', ':stretch') : a.replace(b, '-webkit-' + b) + a.replace(b, '-moz-' + b.replace('fill-', '')) + a;
            break;

          case 962:
            if (a = '-webkit-' + a + (102 === a.charCodeAt(5) ? '-ms-' + a : '') + a, 211 === e + h && 105 === a.charCodeAt(13) && 0 < a.indexOf('transform', 10)) return a.substring(0, a.indexOf(';', 27) + 1).replace(ma, '$1-webkit-$2') + a;
        }

        return a;
      }

      function L(d, c) {
        var e = d.indexOf(1 === c ? ':' : '{'),
            h = d.substring(0, 3 !== c ? e : 10);
        e = d.substring(e + 1, d.length - 1);
        return R(2 !== c ? h : h.replace(na, '$1'), e, c);
      }

      function ea(d, c) {
        var e = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
        return e !== c + ';' ? e.replace(oa, ' or ($1)').substring(4) : '(' + c + ')';
      }

      function H(d, c, e, h, a, m, b, v, n, q) {
        for (var g = 0, x = c, w; g < A; ++g) {
          switch (w = S[g].call(B, d, x, e, h, a, m, b, v, n, q)) {
            case void 0:
            case !1:
            case !0:
            case null:
              break;

            default:
              x = w;
          }
        }

        if (x !== c) return x;
      }

      function T(d) {
        switch (d) {
          case void 0:
          case null:
            A = S.length = 0;
            break;

          default:
            if ('function' === typeof d) S[A++] = d;else if ('object' === typeof d) for (var c = 0, e = d.length; c < e; ++c) {
              T(d[c]);
            } else Y = !!d | 0;
        }

        return T;
      }

      function U(d) {
        d = d.prefix;
        void 0 !== d && (R = null, d ? 'function' !== typeof d ? w = 1 : (w = 2, R = d) : w = 0);
        return U;
      }

      function B(d, c) {
        var e = d;
        33 > e.charCodeAt(0) && (e = e.trim());
        V = e;
        e = [V];

        if (0 < A) {
          var h = H(-1, c, e, e, D, z, 0, 0, 0, 0);
          void 0 !== h && 'string' === typeof h && (c = h);
        }

        var a = M(O, e, c, 0, 0);
        0 < A && (h = H(-2, a, e, e, D, z, a.length, 0, 0, 0), void 0 !== h && (a = h));
        V = '';
        E = 0;
        z = D = 1;
        return a;
      }

      var ca = /^\0+/g,
          N = /[\0\r\f]/g,
          aa = /: */g,
          ka = /zoo|gra/,
          ma = /([,: ])(transform)/g,
          ia = /,\r+?/g,
          F = /([\t\r\n ])*\f?&/g,
          fa = /@(k\w+)\s*(\S*)\s*/,
          Q = /::(place)/g,
          ha = /:(read-only)/g,
          G = /[svh]\w+-[tblr]{2}/,
          da = /\(\s*(.*)\s*\)/g,
          oa = /([\s\S]*?);/g,
          ba = /-self|flex-/g,
          na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
          la = /stretch|:\s*\w+\-(?:conte|avail)/,
          ja = /([^-])(image-set\()/,
          z = 1,
          D = 1,
          E = 0,
          w = 1,
          O = [],
          S = [],
          A = 0,
          R = null,
          Y = 0,
          V = '';
      B.use = T;
      B.set = U;
      void 0 !== W && U(W);
      return B;
    }

    var unitlessKeys = {
      animationIterationCount: 1,
      borderImageOutset: 1,
      borderImageSlice: 1,
      borderImageWidth: 1,
      boxFlex: 1,
      boxFlexGroup: 1,
      boxOrdinalGroup: 1,
      columnCount: 1,
      columns: 1,
      flex: 1,
      flexGrow: 1,
      flexPositive: 1,
      flexShrink: 1,
      flexNegative: 1,
      flexOrder: 1,
      gridRow: 1,
      gridRowEnd: 1,
      gridRowSpan: 1,
      gridRowStart: 1,
      gridColumn: 1,
      gridColumnEnd: 1,
      gridColumnSpan: 1,
      gridColumnStart: 1,
      msGridRow: 1,
      msGridRowSpan: 1,
      msGridColumn: 1,
      msGridColumnSpan: 1,
      fontWeight: 1,
      lineHeight: 1,
      opacity: 1,
      order: 1,
      orphans: 1,
      tabSize: 1,
      widows: 1,
      zIndex: 1,
      zoom: 1,
      WebkitLineClamp: 1,
      // SVG-related properties
      fillOpacity: 1,
      floodOpacity: 1,
      stopOpacity: 1,
      strokeDasharray: 1,
      strokeDashoffset: 1,
      strokeMiterlimit: 1,
      strokeOpacity: 1,
      strokeWidth: 1
    };

    function memoize(fn) {
      var cache = {};
      return function (arg) {
        if (cache[arg] === undefined) cache[arg] = fn(arg);
        return cache[arg];
      };
    }

    var reactPropsRegex = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|download|draggable|encType|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|inert|itemProp|itemScope|itemType|itemID|itemRef|on|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/; // https://esbench.com/bench/5bfee68a4cd7e6009ef61d23

    var index = memoize(function (prop) {
      return reactPropsRegex.test(prop) || prop.charCodeAt(0) === 111
      /* o */
      && prop.charCodeAt(1) === 110
      /* n */
      && prop.charCodeAt(2) < 91;
    }
    /* Z+1 */
    );

    /**
     * Copyright 2015, Yahoo! Inc.
     * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
     */
    var REACT_STATICS = {
      childContextTypes: true,
      contextType: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      getDerivedStateFromError: true,
      getDerivedStateFromProps: true,
      mixins: true,
      propTypes: true,
      type: true
    };
    var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      callee: true,
      arguments: true,
      arity: true
    };
    var FORWARD_REF_STATICS = {
      '$$typeof': true,
      render: true,
      defaultProps: true,
      displayName: true,
      propTypes: true
    };
    var MEMO_STATICS = {
      '$$typeof': true,
      compare: true,
      defaultProps: true,
      displayName: true,
      propTypes: true,
      type: true
    };
    var TYPE_STATICS = {};
    TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
    TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

    function getStatics(component) {
      // React v16.11 and below
      if (reactIs.isMemo(component)) {
        return MEMO_STATICS;
      } // React v16.12 and above


      return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
    }

    var defineProperty = Object.defineProperty;
    var getOwnPropertyNames = Object.getOwnPropertyNames;
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var getPrototypeOf = Object.getPrototypeOf;
    var objectPrototype = Object.prototype;
    function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
      if (typeof sourceComponent !== 'string') {
        // don't hoist over string (html) components
        if (objectPrototype) {
          var inheritedComponent = getPrototypeOf(sourceComponent);

          if (inheritedComponent && inheritedComponent !== objectPrototype) {
            hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
          }
        }

        var keys = getOwnPropertyNames(sourceComponent);

        if (getOwnPropertySymbols) {
          keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }

        var targetStatics = getStatics(targetComponent);
        var sourceStatics = getStatics(sourceComponent);

        for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];

          if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
            var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

            try {
              // Avoid failures from read-only properties
              defineProperty(targetComponent, key, descriptor);
            } catch (e) {}
          }
        }
      }

      return targetComponent;
    }

    var hoistNonReactStatics_cjs = hoistNonReactStatics;

    function v(){return (v=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r]);}return e}).apply(this,arguments)}var g=function(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n},S=function(t){return null!==t&&"object"==typeof t&&"[object Object]"===(t.toString?t.toString():Object.prototype.toString.call(t))&&!reactIs.typeOf(t)},w=Object.freeze([]),E=Object.freeze({});function b(e){return "function"==typeof e}function _(e){return "string"==typeof e&&e||e.displayName||e.name||"Component"}function N(e){return e&&"string"==typeof e.styledComponentId}var A="undefined"!=typeof process&&(process.env.REACT_APP_SC_ATTR||process.env.SC_ATTR)||"data-styled",I="undefined"!=typeof window&&"HTMLElement"in window,P=Boolean("boolean"==typeof SC_DISABLE_SPEEDY?SC_DISABLE_SPEEDY:"undefined"!=typeof process&&void 0!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&""!==process.env.REACT_APP_SC_DISABLE_SPEEDY?"false"!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&process.env.REACT_APP_SC_DISABLE_SPEEDY:"undefined"!=typeof process&&void 0!==process.env.SC_DISABLE_SPEEDY&&""!==process.env.SC_DISABLE_SPEEDY?"false"!==process.env.SC_DISABLE_SPEEDY&&process.env.SC_DISABLE_SPEEDY:"production"!=="development"),O={},R={1:"Cannot create styled-component for component: %s.\n\n",2:"Can't collect styles once you've consumed a `ServerStyleSheet`'s styles! `ServerStyleSheet` is a one off instance for each server-side render cycle.\n\n- Are you trying to reuse it across renders?\n- Are you accidentally calling collectStyles twice?\n\n",3:"Streaming SSR is only supported in a Node.js environment; Please do not try to call this method in the browser.\n\n",4:"The `StyleSheetManager` expects a valid target or sheet prop!\n\n- Does this error occur on the client and is your target falsy?\n- Does this error occur on the server and is the sheet falsy?\n\n",5:"The clone method cannot be used on the client!\n\n- Are you running in a client-like environment on the server?\n- Are you trying to run SSR on the client?\n\n",6:"Trying to insert a new style tag, but the given Node is unmounted!\n\n- Are you using a custom target that isn't mounted?\n- Does your document not have a valid head element?\n- Have you accidentally removed a style tag manually?\n\n",7:'ThemeProvider: Please return an object from your "theme" prop function, e.g.\n\n```js\ntheme={() => ({})}\n```\n\n',8:'ThemeProvider: Please make your "theme" prop an object.\n\n',9:"Missing document `<head>`\n\n",10:"Cannot find a StyleSheet instance. Usually this happens if there are multiple copies of styled-components loaded at once. Check out this issue for how to troubleshoot and fix the common cases where this situation can happen: https://github.com/styled-components/styled-components/issues/1941#issuecomment-417862021\n\n",11:"_This error was replaced with a dev-time warning, it will be deleted for v4 final._ [createGlobalStyle] received children which will not be rendered. Please use the component without passing children elements.\n\n",12:"It seems you are interpolating a keyframe declaration (%s) into an untagged string. This was supported in styled-components v3, but is not longer supported in v4 as keyframes are now injected on-demand. Please wrap your string in the css\\`\\` helper which ensures the styles are injected correctly. See https://www.styled-components.com/docs/api#css\n\n",13:"%s is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.\n\n",14:'ThemeProvider: "theme" prop is required.\n\n',15:"A stylis plugin has been supplied that is not named. We need a name for each plugin to be able to prevent styling collisions between different stylis configurations within the same app. Before you pass your plugin to `<StyleSheetManager stylisPlugins={[]}>`, please make sure each plugin is uniquely-named, e.g.\n\n```js\nObject.defineProperty(importedPlugin, 'name', { value: 'some-unique-name' });\n```\n\n",16:"Reached the limit of how many styled components may be created at group %s.\nYou may only create up to 1,073,741,824 components. If you're creating components dynamically,\nas for instance in your render method then you may be running into this limitation.\n\n",17:"CSSStyleSheet could not be found on HTMLStyleElement.\nHas styled-components' style tag been unmounted or altered by another script?\n"};function D(){for(var e=arguments.length<=0?void 0:arguments[0],t=[],n=1,r=arguments.length;n<r;n+=1)t.push(n<0||arguments.length<=n?void 0:arguments[n]);return t.forEach((function(t){e=e.replace(/%[a-z]/,t);})),e}function j(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];throw new Error(D.apply(void 0,[R[e]].concat(n)).trim())}var T=function(){function e(e){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=e;}var t=e.prototype;return t.indexOfGroup=function(e){for(var t=0,n=0;n<e;n++)t+=this.groupSizes[n];return t},t.insertRules=function(e,t){if(e>=this.groupSizes.length){for(var n=this.groupSizes,r=n.length,o=r;e>=o;)(o<<=1)<0&&j(16,""+e);this.groupSizes=new Uint32Array(o),this.groupSizes.set(n),this.length=o;for(var i=r;i<o;i++)this.groupSizes[i]=0;}for(var s=this.indexOfGroup(e+1),a=0,c=t.length;a<c;a++)this.tag.insertRule(s,t[a])&&(this.groupSizes[e]++,s++);},t.clearGroup=function(e){if(e<this.length){var t=this.groupSizes[e],n=this.indexOfGroup(e),r=n+t;this.groupSizes[e]=0;for(var o=n;o<r;o++)this.tag.deleteRule(n);}},t.getGroup=function(e){var t="";if(e>=this.length||0===this.groupSizes[e])return t;for(var n=this.groupSizes[e],r=this.indexOfGroup(e),o=r+n,i=r;i<o;i++)t+=this.tag.getRule(i)+"/*!sc*/\n";return t},e}(),k=new Map,x=new Map,V=1,B=function(e){if(k.has(e))return k.get(e);for(;x.has(V);)V++;var t=V++;return ((0|t)<0||t>1<<30)&&j(16,""+t),k.set(e,t),x.set(t,e),t},M=function(e){return x.get(e)},z=function(e,t){k.set(e,t),x.set(t,e);},L="style["+A+'][data-styled-version="5.3.0"]',G=new RegExp("^"+A+'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)'),F=function(e,t,n){for(var r,o=n.split(","),i=0,s=o.length;i<s;i++)(r=o[i])&&e.registerName(t,r);},Y=function(e,t){for(var n=t.innerHTML.split("/*!sc*/\n"),r=[],o=0,i=n.length;o<i;o++){var s=n[o].trim();if(s){var a=s.match(G);if(a){var c=0|parseInt(a[1],10),u=a[2];0!==c&&(z(u,c),F(e,u,a[3]),e.getTag().insertRules(c,r)),r.length=0;}else r.push(s);}}},q=function(){return "undefined"!=typeof window&&void 0!==window.__webpack_nonce__?window.__webpack_nonce__:null},H=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=function(e){for(var t=e.childNodes,n=t.length;n>=0;n--){var r=t[n];if(r&&1===r.nodeType&&r.hasAttribute(A))return r}}(n),i=void 0!==o?o.nextSibling:null;r.setAttribute(A,"active"),r.setAttribute("data-styled-version","5.3.0");var s=q();return s&&r.setAttribute("nonce",s),n.insertBefore(r,i),r},$=function(){function e(e){var t=this.element=H(e);t.appendChild(document.createTextNode("")),this.sheet=function(e){if(e.sheet)return e.sheet;for(var t=document.styleSheets,n=0,r=t.length;n<r;n++){var o=t[n];if(o.ownerNode===e)return o}j(17);}(t),this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){try{return this.sheet.insertRule(t,e),this.length++,!0}catch(e){return !1}},t.deleteRule=function(e){this.sheet.deleteRule(e),this.length--;},t.getRule=function(e){var t=this.sheet.cssRules[e];return void 0!==t&&"string"==typeof t.cssText?t.cssText:""},e}(),W=function(){function e(e){var t=this.element=H(e);this.nodes=t.childNodes,this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){if(e<=this.length&&e>=0){var n=document.createTextNode(t),r=this.nodes[e];return this.element.insertBefore(n,r||null),this.length++,!0}return !1},t.deleteRule=function(e){this.element.removeChild(this.nodes[e]),this.length--;},t.getRule=function(e){return e<this.length?this.nodes[e].textContent:""},e}(),U=function(){function e(e){this.rules=[],this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){return e<=this.length&&(this.rules.splice(e,0,t),this.length++,!0)},t.deleteRule=function(e){this.rules.splice(e,1),this.length--;},t.getRule=function(e){return e<this.length?this.rules[e]:""},e}(),J=I,X={isServer:!I,useCSSOMInjection:!P},Z=function(){function e(e,t,n){void 0===e&&(e=E),void 0===t&&(t={}),this.options=v({},X,{},e),this.gs=t,this.names=new Map(n),!this.options.isServer&&I&&J&&(J=!1,function(e){for(var t=document.querySelectorAll(L),n=0,r=t.length;n<r;n++){var o=t[n];o&&"active"!==o.getAttribute(A)&&(Y(e,o),o.parentNode&&o.parentNode.removeChild(o));}}(this));}e.registerId=function(e){return B(e)};var t=e.prototype;return t.reconstructWithOptions=function(t,n){return void 0===n&&(n=!0),new e(v({},this.options,{},t),this.gs,n&&this.names||void 0)},t.allocateGSInstance=function(e){return this.gs[e]=(this.gs[e]||0)+1},t.getTag=function(){return this.tag||(this.tag=(n=(t=this.options).isServer,r=t.useCSSOMInjection,o=t.target,e=n?new U(o):r?new $(o):new W(o),new T(e)));var e,t,n,r,o;},t.hasNameForId=function(e,t){return this.names.has(e)&&this.names.get(e).has(t)},t.registerName=function(e,t){if(B(e),this.names.has(e))this.names.get(e).add(t);else {var n=new Set;n.add(t),this.names.set(e,n);}},t.insertRules=function(e,t,n){this.registerName(e,t),this.getTag().insertRules(B(e),n);},t.clearNames=function(e){this.names.has(e)&&this.names.get(e).clear();},t.clearRules=function(e){this.getTag().clearGroup(B(e)),this.clearNames(e);},t.clearTag=function(){this.tag=void 0;},t.toString=function(){return function(e){for(var t=e.getTag(),n=t.length,r="",o=0;o<n;o++){var i=M(o);if(void 0!==i){var s=e.names.get(i),a=t.getGroup(o);if(void 0!==s&&0!==a.length){var c=A+".g"+o+'[id="'+i+'"]',u="";void 0!==s&&s.forEach((function(e){e.length>0&&(u+=e+",");})),r+=""+a+c+'{content:"'+u+'"}/*!sc*/\n';}}}return r}(this)},e}(),K=/(a)(d)/gi,Q=function(e){return String.fromCharCode(e+(e>25?39:97))};function ee(e){var t,n="";for(t=Math.abs(e);t>52;t=t/52|0)n=Q(t%52)+n;return (Q(t%52)+n).replace(K,"$1-$2")}var te=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},ne=function(e){return te(5381,e)};function re(e){for(var t=0;t<e.length;t+=1){var n=e[t];if(b(n)&&!N(n))return !1}return !0}var oe=ne("5.3.0"),ie=function(){function e(e,t,n){this.rules=e,this.staticRulesId="",this.isStatic="production"==="development",this.componentId=t,this.baseHash=te(oe,t),this.baseStyle=n,Z.registerId(t);}return e.prototype.generateAndInjectStyles=function(e,t,n){var r=this.componentId,o=[];if(this.baseStyle&&o.push(this.baseStyle.generateAndInjectStyles(e,t,n)),this.isStatic&&!n.hash)if(this.staticRulesId&&t.hasNameForId(r,this.staticRulesId))o.push(this.staticRulesId);else {var i=Ne(this.rules,e,t,n).join(""),s=ee(te(this.baseHash,i.length)>>>0);if(!t.hasNameForId(r,s)){var a=n(i,"."+s,void 0,r);t.insertRules(r,s,a);}o.push(s),this.staticRulesId=s;}else {for(var c=this.rules.length,u=te(this.baseHash,n.hash),l="",d=0;d<c;d++){var h=this.rules[d];if("string"==typeof h)l+=h,(u=te(u,h+d));else if(h){var p=Ne(h,e,t,n),f=Array.isArray(p)?p.join(""):p;u=te(u,f+d),l+=f;}}if(l){var m=ee(u>>>0);if(!t.hasNameForId(r,m)){var y=n(l,"."+m,void 0,r);t.insertRules(r,m,y);}o.push(m);}}return o.join(" ")},e}(),se=/^\s*\/\/.*$/gm,ae=[":","[",".","#"];function ce(e){var t,n,r,o,i=void 0===e?E:e,s=i.options,a=void 0===s?E:s,c=i.plugins,u=void 0===c?w:c,l=new stylis_min(a),d=[],h=function(e){function t(t){if(t)try{e(t+"}");}catch(e){}}return function(n,r,o,i,s,a,c,u,l,d){switch(n){case 1:if(0===l&&64===r.charCodeAt(0))return e(r+";"),"";break;case 2:if(0===u)return r+"/*|*/";break;case 3:switch(u){case 102:case 112:return e(o[0]+r),"";default:return r+(0===d?"/*|*/":"")}case-2:r.split("/*|*/}").forEach(t);}}}((function(e){d.push(e);})),f=function(e,r,i){return 0===r&&-1!==ae.indexOf(i[n.length])||i.match(o)?e:"."+t};function m(e,i,s,a){void 0===a&&(a="&");var c=e.replace(se,""),u=i&&s?s+" "+i+" { "+c+" }":c;return t=a,n=i,r=new RegExp("\\"+n+"\\b","g"),o=new RegExp("(\\"+n+"\\b){2,}"),l(s||!i?"":i,u)}return l.use([].concat(u,[function(e,t,o){2===e&&o.length&&o[0].lastIndexOf(n)>0&&(o[0]=o[0].replace(r,f));},h,function(e){if(-2===e){var t=d;return d=[],t}}])),m.hash=u.length?u.reduce((function(e,t){return t.name||j(15),te(e,t.name)}),5381).toString():"",m}var ue=react.createContext();ue.Consumer;var de=react.createContext(),he=(de.Consumer,new Z),pe=ce();function fe(){return react.useContext(ue)||he}function me(){return react.useContext(de)||pe}var ve=function(){function e(e,t){var n=this;this.inject=function(e,t){void 0===t&&(t=pe);var r=n.name+t.hash;e.hasNameForId(n.id,r)||e.insertRules(n.id,r,t(n.rules,r,"@keyframes"));},this.toString=function(){return j(12,String(n.name))},this.name=e,this.id="sc-keyframes-"+e,this.rules=t;}return e.prototype.getName=function(e){return void 0===e&&(e=pe),this.name+e.hash},e}(),ge=/([A-Z])/,Se=/([A-Z])/g,we=/^ms-/,Ee=function(e){return "-"+e.toLowerCase()};function be(e){return ge.test(e)?e.replace(Se,Ee).replace(we,"-ms-"):e}var _e=function(e){return null==e||!1===e||""===e};function Ne(e,n,r,o){if(Array.isArray(e)){for(var i,s=[],a=0,c=e.length;a<c;a+=1)""!==(i=Ne(e[a],n,r,o))&&(Array.isArray(i)?s.push.apply(s,i):s.push(i));return s}if(_e(e))return "";if(N(e))return "."+e.styledComponentId;if(b(e)){if("function"!=typeof(l=e)||l.prototype&&l.prototype.isReactComponent||!n)return e;var u=e(n);return reactIs.isElement(u)&&console.warn(_(e)+" is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details."),Ne(u,n,r,o)}var l;return e instanceof ve?r?(e.inject(r,o),e.getName(o)):e:S(e)?function e(t,n){var r,o,i=[];for(var s in t)t.hasOwnProperty(s)&&!_e(t[s])&&(S(t[s])?i.push.apply(i,e(t[s],s)):b(t[s])?i.push(be(s)+":",t[s],";"):i.push(be(s)+": "+(r=s,null==(o=t[s])||"boolean"==typeof o||""===o?"":"number"!=typeof o||0===o||r in unitlessKeys?String(o).trim():o+"px")+";"));return n?[n+" {"].concat(i,["}"]):i}(e):e.toString()}function Ae(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return b(e)||S(e)?Ne(g(w,[e].concat(n))):0===n.length&&1===e.length&&"string"==typeof e[0]?e:Ne(g(e,n))}var Ce=/invalid hook call/i,Ie=new Set,Pe=function(e,t){{var n="The component "+e+(t?' with the id of "'+t+'"':"")+" has been created dynamically.\nYou may see this warning because you've called styled inside another component.\nTo resolve this only create new StyledComponents outside of any render method and function component.";try{react.useRef(),Ie.has(n)||(console.warn(n),Ie.add(n));}catch(e){Ce.test(e.message)&&Ie.delete(n);}}},Oe=function(e,t,n){return void 0===n&&(n=E),e.theme!==n.theme&&e.theme||t||n.theme},Re=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,De=/(^-|-$)/g;function je(e){return e.replace(Re,"-").replace(De,"")}var Te=function(e){return ee(ne(e)>>>0)};function ke(e){return "string"==typeof e&&(e.charAt(0)===e.charAt(0).toLowerCase())}var xe=function(e){return "function"==typeof e||"object"==typeof e&&null!==e&&!Array.isArray(e)},Ve=function(e){return "__proto__"!==e&&"constructor"!==e&&"prototype"!==e};function Be(e,t,n){var r=e[n];xe(t)&&xe(r)?Me(r,t):e[n]=t;}function Me(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];for(var o=0,i=n;o<i.length;o++){var s=i[o];if(xe(s))for(var a in s)Ve(a)&&Be(e,s[a],a);}return e}var ze=react.createContext();ze.Consumer;var Fe={};function Ye(e,t,n){var o=N(e),s=!ke(e),a=t.attrs,c=void 0===a?w:a,d=t.componentId,h=void 0===d?function(e,t){var n="string"!=typeof e?"sc":je(e);Fe[n]=(Fe[n]||0)+1;var r=n+"-"+Te("5.3.0"+n+Fe[n]);return t?t+"-"+r:r}(t.displayName,t.parentComponentId):d,p=t.displayName,f=void 0===p?function(e){return ke(e)?"styled."+e:"Styled("+_(e)+")"}(e):p,g=t.displayName&&t.componentId?je(t.displayName)+"-"+t.componentId:t.componentId||h,S=o&&e.attrs?Array.prototype.concat(e.attrs,c).filter(Boolean):c,A=t.shouldForwardProp;o&&e.shouldForwardProp&&(A=t.shouldForwardProp?function(n,r,o){return e.shouldForwardProp(n,r,o)&&t.shouldForwardProp(n,r,o)}:e.shouldForwardProp);var C,I=new ie(n,g,o?e.componentStyle:void 0),P=I.isStatic&&0===c.length,O=function(e,t){return function(e,t,n,r){var o=e.attrs,s=e.componentStyle,a=e.defaultProps,c=e.foldedComponentIds,d=e.shouldForwardProp,h=e.styledComponentId,p=e.target;react.useDebugValue(h);var f=function(e,t,n){void 0===e&&(e=E);var r=v({},t,{theme:e}),o={};return n.forEach((function(e){var t,n,i,s=e;for(t in b(s)&&(s=s(r)),s)r[t]=o[t]="className"===t?(n=o[t],i=s[t],n&&i?n+" "+i:n||i):s[t];})),[r,o]}(Oe(t,react.useContext(ze),a)||E,t,o),y=f[0],g=f[1],S=function(e,t,n,r){var o=fe(),i=me(),s=t?e.generateAndInjectStyles(E,o,i):e.generateAndInjectStyles(n,o,i);return react.useDebugValue(s),!t&&r&&r(s),s}(s,r,y,e.warnTooManyClasses),w=n,_=g.$as||t.$as||g.as||t.as||p,N=ke(_),A=g!==t?v({},t,{},g):t,C={};for(var I in A)"$"!==I[0]&&"as"!==I&&("forwardedAs"===I?C.as=A[I]:(d?d(I,index,_):!N||index(I))&&(C[I]=A[I]));return t.style&&g.style!==t.style&&(C.style=v({},t.style,{},g.style)),C.className=Array.prototype.concat(c,h,S!==h?S:null,t.className,g.className).filter(Boolean).join(" "),C.ref=w,react.createElement(_,C)}(C,e,t,P)};return O.displayName=f,(C=react.forwardRef(O)).attrs=S,C.componentStyle=I,C.displayName=f,C.shouldForwardProp=A,C.foldedComponentIds=o?Array.prototype.concat(e.foldedComponentIds,e.styledComponentId):w,C.styledComponentId=g,C.target=o?e.target:e,C.withComponent=function(e){var r=t.componentId,o=function(e,t){if(null==e)return {};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(t,["componentId"]),i=r&&r+"-"+(ke(e)?e:je(_(e)));return Ye(e,v({},o,{attrs:S,componentId:i}),n)},Object.defineProperty(C,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(t){this._foldedDefaultProps=o?Me({},e.defaultProps,t):t;}}),(Pe(f,g),C.warnTooManyClasses=function(e,t){var n={},r=!1;return function(o){if(!r&&(n[o]=!0,Object.keys(n).length>=200)){var i=t?' with the id of "'+t+'"':"";console.warn("Over 200 classes were generated for component "+e+i+".\nConsider using the attrs method, together with a style object for frequently changed styles.\nExample:\n  const Component = styled.div.attrs(props => ({\n    style: {\n      background: props.background,\n    },\n  }))`width: 100%;`\n\n  <Component />"),r=!0,n={};}}}(f,g)),C.toString=function(){return "."+C.styledComponentId},s&&hoistNonReactStatics_cjs(C,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0,withComponent:!0}),C}var qe=function(e){return function e(t,r,o){if(void 0===o&&(o=E),!reactIs.isValidElementType(r))return j(1,String(r));var i=function(){return t(r,o,Ae.apply(void 0,arguments))};return i.withConfig=function(n){return e(t,r,v({},o,{},n))},i.attrs=function(n){return e(t,r,v({},o,{attrs:Array.prototype.concat(o.attrs,n).filter(Boolean)}))},i}(Ye,e)};["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","textPath","tspan"].forEach((function(e){qe[e]=qe(e);}));var He=function(){function e(e,t){this.rules=e,this.componentId=t,this.isStatic=re(e),Z.registerId(this.componentId+1);}var t=e.prototype;return t.createStyles=function(e,t,n,r){var o=r(Ne(this.rules,t,n,r).join(""),""),i=this.componentId+e;n.insertRules(i,i,o);},t.removeStyles=function(e,t){t.clearRules(this.componentId+e);},t.renderStyles=function(e,t,n,r){e>2&&Z.registerId(this.componentId+e),this.removeStyles(e,n),this.createStyles(e,t,n,r);},e}();function $e(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];var s=Ae.apply(void 0,[e].concat(n)),a="sc-global-"+Te(JSON.stringify(s)),u=new He(s,a);function l(e){var t=fe(),n=me(),o=react.useContext(ze),l=react.useRef(t.allocateGSInstance(a)).current;return react.Children.count(e.children)&&console.warn("The global style component "+a+" was given child JSX. createGlobalStyle does not render children."),s.some((function(e){return "string"==typeof e&&-1!==e.indexOf("@import")}))&&console.warn("Please do not use @import CSS syntax in createGlobalStyle at this time, as the CSSOM APIs we use in production do not handle it well. Instead, we recommend using a library such as react-helmet to inject a typical <link> meta tag to the stylesheet, or simply embedding it manually in your index.html <head> section for a simpler app."),react.useLayoutEffect((function(){return h(l,e,t,o,n),function(){return u.removeStyles(l,t)}}),[l,e,t,o,n]),null}function h(e,t,n,r,o){if(u.isStatic)u.renderStyles(e,O,n,o);else {var i=v({},t,{theme:Oe(t,r,l.defaultProps)});u.renderStyles(e,i,n,o);}}return Pe(a),react.memo(l)}"undefined"!=typeof navigator&&"ReactNative"===navigator.product&&console.warn("It looks like you've imported 'styled-components' on React Native.\nPerhaps you're looking to import 'styled-components/native'?\nRead more about this at https://www.styled-components.com/docs/basics#react-native"),(window["__styled-components-init__"]=window["__styled-components-init__"]||0,1===window["__styled-components-init__"]&&console.warn("It looks like there are several instances of 'styled-components' initialized in this application. This may cause dynamic styles to not render properly, errors during the rehydration process, a missing theme prop, and makes your application bigger without good reason.\n\nSee https://s-c.sh/2BAXzed for more info."),window["__styled-components-init__"]+=1);

    $e `
  html,
  body,
  div,
  p,
  img,
  h1, h2, h3, h4, h5, h6,
  input, button,
  ul, li {
    border: 0;
    margin: 0;
    padding: 0;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.colors.primary.background};
    color: ${(props) => props.theme.colors.primary.foreground};
    font-family: ${({ theme: { fonts } }) => fonts.manrope};
    font-weight: 400;
    height: 100vh;
    width: 100vw;
  }

  div:hover {
    cursor: default;
  }

  textarea:focus, input:focus, button:focus {
    outline: none;
  }
`;

    const secondsAgo = (seconds) => {
        const milliseconds = seconds * 1000;
        return millisecondsAgo(milliseconds);
    };
    const millisecondsAgo = (milliseconds) => new Date().getTime() - milliseconds;

    const isObject$2 = (item) => {
        return (item === Object(item) && !Array.isArray(item));
    };
    const deepMerge = (arrayMergeKeys, target, ...sources) => {
        if (!sources.length) {
            return target;
        }
        const result = target;
        if (isObject$2(result)) {
            const len = sources.length;
            for (let i = 0; i < len; i += 1) {
                const elm = sources[i];
                if (isObject$2(elm)) {
                    for (const key in elm) {
                        if (elm.hasOwnProperty(key)) {
                            const mergeKey = arrayMergeKeys ? arrayMergeKeys[key] : undefined;
                            if (isObject$2(elm[key])) {
                                if (!result[key] || !isObject$2(result[key])) {
                                    result[key] = {};
                                }
                                deepMerge(mergeKey, result[key], elm[key]);
                            }
                            else {
                                if (Array.isArray(result[key]) && Array.isArray(elm[key])) {
                                    if (typeof mergeKey === 'string') {
                                        result[key] = Array.from(result[key]).filter((item) => {
                                            if (typeof item === 'object' && item !== null) {
                                                return elm[key].findIndex((el) => el[mergeKey] === item[mergeKey]) < 0;
                                            }
                                            return true;
                                        });
                                        result[key].concat(elm[key]);
                                    }
                                    result[key] = Array.from(new Set(result[key].concat(elm[key])));
                                }
                                else {
                                    result[key] = elm[key];
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    };

    const now = () => Math.ceil(Date.now() / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const minuteAgo = now() - minute;
    const hourAgo = now() - hour;
    const dayAgo = now() - day;
    const weekAgo = now() - week;
    const monthAgo = (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return Math.ceil(date.getTime() / 1000);
    })();
    const yearAgo = (() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return Math.ceil(date.getTime() / 1000);
    })();
    var epoch = {
        day,
        dayAgo,
        hour,
        hourAgo,
        minute,
        minuteAgo,
        monthAgo,
        now,
        weekAgo,
        week,
        yearAgo,
    };

    const find = (arr, callback, start) => {
        const base = arr.slice(start);
        return base.find(callback);
    };
    const findIndex$1 = (arr, callback, start) => {
        const base = arr.slice(start);
        return base.findIndex(callback);
    };
    var from = {
        find,
        findIndex: findIndex$1,
    };

    const nor = (first, second) => {
        if (first && !second) {
            return false;
        }
        if (!first && second) {
            return false;
        }
        return true;
    };

    const baseChecker = () => true;
    class Memoize {
        constructor() {
            this.basicFns = {};
            this.add = (config) => {
                const { id, resetFn, ...rest } = config;
                const resetKey = typeof resetFn === 'undefined' ? resetFn : resetFn();
                const fnIndex = this.basicFns[id];
                if (!fnIndex) {
                    this.basicFns[id] = {
                        ...rest,
                        resetFn,
                        resetKey,
                    };
                }
                const func = this.basicFns[id];
                if (!nor(!!func.checker, !!rest.checker)) {
                    throw new Error(`${id} was instantiated without a checker at least once and with a checker at least once`);
                }
                return this.build(func);
            };
            this.build = (config) => {
                const check = config.checker || baseChecker;
                if (!config.keyFn) {
                    return this.buildBase(config, check);
                }
                return this.buildFancy(config, check, config.keyFn);
            };
            this.buildFancy = (mapConfig, checker, keyFn) => {
                const mapping = {};
                return (...args) => {
                    const key = keyFn(...args);
                    if (!mapping[key] || mapping[key].resetKey !== mapConfig.resetKey) {
                        mapping[key] = {
                            previousArgs: args,
                            previousReturn: mapConfig.fn(...args),
                            resetKey: mapConfig.resetKey,
                        };
                        return mapping[key].previousReturn;
                    }
                    const { previousArgs, previousReturn } = mapping[key];
                    const { nextArgs, nextReturn } = this.fnRun({
                        checker,
                        previousArgs,
                        previousReturn,
                        args,
                        mapConfig,
                    });
                    mapping[key].previousArgs = nextArgs;
                    mapping[key].previousReturn = nextReturn;
                    return nextReturn;
                };
            };
            this.buildBase = (mapConfig, checker) => {
                let previousArgs;
                let previousReturn;
                return (...args) => {
                    if (!previousArgs) {
                        previousArgs = args;
                        previousReturn = mapConfig.fn(...args);
                        return previousReturn;
                    }
                    const { nextArgs, nextReturn } = this.fnRun({
                        checker,
                        previousArgs,
                        previousReturn,
                        args,
                        mapConfig,
                    });
                    previousReturn = nextReturn;
                    previousArgs = nextArgs;
                    return nextReturn;
                };
            };
            this.fnRun = (config) => {
                const { previousArgs, previousReturn, checker, args, mapConfig } = config;
                const { resetFn, fn, resetKey } = mapConfig;
                const newResetKey = typeof resetFn === 'undefined' ? resetFn : resetFn();
                if (newResetKey !== resetKey) {
                    return {
                        nextArgs: args,
                        nextReturn: fn(...args),
                    };
                }
                const needsCall = checker({ current: args, previous: previousArgs });
                return {
                    nextArgs: args,
                    nextReturn: needsCall ? fn(...args) : previousReturn,
                };
            };
        }
    }
    const instance = new Memoize();
    Object.freeze(instance);

    const uniqueBy = (a, key) => {
        const seen = new Set();
        return a.filter(item => {
            const k = key(item);
            return seen.has(k) ? false : seen.add(k);
        });
    };

    class ReactorEvent {
        constructor(name) {
            this.registerCallback = (callback) => {
                this.callbacks.push(callback);
            };
            this.removeCallback = (callback) => {
                const current = this.callbacks.findIndex((cb) => cb === callback);
                if (current > -1) {
                    this.callbacks.splice(current, 1);
                }
            };
            this.name = name;
            this.callbacks = [];
        }
    }

    class Reactor {
        constructor() {
            this.registerEvent = (eventName) => {
                const event = new ReactorEvent(eventName);
                this.events[eventName] = event;
            };
            this.dispatchEvent = (eventName, eventArgs) => {
                if (this.events[eventName]) {
                    this.events[eventName].callbacks.forEach((callback) => {
                        callback(eventArgs);
                    });
                    return;
                }
            };
            this.addEventListener = (eventName, callback) => {
                if (!this.events[eventName]) {
                    this.registerEvent(eventName);
                }
                if (this.events[eventName]) {
                    this.events[eventName].registerCallback(callback);
                    return;
                }
                throw new Error(`Attempted to listen to unregistered event: ${eventName}`);
            };
            this.removeEventListener = (eventName, callback) => {
                if (this.events[eventName]) {
                    this.events[eventName].removeCallback(callback);
                }
            };
            this.events = {};
        }
    }

    const baseColorsBase = {
        black: '#010203',
        'blue-light': '#0096FF',
        'blue-dark': '#4169e1',
        blue: '#007FFF',
        green: '#26FF64',
        grey: '#696969',
        'grey-dark': '#3D4035',
        'grey-light': '#DBD7D2',
        red: '#FF2626',
        'red-dark': '#710C04',
        'red-light': '#FF8484',
        white: '#F8F8FF',
        yellow: '#FEFE22',
    };
    const themeColorsBase = {
        primary: {
            background: '#00371D',
            foreground: baseColorsBase.white,
            accent: '#DDDDDD',
        },
        secondary: {
            background: '#FFB4B3',
            foreground: '#000000',
            accent: '#333333',
        },
        tertiary: {
            background: '#00522C',
            foreground: '#FFFFFF',
            accent: '#5D6B66',
        },
        quaternary: {
            background: '#FFD5D4',
            foreground: '#000000',
            accent: '#ff8c8a',
        },
    };
    const buildRGB = (colors) => Object
        .entries(colors)
        .reduce((acc, cur) => {
        const [colorName, colorValue] = cur;
        acc[colorName] = colorValue;
        acc[`${colorName}-rgb`] = getRGB(colorValue);
        return acc;
    }, {});
    Object
        .entries(themeColorsBase)
        .reduce((acc, [color, gradient]) => {
        acc[color] = buildRGB(gradient);
        return acc;
    }, {});
    buildRGB(baseColorsBase);

    var byteLength_1 = byteLength;
    var toByteArray_1 = toByteArray;
    var fromByteArray_1 = fromByteArray;

    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i$2 = 0, len = code.length; i$2 < len; ++i$2) {
      lookup[i$2] = code[i$2];
      revLookup[code.charCodeAt(i$2)] = i$2;
    }

    // Support decoding URL-safe base64 strings, as Node.js does.
    // See: https://en.wikipedia.org/wiki/Base64#URL_applications
    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;

    function getLens (b64) {
      var len = b64.length;

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // Trim off extra bytes after placeholder bytes are found
      // See: https://github.com/beatgammit/base64-js/issues/42
      var validLen = b64.indexOf('=');
      if (validLen === -1) validLen = len;

      var placeHoldersLen = validLen === len
        ? 0
        : 4 - (validLen % 4);

      return [validLen, placeHoldersLen]
    }

    // base64 is 4/3 + up to two characters of the original data
    function byteLength (b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function _byteLength (b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
    }

    function toByteArray (b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];

      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

      var curByte = 0;

      // if there are placeholders, only get up to the last complete 4 chars
      var len = placeHoldersLen > 0
        ? validLen - 4
        : validLen;

      var i;
      for (i = 0; i < len; i += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 18) |
          (revLookup[b64.charCodeAt(i + 1)] << 12) |
          (revLookup[b64.charCodeAt(i + 2)] << 6) |
          revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = (tmp >> 16) & 0xFF;
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
      }

      if (placeHoldersLen === 2) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 2) |
          (revLookup[b64.charCodeAt(i + 1)] >> 4);
        arr[curByte++] = tmp & 0xFF;
      }

      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 10) |
          (revLookup[b64.charCodeAt(i + 1)] << 4) |
          (revLookup[b64.charCodeAt(i + 2)] >> 2);
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
      }

      return arr
    }

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] +
        lookup[num >> 12 & 0x3F] +
        lookup[num >> 6 & 0x3F] +
        lookup[num & 0x3F]
    }

    function encodeChunk (uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp =
          ((uint8[i] << 16) & 0xFF0000) +
          ((uint8[i + 1] << 8) & 0xFF00) +
          (uint8[i + 2] & 0xFF);
        output.push(tripletToBase64(tmp));
      }
      return output.join('')
    }

    function fromByteArray (uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
      var parts = [];
      var maxChunkLength = 16383; // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push(
          lookup[tmp >> 2] +
          lookup[(tmp << 4) & 0x3F] +
          '=='
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(
          lookup[tmp >> 10] +
          lookup[(tmp >> 4) & 0x3F] +
          lookup[(tmp << 2) & 0x3F] +
          '='
        );
      }

      return parts.join('')
    }

    var base64Js = {
    	byteLength: byteLength_1,
    	toByteArray: toByteArray_1,
    	fromByteArray: fromByteArray_1
    };

    /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
    var read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    };

    var write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = ((value * c) - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    };

    var ieee754 = {
    	read: read,
    	write: write
    };

    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    var buffer = createCommonjsModule(function (module, exports) {



    var customInspectSymbol =
      (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
        ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
        : null;

    exports.Buffer = Buffer;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;

    var K_MAX_LENGTH = 0x7fffffff;
    exports.kMaxLength = K_MAX_LENGTH;

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
    Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

    if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
        typeof console.error === 'function') {
      console.error(
        'This browser lacks typed array (Uint8Array) support which is required by ' +
        '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
      );
    }

    function typedArraySupport () {
      // Can typed array instances can be augmented?
      try {
        var arr = new Uint8Array(1);
        var proto = { foo: function () { return 42 } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42
      } catch (e) {
        return false
      }
    }

    Object.defineProperty(Buffer.prototype, 'parent', {
      enumerable: true,
      get: function () {
        if (!Buffer.isBuffer(this)) return undefined
        return this.buffer
      }
    });

    Object.defineProperty(Buffer.prototype, 'offset', {
      enumerable: true,
      get: function () {
        if (!Buffer.isBuffer(this)) return undefined
        return this.byteOffset
      }
    });

    function createBuffer (length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"')
      }
      // Return an augmented `Uint8Array` instance
      var buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer.prototype);
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
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          )
        }
        return allocUnsafe(arg)
      }
      return from(arg, encodingOrOffset, length)
    }

    Buffer.poolSize = 8192; // not used by this implementation

    function from (value, encodingOrOffset, length) {
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset)
      }

      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value)
      }

      if (value == null) {
        throw new TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
          'or Array-like Object. Received type ' + (typeof value)
        )
      }

      if (isInstance(value, ArrayBuffer) ||
          (value && isInstance(value.buffer, ArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }

      if (typeof SharedArrayBuffer !== 'undefined' &&
          (isInstance(value, SharedArrayBuffer) ||
          (value && isInstance(value.buffer, SharedArrayBuffer)))) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }

      if (typeof value === 'number') {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        )
      }

      var valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer.from(valueOf, encodingOrOffset, length)
      }

      var b = fromObject(value);
      if (b) return b

      if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
          typeof value[Symbol.toPrimitive] === 'function') {
        return Buffer.from(
          value[Symbol.toPrimitive]('string'), encodingOrOffset, length
        )
      }

      throw new TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
        'or Array-like Object. Received type ' + (typeof value)
      )
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
    };

    // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
    // https://github.com/feross/buffer/pull/148
    Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer, Uint8Array);

    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be of type number')
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"')
      }
    }

    function alloc (size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpreted as a start offset.
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
    };

    function allocUnsafe (size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0)
    }

    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(size)
    };
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(size)
    };

    function fromString (string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8';
      }

      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }

      var length = byteLength(string, encoding) | 0;
      var buf = createBuffer(length);

      var actual = buf.write(string, encoding);

      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        buf = buf.slice(0, actual);
      }

      return buf
    }

    function fromArrayLike (array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0;
      var buf = createBuffer(length);
      for (var i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf
    }

    function fromArrayView (arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        var copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
      }
      return fromArrayLike(arrayView)
    }

    function fromArrayBuffer (array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds')
      }

      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds')
      }

      var buf;
      if (byteOffset === undefined && length === undefined) {
        buf = new Uint8Array(array);
      } else if (length === undefined) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }

      // Return an augmented `Uint8Array` instance
      Object.setPrototypeOf(buf, Buffer.prototype);

      return buf
    }

    function fromObject (obj) {
      if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0;
        var buf = createBuffer(len);

        if (buf.length === 0) {
          return buf
        }

        obj.copy(buf, 0, 0, len);
        return buf
      }

      if (obj.length !== undefined) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
          return createBuffer(0)
        }
        return fromArrayLike(obj)
      }

      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data)
      }
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
        length = 0;
      }
      return Buffer.alloc(+length)
    }

    Buffer.isBuffer = function isBuffer (b) {
      return b != null && b._isBuffer === true &&
        b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
    };

    Buffer.compare = function compare (a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        )
      }

      if (a === b) return 0

      var x = a.length;
      var y = b.length;

      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

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
    };

    Buffer.concat = function concat (list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }

      if (list.length === 0) {
        return Buffer.alloc(0)
      }

      var i;
      if (length === undefined) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }

      var buffer = Buffer.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            Buffer.from(buf).copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer
    };

    function byteLength (string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
          'Received type ' + typeof string
        )
      }

      var len = string.length;
      var mustMatch = (arguments.length > 2 && arguments[2] === true);
      if (!mustMatch && len === 0) return 0

      // Use a for loop to avoid recursion
      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
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
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
            }
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer.byteLength = byteLength;

    function slowToString (encoding, start, end) {
      var loweredCase = false;

      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.

      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0;
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }

      if (end === undefined || end > this.length) {
        end = this.length;
      }

      if (end <= 0) {
        return ''
      }

      // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0;
      start >>>= 0;

      if (end <= start) {
        return ''
      }

      if (!encoding) encoding = 'utf8';

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
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
        }
      }
    }

    // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
    // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
    // reliably in a browserify context because there could be multiple different
    // copies of the 'buffer' package in use. This method works even for Buffer
    // instances that were created from another copy of the `buffer` package.
    // See: https://github.com/feross/buffer/issues/154
    Buffer.prototype._isBuffer = true;

    function swap (b, n, m) {
      var i = b[n];
      b[n] = b[m];
      b[m] = i;
    }

    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this
    };

    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this
    };

    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this
    };

    Buffer.prototype.toString = function toString () {
      var length = this.length;
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    };

    Buffer.prototype.toLocaleString = Buffer.prototype.toString;

    Buffer.prototype.equals = function equals (b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    };

    Buffer.prototype.inspect = function inspect () {
      var str = '';
      var max = exports.INSPECT_MAX_BYTES;
      str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
      if (this.length > max) str += ' ... ';
      return '<Buffer ' + str + '>'
    };
    if (customInspectSymbol) {
      Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
    }

    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer.from(target, target.offset, target.byteLength);
      }
      if (!Buffer.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. ' +
          'Received type ' + (typeof target)
        )
      }

      if (start === undefined) {
        start = 0;
      }
      if (end === undefined) {
        end = target ? target.length : 0;
      }
      if (thisStart === undefined) {
        thisStart = 0;
      }
      if (thisEnd === undefined) {
        thisEnd = this.length;
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

      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;

      if (this === target) return 0

      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);

      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);

      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break
        }
      }

      if (x < y) return -1
      if (y < x) return 1
      return 0
    };

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
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff;
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000;
      }
      byteOffset = +byteOffset; // Coerce to Number.
      if (numberIsNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1);
      }

      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1
      }

      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding);
      }

      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF; // Search for a byte value [0-255]
        if (typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
      }

      throw new TypeError('val must be string, number or Buffer')
    }

    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1;
      var arrLength = arr.length;
      var valLength = val.length;

      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }

      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }

      var i;
      if (dir) {
        var foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          var found = true;
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
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
    };

    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    };

    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    };

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0;
      var remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }

      var strLen = string.length;

      if (length > strLen / 2) {
        length = strLen / 2;
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i
        buf[offset + i] = parsed;
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }

    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
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
        encoding = 'utf8';
        length = this.length;
        offset = 0;
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === undefined) encoding = 'utf8';
        } else {
          encoding = length;
          length = undefined;
        }
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }

      var remaining = this.length - offset;
      if (length === undefined || length > remaining) length = remaining;

      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }

      if (!encoding) encoding = 'utf8';

      var loweredCase = false;
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)

          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)

          case 'ascii':
          case 'latin1':
          case 'binary':
            return asciiWrite(this, string, offset, length)

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
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };

    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    };

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64Js.fromByteArray(buf)
      } else {
        return base64Js.fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end);
      var res = [];

      var i = start;
      while (i < end) {
        var firstByte = buf[i];
        var codePoint = null;
        var bytesPerSequence = (firstByte > 0xEF)
          ? 4
          : (firstByte > 0xDF)
              ? 3
              : (firstByte > 0xBF)
                  ? 2
                  : 1;

        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint;

          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte;
              }
              break
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint;
                }
              }
              break
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }

        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD;
          bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000;
          res.push(codePoint >>> 10 & 0x3FF | 0xD800);
          codePoint = 0xDC00 | codePoint & 0x3FF;
        }

        res.push(codePoint);
        i += bytesPerSequence;
      }

      return decodeCodePointsArray(res)
    }

    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000;

    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }

      // Decode in chunks to avoid "call stack size exceeded".
      var res = '';
      var i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res
    }

    function asciiSlice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F);
      }
      return ret
    }

    function latin1Slice (buf, start, end) {
      var ret = '';
      end = Math.min(buf.length, end);

      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret
    }

    function hexSlice (buf, start, end) {
      var len = buf.length;

      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;

      var out = '';
      for (var i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end);
      var res = '';
      // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
      for (var i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256));
      }
      return res
    }

    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length;
      start = ~~start;
      end = end === undefined ? len : ~~end;

      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }

      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }

      if (end < start) end = start;

      var newBuf = this.subarray(start, end);
      // Return an augmented `Uint8Array` instance
      Object.setPrototypeOf(newBuf, Buffer.prototype);

      return newBuf
    };

    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

    Buffer.prototype.readUintLE =
    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }

      return val
    };

    Buffer.prototype.readUintBE =
    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length);
      }

      var val = this[offset + --byteLength];
      var mul = 1;
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul;
      }

      return val
    };

    Buffer.prototype.readUint8 =
    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset]
    };

    Buffer.prototype.readUint16LE =
    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | (this[offset + 1] << 8)
    };

    Buffer.prototype.readUint16BE =
    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return (this[offset] << 8) | this[offset + 1]
    };

    Buffer.prototype.readUint32LE =
    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    };

    Buffer.prototype.readUint32BE =
    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    };

    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) checkOffset(offset, byteLength, this.length);

      var i = byteLength;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul;
      }
      mul *= 0x80;

      if (val >= mul) val -= Math.pow(2, 8 * byteLength);

      return val
    };

    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    };

    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset] | (this[offset + 1] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | (this[offset] << 8);
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    };

    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    };

    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);

      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    };

    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4)
    };

    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4)
    };

    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8)
    };

    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8)
    };

    function checkInt (buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }

    Buffer.prototype.writeUintLE =
    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var mul = 1;
      var i = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUintBE =
    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength = byteLength >>> 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1;
        checkInt(this, value, offset, byteLength, maxBytes, 0);
      }

      var i = byteLength - 1;
      var mul = 1;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeUint8 =
    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeUint16LE =
    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      return offset + 2
    };

    Buffer.prototype.writeUint16BE =
    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
      return offset + 2
    };

    Buffer.prototype.writeUint32LE =
    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
      return offset + 4
    };

    Buffer.prototype.writeUint32BE =
    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
      return offset + 4
    };

    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 0xFF;
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        var limit = Math.pow(2, (8 * byteLength) - 1);

        checkInt(this, value, offset, byteLength, limit - 1, -limit);
      }

      var i = byteLength - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 0xFF;
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
      }

      return offset + byteLength
    };

    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
      if (value < 0) value = 0xff + value + 1;
      this[offset] = (value & 0xff);
      return offset + 1
    };

    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      return offset + 2
    };

    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
      return offset + 2
    };

    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
      return offset + 4
    };

    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
      if (value < 0) value = 0xffffffff + value + 1;
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
      return offset + 4
    };

    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    };

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    };

    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    };

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;

      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0

      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }

      var len = end - start;

      if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        // Use built-in when available, missing from IE11
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }

      return len
    };

    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === 'string') {
          encoding = end;
          end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if ((encoding === 'utf8' && code < 128) ||
              encoding === 'latin1') {
            // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code;
          }
        }
      } else if (typeof val === 'number') {
        val = val & 255;
      } else if (typeof val === 'boolean') {
        val = Number(val);
      }

      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }

      if (end <= start) {
        return this
      }

      start = start >>> 0;
      end = end === undefined ? this.length : end >>> 0;

      if (!val) val = 0;

      var i;
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = Buffer.isBuffer(val)
          ? val
          : Buffer.from(val, encoding);
        var len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val +
            '" is invalid for argument "value"')
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }

      return this
    };

    // HELPER FUNCTIONS
    // ================

    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

    function base64clean (str) {
      // Node takes equal signs as end of the Base64 encoding
      str = str.split('=')[0];
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = str.trim().replace(INVALID_BASE64_RE, '');
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '=';
      }
      return str
    }

    function utf8ToBytes (string, units) {
      units = units || Infinity;
      var codePoint;
      var length = string.length;
      var leadSurrogate = null;
      var bytes = [];

      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);

        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              continue
            }

            // valid lead
            leadSurrogate = codePoint;

            continue
          }

          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            leadSurrogate = codePoint;
            continue
          }

          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }

        leadSurrogate = null;

        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint);
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          );
        } else {
          throw new Error('Invalid code point')
        }
      }

      return bytes
    }

    function asciiToBytes (str) {
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF);
      }
      return byteArray
    }

    function utf16leToBytes (str, units) {
      var c, hi, lo;
      var byteArray = [];
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break

        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }

      return byteArray
    }

    function base64ToBytes (str) {
      return base64Js.toByteArray(base64clean(str))
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i];
      }
      return i
    }

    // ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
    // the `instanceof` check but they should be treated as of that type.
    // See: https://github.com/feross/buffer/issues/166
    function isInstance (obj, type) {
      return obj instanceof type ||
        (obj != null && obj.constructor != null && obj.constructor.name != null &&
          obj.constructor.name === type.name)
    }
    function numberIsNaN (obj) {
      // For IE11 support
      return obj !== obj // eslint-disable-line no-self-compare
    }

    // Create lookup table for `toString('hex')`
    // See: https://github.com/feross/buffer/issues/219
    var hexSliceLookupTable = (function () {
      var alphabet = '0123456789abcdef';
      var table = new Array(256);
      for (var i = 0; i < 16; ++i) {
        var i16 = i * 16;
        for (var j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table
    })();
    });

    var Buffer$8 = buffer.Buffer;

    var safer = {};

    var key;

    for (key in buffer) {
      if (!buffer.hasOwnProperty(key)) continue
      if (key === 'SlowBuffer' || key === 'Buffer') continue
      safer[key] = buffer[key];
    }

    var Safer = safer.Buffer = {};
    for (key in Buffer$8) {
      if (!Buffer$8.hasOwnProperty(key)) continue
      if (key === 'allocUnsafe' || key === 'allocUnsafeSlow') continue
      Safer[key] = Buffer$8[key];
    }

    safer.Buffer.prototype = Buffer$8.prototype;

    if (!Safer.from || Safer.from === Uint8Array.from) {
      Safer.from = function (value, encodingOrOffset, length) {
        if (typeof value === 'number') {
          throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value)
        }
        if (value && typeof value.length === 'undefined') {
          throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' + typeof value)
        }
        return Buffer$8(value, encodingOrOffset, length)
      };
    }

    if (!Safer.alloc) {
      Safer.alloc = function (size, fill, encoding) {
        if (typeof size !== 'number') {
          throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size)
        }
        if (size < 0 || size >= 2 * (1 << 30)) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"')
        }
        var buf = Buffer$8(size);
        if (!fill || fill.length === 0) {
          buf.fill(0);
        } else if (typeof encoding === 'string') {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
        return buf
      };
    }

    if (!safer.kStringMaxLength) {
      try {
        safer.kStringMaxLength = process.binding('buffer').kStringMaxLength;
      } catch (e) {
        // we can't determine kStringMaxLength in environments where process.binding
        // is unsupported, so let's not set it
      }
    }

    if (!safer.constants) {
      safer.constants = {
        MAX_LENGTH: safer.kMaxLength
      };
      if (safer.kStringMaxLength) {
        safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
      }
    }

    var safer_1 = safer;

    var BOMChar = '\uFEFF';

    var PrependBOM = PrependBOMWrapper;
    function PrependBOMWrapper(encoder, options) {
        this.encoder = encoder;
        this.addBOM = true;
    }

    PrependBOMWrapper.prototype.write = function(str) {
        if (this.addBOM) {
            str = BOMChar + str;
            this.addBOM = false;
        }

        return this.encoder.write(str);
    };

    PrependBOMWrapper.prototype.end = function() {
        return this.encoder.end();
    };


    //------------------------------------------------------------------------------

    var StripBOM = StripBOMWrapper;
    function StripBOMWrapper(decoder, options) {
        this.decoder = decoder;
        this.pass = false;
        this.options = options || {};
    }

    StripBOMWrapper.prototype.write = function(buf) {
        var res = this.decoder.write(buf);
        if (this.pass || !res)
            return res;

        if (res[0] === BOMChar) {
            res = res.slice(1);
            if (typeof this.options.stripBOM === 'function')
                this.options.stripBOM();
        }

        this.pass = true;
        return res;
    };

    StripBOMWrapper.prototype.end = function() {
        return this.decoder.end();
    };

    var bomHandling = {
    	PrependBOM: PrependBOM,
    	StripBOM: StripBOM
    };

    var string_decoder = createCommonjsModule(function (module, exports) {
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.

    var Buffer = buffer.Buffer;

    var isBufferEncoding = Buffer.isEncoding
      || function(encoding) {
           switch (encoding && encoding.toLowerCase()) {
             case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
             default: return false;
           }
         };


    function assertEncoding(encoding) {
      if (encoding && !isBufferEncoding(encoding)) {
        throw new Error('Unknown encoding: ' + encoding);
      }
    }

    // StringDecoder provides an interface for efficiently splitting a series of
    // buffers into a series of JS strings without breaking apart multi-byte
    // characters. CESU-8 is handled as part of the UTF-8 encoding.
    //
    // @TODO Handling all encodings inside a single object makes it very difficult
    // to reason about this code, so it should be split up in the future.
    // @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
    // points as used by CESU-8.
    var StringDecoder = exports.StringDecoder = function(encoding) {
      this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
      assertEncoding(encoding);
      switch (this.encoding) {
        case 'utf8':
          // CESU-8 represents each of Surrogate Pair by 3-bytes
          this.surrogateSize = 3;
          break;
        case 'ucs2':
        case 'utf16le':
          // UTF-16 represents each of Surrogate Pair by 2-bytes
          this.surrogateSize = 2;
          this.detectIncompleteChar = utf16DetectIncompleteChar;
          break;
        case 'base64':
          // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
          this.surrogateSize = 3;
          this.detectIncompleteChar = base64DetectIncompleteChar;
          break;
        default:
          this.write = passThroughWrite;
          return;
      }

      // Enough space to store all bytes of a single character. UTF-8 needs 4
      // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
      this.charBuffer = new Buffer(6);
      // Number of bytes received for the current incomplete multi-byte character.
      this.charReceived = 0;
      // Number of bytes expected for the current incomplete multi-byte character.
      this.charLength = 0;
    };


    // write decodes the given buffer and returns it as JS string that is
    // guaranteed to not contain any partial multi-byte characters. Any partial
    // character found at the end of the buffer is buffered up, and will be
    // returned when calling write again with the remaining bytes.
    //
    // Note: Converting a Buffer containing an orphan surrogate to a String
    // currently works, but converting a String to a Buffer (via `new Buffer`, or
    // Buffer#write) will replace incomplete surrogates with the unicode
    // replacement character. See https://codereview.chromium.org/121173009/ .
    StringDecoder.prototype.write = function(buffer) {
      var charStr = '';
      // if our last write ended with an incomplete multibyte character
      while (this.charLength) {
        // determine how many remaining bytes this buffer has to offer for this char
        var available = (buffer.length >= this.charLength - this.charReceived) ?
            this.charLength - this.charReceived :
            buffer.length;

        // add the new bytes to the char buffer
        buffer.copy(this.charBuffer, this.charReceived, 0, available);
        this.charReceived += available;

        if (this.charReceived < this.charLength) {
          // still not enough chars in this buffer? wait for more ...
          return '';
        }

        // remove bytes belonging to the current character from the buffer
        buffer = buffer.slice(available, buffer.length);

        // get the character that was split
        charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

        // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
        var charCode = charStr.charCodeAt(charStr.length - 1);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
          this.charLength += this.surrogateSize;
          charStr = '';
          continue;
        }
        this.charReceived = this.charLength = 0;

        // if there are no more bytes in this buffer, just emit our char
        if (buffer.length === 0) {
          return charStr;
        }
        break;
      }

      // determine and set charLength / charReceived
      this.detectIncompleteChar(buffer);

      var end = buffer.length;
      if (this.charLength) {
        // buffer the incomplete character bytes we got
        buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
        end -= this.charReceived;
      }

      charStr += buffer.toString(this.encoding, 0, end);

      var end = charStr.length - 1;
      var charCode = charStr.charCodeAt(end);
      // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
      if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        var size = this.surrogateSize;
        this.charLength += size;
        this.charReceived += size;
        this.charBuffer.copy(this.charBuffer, size, 0, size);
        buffer.copy(this.charBuffer, 0, 0, size);
        return charStr.substring(0, end);
      }

      // or just emit the charStr
      return charStr;
    };

    // detectIncompleteChar determines if there is an incomplete UTF-8 character at
    // the end of the given buffer. If so, it sets this.charLength to the byte
    // length that character, and sets this.charReceived to the number of bytes
    // that are available for this character.
    StringDecoder.prototype.detectIncompleteChar = function(buffer) {
      // determine how many bytes we have to check at the end of this buffer
      var i = (buffer.length >= 3) ? 3 : buffer.length;

      // Figure out if one of the last i bytes of our buffer announces an
      // incomplete char.
      for (; i > 0; i--) {
        var c = buffer[buffer.length - i];

        // See http://en.wikipedia.org/wiki/UTF-8#Description

        // 110XXXXX
        if (i == 1 && c >> 5 == 0x06) {
          this.charLength = 2;
          break;
        }

        // 1110XXXX
        if (i <= 2 && c >> 4 == 0x0E) {
          this.charLength = 3;
          break;
        }

        // 11110XXX
        if (i <= 3 && c >> 3 == 0x1E) {
          this.charLength = 4;
          break;
        }
      }
      this.charReceived = i;
    };

    StringDecoder.prototype.end = function(buffer) {
      var res = '';
      if (buffer && buffer.length)
        res = this.write(buffer);

      if (this.charReceived) {
        var cr = this.charReceived;
        var buf = this.charBuffer;
        var enc = this.encoding;
        res += buf.slice(0, cr).toString(enc);
      }

      return res;
    };

    function passThroughWrite(buffer) {
      return buffer.toString(this.encoding);
    }

    function utf16DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 2;
      this.charLength = this.charReceived ? 2 : 0;
    }

    function base64DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 3;
      this.charLength = this.charReceived ? 3 : 0;
    }
    });

    var Buffer$7 = safer_1.Buffer;

    // Export Node.js internal encodings.

    var internal = {
        // Encodings
        utf8:   { type: "_internal", bomAware: true},
        cesu8:  { type: "_internal", bomAware: true},
        unicode11utf8: "utf8",

        ucs2:   { type: "_internal", bomAware: true},
        utf16le: "ucs2",

        binary: { type: "_internal" },
        base64: { type: "_internal" },
        hex:    { type: "_internal" },

        // Codec.
        _internal: InternalCodec,
    };

    //------------------------------------------------------------------------------

    function InternalCodec(codecOptions, iconv) {
        this.enc = codecOptions.encodingName;
        this.bomAware = codecOptions.bomAware;

        if (this.enc === "base64")
            this.encoder = InternalEncoderBase64;
        else if (this.enc === "cesu8") {
            this.enc = "utf8"; // Use utf8 for decoding.
            this.encoder = InternalEncoderCesu8;

            // Add decoder for versions of Node not supporting CESU-8
            if (Buffer$7.from('eda0bdedb2a9', 'hex').toString() !== '💩') {
                this.decoder = InternalDecoderCesu8;
                this.defaultCharUnicode = iconv.defaultCharUnicode;
            }
        }
    }

    InternalCodec.prototype.encoder = InternalEncoder;
    InternalCodec.prototype.decoder = InternalDecoder;

    //------------------------------------------------------------------------------

    // We use node.js internal decoder. Its signature is the same as ours.
    var StringDecoder = string_decoder.StringDecoder;

    if (!StringDecoder.prototype.end) // Node v0.8 doesn't have this method.
        StringDecoder.prototype.end = function() {};


    function InternalDecoder(options, codec) {
        this.decoder = new StringDecoder(codec.enc);
    }

    InternalDecoder.prototype.write = function(buf) {
        if (!Buffer$7.isBuffer(buf)) {
            buf = Buffer$7.from(buf);
        }

        return this.decoder.write(buf);
    };

    InternalDecoder.prototype.end = function() {
        return this.decoder.end();
    };


    //------------------------------------------------------------------------------
    // Encoder is mostly trivial

    function InternalEncoder(options, codec) {
        this.enc = codec.enc;
    }

    InternalEncoder.prototype.write = function(str) {
        return Buffer$7.from(str, this.enc);
    };

    InternalEncoder.prototype.end = function() {
    };


    //------------------------------------------------------------------------------
    // Except base64 encoder, which must keep its state.

    function InternalEncoderBase64(options, codec) {
        this.prevStr = '';
    }

    InternalEncoderBase64.prototype.write = function(str) {
        str = this.prevStr + str;
        var completeQuads = str.length - (str.length % 4);
        this.prevStr = str.slice(completeQuads);
        str = str.slice(0, completeQuads);

        return Buffer$7.from(str, "base64");
    };

    InternalEncoderBase64.prototype.end = function() {
        return Buffer$7.from(this.prevStr, "base64");
    };


    //------------------------------------------------------------------------------
    // CESU-8 encoder is also special.

    function InternalEncoderCesu8(options, codec) {
    }

    InternalEncoderCesu8.prototype.write = function(str) {
        var buf = Buffer$7.alloc(str.length * 3), bufIdx = 0;
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i);
            // Naive implementation, but it works because CESU-8 is especially easy
            // to convert from UTF-16 (which all JS strings are encoded in).
            if (charCode < 0x80)
                buf[bufIdx++] = charCode;
            else if (charCode < 0x800) {
                buf[bufIdx++] = 0xC0 + (charCode >>> 6);
                buf[bufIdx++] = 0x80 + (charCode & 0x3f);
            }
            else { // charCode will always be < 0x10000 in javascript.
                buf[bufIdx++] = 0xE0 + (charCode >>> 12);
                buf[bufIdx++] = 0x80 + ((charCode >>> 6) & 0x3f);
                buf[bufIdx++] = 0x80 + (charCode & 0x3f);
            }
        }
        return buf.slice(0, bufIdx);
    };

    InternalEncoderCesu8.prototype.end = function() {
    };

    //------------------------------------------------------------------------------
    // CESU-8 decoder is not implemented in Node v4.0+

    function InternalDecoderCesu8(options, codec) {
        this.acc = 0;
        this.contBytes = 0;
        this.accBytes = 0;
        this.defaultCharUnicode = codec.defaultCharUnicode;
    }

    InternalDecoderCesu8.prototype.write = function(buf) {
        var acc = this.acc, contBytes = this.contBytes, accBytes = this.accBytes, 
            res = '';
        for (var i = 0; i < buf.length; i++) {
            var curByte = buf[i];
            if ((curByte & 0xC0) !== 0x80) { // Leading byte
                if (contBytes > 0) { // Previous code is invalid
                    res += this.defaultCharUnicode;
                    contBytes = 0;
                }

                if (curByte < 0x80) { // Single-byte code
                    res += String.fromCharCode(curByte);
                } else if (curByte < 0xE0) { // Two-byte code
                    acc = curByte & 0x1F;
                    contBytes = 1; accBytes = 1;
                } else if (curByte < 0xF0) { // Three-byte code
                    acc = curByte & 0x0F;
                    contBytes = 2; accBytes = 1;
                } else { // Four or more are not supported for CESU-8.
                    res += this.defaultCharUnicode;
                }
            } else { // Continuation byte
                if (contBytes > 0) { // We're waiting for it.
                    acc = (acc << 6) | (curByte & 0x3f);
                    contBytes--; accBytes++;
                    if (contBytes === 0) {
                        // Check for overlong encoding, but support Modified UTF-8 (encoding NULL as C0 80)
                        if (accBytes === 2 && acc < 0x80 && acc > 0)
                            res += this.defaultCharUnicode;
                        else if (accBytes === 3 && acc < 0x800)
                            res += this.defaultCharUnicode;
                        else
                            // Actually add character.
                            res += String.fromCharCode(acc);
                    }
                } else { // Unexpected continuation byte
                    res += this.defaultCharUnicode;
                }
            }
        }
        this.acc = acc; this.contBytes = contBytes; this.accBytes = accBytes;
        return res;
    };

    InternalDecoderCesu8.prototype.end = function() {
        var res = 0;
        if (this.contBytes > 0)
            res += this.defaultCharUnicode;
        return res;
    };

    var Buffer$6 = safer_1.Buffer;

    // == UTF32-LE/BE codec. ==========================================================

    var _utf32 = Utf32Codec;

    function Utf32Codec(codecOptions, iconv) {
        this.iconv = iconv;
        this.bomAware = true;
        this.isLE = codecOptions.isLE;
    }

    var utf32le = { type: '_utf32', isLE: true };
    var utf32be = { type: '_utf32', isLE: false };

    // Aliases
    var ucs4le = 'utf32le';
    var ucs4be = 'utf32be';

    Utf32Codec.prototype.encoder = Utf32Encoder;
    Utf32Codec.prototype.decoder = Utf32Decoder;

    // -- Encoding

    function Utf32Encoder(options, codec) {
        this.isLE = codec.isLE;
        this.highSurrogate = 0;
    }

    Utf32Encoder.prototype.write = function(str) {
        var src = Buffer$6.from(str, 'ucs2');
        var dst = Buffer$6.alloc(src.length * 2);
        var write32 = this.isLE ? dst.writeUInt32LE : dst.writeUInt32BE;
        var offset = 0;

        for (var i = 0; i < src.length; i += 2) {
            var code = src.readUInt16LE(i);
            var isHighSurrogate = (0xD800 <= code && code < 0xDC00);
            var isLowSurrogate = (0xDC00 <= code && code < 0xE000);

            if (this.highSurrogate) {
                if (isHighSurrogate || !isLowSurrogate) {
                    // There shouldn't be two high surrogates in a row, nor a high surrogate which isn't followed by a low
                    // surrogate. If this happens, keep the pending high surrogate as a stand-alone semi-invalid character
                    // (technically wrong, but expected by some applications, like Windows file names).
                    write32.call(dst, this.highSurrogate, offset);
                    offset += 4;
                }
                else {
                    // Create 32-bit value from high and low surrogates;
                    var codepoint = (((this.highSurrogate - 0xD800) << 10) | (code - 0xDC00)) + 0x10000;

                    write32.call(dst, codepoint, offset);
                    offset += 4;
                    this.highSurrogate = 0;

                    continue;
                }
            }

            if (isHighSurrogate)
                this.highSurrogate = code;
            else {
                // Even if the current character is a low surrogate, with no previous high surrogate, we'll
                // encode it as a semi-invalid stand-alone character for the same reasons expressed above for
                // unpaired high surrogates.
                write32.call(dst, code, offset);
                offset += 4;
                this.highSurrogate = 0;
            }
        }

        if (offset < dst.length)
            dst = dst.slice(0, offset);

        return dst;
    };

    Utf32Encoder.prototype.end = function() {
        // Treat any leftover high surrogate as a semi-valid independent character.
        if (!this.highSurrogate)
            return;

        var buf = Buffer$6.alloc(4);

        if (this.isLE)
            buf.writeUInt32LE(this.highSurrogate, 0);
        else
            buf.writeUInt32BE(this.highSurrogate, 0);

        this.highSurrogate = 0;

        return buf;
    };

    // -- Decoding

    function Utf32Decoder(options, codec) {
        this.isLE = codec.isLE;
        this.badChar = codec.iconv.defaultCharUnicode.charCodeAt(0);
        this.overflow = [];
    }

    Utf32Decoder.prototype.write = function(src) {
        if (src.length === 0)
            return '';

        var i = 0;
        var codepoint = 0;
        var dst = Buffer$6.alloc(src.length + 4);
        var offset = 0;
        var isLE = this.isLE;
        var overflow = this.overflow;
        var badChar = this.badChar;

        if (overflow.length > 0) {
            for (; i < src.length && overflow.length < 4; i++)
                overflow.push(src[i]);
            
            if (overflow.length === 4) {
                // NOTE: codepoint is a signed int32 and can be negative.
                // NOTE: We copied this block from below to help V8 optimize it (it works with array, not buffer).
                if (isLE) {
                    codepoint = overflow[i] | (overflow[i+1] << 8) | (overflow[i+2] << 16) | (overflow[i+3] << 24);
                } else {
                    codepoint = overflow[i+3] | (overflow[i+2] << 8) | (overflow[i+1] << 16) | (overflow[i] << 24);
                }
                overflow.length = 0;

                offset = _writeCodepoint(dst, offset, codepoint, badChar);
            }
        }

        // Main loop. Should be as optimized as possible.
        for (; i < src.length - 3; i += 4) {
            // NOTE: codepoint is a signed int32 and can be negative.
            if (isLE) {
                codepoint = src[i] | (src[i+1] << 8) | (src[i+2] << 16) | (src[i+3] << 24);
            } else {
                codepoint = src[i+3] | (src[i+2] << 8) | (src[i+1] << 16) | (src[i] << 24);
            }
            offset = _writeCodepoint(dst, offset, codepoint, badChar);
        }

        // Keep overflowing bytes.
        for (; i < src.length; i++) {
            overflow.push(src[i]);
        }

        return dst.slice(0, offset).toString('ucs2');
    };

    function _writeCodepoint(dst, offset, codepoint, badChar) {
        // NOTE: codepoint is signed int32 and can be negative. We keep it that way to help V8 with optimizations.
        if (codepoint < 0 || codepoint > 0x10FFFF) {
            // Not a valid Unicode codepoint
            codepoint = badChar;
        } 

        // Ephemeral Planes: Write high surrogate.
        if (codepoint >= 0x10000) {
            codepoint -= 0x10000;

            var high = 0xD800 | (codepoint >> 10);
            dst[offset++] = high & 0xff;
            dst[offset++] = high >> 8;

            // Low surrogate is written below.
            var codepoint = 0xDC00 | (codepoint & 0x3FF);
        }

        // Write BMP char or low surrogate.
        dst[offset++] = codepoint & 0xff;
        dst[offset++] = codepoint >> 8;

        return offset;
    }
    Utf32Decoder.prototype.end = function() {
        this.overflow.length = 0;
    };

    // == UTF-32 Auto codec =============================================================
    // Decoder chooses automatically from UTF-32LE and UTF-32BE using BOM and space-based heuristic.
    // Defaults to UTF-32LE. http://en.wikipedia.org/wiki/UTF-32
    // Encoder/decoder default can be changed: iconv.decode(buf, 'utf32', {defaultEncoding: 'utf-32be'});

    // Encoder prepends BOM (which can be overridden with (addBOM: false}).

    var utf32_1 = Utf32AutoCodec;
    var ucs4 = 'utf32';

    function Utf32AutoCodec(options, iconv) {
        this.iconv = iconv;
    }

    Utf32AutoCodec.prototype.encoder = Utf32AutoEncoder;
    Utf32AutoCodec.prototype.decoder = Utf32AutoDecoder;

    // -- Encoding

    function Utf32AutoEncoder(options, codec) {
        options = options || {};

        if (options.addBOM === undefined)
            options.addBOM = true;

        this.encoder = codec.iconv.getEncoder(options.defaultEncoding || 'utf-32le', options);
    }

    Utf32AutoEncoder.prototype.write = function(str) {
        return this.encoder.write(str);
    };

    Utf32AutoEncoder.prototype.end = function() {
        return this.encoder.end();
    };

    // -- Decoding

    function Utf32AutoDecoder(options, codec) {
        this.decoder = null;
        this.initialBufs = [];
        this.initialBufsLen = 0;
        this.options = options || {};
        this.iconv = codec.iconv;
    }

    Utf32AutoDecoder.prototype.write = function(buf) {
        if (!this.decoder) { 
            // Codec is not chosen yet. Accumulate initial bytes.
            this.initialBufs.push(buf);
            this.initialBufsLen += buf.length;

            if (this.initialBufsLen < 32) // We need more bytes to use space heuristic (see below)
                return '';

            // We have enough bytes -> detect endianness.
            var encoding = detectEncoding$1(this.initialBufs, this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options);

            var resStr = '';
            for (var i = 0; i < this.initialBufs.length; i++)
                resStr += this.decoder.write(this.initialBufs[i]);

            this.initialBufs.length = this.initialBufsLen = 0;
            return resStr;
        }

        return this.decoder.write(buf);
    };

    Utf32AutoDecoder.prototype.end = function() {
        if (!this.decoder) {
            var encoding = detectEncoding$1(this.initialBufs, this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options);

            var resStr = '';
            for (var i = 0; i < this.initialBufs.length; i++)
                resStr += this.decoder.write(this.initialBufs[i]);

            var trail = this.decoder.end();
            if (trail)
                resStr += trail;

            this.initialBufs.length = this.initialBufsLen = 0;
            return resStr;
        }

        return this.decoder.end();
    };

    function detectEncoding$1(bufs, defaultEncoding) {
        var b = [];
        var charsProcessed = 0;
        var invalidLE = 0, invalidBE = 0;   // Number of invalid chars when decoded as LE or BE.
        var bmpCharsLE = 0, bmpCharsBE = 0; // Number of BMP chars when decoded as LE or BE.

        outer_loop:
        for (var i = 0; i < bufs.length; i++) {
            var buf = bufs[i];
            for (var j = 0; j < buf.length; j++) {
                b.push(buf[j]);
                if (b.length === 4) {
                    if (charsProcessed === 0) {
                        // Check BOM first.
                        if (b[0] === 0xFF && b[1] === 0xFE && b[2] === 0 && b[3] === 0) {
                            return 'utf-32le';
                        }
                        if (b[0] === 0 && b[1] === 0 && b[2] === 0xFE && b[3] === 0xFF) {
                            return 'utf-32be';
                        }
                    }

                    if (b[0] !== 0 || b[1] > 0x10) invalidBE++;
                    if (b[3] !== 0 || b[2] > 0x10) invalidLE++;

                    if (b[0] === 0 && b[1] === 0 && (b[2] !== 0 || b[3] !== 0)) bmpCharsBE++;
                    if ((b[0] !== 0 || b[1] !== 0) && b[2] === 0 && b[3] === 0) bmpCharsLE++;

                    b.length = 0;
                    charsProcessed++;

                    if (charsProcessed >= 100) {
                        break outer_loop;
                    }
                }
            }
        }

        // Make decisions.
        if (bmpCharsBE - invalidBE > bmpCharsLE - invalidLE)  return 'utf-32be';
        if (bmpCharsBE - invalidBE < bmpCharsLE - invalidLE)  return 'utf-32le';

        // Couldn't decide (likely all zeros or not enough data).
        return defaultEncoding || 'utf-32le';
    }

    var utf32 = {
    	_utf32: _utf32,
    	utf32le: utf32le,
    	utf32be: utf32be,
    	ucs4le: ucs4le,
    	ucs4be: ucs4be,
    	utf32: utf32_1,
    	ucs4: ucs4
    };

    var Buffer$5 = safer_1.Buffer;

    // Note: UTF16-LE (or UCS2) codec is Node.js native. See encodings/internal.js

    // == UTF16-BE codec. ==========================================================

    var utf16be = Utf16BECodec;
    function Utf16BECodec() {
    }

    Utf16BECodec.prototype.encoder = Utf16BEEncoder;
    Utf16BECodec.prototype.decoder = Utf16BEDecoder;
    Utf16BECodec.prototype.bomAware = true;


    // -- Encoding

    function Utf16BEEncoder() {
    }

    Utf16BEEncoder.prototype.write = function(str) {
        var buf = Buffer$5.from(str, 'ucs2');
        for (var i = 0; i < buf.length; i += 2) {
            var tmp = buf[i]; buf[i] = buf[i+1]; buf[i+1] = tmp;
        }
        return buf;
    };

    Utf16BEEncoder.prototype.end = function() {
    };


    // -- Decoding

    function Utf16BEDecoder() {
        this.overflowByte = -1;
    }

    Utf16BEDecoder.prototype.write = function(buf) {
        if (buf.length == 0)
            return '';

        var buf2 = Buffer$5.alloc(buf.length + 1),
            i = 0, j = 0;

        if (this.overflowByte !== -1) {
            buf2[0] = buf[0];
            buf2[1] = this.overflowByte;
            i = 1; j = 2;
        }

        for (; i < buf.length-1; i += 2, j+= 2) {
            buf2[j] = buf[i+1];
            buf2[j+1] = buf[i];
        }

        this.overflowByte = (i == buf.length-1) ? buf[buf.length-1] : -1;

        return buf2.slice(0, j).toString('ucs2');
    };

    Utf16BEDecoder.prototype.end = function() {
        this.overflowByte = -1;
    };


    // == UTF-16 codec =============================================================
    // Decoder chooses automatically from UTF-16LE and UTF-16BE using BOM and space-based heuristic.
    // Defaults to UTF-16LE, as it's prevalent and default in Node.
    // http://en.wikipedia.org/wiki/UTF-16 and http://encoding.spec.whatwg.org/#utf-16le
    // Decoder default can be changed: iconv.decode(buf, 'utf16', {defaultEncoding: 'utf-16be'});

    // Encoder uses UTF-16LE and prepends BOM (which can be overridden with addBOM: false).

    var utf16_1 = Utf16Codec;
    function Utf16Codec(codecOptions, iconv) {
        this.iconv = iconv;
    }

    Utf16Codec.prototype.encoder = Utf16Encoder;
    Utf16Codec.prototype.decoder = Utf16Decoder;


    // -- Encoding (pass-through)

    function Utf16Encoder(options, codec) {
        options = options || {};
        if (options.addBOM === undefined)
            options.addBOM = true;
        this.encoder = codec.iconv.getEncoder('utf-16le', options);
    }

    Utf16Encoder.prototype.write = function(str) {
        return this.encoder.write(str);
    };

    Utf16Encoder.prototype.end = function() {
        return this.encoder.end();
    };


    // -- Decoding

    function Utf16Decoder(options, codec) {
        this.decoder = null;
        this.initialBufs = [];
        this.initialBufsLen = 0;

        this.options = options || {};
        this.iconv = codec.iconv;
    }

    Utf16Decoder.prototype.write = function(buf) {
        if (!this.decoder) {
            // Codec is not chosen yet. Accumulate initial bytes.
            this.initialBufs.push(buf);
            this.initialBufsLen += buf.length;
            
            if (this.initialBufsLen < 16) // We need more bytes to use space heuristic (see below)
                return '';

            // We have enough bytes -> detect endianness.
            var encoding = detectEncoding(this.initialBufs, this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options);

            var resStr = '';
            for (var i = 0; i < this.initialBufs.length; i++)
                resStr += this.decoder.write(this.initialBufs[i]);

            this.initialBufs.length = this.initialBufsLen = 0;
            return resStr;
        }

        return this.decoder.write(buf);
    };

    Utf16Decoder.prototype.end = function() {
        if (!this.decoder) {
            var encoding = detectEncoding(this.initialBufs, this.options.defaultEncoding);
            this.decoder = this.iconv.getDecoder(encoding, this.options);

            var resStr = '';
            for (var i = 0; i < this.initialBufs.length; i++)
                resStr += this.decoder.write(this.initialBufs[i]);

            var trail = this.decoder.end();
            if (trail)
                resStr += trail;

            this.initialBufs.length = this.initialBufsLen = 0;
            return resStr;
        }
        return this.decoder.end();
    };

    function detectEncoding(bufs, defaultEncoding) {
        var b = [];
        var charsProcessed = 0;
        var asciiCharsLE = 0, asciiCharsBE = 0; // Number of ASCII chars when decoded as LE or BE.

        outer_loop:
        for (var i = 0; i < bufs.length; i++) {
            var buf = bufs[i];
            for (var j = 0; j < buf.length; j++) {
                b.push(buf[j]);
                if (b.length === 2) {
                    if (charsProcessed === 0) {
                        // Check BOM first.
                        if (b[0] === 0xFF && b[1] === 0xFE) return 'utf-16le';
                        if (b[0] === 0xFE && b[1] === 0xFF) return 'utf-16be';
                    }

                    if (b[0] === 0 && b[1] !== 0) asciiCharsBE++;
                    if (b[0] !== 0 && b[1] === 0) asciiCharsLE++;

                    b.length = 0;
                    charsProcessed++;

                    if (charsProcessed >= 100) {
                        break outer_loop;
                    }
                }
            }
        }

        // Make decisions.
        // Most of the time, the content has ASCII chars (U+00**), but the opposite (U+**00) is uncommon.
        // So, we count ASCII as if it was LE or BE, and decide from that.
        if (asciiCharsBE > asciiCharsLE) return 'utf-16be';
        if (asciiCharsBE < asciiCharsLE) return 'utf-16le';

        // Couldn't decide (likely all zeros or not enough data).
        return defaultEncoding || 'utf-16le';
    }

    var utf16 = {
    	utf16be: utf16be,
    	utf16: utf16_1
    };

    var Buffer$4 = safer_1.Buffer;

    // UTF-7 codec, according to https://tools.ietf.org/html/rfc2152
    // See also below a UTF-7-IMAP codec, according to http://tools.ietf.org/html/rfc3501#section-5.1.3

    var utf7_1 = Utf7Codec;
    var unicode11utf7 = 'utf7'; // Alias UNICODE-1-1-UTF-7
    function Utf7Codec(codecOptions, iconv) {
        this.iconv = iconv;
    }
    Utf7Codec.prototype.encoder = Utf7Encoder;
    Utf7Codec.prototype.decoder = Utf7Decoder;
    Utf7Codec.prototype.bomAware = true;


    // -- Encoding

    var nonDirectChars = /[^A-Za-z0-9'\(\),-\.\/:\? \n\r\t]+/g;

    function Utf7Encoder(options, codec) {
        this.iconv = codec.iconv;
    }

    Utf7Encoder.prototype.write = function(str) {
        // Naive implementation.
        // Non-direct chars are encoded as "+<base64>-"; single "+" char is encoded as "+-".
        return Buffer$4.from(str.replace(nonDirectChars, function(chunk) {
            return "+" + (chunk === '+' ? '' : 
                this.iconv.encode(chunk, 'utf16-be').toString('base64').replace(/=+$/, '')) 
                + "-";
        }.bind(this)));
    };

    Utf7Encoder.prototype.end = function() {
    };


    // -- Decoding

    function Utf7Decoder(options, codec) {
        this.iconv = codec.iconv;
        this.inBase64 = false;
        this.base64Accum = '';
    }

    var base64Regex = /[A-Za-z0-9\/+]/;
    var base64Chars = [];
    for (var i$1 = 0; i$1 < 256; i$1++)
        base64Chars[i$1] = base64Regex.test(String.fromCharCode(i$1));

    var plusChar = '+'.charCodeAt(0), 
        minusChar = '-'.charCodeAt(0),
        andChar = '&'.charCodeAt(0);

    Utf7Decoder.prototype.write = function(buf) {
        var res = "", lastI = 0,
            inBase64 = this.inBase64,
            base64Accum = this.base64Accum;

        // The decoder is more involved as we must handle chunks in stream.

        for (var i = 0; i < buf.length; i++) {
            if (!inBase64) { // We're in direct mode.
                // Write direct chars until '+'
                if (buf[i] == plusChar) {
                    res += this.iconv.decode(buf.slice(lastI, i), "ascii"); // Write direct chars.
                    lastI = i+1;
                    inBase64 = true;
                }
            } else { // We decode base64.
                if (!base64Chars[buf[i]]) { // Base64 ended.
                    if (i == lastI && buf[i] == minusChar) {// "+-" -> "+"
                        res += "+";
                    } else {
                        var b64str = base64Accum + this.iconv.decode(buf.slice(lastI, i), "ascii");
                        res += this.iconv.decode(Buffer$4.from(b64str, 'base64'), "utf16-be");
                    }

                    if (buf[i] != minusChar) // Minus is absorbed after base64.
                        i--;

                    lastI = i+1;
                    inBase64 = false;
                    base64Accum = '';
                }
            }
        }

        if (!inBase64) {
            res += this.iconv.decode(buf.slice(lastI), "ascii"); // Write direct chars.
        } else {
            var b64str = base64Accum + this.iconv.decode(buf.slice(lastI), "ascii");

            var canBeDecoded = b64str.length - (b64str.length % 8); // Minimal chunk: 2 quads -> 2x3 bytes -> 3 chars.
            base64Accum = b64str.slice(canBeDecoded); // The rest will be decoded in future.
            b64str = b64str.slice(0, canBeDecoded);

            res += this.iconv.decode(Buffer$4.from(b64str, 'base64'), "utf16-be");
        }

        this.inBase64 = inBase64;
        this.base64Accum = base64Accum;

        return res;
    };

    Utf7Decoder.prototype.end = function() {
        var res = "";
        if (this.inBase64 && this.base64Accum.length > 0)
            res = this.iconv.decode(Buffer$4.from(this.base64Accum, 'base64'), "utf16-be");

        this.inBase64 = false;
        this.base64Accum = '';
        return res;
    };


    // UTF-7-IMAP codec.
    // RFC3501 Sec. 5.1.3 Modified UTF-7 (http://tools.ietf.org/html/rfc3501#section-5.1.3)
    // Differences:
    //  * Base64 part is started by "&" instead of "+"
    //  * Direct characters are 0x20-0x7E, except "&" (0x26)
    //  * In Base64, "," is used instead of "/"
    //  * Base64 must not be used to represent direct characters.
    //  * No implicit shift back from Base64 (should always end with '-')
    //  * String must end in non-shifted position.
    //  * "-&" while in base64 is not allowed.


    var utf7imap = Utf7IMAPCodec;
    function Utf7IMAPCodec(codecOptions, iconv) {
        this.iconv = iconv;
    }
    Utf7IMAPCodec.prototype.encoder = Utf7IMAPEncoder;
    Utf7IMAPCodec.prototype.decoder = Utf7IMAPDecoder;
    Utf7IMAPCodec.prototype.bomAware = true;


    // -- Encoding

    function Utf7IMAPEncoder(options, codec) {
        this.iconv = codec.iconv;
        this.inBase64 = false;
        this.base64Accum = Buffer$4.alloc(6);
        this.base64AccumIdx = 0;
    }

    Utf7IMAPEncoder.prototype.write = function(str) {
        var inBase64 = this.inBase64,
            base64Accum = this.base64Accum,
            base64AccumIdx = this.base64AccumIdx,
            buf = Buffer$4.alloc(str.length*5 + 10), bufIdx = 0;

        for (var i = 0; i < str.length; i++) {
            var uChar = str.charCodeAt(i);
            if (0x20 <= uChar && uChar <= 0x7E) { // Direct character or '&'.
                if (inBase64) {
                    if (base64AccumIdx > 0) {
                        bufIdx += buf.write(base64Accum.slice(0, base64AccumIdx).toString('base64').replace(/\//g, ',').replace(/=+$/, ''), bufIdx);
                        base64AccumIdx = 0;
                    }

                    buf[bufIdx++] = minusChar; // Write '-', then go to direct mode.
                    inBase64 = false;
                }

                if (!inBase64) {
                    buf[bufIdx++] = uChar; // Write direct character

                    if (uChar === andChar)  // Ampersand -> '&-'
                        buf[bufIdx++] = minusChar;
                }

            } else { // Non-direct character
                if (!inBase64) {
                    buf[bufIdx++] = andChar; // Write '&', then go to base64 mode.
                    inBase64 = true;
                }
                if (inBase64) {
                    base64Accum[base64AccumIdx++] = uChar >> 8;
                    base64Accum[base64AccumIdx++] = uChar & 0xFF;

                    if (base64AccumIdx == base64Accum.length) {
                        bufIdx += buf.write(base64Accum.toString('base64').replace(/\//g, ','), bufIdx);
                        base64AccumIdx = 0;
                    }
                }
            }
        }

        this.inBase64 = inBase64;
        this.base64AccumIdx = base64AccumIdx;

        return buf.slice(0, bufIdx);
    };

    Utf7IMAPEncoder.prototype.end = function() {
        var buf = Buffer$4.alloc(10), bufIdx = 0;
        if (this.inBase64) {
            if (this.base64AccumIdx > 0) {
                bufIdx += buf.write(this.base64Accum.slice(0, this.base64AccumIdx).toString('base64').replace(/\//g, ',').replace(/=+$/, ''), bufIdx);
                this.base64AccumIdx = 0;
            }

            buf[bufIdx++] = minusChar; // Write '-', then go to direct mode.
            this.inBase64 = false;
        }

        return buf.slice(0, bufIdx);
    };


    // -- Decoding

    function Utf7IMAPDecoder(options, codec) {
        this.iconv = codec.iconv;
        this.inBase64 = false;
        this.base64Accum = '';
    }

    var base64IMAPChars = base64Chars.slice();
    base64IMAPChars[','.charCodeAt(0)] = true;

    Utf7IMAPDecoder.prototype.write = function(buf) {
        var res = "", lastI = 0,
            inBase64 = this.inBase64,
            base64Accum = this.base64Accum;

        // The decoder is more involved as we must handle chunks in stream.
        // It is forgiving, closer to standard UTF-7 (for example, '-' is optional at the end).

        for (var i = 0; i < buf.length; i++) {
            if (!inBase64) { // We're in direct mode.
                // Write direct chars until '&'
                if (buf[i] == andChar) {
                    res += this.iconv.decode(buf.slice(lastI, i), "ascii"); // Write direct chars.
                    lastI = i+1;
                    inBase64 = true;
                }
            } else { // We decode base64.
                if (!base64IMAPChars[buf[i]]) { // Base64 ended.
                    if (i == lastI && buf[i] == minusChar) { // "&-" -> "&"
                        res += "&";
                    } else {
                        var b64str = base64Accum + this.iconv.decode(buf.slice(lastI, i), "ascii").replace(/,/g, '/');
                        res += this.iconv.decode(Buffer$4.from(b64str, 'base64'), "utf16-be");
                    }

                    if (buf[i] != minusChar) // Minus may be absorbed after base64.
                        i--;

                    lastI = i+1;
                    inBase64 = false;
                    base64Accum = '';
                }
            }
        }

        if (!inBase64) {
            res += this.iconv.decode(buf.slice(lastI), "ascii"); // Write direct chars.
        } else {
            var b64str = base64Accum + this.iconv.decode(buf.slice(lastI), "ascii").replace(/,/g, '/');

            var canBeDecoded = b64str.length - (b64str.length % 8); // Minimal chunk: 2 quads -> 2x3 bytes -> 3 chars.
            base64Accum = b64str.slice(canBeDecoded); // The rest will be decoded in future.
            b64str = b64str.slice(0, canBeDecoded);

            res += this.iconv.decode(Buffer$4.from(b64str, 'base64'), "utf16-be");
        }

        this.inBase64 = inBase64;
        this.base64Accum = base64Accum;

        return res;
    };

    Utf7IMAPDecoder.prototype.end = function() {
        var res = "";
        if (this.inBase64 && this.base64Accum.length > 0)
            res = this.iconv.decode(Buffer$4.from(this.base64Accum, 'base64'), "utf16-be");

        this.inBase64 = false;
        this.base64Accum = '';
        return res;
    };

    var utf7 = {
    	utf7: utf7_1,
    	unicode11utf7: unicode11utf7,
    	utf7imap: utf7imap
    };

    var Buffer$3 = safer_1.Buffer;

    // Single-byte codec. Needs a 'chars' string parameter that contains 256 or 128 chars that
    // correspond to encoded bytes (if 128 - then lower half is ASCII). 

    var _sbcs = SBCSCodec;
    function SBCSCodec(codecOptions, iconv) {
        if (!codecOptions)
            throw new Error("SBCS codec is called without the data.")
        
        // Prepare char buffer for decoding.
        if (!codecOptions.chars || (codecOptions.chars.length !== 128 && codecOptions.chars.length !== 256))
            throw new Error("Encoding '"+codecOptions.type+"' has incorrect 'chars' (must be of len 128 or 256)");
        
        if (codecOptions.chars.length === 128) {
            var asciiString = "";
            for (var i = 0; i < 128; i++)
                asciiString += String.fromCharCode(i);
            codecOptions.chars = asciiString + codecOptions.chars;
        }

        this.decodeBuf = Buffer$3.from(codecOptions.chars, 'ucs2');
        
        // Encoding buffer.
        var encodeBuf = Buffer$3.alloc(65536, iconv.defaultCharSingleByte.charCodeAt(0));

        for (var i = 0; i < codecOptions.chars.length; i++)
            encodeBuf[codecOptions.chars.charCodeAt(i)] = i;

        this.encodeBuf = encodeBuf;
    }

    SBCSCodec.prototype.encoder = SBCSEncoder;
    SBCSCodec.prototype.decoder = SBCSDecoder;


    function SBCSEncoder(options, codec) {
        this.encodeBuf = codec.encodeBuf;
    }

    SBCSEncoder.prototype.write = function(str) {
        var buf = Buffer$3.alloc(str.length);
        for (var i = 0; i < str.length; i++)
            buf[i] = this.encodeBuf[str.charCodeAt(i)];
        
        return buf;
    };

    SBCSEncoder.prototype.end = function() {
    };


    function SBCSDecoder(options, codec) {
        this.decodeBuf = codec.decodeBuf;
    }

    SBCSDecoder.prototype.write = function(buf) {
        // Strings are immutable in JS -> we use ucs2 buffer to speed up computations.
        var decodeBuf = this.decodeBuf;
        var newBuf = Buffer$3.alloc(buf.length*2);
        var idx1 = 0, idx2 = 0;
        for (var i = 0; i < buf.length; i++) {
            idx1 = buf[i]*2; idx2 = i*2;
            newBuf[idx2] = decodeBuf[idx1];
            newBuf[idx2+1] = decodeBuf[idx1+1];
        }
        return newBuf.toString('ucs2');
    };

    SBCSDecoder.prototype.end = function() {
    };

    var sbcsCodec = {
    	_sbcs: _sbcs
    };

    // Manually added data to be used by sbcs codec in addition to generated one.

    var sbcsData = {
        // Not supported by iconv, not sure why.
        "10029": "maccenteuro",
        "maccenteuro": {
            "type": "_sbcs",
            "chars": "ÄĀāÉĄÖÜáąČäčĆćéŹźĎíďĒēĖóėôöõúĚěü†°Ę£§•¶ß®©™ę¨≠ģĮįĪ≤≥īĶ∂∑łĻļĽľĹĺŅņŃ¬√ńŇ∆«»… ňŐÕőŌ–—“”‘’÷◊ōŔŕŘ‹›řŖŗŠ‚„šŚśÁŤťÍŽžŪÓÔūŮÚůŰűŲųÝýķŻŁżĢˇ"
        },

        "808": "cp808",
        "ibm808": "cp808",
        "cp808": {
            "type": "_sbcs",
            "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№€■ "
        },

        "mik": {
            "type": "_sbcs",
            "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя└┴┬├─┼╣║╚╔╩╦╠═╬┐░▒▓│┤№§╗╝┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
        },

        "cp720": {
            "type": "_sbcs",
            "chars": "\x80\x81éâ\x84à\x86çêëèïî\x8d\x8e\x8f\x90\u0651\u0652ô¤ـûùءآأؤ£إئابةتثجحخدذرزسشص«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ضطظعغفµقكلمنهوىي≡\u064b\u064c\u064d\u064e\u064f\u0650≈°∙·√ⁿ²■\u00a0"
        },

        // Aliases of generated encodings.
        "ascii8bit": "ascii",
        "usascii": "ascii",
        "ansix34": "ascii",
        "ansix341968": "ascii",
        "ansix341986": "ascii",
        "csascii": "ascii",
        "cp367": "ascii",
        "ibm367": "ascii",
        "isoir6": "ascii",
        "iso646us": "ascii",
        "iso646irv": "ascii",
        "us": "ascii",

        "latin1": "iso88591",
        "latin2": "iso88592",
        "latin3": "iso88593",
        "latin4": "iso88594",
        "latin5": "iso88599",
        "latin6": "iso885910",
        "latin7": "iso885913",
        "latin8": "iso885914",
        "latin9": "iso885915",
        "latin10": "iso885916",

        "csisolatin1": "iso88591",
        "csisolatin2": "iso88592",
        "csisolatin3": "iso88593",
        "csisolatin4": "iso88594",
        "csisolatincyrillic": "iso88595",
        "csisolatinarabic": "iso88596",
        "csisolatingreek" : "iso88597",
        "csisolatinhebrew": "iso88598",
        "csisolatin5": "iso88599",
        "csisolatin6": "iso885910",

        "l1": "iso88591",
        "l2": "iso88592",
        "l3": "iso88593",
        "l4": "iso88594",
        "l5": "iso88599",
        "l6": "iso885910",
        "l7": "iso885913",
        "l8": "iso885914",
        "l9": "iso885915",
        "l10": "iso885916",

        "isoir14": "iso646jp",
        "isoir57": "iso646cn",
        "isoir100": "iso88591",
        "isoir101": "iso88592",
        "isoir109": "iso88593",
        "isoir110": "iso88594",
        "isoir144": "iso88595",
        "isoir127": "iso88596",
        "isoir126": "iso88597",
        "isoir138": "iso88598",
        "isoir148": "iso88599",
        "isoir157": "iso885910",
        "isoir166": "tis620",
        "isoir179": "iso885913",
        "isoir199": "iso885914",
        "isoir203": "iso885915",
        "isoir226": "iso885916",

        "cp819": "iso88591",
        "ibm819": "iso88591",

        "cyrillic": "iso88595",

        "arabic": "iso88596",
        "arabic8": "iso88596",
        "ecma114": "iso88596",
        "asmo708": "iso88596",

        "greek" : "iso88597",
        "greek8" : "iso88597",
        "ecma118" : "iso88597",
        "elot928" : "iso88597",

        "hebrew": "iso88598",
        "hebrew8": "iso88598",

        "turkish": "iso88599",
        "turkish8": "iso88599",

        "thai": "iso885911",
        "thai8": "iso885911",

        "celtic": "iso885914",
        "celtic8": "iso885914",
        "isoceltic": "iso885914",

        "tis6200": "tis620",
        "tis62025291": "tis620",
        "tis62025330": "tis620",

        "10000": "macroman",
        "10006": "macgreek",
        "10007": "maccyrillic",
        "10079": "maciceland",
        "10081": "macturkish",

        "cspc8codepage437": "cp437",
        "cspc775baltic": "cp775",
        "cspc850multilingual": "cp850",
        "cspcp852": "cp852",
        "cspc862latinhebrew": "cp862",
        "cpgr": "cp869",

        "msee": "cp1250",
        "mscyrl": "cp1251",
        "msansi": "cp1252",
        "msgreek": "cp1253",
        "msturk": "cp1254",
        "mshebr": "cp1255",
        "msarab": "cp1256",
        "winbaltrim": "cp1257",

        "cp20866": "koi8r",
        "20866": "koi8r",
        "ibm878": "koi8r",
        "cskoi8r": "koi8r",

        "cp21866": "koi8u",
        "21866": "koi8u",
        "ibm1168": "koi8u",

        "strk10482002": "rk1048",

        "tcvn5712": "tcvn",
        "tcvn57121": "tcvn",

        "gb198880": "iso646cn",
        "cn": "iso646cn",

        "csiso14jisc6220ro": "iso646jp",
        "jisc62201969ro": "iso646jp",
        "jp": "iso646jp",

        "cshproman8": "hproman8",
        "r8": "hproman8",
        "roman8": "hproman8",
        "xroman8": "hproman8",
        "ibm1051": "hproman8",

        "mac": "macintosh",
        "csmacintosh": "macintosh",
    };

    // Generated data for sbcs codec. Don't edit manually. Regenerate using generation/gen-sbcs.js script.
    var sbcsDataGenerated = {
      "437": "cp437",
      "737": "cp737",
      "775": "cp775",
      "850": "cp850",
      "852": "cp852",
      "855": "cp855",
      "856": "cp856",
      "857": "cp857",
      "858": "cp858",
      "860": "cp860",
      "861": "cp861",
      "862": "cp862",
      "863": "cp863",
      "864": "cp864",
      "865": "cp865",
      "866": "cp866",
      "869": "cp869",
      "874": "windows874",
      "922": "cp922",
      "1046": "cp1046",
      "1124": "cp1124",
      "1125": "cp1125",
      "1129": "cp1129",
      "1133": "cp1133",
      "1161": "cp1161",
      "1162": "cp1162",
      "1163": "cp1163",
      "1250": "windows1250",
      "1251": "windows1251",
      "1252": "windows1252",
      "1253": "windows1253",
      "1254": "windows1254",
      "1255": "windows1255",
      "1256": "windows1256",
      "1257": "windows1257",
      "1258": "windows1258",
      "28591": "iso88591",
      "28592": "iso88592",
      "28593": "iso88593",
      "28594": "iso88594",
      "28595": "iso88595",
      "28596": "iso88596",
      "28597": "iso88597",
      "28598": "iso88598",
      "28599": "iso88599",
      "28600": "iso885910",
      "28601": "iso885911",
      "28603": "iso885913",
      "28604": "iso885914",
      "28605": "iso885915",
      "28606": "iso885916",
      "windows874": {
        "type": "_sbcs",
        "chars": "€����…�����������‘’“”•–—�������� กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
      },
      "win874": "windows874",
      "cp874": "windows874",
      "windows1250": {
        "type": "_sbcs",
        "chars": "€�‚�„…†‡�‰Š‹ŚŤŽŹ�‘’“”•–—�™š›śťžź ˇ˘Ł¤Ą¦§¨©Ş«¬­®Ż°±˛ł´µ¶·¸ąş»Ľ˝ľżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙"
      },
      "win1250": "windows1250",
      "cp1250": "windows1250",
      "windows1251": {
        "type": "_sbcs",
        "chars": "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
      },
      "win1251": "windows1251",
      "cp1251": "windows1251",
      "windows1252": {
        "type": "_sbcs",
        "chars": "€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
      },
      "win1252": "windows1252",
      "cp1252": "windows1252",
      "windows1253": {
        "type": "_sbcs",
        "chars": "€�‚ƒ„…†‡�‰�‹�����‘’“”•–—�™�›���� ΅Ά£¤¥¦§¨©�«¬­®―°±²³΄µ¶·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�"
      },
      "win1253": "windows1253",
      "cp1253": "windows1253",
      "windows1254": {
        "type": "_sbcs",
        "chars": "€�‚ƒ„…†‡ˆ‰Š‹Œ����‘’“”•–—˜™š›œ��Ÿ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ"
      },
      "win1254": "windows1254",
      "cp1254": "windows1254",
      "windows1255": {
        "type": "_sbcs",
        "chars": "€�‚ƒ„…†‡ˆ‰�‹�����‘’“”•–—˜™�›���� ¡¢£₪¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾¿ְֱֲֳִֵֶַָֹֺֻּֽ־ֿ׀ׁׂ׃װױײ׳״�������אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�"
      },
      "win1255": "windows1255",
      "cp1255": "windows1255",
      "windows1256": {
        "type": "_sbcs",
        "chars": "€پ‚ƒ„…†‡ˆ‰ٹ‹Œچژڈگ‘’“”•–—ک™ڑ›œ‌‍ں ،¢£¤¥¦§¨©ھ«¬­®¯°±²³´µ¶·¸¹؛»¼½¾؟ہءآأؤإئابةتثجحخدذرزسشصض×طظعغـفقكàلâمنهوçèéêëىيîïًٌٍَôُِ÷ّùْûü‎‏ے"
      },
      "win1256": "windows1256",
      "cp1256": "windows1256",
      "windows1257": {
        "type": "_sbcs",
        "chars": "€�‚�„…†‡�‰�‹�¨ˇ¸�‘’“”•–—�™�›�¯˛� �¢£¤�¦§Ø©Ŗ«¬­®Æ°±²³´µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž˙"
      },
      "win1257": "windows1257",
      "cp1257": "windows1257",
      "windows1258": {
        "type": "_sbcs",
        "chars": "€�‚ƒ„…†‡ˆ‰�‹Œ����‘’“”•–—˜™�›œ��Ÿ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
      },
      "win1258": "windows1258",
      "cp1258": "windows1258",
      "iso88591": {
        "type": "_sbcs",
        "chars": " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
      },
      "cp28591": "iso88591",
      "iso88592": {
        "type": "_sbcs",
        "chars": " Ą˘Ł¤ĽŚ§¨ŠŞŤŹ­ŽŻ°ą˛ł´ľśˇ¸šşťź˝žżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙"
      },
      "cp28592": "iso88592",
      "iso88593": {
        "type": "_sbcs",
        "chars": " Ħ˘£¤�Ĥ§¨İŞĞĴ­�Ż°ħ²³´µĥ·¸ışğĵ½�żÀÁÂ�ÄĊĈÇÈÉÊËÌÍÎÏ�ÑÒÓÔĠÖ×ĜÙÚÛÜŬŜßàáâ�äċĉçèéêëìíîï�ñòóôġö÷ĝùúûüŭŝ˙"
      },
      "cp28593": "iso88593",
      "iso88594": {
        "type": "_sbcs",
        "chars": " ĄĸŖ¤ĨĻ§¨ŠĒĢŦ­Ž¯°ą˛ŗ´ĩļˇ¸šēģŧŊžŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎĪĐŅŌĶÔÕÖ×ØŲÚÛÜŨŪßāáâãäåæįčéęëėíîīđņōķôõö÷øųúûüũū˙"
      },
      "cp28594": "iso88594",
      "iso88595": {
        "type": "_sbcs",
        "chars": " ЁЂЃЄЅІЇЈЉЊЋЌ­ЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђѓєѕіїјљњћќ§ўџ"
      },
      "cp28595": "iso88595",
      "iso88596": {
        "type": "_sbcs",
        "chars": " ���¤�������،­�������������؛���؟�ءآأؤإئابةتثجحخدذرزسشصضطظعغ�����ـفقكلمنهوىيًٌٍَُِّْ�������������"
      },
      "cp28596": "iso88596",
      "iso88597": {
        "type": "_sbcs",
        "chars": " ‘’£€₯¦§¨©ͺ«¬­�―°±²³΄΅Ά·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ�ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ�"
      },
      "cp28597": "iso88597",
      "iso88598": {
        "type": "_sbcs",
        "chars": " �¢£¤¥¦§¨©×«¬­®¯°±²³´µ¶·¸¹÷»¼½¾��������������������������������‗אבגדהוזחטיךכלםמןנסעףפץצקרשת��‎‏�"
      },
      "cp28598": "iso88598",
      "iso88599": {
        "type": "_sbcs",
        "chars": " ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ"
      },
      "cp28599": "iso88599",
      "iso885910": {
        "type": "_sbcs",
        "chars": " ĄĒĢĪĨĶ§ĻĐŠŦŽ­ŪŊ°ąēģīĩķ·ļđšŧž―ūŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎÏÐŅŌÓÔÕÖŨØŲÚÛÜÝÞßāáâãäåæįčéęëėíîïðņōóôõöũøųúûüýþĸ"
      },
      "cp28600": "iso885910",
      "iso885911": {
        "type": "_sbcs",
        "chars": " กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
      },
      "cp28601": "iso885911",
      "iso885913": {
        "type": "_sbcs",
        "chars": " ”¢£¤„¦§Ø©Ŗ«¬­®Æ°±²³“µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž’"
      },
      "cp28603": "iso885913",
      "iso885914": {
        "type": "_sbcs",
        "chars": " Ḃḃ£ĊċḊ§Ẁ©ẂḋỲ­®ŸḞḟĠġṀṁ¶ṖẁṗẃṠỳẄẅṡÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŴÑÒÓÔÕÖṪØÙÚÛÜÝŶßàáâãäåæçèéêëìíîïŵñòóôõöṫøùúûüýŷÿ"
      },
      "cp28604": "iso885914",
      "iso885915": {
        "type": "_sbcs",
        "chars": " ¡¢£€¥Š§š©ª«¬­®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
      },
      "cp28605": "iso885915",
      "iso885916": {
        "type": "_sbcs",
        "chars": " ĄąŁ€„Š§š©Ș«Ź­źŻ°±ČłŽ”¶·žčș»ŒœŸżÀÁÂĂÄĆÆÇÈÉÊËÌÍÎÏĐŃÒÓÔŐÖŚŰÙÚÛÜĘȚßàáâăäćæçèéêëìíîïđńòóôőöśűùúûüęțÿ"
      },
      "cp28606": "iso885916",
      "cp437": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm437": "cp437",
      "csibm437": "cp437",
      "cp737": {
        "type": "_sbcs",
        "chars": "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρσςτυφχψ░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀ωάέήϊίόύϋώΆΈΉΊΌΎΏ±≥≤ΪΫ÷≈°∙·√ⁿ²■ "
      },
      "ibm737": "cp737",
      "csibm737": "cp737",
      "cp775": {
        "type": "_sbcs",
        "chars": "ĆüéāäģåćłēŖŗīŹÄÅÉæÆōöĢ¢ŚśÖÜø£Ø×¤ĀĪóŻżź”¦©®¬½¼Ł«»░▒▓│┤ĄČĘĖ╣║╗╝ĮŠ┐└┴┬├─┼ŲŪ╚╔╩╦╠═╬Žąčęėįšųūž┘┌█▄▌▐▀ÓßŌŃõÕµńĶķĻļņĒŅ’­±“¾¶§÷„°∙·¹³²■ "
      },
      "ibm775": "cp775",
      "csibm775": "cp775",
      "cp850": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ "
      },
      "ibm850": "cp850",
      "csibm850": "cp850",
      "cp852": {
        "type": "_sbcs",
        "chars": "ÇüéâäůćçłëŐőîŹÄĆÉĹĺôöĽľŚśÖÜŤťŁ×čáíóúĄąŽžĘę¬źČş«»░▒▓│┤ÁÂĚŞ╣║╗╝Żż┐└┴┬├─┼Ăă╚╔╩╦╠═╬¤đĐĎËďŇÍÎě┘┌█▄ŢŮ▀ÓßÔŃńňŠšŔÚŕŰýÝţ´­˝˛ˇ˘§÷¸°¨˙űŘř■ "
      },
      "ibm852": "cp852",
      "csibm852": "cp852",
      "cp855": {
        "type": "_sbcs",
        "chars": "ђЂѓЃёЁєЄѕЅіІїЇјЈљЉњЊћЋќЌўЎџЏюЮъЪаАбБцЦдДеЕфФгГ«»░▒▓│┤хХиИ╣║╗╝йЙ┐└┴┬├─┼кК╚╔╩╦╠═╬¤лЛмМнНоОп┘┌█▄Пя▀ЯрРсСтТуУжЖвВьЬ№­ыЫзЗшШэЭщЩчЧ§■ "
      },
      "ibm855": "cp855",
      "csibm855": "cp855",
      "cp856": {
        "type": "_sbcs",
        "chars": "אבגדהוזחטיךכלםמןנסעףפץצקרשת�£�×����������®¬½¼�«»░▒▓│┤���©╣║╗╝¢¥┐└┴┬├─┼��╚╔╩╦╠═╬¤���������┘┌█▄¦�▀������µ�������¯´­±‗¾¶§÷¸°¨·¹³²■ "
      },
      "ibm856": "cp856",
      "csibm856": "cp856",
      "cp857": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèïîıÄÅÉæÆôöòûùİÖÜø£ØŞşáíóúñÑĞğ¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ºªÊËÈ�ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµ�×ÚÛÙìÿ¯´­±�¾¶§÷¸°¨·¹³²■ "
      },
      "ibm857": "cp857",
      "csibm857": "cp857",
      "cp858": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈ€ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ "
      },
      "ibm858": "cp858",
      "csibm858": "cp858",
      "cp860": {
        "type": "_sbcs",
        "chars": "ÇüéâãàÁçêÊèÍÔìÃÂÉÀÈôõòÚùÌÕÜ¢£Ù₧ÓáíóúñÑªº¿Ò¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm860": "cp860",
      "csibm860": "cp860",
      "cp861": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèÐðÞÄÅÉæÆôöþûÝýÖÜø£Ø₧ƒáíóúÁÍÓÚ¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm861": "cp861",
      "csibm861": "cp861",
      "cp862": {
        "type": "_sbcs",
        "chars": "אבגדהוזחטיךכלםמןנסעףפץצקרשת¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm862": "cp862",
      "csibm862": "cp862",
      "cp863": {
        "type": "_sbcs",
        "chars": "ÇüéâÂà¶çêëèïî‗À§ÉÈÊôËÏûù¤ÔÜ¢£ÙÛƒ¦´óú¨¸³¯Î⌐¬½¼¾«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm863": "cp863",
      "csibm863": "cp863",
      "cp864": {
        "type": "_sbcs",
        "chars": "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !\"#$٪&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~°·∙√▒─│┼┤┬├┴┐┌└┘β∞φ±½¼≈«»ﻷﻸ��ﻻﻼ� ­ﺂ£¤ﺄ��ﺎﺏﺕﺙ،ﺝﺡﺥ٠١٢٣٤٥٦٧٨٩ﻑ؛ﺱﺵﺹ؟¢ﺀﺁﺃﺅﻊﺋﺍﺑﺓﺗﺛﺟﺣﺧﺩﺫﺭﺯﺳﺷﺻﺿﻁﻅﻋﻏ¦¬÷×ﻉـﻓﻗﻛﻟﻣﻧﻫﻭﻯﻳﺽﻌﻎﻍﻡﹽّﻥﻩﻬﻰﻲﻐﻕﻵﻶﻝﻙﻱ■�"
      },
      "ibm864": "cp864",
      "csibm864": "cp864",
      "cp865": {
        "type": "_sbcs",
        "chars": "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø₧ƒáíóúñÑªº¿⌐¬½¼¡«¤░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ "
      },
      "ibm865": "cp865",
      "csibm865": "cp865",
      "cp866": {
        "type": "_sbcs",
        "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ "
      },
      "ibm866": "cp866",
      "csibm866": "cp866",
      "cp869": {
        "type": "_sbcs",
        "chars": "������Ά�·¬¦‘’Έ―ΉΊΪΌ��ΎΫ©Ώ²³ά£έήίϊΐόύΑΒΓΔΕΖΗ½ΘΙ«»░▒▓│┤ΚΛΜΝ╣║╗╝ΞΟ┐└┴┬├─┼ΠΡ╚╔╩╦╠═╬ΣΤΥΦΧΨΩαβγ┘┌█▄δε▀ζηθικλμνξοπρσςτ΄­±υφχ§ψ΅°¨ωϋΰώ■ "
      },
      "ibm869": "cp869",
      "csibm869": "cp869",
      "cp922": {
        "type": "_sbcs",
        "chars": " ¡¢£¤¥¦§¨©ª«¬­®‾°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŠÑÒÓÔÕÖ×ØÙÚÛÜÝŽßàáâãäåæçèéêëìíîïšñòóôõö÷øùúûüýžÿ"
      },
      "ibm922": "cp922",
      "csibm922": "cp922",
      "cp1046": {
        "type": "_sbcs",
        "chars": "ﺈ×÷ﹱ■│─┐┌└┘ﹹﹻﹽﹿﹷﺊﻰﻳﻲﻎﻏﻐﻶﻸﻺﻼ ¤ﺋﺑﺗﺛﺟﺣ،­ﺧﺳ٠١٢٣٤٥٦٧٨٩ﺷ؛ﺻﺿﻊ؟ﻋءآأؤإئابةتثجحخدذرزسشصضطﻇعغﻌﺂﺄﺎﻓـفقكلمنهوىيًٌٍَُِّْﻗﻛﻟﻵﻷﻹﻻﻣﻧﻬﻩ�"
      },
      "ibm1046": "cp1046",
      "csibm1046": "cp1046",
      "cp1124": {
        "type": "_sbcs",
        "chars": " ЁЂҐЄЅІЇЈЉЊЋЌ­ЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђґєѕіїјљњћќ§ўџ"
      },
      "ibm1124": "cp1124",
      "csibm1124": "cp1124",
      "cp1125": {
        "type": "_sbcs",
        "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёҐґЄєІіЇї·√№¤■ "
      },
      "ibm1125": "cp1125",
      "csibm1125": "cp1125",
      "cp1129": {
        "type": "_sbcs",
        "chars": " ¡¢£¤¥¦§œ©ª«¬­®¯°±²³Ÿµ¶·Œ¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
      },
      "ibm1129": "cp1129",
      "csibm1129": "cp1129",
      "cp1133": {
        "type": "_sbcs",
        "chars": " ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮ���ຯະາຳິີຶືຸູຼັົຽ���ເແໂໃໄ່້໊໋໌ໍໆ�ໜໝ₭����������������໐໑໒໓໔໕໖໗໘໙��¢¬¦�"
      },
      "ibm1133": "cp1133",
      "csibm1133": "cp1133",
      "cp1161": {
        "type": "_sbcs",
        "chars": "��������������������������������่กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู้๊๋€฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛¢¬¦ "
      },
      "ibm1161": "cp1161",
      "csibm1161": "cp1161",
      "cp1162": {
        "type": "_sbcs",
        "chars": "€…‘’“”•–— กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
      },
      "ibm1162": "cp1162",
      "csibm1162": "cp1162",
      "cp1163": {
        "type": "_sbcs",
        "chars": " ¡¢£€¥¦§œ©ª«¬­®¯°±²³Ÿµ¶·Œ¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ"
      },
      "ibm1163": "cp1163",
      "csibm1163": "cp1163",
      "maccroatian": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®Š™´¨≠ŽØ∞±≤≥∆µ∂∑∏š∫ªºΩžø¿¡¬√ƒ≈Ć«Č… ÀÃÕŒœĐ—“”‘’÷◊�©⁄¤‹›Æ»–·‚„‰ÂćÁčÈÍÎÏÌÓÔđÒÚÛÙıˆ˜¯πË˚¸Êæˇ"
      },
      "maccyrillic": {
        "type": "_sbcs",
        "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°¢£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµ∂ЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю¤"
      },
      "macgreek": {
        "type": "_sbcs",
        "chars": "Ä¹²É³ÖÜ΅àâä΄¨çéèêë£™îï•½‰ôö¦­ùûü†ΓΔΘΛΞΠß®©ΣΪ§≠°·Α±≤≥¥ΒΕΖΗΙΚΜΦΫΨΩάΝ¬ΟΡ≈Τ«»… ΥΧΆΈœ–―“”‘’÷ΉΊΌΎέήίόΏύαβψδεφγηιξκλμνοπώρστθωςχυζϊϋΐΰ�"
      },
      "maciceland": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûüÝ°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤ÐðÞþý·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
      },
      "macroman": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
      },
      "macromania": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ĂŞ∞±≤≥¥µ∂∑∏π∫ªºΩăş¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›Ţţ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
      },
      "macthai": {
        "type": "_sbcs",
        "chars": "«»…“”�•‘’� กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู﻿​–—฿เแโใไๅๆ็่้๊๋์ํ™๏๐๑๒๓๔๕๖๗๘๙®©����"
      },
      "macturkish": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸĞğİıŞş‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙ�ˆ˜¯˘˙˚¸˝˛ˇ"
      },
      "macukraine": {
        "type": "_sbcs",
        "chars": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»… ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю¤"
      },
      "koi8r": {
        "type": "_sbcs",
        "chars": "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ё╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡Ё╢╣╤╥╦╧╨╩╪╫╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
      },
      "koi8u": {
        "type": "_sbcs",
        "chars": "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ёє╔ії╗╘╙╚╛ґ╝╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪Ґ╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
      },
      "koi8ru": {
        "type": "_sbcs",
        "chars": "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥ ⌡°²·÷═║╒ёє╔ії╗╘╙╚╛ґў╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪ҐЎ©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
      },
      "koi8t": {
        "type": "_sbcs",
        "chars": "қғ‚Ғ„…†‡�‰ҳ‹ҲҷҶ�Қ‘’“”•–—�™�›�����ӯӮё¤ӣ¦§���«¬­®�°±²Ё�Ӣ¶·�№�»���©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ"
      },
      "armscii8": {
        "type": "_sbcs",
        "chars": " �և։)(»«—.՝,-֊…՜՛՞ԱաԲբԳգԴդԵեԶզԷէԸըԹթԺժԻիԼլԽխԾծԿկՀհՁձՂղՃճՄմՅյՆնՇշՈոՉչՊպՋջՌռՍսՎվՏտՐրՑցՒւՓփՔքՕօՖֆ՚�"
      },
      "rk1048": {
        "type": "_sbcs",
        "chars": "ЂЃ‚ѓ„…†‡€‰Љ‹ЊҚҺЏђ‘’“”•–—�™љ›њқһџ ҰұӘ¤Ө¦§Ё©Ғ«¬­®Ү°±Ііөµ¶·ё№ғ»әҢңүАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
      },
      "tcvn": {
        "type": "_sbcs",
        "chars": "\u0000ÚỤ\u0003ỪỬỮ\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010ỨỰỲỶỸÝỴ\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ÀẢÃÁẠẶẬÈẺẼÉẸỆÌỈĨÍỊÒỎÕÓỌỘỜỞỠỚỢÙỦŨ ĂÂÊÔƠƯĐăâêôơưđẶ̀̀̉̃́àảãáạẲằẳẵắẴẮẦẨẪẤỀặầẩẫấậèỂẻẽéẹềểễếệìỉỄẾỒĩíịòỔỏõóọồổỗốộờởỡớợùỖủũúụừửữứựỳỷỹýỵỐ"
      },
      "georgianacademy": {
        "type": "_sbcs",
        "chars": "‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰჱჲჳჴჵჶçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
      },
      "georgianps": {
        "type": "_sbcs",
        "chars": "‚ƒ„…†‡ˆ‰Š‹Œ‘’“”•–—˜™š›œŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿აბგდევზჱთიკლმნჲოპჟრსტჳუფქღყშჩცძწჭხჴჯჰჵæçèéêëìíîïðñòóôõö÷øùúûüýþÿ"
      },
      "pt154": {
        "type": "_sbcs",
        "chars": "ҖҒӮғ„…ҶҮҲүҠӢҢҚҺҸҗ‘’“”•–—ҳҷҡӣңқһҹ ЎўЈӨҘҰ§Ё©Ә«¬ӯ®Ҝ°ұІіҙө¶·ё№ә»јҪҫҝАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя"
      },
      "viscii": {
        "type": "_sbcs",
        "chars": "\u0000\u0001Ẳ\u0003\u0004ẴẪ\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013Ỷ\u0015\u0016\u0017\u0018Ỹ\u001a\u001b\u001c\u001dỴ\u001f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~ẠẮẰẶẤẦẨẬẼẸẾỀỂỄỆỐỒỔỖỘỢỚỜỞỊỎỌỈỦŨỤỲÕắằặấầẩậẽẹếềểễệốồổỗỠƠộờởịỰỨỪỬơớƯÀÁÂÃẢĂẳẵÈÉÊẺÌÍĨỳĐứÒÓÔạỷừửÙÚỹỵÝỡưàáâãảăữẫèéêẻìíĩỉđựòóôõỏọụùúũủýợỮ"
      },
      "iso646cn": {
        "type": "_sbcs",
        "chars": "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !\"#¥%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}‾��������������������������������������������������������������������������������������������������������������������������������"
      },
      "iso646jp": {
        "type": "_sbcs",
        "chars": "\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[¥]^_`abcdefghijklmnopqrstuvwxyz{|}‾��������������������������������������������������������������������������������������������������������������������������������"
      },
      "hproman8": {
        "type": "_sbcs",
        "chars": " ÀÂÈÊËÎÏ´ˋˆ¨˜ÙÛ₤¯Ýý°ÇçÑñ¡¿¤£¥§ƒ¢âêôûáéóúàèòùäëöüÅîØÆåíøæÄìÖÜÉïßÔÁÃãÐðÍÌÓÒÕõŠšÚŸÿÞþ·µ¶¾—¼½ªº«■»±�"
      },
      "macintosh": {
        "type": "_sbcs",
        "chars": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»… ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄¤‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔ�ÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ"
      },
      "ascii": {
        "type": "_sbcs",
        "chars": "��������������������������������������������������������������������������������������������������������������������������������"
      },
      "tis620": {
        "type": "_sbcs",
        "chars": "���������������������������������กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู����฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛����"
      }
    };

    var Buffer$2 = safer_1.Buffer;

    // Multibyte codec. In this scheme, a character is represented by 1 or more bytes.
    // Our codec supports UTF-16 surrogates, extensions for GB18030 and unicode sequences.
    // To save memory and loading time, we read table files only when requested.

    var _dbcs = DBCSCodec;

    var UNASSIGNED = -1,
        GB18030_CODE = -2,
        SEQ_START  = -10,
        NODE_START = -1000,
        UNASSIGNED_NODE = new Array(0x100),
        DEF_CHAR = -1;

    for (var i = 0; i < 0x100; i++)
        UNASSIGNED_NODE[i] = UNASSIGNED;


    // Class DBCSCodec reads and initializes mapping tables.
    function DBCSCodec(codecOptions, iconv) {
        this.encodingName = codecOptions.encodingName;
        if (!codecOptions)
            throw new Error("DBCS codec is called without the data.")
        if (!codecOptions.table)
            throw new Error("Encoding '" + this.encodingName + "' has no data.");

        // Load tables.
        var mappingTable = codecOptions.table();


        // Decode tables: MBCS -> Unicode.

        // decodeTables is a trie, encoded as an array of arrays of integers. Internal arrays are trie nodes and all have len = 256.
        // Trie root is decodeTables[0].
        // Values: >=  0 -> unicode character code. can be > 0xFFFF
        //         == UNASSIGNED -> unknown/unassigned sequence.
        //         == GB18030_CODE -> this is the end of a GB18030 4-byte sequence.
        //         <= NODE_START -> index of the next node in our trie to process next byte.
        //         <= SEQ_START  -> index of the start of a character code sequence, in decodeTableSeq.
        this.decodeTables = [];
        this.decodeTables[0] = UNASSIGNED_NODE.slice(0); // Create root node.

        // Sometimes a MBCS char corresponds to a sequence of unicode chars. We store them as arrays of integers here. 
        this.decodeTableSeq = [];

        // Actual mapping tables consist of chunks. Use them to fill up decode tables.
        for (var i = 0; i < mappingTable.length; i++)
            this._addDecodeChunk(mappingTable[i]);

        // Load & create GB18030 tables when needed.
        if (typeof codecOptions.gb18030 === 'function') {
            this.gb18030 = codecOptions.gb18030(); // Load GB18030 ranges.

            // Add GB18030 common decode nodes.
            var commonThirdByteNodeIdx = this.decodeTables.length;
            this.decodeTables.push(UNASSIGNED_NODE.slice(0));

            var commonFourthByteNodeIdx = this.decodeTables.length;
            this.decodeTables.push(UNASSIGNED_NODE.slice(0));

            // Fill out the tree
            var firstByteNode = this.decodeTables[0];
            for (var i = 0x81; i <= 0xFE; i++) {
                var secondByteNode = this.decodeTables[NODE_START - firstByteNode[i]];
                for (var j = 0x30; j <= 0x39; j++) {
                    if (secondByteNode[j] === UNASSIGNED) {
                        secondByteNode[j] = NODE_START - commonThirdByteNodeIdx;
                    } else if (secondByteNode[j] > NODE_START) {
                        throw new Error("gb18030 decode tables conflict at byte 2");
                    }

                    var thirdByteNode = this.decodeTables[NODE_START - secondByteNode[j]];
                    for (var k = 0x81; k <= 0xFE; k++) {
                        if (thirdByteNode[k] === UNASSIGNED) {
                            thirdByteNode[k] = NODE_START - commonFourthByteNodeIdx;
                        } else if (thirdByteNode[k] === NODE_START - commonFourthByteNodeIdx) {
                            continue;
                        } else if (thirdByteNode[k] > NODE_START) {
                            throw new Error("gb18030 decode tables conflict at byte 3");
                        }

                        var fourthByteNode = this.decodeTables[NODE_START - thirdByteNode[k]];
                        for (var l = 0x30; l <= 0x39; l++) {
                            if (fourthByteNode[l] === UNASSIGNED)
                                fourthByteNode[l] = GB18030_CODE;
                        }
                    }
                }
            }
        }

        this.defaultCharUnicode = iconv.defaultCharUnicode;

        
        // Encode tables: Unicode -> DBCS.

        // `encodeTable` is array mapping from unicode char to encoded char. All its values are integers for performance.
        // Because it can be sparse, it is represented as array of buckets by 256 chars each. Bucket can be null.
        // Values: >=  0 -> it is a normal char. Write the value (if <=256 then 1 byte, if <=65536 then 2 bytes, etc.).
        //         == UNASSIGNED -> no conversion found. Output a default char.
        //         <= SEQ_START  -> it's an index in encodeTableSeq, see below. The character starts a sequence.
        this.encodeTable = [];
        
        // `encodeTableSeq` is used when a sequence of unicode characters is encoded as a single code. We use a tree of
        // objects where keys correspond to characters in sequence and leafs are the encoded dbcs values. A special DEF_CHAR key
        // means end of sequence (needed when one sequence is a strict subsequence of another).
        // Objects are kept separately from encodeTable to increase performance.
        this.encodeTableSeq = [];

        // Some chars can be decoded, but need not be encoded.
        var skipEncodeChars = {};
        if (codecOptions.encodeSkipVals)
            for (var i = 0; i < codecOptions.encodeSkipVals.length; i++) {
                var val = codecOptions.encodeSkipVals[i];
                if (typeof val === 'number')
                    skipEncodeChars[val] = true;
                else
                    for (var j = val.from; j <= val.to; j++)
                        skipEncodeChars[j] = true;
            }
            
        // Use decode trie to recursively fill out encode tables.
        this._fillEncodeTable(0, 0, skipEncodeChars);

        // Add more encoding pairs when needed.
        if (codecOptions.encodeAdd) {
            for (var uChar in codecOptions.encodeAdd)
                if (Object.prototype.hasOwnProperty.call(codecOptions.encodeAdd, uChar))
                    this._setEncodeChar(uChar.charCodeAt(0), codecOptions.encodeAdd[uChar]);
        }

        this.defCharSB  = this.encodeTable[0][iconv.defaultCharSingleByte.charCodeAt(0)];
        if (this.defCharSB === UNASSIGNED) this.defCharSB = this.encodeTable[0]['?'];
        if (this.defCharSB === UNASSIGNED) this.defCharSB = "?".charCodeAt(0);
    }

    DBCSCodec.prototype.encoder = DBCSEncoder;
    DBCSCodec.prototype.decoder = DBCSDecoder;

    // Decoder helpers
    DBCSCodec.prototype._getDecodeTrieNode = function(addr) {
        var bytes = [];
        for (; addr > 0; addr >>>= 8)
            bytes.push(addr & 0xFF);
        if (bytes.length == 0)
            bytes.push(0);

        var node = this.decodeTables[0];
        for (var i = bytes.length-1; i > 0; i--) { // Traverse nodes deeper into the trie.
            var val = node[bytes[i]];

            if (val == UNASSIGNED) { // Create new node.
                node[bytes[i]] = NODE_START - this.decodeTables.length;
                this.decodeTables.push(node = UNASSIGNED_NODE.slice(0));
            }
            else if (val <= NODE_START) { // Existing node.
                node = this.decodeTables[NODE_START - val];
            }
            else
                throw new Error("Overwrite byte in " + this.encodingName + ", addr: " + addr.toString(16));
        }
        return node;
    };


    DBCSCodec.prototype._addDecodeChunk = function(chunk) {
        // First element of chunk is the hex mbcs code where we start.
        var curAddr = parseInt(chunk[0], 16);

        // Choose the decoding node where we'll write our chars.
        var writeTable = this._getDecodeTrieNode(curAddr);
        curAddr = curAddr & 0xFF;

        // Write all other elements of the chunk to the table.
        for (var k = 1; k < chunk.length; k++) {
            var part = chunk[k];
            if (typeof part === "string") { // String, write as-is.
                for (var l = 0; l < part.length;) {
                    var code = part.charCodeAt(l++);
                    if (0xD800 <= code && code < 0xDC00) { // Decode surrogate
                        var codeTrail = part.charCodeAt(l++);
                        if (0xDC00 <= codeTrail && codeTrail < 0xE000)
                            writeTable[curAddr++] = 0x10000 + (code - 0xD800) * 0x400 + (codeTrail - 0xDC00);
                        else
                            throw new Error("Incorrect surrogate pair in "  + this.encodingName + " at chunk " + chunk[0]);
                    }
                    else if (0x0FF0 < code && code <= 0x0FFF) { // Character sequence (our own encoding used)
                        var len = 0xFFF - code + 2;
                        var seq = [];
                        for (var m = 0; m < len; m++)
                            seq.push(part.charCodeAt(l++)); // Simple variation: don't support surrogates or subsequences in seq.

                        writeTable[curAddr++] = SEQ_START - this.decodeTableSeq.length;
                        this.decodeTableSeq.push(seq);
                    }
                    else
                        writeTable[curAddr++] = code; // Basic char
                }
            } 
            else if (typeof part === "number") { // Integer, meaning increasing sequence starting with prev character.
                var charCode = writeTable[curAddr - 1] + 1;
                for (var l = 0; l < part; l++)
                    writeTable[curAddr++] = charCode++;
            }
            else
                throw new Error("Incorrect type '" + typeof part + "' given in "  + this.encodingName + " at chunk " + chunk[0]);
        }
        if (curAddr > 0xFF)
            throw new Error("Incorrect chunk in "  + this.encodingName + " at addr " + chunk[0] + ": too long" + curAddr);
    };

    // Encoder helpers
    DBCSCodec.prototype._getEncodeBucket = function(uCode) {
        var high = uCode >> 8; // This could be > 0xFF because of astral characters.
        if (this.encodeTable[high] === undefined)
            this.encodeTable[high] = UNASSIGNED_NODE.slice(0); // Create bucket on demand.
        return this.encodeTable[high];
    };

    DBCSCodec.prototype._setEncodeChar = function(uCode, dbcsCode) {
        var bucket = this._getEncodeBucket(uCode);
        var low = uCode & 0xFF;
        if (bucket[low] <= SEQ_START)
            this.encodeTableSeq[SEQ_START-bucket[low]][DEF_CHAR] = dbcsCode; // There's already a sequence, set a single-char subsequence of it.
        else if (bucket[low] == UNASSIGNED)
            bucket[low] = dbcsCode;
    };

    DBCSCodec.prototype._setEncodeSequence = function(seq, dbcsCode) {
        
        // Get the root of character tree according to first character of the sequence.
        var uCode = seq[0];
        var bucket = this._getEncodeBucket(uCode);
        var low = uCode & 0xFF;

        var node;
        if (bucket[low] <= SEQ_START) {
            // There's already a sequence with  - use it.
            node = this.encodeTableSeq[SEQ_START-bucket[low]];
        }
        else {
            // There was no sequence object - allocate a new one.
            node = {};
            if (bucket[low] !== UNASSIGNED) node[DEF_CHAR] = bucket[low]; // If a char was set before - make it a single-char subsequence.
            bucket[low] = SEQ_START - this.encodeTableSeq.length;
            this.encodeTableSeq.push(node);
        }

        // Traverse the character tree, allocating new nodes as needed.
        for (var j = 1; j < seq.length-1; j++) {
            var oldVal = node[uCode];
            if (typeof oldVal === 'object')
                node = oldVal;
            else {
                node = node[uCode] = {};
                if (oldVal !== undefined)
                    node[DEF_CHAR] = oldVal;
            }
        }

        // Set the leaf to given dbcsCode.
        uCode = seq[seq.length-1];
        node[uCode] = dbcsCode;
    };

    DBCSCodec.prototype._fillEncodeTable = function(nodeIdx, prefix, skipEncodeChars) {
        var node = this.decodeTables[nodeIdx];
        var hasValues = false;
        var subNodeEmpty = {};
        for (var i = 0; i < 0x100; i++) {
            var uCode = node[i];
            var mbCode = prefix + i;
            if (skipEncodeChars[mbCode])
                continue;

            if (uCode >= 0) {
                this._setEncodeChar(uCode, mbCode);
                hasValues = true;
            } else if (uCode <= NODE_START) {
                var subNodeIdx = NODE_START - uCode;
                if (!subNodeEmpty[subNodeIdx]) {  // Skip empty subtrees (they are too large in gb18030).
                    var newPrefix = (mbCode << 8) >>> 0;  // NOTE: '>>> 0' keeps 32-bit num positive.
                    if (this._fillEncodeTable(subNodeIdx, newPrefix, skipEncodeChars))
                        hasValues = true;
                    else
                        subNodeEmpty[subNodeIdx] = true;
                }
            } else if (uCode <= SEQ_START) {
                this._setEncodeSequence(this.decodeTableSeq[SEQ_START - uCode], mbCode);
                hasValues = true;
            }
        }
        return hasValues;
    };



    // == Encoder ==================================================================

    function DBCSEncoder(options, codec) {
        // Encoder state
        this.leadSurrogate = -1;
        this.seqObj = undefined;
        
        // Static data
        this.encodeTable = codec.encodeTable;
        this.encodeTableSeq = codec.encodeTableSeq;
        this.defaultCharSingleByte = codec.defCharSB;
        this.gb18030 = codec.gb18030;
    }

    DBCSEncoder.prototype.write = function(str) {
        var newBuf = Buffer$2.alloc(str.length * (this.gb18030 ? 4 : 3)),
            leadSurrogate = this.leadSurrogate,
            seqObj = this.seqObj, nextChar = -1,
            i = 0, j = 0;

        while (true) {
            // 0. Get next character.
            if (nextChar === -1) {
                if (i == str.length) break;
                var uCode = str.charCodeAt(i++);
            }
            else {
                var uCode = nextChar;
                nextChar = -1;    
            }

            // 1. Handle surrogates.
            if (0xD800 <= uCode && uCode < 0xE000) { // Char is one of surrogates.
                if (uCode < 0xDC00) { // We've got lead surrogate.
                    if (leadSurrogate === -1) {
                        leadSurrogate = uCode;
                        continue;
                    } else {
                        leadSurrogate = uCode;
                        // Double lead surrogate found.
                        uCode = UNASSIGNED;
                    }
                } else { // We've got trail surrogate.
                    if (leadSurrogate !== -1) {
                        uCode = 0x10000 + (leadSurrogate - 0xD800) * 0x400 + (uCode - 0xDC00);
                        leadSurrogate = -1;
                    } else {
                        // Incomplete surrogate pair - only trail surrogate found.
                        uCode = UNASSIGNED;
                    }
                    
                }
            }
            else if (leadSurrogate !== -1) {
                // Incomplete surrogate pair - only lead surrogate found.
                nextChar = uCode; uCode = UNASSIGNED; // Write an error, then current char.
                leadSurrogate = -1;
            }

            // 2. Convert uCode character.
            var dbcsCode = UNASSIGNED;
            if (seqObj !== undefined && uCode != UNASSIGNED) { // We are in the middle of the sequence
                var resCode = seqObj[uCode];
                if (typeof resCode === 'object') { // Sequence continues.
                    seqObj = resCode;
                    continue;

                } else if (typeof resCode == 'number') { // Sequence finished. Write it.
                    dbcsCode = resCode;

                } else if (resCode == undefined) { // Current character is not part of the sequence.

                    // Try default character for this sequence
                    resCode = seqObj[DEF_CHAR];
                    if (resCode !== undefined) {
                        dbcsCode = resCode; // Found. Write it.
                        nextChar = uCode; // Current character will be written too in the next iteration.

                    }
                }
                seqObj = undefined;
            }
            else if (uCode >= 0) {  // Regular character
                var subtable = this.encodeTable[uCode >> 8];
                if (subtable !== undefined)
                    dbcsCode = subtable[uCode & 0xFF];
                
                if (dbcsCode <= SEQ_START) { // Sequence start
                    seqObj = this.encodeTableSeq[SEQ_START-dbcsCode];
                    continue;
                }

                if (dbcsCode == UNASSIGNED && this.gb18030) {
                    // Use GB18030 algorithm to find character(s) to write.
                    var idx = findIdx(this.gb18030.uChars, uCode);
                    if (idx != -1) {
                        var dbcsCode = this.gb18030.gbChars[idx] + (uCode - this.gb18030.uChars[idx]);
                        newBuf[j++] = 0x81 + Math.floor(dbcsCode / 12600); dbcsCode = dbcsCode % 12600;
                        newBuf[j++] = 0x30 + Math.floor(dbcsCode / 1260); dbcsCode = dbcsCode % 1260;
                        newBuf[j++] = 0x81 + Math.floor(dbcsCode / 10); dbcsCode = dbcsCode % 10;
                        newBuf[j++] = 0x30 + dbcsCode;
                        continue;
                    }
                }
            }

            // 3. Write dbcsCode character.
            if (dbcsCode === UNASSIGNED)
                dbcsCode = this.defaultCharSingleByte;
            
            if (dbcsCode < 0x100) {
                newBuf[j++] = dbcsCode;
            }
            else if (dbcsCode < 0x10000) {
                newBuf[j++] = dbcsCode >> 8;   // high byte
                newBuf[j++] = dbcsCode & 0xFF; // low byte
            }
            else if (dbcsCode < 0x1000000) {
                newBuf[j++] = dbcsCode >> 16;
                newBuf[j++] = (dbcsCode >> 8) & 0xFF;
                newBuf[j++] = dbcsCode & 0xFF;
            } else {
                newBuf[j++] = dbcsCode >>> 24;
                newBuf[j++] = (dbcsCode >>> 16) & 0xFF;
                newBuf[j++] = (dbcsCode >>> 8) & 0xFF;
                newBuf[j++] = dbcsCode & 0xFF;
            }
        }

        this.seqObj = seqObj;
        this.leadSurrogate = leadSurrogate;
        return newBuf.slice(0, j);
    };

    DBCSEncoder.prototype.end = function() {
        if (this.leadSurrogate === -1 && this.seqObj === undefined)
            return; // All clean. Most often case.

        var newBuf = Buffer$2.alloc(10), j = 0;

        if (this.seqObj) { // We're in the sequence.
            var dbcsCode = this.seqObj[DEF_CHAR];
            if (dbcsCode !== undefined) { // Write beginning of the sequence.
                if (dbcsCode < 0x100) {
                    newBuf[j++] = dbcsCode;
                }
                else {
                    newBuf[j++] = dbcsCode >> 8;   // high byte
                    newBuf[j++] = dbcsCode & 0xFF; // low byte
                }
            }
            this.seqObj = undefined;
        }

        if (this.leadSurrogate !== -1) {
            // Incomplete surrogate pair - only lead surrogate found.
            newBuf[j++] = this.defaultCharSingleByte;
            this.leadSurrogate = -1;
        }
        
        return newBuf.slice(0, j);
    };

    // Export for testing
    DBCSEncoder.prototype.findIdx = findIdx;


    // == Decoder ==================================================================

    function DBCSDecoder(options, codec) {
        // Decoder state
        this.nodeIdx = 0;
        this.prevBytes = [];

        // Static data
        this.decodeTables = codec.decodeTables;
        this.decodeTableSeq = codec.decodeTableSeq;
        this.defaultCharUnicode = codec.defaultCharUnicode;
        this.gb18030 = codec.gb18030;
    }

    DBCSDecoder.prototype.write = function(buf) {
        var newBuf = Buffer$2.alloc(buf.length*2),
            nodeIdx = this.nodeIdx, 
            prevBytes = this.prevBytes, prevOffset = this.prevBytes.length,
            seqStart = -this.prevBytes.length, // idx of the start of current parsed sequence.
            uCode;

        for (var i = 0, j = 0; i < buf.length; i++) {
            var curByte = (i >= 0) ? buf[i] : prevBytes[i + prevOffset];

            // Lookup in current trie node.
            var uCode = this.decodeTables[nodeIdx][curByte];

            if (uCode >= 0) ;
            else if (uCode === UNASSIGNED) { // Unknown char.
                // TODO: Callback with seq.
                uCode = this.defaultCharUnicode.charCodeAt(0);
                i = seqStart; // Skip one byte ('i' will be incremented by the for loop) and try to parse again.
            }
            else if (uCode === GB18030_CODE) {
                if (i >= 3) {
                    var ptr = (buf[i-3]-0x81)*12600 + (buf[i-2]-0x30)*1260 + (buf[i-1]-0x81)*10 + (curByte-0x30);
                } else {
                    var ptr = (prevBytes[i-3+prevOffset]-0x81)*12600 + 
                              (((i-2 >= 0) ? buf[i-2] : prevBytes[i-2+prevOffset])-0x30)*1260 + 
                              (((i-1 >= 0) ? buf[i-1] : prevBytes[i-1+prevOffset])-0x81)*10 + 
                              (curByte-0x30);
                }
                var idx = findIdx(this.gb18030.gbChars, ptr);
                uCode = this.gb18030.uChars[idx] + ptr - this.gb18030.gbChars[idx];
            }
            else if (uCode <= NODE_START) { // Go to next trie node.
                nodeIdx = NODE_START - uCode;
                continue;
            }
            else if (uCode <= SEQ_START) { // Output a sequence of chars.
                var seq = this.decodeTableSeq[SEQ_START - uCode];
                for (var k = 0; k < seq.length - 1; k++) {
                    uCode = seq[k];
                    newBuf[j++] = uCode & 0xFF;
                    newBuf[j++] = uCode >> 8;
                }
                uCode = seq[seq.length-1];
            }
            else
                throw new Error("iconv-lite internal error: invalid decoding table value " + uCode + " at " + nodeIdx + "/" + curByte);

            // Write the character to buffer, handling higher planes using surrogate pair.
            if (uCode >= 0x10000) { 
                uCode -= 0x10000;
                var uCodeLead = 0xD800 | (uCode >> 10);
                newBuf[j++] = uCodeLead & 0xFF;
                newBuf[j++] = uCodeLead >> 8;

                uCode = 0xDC00 | (uCode & 0x3FF);
            }
            newBuf[j++] = uCode & 0xFF;
            newBuf[j++] = uCode >> 8;

            // Reset trie node.
            nodeIdx = 0; seqStart = i+1;
        }

        this.nodeIdx = nodeIdx;
        this.prevBytes = (seqStart >= 0)
            ? Array.prototype.slice.call(buf, seqStart)
            : prevBytes.slice(seqStart + prevOffset).concat(Array.prototype.slice.call(buf));

        return newBuf.slice(0, j).toString('ucs2');
    };

    DBCSDecoder.prototype.end = function() {
        var ret = '';

        // Try to parse all remaining chars.
        while (this.prevBytes.length > 0) {
            // Skip 1 character in the buffer.
            ret += this.defaultCharUnicode;
            var bytesArr = this.prevBytes.slice(1);

            // Parse remaining as usual.
            this.prevBytes = [];
            this.nodeIdx = 0;
            if (bytesArr.length > 0)
                ret += this.write(bytesArr);
        }

        this.prevBytes = [];
        this.nodeIdx = 0;
        return ret;
    };

    // Binary search for GB18030. Returns largest i such that table[i] <= val.
    function findIdx(table, val) {
        if (table[0] > val)
            return -1;

        var l = 0, r = table.length;
        while (l < r-1) { // always table[l] <= val < table[r]
            var mid = l + ((r-l+1) >> 1);
            if (table[mid] <= val)
                l = mid;
            else
                r = mid;
        }
        return l;
    }

    var dbcsCodec = {
    	_dbcs: _dbcs
    };

    var require$$0 = [
    	[
    		"0",
    		"\u0000",
    		128
    	],
    	[
    		"a1",
    		"｡",
    		62
    	],
    	[
    		"8140",
    		"　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",
    		9,
    		"＋－±×"
    	],
    	[
    		"8180",
    		"÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓"
    	],
    	[
    		"81b8",
    		"∈∋⊆⊇⊂⊃∪∩"
    	],
    	[
    		"81c8",
    		"∧∨￢⇒⇔∀∃"
    	],
    	[
    		"81da",
    		"∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"
    	],
    	[
    		"81f0",
    		"Å‰♯♭♪†‡¶"
    	],
    	[
    		"81fc",
    		"◯"
    	],
    	[
    		"824f",
    		"０",
    		9
    	],
    	[
    		"8260",
    		"Ａ",
    		25
    	],
    	[
    		"8281",
    		"ａ",
    		25
    	],
    	[
    		"829f",
    		"ぁ",
    		82
    	],
    	[
    		"8340",
    		"ァ",
    		62
    	],
    	[
    		"8380",
    		"ム",
    		22
    	],
    	[
    		"839f",
    		"Α",
    		16,
    		"Σ",
    		6
    	],
    	[
    		"83bf",
    		"α",
    		16,
    		"σ",
    		6
    	],
    	[
    		"8440",
    		"А",
    		5,
    		"ЁЖ",
    		25
    	],
    	[
    		"8470",
    		"а",
    		5,
    		"ёж",
    		7
    	],
    	[
    		"8480",
    		"о",
    		17
    	],
    	[
    		"849f",
    		"─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"
    	],
    	[
    		"8740",
    		"①",
    		19,
    		"Ⅰ",
    		9
    	],
    	[
    		"875f",
    		"㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"
    	],
    	[
    		"877e",
    		"㍻"
    	],
    	[
    		"8780",
    		"〝〟№㏍℡㊤",
    		4,
    		"㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"
    	],
    	[
    		"889f",
    		"亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"
    	],
    	[
    		"8940",
    		"院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円"
    	],
    	[
    		"8980",
    		"園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"
    	],
    	[
    		"8a40",
    		"魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫"
    	],
    	[
    		"8a80",
    		"橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"
    	],
    	[
    		"8b40",
    		"機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救"
    	],
    	[
    		"8b80",
    		"朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"
    	],
    	[
    		"8c40",
    		"掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨"
    	],
    	[
    		"8c80",
    		"劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"
    	],
    	[
    		"8d40",
    		"后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降"
    	],
    	[
    		"8d80",
    		"項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"
    	],
    	[
    		"8e40",
    		"察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止"
    	],
    	[
    		"8e80",
    		"死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"
    	],
    	[
    		"8f40",
    		"宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳"
    	],
    	[
    		"8f80",
    		"準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"
    	],
    	[
    		"9040",
    		"拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨"
    	],
    	[
    		"9080",
    		"逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"
    	],
    	[
    		"9140",
    		"繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻"
    	],
    	[
    		"9180",
    		"操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"
    	],
    	[
    		"9240",
    		"叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄"
    	],
    	[
    		"9280",
    		"逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"
    	],
    	[
    		"9340",
    		"邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬"
    	],
    	[
    		"9380",
    		"凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"
    	],
    	[
    		"9440",
    		"如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅"
    	],
    	[
    		"9480",
    		"楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"
    	],
    	[
    		"9540",
    		"鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷"
    	],
    	[
    		"9580",
    		"斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"
    	],
    	[
    		"9640",
    		"法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆"
    	],
    	[
    		"9680",
    		"摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"
    	],
    	[
    		"9740",
    		"諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲"
    	],
    	[
    		"9780",
    		"沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"
    	],
    	[
    		"9840",
    		"蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"
    	],
    	[
    		"989f",
    		"弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"
    	],
    	[
    		"9940",
    		"僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭"
    	],
    	[
    		"9980",
    		"凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"
    	],
    	[
    		"9a40",
    		"咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸"
    	],
    	[
    		"9a80",
    		"噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"
    	],
    	[
    		"9b40",
    		"奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀"
    	],
    	[
    		"9b80",
    		"它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"
    	],
    	[
    		"9c40",
    		"廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠"
    	],
    	[
    		"9c80",
    		"怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"
    	],
    	[
    		"9d40",
    		"戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫"
    	],
    	[
    		"9d80",
    		"捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"
    	],
    	[
    		"9e40",
    		"曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎"
    	],
    	[
    		"9e80",
    		"梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"
    	],
    	[
    		"9f40",
    		"檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯"
    	],
    	[
    		"9f80",
    		"麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"
    	],
    	[
    		"e040",
    		"漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝"
    	],
    	[
    		"e080",
    		"烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"
    	],
    	[
    		"e140",
    		"瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿"
    	],
    	[
    		"e180",
    		"痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"
    	],
    	[
    		"e240",
    		"磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰"
    	],
    	[
    		"e280",
    		"窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"
    	],
    	[
    		"e340",
    		"紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷"
    	],
    	[
    		"e380",
    		"縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"
    	],
    	[
    		"e440",
    		"隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤"
    	],
    	[
    		"e480",
    		"艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"
    	],
    	[
    		"e540",
    		"蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬"
    	],
    	[
    		"e580",
    		"蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"
    	],
    	[
    		"e640",
    		"襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧"
    	],
    	[
    		"e680",
    		"諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"
    	],
    	[
    		"e740",
    		"蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜"
    	],
    	[
    		"e780",
    		"轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"
    	],
    	[
    		"e840",
    		"錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙"
    	],
    	[
    		"e880",
    		"閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"
    	],
    	[
    		"e940",
    		"顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃"
    	],
    	[
    		"e980",
    		"騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"
    	],
    	[
    		"ea40",
    		"鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯"
    	],
    	[
    		"ea80",
    		"黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙"
    	],
    	[
    		"ed40",
    		"纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏"
    	],
    	[
    		"ed80",
    		"塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"
    	],
    	[
    		"ee40",
    		"犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙"
    	],
    	[
    		"ee80",
    		"蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
    	],
    	[
    		"eeef",
    		"ⅰ",
    		9,
    		"￢￤＇＂"
    	],
    	[
    		"f040",
    		"",
    		62
    	],
    	[
    		"f080",
    		"",
    		124
    	],
    	[
    		"f140",
    		"",
    		62
    	],
    	[
    		"f180",
    		"",
    		124
    	],
    	[
    		"f240",
    		"",
    		62
    	],
    	[
    		"f280",
    		"",
    		124
    	],
    	[
    		"f340",
    		"",
    		62
    	],
    	[
    		"f380",
    		"",
    		124
    	],
    	[
    		"f440",
    		"",
    		62
    	],
    	[
    		"f480",
    		"",
    		124
    	],
    	[
    		"f540",
    		"",
    		62
    	],
    	[
    		"f580",
    		"",
    		124
    	],
    	[
    		"f640",
    		"",
    		62
    	],
    	[
    		"f680",
    		"",
    		124
    	],
    	[
    		"f740",
    		"",
    		62
    	],
    	[
    		"f780",
    		"",
    		124
    	],
    	[
    		"f840",
    		"",
    		62
    	],
    	[
    		"f880",
    		"",
    		124
    	],
    	[
    		"f940",
    		""
    	],
    	[
    		"fa40",
    		"ⅰ",
    		9,
    		"Ⅰ",
    		9,
    		"￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊"
    	],
    	[
    		"fa80",
    		"兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯"
    	],
    	[
    		"fb40",
    		"涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神"
    	],
    	[
    		"fb80",
    		"祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙"
    	],
    	[
    		"fc40",
    		"髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
    	]
    ];

    var require$$1 = [
    	[
    		"0",
    		"\u0000",
    		127
    	],
    	[
    		"8ea1",
    		"｡",
    		62
    	],
    	[
    		"a1a1",
    		"　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈",
    		9,
    		"＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇"
    	],
    	[
    		"a2a1",
    		"◆□■△▲▽▼※〒→←↑↓〓"
    	],
    	[
    		"a2ba",
    		"∈∋⊆⊇⊂⊃∪∩"
    	],
    	[
    		"a2ca",
    		"∧∨￢⇒⇔∀∃"
    	],
    	[
    		"a2dc",
    		"∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬"
    	],
    	[
    		"a2f2",
    		"Å‰♯♭♪†‡¶"
    	],
    	[
    		"a2fe",
    		"◯"
    	],
    	[
    		"a3b0",
    		"０",
    		9
    	],
    	[
    		"a3c1",
    		"Ａ",
    		25
    	],
    	[
    		"a3e1",
    		"ａ",
    		25
    	],
    	[
    		"a4a1",
    		"ぁ",
    		82
    	],
    	[
    		"a5a1",
    		"ァ",
    		85
    	],
    	[
    		"a6a1",
    		"Α",
    		16,
    		"Σ",
    		6
    	],
    	[
    		"a6c1",
    		"α",
    		16,
    		"σ",
    		6
    	],
    	[
    		"a7a1",
    		"А",
    		5,
    		"ЁЖ",
    		25
    	],
    	[
    		"a7d1",
    		"а",
    		5,
    		"ёж",
    		25
    	],
    	[
    		"a8a1",
    		"─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂"
    	],
    	[
    		"ada1",
    		"①",
    		19,
    		"Ⅰ",
    		9
    	],
    	[
    		"adc0",
    		"㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡"
    	],
    	[
    		"addf",
    		"㍻〝〟№㏍℡㊤",
    		4,
    		"㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪"
    	],
    	[
    		"b0a1",
    		"亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭"
    	],
    	[
    		"b1a1",
    		"院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応"
    	],
    	[
    		"b2a1",
    		"押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改"
    	],
    	[
    		"b3a1",
    		"魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱"
    	],
    	[
    		"b4a1",
    		"粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄"
    	],
    	[
    		"b5a1",
    		"機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京"
    	],
    	[
    		"b6a1",
    		"供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈"
    	],
    	[
    		"b7a1",
    		"掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲"
    	],
    	[
    		"b8a1",
    		"検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向"
    	],
    	[
    		"b9a1",
    		"后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込"
    	],
    	[
    		"baa1",
    		"此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷"
    	],
    	[
    		"bba1",
    		"察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時"
    	],
    	[
    		"bca1",
    		"次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周"
    	],
    	[
    		"bda1",
    		"宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償"
    	],
    	[
    		"bea1",
    		"勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾"
    	],
    	[
    		"bfa1",
    		"拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾"
    	],
    	[
    		"c0a1",
    		"澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線"
    	],
    	[
    		"c1a1",
    		"繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎"
    	],
    	[
    		"c2a1",
    		"臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只"
    	],
    	[
    		"c3a1",
    		"叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵"
    	],
    	[
    		"c4a1",
    		"帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓"
    	],
    	[
    		"c5a1",
    		"邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到"
    	],
    	[
    		"c6a1",
    		"董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入"
    	],
    	[
    		"c7a1",
    		"如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦"
    	],
    	[
    		"c8a1",
    		"函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美"
    	],
    	[
    		"c9a1",
    		"鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服"
    	],
    	[
    		"caa1",
    		"福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋"
    	],
    	[
    		"cba1",
    		"法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満"
    	],
    	[
    		"cca1",
    		"漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒"
    	],
    	[
    		"cda1",
    		"諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃"
    	],
    	[
    		"cea1",
    		"痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯"
    	],
    	[
    		"cfa1",
    		"蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕"
    	],
    	[
    		"d0a1",
    		"弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲"
    	],
    	[
    		"d1a1",
    		"僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨"
    	],
    	[
    		"d2a1",
    		"辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨"
    	],
    	[
    		"d3a1",
    		"咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉"
    	],
    	[
    		"d4a1",
    		"圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩"
    	],
    	[
    		"d5a1",
    		"奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓"
    	],
    	[
    		"d6a1",
    		"屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏"
    	],
    	[
    		"d7a1",
    		"廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚"
    	],
    	[
    		"d8a1",
    		"悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛"
    	],
    	[
    		"d9a1",
    		"戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼"
    	],
    	[
    		"daa1",
    		"據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼"
    	],
    	[
    		"dba1",
    		"曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍"
    	],
    	[
    		"dca1",
    		"棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣"
    	],
    	[
    		"dda1",
    		"檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾"
    	],
    	[
    		"dea1",
    		"沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌"
    	],
    	[
    		"dfa1",
    		"漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼"
    	],
    	[
    		"e0a1",
    		"燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱"
    	],
    	[
    		"e1a1",
    		"瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰"
    	],
    	[
    		"e2a1",
    		"癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬"
    	],
    	[
    		"e3a1",
    		"磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐"
    	],
    	[
    		"e4a1",
    		"筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆"
    	],
    	[
    		"e5a1",
    		"紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺"
    	],
    	[
    		"e6a1",
    		"罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋"
    	],
    	[
    		"e7a1",
    		"隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙"
    	],
    	[
    		"e8a1",
    		"茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈"
    	],
    	[
    		"e9a1",
    		"蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙"
    	],
    	[
    		"eaa1",
    		"蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞"
    	],
    	[
    		"eba1",
    		"襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫"
    	],
    	[
    		"eca1",
    		"譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊"
    	],
    	[
    		"eda1",
    		"蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸"
    	],
    	[
    		"eea1",
    		"遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮"
    	],
    	[
    		"efa1",
    		"錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞"
    	],
    	[
    		"f0a1",
    		"陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰"
    	],
    	[
    		"f1a1",
    		"顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷"
    	],
    	[
    		"f2a1",
    		"髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈"
    	],
    	[
    		"f3a1",
    		"鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠"
    	],
    	[
    		"f4a1",
    		"堯槇遙瑤凜熙"
    	],
    	[
    		"f9a1",
    		"纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德"
    	],
    	[
    		"faa1",
    		"忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱"
    	],
    	[
    		"fba1",
    		"犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚"
    	],
    	[
    		"fca1",
    		"釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑"
    	],
    	[
    		"fcf1",
    		"ⅰ",
    		9,
    		"￢￤＇＂"
    	],
    	[
    		"8fa2af",
    		"˘ˇ¸˙˝¯˛˚～΄΅"
    	],
    	[
    		"8fa2c2",
    		"¡¦¿"
    	],
    	[
    		"8fa2eb",
    		"ºª©®™¤№"
    	],
    	[
    		"8fa6e1",
    		"ΆΈΉΊΪ"
    	],
    	[
    		"8fa6e7",
    		"Ό"
    	],
    	[
    		"8fa6e9",
    		"ΎΫ"
    	],
    	[
    		"8fa6ec",
    		"Ώ"
    	],
    	[
    		"8fa6f1",
    		"άέήίϊΐόςύϋΰώ"
    	],
    	[
    		"8fa7c2",
    		"Ђ",
    		10,
    		"ЎЏ"
    	],
    	[
    		"8fa7f2",
    		"ђ",
    		10,
    		"ўџ"
    	],
    	[
    		"8fa9a1",
    		"ÆĐ"
    	],
    	[
    		"8fa9a4",
    		"Ħ"
    	],
    	[
    		"8fa9a6",
    		"Ĳ"
    	],
    	[
    		"8fa9a8",
    		"ŁĿ"
    	],
    	[
    		"8fa9ab",
    		"ŊØŒ"
    	],
    	[
    		"8fa9af",
    		"ŦÞ"
    	],
    	[
    		"8fa9c1",
    		"æđðħıĳĸłŀŉŋøœßŧþ"
    	],
    	[
    		"8faaa1",
    		"ÁÀÄÂĂǍĀĄÅÃĆĈČÇĊĎÉÈËÊĚĖĒĘ"
    	],
    	[
    		"8faaba",
    		"ĜĞĢĠĤÍÌÏÎǏİĪĮĨĴĶĹĽĻŃŇŅÑÓÒÖÔǑŐŌÕŔŘŖŚŜŠŞŤŢÚÙÜÛŬǓŰŪŲŮŨǗǛǙǕŴÝŸŶŹŽŻ"
    	],
    	[
    		"8faba1",
    		"áàäâăǎāąåãćĉčçċďéèëêěėēęǵĝğ"
    	],
    	[
    		"8fabbd",
    		"ġĥíìïîǐ"
    	],
    	[
    		"8fabc5",
    		"īįĩĵķĺľļńňņñóòöôǒőōõŕřŗśŝšşťţúùüûŭǔűūųůũǘǜǚǖŵýÿŷźžż"
    	],
    	[
    		"8fb0a1",
    		"丂丄丅丌丒丟丣两丨丫丮丯丰丵乀乁乄乇乑乚乜乣乨乩乴乵乹乿亍亖亗亝亯亹仃仐仚仛仠仡仢仨仯仱仳仵份仾仿伀伂伃伈伋伌伒伕伖众伙伮伱你伳伵伷伹伻伾佀佂佈佉佋佌佒佔佖佘佟佣佪佬佮佱佷佸佹佺佽佾侁侂侄"
    	],
    	[
    		"8fb1a1",
    		"侅侉侊侌侎侐侒侓侔侗侙侚侞侟侲侷侹侻侼侽侾俀俁俅俆俈俉俋俌俍俏俒俜俠俢俰俲俼俽俿倀倁倄倇倊倌倎倐倓倗倘倛倜倝倞倢倧倮倰倲倳倵偀偁偂偅偆偊偌偎偑偒偓偗偙偟偠偢偣偦偧偪偭偰偱倻傁傃傄傆傊傎傏傐"
    	],
    	[
    		"8fb2a1",
    		"傒傓傔傖傛傜傞",
    		4,
    		"傪傯傰傹傺傽僀僃僄僇僌僎僐僓僔僘僜僝僟僢僤僦僨僩僯僱僶僺僾儃儆儇儈儋儌儍儎僲儐儗儙儛儜儝儞儣儧儨儬儭儯儱儳儴儵儸儹兂兊兏兓兕兗兘兟兤兦兾冃冄冋冎冘冝冡冣冭冸冺冼冾冿凂"
    	],
    	[
    		"8fb3a1",
    		"凈减凑凒凓凕凘凞凢凥凮凲凳凴凷刁刂刅划刓刕刖刘刢刨刱刲刵刼剅剉剕剗剘剚剜剟剠剡剦剮剷剸剹劀劂劅劊劌劓劕劖劗劘劚劜劤劥劦劧劯劰劶劷劸劺劻劽勀勄勆勈勌勏勑勔勖勛勜勡勥勨勩勪勬勰勱勴勶勷匀匃匊匋"
    	],
    	[
    		"8fb4a1",
    		"匌匑匓匘匛匜匞匟匥匧匨匩匫匬匭匰匲匵匼匽匾卂卌卋卙卛卡卣卥卬卭卲卹卾厃厇厈厎厓厔厙厝厡厤厪厫厯厲厴厵厷厸厺厽叀叅叏叒叓叕叚叝叞叠另叧叵吂吓吚吡吧吨吪启吱吴吵呃呄呇呍呏呞呢呤呦呧呩呫呭呮呴呿"
    	],
    	[
    		"8fb5a1",
    		"咁咃咅咈咉咍咑咕咖咜咟咡咦咧咩咪咭咮咱咷咹咺咻咿哆哊响哎哠哪哬哯哶哼哾哿唀唁唅唈唉唌唍唎唕唪唫唲唵唶唻唼唽啁啇啉啊啍啐啑啘啚啛啞啠啡啤啦啿喁喂喆喈喎喏喑喒喓喔喗喣喤喭喲喿嗁嗃嗆嗉嗋嗌嗎嗑嗒"
    	],
    	[
    		"8fb6a1",
    		"嗓嗗嗘嗛嗞嗢嗩嗶嗿嘅嘈嘊嘍",
    		5,
    		"嘙嘬嘰嘳嘵嘷嘹嘻嘼嘽嘿噀噁噃噄噆噉噋噍噏噔噞噠噡噢噣噦噩噭噯噱噲噵嚄嚅嚈嚋嚌嚕嚙嚚嚝嚞嚟嚦嚧嚨嚩嚫嚬嚭嚱嚳嚷嚾囅囉囊囋囏囐囌囍囙囜囝囟囡囤",
    		4,
    		"囱囫园"
    	],
    	[
    		"8fb7a1",
    		"囶囷圁圂圇圊圌圑圕圚圛圝圠圢圣圤圥圩圪圬圮圯圳圴圽圾圿坅坆坌坍坒坢坥坧坨坫坭",
    		4,
    		"坳坴坵坷坹坺坻坼坾垁垃垌垔垗垙垚垜垝垞垟垡垕垧垨垩垬垸垽埇埈埌埏埕埝埞埤埦埧埩埭埰埵埶埸埽埾埿堃堄堈堉埡"
    	],
    	[
    		"8fb8a1",
    		"堌堍堛堞堟堠堦堧堭堲堹堿塉塌塍塏塐塕塟塡塤塧塨塸塼塿墀墁墇墈墉墊墌墍墏墐墔墖墝墠墡墢墦墩墱墲壄墼壂壈壍壎壐壒壔壖壚壝壡壢壩壳夅夆夋夌夒夓夔虁夝夡夣夤夨夯夰夳夵夶夿奃奆奒奓奙奛奝奞奟奡奣奫奭"
    	],
    	[
    		"8fb9a1",
    		"奯奲奵奶她奻奼妋妌妎妒妕妗妟妤妧妭妮妯妰妳妷妺妼姁姃姄姈姊姍姒姝姞姟姣姤姧姮姯姱姲姴姷娀娄娌娍娎娒娓娞娣娤娧娨娪娭娰婄婅婇婈婌婐婕婞婣婥婧婭婷婺婻婾媋媐媓媖媙媜媞媟媠媢媧媬媱媲媳媵媸媺媻媿"
    	],
    	[
    		"8fbaa1",
    		"嫄嫆嫈嫏嫚嫜嫠嫥嫪嫮嫵嫶嫽嬀嬁嬈嬗嬴嬙嬛嬝嬡嬥嬭嬸孁孋孌孒孖孞孨孮孯孼孽孾孿宁宄宆宊宎宐宑宓宔宖宨宩宬宭宯宱宲宷宺宼寀寁寍寏寖",
    		4,
    		"寠寯寱寴寽尌尗尞尟尣尦尩尫尬尮尰尲尵尶屙屚屜屢屣屧屨屩"
    	],
    	[
    		"8fbba1",
    		"屭屰屴屵屺屻屼屽岇岈岊岏岒岝岟岠岢岣岦岪岲岴岵岺峉峋峒峝峗峮峱峲峴崁崆崍崒崫崣崤崦崧崱崴崹崽崿嵂嵃嵆嵈嵕嵑嵙嵊嵟嵠嵡嵢嵤嵪嵭嵰嵹嵺嵾嵿嶁嶃嶈嶊嶒嶓嶔嶕嶙嶛嶟嶠嶧嶫嶰嶴嶸嶹巃巇巋巐巎巘巙巠巤"
    	],
    	[
    		"8fbca1",
    		"巩巸巹帀帇帍帒帔帕帘帟帠帮帨帲帵帾幋幐幉幑幖幘幛幜幞幨幪",
    		4,
    		"幰庀庋庎庢庤庥庨庪庬庱庳庽庾庿廆廌廋廎廑廒廔廕廜廞廥廫异弆弇弈弎弙弜弝弡弢弣弤弨弫弬弮弰弴弶弻弽弿彀彄彅彇彍彐彔彘彛彠彣彤彧"
    	],
    	[
    		"8fbda1",
    		"彯彲彴彵彸彺彽彾徉徍徏徖徜徝徢徧徫徤徬徯徰徱徸忄忇忈忉忋忐",
    		4,
    		"忞忡忢忨忩忪忬忭忮忯忲忳忶忺忼怇怊怍怓怔怗怘怚怟怤怭怳怵恀恇恈恉恌恑恔恖恗恝恡恧恱恾恿悂悆悈悊悎悑悓悕悘悝悞悢悤悥您悰悱悷"
    	],
    	[
    		"8fbea1",
    		"悻悾惂惄惈惉惊惋惎惏惔惕惙惛惝惞惢惥惲惵惸惼惽愂愇愊愌愐",
    		4,
    		"愖愗愙愜愞愢愪愫愰愱愵愶愷愹慁慅慆慉慞慠慬慲慸慻慼慿憀憁憃憄憋憍憒憓憗憘憜憝憟憠憥憨憪憭憸憹憼懀懁懂懎懏懕懜懝懞懟懡懢懧懩懥"
    	],
    	[
    		"8fbfa1",
    		"懬懭懯戁戃戄戇戓戕戜戠戢戣戧戩戫戹戽扂扃扄扆扌扐扑扒扔扖扚扜扤扭扯扳扺扽抍抎抏抐抦抨抳抶抷抺抾抿拄拎拕拖拚拪拲拴拼拽挃挄挊挋挍挐挓挖挘挩挪挭挵挶挹挼捁捂捃捄捆捊捋捎捒捓捔捘捛捥捦捬捭捱捴捵"
    	],
    	[
    		"8fc0a1",
    		"捸捼捽捿掂掄掇掊掐掔掕掙掚掞掤掦掭掮掯掽揁揅揈揎揑揓揔揕揜揠揥揪揬揲揳揵揸揹搉搊搐搒搔搘搞搠搢搤搥搩搪搯搰搵搽搿摋摏摑摒摓摔摚摛摜摝摟摠摡摣摭摳摴摻摽撅撇撏撐撑撘撙撛撝撟撡撣撦撨撬撳撽撾撿"
    	],
    	[
    		"8fc1a1",
    		"擄擉擊擋擌擎擐擑擕擗擤擥擩擪擭擰擵擷擻擿攁攄攈攉攊攏攓攔攖攙攛攞攟攢攦攩攮攱攺攼攽敃敇敉敐敒敔敟敠敧敫敺敽斁斅斊斒斕斘斝斠斣斦斮斲斳斴斿旂旈旉旎旐旔旖旘旟旰旲旴旵旹旾旿昀昄昈昉昍昑昒昕昖昝"
    	],
    	[
    		"8fc2a1",
    		"昞昡昢昣昤昦昩昪昫昬昮昰昱昳昹昷晀晅晆晊晌晑晎晗晘晙晛晜晠晡曻晪晫晬晾晳晵晿晷晸晹晻暀晼暋暌暍暐暒暙暚暛暜暟暠暤暭暱暲暵暻暿曀曂曃曈曌曎曏曔曛曟曨曫曬曮曺朅朇朎朓朙朜朠朢朳朾杅杇杈杌杔杕杝"
    	],
    	[
    		"8fc3a1",
    		"杦杬杮杴杶杻极构枎枏枑枓枖枘枙枛枰枱枲枵枻枼枽柹柀柂柃柅柈柉柒柗柙柜柡柦柰柲柶柷桒栔栙栝栟栨栧栬栭栯栰栱栳栻栿桄桅桊桌桕桗桘桛桫桮",
    		4,
    		"桵桹桺桻桼梂梄梆梈梖梘梚梜梡梣梥梩梪梮梲梻棅棈棌棏"
    	],
    	[
    		"8fc4a1",
    		"棐棑棓棖棙棜棝棥棨棪棫棬棭棰棱棵棶棻棼棽椆椉椊椐椑椓椖椗椱椳椵椸椻楂楅楉楎楗楛楣楤楥楦楨楩楬楰楱楲楺楻楿榀榍榒榖榘榡榥榦榨榫榭榯榷榸榺榼槅槈槑槖槗槢槥槮槯槱槳槵槾樀樁樃樏樑樕樚樝樠樤樨樰樲"
    	],
    	[
    		"8fc5a1",
    		"樴樷樻樾樿橅橆橉橊橎橐橑橒橕橖橛橤橧橪橱橳橾檁檃檆檇檉檋檑檛檝檞檟檥檫檯檰檱檴檽檾檿櫆櫉櫈櫌櫐櫔櫕櫖櫜櫝櫤櫧櫬櫰櫱櫲櫼櫽欂欃欆欇欉欏欐欑欗欛欞欤欨欫欬欯欵欶欻欿歆歊歍歒歖歘歝歠歧歫歮歰歵歽"
    	],
    	[
    		"8fc6a1",
    		"歾殂殅殗殛殟殠殢殣殨殩殬殭殮殰殸殹殽殾毃毄毉毌毖毚毡毣毦毧毮毱毷毹毿氂氄氅氉氍氎氐氒氙氟氦氧氨氬氮氳氵氶氺氻氿汊汋汍汏汒汔汙汛汜汫汭汯汴汶汸汹汻沅沆沇沉沔沕沗沘沜沟沰沲沴泂泆泍泏泐泑泒泔泖"
    	],
    	[
    		"8fc7a1",
    		"泚泜泠泧泩泫泬泮泲泴洄洇洊洎洏洑洓洚洦洧洨汧洮洯洱洹洼洿浗浞浟浡浥浧浯浰浼涂涇涑涒涔涖涗涘涪涬涴涷涹涽涿淄淈淊淎淏淖淛淝淟淠淢淥淩淯淰淴淶淼渀渄渞渢渧渲渶渹渻渼湄湅湈湉湋湏湑湒湓湔湗湜湝湞"
    	],
    	[
    		"8fc8a1",
    		"湢湣湨湳湻湽溍溓溙溠溧溭溮溱溳溻溿滀滁滃滇滈滊滍滎滏滫滭滮滹滻滽漄漈漊漌漍漖漘漚漛漦漩漪漯漰漳漶漻漼漭潏潑潒潓潗潙潚潝潞潡潢潨潬潽潾澃澇澈澋澌澍澐澒澓澔澖澚澟澠澥澦澧澨澮澯澰澵澶澼濅濇濈濊"
    	],
    	[
    		"8fc9a1",
    		"濚濞濨濩濰濵濹濼濽瀀瀅瀆瀇瀍瀗瀠瀣瀯瀴瀷瀹瀼灃灄灈灉灊灋灔灕灝灞灎灤灥灬灮灵灶灾炁炅炆炔",
    		4,
    		"炛炤炫炰炱炴炷烊烑烓烔烕烖烘烜烤烺焃",
    		4,
    		"焋焌焏焞焠焫焭焯焰焱焸煁煅煆煇煊煋煐煒煗煚煜煞煠"
    	],
    	[
    		"8fcaa1",
    		"煨煹熀熅熇熌熒熚熛熠熢熯熰熲熳熺熿燀燁燄燋燌燓燖燙燚燜燸燾爀爇爈爉爓爗爚爝爟爤爫爯爴爸爹牁牂牃牅牎牏牐牓牕牖牚牜牞牠牣牨牫牮牯牱牷牸牻牼牿犄犉犍犎犓犛犨犭犮犱犴犾狁狇狉狌狕狖狘狟狥狳狴狺狻"
    	],
    	[
    		"8fcba1",
    		"狾猂猄猅猇猋猍猒猓猘猙猞猢猤猧猨猬猱猲猵猺猻猽獃獍獐獒獖獘獝獞獟獠獦獧獩獫獬獮獯獱獷獹獼玀玁玃玅玆玎玐玓玕玗玘玜玞玟玠玢玥玦玪玫玭玵玷玹玼玽玿珅珆珉珋珌珏珒珓珖珙珝珡珣珦珧珩珴珵珷珹珺珻珽"
    	],
    	[
    		"8fcca1",
    		"珿琀琁琄琇琊琑琚琛琤琦琨",
    		9,
    		"琹瑀瑃瑄瑆瑇瑋瑍瑑瑒瑗瑝瑢瑦瑧瑨瑫瑭瑮瑱瑲璀璁璅璆璇璉璏璐璑璒璘璙璚璜璟璠璡璣璦璨璩璪璫璮璯璱璲璵璹璻璿瓈瓉瓌瓐瓓瓘瓚瓛瓞瓟瓤瓨瓪瓫瓯瓴瓺瓻瓼瓿甆"
    	],
    	[
    		"8fcda1",
    		"甒甖甗甠甡甤甧甩甪甯甶甹甽甾甿畀畃畇畈畎畐畒畗畞畟畡畯畱畹",
    		5,
    		"疁疅疐疒疓疕疙疜疢疤疴疺疿痀痁痄痆痌痎痏痗痜痟痠痡痤痧痬痮痯痱痹瘀瘂瘃瘄瘇瘈瘊瘌瘏瘒瘓瘕瘖瘙瘛瘜瘝瘞瘣瘥瘦瘩瘭瘲瘳瘵瘸瘹"
    	],
    	[
    		"8fcea1",
    		"瘺瘼癊癀癁癃癄癅癉癋癕癙癟癤癥癭癮癯癱癴皁皅皌皍皕皛皜皝皟皠皢",
    		6,
    		"皪皭皽盁盅盉盋盌盎盔盙盠盦盨盬盰盱盶盹盼眀眆眊眎眒眔眕眗眙眚眜眢眨眭眮眯眴眵眶眹眽眾睂睅睆睊睍睎睏睒睖睗睜睞睟睠睢"
    	],
    	[
    		"8fcfa1",
    		"睤睧睪睬睰睲睳睴睺睽瞀瞄瞌瞍瞔瞕瞖瞚瞟瞢瞧瞪瞮瞯瞱瞵瞾矃矉矑矒矕矙矞矟矠矤矦矪矬矰矱矴矸矻砅砆砉砍砎砑砝砡砢砣砭砮砰砵砷硃硄硇硈硌硎硒硜硞硠硡硣硤硨硪确硺硾碊碏碔碘碡碝碞碟碤碨碬碭碰碱碲碳"
    	],
    	[
    		"8fd0a1",
    		"碻碽碿磇磈磉磌磎磒磓磕磖磤磛磟磠磡磦磪磲磳礀磶磷磺磻磿礆礌礐礚礜礞礟礠礥礧礩礭礱礴礵礻礽礿祄祅祆祊祋祏祑祔祘祛祜祧祩祫祲祹祻祼祾禋禌禑禓禔禕禖禘禛禜禡禨禩禫禯禱禴禸离秂秄秇秈秊秏秔秖秚秝秞"
    	],
    	[
    		"8fd1a1",
    		"秠秢秥秪秫秭秱秸秼稂稃稇稉稊稌稑稕稛稞稡稧稫稭稯稰稴稵稸稹稺穄穅穇穈穌穕穖穙穜穝穟穠穥穧穪穭穵穸穾窀窂窅窆窊窋窐窑窔窞窠窣窬窳窵窹窻窼竆竉竌竎竑竛竨竩竫竬竱竴竻竽竾笇笔笟笣笧笩笪笫笭笮笯笰"
    	],
    	[
    		"8fd2a1",
    		"笱笴笽笿筀筁筇筎筕筠筤筦筩筪筭筯筲筳筷箄箉箎箐箑箖箛箞箠箥箬箯箰箲箵箶箺箻箼箽篂篅篈篊篔篖篗篙篚篛篨篪篲篴篵篸篹篺篼篾簁簂簃簄簆簉簋簌簎簏簙簛簠簥簦簨簬簱簳簴簶簹簺籆籊籕籑籒籓籙",
    		5
    	],
    	[
    		"8fd3a1",
    		"籡籣籧籩籭籮籰籲籹籼籽粆粇粏粔粞粠粦粰粶粷粺粻粼粿糄糇糈糉糍糏糓糔糕糗糙糚糝糦糩糫糵紃紇紈紉紏紑紒紓紖紝紞紣紦紪紭紱紼紽紾絀絁絇絈絍絑絓絗絙絚絜絝絥絧絪絰絸絺絻絿綁綂綃綅綆綈綋綌綍綑綖綗綝"
    	],
    	[
    		"8fd4a1",
    		"綞綦綧綪綳綶綷綹緂",
    		4,
    		"緌緍緎緗緙縀緢緥緦緪緫緭緱緵緶緹緺縈縐縑縕縗縜縝縠縧縨縬縭縯縳縶縿繄繅繇繎繐繒繘繟繡繢繥繫繮繯繳繸繾纁纆纇纊纍纑纕纘纚纝纞缼缻缽缾缿罃罄罇罏罒罓罛罜罝罡罣罤罥罦罭"
    	],
    	[
    		"8fd5a1",
    		"罱罽罾罿羀羋羍羏羐羑羖羗羜羡羢羦羪羭羴羼羿翀翃翈翎翏翛翟翣翥翨翬翮翯翲翺翽翾翿耇耈耊耍耎耏耑耓耔耖耝耞耟耠耤耦耬耮耰耴耵耷耹耺耼耾聀聄聠聤聦聭聱聵肁肈肎肜肞肦肧肫肸肹胈胍胏胒胔胕胗胘胠胭胮"
    	],
    	[
    		"8fd6a1",
    		"胰胲胳胶胹胺胾脃脋脖脗脘脜脞脠脤脧脬脰脵脺脼腅腇腊腌腒腗腠腡腧腨腩腭腯腷膁膐膄膅膆膋膎膖膘膛膞膢膮膲膴膻臋臃臅臊臎臏臕臗臛臝臞臡臤臫臬臰臱臲臵臶臸臹臽臿舀舃舏舓舔舙舚舝舡舢舨舲舴舺艃艄艅艆"
    	],
    	[
    		"8fd7a1",
    		"艋艎艏艑艖艜艠艣艧艭艴艻艽艿芀芁芃芄芇芉芊芎芑芔芖芘芚芛芠芡芣芤芧芨芩芪芮芰芲芴芷芺芼芾芿苆苐苕苚苠苢苤苨苪苭苯苶苷苽苾茀茁茇茈茊茋荔茛茝茞茟茡茢茬茭茮茰茳茷茺茼茽荂荃荄荇荍荎荑荕荖荗荰荸"
    	],
    	[
    		"8fd8a1",
    		"荽荿莀莂莄莆莍莒莔莕莘莙莛莜莝莦莧莩莬莾莿菀菇菉菏菐菑菔菝荓菨菪菶菸菹菼萁萆萊萏萑萕萙莭萯萹葅葇葈葊葍葏葑葒葖葘葙葚葜葠葤葥葧葪葰葳葴葶葸葼葽蒁蒅蒒蒓蒕蒞蒦蒨蒩蒪蒯蒱蒴蒺蒽蒾蓀蓂蓇蓈蓌蓏蓓"
    	],
    	[
    		"8fd9a1",
    		"蓜蓧蓪蓯蓰蓱蓲蓷蔲蓺蓻蓽蔂蔃蔇蔌蔎蔐蔜蔞蔢蔣蔤蔥蔧蔪蔫蔯蔳蔴蔶蔿蕆蕏",
    		4,
    		"蕖蕙蕜",
    		6,
    		"蕤蕫蕯蕹蕺蕻蕽蕿薁薅薆薉薋薌薏薓薘薝薟薠薢薥薧薴薶薷薸薼薽薾薿藂藇藊藋藎薭藘藚藟藠藦藨藭藳藶藼"
    	],
    	[
    		"8fdaa1",
    		"藿蘀蘄蘅蘍蘎蘐蘑蘒蘘蘙蘛蘞蘡蘧蘩蘶蘸蘺蘼蘽虀虂虆虒虓虖虗虘虙虝虠",
    		4,
    		"虩虬虯虵虶虷虺蚍蚑蚖蚘蚚蚜蚡蚦蚧蚨蚭蚱蚳蚴蚵蚷蚸蚹蚿蛀蛁蛃蛅蛑蛒蛕蛗蛚蛜蛠蛣蛥蛧蚈蛺蛼蛽蜄蜅蜇蜋蜎蜏蜐蜓蜔蜙蜞蜟蜡蜣"
    	],
    	[
    		"8fdba1",
    		"蜨蜮蜯蜱蜲蜹蜺蜼蜽蜾蝀蝃蝅蝍蝘蝝蝡蝤蝥蝯蝱蝲蝻螃",
    		6,
    		"螋螌螐螓螕螗螘螙螞螠螣螧螬螭螮螱螵螾螿蟁蟈蟉蟊蟎蟕蟖蟙蟚蟜蟟蟢蟣蟤蟪蟫蟭蟱蟳蟸蟺蟿蠁蠃蠆蠉蠊蠋蠐蠙蠒蠓蠔蠘蠚蠛蠜蠞蠟蠨蠭蠮蠰蠲蠵"
    	],
    	[
    		"8fdca1",
    		"蠺蠼衁衃衅衈衉衊衋衎衑衕衖衘衚衜衟衠衤衩衱衹衻袀袘袚袛袜袟袠袨袪袺袽袾裀裊",
    		4,
    		"裑裒裓裛裞裧裯裰裱裵裷褁褆褍褎褏褕褖褘褙褚褜褠褦褧褨褰褱褲褵褹褺褾襀襂襅襆襉襏襒襗襚襛襜襡襢襣襫襮襰襳襵襺"
    	],
    	[
    		"8fdda1",
    		"襻襼襽覉覍覐覔覕覛覜覟覠覥覰覴覵覶覷覼觔",
    		4,
    		"觥觩觫觭觱觳觶觹觽觿訄訅訇訏訑訒訔訕訞訠訢訤訦訫訬訯訵訷訽訾詀詃詅詇詉詍詎詓詖詗詘詜詝詡詥詧詵詶詷詹詺詻詾詿誀誃誆誋誏誐誒誖誗誙誟誧誩誮誯誳"
    	],
    	[
    		"8fdea1",
    		"誶誷誻誾諃諆諈諉諊諑諓諔諕諗諝諟諬諰諴諵諶諼諿謅謆謋謑謜謞謟謊謭謰謷謼譂",
    		4,
    		"譈譒譓譔譙譍譞譣譭譶譸譹譼譾讁讄讅讋讍讏讔讕讜讞讟谸谹谽谾豅豇豉豋豏豑豓豔豗豘豛豝豙豣豤豦豨豩豭豳豵豶豻豾貆"
    	],
    	[
    		"8fdfa1",
    		"貇貋貐貒貓貙貛貜貤貹貺賅賆賉賋賏賖賕賙賝賡賨賬賯賰賲賵賷賸賾賿贁贃贉贒贗贛赥赩赬赮赿趂趄趈趍趐趑趕趞趟趠趦趫趬趯趲趵趷趹趻跀跅跆跇跈跊跎跑跔跕跗跙跤跥跧跬跰趼跱跲跴跽踁踄踅踆踋踑踔踖踠踡踢"
    	],
    	[
    		"8fe0a1",
    		"踣踦踧踱踳踶踷踸踹踽蹀蹁蹋蹍蹎蹏蹔蹛蹜蹝蹞蹡蹢蹩蹬蹭蹯蹰蹱蹹蹺蹻躂躃躉躐躒躕躚躛躝躞躢躧躩躭躮躳躵躺躻軀軁軃軄軇軏軑軔軜軨軮軰軱軷軹軺軭輀輂輇輈輏輐輖輗輘輞輠輡輣輥輧輨輬輭輮輴輵輶輷輺轀轁"
    	],
    	[
    		"8fe1a1",
    		"轃轇轏轑",
    		4,
    		"轘轝轞轥辝辠辡辤辥辦辵辶辸达迀迁迆迊迋迍运迒迓迕迠迣迤迨迮迱迵迶迻迾适逄逈逌逘逛逨逩逯逪逬逭逳逴逷逿遃遄遌遛遝遢遦遧遬遰遴遹邅邈邋邌邎邐邕邗邘邙邛邠邡邢邥邰邲邳邴邶邽郌邾郃"
    	],
    	[
    		"8fe2a1",
    		"郄郅郇郈郕郗郘郙郜郝郟郥郒郶郫郯郰郴郾郿鄀鄄鄅鄆鄈鄍鄐鄔鄖鄗鄘鄚鄜鄞鄠鄥鄢鄣鄧鄩鄮鄯鄱鄴鄶鄷鄹鄺鄼鄽酃酇酈酏酓酗酙酚酛酡酤酧酭酴酹酺酻醁醃醅醆醊醎醑醓醔醕醘醞醡醦醨醬醭醮醰醱醲醳醶醻醼醽醿"
    	],
    	[
    		"8fe3a1",
    		"釂釃釅釓釔釗釙釚釞釤釥釩釪釬",
    		5,
    		"釷釹釻釽鈀鈁鈄鈅鈆鈇鈉鈊鈌鈐鈒鈓鈖鈘鈜鈝鈣鈤鈥鈦鈨鈮鈯鈰鈳鈵鈶鈸鈹鈺鈼鈾鉀鉂鉃鉆鉇鉊鉍鉎鉏鉑鉘鉙鉜鉝鉠鉡鉥鉧鉨鉩鉮鉯鉰鉵",
    		4,
    		"鉻鉼鉽鉿銈銉銊銍銎銒銗"
    	],
    	[
    		"8fe4a1",
    		"銙銟銠銤銥銧銨銫銯銲銶銸銺銻銼銽銿",
    		4,
    		"鋅鋆鋇鋈鋋鋌鋍鋎鋐鋓鋕鋗鋘鋙鋜鋝鋟鋠鋡鋣鋥鋧鋨鋬鋮鋰鋹鋻鋿錀錂錈錍錑錔錕錜錝錞錟錡錤錥錧錩錪錳錴錶錷鍇鍈鍉鍐鍑鍒鍕鍗鍘鍚鍞鍤鍥鍧鍩鍪鍭鍯鍰鍱鍳鍴鍶"
    	],
    	[
    		"8fe5a1",
    		"鍺鍽鍿鎀鎁鎂鎈鎊鎋鎍鎏鎒鎕鎘鎛鎞鎡鎣鎤鎦鎨鎫鎴鎵鎶鎺鎩鏁鏄鏅鏆鏇鏉",
    		4,
    		"鏓鏙鏜鏞鏟鏢鏦鏧鏹鏷鏸鏺鏻鏽鐁鐂鐄鐈鐉鐍鐎鐏鐕鐖鐗鐟鐮鐯鐱鐲鐳鐴鐻鐿鐽鑃鑅鑈鑊鑌鑕鑙鑜鑟鑡鑣鑨鑫鑭鑮鑯鑱鑲钄钃镸镹"
    	],
    	[
    		"8fe6a1",
    		"镾閄閈閌閍閎閝閞閟閡閦閩閫閬閴閶閺閽閿闆闈闉闋闐闑闒闓闙闚闝闞闟闠闤闦阝阞阢阤阥阦阬阱阳阷阸阹阺阼阽陁陒陔陖陗陘陡陮陴陻陼陾陿隁隂隃隄隉隑隖隚隝隟隤隥隦隩隮隯隳隺雊雒嶲雘雚雝雞雟雩雯雱雺霂"
    	],
    	[
    		"8fe7a1",
    		"霃霅霉霚霛霝霡霢霣霨霱霳靁靃靊靎靏靕靗靘靚靛靣靧靪靮靳靶靷靸靻靽靿鞀鞉鞕鞖鞗鞙鞚鞞鞟鞢鞬鞮鞱鞲鞵鞶鞸鞹鞺鞼鞾鞿韁韄韅韇韉韊韌韍韎韐韑韔韗韘韙韝韞韠韛韡韤韯韱韴韷韸韺頇頊頙頍頎頔頖頜頞頠頣頦"
    	],
    	[
    		"8fe8a1",
    		"頫頮頯頰頲頳頵頥頾顄顇顊顑顒顓顖顗顙顚顢顣顥顦顪顬颫颭颮颰颴颷颸颺颻颿飂飅飈飌飡飣飥飦飧飪飳飶餂餇餈餑餕餖餗餚餛餜餟餢餦餧餫餱",
    		4,
    		"餹餺餻餼饀饁饆饇饈饍饎饔饘饙饛饜饞饟饠馛馝馟馦馰馱馲馵"
    	],
    	[
    		"8fe9a1",
    		"馹馺馽馿駃駉駓駔駙駚駜駞駧駪駫駬駰駴駵駹駽駾騂騃騄騋騌騐騑騖騞騠騢騣騤騧騭騮騳騵騶騸驇驁驄驊驋驌驎驑驔驖驝骪骬骮骯骲骴骵骶骹骻骾骿髁髃髆髈髎髐髒髕髖髗髛髜髠髤髥髧髩髬髲髳髵髹髺髽髿",
    		4
    	],
    	[
    		"8feaa1",
    		"鬄鬅鬈鬉鬋鬌鬍鬎鬐鬒鬖鬙鬛鬜鬠鬦鬫鬭鬳鬴鬵鬷鬹鬺鬽魈魋魌魕魖魗魛魞魡魣魥魦魨魪",
    		4,
    		"魳魵魷魸魹魿鮀鮄鮅鮆鮇鮉鮊鮋鮍鮏鮐鮔鮚鮝鮞鮦鮧鮩鮬鮰鮱鮲鮷鮸鮻鮼鮾鮿鯁鯇鯈鯎鯐鯗鯘鯝鯟鯥鯧鯪鯫鯯鯳鯷鯸"
    	],
    	[
    		"8feba1",
    		"鯹鯺鯽鯿鰀鰂鰋鰏鰑鰖鰘鰙鰚鰜鰞鰢鰣鰦",
    		4,
    		"鰱鰵鰶鰷鰽鱁鱃鱄鱅鱉鱊鱎鱏鱐鱓鱔鱖鱘鱛鱝鱞鱟鱣鱩鱪鱜鱫鱨鱮鱰鱲鱵鱷鱻鳦鳲鳷鳹鴋鴂鴑鴗鴘鴜鴝鴞鴯鴰鴲鴳鴴鴺鴼鵅鴽鵂鵃鵇鵊鵓鵔鵟鵣鵢鵥鵩鵪鵫鵰鵶鵷鵻"
    	],
    	[
    		"8feca1",
    		"鵼鵾鶃鶄鶆鶊鶍鶎鶒鶓鶕鶖鶗鶘鶡鶪鶬鶮鶱鶵鶹鶼鶿鷃鷇鷉鷊鷔鷕鷖鷗鷚鷞鷟鷠鷥鷧鷩鷫鷮鷰鷳鷴鷾鸊鸂鸇鸎鸐鸑鸒鸕鸖鸙鸜鸝鹺鹻鹼麀麂麃麄麅麇麎麏麖麘麛麞麤麨麬麮麯麰麳麴麵黆黈黋黕黟黤黧黬黭黮黰黱黲黵"
    	],
    	[
    		"8feda1",
    		"黸黿鼂鼃鼉鼏鼐鼑鼒鼔鼖鼗鼙鼚鼛鼟鼢鼦鼪鼫鼯鼱鼲鼴鼷鼹鼺鼼鼽鼿齁齃",
    		4,
    		"齓齕齖齗齘齚齝齞齨齩齭",
    		4,
    		"齳齵齺齽龏龐龑龒龔龖龗龞龡龢龣龥"
    	]
    ];

    var require$$2 = [
    	[
    		"0",
    		"\u0000",
    		127,
    		"€"
    	],
    	[
    		"8140",
    		"丂丄丅丆丏丒丗丟丠両丣並丩丮丯丱丳丵丷丼乀乁乂乄乆乊乑乕乗乚乛乢乣乤乥乧乨乪",
    		5,
    		"乲乴",
    		9,
    		"乿",
    		6,
    		"亇亊"
    	],
    	[
    		"8180",
    		"亐亖亗亙亜亝亞亣亪亯亰亱亴亶亷亸亹亼亽亾仈仌仏仐仒仚仛仜仠仢仦仧仩仭仮仯仱仴仸仹仺仼仾伀伂",
    		6,
    		"伋伌伒",
    		4,
    		"伜伝伡伣伨伩伬伭伮伱伳伵伷伹伻伾",
    		4,
    		"佄佅佇",
    		5,
    		"佒佔佖佡佢佦佨佪佫佭佮佱佲併佷佸佹佺佽侀侁侂侅來侇侊侌侎侐侒侓侕侖侘侙侚侜侞侟価侢"
    	],
    	[
    		"8240",
    		"侤侫侭侰",
    		4,
    		"侶",
    		8,
    		"俀俁係俆俇俈俉俋俌俍俒",
    		4,
    		"俙俛俠俢俤俥俧俫俬俰俲俴俵俶俷俹俻俼俽俿",
    		11
    	],
    	[
    		"8280",
    		"個倎倐們倓倕倖倗倛倝倞倠倢倣値倧倫倯",
    		10,
    		"倻倽倿偀偁偂偄偅偆偉偊偋偍偐",
    		4,
    		"偖偗偘偙偛偝",
    		7,
    		"偦",
    		5,
    		"偭",
    		8,
    		"偸偹偺偼偽傁傂傃傄傆傇傉傊傋傌傎",
    		20,
    		"傤傦傪傫傭",
    		4,
    		"傳",
    		6,
    		"傼"
    	],
    	[
    		"8340",
    		"傽",
    		17,
    		"僐",
    		5,
    		"僗僘僙僛",
    		10,
    		"僨僩僪僫僯僰僱僲僴僶",
    		4,
    		"僼",
    		9,
    		"儈"
    	],
    	[
    		"8380",
    		"儉儊儌",
    		5,
    		"儓",
    		13,
    		"儢",
    		28,
    		"兂兇兊兌兎兏児兒兓兗兘兙兛兝",
    		4,
    		"兣兤兦內兩兪兯兲兺兾兿冃冄円冇冊冋冎冏冐冑冓冔冘冚冝冞冟冡冣冦",
    		4,
    		"冭冮冴冸冹冺冾冿凁凂凃凅凈凊凍凎凐凒",
    		5
    	],
    	[
    		"8440",
    		"凘凙凚凜凞凟凢凣凥",
    		5,
    		"凬凮凱凲凴凷凾刄刅刉刋刌刏刐刓刔刕刜刞刟刡刢刣別刦刧刪刬刯刱刲刴刵刼刾剄",
    		5,
    		"剋剎剏剒剓剕剗剘"
    	],
    	[
    		"8480",
    		"剙剚剛剝剟剠剢剣剤剦剨剫剬剭剮剰剱剳",
    		9,
    		"剾劀劃",
    		4,
    		"劉",
    		6,
    		"劑劒劔",
    		6,
    		"劜劤劥劦劧劮劯劰労",
    		9,
    		"勀勁勂勄勅勆勈勊勌勍勎勏勑勓勔動勗務",
    		5,
    		"勠勡勢勣勥",
    		10,
    		"勱",
    		7,
    		"勻勼勽匁匂匃匄匇匉匊匋匌匎"
    	],
    	[
    		"8540",
    		"匑匒匓匔匘匛匜匞匟匢匤匥匧匨匩匫匬匭匯",
    		9,
    		"匼匽區卂卄卆卋卌卍卐協単卙卛卝卥卨卪卬卭卲卶卹卻卼卽卾厀厁厃厇厈厊厎厏"
    	],
    	[
    		"8580",
    		"厐",
    		4,
    		"厖厗厙厛厜厞厠厡厤厧厪厫厬厭厯",
    		6,
    		"厷厸厹厺厼厽厾叀參",
    		4,
    		"収叏叐叒叓叕叚叜叝叞叡叢叧叴叺叾叿吀吂吅吇吋吔吘吙吚吜吢吤吥吪吰吳吶吷吺吽吿呁呂呄呅呇呉呌呍呎呏呑呚呝",
    		4,
    		"呣呥呧呩",
    		7,
    		"呴呹呺呾呿咁咃咅咇咈咉咊咍咑咓咗咘咜咞咟咠咡"
    	],
    	[
    		"8640",
    		"咢咥咮咰咲咵咶咷咹咺咼咾哃哅哊哋哖哘哛哠",
    		4,
    		"哫哬哯哰哱哴",
    		5,
    		"哻哾唀唂唃唄唅唈唊",
    		4,
    		"唒唓唕",
    		5,
    		"唜唝唞唟唡唥唦"
    	],
    	[
    		"8680",
    		"唨唩唫唭唲唴唵唶唸唹唺唻唽啀啂啅啇啈啋",
    		4,
    		"啑啒啓啔啗",
    		4,
    		"啝啞啟啠啢啣啨啩啫啯",
    		5,
    		"啹啺啽啿喅喆喌喍喎喐喒喓喕喖喗喚喛喞喠",
    		6,
    		"喨",
    		8,
    		"喲喴営喸喺喼喿",
    		4,
    		"嗆嗇嗈嗊嗋嗎嗏嗐嗕嗗",
    		4,
    		"嗞嗠嗢嗧嗩嗭嗮嗰嗱嗴嗶嗸",
    		4,
    		"嗿嘂嘃嘄嘅"
    	],
    	[
    		"8740",
    		"嘆嘇嘊嘋嘍嘐",
    		7,
    		"嘙嘚嘜嘝嘠嘡嘢嘥嘦嘨嘩嘪嘫嘮嘯嘰嘳嘵嘷嘸嘺嘼嘽嘾噀",
    		11,
    		"噏",
    		4,
    		"噕噖噚噛噝",
    		4
    	],
    	[
    		"8780",
    		"噣噥噦噧噭噮噯噰噲噳噴噵噷噸噹噺噽",
    		7,
    		"嚇",
    		6,
    		"嚐嚑嚒嚔",
    		14,
    		"嚤",
    		10,
    		"嚰",
    		6,
    		"嚸嚹嚺嚻嚽",
    		12,
    		"囋",
    		8,
    		"囕囖囘囙囜団囥",
    		5,
    		"囬囮囯囲図囶囷囸囻囼圀圁圂圅圇國",
    		6
    	],
    	[
    		"8840",
    		"園",
    		9,
    		"圝圞圠圡圢圤圥圦圧圫圱圲圴",
    		4,
    		"圼圽圿坁坃坄坅坆坈坉坋坒",
    		4,
    		"坘坙坢坣坥坧坬坮坰坱坲坴坵坸坹坺坽坾坿垀"
    	],
    	[
    		"8880",
    		"垁垇垈垉垊垍",
    		4,
    		"垔",
    		6,
    		"垜垝垞垟垥垨垪垬垯垰垱垳垵垶垷垹",
    		8,
    		"埄",
    		6,
    		"埌埍埐埑埓埖埗埛埜埞埡埢埣埥",
    		7,
    		"埮埰埱埲埳埵埶執埻埼埾埿堁堃堄堅堈堉堊堌堎堏堐堒堓堔堖堗堘堚堛堜堝堟堢堣堥",
    		4,
    		"堫",
    		4,
    		"報堲堳場堶",
    		7
    	],
    	[
    		"8940",
    		"堾",
    		5,
    		"塅",
    		6,
    		"塎塏塐塒塓塕塖塗塙",
    		4,
    		"塟",
    		5,
    		"塦",
    		4,
    		"塭",
    		16,
    		"塿墂墄墆墇墈墊墋墌"
    	],
    	[
    		"8980",
    		"墍",
    		4,
    		"墔",
    		4,
    		"墛墜墝墠",
    		7,
    		"墪",
    		17,
    		"墽墾墿壀壂壃壄壆",
    		10,
    		"壒壓壔壖",
    		13,
    		"壥",
    		5,
    		"壭壯壱売壴壵壷壸壺",
    		7,
    		"夃夅夆夈",
    		4,
    		"夎夐夑夒夓夗夘夛夝夞夠夡夢夣夦夨夬夰夲夳夵夶夻"
    	],
    	[
    		"8a40",
    		"夽夾夿奀奃奅奆奊奌奍奐奒奓奙奛",
    		4,
    		"奡奣奤奦",
    		12,
    		"奵奷奺奻奼奾奿妀妅妉妋妌妎妏妐妑妔妕妘妚妛妜妝妟妠妡妢妦"
    	],
    	[
    		"8a80",
    		"妧妬妭妰妱妳",
    		5,
    		"妺妼妽妿",
    		6,
    		"姇姈姉姌姍姎姏姕姖姙姛姞",
    		4,
    		"姤姦姧姩姪姫姭",
    		11,
    		"姺姼姽姾娀娂娊娋娍娎娏娐娒娔娕娖娗娙娚娛娝娞娡娢娤娦娧娨娪",
    		6,
    		"娳娵娷",
    		4,
    		"娽娾娿婁",
    		4,
    		"婇婈婋",
    		9,
    		"婖婗婘婙婛",
    		5
    	],
    	[
    		"8b40",
    		"婡婣婤婥婦婨婩婫",
    		8,
    		"婸婹婻婼婽婾媀",
    		17,
    		"媓",
    		6,
    		"媜",
    		13,
    		"媫媬"
    	],
    	[
    		"8b80",
    		"媭",
    		4,
    		"媴媶媷媹",
    		4,
    		"媿嫀嫃",
    		5,
    		"嫊嫋嫍",
    		4,
    		"嫓嫕嫗嫙嫚嫛嫝嫞嫟嫢嫤嫥嫧嫨嫪嫬",
    		4,
    		"嫲",
    		22,
    		"嬊",
    		11,
    		"嬘",
    		25,
    		"嬳嬵嬶嬸",
    		7,
    		"孁",
    		6
    	],
    	[
    		"8c40",
    		"孈",
    		7,
    		"孒孖孞孠孡孧孨孫孭孮孯孲孴孶孷學孹孻孼孾孿宂宆宊宍宎宐宑宒宔宖実宧宨宩宬宭宮宯宱宲宷宺宻宼寀寁寃寈寉寊寋寍寎寏"
    	],
    	[
    		"8c80",
    		"寑寔",
    		8,
    		"寠寢寣實寧審",
    		4,
    		"寯寱",
    		6,
    		"寽対尀専尃尅將專尋尌對導尐尒尓尗尙尛尞尟尠尡尣尦尨尩尪尫尭尮尯尰尲尳尵尶尷屃屄屆屇屌屍屒屓屔屖屗屘屚屛屜屝屟屢層屧",
    		6,
    		"屰屲",
    		6,
    		"屻屼屽屾岀岃",
    		4,
    		"岉岊岋岎岏岒岓岕岝",
    		4,
    		"岤",
    		4
    	],
    	[
    		"8d40",
    		"岪岮岯岰岲岴岶岹岺岻岼岾峀峂峃峅",
    		5,
    		"峌",
    		5,
    		"峓",
    		5,
    		"峚",
    		6,
    		"峢峣峧峩峫峬峮峯峱",
    		9,
    		"峼",
    		4
    	],
    	[
    		"8d80",
    		"崁崄崅崈",
    		5,
    		"崏",
    		4,
    		"崕崗崘崙崚崜崝崟",
    		4,
    		"崥崨崪崫崬崯",
    		4,
    		"崵",
    		7,
    		"崿",
    		7,
    		"嵈嵉嵍",
    		10,
    		"嵙嵚嵜嵞",
    		10,
    		"嵪嵭嵮嵰嵱嵲嵳嵵",
    		12,
    		"嶃",
    		21,
    		"嶚嶛嶜嶞嶟嶠"
    	],
    	[
    		"8e40",
    		"嶡",
    		21,
    		"嶸",
    		12,
    		"巆",
    		6,
    		"巎",
    		12,
    		"巜巟巠巣巤巪巬巭"
    	],
    	[
    		"8e80",
    		"巰巵巶巸",
    		4,
    		"巿帀帄帇帉帊帋帍帎帒帓帗帞",
    		7,
    		"帨",
    		4,
    		"帯帰帲",
    		4,
    		"帹帺帾帿幀幁幃幆",
    		5,
    		"幍",
    		6,
    		"幖",
    		4,
    		"幜幝幟幠幣",
    		14,
    		"幵幷幹幾庁庂広庅庈庉庌庍庎庒庘庛庝庡庢庣庤庨",
    		4,
    		"庮",
    		4,
    		"庴庺庻庼庽庿",
    		6
    	],
    	[
    		"8f40",
    		"廆廇廈廋",
    		5,
    		"廔廕廗廘廙廚廜",
    		11,
    		"廩廫",
    		8,
    		"廵廸廹廻廼廽弅弆弇弉弌弍弎弐弒弔弖弙弚弜弝弞弡弢弣弤"
    	],
    	[
    		"8f80",
    		"弨弫弬弮弰弲",
    		6,
    		"弻弽弾弿彁",
    		14,
    		"彑彔彙彚彛彜彞彟彠彣彥彧彨彫彮彯彲彴彵彶彸彺彽彾彿徃徆徍徎徏徑従徔徖徚徛徝從徟徠徢",
    		5,
    		"復徫徬徯",
    		5,
    		"徶徸徹徺徻徾",
    		4,
    		"忇忈忊忋忎忓忔忕忚忛応忞忟忢忣忥忦忨忩忬忯忰忲忳忴忶忷忹忺忼怇"
    	],
    	[
    		"9040",
    		"怈怉怋怌怐怑怓怗怘怚怞怟怢怣怤怬怭怮怰",
    		4,
    		"怶",
    		4,
    		"怽怾恀恄",
    		6,
    		"恌恎恏恑恓恔恖恗恘恛恜恞恟恠恡恥恦恮恱恲恴恵恷恾悀"
    	],
    	[
    		"9080",
    		"悁悂悅悆悇悈悊悋悎悏悐悑悓悕悗悘悙悜悞悡悢悤悥悧悩悪悮悰悳悵悶悷悹悺悽",
    		7,
    		"惇惈惉惌",
    		4,
    		"惒惓惔惖惗惙惛惞惡",
    		4,
    		"惪惱惲惵惷惸惻",
    		4,
    		"愂愃愄愅愇愊愋愌愐",
    		4,
    		"愖愗愘愙愛愜愝愞愡愢愥愨愩愪愬",
    		18,
    		"慀",
    		6
    	],
    	[
    		"9140",
    		"慇慉態慍慏慐慒慓慔慖",
    		6,
    		"慞慟慠慡慣慤慥慦慩",
    		6,
    		"慱慲慳慴慶慸",
    		18,
    		"憌憍憏",
    		4,
    		"憕"
    	],
    	[
    		"9180",
    		"憖",
    		6,
    		"憞",
    		8,
    		"憪憫憭",
    		9,
    		"憸",
    		5,
    		"憿懀懁懃",
    		4,
    		"應懌",
    		4,
    		"懓懕",
    		16,
    		"懧",
    		13,
    		"懶",
    		8,
    		"戀",
    		5,
    		"戇戉戓戔戙戜戝戞戠戣戦戧戨戩戫戭戯戰戱戲戵戶戸",
    		4,
    		"扂扄扅扆扊"
    	],
    	[
    		"9240",
    		"扏扐払扖扗扙扚扜",
    		6,
    		"扤扥扨扱扲扴扵扷扸扺扻扽抁抂抃抅抆抇抈抋",
    		5,
    		"抔抙抜抝択抣抦抧抩抪抭抮抯抰抲抳抴抶抷抸抺抾拀拁"
    	],
    	[
    		"9280",
    		"拃拋拏拑拕拝拞拠拡拤拪拫拰拲拵拸拹拺拻挀挃挄挅挆挊挋挌挍挏挐挒挓挔挕挗挘挙挜挦挧挩挬挭挮挰挱挳",
    		5,
    		"挻挼挾挿捀捁捄捇捈捊捑捒捓捔捖",
    		7,
    		"捠捤捥捦捨捪捫捬捯捰捲捳捴捵捸捹捼捽捾捿掁掃掄掅掆掋掍掑掓掔掕掗掙",
    		6,
    		"採掤掦掫掯掱掲掵掶掹掻掽掿揀"
    	],
    	[
    		"9340",
    		"揁揂揃揅揇揈揊揋揌揑揓揔揕揗",
    		6,
    		"揟揢揤",
    		4,
    		"揫揬揮揯揰揱揳揵揷揹揺揻揼揾搃搄搆",
    		4,
    		"損搎搑搒搕",
    		5,
    		"搝搟搢搣搤"
    	],
    	[
    		"9380",
    		"搥搧搨搩搫搮",
    		5,
    		"搵",
    		4,
    		"搻搼搾摀摂摃摉摋",
    		6,
    		"摓摕摖摗摙",
    		4,
    		"摟",
    		7,
    		"摨摪摫摬摮",
    		9,
    		"摻",
    		6,
    		"撃撆撈",
    		8,
    		"撓撔撗撘撚撛撜撝撟",
    		4,
    		"撥撦撧撨撪撫撯撱撲撳撴撶撹撻撽撾撿擁擃擄擆",
    		6,
    		"擏擑擓擔擕擖擙據"
    	],
    	[
    		"9440",
    		"擛擜擝擟擠擡擣擥擧",
    		24,
    		"攁",
    		7,
    		"攊",
    		7,
    		"攓",
    		4,
    		"攙",
    		8
    	],
    	[
    		"9480",
    		"攢攣攤攦",
    		4,
    		"攬攭攰攱攲攳攷攺攼攽敀",
    		4,
    		"敆敇敊敋敍敎敐敒敓敔敗敘敚敜敟敠敡敤敥敧敨敩敪敭敮敯敱敳敵敶數",
    		14,
    		"斈斉斊斍斎斏斒斔斕斖斘斚斝斞斠斢斣斦斨斪斬斮斱",
    		7,
    		"斺斻斾斿旀旂旇旈旉旊旍旐旑旓旔旕旘",
    		7,
    		"旡旣旤旪旫"
    	],
    	[
    		"9540",
    		"旲旳旴旵旸旹旻",
    		4,
    		"昁昄昅昇昈昉昋昍昐昑昒昖昗昘昚昛昜昞昡昢昣昤昦昩昪昫昬昮昰昲昳昷",
    		4,
    		"昽昿晀時晄",
    		6,
    		"晍晎晐晑晘"
    	],
    	[
    		"9580",
    		"晙晛晜晝晞晠晢晣晥晧晩",
    		4,
    		"晱晲晳晵晸晹晻晼晽晿暀暁暃暅暆暈暉暊暋暍暎暏暐暒暓暔暕暘",
    		4,
    		"暞",
    		8,
    		"暩",
    		4,
    		"暯",
    		4,
    		"暵暶暷暸暺暻暼暽暿",
    		25,
    		"曚曞",
    		7,
    		"曧曨曪",
    		5,
    		"曱曵曶書曺曻曽朁朂會"
    	],
    	[
    		"9640",
    		"朄朅朆朇朌朎朏朑朒朓朖朘朙朚朜朞朠",
    		5,
    		"朧朩朮朰朲朳朶朷朸朹朻朼朾朿杁杄杅杇杊杋杍杒杔杕杗",
    		4,
    		"杝杢杣杤杦杧杫杬杮東杴杶"
    	],
    	[
    		"9680",
    		"杸杹杺杻杽枀枂枃枅枆枈枊枌枍枎枏枑枒枓枔枖枙枛枟枠枡枤枦枩枬枮枱枲枴枹",
    		7,
    		"柂柅",
    		9,
    		"柕柖柗柛柟柡柣柤柦柧柨柪柫柭柮柲柵",
    		7,
    		"柾栁栂栃栄栆栍栐栒栔栕栘",
    		4,
    		"栞栟栠栢",
    		6,
    		"栫",
    		6,
    		"栴栵栶栺栻栿桇桋桍桏桒桖",
    		5
    	],
    	[
    		"9740",
    		"桜桝桞桟桪桬",
    		7,
    		"桵桸",
    		8,
    		"梂梄梇",
    		7,
    		"梐梑梒梔梕梖梘",
    		9,
    		"梣梤梥梩梪梫梬梮梱梲梴梶梷梸"
    	],
    	[
    		"9780",
    		"梹",
    		6,
    		"棁棃",
    		5,
    		"棊棌棎棏棐棑棓棔棖棗棙棛",
    		4,
    		"棡棢棤",
    		9,
    		"棯棲棳棴棶棷棸棻棽棾棿椀椂椃椄椆",
    		4,
    		"椌椏椑椓",
    		11,
    		"椡椢椣椥",
    		7,
    		"椮椯椱椲椳椵椶椷椸椺椻椼椾楀楁楃",
    		16,
    		"楕楖楘楙楛楜楟"
    	],
    	[
    		"9840",
    		"楡楢楤楥楧楨楩楪楬業楯楰楲",
    		4,
    		"楺楻楽楾楿榁榃榅榊榋榌榎",
    		5,
    		"榖榗榙榚榝",
    		9,
    		"榩榪榬榮榯榰榲榳榵榶榸榹榺榼榽"
    	],
    	[
    		"9880",
    		"榾榿槀槂",
    		7,
    		"構槍槏槑槒槓槕",
    		5,
    		"槜槝槞槡",
    		11,
    		"槮槯槰槱槳",
    		9,
    		"槾樀",
    		9,
    		"樋",
    		11,
    		"標",
    		5,
    		"樠樢",
    		5,
    		"権樫樬樭樮樰樲樳樴樶",
    		6,
    		"樿",
    		4,
    		"橅橆橈",
    		7,
    		"橑",
    		6,
    		"橚"
    	],
    	[
    		"9940",
    		"橜",
    		4,
    		"橢橣橤橦",
    		10,
    		"橲",
    		6,
    		"橺橻橽橾橿檁檂檃檅",
    		8,
    		"檏檒",
    		4,
    		"檘",
    		7,
    		"檡",
    		5
    	],
    	[
    		"9980",
    		"檧檨檪檭",
    		114,
    		"欥欦欨",
    		6
    	],
    	[
    		"9a40",
    		"欯欰欱欳欴欵欶欸欻欼欽欿歀歁歂歄歅歈歊歋歍",
    		11,
    		"歚",
    		7,
    		"歨歩歫",
    		13,
    		"歺歽歾歿殀殅殈"
    	],
    	[
    		"9a80",
    		"殌殎殏殐殑殔殕殗殘殙殜",
    		4,
    		"殢",
    		7,
    		"殫",
    		7,
    		"殶殸",
    		6,
    		"毀毃毄毆",
    		4,
    		"毌毎毐毑毘毚毜",
    		4,
    		"毢",
    		7,
    		"毬毭毮毰毱毲毴毶毷毸毺毻毼毾",
    		6,
    		"氈",
    		4,
    		"氎氒気氜氝氞氠氣氥氫氬氭氱氳氶氷氹氺氻氼氾氿汃汄汅汈汋",
    		4,
    		"汑汒汓汖汘"
    	],
    	[
    		"9b40",
    		"汙汚汢汣汥汦汧汫",
    		4,
    		"汱汳汵汷汸決汻汼汿沀沄沇沊沋沍沎沑沒沕沖沗沘沚沜沝沞沠沢沨沬沯沰沴沵沶沷沺泀況泂泃泆泇泈泋泍泎泏泑泒泘"
    	],
    	[
    		"9b80",
    		"泙泚泜泝泟泤泦泧泩泬泭泲泴泹泿洀洂洃洅洆洈洉洊洍洏洐洑洓洔洕洖洘洜洝洟",
    		5,
    		"洦洨洩洬洭洯洰洴洶洷洸洺洿浀浂浄浉浌浐浕浖浗浘浛浝浟浡浢浤浥浧浨浫浬浭浰浱浲浳浵浶浹浺浻浽",
    		4,
    		"涃涄涆涇涊涋涍涏涐涒涖",
    		4,
    		"涜涢涥涬涭涰涱涳涴涶涷涹",
    		5,
    		"淁淂淃淈淉淊"
    	],
    	[
    		"9c40",
    		"淍淎淏淐淒淓淔淕淗淚淛淜淟淢淣淥淧淨淩淪淭淯淰淲淴淵淶淸淺淽",
    		7,
    		"渆渇済渉渋渏渒渓渕渘渙減渜渞渟渢渦渧渨渪測渮渰渱渳渵"
    	],
    	[
    		"9c80",
    		"渶渷渹渻",
    		7,
    		"湅",
    		7,
    		"湏湐湑湒湕湗湙湚湜湝湞湠",
    		10,
    		"湬湭湯",
    		14,
    		"満溁溂溄溇溈溊",
    		4,
    		"溑",
    		6,
    		"溙溚溛溝溞溠溡溣溤溦溨溩溫溬溭溮溰溳溵溸溹溼溾溿滀滃滄滅滆滈滉滊滌滍滎滐滒滖滘滙滛滜滝滣滧滪",
    		5
    	],
    	[
    		"9d40",
    		"滰滱滲滳滵滶滷滸滺",
    		7,
    		"漃漄漅漇漈漊",
    		4,
    		"漐漑漒漖",
    		9,
    		"漡漢漣漥漦漧漨漬漮漰漲漴漵漷",
    		6,
    		"漿潀潁潂"
    	],
    	[
    		"9d80",
    		"潃潄潅潈潉潊潌潎",
    		9,
    		"潙潚潛潝潟潠潡潣潤潥潧",
    		5,
    		"潯潰潱潳潵潶潷潹潻潽",
    		6,
    		"澅澆澇澊澋澏",
    		12,
    		"澝澞澟澠澢",
    		4,
    		"澨",
    		10,
    		"澴澵澷澸澺",
    		5,
    		"濁濃",
    		5,
    		"濊",
    		6,
    		"濓",
    		10,
    		"濟濢濣濤濥"
    	],
    	[
    		"9e40",
    		"濦",
    		7,
    		"濰",
    		32,
    		"瀒",
    		7,
    		"瀜",
    		6,
    		"瀤",
    		6
    	],
    	[
    		"9e80",
    		"瀫",
    		9,
    		"瀶瀷瀸瀺",
    		17,
    		"灍灎灐",
    		13,
    		"灟",
    		11,
    		"灮灱灲灳灴灷灹灺灻災炁炂炃炄炆炇炈炋炌炍炏炐炑炓炗炘炚炛炞",
    		12,
    		"炰炲炴炵炶為炾炿烄烅烆烇烉烋",
    		12,
    		"烚"
    	],
    	[
    		"9f40",
    		"烜烝烞烠烡烢烣烥烪烮烰",
    		6,
    		"烸烺烻烼烾",
    		10,
    		"焋",
    		4,
    		"焑焒焔焗焛",
    		10,
    		"焧",
    		7,
    		"焲焳焴"
    	],
    	[
    		"9f80",
    		"焵焷",
    		13,
    		"煆煇煈煉煋煍煏",
    		12,
    		"煝煟",
    		4,
    		"煥煩",
    		4,
    		"煯煰煱煴煵煶煷煹煻煼煾",
    		5,
    		"熅",
    		4,
    		"熋熌熍熎熐熑熒熓熕熖熗熚",
    		4,
    		"熡",
    		6,
    		"熩熪熫熭",
    		5,
    		"熴熶熷熸熺",
    		8,
    		"燄",
    		9,
    		"燏",
    		4
    	],
    	[
    		"a040",
    		"燖",
    		9,
    		"燡燢燣燤燦燨",
    		5,
    		"燯",
    		9,
    		"燺",
    		11,
    		"爇",
    		19
    	],
    	[
    		"a080",
    		"爛爜爞",
    		9,
    		"爩爫爭爮爯爲爳爴爺爼爾牀",
    		6,
    		"牉牊牋牎牏牐牑牓牔牕牗牘牚牜牞牠牣牤牥牨牪牫牬牭牰牱牳牴牶牷牸牻牼牽犂犃犅",
    		4,
    		"犌犎犐犑犓",
    		11,
    		"犠",
    		11,
    		"犮犱犲犳犵犺",
    		6,
    		"狅狆狇狉狊狋狌狏狑狓狔狕狖狘狚狛"
    	],
    	[
    		"a1a1",
    		"　、。·ˉˇ¨〃々—～‖…‘’“”〔〕〈",
    		7,
    		"〖〗【】±×÷∶∧∨∑∏∪∩∈∷√⊥∥∠⌒⊙∫∮≡≌≈∽∝≠≮≯≤≥∞∵∴♂♀°′″℃＄¤￠￡‰§№☆★○●◎◇◆□■△▲※→←↑↓〓"
    	],
    	[
    		"a2a1",
    		"ⅰ",
    		9
    	],
    	[
    		"a2b1",
    		"⒈",
    		19,
    		"⑴",
    		19,
    		"①",
    		9
    	],
    	[
    		"a2e5",
    		"㈠",
    		9
    	],
    	[
    		"a2f1",
    		"Ⅰ",
    		11
    	],
    	[
    		"a3a1",
    		"！＂＃￥％",
    		88,
    		"￣"
    	],
    	[
    		"a4a1",
    		"ぁ",
    		82
    	],
    	[
    		"a5a1",
    		"ァ",
    		85
    	],
    	[
    		"a6a1",
    		"Α",
    		16,
    		"Σ",
    		6
    	],
    	[
    		"a6c1",
    		"α",
    		16,
    		"σ",
    		6
    	],
    	[
    		"a6e0",
    		"︵︶︹︺︿﹀︽︾﹁﹂﹃﹄"
    	],
    	[
    		"a6ee",
    		"︻︼︷︸︱"
    	],
    	[
    		"a6f4",
    		"︳︴"
    	],
    	[
    		"a7a1",
    		"А",
    		5,
    		"ЁЖ",
    		25
    	],
    	[
    		"a7d1",
    		"а",
    		5,
    		"ёж",
    		25
    	],
    	[
    		"a840",
    		"ˊˋ˙–―‥‵℅℉↖↗↘↙∕∟∣≒≦≧⊿═",
    		35,
    		"▁",
    		6
    	],
    	[
    		"a880",
    		"█",
    		7,
    		"▓▔▕▼▽◢◣◤◥☉⊕〒〝〞"
    	],
    	[
    		"a8a1",
    		"āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüêɑ"
    	],
    	[
    		"a8bd",
    		"ńň"
    	],
    	[
    		"a8c0",
    		"ɡ"
    	],
    	[
    		"a8c5",
    		"ㄅ",
    		36
    	],
    	[
    		"a940",
    		"〡",
    		8,
    		"㊣㎎㎏㎜㎝㎞㎡㏄㏎㏑㏒㏕︰￢￤"
    	],
    	[
    		"a959",
    		"℡㈱"
    	],
    	[
    		"a95c",
    		"‐"
    	],
    	[
    		"a960",
    		"ー゛゜ヽヾ〆ゝゞ﹉",
    		9,
    		"﹔﹕﹖﹗﹙",
    		8
    	],
    	[
    		"a980",
    		"﹢",
    		4,
    		"﹨﹩﹪﹫"
    	],
    	[
    		"a996",
    		"〇"
    	],
    	[
    		"a9a4",
    		"─",
    		75
    	],
    	[
    		"aa40",
    		"狜狝狟狢",
    		5,
    		"狪狫狵狶狹狽狾狿猀猂猄",
    		5,
    		"猋猌猍猏猐猑猒猔猘猙猚猟猠猣猤猦猧猨猭猯猰猲猳猵猶猺猻猼猽獀",
    		8
    	],
    	[
    		"aa80",
    		"獉獊獋獌獎獏獑獓獔獕獖獘",
    		7,
    		"獡",
    		10,
    		"獮獰獱"
    	],
    	[
    		"ab40",
    		"獲",
    		11,
    		"獿",
    		4,
    		"玅玆玈玊玌玍玏玐玒玓玔玕玗玘玙玚玜玝玞玠玡玣",
    		5,
    		"玪玬玭玱玴玵玶玸玹玼玽玾玿珁珃",
    		4
    	],
    	[
    		"ab80",
    		"珋珌珎珒",
    		6,
    		"珚珛珜珝珟珡珢珣珤珦珨珪珫珬珮珯珰珱珳",
    		4
    	],
    	[
    		"ac40",
    		"珸",
    		10,
    		"琄琇琈琋琌琍琎琑",
    		8,
    		"琜",
    		5,
    		"琣琤琧琩琫琭琯琱琲琷",
    		4,
    		"琽琾琿瑀瑂",
    		11
    	],
    	[
    		"ac80",
    		"瑎",
    		6,
    		"瑖瑘瑝瑠",
    		12,
    		"瑮瑯瑱",
    		4,
    		"瑸瑹瑺"
    	],
    	[
    		"ad40",
    		"瑻瑼瑽瑿璂璄璅璆璈璉璊璌璍璏璑",
    		10,
    		"璝璟",
    		7,
    		"璪",
    		15,
    		"璻",
    		12
    	],
    	[
    		"ad80",
    		"瓈",
    		9,
    		"瓓",
    		8,
    		"瓝瓟瓡瓥瓧",
    		6,
    		"瓰瓱瓲"
    	],
    	[
    		"ae40",
    		"瓳瓵瓸",
    		6,
    		"甀甁甂甃甅",
    		7,
    		"甎甐甒甔甕甖甗甛甝甞甠",
    		4,
    		"甦甧甪甮甴甶甹甼甽甿畁畂畃畄畆畇畉畊畍畐畑畒畓畕畖畗畘"
    	],
    	[
    		"ae80",
    		"畝",
    		7,
    		"畧畨畩畫",
    		6,
    		"畳畵當畷畺",
    		4,
    		"疀疁疂疄疅疇"
    	],
    	[
    		"af40",
    		"疈疉疊疌疍疎疐疓疕疘疛疜疞疢疦",
    		4,
    		"疭疶疷疺疻疿痀痁痆痋痌痎痏痐痑痓痗痙痚痜痝痟痠痡痥痩痬痭痮痯痲痳痵痶痷痸痺痻痽痾瘂瘄瘆瘇"
    	],
    	[
    		"af80",
    		"瘈瘉瘋瘍瘎瘏瘑瘒瘓瘔瘖瘚瘜瘝瘞瘡瘣瘧瘨瘬瘮瘯瘱瘲瘶瘷瘹瘺瘻瘽癁療癄"
    	],
    	[
    		"b040",
    		"癅",
    		6,
    		"癎",
    		5,
    		"癕癗",
    		4,
    		"癝癟癠癡癢癤",
    		6,
    		"癬癭癮癰",
    		7,
    		"癹発發癿皀皁皃皅皉皊皌皍皏皐皒皔皕皗皘皚皛"
    	],
    	[
    		"b080",
    		"皜",
    		7,
    		"皥",
    		8,
    		"皯皰皳皵",
    		9,
    		"盀盁盃啊阿埃挨哎唉哀皑癌蔼矮艾碍爱隘鞍氨安俺按暗岸胺案肮昂盎凹敖熬翱袄傲奥懊澳芭捌扒叭吧笆八疤巴拔跋靶把耙坝霸罢爸白柏百摆佰败拜稗斑班搬扳般颁板版扮拌伴瓣半办绊邦帮梆榜膀绑棒磅蚌镑傍谤苞胞包褒剥"
    	],
    	[
    		"b140",
    		"盄盇盉盋盌盓盕盙盚盜盝盞盠",
    		4,
    		"盦",
    		7,
    		"盰盳盵盶盷盺盻盽盿眀眂眃眅眆眊県眎",
    		10,
    		"眛眜眝眞眡眣眤眥眧眪眫"
    	],
    	[
    		"b180",
    		"眬眮眰",
    		4,
    		"眹眻眽眾眿睂睄睅睆睈",
    		7,
    		"睒",
    		7,
    		"睜薄雹保堡饱宝抱报暴豹鲍爆杯碑悲卑北辈背贝钡倍狈备惫焙被奔苯本笨崩绷甭泵蹦迸逼鼻比鄙笔彼碧蓖蔽毕毙毖币庇痹闭敝弊必辟壁臂避陛鞭边编贬扁便变卞辨辩辫遍标彪膘表鳖憋别瘪彬斌濒滨宾摈兵冰柄丙秉饼炳"
    	],
    	[
    		"b240",
    		"睝睞睟睠睤睧睩睪睭",
    		11,
    		"睺睻睼瞁瞂瞃瞆",
    		5,
    		"瞏瞐瞓",
    		11,
    		"瞡瞣瞤瞦瞨瞫瞭瞮瞯瞱瞲瞴瞶",
    		4
    	],
    	[
    		"b280",
    		"瞼瞾矀",
    		12,
    		"矎",
    		8,
    		"矘矙矚矝",
    		4,
    		"矤病并玻菠播拨钵波博勃搏铂箔伯帛舶脖膊渤泊驳捕卜哺补埠不布步簿部怖擦猜裁材才财睬踩采彩菜蔡餐参蚕残惭惨灿苍舱仓沧藏操糙槽曹草厕策侧册测层蹭插叉茬茶查碴搽察岔差诧拆柴豺搀掺蝉馋谗缠铲产阐颤昌猖"
    	],
    	[
    		"b340",
    		"矦矨矪矯矰矱矲矴矵矷矹矺矻矼砃",
    		5,
    		"砊砋砎砏砐砓砕砙砛砞砠砡砢砤砨砪砫砮砯砱砲砳砵砶砽砿硁硂硃硄硆硈硉硊硋硍硏硑硓硔硘硙硚"
    	],
    	[
    		"b380",
    		"硛硜硞",
    		11,
    		"硯",
    		7,
    		"硸硹硺硻硽",
    		6,
    		"场尝常长偿肠厂敞畅唱倡超抄钞朝嘲潮巢吵炒车扯撤掣彻澈郴臣辰尘晨忱沉陈趁衬撑称城橙成呈乘程惩澄诚承逞骋秤吃痴持匙池迟弛驰耻齿侈尺赤翅斥炽充冲虫崇宠抽酬畴踌稠愁筹仇绸瞅丑臭初出橱厨躇锄雏滁除楚"
    	],
    	[
    		"b440",
    		"碄碅碆碈碊碋碏碐碒碔碕碖碙碝碞碠碢碤碦碨",
    		7,
    		"碵碶碷碸確碻碼碽碿磀磂磃磄磆磇磈磌磍磎磏磑磒磓磖磗磘磚",
    		9
    	],
    	[
    		"b480",
    		"磤磥磦磧磩磪磫磭",
    		4,
    		"磳磵磶磸磹磻",
    		5,
    		"礂礃礄礆",
    		6,
    		"础储矗搐触处揣川穿椽传船喘串疮窗幢床闯创吹炊捶锤垂春椿醇唇淳纯蠢戳绰疵茨磁雌辞慈瓷词此刺赐次聪葱囱匆从丛凑粗醋簇促蹿篡窜摧崔催脆瘁粹淬翠村存寸磋撮搓措挫错搭达答瘩打大呆歹傣戴带殆代贷袋待逮"
    	],
    	[
    		"b540",
    		"礍",
    		5,
    		"礔",
    		9,
    		"礟",
    		4,
    		"礥",
    		14,
    		"礵",
    		4,
    		"礽礿祂祃祄祅祇祊",
    		8,
    		"祔祕祘祙祡祣"
    	],
    	[
    		"b580",
    		"祤祦祩祪祫祬祮祰",
    		6,
    		"祹祻",
    		4,
    		"禂禃禆禇禈禉禋禌禍禎禐禑禒怠耽担丹单郸掸胆旦氮但惮淡诞弹蛋当挡党荡档刀捣蹈倒岛祷导到稻悼道盗德得的蹬灯登等瞪凳邓堤低滴迪敌笛狄涤翟嫡抵底地蒂第帝弟递缔颠掂滇碘点典靛垫电佃甸店惦奠淀殿碉叼雕凋刁掉吊钓调跌爹碟蝶迭谍叠"
    	],
    	[
    		"b640",
    		"禓",
    		6,
    		"禛",
    		11,
    		"禨",
    		10,
    		"禴",
    		4,
    		"禼禿秂秄秅秇秈秊秌秎秏秐秓秔秖秗秙",
    		5,
    		"秠秡秢秥秨秪"
    	],
    	[
    		"b680",
    		"秬秮秱",
    		6,
    		"秹秺秼秾秿稁稄稅稇稈稉稊稌稏",
    		4,
    		"稕稖稘稙稛稜丁盯叮钉顶鼎锭定订丢东冬董懂动栋侗恫冻洞兜抖斗陡豆逗痘都督毒犊独读堵睹赌杜镀肚度渡妒端短锻段断缎堆兑队对墩吨蹲敦顿囤钝盾遁掇哆多夺垛躲朵跺舵剁惰堕蛾峨鹅俄额讹娥恶厄扼遏鄂饿恩而儿耳尔饵洱二"
    	],
    	[
    		"b740",
    		"稝稟稡稢稤",
    		14,
    		"稴稵稶稸稺稾穀",
    		5,
    		"穇",
    		9,
    		"穒",
    		4,
    		"穘",
    		16
    	],
    	[
    		"b780",
    		"穩",
    		6,
    		"穱穲穳穵穻穼穽穾窂窅窇窉窊窋窌窎窏窐窓窔窙窚窛窞窡窢贰发罚筏伐乏阀法珐藩帆番翻樊矾钒繁凡烦反返范贩犯饭泛坊芳方肪房防妨仿访纺放菲非啡飞肥匪诽吠肺废沸费芬酚吩氛分纷坟焚汾粉奋份忿愤粪丰封枫蜂峰锋风疯烽逢冯缝讽奉凤佛否夫敷肤孵扶拂辐幅氟符伏俘服"
    	],
    	[
    		"b840",
    		"窣窤窧窩窪窫窮",
    		4,
    		"窴",
    		10,
    		"竀",
    		10,
    		"竌",
    		9,
    		"竗竘竚竛竜竝竡竢竤竧",
    		5,
    		"竮竰竱竲竳"
    	],
    	[
    		"b880",
    		"竴",
    		4,
    		"竻竼竾笀笁笂笅笇笉笌笍笎笐笒笓笖笗笘笚笜笝笟笡笢笣笧笩笭浮涪福袱弗甫抚辅俯釜斧脯腑府腐赴副覆赋复傅付阜父腹负富讣附妇缚咐噶嘎该改概钙盖溉干甘杆柑竿肝赶感秆敢赣冈刚钢缸肛纲岗港杠篙皋高膏羔糕搞镐稿告哥歌搁戈鸽胳疙割革葛格蛤阁隔铬个各给根跟耕更庚羹"
    	],
    	[
    		"b940",
    		"笯笰笲笴笵笶笷笹笻笽笿",
    		5,
    		"筆筈筊筍筎筓筕筗筙筜筞筟筡筣",
    		10,
    		"筯筰筳筴筶筸筺筼筽筿箁箂箃箄箆",
    		6,
    		"箎箏"
    	],
    	[
    		"b980",
    		"箑箒箓箖箘箙箚箛箞箟箠箣箤箥箮箯箰箲箳箵箶箷箹",
    		7,
    		"篂篃範埂耿梗工攻功恭龚供躬公宫弓巩汞拱贡共钩勾沟苟狗垢构购够辜菇咕箍估沽孤姑鼓古蛊骨谷股故顾固雇刮瓜剐寡挂褂乖拐怪棺关官冠观管馆罐惯灌贯光广逛瑰规圭硅归龟闺轨鬼诡癸桂柜跪贵刽辊滚棍锅郭国果裹过哈"
    	],
    	[
    		"ba40",
    		"篅篈築篊篋篍篎篏篐篒篔",
    		4,
    		"篛篜篞篟篠篢篣篤篧篨篩篫篬篭篯篰篲",
    		4,
    		"篸篹篺篻篽篿",
    		7,
    		"簈簉簊簍簎簐",
    		5,
    		"簗簘簙"
    	],
    	[
    		"ba80",
    		"簚",
    		4,
    		"簠",
    		5,
    		"簨簩簫",
    		12,
    		"簹",
    		5,
    		"籂骸孩海氦亥害骇酣憨邯韩含涵寒函喊罕翰撼捍旱憾悍焊汗汉夯杭航壕嚎豪毫郝好耗号浩呵喝荷菏核禾和何合盒貉阂河涸赫褐鹤贺嘿黑痕很狠恨哼亨横衡恒轰哄烘虹鸿洪宏弘红喉侯猴吼厚候后呼乎忽瑚壶葫胡蝴狐糊湖"
    	],
    	[
    		"bb40",
    		"籃",
    		9,
    		"籎",
    		36,
    		"籵",
    		5,
    		"籾",
    		9
    	],
    	[
    		"bb80",
    		"粈粊",
    		6,
    		"粓粔粖粙粚粛粠粡粣粦粧粨粩粫粬粭粯粰粴",
    		4,
    		"粺粻弧虎唬护互沪户花哗华猾滑画划化话槐徊怀淮坏欢环桓还缓换患唤痪豢焕涣宦幻荒慌黄磺蝗簧皇凰惶煌晃幌恍谎灰挥辉徽恢蛔回毁悔慧卉惠晦贿秽会烩汇讳诲绘荤昏婚魂浑混豁活伙火获或惑霍货祸击圾基机畸稽积箕"
    	],
    	[
    		"bc40",
    		"粿糀糂糃糄糆糉糋糎",
    		6,
    		"糘糚糛糝糞糡",
    		6,
    		"糩",
    		5,
    		"糰",
    		7,
    		"糹糺糼",
    		13,
    		"紋",
    		5
    	],
    	[
    		"bc80",
    		"紑",
    		14,
    		"紡紣紤紥紦紨紩紪紬紭紮細",
    		6,
    		"肌饥迹激讥鸡姬绩缉吉极棘辑籍集及急疾汲即嫉级挤几脊己蓟技冀季伎祭剂悸济寄寂计记既忌际妓继纪嘉枷夹佳家加荚颊贾甲钾假稼价架驾嫁歼监坚尖笺间煎兼肩艰奸缄茧检柬碱硷拣捡简俭剪减荐槛鉴践贱见键箭件"
    	],
    	[
    		"bd40",
    		"紷",
    		54,
    		"絯",
    		7
    	],
    	[
    		"bd80",
    		"絸",
    		32,
    		"健舰剑饯渐溅涧建僵姜将浆江疆蒋桨奖讲匠酱降蕉椒礁焦胶交郊浇骄娇嚼搅铰矫侥脚狡角饺缴绞剿教酵轿较叫窖揭接皆秸街阶截劫节桔杰捷睫竭洁结解姐戒藉芥界借介疥诫届巾筋斤金今津襟紧锦仅谨进靳晋禁近烬浸"
    	],
    	[
    		"be40",
    		"継",
    		12,
    		"綧",
    		6,
    		"綯",
    		42
    	],
    	[
    		"be80",
    		"線",
    		32,
    		"尽劲荆兢茎睛晶鲸京惊精粳经井警景颈静境敬镜径痉靖竟竞净炯窘揪究纠玖韭久灸九酒厩救旧臼舅咎就疚鞠拘狙疽居驹菊局咀矩举沮聚拒据巨具距踞锯俱句惧炬剧捐鹃娟倦眷卷绢撅攫抉掘倔爵觉决诀绝均菌钧军君峻"
    	],
    	[
    		"bf40",
    		"緻",
    		62
    	],
    	[
    		"bf80",
    		"縺縼",
    		4,
    		"繂",
    		4,
    		"繈",
    		21,
    		"俊竣浚郡骏喀咖卡咯开揩楷凯慨刊堪勘坎砍看康慷糠扛抗亢炕考拷烤靠坷苛柯棵磕颗科壳咳可渴克刻客课肯啃垦恳坑吭空恐孔控抠口扣寇枯哭窟苦酷库裤夸垮挎跨胯块筷侩快宽款匡筐狂框矿眶旷况亏盔岿窥葵奎魁傀"
    	],
    	[
    		"c040",
    		"繞",
    		35,
    		"纃",
    		23,
    		"纜纝纞"
    	],
    	[
    		"c080",
    		"纮纴纻纼绖绤绬绹缊缐缞缷缹缻",
    		6,
    		"罃罆",
    		9,
    		"罒罓馈愧溃坤昆捆困括扩廓阔垃拉喇蜡腊辣啦莱来赖蓝婪栏拦篮阑兰澜谰揽览懒缆烂滥琅榔狼廊郎朗浪捞劳牢老佬姥酪烙涝勒乐雷镭蕾磊累儡垒擂肋类泪棱楞冷厘梨犁黎篱狸离漓理李里鲤礼莉荔吏栗丽厉励砾历利傈例俐"
    	],
    	[
    		"c140",
    		"罖罙罛罜罝罞罠罣",
    		4,
    		"罫罬罭罯罰罳罵罶罷罸罺罻罼罽罿羀羂",
    		7,
    		"羋羍羏",
    		4,
    		"羕",
    		4,
    		"羛羜羠羢羣羥羦羨",
    		6,
    		"羱"
    	],
    	[
    		"c180",
    		"羳",
    		4,
    		"羺羻羾翀翂翃翄翆翇翈翉翋翍翏",
    		4,
    		"翖翗翙",
    		5,
    		"翢翣痢立粒沥隶力璃哩俩联莲连镰廉怜涟帘敛脸链恋炼练粮凉梁粱良两辆量晾亮谅撩聊僚疗燎寥辽潦了撂镣廖料列裂烈劣猎琳林磷霖临邻鳞淋凛赁吝拎玲菱零龄铃伶羚凌灵陵岭领另令溜琉榴硫馏留刘瘤流柳六龙聋咙笼窿"
    	],
    	[
    		"c240",
    		"翤翧翨翪翫翬翭翯翲翴",
    		6,
    		"翽翾翿耂耇耈耉耊耎耏耑耓耚耛耝耞耟耡耣耤耫",
    		5,
    		"耲耴耹耺耼耾聀聁聄聅聇聈聉聎聏聐聑聓聕聖聗"
    	],
    	[
    		"c280",
    		"聙聛",
    		13,
    		"聫",
    		5,
    		"聲",
    		11,
    		"隆垄拢陇楼娄搂篓漏陋芦卢颅庐炉掳卤虏鲁麓碌露路赂鹿潞禄录陆戮驴吕铝侣旅履屡缕虑氯律率滤绿峦挛孪滦卵乱掠略抡轮伦仑沦纶论萝螺罗逻锣箩骡裸落洛骆络妈麻玛码蚂马骂嘛吗埋买麦卖迈脉瞒馒蛮满蔓曼慢漫"
    	],
    	[
    		"c340",
    		"聾肁肂肅肈肊肍",
    		5,
    		"肔肕肗肙肞肣肦肧肨肬肰肳肵肶肸肹肻胅胇",
    		4,
    		"胏",
    		6,
    		"胘胟胠胢胣胦胮胵胷胹胻胾胿脀脁脃脄脅脇脈脋"
    	],
    	[
    		"c380",
    		"脌脕脗脙脛脜脝脟",
    		12,
    		"脭脮脰脳脴脵脷脹",
    		4,
    		"脿谩芒茫盲氓忙莽猫茅锚毛矛铆卯茂冒帽貌贸么玫枚梅酶霉煤没眉媒镁每美昧寐妹媚门闷们萌蒙檬盟锰猛梦孟眯醚靡糜迷谜弥米秘觅泌蜜密幂棉眠绵冕免勉娩缅面苗描瞄藐秒渺庙妙蔑灭民抿皿敏悯闽明螟鸣铭名命谬摸"
    	],
    	[
    		"c440",
    		"腀",
    		5,
    		"腇腉腍腎腏腒腖腗腘腛",
    		4,
    		"腡腢腣腤腦腨腪腫腬腯腲腳腵腶腷腸膁膃",
    		4,
    		"膉膋膌膍膎膐膒",
    		5,
    		"膙膚膞",
    		4,
    		"膤膥"
    	],
    	[
    		"c480",
    		"膧膩膫",
    		7,
    		"膴",
    		5,
    		"膼膽膾膿臄臅臇臈臉臋臍",
    		6,
    		"摹蘑模膜磨摩魔抹末莫墨默沫漠寞陌谋牟某拇牡亩姆母墓暮幕募慕木目睦牧穆拿哪呐钠那娜纳氖乃奶耐奈南男难囊挠脑恼闹淖呢馁内嫩能妮霓倪泥尼拟你匿腻逆溺蔫拈年碾撵捻念娘酿鸟尿捏聂孽啮镊镍涅您柠狞凝宁"
    	],
    	[
    		"c540",
    		"臔",
    		14,
    		"臤臥臦臨臩臫臮",
    		4,
    		"臵",
    		5,
    		"臽臿舃與",
    		4,
    		"舎舏舑舓舕",
    		5,
    		"舝舠舤舥舦舧舩舮舲舺舼舽舿"
    	],
    	[
    		"c580",
    		"艀艁艂艃艅艆艈艊艌艍艎艐",
    		7,
    		"艙艛艜艝艞艠",
    		7,
    		"艩拧泞牛扭钮纽脓浓农弄奴努怒女暖虐疟挪懦糯诺哦欧鸥殴藕呕偶沤啪趴爬帕怕琶拍排牌徘湃派攀潘盘磐盼畔判叛乓庞旁耪胖抛咆刨炮袍跑泡呸胚培裴赔陪配佩沛喷盆砰抨烹澎彭蓬棚硼篷膨朋鹏捧碰坯砒霹批披劈琵毗"
    	],
    	[
    		"c640",
    		"艪艫艬艭艱艵艶艷艸艻艼芀芁芃芅芆芇芉芌芐芓芔芕芖芚芛芞芠芢芣芧芲芵芶芺芻芼芿苀苂苃苅苆苉苐苖苙苚苝苢苧苨苩苪苬苭苮苰苲苳苵苶苸"
    	],
    	[
    		"c680",
    		"苺苼",
    		4,
    		"茊茋茍茐茒茓茖茘茙茝",
    		9,
    		"茩茪茮茰茲茷茻茽啤脾疲皮匹痞僻屁譬篇偏片骗飘漂瓢票撇瞥拼频贫品聘乒坪苹萍平凭瓶评屏坡泼颇婆破魄迫粕剖扑铺仆莆葡菩蒲埔朴圃普浦谱曝瀑期欺栖戚妻七凄漆柒沏其棋奇歧畦崎脐齐旗祈祁骑起岂乞企启契砌器气迄弃汽泣讫掐"
    	],
    	[
    		"c740",
    		"茾茿荁荂荄荅荈荊",
    		4,
    		"荓荕",
    		4,
    		"荝荢荰",
    		6,
    		"荹荺荾",
    		6,
    		"莇莈莊莋莌莍莏莐莑莔莕莖莗莙莚莝莟莡",
    		6,
    		"莬莭莮"
    	],
    	[
    		"c780",
    		"莯莵莻莾莿菂菃菄菆菈菉菋菍菎菐菑菒菓菕菗菙菚菛菞菢菣菤菦菧菨菫菬菭恰洽牵扦钎铅千迁签仟谦乾黔钱钳前潜遣浅谴堑嵌欠歉枪呛腔羌墙蔷强抢橇锹敲悄桥瞧乔侨巧鞘撬翘峭俏窍切茄且怯窃钦侵亲秦琴勤芹擒禽寝沁青轻氢倾卿清擎晴氰情顷请庆琼穷秋丘邱球求囚酋泅趋区蛆曲躯屈驱渠"
    	],
    	[
    		"c840",
    		"菮華菳",
    		4,
    		"菺菻菼菾菿萀萂萅萇萈萉萊萐萒",
    		5,
    		"萙萚萛萞",
    		5,
    		"萩",
    		7,
    		"萲",
    		5,
    		"萹萺萻萾",
    		7,
    		"葇葈葉"
    	],
    	[
    		"c880",
    		"葊",
    		6,
    		"葒",
    		4,
    		"葘葝葞葟葠葢葤",
    		4,
    		"葪葮葯葰葲葴葷葹葻葼取娶龋趣去圈颧权醛泉全痊拳犬券劝缺炔瘸却鹊榷确雀裙群然燃冉染瓤壤攘嚷让饶扰绕惹热壬仁人忍韧任认刃妊纫扔仍日戎茸蓉荣融熔溶容绒冗揉柔肉茹蠕儒孺如辱乳汝入褥软阮蕊瑞锐闰润若弱撒洒萨腮鳃塞赛三叁"
    	],
    	[
    		"c940",
    		"葽",
    		4,
    		"蒃蒄蒅蒆蒊蒍蒏",
    		7,
    		"蒘蒚蒛蒝蒞蒟蒠蒢",
    		12,
    		"蒰蒱蒳蒵蒶蒷蒻蒼蒾蓀蓂蓃蓅蓆蓇蓈蓋蓌蓎蓏蓒蓔蓕蓗"
    	],
    	[
    		"c980",
    		"蓘",
    		4,
    		"蓞蓡蓢蓤蓧",
    		4,
    		"蓭蓮蓯蓱",
    		10,
    		"蓽蓾蔀蔁蔂伞散桑嗓丧搔骚扫嫂瑟色涩森僧莎砂杀刹沙纱傻啥煞筛晒珊苫杉山删煽衫闪陕擅赡膳善汕扇缮墒伤商赏晌上尚裳梢捎稍烧芍勺韶少哨邵绍奢赊蛇舌舍赦摄射慑涉社设砷申呻伸身深娠绅神沈审婶甚肾慎渗声生甥牲升绳"
    	],
    	[
    		"ca40",
    		"蔃",
    		8,
    		"蔍蔎蔏蔐蔒蔔蔕蔖蔘蔙蔛蔜蔝蔞蔠蔢",
    		8,
    		"蔭",
    		9,
    		"蔾",
    		4,
    		"蕄蕅蕆蕇蕋",
    		10
    	],
    	[
    		"ca80",
    		"蕗蕘蕚蕛蕜蕝蕟",
    		4,
    		"蕥蕦蕧蕩",
    		8,
    		"蕳蕵蕶蕷蕸蕼蕽蕿薀薁省盛剩胜圣师失狮施湿诗尸虱十石拾时什食蚀实识史矢使屎驶始式示士世柿事拭誓逝势是嗜噬适仕侍释饰氏市恃室视试收手首守寿授售受瘦兽蔬枢梳殊抒输叔舒淑疏书赎孰熟薯暑曙署蜀黍鼠属术述树束戍竖墅庶数漱"
    	],
    	[
    		"cb40",
    		"薂薃薆薈",
    		6,
    		"薐",
    		10,
    		"薝",
    		6,
    		"薥薦薧薩薫薬薭薱",
    		5,
    		"薸薺",
    		6,
    		"藂",
    		6,
    		"藊",
    		4,
    		"藑藒"
    	],
    	[
    		"cb80",
    		"藔藖",
    		5,
    		"藝",
    		6,
    		"藥藦藧藨藪",
    		14,
    		"恕刷耍摔衰甩帅栓拴霜双爽谁水睡税吮瞬顺舜说硕朔烁斯撕嘶思私司丝死肆寺嗣四伺似饲巳松耸怂颂送宋讼诵搜艘擞嗽苏酥俗素速粟僳塑溯宿诉肃酸蒜算虽隋随绥髓碎岁穗遂隧祟孙损笋蓑梭唆缩琐索锁所塌他它她塔"
    	],
    	[
    		"cc40",
    		"藹藺藼藽藾蘀",
    		4,
    		"蘆",
    		10,
    		"蘒蘓蘔蘕蘗",
    		15,
    		"蘨蘪",
    		13,
    		"蘹蘺蘻蘽蘾蘿虀"
    	],
    	[
    		"cc80",
    		"虁",
    		11,
    		"虒虓處",
    		4,
    		"虛虜虝號虠虡虣",
    		7,
    		"獭挞蹋踏胎苔抬台泰酞太态汰坍摊贪瘫滩坛檀痰潭谭谈坦毯袒碳探叹炭汤塘搪堂棠膛唐糖倘躺淌趟烫掏涛滔绦萄桃逃淘陶讨套特藤腾疼誊梯剔踢锑提题蹄啼体替嚏惕涕剃屉天添填田甜恬舔腆挑条迢眺跳贴铁帖厅听烃"
    	],
    	[
    		"cd40",
    		"虭虯虰虲",
    		6,
    		"蚃",
    		6,
    		"蚎",
    		4,
    		"蚔蚖",
    		5,
    		"蚞",
    		4,
    		"蚥蚦蚫蚭蚮蚲蚳蚷蚸蚹蚻",
    		4,
    		"蛁蛂蛃蛅蛈蛌蛍蛒蛓蛕蛖蛗蛚蛜"
    	],
    	[
    		"cd80",
    		"蛝蛠蛡蛢蛣蛥蛦蛧蛨蛪蛫蛬蛯蛵蛶蛷蛺蛻蛼蛽蛿蜁蜄蜅蜆蜋蜌蜎蜏蜐蜑蜔蜖汀廷停亭庭挺艇通桐酮瞳同铜彤童桶捅筒统痛偷投头透凸秃突图徒途涂屠土吐兔湍团推颓腿蜕褪退吞屯臀拖托脱鸵陀驮驼椭妥拓唾挖哇蛙洼娃瓦袜歪外豌弯湾玩顽丸烷完碗挽晚皖惋宛婉万腕汪王亡枉网往旺望忘妄威"
    	],
    	[
    		"ce40",
    		"蜙蜛蜝蜟蜠蜤蜦蜧蜨蜪蜫蜬蜭蜯蜰蜲蜳蜵蜶蜸蜹蜺蜼蜽蝀",
    		6,
    		"蝊蝋蝍蝏蝐蝑蝒蝔蝕蝖蝘蝚",
    		5,
    		"蝡蝢蝦",
    		7,
    		"蝯蝱蝲蝳蝵"
    	],
    	[
    		"ce80",
    		"蝷蝸蝹蝺蝿螀螁螄螆螇螉螊螌螎",
    		4,
    		"螔螕螖螘",
    		6,
    		"螠",
    		4,
    		"巍微危韦违桅围唯惟为潍维苇萎委伟伪尾纬未蔚味畏胃喂魏位渭谓尉慰卫瘟温蚊文闻纹吻稳紊问嗡翁瓮挝蜗涡窝我斡卧握沃巫呜钨乌污诬屋无芜梧吾吴毋武五捂午舞伍侮坞戊雾晤物勿务悟误昔熙析西硒矽晰嘻吸锡牺"
    	],
    	[
    		"cf40",
    		"螥螦螧螩螪螮螰螱螲螴螶螷螸螹螻螼螾螿蟁",
    		4,
    		"蟇蟈蟉蟌",
    		4,
    		"蟔",
    		6,
    		"蟜蟝蟞蟟蟡蟢蟣蟤蟦蟧蟨蟩蟫蟬蟭蟯",
    		9
    	],
    	[
    		"cf80",
    		"蟺蟻蟼蟽蟿蠀蠁蠂蠄",
    		5,
    		"蠋",
    		7,
    		"蠔蠗蠘蠙蠚蠜",
    		4,
    		"蠣稀息希悉膝夕惜熄烯溪汐犀檄袭席习媳喜铣洗系隙戏细瞎虾匣霞辖暇峡侠狭下厦夏吓掀锨先仙鲜纤咸贤衔舷闲涎弦嫌显险现献县腺馅羡宪陷限线相厢镶香箱襄湘乡翔祥详想响享项巷橡像向象萧硝霄削哮嚣销消宵淆晓"
    	],
    	[
    		"d040",
    		"蠤",
    		13,
    		"蠳",
    		5,
    		"蠺蠻蠽蠾蠿衁衂衃衆",
    		5,
    		"衎",
    		5,
    		"衕衖衘衚",
    		6,
    		"衦衧衪衭衯衱衳衴衵衶衸衹衺"
    	],
    	[
    		"d080",
    		"衻衼袀袃袆袇袉袊袌袎袏袐袑袓袔袕袗",
    		4,
    		"袝",
    		4,
    		"袣袥",
    		5,
    		"小孝校肖啸笑效楔些歇蝎鞋协挟携邪斜胁谐写械卸蟹懈泄泻谢屑薪芯锌欣辛新忻心信衅星腥猩惺兴刑型形邢行醒幸杏性姓兄凶胸匈汹雄熊休修羞朽嗅锈秀袖绣墟戌需虚嘘须徐许蓄酗叙旭序畜恤絮婿绪续轩喧宣悬旋玄"
    	],
    	[
    		"d140",
    		"袬袮袯袰袲",
    		4,
    		"袸袹袺袻袽袾袿裀裃裄裇裈裊裋裌裍裏裐裑裓裖裗裚",
    		4,
    		"裠裡裦裧裩",
    		6,
    		"裲裵裶裷裺裻製裿褀褁褃",
    		5
    	],
    	[
    		"d180",
    		"褉褋",
    		4,
    		"褑褔",
    		4,
    		"褜",
    		4,
    		"褢褣褤褦褧褨褩褬褭褮褯褱褲褳褵褷选癣眩绚靴薛学穴雪血勋熏循旬询寻驯巡殉汛训讯逊迅压押鸦鸭呀丫芽牙蚜崖衙涯雅哑亚讶焉咽阉烟淹盐严研蜒岩延言颜阎炎沿奄掩眼衍演艳堰燕厌砚雁唁彦焰宴谚验殃央鸯秧杨扬佯疡羊洋阳氧仰痒养样漾邀腰妖瑶"
    	],
    	[
    		"d240",
    		"褸",
    		8,
    		"襂襃襅",
    		24,
    		"襠",
    		5,
    		"襧",
    		19,
    		"襼"
    	],
    	[
    		"d280",
    		"襽襾覀覂覄覅覇",
    		26,
    		"摇尧遥窑谣姚咬舀药要耀椰噎耶爷野冶也页掖业叶曳腋夜液一壹医揖铱依伊衣颐夷遗移仪胰疑沂宜姨彝椅蚁倚已乙矣以艺抑易邑屹亿役臆逸肄疫亦裔意毅忆义益溢诣议谊译异翼翌绎茵荫因殷音阴姻吟银淫寅饮尹引隐"
    	],
    	[
    		"d340",
    		"覢",
    		30,
    		"觃觍觓觔觕觗觘觙觛觝觟觠觡觢觤觧觨觩觪觬觭觮觰觱觲觴",
    		6
    	],
    	[
    		"d380",
    		"觻",
    		4,
    		"訁",
    		5,
    		"計",
    		21,
    		"印英樱婴鹰应缨莹萤营荧蝇迎赢盈影颖硬映哟拥佣臃痈庸雍踊蛹咏泳涌永恿勇用幽优悠忧尤由邮铀犹油游酉有友右佑釉诱又幼迂淤于盂榆虞愚舆余俞逾鱼愉渝渔隅予娱雨与屿禹宇语羽玉域芋郁吁遇喻峪御愈欲狱育誉"
    	],
    	[
    		"d440",
    		"訞",
    		31,
    		"訿",
    		8,
    		"詉",
    		21
    	],
    	[
    		"d480",
    		"詟",
    		25,
    		"詺",
    		6,
    		"浴寓裕预豫驭鸳渊冤元垣袁原援辕园员圆猿源缘远苑愿怨院曰约越跃钥岳粤月悦阅耘云郧匀陨允运蕴酝晕韵孕匝砸杂栽哉灾宰载再在咱攒暂赞赃脏葬遭糟凿藻枣早澡蚤躁噪造皂灶燥责择则泽贼怎增憎曾赠扎喳渣札轧"
    	],
    	[
    		"d540",
    		"誁",
    		7,
    		"誋",
    		7,
    		"誔",
    		46
    	],
    	[
    		"d580",
    		"諃",
    		32,
    		"铡闸眨栅榨咋乍炸诈摘斋宅窄债寨瞻毡詹粘沾盏斩辗崭展蘸栈占战站湛绽樟章彰漳张掌涨杖丈帐账仗胀瘴障招昭找沼赵照罩兆肇召遮折哲蛰辙者锗蔗这浙珍斟真甄砧臻贞针侦枕疹诊震振镇阵蒸挣睁征狰争怔整拯正政"
    	],
    	[
    		"d640",
    		"諤",
    		34,
    		"謈",
    		27
    	],
    	[
    		"d680",
    		"謤謥謧",
    		30,
    		"帧症郑证芝枝支吱蜘知肢脂汁之织职直植殖执值侄址指止趾只旨纸志挚掷至致置帜峙制智秩稚质炙痔滞治窒中盅忠钟衷终种肿重仲众舟周州洲诌粥轴肘帚咒皱宙昼骤珠株蛛朱猪诸诛逐竹烛煮拄瞩嘱主著柱助蛀贮铸筑"
    	],
    	[
    		"d740",
    		"譆",
    		31,
    		"譧",
    		4,
    		"譭",
    		25
    	],
    	[
    		"d780",
    		"讇",
    		24,
    		"讬讱讻诇诐诪谉谞住注祝驻抓爪拽专砖转撰赚篆桩庄装妆撞壮状椎锥追赘坠缀谆准捉拙卓桌琢茁酌啄着灼浊兹咨资姿滋淄孜紫仔籽滓子自渍字鬃棕踪宗综总纵邹走奏揍租足卒族祖诅阻组钻纂嘴醉最罪尊遵昨左佐柞做作坐座"
    	],
    	[
    		"d840",
    		"谸",
    		8,
    		"豂豃豄豅豈豊豋豍",
    		7,
    		"豖豗豘豙豛",
    		5,
    		"豣",
    		6,
    		"豬",
    		6,
    		"豴豵豶豷豻",
    		6,
    		"貃貄貆貇"
    	],
    	[
    		"d880",
    		"貈貋貍",
    		6,
    		"貕貖貗貙",
    		20,
    		"亍丌兀丐廿卅丕亘丞鬲孬噩丨禺丿匕乇夭爻卮氐囟胤馗毓睾鼗丶亟鼐乜乩亓芈孛啬嘏仄厍厝厣厥厮靥赝匚叵匦匮匾赜卦卣刂刈刎刭刳刿剀剌剞剡剜蒯剽劂劁劐劓冂罔亻仃仉仂仨仡仫仞伛仳伢佤仵伥伧伉伫佞佧攸佚佝"
    	],
    	[
    		"d940",
    		"貮",
    		62
    	],
    	[
    		"d980",
    		"賭",
    		32,
    		"佟佗伲伽佶佴侑侉侃侏佾佻侪佼侬侔俦俨俪俅俚俣俜俑俟俸倩偌俳倬倏倮倭俾倜倌倥倨偾偃偕偈偎偬偻傥傧傩傺僖儆僭僬僦僮儇儋仝氽佘佥俎龠汆籴兮巽黉馘冁夔勹匍訇匐凫夙兕亠兖亳衮袤亵脔裒禀嬴蠃羸冫冱冽冼"
    	],
    	[
    		"da40",
    		"贎",
    		14,
    		"贠赑赒赗赟赥赨赩赪赬赮赯赱赲赸",
    		8,
    		"趂趃趆趇趈趉趌",
    		4,
    		"趒趓趕",
    		9,
    		"趠趡"
    	],
    	[
    		"da80",
    		"趢趤",
    		12,
    		"趲趶趷趹趻趽跀跁跂跅跇跈跉跊跍跐跒跓跔凇冖冢冥讠讦讧讪讴讵讷诂诃诋诏诎诒诓诔诖诘诙诜诟诠诤诨诩诮诰诳诶诹诼诿谀谂谄谇谌谏谑谒谔谕谖谙谛谘谝谟谠谡谥谧谪谫谮谯谲谳谵谶卩卺阝阢阡阱阪阽阼陂陉陔陟陧陬陲陴隈隍隗隰邗邛邝邙邬邡邴邳邶邺"
    	],
    	[
    		"db40",
    		"跕跘跙跜跠跡跢跥跦跧跩跭跮跰跱跲跴跶跼跾",
    		6,
    		"踆踇踈踋踍踎踐踑踒踓踕",
    		7,
    		"踠踡踤",
    		4,
    		"踫踭踰踲踳踴踶踷踸踻踼踾"
    	],
    	[
    		"db80",
    		"踿蹃蹅蹆蹌",
    		4,
    		"蹓",
    		5,
    		"蹚",
    		11,
    		"蹧蹨蹪蹫蹮蹱邸邰郏郅邾郐郄郇郓郦郢郜郗郛郫郯郾鄄鄢鄞鄣鄱鄯鄹酃酆刍奂劢劬劭劾哿勐勖勰叟燮矍廴凵凼鬯厶弁畚巯坌垩垡塾墼壅壑圩圬圪圳圹圮圯坜圻坂坩垅坫垆坼坻坨坭坶坳垭垤垌垲埏垧垴垓垠埕埘埚埙埒垸埴埯埸埤埝"
    	],
    	[
    		"dc40",
    		"蹳蹵蹷",
    		4,
    		"蹽蹾躀躂躃躄躆躈",
    		6,
    		"躑躒躓躕",
    		6,
    		"躝躟",
    		11,
    		"躭躮躰躱躳",
    		6,
    		"躻",
    		7
    	],
    	[
    		"dc80",
    		"軃",
    		10,
    		"軏",
    		21,
    		"堋堍埽埭堀堞堙塄堠塥塬墁墉墚墀馨鼙懿艹艽艿芏芊芨芄芎芑芗芙芫芸芾芰苈苊苣芘芷芮苋苌苁芩芴芡芪芟苄苎芤苡茉苷苤茏茇苜苴苒苘茌苻苓茑茚茆茔茕苠苕茜荑荛荜茈莒茼茴茱莛荞茯荏荇荃荟荀茗荠茭茺茳荦荥"
    	],
    	[
    		"dd40",
    		"軥",
    		62
    	],
    	[
    		"dd80",
    		"輤",
    		32,
    		"荨茛荩荬荪荭荮莰荸莳莴莠莪莓莜莅荼莶莩荽莸荻莘莞莨莺莼菁萁菥菘堇萘萋菝菽菖萜萸萑萆菔菟萏萃菸菹菪菅菀萦菰菡葜葑葚葙葳蒇蒈葺蒉葸萼葆葩葶蒌蒎萱葭蓁蓍蓐蓦蒽蓓蓊蒿蒺蓠蒡蒹蒴蒗蓥蓣蔌甍蔸蓰蔹蔟蔺"
    	],
    	[
    		"de40",
    		"轅",
    		32,
    		"轪辀辌辒辝辠辡辢辤辥辦辧辪辬辭辮辯農辳辴辵辷辸辺辻込辿迀迃迆"
    	],
    	[
    		"de80",
    		"迉",
    		4,
    		"迏迒迖迗迚迠迡迣迧迬迯迱迲迴迵迶迺迻迼迾迿逇逈逌逎逓逕逘蕖蔻蓿蓼蕙蕈蕨蕤蕞蕺瞢蕃蕲蕻薤薨薇薏蕹薮薜薅薹薷薰藓藁藜藿蘧蘅蘩蘖蘼廾弈夼奁耷奕奚奘匏尢尥尬尴扌扪抟抻拊拚拗拮挢拶挹捋捃掭揶捱捺掎掴捭掬掊捩掮掼揲揸揠揿揄揞揎摒揆掾摅摁搋搛搠搌搦搡摞撄摭撖"
    	],
    	[
    		"df40",
    		"這逜連逤逥逧",
    		5,
    		"逰",
    		4,
    		"逷逹逺逽逿遀遃遅遆遈",
    		4,
    		"過達違遖遙遚遜",
    		5,
    		"遤遦遧適遪遫遬遯",
    		4,
    		"遶",
    		6,
    		"遾邁"
    	],
    	[
    		"df80",
    		"還邅邆邇邉邊邌",
    		4,
    		"邒邔邖邘邚邜邞邟邠邤邥邧邨邩邫邭邲邷邼邽邿郀摺撷撸撙撺擀擐擗擤擢攉攥攮弋忒甙弑卟叱叽叩叨叻吒吖吆呋呒呓呔呖呃吡呗呙吣吲咂咔呷呱呤咚咛咄呶呦咝哐咭哂咴哒咧咦哓哔呲咣哕咻咿哌哙哚哜咩咪咤哝哏哞唛哧唠哽唔哳唢唣唏唑唧唪啧喏喵啉啭啁啕唿啐唼"
    	],
    	[
    		"e040",
    		"郂郃郆郈郉郋郌郍郒郔郕郖郘郙郚郞郟郠郣郤郥郩郪郬郮郰郱郲郳郵郶郷郹郺郻郼郿鄀鄁鄃鄅",
    		19,
    		"鄚鄛鄜"
    	],
    	[
    		"e080",
    		"鄝鄟鄠鄡鄤",
    		10,
    		"鄰鄲",
    		6,
    		"鄺",
    		8,
    		"酄唷啖啵啶啷唳唰啜喋嗒喃喱喹喈喁喟啾嗖喑啻嗟喽喾喔喙嗪嗷嗉嘟嗑嗫嗬嗔嗦嗝嗄嗯嗥嗲嗳嗌嗍嗨嗵嗤辔嘞嘈嘌嘁嘤嘣嗾嘀嘧嘭噘嘹噗嘬噍噢噙噜噌噔嚆噤噱噫噻噼嚅嚓嚯囔囗囝囡囵囫囹囿圄圊圉圜帏帙帔帑帱帻帼"
    	],
    	[
    		"e140",
    		"酅酇酈酑酓酔酕酖酘酙酛酜酟酠酦酧酨酫酭酳酺酻酼醀",
    		4,
    		"醆醈醊醎醏醓",
    		6,
    		"醜",
    		5,
    		"醤",
    		5,
    		"醫醬醰醱醲醳醶醷醸醹醻"
    	],
    	[
    		"e180",
    		"醼",
    		10,
    		"釈釋釐釒",
    		9,
    		"針",
    		8,
    		"帷幄幔幛幞幡岌屺岍岐岖岈岘岙岑岚岜岵岢岽岬岫岱岣峁岷峄峒峤峋峥崂崃崧崦崮崤崞崆崛嵘崾崴崽嵬嵛嵯嵝嵫嵋嵊嵩嵴嶂嶙嶝豳嶷巅彳彷徂徇徉後徕徙徜徨徭徵徼衢彡犭犰犴犷犸狃狁狎狍狒狨狯狩狲狴狷猁狳猃狺"
    	],
    	[
    		"e240",
    		"釦",
    		62
    	],
    	[
    		"e280",
    		"鈥",
    		32,
    		"狻猗猓猡猊猞猝猕猢猹猥猬猸猱獐獍獗獠獬獯獾舛夥飧夤夂饣饧",
    		5,
    		"饴饷饽馀馄馇馊馍馐馑馓馔馕庀庑庋庖庥庠庹庵庾庳赓廒廑廛廨廪膺忄忉忖忏怃忮怄忡忤忾怅怆忪忭忸怙怵怦怛怏怍怩怫怊怿怡恸恹恻恺恂"
    	],
    	[
    		"e340",
    		"鉆",
    		45,
    		"鉵",
    		16
    	],
    	[
    		"e380",
    		"銆",
    		7,
    		"銏",
    		24,
    		"恪恽悖悚悭悝悃悒悌悛惬悻悱惝惘惆惚悴愠愦愕愣惴愀愎愫慊慵憬憔憧憷懔懵忝隳闩闫闱闳闵闶闼闾阃阄阆阈阊阋阌阍阏阒阕阖阗阙阚丬爿戕氵汔汜汊沣沅沐沔沌汨汩汴汶沆沩泐泔沭泷泸泱泗沲泠泖泺泫泮沱泓泯泾"
    	],
    	[
    		"e440",
    		"銨",
    		5,
    		"銯",
    		24,
    		"鋉",
    		31
    	],
    	[
    		"e480",
    		"鋩",
    		32,
    		"洹洧洌浃浈洇洄洙洎洫浍洮洵洚浏浒浔洳涑浯涞涠浞涓涔浜浠浼浣渚淇淅淞渎涿淠渑淦淝淙渖涫渌涮渫湮湎湫溲湟溆湓湔渲渥湄滟溱溘滠漭滢溥溧溽溻溷滗溴滏溏滂溟潢潆潇漤漕滹漯漶潋潴漪漉漩澉澍澌潸潲潼潺濑"
    	],
    	[
    		"e540",
    		"錊",
    		51,
    		"錿",
    		10
    	],
    	[
    		"e580",
    		"鍊",
    		31,
    		"鍫濉澧澹澶濂濡濮濞濠濯瀚瀣瀛瀹瀵灏灞宀宄宕宓宥宸甯骞搴寤寮褰寰蹇謇辶迓迕迥迮迤迩迦迳迨逅逄逋逦逑逍逖逡逵逶逭逯遄遑遒遐遨遘遢遛暹遴遽邂邈邃邋彐彗彖彘尻咫屐屙孱屣屦羼弪弩弭艴弼鬻屮妁妃妍妩妪妣"
    	],
    	[
    		"e640",
    		"鍬",
    		34,
    		"鎐",
    		27
    	],
    	[
    		"e680",
    		"鎬",
    		29,
    		"鏋鏌鏍妗姊妫妞妤姒妲妯姗妾娅娆姝娈姣姘姹娌娉娲娴娑娣娓婀婧婊婕娼婢婵胬媪媛婷婺媾嫫媲嫒嫔媸嫠嫣嫱嫖嫦嫘嫜嬉嬗嬖嬲嬷孀尕尜孚孥孳孑孓孢驵驷驸驺驿驽骀骁骅骈骊骐骒骓骖骘骛骜骝骟骠骢骣骥骧纟纡纣纥纨纩"
    	],
    	[
    		"e740",
    		"鏎",
    		7,
    		"鏗",
    		54
    	],
    	[
    		"e780",
    		"鐎",
    		32,
    		"纭纰纾绀绁绂绉绋绌绐绔绗绛绠绡绨绫绮绯绱绲缍绶绺绻绾缁缂缃缇缈缋缌缏缑缒缗缙缜缛缟缡",
    		6,
    		"缪缫缬缭缯",
    		4,
    		"缵幺畿巛甾邕玎玑玮玢玟珏珂珑玷玳珀珉珈珥珙顼琊珩珧珞玺珲琏琪瑛琦琥琨琰琮琬"
    	],
    	[
    		"e840",
    		"鐯",
    		14,
    		"鐿",
    		43,
    		"鑬鑭鑮鑯"
    	],
    	[
    		"e880",
    		"鑰",
    		20,
    		"钑钖钘铇铏铓铔铚铦铻锜锠琛琚瑁瑜瑗瑕瑙瑷瑭瑾璜璎璀璁璇璋璞璨璩璐璧瓒璺韪韫韬杌杓杞杈杩枥枇杪杳枘枧杵枨枞枭枋杷杼柰栉柘栊柩枰栌柙枵柚枳柝栀柃枸柢栎柁柽栲栳桠桡桎桢桄桤梃栝桕桦桁桧桀栾桊桉栩梵梏桴桷梓桫棂楮棼椟椠棹"
    	],
    	[
    		"e940",
    		"锧锳锽镃镈镋镕镚镠镮镴镵長",
    		7,
    		"門",
    		42
    	],
    	[
    		"e980",
    		"閫",
    		32,
    		"椤棰椋椁楗棣椐楱椹楠楂楝榄楫榀榘楸椴槌榇榈槎榉楦楣楹榛榧榻榫榭槔榱槁槊槟榕槠榍槿樯槭樗樘橥槲橄樾檠橐橛樵檎橹樽樨橘橼檑檐檩檗檫猷獒殁殂殇殄殒殓殍殚殛殡殪轫轭轱轲轳轵轶轸轷轹轺轼轾辁辂辄辇辋"
    	],
    	[
    		"ea40",
    		"闌",
    		27,
    		"闬闿阇阓阘阛阞阠阣",
    		6,
    		"阫阬阭阯阰阷阸阹阺阾陁陃陊陎陏陑陒陓陖陗"
    	],
    	[
    		"ea80",
    		"陘陙陚陜陝陞陠陣陥陦陫陭",
    		4,
    		"陳陸",
    		12,
    		"隇隉隊辍辎辏辘辚軎戋戗戛戟戢戡戥戤戬臧瓯瓴瓿甏甑甓攴旮旯旰昊昙杲昃昕昀炅曷昝昴昱昶昵耆晟晔晁晏晖晡晗晷暄暌暧暝暾曛曜曦曩贲贳贶贻贽赀赅赆赈赉赇赍赕赙觇觊觋觌觎觏觐觑牮犟牝牦牯牾牿犄犋犍犏犒挈挲掰"
    	],
    	[
    		"eb40",
    		"隌階隑隒隓隕隖隚際隝",
    		9,
    		"隨",
    		7,
    		"隱隲隴隵隷隸隺隻隿雂雃雈雊雋雐雑雓雔雖",
    		9,
    		"雡",
    		6,
    		"雫"
    	],
    	[
    		"eb80",
    		"雬雭雮雰雱雲雴雵雸雺電雼雽雿霂霃霅霊霋霌霐霑霒霔霕霗",
    		4,
    		"霝霟霠搿擘耄毪毳毽毵毹氅氇氆氍氕氘氙氚氡氩氤氪氲攵敕敫牍牒牖爰虢刖肟肜肓肼朊肽肱肫肭肴肷胧胨胩胪胛胂胄胙胍胗朐胝胫胱胴胭脍脎胲胼朕脒豚脶脞脬脘脲腈腌腓腴腙腚腱腠腩腼腽腭腧塍媵膈膂膑滕膣膪臌朦臊膻"
    	],
    	[
    		"ec40",
    		"霡",
    		8,
    		"霫霬霮霯霱霳",
    		4,
    		"霺霻霼霽霿",
    		18,
    		"靔靕靗靘靚靜靝靟靣靤靦靧靨靪",
    		7
    	],
    	[
    		"ec80",
    		"靲靵靷",
    		4,
    		"靽",
    		7,
    		"鞆",
    		4,
    		"鞌鞎鞏鞐鞓鞕鞖鞗鞙",
    		4,
    		"臁膦欤欷欹歃歆歙飑飒飓飕飙飚殳彀毂觳斐齑斓於旆旄旃旌旎旒旖炀炜炖炝炻烀炷炫炱烨烊焐焓焖焯焱煳煜煨煅煲煊煸煺熘熳熵熨熠燠燔燧燹爝爨灬焘煦熹戾戽扃扈扉礻祀祆祉祛祜祓祚祢祗祠祯祧祺禅禊禚禧禳忑忐"
    	],
    	[
    		"ed40",
    		"鞞鞟鞡鞢鞤",
    		6,
    		"鞬鞮鞰鞱鞳鞵",
    		46
    	],
    	[
    		"ed80",
    		"韤韥韨韮",
    		4,
    		"韴韷",
    		23,
    		"怼恝恚恧恁恙恣悫愆愍慝憩憝懋懑戆肀聿沓泶淼矶矸砀砉砗砘砑斫砭砜砝砹砺砻砟砼砥砬砣砩硎硭硖硗砦硐硇硌硪碛碓碚碇碜碡碣碲碹碥磔磙磉磬磲礅磴礓礤礞礴龛黹黻黼盱眄眍盹眇眈眚眢眙眭眦眵眸睐睑睇睃睚睨"
    	],
    	[
    		"ee40",
    		"頏",
    		62
    	],
    	[
    		"ee80",
    		"顎",
    		32,
    		"睢睥睿瞍睽瞀瞌瞑瞟瞠瞰瞵瞽町畀畎畋畈畛畲畹疃罘罡罟詈罨罴罱罹羁罾盍盥蠲钅钆钇钋钊钌钍钏钐钔钗钕钚钛钜钣钤钫钪钭钬钯钰钲钴钶",
    		4,
    		"钼钽钿铄铈",
    		6,
    		"铐铑铒铕铖铗铙铘铛铞铟铠铢铤铥铧铨铪"
    	],
    	[
    		"ef40",
    		"顯",
    		5,
    		"颋颎颒颕颙颣風",
    		37,
    		"飏飐飔飖飗飛飜飝飠",
    		4
    	],
    	[
    		"ef80",
    		"飥飦飩",
    		30,
    		"铩铫铮铯铳铴铵铷铹铼铽铿锃锂锆锇锉锊锍锎锏锒",
    		4,
    		"锘锛锝锞锟锢锪锫锩锬锱锲锴锶锷锸锼锾锿镂锵镄镅镆镉镌镎镏镒镓镔镖镗镘镙镛镞镟镝镡镢镤",
    		8,
    		"镯镱镲镳锺矧矬雉秕秭秣秫稆嵇稃稂稞稔"
    	],
    	[
    		"f040",
    		"餈",
    		4,
    		"餎餏餑",
    		28,
    		"餯",
    		26
    	],
    	[
    		"f080",
    		"饊",
    		9,
    		"饖",
    		12,
    		"饤饦饳饸饹饻饾馂馃馉稹稷穑黏馥穰皈皎皓皙皤瓞瓠甬鸠鸢鸨",
    		4,
    		"鸲鸱鸶鸸鸷鸹鸺鸾鹁鹂鹄鹆鹇鹈鹉鹋鹌鹎鹑鹕鹗鹚鹛鹜鹞鹣鹦",
    		6,
    		"鹱鹭鹳疒疔疖疠疝疬疣疳疴疸痄疱疰痃痂痖痍痣痨痦痤痫痧瘃痱痼痿瘐瘀瘅瘌瘗瘊瘥瘘瘕瘙"
    	],
    	[
    		"f140",
    		"馌馎馚",
    		10,
    		"馦馧馩",
    		47
    	],
    	[
    		"f180",
    		"駙",
    		32,
    		"瘛瘼瘢瘠癀瘭瘰瘿瘵癃瘾瘳癍癞癔癜癖癫癯翊竦穸穹窀窆窈窕窦窠窬窨窭窳衤衩衲衽衿袂袢裆袷袼裉裢裎裣裥裱褚裼裨裾裰褡褙褓褛褊褴褫褶襁襦襻疋胥皲皴矜耒耔耖耜耠耢耥耦耧耩耨耱耋耵聃聆聍聒聩聱覃顸颀颃"
    	],
    	[
    		"f240",
    		"駺",
    		62
    	],
    	[
    		"f280",
    		"騹",
    		32,
    		"颉颌颍颏颔颚颛颞颟颡颢颥颦虍虔虬虮虿虺虼虻蚨蚍蚋蚬蚝蚧蚣蚪蚓蚩蚶蛄蚵蛎蚰蚺蚱蚯蛉蛏蚴蛩蛱蛲蛭蛳蛐蜓蛞蛴蛟蛘蛑蜃蜇蛸蜈蜊蜍蜉蜣蜻蜞蜥蜮蜚蜾蝈蜴蜱蜩蜷蜿螂蜢蝽蝾蝻蝠蝰蝌蝮螋蝓蝣蝼蝤蝙蝥螓螯螨蟒"
    	],
    	[
    		"f340",
    		"驚",
    		17,
    		"驲骃骉骍骎骔骕骙骦骩",
    		6,
    		"骲骳骴骵骹骻骽骾骿髃髄髆",
    		4,
    		"髍髎髏髐髒體髕髖髗髙髚髛髜"
    	],
    	[
    		"f380",
    		"髝髞髠髢髣髤髥髧髨髩髪髬髮髰",
    		8,
    		"髺髼",
    		6,
    		"鬄鬅鬆蟆螈螅螭螗螃螫蟥螬螵螳蟋蟓螽蟑蟀蟊蟛蟪蟠蟮蠖蠓蟾蠊蠛蠡蠹蠼缶罂罄罅舐竺竽笈笃笄笕笊笫笏筇笸笪笙笮笱笠笥笤笳笾笞筘筚筅筵筌筝筠筮筻筢筲筱箐箦箧箸箬箝箨箅箪箜箢箫箴篑篁篌篝篚篥篦篪簌篾篼簏簖簋"
    	],
    	[
    		"f440",
    		"鬇鬉",
    		5,
    		"鬐鬑鬒鬔",
    		10,
    		"鬠鬡鬢鬤",
    		10,
    		"鬰鬱鬳",
    		7,
    		"鬽鬾鬿魀魆魊魋魌魎魐魒魓魕",
    		5
    	],
    	[
    		"f480",
    		"魛",
    		32,
    		"簟簪簦簸籁籀臾舁舂舄臬衄舡舢舣舭舯舨舫舸舻舳舴舾艄艉艋艏艚艟艨衾袅袈裘裟襞羝羟羧羯羰羲籼敉粑粝粜粞粢粲粼粽糁糇糌糍糈糅糗糨艮暨羿翎翕翥翡翦翩翮翳糸絷綦綮繇纛麸麴赳趄趔趑趱赧赭豇豉酊酐酎酏酤"
    	],
    	[
    		"f540",
    		"魼",
    		62
    	],
    	[
    		"f580",
    		"鮻",
    		32,
    		"酢酡酰酩酯酽酾酲酴酹醌醅醐醍醑醢醣醪醭醮醯醵醴醺豕鹾趸跫踅蹙蹩趵趿趼趺跄跖跗跚跞跎跏跛跆跬跷跸跣跹跻跤踉跽踔踝踟踬踮踣踯踺蹀踹踵踽踱蹉蹁蹂蹑蹒蹊蹰蹶蹼蹯蹴躅躏躔躐躜躞豸貂貊貅貘貔斛觖觞觚觜"
    	],
    	[
    		"f640",
    		"鯜",
    		62
    	],
    	[
    		"f680",
    		"鰛",
    		32,
    		"觥觫觯訾謦靓雩雳雯霆霁霈霏霎霪霭霰霾龀龃龅",
    		5,
    		"龌黾鼋鼍隹隼隽雎雒瞿雠銎銮鋈錾鍪鏊鎏鐾鑫鱿鲂鲅鲆鲇鲈稣鲋鲎鲐鲑鲒鲔鲕鲚鲛鲞",
    		5,
    		"鲥",
    		4,
    		"鲫鲭鲮鲰",
    		7,
    		"鲺鲻鲼鲽鳄鳅鳆鳇鳊鳋"
    	],
    	[
    		"f740",
    		"鰼",
    		62
    	],
    	[
    		"f780",
    		"鱻鱽鱾鲀鲃鲄鲉鲊鲌鲏鲓鲖鲗鲘鲙鲝鲪鲬鲯鲹鲾",
    		4,
    		"鳈鳉鳑鳒鳚鳛鳠鳡鳌",
    		4,
    		"鳓鳔鳕鳗鳘鳙鳜鳝鳟鳢靼鞅鞑鞒鞔鞯鞫鞣鞲鞴骱骰骷鹘骶骺骼髁髀髅髂髋髌髑魅魃魇魉魈魍魑飨餍餮饕饔髟髡髦髯髫髻髭髹鬈鬏鬓鬟鬣麽麾縻麂麇麈麋麒鏖麝麟黛黜黝黠黟黢黩黧黥黪黯鼢鼬鼯鼹鼷鼽鼾齄"
    	],
    	[
    		"f840",
    		"鳣",
    		62
    	],
    	[
    		"f880",
    		"鴢",
    		32
    	],
    	[
    		"f940",
    		"鵃",
    		62
    	],
    	[
    		"f980",
    		"鶂",
    		32
    	],
    	[
    		"fa40",
    		"鶣",
    		62
    	],
    	[
    		"fa80",
    		"鷢",
    		32
    	],
    	[
    		"fb40",
    		"鸃",
    		27,
    		"鸤鸧鸮鸰鸴鸻鸼鹀鹍鹐鹒鹓鹔鹖鹙鹝鹟鹠鹡鹢鹥鹮鹯鹲鹴",
    		9,
    		"麀"
    	],
    	[
    		"fb80",
    		"麁麃麄麅麆麉麊麌",
    		5,
    		"麔",
    		8,
    		"麞麠",
    		5,
    		"麧麨麩麪"
    	],
    	[
    		"fc40",
    		"麫",
    		8,
    		"麵麶麷麹麺麼麿",
    		4,
    		"黅黆黇黈黊黋黌黐黒黓黕黖黗黙黚點黡黣黤黦黨黫黬黭黮黰",
    		8,
    		"黺黽黿",
    		6
    	],
    	[
    		"fc80",
    		"鼆",
    		4,
    		"鼌鼏鼑鼒鼔鼕鼖鼘鼚",
    		5,
    		"鼡鼣",
    		8,
    		"鼭鼮鼰鼱"
    	],
    	[
    		"fd40",
    		"鼲",
    		4,
    		"鼸鼺鼼鼿",
    		4,
    		"齅",
    		10,
    		"齒",
    		38
    	],
    	[
    		"fd80",
    		"齹",
    		5,
    		"龁龂龍",
    		11,
    		"龜龝龞龡",
    		4,
    		"郎凉秊裏隣"
    	],
    	[
    		"fe40",
    		"兀嗀﨎﨏﨑﨓﨔礼﨟蘒﨡﨣﨤﨧﨨﨩"
    	]
    ];

    var require$$3$1 = [
    	[
    		"a140",
    		"",
    		62
    	],
    	[
    		"a180",
    		"",
    		32
    	],
    	[
    		"a240",
    		"",
    		62
    	],
    	[
    		"a280",
    		"",
    		32
    	],
    	[
    		"a2ab",
    		"",
    		5
    	],
    	[
    		"a2e3",
    		"€"
    	],
    	[
    		"a2ef",
    		""
    	],
    	[
    		"a2fd",
    		""
    	],
    	[
    		"a340",
    		"",
    		62
    	],
    	[
    		"a380",
    		"",
    		31,
    		"　"
    	],
    	[
    		"a440",
    		"",
    		62
    	],
    	[
    		"a480",
    		"",
    		32
    	],
    	[
    		"a4f4",
    		"",
    		10
    	],
    	[
    		"a540",
    		"",
    		62
    	],
    	[
    		"a580",
    		"",
    		32
    	],
    	[
    		"a5f7",
    		"",
    		7
    	],
    	[
    		"a640",
    		"",
    		62
    	],
    	[
    		"a680",
    		"",
    		32
    	],
    	[
    		"a6b9",
    		"",
    		7
    	],
    	[
    		"a6d9",
    		"",
    		6
    	],
    	[
    		"a6ec",
    		""
    	],
    	[
    		"a6f3",
    		""
    	],
    	[
    		"a6f6",
    		"",
    		8
    	],
    	[
    		"a740",
    		"",
    		62
    	],
    	[
    		"a780",
    		"",
    		32
    	],
    	[
    		"a7c2",
    		"",
    		14
    	],
    	[
    		"a7f2",
    		"",
    		12
    	],
    	[
    		"a896",
    		"",
    		10
    	],
    	[
    		"a8bc",
    		"ḿ"
    	],
    	[
    		"a8bf",
    		"ǹ"
    	],
    	[
    		"a8c1",
    		""
    	],
    	[
    		"a8ea",
    		"",
    		20
    	],
    	[
    		"a958",
    		""
    	],
    	[
    		"a95b",
    		""
    	],
    	[
    		"a95d",
    		""
    	],
    	[
    		"a989",
    		"〾⿰",
    		11
    	],
    	[
    		"a997",
    		"",
    		12
    	],
    	[
    		"a9f0",
    		"",
    		14
    	],
    	[
    		"aaa1",
    		"",
    		93
    	],
    	[
    		"aba1",
    		"",
    		93
    	],
    	[
    		"aca1",
    		"",
    		93
    	],
    	[
    		"ada1",
    		"",
    		93
    	],
    	[
    		"aea1",
    		"",
    		93
    	],
    	[
    		"afa1",
    		"",
    		93
    	],
    	[
    		"d7fa",
    		"",
    		4
    	],
    	[
    		"f8a1",
    		"",
    		93
    	],
    	[
    		"f9a1",
    		"",
    		93
    	],
    	[
    		"faa1",
    		"",
    		93
    	],
    	[
    		"fba1",
    		"",
    		93
    	],
    	[
    		"fca1",
    		"",
    		93
    	],
    	[
    		"fda1",
    		"",
    		93
    	],
    	[
    		"fe50",
    		"⺁⺄㑳㑇⺈⺋㖞㘚㘎⺌⺗㥮㤘㧏㧟㩳㧐㭎㱮㳠⺧⺪䁖䅟⺮䌷⺳⺶⺷䎱䎬⺻䏝䓖䙡䙌"
    	],
    	[
    		"fe80",
    		"䜣䜩䝼䞍⻊䥇䥺䥽䦂䦃䦅䦆䦟䦛䦷䦶䲣䲟䲠䲡䱷䲢䴓",
    		6,
    		"䶮",
    		93
    	],
    	[
    		"8135f437",
    		""
    	]
    ];

    var uChars = [
    	128,
    	165,
    	169,
    	178,
    	184,
    	216,
    	226,
    	235,
    	238,
    	244,
    	248,
    	251,
    	253,
    	258,
    	276,
    	284,
    	300,
    	325,
    	329,
    	334,
    	364,
    	463,
    	465,
    	467,
    	469,
    	471,
    	473,
    	475,
    	477,
    	506,
    	594,
    	610,
    	712,
    	716,
    	730,
    	930,
    	938,
    	962,
    	970,
    	1026,
    	1104,
    	1106,
    	8209,
    	8215,
    	8218,
    	8222,
    	8231,
    	8241,
    	8244,
    	8246,
    	8252,
    	8365,
    	8452,
    	8454,
    	8458,
    	8471,
    	8482,
    	8556,
    	8570,
    	8596,
    	8602,
    	8713,
    	8720,
    	8722,
    	8726,
    	8731,
    	8737,
    	8740,
    	8742,
    	8748,
    	8751,
    	8760,
    	8766,
    	8777,
    	8781,
    	8787,
    	8802,
    	8808,
    	8816,
    	8854,
    	8858,
    	8870,
    	8896,
    	8979,
    	9322,
    	9372,
    	9548,
    	9588,
    	9616,
    	9622,
    	9634,
    	9652,
    	9662,
    	9672,
    	9676,
    	9680,
    	9702,
    	9735,
    	9738,
    	9793,
    	9795,
    	11906,
    	11909,
    	11913,
    	11917,
    	11928,
    	11944,
    	11947,
    	11951,
    	11956,
    	11960,
    	11964,
    	11979,
    	12284,
    	12292,
    	12312,
    	12319,
    	12330,
    	12351,
    	12436,
    	12447,
    	12535,
    	12543,
    	12586,
    	12842,
    	12850,
    	12964,
    	13200,
    	13215,
    	13218,
    	13253,
    	13263,
    	13267,
    	13270,
    	13384,
    	13428,
    	13727,
    	13839,
    	13851,
    	14617,
    	14703,
    	14801,
    	14816,
    	14964,
    	15183,
    	15471,
    	15585,
    	16471,
    	16736,
    	17208,
    	17325,
    	17330,
    	17374,
    	17623,
    	17997,
    	18018,
    	18212,
    	18218,
    	18301,
    	18318,
    	18760,
    	18811,
    	18814,
    	18820,
    	18823,
    	18844,
    	18848,
    	18872,
    	19576,
    	19620,
    	19738,
    	19887,
    	40870,
    	59244,
    	59336,
    	59367,
    	59413,
    	59417,
    	59423,
    	59431,
    	59437,
    	59443,
    	59452,
    	59460,
    	59478,
    	59493,
    	63789,
    	63866,
    	63894,
    	63976,
    	63986,
    	64016,
    	64018,
    	64021,
    	64025,
    	64034,
    	64037,
    	64042,
    	65074,
    	65093,
    	65107,
    	65112,
    	65127,
    	65132,
    	65375,
    	65510,
    	65536
    ];
    var gbChars = [
    	0,
    	36,
    	38,
    	45,
    	50,
    	81,
    	89,
    	95,
    	96,
    	100,
    	103,
    	104,
    	105,
    	109,
    	126,
    	133,
    	148,
    	172,
    	175,
    	179,
    	208,
    	306,
    	307,
    	308,
    	309,
    	310,
    	311,
    	312,
    	313,
    	341,
    	428,
    	443,
    	544,
    	545,
    	558,
    	741,
    	742,
    	749,
    	750,
    	805,
    	819,
    	820,
    	7922,
    	7924,
    	7925,
    	7927,
    	7934,
    	7943,
    	7944,
    	7945,
    	7950,
    	8062,
    	8148,
    	8149,
    	8152,
    	8164,
    	8174,
    	8236,
    	8240,
    	8262,
    	8264,
    	8374,
    	8380,
    	8381,
    	8384,
    	8388,
    	8390,
    	8392,
    	8393,
    	8394,
    	8396,
    	8401,
    	8406,
    	8416,
    	8419,
    	8424,
    	8437,
    	8439,
    	8445,
    	8482,
    	8485,
    	8496,
    	8521,
    	8603,
    	8936,
    	8946,
    	9046,
    	9050,
    	9063,
    	9066,
    	9076,
    	9092,
    	9100,
    	9108,
    	9111,
    	9113,
    	9131,
    	9162,
    	9164,
    	9218,
    	9219,
    	11329,
    	11331,
    	11334,
    	11336,
    	11346,
    	11361,
    	11363,
    	11366,
    	11370,
    	11372,
    	11375,
    	11389,
    	11682,
    	11686,
    	11687,
    	11692,
    	11694,
    	11714,
    	11716,
    	11723,
    	11725,
    	11730,
    	11736,
    	11982,
    	11989,
    	12102,
    	12336,
    	12348,
    	12350,
    	12384,
    	12393,
    	12395,
    	12397,
    	12510,
    	12553,
    	12851,
    	12962,
    	12973,
    	13738,
    	13823,
    	13919,
    	13933,
    	14080,
    	14298,
    	14585,
    	14698,
    	15583,
    	15847,
    	16318,
    	16434,
    	16438,
    	16481,
    	16729,
    	17102,
    	17122,
    	17315,
    	17320,
    	17402,
    	17418,
    	17859,
    	17909,
    	17911,
    	17915,
    	17916,
    	17936,
    	17939,
    	17961,
    	18664,
    	18703,
    	18814,
    	18962,
    	19043,
    	33469,
    	33470,
    	33471,
    	33484,
    	33485,
    	33490,
    	33497,
    	33501,
    	33505,
    	33513,
    	33520,
    	33536,
    	33550,
    	37845,
    	37921,
    	37948,
    	38029,
    	38038,
    	38064,
    	38065,
    	38066,
    	38069,
    	38075,
    	38076,
    	38078,
    	39108,
    	39109,
    	39113,
    	39114,
    	39115,
    	39116,
    	39265,
    	39394,
    	189000
    ];
    var require$$4 = {
    	uChars: uChars,
    	gbChars: gbChars
    };

    var require$$5 = [
    	[
    		"0",
    		"\u0000",
    		127
    	],
    	[
    		"8141",
    		"갂갃갅갆갋",
    		4,
    		"갘갞갟갡갢갣갥",
    		6,
    		"갮갲갳갴"
    	],
    	[
    		"8161",
    		"갵갶갷갺갻갽갾갿걁",
    		9,
    		"걌걎",
    		5,
    		"걕"
    	],
    	[
    		"8181",
    		"걖걗걙걚걛걝",
    		18,
    		"걲걳걵걶걹걻",
    		4,
    		"겂겇겈겍겎겏겑겒겓겕",
    		6,
    		"겞겢",
    		5,
    		"겫겭겮겱",
    		6,
    		"겺겾겿곀곂곃곅곆곇곉곊곋곍",
    		7,
    		"곖곘",
    		7,
    		"곢곣곥곦곩곫곭곮곲곴곷",
    		4,
    		"곾곿괁괂괃괅괇",
    		4,
    		"괎괐괒괓"
    	],
    	[
    		"8241",
    		"괔괕괖괗괙괚괛괝괞괟괡",
    		7,
    		"괪괫괮",
    		5
    	],
    	[
    		"8261",
    		"괶괷괹괺괻괽",
    		6,
    		"굆굈굊",
    		5,
    		"굑굒굓굕굖굗"
    	],
    	[
    		"8281",
    		"굙",
    		7,
    		"굢굤",
    		7,
    		"굮굯굱굲굷굸굹굺굾궀궃",
    		4,
    		"궊궋궍궎궏궑",
    		10,
    		"궞",
    		5,
    		"궥",
    		17,
    		"궸",
    		7,
    		"귂귃귅귆귇귉",
    		6,
    		"귒귔",
    		7,
    		"귝귞귟귡귢귣귥",
    		18
    	],
    	[
    		"8341",
    		"귺귻귽귾긂",
    		5,
    		"긊긌긎",
    		5,
    		"긕",
    		7
    	],
    	[
    		"8361",
    		"긝",
    		18,
    		"긲긳긵긶긹긻긼"
    	],
    	[
    		"8381",
    		"긽긾긿깂깄깇깈깉깋깏깑깒깓깕깗",
    		4,
    		"깞깢깣깤깦깧깪깫깭깮깯깱",
    		6,
    		"깺깾",
    		5,
    		"꺆",
    		5,
    		"꺍",
    		46,
    		"꺿껁껂껃껅",
    		6,
    		"껎껒",
    		5,
    		"껚껛껝",
    		8
    	],
    	[
    		"8441",
    		"껦껧껩껪껬껮",
    		5,
    		"껵껶껷껹껺껻껽",
    		8
    	],
    	[
    		"8461",
    		"꼆꼉꼊꼋꼌꼎꼏꼑",
    		18
    	],
    	[
    		"8481",
    		"꼤",
    		7,
    		"꼮꼯꼱꼳꼵",
    		6,
    		"꼾꽀꽄꽅꽆꽇꽊",
    		5,
    		"꽑",
    		10,
    		"꽞",
    		5,
    		"꽦",
    		18,
    		"꽺",
    		5,
    		"꾁꾂꾃꾅꾆꾇꾉",
    		6,
    		"꾒꾓꾔꾖",
    		5,
    		"꾝",
    		26,
    		"꾺꾻꾽꾾"
    	],
    	[
    		"8541",
    		"꾿꿁",
    		5,
    		"꿊꿌꿏",
    		4,
    		"꿕",
    		6,
    		"꿝",
    		4
    	],
    	[
    		"8561",
    		"꿢",
    		5,
    		"꿪",
    		5,
    		"꿲꿳꿵꿶꿷꿹",
    		6,
    		"뀂뀃"
    	],
    	[
    		"8581",
    		"뀅",
    		6,
    		"뀍뀎뀏뀑뀒뀓뀕",
    		6,
    		"뀞",
    		9,
    		"뀩",
    		26,
    		"끆끇끉끋끍끏끐끑끒끖끘끚끛끜끞",
    		29,
    		"끾끿낁낂낃낅",
    		6,
    		"낎낐낒",
    		5,
    		"낛낝낞낣낤"
    	],
    	[
    		"8641",
    		"낥낦낧낪낰낲낶낷낹낺낻낽",
    		6,
    		"냆냊",
    		5,
    		"냒"
    	],
    	[
    		"8661",
    		"냓냕냖냗냙",
    		6,
    		"냡냢냣냤냦",
    		10
    	],
    	[
    		"8681",
    		"냱",
    		22,
    		"넊넍넎넏넑넔넕넖넗넚넞",
    		4,
    		"넦넧넩넪넫넭",
    		6,
    		"넶넺",
    		5,
    		"녂녃녅녆녇녉",
    		6,
    		"녒녓녖녗녙녚녛녝녞녟녡",
    		22,
    		"녺녻녽녾녿놁놃",
    		4,
    		"놊놌놎놏놐놑놕놖놗놙놚놛놝"
    	],
    	[
    		"8741",
    		"놞",
    		9,
    		"놩",
    		15
    	],
    	[
    		"8761",
    		"놹",
    		18,
    		"뇍뇎뇏뇑뇒뇓뇕"
    	],
    	[
    		"8781",
    		"뇖",
    		5,
    		"뇞뇠",
    		7,
    		"뇪뇫뇭뇮뇯뇱",
    		7,
    		"뇺뇼뇾",
    		5,
    		"눆눇눉눊눍",
    		6,
    		"눖눘눚",
    		5,
    		"눡",
    		18,
    		"눵",
    		6,
    		"눽",
    		26,
    		"뉙뉚뉛뉝뉞뉟뉡",
    		6,
    		"뉪",
    		4
    	],
    	[
    		"8841",
    		"뉯",
    		4,
    		"뉶",
    		5,
    		"뉽",
    		6,
    		"늆늇늈늊",
    		4
    	],
    	[
    		"8861",
    		"늏늒늓늕늖늗늛",
    		4,
    		"늢늤늧늨늩늫늭늮늯늱늲늳늵늶늷"
    	],
    	[
    		"8881",
    		"늸",
    		15,
    		"닊닋닍닎닏닑닓",
    		4,
    		"닚닜닞닟닠닡닣닧닩닪닰닱닲닶닼닽닾댂댃댅댆댇댉",
    		6,
    		"댒댖",
    		5,
    		"댝",
    		54,
    		"덗덙덚덝덠덡덢덣"
    	],
    	[
    		"8941",
    		"덦덨덪덬덭덯덲덳덵덶덷덹",
    		6,
    		"뎂뎆",
    		5,
    		"뎍"
    	],
    	[
    		"8961",
    		"뎎뎏뎑뎒뎓뎕",
    		10,
    		"뎢",
    		5,
    		"뎩뎪뎫뎭"
    	],
    	[
    		"8981",
    		"뎮",
    		21,
    		"돆돇돉돊돍돏돑돒돓돖돘돚돜돞돟돡돢돣돥돦돧돩",
    		18,
    		"돽",
    		18,
    		"됑",
    		6,
    		"됙됚됛됝됞됟됡",
    		6,
    		"됪됬",
    		7,
    		"됵",
    		15
    	],
    	[
    		"8a41",
    		"둅",
    		10,
    		"둒둓둕둖둗둙",
    		6,
    		"둢둤둦"
    	],
    	[
    		"8a61",
    		"둧",
    		4,
    		"둭",
    		18,
    		"뒁뒂"
    	],
    	[
    		"8a81",
    		"뒃",
    		4,
    		"뒉",
    		19,
    		"뒞",
    		5,
    		"뒥뒦뒧뒩뒪뒫뒭",
    		7,
    		"뒶뒸뒺",
    		5,
    		"듁듂듃듅듆듇듉",
    		6,
    		"듑듒듓듔듖",
    		5,
    		"듞듟듡듢듥듧",
    		4,
    		"듮듰듲",
    		5,
    		"듹",
    		26,
    		"딖딗딙딚딝"
    	],
    	[
    		"8b41",
    		"딞",
    		5,
    		"딦딫",
    		4,
    		"딲딳딵딶딷딹",
    		6,
    		"땂땆"
    	],
    	[
    		"8b61",
    		"땇땈땉땊땎땏땑땒땓땕",
    		6,
    		"땞땢",
    		8
    	],
    	[
    		"8b81",
    		"땫",
    		52,
    		"떢떣떥떦떧떩떬떭떮떯떲떶",
    		4,
    		"떾떿뗁뗂뗃뗅",
    		6,
    		"뗎뗒",
    		5,
    		"뗙",
    		18,
    		"뗭",
    		18
    	],
    	[
    		"8c41",
    		"똀",
    		15,
    		"똒똓똕똖똗똙",
    		4
    	],
    	[
    		"8c61",
    		"똞",
    		6,
    		"똦",
    		5,
    		"똭",
    		6,
    		"똵",
    		5
    	],
    	[
    		"8c81",
    		"똻",
    		12,
    		"뙉",
    		26,
    		"뙥뙦뙧뙩",
    		50,
    		"뚞뚟뚡뚢뚣뚥",
    		5,
    		"뚭뚮뚯뚰뚲",
    		16
    	],
    	[
    		"8d41",
    		"뛃",
    		16,
    		"뛕",
    		8
    	],
    	[
    		"8d61",
    		"뛞",
    		17,
    		"뛱뛲뛳뛵뛶뛷뛹뛺"
    	],
    	[
    		"8d81",
    		"뛻",
    		4,
    		"뜂뜃뜄뜆",
    		33,
    		"뜪뜫뜭뜮뜱",
    		6,
    		"뜺뜼",
    		7,
    		"띅띆띇띉띊띋띍",
    		6,
    		"띖",
    		9,
    		"띡띢띣띥띦띧띩",
    		6,
    		"띲띴띶",
    		5,
    		"띾띿랁랂랃랅",
    		6,
    		"랎랓랔랕랚랛랝랞"
    	],
    	[
    		"8e41",
    		"랟랡",
    		6,
    		"랪랮",
    		5,
    		"랶랷랹",
    		8
    	],
    	[
    		"8e61",
    		"럂",
    		4,
    		"럈럊",
    		19
    	],
    	[
    		"8e81",
    		"럞",
    		13,
    		"럮럯럱럲럳럵",
    		6,
    		"럾렂",
    		4,
    		"렊렋렍렎렏렑",
    		6,
    		"렚렜렞",
    		5,
    		"렦렧렩렪렫렭",
    		6,
    		"렶렺",
    		5,
    		"롁롂롃롅",
    		11,
    		"롒롔",
    		7,
    		"롞롟롡롢롣롥",
    		6,
    		"롮롰롲",
    		5,
    		"롹롺롻롽",
    		7
    	],
    	[
    		"8f41",
    		"뢅",
    		7,
    		"뢎",
    		17
    	],
    	[
    		"8f61",
    		"뢠",
    		7,
    		"뢩",
    		6,
    		"뢱뢲뢳뢵뢶뢷뢹",
    		4
    	],
    	[
    		"8f81",
    		"뢾뢿룂룄룆",
    		5,
    		"룍룎룏룑룒룓룕",
    		7,
    		"룞룠룢",
    		5,
    		"룪룫룭룮룯룱",
    		6,
    		"룺룼룾",
    		5,
    		"뤅",
    		18,
    		"뤙",
    		6,
    		"뤡",
    		26,
    		"뤾뤿륁륂륃륅",
    		6,
    		"륍륎륐륒",
    		5
    	],
    	[
    		"9041",
    		"륚륛륝륞륟륡",
    		6,
    		"륪륬륮",
    		5,
    		"륶륷륹륺륻륽"
    	],
    	[
    		"9061",
    		"륾",
    		5,
    		"릆릈릋릌릏",
    		15
    	],
    	[
    		"9081",
    		"릟",
    		12,
    		"릮릯릱릲릳릵",
    		6,
    		"릾맀맂",
    		5,
    		"맊맋맍맓",
    		4,
    		"맚맜맟맠맢맦맧맩맪맫맭",
    		6,
    		"맶맻",
    		4,
    		"먂",
    		5,
    		"먉",
    		11,
    		"먖",
    		33,
    		"먺먻먽먾먿멁멃멄멅멆"
    	],
    	[
    		"9141",
    		"멇멊멌멏멐멑멒멖멗멙멚멛멝",
    		6,
    		"멦멪",
    		5
    	],
    	[
    		"9161",
    		"멲멳멵멶멷멹",
    		9,
    		"몆몈몉몊몋몍",
    		5
    	],
    	[
    		"9181",
    		"몓",
    		20,
    		"몪몭몮몯몱몳",
    		4,
    		"몺몼몾",
    		5,
    		"뫅뫆뫇뫉",
    		14,
    		"뫚",
    		33,
    		"뫽뫾뫿묁묂묃묅",
    		7,
    		"묎묐묒",
    		5,
    		"묙묚묛묝묞묟묡",
    		6
    	],
    	[
    		"9241",
    		"묨묪묬",
    		7,
    		"묷묹묺묿",
    		4,
    		"뭆뭈뭊뭋뭌뭎뭑뭒"
    	],
    	[
    		"9261",
    		"뭓뭕뭖뭗뭙",
    		7,
    		"뭢뭤",
    		7,
    		"뭭",
    		4
    	],
    	[
    		"9281",
    		"뭲",
    		21,
    		"뮉뮊뮋뮍뮎뮏뮑",
    		18,
    		"뮥뮦뮧뮩뮪뮫뮭",
    		6,
    		"뮵뮶뮸",
    		7,
    		"믁믂믃믅믆믇믉",
    		6,
    		"믑믒믔",
    		35,
    		"믺믻믽믾밁"
    	],
    	[
    		"9341",
    		"밃",
    		4,
    		"밊밎밐밒밓밙밚밠밡밢밣밦밨밪밫밬밮밯밲밳밵"
    	],
    	[
    		"9361",
    		"밶밷밹",
    		6,
    		"뱂뱆뱇뱈뱊뱋뱎뱏뱑",
    		8
    	],
    	[
    		"9381",
    		"뱚뱛뱜뱞",
    		37,
    		"벆벇벉벊벍벏",
    		4,
    		"벖벘벛",
    		4,
    		"벢벣벥벦벩",
    		6,
    		"벲벶",
    		5,
    		"벾벿볁볂볃볅",
    		7,
    		"볎볒볓볔볖볗볙볚볛볝",
    		22,
    		"볷볹볺볻볽"
    	],
    	[
    		"9441",
    		"볾",
    		5,
    		"봆봈봊",
    		5,
    		"봑봒봓봕",
    		8
    	],
    	[
    		"9461",
    		"봞",
    		5,
    		"봥",
    		6,
    		"봭",
    		12
    	],
    	[
    		"9481",
    		"봺",
    		5,
    		"뵁",
    		6,
    		"뵊뵋뵍뵎뵏뵑",
    		6,
    		"뵚",
    		9,
    		"뵥뵦뵧뵩",
    		22,
    		"붂붃붅붆붋",
    		4,
    		"붒붔붖붗붘붛붝",
    		6,
    		"붥",
    		10,
    		"붱",
    		6,
    		"붹",
    		24
    	],
    	[
    		"9541",
    		"뷒뷓뷖뷗뷙뷚뷛뷝",
    		11,
    		"뷪",
    		5,
    		"뷱"
    	],
    	[
    		"9561",
    		"뷲뷳뷵뷶뷷뷹",
    		6,
    		"븁븂븄븆",
    		5,
    		"븎븏븑븒븓"
    	],
    	[
    		"9581",
    		"븕",
    		6,
    		"븞븠",
    		35,
    		"빆빇빉빊빋빍빏",
    		4,
    		"빖빘빜빝빞빟빢빣빥빦빧빩빫",
    		4,
    		"빲빶",
    		4,
    		"빾빿뺁뺂뺃뺅",
    		6,
    		"뺎뺒",
    		5,
    		"뺚",
    		13,
    		"뺩",
    		14
    	],
    	[
    		"9641",
    		"뺸",
    		23,
    		"뻒뻓"
    	],
    	[
    		"9661",
    		"뻕뻖뻙",
    		6,
    		"뻡뻢뻦",
    		5,
    		"뻭",
    		8
    	],
    	[
    		"9681",
    		"뻶",
    		10,
    		"뼂",
    		5,
    		"뼊",
    		13,
    		"뼚뼞",
    		33,
    		"뽂뽃뽅뽆뽇뽉",
    		6,
    		"뽒뽓뽔뽖",
    		44
    	],
    	[
    		"9741",
    		"뾃",
    		16,
    		"뾕",
    		8
    	],
    	[
    		"9761",
    		"뾞",
    		17,
    		"뾱",
    		7
    	],
    	[
    		"9781",
    		"뾹",
    		11,
    		"뿆",
    		5,
    		"뿎뿏뿑뿒뿓뿕",
    		6,
    		"뿝뿞뿠뿢",
    		89,
    		"쀽쀾쀿"
    	],
    	[
    		"9841",
    		"쁀",
    		16,
    		"쁒",
    		5,
    		"쁙쁚쁛"
    	],
    	[
    		"9861",
    		"쁝쁞쁟쁡",
    		6,
    		"쁪",
    		15
    	],
    	[
    		"9881",
    		"쁺",
    		21,
    		"삒삓삕삖삗삙",
    		6,
    		"삢삤삦",
    		5,
    		"삮삱삲삷",
    		4,
    		"삾샂샃샄샆샇샊샋샍샎샏샑",
    		6,
    		"샚샞",
    		5,
    		"샦샧샩샪샫샭",
    		6,
    		"샶샸샺",
    		5,
    		"섁섂섃섅섆섇섉",
    		6,
    		"섑섒섓섔섖",
    		5,
    		"섡섢섥섨섩섪섫섮"
    	],
    	[
    		"9941",
    		"섲섳섴섵섷섺섻섽섾섿셁",
    		6,
    		"셊셎",
    		5,
    		"셖셗"
    	],
    	[
    		"9961",
    		"셙셚셛셝",
    		6,
    		"셦셪",
    		5,
    		"셱셲셳셵셶셷셹셺셻"
    	],
    	[
    		"9981",
    		"셼",
    		8,
    		"솆",
    		5,
    		"솏솑솒솓솕솗",
    		4,
    		"솞솠솢솣솤솦솧솪솫솭솮솯솱",
    		11,
    		"솾",
    		5,
    		"쇅쇆쇇쇉쇊쇋쇍",
    		6,
    		"쇕쇖쇙",
    		6,
    		"쇡쇢쇣쇥쇦쇧쇩",
    		6,
    		"쇲쇴",
    		7,
    		"쇾쇿숁숂숃숅",
    		6,
    		"숎숐숒",
    		5,
    		"숚숛숝숞숡숢숣"
    	],
    	[
    		"9a41",
    		"숤숥숦숧숪숬숮숰숳숵",
    		16
    	],
    	[
    		"9a61",
    		"쉆쉇쉉",
    		6,
    		"쉒쉓쉕쉖쉗쉙",
    		6,
    		"쉡쉢쉣쉤쉦"
    	],
    	[
    		"9a81",
    		"쉧",
    		4,
    		"쉮쉯쉱쉲쉳쉵",
    		6,
    		"쉾슀슂",
    		5,
    		"슊",
    		5,
    		"슑",
    		6,
    		"슙슚슜슞",
    		5,
    		"슦슧슩슪슫슮",
    		5,
    		"슶슸슺",
    		33,
    		"싞싟싡싢싥",
    		5,
    		"싮싰싲싳싴싵싷싺싽싾싿쌁",
    		6,
    		"쌊쌋쌎쌏"
    	],
    	[
    		"9b41",
    		"쌐쌑쌒쌖쌗쌙쌚쌛쌝",
    		6,
    		"쌦쌧쌪",
    		8
    	],
    	[
    		"9b61",
    		"쌳",
    		17,
    		"썆",
    		7
    	],
    	[
    		"9b81",
    		"썎",
    		25,
    		"썪썫썭썮썯썱썳",
    		4,
    		"썺썻썾",
    		5,
    		"쎅쎆쎇쎉쎊쎋쎍",
    		50,
    		"쏁",
    		22,
    		"쏚"
    	],
    	[
    		"9c41",
    		"쏛쏝쏞쏡쏣",
    		4,
    		"쏪쏫쏬쏮",
    		5,
    		"쏶쏷쏹",
    		5
    	],
    	[
    		"9c61",
    		"쏿",
    		8,
    		"쐉",
    		6,
    		"쐑",
    		9
    	],
    	[
    		"9c81",
    		"쐛",
    		8,
    		"쐥",
    		6,
    		"쐭쐮쐯쐱쐲쐳쐵",
    		6,
    		"쐾",
    		9,
    		"쑉",
    		26,
    		"쑦쑧쑩쑪쑫쑭",
    		6,
    		"쑶쑷쑸쑺",
    		5,
    		"쒁",
    		18,
    		"쒕",
    		6,
    		"쒝",
    		12
    	],
    	[
    		"9d41",
    		"쒪",
    		13,
    		"쒹쒺쒻쒽",
    		8
    	],
    	[
    		"9d61",
    		"쓆",
    		25
    	],
    	[
    		"9d81",
    		"쓠",
    		8,
    		"쓪",
    		5,
    		"쓲쓳쓵쓶쓷쓹쓻쓼쓽쓾씂",
    		9,
    		"씍씎씏씑씒씓씕",
    		6,
    		"씝",
    		10,
    		"씪씫씭씮씯씱",
    		6,
    		"씺씼씾",
    		5,
    		"앆앇앋앏앐앑앒앖앚앛앜앟앢앣앥앦앧앩",
    		6,
    		"앲앶",
    		5,
    		"앾앿얁얂얃얅얆얈얉얊얋얎얐얒얓얔"
    	],
    	[
    		"9e41",
    		"얖얙얚얛얝얞얟얡",
    		7,
    		"얪",
    		9,
    		"얶"
    	],
    	[
    		"9e61",
    		"얷얺얿",
    		4,
    		"엋엍엏엒엓엕엖엗엙",
    		6,
    		"엢엤엦엧"
    	],
    	[
    		"9e81",
    		"엨엩엪엫엯엱엲엳엵엸엹엺엻옂옃옄옉옊옋옍옎옏옑",
    		6,
    		"옚옝",
    		6,
    		"옦옧옩옪옫옯옱옲옶옸옺옼옽옾옿왂왃왅왆왇왉",
    		6,
    		"왒왖",
    		5,
    		"왞왟왡",
    		10,
    		"왭왮왰왲",
    		5,
    		"왺왻왽왾왿욁",
    		6,
    		"욊욌욎",
    		5,
    		"욖욗욙욚욛욝",
    		6,
    		"욦"
    	],
    	[
    		"9f41",
    		"욨욪",
    		5,
    		"욲욳욵욶욷욻",
    		4,
    		"웂웄웆",
    		5,
    		"웎"
    	],
    	[
    		"9f61",
    		"웏웑웒웓웕",
    		6,
    		"웞웟웢",
    		5,
    		"웪웫웭웮웯웱웲"
    	],
    	[
    		"9f81",
    		"웳",
    		4,
    		"웺웻웼웾",
    		5,
    		"윆윇윉윊윋윍",
    		6,
    		"윖윘윚",
    		5,
    		"윢윣윥윦윧윩",
    		6,
    		"윲윴윶윸윹윺윻윾윿읁읂읃읅",
    		4,
    		"읋읎읐읙읚읛읝읞읟읡",
    		6,
    		"읩읪읬",
    		7,
    		"읶읷읹읺읻읿잀잁잂잆잋잌잍잏잒잓잕잙잛",
    		4,
    		"잢잧",
    		4,
    		"잮잯잱잲잳잵잶잷"
    	],
    	[
    		"a041",
    		"잸잹잺잻잾쟂",
    		5,
    		"쟊쟋쟍쟏쟑",
    		6,
    		"쟙쟚쟛쟜"
    	],
    	[
    		"a061",
    		"쟞",
    		5,
    		"쟥쟦쟧쟩쟪쟫쟭",
    		13
    	],
    	[
    		"a081",
    		"쟻",
    		4,
    		"젂젃젅젆젇젉젋",
    		4,
    		"젒젔젗",
    		4,
    		"젞젟젡젢젣젥",
    		6,
    		"젮젰젲",
    		5,
    		"젹젺젻젽젾젿졁",
    		6,
    		"졊졋졎",
    		5,
    		"졕",
    		26,
    		"졲졳졵졶졷졹졻",
    		4,
    		"좂좄좈좉좊좎",
    		5,
    		"좕",
    		7,
    		"좞좠좢좣좤"
    	],
    	[
    		"a141",
    		"좥좦좧좩",
    		18,
    		"좾좿죀죁"
    	],
    	[
    		"a161",
    		"죂죃죅죆죇죉죊죋죍",
    		6,
    		"죖죘죚",
    		5,
    		"죢죣죥"
    	],
    	[
    		"a181",
    		"죦",
    		14,
    		"죶",
    		5,
    		"죾죿줁줂줃줇",
    		4,
    		"줎　、。·‥…¨〃­―∥＼∼‘’“”〔〕〈",
    		9,
    		"±×÷≠≤≥∞∴°′″℃Å￠￡￥♂♀∠⊥⌒∂∇≡≒§※☆★○●◎◇◆□■△▲▽▼→←↑↓↔〓≪≫√∽∝∵∫∬∈∋⊆⊇⊂⊃∪∩∧∨￢"
    	],
    	[
    		"a241",
    		"줐줒",
    		5,
    		"줙",
    		18
    	],
    	[
    		"a261",
    		"줭",
    		6,
    		"줵",
    		18
    	],
    	[
    		"a281",
    		"쥈",
    		7,
    		"쥒쥓쥕쥖쥗쥙",
    		6,
    		"쥢쥤",
    		7,
    		"쥭쥮쥯⇒⇔∀∃´～ˇ˘˝˚˙¸˛¡¿ː∮∑∏¤℉‰◁◀▷▶♤♠♡♥♧♣⊙◈▣◐◑▒▤▥▨▧▦▩♨☏☎☜☞¶†‡↕↗↙↖↘♭♩♪♬㉿㈜№㏇™㏂㏘℡€®"
    	],
    	[
    		"a341",
    		"쥱쥲쥳쥵",
    		6,
    		"쥽",
    		10,
    		"즊즋즍즎즏"
    	],
    	[
    		"a361",
    		"즑",
    		6,
    		"즚즜즞",
    		16
    	],
    	[
    		"a381",
    		"즯",
    		16,
    		"짂짃짅짆짉짋",
    		4,
    		"짒짔짗짘짛！",
    		58,
    		"￦］",
    		32,
    		"￣"
    	],
    	[
    		"a441",
    		"짞짟짡짣짥짦짨짩짪짫짮짲",
    		5,
    		"짺짻짽짾짿쨁쨂쨃쨄"
    	],
    	[
    		"a461",
    		"쨅쨆쨇쨊쨎",
    		5,
    		"쨕쨖쨗쨙",
    		12
    	],
    	[
    		"a481",
    		"쨦쨧쨨쨪",
    		28,
    		"ㄱ",
    		93
    	],
    	[
    		"a541",
    		"쩇",
    		4,
    		"쩎쩏쩑쩒쩓쩕",
    		6,
    		"쩞쩢",
    		5,
    		"쩩쩪"
    	],
    	[
    		"a561",
    		"쩫",
    		17,
    		"쩾",
    		5,
    		"쪅쪆"
    	],
    	[
    		"a581",
    		"쪇",
    		16,
    		"쪙",
    		14,
    		"ⅰ",
    		9
    	],
    	[
    		"a5b0",
    		"Ⅰ",
    		9
    	],
    	[
    		"a5c1",
    		"Α",
    		16,
    		"Σ",
    		6
    	],
    	[
    		"a5e1",
    		"α",
    		16,
    		"σ",
    		6
    	],
    	[
    		"a641",
    		"쪨",
    		19,
    		"쪾쪿쫁쫂쫃쫅"
    	],
    	[
    		"a661",
    		"쫆",
    		5,
    		"쫎쫐쫒쫔쫕쫖쫗쫚",
    		5,
    		"쫡",
    		6
    	],
    	[
    		"a681",
    		"쫨쫩쫪쫫쫭",
    		6,
    		"쫵",
    		18,
    		"쬉쬊─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂┒┑┚┙┖┕┎┍┞┟┡┢┦┧┩┪┭┮┱┲┵┶┹┺┽┾╀╁╃",
    		7
    	],
    	[
    		"a741",
    		"쬋",
    		4,
    		"쬑쬒쬓쬕쬖쬗쬙",
    		6,
    		"쬢",
    		7
    	],
    	[
    		"a761",
    		"쬪",
    		22,
    		"쭂쭃쭄"
    	],
    	[
    		"a781",
    		"쭅쭆쭇쭊쭋쭍쭎쭏쭑",
    		6,
    		"쭚쭛쭜쭞",
    		5,
    		"쭥",
    		7,
    		"㎕㎖㎗ℓ㎘㏄㎣㎤㎥㎦㎙",
    		9,
    		"㏊㎍㎎㎏㏏㎈㎉㏈㎧㎨㎰",
    		9,
    		"㎀",
    		4,
    		"㎺",
    		5,
    		"㎐",
    		4,
    		"Ω㏀㏁㎊㎋㎌㏖㏅㎭㎮㎯㏛㎩㎪㎫㎬㏝㏐㏓㏃㏉㏜㏆"
    	],
    	[
    		"a841",
    		"쭭",
    		10,
    		"쭺",
    		14
    	],
    	[
    		"a861",
    		"쮉",
    		18,
    		"쮝",
    		6
    	],
    	[
    		"a881",
    		"쮤",
    		19,
    		"쮹",
    		11,
    		"ÆÐªĦ"
    	],
    	[
    		"a8a6",
    		"Ĳ"
    	],
    	[
    		"a8a8",
    		"ĿŁØŒºÞŦŊ"
    	],
    	[
    		"a8b1",
    		"㉠",
    		27,
    		"ⓐ",
    		25,
    		"①",
    		14,
    		"½⅓⅔¼¾⅛⅜⅝⅞"
    	],
    	[
    		"a941",
    		"쯅",
    		14,
    		"쯕",
    		10
    	],
    	[
    		"a961",
    		"쯠쯡쯢쯣쯥쯦쯨쯪",
    		18
    	],
    	[
    		"a981",
    		"쯽",
    		14,
    		"찎찏찑찒찓찕",
    		6,
    		"찞찟찠찣찤æđðħıĳĸŀłøœßþŧŋŉ㈀",
    		27,
    		"⒜",
    		25,
    		"⑴",
    		14,
    		"¹²³⁴ⁿ₁₂₃₄"
    	],
    	[
    		"aa41",
    		"찥찦찪찫찭찯찱",
    		6,
    		"찺찿",
    		4,
    		"챆챇챉챊챋챍챎"
    	],
    	[
    		"aa61",
    		"챏",
    		4,
    		"챖챚",
    		5,
    		"챡챢챣챥챧챩",
    		6,
    		"챱챲"
    	],
    	[
    		"aa81",
    		"챳챴챶",
    		29,
    		"ぁ",
    		82
    	],
    	[
    		"ab41",
    		"첔첕첖첗첚첛첝첞첟첡",
    		6,
    		"첪첮",
    		5,
    		"첶첷첹"
    	],
    	[
    		"ab61",
    		"첺첻첽",
    		6,
    		"쳆쳈쳊",
    		5,
    		"쳑쳒쳓쳕",
    		5
    	],
    	[
    		"ab81",
    		"쳛",
    		8,
    		"쳥",
    		6,
    		"쳭쳮쳯쳱",
    		12,
    		"ァ",
    		85
    	],
    	[
    		"ac41",
    		"쳾쳿촀촂",
    		5,
    		"촊촋촍촎촏촑",
    		6,
    		"촚촜촞촟촠"
    	],
    	[
    		"ac61",
    		"촡촢촣촥촦촧촩촪촫촭",
    		11,
    		"촺",
    		4
    	],
    	[
    		"ac81",
    		"촿",
    		28,
    		"쵝쵞쵟А",
    		5,
    		"ЁЖ",
    		25
    	],
    	[
    		"acd1",
    		"а",
    		5,
    		"ёж",
    		25
    	],
    	[
    		"ad41",
    		"쵡쵢쵣쵥",
    		6,
    		"쵮쵰쵲",
    		5,
    		"쵹",
    		7
    	],
    	[
    		"ad61",
    		"춁",
    		6,
    		"춉",
    		10,
    		"춖춗춙춚춛춝춞춟"
    	],
    	[
    		"ad81",
    		"춠춡춢춣춦춨춪",
    		5,
    		"춱",
    		18,
    		"췅"
    	],
    	[
    		"ae41",
    		"췆",
    		5,
    		"췍췎췏췑",
    		16
    	],
    	[
    		"ae61",
    		"췢",
    		5,
    		"췩췪췫췭췮췯췱",
    		6,
    		"췺췼췾",
    		4
    	],
    	[
    		"ae81",
    		"츃츅츆츇츉츊츋츍",
    		6,
    		"츕츖츗츘츚",
    		5,
    		"츢츣츥츦츧츩츪츫"
    	],
    	[
    		"af41",
    		"츬츭츮츯츲츴츶",
    		19
    	],
    	[
    		"af61",
    		"칊",
    		13,
    		"칚칛칝칞칢",
    		5,
    		"칪칬"
    	],
    	[
    		"af81",
    		"칮",
    		5,
    		"칶칷칹칺칻칽",
    		6,
    		"캆캈캊",
    		5,
    		"캒캓캕캖캗캙"
    	],
    	[
    		"b041",
    		"캚",
    		5,
    		"캢캦",
    		5,
    		"캮",
    		12
    	],
    	[
    		"b061",
    		"캻",
    		5,
    		"컂",
    		19
    	],
    	[
    		"b081",
    		"컖",
    		13,
    		"컦컧컩컪컭",
    		6,
    		"컶컺",
    		5,
    		"가각간갇갈갉갊감",
    		7,
    		"같",
    		4,
    		"갠갤갬갭갯갰갱갸갹갼걀걋걍걔걘걜거걱건걷걸걺검겁것겄겅겆겉겊겋게겐겔겜겝겟겠겡겨격겪견겯결겸겹겻겼경곁계곈곌곕곗고곡곤곧골곪곬곯곰곱곳공곶과곽관괄괆"
    	],
    	[
    		"b141",
    		"켂켃켅켆켇켉",
    		6,
    		"켒켔켖",
    		5,
    		"켝켞켟켡켢켣"
    	],
    	[
    		"b161",
    		"켥",
    		6,
    		"켮켲",
    		5,
    		"켹",
    		11
    	],
    	[
    		"b181",
    		"콅",
    		14,
    		"콖콗콙콚콛콝",
    		6,
    		"콦콨콪콫콬괌괍괏광괘괜괠괩괬괭괴괵괸괼굄굅굇굉교굔굘굡굣구국군굳굴굵굶굻굼굽굿궁궂궈궉권궐궜궝궤궷귀귁귄귈귐귑귓규균귤그극근귿글긁금급긋긍긔기긱긴긷길긺김깁깃깅깆깊까깍깎깐깔깖깜깝깟깠깡깥깨깩깬깰깸"
    	],
    	[
    		"b241",
    		"콭콮콯콲콳콵콶콷콹",
    		6,
    		"쾁쾂쾃쾄쾆",
    		5,
    		"쾍"
    	],
    	[
    		"b261",
    		"쾎",
    		18,
    		"쾢",
    		5,
    		"쾩"
    	],
    	[
    		"b281",
    		"쾪",
    		5,
    		"쾱",
    		18,
    		"쿅",
    		6,
    		"깹깻깼깽꺄꺅꺌꺼꺽꺾껀껄껌껍껏껐껑께껙껜껨껫껭껴껸껼꼇꼈꼍꼐꼬꼭꼰꼲꼴꼼꼽꼿꽁꽂꽃꽈꽉꽐꽜꽝꽤꽥꽹꾀꾄꾈꾐꾑꾕꾜꾸꾹꾼꿀꿇꿈꿉꿋꿍꿎꿔꿜꿨꿩꿰꿱꿴꿸뀀뀁뀄뀌뀐뀔뀜뀝뀨끄끅끈끊끌끎끓끔끕끗끙"
    	],
    	[
    		"b341",
    		"쿌",
    		19,
    		"쿢쿣쿥쿦쿧쿩"
    	],
    	[
    		"b361",
    		"쿪",
    		5,
    		"쿲쿴쿶",
    		5,
    		"쿽쿾쿿퀁퀂퀃퀅",
    		5
    	],
    	[
    		"b381",
    		"퀋",
    		5,
    		"퀒",
    		5,
    		"퀙",
    		19,
    		"끝끼끽낀낄낌낍낏낑나낙낚난낟날낡낢남납낫",
    		4,
    		"낱낳내낵낸낼냄냅냇냈냉냐냑냔냘냠냥너넉넋넌널넒넓넘넙넛넜넝넣네넥넨넬넴넵넷넸넹녀녁년녈념녑녔녕녘녜녠노녹논놀놂놈놉놋농높놓놔놘놜놨뇌뇐뇔뇜뇝"
    	],
    	[
    		"b441",
    		"퀮",
    		5,
    		"퀶퀷퀹퀺퀻퀽",
    		6,
    		"큆큈큊",
    		5
    	],
    	[
    		"b461",
    		"큑큒큓큕큖큗큙",
    		6,
    		"큡",
    		10,
    		"큮큯"
    	],
    	[
    		"b481",
    		"큱큲큳큵",
    		6,
    		"큾큿킀킂",
    		18,
    		"뇟뇨뇩뇬뇰뇹뇻뇽누눅눈눋눌눔눕눗눙눠눴눼뉘뉜뉠뉨뉩뉴뉵뉼늄늅늉느늑는늘늙늚늠늡늣능늦늪늬늰늴니닉닌닐닒님닙닛닝닢다닥닦단닫",
    		4,
    		"닳담답닷",
    		4,
    		"닿대댁댄댈댐댑댓댔댕댜더덕덖던덛덜덞덟덤덥"
    	],
    	[
    		"b541",
    		"킕",
    		14,
    		"킦킧킩킪킫킭",
    		5
    	],
    	[
    		"b561",
    		"킳킶킸킺",
    		5,
    		"탂탃탅탆탇탊",
    		5,
    		"탒탖",
    		4
    	],
    	[
    		"b581",
    		"탛탞탟탡탢탣탥",
    		6,
    		"탮탲",
    		5,
    		"탹",
    		11,
    		"덧덩덫덮데덱덴델뎀뎁뎃뎄뎅뎌뎐뎔뎠뎡뎨뎬도독돈돋돌돎돐돔돕돗동돛돝돠돤돨돼됐되된될됨됩됫됴두둑둔둘둠둡둣둥둬뒀뒈뒝뒤뒨뒬뒵뒷뒹듀듄듈듐듕드득든듣들듦듬듭듯등듸디딕딘딛딜딤딥딧딨딩딪따딱딴딸"
    	],
    	[
    		"b641",
    		"턅",
    		7,
    		"턎",
    		17
    	],
    	[
    		"b661",
    		"턠",
    		15,
    		"턲턳턵턶턷턹턻턼턽턾"
    	],
    	[
    		"b681",
    		"턿텂텆",
    		5,
    		"텎텏텑텒텓텕",
    		6,
    		"텞텠텢",
    		5,
    		"텩텪텫텭땀땁땃땄땅땋때땍땐땔땜땝땟땠땡떠떡떤떨떪떫떰떱떳떴떵떻떼떽뗀뗄뗌뗍뗏뗐뗑뗘뗬또똑똔똘똥똬똴뙈뙤뙨뚜뚝뚠뚤뚫뚬뚱뛔뛰뛴뛸뜀뜁뜅뜨뜩뜬뜯뜰뜸뜹뜻띄띈띌띔띕띠띤띨띰띱띳띵라락란랄람랍랏랐랑랒랖랗"
    	],
    	[
    		"b741",
    		"텮",
    		13,
    		"텽",
    		6,
    		"톅톆톇톉톊"
    	],
    	[
    		"b761",
    		"톋",
    		20,
    		"톢톣톥톦톧"
    	],
    	[
    		"b781",
    		"톩",
    		6,
    		"톲톴톶톷톸톹톻톽톾톿퇁",
    		14,
    		"래랙랜랠램랩랫랬랭랴략랸럇량러럭런럴럼럽럿렀렁렇레렉렌렐렘렙렛렝려력련렬렴렵렷렸령례롄롑롓로록론롤롬롭롯롱롸롼뢍뢨뢰뢴뢸룀룁룃룅료룐룔룝룟룡루룩룬룰룸룹룻룽뤄뤘뤠뤼뤽륀륄륌륏륑류륙륜률륨륩"
    	],
    	[
    		"b841",
    		"퇐",
    		7,
    		"퇙",
    		17
    	],
    	[
    		"b861",
    		"퇫",
    		8,
    		"퇵퇶퇷퇹",
    		13
    	],
    	[
    		"b881",
    		"툈툊",
    		5,
    		"툑",
    		24,
    		"륫륭르륵른를름릅릇릉릊릍릎리릭린릴림립릿링마막만많",
    		4,
    		"맘맙맛망맞맡맣매맥맨맬맴맵맷맸맹맺먀먁먈먕머먹먼멀멂멈멉멋멍멎멓메멕멘멜멤멥멧멨멩며멱면멸몃몄명몇몌모목몫몬몰몲몸몹못몽뫄뫈뫘뫙뫼"
    	],
    	[
    		"b941",
    		"툪툫툮툯툱툲툳툵",
    		6,
    		"툾퉀퉂",
    		5,
    		"퉉퉊퉋퉌"
    	],
    	[
    		"b961",
    		"퉍",
    		14,
    		"퉝",
    		6,
    		"퉥퉦퉧퉨"
    	],
    	[
    		"b981",
    		"퉩",
    		22,
    		"튂튃튅튆튇튉튊튋튌묀묄묍묏묑묘묜묠묩묫무묵묶문묻물묽묾뭄뭅뭇뭉뭍뭏뭐뭔뭘뭡뭣뭬뮈뮌뮐뮤뮨뮬뮴뮷므믄믈믐믓미믹민믿밀밂밈밉밋밌밍및밑바",
    		4,
    		"받",
    		4,
    		"밤밥밧방밭배백밴밸뱀뱁뱃뱄뱅뱉뱌뱍뱐뱝버벅번벋벌벎범법벗"
    	],
    	[
    		"ba41",
    		"튍튎튏튒튓튔튖",
    		5,
    		"튝튞튟튡튢튣튥",
    		6,
    		"튭"
    	],
    	[
    		"ba61",
    		"튮튯튰튲",
    		5,
    		"튺튻튽튾틁틃",
    		4,
    		"틊틌",
    		5
    	],
    	[
    		"ba81",
    		"틒틓틕틖틗틙틚틛틝",
    		6,
    		"틦",
    		9,
    		"틲틳틵틶틷틹틺벙벚베벡벤벧벨벰벱벳벴벵벼벽변별볍볏볐병볕볘볜보복볶본볼봄봅봇봉봐봔봤봬뵀뵈뵉뵌뵐뵘뵙뵤뵨부북분붇불붉붊붐붑붓붕붙붚붜붤붰붸뷔뷕뷘뷜뷩뷰뷴뷸븀븃븅브븍븐블븜븝븟비빅빈빌빎빔빕빗빙빚빛빠빡빤"
    	],
    	[
    		"bb41",
    		"틻",
    		4,
    		"팂팄팆",
    		5,
    		"팏팑팒팓팕팗",
    		4,
    		"팞팢팣"
    	],
    	[
    		"bb61",
    		"팤팦팧팪팫팭팮팯팱",
    		6,
    		"팺팾",
    		5,
    		"퍆퍇퍈퍉"
    	],
    	[
    		"bb81",
    		"퍊",
    		31,
    		"빨빪빰빱빳빴빵빻빼빽뺀뺄뺌뺍뺏뺐뺑뺘뺙뺨뻐뻑뻔뻗뻘뻠뻣뻤뻥뻬뼁뼈뼉뼘뼙뼛뼜뼝뽀뽁뽄뽈뽐뽑뽕뾔뾰뿅뿌뿍뿐뿔뿜뿟뿡쀼쁑쁘쁜쁠쁨쁩삐삑삔삘삠삡삣삥사삭삯산삳살삵삶삼삽삿샀상샅새색샌샐샘샙샛샜생샤"
    	],
    	[
    		"bc41",
    		"퍪",
    		17,
    		"퍾퍿펁펂펃펅펆펇"
    	],
    	[
    		"bc61",
    		"펈펉펊펋펎펒",
    		5,
    		"펚펛펝펞펟펡",
    		6,
    		"펪펬펮"
    	],
    	[
    		"bc81",
    		"펯",
    		4,
    		"펵펶펷펹펺펻펽",
    		6,
    		"폆폇폊",
    		5,
    		"폑",
    		5,
    		"샥샨샬샴샵샷샹섀섄섈섐섕서",
    		4,
    		"섣설섦섧섬섭섯섰성섶세섹센셀셈셉셋셌셍셔셕션셜셤셥셧셨셩셰셴셸솅소속솎손솔솖솜솝솟송솥솨솩솬솰솽쇄쇈쇌쇔쇗쇘쇠쇤쇨쇰쇱쇳쇼쇽숀숄숌숍숏숑수숙순숟술숨숩숫숭"
    	],
    	[
    		"bd41",
    		"폗폙",
    		7,
    		"폢폤",
    		7,
    		"폮폯폱폲폳폵폶폷"
    	],
    	[
    		"bd61",
    		"폸폹폺폻폾퐀퐂",
    		5,
    		"퐉",
    		13
    	],
    	[
    		"bd81",
    		"퐗",
    		5,
    		"퐞",
    		25,
    		"숯숱숲숴쉈쉐쉑쉔쉘쉠쉥쉬쉭쉰쉴쉼쉽쉿슁슈슉슐슘슛슝스슥슨슬슭슴습슷승시식신싣실싫심십싯싱싶싸싹싻싼쌀쌈쌉쌌쌍쌓쌔쌕쌘쌜쌤쌥쌨쌩썅써썩썬썰썲썸썹썼썽쎄쎈쎌쏀쏘쏙쏜쏟쏠쏢쏨쏩쏭쏴쏵쏸쐈쐐쐤쐬쐰"
    	],
    	[
    		"be41",
    		"퐸",
    		7,
    		"푁푂푃푅",
    		14
    	],
    	[
    		"be61",
    		"푔",
    		7,
    		"푝푞푟푡푢푣푥",
    		7,
    		"푮푰푱푲"
    	],
    	[
    		"be81",
    		"푳",
    		4,
    		"푺푻푽푾풁풃",
    		4,
    		"풊풌풎",
    		5,
    		"풕",
    		8,
    		"쐴쐼쐽쑈쑤쑥쑨쑬쑴쑵쑹쒀쒔쒜쒸쒼쓩쓰쓱쓴쓸쓺쓿씀씁씌씐씔씜씨씩씬씰씸씹씻씽아악안앉않알앍앎앓암압앗았앙앝앞애액앤앨앰앱앳앴앵야약얀얄얇얌얍얏양얕얗얘얜얠얩어억언얹얻얼얽얾엄",
    		6,
    		"엌엎"
    	],
    	[
    		"bf41",
    		"풞",
    		10,
    		"풪",
    		14
    	],
    	[
    		"bf61",
    		"풹",
    		18,
    		"퓍퓎퓏퓑퓒퓓퓕"
    	],
    	[
    		"bf81",
    		"퓖",
    		5,
    		"퓝퓞퓠",
    		7,
    		"퓩퓪퓫퓭퓮퓯퓱",
    		6,
    		"퓹퓺퓼에엑엔엘엠엡엣엥여역엮연열엶엷염",
    		5,
    		"옅옆옇예옌옐옘옙옛옜오옥온올옭옮옰옳옴옵옷옹옻와왁완왈왐왑왓왔왕왜왝왠왬왯왱외왹왼욀욈욉욋욍요욕욘욜욤욥욧용우욱운울욹욺움웁웃웅워웍원월웜웝웠웡웨"
    	],
    	[
    		"c041",
    		"퓾",
    		5,
    		"픅픆픇픉픊픋픍",
    		6,
    		"픖픘",
    		5
    	],
    	[
    		"c061",
    		"픞",
    		25
    	],
    	[
    		"c081",
    		"픸픹픺픻픾픿핁핂핃핅",
    		6,
    		"핎핐핒",
    		5,
    		"핚핛핝핞핟핡핢핣웩웬웰웸웹웽위윅윈윌윔윕윗윙유육윤율윰윱윳융윷으윽은을읊음읍읏응",
    		7,
    		"읜읠읨읫이익인일읽읾잃임입잇있잉잊잎자작잔잖잗잘잚잠잡잣잤장잦재잭잰잴잼잽잿쟀쟁쟈쟉쟌쟎쟐쟘쟝쟤쟨쟬저적전절젊"
    	],
    	[
    		"c141",
    		"핤핦핧핪핬핮",
    		5,
    		"핶핷핹핺핻핽",
    		6,
    		"햆햊햋"
    	],
    	[
    		"c161",
    		"햌햍햎햏햑",
    		19,
    		"햦햧"
    	],
    	[
    		"c181",
    		"햨",
    		31,
    		"점접젓정젖제젝젠젤젬젭젯젱져젼졀졈졉졌졍졔조족존졸졺좀좁좃종좆좇좋좌좍좔좝좟좡좨좼좽죄죈죌죔죕죗죙죠죡죤죵주죽준줄줅줆줌줍줏중줘줬줴쥐쥑쥔쥘쥠쥡쥣쥬쥰쥴쥼즈즉즌즐즘즙즛증지직진짇질짊짐집짓"
    	],
    	[
    		"c241",
    		"헊헋헍헎헏헑헓",
    		4,
    		"헚헜헞",
    		5,
    		"헦헧헩헪헫헭헮"
    	],
    	[
    		"c261",
    		"헯",
    		4,
    		"헶헸헺",
    		5,
    		"혂혃혅혆혇혉",
    		6,
    		"혒"
    	],
    	[
    		"c281",
    		"혖",
    		5,
    		"혝혞혟혡혢혣혥",
    		7,
    		"혮",
    		9,
    		"혺혻징짖짙짚짜짝짠짢짤짧짬짭짯짰짱째짹짼쨀쨈쨉쨋쨌쨍쨔쨘쨩쩌쩍쩐쩔쩜쩝쩟쩠쩡쩨쩽쪄쪘쪼쪽쫀쫄쫌쫍쫏쫑쫓쫘쫙쫠쫬쫴쬈쬐쬔쬘쬠쬡쭁쭈쭉쭌쭐쭘쭙쭝쭤쭸쭹쮜쮸쯔쯤쯧쯩찌찍찐찔찜찝찡찢찧차착찬찮찰참찹찻"
    	],
    	[
    		"c341",
    		"혽혾혿홁홂홃홄홆홇홊홌홎홏홐홒홓홖홗홙홚홛홝",
    		4
    	],
    	[
    		"c361",
    		"홢",
    		4,
    		"홨홪",
    		5,
    		"홲홳홵",
    		11
    	],
    	[
    		"c381",
    		"횁횂횄횆",
    		5,
    		"횎횏횑횒횓횕",
    		7,
    		"횞횠횢",
    		5,
    		"횩횪찼창찾채책챈챌챔챕챗챘챙챠챤챦챨챰챵처척천철첨첩첫첬청체첵첸첼쳄쳅쳇쳉쳐쳔쳤쳬쳰촁초촉촌촐촘촙촛총촤촨촬촹최쵠쵤쵬쵭쵯쵱쵸춈추축춘출춤춥춧충춰췄췌췐취췬췰췸췹췻췽츄츈츌츔츙츠측츤츨츰츱츳층"
    	],
    	[
    		"c441",
    		"횫횭횮횯횱",
    		7,
    		"횺횼",
    		7,
    		"훆훇훉훊훋"
    	],
    	[
    		"c461",
    		"훍훎훏훐훒훓훕훖훘훚",
    		5,
    		"훡훢훣훥훦훧훩",
    		4
    	],
    	[
    		"c481",
    		"훮훯훱훲훳훴훶",
    		5,
    		"훾훿휁휂휃휅",
    		11,
    		"휒휓휔치칙친칟칠칡침칩칫칭카칵칸칼캄캅캇캉캐캑캔캘캠캡캣캤캥캬캭컁커컥컨컫컬컴컵컷컸컹케켁켄켈켐켑켓켕켜켠켤켬켭켯켰켱켸코콕콘콜콤콥콧콩콰콱콴콸쾀쾅쾌쾡쾨쾰쿄쿠쿡쿤쿨쿰쿱쿳쿵쿼퀀퀄퀑퀘퀭퀴퀵퀸퀼"
    	],
    	[
    		"c541",
    		"휕휖휗휚휛휝휞휟휡",
    		6,
    		"휪휬휮",
    		5,
    		"휶휷휹"
    	],
    	[
    		"c561",
    		"휺휻휽",
    		6,
    		"흅흆흈흊",
    		5,
    		"흒흓흕흚",
    		4
    	],
    	[
    		"c581",
    		"흟흢흤흦흧흨흪흫흭흮흯흱흲흳흵",
    		6,
    		"흾흿힀힂",
    		5,
    		"힊힋큄큅큇큉큐큔큘큠크큭큰클큼큽킁키킥킨킬킴킵킷킹타탁탄탈탉탐탑탓탔탕태택탠탤탬탭탯탰탱탸턍터턱턴털턺텀텁텃텄텅테텍텐텔템텝텟텡텨텬텼톄톈토톡톤톨톰톱톳통톺톼퇀퇘퇴퇸툇툉툐투툭툰툴툼툽툿퉁퉈퉜"
    	],
    	[
    		"c641",
    		"힍힎힏힑",
    		6,
    		"힚힜힞",
    		5
    	],
    	[
    		"c6a1",
    		"퉤튀튁튄튈튐튑튕튜튠튤튬튱트특튼튿틀틂틈틉틋틔틘틜틤틥티틱틴틸팀팁팃팅파팍팎판팔팖팜팝팟팠팡팥패팩팬팰팸팹팻팼팽퍄퍅퍼퍽펀펄펌펍펏펐펑페펙펜펠펨펩펫펭펴편펼폄폅폈평폐폘폡폣포폭폰폴폼폽폿퐁"
    	],
    	[
    		"c7a1",
    		"퐈퐝푀푄표푠푤푭푯푸푹푼푿풀풂품풉풋풍풔풩퓌퓐퓔퓜퓟퓨퓬퓰퓸퓻퓽프픈플픔픕픗피픽핀필핌핍핏핑하학한할핥함합핫항해핵핸핼햄햅햇했행햐향허헉헌헐헒험헙헛헝헤헥헨헬헴헵헷헹혀혁현혈혐협혓혔형혜혠"
    	],
    	[
    		"c8a1",
    		"혤혭호혹혼홀홅홈홉홋홍홑화확환활홧황홰홱홴횃횅회획횐횔횝횟횡효횬횰횹횻후훅훈훌훑훔훗훙훠훤훨훰훵훼훽휀휄휑휘휙휜휠휨휩휫휭휴휵휸휼흄흇흉흐흑흔흖흗흘흙흠흡흣흥흩희흰흴흼흽힁히힉힌힐힘힙힛힝"
    	],
    	[
    		"caa1",
    		"伽佳假價加可呵哥嘉嫁家暇架枷柯歌珂痂稼苛茄街袈訶賈跏軻迦駕刻却各恪慤殼珏脚覺角閣侃刊墾奸姦干幹懇揀杆柬桿澗癎看磵稈竿簡肝艮艱諫間乫喝曷渴碣竭葛褐蝎鞨勘坎堪嵌感憾戡敢柑橄減甘疳監瞰紺邯鑑鑒龕"
    	],
    	[
    		"cba1",
    		"匣岬甲胛鉀閘剛堈姜岡崗康强彊慷江畺疆糠絳綱羌腔舡薑襁講鋼降鱇介价個凱塏愷愾慨改槪漑疥皆盖箇芥蓋豈鎧開喀客坑更粳羹醵倨去居巨拒据據擧渠炬祛距踞車遽鉅鋸乾件健巾建愆楗腱虔蹇鍵騫乞傑杰桀儉劍劒檢"
    	],
    	[
    		"cca1",
    		"瞼鈐黔劫怯迲偈憩揭擊格檄激膈覡隔堅牽犬甄絹繭肩見譴遣鵑抉決潔結缺訣兼慊箝謙鉗鎌京俓倞傾儆勁勍卿坰境庚徑慶憬擎敬景暻更梗涇炅烱璟璥瓊痙硬磬竟競絅經耕耿脛莖警輕逕鏡頃頸驚鯨係啓堺契季屆悸戒桂械"
    	],
    	[
    		"cda1",
    		"棨溪界癸磎稽系繫繼計誡谿階鷄古叩告呱固姑孤尻庫拷攷故敲暠枯槁沽痼皐睾稿羔考股膏苦苽菰藁蠱袴誥賈辜錮雇顧高鼓哭斛曲梏穀谷鵠困坤崑昆梱棍滾琨袞鯤汨滑骨供公共功孔工恐恭拱控攻珙空蚣貢鞏串寡戈果瓜"
    	],
    	[
    		"cea1",
    		"科菓誇課跨過鍋顆廓槨藿郭串冠官寬慣棺款灌琯瓘管罐菅觀貫關館刮恝括适侊光匡壙廣曠洸炚狂珖筐胱鑛卦掛罫乖傀塊壞怪愧拐槐魁宏紘肱轟交僑咬喬嬌嶠巧攪敎校橋狡皎矯絞翹膠蕎蛟較轎郊餃驕鮫丘久九仇俱具勾"
    	],
    	[
    		"cfa1",
    		"區口句咎嘔坵垢寇嶇廐懼拘救枸柩構歐毆毬求溝灸狗玖球瞿矩究絿耉臼舅舊苟衢謳購軀逑邱鉤銶駒驅鳩鷗龜國局菊鞠鞫麴君窘群裙軍郡堀屈掘窟宮弓穹窮芎躬倦券勸卷圈拳捲權淃眷厥獗蕨蹶闕机櫃潰詭軌饋句晷歸貴"
    	],
    	[
    		"d0a1",
    		"鬼龜叫圭奎揆槻珪硅窺竅糾葵規赳逵閨勻均畇筠菌鈞龜橘克剋劇戟棘極隙僅劤勤懃斤根槿瑾筋芹菫覲謹近饉契今妗擒昑檎琴禁禽芩衾衿襟金錦伋及急扱汲級給亘兢矜肯企伎其冀嗜器圻基埼夔奇妓寄岐崎己幾忌技旗旣"
    	],
    	[
    		"d1a1",
    		"朞期杞棋棄機欺氣汽沂淇玘琦琪璂璣畸畿碁磯祁祇祈祺箕紀綺羈耆耭肌記譏豈起錡錤飢饑騎騏驥麒緊佶吉拮桔金喫儺喇奈娜懦懶拏拿癩",
    		5,
    		"那樂",
    		4,
    		"諾酪駱亂卵暖欄煖爛蘭難鸞捏捺南嵐枏楠湳濫男藍襤拉"
    	],
    	[
    		"d2a1",
    		"納臘蠟衲囊娘廊",
    		4,
    		"乃來內奈柰耐冷女年撚秊念恬拈捻寧寗努勞奴弩怒擄櫓爐瑙盧",
    		5,
    		"駑魯",
    		10,
    		"濃籠聾膿農惱牢磊腦賂雷尿壘",
    		7,
    		"嫩訥杻紐勒",
    		5,
    		"能菱陵尼泥匿溺多茶"
    	],
    	[
    		"d3a1",
    		"丹亶但單團壇彖斷旦檀段湍短端簞緞蛋袒鄲鍛撻澾獺疸達啖坍憺擔曇淡湛潭澹痰聃膽蕁覃談譚錟沓畓答踏遝唐堂塘幢戇撞棠當糖螳黨代垈坮大對岱帶待戴擡玳臺袋貸隊黛宅德悳倒刀到圖堵塗導屠島嶋度徒悼挑掉搗桃"
    	],
    	[
    		"d4a1",
    		"棹櫂淘渡滔濤燾盜睹禱稻萄覩賭跳蹈逃途道都鍍陶韜毒瀆牘犢獨督禿篤纛讀墩惇敦旽暾沌焞燉豚頓乭突仝冬凍動同憧東桐棟洞潼疼瞳童胴董銅兜斗杜枓痘竇荳讀豆逗頭屯臀芚遁遯鈍得嶝橙燈登等藤謄鄧騰喇懶拏癩羅"
    	],
    	[
    		"d5a1",
    		"蘿螺裸邏樂洛烙珞絡落諾酪駱丹亂卵欄欒瀾爛蘭鸞剌辣嵐擥攬欖濫籃纜藍襤覽拉臘蠟廊朗浪狼琅瑯螂郞來崍徠萊冷掠略亮倆兩凉梁樑粮粱糧良諒輛量侶儷勵呂廬慮戾旅櫚濾礪藜蠣閭驢驪麗黎力曆歷瀝礫轢靂憐戀攣漣"
    	],
    	[
    		"d6a1",
    		"煉璉練聯蓮輦連鍊冽列劣洌烈裂廉斂殮濂簾獵令伶囹寧岺嶺怜玲笭羚翎聆逞鈴零靈領齡例澧禮醴隷勞怒撈擄櫓潞瀘爐盧老蘆虜路輅露魯鷺鹵碌祿綠菉錄鹿麓論壟弄朧瀧瓏籠聾儡瀨牢磊賂賚賴雷了僚寮廖料燎療瞭聊蓼"
    	],
    	[
    		"d7a1",
    		"遼鬧龍壘婁屢樓淚漏瘻累縷蔞褸鏤陋劉旒柳榴流溜瀏琉瑠留瘤硫謬類六戮陸侖倫崙淪綸輪律慄栗率隆勒肋凜凌楞稜綾菱陵俚利厘吏唎履悧李梨浬犁狸理璃異痢籬罹羸莉裏裡里釐離鯉吝潾燐璘藺躪隣鱗麟林淋琳臨霖砬"
    	],
    	[
    		"d8a1",
    		"立笠粒摩瑪痲碼磨馬魔麻寞幕漠膜莫邈万卍娩巒彎慢挽晩曼滿漫灣瞞萬蔓蠻輓饅鰻唜抹末沫茉襪靺亡妄忘忙望網罔芒茫莽輞邙埋妹媒寐昧枚梅每煤罵買賣邁魅脈貊陌驀麥孟氓猛盲盟萌冪覓免冕勉棉沔眄眠綿緬面麵滅"
    	],
    	[
    		"d9a1",
    		"蔑冥名命明暝椧溟皿瞑茗蓂螟酩銘鳴袂侮冒募姆帽慕摸摹暮某模母毛牟牡瑁眸矛耗芼茅謀謨貌木沐牧目睦穆鶩歿沒夢朦蒙卯墓妙廟描昴杳渺猫竗苗錨務巫憮懋戊拇撫无楙武毋無珷畝繆舞茂蕪誣貿霧鵡墨默們刎吻問文"
    	],
    	[
    		"daa1",
    		"汶紊紋聞蚊門雯勿沕物味媚尾嵋彌微未梶楣渼湄眉米美薇謎迷靡黴岷悶愍憫敏旻旼民泯玟珉緡閔密蜜謐剝博拍搏撲朴樸泊珀璞箔粕縛膊舶薄迫雹駁伴半反叛拌搬攀斑槃泮潘班畔瘢盤盼磐磻礬絆般蟠返頒飯勃拔撥渤潑"
    	],
    	[
    		"dba1",
    		"發跋醱鉢髮魃倣傍坊妨尨幇彷房放方旁昉枋榜滂磅紡肪膀舫芳蒡蚌訪謗邦防龐倍俳北培徘拜排杯湃焙盃背胚裴裵褙賠輩配陪伯佰帛柏栢白百魄幡樊煩燔番磻繁蕃藩飜伐筏罰閥凡帆梵氾汎泛犯範范法琺僻劈壁擘檗璧癖"
    	],
    	[
    		"dca1",
    		"碧蘗闢霹便卞弁變辨辯邊別瞥鱉鼈丙倂兵屛幷昞昺柄棅炳甁病秉竝輧餠騈保堡報寶普步洑湺潽珤甫菩補褓譜輔伏僕匐卜宓復服福腹茯蔔複覆輹輻馥鰒本乶俸奉封峯峰捧棒烽熢琫縫蓬蜂逢鋒鳳不付俯傅剖副否咐埠夫婦"
    	],
    	[
    		"dda1",
    		"孚孵富府復扶敷斧浮溥父符簿缶腐腑膚艀芙莩訃負賦賻赴趺部釜阜附駙鳧北分吩噴墳奔奮忿憤扮昐汾焚盆粉糞紛芬賁雰不佛弗彿拂崩朋棚硼繃鵬丕備匕匪卑妃婢庇悲憊扉批斐枇榧比毖毗毘沸泌琵痺砒碑秕秘粃緋翡肥"
    	],
    	[
    		"dea1",
    		"脾臂菲蜚裨誹譬費鄙非飛鼻嚬嬪彬斌檳殯浜濱瀕牝玭貧賓頻憑氷聘騁乍事些仕伺似使俟僿史司唆嗣四士奢娑寫寺射巳師徙思捨斜斯柶査梭死沙泗渣瀉獅砂社祀祠私篩紗絲肆舍莎蓑蛇裟詐詞謝賜赦辭邪飼駟麝削數朔索"
    	],
    	[
    		"dfa1",
    		"傘刪山散汕珊産疝算蒜酸霰乷撒殺煞薩三參杉森渗芟蔘衫揷澁鈒颯上傷像償商喪嘗孀尙峠常床庠廂想桑橡湘爽牀狀相祥箱翔裳觴詳象賞霜塞璽賽嗇塞穡索色牲生甥省笙墅壻嶼序庶徐恕抒捿敍暑曙書栖棲犀瑞筮絮緖署"
    	],
    	[
    		"e0a1",
    		"胥舒薯西誓逝鋤黍鼠夕奭席惜昔晳析汐淅潟石碩蓆釋錫仙僊先善嬋宣扇敾旋渲煽琁瑄璇璿癬禪線繕羨腺膳船蘚蟬詵跣選銑鐥饍鮮卨屑楔泄洩渫舌薛褻設說雪齧剡暹殲纖蟾贍閃陝攝涉燮葉城姓宬性惺成星晟猩珹盛省筬"
    	],
    	[
    		"e1a1",
    		"聖聲腥誠醒世勢歲洗稅笹細說貰召嘯塑宵小少巢所掃搔昭梳沼消溯瀟炤燒甦疏疎瘙笑篠簫素紹蔬蕭蘇訴逍遡邵銷韶騷俗屬束涑粟續謖贖速孫巽損蓀遜飡率宋悚松淞訟誦送頌刷殺灑碎鎖衰釗修受嗽囚垂壽嫂守岫峀帥愁"
    	],
    	[
    		"e2a1",
    		"戍手授搜收數樹殊水洙漱燧狩獸琇璲瘦睡秀穗竪粹綏綬繡羞脩茱蒐蓚藪袖誰讐輸遂邃酬銖銹隋隧隨雖需須首髓鬚叔塾夙孰宿淑潚熟琡璹肅菽巡徇循恂旬栒楯橓殉洵淳珣盾瞬筍純脣舜荀蓴蕣詢諄醇錞順馴戌術述鉥崇崧"
    	],
    	[
    		"e3a1",
    		"嵩瑟膝蝨濕拾習褶襲丞乘僧勝升承昇繩蠅陞侍匙嘶始媤尸屎屍市弑恃施是時枾柴猜矢示翅蒔蓍視試詩諡豕豺埴寔式息拭植殖湜熄篒蝕識軾食飾伸侁信呻娠宸愼新晨燼申神紳腎臣莘薪藎蜃訊身辛辰迅失室實悉審尋心沁"
    	],
    	[
    		"e4a1",
    		"沈深瀋甚芯諶什十拾雙氏亞俄兒啞娥峨我牙芽莪蛾衙訝阿雅餓鴉鵝堊岳嶽幄惡愕握樂渥鄂鍔顎鰐齷安岸按晏案眼雁鞍顔鮟斡謁軋閼唵岩巖庵暗癌菴闇壓押狎鴨仰央怏昻殃秧鴦厓哀埃崖愛曖涯碍艾隘靄厄扼掖液縊腋額"
    	],
    	[
    		"e5a1",
    		"櫻罌鶯鸚也倻冶夜惹揶椰爺耶若野弱掠略約若葯蒻藥躍亮佯兩凉壤孃恙揚攘敭暘梁楊樣洋瀁煬痒瘍禳穰糧羊良襄諒讓釀陽量養圄御於漁瘀禦語馭魚齬億憶抑檍臆偃堰彦焉言諺孼蘖俺儼嚴奄掩淹嶪業円予余勵呂女如廬"
    	],
    	[
    		"e6a1",
    		"旅歟汝濾璵礖礪與艅茹輿轝閭餘驪麗黎亦力域役易曆歷疫繹譯轢逆驛嚥堧姸娟宴年延憐戀捐挻撚椽沇沿涎涓淵演漣烟然煙煉燃燕璉硏硯秊筵緣練縯聯衍軟輦蓮連鉛鍊鳶列劣咽悅涅烈熱裂說閱厭廉念捻染殮炎焰琰艶苒"
    	],
    	[
    		"e7a1",
    		"簾閻髥鹽曄獵燁葉令囹塋寧嶺嶸影怜映暎楹榮永泳渶潁濚瀛瀯煐營獰玲瑛瑩瓔盈穎纓羚聆英詠迎鈴鍈零霙靈領乂倪例刈叡曳汭濊猊睿穢芮藝蘂禮裔詣譽豫醴銳隸霓預五伍俉傲午吾吳嗚塢墺奧娛寤悟惡懊敖旿晤梧汚澳"
    	],
    	[
    		"e8a1",
    		"烏熬獒筽蜈誤鰲鼇屋沃獄玉鈺溫瑥瘟穩縕蘊兀壅擁瓮甕癰翁邕雍饔渦瓦窩窪臥蛙蝸訛婉完宛梡椀浣玩琓琬碗緩翫脘腕莞豌阮頑曰往旺枉汪王倭娃歪矮外嵬巍猥畏了僚僥凹堯夭妖姚寥寮尿嶢拗搖撓擾料曜樂橈燎燿瑤療"
    	],
    	[
    		"e9a1",
    		"窈窯繇繞耀腰蓼蟯要謠遙遼邀饒慾欲浴縟褥辱俑傭冗勇埇墉容庸慂榕涌湧溶熔瑢用甬聳茸蓉踊鎔鏞龍于佑偶優又友右宇寓尤愚憂旴牛玗瑀盂祐禑禹紆羽芋藕虞迂遇郵釪隅雨雩勖彧旭昱栯煜稶郁頊云暈橒殞澐熉耘芸蕓"
    	],
    	[
    		"eaa1",
    		"運隕雲韻蔚鬱亐熊雄元原員圓園垣媛嫄寃怨愿援沅洹湲源爰猿瑗苑袁轅遠阮院願鴛月越鉞位偉僞危圍委威尉慰暐渭爲瑋緯胃萎葦蔿蝟衛褘謂違韋魏乳侑儒兪劉唯喩孺宥幼幽庾悠惟愈愉揄攸有杻柔柚柳楡楢油洧流游溜"
    	],
    	[
    		"eba1",
    		"濡猶猷琉瑜由留癒硫紐維臾萸裕誘諛諭踰蹂遊逾遺酉釉鍮類六堉戮毓肉育陸倫允奫尹崙淪潤玧胤贇輪鈗閏律慄栗率聿戎瀜絨融隆垠恩慇殷誾銀隱乙吟淫蔭陰音飮揖泣邑凝應膺鷹依倚儀宜意懿擬椅毅疑矣義艤薏蟻衣誼"
    	],
    	[
    		"eca1",
    		"議醫二以伊利吏夷姨履已弛彛怡易李梨泥爾珥理異痍痢移罹而耳肄苡荑裏裡貽貳邇里離飴餌匿溺瀷益翊翌翼謚人仁刃印吝咽因姻寅引忍湮燐璘絪茵藺蚓認隣靭靷鱗麟一佚佾壹日溢逸鎰馹任壬妊姙恁林淋稔臨荏賃入卄"
    	],
    	[
    		"eda1",
    		"立笠粒仍剩孕芿仔刺咨姉姿子字孜恣慈滋炙煮玆瓷疵磁紫者自茨蔗藉諮資雌作勺嚼斫昨灼炸爵綽芍酌雀鵲孱棧殘潺盞岑暫潛箴簪蠶雜丈仗匠場墻壯奬將帳庄張掌暲杖樟檣欌漿牆狀獐璋章粧腸臟臧莊葬蔣薔藏裝贓醬長"
    	],
    	[
    		"eea1",
    		"障再哉在宰才材栽梓渽滓災縡裁財載齋齎爭箏諍錚佇低儲咀姐底抵杵楮樗沮渚狙猪疽箸紵苧菹著藷詛貯躇這邸雎齟勣吊嫡寂摘敵滴狄炙的積笛籍績翟荻謫賊赤跡蹟迪迹適鏑佃佺傳全典前剪塡塼奠專展廛悛戰栓殿氈澱"
    	],
    	[
    		"efa1",
    		"煎琠田甸畑癲筌箋箭篆纏詮輾轉鈿銓錢鐫電顚顫餞切截折浙癤竊節絶占岾店漸点粘霑鮎點接摺蝶丁井亭停偵呈姃定幀庭廷征情挺政整旌晶晸柾楨檉正汀淀淨渟湞瀞炡玎珽町睛碇禎程穽精綎艇訂諪貞鄭酊釘鉦鋌錠霆靖"
    	],
    	[
    		"f0a1",
    		"靜頂鼎制劑啼堤帝弟悌提梯濟祭第臍薺製諸蹄醍除際霽題齊俎兆凋助嘲弔彫措操早晁曺曹朝條棗槽漕潮照燥爪璪眺祖祚租稠窕粗糟組繰肇藻蚤詔調趙躁造遭釣阻雕鳥族簇足鏃存尊卒拙猝倧宗從悰慫棕淙琮種終綜縱腫"
    	],
    	[
    		"f1a1",
    		"踪踵鍾鐘佐坐左座挫罪主住侏做姝胄呪周嗾奏宙州廚晝朱柱株注洲湊澍炷珠疇籌紂紬綢舟蛛註誅走躊輳週酎酒鑄駐竹粥俊儁准埈寯峻晙樽浚準濬焌畯竣蠢逡遵雋駿茁中仲衆重卽櫛楫汁葺增憎曾拯烝甑症繒蒸證贈之只"
    	],
    	[
    		"f2a1",
    		"咫地址志持指摯支旨智枝枳止池沚漬知砥祉祗紙肢脂至芝芷蜘誌識贄趾遲直稙稷織職唇嗔塵振搢晉晋桭榛殄津溱珍瑨璡畛疹盡眞瞋秦縉縝臻蔯袗診賑軫辰進鎭陣陳震侄叱姪嫉帙桎瓆疾秩窒膣蛭質跌迭斟朕什執潗緝輯"
    	],
    	[
    		"f3a1",
    		"鏶集徵懲澄且侘借叉嗟嵯差次此磋箚茶蹉車遮捉搾着窄錯鑿齪撰澯燦璨瓚竄簒纂粲纘讚贊鑽餐饌刹察擦札紮僭參塹慘慙懺斬站讒讖倉倡創唱娼廠彰愴敞昌昶暢槍滄漲猖瘡窓脹艙菖蒼債埰寀寨彩採砦綵菜蔡采釵冊柵策"
    	],
    	[
    		"f4a1",
    		"責凄妻悽處倜刺剔尺慽戚拓擲斥滌瘠脊蹠陟隻仟千喘天川擅泉淺玔穿舛薦賤踐遷釧闡阡韆凸哲喆徹撤澈綴輟轍鐵僉尖沾添甛瞻簽籤詹諂堞妾帖捷牒疊睫諜貼輒廳晴淸聽菁請靑鯖切剃替涕滯締諦逮遞體初剿哨憔抄招梢"
    	],
    	[
    		"f5a1",
    		"椒楚樵炒焦硝礁礎秒稍肖艸苕草蕉貂超酢醋醮促囑燭矗蜀觸寸忖村邨叢塚寵悤憁摠總聰蔥銃撮催崔最墜抽推椎楸樞湫皺秋芻萩諏趨追鄒酋醜錐錘鎚雛騶鰍丑畜祝竺筑築縮蓄蹙蹴軸逐春椿瑃出朮黜充忠沖蟲衝衷悴膵萃"
    	],
    	[
    		"f6a1",
    		"贅取吹嘴娶就炊翠聚脆臭趣醉驟鷲側仄厠惻測層侈値嗤峙幟恥梔治淄熾痔痴癡稚穉緇緻置致蚩輜雉馳齒則勅飭親七柒漆侵寢枕沈浸琛砧針鍼蟄秤稱快他咤唾墮妥惰打拖朶楕舵陀馱駝倬卓啄坼度托拓擢晫柝濁濯琢琸託"
    	],
    	[
    		"f7a1",
    		"鐸呑嘆坦彈憚歎灘炭綻誕奪脫探眈耽貪塔搭榻宕帑湯糖蕩兌台太怠態殆汰泰笞胎苔跆邰颱宅擇澤撑攄兎吐土討慟桶洞痛筒統通堆槌腿褪退頹偸套妬投透鬪慝特闖坡婆巴把播擺杷波派爬琶破罷芭跛頗判坂板版瓣販辦鈑"
    	],
    	[
    		"f8a1",
    		"阪八叭捌佩唄悖敗沛浿牌狽稗覇貝彭澎烹膨愎便偏扁片篇編翩遍鞭騙貶坪平枰萍評吠嬖幣廢弊斃肺蔽閉陛佈包匍匏咆哺圃布怖抛抱捕暴泡浦疱砲胞脯苞葡蒲袍褒逋鋪飽鮑幅暴曝瀑爆輻俵剽彪慓杓標漂瓢票表豹飇飄驃"
    	],
    	[
    		"f9a1",
    		"品稟楓諷豊風馮彼披疲皮被避陂匹弼必泌珌畢疋筆苾馝乏逼下何厦夏廈昰河瑕荷蝦賀遐霞鰕壑學虐謔鶴寒恨悍旱汗漢澣瀚罕翰閑閒限韓割轄函含咸啣喊檻涵緘艦銜陷鹹合哈盒蛤閤闔陜亢伉姮嫦巷恒抗杭桁沆港缸肛航"
    	],
    	[
    		"faa1",
    		"行降項亥偕咳垓奚孩害懈楷海瀣蟹解該諧邂駭骸劾核倖幸杏荇行享向嚮珦鄕響餉饗香噓墟虛許憲櫶獻軒歇險驗奕爀赫革俔峴弦懸晛泫炫玄玹現眩睍絃絢縣舷衒見賢鉉顯孑穴血頁嫌俠協夾峽挾浹狹脅脇莢鋏頰亨兄刑型"
    	],
    	[
    		"fba1",
    		"形泂滎瀅灐炯熒珩瑩荊螢衡逈邢鎣馨兮彗惠慧暳蕙蹊醯鞋乎互呼壕壺好岵弧戶扈昊晧毫浩淏湖滸澔濠濩灝狐琥瑚瓠皓祜糊縞胡芦葫蒿虎號蝴護豪鎬頀顥惑或酷婚昏混渾琿魂忽惚笏哄弘汞泓洪烘紅虹訌鴻化和嬅樺火畵"
    	],
    	[
    		"fca1",
    		"禍禾花華話譁貨靴廓擴攫確碻穫丸喚奐宦幻患換歡晥桓渙煥環紈還驩鰥活滑猾豁闊凰幌徨恍惶愰慌晃晄榥況湟滉潢煌璜皇篁簧荒蝗遑隍黃匯回廻徊恢悔懷晦會檜淮澮灰獪繪膾茴蛔誨賄劃獲宖橫鐄哮嚆孝效斅曉梟涍淆"
    	],
    	[
    		"fda1",
    		"爻肴酵驍侯候厚后吼喉嗅帿後朽煦珝逅勛勳塤壎焄熏燻薰訓暈薨喧暄煊萱卉喙毁彙徽揮暉煇諱輝麾休携烋畦虧恤譎鷸兇凶匈洶胸黑昕欣炘痕吃屹紇訖欠欽歆吸恰洽翕興僖凞喜噫囍姬嬉希憙憘戱晞曦熙熹熺犧禧稀羲詰"
    	]
    ];

    var require$$6 = [
    	[
    		"0",
    		"\u0000",
    		127
    	],
    	[
    		"a140",
    		"　，、。．‧；：？！︰…‥﹐﹑﹒·﹔﹕﹖﹗｜–︱—︳╴︴﹏（）︵︶｛｝︷︸〔〕︹︺【】︻︼《》︽︾〈〉︿﹀「」﹁﹂『』﹃﹄﹙﹚"
    	],
    	[
    		"a1a1",
    		"﹛﹜﹝﹞‘’“”〝〞‵′＃＆＊※§〃○●△▲◎☆★◇◆□■▽▼㊣℅¯￣＿ˍ﹉﹊﹍﹎﹋﹌﹟﹠﹡＋－×÷±√＜＞＝≦≧≠∞≒≡﹢",
    		4,
    		"～∩∪⊥∠∟⊿㏒㏑∫∮∵∴♀♂⊕⊙↑↓←→↖↗↙↘∥∣／"
    	],
    	[
    		"a240",
    		"＼∕﹨＄￥〒￠￡％＠℃℉﹩﹪﹫㏕㎜㎝㎞㏎㎡㎎㎏㏄°兙兛兞兝兡兣嗧瓩糎▁",
    		7,
    		"▏▎▍▌▋▊▉┼┴┬┤├▔─│▕┌┐└┘╭"
    	],
    	[
    		"a2a1",
    		"╮╰╯═╞╪╡◢◣◥◤╱╲╳０",
    		9,
    		"Ⅰ",
    		9,
    		"〡",
    		8,
    		"十卄卅Ａ",
    		25,
    		"ａ",
    		21
    	],
    	[
    		"a340",
    		"ｗｘｙｚΑ",
    		16,
    		"Σ",
    		6,
    		"α",
    		16,
    		"σ",
    		6,
    		"ㄅ",
    		10
    	],
    	[
    		"a3a1",
    		"ㄐ",
    		25,
    		"˙ˉˊˇˋ"
    	],
    	[
    		"a3e1",
    		"€"
    	],
    	[
    		"a440",
    		"一乙丁七乃九了二人儿入八几刀刁力匕十卜又三下丈上丫丸凡久么也乞于亡兀刃勺千叉口土士夕大女子孑孓寸小尢尸山川工己已巳巾干廾弋弓才"
    	],
    	[
    		"a4a1",
    		"丑丐不中丰丹之尹予云井互五亢仁什仃仆仇仍今介仄元允內六兮公冗凶分切刈勻勾勿化匹午升卅卞厄友及反壬天夫太夭孔少尤尺屯巴幻廿弔引心戈戶手扎支文斗斤方日曰月木欠止歹毋比毛氏水火爪父爻片牙牛犬王丙"
    	],
    	[
    		"a540",
    		"世丕且丘主乍乏乎以付仔仕他仗代令仙仞充兄冉冊冬凹出凸刊加功包匆北匝仟半卉卡占卯卮去可古右召叮叩叨叼司叵叫另只史叱台句叭叻四囚外"
    	],
    	[
    		"a5a1",
    		"央失奴奶孕它尼巨巧左市布平幼弁弘弗必戊打扔扒扑斥旦朮本未末札正母民氐永汁汀氾犯玄玉瓜瓦甘生用甩田由甲申疋白皮皿目矛矢石示禾穴立丞丟乒乓乩亙交亦亥仿伉伙伊伕伍伐休伏仲件任仰仳份企伋光兇兆先全"
    	],
    	[
    		"a640",
    		"共再冰列刑划刎刖劣匈匡匠印危吉吏同吊吐吁吋各向名合吃后吆吒因回囝圳地在圭圬圯圩夙多夷夸妄奸妃好她如妁字存宇守宅安寺尖屹州帆并年"
    	],
    	[
    		"a6a1",
    		"式弛忙忖戎戌戍成扣扛托收早旨旬旭曲曳有朽朴朱朵次此死氖汝汗汙江池汐汕污汛汍汎灰牟牝百竹米糸缶羊羽老考而耒耳聿肉肋肌臣自至臼舌舛舟艮色艾虫血行衣西阡串亨位住佇佗佞伴佛何估佐佑伽伺伸佃佔似但佣"
    	],
    	[
    		"a740",
    		"作你伯低伶余佝佈佚兌克免兵冶冷別判利刪刨劫助努劬匣即卵吝吭吞吾否呎吧呆呃吳呈呂君吩告吹吻吸吮吵吶吠吼呀吱含吟听囪困囤囫坊坑址坍"
    	],
    	[
    		"a7a1",
    		"均坎圾坐坏圻壯夾妝妒妨妞妣妙妖妍妤妓妊妥孝孜孚孛完宋宏尬局屁尿尾岐岑岔岌巫希序庇床廷弄弟彤形彷役忘忌志忍忱快忸忪戒我抄抗抖技扶抉扭把扼找批扳抒扯折扮投抓抑抆改攻攸旱更束李杏材村杜杖杞杉杆杠"
    	],
    	[
    		"a840",
    		"杓杗步每求汞沙沁沈沉沅沛汪決沐汰沌汨沖沒汽沃汲汾汴沆汶沍沔沘沂灶灼災灸牢牡牠狄狂玖甬甫男甸皂盯矣私秀禿究系罕肖肓肝肘肛肚育良芒"
    	],
    	[
    		"a8a1",
    		"芋芍見角言谷豆豕貝赤走足身車辛辰迂迆迅迄巡邑邢邪邦那酉釆里防阮阱阪阬並乖乳事些亞享京佯依侍佳使佬供例來侃佰併侈佩佻侖佾侏侑佺兔兒兕兩具其典冽函刻券刷刺到刮制剁劾劻卒協卓卑卦卷卸卹取叔受味呵"
    	],
    	[
    		"a940",
    		"咖呸咕咀呻呷咄咒咆呼咐呱呶和咚呢周咋命咎固垃坷坪坩坡坦坤坼夜奉奇奈奄奔妾妻委妹妮姑姆姐姍始姓姊妯妳姒姅孟孤季宗定官宜宙宛尚屈居"
    	],
    	[
    		"a9a1",
    		"屆岷岡岸岩岫岱岳帘帚帖帕帛帑幸庚店府底庖延弦弧弩往征彿彼忝忠忽念忿怏怔怯怵怖怪怕怡性怩怫怛或戕房戾所承拉拌拄抿拂抹拒招披拓拔拋拈抨抽押拐拙拇拍抵拚抱拘拖拗拆抬拎放斧於旺昔易昌昆昂明昀昏昕昊"
    	],
    	[
    		"aa40",
    		"昇服朋杭枋枕東果杳杷枇枝林杯杰板枉松析杵枚枓杼杪杲欣武歧歿氓氛泣注泳沱泌泥河沽沾沼波沫法泓沸泄油況沮泗泅泱沿治泡泛泊沬泯泜泖泠"
    	],
    	[
    		"aaa1",
    		"炕炎炒炊炙爬爭爸版牧物狀狎狙狗狐玩玨玟玫玥甽疝疙疚的盂盲直知矽社祀祁秉秈空穹竺糾罔羌羋者肺肥肢肱股肫肩肴肪肯臥臾舍芳芝芙芭芽芟芹花芬芥芯芸芣芰芾芷虎虱初表軋迎返近邵邸邱邶采金長門阜陀阿阻附"
    	],
    	[
    		"ab40",
    		"陂隹雨青非亟亭亮信侵侯便俠俑俏保促侶俘俟俊俗侮俐俄係俚俎俞侷兗冒冑冠剎剃削前剌剋則勇勉勃勁匍南卻厚叛咬哀咨哎哉咸咦咳哇哂咽咪品"
    	],
    	[
    		"aba1",
    		"哄哈咯咫咱咻咩咧咿囿垂型垠垣垢城垮垓奕契奏奎奐姜姘姿姣姨娃姥姪姚姦威姻孩宣宦室客宥封屎屏屍屋峙峒巷帝帥帟幽庠度建弈弭彥很待徊律徇後徉怒思怠急怎怨恍恰恨恢恆恃恬恫恪恤扁拜挖按拼拭持拮拽指拱拷"
    	],
    	[
    		"ac40",
    		"拯括拾拴挑挂政故斫施既春昭映昧是星昨昱昤曷柿染柱柔某柬架枯柵柩柯柄柑枴柚查枸柏柞柳枰柙柢柝柒歪殃殆段毒毗氟泉洋洲洪流津洌洱洞洗"
    	],
    	[
    		"aca1",
    		"活洽派洶洛泵洹洧洸洩洮洵洎洫炫為炳炬炯炭炸炮炤爰牲牯牴狩狠狡玷珊玻玲珍珀玳甚甭畏界畎畋疫疤疥疢疣癸皆皇皈盈盆盃盅省盹相眉看盾盼眇矜砂研砌砍祆祉祈祇禹禺科秒秋穿突竿竽籽紂紅紀紉紇約紆缸美羿耄"
    	],
    	[
    		"ad40",
    		"耐耍耑耶胖胥胚胃胄背胡胛胎胞胤胝致舢苧范茅苣苛苦茄若茂茉苒苗英茁苜苔苑苞苓苟苯茆虐虹虻虺衍衫要觔計訂訃貞負赴赳趴軍軌述迦迢迪迥"
    	],
    	[
    		"ada1",
    		"迭迫迤迨郊郎郁郃酋酊重閂限陋陌降面革韋韭音頁風飛食首香乘亳倌倍倣俯倦倥俸倩倖倆值借倚倒們俺倀倔倨俱倡個候倘俳修倭倪俾倫倉兼冤冥冢凍凌准凋剖剜剔剛剝匪卿原厝叟哨唐唁唷哼哥哲唆哺唔哩哭員唉哮哪"
    	],
    	[
    		"ae40",
    		"哦唧唇哽唏圃圄埂埔埋埃堉夏套奘奚娑娘娜娟娛娓姬娠娣娩娥娌娉孫屘宰害家宴宮宵容宸射屑展屐峭峽峻峪峨峰島崁峴差席師庫庭座弱徒徑徐恙"
    	],
    	[
    		"aea1",
    		"恣恥恐恕恭恩息悄悟悚悍悔悌悅悖扇拳挈拿捎挾振捕捂捆捏捉挺捐挽挪挫挨捍捌效敉料旁旅時晉晏晃晒晌晅晁書朔朕朗校核案框桓根桂桔栩梳栗桌桑栽柴桐桀格桃株桅栓栘桁殊殉殷氣氧氨氦氤泰浪涕消涇浦浸海浙涓"
    	],
    	[
    		"af40",
    		"浬涉浮浚浴浩涌涊浹涅浥涔烊烘烤烙烈烏爹特狼狹狽狸狷玆班琉珮珠珪珞畔畝畜畚留疾病症疲疳疽疼疹痂疸皋皰益盍盎眩真眠眨矩砰砧砸砝破砷"
    	],
    	[
    		"afa1",
    		"砥砭砠砟砲祕祐祠祟祖神祝祗祚秤秣秧租秦秩秘窄窈站笆笑粉紡紗紋紊素索純紐紕級紜納紙紛缺罟羔翅翁耆耘耕耙耗耽耿胱脂胰脅胭胴脆胸胳脈能脊胼胯臭臬舀舐航舫舨般芻茫荒荔荊茸荐草茵茴荏茲茹茶茗荀茱茨荃"
    	],
    	[
    		"b040",
    		"虔蚊蚪蚓蚤蚩蚌蚣蚜衰衷袁袂衽衹記訐討訌訕訊託訓訖訏訑豈豺豹財貢起躬軒軔軏辱送逆迷退迺迴逃追逅迸邕郡郝郢酒配酌釘針釗釜釙閃院陣陡"
    	],
    	[
    		"b0a1",
    		"陛陝除陘陞隻飢馬骨高鬥鬲鬼乾偺偽停假偃偌做偉健偶偎偕偵側偷偏倏偯偭兜冕凰剪副勒務勘動匐匏匙匿區匾參曼商啪啦啄啞啡啃啊唱啖問啕唯啤唸售啜唬啣唳啁啗圈國圉域堅堊堆埠埤基堂堵執培夠奢娶婁婉婦婪婀"
    	],
    	[
    		"b140",
    		"娼婢婚婆婊孰寇寅寄寂宿密尉專將屠屜屝崇崆崎崛崖崢崑崩崔崙崤崧崗巢常帶帳帷康庸庶庵庾張強彗彬彩彫得徙從徘御徠徜恿患悉悠您惋悴惦悽"
    	],
    	[
    		"b1a1",
    		"情悻悵惜悼惘惕惆惟悸惚惇戚戛扈掠控捲掖探接捷捧掘措捱掩掉掃掛捫推掄授掙採掬排掏掀捻捩捨捺敝敖救教敗啟敏敘敕敔斜斛斬族旋旌旎晝晚晤晨晦晞曹勗望梁梯梢梓梵桿桶梱梧梗械梃棄梭梆梅梔條梨梟梡梂欲殺"
    	],
    	[
    		"b240",
    		"毫毬氫涎涼淳淙液淡淌淤添淺清淇淋涯淑涮淞淹涸混淵淅淒渚涵淚淫淘淪深淮淨淆淄涪淬涿淦烹焉焊烽烯爽牽犁猜猛猖猓猙率琅琊球理現琍瓠瓶"
    	],
    	[
    		"b2a1",
    		"瓷甜產略畦畢異疏痔痕疵痊痍皎盔盒盛眷眾眼眶眸眺硫硃硎祥票祭移窒窕笠笨笛第符笙笞笮粒粗粕絆絃統紮紹紼絀細紳組累終紲紱缽羞羚翌翎習耜聊聆脯脖脣脫脩脰脤舂舵舷舶船莎莞莘荸莢莖莽莫莒莊莓莉莠荷荻荼"
    	],
    	[
    		"b340",
    		"莆莧處彪蛇蛀蚶蛄蚵蛆蛋蚱蚯蛉術袞袈被袒袖袍袋覓規訪訝訣訥許設訟訛訢豉豚販責貫貨貪貧赧赦趾趺軛軟這逍通逗連速逝逐逕逞造透逢逖逛途"
    	],
    	[
    		"b3a1",
    		"部郭都酗野釵釦釣釧釭釩閉陪陵陳陸陰陴陶陷陬雀雪雩章竟頂頃魚鳥鹵鹿麥麻傢傍傅備傑傀傖傘傚最凱割剴創剩勞勝勛博厥啻喀喧啼喊喝喘喂喜喪喔喇喋喃喳單喟唾喲喚喻喬喱啾喉喫喙圍堯堪場堤堰報堡堝堠壹壺奠"
    	],
    	[
    		"b440",
    		"婷媚婿媒媛媧孳孱寒富寓寐尊尋就嵌嵐崴嵇巽幅帽幀幃幾廊廁廂廄弼彭復循徨惑惡悲悶惠愜愣惺愕惰惻惴慨惱愎惶愉愀愒戟扉掣掌描揀揩揉揆揍"
    	],
    	[
    		"b4a1",
    		"插揣提握揖揭揮捶援揪換摒揚揹敞敦敢散斑斐斯普晰晴晶景暑智晾晷曾替期朝棺棕棠棘棗椅棟棵森棧棹棒棲棣棋棍植椒椎棉棚楮棻款欺欽殘殖殼毯氮氯氬港游湔渡渲湧湊渠渥渣減湛湘渤湖湮渭渦湯渴湍渺測湃渝渾滋"
    	],
    	[
    		"b540",
    		"溉渙湎湣湄湲湩湟焙焚焦焰無然煮焜牌犄犀猶猥猴猩琺琪琳琢琥琵琶琴琯琛琦琨甥甦畫番痢痛痣痙痘痞痠登發皖皓皴盜睏短硝硬硯稍稈程稅稀窘"
    	],
    	[
    		"b5a1",
    		"窗窖童竣等策筆筐筒答筍筋筏筑粟粥絞結絨絕紫絮絲絡給絢絰絳善翔翕耋聒肅腕腔腋腑腎脹腆脾腌腓腴舒舜菩萃菸萍菠菅萋菁華菱菴著萊菰萌菌菽菲菊萸萎萄菜萇菔菟虛蛟蛙蛭蛔蛛蛤蛐蛞街裁裂袱覃視註詠評詞証詁"
    	],
    	[
    		"b640",
    		"詔詛詐詆訴診訶詖象貂貯貼貳貽賁費賀貴買貶貿貸越超趁跎距跋跚跑跌跛跆軻軸軼辜逮逵週逸進逶鄂郵鄉郾酣酥量鈔鈕鈣鈉鈞鈍鈐鈇鈑閔閏開閑"
    	],
    	[
    		"b6a1",
    		"間閒閎隊階隋陽隅隆隍陲隄雁雅雄集雇雯雲韌項順須飧飪飯飩飲飭馮馭黃黍黑亂傭債傲傳僅傾催傷傻傯僇剿剷剽募勦勤勢勣匯嗟嗨嗓嗦嗎嗜嗇嗑嗣嗤嗯嗚嗡嗅嗆嗥嗉園圓塞塑塘塗塚塔填塌塭塊塢塒塋奧嫁嫉嫌媾媽媼"
    	],
    	[
    		"b740",
    		"媳嫂媲嵩嵯幌幹廉廈弒彙徬微愚意慈感想愛惹愁愈慎慌慄慍愾愴愧愍愆愷戡戢搓搾搞搪搭搽搬搏搜搔損搶搖搗搆敬斟新暗暉暇暈暖暄暘暍會榔業"
    	],
    	[
    		"b7a1",
    		"楚楷楠楔極椰概楊楨楫楞楓楹榆楝楣楛歇歲毀殿毓毽溢溯滓溶滂源溝滇滅溥溘溼溺溫滑準溜滄滔溪溧溴煎煙煩煤煉照煜煬煦煌煥煞煆煨煖爺牒猷獅猿猾瑯瑚瑕瑟瑞瑁琿瑙瑛瑜當畸瘀痰瘁痲痱痺痿痴痳盞盟睛睫睦睞督"
    	],
    	[
    		"b840",
    		"睹睪睬睜睥睨睢矮碎碰碗碘碌碉硼碑碓硿祺祿禁萬禽稜稚稠稔稟稞窟窠筷節筠筮筧粱粳粵經絹綑綁綏絛置罩罪署義羨群聖聘肆肄腱腰腸腥腮腳腫"
    	],
    	[
    		"b8a1",
    		"腹腺腦舅艇蒂葷落萱葵葦葫葉葬葛萼萵葡董葩葭葆虞虜號蛹蜓蜈蜇蜀蛾蛻蜂蜃蜆蜊衙裟裔裙補裘裝裡裊裕裒覜解詫該詳試詩詰誇詼詣誠話誅詭詢詮詬詹詻訾詨豢貊貉賊資賈賄貲賃賂賅跡跟跨路跳跺跪跤跦躲較載軾輊"
    	],
    	[
    		"b940",
    		"辟農運遊道遂達逼違遐遇遏過遍遑逾遁鄒鄗酬酪酩釉鈷鉗鈸鈽鉀鈾鉛鉋鉤鉑鈴鉉鉍鉅鈹鈿鉚閘隘隔隕雍雋雉雊雷電雹零靖靴靶預頑頓頊頒頌飼飴"
    	],
    	[
    		"b9a1",
    		"飽飾馳馱馴髡鳩麂鼎鼓鼠僧僮僥僖僭僚僕像僑僱僎僩兢凳劃劂匱厭嗾嘀嘛嘗嗽嘔嘆嘉嘍嘎嗷嘖嘟嘈嘐嗶團圖塵塾境墓墊塹墅塽壽夥夢夤奪奩嫡嫦嫩嫗嫖嫘嫣孵寞寧寡寥實寨寢寤察對屢嶄嶇幛幣幕幗幔廓廖弊彆彰徹慇"
    	],
    	[
    		"ba40",
    		"愿態慷慢慣慟慚慘慵截撇摘摔撤摸摟摺摑摧搴摭摻敲斡旗旖暢暨暝榜榨榕槁榮槓構榛榷榻榫榴槐槍榭槌榦槃榣歉歌氳漳演滾漓滴漩漾漠漬漏漂漢"
    	],
    	[
    		"baa1",
    		"滿滯漆漱漸漲漣漕漫漯澈漪滬漁滲滌滷熔熙煽熊熄熒爾犒犖獄獐瑤瑣瑪瑰瑭甄疑瘧瘍瘋瘉瘓盡監瞄睽睿睡磁碟碧碳碩碣禎福禍種稱窪窩竭端管箕箋筵算箝箔箏箸箇箄粹粽精綻綰綜綽綾綠緊綴網綱綺綢綿綵綸維緒緇綬"
    	],
    	[
    		"bb40",
    		"罰翠翡翟聞聚肇腐膀膏膈膊腿膂臧臺與舔舞艋蓉蒿蓆蓄蒙蒞蒲蒜蓋蒸蓀蓓蒐蒼蓑蓊蜿蜜蜻蜢蜥蜴蜘蝕蜷蜩裳褂裴裹裸製裨褚裯誦誌語誣認誡誓誤"
    	],
    	[
    		"bba1",
    		"說誥誨誘誑誚誧豪貍貌賓賑賒赫趙趕跼輔輒輕輓辣遠遘遜遣遙遞遢遝遛鄙鄘鄞酵酸酷酴鉸銀銅銘銖鉻銓銜銨鉼銑閡閨閩閣閥閤隙障際雌雒需靼鞅韶頗領颯颱餃餅餌餉駁骯骰髦魁魂鳴鳶鳳麼鼻齊億儀僻僵價儂儈儉儅凜"
    	],
    	[
    		"bc40",
    		"劇劈劉劍劊勰厲嘮嘻嘹嘲嘿嘴嘩噓噎噗噴嘶嘯嘰墀墟增墳墜墮墩墦奭嬉嫻嬋嫵嬌嬈寮寬審寫層履嶝嶔幢幟幡廢廚廟廝廣廠彈影德徵慶慧慮慝慕憂"
    	],
    	[
    		"bca1",
    		"慼慰慫慾憧憐憫憎憬憚憤憔憮戮摩摯摹撞撲撈撐撰撥撓撕撩撒撮播撫撚撬撙撢撳敵敷數暮暫暴暱樣樟槨樁樞標槽模樓樊槳樂樅槭樑歐歎殤毅毆漿潼澄潑潦潔澆潭潛潸潮澎潺潰潤澗潘滕潯潠潟熟熬熱熨牖犛獎獗瑩璋璃"
    	],
    	[
    		"bd40",
    		"瑾璀畿瘠瘩瘟瘤瘦瘡瘢皚皺盤瞎瞇瞌瞑瞋磋磅確磊碾磕碼磐稿稼穀稽稷稻窯窮箭箱範箴篆篇篁箠篌糊締練緯緻緘緬緝編緣線緞緩綞緙緲緹罵罷羯"
    	],
    	[
    		"bda1",
    		"翩耦膛膜膝膠膚膘蔗蔽蔚蓮蔬蔭蔓蔑蔣蔡蔔蓬蔥蓿蔆螂蝴蝶蝠蝦蝸蝨蝙蝗蝌蝓衛衝褐複褒褓褕褊誼諒談諄誕請諸課諉諂調誰論諍誶誹諛豌豎豬賠賞賦賤賬賭賢賣賜質賡赭趟趣踫踐踝踢踏踩踟踡踞躺輝輛輟輩輦輪輜輞"
    	],
    	[
    		"be40",
    		"輥適遮遨遭遷鄰鄭鄧鄱醇醉醋醃鋅銻銷鋪銬鋤鋁銳銼鋒鋇鋰銲閭閱霄霆震霉靠鞍鞋鞏頡頫頜颳養餓餒餘駝駐駟駛駑駕駒駙骷髮髯鬧魅魄魷魯鴆鴉"
    	],
    	[
    		"bea1",
    		"鴃麩麾黎墨齒儒儘儔儐儕冀冪凝劑劓勳噙噫噹噩噤噸噪器噥噱噯噬噢噶壁墾壇壅奮嬝嬴學寰導彊憲憑憩憊懍憶憾懊懈戰擅擁擋撻撼據擄擇擂操撿擒擔撾整曆曉暹曄曇暸樽樸樺橙橫橘樹橄橢橡橋橇樵機橈歙歷氅濂澱澡"
    	],
    	[
    		"bf40",
    		"濃澤濁澧澳激澹澶澦澠澴熾燉燐燒燈燕熹燎燙燜燃燄獨璜璣璘璟璞瓢甌甍瘴瘸瘺盧盥瞠瞞瞟瞥磨磚磬磧禦積穎穆穌穋窺篙簑築篤篛篡篩篦糕糖縊"
    	],
    	[
    		"bfa1",
    		"縑縈縛縣縞縝縉縐罹羲翰翱翮耨膳膩膨臻興艘艙蕊蕙蕈蕨蕩蕃蕉蕭蕪蕞螃螟螞螢融衡褪褲褥褫褡親覦諦諺諫諱謀諜諧諮諾謁謂諷諭諳諶諼豫豭貓賴蹄踱踴蹂踹踵輻輯輸輳辨辦遵遴選遲遼遺鄴醒錠錶鋸錳錯錢鋼錫錄錚"
    	],
    	[
    		"c040",
    		"錐錦錡錕錮錙閻隧隨險雕霎霑霖霍霓霏靛靜靦鞘頰頸頻頷頭頹頤餐館餞餛餡餚駭駢駱骸骼髻髭鬨鮑鴕鴣鴦鴨鴒鴛默黔龍龜優償儡儲勵嚎嚀嚐嚅嚇"
    	],
    	[
    		"c0a1",
    		"嚏壕壓壑壎嬰嬪嬤孺尷屨嶼嶺嶽嶸幫彌徽應懂懇懦懋戲戴擎擊擘擠擰擦擬擱擢擭斂斃曙曖檀檔檄檢檜櫛檣橾檗檐檠歜殮毚氈濘濱濟濠濛濤濫濯澀濬濡濩濕濮濰燧營燮燦燥燭燬燴燠爵牆獰獲璩環璦璨癆療癌盪瞳瞪瞰瞬"
    	],
    	[
    		"c140",
    		"瞧瞭矯磷磺磴磯礁禧禪穗窿簇簍篾篷簌篠糠糜糞糢糟糙糝縮績繆縷縲繃縫總縱繅繁縴縹繈縵縿縯罄翳翼聱聲聰聯聳臆臃膺臂臀膿膽臉膾臨舉艱薪"
    	],
    	[
    		"c1a1",
    		"薄蕾薜薑薔薯薛薇薨薊虧蟀蟑螳蟒蟆螫螻螺蟈蟋褻褶襄褸褽覬謎謗謙講謊謠謝謄謐豁谿豳賺賽購賸賻趨蹉蹋蹈蹊轄輾轂轅輿避遽還邁邂邀鄹醣醞醜鍍鎂錨鍵鍊鍥鍋錘鍾鍬鍛鍰鍚鍔闊闋闌闈闆隱隸雖霜霞鞠韓顆颶餵騁"
    	],
    	[
    		"c240",
    		"駿鮮鮫鮪鮭鴻鴿麋黏點黜黝黛鼾齋叢嚕嚮壙壘嬸彝懣戳擴擲擾攆擺擻擷斷曜朦檳檬櫃檻檸櫂檮檯歟歸殯瀉瀋濾瀆濺瀑瀏燻燼燾燸獷獵璧璿甕癖癘"
    	],
    	[
    		"c2a1",
    		"癒瞽瞿瞻瞼礎禮穡穢穠竄竅簫簧簪簞簣簡糧織繕繞繚繡繒繙罈翹翻職聶臍臏舊藏薩藍藐藉薰薺薹薦蟯蟬蟲蟠覆覲觴謨謹謬謫豐贅蹙蹣蹦蹤蹟蹕軀轉轍邇邃邈醫醬釐鎔鎊鎖鎢鎳鎮鎬鎰鎘鎚鎗闔闖闐闕離雜雙雛雞霤鞣鞦"
    	],
    	[
    		"c340",
    		"鞭韹額顏題顎顓颺餾餿餽餮馥騎髁鬃鬆魏魎魍鯊鯉鯽鯈鯀鵑鵝鵠黠鼕鼬儳嚥壞壟壢寵龐廬懲懷懶懵攀攏曠曝櫥櫝櫚櫓瀛瀟瀨瀚瀝瀕瀘爆爍牘犢獸"
    	],
    	[
    		"c3a1",
    		"獺璽瓊瓣疇疆癟癡矇礙禱穫穩簾簿簸簽簷籀繫繭繹繩繪羅繳羶羹羸臘藩藝藪藕藤藥藷蟻蠅蠍蟹蟾襠襟襖襞譁譜識證譚譎譏譆譙贈贊蹼蹲躇蹶蹬蹺蹴轔轎辭邊邋醱醮鏡鏑鏟鏃鏈鏜鏝鏖鏢鏍鏘鏤鏗鏨關隴難霪霧靡韜韻類"
    	],
    	[
    		"c440",
    		"願顛颼饅饉騖騙鬍鯨鯧鯖鯛鶉鵡鵲鵪鵬麒麗麓麴勸嚨嚷嚶嚴嚼壤孀孃孽寶巉懸懺攘攔攙曦朧櫬瀾瀰瀲爐獻瓏癢癥礦礪礬礫竇競籌籃籍糯糰辮繽繼"
    	],
    	[
    		"c4a1",
    		"纂罌耀臚艦藻藹蘑藺蘆蘋蘇蘊蠔蠕襤覺觸議譬警譯譟譫贏贍躉躁躅躂醴釋鐘鐃鏽闡霰飄饒饑馨騫騰騷騵鰓鰍鹹麵黨鼯齟齣齡儷儸囁囀囂夔屬巍懼懾攝攜斕曩櫻欄櫺殲灌爛犧瓖瓔癩矓籐纏續羼蘗蘭蘚蠣蠢蠡蠟襪襬覽譴"
    	],
    	[
    		"c540",
    		"護譽贓躊躍躋轟辯醺鐮鐳鐵鐺鐸鐲鐫闢霸霹露響顧顥饗驅驃驀騾髏魔魑鰭鰥鶯鶴鷂鶸麝黯鼙齜齦齧儼儻囈囊囉孿巔巒彎懿攤權歡灑灘玀瓤疊癮癬"
    	],
    	[
    		"c5a1",
    		"禳籠籟聾聽臟襲襯觼讀贖贗躑躓轡酈鑄鑑鑒霽霾韃韁顫饕驕驍髒鬚鱉鰱鰾鰻鷓鷗鼴齬齪龔囌巖戀攣攫攪曬欐瓚竊籤籣籥纓纖纔臢蘸蘿蠱變邐邏鑣鑠鑤靨顯饜驚驛驗髓體髑鱔鱗鱖鷥麟黴囑壩攬灞癱癲矗罐羈蠶蠹衢讓讒"
    	],
    	[
    		"c640",
    		"讖艷贛釀鑪靂靈靄韆顰驟鬢魘鱟鷹鷺鹼鹽鼇齷齲廳欖灣籬籮蠻觀躡釁鑲鑰顱饞髖鬣黌灤矚讚鑷韉驢驥纜讜躪釅鑽鑾鑼鱷鱸黷豔鑿鸚爨驪鬱鸛鸞籲"
    	],
    	[
    		"c940",
    		"乂乜凵匚厂万丌乇亍囗兀屮彳丏冇与丮亓仂仉仈冘勼卬厹圠夃夬尐巿旡殳毌气爿丱丼仨仜仩仡仝仚刌匜卌圢圣夗夯宁宄尒尻屴屳帄庀庂忉戉扐氕"
    	],
    	[
    		"c9a1",
    		"氶汃氿氻犮犰玊禸肊阞伎优伬仵伔仱伀价伈伝伂伅伢伓伄仴伒冱刓刉刐劦匢匟卍厊吇囡囟圮圪圴夼妀奼妅奻奾奷奿孖尕尥屼屺屻屾巟幵庄异弚彴忕忔忏扜扞扤扡扦扢扙扠扚扥旯旮朾朹朸朻机朿朼朳氘汆汒汜汏汊汔汋"
    	],
    	[
    		"ca40",
    		"汌灱牞犴犵玎甪癿穵网艸艼芀艽艿虍襾邙邗邘邛邔阢阤阠阣佖伻佢佉体佤伾佧佒佟佁佘伭伳伿佡冏冹刜刞刡劭劮匉卣卲厎厏吰吷吪呔呅吙吜吥吘"
    	],
    	[
    		"caa1",
    		"吽呏呁吨吤呇囮囧囥坁坅坌坉坋坒夆奀妦妘妠妗妎妢妐妏妧妡宎宒尨尪岍岏岈岋岉岒岊岆岓岕巠帊帎庋庉庌庈庍弅弝彸彶忒忑忐忭忨忮忳忡忤忣忺忯忷忻怀忴戺抃抌抎抏抔抇扱扻扺扰抁抈扷扽扲扴攷旰旴旳旲旵杅杇"
    	],
    	[
    		"cb40",
    		"杙杕杌杈杝杍杚杋毐氙氚汸汧汫沄沋沏汱汯汩沚汭沇沕沜汦汳汥汻沎灴灺牣犿犽狃狆狁犺狅玕玗玓玔玒町甹疔疕皁礽耴肕肙肐肒肜芐芏芅芎芑芓"
    	],
    	[
    		"cba1",
    		"芊芃芄豸迉辿邟邡邥邞邧邠阰阨阯阭丳侘佼侅佽侀侇佶佴侉侄佷佌侗佪侚佹侁佸侐侜侔侞侒侂侕佫佮冞冼冾刵刲刳剆刱劼匊匋匼厒厔咇呿咁咑咂咈呫呺呾呥呬呴呦咍呯呡呠咘呣呧呤囷囹坯坲坭坫坱坰坶垀坵坻坳坴坢"
    	],
    	[
    		"cc40",
    		"坨坽夌奅妵妺姏姎妲姌姁妶妼姃姖妱妽姀姈妴姇孢孥宓宕屄屇岮岤岠岵岯岨岬岟岣岭岢岪岧岝岥岶岰岦帗帔帙弨弢弣弤彔徂彾彽忞忥怭怦怙怲怋"
    	],
    	[
    		"cca1",
    		"怴怊怗怳怚怞怬怢怍怐怮怓怑怌怉怜戔戽抭抴拑抾抪抶拊抮抳抯抻抩抰抸攽斨斻昉旼昄昒昈旻昃昋昍昅旽昑昐曶朊枅杬枎枒杶杻枘枆构杴枍枌杺枟枑枙枃杽极杸杹枔欥殀歾毞氝沓泬泫泮泙沶泔沭泧沷泐泂沺泃泆泭泲"
    	],
    	[
    		"cd40",
    		"泒泝沴沊沝沀泞泀洰泍泇沰泹泏泩泑炔炘炅炓炆炄炑炖炂炚炃牪狖狋狘狉狜狒狔狚狌狑玤玡玭玦玢玠玬玝瓝瓨甿畀甾疌疘皯盳盱盰盵矸矼矹矻矺"
    	],
    	[
    		"cda1",
    		"矷祂礿秅穸穻竻籵糽耵肏肮肣肸肵肭舠芠苀芫芚芘芛芵芧芮芼芞芺芴芨芡芩苂芤苃芶芢虰虯虭虮豖迒迋迓迍迖迕迗邲邴邯邳邰阹阽阼阺陃俍俅俓侲俉俋俁俔俜俙侻侳俛俇俖侺俀侹俬剄剉勀勂匽卼厗厖厙厘咺咡咭咥哏"
    	],
    	[
    		"ce40",
    		"哃茍咷咮哖咶哅哆咠呰咼咢咾呲哞咰垵垞垟垤垌垗垝垛垔垘垏垙垥垚垕壴复奓姡姞姮娀姱姝姺姽姼姶姤姲姷姛姩姳姵姠姾姴姭宨屌峐峘峌峗峋峛"
    	],
    	[
    		"cea1",
    		"峞峚峉峇峊峖峓峔峏峈峆峎峟峸巹帡帢帣帠帤庰庤庢庛庣庥弇弮彖徆怷怹恔恲恞恅恓恇恉恛恌恀恂恟怤恄恘恦恮扂扃拏挍挋拵挎挃拫拹挏挌拸拶挀挓挔拺挕拻拰敁敃斪斿昶昡昲昵昜昦昢昳昫昺昝昴昹昮朏朐柁柲柈枺"
    	],
    	[
    		"cf40",
    		"柜枻柸柘柀枷柅柫柤柟枵柍枳柷柶柮柣柂枹柎柧柰枲柼柆柭柌枮柦柛柺柉柊柃柪柋欨殂殄殶毖毘毠氠氡洨洴洭洟洼洿洒洊泚洳洄洙洺洚洑洀洝浂"
    	],
    	[
    		"cfa1",
    		"洁洘洷洃洏浀洇洠洬洈洢洉洐炷炟炾炱炰炡炴炵炩牁牉牊牬牰牳牮狊狤狨狫狟狪狦狣玅珌珂珈珅玹玶玵玴珫玿珇玾珃珆玸珋瓬瓮甮畇畈疧疪癹盄眈眃眄眅眊盷盻盺矧矨砆砑砒砅砐砏砎砉砃砓祊祌祋祅祄秕种秏秖秎窀"
    	],
    	[
    		"d040",
    		"穾竑笀笁籺籸籹籿粀粁紃紈紁罘羑羍羾耇耎耏耔耷胘胇胠胑胈胂胐胅胣胙胜胊胕胉胏胗胦胍臿舡芔苙苾苹茇苨茀苕茺苫苖苴苬苡苲苵茌苻苶苰苪"
    	],
    	[
    		"d0a1",
    		"苤苠苺苳苭虷虴虼虳衁衎衧衪衩觓訄訇赲迣迡迮迠郱邽邿郕郅邾郇郋郈釔釓陔陏陑陓陊陎倞倅倇倓倢倰倛俵俴倳倷倬俶俷倗倜倠倧倵倯倱倎党冔冓凊凄凅凈凎剡剚剒剞剟剕剢勍匎厞唦哢唗唒哧哳哤唚哿唄唈哫唑唅哱"
    	],
    	[
    		"d140",
    		"唊哻哷哸哠唎唃唋圁圂埌堲埕埒垺埆垽垼垸垶垿埇埐垹埁夎奊娙娖娭娮娕娏娗娊娞娳孬宧宭宬尃屖屔峬峿峮峱峷崀峹帩帨庨庮庪庬弳弰彧恝恚恧"
    	],
    	[
    		"d1a1",
    		"恁悢悈悀悒悁悝悃悕悛悗悇悜悎戙扆拲挐捖挬捄捅挶捃揤挹捋捊挼挩捁挴捘捔捙挭捇挳捚捑挸捗捀捈敊敆旆旃旄旂晊晟晇晑朒朓栟栚桉栲栳栻桋桏栖栱栜栵栫栭栯桎桄栴栝栒栔栦栨栮桍栺栥栠欬欯欭欱欴歭肂殈毦毤"
    	],
    	[
    		"d240",
    		"毨毣毢毧氥浺浣浤浶洍浡涒浘浢浭浯涑涍淯浿涆浞浧浠涗浰浼浟涂涘洯浨涋浾涀涄洖涃浻浽浵涐烜烓烑烝烋缹烢烗烒烞烠烔烍烅烆烇烚烎烡牂牸"
    	],
    	[
    		"d2a1",
    		"牷牶猀狺狴狾狶狳狻猁珓珙珥珖玼珧珣珩珜珒珛珔珝珚珗珘珨瓞瓟瓴瓵甡畛畟疰痁疻痄痀疿疶疺皊盉眝眛眐眓眒眣眑眕眙眚眢眧砣砬砢砵砯砨砮砫砡砩砳砪砱祔祛祏祜祓祒祑秫秬秠秮秭秪秜秞秝窆窉窅窋窌窊窇竘笐"
    	],
    	[
    		"d340",
    		"笄笓笅笏笈笊笎笉笒粄粑粊粌粈粍粅紞紝紑紎紘紖紓紟紒紏紌罜罡罞罠罝罛羖羒翃翂翀耖耾耹胺胲胹胵脁胻脀舁舯舥茳茭荄茙荑茥荖茿荁茦茜茢"
    	],
    	[
    		"d3a1",
    		"荂荎茛茪茈茼荍茖茤茠茷茯茩荇荅荌荓茞茬荋茧荈虓虒蚢蚨蚖蚍蚑蚞蚇蚗蚆蚋蚚蚅蚥蚙蚡蚧蚕蚘蚎蚝蚐蚔衃衄衭衵衶衲袀衱衿衯袃衾衴衼訒豇豗豻貤貣赶赸趵趷趶軑軓迾迵适迿迻逄迼迶郖郠郙郚郣郟郥郘郛郗郜郤酐"
    	],
    	[
    		"d440",
    		"酎酏釕釢釚陜陟隼飣髟鬯乿偰偪偡偞偠偓偋偝偲偈偍偁偛偊偢倕偅偟偩偫偣偤偆偀偮偳偗偑凐剫剭剬剮勖勓匭厜啵啶唼啍啐唴唪啑啢唶唵唰啒啅"
    	],
    	[
    		"d4a1",
    		"唌唲啥啎唹啈唭唻啀啋圊圇埻堔埢埶埜埴堀埭埽堈埸堋埳埏堇埮埣埲埥埬埡堎埼堐埧堁堌埱埩埰堍堄奜婠婘婕婧婞娸娵婭婐婟婥婬婓婤婗婃婝婒婄婛婈媎娾婍娹婌婰婩婇婑婖婂婜孲孮寁寀屙崞崋崝崚崠崌崨崍崦崥崏"
    	],
    	[
    		"d540",
    		"崰崒崣崟崮帾帴庱庴庹庲庳弶弸徛徖徟悊悐悆悾悰悺惓惔惏惤惙惝惈悱惛悷惊悿惃惍惀挲捥掊掂捽掽掞掭掝掗掫掎捯掇掐据掯捵掜捭掮捼掤挻掟"
    	],
    	[
    		"d5a1",
    		"捸掅掁掑掍捰敓旍晥晡晛晙晜晢朘桹梇梐梜桭桮梮梫楖桯梣梬梩桵桴梲梏桷梒桼桫桲梪梀桱桾梛梖梋梠梉梤桸桻梑梌梊桽欶欳欷欸殑殏殍殎殌氪淀涫涴涳湴涬淩淢涷淶淔渀淈淠淟淖涾淥淜淝淛淴淊涽淭淰涺淕淂淏淉"
    	],
    	[
    		"d640",
    		"淐淲淓淽淗淍淣涻烺焍烷焗烴焌烰焄烳焐烼烿焆焓焀烸烶焋焂焎牾牻牼牿猝猗猇猑猘猊猈狿猏猞玈珶珸珵琄琁珽琇琀珺珼珿琌琋珴琈畤畣痎痒痏"
    	],
    	[
    		"d6a1",
    		"痋痌痑痐皏皉盓眹眯眭眱眲眴眳眽眥眻眵硈硒硉硍硊硌砦硅硐祤祧祩祪祣祫祡离秺秸秶秷窏窔窐笵筇笴笥笰笢笤笳笘笪笝笱笫笭笯笲笸笚笣粔粘粖粣紵紽紸紶紺絅紬紩絁絇紾紿絊紻紨罣羕羜羝羛翊翋翍翐翑翇翏翉耟"
    	],
    	[
    		"d740",
    		"耞耛聇聃聈脘脥脙脛脭脟脬脞脡脕脧脝脢舑舸舳舺舴舲艴莐莣莨莍荺荳莤荴莏莁莕莙荵莔莩荽莃莌莝莛莪莋荾莥莯莈莗莰荿莦莇莮荶莚虙虖蚿蚷"
    	],
    	[
    		"d7a1",
    		"蛂蛁蛅蚺蚰蛈蚹蚳蚸蛌蚴蚻蚼蛃蚽蚾衒袉袕袨袢袪袚袑袡袟袘袧袙袛袗袤袬袌袓袎覂觖觙觕訰訧訬訞谹谻豜豝豽貥赽赻赹趼跂趹趿跁軘軞軝軜軗軠軡逤逋逑逜逌逡郯郪郰郴郲郳郔郫郬郩酖酘酚酓酕釬釴釱釳釸釤釹釪"
    	],
    	[
    		"d840",
    		"釫釷釨釮镺閆閈陼陭陫陱陯隿靪頄飥馗傛傕傔傞傋傣傃傌傎傝偨傜傒傂傇兟凔匒匑厤厧喑喨喥喭啷噅喢喓喈喏喵喁喣喒喤啽喌喦啿喕喡喎圌堩堷"
    	],
    	[
    		"d8a1",
    		"堙堞堧堣堨埵塈堥堜堛堳堿堶堮堹堸堭堬堻奡媯媔媟婺媢媞婸媦婼媥媬媕媮娷媄媊媗媃媋媩婻婽媌媜媏媓媝寪寍寋寔寑寊寎尌尰崷嵃嵫嵁嵋崿崵嵑嵎嵕崳崺嵒崽崱嵙嵂崹嵉崸崼崲崶嵀嵅幄幁彘徦徥徫惉悹惌惢惎惄愔"
    	],
    	[
    		"d940",
    		"惲愊愖愅惵愓惸惼惾惁愃愘愝愐惿愄愋扊掔掱掰揎揥揨揯揃撝揳揊揠揶揕揲揵摡揟掾揝揜揄揘揓揂揇揌揋揈揰揗揙攲敧敪敤敜敨敥斌斝斞斮旐旒"
    	],
    	[
    		"d9a1",
    		"晼晬晻暀晱晹晪晲朁椌棓椄棜椪棬棪棱椏棖棷棫棤棶椓椐棳棡椇棌椈楰梴椑棯棆椔棸棐棽棼棨椋椊椗棎棈棝棞棦棴棑椆棔棩椕椥棇欹欻欿欼殔殗殙殕殽毰毲毳氰淼湆湇渟湉溈渼渽湅湢渫渿湁湝湳渜渳湋湀湑渻渃渮湞"
    	],
    	[
    		"da40",
    		"湨湜湡渱渨湠湱湫渹渢渰湓湥渧湸湤湷湕湹湒湦渵渶湚焠焞焯烻焮焱焣焥焢焲焟焨焺焛牋牚犈犉犆犅犋猒猋猰猢猱猳猧猲猭猦猣猵猌琮琬琰琫琖"
    	],
    	[
    		"daa1",
    		"琚琡琭琱琤琣琝琩琠琲瓻甯畯畬痧痚痡痦痝痟痤痗皕皒盚睆睇睄睍睅睊睎睋睌矞矬硠硤硥硜硭硱硪确硰硩硨硞硢祴祳祲祰稂稊稃稌稄窙竦竤筊笻筄筈筌筎筀筘筅粢粞粨粡絘絯絣絓絖絧絪絏絭絜絫絒絔絩絑絟絎缾缿罥"
    	],
    	[
    		"db40",
    		"罦羢羠羡翗聑聏聐胾胔腃腊腒腏腇脽腍脺臦臮臷臸臹舄舼舽舿艵茻菏菹萣菀菨萒菧菤菼菶萐菆菈菫菣莿萁菝菥菘菿菡菋菎菖菵菉萉萏菞萑萆菂菳"
    	],
    	[
    		"dba1",
    		"菕菺菇菑菪萓菃菬菮菄菻菗菢萛菛菾蛘蛢蛦蛓蛣蛚蛪蛝蛫蛜蛬蛩蛗蛨蛑衈衖衕袺裗袹袸裀袾袶袼袷袽袲褁裉覕覘覗觝觚觛詎詍訹詙詀詗詘詄詅詒詈詑詊詌詏豟貁貀貺貾貰貹貵趄趀趉跘跓跍跇跖跜跏跕跙跈跗跅軯軷軺"
    	],
    	[
    		"dc40",
    		"軹軦軮軥軵軧軨軶軫軱軬軴軩逭逴逯鄆鄬鄄郿郼鄈郹郻鄁鄀鄇鄅鄃酡酤酟酢酠鈁鈊鈥鈃鈚鈦鈏鈌鈀鈒釿釽鈆鈄鈧鈂鈜鈤鈙鈗鈅鈖镻閍閌閐隇陾隈"
    	],
    	[
    		"dca1",
    		"隉隃隀雂雈雃雱雰靬靰靮頇颩飫鳦黹亃亄亶傽傿僆傮僄僊傴僈僂傰僁傺傱僋僉傶傸凗剺剸剻剼嗃嗛嗌嗐嗋嗊嗝嗀嗔嗄嗩喿嗒喍嗏嗕嗢嗖嗈嗲嗍嗙嗂圔塓塨塤塏塍塉塯塕塎塝塙塥塛堽塣塱壼嫇嫄嫋媺媸媱媵媰媿嫈媻嫆"
    	],
    	[
    		"dd40",
    		"媷嫀嫊媴媶嫍媹媐寖寘寙尟尳嵱嵣嵊嵥嵲嵬嵞嵨嵧嵢巰幏幎幊幍幋廅廌廆廋廇彀徯徭惷慉慊愫慅愶愲愮慆愯慏愩慀戠酨戣戥戤揅揱揫搐搒搉搠搤"
    	],
    	[
    		"dda1",
    		"搳摃搟搕搘搹搷搢搣搌搦搰搨摁搵搯搊搚摀搥搧搋揧搛搮搡搎敯斒旓暆暌暕暐暋暊暙暔晸朠楦楟椸楎楢楱椿楅楪椹楂楗楙楺楈楉椵楬椳椽楥棰楸椴楩楀楯楄楶楘楁楴楌椻楋椷楜楏楑椲楒椯楻椼歆歅歃歂歈歁殛嗀毻毼"
    	],
    	[
    		"de40",
    		"毹毷毸溛滖滈溏滀溟溓溔溠溱溹滆滒溽滁溞滉溷溰滍溦滏溲溾滃滜滘溙溒溎溍溤溡溿溳滐滊溗溮溣煇煔煒煣煠煁煝煢煲煸煪煡煂煘煃煋煰煟煐煓"
    	],
    	[
    		"dea1",
    		"煄煍煚牏犍犌犑犐犎猼獂猻猺獀獊獉瑄瑊瑋瑒瑑瑗瑀瑏瑐瑎瑂瑆瑍瑔瓡瓿瓾瓽甝畹畷榃痯瘏瘃痷痾痼痹痸瘐痻痶痭痵痽皙皵盝睕睟睠睒睖睚睩睧睔睙睭矠碇碚碔碏碄碕碅碆碡碃硹碙碀碖硻祼禂祽祹稑稘稙稒稗稕稢稓"
    	],
    	[
    		"df40",
    		"稛稐窣窢窞竫筦筤筭筴筩筲筥筳筱筰筡筸筶筣粲粴粯綈綆綀綍絿綅絺綎絻綃絼綌綔綄絽綒罭罫罧罨罬羦羥羧翛翜耡腤腠腷腜腩腛腢腲朡腞腶腧腯"
    	],
    	[
    		"dfa1",
    		"腄腡舝艉艄艀艂艅蓱萿葖葶葹蒏蒍葥葑葀蒆葧萰葍葽葚葙葴葳葝蔇葞萷萺萴葺葃葸萲葅萩菙葋萯葂萭葟葰萹葎葌葒葯蓅蒎萻葇萶萳葨葾葄萫葠葔葮葐蜋蜄蛷蜌蛺蛖蛵蝍蛸蜎蜉蜁蛶蜍蜅裖裋裍裎裞裛裚裌裐覅覛觟觥觤"
    	],
    	[
    		"e040",
    		"觡觠觢觜触詶誆詿詡訿詷誂誄詵誃誁詴詺谼豋豊豥豤豦貆貄貅賌赨赩趑趌趎趏趍趓趔趐趒跰跠跬跱跮跐跩跣跢跧跲跫跴輆軿輁輀輅輇輈輂輋遒逿"
    	],
    	[
    		"e0a1",
    		"遄遉逽鄐鄍鄏鄑鄖鄔鄋鄎酮酯鉈鉒鈰鈺鉦鈳鉥鉞銃鈮鉊鉆鉭鉬鉏鉠鉧鉯鈶鉡鉰鈱鉔鉣鉐鉲鉎鉓鉌鉖鈲閟閜閞閛隒隓隑隗雎雺雽雸雵靳靷靸靲頏頍頎颬飶飹馯馲馰馵骭骫魛鳪鳭鳧麀黽僦僔僗僨僳僛僪僝僤僓僬僰僯僣僠"
    	],
    	[
    		"e140",
    		"凘劀劁勩勫匰厬嘧嘕嘌嘒嗼嘏嘜嘁嘓嘂嗺嘝嘄嗿嗹墉塼墐墘墆墁塿塴墋塺墇墑墎塶墂墈塻墔墏壾奫嫜嫮嫥嫕嫪嫚嫭嫫嫳嫢嫠嫛嫬嫞嫝嫙嫨嫟孷寠"
    	],
    	[
    		"e1a1",
    		"寣屣嶂嶀嵽嶆嵺嶁嵷嶊嶉嶈嵾嵼嶍嵹嵿幘幙幓廘廑廗廎廜廕廙廒廔彄彃彯徶愬愨慁慞慱慳慒慓慲慬憀慴慔慺慛慥愻慪慡慖戩戧戫搫摍摛摝摴摶摲摳摽摵摦撦摎撂摞摜摋摓摠摐摿搿摬摫摙摥摷敳斠暡暠暟朅朄朢榱榶槉"
    	],
    	[
    		"e240",
    		"榠槎榖榰榬榼榑榙榎榧榍榩榾榯榿槄榽榤槔榹槊榚槏榳榓榪榡榞槙榗榐槂榵榥槆歊歍歋殞殟殠毃毄毾滎滵滱漃漥滸漷滻漮漉潎漙漚漧漘漻漒滭漊"
    	],
    	[
    		"e2a1",
    		"漶潳滹滮漭潀漰漼漵滫漇漎潃漅滽滶漹漜滼漺漟漍漞漈漡熇熐熉熀熅熂熏煻熆熁熗牄牓犗犕犓獃獍獑獌瑢瑳瑱瑵瑲瑧瑮甀甂甃畽疐瘖瘈瘌瘕瘑瘊瘔皸瞁睼瞅瞂睮瞀睯睾瞃碲碪碴碭碨硾碫碞碥碠碬碢碤禘禊禋禖禕禔禓"
    	],
    	[
    		"e340",
    		"禗禈禒禐稫穊稰稯稨稦窨窫窬竮箈箜箊箑箐箖箍箌箛箎箅箘劄箙箤箂粻粿粼粺綧綷緂綣綪緁緀緅綝緎緄緆緋緌綯綹綖綼綟綦綮綩綡緉罳翢翣翥翞"
    	],
    	[
    		"e3a1",
    		"耤聝聜膉膆膃膇膍膌膋舕蒗蒤蒡蒟蒺蓎蓂蒬蒮蒫蒹蒴蓁蓍蒪蒚蒱蓐蒝蒧蒻蒢蒔蓇蓌蒛蒩蒯蒨蓖蒘蒶蓏蒠蓗蓔蓒蓛蒰蒑虡蜳蜣蜨蝫蝀蜮蜞蜡蜙蜛蝃蜬蝁蜾蝆蜠蜲蜪蜭蜼蜒蜺蜱蜵蝂蜦蜧蜸蜤蜚蜰蜑裷裧裱裲裺裾裮裼裶裻"
    	],
    	[
    		"e440",
    		"裰裬裫覝覡覟覞觩觫觨誫誙誋誒誏誖谽豨豩賕賏賗趖踉踂跿踍跽踊踃踇踆踅跾踀踄輐輑輎輍鄣鄜鄠鄢鄟鄝鄚鄤鄡鄛酺酲酹酳銥銤鉶銛鉺銠銔銪銍"
    	],
    	[
    		"e4a1",
    		"銦銚銫鉹銗鉿銣鋮銎銂銕銢鉽銈銡銊銆銌銙銧鉾銇銩銝銋鈭隞隡雿靘靽靺靾鞃鞀鞂靻鞄鞁靿韎韍頖颭颮餂餀餇馝馜駃馹馻馺駂馽駇骱髣髧鬾鬿魠魡魟鳱鳲鳵麧僿儃儰僸儆儇僶僾儋儌僽儊劋劌勱勯噈噂噌嘵噁噊噉噆噘"
    	],
    	[
    		"e540",
    		"噚噀嘳嘽嘬嘾嘸嘪嘺圚墫墝墱墠墣墯墬墥墡壿嫿嫴嫽嫷嫶嬃嫸嬂嫹嬁嬇嬅嬏屧嶙嶗嶟嶒嶢嶓嶕嶠嶜嶡嶚嶞幩幝幠幜緳廛廞廡彉徲憋憃慹憱憰憢憉"
    	],
    	[
    		"e5a1",
    		"憛憓憯憭憟憒憪憡憍慦憳戭摮摰撖撠撅撗撜撏撋撊撌撣撟摨撱撘敶敺敹敻斲斳暵暰暩暲暷暪暯樀樆樗槥槸樕槱槤樠槿槬槢樛樝槾樧槲槮樔槷槧橀樈槦槻樍槼槫樉樄樘樥樏槶樦樇槴樖歑殥殣殢殦氁氀毿氂潁漦潾澇濆澒"
    	],
    	[
    		"e640",
    		"澍澉澌潢潏澅潚澖潶潬澂潕潲潒潐潗澔澓潝漀潡潫潽潧澐潓澋潩潿澕潣潷潪潻熲熯熛熰熠熚熩熵熝熥熞熤熡熪熜熧熳犘犚獘獒獞獟獠獝獛獡獚獙"
    	],
    	[
    		"e6a1",
    		"獢璇璉璊璆璁瑽璅璈瑼瑹甈甇畾瘥瘞瘙瘝瘜瘣瘚瘨瘛皜皝皞皛瞍瞏瞉瞈磍碻磏磌磑磎磔磈磃磄磉禚禡禠禜禢禛歶稹窲窴窳箷篋箾箬篎箯箹篊箵糅糈糌糋緷緛緪緧緗緡縃緺緦緶緱緰緮緟罶羬羰羭翭翫翪翬翦翨聤聧膣膟"
    	],
    	[
    		"e740",
    		"膞膕膢膙膗舖艏艓艒艐艎艑蔤蔻蔏蔀蔩蔎蔉蔍蔟蔊蔧蔜蓻蔫蓺蔈蔌蓴蔪蓲蔕蓷蓫蓳蓼蔒蓪蓩蔖蓾蔨蔝蔮蔂蓽蔞蓶蔱蔦蓧蓨蓰蓯蓹蔘蔠蔰蔋蔙蔯虢"
    	],
    	[
    		"e7a1",
    		"蝖蝣蝤蝷蟡蝳蝘蝔蝛蝒蝡蝚蝑蝞蝭蝪蝐蝎蝟蝝蝯蝬蝺蝮蝜蝥蝏蝻蝵蝢蝧蝩衚褅褌褔褋褗褘褙褆褖褑褎褉覢覤覣觭觰觬諏諆誸諓諑諔諕誻諗誾諀諅諘諃誺誽諙谾豍貏賥賟賙賨賚賝賧趠趜趡趛踠踣踥踤踮踕踛踖踑踙踦踧"
    	],
    	[
    		"e840",
    		"踔踒踘踓踜踗踚輬輤輘輚輠輣輖輗遳遰遯遧遫鄯鄫鄩鄪鄲鄦鄮醅醆醊醁醂醄醀鋐鋃鋄鋀鋙銶鋏鋱鋟鋘鋩鋗鋝鋌鋯鋂鋨鋊鋈鋎鋦鋍鋕鋉鋠鋞鋧鋑鋓"
    	],
    	[
    		"e8a1",
    		"銵鋡鋆銴镼閬閫閮閰隤隢雓霅霈霂靚鞊鞎鞈韐韏頞頝頦頩頨頠頛頧颲餈飺餑餔餖餗餕駜駍駏駓駔駎駉駖駘駋駗駌骳髬髫髳髲髱魆魃魧魴魱魦魶魵魰魨魤魬鳼鳺鳽鳿鳷鴇鴀鳹鳻鴈鴅鴄麃黓鼏鼐儜儓儗儚儑凞匴叡噰噠噮"
    	],
    	[
    		"e940",
    		"噳噦噣噭噲噞噷圜圛壈墽壉墿墺壂墼壆嬗嬙嬛嬡嬔嬓嬐嬖嬨嬚嬠嬞寯嶬嶱嶩嶧嶵嶰嶮嶪嶨嶲嶭嶯嶴幧幨幦幯廩廧廦廨廥彋徼憝憨憖懅憴懆懁懌憺"
    	],
    	[
    		"e9a1",
    		"憿憸憌擗擖擐擏擉撽撉擃擛擳擙攳敿敼斢曈暾曀曊曋曏暽暻暺曌朣樴橦橉橧樲橨樾橝橭橶橛橑樨橚樻樿橁橪橤橐橏橔橯橩橠樼橞橖橕橍橎橆歕歔歖殧殪殫毈毇氄氃氆澭濋澣濇澼濎濈潞濄澽澞濊澨瀄澥澮澺澬澪濏澿澸"
    	],
    	[
    		"ea40",
    		"澢濉澫濍澯澲澰燅燂熿熸燖燀燁燋燔燊燇燏熽燘熼燆燚燛犝犞獩獦獧獬獥獫獪瑿璚璠璔璒璕璡甋疀瘯瘭瘱瘽瘳瘼瘵瘲瘰皻盦瞚瞝瞡瞜瞛瞢瞣瞕瞙"
    	],
    	[
    		"eaa1",
    		"瞗磝磩磥磪磞磣磛磡磢磭磟磠禤穄穈穇窶窸窵窱窷篞篣篧篝篕篥篚篨篹篔篪篢篜篫篘篟糒糔糗糐糑縒縡縗縌縟縠縓縎縜縕縚縢縋縏縖縍縔縥縤罃罻罼罺羱翯耪耩聬膱膦膮膹膵膫膰膬膴膲膷膧臲艕艖艗蕖蕅蕫蕍蕓蕡蕘"
    	],
    	[
    		"eb40",
    		"蕀蕆蕤蕁蕢蕄蕑蕇蕣蔾蕛蕱蕎蕮蕵蕕蕧蕠薌蕦蕝蕔蕥蕬虣虥虤螛螏螗螓螒螈螁螖螘蝹螇螣螅螐螑螝螄螔螜螚螉褞褦褰褭褮褧褱褢褩褣褯褬褟觱諠"
    	],
    	[
    		"eba1",
    		"諢諲諴諵諝謔諤諟諰諈諞諡諨諿諯諻貑貒貐賵賮賱賰賳赬赮趥趧踳踾踸蹀蹅踶踼踽蹁踰踿躽輶輮輵輲輹輷輴遶遹遻邆郺鄳鄵鄶醓醐醑醍醏錧錞錈錟錆錏鍺錸錼錛錣錒錁鍆錭錎錍鋋錝鋺錥錓鋹鋷錴錂錤鋿錩錹錵錪錔錌"
    	],
    	[
    		"ec40",
    		"錋鋾錉錀鋻錖閼闍閾閹閺閶閿閵閽隩雔霋霒霐鞙鞗鞔韰韸頵頯頲餤餟餧餩馞駮駬駥駤駰駣駪駩駧骹骿骴骻髶髺髹髷鬳鮀鮅鮇魼魾魻鮂鮓鮒鮐魺鮕"
    	],
    	[
    		"eca1",
    		"魽鮈鴥鴗鴠鴞鴔鴩鴝鴘鴢鴐鴙鴟麈麆麇麮麭黕黖黺鼒鼽儦儥儢儤儠儩勴嚓嚌嚍嚆嚄嚃噾嚂噿嚁壖壔壏壒嬭嬥嬲嬣嬬嬧嬦嬯嬮孻寱寲嶷幬幪徾徻懃憵憼懧懠懥懤懨懞擯擩擣擫擤擨斁斀斶旚曒檍檖檁檥檉檟檛檡檞檇檓檎"
    	],
    	[
    		"ed40",
    		"檕檃檨檤檑橿檦檚檅檌檒歛殭氉濌澩濴濔濣濜濭濧濦濞濲濝濢濨燡燱燨燲燤燰燢獳獮獯璗璲璫璐璪璭璱璥璯甐甑甒甏疄癃癈癉癇皤盩瞵瞫瞲瞷瞶"
    	],
    	[
    		"eda1",
    		"瞴瞱瞨矰磳磽礂磻磼磲礅磹磾礄禫禨穜穛穖穘穔穚窾竀竁簅簏篲簀篿篻簎篴簋篳簂簉簃簁篸篽簆篰篱簐簊糨縭縼繂縳顈縸縪繉繀繇縩繌縰縻縶繄縺罅罿罾罽翴翲耬膻臄臌臊臅臇膼臩艛艚艜薃薀薏薧薕薠薋薣蕻薤薚薞"
    	],
    	[
    		"ee40",
    		"蕷蕼薉薡蕺蕸蕗薎薖薆薍薙薝薁薢薂薈薅蕹蕶薘薐薟虨螾螪螭蟅螰螬螹螵螼螮蟉蟃蟂蟌螷螯蟄蟊螴螶螿螸螽蟞螲褵褳褼褾襁襒褷襂覭覯覮觲觳謞"
    	],
    	[
    		"eea1",
    		"謘謖謑謅謋謢謏謒謕謇謍謈謆謜謓謚豏豰豲豱豯貕貔賹赯蹎蹍蹓蹐蹌蹇轃轀邅遾鄸醚醢醛醙醟醡醝醠鎡鎃鎯鍤鍖鍇鍼鍘鍜鍶鍉鍐鍑鍠鍭鎏鍌鍪鍹鍗鍕鍒鍏鍱鍷鍻鍡鍞鍣鍧鎀鍎鍙闇闀闉闃闅閷隮隰隬霠霟霘霝霙鞚鞡鞜"
    	],
    	[
    		"ef40",
    		"鞞鞝韕韔韱顁顄顊顉顅顃餥餫餬餪餳餲餯餭餱餰馘馣馡騂駺駴駷駹駸駶駻駽駾駼騃骾髾髽鬁髼魈鮚鮨鮞鮛鮦鮡鮥鮤鮆鮢鮠鮯鴳鵁鵧鴶鴮鴯鴱鴸鴰"
    	],
    	[
    		"efa1",
    		"鵅鵂鵃鴾鴷鵀鴽翵鴭麊麉麍麰黈黚黻黿鼤鼣鼢齔龠儱儭儮嚘嚜嚗嚚嚝嚙奰嬼屩屪巀幭幮懘懟懭懮懱懪懰懫懖懩擿攄擽擸攁攃擼斔旛曚曛曘櫅檹檽櫡櫆檺檶檷櫇檴檭歞毉氋瀇瀌瀍瀁瀅瀔瀎濿瀀濻瀦濼濷瀊爁燿燹爃燽獶"
    	],
    	[
    		"f040",
    		"璸瓀璵瓁璾璶璻瓂甔甓癜癤癙癐癓癗癚皦皽盬矂瞺磿礌礓礔礉礐礒礑禭禬穟簜簩簙簠簟簭簝簦簨簢簥簰繜繐繖繣繘繢繟繑繠繗繓羵羳翷翸聵臑臒"
    	],
    	[
    		"f0a1",
    		"臐艟艞薴藆藀藃藂薳薵薽藇藄薿藋藎藈藅薱薶藒蘤薸薷薾虩蟧蟦蟢蟛蟫蟪蟥蟟蟳蟤蟔蟜蟓蟭蟘蟣螤蟗蟙蠁蟴蟨蟝襓襋襏襌襆襐襑襉謪謧謣謳謰謵譇謯謼謾謱謥謷謦謶謮謤謻謽謺豂豵貙貘貗賾贄贂贀蹜蹢蹠蹗蹖蹞蹥蹧"
    	],
    	[
    		"f140",
    		"蹛蹚蹡蹝蹩蹔轆轇轈轋鄨鄺鄻鄾醨醥醧醯醪鎵鎌鎒鎷鎛鎝鎉鎧鎎鎪鎞鎦鎕鎈鎙鎟鎍鎱鎑鎲鎤鎨鎴鎣鎥闒闓闑隳雗雚巂雟雘雝霣霢霥鞬鞮鞨鞫鞤鞪"
    	],
    	[
    		"f1a1",
    		"鞢鞥韗韙韖韘韺顐顑顒颸饁餼餺騏騋騉騍騄騑騊騅騇騆髀髜鬈鬄鬅鬩鬵魊魌魋鯇鯆鯃鮿鯁鮵鮸鯓鮶鯄鮹鮽鵜鵓鵏鵊鵛鵋鵙鵖鵌鵗鵒鵔鵟鵘鵚麎麌黟鼁鼀鼖鼥鼫鼪鼩鼨齌齕儴儵劖勷厴嚫嚭嚦嚧嚪嚬壚壝壛夒嬽嬾嬿巃幰"
    	],
    	[
    		"f240",
    		"徿懻攇攐攍攉攌攎斄旞旝曞櫧櫠櫌櫑櫙櫋櫟櫜櫐櫫櫏櫍櫞歠殰氌瀙瀧瀠瀖瀫瀡瀢瀣瀩瀗瀤瀜瀪爌爊爇爂爅犥犦犤犣犡瓋瓅璷瓃甖癠矉矊矄矱礝礛"
    	],
    	[
    		"f2a1",
    		"礡礜礗礞禰穧穨簳簼簹簬簻糬糪繶繵繸繰繷繯繺繲繴繨罋罊羃羆羷翽翾聸臗臕艤艡艣藫藱藭藙藡藨藚藗藬藲藸藘藟藣藜藑藰藦藯藞藢蠀蟺蠃蟶蟷蠉蠌蠋蠆蟼蠈蟿蠊蠂襢襚襛襗襡襜襘襝襙覈覷覶觶譐譈譊譀譓譖譔譋譕"
    	],
    	[
    		"f340",
    		"譑譂譒譗豃豷豶貚贆贇贉趬趪趭趫蹭蹸蹳蹪蹯蹻軂轒轑轏轐轓辴酀鄿醰醭鏞鏇鏏鏂鏚鏐鏹鏬鏌鏙鎩鏦鏊鏔鏮鏣鏕鏄鏎鏀鏒鏧镽闚闛雡霩霫霬霨霦"
    	],
    	[
    		"f3a1",
    		"鞳鞷鞶韝韞韟顜顙顝顗颿颽颻颾饈饇饃馦馧騚騕騥騝騤騛騢騠騧騣騞騜騔髂鬋鬊鬎鬌鬷鯪鯫鯠鯞鯤鯦鯢鯰鯔鯗鯬鯜鯙鯥鯕鯡鯚鵷鶁鶊鶄鶈鵱鶀鵸鶆鶋鶌鵽鵫鵴鵵鵰鵩鶅鵳鵻鶂鵯鵹鵿鶇鵨麔麑黀黼鼭齀齁齍齖齗齘匷嚲"
    	],
    	[
    		"f440",
    		"嚵嚳壣孅巆巇廮廯忀忁懹攗攖攕攓旟曨曣曤櫳櫰櫪櫨櫹櫱櫮櫯瀼瀵瀯瀷瀴瀱灂瀸瀿瀺瀹灀瀻瀳灁爓爔犨獽獼璺皫皪皾盭矌矎矏矍矲礥礣礧礨礤礩"
    	],
    	[
    		"f4a1",
    		"禲穮穬穭竷籉籈籊籇籅糮繻繾纁纀羺翿聹臛臙舋艨艩蘢藿蘁藾蘛蘀藶蘄蘉蘅蘌藽蠙蠐蠑蠗蠓蠖襣襦覹觷譠譪譝譨譣譥譧譭趮躆躈躄轙轖轗轕轘轚邍酃酁醷醵醲醳鐋鐓鏻鐠鐏鐔鏾鐕鐐鐨鐙鐍鏵鐀鏷鐇鐎鐖鐒鏺鐉鏸鐊鏿"
    	],
    	[
    		"f540",
    		"鏼鐌鏶鐑鐆闞闠闟霮霯鞹鞻韽韾顠顢顣顟飁飂饐饎饙饌饋饓騲騴騱騬騪騶騩騮騸騭髇髊髆鬐鬒鬑鰋鰈鯷鰅鰒鯸鱀鰇鰎鰆鰗鰔鰉鶟鶙鶤鶝鶒鶘鶐鶛"
    	],
    	[
    		"f5a1",
    		"鶠鶔鶜鶪鶗鶡鶚鶢鶨鶞鶣鶿鶩鶖鶦鶧麙麛麚黥黤黧黦鼰鼮齛齠齞齝齙龑儺儹劘劗囃嚽嚾孈孇巋巏廱懽攛欂櫼欃櫸欀灃灄灊灈灉灅灆爝爚爙獾甗癪矐礭礱礯籔籓糲纊纇纈纋纆纍罍羻耰臝蘘蘪蘦蘟蘣蘜蘙蘧蘮蘡蘠蘩蘞蘥"
    	],
    	[
    		"f640",
    		"蠩蠝蠛蠠蠤蠜蠫衊襭襩襮襫觺譹譸譅譺譻贐贔趯躎躌轞轛轝酆酄酅醹鐿鐻鐶鐩鐽鐼鐰鐹鐪鐷鐬鑀鐱闥闤闣霵霺鞿韡顤飉飆飀饘饖騹騽驆驄驂驁騺"
    	],
    	[
    		"f6a1",
    		"騿髍鬕鬗鬘鬖鬺魒鰫鰝鰜鰬鰣鰨鰩鰤鰡鶷鶶鶼鷁鷇鷊鷏鶾鷅鷃鶻鶵鷎鶹鶺鶬鷈鶱鶭鷌鶳鷍鶲鹺麜黫黮黭鼛鼘鼚鼱齎齥齤龒亹囆囅囋奱孋孌巕巑廲攡攠攦攢欋欈欉氍灕灖灗灒爞爟犩獿瓘瓕瓙瓗癭皭礵禴穰穱籗籜籙籛籚"
    	],
    	[
    		"f740",
    		"糴糱纑罏羇臞艫蘴蘵蘳蘬蘲蘶蠬蠨蠦蠪蠥襱覿覾觻譾讄讂讆讅譿贕躕躔躚躒躐躖躗轠轢酇鑌鑐鑊鑋鑏鑇鑅鑈鑉鑆霿韣顪顩飋饔饛驎驓驔驌驏驈驊"
    	],
    	[
    		"f7a1",
    		"驉驒驐髐鬙鬫鬻魖魕鱆鱈鰿鱄鰹鰳鱁鰼鰷鰴鰲鰽鰶鷛鷒鷞鷚鷋鷐鷜鷑鷟鷩鷙鷘鷖鷵鷕鷝麶黰鼵鼳鼲齂齫龕龢儽劙壨壧奲孍巘蠯彏戁戃戄攩攥斖曫欑欒欏毊灛灚爢玂玁玃癰矔籧籦纕艬蘺虀蘹蘼蘱蘻蘾蠰蠲蠮蠳襶襴襳觾"
    	],
    	[
    		"f840",
    		"讌讎讋讈豅贙躘轤轣醼鑢鑕鑝鑗鑞韄韅頀驖驙鬞鬟鬠鱒鱘鱐鱊鱍鱋鱕鱙鱌鱎鷻鷷鷯鷣鷫鷸鷤鷶鷡鷮鷦鷲鷰鷢鷬鷴鷳鷨鷭黂黐黲黳鼆鼜鼸鼷鼶齃齏"
    	],
    	[
    		"f8a1",
    		"齱齰齮齯囓囍孎屭攭曭曮欓灟灡灝灠爣瓛瓥矕礸禷禶籪纗羉艭虃蠸蠷蠵衋讔讕躞躟躠躝醾醽釂鑫鑨鑩雥靆靃靇韇韥驞髕魙鱣鱧鱦鱢鱞鱠鸂鷾鸇鸃鸆鸅鸀鸁鸉鷿鷽鸄麠鼞齆齴齵齶囔攮斸欘欙欗欚灢爦犪矘矙礹籩籫糶纚"
    	],
    	[
    		"f940",
    		"纘纛纙臠臡虆虇虈襹襺襼襻觿讘讙躥躤躣鑮鑭鑯鑱鑳靉顲饟鱨鱮鱭鸋鸍鸐鸏鸒鸑麡黵鼉齇齸齻齺齹圞灦籯蠼趲躦釃鑴鑸鑶鑵驠鱴鱳鱱鱵鸔鸓黶鼊"
    	],
    	[
    		"f9a1",
    		"龤灨灥糷虪蠾蠽蠿讞貜躩軉靋顳顴飌饡馫驤驦驧鬤鸕鸗齈戇欞爧虌躨钂钀钁驩驨鬮鸙爩虋讟钃鱹麷癵驫鱺鸝灩灪麤齾齉龘碁銹裏墻恒粧嫺╔╦╗╠╬╣╚╩╝╒╤╕╞╪╡╘╧╛╓╥╖╟╫╢╙╨╜║═╭╮╰╯▓"
    	]
    ];

    var require$$7 = [
    	[
    		"8740",
    		"䏰䰲䘃䖦䕸𧉧䵷䖳𧲱䳢𧳅㮕䜶䝄䱇䱀𤊿𣘗𧍒𦺋𧃒䱗𪍑䝏䗚䲅𧱬䴇䪤䚡𦬣爥𥩔𡩣𣸆𣽡晍囻"
    	],
    	[
    		"8767",
    		"綕夝𨮹㷴霴𧯯寛𡵞媤㘥𩺰嫑宷峼杮薓𩥅瑡璝㡵𡵓𣚞𦀡㻬"
    	],
    	[
    		"87a1",
    		"𥣞㫵竼龗𤅡𨤍𣇪𠪊𣉞䌊蒄龖鐯䤰蘓墖靊鈘秐稲晠権袝瑌篅枂稬剏遆㓦珄𥶹瓆鿇垳䤯呌䄱𣚎堘穲𧭥讏䚮𦺈䆁𥶙箮𢒼鿈𢓁𢓉𢓌鿉蔄𣖻䂴鿊䓡𪷿拁灮鿋"
    	],
    	[
    		"8840",
    		"㇀",
    		4,
    		"𠄌㇅𠃑𠃍㇆㇇𠃋𡿨㇈𠃊㇉㇊㇋㇌𠄎㇍㇎ĀÁǍÀĒÉĚÈŌÓǑÒ࿿Ê̄Ế࿿Ê̌ỀÊāáǎàɑēéěèīíǐìōóǒòūúǔùǖǘǚ"
    	],
    	[
    		"88a1",
    		"ǜü࿿ê̄ế࿿ê̌ềêɡ⏚⏛"
    	],
    	[
    		"8940",
    		"𪎩𡅅"
    	],
    	[
    		"8943",
    		"攊"
    	],
    	[
    		"8946",
    		"丽滝鵎釟"
    	],
    	[
    		"894c",
    		"𧜵撑会伨侨兖兴农凤务动医华发变团声处备夲头学实実岚庆总斉柾栄桥济炼电纤纬纺织经统缆缷艺苏药视设询车轧轮"
    	],
    	[
    		"89a1",
    		"琑糼緍楆竉刧"
    	],
    	[
    		"89ab",
    		"醌碸酞肼"
    	],
    	[
    		"89b0",
    		"贋胶𠧧"
    	],
    	[
    		"89b5",
    		"肟黇䳍鷉鸌䰾𩷶𧀎鸊𪄳㗁"
    	],
    	[
    		"89c1",
    		"溚舾甙"
    	],
    	[
    		"89c5",
    		"䤑马骏龙禇𨑬𡷊𠗐𢫦两亁亀亇亿仫伷㑌侽㹈倃傈㑽㒓㒥円夅凛凼刅争剹劐匧㗇厩㕑厰㕓参吣㕭㕲㚁咓咣咴咹哐哯唘唣唨㖘唿㖥㖿嗗㗅"
    	],
    	[
    		"8a40",
    		"𧶄唥"
    	],
    	[
    		"8a43",
    		"𠱂𠴕𥄫喐𢳆㧬𠍁蹆𤶸𩓥䁓𨂾睺𢰸㨴䟕𨅝𦧲𤷪擝𠵼𠾴𠳕𡃴撍蹾𠺖𠰋𠽤𢲩𨉖𤓓"
    	],
    	[
    		"8a64",
    		"𠵆𩩍𨃩䟴𤺧𢳂骲㩧𩗴㿭㔆𥋇𩟔𧣈𢵄鵮頕"
    	],
    	[
    		"8a76",
    		"䏙𦂥撴哣𢵌𢯊𡁷㧻𡁯"
    	],
    	[
    		"8aa1",
    		"𦛚𦜖𧦠擪𥁒𠱃蹨𢆡𨭌𠜱"
    	],
    	[
    		"8aac",
    		"䠋𠆩㿺塳𢶍"
    	],
    	[
    		"8ab2",
    		"𤗈𠓼𦂗𠽌𠶖啹䂻䎺"
    	],
    	[
    		"8abb",
    		"䪴𢩦𡂝膪飵𠶜捹㧾𢝵跀嚡摼㹃"
    	],
    	[
    		"8ac9",
    		"𪘁𠸉𢫏𢳉"
    	],
    	[
    		"8ace",
    		"𡃈𣧂㦒㨆𨊛㕸𥹉𢃇噒𠼱𢲲𩜠㒼氽𤸻"
    	],
    	[
    		"8adf",
    		"𧕴𢺋𢈈𪙛𨳍𠹺𠰴𦠜羓𡃏𢠃𢤹㗻𥇣𠺌𠾍𠺪㾓𠼰𠵇𡅏𠹌"
    	],
    	[
    		"8af6",
    		"𠺫𠮩𠵈𡃀𡄽㿹𢚖搲𠾭"
    	],
    	[
    		"8b40",
    		"𣏴𧘹𢯎𠵾𠵿𢱑𢱕㨘𠺘𡃇𠼮𪘲𦭐𨳒𨶙𨳊閪哌苄喹"
    	],
    	[
    		"8b55",
    		"𩻃鰦骶𧝞𢷮煀腭胬尜𦕲脴㞗卟𨂽醶𠻺𠸏𠹷𠻻㗝𤷫㘉𠳖嚯𢞵𡃉𠸐𠹸𡁸𡅈𨈇𡑕𠹹𤹐𢶤婔𡀝𡀞𡃵𡃶垜𠸑"
    	],
    	[
    		"8ba1",
    		"𧚔𨋍𠾵𠹻𥅾㜃𠾶𡆀𥋘𪊽𤧚𡠺𤅷𨉼墙剨㘚𥜽箲孨䠀䬬鼧䧧鰟鮍𥭴𣄽嗻㗲嚉丨夂𡯁屮靑𠂆乛亻㔾尣彑忄㣺扌攵歺氵氺灬爫丬犭𤣩罒礻糹罓𦉪㓁"
    	],
    	[
    		"8bde",
    		"𦍋耂肀𦘒𦥑卝衤见𧢲讠贝钅镸长门𨸏韦页风飞饣𩠐鱼鸟黄歯龜丷𠂇阝户钢"
    	],
    	[
    		"8c40",
    		"倻淾𩱳龦㷉袏𤅎灷峵䬠𥇍㕙𥴰愢𨨲辧釶熑朙玺𣊁𪄇㲋𡦀䬐磤琂冮𨜏䀉橣𪊺䈣蘏𠩯稪𩥇𨫪靕灍匤𢁾鏴盙𨧣龧矝亣俰傼丯众龨吴綋墒壐𡶶庒庙忂𢜒斋"
    	],
    	[
    		"8ca1",
    		"𣏹椙橃𣱣泿"
    	],
    	[
    		"8ca7",
    		"爀𤔅玌㻛𤨓嬕璹讃𥲤𥚕窓篬糃繬苸薗龩袐龪躹龫迏蕟駠鈡龬𨶹𡐿䁱䊢娚"
    	],
    	[
    		"8cc9",
    		"顨杫䉶圽"
    	],
    	[
    		"8cce",
    		"藖𤥻芿𧄍䲁𦵴嵻𦬕𦾾龭龮宖龯曧繛湗秊㶈䓃𣉖𢞖䎚䔶"
    	],
    	[
    		"8ce6",
    		"峕𣬚諹屸㴒𣕑嵸龲煗䕘𤃬𡸣䱷㥸㑊𠆤𦱁諌侴𠈹妿腬顖𩣺弻"
    	],
    	[
    		"8d40",
    		"𠮟"
    	],
    	[
    		"8d42",
    		"𢇁𨥭䄂䚻𩁹㼇龳𪆵䃸㟖䛷𦱆䅼𨚲𧏿䕭㣔𥒚䕡䔛䶉䱻䵶䗪㿈𤬏㙡䓞䒽䇭崾嵈嵖㷼㠏嶤嶹㠠㠸幂庽弥徃㤈㤔㤿㥍惗愽峥㦉憷憹懏㦸戬抐拥挘㧸嚱"
    	],
    	[
    		"8da1",
    		"㨃揢揻搇摚㩋擀崕嘡龟㪗斆㪽旿晓㫲暒㬢朖㭂枤栀㭘桊梄㭲㭱㭻椉楃牜楤榟榅㮼槖㯝橥橴橱檂㯬檙㯲檫檵櫔櫶殁毁毪汵沪㳋洂洆洦涁㳯涤涱渕渘温溆𨧀溻滢滚齿滨滩漤漴㵆𣽁澁澾㵪㵵熷岙㶊瀬㶑灐灔灯灿炉𠌥䏁㗱𠻘"
    	],
    	[
    		"8e40",
    		"𣻗垾𦻓焾𥟠㙎榢𨯩孴穉𥣡𩓙穥穽𥦬窻窰竂竃燑𦒍䇊竚竝竪䇯咲𥰁笋筕笩𥌎𥳾箢筯莜𥮴𦱿篐萡箒箸𥴠㶭𥱥蒒篺簆簵𥳁籄粃𤢂粦晽𤕸糉糇糦籴糳糵糎"
    	],
    	[
    		"8ea1",
    		"繧䔝𦹄絝𦻖璍綉綫焵綳緒𤁗𦀩緤㴓緵𡟹緥𨍭縝𦄡𦅚繮纒䌫鑬縧罀罁罇礶𦋐駡羗𦍑羣𡙡𠁨䕜𣝦䔃𨌺翺𦒉者耈耝耨耯𪂇𦳃耻耼聡𢜔䦉𦘦𣷣𦛨朥肧𨩈脇脚墰𢛶汿𦒘𤾸擧𡒊舘𡡞橓𤩥𤪕䑺舩𠬍𦩒𣵾俹𡓽蓢荢𦬊𤦧𣔰𡝳𣷸芪椛芳䇛"
    	],
    	[
    		"8f40",
    		"蕋苐茚𠸖𡞴㛁𣅽𣕚艻苢茘𣺋𦶣𦬅𦮗𣗎㶿茝嗬莅䔋𦶥莬菁菓㑾𦻔橗蕚㒖𦹂𢻯葘𥯤葱㷓䓤檧葊𣲵祘蒨𦮖𦹷𦹃蓞萏莑䒠蒓蓤𥲑䉀𥳀䕃蔴嫲𦺙䔧蕳䔖枿蘖"
    	],
    	[
    		"8fa1",
    		"𨘥𨘻藁𧂈蘂𡖂𧃍䕫䕪蘨㙈𡢢号𧎚虾蝱𪃸蟮𢰧螱蟚蠏噡虬桖䘏衅衆𧗠𣶹𧗤衞袜䙛袴袵揁装睷𧜏覇覊覦覩覧覼𨨥觧𧤤𧪽誜瞓釾誐𧩙竩𧬺𣾏䜓𧬸煼謌謟𥐰𥕥謿譌譍誩𤩺讐讛誯𡛟䘕衏貛𧵔𧶏貫㜥𧵓賖𧶘𧶽贒贃𡤐賛灜贑𤳉㻐起"
    	],
    	[
    		"9040",
    		"趩𨀂𡀔𤦊㭼𨆼𧄌竧躭躶軃鋔輙輭𨍥𨐒辥錃𪊟𠩐辳䤪𨧞𨔽𣶻廸𣉢迹𪀔𨚼𨔁𢌥㦀𦻗逷𨔼𧪾遡𨕬𨘋邨𨜓郄𨛦邮都酧㫰醩釄粬𨤳𡺉鈎沟鉁鉢𥖹銹𨫆𣲛𨬌𥗛"
    	],
    	[
    		"90a1",
    		"𠴱錬鍫𨫡𨯫炏嫃𨫢𨫥䥥鉄𨯬𨰹𨯿鍳鑛躼閅閦鐦閠濶䊹𢙺𨛘𡉼𣸮䧟氜陻隖䅬隣𦻕懚隶磵𨫠隽双䦡𦲸𠉴𦐐𩂯𩃥𤫑𡤕𣌊霱虂霶䨏䔽䖅𤫩灵孁霛靜𩇕靗孊𩇫靟鐥僐𣂷𣂼鞉鞟鞱鞾韀韒韠𥑬韮琜𩐳響韵𩐝𧥺䫑頴頳顋顦㬎𧅵㵑𠘰𤅜"
    	],
    	[
    		"9140",
    		"𥜆飊颷飈飇䫿𦴧𡛓喰飡飦飬鍸餹𤨩䭲𩡗𩤅駵騌騻騐驘𥜥㛄𩂱𩯕髠髢𩬅髴䰎鬔鬭𨘀倴鬴𦦨㣃𣁽魐魀𩴾婅𡡣鮎𤉋鰂鯿鰌𩹨鷔𩾷𪆒𪆫𪃡𪄣𪇟鵾鶃𪄴鸎梈"
    	],
    	[
    		"91a1",
    		"鷄𢅛𪆓𪈠𡤻𪈳鴹𪂹𪊴麐麕麞麢䴴麪麯𤍤黁㭠㧥㴝伲㞾𨰫鼂鼈䮖鐤𦶢鼗鼖鼹嚟嚊齅馸𩂋韲葿齢齩竜龎爖䮾𤥵𤦻煷𤧸𤍈𤩑玞𨯚𡣺禟𨥾𨸶鍩鏳𨩄鋬鎁鏋𨥬𤒹爗㻫睲穃烐𤑳𤏸煾𡟯炣𡢾𣖙㻇𡢅𥐯𡟸㜢𡛻𡠹㛡𡝴𡣑𥽋㜣𡛀坛𤨥𡏾𡊨"
    	],
    	[
    		"9240",
    		"𡏆𡒶蔃𣚦蔃葕𤦔𧅥𣸱𥕜𣻻𧁒䓴𣛮𩦝𦼦柹㜳㰕㷧塬𡤢栐䁗𣜿𤃡𤂋𤄏𦰡哋嚞𦚱嚒𠿟𠮨𠸍鏆𨬓鎜仸儫㠙𤐶亼𠑥𠍿佋侊𥙑婨𠆫𠏋㦙𠌊𠐔㐵伩𠋀𨺳𠉵諚𠈌亘"
    	],
    	[
    		"92a1",
    		"働儍侢伃𤨎𣺊佂倮偬傁俌俥偘僼兙兛兝兞湶𣖕𣸹𣺿浲𡢄𣺉冨凃𠗠䓝𠒣𠒒𠒑赺𨪜𠜎剙劤𠡳勡鍮䙺熌𤎌𠰠𤦬𡃤槑𠸝瑹㻞璙琔瑖玘䮎𤪼𤂍叐㖄爏𤃉喴𠍅响𠯆圝鉝雴鍦埝垍坿㘾壋媙𨩆𡛺𡝯𡜐娬妸銏婾嫏娒𥥆𡧳𡡡𤊕㛵洅瑃娡𥺃"
    	],
    	[
    		"9340",
    		"媁𨯗𠐓鏠璌𡌃焅䥲鐈𨧻鎽㞠尞岞幞幈𡦖𡥼𣫮廍孏𡤃𡤄㜁𡢠㛝𡛾㛓脪𨩇𡶺𣑲𨦨弌弎𡤧𡞫婫𡜻孄蘔𧗽衠恾𢡠𢘫忛㺸𢖯𢖾𩂈𦽳懀𠀾𠁆𢘛憙憘恵𢲛𢴇𤛔𩅍"
    	],
    	[
    		"93a1",
    		"摱𤙥𢭪㨩𢬢𣑐𩣪𢹸挷𪑛撶挱揑𤧣𢵧护𢲡搻敫楲㯴𣂎𣊭𤦉𣊫唍𣋠𡣙𩐿曎𣊉𣆳㫠䆐𥖄𨬢𥖏𡛼𥕛𥐥磮𣄃𡠪𣈴㑤𣈏𣆂𤋉暎𦴤晫䮓昰𧡰𡷫晣𣋒𣋡昞𥡲㣑𣠺𣞼㮙𣞢𣏾瓐㮖枏𤘪梶栞㯄檾㡣𣟕𤒇樳橒櫉欅𡤒攑梘橌㯗橺歗𣿀𣲚鎠鋲𨯪𨫋"
    	],
    	[
    		"9440",
    		"銉𨀞𨧜鑧涥漋𤧬浧𣽿㶏渄𤀼娽渊塇洤硂焻𤌚𤉶烱牐犇犔𤞏𤜥兹𤪤𠗫瑺𣻸𣙟𤩊𤤗𥿡㼆㺱𤫟𨰣𣼵悧㻳瓌琼鎇琷䒟𦷪䕑疃㽣𤳙𤴆㽘畕癳𪗆㬙瑨𨫌𤦫𤦎㫻"
    	],
    	[
    		"94a1",
    		"㷍𤩎㻿𤧅𤣳釺圲鍂𨫣𡡤僟𥈡𥇧睸𣈲眎眏睻𤚗𣞁㩞𤣰琸璛㺿𤪺𤫇䃈𤪖𦆮錇𥖁砞碍碈磒珐祙𧝁𥛣䄎禛蒖禥樭𣻺稺秴䅮𡛦䄲鈵秱𠵌𤦌𠊙𣶺𡝮㖗啫㕰㚪𠇔𠰍竢婙𢛵𥪯𥪜娍𠉛磰娪𥯆竾䇹籝籭䈑𥮳𥺼𥺦糍𤧹𡞰粎籼粮檲緜縇緓罎𦉡"
    	],
    	[
    		"9540",
    		"𦅜𧭈綗𥺂䉪𦭵𠤖柖𠁎𣗏埄𦐒𦏸𤥢翝笧𠠬𥫩𥵃笌𥸎駦虅驣樜𣐿㧢𤧷𦖭騟𦖠蒀𧄧𦳑䓪脷䐂胆脉腂𦞴飃𦩂艢艥𦩑葓𦶧蘐𧈛媆䅿𡡀嬫𡢡嫤𡣘蚠蜨𣶏蠭𧐢娂"
    	],
    	[
    		"95a1",
    		"衮佅袇袿裦襥襍𥚃襔𧞅𧞄𨯵𨯙𨮜𨧹㺭蒣䛵䛏㟲訽訜𩑈彍鈫𤊄旔焩烄𡡅鵭貟賩𧷜妚矃姰䍮㛔踪躧𤰉輰轊䋴汘澻𢌡䢛潹溋𡟚鯩㚵𤤯邻邗啱䤆醻鐄𨩋䁢𨫼鐧𨰝𨰻蓥訫閙閧閗閖𨴴瑅㻂𤣿𤩂𤏪㻧𣈥随𨻧𨹦𨹥㻌𤧭𤩸𣿮琒瑫㻼靁𩂰"
    	],
    	[
    		"9640",
    		"桇䨝𩂓𥟟靝鍨𨦉𨰦𨬯𦎾銺嬑譩䤼珹𤈛鞛靱餸𠼦巁𨯅𤪲頟𩓚鋶𩗗釥䓀𨭐𤩧𨭤飜𨩅㼀鈪䤥萔餻饍𧬆㷽馛䭯馪驜𨭥𥣈檏騡嫾騯𩣱䮐𩥈馼䮽䮗鍽塲𡌂堢𤦸"
    	],
    	[
    		"96a1",
    		"𡓨硄𢜟𣶸棅㵽鑘㤧慐𢞁𢥫愇鱏鱓鱻鰵鰐魿鯏𩸭鮟𪇵𪃾鴡䲮𤄄鸘䲰鴌𪆴𪃭𪃳𩤯鶥蒽𦸒𦿟𦮂藼䔳𦶤𦺄𦷰萠藮𦸀𣟗𦁤秢𣖜𣙀䤭𤧞㵢鏛銾鍈𠊿碹鉷鑍俤㑀遤𥕝砽硔碶硋𡝗𣇉𤥁㚚佲濚濙瀞瀞吔𤆵垻壳垊鴖埗焴㒯𤆬燫𦱀𤾗嬨𡞵𨩉"
    	],
    	[
    		"9740",
    		"愌嫎娋䊼𤒈㜬䭻𨧼鎻鎸𡣖𠼝葲𦳀𡐓𤋺𢰦𤏁妔𣶷𦝁綨𦅛𦂤𤦹𤦋𨧺鋥珢㻩璴𨭣𡢟㻡𤪳櫘珳珻㻖𤨾𤪔𡟙𤩦𠎧𡐤𤧥瑈𤤖炥𤥶銄珦鍟𠓾錱𨫎𨨖鎆𨯧𥗕䤵𨪂煫"
    	],
    	[
    		"97a1",
    		"𤥃𠳿嚤𠘚𠯫𠲸唂秄𡟺緾𡛂𤩐𡡒䔮鐁㜊𨫀𤦭妰𡢿𡢃𧒄媡㛢𣵛㚰鉟婹𨪁𡡢鍴㳍𠪴䪖㦊僴㵩㵌𡎜煵䋻𨈘渏𩃤䓫浗𧹏灧沯㳖𣿭𣸭渂漌㵯𠏵畑㚼㓈䚀㻚䡱姄鉮䤾轁𨰜𦯀堒埈㛖𡑒烾𤍢𤩱𢿣𡊰𢎽梹楧𡎘𣓥𧯴𣛟𨪃𣟖𣏺𤲟樚𣚭𦲷萾䓟䓎"
    	],
    	[
    		"9840",
    		"𦴦𦵑𦲂𦿞漗𧄉茽𡜺菭𦲀𧁓𡟛妉媂𡞳婡婱𡤅𤇼㜭姯𡜼㛇熎鎐暚𤊥婮娫𤊓樫𣻹𧜶𤑛𤋊焝𤉙𨧡侰𦴨峂𤓎𧹍𤎽樌𤉖𡌄炦焳𤏩㶥泟勇𤩏繥姫崯㷳彜𤩝𡟟綤萦"
    	],
    	[
    		"98a1",
    		"咅𣫺𣌀𠈔坾𠣕𠘙㿥𡾞𪊶瀃𩅛嵰玏糓𨩙𩐠俈翧狍猐𧫴猸猹𥛶獁獈㺩𧬘遬燵𤣲珡臶㻊県㻑沢国琙琞琟㻢㻰㻴㻺瓓㼎㽓畂畭畲疍㽼痈痜㿀癍㿗癴㿜発𤽜熈嘣覀塩䀝睃䀹条䁅㗛瞘䁪䁯属瞾矋売砘点砜䂨砹硇硑硦葈𥔵礳栃礲䄃"
    	],
    	[
    		"9940",
    		"䄉禑禙辻稆込䅧窑䆲窼艹䇄竏竛䇏両筢筬筻簒簛䉠䉺类粜䊌粸䊔糭输烀𠳏総緔緐緽羮羴犟䎗耠耥笹耮耱联㷌垴炠肷胩䏭脌猪脎脒畠脔䐁㬹腖腙腚"
    	],
    	[
    		"99a1",
    		"䐓堺腼膄䐥膓䐭膥埯臁臤艔䒏芦艶苊苘苿䒰荗险榊萅烵葤惣蒈䔄蒾蓡蓸蔐蔸蕒䔻蕯蕰藠䕷虲蚒蚲蛯际螋䘆䘗袮裿褤襇覑𧥧訩訸誔誴豑賔賲贜䞘塟跃䟭仮踺嗘坔蹱嗵躰䠷軎転軤軭軲辷迁迊迌逳駄䢭飠鈓䤞鈨鉘鉫銱銮銿"
    	],
    	[
    		"9a40",
    		"鋣鋫鋳鋴鋽鍃鎄鎭䥅䥑麿鐗匁鐝鐭鐾䥪鑔鑹锭関䦧间阳䧥枠䨤靀䨵鞲韂噔䫤惨颹䬙飱塄餎餙冴餜餷饂饝饢䭰駅䮝騼鬏窃魩鮁鯝鯱鯴䱭鰠㝯𡯂鵉鰺"
    	],
    	[
    		"9aa1",
    		"黾噐鶓鶽鷀鷼银辶鹻麬麱麽黆铜黢黱黸竈齄𠂔𠊷𠎠椚铃妬𠓗塀铁㞹𠗕𠘕𠙶𡚺块煳𠫂𠫍𠮿呪吆𠯋咞𠯻𠰻𠱓𠱥𠱼惧𠲍噺𠲵𠳝𠳭𠵯𠶲𠷈楕鰯螥𠸄𠸎𠻗𠾐𠼭𠹳尠𠾼帋𡁜𡁏𡁶朞𡁻𡂈𡂖㙇𡂿𡃓𡄯𡄻卤蒭𡋣𡍵𡌶讁𡕷𡘙𡟃𡟇乸炻𡠭𡥪"
    	],
    	[
    		"9b40",
    		"𡨭𡩅𡰪𡱰𡲬𡻈拃𡻕𡼕熘桕𢁅槩㛈𢉼𢏗𢏺𢜪𢡱𢥏苽𢥧𢦓𢫕覥𢫨辠𢬎鞸𢬿顇骽𢱌"
    	],
    	[
    		"9b62",
    		"𢲈𢲷𥯨𢴈𢴒𢶷𢶕𢹂𢽴𢿌𣀳𣁦𣌟𣏞徱晈暿𧩹𣕧𣗳爁𤦺矗𣘚𣜖纇𠍆墵朎"
    	],
    	[
    		"9ba1",
    		"椘𣪧𧙗𥿢𣸑𣺹𧗾𢂚䣐䪸𤄙𨪚𤋮𤌍𤀻𤌴𤎖𤩅𠗊凒𠘑妟𡺨㮾𣳿𤐄𤓖垈𤙴㦛𤜯𨗨𩧉㝢𢇃譞𨭎駖𤠒𤣻𤨕爉𤫀𠱸奥𤺥𤾆𠝹軚𥀬劏圿煱𥊙𥐙𣽊𤪧喼𥑆𥑮𦭒釔㑳𥔿𧘲𥕞䜘𥕢𥕦𥟇𤤿𥡝偦㓻𣏌惞𥤃䝼𨥈𥪮𥮉𥰆𡶐垡煑澶𦄂𧰒遖𦆲𤾚譢𦐂𦑊"
    	],
    	[
    		"9c40",
    		"嵛𦯷輶𦒄𡤜諪𤧶𦒈𣿯𦔒䯀𦖿𦚵𢜛鑥𥟡憕娧晉侻嚹𤔡𦛼乪𤤴陖涏𦲽㘘襷𦞙𦡮𦐑𦡞營𦣇筂𩃀𠨑𦤦鄄𦤹穅鷰𦧺騦𦨭㙟𦑩𠀡禃𦨴𦭛崬𣔙菏𦮝䛐𦲤画补𦶮墶"
    	],
    	[
    		"9ca1",
    		"㜜𢖍𧁋𧇍㱔𧊀𧊅銁𢅺𧊋錰𧋦𤧐氹钟𧑐𠻸蠧裵𢤦𨑳𡞱溸𤨪𡠠㦤㚹尐秣䔿暶𩲭𩢤襃𧟌𧡘囖䃟𡘊㦡𣜯𨃨𡏅熭荦𧧝𩆨婧䲷𧂯𨦫𧧽𧨊𧬋𧵦𤅺筃祾𨀉澵𪋟樃𨌘厢𦸇鎿栶靝𨅯𨀣𦦵𡏭𣈯𨁈嶅𨰰𨂃圕頣𨥉嶫𤦈斾槕叒𤪥𣾁㰑朶𨂐𨃴𨄮𡾡𨅏"
    	],
    	[
    		"9d40",
    		"𨆉𨆯𨈚𨌆𨌯𨎊㗊𨑨𨚪䣺揦𨥖砈鉕𨦸䏲𨧧䏟𨧨𨭆𨯔姸𨰉輋𨿅𩃬筑𩄐𩄼㷷𩅞𤫊运犏嚋𩓧𩗩𩖰𩖸𩜲𩣑𩥉𩥪𩧃𩨨𩬎𩵚𩶛纟𩻸𩼣䲤镇𪊓熢𪋿䶑递𪗋䶜𠲜达嗁"
    	],
    	[
    		"9da1",
    		"辺𢒰边𤪓䔉繿潖檱仪㓤𨬬𧢝㜺躀𡟵𨀤𨭬𨮙𧨾𦚯㷫𧙕𣲷𥘵𥥖亚𥺁𦉘嚿𠹭踎孭𣺈𤲞揞拐𡟶𡡻攰嘭𥱊吚𥌑㷆𩶘䱽嘢嘞罉𥻘奵𣵀蝰东𠿪𠵉𣚺脗鵞贘瘻鱅癎瞹鍅吲腈苷嘥脲萘肽嗪祢噃吖𠺝㗎嘅嗱曱𨋢㘭甴嗰喺咗啲𠱁𠲖廐𥅈𠹶𢱢"
    	],
    	[
    		"9e40",
    		"𠺢麫絚嗞𡁵抝靭咔賍燶酶揼掹揾啩𢭃鱲𢺳冚㓟𠶧冧呍唞唓癦踭𦢊疱肶蠄螆裇膶萜𡃁䓬猄𤜆宐茋𦢓噻𢛴𧴯𤆣𧵳𦻐𧊶酰𡇙鈈𣳼𪚩𠺬𠻹牦𡲢䝎𤿂𧿹𠿫䃺"
    	],
    	[
    		"9ea1",
    		"鱝攟𢶠䣳𤟠𩵼𠿬𠸊恢𧖣𠿭"
    	],
    	[
    		"9ead",
    		"𦁈𡆇熣纎鵐业丄㕷嬍沲卧㚬㧜卽㚥𤘘墚𤭮舭呋垪𥪕𠥹"
    	],
    	[
    		"9ec5",
    		"㩒𢑥獴𩺬䴉鯭𣳾𩼰䱛𤾩𩖞𩿞葜𣶶𧊲𦞳𣜠挮紥𣻷𣸬㨪逈勌㹴㙺䗩𠒎癀嫰𠺶硺𧼮墧䂿噼鮋嵴癔𪐴麅䳡痹㟻愙𣃚𤏲"
    	],
    	[
    		"9ef5",
    		"噝𡊩垧𤥣𩸆刴𧂮㖭汊鵼"
    	],
    	[
    		"9f40",
    		"籖鬹埞𡝬屓擓𩓐𦌵𧅤蚭𠴨𦴢𤫢𠵱"
    	],
    	[
    		"9f4f",
    		"凾𡼏嶎霃𡷑麁遌笟鬂峑箣扨挵髿篏鬪籾鬮籂粆鰕篼鬉鼗鰛𤤾齚啳寃俽麘俲剠㸆勑坧偖妷帒韈鶫轜呩鞴饀鞺匬愰"
    	],
    	[
    		"9fa1",
    		"椬叚鰊鴂䰻陁榀傦畆𡝭駚剳"
    	],
    	[
    		"9fae",
    		"酙隁酜"
    	],
    	[
    		"9fb2",
    		"酑𨺗捿𦴣櫊嘑醎畺抅𠏼獏籰𥰡𣳽"
    	],
    	[
    		"9fc1",
    		"𤤙盖鮝个𠳔莾衂"
    	],
    	[
    		"9fc9",
    		"届槀僭坺刟巵从氱𠇲伹咜哚劚趂㗾弌㗳"
    	],
    	[
    		"9fdb",
    		"歒酼龥鮗頮颴骺麨麄煺笔"
    	],
    	[
    		"9fe7",
    		"毺蠘罸"
    	],
    	[
    		"9feb",
    		"嘠𪙊蹷齓"
    	],
    	[
    		"9ff0",
    		"跔蹏鸜踁抂𨍽踨蹵竓𤩷稾磘泪詧瘇"
    	],
    	[
    		"a040",
    		"𨩚鼦泎蟖痃𪊲硓咢贌狢獱謭猂瓱賫𤪻蘯徺袠䒷"
    	],
    	[
    		"a055",
    		"𡠻𦸅"
    	],
    	[
    		"a058",
    		"詾𢔛"
    	],
    	[
    		"a05b",
    		"惽癧髗鵄鍮鮏蟵"
    	],
    	[
    		"a063",
    		"蠏賷猬霡鮰㗖犲䰇籑饊𦅙慙䰄麖慽"
    	],
    	[
    		"a073",
    		"坟慯抦戹拎㩜懢厪𣏵捤栂㗒"
    	],
    	[
    		"a0a1",
    		"嵗𨯂迚𨸹"
    	],
    	[
    		"a0a6",
    		"僙𡵆礆匲阸𠼻䁥"
    	],
    	[
    		"a0ae",
    		"矾"
    	],
    	[
    		"a0b0",
    		"糂𥼚糚稭聦聣絍甅瓲覔舚朌聢𧒆聛瓰脃眤覉𦟌畓𦻑螩蟎臈螌詉貭譃眫瓸蓚㘵榲趦"
    	],
    	[
    		"a0d4",
    		"覩瑨涹蟁𤀑瓧㷛煶悤憜㳑煢恷"
    	],
    	[
    		"a0e2",
    		"罱𨬭牐惩䭾删㰘𣳇𥻗𧙖𥔱𡥄𡋾𩤃𦷜𧂭峁𦆭𨨏𣙷𠃮𦡆𤼎䕢嬟𦍌齐麦𦉫"
    	],
    	[
    		"a3c0",
    		"␀",
    		31,
    		"␡"
    	],
    	[
    		"c6a1",
    		"①",
    		9,
    		"⑴",
    		9,
    		"ⅰ",
    		9,
    		"丶丿亅亠冂冖冫勹匸卩厶夊宀巛⼳广廴彐彡攴无疒癶辵隶¨ˆヽヾゝゞ〃仝々〆〇ー［］✽ぁ",
    		23
    	],
    	[
    		"c740",
    		"す",
    		58,
    		"ァアィイ"
    	],
    	[
    		"c7a1",
    		"ゥ",
    		81,
    		"А",
    		5,
    		"ЁЖ",
    		4
    	],
    	[
    		"c840",
    		"Л",
    		26,
    		"ёж",
    		25,
    		"⇧↸↹㇏𠃌乚𠂊刂䒑"
    	],
    	[
    		"c8a1",
    		"龰冈龱𧘇"
    	],
    	[
    		"c8cd",
    		"￢￤＇＂㈱№℡゛゜⺀⺄⺆⺇⺈⺊⺌⺍⺕⺜⺝⺥⺧⺪⺬⺮⺶⺼⺾⻆⻊⻌⻍⻏⻖⻗⻞⻣"
    	],
    	[
    		"c8f5",
    		"ʃɐɛɔɵœøŋʊɪ"
    	],
    	[
    		"f9fe",
    		"￭"
    	],
    	[
    		"fa40",
    		"𠕇鋛𠗟𣿅蕌䊵珯况㙉𤥂𨧤鍄𡧛苮𣳈砼杄拟𤤳𨦪𠊠𦮳𡌅侫𢓭倈𦴩𧪄𣘀𤪱𢔓倩𠍾徤𠎀𠍇滛𠐟偽儁㑺儎顬㝃萖𤦤𠒇兠𣎴兪𠯿𢃼𠋥𢔰𠖎𣈳𡦃宂蝽𠖳𣲙冲冸"
    	],
    	[
    		"faa1",
    		"鴴凉减凑㳜凓𤪦决凢卂凭菍椾𣜭彻刋刦刼劵剗劔効勅簕蕂勠蘍𦬓包𨫞啉滙𣾀𠥔𣿬匳卄𠯢泋𡜦栛珕恊㺪㣌𡛨燝䒢卭却𨚫卾卿𡖖𡘓矦厓𨪛厠厫厮玧𥝲㽙玜叁叅汉义埾叙㪫𠮏叠𣿫𢶣叶𠱷吓灹唫晗浛呭𦭓𠵴啝咏咤䞦𡜍𠻝㶴𠵍"
    	],
    	[
    		"fb40",
    		"𨦼𢚘啇䳭启琗喆喩嘅𡣗𤀺䕒𤐵暳𡂴嘷曍𣊊暤暭噍噏磱囱鞇叾圀囯园𨭦㘣𡉏坆𤆥汮炋坂㚱𦱾埦𡐖堃𡑔𤍣堦𤯵塜墪㕡壠壜𡈼壻寿坃𪅐𤉸鏓㖡够梦㛃湙"
    	],
    	[
    		"fba1",
    		"𡘾娤啓𡚒蔅姉𠵎𦲁𦴪𡟜姙𡟻𡞲𦶦浱𡠨𡛕姹𦹅媫婣㛦𤦩婷㜈媖瑥嫓𦾡𢕔㶅𡤑㜲𡚸広勐孶斈孼𧨎䀄䡝𠈄寕慠𡨴𥧌𠖥寳宝䴐尅𡭄尓珎尔𡲥𦬨屉䣝岅峩峯嶋𡷹𡸷崐崘嵆𡺤岺巗苼㠭𤤁𢁉𢅳芇㠶㯂帮檊幵幺𤒼𠳓厦亷廐厨𡝱帉廴𨒂"
    	],
    	[
    		"fc40",
    		"廹廻㢠廼栾鐛弍𠇁弢㫞䢮𡌺强𦢈𢏐彘𢑱彣鞽𦹮彲鍀𨨶徧嶶㵟𥉐𡽪𧃸𢙨釖𠊞𨨩怱暅𡡷㥣㷇㘹垐𢞴祱㹀悞悤悳𤦂𤦏𧩓璤僡媠慤萤慂慈𦻒憁凴𠙖憇宪𣾷"
    	],
    	[
    		"fca1",
    		"𢡟懓𨮝𩥝懐㤲𢦀𢣁怣慜攞掋𠄘担𡝰拕𢸍捬𤧟㨗搸揸𡎎𡟼撐澊𢸶頔𤂌𥜝擡擥鑻㩦携㩗敍漖𤨨𤨣斅敭敟𣁾斵𤥀䬷旑䃘𡠩无旣忟𣐀昘𣇷𣇸晄𣆤𣆥晋𠹵晧𥇦晳晴𡸽𣈱𨗴𣇈𥌓矅𢣷馤朂𤎜𤨡㬫槺𣟂杞杧杢𤇍𩃭柗䓩栢湐鈼栁𣏦𦶠桝"
    	],
    	[
    		"fd40",
    		"𣑯槡樋𨫟楳棃𣗍椁椀㴲㨁𣘼㮀枬楡𨩊䋼椶榘㮡𠏉荣傐槹𣙙𢄪橅𣜃檝㯳枱櫈𩆜㰍欝𠤣惞欵歴𢟍溵𣫛𠎵𡥘㝀吡𣭚毡𣻼毜氷𢒋𤣱𦭑汚舦汹𣶼䓅𣶽𤆤𤤌𤤀"
    	],
    	[
    		"fda1",
    		"𣳉㛥㳫𠴲鮃𣇹𢒑羏样𦴥𦶡𦷫涖浜湼漄𤥿𤂅𦹲蔳𦽴凇沜渝萮𨬡港𣸯瑓𣾂秌湏媑𣁋濸㜍澝𣸰滺𡒗𤀽䕕鏰潄潜㵎潴𩅰㴻澟𤅄濓𤂑𤅕𤀹𣿰𣾴𤄿凟𤅖𤅗𤅀𦇝灋灾炧炁烌烕烖烟䄄㷨熴熖𤉷焫煅媈煊煮岜𤍥煏鍢𤋁焬𤑚𤨧𤨢熺𨯨炽爎"
    	],
    	[
    		"fe40",
    		"鑂爕夑鑃爤鍁𥘅爮牀𤥴梽牕牗㹕𣁄栍漽犂猪猫𤠣𨠫䣭𨠄猨献珏玪𠰺𦨮珉瑉𤇢𡛧𤨤昣㛅𤦷𤦍𤧻珷琕椃𤨦琹𠗃㻗瑜𢢭瑠𨺲瑇珤瑶莹瑬㜰瑴鏱樬璂䥓𤪌"
    	],
    	[
    		"fea1",
    		"𤅟𤩹𨮏孆𨰃𡢞瓈𡦈甎瓩甞𨻙𡩋寗𨺬鎅畍畊畧畮𤾂㼄𤴓疎瑝疞疴瘂瘬癑癏癯癶𦏵皐臯㟸𦤑𦤎皡皥皷盌𦾟葢𥂝𥅽𡸜眞眦着撯𥈠睘𣊬瞯𨥤𨥨𡛁矴砉𡍶𤨒棊碯磇磓隥礮𥗠磗礴碱𧘌辸袄𨬫𦂃𢘜禆褀椂禀𥡗禝𧬹礼禩渪𧄦㺨秆𩄍秔"
    	]
    ];

    // Description of supported double byte encodings and aliases.
    // Tables are not require()-d until they are needed to speed up library load.
    // require()-s are direct to support Browserify.

    var dbcsData = {
        
        // == Japanese/ShiftJIS ====================================================
        // All japanese encodings are based on JIS X set of standards:
        // JIS X 0201 - Single-byte encoding of ASCII + ¥ + Kana chars at 0xA1-0xDF.
        // JIS X 0208 - Main set of 6879 characters, placed in 94x94 plane, to be encoded by 2 bytes. 
        //              Has several variations in 1978, 1983, 1990 and 1997.
        // JIS X 0212 - Supplementary plane of 6067 chars in 94x94 plane. 1990. Effectively dead.
        // JIS X 0213 - Extension and modern replacement of 0208 and 0212. Total chars: 11233.
        //              2 planes, first is superset of 0208, second - revised 0212.
        //              Introduced in 2000, revised 2004. Some characters are in Unicode Plane 2 (0x2xxxx)

        // Byte encodings are:
        //  * Shift_JIS: Compatible with 0201, uses not defined chars in top half as lead bytes for double-byte
        //               encoding of 0208. Lead byte ranges: 0x81-0x9F, 0xE0-0xEF; Trail byte ranges: 0x40-0x7E, 0x80-0x9E, 0x9F-0xFC.
        //               Windows CP932 is a superset of Shift_JIS. Some companies added more chars, notably KDDI.
        //  * EUC-JP:    Up to 3 bytes per character. Used mostly on *nixes.
        //               0x00-0x7F       - lower part of 0201
        //               0x8E, 0xA1-0xDF - upper part of 0201
        //               (0xA1-0xFE)x2   - 0208 plane (94x94).
        //               0x8F, (0xA1-0xFE)x2 - 0212 plane (94x94).
        //  * JIS X 208: 7-bit, direct encoding of 0208. Byte ranges: 0x21-0x7E (94 values). Uncommon.
        //               Used as-is in ISO2022 family.
        //  * ISO2022-JP: Stateful encoding, with escape sequences to switch between ASCII, 
        //                0201-1976 Roman, 0208-1978, 0208-1983.
        //  * ISO2022-JP-1: Adds esc seq for 0212-1990.
        //  * ISO2022-JP-2: Adds esc seq for GB2313-1980, KSX1001-1992, ISO8859-1, ISO8859-7.
        //  * ISO2022-JP-3: Adds esc seq for 0201-1976 Kana set, 0213-2000 Planes 1, 2.
        //  * ISO2022-JP-2004: Adds 0213-2004 Plane 1.
        //
        // After JIS X 0213 appeared, Shift_JIS-2004, EUC-JISX0213 and ISO2022-JP-2004 followed, with just changing the planes.
        //
        // Overall, it seems that it's a mess :( http://www8.plala.or.jp/tkubota1/unicode-symbols-map2.html

        'shiftjis': {
            type: '_dbcs',
            table: function() { return require$$0 },
            encodeAdd: {'\u00a5': 0x5C, '\u203E': 0x7E},
            encodeSkipVals: [{from: 0xED40, to: 0xF940}],
        },
        'csshiftjis': 'shiftjis',
        'mskanji': 'shiftjis',
        'sjis': 'shiftjis',
        'windows31j': 'shiftjis',
        'ms31j': 'shiftjis',
        'xsjis': 'shiftjis',
        'windows932': 'shiftjis',
        'ms932': 'shiftjis',
        '932': 'shiftjis',
        'cp932': 'shiftjis',

        'eucjp': {
            type: '_dbcs',
            table: function() { return require$$1 },
            encodeAdd: {'\u00a5': 0x5C, '\u203E': 0x7E},
        },

        // TODO: KDDI extension to Shift_JIS
        // TODO: IBM CCSID 942 = CP932, but F0-F9 custom chars and other char changes.
        // TODO: IBM CCSID 943 = Shift_JIS = CP932 with original Shift_JIS lower 128 chars.


        // == Chinese/GBK ==========================================================
        // http://en.wikipedia.org/wiki/GBK
        // We mostly implement W3C recommendation: https://www.w3.org/TR/encoding/#gbk-encoder

        // Oldest GB2312 (1981, ~7600 chars) is a subset of CP936
        'gb2312': 'cp936',
        'gb231280': 'cp936',
        'gb23121980': 'cp936',
        'csgb2312': 'cp936',
        'csiso58gb231280': 'cp936',
        'euccn': 'cp936',

        // Microsoft's CP936 is a subset and approximation of GBK.
        'windows936': 'cp936',
        'ms936': 'cp936',
        '936': 'cp936',
        'cp936': {
            type: '_dbcs',
            table: function() { return require$$2 },
        },

        // GBK (~22000 chars) is an extension of CP936 that added user-mapped chars and some other.
        'gbk': {
            type: '_dbcs',
            table: function() { return require$$2.concat(require$$3$1) },
        },
        'xgbk': 'gbk',
        'isoir58': 'gbk',

        // GB18030 is an algorithmic extension of GBK.
        // Main source: https://www.w3.org/TR/encoding/#gbk-encoder
        // http://icu-project.org/docs/papers/gb18030.html
        // http://source.icu-project.org/repos/icu/data/trunk/charset/data/xml/gb-18030-2000.xml
        // http://www.khngai.com/chinese/charmap/tblgbk.php?page=0
        'gb18030': {
            type: '_dbcs',
            table: function() { return require$$2.concat(require$$3$1) },
            gb18030: function() { return require$$4 },
            encodeSkipVals: [0x80],
            encodeAdd: {'€': 0xA2E3},
        },

        'chinese': 'gb18030',


        // == Korean ===============================================================
        // EUC-KR, KS_C_5601 and KS X 1001 are exactly the same.
        'windows949': 'cp949',
        'ms949': 'cp949',
        '949': 'cp949',
        'cp949': {
            type: '_dbcs',
            table: function() { return require$$5 },
        },

        'cseuckr': 'cp949',
        'csksc56011987': 'cp949',
        'euckr': 'cp949',
        'isoir149': 'cp949',
        'korean': 'cp949',
        'ksc56011987': 'cp949',
        'ksc56011989': 'cp949',
        'ksc5601': 'cp949',


        // == Big5/Taiwan/Hong Kong ================================================
        // There are lots of tables for Big5 and cp950. Please see the following links for history:
        // http://moztw.org/docs/big5/  http://www.haible.de/bruno/charsets/conversion-tables/Big5.html
        // Variations, in roughly number of defined chars:
        //  * Windows CP 950: Microsoft variant of Big5. Canonical: http://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP950.TXT
        //  * Windows CP 951: Microsoft variant of Big5-HKSCS-2001. Seems to be never public. http://me.abelcheung.org/articles/research/what-is-cp951/
        //  * Big5-2003 (Taiwan standard) almost superset of cp950.
        //  * Unicode-at-on (UAO) / Mozilla 1.8. Falling out of use on the Web. Not supported by other browsers.
        //  * Big5-HKSCS (-2001, -2004, -2008). Hong Kong standard. 
        //    many unicode code points moved from PUA to Supplementary plane (U+2XXXX) over the years.
        //    Plus, it has 4 combining sequences.
        //    Seems that Mozilla refused to support it for 10 yrs. https://bugzilla.mozilla.org/show_bug.cgi?id=162431 https://bugzilla.mozilla.org/show_bug.cgi?id=310299
        //    because big5-hkscs is the only encoding to include astral characters in non-algorithmic way.
        //    Implementations are not consistent within browsers; sometimes labeled as just big5.
        //    MS Internet Explorer switches from big5 to big5-hkscs when a patch applied.
        //    Great discussion & recap of what's going on https://bugzilla.mozilla.org/show_bug.cgi?id=912470#c31
        //    In the encoder, it might make sense to support encoding old PUA mappings to Big5 bytes seq-s.
        //    Official spec: http://www.ogcio.gov.hk/en/business/tech_promotion/ccli/terms/doc/2003cmp_2008.txt
        //                   http://www.ogcio.gov.hk/tc/business/tech_promotion/ccli/terms/doc/hkscs-2008-big5-iso.txt
        // 
        // Current understanding of how to deal with Big5(-HKSCS) is in the Encoding Standard, http://encoding.spec.whatwg.org/#big5-encoder
        // Unicode mapping (http://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/OTHER/BIG5.TXT) is said to be wrong.

        'windows950': 'cp950',
        'ms950': 'cp950',
        '950': 'cp950',
        'cp950': {
            type: '_dbcs',
            table: function() { return require$$6 },
        },

        // Big5 has many variations and is an extension of cp950. We use Encoding Standard's as a consensus.
        'big5': 'big5hkscs',
        'big5hkscs': {
            type: '_dbcs',
            table: function() { return require$$6.concat(require$$7) },
            encodeSkipVals: [0xa2cc],
        },

        'cnbig5': 'big5hkscs',
        'csbig5': 'big5hkscs',
        'xxbig5': 'big5hkscs',
    };

    var encodings = createCommonjsModule(function (module, exports) {

    // Update this array if you add/rename/remove files in this directory.
    // We support Browserify by skipping automatic module discovery and requiring modules directly.
    var modules = [
        internal,
        utf32,
        utf16,
        utf7,
        sbcsCodec,
        sbcsData,
        sbcsDataGenerated,
        dbcsCodec,
        dbcsData,
    ];

    // Put all encoding/alias/codec definitions to single object and export it.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        for (var enc in module)
            if (Object.prototype.hasOwnProperty.call(module, enc))
                exports[enc] = module[enc];
    }
    });

    var Buffer$1 = safer_1.Buffer;

    // NOTE: Due to 'stream' module being pretty large (~100Kb, significant in browser environments), 
    // we opt to dependency-inject it instead of creating a hard dependency.
    var streams = function(stream_module) {
        var Transform = stream_module.Transform;

        // == Encoder stream =======================================================

        function IconvLiteEncoderStream(conv, options) {
            this.conv = conv;
            options = options || {};
            options.decodeStrings = false; // We accept only strings, so we don't need to decode them.
            Transform.call(this, options);
        }

        IconvLiteEncoderStream.prototype = Object.create(Transform.prototype, {
            constructor: { value: IconvLiteEncoderStream }
        });

        IconvLiteEncoderStream.prototype._transform = function(chunk, encoding, done) {
            if (typeof chunk != 'string')
                return done(new Error("Iconv encoding stream needs strings as its input."));
            try {
                var res = this.conv.write(chunk);
                if (res && res.length) this.push(res);
                done();
            }
            catch (e) {
                done(e);
            }
        };

        IconvLiteEncoderStream.prototype._flush = function(done) {
            try {
                var res = this.conv.end();
                if (res && res.length) this.push(res);
                done();
            }
            catch (e) {
                done(e);
            }
        };

        IconvLiteEncoderStream.prototype.collect = function(cb) {
            var chunks = [];
            this.on('error', cb);
            this.on('data', function(chunk) { chunks.push(chunk); });
            this.on('end', function() {
                cb(null, Buffer$1.concat(chunks));
            });
            return this;
        };


        // == Decoder stream =======================================================

        function IconvLiteDecoderStream(conv, options) {
            this.conv = conv;
            options = options || {};
            options.encoding = this.encoding = 'utf8'; // We output strings.
            Transform.call(this, options);
        }

        IconvLiteDecoderStream.prototype = Object.create(Transform.prototype, {
            constructor: { value: IconvLiteDecoderStream }
        });

        IconvLiteDecoderStream.prototype._transform = function(chunk, encoding, done) {
            if (!Buffer$1.isBuffer(chunk) && !(chunk instanceof Uint8Array))
                return done(new Error("Iconv decoding stream needs buffers as its input."));
            try {
                var res = this.conv.write(chunk);
                if (res && res.length) this.push(res, this.encoding);
                done();
            }
            catch (e) {
                done(e);
            }
        };

        IconvLiteDecoderStream.prototype._flush = function(done) {
            try {
                var res = this.conv.end();
                if (res && res.length) this.push(res, this.encoding);                
                done();
            }
            catch (e) {
                done(e);
            }
        };

        IconvLiteDecoderStream.prototype.collect = function(cb) {
            var res = '';
            this.on('error', cb);
            this.on('data', function(chunk) { res += chunk; });
            this.on('end', function() {
                cb(null, res);
            });
            return this;
        };

        return {
            IconvLiteEncoderStream: IconvLiteEncoderStream,
            IconvLiteDecoderStream: IconvLiteDecoderStream,
        };
    };

    var _nodeResolve_empty = {};

    var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    var require$$3 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

    var lib = createCommonjsModule(function (module) {

    var Buffer = safer_1.Buffer;

    var iconv = module.exports;

    // All codecs and aliases are kept here, keyed by encoding name/alias.
    // They are lazy loaded in `iconv.getCodec` from `encodings/index.js`.
    iconv.encodings = null;

    // Characters emitted in case of error.
    iconv.defaultCharUnicode = '�';
    iconv.defaultCharSingleByte = '?';

    // Public API.
    iconv.encode = function encode(str, encoding, options) {
        str = "" + (str || ""); // Ensure string.

        var encoder = iconv.getEncoder(encoding, options);

        var res = encoder.write(str);
        var trail = encoder.end();
        
        return (trail && trail.length > 0) ? Buffer.concat([res, trail]) : res;
    };

    iconv.decode = function decode(buf, encoding, options) {
        if (typeof buf === 'string') {
            if (!iconv.skipDecodeWarning) {
                console.error('Iconv-lite warning: decode()-ing strings is deprecated. Refer to https://github.com/ashtuchkin/iconv-lite/wiki/Use-Buffers-when-decoding');
                iconv.skipDecodeWarning = true;
            }

            buf = Buffer.from("" + (buf || ""), "binary"); // Ensure buffer.
        }

        var decoder = iconv.getDecoder(encoding, options);

        var res = decoder.write(buf);
        var trail = decoder.end();

        return trail ? (res + trail) : res;
    };

    iconv.encodingExists = function encodingExists(enc) {
        try {
            iconv.getCodec(enc);
            return true;
        } catch (e) {
            return false;
        }
    };

    // Legacy aliases to convert functions
    iconv.toEncoding = iconv.encode;
    iconv.fromEncoding = iconv.decode;

    // Search for a codec in iconv.encodings. Cache codec data in iconv._codecDataCache.
    iconv._codecDataCache = {};
    iconv.getCodec = function getCodec(encoding) {
        if (!iconv.encodings)
            iconv.encodings = encodings; // Lazy load all encoding definitions.
        
        // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
        var enc = iconv._canonicalizeEncoding(encoding);

        // Traverse iconv.encodings to find actual codec.
        var codecOptions = {};
        while (true) {
            var codec = iconv._codecDataCache[enc];
            if (codec)
                return codec;

            var codecDef = iconv.encodings[enc];

            switch (typeof codecDef) {
                case "string": // Direct alias to other encoding.
                    enc = codecDef;
                    break;

                case "object": // Alias with options. Can be layered.
                    for (var key in codecDef)
                        codecOptions[key] = codecDef[key];

                    if (!codecOptions.encodingName)
                        codecOptions.encodingName = enc;
                    
                    enc = codecDef.type;
                    break;

                case "function": // Codec itself.
                    if (!codecOptions.encodingName)
                        codecOptions.encodingName = enc;

                    // The codec function must load all tables and return object with .encoder and .decoder methods.
                    // It'll be called only once (for each different options object).
                    codec = new codecDef(codecOptions, iconv);

                    iconv._codecDataCache[codecOptions.encodingName] = codec; // Save it to be reused later.
                    return codec;

                default:
                    throw new Error("Encoding not recognized: '" + encoding + "' (searched as: '"+enc+"')");
            }
        }
    };

    iconv._canonicalizeEncoding = function(encoding) {
        // Canonicalize encoding name: strip all non-alphanumeric chars and appended year.
        return (''+encoding).toLowerCase().replace(/:\d{4}$|[^0-9a-z]/g, "");
    };

    iconv.getEncoder = function getEncoder(encoding, options) {
        var codec = iconv.getCodec(encoding),
            encoder = new codec.encoder(options, codec);

        if (codec.bomAware && options && options.addBOM)
            encoder = new bomHandling.PrependBOM(encoder, options);

        return encoder;
    };

    iconv.getDecoder = function getDecoder(encoding, options) {
        var codec = iconv.getCodec(encoding),
            decoder = new codec.decoder(options, codec);

        if (codec.bomAware && !(options && options.stripBOM === false))
            decoder = new bomHandling.StripBOM(decoder, options);

        return decoder;
    };

    // Streaming API
    // NOTE: Streaming API naturally depends on 'stream' module from Node.js. Unfortunately in browser environments this module can add
    // up to 100Kb to the output bundle. To avoid unnecessary code bloat, we don't enable Streaming API in browser by default.
    // If you would like to enable it explicitly, please add the following code to your app:
    // > iconv.enableStreamingAPI(require('stream'));
    iconv.enableStreamingAPI = function enableStreamingAPI(stream_module) {
        if (iconv.supportsStreams)
            return;

        // Dependency-inject stream module to create IconvLite stream classes.
        var streams$1 = streams(stream_module);

        // Not public API yet, but expose the stream classes.
        iconv.IconvLiteEncoderStream = streams$1.IconvLiteEncoderStream;
        iconv.IconvLiteDecoderStream = streams$1.IconvLiteDecoderStream;

        // Streaming API.
        iconv.encodeStream = function encodeStream(encoding, options) {
            return new iconv.IconvLiteEncoderStream(iconv.getEncoder(encoding, options), options);
        };

        iconv.decodeStream = function decodeStream(encoding, options) {
            return new iconv.IconvLiteDecoderStream(iconv.getDecoder(encoding, options), options);
        };

        iconv.supportsStreams = true;
    };

    // Enable Streaming API automatically if 'stream' module is available and non-empty (the majority of environments).
    var stream_module;
    try {
        stream_module = require$$3;
    } catch (e) {}

    if (stream_module && stream_module.Transform) {
        iconv.enableStreamingAPI(stream_module);

    } else {
        // In rare cases where 'stream' module is not available by default, throw a helpful exception.
        iconv.encodeStream = iconv.decodeStream = function() {
            throw new Error("iconv-lite Streaming API is not enabled. Use iconv.enableStreamingAPI(require('stream')); to enable it.");
        };
    }
    });

    const DEFAULT_CHARSET = 'utf8';
    const isUTF8 = (charset) => {
        if (!charset) {
            return true;
        }
        charset = charset.toLowerCase();
        return charset === 'utf8' || charset === 'utf-8';
    };
    const encode$2 = (str, charset) => {
        if (isUTF8(charset)) {
            return encodeURIComponent(str);
        }
        const buf = lib.encode(str, charset || DEFAULT_CHARSET);
        let encodeStr = '';
        let ch = '';
        for (let i = 0; i < buf.length; i++) {
            ch = buf[i].toString(16);
            if (ch.length === 1) {
                ch = '0' + ch;
            }
            encodeStr += '%' + ch;
        }
        encodeStr = encodeStr.toUpperCase();
        return encodeStr;
    };
    const decode$2 = (str, charset) => {
        if (isUTF8(charset) || !charset) {
            return decodeURIComponent(str);
        }
        const bytes = [];
        for (let i = 0; i < str.length;) {
            if (str[i] === '%') {
                i++;
                bytes.push(parseInt(str.substring(i, i + 2), 16));
                i += 2;
            }
            else {
                bytes.push(str.charCodeAt(i));
                i++;
            }
        }
        const buf = new Buffer(bytes);
        return lib.decode(buf, charset);
    };
    const getSeparator = (separator) => {
        if (!separator || typeof separator === 'object') {
            return '&';
        }
        return separator;
    };
    const parse$1 = (queryString, separator, equals, options) => {
        if (typeof separator === 'object') {
            options = separator;
        }
        const sep = getSeparator(separator);
        const eq = equals || '=';
        const obj = {};
        if (typeof queryString !== 'string' || queryString.length === 0) {
            return obj;
        }
        const regexp = /\+/g;
        const qs = queryString.split(sep);
        let maxKeys = 1000;
        let charset = null;
        if (options) {
            if (typeof options.maxKeys === 'number') {
                maxKeys = options.maxKeys;
            }
            if (typeof options.charset === 'string') {
                charset = options.charset;
            }
        }
        let len = qs.length;
        if (maxKeys > 0 && len > maxKeys) {
            len = maxKeys;
        }
        charset = charset || DEFAULT_CHARSET;
        for (let i = 0; i < len; ++i) {
            const x = qs[i].replace(regexp, '%20');
            const idx = x.indexOf(eq);
            let kstr;
            let vstr;
            let k;
            let v;
            if (idx >= 0) {
                kstr = x.substr(0, idx);
                vstr = x.substr(idx + 1);
            }
            else {
                kstr = x;
                vstr = '';
            }
            if (kstr && kstr.indexOf('%') >= 0) {
                try {
                    k = decode$2(kstr, charset);
                }
                catch (e) {
                    k = kstr;
                }
            }
            else {
                k = kstr;
            }
            if (vstr && vstr.indexOf('%') >= 0) {
                try {
                    v = decode$2(vstr, charset);
                }
                catch (e) {
                    v = vstr;
                }
            }
            else {
                v = vstr;
            }
            if (!has(obj, k)) {
                obj[k] = v;
            }
            else if (Array.isArray(obj[k])) {
                obj[k].push(v);
            }
            else {
                obj[k] = [obj[k], v];
            }
        }
        return obj;
    };
    const has = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    function isASCII(str) {
        return (/^[\x00-\x7F]*$/).test(str);
    }
    const encodeComponent = (item, charset) => {
        item = String(item);
        if (isASCII(item)) {
            item = encodeURIComponent(item);
        }
        else {
            item = encode$2(item, charset);
        }
        return item;
    };
    const stringify = (obj, prefix, options) => {
        if (typeof prefix !== 'string') {
            options = prefix || {};
            prefix = null;
        }
        const charset = options.charset || 'utf-8';
        if (Array.isArray(obj)) {
            return stringifyArray(obj, prefix, options);
        }
        else if ('[object Object]' === {}.toString.call(obj)) {
            return stringifyObject(obj, prefix, options);
        }
        else if ('string' === typeof obj) {
            return stringifyString(obj, prefix, options);
        }
        else {
            return prefix + '=' + encodeComponent(String(obj), charset);
        }
    };
    function stringifyString(str, prefix, options) {
        if (!prefix) {
            throw new TypeError('stringify expects an object');
        }
        const charset = options.charset;
        return prefix + '=' + encodeComponent(str, charset);
    }
    function stringifyArray(arr, prefix, options) {
        const ret = [];
        if (!prefix) {
            throw new TypeError('stringify expects an object');
        }
        for (let i = 0; i < arr.length; i++) {
            ret.push(stringify(arr[i], prefix + '[' + i + ']', options));
        }
        return ret.join('&');
    }
    function stringifyObject(obj, prefix, options) {
        const ret = [];
        const keys = Object.keys(obj);
        let key;
        const charset = options.charset;
        for (let i = 0, len = keys.length; i < len; ++i) {
            key = keys[i];
            if ('' === key) {
                continue;
            }
            if (null === obj[key]) {
                ret.push(encode$2(key, charset) + '=');
            }
            else {
                ret.push(stringify(obj[key], prefix ? prefix + '[' + encodeComponent(key, charset) + ']' : encodeComponent(key, charset), options));
            }
        }
        return ret.join('&');
    }

    var url = /*#__PURE__*/Object.freeze({
        __proto__: null,
        encode: encode$2,
        decode: decode$2,
        parse: parse$1,
        stringify: stringify
    });

    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
      }
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */

    function toDate(argument) {
      requiredArgs(1, arguments);
      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"); // eslint-disable-next-line no-console

          console.warn(new Error().stack);
        }

        return new Date(NaN);
      }
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      return !isNaN(date);
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXWeeks: {
        one: 'about 1 week',
        other: 'about {{count}} weeks'
      },
      xWeeks: {
        one: '1 week',
        other: '{{count}} weeks'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance$1(token, count, options) {
      options = options || {};
      var result;

      if (typeof formatDistanceLocale[token] === 'string') {
        result = formatDistanceLocale[token];
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace('{{count}}', count);
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    }

    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    }

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
      // If you are making a new locale based on this one, check if the same is true for the language you're working on.
      // Generally, formatted dates should look like they are in the middle of a sentence,
      // e.g. in Spanish language the weekdays and months should be in the lowercase.

    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`:
      //
      //   var options = dirtyOptions || {}
      //   var unit = String(options.unit)
      //
      // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    }

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };

    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);

        if (!parseResult) {
          return null;
        }

        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var value;

        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(matchedString);
          });
        }

        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */

    var locale = {
      code: 'en-US',
      formatDistance: formatDistance$1,
      formatLong: formatLong,
      formatRelative: formatRelative,
      localize: localize,
      match: match,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      requiredArgs(2, arguments);
      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters$1 = {
      // Year
      y(date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },

      // Month
      M(date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },

      // Day of the month
      d(date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },

      // AM or PM
      a(date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaa':
            return dayPeriodEnumValue;

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },

      // Hour [1-12]
      h(date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },

      // Hour [0-23]
      H(date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },

      // Minute
      m(date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },

      // Second
      s(date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },

      // Fraction of second
      S(date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }

    };

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      requiredArgs(1, arguments);
      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      requiredArgs(1, arguments);
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
      /*
       * |     | Unit                           |     | Unit                           |
       * |-----|--------------------------------|-----|--------------------------------|
       * |  a  | AM, PM                         |  A* | Milliseconds in day            |
       * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
       * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
       * |  d  | Day of month                   |  D  | Day of year                    |
       * |  e  | Local day of week              |  E  | Day of week                    |
       * |  f  |                                |  F* | Day of week in month           |
       * |  g* | Modified Julian day            |  G  | Era                            |
       * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
       * |  i! | ISO day of week                |  I! | ISO week of year               |
       * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
       * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
       * |  l* | (deprecated)                   |  L  | Stand-alone month              |
       * |  m  | Minute                         |  M  | Month                          |
       * |  n  |                                |  N  |                                |
       * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
       * |  p! | Long localized time            |  P! | Long localized date            |
       * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
       * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
       * |  s  | Second                         |  S  | Fraction of second             |
       * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
       * |  u  | Extended year                  |  U* | Cyclic year                    |
       * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
       * |  w  | Local week of year             |  W* | Week of month                  |
       * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
       * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
       * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
       *
       * Letters marked by * are not implemented but reserved by Unicode standard.
       *
       * Letters marked by ! are non-standard, but implemented by date-fns:
       * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
       * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
       *   i.e. 7 for Sunday, 1 for Monday, etc.
       * - `I` is ISO week of year, as opposed to `w` which is local week of year.
       * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
       *   `R` is supposed to be used in conjunction with `I` and `i`
       *   for universal ISO week-numbering date, whereas
       *   `Y` is supposed to be used in conjunction with `w` and `e`
       *   for week-numbering date specific to the locale.
       * - `P` is long localized date format
       * - `p` is long localized time format
       */

    };
    var formatters = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return formatters$1.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return formatters$1.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return formatters$1.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            }).toLowerCase();

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            }).toLowerCase();

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return formatters$1.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return formatters$1.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return formatters$1.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return formatters$1.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return formatters$1.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };

    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */
    function getTimezoneOffsetInMilliseconds(date) {
      var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
      utcDate.setUTCFullYear(date.getFullYear());
      return date.getTime() - utcDate.getTime();
    }

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token, format, input) {
      if (token === 'YYYY') {
        throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'YY') {
        throw new RangeError("Use `yy` instead of `YY` (in `".concat(format, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'D') {
        throw new RangeError("Use `d` instead of `D` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      } else if (token === 'DD') {
        throw new RangeError("Use `dd` instead of `DD` (in `".concat(format, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aa   | AM, PM                            |       |
     * |                                 | aaa     | am, pm                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
     * |                                 | bbb     | am, pm, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 01, 02, ..., 11, 00               |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 001, ..., 999                |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 04/29/1453                        | 7     |
     * |                                 | PP      | Apr 29, 1453                      | 7     |
     * |                                 | PPP     | April 29th, 1453                  | 7     |
     * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
     * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      requiredArgs(2, arguments);
      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale$1 = options.locale || locale;
      var localeFirstWeekContainsDate = locale$1.options && locale$1.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale$1.options && locale$1.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale$1.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale$1.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale$1,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale$1.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring, dirtyFormatStr, dirtyDate);
          }

          return formatter(utcDate, substring, locale$1.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    async function auth(token) {
        const tokenType = token.split(/\./).length === 3
            ? "app"
            : /^v\d+\./.test(token)
                ? "installation"
                : "oauth";
        return {
            type: "token",
            token: token,
            tokenType
        };
    }

    /**
     * Prefix token for usage in the Authorization header
     *
     * @param token OAuth token or JSON Web Token
     */
    function withAuthorizationPrefix(token) {
        if (token.split(/\./).length === 3) {
            return `bearer ${token}`;
        }
        return `token ${token}`;
    }

    async function hook(token, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        endpoint.headers.authorization = withAuthorizationPrefix(token);
        return request(endpoint);
    }

    const createTokenAuth = function createTokenAuth(token) {
        if (!token) {
            throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
        }
        if (typeof token !== "string") {
            throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
        }
        token = token.replace(/^(token|bearer) +/i, "");
        return Object.assign(auth.bind(null, token), {
            hook: hook.bind(null, token)
        });
    };

    /*!
     * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    function isObject$1(o) {
      return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isPlainObject$1(o) {
      var ctor,prot;

      if (isObject$1(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (ctor === undefined) return true;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObject$1(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    }

    function getUserAgent() {
        if (typeof navigator === "object" && "userAgent" in navigator) {
            return navigator.userAgent;
        }
        if (typeof process === "object" && "version" in process) {
            return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
        }
        return "<environment undetectable>";
    }

    function lowercaseKeys(object) {
        if (!object) {
            return {};
        }
        return Object.keys(object).reduce((newObj, key) => {
            newObj[key.toLowerCase()] = object[key];
            return newObj;
        }, {});
    }

    function mergeDeep(defaults, options) {
        const result = Object.assign({}, defaults);
        Object.keys(options).forEach((key) => {
            if (isPlainObject$1(options[key])) {
                if (!(key in defaults))
                    Object.assign(result, { [key]: options[key] });
                else
                    result[key] = mergeDeep(defaults[key], options[key]);
            }
            else {
                Object.assign(result, { [key]: options[key] });
            }
        });
        return result;
    }

    function removeUndefinedProperties(obj) {
        for (const key in obj) {
            if (obj[key] === undefined) {
                delete obj[key];
            }
        }
        return obj;
    }

    function merge(defaults, route, options) {
        if (typeof route === "string") {
            let [method, url] = route.split(" ");
            options = Object.assign(url ? { method, url } : { url: method }, options);
        }
        else {
            options = Object.assign({}, route);
        }
        // lowercase header names before merging with defaults to avoid duplicates
        options.headers = lowercaseKeys(options.headers);
        // remove properties with undefined values before merging
        removeUndefinedProperties(options);
        removeUndefinedProperties(options.headers);
        const mergedOptions = mergeDeep(defaults || {}, options);
        // mediaType.previews arrays are merged, instead of overwritten
        if (defaults && defaults.mediaType.previews.length) {
            mergedOptions.mediaType.previews = defaults.mediaType.previews
                .filter((preview) => !mergedOptions.mediaType.previews.includes(preview))
                .concat(mergedOptions.mediaType.previews);
        }
        mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map((preview) => preview.replace(/-preview/, ""));
        return mergedOptions;
    }

    function addQueryParameters(url, parameters) {
        const separator = /\?/.test(url) ? "&" : "?";
        const names = Object.keys(parameters);
        if (names.length === 0) {
            return url;
        }
        return (url +
            separator +
            names
                .map((name) => {
                if (name === "q") {
                    return ("q=" + parameters.q.split("+").map(encodeURIComponent).join("+"));
                }
                return `${name}=${encodeURIComponent(parameters[name])}`;
            })
                .join("&"));
    }

    const urlVariableRegex = /\{[^}]+\}/g;
    function removeNonChars(variableName) {
        return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
    }
    function extractUrlVariableNames(url) {
        const matches = url.match(urlVariableRegex);
        if (!matches) {
            return [];
        }
        return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
    }

    function omit(object, keysToOmit) {
        return Object.keys(object)
            .filter((option) => !keysToOmit.includes(option))
            .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});
    }

    // Based on https://github.com/bramstein/url-template, licensed under BSD
    // TODO: create separate package.
    //
    // Copyright (c) 2012-2014, Bram Stein
    // All rights reserved.
    // Redistribution and use in source and binary forms, with or without
    // modification, are permitted provided that the following conditions
    // are met:
    //  1. Redistributions of source code must retain the above copyright
    //     notice, this list of conditions and the following disclaimer.
    //  2. Redistributions in binary form must reproduce the above copyright
    //     notice, this list of conditions and the following disclaimer in the
    //     documentation and/or other materials provided with the distribution.
    //  3. The name of the author may not be used to endorse or promote products
    //     derived from this software without specific prior written permission.
    // THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
    // WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
    // MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
    // EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
    // INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
    // BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
    // DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
    // OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
    // NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
    // EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    /* istanbul ignore file */
    function encodeReserved(str) {
        return str
            .split(/(%[0-9A-Fa-f]{2})/g)
            .map(function (part) {
            if (!/%[0-9A-Fa-f]/.test(part)) {
                part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
            }
            return part;
        })
            .join("");
    }
    function encodeUnreserved(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
    }
    function encodeValue(operator, value, key) {
        value =
            operator === "+" || operator === "#"
                ? encodeReserved(value)
                : encodeUnreserved(value);
        if (key) {
            return encodeUnreserved(key) + "=" + value;
        }
        else {
            return value;
        }
    }
    function isDefined(value) {
        return value !== undefined && value !== null;
    }
    function isKeyOperator(operator) {
        return operator === ";" || operator === "&" || operator === "?";
    }
    function getValues(context, operator, key, modifier) {
        var value = context[key], result = [];
        if (isDefined(value) && value !== "") {
            if (typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean") {
                value = value.toString();
                if (modifier && modifier !== "*") {
                    value = value.substring(0, parseInt(modifier, 10));
                }
                result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
            }
            else {
                if (modifier === "*") {
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
                        });
                    }
                    else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                result.push(encodeValue(operator, value[k], k));
                            }
                        });
                    }
                }
                else {
                    const tmp = [];
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            tmp.push(encodeValue(operator, value));
                        });
                    }
                    else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                tmp.push(encodeUnreserved(k));
                                tmp.push(encodeValue(operator, value[k].toString()));
                            }
                        });
                    }
                    if (isKeyOperator(operator)) {
                        result.push(encodeUnreserved(key) + "=" + tmp.join(","));
                    }
                    else if (tmp.length !== 0) {
                        result.push(tmp.join(","));
                    }
                }
            }
        }
        else {
            if (operator === ";") {
                if (isDefined(value)) {
                    result.push(encodeUnreserved(key));
                }
            }
            else if (value === "" && (operator === "&" || operator === "?")) {
                result.push(encodeUnreserved(key) + "=");
            }
            else if (value === "") {
                result.push("");
            }
        }
        return result;
    }
    function parseUrl(template) {
        return {
            expand: expand.bind(null, template),
        };
    }
    function expand(template, context) {
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
            if (expression) {
                let operator = "";
                const values = [];
                if (operators.indexOf(expression.charAt(0)) !== -1) {
                    operator = expression.charAt(0);
                    expression = expression.substr(1);
                }
                expression.split(/,/g).forEach(function (variable) {
                    var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                    values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                });
                if (operator && operator !== "+") {
                    var separator = ",";
                    if (operator === "?") {
                        separator = "&";
                    }
                    else if (operator !== "#") {
                        separator = operator;
                    }
                    return (values.length !== 0 ? operator : "") + values.join(separator);
                }
                else {
                    return values.join(",");
                }
            }
            else {
                return encodeReserved(literal);
            }
        });
    }

    function parse(options) {
        // https://fetch.spec.whatwg.org/#methods
        let method = options.method.toUpperCase();
        // replace :varname with {varname} to make it RFC 6570 compatible
        let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
        let headers = Object.assign({}, options.headers);
        let body;
        let parameters = omit(options, [
            "method",
            "baseUrl",
            "url",
            "headers",
            "request",
            "mediaType",
        ]);
        // extract variable names from URL to calculate remaining variables later
        const urlVariableNames = extractUrlVariableNames(url);
        url = parseUrl(url).expand(parameters);
        if (!/^http/.test(url)) {
            url = options.baseUrl + url;
        }
        const omittedParameters = Object.keys(options)
            .filter((option) => urlVariableNames.includes(option))
            .concat("baseUrl");
        const remainingParameters = omit(parameters, omittedParameters);
        const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
        if (!isBinaryRequest) {
            if (options.mediaType.format) {
                // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
                headers.accept = headers.accept
                    .split(/,/)
                    .map((preview) => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`))
                    .join(",");
            }
            if (options.mediaType.previews.length) {
                const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
                headers.accept = previewsFromAcceptHeader
                    .concat(options.mediaType.previews)
                    .map((preview) => {
                    const format = options.mediaType.format
                        ? `.${options.mediaType.format}`
                        : "+json";
                    return `application/vnd.github.${preview}-preview${format}`;
                })
                    .join(",");
            }
        }
        // for GET/HEAD requests, set URL query parameters from remaining parameters
        // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters
        if (["GET", "HEAD"].includes(method)) {
            url = addQueryParameters(url, remainingParameters);
        }
        else {
            if ("data" in remainingParameters) {
                body = remainingParameters.data;
            }
            else {
                if (Object.keys(remainingParameters).length) {
                    body = remainingParameters;
                }
                else {
                    headers["content-length"] = 0;
                }
            }
        }
        // default content-type for JSON if body is set
        if (!headers["content-type"] && typeof body !== "undefined") {
            headers["content-type"] = "application/json; charset=utf-8";
        }
        // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
        // fetch does not allow to set `content-length` header, but we can set body to an empty string
        if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
            body = "";
        }
        // Only return body/request keys if present
        return Object.assign({ method, url, headers }, typeof body !== "undefined" ? { body } : null, options.request ? { request: options.request } : null);
    }

    function endpointWithDefaults(defaults, route, options) {
        return parse(merge(defaults, route, options));
    }

    function withDefaults$2(oldDefaults, newDefaults) {
        const DEFAULTS = merge(oldDefaults, newDefaults);
        const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
        return Object.assign(endpoint, {
            DEFAULTS,
            defaults: withDefaults$2.bind(null, DEFAULTS),
            merge: merge.bind(null, DEFAULTS),
            parse,
        });
    }

    const VERSION$2 = "6.0.11";

    const userAgent = `octokit-endpoint.js/${VERSION$2} ${getUserAgent()}`;
    // DEFAULTS has all properties set that EndpointOptions has, except url.
    // So we use RequestParameters and add method as additional required property.
    const DEFAULTS = {
        method: "GET",
        baseUrl: "https://api.github.com",
        headers: {
            accept: "application/vnd.github.v3+json",
            "user-agent": userAgent,
        },
        mediaType: {
            format: "",
            previews: [],
        },
    };

    const endpoint = withDefaults$2(null, DEFAULTS);

    /*!
     * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    function isObject(o) {
      return Object.prototype.toString.call(o) === '[object Object]';
    }

    function isPlainObject(o) {
      var ctor,prot;

      if (isObject(o) === false) return false;

      // If has modified constructor
      ctor = o.constructor;
      if (ctor === undefined) return true;

      // If has modified prototype
      prot = ctor.prototype;
      if (isObject(prot) === false) return false;

      // If constructor does not have an Object-specific method
      if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false;
      }

      // Most likely a plain Object
      return true;
    }

    var browser = createCommonjsModule(function (module, exports) {

    // ref: https://github.com/tc39/proposal-global
    var getGlobal = function () {
    	// the only reliable means to get the global object is
    	// `Function('return this')()`
    	// However, this causes CSP violations in Chrome apps.
    	if (typeof self !== 'undefined') { return self; }
    	if (typeof window !== 'undefined') { return window; }
    	if (typeof global !== 'undefined') { return global; }
    	throw new Error('unable to locate global object');
    };

    var global = getGlobal();

    module.exports = exports = global.fetch;

    // Needed for TypeScript and Webpack.
    if (global.fetch) {
    	exports.default = global.fetch.bind(global);
    }

    exports.Headers = global.Headers;
    exports.Request = global.Request;
    exports.Response = global.Response;
    });

    class Deprecation extends Error {
      constructor(message) {
        super(message); // Maintains proper stack trace (only available on V8)

        /* istanbul ignore next */

        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }

        this.name = 'Deprecation';
      }

    }

    // Returns a wrapper function that returns a wrapped callback
    // The wrapper function should do some stuff, and return a
    // presumably different callback function.
    // This makes sure that own properties are retained, so that
    // decorations and such are not lost along the way.
    var wrappy_1 = wrappy;
    function wrappy (fn, cb) {
      if (fn && cb) return wrappy(fn)(cb)

      if (typeof fn !== 'function')
        throw new TypeError('need wrapper function')

      Object.keys(fn).forEach(function (k) {
        wrapper[k] = fn[k];
      });

      return wrapper

      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb = args[args.length-1];
        if (typeof ret === 'function' && ret !== cb) {
          Object.keys(cb).forEach(function (k) {
            ret[k] = cb[k];
          });
        }
        return ret
      }
    }

    var once_1 = wrappy_1(once);
    var strict = wrappy_1(onceStrict);

    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this)
        },
        configurable: true
      });

      Object.defineProperty(Function.prototype, 'onceStrict', {
        value: function () {
          return onceStrict(this)
        },
        configurable: true
      });
    });

    function once (fn) {
      var f = function () {
        if (f.called) return f.value
        f.called = true;
        return f.value = fn.apply(this, arguments)
      };
      f.called = false;
      return f
    }

    function onceStrict (fn) {
      var f = function () {
        if (f.called)
          throw new Error(f.onceError)
        f.called = true;
        return f.value = fn.apply(this, arguments)
      };
      var name = fn.name || 'Function wrapped with `once`';
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f
    }
    once_1.strict = strict;

    const logOnce = once_1((deprecation) => console.warn(deprecation));
    /**
     * Error with extra properties to help with debugging
     */
    class RequestError extends Error {
        constructor(message, statusCode, options) {
            super(message);
            // Maintains proper stack trace (only available on V8)
            /* istanbul ignore next */
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
            this.name = "HttpError";
            this.status = statusCode;
            Object.defineProperty(this, "code", {
                get() {
                    logOnce(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
                    return statusCode;
                },
            });
            this.headers = options.headers || {};
            // redact request credentials without mutating original request options
            const requestCopy = Object.assign({}, options.request);
            if (options.request.headers.authorization) {
                requestCopy.headers = Object.assign({}, options.request.headers, {
                    authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]"),
                });
            }
            requestCopy.url = requestCopy.url
                // client_id & client_secret can be passed as URL query parameters to increase rate limit
                // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
                .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
                // OAuth tokens can be passed as URL query parameters, although it is not recommended
                // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
                .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
            this.request = requestCopy;
        }
    }

    const VERSION$1 = "5.4.15";

    function getBufferResponse(response) {
        return response.arrayBuffer();
    }

    function fetchWrapper(requestOptions) {
        if (isPlainObject(requestOptions.body) ||
            Array.isArray(requestOptions.body)) {
            requestOptions.body = JSON.stringify(requestOptions.body);
        }
        let headers = {};
        let status;
        let url;
        const fetch = (requestOptions.request && requestOptions.request.fetch) || browser;
        return fetch(requestOptions.url, Object.assign({
            method: requestOptions.method,
            body: requestOptions.body,
            headers: requestOptions.headers,
            redirect: requestOptions.redirect,
        }, 
        // `requestOptions.request.agent` type is incompatible
        // see https://github.com/octokit/types.ts/pull/264
        requestOptions.request))
            .then((response) => {
            url = response.url;
            status = response.status;
            for (const keyAndValue of response.headers) {
                headers[keyAndValue[0]] = keyAndValue[1];
            }
            if (status === 204 || status === 205) {
                return;
            }
            // GitHub API returns 200 for HEAD requests
            if (requestOptions.method === "HEAD") {
                if (status < 400) {
                    return;
                }
                throw new RequestError(response.statusText, status, {
                    headers,
                    request: requestOptions,
                });
            }
            if (status === 304) {
                throw new RequestError("Not modified", status, {
                    headers,
                    request: requestOptions,
                });
            }
            if (status >= 400) {
                return response
                    .text()
                    .then((message) => {
                    const error = new RequestError(message, status, {
                        headers,
                        request: requestOptions,
                    });
                    try {
                        let responseBody = JSON.parse(error.message);
                        Object.assign(error, responseBody);
                        let errors = responseBody.errors;
                        // Assumption `errors` would always be in Array format
                        error.message =
                            error.message + ": " + errors.map(JSON.stringify).join(", ");
                    }
                    catch (e) {
                        // ignore, see octokit/rest.js#684
                    }
                    throw error;
                });
            }
            const contentType = response.headers.get("content-type");
            if (/application\/json/.test(contentType)) {
                return response.json();
            }
            if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
                return response.text();
            }
            return getBufferResponse(response);
        })
            .then((data) => {
            return {
                status,
                url,
                headers,
                data,
            };
        })
            .catch((error) => {
            if (error instanceof RequestError) {
                throw error;
            }
            throw new RequestError(error.message, 500, {
                headers,
                request: requestOptions,
            });
        });
    }

    function withDefaults$1(oldEndpoint, newDefaults) {
        const endpoint = oldEndpoint.defaults(newDefaults);
        const newApi = function (route, parameters) {
            const endpointOptions = endpoint.merge(route, parameters);
            if (!endpointOptions.request || !endpointOptions.request.hook) {
                return fetchWrapper(endpoint.parse(endpointOptions));
            }
            const request = (route, parameters) => {
                return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
            };
            Object.assign(request, {
                endpoint,
                defaults: withDefaults$1.bind(null, endpoint),
            });
            return endpointOptions.request.hook(request, endpointOptions);
        };
        return Object.assign(newApi, {
            endpoint,
            defaults: withDefaults$1.bind(null, endpoint),
        });
    }

    const request = withDefaults$1(endpoint, {
        headers: {
            "user-agent": `octokit-request.js/${VERSION$1} ${getUserAgent()}`,
        },
    });

    const VERSION = "4.6.1";

    class GraphqlError extends Error {
        constructor(request, response) {
            const message = response.data.errors[0].message;
            super(message);
            Object.assign(this, response.data);
            Object.assign(this, { headers: response.headers });
            this.name = "GraphqlError";
            this.request = request;
            // Maintains proper stack trace (only available on V8)
            /* istanbul ignore next */
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }

    const NON_VARIABLE_OPTIONS = [
        "method",
        "baseUrl",
        "url",
        "headers",
        "request",
        "query",
        "mediaType",
    ];
    const FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
    const GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
    function graphql(request, query, options) {
        if (options) {
            if (typeof query === "string" && "query" in options) {
                return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
            }
            for (const key in options) {
                if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
                    continue;
                return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
            }
        }
        const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
        const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
            if (NON_VARIABLE_OPTIONS.includes(key)) {
                result[key] = parsedOptions[key];
                return result;
            }
            if (!result.variables) {
                result.variables = {};
            }
            result.variables[key] = parsedOptions[key];
            return result;
        }, {});
        // workaround for GitHub Enterprise baseUrl set with /api/v3 suffix
        // https://github.com/octokit/auth-app.js/issues/111#issuecomment-657610451
        const baseUrl = parsedOptions.baseUrl || request.endpoint.DEFAULTS.baseUrl;
        if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
            requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
        }
        return request(requestOptions).then((response) => {
            if (response.data.errors) {
                const headers = {};
                for (const key of Object.keys(response.headers)) {
                    headers[key] = response.headers[key];
                }
                throw new GraphqlError(requestOptions, {
                    headers,
                    data: response.data,
                });
            }
            return response.data.data;
        });
    }

    function withDefaults(request$1, newDefaults) {
        const newRequest = request$1.defaults(newDefaults);
        const newApi = (query, options) => {
            return graphql(newRequest, query, options);
        };
        return Object.assign(newApi, {
            defaults: withDefaults.bind(null, newRequest),
            endpoint: request.endpoint,
        });
    }

    const graphql$1 = withDefaults(request, {
        headers: {
            "user-agent": `octokit-graphql.js/${VERSION} ${getUserAgent()}`,
        },
        method: "POST",
        url: "/graphql",
    });

    const fragment$2 = `fragment organizationFields on Organization {
  login
  repositories(first: 100) {
    totalCount
    nodes {
      ...repositoryFields
    }
    pageInfo {
      ...pageInfoFields
    }
  }
}`;

    const fragment$1 = `fragment pageInfoFields on PageInfo {
  endCursor
  hasNextPage
}`;

    const fragment = `fragment repositoryFields on Repository {
  id
  url
  name
  owner {
    login
  }
  description
  descriptionHTML
  defaultBranchRef {
    name
  }
}`;

    const builder$4 = (configs) => {
        return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    pullRequests(first: 100${typeof config.endCursor === 'undefined' ?
        '' :
        `, after: "${config.endCursor}"`}, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        author {
          login
        }
        createdAt
        baseRef {
          id
        }
        labels(first: 10) {
          nodes {
            color
            name
            description
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
        mergedBy {
          avatarUrl
          login
        }
        number
        state
        title
        url
      }
    }
    owner {
      login
    }
    name
    defaultBranchRef {
      id
    }
  }`)}
}
  ${fragment$1}
`;
    };

    const builder$3 = (configs) => {
        return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    name
    owner {
      login
    }
    id
    pullRequests(first: 10, states: OPEN${typeof config.endCursor === 'undefined' ?
        '' :
        `, after: "${config.endCursor}"`}, orderBy: {field: UPDATED_AT, direction: DESC}) {
      nodes {
        commits(first: 100) {
          nodes {
            commit {
              status {
                state
                contexts {
                  context
                  targetUrl
                  description
                  state
                }
              }
              message
              messageBody
            }
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
        url
        checksResourcePath
        checksUrl
        number
        state
        updatedAt
        author {
          avatarUrl(size: 10)
          login
        }
        title
        labels(first: 10) {
          nodes {
            color
            name
            description
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
        latestOpinionatedReviews(first: 5) {
          nodes {
            state
            author {
              login
              avatarUrl
            }
          }
          pageInfo {
            ...pageInfoFields
          }
          totalCount
        }
      }
      pageInfo {
        ...pageInfoFields
      }
      totalCount
    }
  }`)}
}
  ${fragment$1}
`;
    };

    const base = (config) => `fragment ${config ? `${config.login}Fields` : 'organizationFields'} on Organization {
  login
  repositories(first: 100${config ? `, after: "${config.endCursor}"` : ''}) {
    totalCount
    nodes {
      ...repositoryFields
    }
    pageInfo {
      ...pageInfoFields
    }
  }
}`;
    const builder$2 = (after) => {
        if (!after) {
            return '';
        }
        return after.map((config) => `${base(config)}`).join('\n');
    };

    const builder$1 = (config) => {
        const { moreRepos, personalEnd } = config;
        const organizationFragment = moreRepos.length > 0 ? builder$2(moreRepos) : '';
        return `query($noPersonal: Boolean!, $noOrg: Boolean!) {
    viewer {
      login
      repositories(first: 100${typeof personalEnd === 'undefined' ?
        '' :
        `, after: "${personalEnd}"`}) @skip(if: $noPersonal) {
        totalCount
        nodes {
          ...repositoryFields
        }
        pageInfo {
          ...pageInfoFields
        }
      }
      ${moreRepos.map((repo) => `     ${repo.login}: organization(login: "${repo.login}") {
        ...${repo.login}Fields
      }`)}
      organizations(first: 10) @skip(if: $noOrg) {
        totalCount
        nodes {
          ...organizationFields
        }
        pageInfo {
          ...pageInfoFields
        }
      }
    }
  }

  ${fragment}
  ${fragment$1}
  ${fragment$2}
  ${organizationFragment}
`;
    };

    const builder = (configs) => {
        return `
query {${configs.map((config) => `
  ${config.id.replace(/\=/g, '')}: repository(name: "${config.name}", owner: "${config.owner}") {
    releases(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      edges {
        node {
          author {
            login
          }
          id
          url
          tag {
            name
          }
          createdAt
          description
        }
      }
    } 
  }`)}
}
`;
    };

    const query = `query($repositoryName: String!, $repositoryOwner: String!, $pullRequestNumber: Int!) {
  repository(name: $repositoryName, owner: $repositoryOwner) {
    pullRequest(number: $pullRequestNumber) {
      merged
      closed
    }
  }
}`;

    const baseCommitStatus = {
        state: 'FAILURE',
        contexts: [],
    };
    class PullRequestsAPI {
        constructor(app, reactor) {
            this.fetchAll = async (id, config) => {
                if (!config) {
                    return [];
                }
                const query = builder$3(config);
                const response = await this.app(query);
                return this.fetchMore(id, response, [], config);
            };
            this.fetchSingle = async (config) => {
                const response = await this.app(query, {
                    repositoryName: config.name,
                    repositoryOwner: config.owner,
                    pullRequestNumber: config.number,
                });
                return response.repository.pullRequest;
            };
            this.fetchMore = async (id, lastResponse, current, pullRequestsConfig) => {
                const repositories = this.parseResponse(lastResponse, pullRequestsConfig);
                const next = repositories
                    .map((repository) => {
                    const { nodes } = repository.pullRequests;
                    const updates = nodes.map((node) => {
                        const status = node.commits.nodes.pop()?.commit.status || baseCommitStatus;
                        return {
                            ...node,
                            owner: repository.owner.login,
                            repository: repository.name,
                            labels: node.labels.nodes,
                            reviews: node.latestOpinionatedReviews.nodes,
                            status,
                        };
                    });
                    current.push(...updates);
                    return repository;
                })
                    .filter((repository) => repository.pullRequests.pageInfo.hasNextPage)
                    .map((repository) => ({
                    endCursor: repository.pullRequests.pageInfo.endCursor,
                    owner: repository.owner.login,
                    name: repository.name,
                    id: repository.id,
                }));
                if (next.length === 0) {
                    return current;
                }
                const query = builder$3(next);
                const response = await this.app(query);
                return this.fetchMore(id, response, current, next);
            };
            this.parseResponse = (response, keys) => keys.map((key) => response[key.id.replace(/\=/g, '')]);
            this.app = app;
            this.reactor = reactor;
        }
    }

    class PullRequestsHistory {
        constructor(app, reactor) {
            this.fetchAll = async (config) => {
                const query = builder$4(config);
                const response = await this.app(query, {
                    repositoryName: 'test',
                    repositoryOwner: 'cameronaziz',
                });
                return Object.values(response)
                    .reduce((acc, cur) => {
                    const pullRequests = cur.pullRequests.nodes.map((node) => ({
                        ...node,
                        defaultBranchRef: cur.defaultBranchRef,
                        owner: cur.owner,
                        name: cur.name,
                    }));
                    acc.push(...pullRequests);
                    return acc;
                }, [])
                    .filter((pullRequest) => pullRequest.baseRef?.id === pullRequest.defaultBranchRef.id).sort((a, b) => {
                    const aDate = new Date(a.createdAt).getTime();
                    const bDate = new Date(b.createdAt).getTime();
                    if (aDate > bDate) {
                        return -1;
                    }
                    if (aDate < bDate) {
                        return 1;
                    }
                    return 0;
                });
            };
            this.app = app;
            this.reactor = reactor;
        }
    }

    class RepositoriesAPI {
        constructor(app, reactor) {
            this.fetch = async (id) => {
                const query = builder$1({
                    moreRepos: [],
                });
                const response = await this.app(query, {
                    noPersonal: false,
                    noOrg: false,
                });
                const data = await this.fetchMore(id, response, [], []);
                return data;
            };
            this.fetchMore = async (id, lastResponse, current, moreRepos) => {
                this.reactor.dispatchEvent('partial-repository-list', [
                    id,
                    current,
                ]);
                const { organizations, repositories } = lastResponse.viewer;
                const repos = this.parseRepositories(repositories);
                current.push(...repos.repos);
                const moreOrganizations = organizations ? this.parseOrgs(organizations.nodes, current) : [];
                const data = this.parseOrgData(lastResponse.viewer, moreRepos);
                const moreOrganization = this.parseOrgs(data, current);
                const moreOrgRepos = [...moreOrganization, ...moreOrganizations];
                if (repos.repos.length === 0 && moreOrgRepos.length === 0) {
                    return current;
                }
                const query = builder$1({
                    moreRepos: moreOrgRepos,
                    personalEnd: repos.hasNextPage ? repos.endCursor : undefined,
                });
                const response = await this.app(query, {
                    noPersonal: !repos.hasNextPage,
                    noOrg: true,
                });
                return this.fetchMore(id, response, current, moreOrgRepos);
            };
            this.parseOrgs = (orgs, current) => orgs.map((node) => {
                current.push(...node.repositories.nodes);
                return node;
            })
                .filter((node) => node.repositories.pageInfo.hasNextPage)
                .map((org) => ({
                endCursor: org.repositories.pageInfo.endCursor,
                login: org.login,
            }));
            this.parseOrgData = (viewer, keys) => keys.map((key) => viewer[key.login]);
            this.parseRepositories = (repositories) => {
                if (!repositories) {
                    return {
                        hasNextPage: false,
                        endCursor: undefined,
                        repos: [],
                    };
                }
                const { pageInfo: { hasNextPage, endCursor }, nodes } = repositories;
                return {
                    hasNextPage,
                    endCursor,
                    repos: nodes,
                };
            };
            this.app = app;
            this.reactor = reactor;
        }
    }

    class TagsAPI {
        constructor(app, reactor) {
            this.fetch = async (config) => {
                if (!config) {
                    return [];
                }
                const query = builder(config);
                const response = await this.app(query);
                return response;
            };
            this.app = app;
            this.reactor = reactor;
        }
    }

    class APIApp$1 {
        constructor(key, reactor) {
            this.fetchRepositories = async (id) => this.repositories.fetch(id);
            this.fetchPullRequests = async (id, config) => this.pullRequests.fetchAll(id, config);
            this.fetchPullRequest = async (config) => this.pullRequests.fetchSingle(config);
            this.fetchPullRequestsHistory = async (config) => this.pullRequestsHistory.fetchAll(config);
            this.fetchTags = async (config) => this.tags.fetch(config);
            const auth = createTokenAuth(key);
            this.app = graphql$1.defaults({
                request: {
                    hook: auth.hook,
                },
            });
            this.tags = new TagsAPI(this.app, reactor);
            this.pullRequestsHistory = new PullRequestsHistory(this.app, reactor);
            this.repositories = new RepositoriesAPI(this.app, reactor);
            this.pullRequests = new PullRequestsAPI(this.app, reactor);
        }
    }

    const CHROME_EXTENSION_ID = 'cgglhlnkgeldlcmeemjlpooddpojhdnj';
    const FETCH_UNIT = true;
    const IS_DEV = true;
    const DISABLED_UNITS = [];
    const SERVICE_ENDPOINT$1 = 'http://localhost:3000/dev/';

    var dev = /*#__PURE__*/Object.freeze({
        __proto__: null,
        CHROME_EXTENSION_ID: CHROME_EXTENSION_ID,
        FETCH_UNIT: FETCH_UNIT,
        IS_DEV: IS_DEV,
        DISABLED_UNITS: DISABLED_UNITS,
        SERVICE_ENDPOINT: SERVICE_ENDPOINT$1
    });

    const JIRA_BASE_URL = 'https://api.atlassian.com/ex/jira/';
    const JIRA_CLIENT_ID = '98FCios0XpJ23YoEHJxy2vPaJrJzzvmp';
    const GITHUB_CLIENT_ID = '092bb99b2a1d97d76493';
    const HONEYBADGER_BASE_URL = 'https://app.honeybadger.io';

    const env = dev;
`https://${env.CHROME_EXTENSION_ID}.chromiumapp.org`;
`https://${env.CHROME_EXTENSION_ID}.chromiumapp.org/provider_cb`;
    const SERVICE_ENDPOINT = env.SERVICE_ENDPOINT;
    env.FETCH_UNIT;
    env.IS_DEV;
    env.DISABLED_UNITS;

    class ServiceAPI {
        constructor(baseUrl, headers) {
            this.baseUrl = baseUrl;
            const myHeaders = headers || new Headers();
            this.headers = myHeaders;
        }
    }

    class ServiceAuth {
        constructor(storage, service) {
            this.watchAuth = (value) => {
                if (!value) {
                    this.destroy();
                }
            };
            this.destroy = () => {
            };
            this.storage = storage;
            this.storage.listen(service, this.watchAuth);
        }
    }

    class Service {
        constructor(api, storage, delayTimes) {
            this.isNewTab = async () => {
                if (!this.lastTab) {
                    return true;
                }
                const nextTab = await currentTab();
                if (nextTab !== this.lastTab) {
                    this.lastTab = nextTab;
                    return true;
                }
                return false;
            };
            this.api = api;
            this.storage = storage;
            this.isRunning = false;
            this.lastLocal = secondsAgo(delayTimes.LOCAL_TIME + 100);
            this.lastRemote = secondsAgo(delayTimes.REMOTE_TIME + 100);
            chrome$1.tabs.onActivated.addListener(() => {
                if (this.lastTab) {
                    this.lastTab = undefined;
                }
            });
        }
    }

    class FaultsAPI extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.getTimeAgo = (monitors) => monitors.map((monitor) => {
                switch (monitor.timeAgo) {
                    case 'day': return {
                        ago: epoch.dayAgo,
                        monitor,
                    };
                    case 'hour': return {
                        ago: epoch.hourAgo,
                        monitor,
                    };
                    case 'month': return {
                        ago: epoch.monthAgo,
                        monitor,
                    };
                    case 'week': return {
                        ago: epoch.weekAgo,
                        monitor,
                    };
                    default: throw new Error(`Bad Monitor provided to getTimeAgo: ${monitor}`);
                }
            });
            this.fetch = async (projects, monitors) => {
                const nestedPromises = projects.map((project) => Promise.all(this.getTimeAgo(monitors).map((monitor) => {
                    const resultsPromise = this.fetchMore(`/v2/projects/${project}/faults${this.query(monitor.ago)}`, [], 0);
                    return Promise.all([resultsPromise, monitor]);
                })));
                const nestedProjects = await Promise.all(nestedPromises);
                const projectFaults = [].concat(...nestedProjects);
                const data = projectFaults
                    .map((projectFaults) => ({
                    faults: projectFaults[0],
                    monitor: projectFaults[1].monitor,
                }));
                const results = data
                    .map((projectFaults) => projectFaults.faults.filter((fault) => fault.notices_count >= projectFaults.monitor.noticeLimit));
                return []
                    .concat(...results)
                    .filter((fault) => fault.environment === 'production');
            };
            this.fetchMore = async (path, results, count) => {
                const url = `${this.baseUrl}${path}`;
                const response = await fetch(url, this.options);
                const result = await response.text();
                const data = JSON.parse(result);
                results.push(...data.results);
                count += 1;
                if (count < 2 && data.links.next) {
                    const next = data.links.next.replace(this.baseUrl, '');
                    return this.fetchMore(next, results, count);
                }
                return results;
            };
        }
        query(ago) {
            return `?created_after=${ago}`;
        }
        get options() {
            return {
                headers: this.headers,
                method: 'GET',
            };
        }
    }

    class HoneybadgerAPI {
        constructor(token) {
            this.destroy = () => {
            };
            this.fetchFaults = async (project, monitors) => this.faultsAPI.fetch(project, monitors);
            this.token = token;
        }
        get baseUrlAuth() {
            return HONEYBADGER_BASE_URL;
        }
        get faultsAPI() {
            if (!this.faultsAPIInstance) {
                this.faultsAPIInstance = new FaultsAPI(this.baseUrlAuth, this.headers);
            }
            return this.faultsAPIInstance;
        }
        get headers() {
            const headers = new Headers();
            headers.append('Authorization', `Basic ${this.token}`);
            return headers;
        }
    }

    class CustomFieldsAPI extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.fetch = async () => {
                const requestOptions = {
                    headers: this.headers,
                    method: 'GET',
                };
                const response = await fetch(`${this.baseUrl}rest/api/2/field`, requestOptions);
                const text = await response.text();
                const json = JSON.parse(text);
                return json;
            };
        }
    }

    const isErrorResponse = (response) => !!response.errors;

    const and$1 = ' AND ';
    class IssuesAPI$1 extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.project = (projectKey) => `project+%3D+${projectKey}`;
            this.fetch = async (watched) => {
                const config = Object.entries(watched);
                if (config.length === 0) {
                    return [];
                }
                const project = 'project=';
                const status = 'status ';
                const projects = config
                    .filter(([, settings]) => settings.statuses.length > 0)
                    .map(([projectId, settings]) => settings.statuses.map((statusId) => {
                    const base = (state) => `${project}${projectId}${and$1}${status}${state} ${statusId}${and$1}status CHANGED DURING (-7d, -0d)`;
                    return `${base('WAS')}) OR (${base('=')}`;
                }).join(') OR (')).join(') OR (');
                const requestOptions = {
                    headers: this.headers,
                    method: 'GET',
                };
                const url = `${this.URL}?jql=(${projects})&expand=changelog`;
                const response = await fetch(url, requestOptions);
                const text = await response.text();
                const json = JSON.parse(text);
                if (isErrorResponse(json)) {
                    return [];
                }
                const changes = json.issues
                    .reduce((acc, cur) => {
                    const { histories } = cur.changelog;
                    const relevant = histories
                        .filter((item) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 7);
                        const created = new Date(item.created);
                        return created.getTime() > date.getTime();
                    })
                        .map((history) => ({
                        ...history,
                        issue: cur,
                    }));
                    acc.push(...relevant);
                    return acc;
                }, [])
                    .reduce((acc, cur) => {
                    const relevantChange = cur.items.map((item) => ({
                        ...cur,
                        item: item,
                    }));
                    acc.push(...relevantChange);
                    return acc;
                }, []);
                return changes
                    .filter((change) => change.item.field === 'assignee' ||
                    change.item.field === 'status' ||
                    change.item.field === 'Sprint');
            };
        }
        get URL() {
            return `${this.baseUrl}rest/api/3/search`;
        }
    }

    const and = '+AND+';
    class IssuesAPI extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.project = (projectKey) => `project+%3D+${projectKey}`;
            this.sprint = (sprintId) => `Sprint+%3D+${sprintId}${and}`;
            this.fetch = async (watched) => {
                const config = Object.entries(watched);
                if (config.length === 0) {
                    return [];
                }
                const project = 'project%20%3D%20';
                const status = 'status+%3D+';
                const projects = config
                    .filter(([, settings]) => settings.statuses.length > 0)
                    .map(([projectId, settings]) => settings.statuses.map((statusId) => `${project}${projectId}%20AND%20${status}${statusId}`).join(') OR (')).join(') OR (');
                const requestOptions = {
                    headers: this.headers,
                    method: 'GET',
                };
                const url = `${this.URL}?jql=(${projects})`;
                const response = await fetch(url, requestOptions);
                const text = await response.text();
                const json = JSON.parse(text);
                if (isErrorResponse(json)) {
                    return [];
                }
                return json.issues;
            };
        }
        get URL() {
            return `${this.baseUrl}rest/api/3/search`;
        }
    }

    class ProjectsAPI extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.fetch = async () => this.fetchMore([], 0);
            this.fetchMore = async (current, startAt) => {
                const requestOptions = {
                    headers: this.headers,
                    method: 'GET',
                };
                const response = await fetch(`${this.baseUrl}rest/api/3/project/search?startAt=${startAt}`, requestOptions);
                const text = await response.text();
                const json = JSON.parse(text);
                const { values, isLast } = json;
                const next = [...current, ...values];
                if (isLast) {
                    return next;
                }
                return this.fetchMore(next, startAt + values.length);
            };
        }
    }

    class StatusesAPI extends ServiceAPI {
        constructor() {
            super(...arguments);
            this.fetch = async (projectIdOrKey) => {
                const requestOptions = {
                    headers: this.headers,
                    method: 'GET',
                };
                const response = await fetch(`${this.baseUrl}rest/api/3/project/${projectIdOrKey}/statuses`, requestOptions);
                const text = await response.text();
                const json = JSON.parse(text);
                return json;
            };
        }
    }

    class APIApp {
        constructor(auth) {
            this.destroy = () => {
                this.isAuth = false;
                this.issuesAPIInstance = undefined;
                this.projectsAPIInstance = undefined;
                this.statusesAPIInstance = undefined;
                this.historyAPIInstance = undefined;
            };
            this.fetch = async (retry, query, ...args) => {
                try {
                    return query(...args);
                }
                catch (error) {
                    if (retry) {
                        await this.auth.refresh();
                        return this.fetch(false, query, ...args);
                    }
                    return [];
                }
            };
            this.fetchIssues = async (watched) => this.fetch(true, this.issuesAPI.fetch, watched);
            this.fetchIssueHistory = async (watched) => this.fetch(true, this.historyAPI.fetch, watched);
            this.fetchProjects = async () => this.fetch(true, this.projectsAPI.fetch);
            this.fetchStatuses = async (projectIdOrKey) => this.fetch(true, this.statusesAPI.fetch, projectIdOrKey);
            this.fetchCustomFields = async () => this.fetch(true, this.customFieldsAPI.fetch);
            this.auth = auth;
            this.isAuth = true;
        }
        get baseUrlAuth() {
            return `${JIRA_BASE_URL}${this.authAPI.cloudId}/`;
        }
        get authAPI() {
            if (!this.auth.api) {
                throw new Error('No Token in Jira - Don\'t forget to call start');
            }
            this.isAuth = true;
            return this.auth.api;
        }
        get token() {
            return this.authAPI.token;
        }
        get appUrl() {
            return this.authAPI.appUrl;
        }
        get issuesAPI() {
            if (!this.issuesAPIInstance) {
                this.issuesAPIInstance = new IssuesAPI(this.baseUrlAuth, this.headers);
            }
            return this.issuesAPIInstance;
        }
        get projectsAPI() {
            if (!this.projectsAPIInstance) {
                this.projectsAPIInstance = new ProjectsAPI(this.baseUrlAuth, this.headers);
            }
            return this.projectsAPIInstance;
        }
        get statusesAPI() {
            if (!this.statusesAPIInstance) {
                this.statusesAPIInstance = new StatusesAPI(this.baseUrlAuth, this.headers);
            }
            return this.statusesAPIInstance;
        }
        get customFieldsAPI() {
            if (!this.customFieldsAPIInstance) {
                this.customFieldsAPIInstance = new CustomFieldsAPI(this.baseUrlAuth, this.headers);
            }
            return this.customFieldsAPIInstance;
        }
        get historyAPI() {
            if (!this.historyAPIInstance) {
                this.historyAPIInstance = new IssuesAPI$1(this.baseUrlAuth, this.headers);
            }
            return this.historyAPIInstance;
        }
        get headers() {
            const headers = new Headers();
            headers.append('Authorization', `Bearer ${this.token}`);
            headers.append('Accept', 'application/json');
            return headers;
        }
    }

    const { encode: encode$1, decode: decode$1 } = url;
    const getParams$1 = (url) => {
        const urlParts = url.split('?');
        const [domain, query] = urlParts;
        const params = {};
        if (!query) {
            return null;
        }
        const hash = query.split('&');
        for (let i = 0; i < hash.length; i += 1) {
            const value = hash[i].split('=');
            params[value[0]] = value[1];
        }
        return {
            domain,
            params,
        };
    };
    const getError$1 = (message) => {
        switch (message) {
            case 'Authorization page could not be loaded.': return 'It looks like our servers are down, try again later, try again later.';
            case 'bad-response': return 'It looks like Atlassian sent a bad response, try again.';
            case 'bad-state': return 'It looks like something fishy is going on with the response, try again..';
            case 'User did not authorize the request': return 'It looks like you didn\'t authorize our app, try again.';
            default: return 'It looks like an error happened, try again.';
        }
    };
    const parseCallbackError$1 = (params) => {
        const message = decode$1(params.error_description);
        return getError$1(message);
    };
    const display$1 = async (url, state) => {
        const { lastError } = chrome$1.runtime;
        if (lastError && Object.keys(lastError)) {
            return getError$1(lastError.message);
        }
        const result = getParams$1(url);
        if (!result) {
            return getError$1('bad-response');
        }
        const { params } = result;
        if (params?.state !== state) {
            return getError$1('bad-state');
        }
        if (params.error) {
            return parseCallbackError$1(params);
        }
        return 'authResponse';
    };
    const OAuth$1 = async () => new Promise((resolve, reject) => {
        const redirectUri = chrome$1.identity.getRedirectURL('provider_cb');
        const scope = [
            'repo',
            'user',
        ].join(' ');
        const state = v4();
        const query = `client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encode$1(redirectUri)}&scope=${encode$1(scope)}&state=${state}`;
        const url = `https://github.com/login/oauth/authorize?${query}`;
        const options = {
            interactive: true,
            url,
        };
        chrome$1.identity.launchWebAuthFlow(options, async (redirectUri) => {
            const settings = await display$1(redirectUri, state);
            if (!settings) {
                reject(settings);
                return;
            }
            resolve(settings);
        });
    });

    const GITHUB_BASE_URL = 'https://api.github.com/';
    const getToken = async (maybeToken) => {
        if (maybeToken) {
            return maybeToken;
        }
        const chromeSettings = await chrome$1.storage.get('githubAuth');
        return chromeSettings?.data.personalAccessToken;
    };
    const tokenVerify = async (maybeToken) => {
        const personalAccessToken = await getToken(maybeToken);
        if (personalAccessToken) {
            const method = 'GET';
            const headers = new Headers();
            headers.append('Authorization', `token ${personalAccessToken}`);
            const requestOptions = {
                headers,
                method,
            };
            const response = await fetch(GITHUB_BASE_URL, requestOptions);
            if (response.status !== 200) {
                return;
            }
            if (maybeToken) {
                chrome$1.storage.set('githubAuth', { personalAccessToken });
            }
            return personalAccessToken;
        }
    };

    class Auth$1 {
        constructor(storage) {
            this.kill = () => {
                this.isAuth = false;
                return this.storage.removeProperty('githubAuth');
            };
            this.watchAuth = (value) => {
                if (!value) {
                    this.destroy();
                }
            };
            this.destroy = () => {
                this.oAuthInstance = undefined;
            };
            this.fetch = async () => {
                this.stateFetch();
                await this.localFetch();
            };
            this.check = async () => {
                const isAuth = !!this.token;
                if (!isAuth) {
                    await this.fetch();
                }
                this.send();
            };
            this.save = (id) => {
                if (this.oAuthInstance) {
                    this.storage.setProperty({
                        key: 'githubAuth',
                        data: {
                            OAuth: this.oAuthInstance,
                            personalAccessToken: this.personalAccessTokenInstance,
                        },
                        meta: {
                            id,
                        },
                    });
                }
            };
            this.oAuth = async (message) => {
                const { meta: { id } } = message;
                const response = await OAuth$1();
                if (typeof response === 'string') {
                    chrome$1.runtime.respond({
                        type: 'error/SERVICE_ERROR',
                        message: response,
                        unit: 'github',
                        meta: {
                            id,
                            done: true,
                        },
                    });
                    return false;
                }
                this.save(id);
                return true;
            };
            this.pat = async (message, token) => {
                const { meta: { id } } = message;
                const tokenAuth = await tokenVerify(token);
                if (tokenAuth) {
                    this.personalAccessTokenInstance = tokenAuth;
                    this.save(id);
                    return true;
                }
                return false;
            };
            this.receive = (auth) => {
                const refreshToken = this.refreshToken || 'NO_REFRESH_TOKEN';
                if (auth.OAuth?.accessToken) {
                    this.oAuthInstance = {
                        ...auth.OAuth,
                        refreshToken,
                    };
                }
                if (auth.personalAccessToken) {
                    this.personalAccessTokenInstance = auth.personalAccessToken;
                }
                this.send();
            };
            this.send = () => {
                const isAuth = !!this.token;
                chrome$1.runtime.respond({
                    type: 'github/IS_AUTHENTICATED',
                    isAuthenticated: isAuth,
                    meta: {
                        done: true,
                        id: v4(),
                    },
                });
            };
            this.stateFetch = () => {
                this.send();
            };
            this.localFetch = async () => {
                const auth = await this.storage.readProperty('githubAuth');
                if (auth) {
                    this.isAuth = true;
                    this.receive(auth);
                }
            };
            this.storage = storage;
            this.isAuth = false;
            this.storage.listen('githubAuth', this.watchAuth);
        }
        get token() {
            if (!this.isAuth) {
                return null;
            }
            if (this.personalAccessTokenInstance) {
                return this.personalAccessTokenInstance;
            }
            if (this.oAuthInstance) {
                return this.oAuthInstance.accessToken;
            }
            return null;
        }
        get refreshToken() {
            if (this.oAuthInstance) {
                return this.oAuthInstance.refreshToken;
            }
            return;
        }
    }

    const LOCAL_INCREMENT_TIME$2 = 30;
    const REMOTE_INCREMENT_TIME$1 = 120;
    class PullRequests {
        constructor(api, storage) {
            this.fetch = async (message) => {
                const { id } = message.meta;
                this.stateFetch(id);
                await this.localFetch(id);
                this.remoteFetch(id);
            };
            this.kill = () => {
                this.pullRequestsInstance = [];
                return this.storage.removeProperty('githubPullRequests');
            };
            this.send = (id, done) => {
                chrome$1.runtime.respond({
                    type: 'github/PULL_REQUESTS_RESPONSE',
                    data: this.pullRequests,
                    meta: {
                        done,
                        id,
                    },
                });
            };
            this.stateFetch = async (id) => {
                if (this.pullRequests.length > 0) {
                    this.send(id, false);
                }
            };
            this.watchGithubRepositories = async (changes) => {
                const { newValue } = changes;
                this.pullRequestsInstance = [];
                if (newValue) {
                    this.remoteGet('storage-change: githubRepositories', newValue.watchedList);
                }
            };
            this.localFetch = async (id) => {
                const pullRequests = await this.localGet();
                this.pullRequestsInstance = pullRequests;
                if (!id) {
                    return;
                }
                this.send(id, false);
            };
            this.localGet = async () => {
                const local = await this.storage.readProperty('githubPullRequests');
                this.lastLocal = new Date().getTime();
                if (local?.pullRequests) {
                    const { pullRequests } = local;
                    return pullRequests;
                }
                return [];
            };
            this.save = (id) => {
                this.storage.setProperty({
                    key: 'githubPullRequests',
                    data: {
                        pullRequests: this.pullRequests,
                    },
                    meta: {
                        id,
                    },
                    overwrite: true,
                });
            };
            this.remoteGet = async (id, watched) => {
                if (!watched || watched.length === 0) {
                    this.pullRequestsInstance = [];
                    this.save(id);
                    return;
                }
                this.lastRemote = new Date().getTime();
                this.isRunning = true;
                const pullRequests = await this.api.fetchPullRequests(id, watched);
                const clean = pullRequests.map(PullRequests.parsePullRequest);
                this.pullRequestsInstance = clean;
                this.isRunning = false;
                this.save(id);
            };
            this.remoteFetch = async (id) => {
                if (this.isRunning) {
                    return;
                }
                const local = await this.storage.readProperty('githubRepositories');
                if (!local) {
                    return;
                }
                await this.remoteGet(id, local.watchedList);
                this.send(id, true);
            };
            this.storage = storage;
            this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME$2 + 10);
            this.lastRemote = secondsAgo(REMOTE_INCREMENT_TIME$1 + 10);
            this.api = api;
            this.pullRequestsInstance = [];
            this.isRunning = false;
            chrome$1.storage.addListener('githubRepositories', this.watchGithubRepositories);
        }
        get pullRequests() {
            return this.pullRequestsInstance;
        }
    }
    PullRequests.parsePullRequest = (pr) => ({
        ...pr,
        approvedCount: pr.reviews.filter((review) => review.state === 'APPROVED').length,
        isRejected: pr.reviews.filter((review) => review.state === 'CHANGES_REQUESTED').length > 0,
        prNumber: pr.number,
        createdBy: pr.author.login,
    });

    const LOCAL_TIME$1 = 3600;
    const REMOTE_TIME$1 = LOCAL_TIME$1 * 50;
    class Repositories {
        constructor(api, storage) {
            this.fetch = async (message) => {
                const needsLocal = secondsAgo(LOCAL_TIME$1) > this.lastLocal;
                const needsRemote = secondsAgo(REMOTE_TIME$1) > this.lastRemote;
                const { id } = message.meta;
                this.stateFetch(id, false);
                if (needsLocal || this.repositories.length === 0) {
                    this.localFetch(id, !needsRemote);
                }
                if (needsRemote || this.repositories.length === 0) {
                    this.remoteFetch(id, true);
                }
            };
            this.kill = () => {
                this.repositoriesInstance = [];
                return this.storage.removeProperty('githubRepositories');
            };
            this.prepWatched = (repo) => ({
                id: repo.id,
                owner: repo.owner,
                name: repo.name,
            });
            this.write = async (message) => {
                const { id, nextIsWatched } = message;
                const repo = this.repositoriesInstance.find((repo) => repo.id === id);
                if (!repo) {
                    return;
                }
                const watchedIndex = this.watchedList.findIndex((repo) => repo.id === id);
                if (!nextIsWatched) {
                    this.watchedList = this.watchedList.splice(watchedIndex, 1);
                }
                if (nextIsWatched && watchedIndex < 0) {
                    const watched = this.prepWatched(repo);
                    this.watchedList.push(watched);
                }
                this.save(id);
            };
            this.convert = (repositories) => repositories
                .sort((a, b) => {
                const aName = a.name.toUpperCase();
                const bName = b.name.toUpperCase();
                if (aName < bName) {
                    return -1;
                }
                if (aName > bName) {
                    return 1;
                }
                return 0;
            })
                .map((repo) => ({
                ...repo,
                isWatched: this.watchedList.findIndex((r) => repo.id === r.id) > -1,
            }));
            this.isUnique = (repo) => `${repo.owner}/${repo.name}`;
            this.send = (id, done) => {
                chrome$1.runtime.respond({
                    type: 'github/REPOSITORIES_RESPONSE',
                    data: this.repositories,
                    meta: {
                        id,
                        done,
                    },
                });
            };
            this.stateFetch = (id, done) => {
                if (this.repositories.length > 0) {
                    this.send(id, done);
                }
            };
            this.partialResponse = ([id, repositories]) => {
                const remoteRepos = this.prep(repositories);
                chrome$1.runtime.respond({
                    type: 'github/REPOSITORIES_RESPONSE',
                    data: this.convert(remoteRepos),
                    meta: {
                        id,
                        done: true,
                    },
                });
            };
            this.localFetch = async (id, done) => {
                const local = await this.storage.readProperty('githubRepositories');
                this.lastLocal = secondsAgo(0);
                this.repositoriesInstance = local?.repositories || [];
                this.watchedList = local?.watchedList || [];
                this.send(id, done);
            };
            this.prep = (repositories) => repositories
                .map((repository) => ({
                ...repository,
                owner: repository.owner.login,
                fullName: `${repository.owner.login}/${repository.name}`,
                defaultBranch: repository.defaultBranchRef?.name,
            }));
            this.remoteFetch = async (id, done) => {
                if (this.isRunning) {
                    return;
                }
                this.isRunning = true;
                const repositories = await this.api.fetchRepositories(id);
                this.lastRemote = secondsAgo(0);
                const remoteRepos = this.prep(repositories);
                this.repositoriesInstance = remoteRepos;
                this.isRunning = false;
                this.send(id, done);
                this.save(id);
            };
            this.save = (id) => {
                this.storage.setProperty({
                    key: 'githubRepositories',
                    data: {
                        repositories: this.repositories,
                        watchedList: this.watchedList,
                    },
                    meta: {
                        id,
                    },
                    overwrite: true,
                });
            };
            chrome$1.tabs.onActivated.addListener(() => {
                if (this.lastTab) {
                    this.lastTab = undefined;
                }
            });
            this.lastLocal = secondsAgo(LOCAL_TIME$1 + 100);
            this.lastSend = [];
            this.lastRemote = secondsAgo(REMOTE_TIME$1 - 100);
            this.storage = storage;
            this.api = api;
            this.repositoriesInstance = [];
            this.watchedList = [];
            this.isRunning = false;
        }
        get repositories() {
            return uniqueBy(this.convert(this.repositoriesInstance), this.isUnique);
        }
    }

    class Github {
        constructor(storage) {
            this.fetch = async (message) => {
                if (message.type === 'github/AUTHENTICATE_REQUEST') {
                    await this.authenticate(message);
                    return;
                }
                if (message.type === 'github/AUTHENTICATE_CHECK') {
                    this.auth.check();
                    return;
                }
                if (message.type === 'github/LOGOUT') {
                    this.killCurrent();
                    return;
                }
                if (!this.auth.token) {
                    await this.start();
                    if (!this.auth.token) {
                        chrome$1.runtime.respond({
                            type: 'github/IS_AUTHENTICATED',
                            isAuthenticated: false,
                            meta: {
                                id: message.meta.id,
                                done: true,
                            },
                        });
                        return;
                    }
                }
                switch (message.type) {
                    case 'github/PULL_REQUESTS_FETCH': {
                        this.pullRequests.fetch(message);
                        break;
                    }
                    case 'github/REPOSITORIES_FETCH': {
                        this.repositories.fetch(message);
                        break;
                    }
                }
            };
            this.write = async (message) => {
                switch (message.type) {
                    case 'github/REPOSITORIES_UPDATE_WATCHED': {
                        this.repositories.write(message);
                        break;
                    }
                }
            };
            this.authenticate = async (message) => {
                if (!message.token) {
                    await this.auth.oAuth(message);
                }
                if (message.token) {
                    await this.auth.pat(message, message.token);
                }
                this.pendingFetches.forEach((message) => {
                    this.fetch(message);
                });
            };
            this.killCurrent = async () => {
                await this.pullRequests.kill();
                await this.repositories.kill();
                await this.auth.kill();
            };
            this.start = async () => {
                await this.auth.fetch();
            };
            this.storage = storage;
            this.reactor = new Reactor();
            this.auth = new Auth$1(this.storage);
            this.start();
            this.pendingFetches = new Set();
        }
        get token() {
            if (!this.auth.token) {
                throw new Error('No Token in Github - Don\'t forget to call start');
            }
            return this.auth.token;
        }
        get api() {
            if (!this.apiInstance) {
                this.apiInstance = new APIApp$1(this.token, this.reactor);
            }
            return this.apiInstance;
        }
        get repositories() {
            if (!this.repositoriesInstance) {
                this.repositoriesInstance = new Repositories(this.api, this.storage);
            }
            return this.repositoriesInstance;
        }
        get pullRequests() {
            if (!this.pullRequestsInstance) {
                this.pullRequestsInstance = new PullRequests(this.api, this.storage);
            }
            return this.pullRequestsInstance;
        }
    }

    /**
     * @name compareAsc
     * @category Common Helpers
     * @summary Compare the two dates and return -1, 0 or 1.
     *
     * @description
     * Compare the two dates and return 1 if the first date is after the second,
     * -1 if the first date is before the second or 0 if dates are equal.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} dateLeft - the first date to compare
     * @param {Date|Number} dateRight - the second date to compare
     * @returns {Number} the result of the comparison
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Compare 11 February 1987 and 10 July 1989:
     * const result = compareAsc(new Date(1987, 1, 11), new Date(1989, 6, 10))
     * //=> -1
     *
     * @example
     * // Sort the array of dates:
     * const result = [
     *   new Date(1995, 6, 2),
     *   new Date(1987, 1, 11),
     *   new Date(1989, 6, 10)
     * ].sort(compareAsc)
     * //=> [
     * //   Wed Feb 11 1987 00:00:00,
     * //   Mon Jul 10 1989 00:00:00,
     * //   Sun Jul 02 1995 00:00:00
     * // ]
     */

    function compareAsc(dirtyDateLeft, dirtyDateRight) {
      requiredArgs(2, arguments);
      var dateLeft = toDate(dirtyDateLeft);
      var dateRight = toDate(dirtyDateRight);
      var diff = dateLeft.getTime() - dateRight.getTime();

      if (diff < 0) {
        return -1;
      } else if (diff > 0) {
        return 1; // Return 0 if diff is 0; return NaN if diff is NaN
      } else {
        return diff;
      }
    }

    /**
     * @name differenceInCalendarMonths
     * @category Month Helpers
     * @summary Get the number of calendar months between the given dates.
     *
     * @description
     * Get the number of calendar months between the given dates.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} dateLeft - the later date
     * @param {Date|Number} dateRight - the earlier date
     * @returns {Number} the number of calendar months
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // How many calendar months are between 31 January 2014 and 1 September 2014?
     * var result = differenceInCalendarMonths(
     *   new Date(2014, 8, 1),
     *   new Date(2014, 0, 31)
     * )
     * //=> 8
     */

    function differenceInCalendarMonths(dirtyDateLeft, dirtyDateRight) {
      requiredArgs(2, arguments);
      var dateLeft = toDate(dirtyDateLeft);
      var dateRight = toDate(dirtyDateRight);
      var yearDiff = dateLeft.getFullYear() - dateRight.getFullYear();
      var monthDiff = dateLeft.getMonth() - dateRight.getMonth();
      return yearDiff * 12 + monthDiff;
    }

    /**
     * @name differenceInMilliseconds
     * @category Millisecond Helpers
     * @summary Get the number of milliseconds between the given dates.
     *
     * @description
     * Get the number of milliseconds between the given dates.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} dateLeft - the later date
     * @param {Date|Number} dateRight - the earlier date
     * @returns {Number} the number of milliseconds
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // How many milliseconds are between
     * // 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
     * const result = differenceInMilliseconds(
     *   new Date(2014, 6, 2, 12, 30, 21, 700),
     *   new Date(2014, 6, 2, 12, 30, 20, 600)
     * )
     * //=> 1100
     */

    function differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) {
      requiredArgs(2, arguments);
      var dateLeft = toDate(dirtyDateLeft);
      var dateRight = toDate(dirtyDateRight);
      return dateLeft.getTime() - dateRight.getTime();
    }

    /**
     * @name endOfDay
     * @category Day Helpers
     * @summary Return the end of a day for the given date.
     *
     * @description
     * Return the end of a day for the given date.
     * The result will be in the local timezone.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the original date
     * @returns {Date} the end of a day
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // The end of a day for 2 September 2014 11:55:00:
     * const result = endOfDay(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 02 2014 23:59:59.999
     */

    function endOfDay(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      date.setHours(23, 59, 59, 999);
      return date;
    }

    /**
     * @name endOfMonth
     * @category Month Helpers
     * @summary Return the end of a month for the given date.
     *
     * @description
     * Return the end of a month for the given date.
     * The result will be in the local timezone.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the original date
     * @returns {Date} the end of a month
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // The end of a month for 2 September 2014 11:55:00:
     * const result = endOfMonth(new Date(2014, 8, 2, 11, 55, 0))
     * //=> Tue Sep 30 2014 23:59:59.999
     */

    function endOfMonth(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      var month = date.getMonth();
      date.setFullYear(date.getFullYear(), month + 1, 0);
      date.setHours(23, 59, 59, 999);
      return date;
    }

    /**
     * @name isLastDayOfMonth
     * @category Month Helpers
     * @summary Is the given date the last day of a month?
     *
     * @description
     * Is the given date the last day of a month?
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to check
     * @returns {Boolean} the date is the last day of a month
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Is 28 February 2014 the last day of a month?
     * var result = isLastDayOfMonth(new Date(2014, 1, 28))
     * //=> true
     */

    function isLastDayOfMonth(dirtyDate) {
      requiredArgs(1, arguments);
      var date = toDate(dirtyDate);
      return endOfDay(date).getTime() === endOfMonth(date).getTime();
    }

    /**
     * @name differenceInMonths
     * @category Month Helpers
     * @summary Get the number of full months between the given dates.
     *
     * @description
     * Get the number of full months between the given dates.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} dateLeft - the later date
     * @param {Date|Number} dateRight - the earlier date
     * @returns {Number} the number of full months
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // How many full months are between 31 January 2014 and 1 September 2014?
     * var result = differenceInMonths(new Date(2014, 8, 1), new Date(2014, 0, 31))
     * //=> 7
     */

    function differenceInMonths(dirtyDateLeft, dirtyDateRight) {
      requiredArgs(2, arguments);
      var dateLeft = toDate(dirtyDateLeft);
      var dateRight = toDate(dirtyDateRight);
      var sign = compareAsc(dateLeft, dateRight);
      var difference = Math.abs(differenceInCalendarMonths(dateLeft, dateRight));
      var result; // Check for the difference of less than month

      if (difference < 1) {
        result = 0;
      } else {
        if (dateLeft.getMonth() === 1 && dateLeft.getDate() > 27) {
          // This will check if the date is end of Feb and assign a higher end of month date
          // to compare it with Jan
          dateLeft.setDate(30);
        }

        dateLeft.setMonth(dateLeft.getMonth() - sign * difference); // Math.abs(diff in full months - diff in calendar months) === 1 if last calendar month is not full
        // If so, result must be decreased by 1 in absolute value

        var isLastMonthNotFull = compareAsc(dateLeft, dateRight) === -sign; // Check for cases of one full calendar month

        if (isLastDayOfMonth(toDate(dirtyDateLeft)) && difference === 1 && compareAsc(dirtyDateLeft, dateRight) === 1) {
          isLastMonthNotFull = false;
        }

        result = sign * (difference - Number(isLastMonthNotFull));
      } // Prevent negative zero


      return result === 0 ? 0 : result;
    }

    /**
     * @name differenceInSeconds
     * @category Second Helpers
     * @summary Get the number of seconds between the given dates.
     *
     * @description
     * Get the number of seconds between the given dates.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} dateLeft - the later date
     * @param {Date|Number} dateRight - the earlier date
     * @returns {Number} the number of seconds
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // How many seconds are between
     * // 2 July 2014 12:30:07.999 and 2 July 2014 12:30:20.000?
     * const result = differenceInSeconds(
     *   new Date(2014, 6, 2, 12, 30, 20, 0),
     *   new Date(2014, 6, 2, 12, 30, 7, 999)
     * )
     * //=> 12
     */

    function differenceInSeconds(dirtyDateLeft, dirtyDateRight) {
      requiredArgs(2, arguments);
      var diff = differenceInMilliseconds(dirtyDateLeft, dirtyDateRight) / 1000;
      return diff > 0 ? Math.floor(diff) : Math.ceil(diff);
    }

    function assign(target, dirtyObject) {
      if (target == null) {
        throw new TypeError('assign requires that input parameter not be null or undefined');
      }

      dirtyObject = dirtyObject || {};

      for (var property in dirtyObject) {
        if (dirtyObject.hasOwnProperty(property)) {
          target[property] = dirtyObject[property];
        }
      }

      return target;
    }

    function cloneObject(dirtyObject) {
      return assign({}, dirtyObject);
    }

    var MINUTES_IN_DAY = 1440;
    var MINUTES_IN_ALMOST_TWO_DAYS = 2520;
    var MINUTES_IN_MONTH = 43200;
    var MINUTES_IN_TWO_MONTHS = 86400;
    /**
     * @name formatDistance
     * @category Common Helpers
     * @summary Return the distance between the given dates in words.
     *
     * @description
     * Return the distance between the given dates in words.
     *
     * | Distance between dates                                            | Result              |
     * |-------------------------------------------------------------------|---------------------|
     * | 0 ... 30 secs                                                     | less than a minute  |
     * | 30 secs ... 1 min 30 secs                                         | 1 minute            |
     * | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
     * | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
     * | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
     * | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
     * | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
     * | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
     * | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
     * | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
     * | 1 yr ... 1 yr 3 months                                            | about 1 year        |
     * | 1 yr 3 months ... 1 yr 9 month s                                  | over 1 year         |
     * | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
     * | N yrs ... N yrs 3 months                                          | about N years       |
     * | N yrs 3 months ... N yrs 9 months                                 | over N years        |
     * | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
     *
     * With `options.includeSeconds == true`:
     * | Distance between dates | Result               |
     * |------------------------|----------------------|
     * | 0 secs ... 5 secs      | less than 5 seconds  |
     * | 5 secs ... 10 secs     | less than 10 seconds |
     * | 10 secs ... 20 secs    | less than 20 seconds |
     * | 20 secs ... 40 secs    | half a minute        |
     * | 40 secs ... 60 secs    | less than a minute   |
     * | 60 secs ... 90 secs    | 1 minute             |
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The function was renamed from `distanceInWords ` to `formatDistance`
     *   to make its name consistent with `format` and `formatRelative`.
     *
     * - The order of arguments is swapped to make the function
     *   consistent with `differenceIn...` functions.
     *
     *   ```javascript
     *   // Before v2.0.0
     *
     *   distanceInWords(
     *     new Date(1986, 3, 4, 10, 32, 0),
     *     new Date(1986, 3, 4, 11, 32, 0),
     *     { addSuffix: true }
     *   ) //=> 'in about 1 hour'
     *
     *   // v2.0.0 onward
     *
     *   formatDistance(
     *     new Date(1986, 3, 4, 11, 32, 0),
     *     new Date(1986, 3, 4, 10, 32, 0),
     *     { addSuffix: true }
     *   ) //=> 'in about 1 hour'
     *   ```
     *
     * @param {Date|Number} date - the date
     * @param {Date|Number} baseDate - the date to compare with
     * @param {Object} [options] - an object with options.
     * @param {Boolean} [options.includeSeconds=false] - distances less than a minute are more detailed
     * @param {Boolean} [options.addSuffix=false] - result indicates if the second date is earlier or later than the first
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @returns {String} the distance in words
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `baseDate` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `formatDistance` property
     *
     * @example
     * // What is the distance between 2 July 2014 and 1 January 2015?
     * const result = formatDistance(new Date(2014, 6, 2), new Date(2015, 0, 1))
     * //=> '6 months'
     *
     * @example
     * // What is the distance between 1 January 2015 00:00:15
     * // and 1 January 2015 00:00:00, including seconds?
     * const result = formatDistance(
     *   new Date(2015, 0, 1, 0, 0, 15),
     *   new Date(2015, 0, 1, 0, 0, 0),
     *   { includeSeconds: true }
     * )
     * //=> 'less than 20 seconds'
     *
     * @example
     * // What is the distance from 1 January 2016
     * // to 1 January 2015, with a suffix?
     * const result = formatDistance(new Date(2015, 0, 1), new Date(2016, 0, 1), {
     *   addSuffix: true
     * })
     * //=> 'about 1 year ago'
     *
     * @example
     * // What is the distance between 1 August 2016 and 1 January 2015 in Esperanto?
     * import { eoLocale } from 'date-fns/locale/eo'
     * const result = formatDistance(new Date(2016, 7, 1), new Date(2015, 0, 1), {
     *   locale: eoLocale
     * })
     * //=> 'pli ol 1 jaro'
     */

    function formatDistance(dirtyDate, dirtyBaseDate) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      requiredArgs(2, arguments);
      var locale$1 = options.locale || locale;

      if (!locale$1.formatDistance) {
        throw new RangeError('locale must contain formatDistance property');
      }

      var comparison = compareAsc(dirtyDate, dirtyBaseDate);

      if (isNaN(comparison)) {
        throw new RangeError('Invalid time value');
      }

      var localizeOptions = cloneObject(options);
      localizeOptions.addSuffix = Boolean(options.addSuffix);
      localizeOptions.comparison = comparison;
      var dateLeft;
      var dateRight;

      if (comparison > 0) {
        dateLeft = toDate(dirtyBaseDate);
        dateRight = toDate(dirtyDate);
      } else {
        dateLeft = toDate(dirtyDate);
        dateRight = toDate(dirtyBaseDate);
      }

      var seconds = differenceInSeconds(dateRight, dateLeft);
      var offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1000;
      var minutes = Math.round((seconds - offsetInSeconds) / 60);
      var months; // 0 up to 2 mins

      if (minutes < 2) {
        if (options.includeSeconds) {
          if (seconds < 5) {
            return locale$1.formatDistance('lessThanXSeconds', 5, localizeOptions);
          } else if (seconds < 10) {
            return locale$1.formatDistance('lessThanXSeconds', 10, localizeOptions);
          } else if (seconds < 20) {
            return locale$1.formatDistance('lessThanXSeconds', 20, localizeOptions);
          } else if (seconds < 40) {
            return locale$1.formatDistance('halfAMinute', null, localizeOptions);
          } else if (seconds < 60) {
            return locale$1.formatDistance('lessThanXMinutes', 1, localizeOptions);
          } else {
            return locale$1.formatDistance('xMinutes', 1, localizeOptions);
          }
        } else {
          if (minutes === 0) {
            return locale$1.formatDistance('lessThanXMinutes', 1, localizeOptions);
          } else {
            return locale$1.formatDistance('xMinutes', minutes, localizeOptions);
          }
        } // 2 mins up to 0.75 hrs

      } else if (minutes < 45) {
        return locale$1.formatDistance('xMinutes', minutes, localizeOptions); // 0.75 hrs up to 1.5 hrs
      } else if (minutes < 90) {
        return locale$1.formatDistance('aboutXHours', 1, localizeOptions); // 1.5 hrs up to 24 hrs
      } else if (minutes < MINUTES_IN_DAY) {
        var hours = Math.round(minutes / 60);
        return locale$1.formatDistance('aboutXHours', hours, localizeOptions); // 1 day up to 1.75 days
      } else if (minutes < MINUTES_IN_ALMOST_TWO_DAYS) {
        return locale$1.formatDistance('xDays', 1, localizeOptions); // 1.75 days up to 30 days
      } else if (minutes < MINUTES_IN_MONTH) {
        var days = Math.round(minutes / MINUTES_IN_DAY);
        return locale$1.formatDistance('xDays', days, localizeOptions); // 1 month up to 2 months
      } else if (minutes < MINUTES_IN_TWO_MONTHS) {
        months = Math.round(minutes / MINUTES_IN_MONTH);
        return locale$1.formatDistance('aboutXMonths', months, localizeOptions);
      }

      months = differenceInMonths(dateRight, dateLeft); // 2 months up to 12 months

      if (months < 12) {
        var nearestMonth = Math.round(minutes / MINUTES_IN_MONTH);
        return locale$1.formatDistance('xMonths', nearestMonth, localizeOptions); // 1 year up to max Date
      } else {
        var monthsSinceStartOfYear = months % 12;
        var years = Math.floor(months / 12); // N years up to 1 years 3 months

        if (monthsSinceStartOfYear < 3) {
          return locale$1.formatDistance('aboutXYears', years, localizeOptions); // N years 3 months up to N years 9 months
        } else if (monthsSinceStartOfYear < 9) {
          return locale$1.formatDistance('overXYears', years, localizeOptions); // N years 9 months up to N year 12 months
        } else {
          return locale$1.formatDistance('almostXYears', years + 1, localizeOptions);
        }
      }
    }

    class PullRequestHistory {
        constructor(github, storage) {
            this.labelMessage = (labelLength) => {
                switch (labelLength) {
                    case 0: return 'with';
                    default: return 'as';
                }
            };
            this.fetch = async () => {
                try {
                    this.github.api;
                }
                catch (error) {
                }
                const local = await this.storage.readProperty('githubRepositories');
                if (!local) {
                    return [];
                }
                const { watchedList } = local;
                const history = await this.github.api.fetchPullRequestsHistory(watchedList);
                return history
                    .map((item) => {
                    const prName = `${item.owner.login}/${item.name}/${item.number}`;
                    const labels = item.labels.totalCount == 0 ? [] : item.labels.nodes;
                    const tiles = labels.length === 0 ?
                        [{
                                label: 'NO LABELS',
                                level: {
                                    color: 'ff0000',
                                },
                            }] :
                        labels
                            .map((label) => ({
                            label: label.name,
                            level: {
                                color: label.color,
                            },
                        }))
                            .reduce((acc, cur, index, source) => {
                            acc.push(cur);
                            if (index + 1 !== source.length) {
                                acc.push('and');
                            }
                            return acc;
                        }, []);
                    switch (item.state) {
                        case 'MERGED': {
                            return {
                                app: 'github',
                                id: v4(),
                                type: 'merge',
                                createdAt: item.createdAt,
                                message: [
                                    'Pull Request',
                                    {
                                        label: prName,
                                        url: item.url,
                                        level: 'secondary',
                                    },
                                    'was merged by',
                                    {
                                        label: `${item.mergedBy.login}`,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    this.labelMessage(labels.length),
                                    ...tiles,
                                    `${formatDistance(new Date(item.createdAt), new Date())} ago`,
                                ],
                            };
                        }
                        case 'CLOSED': {
                            return {
                                app: 'github',
                                id: v4(),
                                createdAt: item.createdAt,
                                type: 'close',
                                message: [
                                    'Pull Request',
                                    {
                                        label: prName,
                                        url: item.url,
                                        level: 'secondary',
                                    },
                                    'was closed by',
                                    {
                                        label: `${item.author.login}`,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    `${formatDistance(new Date(item.createdAt), new Date())} ago`,
                                ],
                            };
                        }
                        case 'OPEN': {
                            return {
                                app: 'github',
                                id: v4(),
                                type: 'open',
                                createdAt: item.createdAt,
                                message: [
                                    'Pull Request',
                                    {
                                        label: prName,
                                        url: item.url,
                                        level: 'secondary',
                                    },
                                    'was created by',
                                    {
                                        label: `${item.author.login}`,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    `${formatDistance(new Date(item.createdAt), new Date())} ago`,
                                ],
                            };
                        }
                    }
                });
            };
            this.github = github;
            this.storage = storage;
        }
    }

    class TagHistory {
        constructor(github, storage) {
            this.labelMessage = (labelLength) => {
                switch (labelLength) {
                    case 0: return 'with';
                    case 1: return 'labeled as a';
                    default: return 'labeled as';
                }
            };
            this.fetch = async () => {
                try {
                    this.github.api;
                }
                catch (error) {
                }
                const local = await this.storage.readProperty('githubRepositories');
                if (!local) {
                    return [];
                }
                const { watchedList } = local;
                const tags = await this.github.api.fetchTags(watchedList);
                return watchedList
                    .map((item) => {
                    const tag = tags[item.id.replace('=', '')];
                    if (!tag) {
                        return [];
                    }
                    return tag.releases.edges.map((edge) => ({
                        app: 'github',
                        createdAt: edge.node.createdAt,
                        id: edge.node.id,
                        type: 'release',
                        message: [
                            'Version',
                            {
                                label: edge.node.tag.name,
                                url: edge.node.url,
                                level: 'secondary',
                            },
                            'was released by',
                            {
                                label: edge.node.author.login,
                                level: 'quaternary',
                            },
                            `${formatDistance(new Date(edge.node.createdAt), new Date())} ago`,
                        ],
                    }));
                })
                    .reduce((acc, cur) => {
                    acc.push(...cur);
                    return acc;
                }, []);
            };
            this.github = github;
            this.storage = storage;
        }
    }

    class IssueHistory {
        constructor(jira, storage) {
            this.labelMessage = (labelLength) => {
                switch (labelLength) {
                    case 0: return 'with';
                    case 1: return 'labeled as a';
                    default: return 'labeled as';
                }
            };
            this.fetch = async () => {
                try {
                    this.jira.api;
                }
                catch (error) {
                }
                const local = await this.storage.readProperty('jiraProjects');
                if (!local || !local.watched) {
                    return [];
                }
                const { watched } = local;
                const history = await this.jira.api.fetchIssueHistory(watched);
                const changes = history
                    .map((relevant) => {
                    switch (relevant.item.field) {
                        case 'status': {
                            return {
                                app: 'jira',
                                id: v4(),
                                type: 'status',
                                createdAt: relevant.created,
                                message: [
                                    'Issue',
                                    {
                                        label: relevant.issue.key,
                                        url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                                        level: 'secondary',
                                    },
                                    'was moved from',
                                    {
                                        label: relevant.item.fromString,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    'to',
                                    {
                                        label: relevant.item.toString,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    'by',
                                    {
                                        label: relevant.author?.displayName || 'Jira Bot',
                                        level: 'quaternary',
                                    },
                                    `${formatDistance(new Date(relevant.created), new Date())} ago`,
                                ],
                            };
                        }
                        case 'assignee': {
                            return {
                                app: 'jira',
                                id: v4(),
                                createdAt: relevant.created,
                                type: 'assignee',
                                message: [
                                    'Issue',
                                    {
                                        label: relevant.issue.key,
                                        url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                                        level: 'secondary',
                                    },
                                    'was assigned to',
                                    {
                                        label: relevant.item.toString,
                                        level: 'quaternary',
                                        isFilterable: true,
                                    },
                                    'by',
                                    {
                                        label: relevant.author?.displayName || 'Jira Bot',
                                        level: 'quaternary',
                                    },
                                    `${formatDistance(new Date(relevant.created), new Date())} ago`,
                                ],
                            };
                        }
                        case 'Sprint': {
                            return {
                                app: 'jira',
                                id: v4(),
                                createdAt: relevant.created,
                                type: 'sprints',
                                message: [
                                    'Issue',
                                    {
                                        label: relevant.issue.key,
                                        url: `${this.jira.api.appUrl}/browse/${relevant.issue.key}`,
                                        level: 'secondary',
                                    },
                                    'was moved to sprint',
                                    {
                                        label: relevant.item.toString,
                                        level: 'quaternary',
                                    },
                                    'by',
                                    {
                                        label: relevant.author?.displayName || 'Jira Bot',
                                        level: 'quaternary',
                                    },
                                    `${formatDistance(new Date(relevant.created), new Date())} ago`,
                                ],
                            };
                        }
                        default: {
                            console.log(relevant);
                            throw Error('Bad');
                        }
                    }
                });
                return changes;
            };
            this.jira = jira;
            this.storage = storage;
        }
    }

    const LOCAL_INCREMENT_TIME$1 = 30;
    class Feed {
        constructor(storage, github, jira) {
            this.fetch = async (message) => {
                const { id } = message.meta;
                this.stateFetch(id);
                await this.localFetch(id);
                this.remoteFetch();
            };
            this.write = async (message) => {
                const { meta: { id }, feedItemId } = message;
                this.feedInstance = this.feedInstance.filter((item) => item.id !== feedItemId);
                this.send(id, true);
                this.save(id);
            };
            this.kill = () => {
                this.feedInstance = [];
                return this.storage.removeProperty('historyFeed');
            };
            this.send = (id, done) => {
                chrome$1.runtime.respond({
                    type: 'history/FEED_RESPONSE',
                    data: this.feed,
                    meta: {
                        done,
                        id,
                    },
                });
            };
            this.stateFetch = async (id) => {
                if (this.feed.length > 0) {
                    this.send(id, false);
                }
            };
            this.localFetch = async (id) => {
                const feed = await this.localGet();
                this.feedInstance = feed;
                if (!id) {
                    return;
                }
                this.send(id, false);
            };
            this.localGet = async () => {
                const local = await this.storage.readProperty('historyFeed');
                this.lastLocal = new Date().getTime();
                if (local?.feed) {
                    const { feed } = local;
                    return feed;
                }
                return [];
            };
            this.remoteFetch = async () => {
                const issues = await this.issuesHistory.fetch();
                const tags = await this.tagsHistory.fetch();
                const pullRequests = await this.pullRequestHistory.fetch();
                const data = [...tags, ...pullRequests, ...issues];
                data.sort((a, b) => {
                    const aDate = new Date(a.createdAt);
                    const bDate = new Date(b.createdAt);
                    if (aDate > bDate) {
                        return -1;
                    }
                    if (aDate < bDate) {
                        return 1;
                    }
                    return 0;
                });
                this.feedInstance = data;
                this.save(v4());
                this.send(v4(), true);
            };
            this.save = (id) => {
                this.storage.setProperty({
                    key: 'historyFeed',
                    data: {
                        feed: this.feed,
                    },
                    meta: {
                        id,
                    },
                    overwrite: true,
                });
            };
            this.jira = jira;
            this.github = github;
            this.storage = storage;
            this.feedInstance = [];
            this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME$1 + 10);
        }
        get feed() {
            return this.feedInstance;
        }
        get pullRequestHistory() {
            if (!this.pullRequestHistoryInstance) {
                this.pullRequestHistoryInstance = new PullRequestHistory(this.github, this.storage);
            }
            return this.pullRequestHistoryInstance;
        }
        get tagsHistory() {
            if (!this.tagsHistoryInstance) {
                this.tagsHistoryInstance = new TagHistory(this.github, this.storage);
            }
            return this.tagsHistoryInstance;
        }
        get issuesHistory() {
            if (!this.issuesHistoryInstance) {
                this.issuesHistoryInstance = new IssueHistory(this.jira, this.storage);
            }
            return this.issuesHistoryInstance;
        }
    }

    class History {
        constructor(storage, github, jira) {
            this.listener = (feed) => {
            };
            this.fetch = async (message) => {
                switch (message.type) {
                    case 'history/FEED_FETCH': {
                        this.feed.fetch(message);
                        break;
                    }
                }
            };
            this.write = async (message) => {
                switch (message.type) {
                    case 'history/DISMISS_FEED_ITEM': {
                        this.feed.write(message);
                        break;
                    }
                }
            };
            this.storage = storage;
            this.jira = jira;
            this.github = github;
            this.feed = new Feed(storage, github, jira);
            this.storage.listen('historyFeed', this.listener);
        }
    }

    class HoneybadgerAuth extends ServiceAuth {
        constructor(storage) {
            super(storage, 'honeybadgerAuth');
            this.destroy = () => {
                this.tokenInstance = undefined;
            };
            this.register = async (token) => {
                this.tokenInstance = token;
            };
            this.fetch = async () => {
                const id = v4();
                this.stateFetch(id);
            };
            this.stateFetch = (id) => {
                this.send(id);
            };
            this.localFetch = async (id) => {
                const auth = await this.storage.readProperty('honeybadgerAuth');
                if (this.tokenInstance !== auth?.key) {
                    this.tokenInstance = auth?.key;
                    this.send(id);
                    this.save(id);
                }
            };
            this.save = (id) => {
                if (this.token) {
                    this.storage.setProperty({
                        key: 'honeybadgerAuth',
                        data: {
                            key: this.token,
                        },
                        meta: {
                            id,
                        },
                    });
                }
            };
            this.send = (id) => {
                const isAuth = !!this.token;
                chrome$1.runtime.respond({
                    type: 'jira/IS_AUTHENTICATED',
                    isAuthenticated: isAuth,
                    meta: {
                        done: true,
                        id,
                    },
                });
            };
            this.tokenInstance = 'c205eHhWSEVvd1RxNU5XMXJQWkg6';
        }
        get token() {
            if (this.tokenInstance) {
                return this.tokenInstance;
            }
            return null;
        }
    }

    class Honeybadger {
        constructor(Storage) {
            this.fetch = async (message) => {
                if (message.type === 'honeybadger/AUTHENTICATE_REQUEST') {
                    this.auth.register(message.token);
                    return;
                }
                if (!this.auth.token) {
                    await this.start();
                    if (!this.auth.token) {
                        return;
                    }
                }
                switch (message.type) {
                    case 'honeybadger/RECENT_NEW_NOTICES_FETCH': {
                        const projects = await this.storage.readProperty('honeybadgerProjects');
                        const settings = await this.storage.readProperty('honeybadgerSettings');
                        const watched = projects ?
                            projects
                                .filter((project) => project.isWatched)
                                .map((project) => project.id) :
                            [];
                        const monitors = settings ? settings.monitors : [];
                        if (watched.length === 0 && monitors.length === 0) {
                            return;
                        }
                        await this.api.fetchFaults(watched, monitors);
                        break;
                    }
                    case 'honeybadger/PROJECTS_FETCH': {
                        const projects = await this.storage.readProperty('honeybadgerProjects');
                        const data = projects ? projects.filter((project, index, self) => self.findIndex((me) => me.id === project.id) === index) : [];
                        chrome$1.runtime.respond({
                            type: 'honeybadger/PROJECTS_RESPONSE',
                            data,
                            meta: {
                                id: message.meta.id,
                                done: true,
                            },
                        });
                        break;
                    }
                }
            };
            this.set = async (message) => {
                switch (message.type) {
                    case 'honeybadger/PROJECTS_SET': {
                        this.storage.writeProperty('honeybadgerProjects', message.data);
                        break;
                    }
                }
            };
            this.logout = async () => {
                this.destroy();
            };
            this.destroy = async () => {
            };
            this.start = async () => {
                this.storage.readProperty('honeybadgerSettings');
                this.storage.readProperty('honeybadgerProjects');
                await this.auth.fetch();
                if (!this.auth.token) {
                    return;
                }
            };
            this.storage = Storage;
            this.authInstance = new HoneybadgerAuth(this.storage);
            this.start();
        }
        get token() {
            if (!this.auth.token) {
                throw new Error('No Token in Honeybadger - Don\'t forget to call start');
            }
            return this.auth.token;
        }
        get api() {
            if (!this.apiInstance) {
                this.apiInstance = new HoneybadgerAPI(this.token);
            }
            return this.apiInstance;
        }
        get auth() {
            if (!this.authInstance) {
                this.authInstance = new HoneybadgerAuth(this.storage);
            }
            return this.authInstance;
        }
    }

    const check = async (token) => {
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        const requestOptions = {
            headers,
            method: 'GET',
        };
        const url = `https://api.atlassian.com/oauth/token/accessible-resources`;
        try {
            const response = await fetch(url, requestOptions);
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    };

    const { encode, decode } = url;
    const fetchToken = async (code, redirect) => {
        const requestOptions = {
            method: 'GET',
        };
        const url = `${SERVICE_ENDPOINT}jira-oauth?code=${encode(code)}&redirect=${encode(redirect)}`;
        const response = await fetch(url, requestOptions);
        const text = await response.text();
        const data = JSON.parse(text);
        return data;
    };
    const getParams = (url) => {
        const urlParts = url.split('?');
        const [redirect, query] = urlParts;
        const params = {};
        if (!query) {
            return null;
        }
        const hash = query.split('&');
        for (let i = 0; i < hash.length; i += 1) {
            const value = hash[i].split('=');
            params[value[0]] = value[1];
        }
        return {
            redirect,
            params,
        };
    };
    const getError = (message) => {
        switch (message) {
            case 'Authorization page could not be loaded.': return 'It looks like our servers are down, try again later, try again later.';
            case 'bad-response': return 'It looks like Atlassian sent a bad response, try again.';
            case 'bad-state': return 'It looks like something fishy is going on with the response, try again..';
            case 'User did not authorize the request': return 'It looks like you didn\'t authorize our app, try again.';
            default: return 'It looks like an error happened, try again.';
        }
    };
    const parseCallbackError = (params) => {
        const message = decode(params.error_description);
        return getError(message);
    };
    const display = async (url, state) => {
        const { lastError } = chrome$1.runtime;
        if (lastError && Object.keys(lastError)) {
            return getError(lastError.message);
        }
        const result = getParams(url);
        if (!result) {
            return getError('bad-response');
        }
        const { params, redirect } = result;
        if (params?.state !== state) {
            return getError('bad-state');
        }
        if (params.error) {
            return parseCallbackError(params);
        }
        const authResponse = await fetchToken(params.code, redirect);
        return authResponse;
    };
    const OAuth = async () => new Promise((resolve, reject) => {
        const redirectUri = chrome$1.identity.getRedirectURL('provider_cb');
        const state = v4();
        const scope = [
            'offline_access',
            'read:jira-user',
            'read:jira-work',
        ].join(' ');
        const audience = 'api.atlassian.com';
        const respoonseType = 'code';
        const prompt = 'consent';
        const query = `audience=${audience}&client_id=${JIRA_CLIENT_ID}&scope=${encode(scope)}&redirect_uri=${encode(redirectUri)}&state=${state}&response_type=${respoonseType}&prompt=${prompt}`;
        const url = `https://auth.atlassian.com/authorize?${query}`;
        const options = {
            interactive: true,
            url,
        };
        chrome$1.identity.launchWebAuthFlow(options, async (redirectUri) => {
            const settings = await display(redirectUri, state);
            if (!settings) {
                reject(settings);
                return;
            }
            resolve(settings);
        });
    });

    const refresh = async (refreshToken) => {
        const requestOptions = {
            method: 'GET',
        };
        const url = `${SERVICE_ENDPOINT}jira-refresh?refresh=${refreshToken}`;
        const response = await fetch(url, requestOptions);
        const text = await response.text();
        const data = JSON.parse(text);
        return data;
    };

    class Auth {
        constructor(storage) {
            this.watchAuth = (value) => {
                if (!value) {
                    this.destroy();
                }
            };
            this.destroy = () => {
                this.authInstance = undefined;
                this.cloudIdInstance = undefined;
            };
            this.register = async (message) => {
                chrome$1.runtime.respond({
                    type: 'error/SERVICE_ERROR',
                    message: 'Personal Access Tokens for Jira are not supported at this time.',
                    unit: 'jira',
                    meta: {
                        id: message.meta.id,
                        done: true,
                    },
                });
            };
            this.fetch = async () => {
                this.stateFetch();
                await this.localFetch();
            };
            this.check = async () => {
                if (this.api) {
                    const success = await check(this.api.token);
                    if (!success && this.refreshToken) {
                        this.refresh();
                    }
                }
                const isAuth = !!this.token && !!this.cloudId;
                if (!isAuth) {
                    await this.fetch();
                }
                this.send();
            };
            this.refresh = async () => {
                if (!this.refreshToken) {
                    await this.localFetch();
                }
                if (!this.refreshToken) {
                    return;
                }
                const nextToken = await refresh(this.refreshToken);
                const id = v4();
                this.receive(nextToken);
                this.save(id);
            };
            this.save = (id) => {
                if (this.cloudIdInstance && this.authInstance) {
                    this.storage.setProperty({
                        key: 'jiraAuth',
                        data: {
                            OAuth: this.authInstance,
                            cloudId: this.cloudIdInstance,
                        },
                        meta: {
                            id,
                        },
                    });
                }
            };
            this.oAuth = async (message) => {
                const { meta: { id } } = message;
                const response = await OAuth();
                if (typeof response === 'string') {
                    chrome$1.runtime.respond({
                        type: 'error/SERVICE_ERROR',
                        message: response,
                        unit: 'jira',
                        meta: {
                            id,
                            done: true,
                        },
                    });
                    return;
                }
                this.receive(response.auth, response.cloudId);
                this.save(id);
            };
            this.receive = (auth, cloudIdParam) => {
                const refreshToken = this.refreshToken || 'NO_REFRESH_TOKEN';
                this.authInstance = {
                    refreshToken,
                    ...auth,
                };
                if (cloudIdParam) {
                    this.cloudIdInstance = cloudIdParam;
                }
                this.send();
            };
            this.send = () => {
                const isAuth = !!this.token && !!this.cloudId;
                chrome$1.runtime.respond({
                    type: 'jira/IS_AUTHENTICATED',
                    isAuthenticated: isAuth,
                    meta: {
                        done: true,
                        id: v4(),
                    },
                });
            };
            this.stateFetch = () => {
                this.send();
            };
            this.localFetch = async () => {
                const auth = await this.storage.readProperty('jiraAuth');
                if (auth?.OAuth) {
                    this.receive(auth.OAuth, auth.cloudId);
                    this.check();
                }
            };
            this.storage = storage;
            this.storage.listen('jiraAuth', this.watchAuth);
        }
        get token() {
            if (this.authInstance) {
                return this.authInstance.accessToken;
            }
            return null;
        }
        get refreshToken() {
            if (this.authInstance) {
                return this.authInstance.refreshToken;
            }
            return;
        }
        get cloudId() {
            if (this.cloudIdInstance) {
                return this.cloudIdInstance.id;
            }
            return;
        }
        get appUrl() {
            if (this.cloudIdInstance) {
                return this.cloudIdInstance.url;
            }
            return;
        }
        get api() {
            if (!this.token || !this.cloudId || !this.appUrl) {
                return null;
            }
            return {
                cloudId: this.cloudId,
                token: this.token,
                appUrl: this.appUrl,
            };
        }
    }

    var eventemitter3 = createCommonjsModule(function (module) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @private
     */
    function Events() {}

    //
    // We try to not inherit from `Object.prototype`. In some engines creating an
    // instance in this way is faster than calling `Object.create(null)` directly.
    // If `Object.create(null)` is not supported we prefix the event names with a
    // character to make sure that the built-in object properties are not
    // overridden or used as an attack vector.
    //
    if (Object.create) {
      Events.prototype = Object.create(null);

      //
      // This hack is needed because the `__proto__` property is still inherited in
      // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
      //
      if (!new Events().__proto__) prefix = false;
    }

    /**
     * Representation of a single event listener.
     *
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Add a listener for a given event.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} once Specify if the listener is a one-time listener.
     * @returns {EventEmitter}
     * @private
     */
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
      }

      var listener = new EE(fn, context || emitter, once)
        , evt = prefix ? prefix + event : event;

      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];

      return emitter;
    }

    /**
     * Clear event by name.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} evt The Event name.
     * @private
     */
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @public
     */
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @public
     */
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = []
        , events
        , name;

      if (this._eventsCount === 0) return names;

      for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }

      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }

      return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Array} The registered listeners.
     * @public
     */
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event
        , handlers = this._events[evt];

      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];

      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }

      return ee;
    };

    /**
     * Return the number of listeners listening to a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Number} The number of listeners.
     * @public
     */
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event
        , listeners = this._events[evt];

      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
     */
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return false;

      var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
          case 1: return listeners.fn.call(listeners.context), true;
          case 2: return listeners.fn.call(listeners.context, a1), true;
          case 3: return listeners.fn.call(listeners.context, a1, a2), true;
          case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length
          , j;

        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

          switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
              if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }

      return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {*} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
          listeners.fn === fn &&
          (!once || listeners.once) &&
          (!context || listeners.context === context)
        ) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
            listeners[i].fn !== fn ||
            (once && !listeners[i].once) ||
            (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }

      return this;
    };

    //
    // Alias methods names because people roll like that.
    //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    //
    // Expose the prefix.
    //
    EventEmitter.prefixed = prefix;

    //
    // Allow `EventEmitter` to be imported as module namespace.
    //
    EventEmitter.EventEmitter = EventEmitter;

    //
    // Expose the module.
    //
    {
      module.exports = EventEmitter;
    }
    });

    const LOCAL_INCREMENT_TIME = 30;
    const REMOTE_INCREMENT_TIME = 120;
    class Issues {
        constructor(api, reactor, storage) {
            this.issuesInstance = [];
            this.isRunning = false;
            this.busIt = () => {
                this.waiter.emit('unlocked');
                this.hasWatched = true;
            };
            this.watchSettings = async () => {
                this.issuesInstance = [];
                this.fetchIssues('storage-change: jiraSettings');
            };
            this.destroy = async () => {
                this.issuesInstance = [];
                await this.storage.removeProperty('jiraIssues');
                this.send('destory', true);
            };
            this.fetch = async (message) => {
                const { id } = message.meta;
                this.fetchIssues(id);
            };
            this.fetchIssues = async (id) => {
                this.stateFetch(id);
                await this.localFetch(id);
                await this.remoteFetch(id);
            };
            this.send = (id, done) => {
                chrome$1.runtime.respond({
                    type: 'jira/ISSUES_RESPONSE',
                    data: this.issues,
                    meta: {
                        done,
                        id,
                    },
                });
            };
            this.stateFetch = (id) => {
                if (this.issues.length > 0) {
                    this.send(id, false);
                }
            };
            this.localFetch = async (id) => {
                this.lastLocal = new Date().getTime();
                const jiraSettings = await this.storage.readProperty('jiraIssues');
                if (jiraSettings?.issues && jiraSettings?.issues.length > 0) {
                    const { issues } = jiraSettings;
                    this.issuesInstance = issues;
                    this.send(id, false);
                }
            };
            this.store = (id) => {
                this.storage.setProperty({
                    key: 'jiraIssues',
                    data: {
                        issues: this.issues,
                    },
                    overwrite: true,
                    meta: {
                        id,
                    },
                });
            };
            this.remoteFetch = async (id) => {
                if (this.isRunning) {
                    this.send(id, true);
                    return;
                }
                this.isRunning = true;
                const projects = await this.storage.readProperty('jiraProjects');
                if (!projects) {
                    this.send(id, true);
                    return;
                }
                const { watched } = projects;
                this.watched = watched;
                const data = await this.api.fetchIssues(watched);
                const issues = await this.cleanResponse(data);
                this.issuesInstance = issues;
                this.send(id, true);
                this.store(id);
                this.lastRemote = secondsAgo(0);
                this.isRunning = false;
            };
            this.cleanResponse = async (response) => {
                const settings = await this.storage.readProperty('jiraSettings');
                const sprintId = settings ? settings.sprintFieldId : null;
                return response.map((issue) => ({
                    projectId: issue.fields.project.id,
                    createdAt: issue.fields.created,
                    id: issue.id,
                    projectKey: issue.fields.project.key,
                    key: issue.key,
                    appUrl: this.api.appUrl,
                    assignee: issue.fields.assignee?.displayName || 'UNASSIGNED',
                    summary: issue.fields.summary,
                    status: {
                        id: issue.fields.status.id,
                        name: issue.fields.status.name,
                    },
                    sprints: sprintId && issue.fields[sprintId] ? issue.fields[sprintId] : [],
                }));
            };
            this.reactor = reactor;
            this.api = api;
            this.storage = storage;
            this.hideStatuses = {
                done: true,
                unprioritized: true,
            };
            this.watched = {};
            this.hasWatched = false;
            this.waiter = new eventemitter3();
            this.lastLocal = secondsAgo(LOCAL_INCREMENT_TIME + 10);
            this.lastRemote = secondsAgo(REMOTE_INCREMENT_TIME + 10);
            this.storage.listen('jiraProjects', this.watchSettings);
            this.storage.listen('jiraSettings', this.watchSettings);
            this.reactor.addEventListener('watched-updated', this.busIt);
        }
        get issues() {
            return this.issuesInstance.filter((issue) => {
                const filters = this.watched[issue.projectId]?.filters;
                if (!filters) {
                    return true;
                }
                const { onlyAssigned, onlyActive } = filters;
                if (onlyActive && !issue.sprints.some((sprint) => sprint.state === 'active')) {
                    return false;
                }
                if (onlyAssigned && (!issue.assignee || issue.assignee === 'UNASSIGNED')) {
                    return false;
                }
                return true;
            });
        }
    }

    const LOCAL_TIME = 3600;
    const REMOTE_TIME = LOCAL_TIME * 5;
    const delayTimes = {
        LOCAL_TIME,
        REMOTE_TIME,
    };
    class Projects extends Service {
        constructor(api, reactor, storage) {
            super(api, storage, delayTimes);
            this.fetchWatched = async () => {
                const local = await this.storage.readProperty('jiraProjects');
                if (local) {
                    this.watchedInstance = local.watched;
                    this.projectsInstance = local.projects;
                }
                this.reactor.dispatchEvent('watched-updated', []);
            };
            this.write = async (message) => {
                const { projectId, id, idIsStatus, nextInclude, meta } = message;
                const current = this.watched[projectId];
                if (!current) {
                    this.watched[projectId] = {
                        filters: {},
                        statuses: [],
                    };
                }
                if (!idIsStatus) {
                    this.watched[projectId].filters[id] = nextInclude;
                    this.save(meta.id);
                    this.send(meta.id, true);
                    return;
                }
                const notPresent = current.statuses.findIndex((status) => status === id) < 0;
                if (nextInclude && notPresent) {
                    this.watched[projectId].statuses.push(id);
                    this.save(meta.id);
                    this.send(meta.id, true);
                    return;
                }
                if (!nextInclude) {
                    const { statuses, filters } = this.watched[projectId];
                    this.watched[projectId] = {
                        filters,
                        statuses: statuses.filter((status) => status !== id),
                    };
                }
                this.save(meta.id);
                this.send(meta.id, true);
            };
            this.fetchAll = async (message) => {
                const { id } = message.meta;
                const needsLocal = secondsAgo(LOCAL_TIME) > this.lastLocal;
                const needsRemote = secondsAgo(REMOTE_TIME) > this.lastRemote;
                this.stateFetch(id, !needsLocal && !needsLocal);
                if (needsLocal || this.isNewTab) {
                    await this.localFetch(id, !needsRemote);
                }
                if (needsRemote) {
                    this.remoteFetch(id, true);
                }
            };
            this.send = (id, done) => {
                runtime$1.respond({
                    type: 'jira/PROJECTS_RESPONSE',
                    data: this.projectsResponseData,
                    meta: {
                        done,
                        id,
                    },
                });
            };
            this.save = (id) => {
                this.storage.setProperty({
                    key: 'jiraProjects',
                    data: {
                        projects: this.projects,
                        watched: this.watched,
                    },
                    meta: {
                        id,
                    },
                });
            };
            this.fetchStatuses = async (message) => {
                const { meta: { id }, projectKey } = message;
                const response = await this.api.fetchStatuses(projectKey);
                const project = this.projectsInstance.find((p) => p.id === projectKey);
                if (project) {
                    const statuses = response.reduce((acc, cur) => {
                        const children = cur.statuses.reduce((childrenAcc, childrenCur) => {
                            const next = {
                                ...childrenCur,
                                issueType: cur.name,
                            };
                            childrenAcc.push(next);
                            return childrenAcc;
                        }, []);
                        acc.push(...children);
                        return acc;
                    }, []);
                    statuses.sort((a, b) => {
                        const aName = a.name.toUpperCase();
                        const bName = b.name.toUpperCase();
                        if (aName > bName) {
                            return 1;
                        }
                        if (aName < bName) {
                            return -1;
                        }
                        return 0;
                    });
                    project.statuses = statuses;
                    this.send(id, true);
                }
            };
            this.stateFetch = async (id, done) => {
                if (this.projects.length > 0) {
                    this.send(id, done);
                }
            };
            this.localFetch = async (id, done) => {
                this.lastLocal = new Date().getTime();
                const local = await this.storage.readProperty('jiraProjects');
                if (local?.projects) {
                    const { projects } = local;
                    if (projects.length > 0) {
                        this.projectsInstance = projects;
                        this.send(id, done);
                    }
                }
            };
            this.remoteFetch = async (id, done) => {
                if (this.isRunning) {
                    this.send(id, done);
                    return;
                }
                const nextProjects = await this.api.fetchProjects();
                this.isRunning = true;
                this.projectsInstance = Projects.cleanResponse(nextProjects);
                this.send(id, done);
                this.save(id);
                this.isRunning = false;
            };
            this.reactor = reactor;
            this.projectsInstance = [];
            this.watchedInstance = {};
            this.fetchWatched();
        }
        get projects() {
            return this.projectsInstance
                .sort((a, b) => {
                const aName = a.name.toUpperCase();
                const bName = b.name.toUpperCase();
                if (aName > bName) {
                    return 1;
                }
                if (aName < bName) {
                    return -1;
                }
                return 0;
            })
                .filter((value, index, self) => from.findIndex(self, (item) => item.id === value.id, index + 1) < 0);
        }
        get watched() {
            return this.watchedInstance;
        }
        get projectsResponseData() {
            return {
                projects: this.projects,
                watched: this.watched,
            };
        }
    }
    Projects.cleanResponse = (projects) => projects.map((project) => ({
        id: project.id,
        key: project.key,
        name: project.name,
        avatarUrl: project.avatarUrls['48x48'],
        expand: project.expand,
        statuses: [],
    }));

    class Jira {
        constructor(Storage) {
            this.fetch = async (message) => {
                if (message.type === 'jira/AUTHENTICATE_REQUEST') {
                    this.authenticate(message);
                    return;
                }
                if (message.type === 'jira/AUTHENTICATE_CHECK') {
                    this.auth.check();
                    return;
                }
                if (!this.auth.api) {
                    await this.start();
                    if (!this.auth.api) {
                        return;
                    }
                }
                this.auth.check();
                switch (message.type) {
                    case 'jira/ISSUES_FETCH': {
                        this.issues.fetch(message);
                        break;
                    }
                    case 'jira/PROJECTS_FETCH': {
                        this.projects.fetchAll(message);
                        break;
                    }
                    case 'jira/STATUSES_FETCH': {
                        this.projects.fetchStatuses(message);
                        break;
                    }
                }
            };
            this.setup = async () => {
                const settings = await chrome$1.storage.getData('jiraSettings');
                if (!settings?.sprintFieldId) {
                    const customFields = await this.api.fetchCustomFields();
                    const sprintField = customFields.find((field) => field.name === 'Sprint');
                    if (sprintField) {
                        this.storage.setProperty({
                            key: 'jiraSettings',
                            data: {
                                sprintFieldId: sprintField.id,
                            },
                            meta: {
                                id: v4(),
                            },
                        });
                    }
                }
            };
            this.write = async (message) => {
                switch (message.type) {
                    case 'jira/PROJECTS_UPDATE_WATCHED': {
                        this.projects.write(message);
                        break;
                    }
                }
            };
            this.logout = async () => {
                this.destroy();
            };
            this.destroy = async () => {
                chrome$1.runtime.respond({
                    type: 'jira/IS_AUTHENTICATED',
                    isAuthenticated: false,
                    meta: {
                        id: 'logout',
                        done: true,
                    },
                });
                this.isAuth = false;
                this.issues.destroy();
                this.api.destroy();
                this.auth.destroy();
                await this.storage.removeProperty('jiraAuth');
            };
            this.watchAuth = (auth) => {
                if (!auth && this.isAuth) {
                    this.destroy();
                    return;
                }
            };
            this.start = async () => {
                await this.auth.fetch();
                if (!this.auth.api) {
                    this.isAuth = false;
                    return;
                }
                this.setup();
                this.projectsInstance = new Projects(this.api, this.reactor, this.storage);
                this.issuesInstance = new Issues(this.api, this.reactor, this.storage);
            };
            this.authenticate = async (message) => {
                if (!message.token) {
                    await this.auth.oAuth(message);
                    return;
                }
                this.pendingFetches.forEach((message) => {
                    this.fetch(message);
                });
            };
            this.storage = Storage;
            this.isAuth = false;
            this.reactor = new Reactor();
            this.authInstance = new Auth(this.storage);
            this.pendingFetches = new Set();
            this.storage.listen('jiraAuth', this.watchAuth);
        }
        get api() {
            if (!this.apiInstance) {
                this.apiInstance = new APIApp(this.auth);
            }
            return this.apiInstance;
        }
        get issues() {
            if (!this.issuesInstance) {
                this.issuesInstance = new Issues(this.api, this.reactor, this.storage);
            }
            return this.issuesInstance;
        }
        get projects() {
            if (!this.projectsInstance) {
                this.projectsInstance = new Projects(this.api, this.reactor, this.storage);
            }
            return this.projectsInstance;
        }
        get auth() {
            if (!this.authInstance) {
                this.authInstance = new Auth(this.storage);
            }
            return this.authInstance;
        }
    }

    var gmail = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%2252%2042%2088%2066%22%3E%3Cpath%20fill%3D%22%234285f4%22%20d%3D%22M58%20108h14V74L52%2059v43c0%203.32%202.69%206%206%206%22%2F%3E%3Cpath%20fill%3D%22%2334a853%22%20d%3D%22M120%20108h14c3.32%200%206-2.69%206-6V59l-20%2015%22%2F%3E%3Cpath%20fill%3D%22%23fbbc04%22%20d%3D%22M120%2048v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2%22%2F%3E%3Cpath%20fill%3D%22%23ea4335%22%20d%3D%22M72%2074V48l24%2018%2024-18v26L96%2092%22%2F%3E%3Cpath%20fill%3D%22%23c5221f%22%20d%3D%22M52%2051v8l20%2015V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4%207.2%22%2F%3E%3C%2Fsvg%3E";

    var googleCalendar = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%22186%2038%2076%2076%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M244%2056h-40v40h40V56z%22%2F%3E%3Cpath%20fill%3D%22%23EA4335%22%20d%3D%22M244%20114l18-18h-18v18z%22%2F%3E%3Cpath%20fill%3D%22%23FBBC04%22%20d%3D%22M262%2056h-18v40h18V56z%22%2F%3E%3Cpath%20fill%3D%22%2334A853%22%20d%3D%22M244%2096h-40v18h40V96z%22%2F%3E%3Cpath%20fill%3D%22%23188038%22%20d%3D%22M186%2096v12c0%203.315%202.685%206%206%206h12V96h-18z%22%2F%3E%3Cpath%20fill%3D%22%231967D2%22%20d%3D%22M262%2056V44c0-3.315-2.685-6-6-6h-12v18h18z%22%2F%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M244%2038h-52c-3.315%200%20-6%202.685-6%206v52h18V56h40V38z%22%2F%3E%3Cpath%20fill%3D%22%234285F4%22%20d%3D%22M212.205%2087.03c-1.495-1.01-2.53-2.485-3.095-4.435l3.47-1.43c.315%201.2.865%202.13%201.65%202.79.78.66%201.73.985%202.84.985%201.135%200%202.11-.345%202.925-1.035s1.225-1.57%201.225-2.635c0-1.09-.43-1.98-1.29-2.67-.86-.69-1.94-1.035-3.23-1.035h-2.005V74.13h1.8c1.11%200%202.045-.3%202.805-.9.76-.6%201.14-1.42%201.14-2.465%200%20-.93-.34-1.67-1.02-2.225-.68-.555-1.54-.835-2.585-.835-1.02%200%20-1.83.27-2.43.815a4.784%204.784%200%200%200%20-1.31%202.005l-3.435-1.43c.455-1.29%201.29-2.43%202.515-3.415%201.225-.985%202.79-1.48%204.69-1.48%201.405%200%202.67.27%203.79.815%201.12.545%202%201.3%202.635%202.26.635.965.95%202.045.95%203.245%200%201.225-.295%202.26-.885%203.11-.59.85-1.315%201.5-2.175%201.955v.205a6.605%206.605%200%200%201%202.79%202.175c.725.975%201.09%202.14%201.09%203.5%200%201.36-.345%202.575-1.035%203.64s-1.645%201.905-2.855%202.515c-1.215.61-2.58.92-4.095.92-1.755.005-3.375-.5-4.87-1.51zM233.52%2069.81l-3.81%202.755-1.905-2.89%206.835-4.93h2.62V88h-3.74V69.81z%22%2F%3E%3C%2Fsvg%3E";

    var googleMeet = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2087.5%2072%22%3E%20%3Cpath%20fill%3D%22%2300832d%22%20d%3D%22M49.5%2036l8.53%209.75%2011.47%207.33%202-17.02-2-16.64-11.69%206.44z%22%2F%3E%20%3Cpath%20fill%3D%22%230066da%22%20d%3D%22M0%2051.5V66c0%203.315%202.685%206%206%206h14.5l3-10.96-3-9.54-9.95-3z%22%2F%3E%20%3Cpath%20fill%3D%22%23e94235%22%20d%3D%22M20.5%200L0%2020.5l10.55%203%209.95-3%202.95-9.41z%22%2F%3E%20%3Cpath%20fill%3D%22%232684fc%22%20d%3D%22M20.5%2020.5H0v31h20.5z%22%2F%3E%20%3Cpath%20fill%3D%22%2300ac47%22%20d%3D%22M82.6%208.68L69.5%2019.42v33.66l13.16%2010.79c1.97%201.54%204.85.135%204.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5%2036v15.5h-29V72h43c3.315%200%206-2.685%206-6V53.08z%22%2F%3E%20%3Cpath%20fill%3D%22%23ffba00%22%20d%3D%22M63.5%200h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z%22%2F%3E%3C%2Fsvg%3E";

    var honeyBadger = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%20%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%20%5B%20%3C!ENTITY%20st0%20%22fill%3A%23EA5A37%3B%22%3E%20%5D%3E%20%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20128%20128%22%20style%3D%22enable-background%3Anew%200%200%20128%20128%3B%22%20xml%3Aspace%3D%22preserve%22%3E%20%3Cg%20id%3D%22Layer_1%22%3E%20%3C%2Fg%3E%20%3Cg%20id%3D%22Layer_2%22%3E%20%3Cg%3E%20%3Cg%3E%20%3Cg%3E%20%3Cpath%20style%3D%22%26st0%3B%22%20d%3D%22M40.5%2C91L21.3%2C71.8c-2.4-2.5-2.4-6.5%2C0-8.9L60%2C24.2c2.5-2.5%2C6.5-2.5%2C8.9%2C0l2.6%2C2.6l5.7-6l-5.6-5.6%20c-3.9-3.9-10.3-3.9-14.3%2C0l-45%2C45c-3.9%2C3.9-3.9%2C10.3%2C0%2C14.3L37.7%2C100L40.5%2C91z%22%2F%3E%20%3Cpath%20style%3D%22%26st0%3B%22%20d%3D%22M116.6%2C60.3L90.5%2C34.1l-3.1%2C8.6l20.2%2C20.2c2.5%2C2.5%2C2.5%2C6.5%2C0%2C8.9l-38.7%2C38.7c-2.5%2C2.5-6.5%2C2.5-8.9%2C0%20l-4.3-4.3l-5.7%2C6l7.3%2C7.3c3.9%2C3.9%2C10.3%2C3.9%2C14.3%2C0l45-45C120.6%2C70.6%2C120.6%2C64.2%2C116.6%2C60.3z%22%2F%3E%20%3C%2Fg%3E%20%3Cpath%20style%3D%22%26st0%3B%22%20d%3D%22M100%2C0L77.9%2C61.6c-0.3%2C0.8-0.2%2C1.7%2C0.4%2C2.4c0.5%2C0.6%2C1.2%2C1%2C2%2C1c0.1%2C0%2C0.1%2C0%2C0.2%2C0L92%2C64l-60.2%2C64l17-55.2%20c0.2-0.8%2C0.1-1.7-0.4-2.3c-0.5-0.6-1.2-0.9-2-0.9c-0.1%2C0-0.1%2C0-0.2%2C0l-12.1%2C1L100%2C0%22%2F%3E%20%3C%2Fg%3E%20%3C%2Fg%3E%20%3C%2Fg%3E%20%3C%2Fsvg%3E";

    var jenkins = "ffa863534b26f298.svg";

    var newRelic = "data:image/svg+xml,%3Csvg%20id%3D%22Layer_1%22%20data-name%3D%22Layer%201%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20108%2087.47%22%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill%3A%23008996%3B%7D.cls-2%7Bfill%3A%231dcad3%3B%7D.cls-3%7Bfill%3A%23212021%3B%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Ctitle%3ENR_logo_Horizontal%3C%2Ftitle%3E%3Cg%20id%3D%22NR_Vertical_PMS%22%20data-name%3D%22NR%20Vertical%20PMS%22%3E%3Cpath%20class%3D%22cls-1%22%20d%3D%22M106.64%2C32.29C101.63%2C9.25%2C74-4.3%2C44.93%2C2S-3.65%2C32.14%2C1.36%2C55.18%2C34%2C91.77%2C63.07%2C85.45s48.58-30.12%2C43.57-53.16M52.05%2C72.5A29.38%2C29.38%2C0%2C1%2C1%2C81.42%2C43.12%2C29.38%2C29.38%2C0%2C0%2C1%2C52.05%2C72.5%22%2F%3E%3Cpath%20class%3D%22cls-2%22%20d%3D%22M59.37%2C6.72A37.6%2C37.6%2C0%2C1%2C0%2C97%2C44.31%2C37.59%2C37.59%2C0%2C0%2C0%2C59.37%2C6.72M52.05%2C72A28.9%2C28.9%2C0%2C1%2C1%2C81%2C43.12%2C28.9%2C28.9%2C0%2C0%2C1%2C52.05%2C72%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M41.71%2C40.24%2C38.54%2C33.6a43%2C43%2C0%2C0%2C1-1.8-4.19l-.06.06c.1%2C1.18.12%2C2.68.14%2C3.92l.08%2C6.85H34.59V26.1h2.66L40.68%2C33a24.83%2C24.83%2C0%2C0%2C1%2C1.45%2C3.64l.07-.06c-.07-.72-.21-2.74-.21-4l0-6.45h2.23V40.24Z%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M48.39%2C35.68v.16c0%2C1.43.53%2C2.95%2C2.55%2C2.95a3.81%2C3.81%2C0%2C0%2C0%2C2.58-1l.87%2C1.37a5.57%2C5.57%2C0%2C0%2C1-3.71%2C1.37c-2.93%2C0-4.77-2.1-4.77-5.41A5.64%2C5.64%2C0%2C0%2C1%2C47.2%2C31a3.94%2C3.94%2C0%2C0%2C1%2C3.17-1.39%2C4%2C4%2C0%2C0%2C1%2C2.84%2C1.07c.9.81%2C1.35%2C2.08%2C1.35%2C4.49v.47Zm2-4.33c-1.27%2C0-2%2C1-2%2C2.68h3.82c0-1.68-.74-2.68-1.86-2.68%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M66.51%2C40.28h-2.1l-1.27-4.76c-.33-1.23-.68-2.82-.68-2.82h0s-.16%2C1-.67%2C2.92L60.5%2C40.28H58.4L55.58%2C30l2.23-.31%2C1.12%2C5c.29%2C1.29.53%2C2.72.53%2C2.72h.06s.21-1.35.59-2.78l1.33-4.78h2.21l1.16%2C4.66c.43%2C1.67.66%2C2.94.66%2C2.94h.06s.25-1.57.51-2.78L67.1%2C29.9h2.33Z%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M39.93%2C58.44%2C38.7%2C56.25a15.18%2C15.18%2C0%2C0%2C0-2.41-3.49%2C1.18%2C1.18%2C0%2C0%2C0-.92-.43v6.11H33.06V44.3h4.32c3.16%2C0%2C4.59%2C1.84%2C4.59%2C4a3.61%2C3.61%2C0%2C0%2C1-3.51%2C3.89%2C10.64%2C10.64%2C0%2C0%2C1%2C2.19%2C2.82l2.08%2C3.39ZM36.66%2C46.2H35.37v4.47h1.21a3.07%2C3.07%2C0%2C0%2C0%2C2.31-.59%2C2.38%2C2.38%2C0%2C0%2C0%2C.63-1.72c0-1.43-.77-2.16-2.86-2.16%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M45.81%2C53.88V54c0%2C1.43.54%2C3%2C2.56%2C3a3.81%2C3.81%2C0%2C0%2C0%2C2.57-1l.88%2C1.36A5.58%2C5.58%2C0%2C0%2C1%2C48.1%2C58.7c-2.92%2C0-4.76-2.1-4.76-5.41a5.64%2C5.64%2C0%2C0%2C1%2C1.29-4%2C3.94%2C3.94%2C0%2C0%2C1%2C3.17-1.39%2C4%2C4%2C0%2C0%2C1%2C2.84%2C1.07c.9.81%2C1.35%2C2.08%2C1.35%2C4.49v.47Zm2-4.33c-1.27%2C0-2%2C1-2%2C2.68h3.82c0-1.68-.74-2.68-1.86-2.68%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M56.19%2C58.66c-2.26%2C0-2.26-2-2.26-2.92V46.93a16.91%2C16.91%2C0%2C0%2C0-.21-3L56%2C43.4a12.74%2C12.74%2C0%2C0%2C1%2C.18%2C2.84V55c0%2C1.38.07%2C1.61.23%2C1.85a.63.63%2C0%2C0%2C0%2C.74.17l.36%2C1.39a3.57%2C3.57%2C0%2C0%2C1-1.35.24%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M60.1%2C46.57a1.47%2C1.47%2C0%2C0%2C1-1.45-1.5%2C1.48%2C1.48%2C0%2C1%2C1%2C3%2C0%2C1.51%2C1.51%2C0%2C0%2C1-1.51%2C1.5M59%2C58.44V48.26l2.27-.41V58.44Z%22%2F%3E%3Cpath%20class%3D%22cls-3%22%20d%3D%22M67.68%2C58.7c-2.82%2C0-4.4-2-4.4-5.31%2C0-3.76%2C2.25-5.56%2C4.56-5.56A3.77%2C3.77%2C0%2C0%2C1%2C70.7%2C49l-1.12%2C1.49a2.58%2C2.58%2C0%2C0%2C0-1.74-.8%2C1.75%2C1.75%2C0%2C0%2C0-1.63%2C1%2C7%2C7%2C0%2C0%2C0-.43%2C2.88%2C4.16%2C4.16%2C0%2C0%2C0%2C.69%2C2.82%2C1.82%2C1.82%2C0%2C0%2C0%2C1.37.6%2C3%2C3%2C0%2C0%2C0%2C2.09-1L71%2C57.33a4.31%2C4.31%2C0%2C0%2C1-3.31%2C1.37%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

    var speedCurve = "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%22256px%22%20height%3D%22256px%22%20viewBox%3D%220%200%20256%20256%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20preserveAspectRatio%3D%22xMidYMid%22%3E%20%20%20%20%3Cg%3E%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M60.0411234%2C162.473435%20C71.4519225%2C162.534848%2080.9359018%2C158.141289%2089.1404523%2C150.347862%20C110.154644%2C130.387919%20131.249866%2C110.514125%20152.369824%2C90.6650663%20C174.97392%2C69.4197244%20207.873152%2C67.0485163%20232.56954%2C84.7967528%20C260.303292%2C104.728548%20264.227727%2C143.457711%20239.986815%2C167.438472%20C215.334781%2C191.826091%20189.706969%2C215.225138%20164.496251%2C239.047249%20C161.397474%2C241.976288%20158.389963%2C245.025594%20155.089037%2C247.711541%20C134.69153%2C264.309145%20103.184316%2C254.662252%2097.1360295%2C229.843892%20C94.1242541%2C217.481197%2097.8132738%2C206.821849%20107.016632%2C198.109792%20C124.671043%2C181.399599%20142.368956%2C164.734612%20160.048956%2C148.052566%20C168.113622%2C140.443377%20176.017934%2C132.649949%20184.354692%2C125.351234%20C186.714811%2C123.28453%20193.724375%2C117.659308%20200.107019%2C124.040246%20C206.487957%2C130.42289%20202.947351%2C135.750432%20199.730867%2C138.782678%20C187.007374%2C150.776897%20174.306058%2C162.792439%20161.585977%2C174.789217%20C148.866748%2C186.786847%20136.119372%2C198.755477%20123.413791%2C210.767608%20C116.192695%2C217.59464%20115.280889%2C225.248183%20120.877964%2C231.324617%20C126.608099%2C237.544347%20136.155196%2C237.590407%20142.97967%2C231.172792%20C169.698408%2C206.048221%20196.426529%2C180.93474%20222.987471%2C155.643844%20C234.36927%2C144.806229%20238.022466%2C131.54367%20232.157564%2C116.771385%20C226.244044%2C101.87798%20214.378621%2C94.33788%20198.613499%2C93.0831868%20C186.282364%2C92.1022913%20175.866961%2C96.5436152%20166.933136%2C105.028787%20C145.814031%2C125.087672%20124.623278%2C145.074056%20103.377936%2C164.99988%20C79.1694371%2C187.705477%2042.6562447%2C188.381015%2018.5637472%2C166.68105%20C-4.86685917%2C145.576445%20-6.5360873%2C110.143091%2015.9451829%2C88.0678258%20C43.2234581%2C61.2808512%2071.1977427%2C35.1932977%2099.2240573%2C9.18336287%20C109.410017%2C-0.269057206%20121.972302%2C-2.20867129%20135.060005%2C2.37253682%20C147.398817%2C6.69188849%20155.291187%2C15.4210048%20157.382626%2C28.5360031%20C159.205386%2C39.9638613%20154.972183%2C49.3975164%20146.664425%2C57.2148264%20C127.09684%2C75.6258071%20107.569345%2C94.0794353%2088.0213786%2C112.510887%20C82.5403056%2C117.679779%2077.1274687%2C122.92629%2071.5278353%2C127.963828%20C67.1069823%2C131.940293%2060.8582519%2C131.932616%2056.794786%2C128.258097%20C52.1914012%2C124.093129%2052.4686107%2C117.910929%2057.6417679%2C113.017541%20C73.7489237%2C97.7752787%2089.9072567%2C82.5858998%20106.04256%2C67.3734912%20C114.317053%2C59.5715343%20122.601781%2C51.7815187%20130.851538%2C43.9539733%20C137.631657%2C37.5201522%20138.494845%2C30.2291139%20133.214216%2C24.5527147%20C127.752761%2C18.6826953%20118.743023%2C18.7134016%20112.260584%2C24.8265125%20C86.1960602%2C49.4017812%2060.1613897%2C74.0060502%2034.1616903%2C98.6487021%20C21.6992007%2C110.462095%2018.1142412%2C124.90514%2023.9092008%2C139.215125%20C29.5855999%2C153.229988%2043.9663798%2C162.489641%2060.0411234%2C162.473435%22%20fill%3D%22%234295C2%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fpath%3E%20%20%20%20%3C%2Fg%3E%3C%2Fsvg%3E";

    const githubAuth = {};
    const githubPullRequests = {
        pullRequests: [],
    };
    const githubRepositories = {
        repositories: [],
        watchedList: [],
    };
    const githubSettings = {
        reviewsRequired: 2,
        filters: [
            'createdBy',
            'status',
            'labels',
        ],
    };
    const jiraAuth = {};
    const honeybadgerAuth = {};
    const honeybadgerSettings = {
        monitors: [],
    };
    const jiraIssues = {
        issues: [],
    };
    const jiraMeta = {
        boards: [],
        meta: [],
    };
    const jiraSettings = {
        hideStatuses: {
            done: true,
            unprioritized: false,
        },
        filters: [
            'assignee',
            'status',
            'sprints',
        ],
    };
    const linksStandard = [
        {
            id: 'google-calendar',
            title: 'Google Calendar',
            label: 'GC',
            svg: googleCalendar,
            enabled: true,
            buttonChoice: 'icon',
            path: [],
        },
        {
            label: 'GM',
            id: 'google-meet',
            svg: googleMeet,
            title: 'Google Meet',
            enabled: false,
            buttonChoice: 'icon',
            path: [],
        },
        {
            label: 'NR',
            title: 'New Relic',
            id: 'new-relic',
            svg: newRelic,
            enabled: false,
            buttonChoice: 'icon',
            path: [],
        },
        {
            label: 'SC',
            svg: speedCurve,
            id: 'speed-curve',
            title: 'Speed Curve',
            enabled: false,
            buttonChoice: 'icon',
            path: [],
        },
        {
            label: 'HB',
            svg: honeyBadger,
            id: 'honey-badger',
            title: 'HoneyBadger',
            enabled: false,
            buttonChoice: 'icon',
            path: [],
        },
        {
            id: 'gmail',
            svg: gmail,
            label: 'G',
            enabled: true,
            buttonChoice: 'icon',
            title: 'GMail',
            path: [],
        },
        {
            id: 'jenkins',
            svg: jenkins,
            label: 'J',
            title: 'Jenkins',
            enabled: true,
            buttonChoice: 'icon',
            path: [],
        },
    ];
    const linksCustom = [];
    const githubOrganizations = {
        organizations: [],
    };
    const jiraProjects = {
        projects: [],
        watched: {},
    };
    const filters = {
        rememberSelections: false,
        storedFilters: [],
    };
    const visibleUnits = [
        'github',
        'jira',
    ];
    const honeybadgerProjects = [];
    const historyFeed = {
        feed: [],
    };
    const defaultStorage = {
        linksCustom,
        historyFeed,
        honeybadgerProjects,
        honeybadgerSettings,
        visibleUnits,
        filters,
        honeybadgerAuth,
        linksOrder: [],
        githubAuth,
        linksStandard,
        githubOrganizations,
        githubPullRequests,
        githubRepositories,
        githubSettings,
        jiraAuth,
        jiraProjects,
        jiraIssues,
        jiraMeta,
        jiraSettings,
    };

    const { storage: storage$1 } = chrome$1;
    const { runtime, storage: { local, sync } } = chrome$1;
    const bus = new eventemitter3();
    class Storage {
        constructor() {
            this.start = () => {
                storage$1.onChanged.addListener(this.localListener);
                this.postStart();
            };
            this.postStart = () => {
                local.get('installEpoch', (data) => {
                    if (Object.keys(data).length > 0) {
                        this.store.installEpoch = data;
                        return;
                    }
                    const now = epoch.now();
                    this.store.installEpoch = now;
                    const store = {
                        installEpoch: now,
                    };
                    local.set(store);
                });
            };
            this.localListener = (changes) => {
                Object
                    .keys(changes)
                    .forEach((key) => {
                    if (changes[key]) {
                        const item = key;
                        const value = changes[item]?.newValue;
                        this.store[key] = value;
                        this.dispatchListeners(item, value);
                    }
                });
            };
            this.fetch = () => {
                local.get(undefined, (store) => {
                    const merge = this.prep(store, this.store);
                    this.store = merge;
                    this.started = true;
                    bus.emit('unlocked');
                });
            };
            this.prep = (data, store) => {
                for (const key in data) {
                    const current = data[key];
                    const dataMerge = Array.isArray(current.data) ? current.data : deepMerge(undefined, defaultStorage[key], current.data);
                    store[key] = {
                        data: dataMerge,
                        lastUpdate: current.lastUpdate,
                    };
                }
                return store;
            };
            this.fetchProperty = async (message) => {
                const { key, meta: { id } } = message;
                const data = await this.readProperty(key);
                if (data) {
                    runtime.respond({
                        type: 'STORAGE_ON',
                        key, data,
                        meta: {
                            done: true,
                            id,
                        },
                    });
                    runtime.respond({
                        type: 'STORAGE_ONCE',
                        key, data,
                        meta: {
                            done: true,
                            id,
                        },
                    });
                }
            };
            this.readProperty = async (key) => {
                if (!this.started) {
                    await new Promise(resolve => bus.once('unlocked', resolve));
                }
                const local = this.store[key];
                if (local && local.data) {
                    return local?.data || null;
                }
                const base = defaultStorage[key];
                if (base) {
                    return base;
                }
                return null;
            };
            this.localRemove = (key) => new Promise((resolve, reject) => {
                local.remove(key, () => {
                    if (runtime.lastError) {
                        reject(runtime.lastError);
                    }
                    resolve();
                });
            });
            this.syncRemove = (key) => new Promise((resolve, reject) => {
                sync.remove(key, () => {
                    if (runtime.lastError) {
                        reject(runtime.lastError);
                    }
                    resolve();
                });
            });
            this.removeProperty = async (key) => {
                this.store[key] = undefined;
                await this.localRemove(key);
                this.dispatchListeners(key);
            };
            this.listen = (eventName, callback) => {
                if (!this.listeners[eventName]) {
                    this.listeners[eventName] = new Set();
                }
                const listeners = this.listeners[eventName];
                listeners?.add(callback);
            };
            this.dispatchListeners = (key, value) => {
                const listeners = this.listeners[key];
                if (listeners) {
                    listeners.forEach((listener) => {
                        listener(value);
                    });
                }
            };
            this.writeProperty = (key, data) => this.setProperty({
                key,
                data,
                meta: {
                    id: v4(),
                },
            });
            this.isOnlyArray = (unknown) => Array.isArray(unknown);
            this.pushProperty = async (key, property, value) => {
                const attribute = await this.readProperty(key);
                if (attribute) {
                    const current = attribute[property];
                    if (Array.isArray(current)) {
                        current.push(value);
                        this.setProperty({
                            key,
                            data: { [property]: current },
                            meta: {
                                id: v4(),
                            },
                        });
                    }
                }
            };
            this.setProperty = (message) => new Promise(async (resolve) => {
                const { key, meta: { id } } = message;
                const data = JSON.parse(JSON.stringify(message.data));
                const dataStore = {
                    data,
                    lastUpdate: Date.now(),
                };
                this.store = {
                    ...this.store,
                    [key]: dataStore,
                };
                const store = {
                    [key]: dataStore,
                    lastUpdate: Date.now(),
                };
                local.set(store, () => {
                    resolve(dataStore.data);
                });
                this.dispatchListeners(key, data);
                runtime.respond({
                    type: 'STORAGE_ON',
                    key,
                    meta: {
                        id,
                        done: true,
                    },
                    data: dataStore.data,
                });
            });
            this.started = false;
            this.listeners = {};
            this.fetch();
            this.store = {
                installEpoch: 0,
            };
            this.reactor = new Reactor();
            this.start();
        }
    }

    const storage = new Storage();
    const github = new Github(storage);
    const jira = new Jira(storage);
    const honeybadger = new Honeybadger(storage);
    const history = new History(storage, github, jira);
    const messages = [
        'jira/AUTHENTICATE_CHECK',
        'history/DISMISS_FEED_ITEM',
        'history/FEED_FETCH',
        'jenkins/AUTHENTICATE_CHECK',
        'honeybadger/AUTHENTICATE_REQUEST',
        'honeybadger/LOGOUT',
        'honeybadger/RECENT_NEW_NOTICES_FETCH',
        'honeybadger/PROJECTS_FETCH',
        'jenkins/AUTHENTICATE_CHECK',
        'jira/BOARDS_FETCH',
        'jira/STATUSES_FETCH',
        'jira/ISSUES_FETCH',
        'jira/PROJECTS_FETCH',
        'jira/SPRINTS_FETCH',
        'jira/AUTHENTICATE_REQUEST',
        'jira/LOGOUT',
        'github/PULL_REQUESTS_FETCH',
        'github/REPOSITORIES_FETCH',
        'github/REPOSITORIES_UPDATE_WATCHED',
        'github/AUTHENTICATE_REQUEST',
        'github/AUTHENTICATE_CHECK',
        'github/LOGOUT',
        'jira/PROJECTS_UPDATE_WATCHED',
        'STORAGE_GET',
        'STORAGE_SET',
    ];
    chrome$1.runtime.listen(messages, (message) => {
        const now = format(new Date(), "HH:mm:ss.SSS");
        console.log(`~ Receive Message`, message, now);
        switch (message.type) {
            case 'history/FEED_FETCH': {
                history.fetch(message);
                break;
            }
            case 'history/DISMISS_FEED_ITEM': {
                history.write(message);
                break;
            }
            case 'STORAGE_GET': {
                storage.fetchProperty(message);
                break;
            }
            case 'STORAGE_SET': {
                storage.setProperty(message);
                break;
            }
            case 'github/LOGOUT':
            case 'github/AUTHENTICATE_CHECK':
            case 'github/AUTHENTICATE_REQUEST':
            case 'github/PULL_REQUESTS_FETCH':
            case 'github/REPOSITORIES_FETCH': {
                github.fetch(message);
                break;
            }
            case 'github/REPOSITORIES_UPDATE_WATCHED': {
                github.write(message);
                break;
            }
            case 'honeybadger/PROJECTS_FETCH':
            case 'honeybadger/AUTHENTICATE_REQUEST':
            case 'honeybadger/RECENT_NEW_NOTICES_FETCH': {
                honeybadger.fetch(message);
                break;
            }
            case 'honeybadger/PROJECTS_SET': {
                honeybadger.set(message);
                break;
            }
            case 'jira/PROJECTS_FETCH':
            case 'jira/STATUSES_FETCH':
            case 'jira/ISSUES_FETCH':
            case 'jira/AUTHENTICATE_REQUEST':
            case 'jira/AUTHENTICATE_CHECK':
            case 'jira/SPRINTS_FETCH': {
                jira.fetch(message);
                break;
            }
            case 'jira/LOGOUT': {
                jira.logout();
                break;
            }
            case 'jira/PROJECTS_UPDATE_WATCHED': {
                jira.write(message);
                break;
            }
        }
    });

}());
