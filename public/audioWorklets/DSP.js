var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  "node_modules/lodash/_listCacheClear.js"(exports, module) {
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    module.exports = listCacheClear;
  }
});

// node_modules/lodash/eq.js
var require_eq = __commonJS({
  "node_modules/lodash/eq.js"(exports, module) {
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    module.exports = eq;
  }
});

// node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  "node_modules/lodash/_assocIndexOf.js"(exports, module) {
    var eq = require_eq();
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    module.exports = assocIndexOf;
  }
});

// node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  "node_modules/lodash/_listCacheDelete.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    module.exports = listCacheDelete;
  }
});

// node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  "node_modules/lodash/_listCacheGet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    module.exports = listCacheGet;
  }
});

// node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  "node_modules/lodash/_listCacheHas.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    module.exports = listCacheHas;
  }
});

// node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  "node_modules/lodash/_listCacheSet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    module.exports = listCacheSet;
  }
});

// node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  "node_modules/lodash/_ListCache.js"(exports, module) {
    var listCacheClear = require_listCacheClear();
    var listCacheDelete = require_listCacheDelete();
    var listCacheGet = require_listCacheGet();
    var listCacheHas = require_listCacheHas();
    var listCacheSet = require_listCacheSet();
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    module.exports = ListCache;
  }
});

// node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  "node_modules/lodash/_stackClear.js"(exports, module) {
    var ListCache = require_ListCache();
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    module.exports = stackClear;
  }
});

// node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  "node_modules/lodash/_stackDelete.js"(exports, module) {
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    module.exports = stackDelete;
  }
});

// node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  "node_modules/lodash/_stackGet.js"(exports, module) {
    function stackGet(key) {
      return this.__data__.get(key);
    }
    module.exports = stackGet;
  }
});

// node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  "node_modules/lodash/_stackHas.js"(exports, module) {
    function stackHas(key) {
      return this.__data__.has(key);
    }
    module.exports = stackHas;
  }
});

// node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  "node_modules/lodash/_freeGlobal.js"(exports, module) {
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    module.exports = freeGlobal;
  }
});

// node_modules/lodash/_root.js
var require_root = __commonJS({
  "node_modules/lodash/_root.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    module.exports = root;
  }
});

// node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  "node_modules/lodash/_Symbol.js"(exports, module) {
    var root = require_root();
    var Symbol2 = root.Symbol;
    module.exports = Symbol2;
  }
});

// node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  "node_modules/lodash/_getRawTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    module.exports = getRawTag;
  }
});

// node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  "node_modules/lodash/_objectToString.js"(exports, module) {
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    module.exports = objectToString;
  }
});

// node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  "node_modules/lodash/_baseGetTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var getRawTag = require_getRawTag();
    var objectToString = require_objectToString();
    var nullTag = "[object Null]";
    var undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    module.exports = baseGetTag;
  }
});

// node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  "node_modules/lodash/isObject.js"(exports, module) {
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    module.exports = isObject;
  }
});

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  "node_modules/lodash/isFunction.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObject = require_isObject();
    var asyncTag = "[object AsyncFunction]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    module.exports = isFunction;
  }
});

// node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  "node_modules/lodash/_coreJsData.js"(exports, module) {
    var root = require_root();
    var coreJsData = root["__core-js_shared__"];
    module.exports = coreJsData;
  }
});

// node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  "node_modules/lodash/_isMasked.js"(exports, module) {
    var coreJsData = require_coreJsData();
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    module.exports = isMasked;
  }
});

// node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  "node_modules/lodash/_toSource.js"(exports, module) {
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    module.exports = toSource;
  }
});

// node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  "node_modules/lodash/_baseIsNative.js"(exports, module) {
    var isFunction = require_isFunction();
    var isMasked = require_isMasked();
    var isObject = require_isObject();
    var toSource = require_toSource();
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    module.exports = baseIsNative;
  }
});

// node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  "node_modules/lodash/_getValue.js"(exports, module) {
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    module.exports = getValue;
  }
});

// node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  "node_modules/lodash/_getNative.js"(exports, module) {
    var baseIsNative = require_baseIsNative();
    var getValue = require_getValue();
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    module.exports = getNative;
  }
});

// node_modules/lodash/_Map.js
var require_Map = __commonJS({
  "node_modules/lodash/_Map.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Map = getNative(root, "Map");
    module.exports = Map;
  }
});

// node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  "node_modules/lodash/_nativeCreate.js"(exports, module) {
    var getNative = require_getNative();
    var nativeCreate = getNative(Object, "create");
    module.exports = nativeCreate;
  }
});

// node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  "node_modules/lodash/_hashClear.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    module.exports = hashClear;
  }
});

// node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  "node_modules/lodash/_hashDelete.js"(exports, module) {
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = hashDelete;
  }
});

// node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  "node_modules/lodash/_hashGet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    module.exports = hashGet;
  }
});

// node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  "node_modules/lodash/_hashHas.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    module.exports = hashHas;
  }
});

// node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  "node_modules/lodash/_hashSet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    module.exports = hashSet;
  }
});

// node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  "node_modules/lodash/_Hash.js"(exports, module) {
    var hashClear = require_hashClear();
    var hashDelete = require_hashDelete();
    var hashGet = require_hashGet();
    var hashHas = require_hashHas();
    var hashSet = require_hashSet();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    module.exports = Hash;
  }
});

// node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  "node_modules/lodash/_mapCacheClear.js"(exports, module) {
    var Hash = require_Hash();
    var ListCache = require_ListCache();
    var Map = require_Map();
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map || ListCache)(),
        "string": new Hash()
      };
    }
    module.exports = mapCacheClear;
  }
});

// node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  "node_modules/lodash/_isKeyable.js"(exports, module) {
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    module.exports = isKeyable;
  }
});

// node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  "node_modules/lodash/_getMapData.js"(exports, module) {
    var isKeyable = require_isKeyable();
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    module.exports = getMapData;
  }
});

// node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  "node_modules/lodash/_mapCacheDelete.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = mapCacheDelete;
  }
});

// node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  "node_modules/lodash/_mapCacheGet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    module.exports = mapCacheGet;
  }
});

// node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  "node_modules/lodash/_mapCacheHas.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    module.exports = mapCacheHas;
  }
});

// node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  "node_modules/lodash/_mapCacheSet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    module.exports = mapCacheSet;
  }
});

// node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  "node_modules/lodash/_MapCache.js"(exports, module) {
    var mapCacheClear = require_mapCacheClear();
    var mapCacheDelete = require_mapCacheDelete();
    var mapCacheGet = require_mapCacheGet();
    var mapCacheHas = require_mapCacheHas();
    var mapCacheSet = require_mapCacheSet();
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    module.exports = MapCache;
  }
});

// node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  "node_modules/lodash/_stackSet.js"(exports, module) {
    var ListCache = require_ListCache();
    var Map = require_Map();
    var MapCache = require_MapCache();
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    module.exports = stackSet;
  }
});

// node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  "node_modules/lodash/_Stack.js"(exports, module) {
    var ListCache = require_ListCache();
    var stackClear = require_stackClear();
    var stackDelete = require_stackDelete();
    var stackGet = require_stackGet();
    var stackHas = require_stackHas();
    var stackSet = require_stackSet();
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    module.exports = Stack;
  }
});

// node_modules/lodash/_arrayEach.js
var require_arrayEach = __commonJS({
  "node_modules/lodash/_arrayEach.js"(exports, module) {
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    module.exports = arrayEach;
  }
});

// node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  "node_modules/lodash/_defineProperty.js"(exports, module) {
    var getNative = require_getNative();
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    module.exports = defineProperty;
  }
});

// node_modules/lodash/_baseAssignValue.js
var require_baseAssignValue = __commonJS({
  "node_modules/lodash/_baseAssignValue.js"(exports, module) {
    var defineProperty = require_defineProperty();
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    module.exports = baseAssignValue;
  }
});

// node_modules/lodash/_assignValue.js
var require_assignValue = __commonJS({
  "node_modules/lodash/_assignValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignValue;
  }
});

// node_modules/lodash/_copyObject.js
var require_copyObject = __commonJS({
  "node_modules/lodash/_copyObject.js"(exports, module) {
    var assignValue = require_assignValue();
    var baseAssignValue = require_baseAssignValue();
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    module.exports = copyObject;
  }
});

// node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  "node_modules/lodash/_baseTimes.js"(exports, module) {
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    module.exports = baseTimes;
  }
});

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  "node_modules/lodash/isObjectLike.js"(exports, module) {
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    module.exports = isObjectLike;
  }
});

// node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  "node_modules/lodash/_baseIsArguments.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    module.exports = baseIsArguments;
  }
});

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/lodash/isArguments.js"(exports, module) {
    var baseIsArguments = require_baseIsArguments();
    var isObjectLike = require_isObjectLike();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var isArguments = baseIsArguments(/* @__PURE__ */ function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    module.exports = isArguments;
  }
});

// node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  "node_modules/lodash/isArray.js"(exports, module) {
    var isArray = Array.isArray;
    module.exports = isArray;
  }
});

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  "node_modules/lodash/stubFalse.js"(exports, module) {
    function stubFalse() {
      return false;
    }
    module.exports = stubFalse;
  }
});

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  "node_modules/lodash/isBuffer.js"(exports, module) {
    var root = require_root();
    var stubFalse = require_stubFalse();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  }
});

// node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  "node_modules/lodash/_isIndex.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    module.exports = isIndex;
  }
});

// node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  "node_modules/lodash/isLength.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    module.exports = isLength;
  }
});

// node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  "node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isLength = require_isLength();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    module.exports = baseIsTypedArray;
  }
});

// node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  "node_modules/lodash/_baseUnary.js"(exports, module) {
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    module.exports = baseUnary;
  }
});

// node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  "node_modules/lodash/_nodeUtil.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    module.exports = nodeUtil;
  }
});

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  "node_modules/lodash/isTypedArray.js"(exports, module) {
    var baseIsTypedArray = require_baseIsTypedArray();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
  }
});

// node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  "node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
    var baseTimes = require_baseTimes();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isIndex = require_isIndex();
    var isTypedArray = require_isTypedArray();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = arrayLikeKeys;
  }
});

// node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  "node_modules/lodash/_isPrototype.js"(exports, module) {
    var objectProto = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    module.exports = isPrototype;
  }
});

// node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  "node_modules/lodash/_overArg.js"(exports, module) {
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    module.exports = overArg;
  }
});

// node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  "node_modules/lodash/_nativeKeys.js"(exports, module) {
    var overArg = require_overArg();
    var nativeKeys = overArg(Object.keys, Object);
    module.exports = nativeKeys;
  }
});

// node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  "node_modules/lodash/_baseKeys.js"(exports, module) {
    var isPrototype = require_isPrototype();
    var nativeKeys = require_nativeKeys();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeys;
  }
});

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  "node_modules/lodash/isArrayLike.js"(exports, module) {
    var isFunction = require_isFunction();
    var isLength = require_isLength();
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    module.exports = isArrayLike;
  }
});

// node_modules/lodash/keys.js
var require_keys = __commonJS({
  "node_modules/lodash/keys.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeys = require_baseKeys();
    var isArrayLike = require_isArrayLike();
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    module.exports = keys;
  }
});

// node_modules/lodash/_baseAssign.js
var require_baseAssign = __commonJS({
  "node_modules/lodash/_baseAssign.js"(exports, module) {
    var copyObject = require_copyObject();
    var keys = require_keys();
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    module.exports = baseAssign;
  }
});

// node_modules/lodash/_nativeKeysIn.js
var require_nativeKeysIn = __commonJS({
  "node_modules/lodash/_nativeKeysIn.js"(exports, module) {
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = nativeKeysIn;
  }
});

// node_modules/lodash/_baseKeysIn.js
var require_baseKeysIn = __commonJS({
  "node_modules/lodash/_baseKeysIn.js"(exports, module) {
    var isObject = require_isObject();
    var isPrototype = require_isPrototype();
    var nativeKeysIn = require_nativeKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeysIn;
  }
});

// node_modules/lodash/keysIn.js
var require_keysIn = __commonJS({
  "node_modules/lodash/keysIn.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeysIn = require_baseKeysIn();
    var isArrayLike = require_isArrayLike();
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    module.exports = keysIn;
  }
});

// node_modules/lodash/_baseAssignIn.js
var require_baseAssignIn = __commonJS({
  "node_modules/lodash/_baseAssignIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    module.exports = baseAssignIn;
  }
});

// node_modules/lodash/_cloneBuffer.js
var require_cloneBuffer = __commonJS({
  "node_modules/lodash/_cloneBuffer.js"(exports, module) {
    var root = require_root();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  }
});

// node_modules/lodash/_copyArray.js
var require_copyArray = __commonJS({
  "node_modules/lodash/_copyArray.js"(exports, module) {
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    module.exports = copyArray;
  }
});

// node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  "node_modules/lodash/_arrayFilter.js"(exports, module) {
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    module.exports = arrayFilter;
  }
});

// node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  "node_modules/lodash/stubArray.js"(exports, module) {
    function stubArray() {
      return [];
    }
    module.exports = stubArray;
  }
});

// node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  "node_modules/lodash/_getSymbols.js"(exports, module) {
    var arrayFilter = require_arrayFilter();
    var stubArray = require_stubArray();
    var objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    module.exports = getSymbols;
  }
});

// node_modules/lodash/_copySymbols.js
var require_copySymbols = __commonJS({
  "node_modules/lodash/_copySymbols.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbols = require_getSymbols();
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    module.exports = copySymbols;
  }
});

// node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  "node_modules/lodash/_arrayPush.js"(exports, module) {
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    module.exports = arrayPush;
  }
});

// node_modules/lodash/_getPrototype.js
var require_getPrototype = __commonJS({
  "node_modules/lodash/_getPrototype.js"(exports, module) {
    var overArg = require_overArg();
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    module.exports = getPrototype;
  }
});

// node_modules/lodash/_getSymbolsIn.js
var require_getSymbolsIn = __commonJS({
  "node_modules/lodash/_getSymbolsIn.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var getPrototype = require_getPrototype();
    var getSymbols = require_getSymbols();
    var stubArray = require_stubArray();
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    module.exports = getSymbolsIn;
  }
});

// node_modules/lodash/_copySymbolsIn.js
var require_copySymbolsIn = __commonJS({
  "node_modules/lodash/_copySymbolsIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbolsIn = require_getSymbolsIn();
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    module.exports = copySymbolsIn;
  }
});

// node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  "node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isArray = require_isArray();
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    module.exports = baseGetAllKeys;
  }
});

// node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  "node_modules/lodash/_getAllKeys.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbols = require_getSymbols();
    var keys = require_keys();
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    module.exports = getAllKeys;
  }
});

// node_modules/lodash/_getAllKeysIn.js
var require_getAllKeysIn = __commonJS({
  "node_modules/lodash/_getAllKeysIn.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbolsIn = require_getSymbolsIn();
    var keysIn = require_keysIn();
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    module.exports = getAllKeysIn;
  }
});

// node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  "node_modules/lodash/_DataView.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var DataView = getNative(root, "DataView");
    module.exports = DataView;
  }
});

// node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  "node_modules/lodash/_Promise.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Promise2 = getNative(root, "Promise");
    module.exports = Promise2;
  }
});

// node_modules/lodash/_Set.js
var require_Set = __commonJS({
  "node_modules/lodash/_Set.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Set2 = getNative(root, "Set");
    module.exports = Set2;
  }
});

// node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  "node_modules/lodash/_WeakMap.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var WeakMap = getNative(root, "WeakMap");
    module.exports = WeakMap;
  }
});

// node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  "node_modules/lodash/_getTag.js"(exports, module) {
    var DataView = require_DataView();
    var Map = require_Map();
    var Promise2 = require_Promise();
    var Set2 = require_Set();
    var WeakMap = require_WeakMap();
    var baseGetTag = require_baseGetTag();
    var toSource = require_toSource();
    var mapTag = "[object Map]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var setTag = "[object Set]";
    var weakMapTag = "[object WeakMap]";
    var dataViewTag = "[object DataView]";
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap);
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    module.exports = getTag;
  }
});

// node_modules/lodash/_initCloneArray.js
var require_initCloneArray = __commonJS({
  "node_modules/lodash/_initCloneArray.js"(exports, module) {
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    module.exports = initCloneArray;
  }
});

// node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  "node_modules/lodash/_Uint8Array.js"(exports, module) {
    var root = require_root();
    var Uint8Array2 = root.Uint8Array;
    module.exports = Uint8Array2;
  }
});

// node_modules/lodash/_cloneArrayBuffer.js
var require_cloneArrayBuffer = __commonJS({
  "node_modules/lodash/_cloneArrayBuffer.js"(exports, module) {
    var Uint8Array2 = require_Uint8Array();
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    module.exports = cloneArrayBuffer;
  }
});

// node_modules/lodash/_cloneDataView.js
var require_cloneDataView = __commonJS({
  "node_modules/lodash/_cloneDataView.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    module.exports = cloneDataView;
  }
});

// node_modules/lodash/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "node_modules/lodash/_cloneRegExp.js"(exports, module) {
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    module.exports = cloneRegExp;
  }
});

// node_modules/lodash/_cloneSymbol.js
var require_cloneSymbol = __commonJS({
  "node_modules/lodash/_cloneSymbol.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    module.exports = cloneSymbol;
  }
});

// node_modules/lodash/_cloneTypedArray.js
var require_cloneTypedArray = __commonJS({
  "node_modules/lodash/_cloneTypedArray.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    module.exports = cloneTypedArray;
  }
});

// node_modules/lodash/_initCloneByTag.js
var require_initCloneByTag = __commonJS({
  "node_modules/lodash/_initCloneByTag.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    var cloneDataView = require_cloneDataView();
    var cloneRegExp = require_cloneRegExp();
    var cloneSymbol = require_cloneSymbol();
    var cloneTypedArray = require_cloneTypedArray();
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor();
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor();
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    module.exports = initCloneByTag;
  }
});

// node_modules/lodash/_baseCreate.js
var require_baseCreate = __commonJS({
  "node_modules/lodash/_baseCreate.js"(exports, module) {
    var isObject = require_isObject();
    var objectCreate = Object.create;
    var baseCreate = /* @__PURE__ */ function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    module.exports = baseCreate;
  }
});

// node_modules/lodash/_initCloneObject.js
var require_initCloneObject = __commonJS({
  "node_modules/lodash/_initCloneObject.js"(exports, module) {
    var baseCreate = require_baseCreate();
    var getPrototype = require_getPrototype();
    var isPrototype = require_isPrototype();
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    module.exports = initCloneObject;
  }
});

// node_modules/lodash/_baseIsMap.js
var require_baseIsMap = __commonJS({
  "node_modules/lodash/_baseIsMap.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var mapTag = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }
    module.exports = baseIsMap;
  }
});

// node_modules/lodash/isMap.js
var require_isMap = __commonJS({
  "node_modules/lodash/isMap.js"(exports, module) {
    var baseIsMap = require_baseIsMap();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    module.exports = isMap;
  }
});

// node_modules/lodash/_baseIsSet.js
var require_baseIsSet = __commonJS({
  "node_modules/lodash/_baseIsSet.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var setTag = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }
    module.exports = baseIsSet;
  }
});

// node_modules/lodash/isSet.js
var require_isSet = __commonJS({
  "node_modules/lodash/isSet.js"(exports, module) {
    var baseIsSet = require_baseIsSet();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    module.exports = isSet;
  }
});

// node_modules/lodash/_baseClone.js
var require_baseClone = __commonJS({
  "node_modules/lodash/_baseClone.js"(exports, module) {
    var Stack = require_Stack();
    var arrayEach = require_arrayEach();
    var assignValue = require_assignValue();
    var baseAssign = require_baseAssign();
    var baseAssignIn = require_baseAssignIn();
    var cloneBuffer = require_cloneBuffer();
    var copyArray = require_copyArray();
    var copySymbols = require_copySymbols();
    var copySymbolsIn = require_copySymbolsIn();
    var getAllKeys = require_getAllKeys();
    var getAllKeysIn = require_getAllKeysIn();
    var getTag = require_getTag();
    var initCloneArray = require_initCloneArray();
    var initCloneByTag = require_initCloneByTag();
    var initCloneObject = require_initCloneObject();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isMap = require_isMap();
    var isObject = require_isObject();
    var isSet = require_isSet();
    var keys = require_keys();
    var keysIn = require_keysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          result = isFlat || isFunc ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    module.exports = baseClone;
  }
});

// node_modules/lodash/cloneDeep.js
var require_cloneDeep = __commonJS({
  "node_modules/lodash/cloneDeep.js"(exports, module) {
    var baseClone = require_baseClone();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_SYMBOLS_FLAG = 4;
    function cloneDeep2(value) {
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
    }
    module.exports = cloneDeep2;
  }
});

// src/audioWorklets/DSP.js
var import_cloneDeep = __toESM(require_cloneDeep(), 1);
var DSP = class extends AudioWorkletProcessor {
  constructor() {
    super();
    this.currentState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
    this.nextState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
    this.signalBuffers = {};
    this.signalBuffersCurrent = {};
    this.signalBuffersNext = {};
    this.feedbackBuffers = {};
    this.crossfadeInProgress = false;
    this.crossfadeProgress = 0;
    this.crossfadeStep = 1 / (sampleRate / 128 * 0.1);
    this.outputVolume = 0.5;
    this.port.onmessage = (event) => this.handleMessage(event.data);
    this.analyze = false;
  }
  getSampleRate() {
    return sampleRate;
  }
  audioNodeBuilder(type, moduleName, params, loadState) {
    switch (type) {
      case "VCA":
        let vca = {
          node: "VCA",
          structure: "webAudioNode",
          baseParams: {
            gain: parseFloat(1),
            "gain cv +/-": parseFloat(params["gain cv +/-"])
          },
          modulatedParams: {
            // offsets for modulation
            gain: 0
          },
          output: new Float32Array(128),
          modulationTarget: null,
          // Target node or parameter for modulation
          startTime: null,
          // Optional: Scheduled start time
          stopTime: null
          // Optional: Scheduled stop time           
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = vca;
        } else {
          this.currentState.nodes[moduleName] = vca;
        }
        break;
      case "HighPassFilter":
        let hpf = {
          node: "HighPassFilter",
          structure: "webAudioNode",
          baseParams: {
            freq: parseFloat(params.freq),
            Q: parseFloat(params.Q),
            "freq cv +/-": parseFloat(params["freq cv +/-"]),
            "Q cv +/-": parseFloat(params["Q cv +/-"])
          },
          modulatedParams: {
            // offsets for modulation
            freq: 0,
            Q: 0
          },
          output: new Float32Array(128),
          modulationTarget: null,
          // Target node or parameter for modulation
          startTime: null,
          // Optional: Scheduled start time
          stopTime: null
          // Optional: Scheduled stop time           
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = hpf;
        } else {
          this.currentState.nodes[moduleName] = hpf;
        }
        break;
      case "LFO":
      case "SLOWFO":
      case "Oscillator":
        let osc = {
          node: "Oscillator",
          structure: "webAudioNode",
          baseParams: {
            frequency: parseFloat(params.frequency),
            gain: parseFloat(1),
            "freq cv +/-": parseFloat(params["freq cv +/-"]),
            type: params.type
          },
          modulatedParams: {
            // offsets for modulation
            frequency: 0,
            gain: 0
          },
          output: new Float32Array(128),
          phase: 0,
          customWaveform: null,
          type: params.type,
          modulationTarget: null,
          // Target node or parameter for modulation
          startTime: null,
          // Optional: Scheduled start time
          stopTime: null
          // Optional: Scheduled stop time           
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = osc;
        } else {
          this.currentState.nodes[moduleName] = osc;
        }
        break;
      case "Gain":
      case "ModGain":
        let gain = {
          node: "Gain",
          structure: "webAudioNode",
          baseParams: {
            gain: parseFloat(params.gain) || 1
          },
          modulatedParams: {
            gain: 0
            // Offset for modulation
          },
          output: new Float32Array(128)
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = gain;
        } else {
          this.currentState.nodes[moduleName] = gain;
        }
        break;
      case "Mixer":
        console.warn("Mixer DSP code is not yet working. the inputs are not being processed correctly (returning undefined)");
        let mixer = {
          node: "Mixer",
          structure: "webAudioNode",
          baseParams: {
            gainA: parseFloat(params.gainA) || 1,
            gainB: parseFloat(params.gainB) || 1
          },
          modulatedParams: {},
          output: new Float32Array(128)
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = mixer;
        } else {
          this.currentState.nodes[moduleName] = mixer;
        }
        break;
      case "Delay":
      case "Flutter":
        let delay = {
          node: "Delay",
          structure: "webAudioNode",
          baseParams: {
            delayTime: parseFloat(params.delayTime) || 500,
            "time cv +/-": parseFloat(params["time cv +/-"]) || 100,
            feedback: parseFloat(params.feedback) || 0.5,
            "feedback cv +/-": parseFloat(params["feedback cv +/-"]) || 0.3,
            dryWet: parseFloat(params.dryWet) || 0.4,
            "dryWet cv +/-": parseFloat(params["dryWet cv +/-"]) || 0
          },
          connections: {
            feedback: null
            // Will store a Web Audio GainNode for feedback
          },
          modulatedParams: {
            delayTime: 0,
            // Offset for modulation
            feedback: 0,
            dryWet: 0
          },
          output: new Float32Array(128)
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = delay;
        } else {
          this.currentState.nodes[moduleName] = delay;
        }
        break;
      case "feedbackDelayNode":
        let feedbackDelayNode = {
          node: "feedbackDelayNode",
          structure: "webAudioNode",
          output: new Float32Array(128)
          // Fixed output buffer for block size
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = feedbackDelayNode;
        } else {
          this.currentState.nodes[moduleName] = feedbackDelayNode;
        }
        break;
      case "Pulses":
        let pulses = {
          node: "Pulses",
          structure: "webAudioNode",
          baseParams: {
            stepCount: parseFloat(params.stepCount) || 8,
            tempo: parseFloat(params.tempo) || 120,
            "tempo cv +/-": parseFloat(params["tempo cv +/-"]) || 10,
            pulseWidth: parseFloat(params.gateLength) || 0.5
          },
          modulatedParams: {
            tempo: 0,
            pulseWidth: 0
          },
          output: new Float32Array(128),
          // Single output buffer
          stepIndex: 0,
          clockPhase: 0
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = pulses;
        } else {
          this.currentState.nodes[moduleName] = pulses;
        }
        break;
      case "Euclid":
        let euclideanPulses = {
          node: "Euclid",
          structure: "webAudioNode",
          baseParams: {
            numSteps: parseInt(params.numSteps) || 8,
            activeSteps: parseInt(params.activeSteps) || 8,
            tempo: parseFloat(params.tempo) || 120,
            "tempo cv +/-": parseFloat(params["tempo cv +/-"]) || 10,
            ratchet: parseInt(params.ratchet) || 0,
            "ratchet cv +/-": parseFloat(params["ratchet cv +/-"]) || 10
          },
          modulatedParams: {
            tempo: 0,
            ratchet: 0
          },
          output: new Float32Array(128),
          // Single output buffer
          stepIndex: 0,
          clockPhase: 0
        };
        if (loadState) {
          this.nextState.nodes[moduleName] = euclideanPulses;
        } else {
          this.currentState.nodes[moduleName] = euclideanPulses;
        }
        break;
      default:
    }
  }
  async rnboDeviceBuilder(deviceName, rnboDesc, rnboSrc, loadState) {
    let rnboDevice = {
      node: deviceName,
      structure: "rnboDevices",
      rnboDesc,
      // Store RNBO metadata
      // rnboSrc: rnboSrc,   // Store DSP source code
      baseParams: {},
      // Store parameter values
      modulatedParams: {},
      // Offsets for modulation
      output: new Float32Array(128),
      // Single output buffer
      dspInstance: null
      // Will store compiled RNBO DSP function
    };
    rnboDesc.parameters.forEach((param) => {
      rnboDevice.baseParams[param.paramId] = param.initialValue;
      rnboDevice.modulatedParams[param.paramId] = 0;
    });
    if (loadState) {
      this.nextState.nodes[deviceName] = rnboDevice;
    } else {
      this.currentState.nodes[deviceName] = rnboDevice;
    }
  }
  cableBuilder() {
  }
  handleMessage(msg) {
    switch (msg.cmd) {
      case "setOutputVolume":
        this.outputVolume = msg.data;
        break;
      case "clearGraph":
        this.currentState.nodes = {};
        this.currentState.signalConnections = [];
        this.currentState.outputConnections = [];
        this.currentState.cvConnections = [];
        break;
      case "loadVersion":
        const synthGraph = msg.data;
        if (this.crossfadeInProgress) return;
        this.nextState = {
          nodes: {},
          signalConnections: [],
          outputConnections: [],
          cvConnections: []
        };
        Object.keys(synthGraph.modules).forEach((moduleID) => {
          const module = synthGraph.modules[moduleID];
          let moduleParams = null;
          if (module.params) {
            moduleParams = module.params;
          }
          if (moduleID.startsWith("feedbackDelayNode")) {
            this.audioNodeBuilder("feedbackDelayNode", moduleID, null, "loadstate");
          } else if (module.structure === "webAudioNodes") {
            this.audioNodeBuilder(module.type, moduleID, module.params, "loadstate");
          } else if (module.structure === "rnboDevices") {
            this.port.postMessage({ cmd: "fetchRNBOsrc", data: module });
          } else {
            console.warn("node module structure defined for module ", moduleID);
          }
        });
        synthGraph.connections.forEach((cable) => {
          if (cable.target.includes("AudioDestination")) {
            this.nextState.outputConnections.push(cable.source);
          } else if (cable.target.split(".")[1].startsWith("IN")) {
            this.nextState.signalConnections.push(cable);
          } else {
            cable.param = cable.target.split(".")[1];
            this.nextState.cvConnections.push(cable);
          }
        });
        this.crossfadeInProgress = true;
        this.crossfadeProgress = 0;
        break;
      case "setSignalAnalysis":
        this.analyze = msg.data;
        break;
      case "addNode":
        if (msg.structure === "webAudioNodes") {
          this.audioNodeBuilder(msg.data.moduleName);
        } else if (msg.structure === "feedbackDelayNode") {
          this.audioNodeBuilder("feedbackDelayNode", msg.data);
        }
        break;
      case "removeNode":
        delete this.currentState.nodes[msg.data];
        this.currentState.signalConnections = this.currentState.signalConnections.filter(
          (item) => item.source.split(".")[0] !== msg.data && item.target.split(".")[0] !== msg.data
        );
        this.currentState.outputConnections = this.currentState.outputConnections.filter(
          (item) => item !== msg.data
        );
        this.currentState.cvConnections = this.currentState.cvConnections.filter(
          (item) => item.source.split(".")[0] !== msg.data && item.target.split(".")[0] !== msg.data
        );
        break;
      case "addCable":
        if (msg.data.target.includes("AudioDestination")) {
          this.currentState.outputConnections.push(msg.data.source);
        } else if (msg.data.target.split(".")[1].startsWith("IN")) {
          this.currentState.signalConnections.push(msg.data);
        } else {
          msg.data.param = msg.data.target.split(".")[1];
          this.currentState.cvConnections.push(msg.data);
        }
        break;
      case "connectToOutput":
        if (this.currentState.nodes[msg.data.split(".")[0]] && !this.currentState.outputConnections.includes(msg.data)) {
        }
        break;
      case "connectCV":
        this.currentState.cvConnections.push({
          source: msg.data.source,
          target: msg.data.target,
          param: msg.data.param
          // The parameter to modulate
        });
        break;
      case "removeCable":
        if (msg.data.target.includes("AudioDestination")) {
          const index = this.currentState.outputConnections.findIndex(
            (item) => item === msg.data.source
            // item.source === msg.data.source && 
            // item.target === msg.data.target
          );
          if (index !== -1) {
            this.currentState.outputConnections.splice(index, 1);
          }
        } else if (msg.data.target.split(".")[1] === "IN") {
          const index = this.currentState.signalConnections.findIndex(
            (item) => (
              // item === msg.data.source
              item.source === msg.data.source && item.target === msg.data.target
            )
          );
          if (index !== -1) {
            this.currentState.signalConnections.splice(index, 1);
          }
        } else {
          const index = this.currentState.cvConnections.findIndex(
            (item) => (
              // item === msg.data.source
              item.source === msg.data.source && item.target === msg.data.target
            )
          );
          if (index !== -1) {
            let thisCvConnection = this.currentState.cvConnections[index];
            this.currentState.nodes[thisCvConnection.target.split(".")[0]].modulatedParams[thisCvConnection.target.split(".")[1]] = 0;
            this.currentState.cvConnections.splice(index, 1);
          }
        }
        break;
      case "paramChange":
        const targetNode = this.currentState.nodes[msg.data.parent];
        if (targetNode && targetNode.baseParams[msg.data.param] !== void 0) {
          const newValue = parseFloat(msg.data.value);
          if (!isNaN(newValue)) {
            targetNode.baseParams[msg.data.param] = newValue;
          } else {
            targetNode.baseParams[msg.data.param] = msg.data.value;
          }
        } else {
          console.warn(`Parameter ${msg.data.param} not found for node ${msg.data.parent}`);
        }
        break;
      default:
        console.log(`no switch case exists for ${msg.cmd}`);
    }
  }
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  process(inputs, outputs) {
    const output = outputs[0][0];
    output.fill(0);
    if (this.crossfadeInProgress) {
      this.crossfadeProgress += this.crossfadeStep;
      if (this.crossfadeProgress >= 1) {
        this.crossfadeProgress = 1;
        this.crossfadeInProgress = false;
        this.currentState = (0, import_cloneDeep.default)(this.nextState);
        this.nextState = {
          nodes: {},
          signalConnections: [],
          outputConnections: [],
          cvConnections: []
        };
      }
    }
    this.signalBuffersCurrent = this.signalBuffersCurrent || {};
    this.signalBuffersNext = this.signalBuffersNext || {};
    for (const id in this.currentState.nodes) {
      if (!this.signalBuffersCurrent[id]) {
        this.signalBuffersCurrent[id] = new Float32Array(128);
      }
    }
    for (const id in this.nextState.nodes) {
      if (!this.signalBuffersNext[id]) {
        this.signalBuffersNext[id] = new Float32Array(128);
      }
    }
    const processGraph = (state, signalBuffers, feedbackBuffers) => {
      const visited = /* @__PURE__ */ new Set();
      const processNode = (id) => {
        if (visited.has(id)) return;
        visited.add(id);
        const node = state.nodes[id];
        if (!node) return;
        if (!signalBuffers[id]) signalBuffers[id] = new Float32Array(128);
        const inputBuffer = new Float32Array(128);
        state.signalConnections.filter((conn) => conn.target.includes(id)).forEach((conn) => {
          const sourceId = conn.source.split(".")[0];
          const sourceOutput = conn.source.split(".")[1];
          processNode(sourceId);
          if (state.nodes[sourceId] && state.nodes[sourceId].output && typeof state.nodes[sourceId].output === "object") {
            const sourceBuffer2 = state.nodes[sourceId].output[sourceOutput] || new Float32Array(128);
            for (let i = 0; i < 128; i++) {
              inputBuffer[i] += sourceBuffer2[i];
            }
          } else {
            const sourceBuffer2 = signalBuffers[sourceId] || new Float32Array(128);
            for (let i = 0; i < 128; i++) {
              inputBuffer[i] += sourceBuffer2[i];
            }
          }
          const sourceBuffer = signalBuffers[sourceId] || new Float32Array(128);
          for (let i = 0; i < 128; i++) inputBuffer[i] += sourceBuffer[i];
          if (conn.target.startsWith("feedbackDelayNode")) {
            const feedbackNodeId = conn.target.split(".")[0];
            if (!feedbackBuffers[feedbackNodeId]) {
              feedbackBuffers[feedbackNodeId] = new Float32Array(128);
            }
            for (let i = 0; i < 128; i++) {
              feedbackBuffers[feedbackNodeId][i] += sourceBuffer[i];
            }
          }
        });
        state.cvConnections.filter((conn) => conn.target.split(".")[0] === id).forEach((conn) => {
          const modSourceId = conn.source.split(".")[0];
          if (!visited.has(modSourceId)) {
            processNode(modSourceId);
          }
          const modBuffer = signalBuffers[modSourceId] || new Float32Array(128);
          const param = conn.param;
          if (!node.modulatedParams.hasOwnProperty(param)) {
            console.warn(`Parameter ${param} not found for node ${id}`);
            return;
          }
          let modValue = 0;
          for (let i = 0; i < 128; i++) {
            modValue += modBuffer[i];
          }
          modValue /= 128;
          node.modulatedParams[param] = modValue;
        });
        const getEffectiveParam = (node2, param, attenuverter) => {
          const base = node2.baseParams[param] || 0;
          let modulated = node2.modulatedParams[param] || 0;
          if (attenuverter) {
            modulated = modulated * attenuverter;
          }
          const result = base + modulated;
          if (typeof result !== "number" || isNaN(result)) {
            console.warn(`Invalid value for parameter ${param}:`, result);
            return 0;
          }
          return result;
        };
        if (node.node === "Oscillator") {
          const effectiveFrequency = getEffectiveParam(node, "frequency", node.baseParams["freq cv +/-"]);
          const effectiveGain = getEffectiveParam(node, "gain");
          for (let i = 0; i < signalBuffers[id].length; i++) {
            node.phase += effectiveFrequency / sampleRate;
            if (node.phase >= 1) node.phase -= 1;
            switch (node.baseParams["type"]) {
              case "sine":
                signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                break;
              case "square":
                signalBuffers[id][i] = (node.phase < 0.5 ? 1 : -1) * effectiveGain * Math.SQRT1_2;
                break;
              case "sawtooth":
                signalBuffers[id][i] = (2 * node.phase - 1) * effectiveGain;
                break;
              case "triangle":
                signalBuffers[id][i] = (node.phase < 0.5 ? 4 * node.phase - 1 : 3 - 4 * node.phase) * effectiveGain;
                break;
              default:
                signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
            }
          }
        } else if (node.node === "LFO2") {
          const effectiveFrequency = getEffectiveParam(node, "frequency", node.baseParams["freq cv +/-"]);
          const effectiveGain = getEffectiveParam(node, "gain");
          for (let i = 0; i < 128; i++) {
            node.phase += effectiveFrequency / sampleRate;
            if (node.phase >= 1) node.phase -= 1;
            node.output.sine[i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
            node.output.square[i] = (node.phase < 0.5 ? 1 : -1) * effectiveGain;
            node.output.saw[i] = (2 * node.phase - 1) * effectiveGain;
            node.output.tri[i] = (node.phase < 0.5 ? 4 * node.phase - 1 : 3 - 4 * node.phase) * effectiveGain;
          }
        } else if (node.node === "VCA") {
          const effectiveGain = getEffectiveParam(node, "gain", node.baseParams["gain cv +/-"]);
          if (!node.dcBlockState) {
            node.dcBlockState = { prevInput: 0, prevOutput: 0 };
          }
          const cutoffFreq = 5;
          const alpha = 1 - Math.exp(-2 * Math.PI * cutoffFreq / sampleRate);
          for (let i = 0; i < 128; i++) {
            const inputSample = inputBuffer[i] || 0;
            let modulatedGain = (node.modulatedParams["gain"] || 0) * node.baseParams["gain cv +/-"];
            const filteredModulation = alpha * (modulatedGain - node.dcBlockState.prevInput) + node.dcBlockState.prevOutput;
            node.dcBlockState.prevInput = modulatedGain;
            node.dcBlockState.prevOutput = filteredModulation;
            const finalGain = this.clamp(effectiveGain + filteredModulation, 0, 1);
            signalBuffers[id][i] = inputSample * finalGain;
          }
        } else if (node.node === "Gain") {
          for (let i = 0; i < 128; i++) signalBuffers[id][i] = inputBuffer[i] * node.baseParams.gain;
        } else if (node.node === "feedbackDelayNode") {
          if (!node.delayBuffer) {
            node.delayBuffer = new Float32Array(128);
            node.delayIndex = 0;
          }
          for (let i = 0; i < 128; i++) {
            const feedbackInput = feedbackBuffers[id]?.[i] || 0;
            const delayIndex = (node.delayIndex - 1 + 128) % 128;
            const delayedSample = node.delayBuffer[delayIndex] || 0;
            signalBuffers[id][i] = delayedSample;
            node.delayBuffer[node.delayIndex] = feedbackInput;
            node.delayIndex = (node.delayIndex + 1) % 128;
          }
        } else if (node.node === "Delay") {
          let cubicInterpolate = function(buffer, index) {
            const len = buffer.length;
            let intIndex = Math.floor(index);
            let frac = index - intIndex;
            const i0 = (intIndex - 1 + len) % len;
            const i1 = intIndex % len;
            const i2 = (intIndex + 1) % len;
            const i3 = (intIndex + 2) % len;
            const sample0 = buffer[i0];
            const sample1 = buffer[i1];
            const sample2 = buffer[i2];
            const sample3 = buffer[i3];
            const a0 = -0.5 * sample0 + 1.5 * sample1 - 1.5 * sample2 + 0.5 * sample3;
            const a1 = sample0 - 2.5 * sample1 + 2 * sample2 - 0.5 * sample3;
            const a2 = -0.5 * sample0 + 0.5 * sample2;
            const a3 = sample1;
            return ((a0 * frac + a1) * frac + a2) * frac + a3;
          };
          if (!node.delayBuffer) {
            node.delayBuffer = new Float32Array(sampleRate);
            node.delayIndex = 0;
            node.lpfCutoff = node.baseParams.lpfCutoff || 3e3;
            node.lpfPreviousSample = 0;
            node.currentDelayTime = Math.min(
              Math.max(getEffectiveParam(node, "delayTime", node.baseParams["time cv +/-"]), 0),
              999
            );
            node.targetDelayTime = node.currentDelayTime;
            node.crossfadeActive = false;
            node.crossfade = 0;
            node.crossfadeSamples = 128;
            node.crossfadeIncrement = 1 / node.crossfadeSamples;
            node.allpassMem1 = 0;
            node.allpassMem2 = 0;
          }
          const newDelayTimeParam = Math.min(
            Math.max(getEffectiveParam(node, "delayTime", node.baseParams["time cv +/-"]), 0),
            999
          );
          if (newDelayTimeParam !== node.targetDelayTime && !node.crossfadeActive) {
            node.targetDelayTime = newDelayTimeParam;
            node.crossfadeActive = true;
            node.crossfade = 0;
          }
          const RC = 1 / (2 * Math.PI * node.lpfCutoff);
          const alpha = sampleRate / (sampleRate + RC);
          for (let i = 0; i < 128; i++) {
            let delayedSample;
            if (node.crossfadeActive) {
              const delaySamplesOld = node.currentDelayTime / 1e3 * sampleRate;
              const delaySamplesNew = node.targetDelayTime / 1e3 * sampleRate;
              let readIndexOld = node.delayIndex - delaySamplesOld;
              if (readIndexOld < 0) readIndexOld += node.delayBuffer.length;
              let readIndexNew = node.delayIndex - delaySamplesNew;
              if (readIndexNew < 0) readIndexNew += node.delayBuffer.length;
              const delayedOld = cubicInterpolate(node.delayBuffer, readIndexOld);
              const delayedNew = cubicInterpolate(node.delayBuffer, readIndexNew);
              delayedSample = (1 - node.crossfade) * delayedOld + node.crossfade * delayedNew;
              node.crossfade += node.crossfadeIncrement;
              if (node.crossfade >= 1) {
                node.currentDelayTime = node.targetDelayTime;
                node.crossfadeActive = false;
                node.crossfade = 0;
              }
            } else {
              const delaySamples = node.currentDelayTime / 1e3 * sampleRate;
              let readIndex = node.delayIndex - delaySamples;
              if (readIndex < 0) readIndex += node.delayBuffer.length;
              delayedSample = cubicInterpolate(node.delayBuffer, readIndex);
            }
            let filteredFeedback = alpha * delayedSample + (1 - alpha) * node.lpfPreviousSample;
            node.lpfPreviousSample = filteredFeedback;
            const feedbackInput = feedbackBuffers[id]?.[i] || 0;
            const feedbackParam = typeof node.baseParams.feedback === "number" ? node.baseParams.feedback : 0.5;
            const feedbackSample = filteredFeedback * feedbackParam + feedbackInput;
            const inputSample = inputBuffer[i] || 0;
            const wetMix = Math.min(Math.max(getEffectiveParam(node, "dryWet", node.baseParams["dryWet cv +/-"]), 0), 1);
            const dryMix = 1 - Math.min(Math.max(getEffectiveParam(node, "dryWet", node.baseParams["dryWet cv +/-"]), 0), 1);
            const wetSignal = delayedSample + feedbackSample;
            const drySignal = inputSample;
            signalBuffers[id][i] = this.clamp(drySignal * dryMix + wetSignal * wetMix, -1, 1);
            const feedbackAmount = Math.min(
              Math.max(getEffectiveParam(node, "feedback", node.baseParams["feedback cv +/-"]), 0),
              1
            ) || 0.3;
            const feedbackSignal = this.clamp(drySignal + wetSignal * feedbackAmount, -1, 1);
            node.delayBuffer[node.delayIndex] = feedbackSignal;
            node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
          }
        } else if (node.node === "HighPassFilter") {
          if (!node.coefficients) {
            node.coefficients = { a0: 0, a1: 0, a2: 0, b0: 0, b1: 0, b2: 0 };
            node.inputHistory1 = [0, 0];
            node.outputHistory1 = [0, 0];
            node.inputHistory2 = [0, 0];
            node.outputHistory2 = [0, 0];
          }
          const effectiveFreq = this.clamp(
            getEffectiveParam(node, "freq", node.baseParams["freq cv +/-"]),
            80,
            1e4
          );
          const effectiveQ = this.clamp(
            getEffectiveParam(node, "Q", node.baseParams["Q cv +/-"]),
            0.1,
            20
          );
          const omega = 2 * Math.PI * effectiveFreq / sampleRate;
          const alpha = Math.sin(omega) / (2 * effectiveQ);
          let b0, b1, b2, a0, a1, a2;
          b0 = (1 + Math.cos(omega)) / 2;
          b1 = -(1 + Math.cos(omega));
          b2 = (1 + Math.cos(omega)) / 2;
          a0 = 1 + alpha;
          a1 = -2 * Math.cos(omega);
          a2 = 1 - alpha;
          b0 /= a0;
          b1 /= a0;
          b2 /= a0;
          a1 /= a0;
          a2 /= a0;
          node.coefficients = { b0, b1, b2, a1, a2 };
          for (let i = 0; i < 128; i++) {
            const inputSample = inputBuffer[i];
            let filtered1 = node.coefficients.b0 * inputSample + node.coefficients.b1 * node.inputHistory1[0] + node.coefficients.b2 * node.inputHistory1[1] - node.coefficients.a1 * node.outputHistory1[0] - node.coefficients.a2 * node.outputHistory1[1];
            node.inputHistory1[1] = node.inputHistory1[0];
            node.inputHistory1[0] = inputSample;
            node.outputHistory1[1] = node.outputHistory1[0];
            node.outputHistory1[0] = filtered1;
            let filtered2 = node.coefficients.b0 * filtered1 + node.coefficients.b1 * node.inputHistory2[0] + node.coefficients.b2 * node.inputHistory2[1] - node.coefficients.a1 * node.outputHistory2[0] - node.coefficients.a2 * node.outputHistory2[1];
            node.inputHistory2[1] = node.inputHistory2[0];
            node.inputHistory2[0] = filtered1;
            node.outputHistory2[1] = node.outputHistory2[0];
            node.outputHistory2[0] = filtered2;
            signalBuffers[id][i] = filtered2;
          }
        } else if (node.node === "Pulses") {
          const effectiveTempo = getEffectiveParam(node, "tempo", node.baseParams["tempo cv +/-"]);
          const stepDuration = 60 / effectiveTempo * sampleRate;
          const effectivePulseWidth = Math.min(Math.max(getEffectiveParam(node, "pulseWidth"), 0), 0.999);
          const pulseSamples = effectivePulseWidth > 0 ? Math.max(1, Math.round(effectivePulseWidth * stepDuration)) : 0;
          node.clockPhase = node.clockPhase || 0;
          node.stepIndex = node.stepIndex || 0;
          node.pulseCounter = node.pulseCounter || 0;
          for (let i = 0; i < 128; i++) {
            node.clockPhase += 1;
            if (node.clockPhase >= stepDuration) {
              node.clockPhase = 0;
              node.stepIndex = (node.stepIndex + 1) % node.baseParams.stepCount;
              node.pulseCounter = pulseSamples;
            }
            signalBuffers[id][i] = node.pulseCounter > 0 ? 1 : 0;
            if (node.pulseCounter > 0) {
              node.pulseCounter -= 1;
            }
          }
        } else if (node.node === "Euclid") {
          let generateEuclideanPattern = function(pulses, steps) {
            let pattern2 = [];
            let bucket = 0;
            for (let i = 0; i < steps; i++) {
              bucket += pulses;
              if (bucket >= steps) {
                bucket -= steps;
                pattern2.push(1);
              } else {
                pattern2.push(0);
              }
            }
            return pattern2;
          };
          const effectiveTempo = getEffectiveParam(node, "tempo", node.baseParams["tempo cv +/-"]);
          const stepDuration = 60 / effectiveTempo * sampleRate;
          const effectivePulseWidth = Math.min(Math.max(getEffectiveParam(node, "ratchet"), 0), 1);
          const pulseSamples = Math.max(1, Math.round(sampleRate * 5e-4));
          const numStepsParam = Math.max(1, Math.floor(getEffectiveParam(node, "numSteps")));
          const activeStepsParam = Math.max(0, Math.min(numStepsParam, Math.floor(getEffectiveParam(node, "activeSteps"))));
          const pattern = generateEuclideanPattern(activeStepsParam, numStepsParam);
          const effectiveRatchet = Math.max(1, Math.floor(getEffectiveParam(node, "ratchet", node.baseParams["ratchet cv +/-"])));
          let ratchetInterval = stepDuration;
          let ratchetPulseSamples = pulseSamples;
          if (effectiveRatchet > 1) {
            ratchetInterval = stepDuration / effectiveRatchet;
            ratchetPulseSamples = effectivePulseWidth > 0 ? Math.max(1, Math.round(effectivePulseWidth * ratchetInterval)) : pulseSamples;
          }
          node.clockPhase = node.clockPhase || 0;
          node.stepIndex = node.stepIndex || 0;
          node.currentStepActive = pattern[node.stepIndex] === 1;
          for (let i = 0; i < 128; i++) {
            node.clockPhase += 1;
            if (node.clockPhase >= stepDuration) {
              node.clockPhase -= stepDuration;
              node.stepIndex = (node.stepIndex + 1) % numStepsParam;
              node.currentStepActive = pattern[node.stepIndex] === 1;
            }
            let outputVal = 0;
            if (node.currentStepActive) {
              if (effectiveRatchet > 1) {
                const subphase = node.clockPhase % ratchetInterval;
                if (subphase < ratchetPulseSamples) {
                  outputVal = 1;
                }
              } else {
                if (node.clockPhase < pulseSamples) {
                  outputVal = 1;
                }
              }
            }
            signalBuffers[id][i] = outputVal;
          }
        } else if (node.node === "Mixer") {
          const gainA = node.baseParams["gainA"];
          const gainB = node.baseParams["gainB"];
          const sourceA = node.inputA;
          const sourceB = node.inputB;
          const bufferA = signalBuffers[node.inputA] || new Float32Array(128);
          const bufferB = signalBuffers[node.inputB] || new Float32Array(128);
          if (!signalBuffers[id]) {
            signalBuffers[id] = new Float32Array(128);
          }
          for (let i = 0; i < 128; i++) {
            signalBuffers[id][i] = bufferA[i] * gainA + bufferB[i] * gainB;
          }
        }
      };
      state.outputConnections.forEach((id) => processNode(id.split(".")[0]));
    };
    processGraph(this.currentState, this.signalBuffersCurrent, this.feedbackBuffers);
    if (this.nextState.outputConnections) processGraph(this.nextState, this.signalBuffersNext, this.feedbackBuffers);
    for (let i = 0; i < output.length; i++) {
      let currentSample = 0;
      let nextSample = 0;
      if (this.currentState.outputConnections.length > 0) {
        const currentOutputId = this.currentState.outputConnections[0].split(".")[0];
        currentSample = this.signalBuffersCurrent[currentOutputId]?.[i] || 0;
      }
      if (this.nextState.outputConnections.length > 0) {
        const nextOutputId = this.nextState.outputConnections[0].split(".")[0];
        nextSample = this.signalBuffersNext[nextOutputId]?.[i] || 0;
      }
      output[i] = this.crossfadeInProgress ? (1 - this.crossfadeProgress) * currentSample + this.crossfadeProgress * nextSample : currentSample;
      output[i] *= this.outputVolume;
    }
    if (this.analyze === true) {
      let sumSq = 0;
      for (let i = 0; i < output.length; i++) {
        sumSq += output[i] * output[i];
      }
      const rms = Math.sqrt(sumSq / output.length);
      this.analyzerFrameCount = (this.analyzerFrameCount || 0) + 1;
      if (this.analyzerFrameCount % 100 === 0) {
        this.port.postMessage({
          cmd: "analyzerData",
          rms
        });
      }
    }
    return true;
  }
};
registerProcessor("DSP", DSP);
//! maybe this is where feedback patching fails, because we're setting the signalBuffersCurrent to new arrays each time?
