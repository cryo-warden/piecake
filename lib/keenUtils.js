// keenUtils.js
// JS Keen Utils
// by Cory Watson
(function (global) {
    'use strict';
    
    var e = {}; // exports
    
    var noop =
    e.noop = function noop() {};
    
    var id =
    e.id = function id(value) { return value; };
    
    var nextTick =
    e.nextTick = function nextTick(cb) {
        setTimeout(cb, 0);
    };

    var undef;
    
    var dflt =
    e.dflt = function dflt(option, fallback) {
        return option === undef ? fallback : option;
    };
    
    var type =
    e.type = (function () {
        var ObjectToString = Object.prototype.toString;
        var typeNameMap = {
            '[object Undefined]'    : 'undefined',
            '[object Null]'         : 'null',
            '[object Object]'       : 'object',
            '[object Array]'        : 'array',
            '[object Function]'     : 'function',
            '[object String]'       : 'string',
            '[object Number]'       : 'number',
            '[object Boolean]'      : 'boolean',
            '[object Date]'         : 'date',
            '[object RegExp]'       : 'regexp',
            '[object Arguments]'    : 'arguments',
            '[object Math]'         : 'math',
            '[object Error]'        : 'error',
            '[object Window]'       : 'window',
            '[object global]'       : 'global'
        };
        
        return function type(value) {
            return typeNameMap[ObjectToString.call(value)] || '';
        };
    }());
    
    var isUndefined =
    e.isUndefined = function isUndefined(value) {
        return value === undef;
    };
    
    var isNumber =
    e.isNumber = function isNumber(value) {
        return type(value) === 'number';
    };
    
    var isInteger =
    e.isInteger = function isInteger(value) {
        return value === ~~value;
    };
    
    var isString =
    e.isString = function isString(value) {
        return type(value) === 'string';
    };
    
    var ArraySlice = Array.prototype.slice;
    
    var toArray =
    e.toArray = function toArray(value) {
        return ArraySlice.call(value);
    };
    
    var isArray =
    e.isArray = function isArray(value) {
        return type(value) === 'array';
    };
    
    var slice =
    e.slice = function slice(array, start, end) {
        return ArraySlice.call(array, start, end);
    };
    
    var toObject =
    e.toObject = Object;
    
    var isObject =
    e.isObject = function isObject(value) {
        return value === toObject(value);
    };
    
    var isFunction =
    e.isFunction = function isFunction(value) {
        return type(value) === 'function';
    };
    
    var callIf =
    e.callIf = function callIf(fn, args, context, fallback) {
        if (isFunction(fn)) {
            return fn.apply(context, args || []);
        } else {
            return fallback;
        }
    };
    
    var has =
    e.has = (function () {
        var ObjectHas = Object.prototype.hasOwnProperty;
        
        return function has(obj, key) {
            return ObjectHas.call(obj, key);
        };
    }());
    
    function eachInArray(arr, fn) {
        for (var i = 0, il = arr.length; i < il; i++) {
            if (fn(arr[i], i, arr) === false) {
                return;
            }
        }
    }
    
    function eachInObject(obj, fn) {
        for (var key in obj) {
            if (has(obj, key) && fn(obj[key], key, obj) === false) {
                return;
            }
        }
    }
    
    var each =
    e.each = (function () {
        var eachMap = {
            'object':       eachInObject,
            'function':     eachInObject,
            'array':        eachInArray,
            'arguments':    eachInArray
        };
        
        return function each(values, fn) {
            return (eachMap[type(values)] || noop)(values, fn);
        };
    }());
    
    var reduce =
    e.reduce = function reduce(obj, fn, memo) {
        each(obj, function (value, key, obj) {
            memo = fn(memo, value, key, obj);
        });
        
        return memo;
    };
    
    function mapArray(arr, fn) {
        var result = [];
        
        for (var i = 0, il = arr.length; i < il; i++) {
            result[i] = fn(arr[i], i, arr);
        }
        
        return result;
    }
    
    function mapObject(obj, fn) {
        var result = {};
        
        for (var key in obj) {
            if (has(obj, key)) {
                result[key] = fn(obj[key], key, obj);
            }
        }
        
        return result;
    }
    
    var map =
    e.map = (function () {
        var mapMap = {
            'object':       mapObject,
            'function':     mapObject,
            'array':        mapArray,
            'arguments':    mapArray
        };
        
        return function map(values, fn) {
            return (mapMap[type(values)] || id)(values, fn);
        };
    }());
    
    function filterArray(arr, fn) {
        var result = [];
        var j = 0;
        
        for (var i = 0, il = arr.length; i < il; i++) {
            if(fn(arr[i], i, arr)) { 
                result[j++] = arr[i];
            }
        }
        
        return result;
    }
    
    function filterObject(obj, fn) {
        var result = {};
        
        for (var key in obj) {
            if (has(obj, key) && fn(obj[key], key, obj)) {
                result[key] = obj[key];
            }
        }
        
        return result;
    }
    
    var filter =
    e.filter = (function () {
        var filterMap = {
            'object':       filterObject,
            'function':     filterObject,
            'array':        filterArray,
            'arguments':    filterArray
        };
        
        return function filter(values, fn) {
            return (filterMap[type(values)] || id)(values, fn);
        };
    }());
    
    function filterMapArray(arr, fn) {
        var result = [];
        var value;
        var j = 0;
        
        for (var i = 0, il = arr.length; i < il; i++) {
            if((value = fn(arr[i], i, arr)) !== undef) {
                result[j++] = value;
            }
        }
        
        return result;
    }
    
    function filterMapObject(obj, fn) {
        var result = {};
        var value;
        
        for (var key in obj) {
            if (
                has(obj, key) &&
                (value = fn(obj[key], key, obj)) !== undef
            ) {
                result[key] = value;
            }
        }
        
        return result;
    }
    
    var filterMap =
    e.filterMap = (function () {
        var filterMapMap = {
            'object':       filterMapObject,
            'function':     filterMapObject,
            'array':        filterMapArray,
            'arguments':    filterMapArray
        };
        
        return function filterMap(values, fn) {
            return (filterMapMap[type(values)] || id)(values, fn);
        };
    }());
    
    var mergeArray =
    e.mergeArray = (function () {
        var ArrayPush = Array.prototype.push;

        return function mergeArray(target, arr) {
            if (target !== arr && arr) {
                ArrayPush.apply(target, arr);
            }
            
            return target;
        };
    }());
    
    var mergeArrays =
    e.mergeArrays = function mergeArrays(arrs) {
        return reduce(arrs, mergeArray, arrs[0]);
    };
    
    var mergeObject =
    e.mergeObject = function mergeObject(target, obj) {
        if (target !== obj && obj) {
            for (var key in obj) {
                if (has(obj, key)) {
                    target[key] = obj[key];
                }
            }
        }
        
        return target;
    };
    
    var mergeObjects =
    e.mergeObjects = function mergeObjects(objs) {
        return reduce(objs, mergeObject, objs[0]);
    };
    
    var mergeOne =
    e.mergeOne = (function () {
        var mergeOneMap = {
            'object':       mergeObject,
            'function':     mergeObject,
            'array':        mergeArray,
            'arguments':    mergeArray
        };
        
        return function mergeOne(target, other) {
            return (mergeOneMap[type(target)] || id)(target, other);
        };
    }());
    
    var mergeMany =
    e.mergeMany = (function () {
        var mergeManyMap = {
            'object':       mergeObjects,
            'function':     mergeObjects,
            'array':        mergeArrays,
            'arguments':    mergeArrays
        };
        
        return function mergeMany(values) {
            return (mergeManyMap[type(values[0])] || id)(values);
        };
    }());
    
    var merge =
    e.merge = function merge() {
        return mergeMany(arguments);
    };
    
    var fillDefault =
    e.fillDefault = function fillDefault(target, obj) {
        if (!target) { target = {}; }
        
        if (target !== obj && obj) {
            for (var key in obj) {
                if (has(obj, key) && target[key] == null) {
                    target[key] = obj[key];
                }
            }
        }
        
        return target;
    };
    
    var fillDefaults =
    e.fillDefaults = function fillDefaults(objs) {
        return reduce(objs, fillDefault, objs[0]);
    };
    
    var defaults =
    e.defaults = function defaults() {
        return fillDefaults(arguments);
    };
    
    var clone =
    e.clone = function clone(value) {
        return isObject(value) ? (
            isArray(value) ?
                value.slice() :
                mergeObject({}, value)
            ) :
            value;
    };
    
    var range =
    e.range = function range(min, max, step) {
        if (max == null) {
            max = min;
            min = 0;
        }
        
        var isAscending = min < max;
        
        if (step == null || step === 0) {
            if (isAscending) {
                step = 1;
            } else {
                step = -1;
            }
        }
        
        if ((step < 0) === isAscending) {
            return [];
        }
        
        var result = [];
        var i = 0;
        var value = min;
        
        while((value < max) === isAscending) {
            result[i] = value;
            i++;
            value += step;
        }
        
        return result;
    };
    
    var indexOf =
    e.indexOf = function indexOf(arr, value) {
        for (var i = 0, il = arr.length; i < il; i++) {
            if (arr[i] === value) {
                return i;
            }
        }
    };
    
    var isIndex = function isIndex(i) {
        return isInteger(i) && i >= 0;
    };
    
    var contains =
    e.contains = function contains(arr, value) {
        for (var i = 0, il = arr.length; i < il; i++) {
            if (arr[i] === value) {
                return true;
            }
        }
    };
    
    var add =
    e.add = function add(arr, value) {
        arr[arr.length] = value;
        return arr;
    };
    
    var remove =
    e.remove = function remove(arr, value) {
        var i = indexOf(arr, value);
        if (isIndex(i)) {
            arr.splice(i, 1);
        }
        return arr;
    };
    
    var composeOne =
    e.composeOne = function composeOne(f, g) {
        return function (value) {
            return f(g(value));
        };
    };
    
    var composeMany =
    e.composeMany = function composeMany(fs) {
        return function (value) {
            var i = fs.length;
            var result = value;

            while (i) {
                result = fs[--i](result);
            }
            
            return result;
        };
    };
    
    var compose =
    e.compose = function compose() {
        return composeMany(arguments);
    };
    
    var get =
    e.get = function get(obj, keyPath) {
        if (!keyPath) { return obj; }
        
        var parts = String(keyPath).split('.');
        
        for (var i = 0, l = parts.length; i < l && obj; i++) {
            obj = obj[parts[i]];
        }
        
        return obj;
    };
    
    var getByKey =
    e.getByKey = function getByKey(obj, key) {
        return obj[key];
    };
    
    var set =
    e.set = function set(obj, keyPath, value) {
        if (!obj) { return; }

        var cur = obj;
        var parts = String(keyPath).split('.');
        var part;
        
        for (var i = 0, l = parts.length - 1; i < l; i++) {
            if (!cur[part = parts[i]]) { cur[part] = {}; }

            cur = cur[part];
        }
        
        cur[parts[i]] = value;
        
        return obj;
    };
    
    var setByKey =
    e.setByKey = function setByKey(obj, key, value) {
        obj[key] = value;
        return obj;
    };
    
    var del =
    e.del = function del(obj, keyPath) {
        if (!obj) { return; }

        var cur = obj;
        var parts = String(keyPath).split('.');
        var part;

        for (var i = 0, l = parts.length - 1; i < l; i++) {
            if (!cur[part = parts[i]]) { return obj; }

            cur = cur[part];
        }

        delete cur[parts[i]];

        return obj;
    };
    
    var delByKey =
    e.delByKey = function delByKey(obj, key) {
        delete obj[key];
        return obj;
    };
    
    var call =
    e.call = function call(obj, keyPath, value) {
        if (!obj) { return; }

        var cur = obj;
        var parts = String(keyPath).split('.');
        var part;
        
        for (var i = 0, l = parts.length - 1; i < l; i++) {
            if (!cur[part = parts[i]]) { cur[part] = {}; }

            cur = cur[part];
        }
        
        return cur[parts[i]](value);
    };
    
    var apply =
    e.apply = function call(obj, keyPath, args) {
        if (!obj) { return; }

        var cur = obj;
        var parts = String(keyPath).split('.');
        var part;
        
        for (var i = 0, l = parts.length - 1; i < l; i++) {
            if (!cur[part = parts[i]]) { cur[part] = {}; }

            cur = cur[part];
        }
        
        return cur[parts[i]].apply(cur, args);
    };
    
    var orElse =
    e.orElse = function orElse(value, other) {
        return value || other;
    };
    
    var andAlso =
    e.andAlso = function andAlso(value, other) {
        return value && other;
    };
    
    var orElseCall =
    e.orElseCall = function orElseCall(value, other) {
        return value || other(value);
    };
    
    var andAlsoCall =
    e.andAlsoCall = function andAlsoCall(value, other) {
        return value && other(value);
    };
    
    var createProperty =
    e.createProperty =
    function createProperty(keyPath) {
        return function property(value) {
            if (value === undef) {
                return get(this, keyPath);
            } else {
                return set(this, keyPath, value);
            }
        };
    };
    
    var createEventedProperty =
    e.createEventedProperty =
    function createEventedProperty(options) {
        if (!options) { options = {}; }
        
        var keyPath = options.keyPath;
        var beforeSet = options.beforeSet;
        var afterSet = options.afterSet;
        
        return function eventedProperty(value) {
            var result;
            
            if (value === undef) {
                result = get(this, keyPath);
            } else {
                callIf(beforeSet, [value], this);
                result = set(this, keyPath, value);
                callIf(afterSet, [value], this);
            }
            
            return result;
        };
    };
    
    var createClass =
    e.createClass = (function () {
        function process(target, processors, classOptions) {
            if (isFunction(processors.init)) {
                processors.init(target, classOptions);
            }
            
            eachInObject(processors, function (processor, key) {
                eachInObject(classOptions[key], function (value, key) {
                    processor(target, value, key);
                });
            });
        }
        
        var instantiating = true;
        
        function createEmptyInstance(Class) {
            var result;
            
            var wasInstantiating = instantiating;
            instantiating = false;
            try {
                result = new Class();
            } finally {
                instantiating = wasInstantiating;
            }
            
            return result;
        }
        
        function initializeInstance(instance, args, classOptions) {
            if (instantiating) {
                if (isFunction(instance.init)) {
                    instance.init.apply(instance, args);
                }
            }
            
            return instance;
        }
        
        var defaultProcessors = {
            arrays: function (Class, options, key) {
                var ClassProto = Class.prototype;
                var keyPath = options.keyPath;
                var suffix = options.suffix;
                
                if (options.property !== false) {
                    ClassProto[key] = createProperty(keyPath);
                }
                
                if (options.count !== false) {
                    ClassProto['count' + suffix] =
                    function countItem() {
                        return this[key]().length;
                    };
                }
                
                if (options.add !== false) {
                    ClassProto['add' + suffix] =
                    function addItem(value) {
                        add(this[key](), value);
                        return this;
                    };
                }
                
                if (options.remove !== false) {
                    ClassProto['remove' + suffix] =
                    function removeItem(value) {
                        remove(this[key](), value);
                        return this;
                    };
                }
                
                if (options.contains !== false) {
                    ClassProto['contains' + suffix] =
                    function containsItem(value) {
                        return contains(this[key](), value);
                    };
                }
                
                if (options.each !== false) {
                    ClassProto['each' + suffix] =
                    function eachItem(fn) {
                        return eachInArray(this[key](), fn);
                    };
                }
            },
            properties: function (Class, keyPath, key) {
                Class.prototype[key] = createProperty(keyPath);
            },
            eventedProperties: function (Class, options, key) {
                Class.prototype[key] = createEventedProperty(options);
            },
            methods: function (Class, method, key) {
                Class.prototype[key] = method;
            },
            staticMethods: function (Class, method, key) {
                Class[key] = method;
            }
        };
        
        return function createClass(options) {
            if (!options) { options = {}; }
            
            function Class() {
                initializeInstance(this, arguments, options);
            }
            
            var BaseClass = options.BaseClass || Object;
            var BaseProto = BaseClass.prototype;
            
            var ClassProto =
            Class.prototype = createEmptyInstance(BaseClass);
            
            Class.Base = BaseClass;
            ClassProto.base = BaseProto;
            ClassProto.constructor = Class;
            
            Class.create = function create() {
                return initializeInstance(
                    createEmptyInstance(Class),
                    arguments,
                    options
                );
            };
            
            Class.applyCreate = function applyCreate(args) {
                return Class.create.apply(Class, args);
            };
            
            var processors = fillDefault(
                clone(options.processors),
                defaultProcessors
            );
            
            Class.mixin = function mixin(options) {
                process(Class, processors, options);
                return Class;
            };
            
            Class.mixout = function mixout(mixoutOptions) {
                return createClass(mergeObject({
                    BaseClass: Class
                }, mixoutOptions));
            };
            
            ClassProto.callBase = function callBase(methodName, value) {
                return BaseProto[methodName].call(this, value);
            };
            
            ClassProto.applyBase = function applyBase(methodName, args) {
                return BaseProto[methodName].apply(this, args);
            };
            
            process(Class, processors, options);
            
            return Class;
        };
    }());
    
    var callbacks =
    e.callbacks = (function () {
        var CallbackList = createClass({
            methods: {
                init: function (options) {
                    this._callbacks = [];
                    
                    if (options) {
                        this._once = !!options.once;
                        this._store = !!options.store;
                    } else {
                        this._once = false;
                        this._store = false;
                    }
                    
                    this._wasCalled = false;
                    this._callValue = undef;
                    this._wasCancelled = false;
                },
                add: function (cb) {
                    if (this._wasCancelled) {
                        return this;
                    }

                    if (this._store && this._wasCalled) {
                        cb(this._callValue);
                    }
                    
                    this._callbacks.push(cb);
                    
                    return this;
                },
                remove: function (cb) {
                    if (!this._wasCancelled) {
                        remove(this._callbacks, cb);
                    }
                    
                    return this;
                },
                call: function (value) {
                    if (this._wasCancelled || (this._once && this._wasCalled)) {
                        return this;
                    }
                    
                    this._wasCalled = true;
                    this._callValue = value;
                    eachInArray(this._callbacks, function (cb) {
                        cb(value);
                    });
                    
                    return this;
                },
                cancel: function () {
                    this._wasCancelled = true;
                    
                    return this;
                }
            }
        });
        
        return function createCallbackList(options) {
            return new CallbackList(options);
        };
    }());
    
    e.defer = (function () {
        function createPromise(deferred) {
            return {
                then: function (successHandler, failureHandler) {
					// TODO
                }
            };
        }

        function createDeferred() {
            var state = 'pending';
            var successHandlers = callbacks({
                once: true,
                store: true
            });
            var failureHandlers = callbacks({
                once: true,
                store: true
            });

            return {
                then: function (successHandler, failureHandler) {
                    var newDeferred = createDeferred();
                    
                    if (successHandler) {
                        successHandlers.add(function success(value) {
                            nextTick(function () {
                                newDeferred.resolve(successHandler(value));
                            });
                        });
                    }
                    
                    if (failureHandler) {
                        failureHandlers.add(function failure(error) {
                            nextTick(function () {
                                newDeferred.reject(failureHandler(error));
                            });
                        });
                    }
                    
                    return newDeferred;
                },
                resolve: function (value) {
                    if (state !== 'pending') {
                        return;
                    }
                    
                    state = 'resolved';
                    successHandlers.call(value);
                    failureHandlers.cancel();
                },
                reject: function (error) {
                    if (state !== 'pending') {
                        return;
                    }
                    
                    state = 'rejected';
                    failureHandlers.call(error);
                    successHandlers.cancel();
                }
            };
        }
        
        return createDeferred;
    }());
    
    var createChainLibrary =
    e.create = (function () {
        var chainLibRoot = (function () {
            var ChainBase = createClass({
                methods: {
                    init: function (value) {
                        this._value = value;
                    },
                    value: function value() {
                        return this._value;
                    },
                    tap: function tap(fn) {
                        fn(this._value);
                        return this;
                    }
                }
            });
            
            function mixoutChainLib(baseLib, BaseClass) {
                var Chain = createClass({
                    BaseClass: BaseClass,
                    methods: {
                        divert: function divert(fn) {
                            return new Chain(fn(this._value));
                        }
                    }
                });
                
                var mapMixinMethod = function (method) {
                    if (!isFunction(method)) {
                        return method;
                    }
                    
                    return function wrappedMethod() {
                        return new Chain(
                            method.apply(
                                this,
                                mergeArray(
                                    [this._value],
                                    arguments
                                )
                            )
                        );
                    };
                };
                
                var lib = mergeObject({
                    chain: function chain(value) {
                        return new Chain(value);
                    },
                    mixout: function mixout(methodMap) {
                        return mixoutChainLib(lib, Chain)
                        .mixin(methodMap);
                    },
                    mixin: function mixin(methodMap) {
                        if (!methodMap) { return lib; }
                        
                        mergeObject(lib, methodMap);
                        Chain.mixin({
                            methods: mapObject(methodMap, mapMixinMethod)
                        });
                        
                        return lib;
                    }
                }, baseLib);
                
                return lib;
            }
            
            return mixoutChainLib({}, ChainBase);
        }());
        
        return function createChainLibrary(methodMap) {
            return chainLibRoot.mixout(methodMap);
        };
    }());
    
    var u = createChainLibrary(e);
    
    if (get(global, 'define.amd')) {
        global.define(u);
    } else {
        global.keenUtils = u;
    }
    
}(this));
