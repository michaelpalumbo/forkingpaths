import {
  __export
} from "./chunk-SNAQBZPT.js";

// node_modules/@automerge/automerge/dist/mjs/constants.js
var STATE = Symbol.for("_am_meta");
var TRACE = Symbol.for("_am_trace");
var OBJECT_ID = Symbol.for("_am_objectId");
var IS_PROXY = Symbol.for("_am_isProxy");
var CLEAR_CACHE = Symbol.for("_am_clearCache");
var UINT = Symbol.for("_am_uint");
var INT = Symbol.for("_am_int");
var F64 = Symbol.for("_am_f64");
var COUNTER = Symbol.for("_am_counter");
var TEXT = Symbol.for("_am_text");

// node_modules/@automerge/automerge/dist/mjs/text.js
var Text = class _Text {
  constructor(text) {
    if (typeof text === "string") {
      this.elems = [...text];
    } else if (Array.isArray(text)) {
      this.elems = text;
    } else if (text === void 0) {
      this.elems = [];
    } else {
      throw new TypeError(`Unsupported initial value for Text: ${text}`);
    }
    Reflect.defineProperty(this, TEXT, { value: true });
  }
  get length() {
    return this.elems.length;
  }
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(index) {
    return this.elems[index];
  }
  /**
   * Iterates over the text elements character by character, including any
   * inline objects.
   */
  [Symbol.iterator]() {
    const elems = this.elems;
    let index = -1;
    return {
      next() {
        index += 1;
        if (index < elems.length) {
          return { done: false, value: elems[index] };
        } else {
          return { done: true };
        }
      }
    };
  }
  /**
   * Returns the content of the Text object as a simple string, ignoring any
   * non-character elements.
   */
  toString() {
    if (!this.str) {
      this.str = "";
      for (const elem of this.elems) {
        if (typeof elem === "string")
          this.str += elem;
        else
          this.str += "￼";
      }
    }
    return this.str;
  }
  /**
   * Returns the content of the Text object as a sequence of strings,
   * interleaved with non-character elements.
   *
   * For example, the value `['a', 'b', {x: 3}, 'c', 'd']` has spans:
   * `=> ['ab', {x: 3}, 'cd']`
   */
  toSpans() {
    if (!this.spans) {
      this.spans = [];
      let chars = "";
      for (const elem of this.elems) {
        if (typeof elem === "string") {
          chars += elem;
        } else {
          if (chars.length > 0) {
            this.spans.push(chars);
            chars = "";
          }
          this.spans.push(elem);
        }
      }
      if (chars.length > 0) {
        this.spans.push(chars);
      }
    }
    return this.spans;
  }
  /**
   * Returns the content of the Text object as a simple string, so that the
   * JSON serialization of an Automerge document represents text nicely.
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Updates the list item at position `index` to a new value `value`.
   */
  set(index, value) {
    if (this[STATE]) {
      throw new RangeError("object cannot be modified outside of a change block");
    }
    this.elems[index] = value;
  }
  /**
   * Inserts new list items `values` starting at position `index`.
   */
  insertAt(index, ...values) {
    if (this[STATE]) {
      throw new RangeError("object cannot be modified outside of a change block");
    }
    if (values.every((v) => typeof v === "string")) {
      this.elems.splice(index, 0, ...values.join(""));
    } else {
      this.elems.splice(index, 0, ...values);
    }
  }
  /**
   * Deletes `numDelete` list items starting at position `index`.
   * if `numDelete` is not given, one item is deleted.
   */
  deleteAt(index, numDelete = 1) {
    if (this[STATE]) {
      throw new RangeError("object cannot be modified outside of a change block");
    }
    this.elems.splice(index, numDelete);
  }
  map(callback) {
    this.elems.map(callback);
  }
  lastIndexOf(searchElement, fromIndex) {
    this.elems.lastIndexOf(searchElement, fromIndex);
  }
  concat(other) {
    return new _Text(this.elems.concat(other.elems));
  }
  every(test) {
    return this.elems.every(test);
  }
  filter(test) {
    return new _Text(this.elems.filter(test));
  }
  find(test) {
    return this.elems.find(test);
  }
  findIndex(test) {
    return this.elems.findIndex(test);
  }
  forEach(f2) {
    this.elems.forEach(f2);
  }
  includes(elem) {
    return this.elems.includes(elem);
  }
  indexOf(elem) {
    return this.elems.indexOf(elem);
  }
  join(sep) {
    return this.elems.join(sep);
  }
  reduce(f2) {
    this.elems.reduce(f2);
  }
  reduceRight(f2) {
    this.elems.reduceRight(f2);
  }
  slice(start, end) {
    return new _Text(this.elems.slice(start, end));
  }
  some(test) {
    return this.elems.some(test);
  }
  toLocaleString() {
    this.toString();
  }
};

// node_modules/@automerge/automerge/dist/mjs/counter.js
var Counter = class {
  constructor(value) {
    this.value = value || 0;
    Reflect.defineProperty(this, COUNTER, { value: true });
  }
  /**
   * A peculiar JavaScript language feature from its early days: if the object
   * `x` has a `valueOf()` method that returns a number, you can use numerical
   * operators on the object `x` directly, such as `x + 1` or `x < 4`.
   * This method is also called when coercing a value to a string by
   * concatenating it with another string, as in `x + ''`.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf
   */
  valueOf() {
    return this.value;
  }
  /**
   * Returns the counter value as a decimal string. If `x` is a counter object,
   * this method is called e.g. when you do `['value: ', x].join('')` or when
   * you use string interpolation: `value: ${x}`.
   */
  toString() {
    return this.valueOf().toString();
  }
  /**
   * Returns the counter value, so that a JSON serialization of an Automerge
   * document represents the counter simply as an integer.
   */
  toJSON() {
    return this.value;
  }
  /**
   * Increases the value of the counter by `delta`. If `delta` is not given,
   * increases the value of the counter by 1.
   *
   * Will throw an error if used outside of a change callback.
   */
  increment(_delta) {
    throw new Error("Counters should not be incremented outside of a change callback");
  }
  /**
   * Decreases the value of the counter by `delta`. If `delta` is not given,
   * decreases the value of the counter by 1.
   *
   * Will throw an error if used outside of a change callback.
   */
  decrement(_delta) {
    throw new Error("Counters should not be decremented outside of a change callback");
  }
};
var WriteableCounter = class extends Counter {
  constructor(value, context, path, objectId, key) {
    super(value);
    this.context = context;
    this.path = path;
    this.objectId = objectId;
    this.key = key;
  }
  /**
   * Increases the value of the counter by `delta`. If `delta` is not given,
   * increases the value of the counter by 1.
   */
  increment(delta) {
    delta = typeof delta === "number" ? delta : 1;
    this.context.increment(this.objectId, this.key, delta);
    this.value += delta;
    return this.value;
  }
  /**
   * Decreases the value of the counter by `delta`. If `delta` is not given,
   * decreases the value of the counter by 1.
   */
  decrement(delta) {
    return this.increment(typeof delta === "number" ? -delta : -1);
  }
};
function getWriteableCounter(value, context, path, objectId, key) {
  return new WriteableCounter(value, context, path, objectId, key);
}

// node_modules/@automerge/automerge/dist/mjs/numbers.js
var Int = class {
  constructor(value) {
    if (!(Number.isInteger(value) && value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER)) {
      throw new RangeError(`Value ${value} cannot be a uint`);
    }
    this.value = value;
    Reflect.defineProperty(this, INT, { value: true });
    Object.freeze(this);
  }
};
var Uint = class {
  constructor(value) {
    if (!(Number.isInteger(value) && value <= Number.MAX_SAFE_INTEGER && value >= 0)) {
      throw new RangeError(`Value ${value} cannot be a uint`);
    }
    this.value = value;
    Reflect.defineProperty(this, UINT, { value: true });
    Object.freeze(this);
  }
};
var Float64 = class {
  constructor(value) {
    if (typeof value !== "number") {
      throw new RangeError(`Value ${value} cannot be a float64`);
    }
    this.value = value || 0;
    Reflect.defineProperty(this, F64, { value: true });
    Object.freeze(this);
  }
};

// node_modules/@automerge/automerge/dist/mjs/raw_string.js
var RawString = class {
  constructor(val) {
    this.val = val;
  }
  /**
   * Returns the content of the RawString object as a simple string
   */
  toString() {
    return this.val;
  }
  toJSON() {
    return this.val;
  }
};

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// node_modules/uuid/dist/esm-browser/validate.js
function validate(uuid2) {
  return typeof uuid2 === "string" && regex_default.test(uuid2);
}
var validate_default = validate;

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr, offset = 0) {
  const uuid2 = unsafeStringify(arr, offset);
  if (!validate_default(uuid2)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid2;
}
var stringify_default = stringify;

// node_modules/uuid/dist/esm-browser/parse.js
function parse(uuid2) {
  if (!validate_default(uuid2)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid2.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid2.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid2.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid2.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid2.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default = parse;

// node_modules/uuid/dist/esm-browser/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
var URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
function v35(name, version, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}

// node_modules/uuid/dist/esm-browser/md5.js
function md5(bytes) {
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = new Uint8Array(msg.length);
    for (let i = 0; i < msg.length; ++i) {
      bytes[i] = msg.charCodeAt(i);
    }
  }
  return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
}
function md5ToHexEncodedArray(input) {
  const output = [];
  const length32 = input.length * 32;
  const hexTab = "0123456789abcdef";
  for (let i = 0; i < length32; i += 8) {
    const x = input[i >> 5] >>> i % 32 & 255;
    const hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
    output.push(hex);
  }
  return output;
}
function getOutputLength(inputLength8) {
  return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
}
function wordsToMd5(x, len) {
  x[len >> 5] |= 128 << len % 32;
  x[getOutputLength(len) - 1] = len;
  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;
    a = md5ff(a, b, c, d, x[i], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, x[i], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}
function bytesToWords(input) {
  if (input.length === 0) {
    return [];
  }
  const length8 = input.length * 8;
  const output = new Uint32Array(getOutputLength(length8));
  for (let i = 0; i < length8; i += 8) {
    output[i >> 5] |= (input[i / 8] & 255) << i % 32;
  }
  return output;
}
function safeAdd(x, y) {
  const lsw = (x & 65535) + (y & 65535);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return msw << 16 | lsw & 65535;
}
function bitRotateLeft(num, cnt) {
  return num << cnt | num >>> 32 - cnt;
}
function md5cmn(q, a, b, x, s, t) {
  return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}
function md5ff(a, b, c, d, x, s, t) {
  return md5cmn(b & c | ~b & d, a, b, x, s, t);
}
function md5gg(a, b, c, d, x, s, t) {
  return md5cmn(b & d | c & ~d, a, b, x, s, t);
}
function md5hh(a, b, c, d, x, s, t) {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a, b, c, d, x, s, t) {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}
var md5_default = md5;

// node_modules/uuid/dist/esm-browser/v3.js
var v3 = v35("v3", 48, md5_default);

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/uuid/dist/esm-browser/sha1.js
function f(s, x, y, z) {
  switch (s) {
    case 0:
      return x & y ^ ~x & z;
    case 1:
      return x ^ y ^ z;
    case 2:
      return x & y ^ x & z ^ y & z;
    case 3:
      return x ^ y ^ z;
  }
}
function ROTL(x, n) {
  return x << n | x >>> 32 - n;
}
function sha1(bytes) {
  const K = [1518500249, 1859775393, 2400959708, 3395469782];
  const H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
  if (typeof bytes === "string") {
    const msg = unescape(encodeURIComponent(bytes));
    bytes = [];
    for (let i = 0; i < msg.length; ++i) {
      bytes.push(msg.charCodeAt(i));
    }
  } else if (!Array.isArray(bytes)) {
    bytes = Array.prototype.slice.call(bytes);
  }
  bytes.push(128);
  const l = bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = new Array(N);
  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
    }
    M[i] = arr;
  }
  M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }
    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
    }
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
      e = d;
      d = c;
      c = ROTL(b, 30) >>> 0;
      b = a;
      a = T;
    }
    H[0] = H[0] + a >>> 0;
    H[1] = H[1] + b >>> 0;
    H[2] = H[2] + c >>> 0;
    H[3] = H[3] + d >>> 0;
    H[4] = H[4] + e >>> 0;
  }
  return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
}
var sha1_default = sha1;

// node_modules/uuid/dist/esm-browser/v5.js
var v5 = v35("v5", 80, sha1_default);

// node_modules/@automerge/automerge/dist/mjs/uuid.js
function defaultFactory() {
  return v4_default().replace(/-/g, "");
}
var factory = defaultFactory;
var uuid = () => {
  return factory();
};
uuid.setFactory = (newFactory) => {
  factory = newFactory;
};
uuid.reset = () => {
  factory = defaultFactory;
};

// node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/web/automerge_wasm.js
var automerge_wasm_exports = {};
__export(automerge_wasm_exports, {
  Automerge: () => Automerge,
  SyncState: () => SyncState,
  TextRepresentation: () => TextRepresentation,
  create: () => create,
  decodeChange: () => decodeChange,
  decodeSyncMessage: () => decodeSyncMessage,
  decodeSyncState: () => decodeSyncState,
  default: () => automerge_wasm_default,
  encodeChange: () => encodeChange,
  encodeSyncMessage: () => encodeSyncMessage,
  encodeSyncState: () => encodeSyncState,
  exportSyncState: () => exportSyncState,
  importSyncState: () => importSyncState,
  initSync: () => initSync,
  initSyncState: () => initSyncState,
  load: () => load
});
var wasm;
var heap = new Array(128).fill(void 0);
heap.push(void 0, null, true, false);
function getObject(idx) {
  return heap[idx];
}
var heap_next = heap.length;
function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var WASM_VECTOR_LEN = 0;
var cachedUint8Memory0 = null;
function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: () => {
  throw Error("TextEncoder not available");
} };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view2) {
  return cachedTextEncoder.encodeInto(arg, view2);
} : function(arg, view2) {
  const buf = cachedTextEncoder.encode(arg);
  view2.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8Memory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view2 = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view2);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
var cachedInt32Memory0 = null;
function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: () => {
  throw Error("TextDecoder not available");
} };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
var cachedFloat64Memory0 = null;
function getFloat64Memory0() {
  if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
    cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64Memory0;
}
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}
function create(options) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.create(retptr, addHeapObject(options));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Automerge.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function load(data, options) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.load(retptr, addHeapObject(data), addHeapObject(options));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Automerge.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function encodeChange(change2) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.encodeChange(retptr, addHeapObject(change2));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function decodeChange(change2) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.decodeChange(retptr, addHeapObject(change2));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function initSyncState() {
  const ret = wasm.initSyncState();
  return SyncState.__wrap(ret);
}
function importSyncState(state) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.importSyncState(retptr, addHeapObject(state));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return SyncState.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function exportSyncState(state) {
  _assertClass(state, SyncState);
  const ret = wasm.exportSyncState(state.__wbg_ptr);
  return takeObject(ret);
}
function encodeSyncMessage(message) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.encodeSyncMessage(retptr, addHeapObject(message));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function decodeSyncMessage(msg) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.decodeSyncMessage(retptr, addHeapObject(msg));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function encodeSyncState(state) {
  _assertClass(state, SyncState);
  const ret = wasm.encodeSyncState(state.__wbg_ptr);
  return takeObject(ret);
}
function decodeSyncState(data) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.decodeSyncState(retptr, addHeapObject(data));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return SyncState.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function handleError(f2, args) {
  try {
    return f2.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
var TextRepresentation = Object.freeze({
  /**
  * As an array of characters and objects
  */
  Array: 0,
  "0": "Array",
  /**
  * As a single JS string
  */
  String: 1,
  "1": "String"
});
var AutomergeFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_automerge_free(ptr >>> 0));
var Automerge = class _Automerge {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_Automerge.prototype);
    obj.__wbg_ptr = ptr;
    AutomergeFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AutomergeFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_automerge_free(ptr);
  }
  /**
  * @param {string | undefined} actor
  * @param {TextRepresentation} text_rep
  * @returns {Automerge}
  */
  static new(actor, text_rep) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(actor) ? 0 : passStringToWasm0(actor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.automerge_new(retptr, ptr0, len0, text_rep);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return _Automerge.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {string | undefined} [actor]
  * @returns {Automerge}
  */
  clone(actor) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(actor) ? 0 : passStringToWasm0(actor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.automerge_clone(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return _Automerge.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {string | undefined} actor
  * @param {any} heads
  * @returns {Automerge}
  */
  fork(actor, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(actor) ? 0 : passStringToWasm0(actor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.automerge_fork(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return _Automerge.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {any}
  */
  pendingOps() {
    const ret = wasm.automerge_pendingOps(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @param {string | undefined} [message]
  * @param {number | undefined} [time]
  * @returns {any}
  */
  commit(message, time) {
    var ptr0 = isLikeNone(message) ? 0 : passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.automerge_commit(this.__wbg_ptr, ptr0, len0, !isLikeNone(time), isLikeNone(time) ? 0 : time);
    return takeObject(ret);
  }
  /**
  * @param {Automerge} other
  * @returns {Array<any>}
  */
  merge(other) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(other, _Automerge);
      wasm.automerge_merge(retptr, this.__wbg_ptr, other.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {number}
  */
  rollback() {
    const ret = wasm.automerge_rollback(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {Array<any>}
  */
  keys(obj, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_keys(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {string}
  */
  text(obj, heads) {
    let deferred2_0;
    let deferred2_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_text(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {Array<any>}
  */
  spans(obj, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_spans(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} start
  * @param {number} delete_count
  * @param {any} text
  */
  splice(obj, start, delete_count, text) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_splice(retptr, this.__wbg_ptr, addHeapObject(obj), start, delete_count, addHeapObject(text));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} new_text
  */
  updateText(obj, new_text) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_updateText(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(new_text));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} args
  */
  updateSpans(obj, args) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_updateSpans(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(args));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} value
  * @param {any} datatype
  */
  push(obj, value, datatype) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_push(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(value), addHeapObject(datatype));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} value
  * @returns {string | undefined}
  */
  pushObject(obj, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_pushObject(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} index
  * @param {any} value
  * @param {any} datatype
  */
  insert(obj, index, value, datatype) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_insert(retptr, this.__wbg_ptr, addHeapObject(obj), index, addHeapObject(value), addHeapObject(datatype));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} index
  * @param {any} args
  */
  splitBlock(obj, index, args) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_splitBlock(retptr, this.__wbg_ptr, addHeapObject(obj), index, addHeapObject(args));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} text
  * @param {number} index
  */
  joinBlock(text, index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_joinBlock(retptr, this.__wbg_ptr, addHeapObject(text), index);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} text
  * @param {number} index
  * @param {any} args
  */
  updateBlock(text, index, args) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_updateBlock(retptr, this.__wbg_ptr, addHeapObject(text), index, addHeapObject(args));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} text
  * @param {number} index
  * @param {Array<any> | undefined} [heads]
  * @returns {any}
  */
  getBlock(text, index, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getBlock(retptr, this.__wbg_ptr, addHeapObject(text), index, isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} index
  * @param {any} value
  * @returns {string | undefined}
  */
  insertObject(obj, index, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_insertObject(retptr, this.__wbg_ptr, addHeapObject(obj), index, addHeapObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  * @param {any} value
  * @param {any} datatype
  */
  put(obj, prop, value, datatype) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_put(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop), addHeapObject(value), addHeapObject(datatype));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  * @param {any} value
  * @returns {any}
  */
  putObject(obj, prop, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_putObject(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop), addHeapObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  * @param {any} value
  */
  increment(obj, prop, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_increment(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop), addHeapObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  * @param {Array<any> | undefined} [heads]
  * @returns {any}
  */
  get(obj, prop, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_get(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  * @param {Array<any> | undefined} [heads]
  * @returns {any}
  */
  getWithType(obj, prop, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getWithType(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {object}
  */
  objInfo(obj, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_objInfo(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} arg
  * @param {Array<any> | undefined} [heads]
  * @returns {Array<any>}
  */
  getAll(obj, arg, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getAll(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(arg), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} enable
  * @returns {any}
  */
  enableFreeze(enable) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_enableFreeze(retptr, this.__wbg_ptr, addHeapObject(enable));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} datatype
  * @param {any} export_function
  * @param {any} import_function
  */
  registerDatatype(datatype, export_function, import_function) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_registerDatatype(retptr, this.__wbg_ptr, addHeapObject(datatype), addHeapObject(export_function), addHeapObject(import_function));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} object
  * @param {any} meta
  * @returns {any}
  */
  applyPatches(object, meta) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_applyPatches(retptr, this.__wbg_ptr, addHeapObject(object), addHeapObject(meta));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} object
  * @param {any} meta
  * @returns {any}
  */
  applyAndReturnPatches(object, meta) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_applyAndReturnPatches(retptr, this.__wbg_ptr, addHeapObject(object), addHeapObject(meta));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {Array<any>}
  */
  diffIncremental() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_diffIncremental(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  */
  updateDiffCursor() {
    wasm.automerge_updateDiffCursor(this.__wbg_ptr);
  }
  /**
  */
  resetDiffCursor() {
    wasm.automerge_resetDiffCursor(this.__wbg_ptr);
  }
  /**
  * @param {Array<any>} before
  * @param {Array<any>} after
  * @returns {Array<any>}
  */
  diff(before, after) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_diff(retptr, this.__wbg_ptr, addHeapObject(before), addHeapObject(after));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {Array<any>} heads
  */
  isolate(heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_isolate(retptr, this.__wbg_ptr, addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  */
  integrate() {
    wasm.automerge_integrate(this.__wbg_ptr);
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {number}
  */
  length(obj, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_length(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getFloat64Memory0()[retptr / 8 + 0];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      return r0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} prop
  */
  delete(obj, prop) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_delete(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(prop));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {Uint8Array}
  */
  save() {
    const ret = wasm.automerge_save(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {Uint8Array}
  */
  saveIncremental() {
    const ret = wasm.automerge_saveIncremental(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @param {Array<any>} heads
  * @returns {Uint8Array}
  */
  saveSince(heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_saveSince(retptr, this.__wbg_ptr, addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {Uint8Array}
  */
  saveNoCompress() {
    const ret = wasm.automerge_saveNoCompress(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {Uint8Array}
  */
  saveAndVerify() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_saveAndVerify(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {Uint8Array} data
  * @returns {number}
  */
  loadIncremental(data) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_loadIncremental(retptr, this.__wbg_ptr, addHeapObject(data));
      var r0 = getFloat64Memory0()[retptr / 8 + 0];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      return r0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} changes
  */
  applyChanges(changes) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_applyChanges(retptr, this.__wbg_ptr, addHeapObject(changes));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} have_deps
  * @returns {Array<any>}
  */
  getChanges(have_deps) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getChanges(retptr, this.__wbg_ptr, addHeapObject(have_deps));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} hash
  * @returns {any}
  */
  getChangeByHash(hash) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getChangeByHash(retptr, this.__wbg_ptr, addHeapObject(hash));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} hash
  * @returns {any}
  */
  getDecodedChangeByHash(hash) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getDecodedChangeByHash(retptr, this.__wbg_ptr, addHeapObject(hash));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {Automerge} other
  * @returns {Array<any>}
  */
  getChangesAdded(other) {
    _assertClass(other, _Automerge);
    const ret = wasm.automerge_getChangesAdded(this.__wbg_ptr, other.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {Array<any>}
  */
  getHeads() {
    const ret = wasm.automerge_getHeads(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {string}
  */
  getActorId() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getActorId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
  * @returns {any}
  */
  getLastLocalChange() {
    const ret = wasm.automerge_getLastLocalChange(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  */
  dump() {
    wasm.automerge_dump(this.__wbg_ptr);
  }
  /**
  * @param {Array<any> | undefined} [heads]
  * @returns {Array<any>}
  */
  getMissingDeps(heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getMissingDeps(retptr, this.__wbg_ptr, isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {SyncState} state
  * @param {Uint8Array} message
  */
  receiveSyncMessage(state, message) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(state, SyncState);
      wasm.automerge_receiveSyncMessage(retptr, this.__wbg_ptr, state.__wbg_ptr, addHeapObject(message));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {SyncState} state
  * @returns {any}
  */
  generateSyncMessage(state) {
    _assertClass(state, SyncState);
    const ret = wasm.automerge_generateSyncMessage(this.__wbg_ptr, state.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @param {any} meta
  * @returns {any}
  */
  toJS(meta) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_toJS(retptr, this.__wbg_ptr, addHeapObject(meta));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} heads
  * @param {any} meta
  * @returns {any}
  */
  materialize(obj, heads, meta) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_materialize(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads), addHeapObject(meta));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} index
  * @param {Array<any> | undefined} [heads]
  * @returns {string}
  */
  getCursor(obj, index, heads) {
    let deferred2_0;
    let deferred2_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getCursor(retptr, this.__wbg_ptr, addHeapObject(obj), index, isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
  * @param {any} obj
  * @param {any} cursor
  * @param {Array<any> | undefined} [heads]
  * @returns {number}
  */
  getCursorPosition(obj, cursor, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getCursorPosition(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(cursor), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getFloat64Memory0()[retptr / 8 + 0];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      if (r3) {
        throw takeObject(r2);
      }
      return r0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {string | undefined} [message]
  * @param {number | undefined} [time]
  * @returns {any}
  */
  emptyChange(message, time) {
    var ptr0 = isLikeNone(message) ? 0 : passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.automerge_emptyChange(this.__wbg_ptr, ptr0, len0, !isLikeNone(time), isLikeNone(time) ? 0 : time);
    return takeObject(ret);
  }
  /**
  * @param {any} obj
  * @param {any} range
  * @param {any} name
  * @param {any} value
  * @param {any} datatype
  */
  mark(obj, range, name, value, datatype) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_mark(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(range), addHeapObject(name), addHeapObject(value), addHeapObject(datatype));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {any} range
  * @param {any} name
  */
  unmark(obj, range, name) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_unmark(retptr, this.__wbg_ptr, addHeapObject(obj), addHeapObject(range), addHeapObject(name));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {Array<any> | undefined} [heads]
  * @returns {any}
  */
  marks(obj, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_marks(retptr, this.__wbg_ptr, addHeapObject(obj), isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} obj
  * @param {number} index
  * @param {Array<any> | undefined} [heads]
  * @returns {object}
  */
  marksAt(obj, index, heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_marksAt(retptr, this.__wbg_ptr, addHeapObject(obj), index, isLikeNone(heads) ? 0 : addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {SyncState} state
  * @returns {any}
  */
  hasOurChanges(state) {
    _assertClass(state, SyncState);
    const ret = wasm.automerge_hasOurChanges(this.__wbg_ptr, state.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {any}
  */
  topoHistoryTraversal() {
    const ret = wasm.automerge_topoHistoryTraversal(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {any}
  */
  stats() {
    const ret = wasm.automerge_stats(this.__wbg_ptr);
    return takeObject(ret);
  }
};
var SyncStateFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_syncstate_free(ptr >>> 0));
var SyncState = class _SyncState {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_SyncState.prototype);
    obj.__wbg_ptr = ptr;
    SyncStateFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SyncStateFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_syncstate_free(ptr);
  }
  /**
  * @returns {any}
  */
  get sharedHeads() {
    const ret = wasm.syncstate_sharedHeads(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @returns {any}
  */
  get lastSentHeads() {
    const ret = wasm.syncstate_lastSentHeads(this.__wbg_ptr);
    return takeObject(ret);
  }
  /**
  * @param {any} heads
  */
  set lastSentHeads(heads) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.syncstate_set_lastSentHeads(retptr, this.__wbg_ptr, addHeapObject(heads));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {any} hashes
  */
  set sentHashes(hashes) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.syncstate_set_sentHashes(retptr, this.__wbg_ptr, addHeapObject(hashes));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @returns {SyncState}
  */
  clone() {
    const ret = wasm.syncstate_clone(this.__wbg_ptr);
    return _SyncState.__wrap(ret);
  }
};
async function __wbg_load(module2, imports) {
  if (typeof Response === "function" && module2 instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module2, imports);
      } catch (e) {
        if (module2.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module2.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module2, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module: module2 };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : void 0;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "number" ? obj : void 0;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
  };
  imports.wbg.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === void 0;
    return ret;
  };
  imports.wbg.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    const ret = typeof v === "boolean" ? v ? 1 : 0 : 2;
    return ret;
  };
  imports.wbg.__wbindgen_is_null = function(arg0) {
    const ret = getObject(arg0) === null;
    return ret;
  };
  imports.wbg.__wbindgen_is_string = function(arg0) {
    const ret = typeof getObject(arg0) === "string";
    return ret;
  };
  imports.wbg.__wbindgen_is_function = function(arg0) {
    const ret = typeof getObject(arg0) === "function";
    return ret;
  };
  imports.wbg.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof val === "object" && val !== null;
    return ret;
  };
  imports.wbg.__wbindgen_is_array = function(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
  };
  imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === void 0 ? null : obj);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
    const ret = new Error();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };
  imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
  };
  imports.wbg.__wbg_String_91fba7ded13ba54c = function(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_bigint_from_i64 = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
  };
  imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() {
    return handleError(function(arg0, arg1) {
      getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() {
    return handleError(function(arg0, arg1) {
      getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_crypto_1d1f22824a6a080c = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_process_4a72847cc503995b = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_versions_f686565e586dd935 = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_require_cca90b1a94a0255b = function() {
    return handleError(function() {
      const ret = module.require;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_log_5bb5f88f245d7762 = function(arg0) {
    console.log(getObject(arg0));
  };
  imports.wbg.__wbg_log_1746d5c75ec89963 = function(arg0, arg1) {
    console.log(getObject(arg0), getObject(arg1));
  };
  imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_length_cd7af8117672b8b8 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() {
    const ret = new Array();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_40fc327bfc8770e6 = function(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_196c84450b364254 = function() {
    return handleError(function(arg0) {
      const ret = getObject(arg0).next();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_done_298b57d23c0fc80c = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
  };
  imports.wbg.__wbg_value_d93c65011f51a456 = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_get_e3c254076557e348 = function() {
    return handleError(function(arg0, arg1) {
      const ret = Reflect.get(getObject(arg0), getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_call_27c0f87801dedf93 = function() {
    return handleError(function(arg0, arg1) {
      const ret = getObject(arg0).call(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_72fb9a18b5ae2624 = function() {
    const ret = new Object();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_length_dee433d4c85c9387 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_set_d4638f722068f043 = function(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
  };
  imports.wbg.__wbg_from_89e3fc3ba5e6fb48 = function(arg0) {
    const ret = Array.from(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
  };
  imports.wbg.__wbg_push_a5b05aedc7234f9f = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbg_unshift_e22df4b34bcf5070 = function(arg0, arg1) {
    const ret = getObject(arg0).unshift(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof ArrayBuffer;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_new_28c511d9baebfa89 = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Date_f65cf97fb83fc369 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Date;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_getTime_2bc4375165f02d15 = function(arg0) {
    const ret = getObject(arg0).getTime();
    return ret;
  };
  imports.wbg.__wbg_new_cf3ec55744a78578 = function(arg0) {
    const ret = new Date(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_instanceof_Object_71ca3c0a59266746 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Object;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_assign_496d2d14fecafbcf = function(arg0, arg1) {
    const ret = Object.assign(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_defineProperty_cc00e2de8a0f5141 = function(arg0, arg1, arg2) {
    const ret = Object.defineProperty(getObject(arg0), getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_entries_95cc2c823b285a09 = function(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_freeze_cc6bc19f75299986 = function(arg0) {
    const ret = Object.freeze(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_keys_91e412b4b222659f = function(arg0) {
    const ret = Object.keys(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_values_9c75e6e2bfbdb70d = function(arg0) {
    const ret = Object.values(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_dd6a5dd7b538af21 = function(arg0, arg1) {
    const ret = new RangeError(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_apply_0a5aa603881e6d79 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_deleteProperty_13e721a56f19e842 = function() {
    return handleError(function(arg0, arg1) {
      const ret = Reflect.deleteProperty(getObject(arg0), getObject(arg1));
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_ownKeys_658942b7f28d1fe9 = function() {
    return handleError(function(arg0) {
      const ret = Reflect.ownKeys(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_set_1f9b04f170055d33 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_concat_3de229fe4fe90fea = function(arg0, arg1) {
    const ret = getObject(arg0).concat(getObject(arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_slice_52fb626ffdc8da8f = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_for_27c67e2dbdce22f6 = function(arg0, arg1) {
    const ret = Symbol.for(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_toString_7df3c77999517c20 = function(arg0) {
    const ret = getObject(arg0).toString();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function() {
    return handleError(function() {
      const ret = self.self;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_window_c6fb939a7f436783 = function() {
    return handleError(function() {
      const ret = window.window;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function() {
    return handleError(function() {
      const ret = globalThis.globalThis;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_global_207b558942527489 = function() {
    return handleError(function() {
      const ret = global.global;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };
  imports.wbg.__wbg_length_c20a40f15020d68a = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
  };
  return imports;
}
function __wbg_init_memory(imports, maybe_memory) {
}
function __wbg_finalize_init(instance, module2) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module2;
  cachedFloat64Memory0 = null;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
}
function initSync(module2) {
  if (wasm !== void 0) return wasm;
  const imports = __wbg_get_imports();
  __wbg_init_memory(imports);
  if (!(module2 instanceof WebAssembly.Module)) {
    module2 = new WebAssembly.Module(module2);
  }
  const instance = new WebAssembly.Instance(module2, imports);
  return __wbg_finalize_init(instance, module2);
}
async function __wbg_init(input) {
  if (wasm !== void 0) return wasm;
  if (typeof input === "undefined") {
    input = new URL("automerge_wasm_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module: module2 } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module2);
}
var automerge_wasm_default = __wbg_init;

// node_modules/@automerge/automerge/dist/mjs/low_level.js
var _initialized = false;
var _initializeListeners = [];
function UseApi(api) {
  for (const k in api) {
    ;
    ApiHandler[k] = api[k];
  }
  _initialized = true;
  for (const listener of _initializeListeners) {
    listener();
  }
}
var ApiHandler = {
  create(options) {
    throw new RangeError("Automerge.use() not called");
  },
  load(data, options) {
    throw new RangeError("Automerge.use() not called (load)");
  },
  encodeChange(change2) {
    throw new RangeError("Automerge.use() not called (encodeChange)");
  },
  decodeChange(change2) {
    throw new RangeError("Automerge.use() not called (decodeChange)");
  },
  initSyncState() {
    throw new RangeError("Automerge.use() not called (initSyncState)");
  },
  encodeSyncMessage(message) {
    throw new RangeError("Automerge.use() not called (encodeSyncMessage)");
  },
  decodeSyncMessage(msg) {
    throw new RangeError("Automerge.use() not called (decodeSyncMessage)");
  },
  encodeSyncState(state) {
    throw new RangeError("Automerge.use() not called (encodeSyncState)");
  },
  decodeSyncState(data) {
    throw new RangeError("Automerge.use() not called (decodeSyncState)");
  },
  exportSyncState(state) {
    throw new RangeError("Automerge.use() not called (exportSyncState)");
  },
  importSyncState(state) {
    throw new RangeError("Automerge.use() not called (importSyncState)");
  }
};
function initializeWasm(wasmBlob) {
  return automerge_wasm_default(wasmBlob).then((_) => {
    UseApi(automerge_wasm_exports);
  });
}
function initializeBase64Wasm(wasmBase64) {
  return initializeWasm(Uint8Array.from(atob(wasmBase64), (c) => c.charCodeAt(0)));
}
function wasmInitialized() {
  if (_initialized)
    return Promise.resolve();
  return new Promise((resolve) => {
    _initializeListeners.push(resolve);
  });
}
function isWasmInitialized() {
  return _initialized;
}

// node_modules/@automerge/automerge/dist/mjs/proxies.js
function parseListIndex(key) {
  if (typeof key === "string" && /^[0-9]+$/.test(key))
    key = parseInt(key, 10);
  if (typeof key !== "number") {
    return key;
  }
  if (key < 0 || isNaN(key) || key === Infinity || key === -Infinity) {
    throw new RangeError("A list index must be positive, but you passed " + key);
  }
  return key;
}
function valueAt(target, prop) {
  const { context, objectId, path, textV2 } = target;
  const value = context.getWithType(objectId, prop);
  if (value === null) {
    return;
  }
  const datatype = value[0];
  const val = value[1];
  switch (datatype) {
    case void 0:
      return;
    case "map":
      return mapProxy(context, val, textV2, [...path, prop]);
    case "list":
      return listProxy(context, val, textV2, [...path, prop]);
    case "text":
      if (textV2) {
        return context.text(val);
      } else {
        return textProxy(context, val, [
          ...path,
          prop
        ]);
      }
    case "str":
      return val;
    case "uint":
      return val;
    case "int":
      return val;
    case "f64":
      return val;
    case "boolean":
      return val;
    case "null":
      return null;
    case "bytes":
      return val;
    case "timestamp":
      return val;
    case "counter": {
      const counter = getWriteableCounter(val, context, path, objectId, prop);
      return counter;
    }
    default:
      throw RangeError(`datatype ${datatype} unimplemented`);
  }
}
function import_value(value, textV2, path, context) {
  const type = typeof value;
  switch (type) {
    case "object":
      if (value == null) {
        return [null, "null"];
      } else if (value[UINT]) {
        return [value.value, "uint"];
      } else if (value[INT]) {
        return [value.value, "int"];
      } else if (value[F64]) {
        return [value.value, "f64"];
      } else if (value[COUNTER]) {
        return [value.value, "counter"];
      } else if (value instanceof Date) {
        return [value.getTime(), "timestamp"];
      } else if (value instanceof RawString) {
        return [value.toString(), "str"];
      } else if (value instanceof Text) {
        return [value, "text"];
      } else if (value instanceof Uint8Array) {
        return [value, "bytes"];
      } else if (value instanceof Array) {
        return [value, "list"];
      } else if (Object.prototype.toString.call(value) === "[object Object]") {
        return [value, "map"];
      } else if (isSameDocument(value, context)) {
        throw new RangeError("Cannot create a reference to an existing document object");
      } else {
        throw new RangeError(`Cannot assign unknown object: ${value}`);
      }
    case "boolean":
      return [value, "boolean"];
    case "number":
      if (Number.isInteger(value)) {
        return [value, "int"];
      } else {
        return [value, "f64"];
      }
    case "string":
      if (textV2) {
        return [value, "text"];
      } else {
        return [value, "str"];
      }
    case "undefined":
      throw new RangeError([
        `Cannot assign undefined value at ${printPath(path)}, `,
        "because `undefined` is not a valid JSON data type. ",
        "You might consider setting the property's value to `null`, ",
        "or using `delete` to remove it altogether."
      ].join(""));
    default:
      throw new RangeError([
        `Cannot assign ${type} value at ${printPath(path)}. `,
        `All JSON primitive datatypes (object, array, string, number, boolean, null) `,
        `are supported in an Automerge document; ${type} values are not. `
      ].join(""));
  }
}
function isSameDocument(val, context) {
  var _b, _c;
  if (val instanceof Date) {
    return false;
  }
  if (val && ((_c = (_b = val[STATE]) === null || _b === void 0 ? void 0 : _b.handle) === null || _c === void 0 ? void 0 : _c.__wbg_ptr) === context.__wbg_ptr) {
    return true;
  }
  return false;
}
var MapHandler = {
  get(target, key) {
    const { context, objectId, cache } = target;
    if (key === Symbol.toStringTag) {
      return target[Symbol.toStringTag];
    }
    if (key === OBJECT_ID)
      return objectId;
    if (key === IS_PROXY)
      return true;
    if (key === TRACE)
      return target.trace;
    if (key === STATE)
      return { handle: context, textV2: target.textV2 };
    if (!cache[key]) {
      cache[key] = valueAt(target, key);
    }
    return cache[key];
  },
  set(target, key, val) {
    const { context, objectId, path, textV2 } = target;
    target.cache = {};
    if (isSameDocument(val, context)) {
      throw new RangeError("Cannot create a reference to an existing document object");
    }
    if (key === TRACE) {
      target.trace = val;
      return true;
    }
    if (key === CLEAR_CACHE) {
      return true;
    }
    const [value, datatype] = import_value(val, textV2, [...path, key], context);
    switch (datatype) {
      case "list": {
        const list = context.putObject(objectId, key, []);
        const proxyList = listProxy(context, list, textV2, [...path, key]);
        for (let i = 0; i < value.length; i++) {
          proxyList[i] = value[i];
        }
        break;
      }
      case "text": {
        if (textV2) {
          assertString(value);
          context.putObject(objectId, key, value);
        } else {
          assertText(value);
          const text = context.putObject(objectId, key, "");
          const proxyText = textProxy(context, text, [...path, key]);
          proxyText.splice(0, 0, ...value);
        }
        break;
      }
      case "map": {
        const map = context.putObject(objectId, key, {});
        const proxyMap = mapProxy(context, map, textV2, [...path, key]);
        for (const key2 in value) {
          proxyMap[key2] = value[key2];
        }
        break;
      }
      default:
        context.put(objectId, key, value, datatype);
    }
    return true;
  },
  deleteProperty(target, key) {
    const { context, objectId } = target;
    target.cache = {};
    context.delete(objectId, key);
    return true;
  },
  has(target, key) {
    const value = this.get(target, key);
    return value !== void 0;
  },
  getOwnPropertyDescriptor(target, key) {
    const value = this.get(target, key);
    if (typeof value !== "undefined") {
      return {
        configurable: true,
        enumerable: true,
        value
      };
    }
  },
  ownKeys(target) {
    const { context, objectId } = target;
    const keys = context.keys(objectId);
    return [...new Set(keys)];
  }
};
var ListHandler = {
  get(target, index) {
    const { context, objectId } = target;
    index = parseListIndex(index);
    if (index === Symbol.hasInstance) {
      return (instance) => {
        return Array.isArray(instance);
      };
    }
    if (index === Symbol.toStringTag) {
      return target[Symbol.toStringTag];
    }
    if (index === OBJECT_ID)
      return objectId;
    if (index === IS_PROXY)
      return true;
    if (index === TRACE)
      return target.trace;
    if (index === STATE)
      return { handle: context };
    if (index === "length")
      return context.length(objectId);
    if (typeof index === "number") {
      return valueAt(target, index);
    } else {
      return listMethods(target)[index];
    }
  },
  set(target, index, val) {
    const { context, objectId, path, textV2 } = target;
    index = parseListIndex(index);
    if (isSameDocument(val, context)) {
      throw new RangeError("Cannot create a reference to an existing document object");
    }
    if (index === CLEAR_CACHE) {
      return true;
    }
    if (index === TRACE) {
      target.trace = val;
      return true;
    }
    if (typeof index == "string") {
      throw new RangeError("list index must be a number");
    }
    const [value, datatype] = import_value(val, textV2, [...path, index], context);
    switch (datatype) {
      case "list": {
        let list;
        if (index >= context.length(objectId)) {
          list = context.insertObject(objectId, index, []);
        } else {
          list = context.putObject(objectId, index, []);
        }
        const proxyList = listProxy(context, list, textV2, [...path, index]);
        proxyList.splice(0, 0, ...value);
        break;
      }
      case "text": {
        if (textV2) {
          assertString(value);
          if (index >= context.length(objectId)) {
            context.insertObject(objectId, index, value);
          } else {
            context.putObject(objectId, index, value);
          }
        } else {
          let text;
          assertText(value);
          if (index >= context.length(objectId)) {
            text = context.insertObject(objectId, index, "");
          } else {
            text = context.putObject(objectId, index, "");
          }
          const proxyText = textProxy(context, text, [...path, index]);
          proxyText.splice(0, 0, ...value);
        }
        break;
      }
      case "map": {
        let map;
        if (index >= context.length(objectId)) {
          map = context.insertObject(objectId, index, {});
        } else {
          map = context.putObject(objectId, index, {});
        }
        const proxyMap = mapProxy(context, map, textV2, [...path, index]);
        for (const key in value) {
          proxyMap[key] = value[key];
        }
        break;
      }
      default:
        if (index >= context.length(objectId)) {
          context.insert(objectId, index, value, datatype);
        } else {
          context.put(objectId, index, value, datatype);
        }
    }
    return true;
  },
  deleteProperty(target, index) {
    const { context, objectId } = target;
    index = parseListIndex(index);
    const elem = context.get(objectId, index);
    if (elem != null && elem[0] == "counter") {
      throw new TypeError("Unsupported operation: deleting a counter from a list");
    }
    context.delete(objectId, index);
    return true;
  },
  has(target, index) {
    const { context, objectId } = target;
    index = parseListIndex(index);
    if (typeof index === "number") {
      return index < context.length(objectId);
    }
    return index === "length";
  },
  getOwnPropertyDescriptor(target, index) {
    const { context, objectId } = target;
    if (index === "length")
      return { writable: true, value: context.length(objectId) };
    if (index === OBJECT_ID)
      return { configurable: false, enumerable: false, value: objectId };
    index = parseListIndex(index);
    const value = valueAt(target, index);
    return { configurable: true, enumerable: true, value };
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(target);
  },
  ownKeys() {
    const keys = [];
    keys.push("length");
    return keys;
  }
};
var TextHandler = Object.assign({}, ListHandler, {
  get(target, index) {
    const { context, objectId } = target;
    index = parseListIndex(index);
    if (index === Symbol.hasInstance) {
      return (instance) => {
        return Array.isArray(instance);
      };
    }
    if (index === Symbol.toStringTag) {
      return target[Symbol.toStringTag];
    }
    if (index === OBJECT_ID)
      return objectId;
    if (index === IS_PROXY)
      return true;
    if (index === TRACE)
      return target.trace;
    if (index === STATE)
      return { handle: context };
    if (index === "length")
      return context.length(objectId);
    if (typeof index === "number") {
      return valueAt(target, index);
    } else {
      return textMethods(target)[index] || listMethods(target)[index];
    }
  },
  getPrototypeOf() {
    return Object.getPrototypeOf(new Text());
  }
});
function mapProxy(context, objectId, textV2, path) {
  const target = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2
  };
  const proxied = {};
  Object.assign(proxied, target);
  const result = new Proxy(proxied, MapHandler);
  return result;
}
function listProxy(context, objectId, textV2, path) {
  const target = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2
  };
  const proxied = [];
  Object.assign(proxied, target);
  return new Proxy(proxied, ListHandler);
}
function textProxy(context, objectId, path) {
  const target = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2: false
  };
  const proxied = {};
  Object.assign(proxied, target);
  return new Proxy(proxied, TextHandler);
}
function rootProxy(context, textV2) {
  return mapProxy(context, "_root", textV2, []);
}
function listMethods(target) {
  const { context, objectId, path, textV2 } = target;
  const methods = {
    deleteAt(index, numDelete) {
      if (typeof numDelete === "number") {
        context.splice(objectId, index, numDelete);
      } else {
        context.delete(objectId, index);
      }
      return this;
    },
    fill(val, start, end) {
      const [value, datatype] = import_value(val, textV2, [...path, start], context);
      const length = context.length(objectId);
      start = parseListIndex(start || 0);
      end = parseListIndex(end || length);
      for (let i = start; i < Math.min(end, length); i++) {
        if (datatype === "list" || datatype === "map") {
          context.putObject(objectId, i, value);
        } else if (datatype === "text") {
          if (textV2) {
            assertString(value);
            context.putObject(objectId, i, value);
          } else {
            assertText(value);
            const text = context.putObject(objectId, i, "");
            const proxyText = textProxy(context, text, [...path, i]);
            for (let i2 = 0; i2 < value.length; i2++) {
              proxyText[i2] = value.get(i2);
            }
          }
        } else {
          context.put(objectId, i, value, datatype);
        }
      }
      return this;
    },
    indexOf(o, start = 0) {
      const length = context.length(objectId);
      for (let i = start; i < length; i++) {
        const value = context.getWithType(objectId, i);
        if (value && (value[1] === o[OBJECT_ID] || value[1] === o)) {
          return i;
        }
      }
      return -1;
    },
    insertAt(index, ...values) {
      this.splice(index, 0, ...values);
      return this;
    },
    pop() {
      const length = context.length(objectId);
      if (length == 0) {
        return void 0;
      }
      const last = valueAt(target, length - 1);
      context.delete(objectId, length - 1);
      return last;
    },
    push(...values) {
      const len = context.length(objectId);
      this.splice(len, 0, ...values);
      return context.length(objectId);
    },
    shift() {
      if (context.length(objectId) == 0)
        return;
      const first = valueAt(target, 0);
      context.delete(objectId, 0);
      return first;
    },
    splice(index, del, ...vals) {
      index = parseListIndex(index);
      if (typeof del !== "number") {
        del = context.length(objectId) - index;
      }
      del = parseListIndex(del);
      for (const val of vals) {
        if (isSameDocument(val, context)) {
          throw new RangeError("Cannot create a reference to an existing document object");
        }
      }
      const result = [];
      for (let i = 0; i < del; i++) {
        const value = valueAt(target, index);
        if (value !== void 0) {
          result.push(value);
        }
        context.delete(objectId, index);
      }
      const values = vals.map((val, index2) => {
        try {
          return import_value(val, textV2, [...path], context);
        } catch (e) {
          if (e instanceof RangeError) {
            throw new RangeError(`${e.message} (at index ${index2} in the input)`);
          } else {
            throw e;
          }
        }
      });
      for (const [value, datatype] of values) {
        switch (datatype) {
          case "list": {
            const list = context.insertObject(objectId, index, []);
            const proxyList = listProxy(context, list, textV2, [...path, index]);
            proxyList.splice(0, 0, ...value);
            break;
          }
          case "text": {
            if (textV2) {
              assertString(value);
              context.insertObject(objectId, index, value);
            } else {
              const text = context.insertObject(objectId, index, "");
              const proxyText = textProxy(context, text, [...path, index]);
              proxyText.splice(0, 0, ...value);
            }
            break;
          }
          case "map": {
            const map = context.insertObject(objectId, index, {});
            const proxyMap = mapProxy(context, map, textV2, [...path, index]);
            for (const key in value) {
              proxyMap[key] = value[key];
            }
            break;
          }
          default:
            context.insert(objectId, index, value, datatype);
        }
        index += 1;
      }
      return result;
    },
    unshift(...values) {
      this.splice(0, 0, ...values);
      return context.length(objectId);
    },
    entries() {
      let i = 0;
      const iterator = {
        next: () => {
          const value = valueAt(target, i);
          if (value === void 0) {
            return { value: void 0, done: true };
          } else {
            return { value: [i++, value], done: false };
          }
        },
        [Symbol.iterator]() {
          return this;
        }
      };
      return iterator;
    },
    keys() {
      let i = 0;
      const len = context.length(objectId);
      const iterator = {
        next: () => {
          if (i < len) {
            return { value: i++, done: false };
          }
          return { value: void 0, done: true };
        },
        [Symbol.iterator]() {
          return this;
        }
      };
      return iterator;
    },
    values() {
      let i = 0;
      const iterator = {
        next: () => {
          const value = valueAt(target, i++);
          if (value === void 0) {
            return { value: void 0, done: true };
          } else {
            return { value, done: false };
          }
        },
        [Symbol.iterator]() {
          return this;
        }
      };
      return iterator;
    },
    toArray() {
      const list = [];
      let value;
      do {
        value = valueAt(target, list.length);
        if (value !== void 0) {
          list.push(value);
        }
      } while (value !== void 0);
      return list;
    },
    map(f2) {
      return this.toArray().map(f2);
    },
    toString() {
      return this.toArray().toString();
    },
    toLocaleString() {
      return this.toArray().toLocaleString();
    },
    forEach(f2) {
      return this.toArray().forEach(f2);
    },
    // todo: real concat function is different
    concat(other) {
      return this.toArray().concat(other);
    },
    every(f2) {
      return this.toArray().every(f2);
    },
    filter(f2) {
      return this.toArray().filter(f2);
    },
    find(f2) {
      let index = 0;
      for (const v of this) {
        if (f2(v, index)) {
          return v;
        }
        index += 1;
      }
    },
    findIndex(f2) {
      let index = 0;
      for (const v of this) {
        if (f2(v, index)) {
          return index;
        }
        index += 1;
      }
      return -1;
    },
    includes(elem) {
      return this.find((e) => e === elem) !== void 0;
    },
    join(sep) {
      return this.toArray().join(sep);
    },
    reduce(f2, initialValue) {
      return this.toArray().reduce(f2, initialValue);
    },
    reduceRight(f2, initialValue) {
      return this.toArray().reduceRight(f2, initialValue);
    },
    lastIndexOf(search, fromIndex = Infinity) {
      return this.toArray().lastIndexOf(search, fromIndex);
    },
    slice(index, num) {
      return this.toArray().slice(index, num);
    },
    some(f2) {
      let index = 0;
      for (const v of this) {
        if (f2(v, index)) {
          return true;
        }
        index += 1;
      }
      return false;
    },
    [Symbol.iterator]: function* () {
      let i = 0;
      let value = valueAt(target, i);
      while (value !== void 0) {
        yield value;
        i += 1;
        value = valueAt(target, i);
      }
    }
  };
  return methods;
}
function textMethods(target) {
  const { context, objectId } = target;
  const methods = {
    set(index, value) {
      return this[index] = value;
    },
    get(index) {
      return this[index];
    },
    toString() {
      return context.text(objectId).replace(/￼/g, "");
    },
    toSpans() {
      const spans2 = [];
      let chars = "";
      const length = context.length(objectId);
      for (let i = 0; i < length; i++) {
        const value = this[i];
        if (typeof value === "string") {
          chars += value;
        } else {
          if (chars.length > 0) {
            spans2.push(chars);
            chars = "";
          }
          spans2.push(value);
        }
      }
      if (chars.length > 0) {
        spans2.push(chars);
      }
      return spans2;
    },
    toJSON() {
      return this.toString();
    },
    indexOf(o, start = 0) {
      const text = context.text(objectId);
      return text.indexOf(o, start);
    },
    insertAt(index, ...values) {
      if (values.every((v) => typeof v === "string")) {
        context.splice(objectId, index, 0, values.join(""));
      } else {
        listMethods(target).insertAt(index, ...values);
      }
    }
  };
  return methods;
}
function assertText(value) {
  if (!(value instanceof Text)) {
    throw new Error("value was not a Text instance");
  }
}
function assertString(value) {
  if (typeof value !== "string") {
    throw new Error("value was not a string");
  }
}
function printPath(path) {
  const jsonPointerComponents = path.map((component) => {
    if (typeof component === "number") {
      return component.toString();
    } else if (typeof component === "string") {
      return component.replace(/~/g, "~0").replace(/\//g, "~1");
    }
  });
  if (path.length === 0) {
    return "";
  } else {
    return "/" + jsonPointerComponents.join("/");
  }
}

// node_modules/@automerge/automerge/dist/mjs/internal_state.js
function _state(doc, checkroot = true) {
  if (typeof doc !== "object") {
    throw new RangeError("must be the document root");
  }
  const state = Reflect.get(doc, STATE);
  if (state === void 0 || state == null || checkroot && _obj(doc) !== "_root") {
    throw new RangeError("must be the document root");
  }
  return state;
}
function _clear_cache(doc) {
  Reflect.set(doc, CLEAR_CACHE, true);
}
function _trace(doc) {
  return Reflect.get(doc, TRACE);
}
function _obj(doc) {
  if (!(typeof doc === "object") || doc === null) {
    return null;
  }
  return Reflect.get(doc, OBJECT_ID);
}
function _is_proxy(doc) {
  return !!Reflect.get(doc, IS_PROXY);
}

// node_modules/@automerge/automerge/dist/mjs/conflicts.js
function stableConflictAt(context, objectId, prop) {
  return conflictAt(context, objectId, prop, true, (context2, conflictId) => {
    return new Text(context2.text(conflictId));
  });
}
function unstableConflictAt(context, objectId, prop) {
  return conflictAt(context, objectId, prop, true, (context2, conflictId) => {
    return context2.text(conflictId);
  });
}
function conflictAt(context, objectId, prop, textV2, handleText) {
  const values = context.getAll(objectId, prop);
  if (values.length <= 1) {
    return;
  }
  const result = {};
  for (const fullVal of values) {
    switch (fullVal[0]) {
      case "map":
        result[fullVal[1]] = mapProxy(context, fullVal[1], textV2, [prop]);
        break;
      case "list":
        result[fullVal[1]] = listProxy(context, fullVal[1], textV2, [prop]);
        break;
      case "text":
        result[fullVal[1]] = handleText(context, fullVal[1]);
        break;
      case "str":
      case "uint":
      case "int":
      case "f64":
      case "boolean":
      case "bytes":
      case "null":
        result[fullVal[2]] = fullVal[1];
        break;
      case "counter":
        result[fullVal[2]] = new Counter(fullVal[1]);
        break;
      case "timestamp":
        result[fullVal[2]] = new Date(fullVal[1]);
        break;
      default:
        throw RangeError(`datatype ${fullVal[0]} unimplemented`);
    }
  }
  return result;
}

// node_modules/@automerge/automerge/dist/mjs/stable.js
var __rest = function(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var SyncStateSymbol = Symbol("_syncstate");
function insertAt(list, index, ...values) {
  if (!_is_proxy(list)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  ;
  list.insertAt(index, ...values);
}
function deleteAt(list, index, numDelete) {
  if (!_is_proxy(list)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  ;
  list.deleteAt(index, numDelete);
}
function use(api) {
  UseApi(api);
}
function getBackend(doc) {
  return _state(doc).handle;
}
function importOpts(_actor) {
  if (typeof _actor === "object") {
    return _actor;
  } else {
    return { actor: _actor };
  }
}
function init(_opts) {
  const opts = importOpts(_opts);
  const freeze = !!opts.freeze;
  const patchCallback = opts.patchCallback;
  const text_v1 = !(opts.enableTextV2 || false);
  const actor = opts.actor;
  const handle = ApiHandler.create({ actor, text_v1 });
  handle.enableFreeze(!!opts.freeze);
  const textV2 = opts.enableTextV2 || false;
  registerDatatypes(handle, textV2);
  const doc = handle.materialize("/", void 0, {
    handle,
    heads: void 0,
    freeze,
    patchCallback,
    textV2
  });
  return doc;
}
function view(doc, heads) {
  const state = _state(doc);
  const handle = state.handle;
  return state.handle.materialize("/", heads, Object.assign(Object.assign({}, state), {
    handle,
    heads
  }));
}
function clone(doc, _opts) {
  const state = _state(doc);
  const heads = state.heads;
  const opts = importOpts(_opts);
  const handle = state.handle.fork(opts.actor, heads);
  handle.updateDiffCursor();
  const { heads: _oldHeads } = state, stateSansHeads = __rest(state, ["heads"]);
  stateSansHeads.patchCallback = opts.patchCallback;
  return handle.applyPatches(doc, Object.assign(Object.assign({}, stateSansHeads), { handle }));
}
function free(doc) {
  return _state(doc).handle.free();
}
function from(initialState, _opts) {
  return _change(init(_opts), "from", {}, (d) => Object.assign(d, initialState)).newDoc;
}
function change(doc, options, callback) {
  if (typeof options === "function") {
    return _change(doc, "change", {}, options).newDoc;
  } else if (typeof callback === "function") {
    if (typeof options === "string") {
      options = { message: options };
    }
    return _change(doc, "change", options, callback).newDoc;
  } else {
    throw RangeError("Invalid args for change");
  }
}
function changeAt(doc, scope, options, callback) {
  if (typeof options === "function") {
    return _change(doc, "changeAt", {}, options, scope);
  } else if (typeof callback === "function") {
    if (typeof options === "string") {
      options = { message: options };
    }
    return _change(doc, "changeAt", options, callback, scope);
  } else {
    throw RangeError("Invalid args for changeAt");
  }
}
function progressDocument(doc, source, heads, callback) {
  if (heads == null) {
    return doc;
  }
  const state = _state(doc);
  const nextState = Object.assign(Object.assign({}, state), { heads: void 0 });
  const { value: nextDoc, patches } = state.handle.applyAndReturnPatches(doc, nextState);
  if (patches.length > 0) {
    if (callback != null) {
      callback(patches, { before: doc, after: nextDoc, source });
    }
    const newState = _state(nextDoc);
    newState.mostRecentPatch = {
      before: _state(doc).heads,
      after: newState.handle.getHeads(),
      patches
    };
  }
  state.heads = heads;
  return nextDoc;
}
function _change(doc, source, options, callback, scope) {
  if (typeof callback !== "function") {
    throw new RangeError("invalid change function");
  }
  const state = _state(doc);
  if (doc === void 0 || state === void 0) {
    throw new RangeError("must be the document root");
  }
  if (state.heads) {
    throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  let heads = state.handle.getHeads();
  if (scope && headsEqual(scope, heads)) {
    scope = void 0;
  }
  if (scope) {
    state.handle.isolate(scope);
    heads = scope;
  }
  if (!("time" in options)) {
    options.time = Math.floor(Date.now() / 1e3);
  }
  try {
    state.heads = heads;
    const root = rootProxy(state.handle, state.textV2);
    callback(root);
    if (state.handle.pendingOps() === 0) {
      state.heads = void 0;
      if (scope) {
        state.handle.integrate();
      }
      return {
        newDoc: doc,
        newHeads: null
      };
    } else {
      const newHead = state.handle.commit(options.message, options.time);
      state.handle.integrate();
      return {
        newDoc: progressDocument(doc, source, heads, options.patchCallback || state.patchCallback),
        newHeads: newHead != null ? [newHead] : null
      };
    }
  } catch (e) {
    state.heads = void 0;
    state.handle.rollback();
    throw e;
  }
}
function emptyChange(doc, options) {
  if (options === void 0) {
    options = {};
  }
  if (typeof options === "string") {
    options = { message: options };
  }
  if (!("time" in options)) {
    options.time = Math.floor(Date.now() / 1e3);
  }
  const state = _state(doc);
  if (state.heads) {
    throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  const heads = state.handle.getHeads();
  state.handle.emptyChange(options.message, options.time);
  return progressDocument(doc, "emptyChange", heads);
}
function load2(data, _opts) {
  const opts = importOpts(_opts);
  const actor = opts.actor;
  const patchCallback = opts.patchCallback;
  const text_v1 = !(opts.enableTextV2 || false);
  const unchecked = opts.unchecked || false;
  const allowMissingDeps = opts.allowMissingChanges || false;
  const convertRawStringsToText = opts.convertRawStringsToText || false;
  const handle = ApiHandler.load(data, {
    text_v1,
    actor,
    unchecked,
    allowMissingDeps,
    convertRawStringsToText
  });
  handle.enableFreeze(!!opts.freeze);
  const textV2 = opts.enableTextV2 || false;
  registerDatatypes(handle, textV2);
  const doc = handle.materialize("/", void 0, {
    handle,
    heads: void 0,
    patchCallback,
    textV2
  });
  return doc;
}
function loadIncremental(doc, data, opts) {
  if (!opts) {
    opts = {};
  }
  const state = _state(doc);
  if (state.heads) {
    throw new RangeError("Attempting to change an out of date document - set at: " + _trace(doc));
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  const heads = state.handle.getHeads();
  state.handle.loadIncremental(data);
  return progressDocument(doc, "loadIncremental", heads, opts.patchCallback || state.patchCallback);
}
function saveIncremental(doc) {
  const state = _state(doc);
  if (state.heads) {
    throw new RangeError("Attempting to change an out of date document - set at: " + _trace(doc));
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  return state.handle.saveIncremental();
}
function save(doc) {
  return _state(doc).handle.save();
}
function merge(local, remote) {
  const localState = _state(local);
  if (localState.heads) {
    throw new RangeError("Attempting to change an out of date document - set at: " + _trace(local));
  }
  const heads = localState.handle.getHeads();
  const remoteState = _state(remote);
  const changes = localState.handle.getChangesAdded(remoteState.handle);
  localState.handle.applyChanges(changes);
  return progressDocument(local, "merge", heads, localState.patchCallback);
}
function getActorId(doc) {
  const state = _state(doc);
  return state.handle.getActorId();
}
function getConflicts(doc, prop) {
  const state = _state(doc, false);
  if (state.textV2) {
    throw new Error("use unstable.getConflicts for an unstable document");
  }
  const objectId = _obj(doc);
  if (objectId != null) {
    return stableConflictAt(state.handle, objectId, prop);
  } else {
    return void 0;
  }
}
function getLastLocalChange(doc) {
  const state = _state(doc);
  return state.handle.getLastLocalChange() || void 0;
}
function getObjectId(doc, prop) {
  if (prop) {
    const state = _state(doc, false);
    const objectId = _obj(doc);
    if (!state || !objectId) {
      return null;
    }
    return state.handle.get(objectId, prop);
  } else {
    return _obj(doc);
  }
}
function getChanges(oldState, newState) {
  const n = _state(newState);
  return n.handle.getChanges(getHeads(oldState));
}
function getAllChanges(doc) {
  const state = _state(doc);
  return state.handle.getChanges([]);
}
function applyChanges(doc, changes, opts) {
  const state = _state(doc);
  if (!opts) {
    opts = {};
  }
  if (state.heads) {
    throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  const heads = state.handle.getHeads();
  state.handle.applyChanges(changes);
  state.heads = heads;
  return [
    progressDocument(doc, "applyChanges", heads, opts.patchCallback || state.patchCallback)
  ];
}
function getHistory(doc) {
  const textV2 = _state(doc).textV2;
  const history = getAllChanges(doc);
  return history.map((change2, index) => ({
    get change() {
      return decodeChange2(change2);
    },
    get snapshot() {
      const [state] = applyChanges(init({ enableTextV2: textV2 }), history.slice(0, index + 1));
      return state;
    }
  }));
}
function diff(doc, before, after) {
  checkHeads(before, "before");
  checkHeads(after, "after");
  const state = _state(doc);
  if (state.mostRecentPatch && equals(state.mostRecentPatch.before, before) && equals(state.mostRecentPatch.after, after)) {
    return state.mostRecentPatch.patches;
  }
  return state.handle.diff(before, after);
}
function headsEqual(heads1, heads2) {
  if (heads1.length !== heads2.length) {
    return false;
  }
  for (let i = 0; i < heads1.length; i++) {
    if (heads1[i] !== heads2[i]) {
      return false;
    }
  }
  return true;
}
function checkHeads(heads, fieldname) {
  if (!Array.isArray(heads)) {
    throw new Error(`${fieldname} must be an array`);
  }
}
function equals(val1, val2) {
  if (!isObject(val1) || !isObject(val2))
    return val1 === val2;
  const keys1 = Object.keys(val1).sort(), keys2 = Object.keys(val2).sort();
  if (keys1.length !== keys2.length)
    return false;
  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i])
      return false;
    if (!equals(val1[keys1[i]], val2[keys2[i]]))
      return false;
  }
  return true;
}
function encodeSyncState2(state) {
  const sync = ApiHandler.importSyncState(state);
  const result = ApiHandler.encodeSyncState(sync);
  sync.free();
  return result;
}
function decodeSyncState2(state) {
  const sync = ApiHandler.decodeSyncState(state);
  const result = ApiHandler.exportSyncState(sync);
  sync.free();
  return result;
}
function generateSyncMessage(doc, inState) {
  const state = _state(doc);
  const syncState = ApiHandler.importSyncState(inState);
  const message = state.handle.generateSyncMessage(syncState);
  const outState = ApiHandler.exportSyncState(syncState);
  return [outState, message];
}
function receiveSyncMessage(doc, inState, message, opts) {
  const syncState = ApiHandler.importSyncState(inState);
  if (!opts) {
    opts = {};
  }
  const state = _state(doc);
  if (state.heads) {
    throw new RangeError("Attempting to change an outdated document.  Use Automerge.clone() if you wish to make a writable copy.");
  }
  if (_is_proxy(doc)) {
    throw new RangeError("Calls to Automerge.change cannot be nested");
  }
  const heads = state.handle.getHeads();
  state.handle.receiveSyncMessage(syncState, message);
  const outSyncState = ApiHandler.exportSyncState(syncState);
  return [
    progressDocument(doc, "receiveSyncMessage", heads, opts.patchCallback || state.patchCallback),
    outSyncState,
    null
  ];
}
function hasOurChanges(doc, remoteState) {
  const state = _state(doc);
  const syncState = ApiHandler.importSyncState(remoteState);
  return state.handle.hasOurChanges(syncState);
}
function initSyncState2() {
  return ApiHandler.exportSyncState(ApiHandler.initSyncState());
}
function encodeChange2(change2) {
  return ApiHandler.encodeChange(change2);
}
function decodeChange2(data) {
  return ApiHandler.decodeChange(data);
}
function encodeSyncMessage2(message) {
  return ApiHandler.encodeSyncMessage(message);
}
function decodeSyncMessage2(message) {
  return ApiHandler.decodeSyncMessage(message);
}
function getMissingDeps(doc, heads) {
  const state = _state(doc);
  return state.handle.getMissingDeps(heads);
}
function getHeads(doc) {
  const state = _state(doc);
  return state.heads || state.handle.getHeads();
}
function dump(doc) {
  const state = _state(doc);
  state.handle.dump();
}
function toJS(doc) {
  const state = _state(doc);
  const enabled = state.handle.enableFreeze(false);
  const result = state.handle.materialize();
  state.handle.enableFreeze(enabled);
  return result;
}
function isAutomerge(doc) {
  if (typeof doc == "object" && doc !== null) {
    return getObjectId(doc) === "_root" && !!Reflect.get(doc, STATE);
  } else {
    return false;
  }
}
function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}
function saveSince(doc, heads) {
  const state = _state(doc);
  const result = state.handle.saveSince(heads);
  return result;
}
function hasHeads(doc, heads) {
  const state = _state(doc);
  for (const hash of heads) {
    if (!state.handle.getChangeByHash(hash)) {
      return false;
    }
  }
  return true;
}
function registerDatatypes(handle, textV2) {
  handle.registerDatatype("counter", (n) => new Counter(n), (n) => {
    if (n instanceof Counter) {
      return n.value;
    }
  });
  if (textV2) {
    handle.registerDatatype("str", (n) => {
      return new RawString(n);
    }, (s) => {
      if (s instanceof RawString) {
        return s.val;
      }
    });
  } else {
    handle.registerDatatype("text", (n) => new Text(n), (t) => {
      if (t instanceof Text) {
        return t.join("");
      }
    });
  }
}
function topoHistoryTraversal(doc) {
  const state = _state(doc);
  return state.handle.topoHistoryTraversal();
}
function inspectChange(doc, changeHash) {
  const state = _state(doc);
  return state.handle.getDecodedChangeByHash(changeHash);
}
function stats(doc) {
  const state = _state(doc);
  return state.handle.stats();
}

// node_modules/@automerge/automerge/dist/mjs/next_slim.js
var next_slim_exports = {};
__export(next_slim_exports, {
  Counter: () => Counter,
  Float64: () => Float64,
  Int: () => Int,
  RawString: () => RawString,
  Uint: () => Uint,
  applyChanges: () => applyChanges,
  block: () => block,
  change: () => change,
  changeAt: () => changeAt,
  clone: () => clone2,
  decodeChange: () => decodeChange2,
  decodeSyncMessage: () => decodeSyncMessage2,
  decodeSyncState: () => decodeSyncState2,
  deleteAt: () => deleteAt,
  diff: () => diff,
  dump: () => dump,
  emptyChange: () => emptyChange,
  encodeChange: () => encodeChange2,
  encodeSyncMessage: () => encodeSyncMessage2,
  encodeSyncState: () => encodeSyncState2,
  equals: () => equals,
  free: () => free,
  from: () => from2,
  generateSyncMessage: () => generateSyncMessage,
  getActorId: () => getActorId,
  getAllChanges: () => getAllChanges,
  getBackend: () => getBackend2,
  getChanges: () => getChanges,
  getConflicts: () => getConflicts2,
  getCursor: () => getCursor,
  getCursorPosition: () => getCursorPosition,
  getHeads: () => getHeads,
  getHistory: () => getHistory,
  getLastLocalChange: () => getLastLocalChange,
  getMissingDeps: () => getMissingDeps,
  getObjectId: () => getObjectId,
  hasHeads: () => hasHeads,
  hasOurChanges: () => hasOurChanges,
  init: () => init2,
  initSyncState: () => initSyncState2,
  initializeBase64Wasm: () => initializeBase64Wasm,
  initializeWasm: () => initializeWasm,
  insertAt: () => insertAt,
  inspectChange: () => inspectChange,
  isAutomerge: () => isAutomerge,
  isWasmInitialized: () => isWasmInitialized,
  joinBlock: () => joinBlock,
  load: () => load3,
  loadIncremental: () => loadIncremental,
  mark: () => mark,
  marks: () => marks,
  marksAt: () => marksAt,
  merge: () => merge,
  receiveSyncMessage: () => receiveSyncMessage,
  save: () => save,
  saveIncremental: () => saveIncremental,
  saveSince: () => saveSince,
  spans: () => spans,
  splice: () => splice,
  splitBlock: () => splitBlock,
  stats: () => stats,
  toJS: () => toJS,
  topoHistoryTraversal: () => topoHistoryTraversal,
  unmark: () => unmark,
  updateBlock: () => updateBlock,
  updateSpans: () => updateSpans,
  updateText: () => updateText,
  view: () => view,
  wasmInitialized: () => wasmInitialized
});
var getBackend2 = getBackend;
function init2(_opts) {
  const opts = importOpts2(_opts);
  opts.enableTextV2 = true;
  return init(opts);
}
function clone2(doc, _opts) {
  const opts = importOpts2(_opts);
  opts.enableTextV2 = true;
  return clone(doc, opts);
}
function from2(initialState, _opts) {
  const opts = importOpts2(_opts);
  opts.enableTextV2 = true;
  return from(initialState, opts);
}
function load3(data, _opts) {
  const opts = importOpts2(_opts);
  opts.enableTextV2 = true;
  if (opts.patchCallback) {
    return loadIncremental(init(opts), data);
  } else {
    return load2(data, opts);
  }
}
function importOpts2(_actor) {
  if (typeof _actor === "object") {
    return _actor;
  } else {
    return { actor: _actor };
  }
}
function cursorToIndex(state, value, index) {
  if (typeof index == "string") {
    if (/^[0-9]+@[0-9a-zA-z]+$/.test(index)) {
      return state.handle.getCursorPosition(value, index);
    } else {
      throw new RangeError("index must be a number or cursor");
    }
  } else {
    return index;
  }
}
function splice(doc, path, index, del, newText) {
  const objPath = absoluteObjPath(doc, path, "splice");
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const state = _state(doc, false);
  _clear_cache(doc);
  index = cursorToIndex(state, objPath, index);
  try {
    return state.handle.splice(objPath, index, del, newText);
  } catch (e) {
    throw new RangeError(`Cannot splice: ${e}`);
  }
}
function updateText(doc, path, newText) {
  const objPath = absoluteObjPath(doc, path, "updateText");
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const state = _state(doc, false);
  _clear_cache(doc);
  try {
    return state.handle.updateText(objPath, newText);
  } catch (e) {
    throw new RangeError(`Cannot updateText: ${e}`);
  }
}
function spans(doc, path) {
  const state = _state(doc, false);
  const objPath = absoluteObjPath(doc, path, "spans");
  try {
    return state.handle.spans(objPath, state.heads);
  } catch (e) {
    throw new RangeError(`Cannot splice: ${e}`);
  }
}
function block(doc, path, index) {
  const objPath = absoluteObjPath(doc, path, "splitBlock");
  const state = _state(doc, false);
  index = cursorToIndex(state, objPath, index);
  try {
    return state.handle.getBlock(objPath, index);
  } catch (e) {
    throw new RangeError(`Cannot get block: ${e}`);
  }
}
function splitBlock(doc, path, index, block2) {
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const objPath = absoluteObjPath(doc, path, "splitBlock");
  const state = _state(doc, false);
  _clear_cache(doc);
  index = cursorToIndex(state, objPath, index);
  try {
    state.handle.splitBlock(objPath, index, block2);
  } catch (e) {
    throw new RangeError(`Cannot splice: ${e}`);
  }
}
function joinBlock(doc, path, index) {
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const objPath = absoluteObjPath(doc, path, "joinBlock");
  const state = _state(doc, false);
  _clear_cache(doc);
  index = cursorToIndex(state, objPath, index);
  try {
    state.handle.joinBlock(objPath, index);
  } catch (e) {
    throw new RangeError(`Cannot joinBlock: ${e}`);
  }
}
function updateBlock(doc, path, index, block2) {
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const objPath = absoluteObjPath(doc, path, "updateBlock");
  const state = _state(doc, false);
  _clear_cache(doc);
  index = cursorToIndex(state, objPath, index);
  try {
    state.handle.updateBlock(objPath, index, block2);
  } catch (e) {
    throw new RangeError(`Cannot updateBlock: ${e}`);
  }
}
function updateSpans(doc, path, newSpans) {
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const objPath = absoluteObjPath(doc, path, "updateSpans");
  const state = _state(doc, false);
  _clear_cache(doc);
  try {
    state.handle.updateSpans(objPath, newSpans);
  } catch (e) {
    throw new RangeError(`Cannot updateBlock: ${e}`);
  }
}
function getCursor(doc, path, index) {
  const objPath = absoluteObjPath(doc, path, "getCursor");
  const state = _state(doc, false);
  try {
    return state.handle.getCursor(objPath, index);
  } catch (e) {
    throw new RangeError(`Cannot getCursor: ${e}`);
  }
}
function getCursorPosition(doc, path, cursor) {
  const objPath = absoluteObjPath(doc, path, "getCursorPosition");
  const state = _state(doc, false);
  try {
    return state.handle.getCursorPosition(objPath, cursor);
  } catch (e) {
    throw new RangeError(`Cannot getCursorPosition: ${e}`);
  }
}
function mark(doc, path, range, name, value) {
  const objPath = absoluteObjPath(doc, path, "mark");
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const state = _state(doc, false);
  try {
    return state.handle.mark(objPath, range, name, value);
  } catch (e) {
    throw new RangeError(`Cannot mark: ${e}`);
  }
}
function unmark(doc, path, range, name) {
  const objPath = absoluteObjPath(doc, path, "unmark");
  if (!_is_proxy(doc)) {
    throw new RangeError("object cannot be modified outside of a change block");
  }
  const state = _state(doc, false);
  try {
    return state.handle.unmark(objPath, range, name);
  } catch (e) {
    throw new RangeError(`Cannot unmark: ${e}`);
  }
}
function marks(doc, path) {
  const objPath = absoluteObjPath(doc, path, "marks");
  const state = _state(doc, false);
  try {
    return state.handle.marks(objPath);
  } catch (e) {
    throw new RangeError(`Cannot call marks(): ${e}`);
  }
}
function marksAt(doc, path, index) {
  const objPath = absoluteObjPath(doc, path, "marksAt");
  const state = _state(doc, false);
  try {
    return state.handle.marksAt(objPath, index);
  } catch (e) {
    throw new RangeError(`Cannot call marksAt(): ${e}`);
  }
}
function getConflicts2(doc, prop) {
  const state = _state(doc, false);
  if (!state.textV2) {
    throw new Error("use getConflicts for a stable document");
  }
  const objectId = _obj(doc);
  if (objectId != null) {
    return unstableConflictAt(state.handle, objectId, prop);
  } else {
    return void 0;
  }
}
function absoluteObjPath(doc, path, functionName) {
  path = path.slice();
  const objectId = _obj(doc);
  if (!objectId) {
    throw new RangeError(`invalid object for ${functionName}`);
  }
  path.unshift(objectId);
  return path.join("/");
}

export {
  Text,
  Counter,
  Int,
  Uint,
  Float64,
  RawString,
  validate_default,
  stringify_default,
  parse_default,
  v4_default,
  uuid,
  UseApi,
  initializeWasm,
  initializeBase64Wasm,
  wasmInitialized,
  isWasmInitialized,
  insertAt,
  deleteAt,
  use,
  getBackend,
  init,
  view,
  clone,
  free,
  from,
  change,
  changeAt,
  emptyChange,
  load2 as load,
  loadIncremental,
  saveIncremental,
  save,
  merge,
  getActorId,
  getConflicts,
  getLastLocalChange,
  getObjectId,
  getChanges,
  getAllChanges,
  applyChanges,
  getHistory,
  diff,
  equals,
  encodeSyncState2 as encodeSyncState,
  decodeSyncState2 as decodeSyncState,
  generateSyncMessage,
  receiveSyncMessage,
  hasOurChanges,
  initSyncState2 as initSyncState,
  encodeChange2 as encodeChange,
  decodeChange2 as decodeChange,
  encodeSyncMessage2 as encodeSyncMessage,
  decodeSyncMessage2 as decodeSyncMessage,
  getMissingDeps,
  getHeads,
  dump,
  toJS,
  isAutomerge,
  saveSince,
  hasHeads,
  topoHistoryTraversal,
  inspectChange,
  stats,
  init2,
  from2,
  splice,
  updateText,
  getCursor,
  getCursorPosition,
  mark,
  unmark,
  getConflicts2,
  next_slim_exports
};
//# sourceMappingURL=chunk-MXFFLMHY.js.map
