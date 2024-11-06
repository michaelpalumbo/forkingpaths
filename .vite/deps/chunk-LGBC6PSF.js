var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from3, except, desc) => {
  if (from3 && typeof from3 === "object" || typeof from3 === "function") {
    for (let key of __getOwnPropNames(from3))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from3[key], enumerable: !(desc = __getOwnPropDesc(from3, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});

// node_modules/@noble/hashes/_assert.js
var require_assert = __commonJS({
  "node_modules/@noble/hashes/_assert.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isBytes = isBytes;
    exports.number = number;
    exports.bool = bool;
    exports.bytes = bytes;
    exports.hash = hash2;
    exports.exists = exists;
    exports.output = output;
    function number(n) {
      if (!Number.isSafeInteger(n) || n < 0)
        throw new Error(`positive integer expected, not ${n}`);
    }
    function bool(b) {
      if (typeof b !== "boolean")
        throw new Error(`boolean expected, not ${b}`);
    }
    function isBytes(a) {
      return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
    }
    function bytes(b, ...lengths) {
      if (!isBytes(b))
        throw new Error("Uint8Array expected");
      if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
    }
    function hash2(h) {
      if (typeof h !== "function" || typeof h.create !== "function")
        throw new Error("Hash should be wrapped by utils.wrapConstructor");
      number(h.outputLen);
      number(h.blockLen);
    }
    function exists(instance, checkFinished = true) {
      if (instance.destroyed)
        throw new Error("Hash instance has been destroyed");
      if (checkFinished && instance.finished)
        throw new Error("Hash#digest() has already been called");
    }
    function output(out, instance) {
      bytes(out);
      const min = instance.outputLen;
      if (out.length < min) {
        throw new Error(`digestInto() expects output buffer of length at least ${min}`);
      }
    }
    var assert = { number, bool, bytes, hash: hash2, exists, output };
    exports.default = assert;
  }
});

// node_modules/@noble/hashes/crypto.js
var require_crypto = __commonJS({
  "node_modules/@noble/hashes/crypto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.crypto = void 0;
    exports.crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});

// node_modules/@noble/hashes/utils.js
var require_utils = __commonJS({
  "node_modules/@noble/hashes/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Hash = exports.nextTick = exports.byteSwapIfBE = exports.byteSwap = exports.isLE = exports.rotl = exports.rotr = exports.createView = exports.u32 = exports.u8 = void 0;
    exports.isBytes = isBytes;
    exports.byteSwap32 = byteSwap32;
    exports.bytesToHex = bytesToHex;
    exports.hexToBytes = hexToBytes;
    exports.asyncLoop = asyncLoop;
    exports.utf8ToBytes = utf8ToBytes;
    exports.toBytes = toBytes;
    exports.concatBytes = concatBytes;
    exports.checkOpts = checkOpts;
    exports.wrapConstructor = wrapConstructor;
    exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
    exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
    exports.randomBytes = randomBytes;
    var crypto_1 = require_crypto();
    var _assert_js_1 = require_assert();
    function isBytes(a) {
      return a instanceof Uint8Array || a != null && typeof a === "object" && a.constructor.name === "Uint8Array";
    }
    var u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    exports.u8 = u8;
    var u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
    exports.u32 = u32;
    var createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    exports.createView = createView;
    var rotr = (word, shift) => word << 32 - shift | word >>> shift;
    exports.rotr = rotr;
    var rotl = (word, shift) => word << shift | word >>> 32 - shift >>> 0;
    exports.rotl = rotl;
    exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
    var byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
    exports.byteSwap = byteSwap;
    exports.byteSwapIfBE = exports.isLE ? (n) => n : (n) => (0, exports.byteSwap)(n);
    function byteSwap32(arr) {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (0, exports.byteSwap)(arr[i]);
      }
    }
    var hexes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    function bytesToHex(bytes) {
      (0, _assert_js_1.bytes)(bytes);
      let hex = "";
      for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
      }
      return hex;
    }
    var asciis = { _0: 48, _9: 57, _A: 65, _F: 70, _a: 97, _f: 102 };
    function asciiToBase16(char) {
      if (char >= asciis._0 && char <= asciis._9)
        return char - asciis._0;
      if (char >= asciis._A && char <= asciis._F)
        return char - (asciis._A - 10);
      if (char >= asciis._a && char <= asciis._f)
        return char - (asciis._a - 10);
      return;
    }
    function hexToBytes(hex) {
      if (typeof hex !== "string")
        throw new Error("hex string expected, got " + typeof hex);
      const hl = hex.length;
      const al = hl / 2;
      if (hl % 2)
        throw new Error("padded hex string expected, got unpadded hex of length " + hl);
      const array = new Uint8Array(al);
      for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === void 0 || n2 === void 0) {
          const char = hex[hi] + hex[hi + 1];
          throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2;
      }
      return array;
    }
    var nextTick = async () => {
    };
    exports.nextTick = nextTick;
    async function asyncLoop(iters, tick, cb) {
      let ts = Date.now();
      for (let i = 0; i < iters; i++) {
        cb(i);
        const diff2 = Date.now() - ts;
        if (diff2 >= 0 && diff2 < tick)
          continue;
        await (0, exports.nextTick)();
        ts += diff2;
      }
    }
    function utf8ToBytes(str) {
      if (typeof str !== "string")
        throw new Error(`utf8ToBytes expected string, got ${typeof str}`);
      return new Uint8Array(new TextEncoder().encode(str));
    }
    function toBytes(data) {
      if (typeof data === "string")
        data = utf8ToBytes(data);
      (0, _assert_js_1.bytes)(data);
      return data;
    }
    function concatBytes(...arrays) {
      let sum = 0;
      for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        (0, _assert_js_1.bytes)(a);
        sum += a.length;
      }
      const res = new Uint8Array(sum);
      for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
      }
      return res;
    }
    var Hash = class {
      // Safe version that clones internal state
      clone() {
        return this._cloneInto();
      }
    };
    exports.Hash = Hash;
    var toStr = {}.toString;
    function checkOpts(defaults, opts) {
      if (opts !== void 0 && toStr.call(opts) !== "[object Object]")
        throw new Error("Options should be object or undefined");
      const merged = Object.assign(defaults, opts);
      return merged;
    }
    function wrapConstructor(hashCons) {
      const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
      const tmp = hashCons();
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = () => hashCons();
      return hashC;
    }
    function wrapConstructorWithOpts(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      return hashC;
    }
    function wrapXOFConstructorWithOpts(hashCons) {
      const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
      const tmp = hashCons({});
      hashC.outputLen = tmp.outputLen;
      hashC.blockLen = tmp.blockLen;
      hashC.create = (opts) => hashCons(opts);
      return hashC;
    }
    function randomBytes(bytesLength = 32) {
      if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
        return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
      }
      if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") {
        return crypto_1.crypto.randomBytes(bytesLength);
      }
      throw new Error("crypto.getRandomValues must be defined");
    }
  }
});

// node_modules/@noble/hashes/_md.js
var require_md = __commonJS({
  "node_modules/@noble/hashes/_md.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashMD = exports.Maj = exports.Chi = void 0;
    var _assert_js_1 = require_assert();
    var utils_js_1 = require_utils();
    function setBigUint64(view2, byteOffset, value, isLE) {
      if (typeof view2.setBigUint64 === "function")
        return view2.setBigUint64(byteOffset, value, isLE);
      const _32n = BigInt(32);
      const _u32_max = BigInt(4294967295);
      const wh = Number(value >> _32n & _u32_max);
      const wl = Number(value & _u32_max);
      const h = isLE ? 4 : 0;
      const l = isLE ? 0 : 4;
      view2.setUint32(byteOffset + h, wh, isLE);
      view2.setUint32(byteOffset + l, wl, isLE);
    }
    var Chi = (a, b, c) => a & b ^ ~a & c;
    exports.Chi = Chi;
    var Maj = (a, b, c) => a & b ^ a & c ^ b & c;
    exports.Maj = Maj;
    var HashMD = class extends utils_js_1.Hash {
      constructor(blockLen, outputLen, padOffset, isLE) {
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0, utils_js_1.createView)(this.buffer);
      }
      update(data) {
        (0, _assert_js_1.exists)(this);
        const { view: view2, buffer, blockLen } = this;
        data = (0, utils_js_1.toBytes)(data);
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView2 = (0, utils_js_1.createView)(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView2, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view2, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        (0, _assert_js_1.exists)(this);
        (0, _assert_js_1.output)(out, this);
        this.finished = true;
        const { buffer, view: view2, blockLen, isLE } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        this.buffer.subarray(pos).fill(0);
        if (this.padOffset > blockLen - pos) {
          this.process(view2, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        setBigUint64(view2, blockLen - 8, BigInt(this.length * 8), isLE);
        this.process(view2, 0);
        const oview = (0, utils_js_1.createView)(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
    };
    exports.HashMD = HashMD;
  }
});

// node_modules/@noble/hashes/sha256.js
var require_sha256 = __commonJS({
  "node_modules/@noble/hashes/sha256.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sha224 = exports.sha256 = exports.SHA256 = void 0;
    var _md_js_1 = require_md();
    var utils_js_1 = require_utils();
    var SHA256_K = new Uint32Array([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    var SHA256_IV = new Uint32Array([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    var SHA256_W = new Uint32Array(64);
    var SHA256 = class extends _md_js_1.HashMD {
      constructor() {
        super(64, 32, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view2, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view2.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ W15 >>> 3;
          const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
          const T1 = H + sigma1 + (0, _md_js_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
          const T2 = sigma0 + (0, _md_js_1.Maj)(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        SHA256_W.fill(0);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
      }
    };
    exports.SHA256 = SHA256;
    var SHA224 = class extends SHA256 {
      constructor() {
        super();
        this.A = 3238371032 | 0;
        this.B = 914150663 | 0;
        this.C = 812702999 | 0;
        this.D = 4144912697 | 0;
        this.E = 4290775857 | 0;
        this.F = 1750603025 | 0;
        this.G = 1694076839 | 0;
        this.H = 3204075428 | 0;
        this.outputLen = 28;
      }
    };
    exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA256());
    exports.sha224 = (0, utils_js_1.wrapConstructor)(() => new SHA224());
  }
});

// node_modules/base-x/src/index.js
var require_src = __commonJS({
  "node_modules/base-x/src/index.js"(exports, module2) {
    "use strict";
    function base(ALPHABET) {
      if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
      }
      var BASE_MAP = new Uint8Array(256);
      for (var j = 0; j < BASE_MAP.length; j++) {
        BASE_MAP[j] = 255;
      }
      for (var i = 0; i < ALPHABET.length; i++) {
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
          throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
      }
      var BASE = ALPHABET.length;
      var LEADER = ALPHABET.charAt(0);
      var FACTOR = Math.log(BASE) / Math.log(256);
      var iFACTOR = Math.log(256) / Math.log(BASE);
      function encode3(source) {
        if (source instanceof Uint8Array) {
        } else if (ArrayBuffer.isView(source)) {
          source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
          source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
          throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
          return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
          pbegin++;
          zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while (pbegin !== pend) {
          var carry = source[pbegin];
          var i2 = 0;
          for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
            carry += 256 * b58[it1] >>> 0;
            b58[it1] = carry % BASE >>> 0;
            carry = carry / BASE >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          pbegin++;
        }
        var it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
          it2++;
        }
        var str = LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
          str += ALPHABET.charAt(b58[it2]);
        }
        return str;
      }
      function decodeUnsafe(source) {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return new Uint8Array();
        }
        var psz = 0;
        var zeroes = 0;
        var length = 0;
        while (source[psz] === LEADER) {
          zeroes++;
          psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while (source[psz]) {
          var carry = BASE_MAP[source.charCodeAt(psz)];
          if (carry === 255) {
            return;
          }
          var i2 = 0;
          for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
            carry += BASE * b256[it3] >>> 0;
            b256[it3] = carry % 256 >>> 0;
            carry = carry / 256 >>> 0;
          }
          if (carry !== 0) {
            throw new Error("Non-zero carry");
          }
          length = i2;
          psz++;
        }
        var it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
          it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while (it4 !== size) {
          vch[j2++] = b256[it4++];
        }
        return vch;
      }
      function decode3(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
          return buffer;
        }
        throw new Error("Non-base" + BASE + " character");
      }
      return {
        encode: encode3,
        decodeUnsafe,
        decode: decode3
      };
    }
    module2.exports = base;
  }
});

// node_modules/bs58/index.js
var require_bs58 = __commonJS({
  "node_modules/bs58/index.js"(exports, module2) {
    var basex = require_src();
    var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    module2.exports = basex(ALPHABET);
  }
});

// node_modules/bs58check/base.js
var require_base = __commonJS({
  "node_modules/bs58check/base.js"(exports, module2) {
    "use strict";
    var base58 = require_bs58();
    module2.exports = function(checksumFn) {
      function encode3(payload) {
        var payloadU8 = Uint8Array.from(payload);
        var checksum = checksumFn(payloadU8);
        var length = payloadU8.length + 4;
        var both = new Uint8Array(length);
        both.set(payloadU8, 0);
        both.set(checksum.subarray(0, 4), payloadU8.length);
        return base58.encode(both, length);
      }
      function decodeRaw(buffer) {
        var payload = buffer.slice(0, -4);
        var checksum = buffer.slice(-4);
        var newChecksum = checksumFn(payload);
        if (checksum[0] ^ newChecksum[0] | checksum[1] ^ newChecksum[1] | checksum[2] ^ newChecksum[2] | checksum[3] ^ newChecksum[3]) return;
        return payload;
      }
      function decodeUnsafe(string) {
        var buffer = base58.decodeUnsafe(string);
        if (!buffer) return;
        return decodeRaw(buffer);
      }
      function decode3(string) {
        var buffer = base58.decode(string);
        var payload = decodeRaw(buffer, checksumFn);
        if (!payload) throw new Error("Invalid checksum");
        return payload;
      }
      return {
        encode: encode3,
        decode: decode3,
        decodeUnsafe
      };
    };
  }
});

// node_modules/bs58check/index.js
var require_bs58check = __commonJS({
  "node_modules/bs58check/index.js"(exports, module2) {
    "use strict";
    var { sha256: sha2562 } = require_sha256();
    var bs58checkBase = require_base();
    function sha256x2(buffer) {
      return sha2562(sha2562(buffer));
    }
    module2.exports = bs58checkBase(sha256x2);
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse2(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse2(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module2) {
    function setup2(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash2 = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
          hash2 |= 0;
        }
        return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug8(...args) {
          if (!debug8.enabled) {
            return;
          }
          const self2 = debug8;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self2.diff = ms;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug8.namespace = namespace;
        debug8.useColors = createDebug.useColors();
        debug8.color = createDebug.selectColor(namespace);
        debug8.extend = extend;
        debug8.destroy = createDebug.destroy;
        Object.defineProperty(debug8, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug8);
        }
        return debug8;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup2;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module2) {
    exports.formatArgs = formatArgs;
    exports.save = save2;
    exports.load = load4;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save2(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load4() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter2() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter2.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter2.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter2.prototype.emit = function emit2(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter2.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter2.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
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
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
    EventEmitter2.prefixed = prefix;
    EventEmitter2.EventEmitter = EventEmitter2;
    if ("undefined" !== typeof module2) {
      module2.exports = EventEmitter2;
    }
  }
});

// node_modules/fast-sha256/sha256.js
var require_sha2562 = __commonJS({
  "node_modules/fast-sha256/sha256.js"(exports, module2) {
    (function(root, factory2) {
      var exports2 = {};
      factory2(exports2);
      var sha2562 = exports2["default"];
      for (var k in exports2) {
        sha2562[k] = exports2[k];
      }
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        module2.exports = sha2562;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha2562;
        });
      } else {
        root.sha256 = sha2562;
      }
    })(exports, function(exports2) {
      "use strict";
      exports2.__esModule = true;
      exports2.digestLength = 32;
      exports2.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f2, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f2 = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f2 ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g;
            g = f2;
            f2 = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f2;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      var Hash = (
        /** @class */
        function() {
          function Hash2() {
            this.digestLength = exports2.digestLength;
            this.blockSize = exports2.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from3, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from3[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        }()
      );
      exports2.Hash = Hash;
      var HMAC = (
        /** @class */
        function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        }()
      );
      exports2.HMAC = HMAC;
      function hash2(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hash = hash2;
      exports2["default"] = hash2;
      function hmac(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports2.hmac = hmac;
      function fillBuffer(buffer, hmac2, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac2.reset();
        if (num > 1) {
          hmac2.update(buffer);
        }
        if (info) {
          hmac2.update(info);
        }
        hmac2.update(counter);
        hmac2.finish(buffer);
        counter[0]++;
      }
      var hkdfSalt = new Uint8Array(exports2.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      exports2.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      exports2.pbkdf2 = pbkdf2;
    });
  }
});

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
function valueAt(target2, prop) {
  const { context, objectId, path, textV2 } = target2;
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
  get(target2, key) {
    const { context, objectId, cache: cache2 } = target2;
    if (key === Symbol.toStringTag) {
      return target2[Symbol.toStringTag];
    }
    if (key === OBJECT_ID)
      return objectId;
    if (key === IS_PROXY)
      return true;
    if (key === TRACE)
      return target2.trace;
    if (key === STATE)
      return { handle: context, textV2: target2.textV2 };
    if (!cache2[key]) {
      cache2[key] = valueAt(target2, key);
    }
    return cache2[key];
  },
  set(target2, key, val) {
    const { context, objectId, path, textV2 } = target2;
    target2.cache = {};
    if (isSameDocument(val, context)) {
      throw new RangeError("Cannot create a reference to an existing document object");
    }
    if (key === TRACE) {
      target2.trace = val;
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
  deleteProperty(target2, key) {
    const { context, objectId } = target2;
    target2.cache = {};
    context.delete(objectId, key);
    return true;
  },
  has(target2, key) {
    const value = this.get(target2, key);
    return value !== void 0;
  },
  getOwnPropertyDescriptor(target2, key) {
    const value = this.get(target2, key);
    if (typeof value !== "undefined") {
      return {
        configurable: true,
        enumerable: true,
        value
      };
    }
  },
  ownKeys(target2) {
    const { context, objectId } = target2;
    const keys = context.keys(objectId);
    return [...new Set(keys)];
  }
};
var ListHandler = {
  get(target2, index) {
    const { context, objectId } = target2;
    index = parseListIndex(index);
    if (index === Symbol.hasInstance) {
      return (instance) => {
        return Array.isArray(instance);
      };
    }
    if (index === Symbol.toStringTag) {
      return target2[Symbol.toStringTag];
    }
    if (index === OBJECT_ID)
      return objectId;
    if (index === IS_PROXY)
      return true;
    if (index === TRACE)
      return target2.trace;
    if (index === STATE)
      return { handle: context };
    if (index === "length")
      return context.length(objectId);
    if (typeof index === "number") {
      return valueAt(target2, index);
    } else {
      return listMethods(target2)[index];
    }
  },
  set(target2, index, val) {
    const { context, objectId, path, textV2 } = target2;
    index = parseListIndex(index);
    if (isSameDocument(val, context)) {
      throw new RangeError("Cannot create a reference to an existing document object");
    }
    if (index === CLEAR_CACHE) {
      return true;
    }
    if (index === TRACE) {
      target2.trace = val;
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
  deleteProperty(target2, index) {
    const { context, objectId } = target2;
    index = parseListIndex(index);
    const elem = context.get(objectId, index);
    if (elem != null && elem[0] == "counter") {
      throw new TypeError("Unsupported operation: deleting a counter from a list");
    }
    context.delete(objectId, index);
    return true;
  },
  has(target2, index) {
    const { context, objectId } = target2;
    index = parseListIndex(index);
    if (typeof index === "number") {
      return index < context.length(objectId);
    }
    return index === "length";
  },
  getOwnPropertyDescriptor(target2, index) {
    const { context, objectId } = target2;
    if (index === "length")
      return { writable: true, value: context.length(objectId) };
    if (index === OBJECT_ID)
      return { configurable: false, enumerable: false, value: objectId };
    index = parseListIndex(index);
    const value = valueAt(target2, index);
    return { configurable: true, enumerable: true, value };
  },
  getPrototypeOf(target2) {
    return Object.getPrototypeOf(target2);
  },
  ownKeys() {
    const keys = [];
    keys.push("length");
    return keys;
  }
};
var TextHandler = Object.assign({}, ListHandler, {
  get(target2, index) {
    const { context, objectId } = target2;
    index = parseListIndex(index);
    if (index === Symbol.hasInstance) {
      return (instance) => {
        return Array.isArray(instance);
      };
    }
    if (index === Symbol.toStringTag) {
      return target2[Symbol.toStringTag];
    }
    if (index === OBJECT_ID)
      return objectId;
    if (index === IS_PROXY)
      return true;
    if (index === TRACE)
      return target2.trace;
    if (index === STATE)
      return { handle: context };
    if (index === "length")
      return context.length(objectId);
    if (typeof index === "number") {
      return valueAt(target2, index);
    } else {
      return textMethods(target2)[index] || listMethods(target2)[index];
    }
  },
  getPrototypeOf() {
    return Object.getPrototypeOf(new Text());
  }
});
function mapProxy(context, objectId, textV2, path) {
  const target2 = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2
  };
  const proxied = {};
  Object.assign(proxied, target2);
  const result = new Proxy(proxied, MapHandler);
  return result;
}
function listProxy(context, objectId, textV2, path) {
  const target2 = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2
  };
  const proxied = [];
  Object.assign(proxied, target2);
  return new Proxy(proxied, ListHandler);
}
function textProxy(context, objectId, path) {
  const target2 = {
    context,
    objectId,
    path: path || [],
    cache: {},
    textV2: false
  };
  const proxied = {};
  Object.assign(proxied, target2);
  return new Proxy(proxied, TextHandler);
}
function rootProxy(context, textV2) {
  return mapProxy(context, "_root", textV2, []);
}
function listMethods(target2) {
  const { context, objectId, path, textV2 } = target2;
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
      const last = valueAt(target2, length - 1);
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
      const first = valueAt(target2, 0);
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
        const value = valueAt(target2, index);
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
          const value = valueAt(target2, i);
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
          const value = valueAt(target2, i++);
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
        value = valueAt(target2, list.length);
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
      let value = valueAt(target2, i);
      while (value !== void 0) {
        yield value;
        i += 1;
        value = valueAt(target2, i);
      }
    }
  };
  return methods;
}
function textMethods(target2) {
  const { context, objectId } = target2;
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
        listMethods(target2).insertAt(index, ...values);
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
    let debug8 = "[";
    if (length > 0) {
      debug8 += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug8 += ", " + debugString(val[i]);
    }
    debug8 += "]";
    return debug8;
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
  getChangeByHash(hash2) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getChangeByHash(retptr, this.__wbg_ptr, addHeapObject(hash2));
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
  getDecodedChangeByHash(hash2) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.automerge_getDecodedChangeByHash(retptr, this.__wbg_ptr, addHeapObject(hash2));
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
  for (const hash2 of heads) {
    if (!state.handle.getChangeByHash(hash2)) {
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
  getConflicts: () => getConflicts,
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
function getConflicts(doc, prop) {
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

// node_modules/@automerge/automerge-repo/dist/AutomergeUrl.js
var import_bs58check = __toESM(require_bs58check(), 1);
var urlPrefix = "automerge:";
var parseAutomergeUrl = (url) => {
  const regex = new RegExp(`^${urlPrefix}(\\w+)$`);
  const [, docMatch] = url.match(regex) || [];
  const documentId = docMatch;
  const binaryDocumentId = documentIdToBinary(documentId);
  if (!binaryDocumentId)
    throw new Error("Invalid document URL: " + url);
  return {
    /** unencoded DocumentId */
    binaryDocumentId,
    /** encoded DocumentId */
    documentId
  };
};
var stringifyAutomergeUrl = (arg) => {
  const documentId = arg instanceof Uint8Array || typeof arg === "string" ? arg : "documentId" in arg ? arg.documentId : void 0;
  const encodedDocumentId = documentId instanceof Uint8Array ? binaryToDocumentId(documentId) : typeof documentId === "string" ? documentId : void 0;
  if (encodedDocumentId === void 0)
    throw new Error("Invalid documentId: " + documentId);
  return urlPrefix + encodedDocumentId;
};
var isValidAutomergeUrl = (str) => {
  if (!str || !str.startsWith(urlPrefix))
    return false;
  const automergeUrl = str;
  try {
    const { documentId } = parseAutomergeUrl(automergeUrl);
    return isValidDocumentId(documentId);
  } catch {
    return false;
  }
};
var isValidDocumentId = (str) => {
  const binaryDocumentID = documentIdToBinary(str);
  if (binaryDocumentID === void 0)
    return false;
  const documentId = stringify_default(binaryDocumentID);
  return validate_default(documentId);
};
var isValidUuid = (str) => validate_default(str);
var generateAutomergeUrl = () => {
  const documentId = v4_default(null, new Uint8Array(16));
  return stringifyAutomergeUrl({ documentId });
};
var documentIdToBinary = (docId) => import_bs58check.default.decodeUnsafe(docId);
var binaryToDocumentId = (docId) => import_bs58check.default.encode(docId);
var interpretAsDocumentId = (id) => {
  if (id instanceof Uint8Array)
    return binaryToDocumentId(id);
  if (isValidAutomergeUrl(id))
    return parseAutomergeUrl(id).documentId;
  if (isValidDocumentId(id))
    return id;
  if (isValidUuid(id)) {
    console.warn("Future versions will not support UUIDs as document IDs; use Automerge URLs instead.");
    const binaryDocumentID = parse_default(id);
    return binaryToDocumentId(binaryDocumentID);
  }
  throw new Error(`Invalid AutomergeUrl: '${id}'`);
};

// node_modules/@automerge/automerge-repo/dist/helpers/cbor.js
var cbor_exports = {};
__export(cbor_exports, {
  decode: () => decode2,
  encode: () => encode2
});

// node_modules/cbor-x/decode.js
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position = 0;
var EMPTY_ARRAY = [];
var LEGACY_RECORD_INLINE_ID = 105;
var RECORD_DEFINITIONS_ID = 57342;
var RECORD_INLINE_ID = 57343;
var BUNDLED_STRINGS_ID = 57337;
var PACKED_REFERENCE_TAG_ID = 6;
var STOP_CODE = {};
var maxArraySize = 11281e4;
var maxMapSize = 1681e4;
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentDecoder = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var currentExtensionRanges = [];
var packedValues;
var dataView;
var restoreMapsAsObject;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
var Decoder = class _Decoder {
  constructor(options) {
    if (options) {
      if ((options.keyMap || options._keyMap) && !options.useRecords) {
        options.useRecords = false;
        options.mapsAsObjects = true;
      }
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.getStructures)
        options.getShared = options.getStructures;
      if (options.getShared && !options.structures)
        (options.structures = []).uninitialized = true;
      if (options.keyMap) {
        this.mapKey = /* @__PURE__ */ new Map();
        for (let [k, v] of Object.entries(options.keyMap)) this.mapKey.set(v, k);
      }
    }
    Object.assign(this, options);
  }
  /*
  decodeKey(key) {
  	return this.keyMap
  		? Object.keys(this.keyMap)[Object.values(this.keyMap).indexOf(key)] || key
  		: key
  }
  */
  decodeKey(key) {
    return this.keyMap ? this.mapKey.get(key) || key : key;
  }
  encodeKey(key) {
    return this.keyMap && this.keyMap.hasOwnProperty(key) ? this.keyMap[key] : key;
  }
  encodeKeys(rec) {
    if (!this._keyMap) return rec;
    let map = /* @__PURE__ */ new Map();
    for (let [k, v] of Object.entries(rec)) map.set(this._keyMap.hasOwnProperty(k) ? this._keyMap[k] : k, v);
    return map;
  }
  decodeKeys(map) {
    if (!this._keyMap || map.constructor.name != "Map") return map;
    if (!this._mapKey) {
      this._mapKey = /* @__PURE__ */ new Map();
      for (let [k, v] of Object.entries(this._keyMap)) this._mapKey.set(v, k);
    }
    let res = {};
    map.forEach((v, k) => res[safeKey(this._mapKey.has(k) ? this._mapKey.get(k) : k)] = v);
    return res;
  }
  mapDecode(source, end) {
    let res = this.decode(source);
    if (this._keyMap) {
      switch (res.constructor.name) {
        case "Array":
          return res.map((r) => this.decodeKeys(r));
      }
    }
    return res;
  }
  decode(source, end) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.decode(source, end) : _Decoder.prototype.decode.call(defaultOptions, source, end);
      });
    }
    srcEnd = end > -1 ? end : source.length;
    position = 0;
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof _Decoder) {
      currentDecoder = this;
      packedValues = this.sharedValues && (this.pack ? new Array(this.maxPrivatePackedValues || 16).concat(this.sharedValues) : this.sharedValues);
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead();
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentDecoder = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
      packedValues = null;
    }
    return checkedRead();
  }
  decodeMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      let size = source.length;
      sequentialMode = true;
      let value = this ? this.decode(source, size) : defaultDecoder.decode(source, size);
      if (forEach) {
        if (forEach(value) === false) {
          return;
        }
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead()) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
};
function checkedRead() {
  try {
    let result = read();
    if (bundledStrings) {
      if (position >= bundledStrings.postBundlePosition) {
        let error = new Error("Unexpected bundle position");
        error.incomplete = true;
        throw error;
      }
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (position == srcEnd) {
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      let error = new Error("Unexpected end of CBOR data");
      error.incomplete = true;
      throw error;
    } else if (!sequentialMode) {
      throw new Error("Data read, but end of buffer not reached");
    }
    return result;
  } catch (error) {
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer")) {
      error.incomplete = true;
    }
    throw error;
  }
}
function read() {
  let token = src[position++];
  let majorType = token >> 5;
  token = token & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        if (majorType == 7) {
          return getFloat16();
        }
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        if (majorType == 7) {
          let value = dataView.getFloat32(position);
          if (currentDecoder.useFloat32 > 2) {
            let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
            position += 4;
            return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
          }
          position += 4;
          return value;
        }
        token = dataView.getUint32(position);
        position += 4;
        break;
      case 27:
        if (majorType == 7) {
          let value = dataView.getFloat64(position);
          position += 8;
          return value;
        }
        if (majorType > 1) {
          if (dataView.getUint32(position) > 0)
            throw new Error("JavaScript does not support arrays, maps, or strings with length over 4294967295");
          token = dataView.getUint32(position + 4);
        } else if (currentDecoder.int64AsNumber) {
          token = dataView.getUint32(position) * 4294967296;
          token += dataView.getUint32(position + 4);
        } else
          token = dataView.getBigUint64(position);
        position += 8;
        break;
      case 31:
        switch (majorType) {
          case 2:
          case 3:
            throw new Error("Indefinite length not supported for byte or text strings");
          case 4:
            let array = [];
            let value, i = 0;
            while ((value = read()) != STOP_CODE) {
              if (i >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
              array[i++] = value;
            }
            return majorType == 4 ? array : majorType == 3 ? array.join("") : Buffer.concat(array);
          case 5:
            let key;
            if (currentDecoder.mapsAsObjects) {
              let object = {};
              let i2 = 0;
              if (currentDecoder.keyMap) {
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                  object[safeKey(currentDecoder.decodeKey(key))] = read();
                }
              } else {
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) throw new Error(`Property count exceeds ${maxMapSize}`);
                  object[safeKey(key)] = read();
                }
              }
              return object;
            } else {
              if (restoreMapsAsObject) {
                currentDecoder.mapsAsObjects = true;
                restoreMapsAsObject = false;
              }
              let map = /* @__PURE__ */ new Map();
              if (currentDecoder.keyMap) {
                let i2 = 0;
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) {
                    throw new Error(`Map size exceeds ${maxMapSize}`);
                  }
                  map.set(currentDecoder.decodeKey(key), read());
                }
              } else {
                let i2 = 0;
                while ((key = read()) != STOP_CODE) {
                  if (i2++ >= maxMapSize) {
                    throw new Error(`Map size exceeds ${maxMapSize}`);
                  }
                  map.set(key, read());
                }
              }
              return map;
            }
          case 7:
            return STOP_CODE;
          default:
            throw new Error("Invalid major type for indefinite length " + majorType);
        }
      default:
        throw new Error("Unknown token " + token);
    }
  }
  switch (majorType) {
    case 0:
      return token;
    case 1:
      return ~token;
    case 2:
      return readBin(token);
    case 3:
      if (srcStringEnd >= position) {
        return srcString.slice(position - srcStringStart, (position += token) - srcStringStart);
      }
      if (srcStringEnd == 0 && srcEnd < 140 && token < 32) {
        let string = token < 16 ? shortStringInJS(token) : longStringInJS(token);
        if (string != null)
          return string;
      }
      return readFixedString(token);
    case 4:
      if (token >= maxArraySize) throw new Error(`Array length exceeds ${maxArraySize}`);
      let array = new Array(token);
      for (let i = 0; i < token; i++) array[i] = read();
      return array;
    case 5:
      if (token >= maxMapSize) throw new Error(`Map size exceeds ${maxArraySize}`);
      if (currentDecoder.mapsAsObjects) {
        let object = {};
        if (currentDecoder.keyMap) for (let i = 0; i < token; i++) object[safeKey(currentDecoder.decodeKey(read()))] = read();
        else for (let i = 0; i < token; i++) object[safeKey(read())] = read();
        return object;
      } else {
        if (restoreMapsAsObject) {
          currentDecoder.mapsAsObjects = true;
          restoreMapsAsObject = false;
        }
        let map = /* @__PURE__ */ new Map();
        if (currentDecoder.keyMap) for (let i = 0; i < token; i++) map.set(currentDecoder.decodeKey(read()), read());
        else for (let i = 0; i < token; i++) map.set(read(), read());
        return map;
      }
    case 6:
      if (token >= BUNDLED_STRINGS_ID) {
        let structure = currentStructures[token & 8191];
        if (structure) {
          if (!structure.read) structure.read = createStructureReader(structure);
          return structure.read();
        }
        if (token < 65536) {
          if (token == RECORD_INLINE_ID) {
            let length = readJustLength();
            let id = read();
            let structure2 = read();
            recordDefinition(id, structure2);
            let object = {};
            if (currentDecoder.keyMap) for (let i = 2; i < length; i++) {
              let key = currentDecoder.decodeKey(structure2[i - 2]);
              object[safeKey(key)] = read();
            }
            else for (let i = 2; i < length; i++) {
              let key = structure2[i - 2];
              object[safeKey(key)] = read();
            }
            return object;
          } else if (token == RECORD_DEFINITIONS_ID) {
            let length = readJustLength();
            let id = read();
            for (let i = 2; i < length; i++) {
              recordDefinition(id++, read());
            }
            return read();
          } else if (token == BUNDLED_STRINGS_ID) {
            return readBundleExt();
          }
          if (currentDecoder.getShared) {
            loadShared();
            structure = currentStructures[token & 8191];
            if (structure) {
              if (!structure.read)
                structure.read = createStructureReader(structure);
              return structure.read();
            }
          }
        }
      }
      let extension = currentExtensions[token];
      if (extension) {
        if (extension.handlesRead)
          return extension(read);
        else
          return extension(read());
      } else {
        let input = read();
        for (let i = 0; i < currentExtensionRanges.length; i++) {
          let value = currentExtensionRanges[i](token, input);
          if (value !== void 0)
            return value;
        }
        return new Tag(input, token);
      }
    case 7:
      switch (token) {
        case 20:
          return false;
        case 21:
          return true;
        case 22:
          return null;
        case 23:
          return;
        case 31:
        default:
          let packedValue = (packedValues || getPackedValues())[token];
          if (packedValue !== void 0)
            return packedValue;
          throw new Error("Unknown token " + token);
      }
    default:
      if (isNaN(token)) {
        let error = new Error("Unexpected end of CBOR data");
        error.incomplete = true;
        throw error;
      }
      throw new Error("Unknown CBOR token " + token);
  }
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure) {
  if (!structure) throw new Error("Structure is required in record definition");
  function readObject() {
    let length = src[position++];
    length = length & 31;
    if (length > 23) {
      switch (length) {
        case 24:
          length = src[position++];
          break;
        case 25:
          length = dataView.getUint16(position);
          position += 2;
          break;
        case 26:
          length = dataView.getUint32(position);
          position += 4;
          break;
        default:
          throw new Error("Expected array header, but got " + src[position - 1]);
      }
    }
    let compiledReader = this.compiledReader;
    while (compiledReader) {
      if (compiledReader.propertyCount === length)
        return compiledReader(read);
      compiledReader = compiledReader.next;
    }
    if (this.slowReads++ >= inlineObjectReadThreshold) {
      let array = this.length == length ? this : this.slice(0, length);
      compiledReader = currentDecoder.keyMap ? new Function("r", "return {" + array.map((k) => currentDecoder.decodeKey(k)).map((k) => validName.test(k) ? safeKey(k) + ":r()" : "[" + JSON.stringify(k) + "]:r()").join(",") + "}") : new Function("r", "return {" + array.map((key) => validName.test(key) ? safeKey(key) + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "}");
      if (this.compiledReader)
        compiledReader.next = this.compiledReader;
      compiledReader.propertyCount = length;
      this.compiledReader = compiledReader;
      return compiledReader(read);
    }
    let object = {};
    if (currentDecoder.keyMap) for (let i = 0; i < length; i++) object[safeKey(currentDecoder.decodeKey(this[i]))] = read();
    else for (let i = 0; i < length; i++) {
      object[safeKey(this[i])] = read();
    }
    return object;
  }
  structure.slowReads = 0;
  return readObject;
}
function safeKey(key) {
  if (typeof key === "string") return key === "__proto__" ? "__proto_" : key;
  if (typeof key === "number" || typeof key === "boolean" || typeof key === "bigint") return key.toString();
  if (key == null) return key + "";
  throw new Error("Invalid property name type " + typeof key);
}
var readFixedString = readStringJS;
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f2 = src[position++];
      if ((e & 128) > 0 || (f2 & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f2);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f2, g);
    } else {
      let e = src[position++];
      let f2 = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f2 & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f2, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f2, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f2, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f2, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f2, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f2, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f2, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f2, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
function readBin(length) {
  return currentDecoder.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function getFloat16() {
  let byte0 = src[position++];
  let byte1 = src[position++];
  let exponent = (byte0 & 127) >> 2;
  if (exponent === 31) {
    if (byte1 || byte0 & 3)
      return NaN;
    return byte0 & 128 ? -Infinity : Infinity;
  }
  if (exponent === 0) {
    let abs = ((byte0 & 3) << 8 | byte1) / (1 << 24);
    return byte0 & 128 ? -abs : abs;
  }
  u8Array[3] = byte0 & 128 | // sign bit
  (exponent >> 1) + 56;
  u8Array[2] = (byte0 & 7) << 5 | // last exponent bit and first two mantissa bits
  byte1 >> 3;
  u8Array[1] = byte1 << 5;
  u8Array[0] = 0;
  return f32Array[0];
}
var keyCache = new Array(4096);
var Tag = class {
  constructor(value, tag) {
    this.value = value;
    this.tag = tag;
  }
};
currentExtensions[0] = (dateString) => {
  return new Date(dateString);
};
currentExtensions[1] = (epochSec) => {
  return new Date(Math.round(epochSec * 1e3));
};
currentExtensions[2] = (buffer) => {
  let value = BigInt(0);
  for (let i = 0, l = buffer.byteLength; i < l; i++) {
    value = BigInt(buffer[i]) + (value << BigInt(8));
  }
  return value;
};
currentExtensions[3] = (buffer) => {
  return BigInt(-1) - currentExtensions[2](buffer);
};
currentExtensions[4] = (fraction) => {
  return +(fraction[1] + "e" + fraction[0]);
};
currentExtensions[5] = (fraction) => {
  return fraction[1] * Math.exp(fraction[0] * Math.log(2));
};
var recordDefinition = (id, structure) => {
  id = id - 57344;
  let existingStructure = currentStructures[id];
  if (existingStructure && existingStructure.isShared) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure);
};
currentExtensions[LEGACY_RECORD_INLINE_ID] = (data) => {
  let length = data.length;
  let structure = data[1];
  recordDefinition(data[0], structure);
  let object = {};
  for (let i = 2; i < length; i++) {
    let key = structure[i - 2];
    object[safeKey(key)] = data[i];
  }
  return object;
};
currentExtensions[14] = (value) => {
  if (bundledStrings)
    return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 += value);
  return new Tag(value, 14);
};
currentExtensions[15] = (value) => {
  if (bundledStrings)
    return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
  return new Tag(value, 15);
};
var glbl = { Error, RegExp };
currentExtensions[27] = (data) => {
  return (glbl[data[0]] || Error)(data[1], data[2]);
};
var packedTable = (read2) => {
  if (src[position++] != 132) {
    let error = new Error("Packed values structure must be followed by a 4 element array");
    if (src.length < position)
      error.incomplete = true;
    throw error;
  }
  let newPackedValues = read2();
  if (!newPackedValues || !newPackedValues.length) {
    let error = new Error("Packed values structure must be followed by a 4 element array");
    error.incomplete = true;
    throw error;
  }
  packedValues = packedValues ? newPackedValues.concat(packedValues.slice(newPackedValues.length)) : newPackedValues;
  packedValues.prefixes = read2();
  packedValues.suffixes = read2();
  return read2();
};
packedTable.handlesRead = true;
currentExtensions[51] = packedTable;
currentExtensions[PACKED_REFERENCE_TAG_ID] = (data) => {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      return new Tag(data, PACKED_REFERENCE_TAG_ID);
  }
  if (typeof data == "number")
    return packedValues[16 + (data >= 0 ? 2 * data : -2 * data - 1)];
  let error = new Error("No support for non-integer packed references yet");
  if (data === void 0)
    error.incomplete = true;
  throw error;
};
currentExtensions[28] = (read2) => {
  if (!referenceMap) {
    referenceMap = /* @__PURE__ */ new Map();
    referenceMap.id = 0;
  }
  let id = referenceMap.id++;
  let startingPosition = position;
  let token = src[position];
  let target2;
  if (token >> 5 == 4)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read2();
  if (refEntry.used) {
    if (Object.getPrototypeOf(target2) !== Object.getPrototypeOf(targetProperties)) {
      position = startingPosition;
      target2 = targetProperties;
      referenceMap.set(id, { target: target2 });
      targetProperties = read2();
    }
    return Object.assign(target2, targetProperties);
  }
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[28].handlesRead = true;
currentExtensions[29] = (id) => {
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[258] = (array) => new Set(array);
(currentExtensions[259] = (read2) => {
  if (currentDecoder.mapsAsObjects) {
    currentDecoder.mapsAsObjects = false;
    restoreMapsAsObject = true;
  }
  return read2();
}).handlesRead = true;
function combine(a, b) {
  if (typeof a === "string")
    return a + b;
  if (a instanceof Array)
    return a.concat(b);
  return Object.assign({}, a, b);
}
function getPackedValues() {
  if (!packedValues) {
    if (currentDecoder.getShared)
      loadShared();
    else
      throw new Error("No packed values available");
  }
  return packedValues;
}
var SHARED_DATA_TAG_ID = 1399353956;
currentExtensionRanges.push((tag, input) => {
  if (tag >= 225 && tag <= 255)
    return combine(getPackedValues().prefixes[tag - 224], input);
  if (tag >= 28704 && tag <= 32767)
    return combine(getPackedValues().prefixes[tag - 28672], input);
  if (tag >= 1879052288 && tag <= 2147483647)
    return combine(getPackedValues().prefixes[tag - 1879048192], input);
  if (tag >= 216 && tag <= 223)
    return combine(input, getPackedValues().suffixes[tag - 216]);
  if (tag >= 27647 && tag <= 28671)
    return combine(input, getPackedValues().suffixes[tag - 27639]);
  if (tag >= 1811940352 && tag <= 1879048191)
    return combine(input, getPackedValues().suffixes[tag - 1811939328]);
  if (tag == SHARED_DATA_TAG_ID) {
    return {
      packedValues,
      structures: currentStructures.slice(0),
      version: input
    };
  }
  if (tag == 55799)
    return input;
});
var isLittleEndianMachine = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
var typedArrays = [
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? { name: "BigUint64Array" } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? { name: "BigInt64Array" } : BigInt64Array,
  Float32Array,
  Float64Array
];
var typedArrayTags = [64, 68, 69, 70, 71, 72, 77, 78, 79, 85, 86];
for (let i = 0; i < typedArrays.length; i++) {
  registerTypedArray(typedArrays[i], typedArrayTags[i]);
}
function registerTypedArray(TypedArray, tag) {
  let dvMethod = "get" + TypedArray.name.slice(0, -5);
  let bytesPerElement;
  if (typeof TypedArray === "function")
    bytesPerElement = TypedArray.BYTES_PER_ELEMENT;
  else
    TypedArray = null;
  for (let littleEndian = 0; littleEndian < 2; littleEndian++) {
    if (!littleEndian && bytesPerElement == 1)
      continue;
    let sizeShift = bytesPerElement == 2 ? 1 : bytesPerElement == 4 ? 2 : bytesPerElement == 8 ? 3 : 0;
    currentExtensions[littleEndian ? tag : tag - 4] = bytesPerElement == 1 || littleEndian == isLittleEndianMachine ? (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      if (!currentDecoder.copyBuffers) {
        if (bytesPerElement === 1 || bytesPerElement === 2 && !(buffer.byteOffset & 1) || bytesPerElement === 4 && !(buffer.byteOffset & 3) || bytesPerElement === 8 && !(buffer.byteOffset & 7))
          return new TypedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength >> sizeShift);
      }
      return new TypedArray(Uint8Array.prototype.slice.call(buffer, 0).buffer);
    } : (buffer) => {
      if (!TypedArray)
        throw new Error("Could not find typed array for code " + tag);
      let dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      let elements = buffer.length >> sizeShift;
      let ta = new TypedArray(elements);
      let method = dv[dvMethod];
      for (let i = 0; i < elements; i++) {
        ta[i] = method.call(dv, i << sizeShift, littleEndian);
      }
      return ta;
    };
  }
}
function readBundleExt() {
  let length = readJustLength();
  let bundlePosition = position + read();
  for (let i = 2; i < length; i++) {
    let bundleLength = readJustLength();
    position += bundleLength;
  }
  let dataPosition = position;
  position = bundlePosition;
  bundledStrings = [readStringJS(readJustLength()), readStringJS(readJustLength())];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
}
function readJustLength() {
  let token = src[position++] & 31;
  if (token > 23) {
    switch (token) {
      case 24:
        token = src[position++];
        break;
      case 25:
        token = dataView.getUint16(position);
        position += 2;
        break;
      case 26:
        token = dataView.getUint32(position);
        position += 4;
        break;
    }
  }
  return token;
}
function loadShared() {
  if (currentDecoder.getShared) {
    let sharedData = saveState(() => {
      src = null;
      return currentDecoder.getShared();
    }) || {};
    let updatedStructures = sharedData.structures || [];
    currentDecoder.sharedVersion = sharedData.version;
    packedValues = currentDecoder.sharedValues = sharedData.packedValues;
    if (currentStructures === true)
      currentDecoder.structures = currentStructures = updatedStructures;
    else
      currentStructures.splice.apply(currentStructures, [0, updatedStructures.length].concat(updatedStructures));
  }
}
function saveState(callback) {
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedDecoder = currentDecoder;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentDecoder = savedDecoder;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var defaultDecoder = new Decoder({ useRecords: false });
var decode = defaultDecoder.decode;
var decodeMultiple = defaultDecoder.decodeMultiple;
var FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};

// node_modules/cbor-x/encode.js
var textEncoder;
try {
  textEncoder = new TextEncoder();
} catch (error) {
}
var extensions;
var extensionClasses;
var Buffer2 = typeof globalThis === "object" && globalThis.Buffer;
var hasNodeBuffer = typeof Buffer2 !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? Buffer2.allocUnsafeSlow : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer2 : Uint8Array;
var MAX_STRUCTURES = 256;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var throwOnIterable;
var target;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var MAX_BUNDLE_SIZE = 61440;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");
var Encoder = class extends Decoder {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let sharedStructures;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    options = options || {};
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3, maxBytes) {
      return target.utf8Write(string, position3, maxBytes);
    } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
      return textEncoder.encodeInto(string, target.subarray(position3)).written;
    } : false;
    let encoder = this;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 128 : 0;
    if (maxSharedStructures > 8190)
      throw new Error("Maximum maxSharedStructure is 8190");
    let isSequential = options.sequential;
    if (isSequential) {
      maxSharedStructures = 0;
    }
    if (!this.structures)
      this.structures = [];
    if (this.saveStructures)
      this.saveShared = this.saveStructures;
    let samplingPackedValues, packedObjectMap2, sharedValues = options.sharedValues;
    let sharedPackedObjectMap2;
    if (sharedValues) {
      sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
      for (let i = 0, l = sharedValues.length; i < l; i++) {
        sharedPackedObjectMap2[sharedValues[i]] = i;
      }
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.mapEncode = function(value, encodeOptions) {
      if (this._keyMap && !this._mapped) {
        switch (value.constructor.name) {
          case "Array":
            value = value.map((r) => this.encodeKeys(r));
            break;
        }
      }
      return this.encode(value, encodeOptions);
    };
    this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = new DataView(target.buffer, 0, 8192);
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = new DataView(target.buffer, 0, target.length);
        safeEnd = target.length - 10;
        position2 = 0;
      } else if (encodeOptions === REUSE_BUFFER_MODE)
        position2 = position2 + 7 & 2147483640;
      start = position2;
      if (encoder.useSelfDescribedHeader) {
        targetView.setUint32(position2, 3654940416);
        position2 += 3;
      }
      referenceMap2 = encoder.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (encoder.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      sharedStructures = encoder.structures;
      if (sharedStructures) {
        if (sharedStructures.uninitialized) {
          let sharedData = encoder.getShared() || {};
          encoder.structures = sharedStructures = sharedData.structures || [];
          encoder.sharedVersion = sharedData.version;
          let sharedValues2 = encoder.sharedValues = sharedData.packedValues;
          if (sharedValues2) {
            sharedPackedObjectMap2 = {};
            for (let i = 0, l = sharedValues2.length; i < l; i++)
              sharedPackedObjectMap2[sharedValues2[i]] = i;
          }
        }
        let sharedStructuresLength = sharedStructures.length;
        if (sharedStructuresLength > maxSharedStructures && !isSequential)
          sharedStructuresLength = maxSharedStructures;
        if (!sharedStructures.transitions) {
          sharedStructures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedStructuresLength; i++) {
            let keys = sharedStructures[i];
            if (!keys)
              continue;
            let nextTransition, transition = sharedStructures.transitions;
            for (let j = 0, l = keys.length; j < l; j++) {
              if (transition[RECORD_SYMBOL] === void 0)
                transition[RECORD_SYMBOL] = i;
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i | 1048576;
          }
        }
        if (!isSequential)
          sharedStructures.nextId = sharedStructuresLength;
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      structures = sharedStructures || [];
      packedObjectMap2 = sharedPackedObjectMap2;
      if (options.pack) {
        let packedValues2 = /* @__PURE__ */ new Map();
        packedValues2.values = [];
        packedValues2.encoder = encoder;
        packedValues2.maxValues = options.maxPrivatePackedValues || (sharedPackedObjectMap2 ? 16 : Infinity);
        packedValues2.objectMap = sharedPackedObjectMap2 || false;
        packedValues2.samplingPackedValues = samplingPackedValues;
        findRepetitiveStrings(value, packedValues2);
        if (packedValues2.values.length > 0) {
          target[position2++] = 216;
          target[position2++] = 51;
          writeArrayHeader(4);
          let valuesArray = packedValues2.values;
          encode3(valuesArray);
          writeArrayHeader(0);
          writeArrayHeader(0);
          packedObjectMap2 = Object.create(sharedPackedObjectMap2 || null);
          for (let i = 0, l = valuesArray.length; i < l; i++) {
            packedObjectMap2[valuesArray[i]] = i;
          }
        }
      }
      throwOnIterable = encodeOptions & THROW_ON_ITERABLE;
      try {
        if (throwOnIterable)
          return;
        encode3(value);
        if (bundledStrings2) {
          writeBundles(start, encode3);
        }
        encoder.offset = position2;
        if (referenceMap2 && referenceMap2.idsToInsert) {
          position2 += referenceMap2.idsToInsert.length * 2;
          if (position2 > safeEnd)
            makeRoom(position2);
          encoder.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), referenceMap2.idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } finally {
        if (sharedStructures) {
          if (serializationsSinceTransitionRebuild < 10)
            serializationsSinceTransitionRebuild++;
          if (sharedStructures.length > maxSharedStructures)
            sharedStructures.length = maxSharedStructures;
          if (transitionsCount > 1e4) {
            sharedStructures.transitions = null;
            serializationsSinceTransitionRebuild = 0;
            transitionsCount = 0;
            if (recordIdsToRemove.length > 0)
              recordIdsToRemove = [];
          } else if (recordIdsToRemove.length > 0 && !isSequential) {
            for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
              recordIdsToRemove[i][RECORD_SYMBOL] = void 0;
            }
            recordIdsToRemove = [];
          }
        }
        if (hasSharedUpdate && encoder.saveShared) {
          if (encoder.structures.length > maxSharedStructures) {
            encoder.structures = encoder.structures.slice(0, maxSharedStructures);
          }
          let returnBuffer = target.subarray(start, position2);
          if (encoder.updateSharedData() === false)
            return encoder.encode(value);
          return returnBuffer;
        }
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    this.findCommonStringsToPack = () => {
      samplingPackedValues = /* @__PURE__ */ new Map();
      if (!sharedPackedObjectMap2)
        sharedPackedObjectMap2 = /* @__PURE__ */ Object.create(null);
      return (options2) => {
        let threshold = options2 && options2.threshold || 4;
        let position3 = this.pack ? options2.maxPrivatePackedValues || 16 : 0;
        if (!sharedValues)
          sharedValues = this.sharedValues = [];
        for (let [key, status] of samplingPackedValues) {
          if (status.count > threshold) {
            sharedPackedObjectMap2[key] = position3++;
            sharedValues.push(key);
            hasSharedUpdate = true;
          }
        }
        while (this.saveShared && this.updateSharedData() === false) {
        }
        samplingPackedValues = null;
      };
    };
    const encode3 = (value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type = typeof value;
      var length;
      if (type === "string") {
        if (packedObjectMap2) {
          let packedPosition = packedObjectMap2[value];
          if (packedPosition >= 0) {
            if (packedPosition < 16)
              target[position2++] = packedPosition + 224;
            else {
              target[position2++] = 198;
              if (packedPosition & 1)
                encode3(15 - packedPosition >> 1);
              else
                encode3(packedPosition - 16 >> 1);
            }
            return;
          } else if (samplingPackedValues && !options.pack) {
            let status = samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 1024) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            target[position2++] = 217;
            target[position2++] = 223;
            target[position2++] = 249;
            target[position2++] = bundledStrings2.position ? 132 : 130;
            target[position2++] = 26;
            extStart = position2 - start;
            position2 += 4;
            if (bundledStrings2.position) {
              writeBundles(start, encode3);
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = twoByte ? 206 : 207;
          encode3(strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c2, strPosition = position2 + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf8(value, position2 + headerSize, maxBytes);
        }
        if (length < 24) {
          target[position2++] = 96 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 120;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 121;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 122;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type === "number") {
        if (!this.alwaysUseFloat && value >>> 0 === value) {
          if (value < 24) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 24;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 25;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 26;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (!this.alwaysUseFloat && value >> 0 === value) {
          if (value >= -24) {
            target[position2++] = 31 - value;
          } else if (value >= -256) {
            target[position2++] = 56;
            target[position2++] = ~value;
          } else if (value >= -65536) {
            target[position2++] = 57;
            targetView.setUint16(position2, ~value);
            position2 += 2;
          } else {
            target[position2++] = 58;
            targetView.setUint32(position2, ~value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 250;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 251;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type === "object") {
        if (!value)
          target[position2++] = 246;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              target[position2++] = 216;
              target[position2++] = 29;
              target[position2++] = 25;
              if (!referee.references) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.references = [];
                idsToInsert.push(referee);
              }
              referee.references.push(position2 - start);
              position2 += 2;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value);
          } else if (constructor === Array) {
            length = value.length;
            if (length < 24) {
              target[position2++] = 128 | length;
            } else {
              writeArrayHeader(length);
            }
            for (let i = 0; i < length; i++) {
              encode3(value[i]);
            }
          } else if (constructor === Map) {
            if (this.mapsAsObjects ? this.useTag259ForMaps !== false : this.useTag259ForMaps) {
              target[position2++] = 217;
              target[position2++] = 1;
              target[position2++] = 3;
            }
            length = value.size;
            if (length < 24) {
              target[position2++] = 160 | length;
            } else if (length < 256) {
              target[position2++] = 184;
              target[position2++] = length;
            } else if (length < 65536) {
              target[position2++] = 185;
              target[position2++] = length >> 8;
              target[position2++] = length & 255;
            } else {
              target[position2++] = 186;
              targetView.setUint32(position2, length);
              position2 += 4;
            }
            if (encoder.keyMap) {
              for (let [key, entryValue] of value) {
                encode3(encoder.encodeKey(key));
                encode3(entryValue);
              }
            } else {
              for (let [key, entryValue] of value) {
                encode3(key);
                encode3(entryValue);
              }
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                let tag = extension.tag;
                if (tag == void 0)
                  tag = extension.getTag && extension.getTag.call(this, value);
                if (tag < 24) {
                  target[position2++] = 192 | tag;
                } else if (tag < 256) {
                  target[position2++] = 216;
                  target[position2++] = tag;
                } else if (tag < 65536) {
                  target[position2++] = 217;
                  target[position2++] = tag >> 8;
                  target[position2++] = tag & 255;
                } else if (tag > -1) {
                  target[position2++] = 218;
                  targetView.setUint32(position2, tag);
                  position2 += 4;
                }
                extension.encode.call(this, value, encode3, makeRoom);
                return;
              }
            }
            if (value[Symbol.iterator]) {
              if (throwOnIterable) {
                let error = new Error("Iterable should be serialized as iterator");
                error.iteratorNotHandled = true;
                throw error;
              }
              target[position2++] = 159;
              for (let entry of value) {
                encode3(entry);
              }
              target[position2++] = 255;
              return;
            }
            if (value[Symbol.asyncIterator] || isBlob(value)) {
              let error = new Error("Iterable/blob should be serialized as iterator");
              error.iteratorNotHandled = true;
              throw error;
            }
            if (this.useToJSON && value.toJSON) {
              const json = value.toJSON();
              if (json !== value)
                return encode3(json);
            }
            writeObject(value);
          }
        }
      } else if (type === "boolean") {
        target[position2++] = value ? 245 : 244;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(64) && value >= 0) {
          target[position2++] = 27;
          targetView.setBigUint64(position2, value);
        } else if (value > -(BigInt(1) << BigInt(64)) && value < 0) {
          target[position2++] = 59;
          targetView.setBigUint64(position2, -value - BigInt(1));
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 251;
            targetView.setFloat64(position2, Number(value));
          } else {
            if (value >= BigInt(0))
              target[position2++] = 194;
            else {
              target[position2++] = 195;
              value = BigInt(-1) - value;
            }
            let bytes = [];
            while (value) {
              bytes.push(Number(value & BigInt(255)));
              value >>= BigInt(8);
            }
            writeBuffer(new Uint8Array(bytes.reverse()), makeRoom);
            return;
          }
        }
        position2 += 8;
      } else if (type === "undefined") {
        target[position2++] = 247;
      } else {
        throw new Error("Unknown type: " + type);
      }
    };
    const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
      let keys = Object.keys(object);
      let vals = Object.values(object);
      let length = keys.length;
      if (length < 24) {
        target[position2++] = 160 | length;
      } else if (length < 256) {
        target[position2++] = 184;
        target[position2++] = length;
      } else if (length < 65536) {
        target[position2++] = 185;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 186;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      let key;
      if (encoder.keyMap) {
        for (let i = 0; i < length; i++) {
          encode3(encoder.encodeKey(keys[i]));
          encode3(vals[i]);
        }
      } else {
        for (let i = 0; i < length; i++) {
          encode3(keys[i]);
          encode3(vals[i]);
        }
      }
    } : (object) => {
      target[position2++] = 185;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      if (encoder.keyMap) {
        for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          encode3(encoder.encodeKey(key));
          encode3(object[key]);
          size++;
        }
      } else {
        for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          encode3(key);
          encode3(object[key]);
          size++;
        }
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    } : (object, skipValues) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      let length = 0;
      let parentRecordId;
      let keys;
      if (this.keyMap) {
        keys = Object.keys(object).map((k) => this.encodeKey(k));
        length = keys.length;
        for (let i = 0; i < length; i++) {
          let key = keys[i];
          nextTransition = transition[key];
          if (!nextTransition) {
            nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
            newTransitions++;
          }
          transition = nextTransition;
        }
      } else {
        for (let key in object) if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key)) {
          nextTransition = transition[key];
          if (!nextTransition) {
            if (transition[RECORD_SYMBOL] & 1048576) {
              parentRecordId = transition[RECORD_SYMBOL] & 65535;
            }
            nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
            newTransitions++;
          }
          transition = nextTransition;
          length++;
        }
      }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId !== void 0) {
        recordId &= 65535;
        target[position2++] = 217;
        target[position2++] = recordId >> 8 | 224;
        target[position2++] = recordId & 255;
      } else {
        if (!keys)
          keys = transition.__keys__ || (transition.__keys__ = Object.keys(object));
        if (parentRecordId === void 0) {
          recordId = structures.nextId++;
          if (!recordId) {
            recordId = 0;
            structures.nextId = 1;
          }
          if (recordId >= MAX_STRUCTURES) {
            structures.nextId = (recordId = maxSharedStructures) + 1;
          }
        } else {
          recordId = parentRecordId;
        }
        structures[recordId] = keys;
        if (recordId < maxSharedStructures) {
          target[position2++] = 217;
          target[position2++] = recordId >> 8 | 224;
          target[position2++] = recordId & 255;
          transition = structures.transitions;
          for (let i = 0; i < length; i++) {
            if (transition[RECORD_SYMBOL] === void 0 || transition[RECORD_SYMBOL] & 1048576)
              transition[RECORD_SYMBOL] = recordId;
            transition = transition[keys[i]];
          }
          transition[RECORD_SYMBOL] = recordId | 1048576;
          hasSharedUpdate = true;
        } else {
          transition[RECORD_SYMBOL] = recordId;
          targetView.setUint32(position2, 3655335680);
          position2 += 3;
          if (newTransitions)
            transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
          if (recordIdsToRemove.length >= MAX_STRUCTURES - maxSharedStructures)
            recordIdsToRemove.shift()[RECORD_SYMBOL] = void 0;
          recordIdsToRemove.push(transition);
          writeArrayHeader(length + 2);
          encode3(57344 + recordId);
          encode3(keys);
          if (skipValues) return;
          for (let key in object)
            if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
              encode3(object[key]);
          return;
        }
      }
      if (length < 24) {
        target[position2++] = 128 | length;
      } else {
        writeArrayHeader(length);
      }
      if (skipValues) return;
      for (let key in object)
        if (typeof object.hasOwnProperty !== "function" || object.hasOwnProperty(key))
          encode3(object[key]);
    };
    const makeRoom = (end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Encoded buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = new DataView(newBuffer.buffer, 0, newSize);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };
    let chunkThreshold = 100;
    let continuedChunkThreshold = 1e3;
    this.encodeAsIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsIterable);
    };
    this.encodeAsAsyncIterable = function(value, options2) {
      return startEncoding(value, options2, encodeObjectAsAsyncIterable);
    };
    function* encodeObjectAsIterable(object, iterateProperties, finalIterable) {
      let constructor = object.constructor;
      if (constructor === Object) {
        let useRecords = encoder.useRecords !== false;
        if (useRecords)
          writeObject(object, true);
        else
          writeEntityLength(Object.keys(object).length, 160);
        for (let key in object) {
          let value = object[key];
          if (!useRecords) encode3(key);
          if (value && typeof value === "object") {
            if (iterateProperties[key])
              yield* encodeObjectAsIterable(value, iterateProperties[key]);
            else
              yield* tryEncode(value, iterateProperties, key);
          } else encode3(value);
        }
      } else if (constructor === Array) {
        let length = object.length;
        writeArrayHeader(length);
        for (let i = 0; i < length; i++) {
          let value = object[i];
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else encode3(value);
        }
      } else if (object[Symbol.iterator] && !object.buffer) {
        target[position2++] = 159;
        for (let value of object) {
          if (value && (typeof value === "object" || position2 - start > chunkThreshold)) {
            if (iterateProperties.element)
              yield* encodeObjectAsIterable(value, iterateProperties.element);
            else
              yield* tryEncode(value, iterateProperties, "element");
          } else encode3(value);
        }
        target[position2++] = 255;
      } else if (isBlob(object)) {
        writeEntityLength(object.size, 64);
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
      } else if (object[Symbol.asyncIterator]) {
        target[position2++] = 159;
        yield target.subarray(start, position2);
        yield object;
        restartEncoding();
        target[position2++] = 255;
      } else {
        encode3(object);
      }
      if (finalIterable && position2 > start) yield target.subarray(start, position2);
      else if (position2 - start > chunkThreshold) {
        yield target.subarray(start, position2);
        restartEncoding();
      }
    }
    function* tryEncode(value, iterateProperties, key) {
      let restart = position2 - start;
      try {
        encode3(value);
        if (position2 - start > chunkThreshold) {
          yield target.subarray(start, position2);
          restartEncoding();
        }
      } catch (error) {
        if (error.iteratorNotHandled) {
          iterateProperties[key] = {};
          position2 = start + restart;
          yield* encodeObjectAsIterable.call(this, value, iterateProperties[key]);
        } else throw error;
      }
    }
    function restartEncoding() {
      chunkThreshold = continuedChunkThreshold;
      encoder.encode(null, THROW_ON_ITERABLE);
    }
    function startEncoding(value, options2, encodeIterable) {
      if (options2 && options2.chunkThreshold)
        chunkThreshold = continuedChunkThreshold = options2.chunkThreshold;
      else
        chunkThreshold = 100;
      if (value && typeof value === "object") {
        encoder.encode(null, THROW_ON_ITERABLE);
        return encodeIterable(value, encoder.iterateProperties || (encoder.iterateProperties = {}), true);
      }
      return [encoder.encode(value)];
    }
    async function* encodeObjectAsAsyncIterable(value, iterateProperties) {
      for (let encodedValue of encodeObjectAsIterable(value, iterateProperties, true)) {
        let constructor = encodedValue.constructor;
        if (constructor === ByteArray || constructor === Uint8Array)
          yield encodedValue;
        else if (isBlob(encodedValue)) {
          let reader = encodedValue.stream().getReader();
          let next;
          while (!(next = await reader.read()).done) {
            yield next.value;
          }
        } else if (encodedValue[Symbol.asyncIterator]) {
          for await (let asyncValue of encodedValue) {
            restartEncoding();
            if (asyncValue)
              yield* encodeObjectAsAsyncIterable(asyncValue, iterateProperties.async || (iterateProperties.async = {}));
            else yield encoder.encode(asyncValue);
          }
        } else {
          yield encodedValue;
        }
      }
    }
  }
  useBuffer(buffer) {
    target = buffer;
    targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    position2 = 0;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.sharedValues)
      this.sharedValues = void 0;
  }
  updateSharedData() {
    let lastVersion = this.sharedVersion || 0;
    this.sharedVersion = lastVersion + 1;
    let structuresCopy = this.structures.slice(0);
    let sharedData = new SharedData(structuresCopy, this.sharedValues, this.sharedVersion);
    let saveResults = this.saveShared(
      sharedData,
      (existingShared) => (existingShared && existingShared.version || 0) == lastVersion
    );
    if (saveResults === false) {
      sharedData = this.getShared() || {};
      this.structures = sharedData.structures || [];
      this.sharedValues = sharedData.packedValues;
      this.sharedVersion = sharedData.version;
      this.structures.nextId = this.structures.length;
    } else {
      structuresCopy.forEach((structure, i) => this.structures[i] = structure);
    }
    return saveResults;
  }
};
function writeEntityLength(length, majorValue) {
  if (length < 24)
    target[position2++] = majorValue | length;
  else if (length < 256) {
    target[position2++] = majorValue | 24;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = majorValue | 25;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = majorValue | 26;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
var SharedData = class {
  constructor(structures, values, version) {
    this.structures = structures;
    this.packedValues = values;
    this.version = version;
  }
};
function writeArrayHeader(length) {
  if (length < 24)
    target[position2++] = 128 | length;
  else if (length < 256) {
    target[position2++] = 152;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 153;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 154;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
}
var BlobConstructor = typeof Blob === "undefined" ? function() {
} : Blob;
function isBlob(object) {
  if (object instanceof BlobConstructor)
    return true;
  let tag = object[Symbol.toStringTag];
  return tag === "Blob" || tag === "File";
}
function findRepetitiveStrings(value, packedValues2) {
  switch (typeof value) {
    case "string":
      if (value.length > 3) {
        if (packedValues2.objectMap[value] > -1 || packedValues2.values.length >= packedValues2.maxValues)
          return;
        let packedStatus = packedValues2.get(value);
        if (packedStatus) {
          if (++packedStatus.count == 2) {
            packedValues2.values.push(value);
          }
        } else {
          packedValues2.set(value, {
            count: 1
          });
          if (packedValues2.samplingPackedValues) {
            let status = packedValues2.samplingPackedValues.get(value);
            if (status)
              status.count++;
            else
              packedValues2.samplingPackedValues.set(value, {
                count: 1
              });
          }
        }
      }
      break;
    case "object":
      if (value) {
        if (value instanceof Array) {
          for (let i = 0, l = value.length; i < l; i++) {
            findRepetitiveStrings(value[i], packedValues2);
          }
        } else {
          let includeKeys = !packedValues2.encoder.useRecords;
          for (var key in value) {
            if (value.hasOwnProperty(key)) {
              if (includeKeys)
                findRepetitiveStrings(key, packedValues2);
              findRepetitiveStrings(value[key], packedValues2);
            }
          }
        }
      }
      break;
    case "function":
      console.log(value);
  }
}
var isLittleEndianMachine2 = new Uint8Array(new Uint16Array([1]).buffer)[0] == 1;
extensionClasses = [
  Date,
  Set,
  Error,
  RegExp,
  Tag,
  ArrayBuffer,
  Uint8Array,
  Uint8ClampedArray,
  Uint16Array,
  Uint32Array,
  typeof BigUint64Array == "undefined" ? function() {
  } : BigUint64Array,
  Int8Array,
  Int16Array,
  Int32Array,
  typeof BigInt64Array == "undefined" ? function() {
  } : BigInt64Array,
  Float32Array,
  Float64Array,
  SharedData
];
extensions = [
  {
    // Date
    tag: 1,
    encode(date, encode3) {
      let seconds = date.getTime() / 1e3;
      if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
        target[position2++] = 26;
        targetView.setUint32(position2, seconds);
        position2 += 4;
      } else {
        target[position2++] = 251;
        targetView.setFloat64(position2, seconds);
        position2 += 8;
      }
    }
  },
  {
    // Set
    tag: 258,
    // https://github.com/input-output-hk/cbor-sets-spec/blob/master/CBOR_SETS.md
    encode(set, encode3) {
      let array = Array.from(set);
      encode3(array);
    }
  },
  {
    // Error
    tag: 27,
    // http://cbor.schmorp.de/generic-object
    encode(error, encode3) {
      encode3([error.name, error.message]);
    }
  },
  {
    // RegExp
    tag: 27,
    // http://cbor.schmorp.de/generic-object
    encode(regex, encode3) {
      encode3(["RegExp", regex.source, regex.flags]);
    }
  },
  {
    // Tag
    getTag(tag) {
      return tag.tag;
    },
    encode(tag, encode3) {
      encode3(tag.value);
    }
  },
  {
    // ArrayBuffer
    encode(arrayBuffer, encode3, makeRoom) {
      writeBuffer(arrayBuffer, makeRoom);
    }
  },
  {
    // Uint8Array
    getTag(typedArray) {
      if (typedArray.constructor === Uint8Array) {
        if (this.tagUint8Array || hasNodeBuffer && this.tagUint8Array !== false)
          return 64;
      }
    },
    encode(typedArray, encode3, makeRoom) {
      writeBuffer(typedArray, makeRoom);
    }
  },
  typedArrayEncoder(68, 1),
  typedArrayEncoder(69, 2),
  typedArrayEncoder(70, 4),
  typedArrayEncoder(71, 8),
  typedArrayEncoder(72, 1),
  typedArrayEncoder(77, 2),
  typedArrayEncoder(78, 4),
  typedArrayEncoder(79, 8),
  typedArrayEncoder(85, 4),
  typedArrayEncoder(86, 8),
  {
    encode(sharedData, encode3) {
      let packedValues2 = sharedData.packedValues || [];
      let sharedStructures = sharedData.structures || [];
      if (packedValues2.values.length > 0) {
        target[position2++] = 216;
        target[position2++] = 51;
        writeArrayHeader(4);
        let valuesArray = packedValues2.values;
        encode3(valuesArray);
        writeArrayHeader(0);
        writeArrayHeader(0);
        packedObjectMap = Object.create(sharedPackedObjectMap || null);
        for (let i = 0, l = valuesArray.length; i < l; i++) {
          packedObjectMap[valuesArray[i]] = i;
        }
      }
      if (sharedStructures) {
        targetView.setUint32(position2, 3655335424);
        position2 += 3;
        let definitions = sharedStructures.slice(0);
        definitions.unshift(57344);
        definitions.push(new Tag(sharedData.version, 1399353956));
        encode3(definitions);
      } else
        encode3(new Tag(sharedData.version, 1399353956));
    }
  }
];
function typedArrayEncoder(tag, size) {
  if (!isLittleEndianMachine2 && size > 1)
    tag -= 4;
  return {
    tag,
    encode: function writeExtBuffer(typedArray, encode3) {
      let length = typedArray.byteLength;
      let offset = typedArray.byteOffset || 0;
      let buffer = typedArray.buffer || typedArray;
      encode3(hasNodeBuffer ? Buffer2.from(buffer, offset, length) : new Uint8Array(buffer, offset, length));
    }
  };
}
function writeBuffer(buffer, makeRoom) {
  let length = buffer.byteLength;
  if (length < 24) {
    target[position2++] = 64 + length;
  } else if (length < 256) {
    target[position2++] = 88;
    target[position2++] = length;
  } else if (length < 65536) {
    target[position2++] = 89;
    target[position2++] = length >> 8;
    target[position2++] = length & 255;
  } else {
    target[position2++] = 90;
    targetView.setUint32(position2, length);
    position2 += 4;
  }
  if (position2 + length >= target.length) {
    makeRoom(position2 + length);
  }
  target.set(buffer.buffer ? buffer : new Uint8Array(buffer), position2);
  position2 += length;
}
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 2;
  let lastEnd = serialized.length - distanceToMove;
  idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
  for (let id = 0; id < idsToInsert.length; id++) {
    let referee = idsToInsert[id];
    referee.id = id;
    for (let position3 of referee.references) {
      serialized[position3++] = id >> 8;
      serialized[position3] = id & 255;
    }
  }
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 2;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 216;
    serialized[position3++] = 28;
    lastEnd = offset;
  }
  return serialized;
}
function writeBundles(start, encode3) {
  targetView.setUint32(bundledStrings2.position + start, position2 - bundledStrings2.position - start + 1);
  let writeStrings = bundledStrings2;
  bundledStrings2 = null;
  encode3(writeStrings[0]);
  encode3(writeStrings[1]);
}
var defaultEncoder = new Encoder({ useRecords: false });
var encode = defaultEncoder.encode;
var encodeAsIterable = defaultEncoder.encodeAsIterable;
var encodeAsAsyncIterable = defaultEncoder.encodeAsAsyncIterable;
var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;
var THROW_ON_ITERABLE = 2048;

// node_modules/@automerge/automerge-repo/dist/helpers/cbor.js
function encode2(obj) {
  const encoder = new Encoder({ tagUint8Array: false, useRecords: false });
  return encoder.encode(obj);
}
function decode2(buf) {
  return decode(buf);
}

// node_modules/@automerge/automerge-repo/dist/DocHandle.js
var import_debug = __toESM(require_browser(), 1);

// node_modules/eventemitter3/index.mjs
var import_index = __toESM(require_eventemitter3(), 1);

// node_modules/xstate/dev/dist/xstate-dev.development.esm.js
function getGlobal() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  {
    console.warn("XState could not find a global object in this environment. Please let the maintainers know and raise an issue here: https://github.com/statelyai/xstate/issues");
  }
}
function getDevTools() {
  const w = getGlobal();
  if (!!w.__xstate__) {
    return w.__xstate__;
  }
  return void 0;
}
var devToolsAdapter = (service) => {
  if (typeof window === "undefined") {
    return;
  }
  const devTools = getDevTools();
  if (devTools) {
    devTools.register(service);
  }
};

// node_modules/xstate/dist/raise-5ea71f04.development.esm.js
var Mailbox = class {
  constructor(_process) {
    this._process = _process;
    this._active = false;
    this._current = null;
    this._last = null;
  }
  start() {
    this._active = true;
    this.flush();
  }
  clear() {
    if (this._current) {
      this._current.next = null;
      this._last = this._current;
    }
  }
  enqueue(event) {
    const enqueued = {
      value: event,
      next: null
    };
    if (this._current) {
      this._last.next = enqueued;
      this._last = enqueued;
      return;
    }
    this._current = enqueued;
    this._last = enqueued;
    if (this._active) {
      this.flush();
    }
  }
  flush() {
    while (this._current) {
      const consumed = this._current;
      this._process(consumed.value);
      this._current = consumed.next;
    }
    this._last = null;
  }
};
var STATE_DELIMITER = ".";
var TARGETLESS_KEY = "";
var NULL_EVENT = "";
var STATE_IDENTIFIER = "#";
var WILDCARD = "*";
var XSTATE_INIT = "xstate.init";
var XSTATE_STOP = "xstate.stop";
function createAfterEvent(delayRef, id) {
  return {
    type: `xstate.after.${delayRef}.${id}`
  };
}
function createDoneStateEvent(id, output) {
  return {
    type: `xstate.done.state.${id}`,
    output
  };
}
function createDoneActorEvent(invokeId, output) {
  return {
    type: `xstate.done.actor.${invokeId}`,
    output,
    actorId: invokeId
  };
}
function createErrorActorEvent(id, error) {
  return {
    type: `xstate.error.actor.${id}`,
    error,
    actorId: id
  };
}
function createInitEvent(input) {
  return {
    type: XSTATE_INIT,
    input
  };
}
function reportUnhandledError(err) {
  setTimeout(() => {
    throw err;
  });
}
var symbolObservable = (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
function matchesState(parentStateId, childStateId) {
  const parentStateValue = toStateValue(parentStateId);
  const childStateValue = toStateValue(childStateId);
  if (typeof childStateValue === "string") {
    if (typeof parentStateValue === "string") {
      return childStateValue === parentStateValue;
    }
    return false;
  }
  if (typeof parentStateValue === "string") {
    return parentStateValue in childStateValue;
  }
  return Object.keys(parentStateValue).every((key) => {
    if (!(key in childStateValue)) {
      return false;
    }
    return matchesState(parentStateValue[key], childStateValue[key]);
  });
}
function toStatePath(stateId) {
  if (isArray(stateId)) {
    return stateId;
  }
  let result = [];
  let segment = "";
  for (let i = 0; i < stateId.length; i++) {
    const char = stateId.charCodeAt(i);
    switch (char) {
      case 92:
        segment += stateId[i + 1];
        i++;
        continue;
      case 46:
        result.push(segment);
        segment = "";
        continue;
    }
    segment += stateId[i];
  }
  result.push(segment);
  return result;
}
function toStateValue(stateValue) {
  if (isMachineSnapshot(stateValue)) {
    return stateValue.value;
  }
  if (typeof stateValue !== "string") {
    return stateValue;
  }
  const statePath = toStatePath(stateValue);
  return pathToStateValue(statePath);
}
function pathToStateValue(statePath) {
  if (statePath.length === 1) {
    return statePath[0];
  }
  const value = {};
  let marker = value;
  for (let i = 0; i < statePath.length - 1; i++) {
    if (i === statePath.length - 2) {
      marker[statePath[i]] = statePath[i + 1];
    } else {
      const previous = marker;
      marker = {};
      previous[statePath[i]] = marker;
    }
  }
  return value;
}
function mapValues(collection, iteratee) {
  const result = {};
  const collectionKeys = Object.keys(collection);
  for (let i = 0; i < collectionKeys.length; i++) {
    const key = collectionKeys[i];
    result[key] = iteratee(collection[key], key, collection, i);
  }
  return result;
}
function toArrayStrict(value) {
  if (isArray(value)) {
    return value;
  }
  return [value];
}
function toArray(value) {
  if (value === void 0) {
    return [];
  }
  return toArrayStrict(value);
}
function resolveOutput(mapper, context, event, self2) {
  if (typeof mapper === "function") {
    return mapper({
      context,
      event,
      self: self2
    });
  }
  if (!!mapper && typeof mapper === "object" && Object.values(mapper).some((val) => typeof val === "function")) {
    console.warn(`Dynamically mapping values to individual properties is deprecated. Use a single function that returns the mapped object instead.
Found object containing properties whose values are possibly mapping functions: ${Object.entries(mapper).filter(([key, value]) => typeof value === "function").map(([key, value]) => `
 - ${key}: ${value.toString().replace(/\n\s*/g, "")}`).join("")}`);
  }
  return mapper;
}
function isArray(value) {
  return Array.isArray(value);
}
function isErrorActorEvent(event) {
  return event.type.startsWith("xstate.error.actor");
}
function toTransitionConfigArray(configLike) {
  return toArrayStrict(configLike).map((transitionLike) => {
    if (typeof transitionLike === "undefined" || typeof transitionLike === "string") {
      return {
        target: transitionLike
      };
    }
    return transitionLike;
  });
}
function normalizeTarget(target2) {
  if (target2 === void 0 || target2 === TARGETLESS_KEY) {
    return void 0;
  }
  return toArray(target2);
}
function toObserver(nextHandler, errorHandler, completionHandler) {
  var _a, _b, _c;
  const isObserver = typeof nextHandler === "object";
  const self2 = isObserver ? nextHandler : void 0;
  return {
    next: (_a = isObserver ? nextHandler.next : nextHandler) == null ? void 0 : _a.bind(self2),
    error: (_b = isObserver ? nextHandler.error : errorHandler) == null ? void 0 : _b.bind(self2),
    complete: (_c = isObserver ? nextHandler.complete : completionHandler) == null ? void 0 : _c.bind(self2)
  };
}
function createInvokeId(stateNodeId, index) {
  return `${index}.${stateNodeId}`;
}
function resolveReferencedActor(machine, src2) {
  const match = src2.match(/^xstate\.invoke\.(\d+)\.(.*)/);
  if (!match) {
    return machine.implementations.actors[src2];
  }
  const [, indexStr, nodeId] = match;
  const node = machine.getStateNodeById(nodeId);
  const invokeConfig = node.config.invoke;
  return (Array.isArray(invokeConfig) ? invokeConfig[indexStr] : invokeConfig).src;
}
function createScheduledEventId(actorRef, id) {
  return `${actorRef.sessionId}.${id}`;
}
var idCounter = 0;
function createSystem(rootActor, options) {
  const children = /* @__PURE__ */ new Map();
  const keyedActors = /* @__PURE__ */ new Map();
  const reverseKeyedActors = /* @__PURE__ */ new WeakMap();
  const inspectionObservers = /* @__PURE__ */ new Set();
  const timerMap = {};
  const {
    clock,
    logger
  } = options;
  const scheduler = {
    schedule: (source, target2, event, delay, id = Math.random().toString(36).slice(2)) => {
      const scheduledEvent = {
        source,
        target: target2,
        event,
        delay,
        id,
        startedAt: Date.now()
      };
      const scheduledEventId = createScheduledEventId(source, id);
      system._snapshot._scheduledEvents[scheduledEventId] = scheduledEvent;
      const timeout = clock.setTimeout(() => {
        delete timerMap[scheduledEventId];
        delete system._snapshot._scheduledEvents[scheduledEventId];
        system._relay(source, target2, event);
      }, delay);
      timerMap[scheduledEventId] = timeout;
    },
    cancel: (source, id) => {
      const scheduledEventId = createScheduledEventId(source, id);
      const timeout = timerMap[scheduledEventId];
      delete timerMap[scheduledEventId];
      delete system._snapshot._scheduledEvents[scheduledEventId];
      if (timeout !== void 0) {
        clock.clearTimeout(timeout);
      }
    },
    cancelAll: (actorRef) => {
      for (const scheduledEventId in system._snapshot._scheduledEvents) {
        const scheduledEvent = system._snapshot._scheduledEvents[scheduledEventId];
        if (scheduledEvent.source === actorRef) {
          scheduler.cancel(actorRef, scheduledEvent.id);
        }
      }
    }
  };
  const sendInspectionEvent = (event) => {
    if (!inspectionObservers.size) {
      return;
    }
    const resolvedInspectionEvent = {
      ...event,
      rootId: rootActor.sessionId
    };
    inspectionObservers.forEach((observer) => {
      var _a;
      return (_a = observer.next) == null ? void 0 : _a.call(observer, resolvedInspectionEvent);
    });
  };
  const system = {
    _snapshot: {
      _scheduledEvents: ((options == null ? void 0 : options.snapshot) && options.snapshot.scheduler) ?? {}
    },
    _bookId: () => `x:${idCounter++}`,
    _register: (sessionId, actorRef) => {
      children.set(sessionId, actorRef);
      return sessionId;
    },
    _unregister: (actorRef) => {
      children.delete(actorRef.sessionId);
      const systemId = reverseKeyedActors.get(actorRef);
      if (systemId !== void 0) {
        keyedActors.delete(systemId);
        reverseKeyedActors.delete(actorRef);
      }
    },
    get: (systemId) => {
      return keyedActors.get(systemId);
    },
    _set: (systemId, actorRef) => {
      const existing = keyedActors.get(systemId);
      if (existing && existing !== actorRef) {
        throw new Error(`Actor with system ID '${systemId}' already exists.`);
      }
      keyedActors.set(systemId, actorRef);
      reverseKeyedActors.set(actorRef, systemId);
    },
    inspect: (observerOrFn) => {
      const observer = toObserver(observerOrFn);
      inspectionObservers.add(observer);
      return {
        unsubscribe() {
          inspectionObservers.delete(observer);
        }
      };
    },
    _sendInspectionEvent: sendInspectionEvent,
    _relay: (source, target2, event) => {
      system._sendInspectionEvent({
        type: "@xstate.event",
        sourceRef: source,
        actorRef: target2,
        event
      });
      target2._send(event);
    },
    scheduler,
    getSnapshot: () => {
      return {
        _scheduledEvents: {
          ...system._snapshot._scheduledEvents
        }
      };
    },
    start: () => {
      const scheduledEvents = system._snapshot._scheduledEvents;
      system._snapshot._scheduledEvents = {};
      for (const scheduledId in scheduledEvents) {
        const {
          source,
          target: target2,
          event,
          delay,
          id
        } = scheduledEvents[scheduledId];
        scheduler.schedule(source, target2, event, delay, id);
      }
    },
    _clock: clock,
    _logger: logger
  };
  return system;
}
var $$ACTOR_TYPE = 1;
var ProcessingStatus = function(ProcessingStatus2) {
  ProcessingStatus2[ProcessingStatus2["NotStarted"] = 0] = "NotStarted";
  ProcessingStatus2[ProcessingStatus2["Running"] = 1] = "Running";
  ProcessingStatus2[ProcessingStatus2["Stopped"] = 2] = "Stopped";
  return ProcessingStatus2;
}({});
var defaultOptions2 = {
  clock: {
    setTimeout: (fn, ms) => {
      return setTimeout(fn, ms);
    },
    clearTimeout: (id) => {
      return clearTimeout(id);
    }
  },
  logger: console.log.bind(console),
  devTools: false
};
var Actor = class {
  /**
   * Creates a new actor instance for the given logic with the provided options,
   * if any.
   *
   * @param logic The logic to create an actor from
   * @param options Actor options
   */
  constructor(logic, options) {
    this.logic = logic;
    this._snapshot = void 0;
    this.clock = void 0;
    this.options = void 0;
    this.id = void 0;
    this.mailbox = new Mailbox(this._process.bind(this));
    this.observers = /* @__PURE__ */ new Set();
    this.eventListeners = /* @__PURE__ */ new Map();
    this.logger = void 0;
    this._processingStatus = ProcessingStatus.NotStarted;
    this._parent = void 0;
    this._syncSnapshot = void 0;
    this.ref = void 0;
    this._actorScope = void 0;
    this._systemId = void 0;
    this.sessionId = void 0;
    this.system = void 0;
    this._doneEvent = void 0;
    this.src = void 0;
    this._deferred = [];
    const resolvedOptions = {
      ...defaultOptions2,
      ...options
    };
    const {
      clock,
      logger,
      parent,
      syncSnapshot,
      id,
      systemId,
      inspect
    } = resolvedOptions;
    this.system = parent ? parent.system : createSystem(this, {
      clock,
      logger
    });
    if (inspect && !parent) {
      this.system.inspect(toObserver(inspect));
    }
    this.sessionId = this.system._bookId();
    this.id = id ?? this.sessionId;
    this.logger = (options == null ? void 0 : options.logger) ?? this.system._logger;
    this.clock = (options == null ? void 0 : options.clock) ?? this.system._clock;
    this._parent = parent;
    this._syncSnapshot = syncSnapshot;
    this.options = resolvedOptions;
    this.src = resolvedOptions.src ?? logic;
    this.ref = this;
    this._actorScope = {
      self: this,
      id: this.id,
      sessionId: this.sessionId,
      logger: this.logger,
      defer: (fn) => {
        this._deferred.push(fn);
      },
      system: this.system,
      stopChild: (child) => {
        if (child._parent !== this) {
          throw new Error(`Cannot stop child actor ${child.id} of ${this.id} because it is not a child`);
        }
        child._stop();
      },
      emit: (emittedEvent) => {
        const listeners = this.eventListeners.get(emittedEvent.type);
        const wildcardListener = this.eventListeners.get("*");
        if (!listeners && !wildcardListener) {
          return;
        }
        const allListeners = /* @__PURE__ */ new Set([...listeners ? listeners.values() : [], ...wildcardListener ? wildcardListener.values() : []]);
        for (const handler of Array.from(allListeners)) {
          handler(emittedEvent);
        }
      }
    };
    this.send = this.send.bind(this);
    this.system._sendInspectionEvent({
      type: "@xstate.actor",
      actorRef: this
    });
    if (systemId) {
      this._systemId = systemId;
      this.system._set(systemId, this);
    }
    this._initState((options == null ? void 0 : options.snapshot) ?? (options == null ? void 0 : options.state));
    if (systemId && this._snapshot.status !== "active") {
      this.system._unregister(this);
    }
  }
  _initState(persistedState) {
    var _a;
    try {
      this._snapshot = persistedState ? this.logic.restoreSnapshot ? this.logic.restoreSnapshot(persistedState, this._actorScope) : persistedState : this.logic.getInitialSnapshot(this._actorScope, (_a = this.options) == null ? void 0 : _a.input);
    } catch (err) {
      this._snapshot = {
        status: "error",
        output: void 0,
        error: err
      };
    }
  }
  update(snapshot, event) {
    var _a, _b;
    this._snapshot = snapshot;
    let deferredFn;
    while (deferredFn = this._deferred.shift()) {
      try {
        deferredFn();
      } catch (err) {
        this._deferred.length = 0;
        this._snapshot = {
          ...snapshot,
          status: "error",
          error: err
        };
      }
    }
    switch (this._snapshot.status) {
      case "active":
        for (const observer of this.observers) {
          try {
            (_a = observer.next) == null ? void 0 : _a.call(observer, snapshot);
          } catch (err) {
            reportUnhandledError(err);
          }
        }
        break;
      case "done":
        for (const observer of this.observers) {
          try {
            (_b = observer.next) == null ? void 0 : _b.call(observer, snapshot);
          } catch (err) {
            reportUnhandledError(err);
          }
        }
        this._stopProcedure();
        this._complete();
        this._doneEvent = createDoneActorEvent(this.id, this._snapshot.output);
        if (this._parent) {
          this.system._relay(this, this._parent, this._doneEvent);
        }
        break;
      case "error":
        this._error(this._snapshot.error);
        break;
    }
    this.system._sendInspectionEvent({
      type: "@xstate.snapshot",
      actorRef: this,
      event,
      snapshot
    });
  }
  /**
   * Subscribe an observer to an actor’s snapshot values.
   *
   * @remarks
   * The observer will receive the actor’s snapshot value when it is emitted.
   * The observer can be:
   *
   * - A plain function that receives the latest snapshot, or
   * - An observer object whose `.next(snapshot)` method receives the latest
   *   snapshot
   *
   * @example
   *
   * ```ts
   * // Observer as a plain function
   * const subscription = actor.subscribe((snapshot) => {
   *   console.log(snapshot);
   * });
   * ```
   *
   * @example
   *
   * ```ts
   * // Observer as an object
   * const subscription = actor.subscribe({
   *   next(snapshot) {
   *     console.log(snapshot);
   *   },
   *   error(err) {
   *     // ...
   *   },
   *   complete() {
   *     // ...
   *   }
   * });
   * ```
   *
   * The return value of `actor.subscribe(observer)` is a subscription object
   * that has an `.unsubscribe()` method. You can call
   * `subscription.unsubscribe()` to unsubscribe the observer:
   *
   * @example
   *
   * ```ts
   * const subscription = actor.subscribe((snapshot) => {
   *   // ...
   * });
   *
   * // Unsubscribe the observer
   * subscription.unsubscribe();
   * ```
   *
   * When the actor is stopped, all of its observers will automatically be
   * unsubscribed.
   *
   * @param observer - Either a plain function that receives the latest
   *   snapshot, or an observer object whose `.next(snapshot)` method receives
   *   the latest snapshot
   */
  subscribe(nextListenerOrObserver, errorListener, completeListener) {
    var _a;
    const observer = toObserver(nextListenerOrObserver, errorListener, completeListener);
    if (this._processingStatus !== ProcessingStatus.Stopped) {
      this.observers.add(observer);
    } else {
      switch (this._snapshot.status) {
        case "done":
          try {
            (_a = observer.complete) == null ? void 0 : _a.call(observer);
          } catch (err) {
            reportUnhandledError(err);
          }
          break;
        case "error": {
          const err = this._snapshot.error;
          if (!observer.error) {
            reportUnhandledError(err);
          } else {
            try {
              observer.error(err);
            } catch (err2) {
              reportUnhandledError(err2);
            }
          }
          break;
        }
      }
    }
    return {
      unsubscribe: () => {
        this.observers.delete(observer);
      }
    };
  }
  on(type, handler) {
    let listeners = this.eventListeners.get(type);
    if (!listeners) {
      listeners = /* @__PURE__ */ new Set();
      this.eventListeners.set(type, listeners);
    }
    const wrappedHandler = handler.bind(void 0);
    listeners.add(wrappedHandler);
    return {
      unsubscribe: () => {
        listeners.delete(wrappedHandler);
      }
    };
  }
  /** Starts the Actor from the initial state */
  start() {
    if (this._processingStatus === ProcessingStatus.Running) {
      return this;
    }
    if (this._syncSnapshot) {
      this.subscribe({
        next: (snapshot) => {
          if (snapshot.status === "active") {
            this.system._relay(this, this._parent, {
              type: `xstate.snapshot.${this.id}`,
              snapshot
            });
          }
        },
        error: () => {
        }
      });
    }
    this.system._register(this.sessionId, this);
    if (this._systemId) {
      this.system._set(this._systemId, this);
    }
    this._processingStatus = ProcessingStatus.Running;
    const initEvent = createInitEvent(this.options.input);
    this.system._sendInspectionEvent({
      type: "@xstate.event",
      sourceRef: this._parent,
      actorRef: this,
      event: initEvent
    });
    const status = this._snapshot.status;
    switch (status) {
      case "done":
        this.update(this._snapshot, initEvent);
        return this;
      case "error":
        this._error(this._snapshot.error);
        return this;
    }
    if (!this._parent) {
      this.system.start();
    }
    if (this.logic.start) {
      try {
        this.logic.start(this._snapshot, this._actorScope);
      } catch (err) {
        this._snapshot = {
          ...this._snapshot,
          status: "error",
          error: err
        };
        this._error(err);
        return this;
      }
    }
    this.update(this._snapshot, initEvent);
    if (this.options.devTools) {
      this.attachDevTools();
    }
    this.mailbox.start();
    return this;
  }
  _process(event) {
    let nextState;
    let caughtError;
    try {
      nextState = this.logic.transition(this._snapshot, event, this._actorScope);
    } catch (err) {
      caughtError = {
        err
      };
    }
    if (caughtError) {
      const {
        err
      } = caughtError;
      this._snapshot = {
        ...this._snapshot,
        status: "error",
        error: err
      };
      this._error(err);
      return;
    }
    this.update(nextState, event);
    if (event.type === XSTATE_STOP) {
      this._stopProcedure();
      this._complete();
    }
  }
  _stop() {
    if (this._processingStatus === ProcessingStatus.Stopped) {
      return this;
    }
    this.mailbox.clear();
    if (this._processingStatus === ProcessingStatus.NotStarted) {
      this._processingStatus = ProcessingStatus.Stopped;
      return this;
    }
    this.mailbox.enqueue({
      type: XSTATE_STOP
    });
    return this;
  }
  /** Stops the Actor and unsubscribe all listeners. */
  stop() {
    if (this._parent) {
      throw new Error("A non-root actor cannot be stopped directly.");
    }
    return this._stop();
  }
  _complete() {
    var _a;
    for (const observer of this.observers) {
      try {
        (_a = observer.complete) == null ? void 0 : _a.call(observer);
      } catch (err) {
        reportUnhandledError(err);
      }
    }
    this.observers.clear();
  }
  _reportError(err) {
    if (!this.observers.size) {
      if (!this._parent) {
        reportUnhandledError(err);
      }
      return;
    }
    let reportError = false;
    for (const observer of this.observers) {
      const errorListener = observer.error;
      reportError || (reportError = !errorListener);
      try {
        errorListener == null ? void 0 : errorListener(err);
      } catch (err2) {
        reportUnhandledError(err2);
      }
    }
    this.observers.clear();
    if (reportError) {
      reportUnhandledError(err);
    }
  }
  _error(err) {
    this._stopProcedure();
    this._reportError(err);
    if (this._parent) {
      this.system._relay(this, this._parent, createErrorActorEvent(this.id, err));
    }
  }
  // TODO: atm children don't belong entirely to the actor so
  // in a way - it's not even super aware of them
  // so we can't stop them from here but we really should!
  // right now, they are being stopped within the machine's transition
  // but that could throw and leave us with "orphaned" active actors
  _stopProcedure() {
    if (this._processingStatus !== ProcessingStatus.Running) {
      return this;
    }
    this.system.scheduler.cancelAll(this);
    this.mailbox.clear();
    this.mailbox = new Mailbox(this._process.bind(this));
    this._processingStatus = ProcessingStatus.Stopped;
    this.system._unregister(this);
    return this;
  }
  /** @internal */
  _send(event) {
    if (this._processingStatus === ProcessingStatus.Stopped) {
      {
        const eventString = JSON.stringify(event);
        console.warn(`Event "${event.type}" was sent to stopped actor "${this.id} (${this.sessionId})". This actor has already reached its final state, and will not transition.
Event: ${eventString}`);
      }
      return;
    }
    this.mailbox.enqueue(event);
  }
  /**
   * Sends an event to the running Actor to trigger a transition.
   *
   * @param event The event to send
   */
  send(event) {
    if (typeof event === "string") {
      throw new Error(`Only event objects may be sent to actors; use .send({ type: "${event}" }) instead`);
    }
    this.system._relay(void 0, this, event);
  }
  attachDevTools() {
    const {
      devTools
    } = this.options;
    if (devTools) {
      const resolvedDevToolsAdapter = typeof devTools === "function" ? devTools : devToolsAdapter;
      resolvedDevToolsAdapter(this);
    }
  }
  toJSON() {
    return {
      xstate$$type: $$ACTOR_TYPE,
      id: this.id
    };
  }
  /**
   * Obtain the internal state of the actor, which can be persisted.
   *
   * @remarks
   * The internal state can be persisted from any actor, not only machines.
   *
   * Note that the persisted state is not the same as the snapshot from
   * {@link Actor.getSnapshot}. Persisted state represents the internal state of
   * the actor, while snapshots represent the actor's last emitted value.
   *
   * Can be restored with {@link ActorOptions.state}
   * @see https://stately.ai/docs/persistence
   */
  getPersistedSnapshot(options) {
    return this.logic.getPersistedSnapshot(this._snapshot, options);
  }
  [symbolObservable]() {
    return this;
  }
  /**
   * Read an actor’s snapshot synchronously.
   *
   * @remarks
   * The snapshot represent an actor's last emitted value.
   *
   * When an actor receives an event, its internal state may change. An actor
   * may emit a snapshot when a state transition occurs.
   *
   * Note that some actors, such as callback actors generated with
   * `fromCallback`, will not emit snapshots.
   * @see {@link Actor.subscribe} to subscribe to an actor’s snapshot values.
   * @see {@link Actor.getPersistedSnapshot} to persist the internal state of an actor (which is more than just a snapshot).
   */
  getSnapshot() {
    if (!this._snapshot) {
      throw new Error(`Snapshot can't be read while the actor initializes itself`);
    }
    return this._snapshot;
  }
};
function createActor(logic, ...[options]) {
  return new Actor(logic, options);
}
function resolveCancel(_, snapshot, actionArgs, actionParams, {
  sendId
}) {
  const resolvedSendId = typeof sendId === "function" ? sendId(actionArgs, actionParams) : sendId;
  return [snapshot, resolvedSendId];
}
function executeCancel(actorScope, resolvedSendId) {
  actorScope.defer(() => {
    actorScope.system.scheduler.cancel(actorScope.self, resolvedSendId);
  });
}
function cancel(sendId) {
  function cancel2(args, params) {
    {
      throw new Error(`This isn't supposed to be called`);
    }
  }
  cancel2.type = "xstate.cancel";
  cancel2.sendId = sendId;
  cancel2.resolve = resolveCancel;
  cancel2.execute = executeCancel;
  return cancel2;
}
function resolveSpawn(actorScope, snapshot, actionArgs, _actionParams, {
  id,
  systemId,
  src: src2,
  input,
  syncSnapshot
}) {
  const logic = typeof src2 === "string" ? resolveReferencedActor(snapshot.machine, src2) : src2;
  const resolvedId = typeof id === "function" ? id(actionArgs) : id;
  let actorRef;
  if (logic) {
    actorRef = createActor(logic, {
      id: resolvedId,
      src: src2,
      parent: actorScope.self,
      syncSnapshot,
      systemId,
      input: typeof input === "function" ? input({
        context: snapshot.context,
        event: actionArgs.event,
        self: actorScope.self
      }) : input
    });
  }
  if (!actorRef) {
    console.warn(`Actor type '${src2}' not found in machine '${actorScope.id}'.`);
  }
  return [cloneMachineSnapshot(snapshot, {
    children: {
      ...snapshot.children,
      [resolvedId]: actorRef
    }
  }), {
    id,
    actorRef
  }];
}
function executeSpawn(actorScope, {
  id,
  actorRef
}) {
  if (!actorRef) {
    return;
  }
  actorScope.defer(() => {
    if (actorRef._processingStatus === ProcessingStatus.Stopped) {
      return;
    }
    actorRef.start();
  });
}
function spawnChild(...[src2, {
  id,
  systemId,
  input,
  syncSnapshot = false
} = {}]) {
  function spawnChild2(args, params) {
    {
      throw new Error(`This isn't supposed to be called`);
    }
  }
  spawnChild2.type = "snapshot.spawnChild";
  spawnChild2.id = id;
  spawnChild2.systemId = systemId;
  spawnChild2.src = src2;
  spawnChild2.input = input;
  spawnChild2.syncSnapshot = syncSnapshot;
  spawnChild2.resolve = resolveSpawn;
  spawnChild2.execute = executeSpawn;
  return spawnChild2;
}
function resolveStop(_, snapshot, args, actionParams, {
  actorRef
}) {
  const actorRefOrString = typeof actorRef === "function" ? actorRef(args, actionParams) : actorRef;
  const resolvedActorRef = typeof actorRefOrString === "string" ? snapshot.children[actorRefOrString] : actorRefOrString;
  let children = snapshot.children;
  if (resolvedActorRef) {
    children = {
      ...children
    };
    delete children[resolvedActorRef.id];
  }
  return [cloneMachineSnapshot(snapshot, {
    children
  }), resolvedActorRef];
}
function executeStop(actorScope, actorRef) {
  if (!actorRef) {
    return;
  }
  actorScope.system._unregister(actorRef);
  if (actorRef._processingStatus !== ProcessingStatus.Running) {
    actorScope.stopChild(actorRef);
    return;
  }
  actorScope.defer(() => {
    actorScope.stopChild(actorRef);
  });
}
function stopChild(actorRef) {
  function stop2(args, params) {
    {
      throw new Error(`This isn't supposed to be called`);
    }
  }
  stop2.type = "xstate.stopChild";
  stop2.actorRef = actorRef;
  stop2.resolve = resolveStop;
  stop2.execute = executeStop;
  return stop2;
}
function evaluateGuard(guard, context, event, snapshot) {
  const {
    machine
  } = snapshot;
  const isInline = typeof guard === "function";
  const resolved = isInline ? guard : machine.implementations.guards[typeof guard === "string" ? guard : guard.type];
  if (!isInline && !resolved) {
    throw new Error(`Guard '${typeof guard === "string" ? guard : guard.type}' is not implemented.'.`);
  }
  if (typeof resolved !== "function") {
    return evaluateGuard(resolved, context, event, snapshot);
  }
  const guardArgs = {
    context,
    event
  };
  const guardParams = isInline || typeof guard === "string" ? void 0 : "params" in guard ? typeof guard.params === "function" ? guard.params({
    context,
    event
  }) : guard.params : void 0;
  if (!("check" in resolved)) {
    return resolved(guardArgs, guardParams);
  }
  const builtinGuard = resolved;
  return builtinGuard.check(
    snapshot,
    guardArgs,
    resolved
    // this holds all params
  );
}
var isAtomicStateNode = (stateNode) => stateNode.type === "atomic" || stateNode.type === "final";
function getChildren(stateNode) {
  return Object.values(stateNode.states).filter((sn) => sn.type !== "history");
}
function getProperAncestors(stateNode, toStateNode) {
  const ancestors = [];
  if (toStateNode === stateNode) {
    return ancestors;
  }
  let m = stateNode.parent;
  while (m && m !== toStateNode) {
    ancestors.push(m);
    m = m.parent;
  }
  return ancestors;
}
function getAllStateNodes(stateNodes) {
  const nodeSet = new Set(stateNodes);
  const adjList = getAdjList(nodeSet);
  for (const s of nodeSet) {
    if (s.type === "compound" && (!adjList.get(s) || !adjList.get(s).length)) {
      getInitialStateNodesWithTheirAncestors(s).forEach((sn) => nodeSet.add(sn));
    } else {
      if (s.type === "parallel") {
        for (const child of getChildren(s)) {
          if (child.type === "history") {
            continue;
          }
          if (!nodeSet.has(child)) {
            const initialStates = getInitialStateNodesWithTheirAncestors(child);
            for (const initialStateNode of initialStates) {
              nodeSet.add(initialStateNode);
            }
          }
        }
      }
    }
  }
  for (const s of nodeSet) {
    let m = s.parent;
    while (m) {
      nodeSet.add(m);
      m = m.parent;
    }
  }
  return nodeSet;
}
function getValueFromAdj(baseNode, adjList) {
  const childStateNodes = adjList.get(baseNode);
  if (!childStateNodes) {
    return {};
  }
  if (baseNode.type === "compound") {
    const childStateNode = childStateNodes[0];
    if (childStateNode) {
      if (isAtomicStateNode(childStateNode)) {
        return childStateNode.key;
      }
    } else {
      return {};
    }
  }
  const stateValue = {};
  for (const childStateNode of childStateNodes) {
    stateValue[childStateNode.key] = getValueFromAdj(childStateNode, adjList);
  }
  return stateValue;
}
function getAdjList(stateNodes) {
  const adjList = /* @__PURE__ */ new Map();
  for (const s of stateNodes) {
    if (!adjList.has(s)) {
      adjList.set(s, []);
    }
    if (s.parent) {
      if (!adjList.has(s.parent)) {
        adjList.set(s.parent, []);
      }
      adjList.get(s.parent).push(s);
    }
  }
  return adjList;
}
function getStateValue(rootNode, stateNodes) {
  const config = getAllStateNodes(stateNodes);
  return getValueFromAdj(rootNode, getAdjList(config));
}
function isInFinalState(stateNodeSet, stateNode) {
  if (stateNode.type === "compound") {
    return getChildren(stateNode).some((s) => s.type === "final" && stateNodeSet.has(s));
  }
  if (stateNode.type === "parallel") {
    return getChildren(stateNode).every((sn) => isInFinalState(stateNodeSet, sn));
  }
  return stateNode.type === "final";
}
var isStateId = (str) => str[0] === STATE_IDENTIFIER;
function getCandidates(stateNode, receivedEventType) {
  const candidates = stateNode.transitions.get(receivedEventType) || [...stateNode.transitions.keys()].filter((eventDescriptor) => {
    if (eventDescriptor === WILDCARD) {
      return true;
    }
    if (!eventDescriptor.endsWith(".*")) {
      return false;
    }
    if (/.*\*.+/.test(eventDescriptor)) {
      console.warn(`Wildcards can only be the last token of an event descriptor (e.g., "event.*") or the entire event descriptor ("*"). Check the "${eventDescriptor}" event.`);
    }
    const partialEventTokens = eventDescriptor.split(".");
    const eventTokens = receivedEventType.split(".");
    for (let tokenIndex = 0; tokenIndex < partialEventTokens.length; tokenIndex++) {
      const partialEventToken = partialEventTokens[tokenIndex];
      const eventToken = eventTokens[tokenIndex];
      if (partialEventToken === "*") {
        const isLastToken = tokenIndex === partialEventTokens.length - 1;
        if (!isLastToken) {
          console.warn(`Infix wildcards in transition events are not allowed. Check the "${eventDescriptor}" transition.`);
        }
        return isLastToken;
      }
      if (partialEventToken !== eventToken) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => b.length - a.length).flatMap((key) => stateNode.transitions.get(key));
  return candidates;
}
function getDelayedTransitions(stateNode) {
  const afterConfig = stateNode.config.after;
  if (!afterConfig) {
    return [];
  }
  const mutateEntryExit = (delay, i) => {
    const afterEvent = createAfterEvent(delay, stateNode.id);
    const eventType = afterEvent.type;
    stateNode.entry.push(raise(afterEvent, {
      id: eventType,
      delay
    }));
    stateNode.exit.push(cancel(eventType));
    return eventType;
  };
  const delayedTransitions = Object.keys(afterConfig).flatMap((delay, i) => {
    const configTransition = afterConfig[delay];
    const resolvedTransition = typeof configTransition === "string" ? {
      target: configTransition
    } : configTransition;
    const resolvedDelay = Number.isNaN(+delay) ? delay : +delay;
    const eventType = mutateEntryExit(resolvedDelay);
    return toArray(resolvedTransition).map((transition) => ({
      ...transition,
      event: eventType,
      delay: resolvedDelay
    }));
  });
  return delayedTransitions.map((delayedTransition) => {
    const {
      delay
    } = delayedTransition;
    return {
      ...formatTransition(stateNode, delayedTransition.event, delayedTransition),
      delay
    };
  });
}
function formatTransition(stateNode, descriptor, transitionConfig) {
  const normalizedTarget = normalizeTarget(transitionConfig.target);
  const reenter = transitionConfig.reenter ?? false;
  const target2 = resolveTarget(stateNode, normalizedTarget);
  if (transitionConfig.cond) {
    throw new Error(`State "${stateNode.id}" has declared \`cond\` for one of its transitions. This property has been renamed to \`guard\`. Please update your code.`);
  }
  const transition = {
    ...transitionConfig,
    actions: toArray(transitionConfig.actions),
    guard: transitionConfig.guard,
    target: target2,
    source: stateNode,
    reenter,
    eventType: descriptor,
    toJSON: () => ({
      ...transition,
      source: `#${stateNode.id}`,
      target: target2 ? target2.map((t) => `#${t.id}`) : void 0
    })
  };
  return transition;
}
function formatTransitions(stateNode) {
  const transitions = /* @__PURE__ */ new Map();
  if (stateNode.config.on) {
    for (const descriptor of Object.keys(stateNode.config.on)) {
      if (descriptor === NULL_EVENT) {
        throw new Error('Null events ("") cannot be specified as a transition key. Use `always: { ... }` instead.');
      }
      const transitionsConfig = stateNode.config.on[descriptor];
      transitions.set(descriptor, toTransitionConfigArray(transitionsConfig).map((t) => formatTransition(stateNode, descriptor, t)));
    }
  }
  if (stateNode.config.onDone) {
    const descriptor = `xstate.done.state.${stateNode.id}`;
    transitions.set(descriptor, toTransitionConfigArray(stateNode.config.onDone).map((t) => formatTransition(stateNode, descriptor, t)));
  }
  for (const invokeDef of stateNode.invoke) {
    if (invokeDef.onDone) {
      const descriptor = `xstate.done.actor.${invokeDef.id}`;
      transitions.set(descriptor, toTransitionConfigArray(invokeDef.onDone).map((t) => formatTransition(stateNode, descriptor, t)));
    }
    if (invokeDef.onError) {
      const descriptor = `xstate.error.actor.${invokeDef.id}`;
      transitions.set(descriptor, toTransitionConfigArray(invokeDef.onError).map((t) => formatTransition(stateNode, descriptor, t)));
    }
    if (invokeDef.onSnapshot) {
      const descriptor = `xstate.snapshot.${invokeDef.id}`;
      transitions.set(descriptor, toTransitionConfigArray(invokeDef.onSnapshot).map((t) => formatTransition(stateNode, descriptor, t)));
    }
  }
  for (const delayedTransition of stateNode.after) {
    let existing = transitions.get(delayedTransition.eventType);
    if (!existing) {
      existing = [];
      transitions.set(delayedTransition.eventType, existing);
    }
    existing.push(delayedTransition);
  }
  return transitions;
}
function formatInitialTransition(stateNode, _target) {
  const resolvedTarget = typeof _target === "string" ? stateNode.states[_target] : _target ? stateNode.states[_target.target] : void 0;
  if (!resolvedTarget && _target) {
    throw new Error(`Initial state node "${_target}" not found on parent state node #${stateNode.id}`);
  }
  const transition = {
    source: stateNode,
    actions: !_target || typeof _target === "string" ? [] : toArray(_target.actions),
    eventType: null,
    reenter: false,
    target: resolvedTarget ? [resolvedTarget] : [],
    toJSON: () => ({
      ...transition,
      source: `#${stateNode.id}`,
      target: resolvedTarget ? [`#${resolvedTarget.id}`] : []
    })
  };
  return transition;
}
function resolveTarget(stateNode, targets) {
  if (targets === void 0) {
    return void 0;
  }
  return targets.map((target2) => {
    if (typeof target2 !== "string") {
      return target2;
    }
    if (isStateId(target2)) {
      return stateNode.machine.getStateNodeById(target2);
    }
    const isInternalTarget = target2[0] === STATE_DELIMITER;
    if (isInternalTarget && !stateNode.parent) {
      return getStateNodeByPath(stateNode, target2.slice(1));
    }
    const resolvedTarget = isInternalTarget ? stateNode.key + target2 : target2;
    if (stateNode.parent) {
      try {
        const targetStateNode = getStateNodeByPath(stateNode.parent, resolvedTarget);
        return targetStateNode;
      } catch (err) {
        throw new Error(`Invalid transition definition for state node '${stateNode.id}':
${err.message}`);
      }
    } else {
      throw new Error(`Invalid target: "${target2}" is not a valid target from the root node. Did you mean ".${target2}"?`);
    }
  });
}
function resolveHistoryDefaultTransition(stateNode) {
  const normalizedTarget = normalizeTarget(stateNode.config.target);
  if (!normalizedTarget) {
    return stateNode.parent.initial;
  }
  return {
    target: normalizedTarget.map((t) => typeof t === "string" ? getStateNodeByPath(stateNode.parent, t) : t)
  };
}
function isHistoryNode(stateNode) {
  return stateNode.type === "history";
}
function getInitialStateNodesWithTheirAncestors(stateNode) {
  const states = getInitialStateNodes(stateNode);
  for (const initialState of states) {
    for (const ancestor of getProperAncestors(initialState, stateNode)) {
      states.add(ancestor);
    }
  }
  return states;
}
function getInitialStateNodes(stateNode) {
  const set = /* @__PURE__ */ new Set();
  function iter(descStateNode) {
    if (set.has(descStateNode)) {
      return;
    }
    set.add(descStateNode);
    if (descStateNode.type === "compound") {
      iter(descStateNode.initial.target[0]);
    } else if (descStateNode.type === "parallel") {
      for (const child of getChildren(descStateNode)) {
        iter(child);
      }
    }
  }
  iter(stateNode);
  return set;
}
function getStateNode(stateNode, stateKey) {
  if (isStateId(stateKey)) {
    return stateNode.machine.getStateNodeById(stateKey);
  }
  if (!stateNode.states) {
    throw new Error(`Unable to retrieve child state '${stateKey}' from '${stateNode.id}'; no child states exist.`);
  }
  const result = stateNode.states[stateKey];
  if (!result) {
    throw new Error(`Child state '${stateKey}' does not exist on '${stateNode.id}'`);
  }
  return result;
}
function getStateNodeByPath(stateNode, statePath) {
  if (typeof statePath === "string" && isStateId(statePath)) {
    try {
      return stateNode.machine.getStateNodeById(statePath);
    } catch (e) {
    }
  }
  const arrayStatePath = toStatePath(statePath).slice();
  let currentStateNode = stateNode;
  while (arrayStatePath.length) {
    const key = arrayStatePath.shift();
    if (!key.length) {
      break;
    }
    currentStateNode = getStateNode(currentStateNode, key);
  }
  return currentStateNode;
}
function getStateNodes(stateNode, stateValue) {
  if (typeof stateValue === "string") {
    const childStateNode = stateNode.states[stateValue];
    if (!childStateNode) {
      throw new Error(`State '${stateValue}' does not exist on '${stateNode.id}'`);
    }
    return [stateNode, childStateNode];
  }
  const childStateKeys = Object.keys(stateValue);
  const childStateNodes = childStateKeys.map((subStateKey) => getStateNode(stateNode, subStateKey)).filter(Boolean);
  return [stateNode.machine.root, stateNode].concat(childStateNodes, childStateKeys.reduce((allSubStateNodes, subStateKey) => {
    const subStateNode = getStateNode(stateNode, subStateKey);
    if (!subStateNode) {
      return allSubStateNodes;
    }
    const subStateNodes = getStateNodes(subStateNode, stateValue[subStateKey]);
    return allSubStateNodes.concat(subStateNodes);
  }, []));
}
function transitionAtomicNode(stateNode, stateValue, snapshot, event) {
  const childStateNode = getStateNode(stateNode, stateValue);
  const next = childStateNode.next(snapshot, event);
  if (!next || !next.length) {
    return stateNode.next(snapshot, event);
  }
  return next;
}
function transitionCompoundNode(stateNode, stateValue, snapshot, event) {
  const subStateKeys = Object.keys(stateValue);
  const childStateNode = getStateNode(stateNode, subStateKeys[0]);
  const next = transitionNode(childStateNode, stateValue[subStateKeys[0]], snapshot, event);
  if (!next || !next.length) {
    return stateNode.next(snapshot, event);
  }
  return next;
}
function transitionParallelNode(stateNode, stateValue, snapshot, event) {
  const allInnerTransitions = [];
  for (const subStateKey of Object.keys(stateValue)) {
    const subStateValue = stateValue[subStateKey];
    if (!subStateValue) {
      continue;
    }
    const subStateNode = getStateNode(stateNode, subStateKey);
    const innerTransitions = transitionNode(subStateNode, subStateValue, snapshot, event);
    if (innerTransitions) {
      allInnerTransitions.push(...innerTransitions);
    }
  }
  if (!allInnerTransitions.length) {
    return stateNode.next(snapshot, event);
  }
  return allInnerTransitions;
}
function transitionNode(stateNode, stateValue, snapshot, event) {
  if (typeof stateValue === "string") {
    return transitionAtomicNode(stateNode, stateValue, snapshot, event);
  }
  if (Object.keys(stateValue).length === 1) {
    return transitionCompoundNode(stateNode, stateValue, snapshot, event);
  }
  return transitionParallelNode(stateNode, stateValue, snapshot, event);
}
function getHistoryNodes(stateNode) {
  return Object.keys(stateNode.states).map((key) => stateNode.states[key]).filter((sn) => sn.type === "history");
}
function isDescendant(childStateNode, parentStateNode) {
  let marker = childStateNode;
  while (marker.parent && marker.parent !== parentStateNode) {
    marker = marker.parent;
  }
  return marker.parent === parentStateNode;
}
function hasIntersection(s1, s2) {
  const set1 = new Set(s1);
  const set2 = new Set(s2);
  for (const item of set1) {
    if (set2.has(item)) {
      return true;
    }
  }
  for (const item of set2) {
    if (set1.has(item)) {
      return true;
    }
  }
  return false;
}
function removeConflictingTransitions(enabledTransitions, stateNodeSet, historyValue) {
  const filteredTransitions = /* @__PURE__ */ new Set();
  for (const t1 of enabledTransitions) {
    let t1Preempted = false;
    const transitionsToRemove = /* @__PURE__ */ new Set();
    for (const t2 of filteredTransitions) {
      if (hasIntersection(computeExitSet([t1], stateNodeSet, historyValue), computeExitSet([t2], stateNodeSet, historyValue))) {
        if (isDescendant(t1.source, t2.source)) {
          transitionsToRemove.add(t2);
        } else {
          t1Preempted = true;
          break;
        }
      }
    }
    if (!t1Preempted) {
      for (const t3 of transitionsToRemove) {
        filteredTransitions.delete(t3);
      }
      filteredTransitions.add(t1);
    }
  }
  return Array.from(filteredTransitions);
}
function findLeastCommonAncestor(stateNodes) {
  const [head, ...tail] = stateNodes;
  for (const ancestor of getProperAncestors(head, void 0)) {
    if (tail.every((sn) => isDescendant(sn, ancestor))) {
      return ancestor;
    }
  }
}
function getEffectiveTargetStates(transition, historyValue) {
  if (!transition.target) {
    return [];
  }
  const targets = /* @__PURE__ */ new Set();
  for (const targetNode of transition.target) {
    if (isHistoryNode(targetNode)) {
      if (historyValue[targetNode.id]) {
        for (const node of historyValue[targetNode.id]) {
          targets.add(node);
        }
      } else {
        for (const node of getEffectiveTargetStates(resolveHistoryDefaultTransition(targetNode), historyValue)) {
          targets.add(node);
        }
      }
    } else {
      targets.add(targetNode);
    }
  }
  return [...targets];
}
function getTransitionDomain(transition, historyValue) {
  const targetStates = getEffectiveTargetStates(transition, historyValue);
  if (!targetStates) {
    return;
  }
  if (!transition.reenter && targetStates.every((target2) => target2 === transition.source || isDescendant(target2, transition.source))) {
    return transition.source;
  }
  const lca = findLeastCommonAncestor(targetStates.concat(transition.source));
  if (lca) {
    return lca;
  }
  if (transition.reenter) {
    return;
  }
  return transition.source.machine.root;
}
function computeExitSet(transitions, stateNodeSet, historyValue) {
  var _a;
  const statesToExit = /* @__PURE__ */ new Set();
  for (const t of transitions) {
    if ((_a = t.target) == null ? void 0 : _a.length) {
      const domain = getTransitionDomain(t, historyValue);
      if (t.reenter && t.source === domain) {
        statesToExit.add(domain);
      }
      for (const stateNode of stateNodeSet) {
        if (isDescendant(stateNode, domain)) {
          statesToExit.add(stateNode);
        }
      }
    }
  }
  return [...statesToExit];
}
function areStateNodeCollectionsEqual(prevStateNodes, nextStateNodeSet) {
  if (prevStateNodes.length !== nextStateNodeSet.size) {
    return false;
  }
  for (const node of prevStateNodes) {
    if (!nextStateNodeSet.has(node)) {
      return false;
    }
  }
  return true;
}
function microstep(transitions, currentSnapshot, actorScope, event, isInitial, internalQueue) {
  if (!transitions.length) {
    return currentSnapshot;
  }
  const mutStateNodeSet = new Set(currentSnapshot._nodes);
  let historyValue = currentSnapshot.historyValue;
  const filteredTransitions = removeConflictingTransitions(transitions, mutStateNodeSet, historyValue);
  let nextState = currentSnapshot;
  if (!isInitial) {
    [nextState, historyValue] = exitStates(nextState, event, actorScope, filteredTransitions, mutStateNodeSet, historyValue, internalQueue);
  }
  nextState = resolveActionsAndContext(nextState, event, actorScope, filteredTransitions.flatMap((t) => t.actions), internalQueue);
  nextState = enterStates(nextState, event, actorScope, filteredTransitions, mutStateNodeSet, internalQueue, historyValue, isInitial);
  const nextStateNodes = [...mutStateNodeSet];
  if (nextState.status === "done") {
    nextState = resolveActionsAndContext(nextState, event, actorScope, nextStateNodes.sort((a, b) => b.order - a.order).flatMap((state) => state.exit), internalQueue);
  }
  try {
    if (historyValue === currentSnapshot.historyValue && areStateNodeCollectionsEqual(currentSnapshot._nodes, mutStateNodeSet)) {
      return nextState;
    }
    return cloneMachineSnapshot(nextState, {
      _nodes: nextStateNodes,
      historyValue
    });
  } catch (e) {
    throw e;
  }
}
function getMachineOutput(snapshot, event, actorScope, rootNode, rootCompletionNode) {
  if (rootNode.output === void 0) {
    return;
  }
  const doneStateEvent = createDoneStateEvent(rootCompletionNode.id, rootCompletionNode.output !== void 0 && rootCompletionNode.parent ? resolveOutput(rootCompletionNode.output, snapshot.context, event, actorScope.self) : void 0);
  return resolveOutput(rootNode.output, snapshot.context, doneStateEvent, actorScope.self);
}
function enterStates(currentSnapshot, event, actorScope, filteredTransitions, mutStateNodeSet, internalQueue, historyValue, isInitial) {
  let nextSnapshot = currentSnapshot;
  const statesToEnter = /* @__PURE__ */ new Set();
  const statesForDefaultEntry = /* @__PURE__ */ new Set();
  computeEntrySet(filteredTransitions, historyValue, statesForDefaultEntry, statesToEnter);
  if (isInitial) {
    statesForDefaultEntry.add(currentSnapshot.machine.root);
  }
  const completedNodes = /* @__PURE__ */ new Set();
  for (const stateNodeToEnter of [...statesToEnter].sort((a, b) => a.order - b.order)) {
    mutStateNodeSet.add(stateNodeToEnter);
    const actions = [];
    actions.push(...stateNodeToEnter.entry);
    for (const invokeDef of stateNodeToEnter.invoke) {
      actions.push(spawnChild(invokeDef.src, {
        ...invokeDef,
        syncSnapshot: !!invokeDef.onSnapshot
      }));
    }
    if (statesForDefaultEntry.has(stateNodeToEnter)) {
      const initialActions = stateNodeToEnter.initial.actions;
      actions.push(...initialActions);
    }
    nextSnapshot = resolveActionsAndContext(nextSnapshot, event, actorScope, actions, internalQueue, stateNodeToEnter.invoke.map((invokeDef) => invokeDef.id));
    if (stateNodeToEnter.type === "final") {
      const parent = stateNodeToEnter.parent;
      let ancestorMarker = (parent == null ? void 0 : parent.type) === "parallel" ? parent : parent == null ? void 0 : parent.parent;
      let rootCompletionNode = ancestorMarker || stateNodeToEnter;
      if ((parent == null ? void 0 : parent.type) === "compound") {
        internalQueue.push(createDoneStateEvent(parent.id, stateNodeToEnter.output !== void 0 ? resolveOutput(stateNodeToEnter.output, nextSnapshot.context, event, actorScope.self) : void 0));
      }
      while ((ancestorMarker == null ? void 0 : ancestorMarker.type) === "parallel" && !completedNodes.has(ancestorMarker) && isInFinalState(mutStateNodeSet, ancestorMarker)) {
        completedNodes.add(ancestorMarker);
        internalQueue.push(createDoneStateEvent(ancestorMarker.id));
        rootCompletionNode = ancestorMarker;
        ancestorMarker = ancestorMarker.parent;
      }
      if (ancestorMarker) {
        continue;
      }
      nextSnapshot = cloneMachineSnapshot(nextSnapshot, {
        status: "done",
        output: getMachineOutput(nextSnapshot, event, actorScope, nextSnapshot.machine.root, rootCompletionNode)
      });
    }
  }
  return nextSnapshot;
}
function computeEntrySet(transitions, historyValue, statesForDefaultEntry, statesToEnter) {
  for (const t of transitions) {
    const domain = getTransitionDomain(t, historyValue);
    for (const s of t.target || []) {
      if (!isHistoryNode(s) && // if the target is different than the source then it will *definitely* be entered
      (t.source !== s || // we know that the domain can't lie within the source
      // if it's different than the source then it's outside of it and it means that the target has to be entered as well
      t.source !== domain || // reentering transitions always enter the target, even if it's the source itself
      t.reenter)) {
        statesToEnter.add(s);
        statesForDefaultEntry.add(s);
      }
      addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
    }
    const targetStates = getEffectiveTargetStates(t, historyValue);
    for (const s of targetStates) {
      const ancestors = getProperAncestors(s, domain);
      if ((domain == null ? void 0 : domain.type) === "parallel") {
        ancestors.push(domain);
      }
      addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, ancestors, !t.source.parent && t.reenter ? void 0 : domain);
    }
  }
}
function addDescendantStatesToEnter(stateNode, historyValue, statesForDefaultEntry, statesToEnter) {
  var _a;
  if (isHistoryNode(stateNode)) {
    if (historyValue[stateNode.id]) {
      const historyStateNodes = historyValue[stateNode.id];
      for (const s of historyStateNodes) {
        statesToEnter.add(s);
        addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
      }
      for (const s of historyStateNodes) {
        addProperAncestorStatesToEnter(s, stateNode.parent, statesToEnter, historyValue, statesForDefaultEntry);
      }
    } else {
      const historyDefaultTransition = resolveHistoryDefaultTransition(stateNode);
      for (const s of historyDefaultTransition.target) {
        statesToEnter.add(s);
        if (historyDefaultTransition === ((_a = stateNode.parent) == null ? void 0 : _a.initial)) {
          statesForDefaultEntry.add(stateNode.parent);
        }
        addDescendantStatesToEnter(s, historyValue, statesForDefaultEntry, statesToEnter);
      }
      for (const s of historyDefaultTransition.target) {
        addProperAncestorStatesToEnter(s, stateNode.parent, statesToEnter, historyValue, statesForDefaultEntry);
      }
    }
  } else {
    if (stateNode.type === "compound") {
      const [initialState] = stateNode.initial.target;
      if (!isHistoryNode(initialState)) {
        statesToEnter.add(initialState);
        statesForDefaultEntry.add(initialState);
      }
      addDescendantStatesToEnter(initialState, historyValue, statesForDefaultEntry, statesToEnter);
      addProperAncestorStatesToEnter(initialState, stateNode, statesToEnter, historyValue, statesForDefaultEntry);
    } else {
      if (stateNode.type === "parallel") {
        for (const child of getChildren(stateNode).filter((sn) => !isHistoryNode(sn))) {
          if (![...statesToEnter].some((s) => isDescendant(s, child))) {
            if (!isHistoryNode(child)) {
              statesToEnter.add(child);
              statesForDefaultEntry.add(child);
            }
            addDescendantStatesToEnter(child, historyValue, statesForDefaultEntry, statesToEnter);
          }
        }
      }
    }
  }
}
function addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, ancestors, reentrancyDomain) {
  for (const anc of ancestors) {
    if (!reentrancyDomain || isDescendant(anc, reentrancyDomain)) {
      statesToEnter.add(anc);
    }
    if (anc.type === "parallel") {
      for (const child of getChildren(anc).filter((sn) => !isHistoryNode(sn))) {
        if (![...statesToEnter].some((s) => isDescendant(s, child))) {
          statesToEnter.add(child);
          addDescendantStatesToEnter(child, historyValue, statesForDefaultEntry, statesToEnter);
        }
      }
    }
  }
}
function addProperAncestorStatesToEnter(stateNode, toStateNode, statesToEnter, historyValue, statesForDefaultEntry) {
  addAncestorStatesToEnter(statesToEnter, historyValue, statesForDefaultEntry, getProperAncestors(stateNode, toStateNode));
}
function exitStates(currentSnapshot, event, actorScope, transitions, mutStateNodeSet, historyValue, internalQueue) {
  let nextSnapshot = currentSnapshot;
  const statesToExit = computeExitSet(transitions, mutStateNodeSet, historyValue);
  statesToExit.sort((a, b) => b.order - a.order);
  let changedHistory;
  for (const exitStateNode of statesToExit) {
    for (const historyNode of getHistoryNodes(exitStateNode)) {
      let predicate;
      if (historyNode.history === "deep") {
        predicate = (sn) => isAtomicStateNode(sn) && isDescendant(sn, exitStateNode);
      } else {
        predicate = (sn) => {
          return sn.parent === exitStateNode;
        };
      }
      changedHistory ?? (changedHistory = {
        ...historyValue
      });
      changedHistory[historyNode.id] = Array.from(mutStateNodeSet).filter(predicate);
    }
  }
  for (const s of statesToExit) {
    nextSnapshot = resolveActionsAndContext(nextSnapshot, event, actorScope, [...s.exit, ...s.invoke.map((def) => stopChild(def.id))], internalQueue);
    mutStateNodeSet.delete(s);
  }
  return [nextSnapshot, changedHistory || historyValue];
}
var executingCustomAction = false;
function resolveAndExecuteActionsWithContext(currentSnapshot, event, actorScope, actions, extra, retries) {
  const {
    machine
  } = currentSnapshot;
  let intermediateSnapshot = currentSnapshot;
  for (const action of actions) {
    let executeAction = function() {
      actorScope.system._sendInspectionEvent({
        type: "@xstate.action",
        actorRef: actorScope.self,
        action: {
          type: typeof action === "string" ? action : typeof action === "object" ? action.type : action.name || "(anonymous)",
          params: actionParams
        }
      });
      try {
        executingCustomAction = resolvedAction;
        resolvedAction(actionArgs, actionParams);
      } finally {
        executingCustomAction = false;
      }
    };
    const isInline = typeof action === "function";
    const resolvedAction = isInline ? action : (
      // the existing type of `.actions` assumes non-nullable `TExpressionAction`
      // it's fine to cast this here to get a common type and lack of errors in the rest of the code
      // our logic below makes sure that we call those 2 "variants" correctly
      machine.implementations.actions[typeof action === "string" ? action : action.type]
    );
    if (!resolvedAction) {
      continue;
    }
    const actionArgs = {
      context: intermediateSnapshot.context,
      event,
      self: actorScope.self,
      system: actorScope.system
    };
    const actionParams = isInline || typeof action === "string" ? void 0 : "params" in action ? typeof action.params === "function" ? action.params({
      context: intermediateSnapshot.context,
      event
    }) : action.params : void 0;
    if (!("resolve" in resolvedAction)) {
      if (actorScope.self._processingStatus === ProcessingStatus.Running) {
        executeAction();
      } else {
        actorScope.defer(() => {
          executeAction();
        });
      }
      continue;
    }
    const builtinAction = resolvedAction;
    const [nextState, params, actions2] = builtinAction.resolve(
      actorScope,
      intermediateSnapshot,
      actionArgs,
      actionParams,
      resolvedAction,
      // this holds all params
      extra
    );
    intermediateSnapshot = nextState;
    if ("retryResolve" in builtinAction) {
      retries == null ? void 0 : retries.push([builtinAction, params]);
    }
    if ("execute" in builtinAction) {
      if (actorScope.self._processingStatus === ProcessingStatus.Running) {
        builtinAction.execute(actorScope, params);
      } else {
        actorScope.defer(builtinAction.execute.bind(null, actorScope, params));
      }
    }
    if (actions2) {
      intermediateSnapshot = resolveAndExecuteActionsWithContext(intermediateSnapshot, event, actorScope, actions2, extra, retries);
    }
  }
  return intermediateSnapshot;
}
function resolveActionsAndContext(currentSnapshot, event, actorScope, actions, internalQueue, deferredActorIds) {
  const retries = deferredActorIds ? [] : void 0;
  const nextState = resolveAndExecuteActionsWithContext(currentSnapshot, event, actorScope, actions, {
    internalQueue,
    deferredActorIds
  }, retries);
  retries == null ? void 0 : retries.forEach(([builtinAction, params]) => {
    builtinAction.retryResolve(actorScope, nextState, params);
  });
  return nextState;
}
function macrostep(snapshot, event, actorScope, internalQueue = []) {
  if (event.type === WILDCARD) {
    throw new Error(`An event cannot have the wildcard type ('${WILDCARD}')`);
  }
  let nextSnapshot = snapshot;
  const microstates = [];
  function addMicrostate(microstate, event2, transitions) {
    actorScope.system._sendInspectionEvent({
      type: "@xstate.microstep",
      actorRef: actorScope.self,
      event: event2,
      snapshot: microstate,
      _transitions: transitions
    });
    microstates.push(microstate);
  }
  if (event.type === XSTATE_STOP) {
    nextSnapshot = cloneMachineSnapshot(stopChildren(nextSnapshot, event, actorScope), {
      status: "stopped"
    });
    addMicrostate(nextSnapshot, event, []);
    return {
      snapshot: nextSnapshot,
      microstates
    };
  }
  let nextEvent = event;
  if (nextEvent.type !== XSTATE_INIT) {
    const currentEvent = nextEvent;
    const isErr = isErrorActorEvent(currentEvent);
    const transitions = selectTransitions(currentEvent, nextSnapshot);
    if (isErr && !transitions.length) {
      nextSnapshot = cloneMachineSnapshot(snapshot, {
        status: "error",
        error: currentEvent.error
      });
      addMicrostate(nextSnapshot, currentEvent, []);
      return {
        snapshot: nextSnapshot,
        microstates
      };
    }
    nextSnapshot = microstep(
      transitions,
      snapshot,
      actorScope,
      nextEvent,
      false,
      // isInitial
      internalQueue
    );
    addMicrostate(nextSnapshot, currentEvent, transitions);
  }
  let shouldSelectEventlessTransitions = true;
  while (nextSnapshot.status === "active") {
    let enabledTransitions = shouldSelectEventlessTransitions ? selectEventlessTransitions(nextSnapshot, nextEvent) : [];
    const previousState = enabledTransitions.length ? nextSnapshot : void 0;
    if (!enabledTransitions.length) {
      if (!internalQueue.length) {
        break;
      }
      nextEvent = internalQueue.shift();
      enabledTransitions = selectTransitions(nextEvent, nextSnapshot);
    }
    nextSnapshot = microstep(enabledTransitions, nextSnapshot, actorScope, nextEvent, false, internalQueue);
    shouldSelectEventlessTransitions = nextSnapshot !== previousState;
    addMicrostate(nextSnapshot, nextEvent, enabledTransitions);
  }
  if (nextSnapshot.status !== "active") {
    stopChildren(nextSnapshot, nextEvent, actorScope);
  }
  return {
    snapshot: nextSnapshot,
    microstates
  };
}
function stopChildren(nextState, event, actorScope) {
  return resolveActionsAndContext(nextState, event, actorScope, Object.values(nextState.children).map((child) => stopChild(child)), []);
}
function selectTransitions(event, nextState) {
  return nextState.machine.getTransitionData(nextState, event);
}
function selectEventlessTransitions(nextState, event) {
  const enabledTransitionSet = /* @__PURE__ */ new Set();
  const atomicStates = nextState._nodes.filter(isAtomicStateNode);
  for (const stateNode of atomicStates) {
    loop: for (const s of [stateNode].concat(getProperAncestors(stateNode, void 0))) {
      if (!s.always) {
        continue;
      }
      for (const transition of s.always) {
        if (transition.guard === void 0 || evaluateGuard(transition.guard, nextState.context, event, nextState)) {
          enabledTransitionSet.add(transition);
          break loop;
        }
      }
    }
  }
  return removeConflictingTransitions(Array.from(enabledTransitionSet), new Set(nextState._nodes), nextState.historyValue);
}
function resolveStateValue(rootNode, stateValue) {
  const allStateNodes = getAllStateNodes(getStateNodes(rootNode, stateValue));
  return getStateValue(rootNode, [...allStateNodes]);
}
function isMachineSnapshot(value) {
  return !!value && typeof value === "object" && "machine" in value && "value" in value;
}
var machineSnapshotMatches = function matches(testValue) {
  return matchesState(testValue, this.value);
};
var machineSnapshotHasTag = function hasTag(tag) {
  return this.tags.has(tag);
};
var machineSnapshotCan = function can(event) {
  if (!this.machine) {
    console.warn(`state.can(...) used outside of a machine-created State object; this will always return false.`);
  }
  const transitionData = this.machine.getTransitionData(this, event);
  return !!(transitionData == null ? void 0 : transitionData.length) && // Check that at least one transition is not forbidden
  transitionData.some((t) => t.target !== void 0 || t.actions.length);
};
var machineSnapshotToJSON = function toJSON() {
  const {
    _nodes: nodes,
    tags,
    machine,
    getMeta: getMeta2,
    toJSON: toJSON2,
    can: can2,
    hasTag: hasTag2,
    matches: matches2,
    ...jsonValues
  } = this;
  return {
    ...jsonValues,
    tags: Array.from(tags)
  };
};
var machineSnapshotGetMeta = function getMeta() {
  return this._nodes.reduce((acc, stateNode) => {
    if (stateNode.meta !== void 0) {
      acc[stateNode.id] = stateNode.meta;
    }
    return acc;
  }, {});
};
function createMachineSnapshot(config, machine) {
  return {
    status: config.status,
    output: config.output,
    error: config.error,
    machine,
    context: config.context,
    _nodes: config._nodes,
    value: getStateValue(machine.root, config._nodes),
    tags: new Set(config._nodes.flatMap((sn) => sn.tags)),
    children: config.children,
    historyValue: config.historyValue || {},
    matches: machineSnapshotMatches,
    hasTag: machineSnapshotHasTag,
    can: machineSnapshotCan,
    getMeta: machineSnapshotGetMeta,
    toJSON: machineSnapshotToJSON
  };
}
function cloneMachineSnapshot(snapshot, config = {}) {
  return createMachineSnapshot({
    ...snapshot,
    ...config
  }, snapshot.machine);
}
function getPersistedSnapshot(snapshot, options) {
  const {
    _nodes: nodes,
    tags,
    machine,
    children,
    context,
    can: can2,
    hasTag: hasTag2,
    matches: matches2,
    getMeta: getMeta2,
    toJSON: toJSON2,
    ...jsonValues
  } = snapshot;
  const childrenJson = {};
  for (const id in children) {
    const child = children[id];
    if (typeof child.src !== "string" && (!options || !("__unsafeAllowInlineActors" in options))) {
      throw new Error("An inline child actor cannot be persisted.");
    }
    childrenJson[id] = {
      snapshot: child.getPersistedSnapshot(options),
      src: child.src,
      systemId: child._systemId,
      syncSnapshot: child._syncSnapshot
    };
  }
  const persisted = {
    ...jsonValues,
    context: persistContext(context),
    children: childrenJson
  };
  return persisted;
}
function persistContext(contextPart) {
  let copy;
  for (const key in contextPart) {
    const value = contextPart[key];
    if (value && typeof value === "object") {
      if ("sessionId" in value && "send" in value && "ref" in value) {
        copy ?? (copy = Array.isArray(contextPart) ? contextPart.slice() : {
          ...contextPart
        });
        copy[key] = {
          xstate$$type: $$ACTOR_TYPE,
          id: value.id
        };
      } else {
        const result = persistContext(value);
        if (result !== value) {
          copy ?? (copy = Array.isArray(contextPart) ? contextPart.slice() : {
            ...contextPart
          });
          copy[key] = result;
        }
      }
    }
  }
  return copy ?? contextPart;
}
function resolveRaise(_, snapshot, args, actionParams, {
  event: eventOrExpr,
  id,
  delay
}, {
  internalQueue
}) {
  const delaysMap = snapshot.machine.implementations.delays;
  if (typeof eventOrExpr === "string") {
    throw new Error(`Only event objects may be used with raise; use raise({ type: "${eventOrExpr}" }) instead`);
  }
  const resolvedEvent = typeof eventOrExpr === "function" ? eventOrExpr(args, actionParams) : eventOrExpr;
  let resolvedDelay;
  if (typeof delay === "string") {
    const configDelay = delaysMap && delaysMap[delay];
    resolvedDelay = typeof configDelay === "function" ? configDelay(args, actionParams) : configDelay;
  } else {
    resolvedDelay = typeof delay === "function" ? delay(args, actionParams) : delay;
  }
  if (typeof resolvedDelay !== "number") {
    internalQueue.push(resolvedEvent);
  }
  return [snapshot, {
    event: resolvedEvent,
    id,
    delay: resolvedDelay
  }];
}
function executeRaise(actorScope, params) {
  const {
    event,
    delay,
    id
  } = params;
  if (typeof delay === "number") {
    actorScope.defer(() => {
      const self2 = actorScope.self;
      actorScope.system.scheduler.schedule(self2, self2, event, delay, id);
    });
    return;
  }
}
function raise(eventOrExpr, options) {
  if (executingCustomAction) {
    console.warn("Custom actions should not call `raise()` directly, as it is not imperative. See https://stately.ai/docs/actions#built-in-actions for more details.");
  }
  function raise2(args, params) {
    {
      throw new Error(`This isn't supposed to be called`);
    }
  }
  raise2.type = "xstate.raise";
  raise2.event = eventOrExpr;
  raise2.id = options == null ? void 0 : options.id;
  raise2.delay = options == null ? void 0 : options.delay;
  raise2.resolve = resolveRaise;
  raise2.execute = executeRaise;
  return raise2;
}

// node_modules/xstate/actors/dist/xstate-actors.development.esm.js
function fromTransition(transition, initialContext) {
  return {
    config: transition,
    transition: (snapshot, event, actorScope) => {
      return {
        ...snapshot,
        context: transition(snapshot.context, event, actorScope)
      };
    },
    getInitialSnapshot: (_, input) => {
      return {
        status: "active",
        output: void 0,
        error: void 0,
        context: typeof initialContext === "function" ? initialContext({
          input
        }) : initialContext
      };
    },
    getPersistedSnapshot: (snapshot) => snapshot,
    restoreSnapshot: (snapshot) => snapshot
  };
}
var emptyLogic = fromTransition((_) => void 0, void 0);

// node_modules/xstate/dist/log-38475d87.development.esm.js
function createSpawner(actorScope, {
  machine,
  context
}, event, spawnedChildren) {
  const spawn = (src2, options = {}) => {
    const {
      systemId,
      input
    } = options;
    if (typeof src2 === "string") {
      const logic = resolveReferencedActor(machine, src2);
      if (!logic) {
        throw new Error(`Actor logic '${src2}' not implemented in machine '${machine.id}'`);
      }
      const actorRef = createActor(logic, {
        id: options.id,
        parent: actorScope.self,
        syncSnapshot: options.syncSnapshot,
        input: typeof input === "function" ? input({
          context,
          event,
          self: actorScope.self
        }) : input,
        src: src2,
        systemId
      });
      spawnedChildren[actorRef.id] = actorRef;
      return actorRef;
    } else {
      const actorRef = createActor(src2, {
        id: options.id,
        parent: actorScope.self,
        syncSnapshot: options.syncSnapshot,
        input: options.input,
        src: src2,
        systemId
      });
      return actorRef;
    }
  };
  return (src2, options) => {
    const actorRef = spawn(src2, options);
    spawnedChildren[actorRef.id] = actorRef;
    actorScope.defer(() => {
      if (actorRef._processingStatus === ProcessingStatus.Stopped) {
        return;
      }
      actorRef.start();
    });
    return actorRef;
  };
}
function resolveAssign(actorScope, snapshot, actionArgs, actionParams, {
  assignment
}) {
  if (!snapshot.context) {
    throw new Error("Cannot assign to undefined `context`. Ensure that `context` is defined in the machine config.");
  }
  const spawnedChildren = {};
  const assignArgs = {
    context: snapshot.context,
    event: actionArgs.event,
    spawn: createSpawner(actorScope, snapshot, actionArgs.event, spawnedChildren),
    self: actorScope.self,
    system: actorScope.system
  };
  let partialUpdate = {};
  if (typeof assignment === "function") {
    partialUpdate = assignment(assignArgs, actionParams);
  } else {
    for (const key of Object.keys(assignment)) {
      const propAssignment = assignment[key];
      partialUpdate[key] = typeof propAssignment === "function" ? propAssignment(assignArgs, actionParams) : propAssignment;
    }
  }
  const updatedContext = Object.assign({}, snapshot.context, partialUpdate);
  return [cloneMachineSnapshot(snapshot, {
    context: updatedContext,
    children: Object.keys(spawnedChildren).length ? {
      ...snapshot.children,
      ...spawnedChildren
    } : snapshot.children
  })];
}
function assign(assignment) {
  if (executingCustomAction) {
    console.warn("Custom actions should not call `assign()` directly, as it is not imperative. See https://stately.ai/docs/actions#built-in-actions for more details.");
  }
  function assign2(args, params) {
    {
      throw new Error(`This isn't supposed to be called`);
    }
  }
  assign2.type = "xstate.assign";
  assign2.assignment = assignment;
  assign2.resolve = resolveAssign;
  return assign2;
}
var SpecialTargets = function(SpecialTargets2) {
  SpecialTargets2["Parent"] = "#_parent";
  SpecialTargets2["Internal"] = "#_internal";
  return SpecialTargets2;
}({});

// node_modules/xstate/dist/xstate.development.esm.js
function assertEvent(event, type) {
  const types = toArray(type);
  if (!types.includes(event.type)) {
    const typesText = types.length === 1 ? `type "${types[0]}"` : `one of types "${types.join('", "')}"`;
    throw new Error(`Expected event ${JSON.stringify(event)} to have ${typesText}`);
  }
}
var cache = /* @__PURE__ */ new WeakMap();
function memo(object, key, fn) {
  let memoizedData = cache.get(object);
  if (!memoizedData) {
    memoizedData = {
      [key]: fn()
    };
    cache.set(object, memoizedData);
  } else if (!(key in memoizedData)) {
    memoizedData[key] = fn();
  }
  return memoizedData[key];
}
var EMPTY_OBJECT = {};
var toSerializableAction = (action) => {
  if (typeof action === "string") {
    return {
      type: action
    };
  }
  if (typeof action === "function") {
    if ("resolve" in action) {
      return {
        type: action.type
      };
    }
    return {
      type: action.name
    };
  }
  return action;
};
var StateNode = class _StateNode {
  constructor(config, options) {
    this.config = config;
    this.key = void 0;
    this.id = void 0;
    this.type = void 0;
    this.path = void 0;
    this.states = void 0;
    this.history = void 0;
    this.entry = void 0;
    this.exit = void 0;
    this.parent = void 0;
    this.machine = void 0;
    this.meta = void 0;
    this.output = void 0;
    this.order = -1;
    this.description = void 0;
    this.tags = [];
    this.transitions = void 0;
    this.always = void 0;
    this.parent = options._parent;
    this.key = options._key;
    this.machine = options._machine;
    this.path = this.parent ? this.parent.path.concat(this.key) : [];
    this.id = this.config.id || [this.machine.id, ...this.path].join(STATE_DELIMITER);
    this.type = this.config.type || (this.config.states && Object.keys(this.config.states).length ? "compound" : this.config.history ? "history" : "atomic");
    this.description = this.config.description;
    this.order = this.machine.idMap.size;
    this.machine.idMap.set(this.id, this);
    this.states = this.config.states ? mapValues(this.config.states, (stateConfig, key) => {
      const stateNode = new _StateNode(stateConfig, {
        _parent: this,
        _key: key,
        _machine: this.machine
      });
      return stateNode;
    }) : EMPTY_OBJECT;
    if (this.type === "compound" && !this.config.initial) {
      throw new Error(`No initial state specified for compound state node "#${this.id}". Try adding { initial: "${Object.keys(this.states)[0]}" } to the state config.`);
    }
    this.history = this.config.history === true ? "shallow" : this.config.history || false;
    this.entry = toArray(this.config.entry).slice();
    this.exit = toArray(this.config.exit).slice();
    this.meta = this.config.meta;
    this.output = this.type === "final" || !this.parent ? this.config.output : void 0;
    this.tags = toArray(config.tags).slice();
  }
  /** @internal */
  _initialize() {
    this.transitions = formatTransitions(this);
    if (this.config.always) {
      this.always = toTransitionConfigArray(this.config.always).map((t) => formatTransition(this, NULL_EVENT, t));
    }
    Object.keys(this.states).forEach((key) => {
      this.states[key]._initialize();
    });
  }
  /** The well-structured state node definition. */
  get definition() {
    return {
      id: this.id,
      key: this.key,
      version: this.machine.version,
      type: this.type,
      initial: this.initial ? {
        target: this.initial.target,
        source: this,
        actions: this.initial.actions.map(toSerializableAction),
        eventType: null,
        reenter: false,
        toJSON: () => ({
          target: this.initial.target.map((t) => `#${t.id}`),
          source: `#${this.id}`,
          actions: this.initial.actions.map(toSerializableAction),
          eventType: null
        })
      } : void 0,
      history: this.history,
      states: mapValues(this.states, (state) => {
        return state.definition;
      }),
      on: this.on,
      transitions: [...this.transitions.values()].flat().map((t) => ({
        ...t,
        actions: t.actions.map(toSerializableAction)
      })),
      entry: this.entry.map(toSerializableAction),
      exit: this.exit.map(toSerializableAction),
      meta: this.meta,
      order: this.order || -1,
      output: this.output,
      invoke: this.invoke,
      description: this.description,
      tags: this.tags
    };
  }
  /** @internal */
  toJSON() {
    return this.definition;
  }
  /** The logic invoked as actors by this state node. */
  get invoke() {
    return memo(this, "invoke", () => toArray(this.config.invoke).map((invokeConfig, i) => {
      const {
        src: src2,
        systemId
      } = invokeConfig;
      const resolvedId = invokeConfig.id ?? createInvokeId(this.id, i);
      const resolvedSrc = typeof src2 === "string" ? src2 : `xstate.invoke.${createInvokeId(this.id, i)}`;
      return {
        ...invokeConfig,
        src: resolvedSrc,
        id: resolvedId,
        systemId,
        toJSON() {
          const {
            onDone,
            onError,
            ...invokeDefValues
          } = invokeConfig;
          return {
            ...invokeDefValues,
            type: "xstate.invoke",
            src: resolvedSrc,
            id: resolvedId
          };
        }
      };
    }));
  }
  /** The mapping of events to transitions. */
  get on() {
    return memo(this, "on", () => {
      const transitions = this.transitions;
      return [...transitions].flatMap(([descriptor, t]) => t.map((t2) => [descriptor, t2])).reduce((map, [descriptor, transition]) => {
        map[descriptor] = map[descriptor] || [];
        map[descriptor].push(transition);
        return map;
      }, {});
    });
  }
  get after() {
    return memo(this, "delayedTransitions", () => getDelayedTransitions(this));
  }
  get initial() {
    return memo(this, "initial", () => formatInitialTransition(this, this.config.initial));
  }
  /** @internal */
  next(snapshot, event) {
    const eventType = event.type;
    const actions = [];
    let selectedTransition;
    const candidates = memo(this, `candidates-${eventType}`, () => getCandidates(this, eventType));
    for (const candidate of candidates) {
      const {
        guard
      } = candidate;
      const resolvedContext = snapshot.context;
      let guardPassed = false;
      try {
        guardPassed = !guard || evaluateGuard(guard, resolvedContext, event, snapshot);
      } catch (err) {
        const guardType = typeof guard === "string" ? guard : typeof guard === "object" ? guard.type : void 0;
        throw new Error(`Unable to evaluate guard ${guardType ? `'${guardType}' ` : ""}in transition for event '${eventType}' in state node '${this.id}':
${err.message}`);
      }
      if (guardPassed) {
        actions.push(...candidate.actions);
        selectedTransition = candidate;
        break;
      }
    }
    return selectedTransition ? [selectedTransition] : void 0;
  }
  /** All the event types accepted by this state node and its descendants. */
  get events() {
    return memo(this, "events", () => {
      const {
        states
      } = this;
      const events = new Set(this.ownEvents);
      if (states) {
        for (const stateId of Object.keys(states)) {
          const state = states[stateId];
          if (state.states) {
            for (const event of state.events) {
              events.add(`${event}`);
            }
          }
        }
      }
      return Array.from(events);
    });
  }
  /**
   * All the events that have transitions directly from this state node.
   *
   * Excludes any inert events.
   */
  get ownEvents() {
    const events = new Set([...this.transitions.keys()].filter((descriptor) => {
      return this.transitions.get(descriptor).some((transition) => !(!transition.target && !transition.actions.length && !transition.reenter));
    }));
    return Array.from(events);
  }
};
var STATE_IDENTIFIER2 = "#";
var StateMachine = class _StateMachine {
  constructor(config, implementations) {
    this.config = config;
    this.version = void 0;
    this.schemas = void 0;
    this.implementations = void 0;
    this.__xstatenode = true;
    this.idMap = /* @__PURE__ */ new Map();
    this.root = void 0;
    this.id = void 0;
    this.states = void 0;
    this.events = void 0;
    this.id = config.id || "(machine)";
    this.implementations = {
      actors: (implementations == null ? void 0 : implementations.actors) ?? {},
      actions: (implementations == null ? void 0 : implementations.actions) ?? {},
      delays: (implementations == null ? void 0 : implementations.delays) ?? {},
      guards: (implementations == null ? void 0 : implementations.guards) ?? {}
    };
    this.version = this.config.version;
    this.schemas = this.config.schemas;
    this.transition = this.transition.bind(this);
    this.getInitialSnapshot = this.getInitialSnapshot.bind(this);
    this.getPersistedSnapshot = this.getPersistedSnapshot.bind(this);
    this.restoreSnapshot = this.restoreSnapshot.bind(this);
    this.start = this.start.bind(this);
    this.root = new StateNode(config, {
      _key: this.id,
      _machine: this
    });
    this.root._initialize();
    this.states = this.root.states;
    this.events = this.root.events;
    if (!("output" in this.root) && Object.values(this.states).some((state) => state.type === "final" && "output" in state)) {
      console.warn("Missing `machine.output` declaration (top-level final state with output detected)");
    }
  }
  /**
   * Clones this state machine with the provided implementations and merges the
   * `context` (if provided).
   *
   * @param implementations Options (`actions`, `guards`, `actors`, `delays`,
   *   `context`) to recursively merge with the existing options.
   * @returns A new `StateMachine` instance with the provided implementations.
   */
  provide(implementations) {
    const {
      actions,
      guards,
      actors,
      delays
    } = this.implementations;
    return new _StateMachine(this.config, {
      actions: {
        ...actions,
        ...implementations.actions
      },
      guards: {
        ...guards,
        ...implementations.guards
      },
      actors: {
        ...actors,
        ...implementations.actors
      },
      delays: {
        ...delays,
        ...implementations.delays
      }
    });
  }
  resolveState(config) {
    const resolvedStateValue = resolveStateValue(this.root, config.value);
    const nodeSet = getAllStateNodes(getStateNodes(this.root, resolvedStateValue));
    return createMachineSnapshot({
      _nodes: [...nodeSet],
      context: config.context || {},
      children: {},
      status: isInFinalState(nodeSet, this.root) ? "done" : config.status || "active",
      output: config.output,
      error: config.error,
      historyValue: config.historyValue
    }, this);
  }
  /**
   * Determines the next snapshot given the current `snapshot` and received
   * `event`. Calculates a full macrostep from all microsteps.
   *
   * @param snapshot The current snapshot
   * @param event The received event
   */
  transition(snapshot, event, actorScope) {
    return macrostep(snapshot, event, actorScope).snapshot;
  }
  /**
   * Determines the next state given the current `state` and `event`. Calculates
   * a microstep.
   *
   * @param state The current state
   * @param event The received event
   */
  microstep(snapshot, event, actorScope) {
    return macrostep(snapshot, event, actorScope).microstates;
  }
  getTransitionData(snapshot, event) {
    return transitionNode(this.root, snapshot.value, snapshot, event) || [];
  }
  /**
   * The initial state _before_ evaluating any microsteps. This "pre-initial"
   * state is provided to initial actions executed in the initial state.
   */
  getPreInitialState(actorScope, initEvent, internalQueue) {
    const {
      context
    } = this.config;
    const preInitial = createMachineSnapshot({
      context: typeof context !== "function" && context ? context : {},
      _nodes: [this.root],
      children: {},
      status: "active"
    }, this);
    if (typeof context === "function") {
      const assignment = ({
        spawn,
        event,
        self: self2
      }) => context({
        spawn,
        input: event.input,
        self: self2
      });
      return resolveActionsAndContext(preInitial, initEvent, actorScope, [assign(assignment)], internalQueue);
    }
    return preInitial;
  }
  /**
   * Returns the initial `State` instance, with reference to `self` as an
   * `ActorRef`.
   */
  getInitialSnapshot(actorScope, input) {
    const initEvent = createInitEvent(input);
    const internalQueue = [];
    const preInitialState = this.getPreInitialState(actorScope, initEvent, internalQueue);
    const nextState = microstep([{
      target: [...getInitialStateNodes(this.root)],
      source: this.root,
      reenter: true,
      actions: [],
      eventType: null,
      toJSON: null
      // TODO: fix
    }], preInitialState, actorScope, initEvent, true, internalQueue);
    const {
      snapshot: macroState
    } = macrostep(nextState, initEvent, actorScope, internalQueue);
    return macroState;
  }
  start(snapshot) {
    Object.values(snapshot.children).forEach((child) => {
      if (child.getSnapshot().status === "active") {
        child.start();
      }
    });
  }
  getStateNodeById(stateId) {
    const fullPath = toStatePath(stateId);
    const relativePath = fullPath.slice(1);
    const resolvedStateId = isStateId(fullPath[0]) ? fullPath[0].slice(STATE_IDENTIFIER2.length) : fullPath[0];
    const stateNode = this.idMap.get(resolvedStateId);
    if (!stateNode) {
      throw new Error(`Child state node '#${resolvedStateId}' does not exist on machine '${this.id}'`);
    }
    return getStateNodeByPath(stateNode, relativePath);
  }
  get definition() {
    return this.root.definition;
  }
  toJSON() {
    return this.definition;
  }
  getPersistedSnapshot(snapshot, options) {
    return getPersistedSnapshot(snapshot, options);
  }
  restoreSnapshot(snapshot, _actorScope) {
    const children = {};
    const snapshotChildren = snapshot.children;
    Object.keys(snapshotChildren).forEach((actorId) => {
      const actorData = snapshotChildren[actorId];
      const childState = actorData.snapshot;
      const src2 = actorData.src;
      const logic = typeof src2 === "string" ? resolveReferencedActor(this, src2) : src2;
      if (!logic) {
        return;
      }
      const actorRef = createActor(logic, {
        id: actorId,
        parent: _actorScope.self,
        syncSnapshot: actorData.syncSnapshot,
        snapshot: childState,
        src: src2,
        systemId: actorData.systemId
      });
      children[actorId] = actorRef;
    });
    const restoredSnapshot = createMachineSnapshot({
      ...snapshot,
      children,
      _nodes: Array.from(getAllStateNodes(getStateNodes(this.root, snapshot.value)))
    }, this);
    let seen = /* @__PURE__ */ new Set();
    function reviveContext(contextPart, children2) {
      if (seen.has(contextPart)) {
        return;
      }
      seen.add(contextPart);
      for (let key in contextPart) {
        const value = contextPart[key];
        if (value && typeof value === "object") {
          if ("xstate$$type" in value && value.xstate$$type === $$ACTOR_TYPE) {
            contextPart[key] = children2[value.id];
            continue;
          }
          reviveContext(value, children2);
        }
      }
    }
    reviveContext(restoredSnapshot.context, children);
    return restoredSnapshot;
  }
};
function createMachine(config, implementations) {
  return new StateMachine(config, implementations);
}
function setup({
  schemas,
  actors,
  actions,
  guards,
  delays
}) {
  return {
    createMachine: (config) => createMachine({
      ...config,
      schemas
    }, {
      actors,
      actions,
      guards,
      delays
    })
  };
}
var defaultWaitForOptions = {
  timeout: Infinity
  // much more than 10 seconds
};
function waitFor(actorRef, predicate, options) {
  const resolvedOptions = {
    ...defaultWaitForOptions,
    ...options
  };
  return new Promise((res, rej) => {
    const {
      signal
    } = resolvedOptions;
    if (signal == null ? void 0 : signal.aborted) {
      rej(signal.reason);
      return;
    }
    let done = false;
    if (resolvedOptions.timeout < 0) {
      console.error("`timeout` passed to `waitFor` is negative and it will reject its internal promise immediately.");
    }
    const handle = resolvedOptions.timeout === Infinity ? void 0 : setTimeout(() => {
      dispose();
      rej(new Error(`Timeout of ${resolvedOptions.timeout} ms exceeded`));
    }, resolvedOptions.timeout);
    const dispose = () => {
      clearTimeout(handle);
      done = true;
      sub == null ? void 0 : sub.unsubscribe();
      if (abortListener) {
        signal.removeEventListener("abort", abortListener);
      }
    };
    function checkEmitted(emitted) {
      if (predicate(emitted)) {
        dispose();
        res(emitted);
      }
    }
    let abortListener;
    let sub;
    checkEmitted(actorRef.getSnapshot());
    if (done) {
      return;
    }
    if (signal) {
      abortListener = () => {
        dispose();
        rej(signal.reason);
      };
      signal.addEventListener("abort", abortListener);
    }
    sub = actorRef.subscribe({
      next: checkEmitted,
      error: (err) => {
        dispose();
        rej(err);
      },
      complete: () => {
        dispose();
        rej(new Error(`Actor terminated without satisfying predicate`));
      }
    });
    if (done) {
      sub.unsubscribe();
    }
  });
}

// node_modules/@automerge/automerge-repo/dist/helpers/arraysAreEqual.js
var arraysAreEqual = (a, b) => a.length === b.length && a.every((element, index) => element === b[index]);

// node_modules/@automerge/automerge-repo/dist/helpers/headsAreSame.js
var headsAreSame = (a, b) => {
  return arraysAreEqual(a, b);
};

// node_modules/@automerge/automerge-repo/dist/helpers/withTimeout.js
var withTimeout = async (promise, t) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(`withTimeout: timed out after ${t}ms`)), t);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};
var TimeoutError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
};

// node_modules/@automerge/automerge-repo/dist/DocHandle.js
var _log, _machine, _prevDocState, _timeoutDelay, _remoteHeads, _DocHandle_instances, doc_get, state_get, statePromise_fn, checkForChanges_fn;
var DocHandle = class extends import_index.default {
  /** @hidden */
  constructor(documentId, options = {}) {
    super();
    __privateAdd(this, _DocHandle_instances);
    __publicField(this, "documentId");
    __privateAdd(this, _log);
    /** The XState actor running our state machine.  */
    __privateAdd(this, _machine);
    /** The last known state of our document. */
    __privateAdd(this, _prevDocState);
    /** How long to wait before giving up on a document. (Note that a document will be marked
     * unavailable much sooner if all known peers respond that they don't have it.) */
    __privateAdd(this, _timeoutDelay, 6e4);
    /** A dictionary mapping each peer to the last heads we know they have. */
    __privateAdd(this, _remoteHeads, {});
    /**
     * @returns true if the document is ready for accessing or changes.
     *
     * Note that for documents already stored locally this occurs before synchronization with any
     * peers. We do not currently have an equivalent `whenSynced()`.
     */
    __publicField(this, "isReady", () => this.inState(["ready"]));
    /**
     * @returns true if the document has been marked as deleted.
     *
     * Deleted documents are removed from local storage and the sync process. It's not currently
     * possible at runtime to undelete a document.
     */
    __publicField(this, "isDeleted", () => this.inState(["deleted"]));
    /**
     * @returns true if the document is currently unavailable.
     *
     * This will be the case if the document is not found in storage and no peers have shared it with us.
     */
    __publicField(this, "isUnavailable", () => this.inState(["unavailable"]));
    /**
     * @returns true if the handle is in one of the given states.
     */
    __publicField(this, "inState", (states) => states.some((s) => __privateGet(this, _machine).getSnapshot().matches(s)));
    this.documentId = documentId;
    if ("timeoutDelay" in options && options.timeoutDelay) {
      __privateSet(this, _timeoutDelay, options.timeoutDelay);
    }
    let doc;
    const isNew = "isNew" in options && options.isNew;
    if (isNew) {
      doc = from2(options.initialValue);
      doc = emptyChange(doc);
    } else {
      doc = init2();
    }
    __privateSet(this, _log, (0, import_debug.default)(`automerge-repo:dochandle:${this.documentId.slice(0, 5)}`));
    const delay = __privateGet(this, _timeoutDelay);
    const machine = setup({
      types: {
        context: {},
        events: {}
      },
      actions: {
        /** Update the doc using the given callback and put the modified doc in context */
        onUpdate: assign(({ context, event }) => {
          const oldDoc = context.doc;
          assertEvent(event, UPDATE);
          const { callback } = event.payload;
          const doc2 = callback(oldDoc);
          return { doc: doc2 };
        }),
        onDelete: assign(() => {
          this.emit("delete", { handle: this });
          return { doc: void 0 };
        }),
        onUnavailable: () => {
          this.emit("unavailable", { handle: this });
        }
      }
    }).createMachine({
      /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgFUAFAEQEEAVAUQG0AGAXUVAAcB7WXAC64e+TiAAeiAOwAOAKwA6ACxSAzKqks1ATjlTdAGhABPRAFolAJksKN2y1KtKAbFLla5AX09G0WPISkVAwAMgyMrBxIILz8QiJikggAjCzOijKqLEqqybJyLizaRqYIFpbJtro5Uo7J2o5S3r4YOATECrgQADZgJADCAEoM9MzsYrGCwqLRSeoyCtra8pa5adquySXmDjY5ac7JljLJeepKzSB+bYGdPX0AYgCSAHJUkRN8UwmziM7HCgqyVcUnqcmScmcMm2ZV2yiyzkOx1OalUFx8V1aAQ63R46AgBCgJGGAEUyAwAMp0D7RSbxGagJKHFgKOSWJTJGRSCosCpKaEmRCqbQKU5yXINeTaer6LwY67YogKXH4wkkKgAeX6AH1hjQqABNGncL70xKIJQ5RY5BHOJag6wwpRyEWImQVeT1aWrVSXBXtJUqgn4Ik0ADqNCedG1L3CYY1gwA0saYqbpuaEG4pKLksKpFDgcsCjDhTnxTKpTLdH6sQGFOgAO7oKYhl5gAQNngAJwA1iRY3R40ndSNDSm6enfpm5BkWAVkvy7bpuTCKq7ndZnfVeSwuTX-HWu2AAI4AVzgQhD6q12rILxoADVIyEaAAhMLjtM-RmIE4LVSQi4nLLDIGzOCWwLKA0cgyLBoFWNy+43B0R5nheaqajqepjuMtJfgyEh-FoixqMCoKqOyhzgYKCDOq6UIeuCSxHOoSGKgop74OgABuzbdOgABGvTXlho5GrhJpxJOP4pLulT6KoMhpJY2hzsWNF0QobqMV6LG+pc+A8BAcBiP6gSfFJ36EQgKksksKxrHamwwmY7gLKB85QjBzoAWxdZdL0FnfARST8ooLC7qoTnWBU4pyC5ViVMKBQaHUDQuM4fm3EGhJBWaU7-CysEAUp3LpEpWw0WYRw2LmqzgqciIsCxWUdI2zaXlAbYdt2PZ5dJ1n5jY2iJY1ikOIcMJHCyUWHC62hRZkUVNPKta3Kh56wJ1-VWUyzhFc64JWJCtQNBBzhQW4cHwbsrVKpxPF8YJgV4ZZIWIKkiKiiNSkqZYWjzCWaQ5hFh0AcCuR3QoR74qUknBRmzholpv3OkpRQNNRpTzaKTWKbIWR5FDxm9AIkA7e9skUYCWayLILBZGoLkUSKbIyIdpxHPoyTeN4QA */
      // You can use the XState extension for VS Code to visualize this machine.
      // Or, you can see this static visualization (last updated April 2024): https://stately.ai/registry/editor/d7af9b58-c518-44f1-9c36-92a238b04a7a?machineId=91c387e7-0f01-42c9-a21d-293e9bf95bb7
      initial: "idle",
      context: { documentId, doc },
      on: {
        UPDATE: { actions: "onUpdate" },
        DELETE: ".deleted"
      },
      states: {
        idle: {
          on: {
            CREATE: "ready",
            FIND: "loading"
          }
        },
        loading: {
          on: {
            REQUEST: "requesting",
            DOC_READY: "ready",
            AWAIT_NETWORK: "awaitingNetwork"
          },
          after: { [delay]: "unavailable" }
        },
        awaitingNetwork: {
          on: { NETWORK_READY: "requesting" }
        },
        requesting: {
          on: {
            DOC_UNAVAILABLE: "unavailable",
            DOC_READY: "ready"
          },
          after: { [delay]: "unavailable" }
        },
        unavailable: {
          entry: "onUnavailable",
          on: { DOC_READY: "ready" }
        },
        ready: {},
        deleted: { entry: "onDelete", type: "final" }
      }
    });
    __privateSet(this, _machine, createActor(machine));
    __privateGet(this, _machine).subscribe((state) => {
      const before = __privateGet(this, _prevDocState);
      const after = state.context.doc;
      __privateGet(this, _log).call(this, `→ ${state.value} %o`, after);
      __privateMethod(this, _DocHandle_instances, checkForChanges_fn).call(this, before, after);
    });
    __privateGet(this, _machine).start();
    __privateGet(this, _machine).send(isNew ? { type: CREATE } : { type: FIND });
  }
  // PUBLIC
  /** Our documentId in Automerge URL form.
   */
  get url() {
    return stringifyAutomergeUrl({ documentId: this.documentId });
  }
  /** @hidden */
  get state() {
    return __privateGet(this, _machine).getSnapshot().value;
  }
  /**
   * @returns a promise that resolves when the document is in one of the given states (if no states
   * are passed, when the document is ready)
   *
   * Use this to block until the document handle has finished loading. The async equivalent to
   * checking `inState()`.
   */
  async whenReady(awaitStates = ["ready"]) {
    await withTimeout(__privateMethod(this, _DocHandle_instances, statePromise_fn).call(this, awaitStates), __privateGet(this, _timeoutDelay));
  }
  /**
   * @returns the current state of this handle's Automerge document.
   *
   * This is the recommended way to access a handle's document. Note that this waits for the handle
   * to be ready if necessary. If loading (or synchronization) fails, this will never resolve.
   */
  async doc(awaitStates = ["ready", "unavailable"]) {
    try {
      await __privateMethod(this, _DocHandle_instances, statePromise_fn).call(this, awaitStates);
    } catch (error) {
      return void 0;
    }
    return !this.isUnavailable() ? __privateGet(this, _DocHandle_instances, doc_get) : void 0;
  }
  /**
   * Synchronously returns the current state of the Automerge document this handle manages, or
   * undefined. Consider using `await handle.doc()` instead. Check `isReady()`, or use `whenReady()`
   * if you want to make sure loading is complete first.
   *
   * Not to be confused with the SyncState of the document, which describes the state of the
   * synchronization process.
   *
   * Note that `undefined` is not a valid Automerge document, so the return from this function is
   * unambigous.
   *
   * @returns the current document, or undefined if the document is not ready.
   */
  docSync() {
    if (!this.isReady())
      return void 0;
    else
      return __privateGet(this, _DocHandle_instances, doc_get);
  }
  /**
   * Returns the current "heads" of the document, akin to a git commit.
   * This precisely defines the state of a document.
   * @returns the current document's heads, or undefined if the document is not ready
   */
  heads() {
    if (!this.isReady()) {
      return void 0;
    }
    return getHeads(__privateGet(this, _DocHandle_instances, doc_get));
  }
  /**
   * `update` is called by the repo when we receive changes from the network
   * Called by the repo when we receive changes from the network.
   * @hidden
   */
  update(callback) {
    __privateGet(this, _machine).send({ type: UPDATE, payload: { callback } });
  }
  /**
   * Called by the repo either when a doc handle changes or we receive new remote heads.
   * @hidden
   */
  setRemoteHeads(storageId, heads) {
    __privateGet(this, _remoteHeads)[storageId] = heads;
    this.emit("remote-heads", { storageId, heads });
  }
  /** Returns the heads of the storageId. */
  getRemoteHeads(storageId) {
    return __privateGet(this, _remoteHeads)[storageId];
  }
  /**
   * All changes to an Automerge document should be made through this method.
   * Inside the callback, the document should be treated as mutable: all edits will be recorded
   * using a Proxy and translated into operations as part of a single recorded "change".
   *
   * Note that assignment via ES6 spread operators will result in *replacing* the object
   * instead of mutating it which will prevent clean merges. This may be what you want, but
   * `doc.foo = { ...doc.foo, bar: "baz" }` is not equivalent to `doc.foo.bar = "baz"`.
   *
   * Local changes will be stored (by the StorageSubsystem) and synchronized (by the
   * DocSynchronizer) to any peers you are sharing it with.
   *
   * @param callback - A function that takes the current document and mutates it.
   *
   */
  change(callback, options = {}) {
    if (!this.isReady()) {
      throw new Error(`DocHandle#${this.documentId} is not ready. Check \`handle.isReady()\` before accessing the document.`);
    }
    __privateGet(this, _machine).send({
      type: UPDATE,
      payload: { callback: (doc) => change(doc, options, callback) }
    });
  }
  /**
   * Makes a change as if the document were at `heads`.
   *
   * @returns A set of heads representing the concurrent change that was made.
   */
  changeAt(heads, callback, options = {}) {
    if (!this.isReady()) {
      throw new Error(`DocHandle#${this.documentId} is not ready. Check \`handle.isReady()\` before accessing the document.`);
    }
    let resultHeads = void 0;
    __privateGet(this, _machine).send({
      type: UPDATE,
      payload: {
        callback: (doc) => {
          const result = changeAt(doc, heads, options, callback);
          resultHeads = result.newHeads || void 0;
          return result.newDoc;
        }
      }
    });
    return resultHeads;
  }
  /**
   * Merges another document into this document. Any peers we are sharing changes with will be
   * notified of the changes resulting from the merge.
   *
   * @returns the merged document.
   *
   * @throws if either document is not ready or if `otherHandle` is unavailable.
   */
  merge(otherHandle) {
    if (!this.isReady() || !otherHandle.isReady()) {
      throw new Error("Both handles must be ready to merge");
    }
    const mergingDoc = otherHandle.docSync();
    if (!mergingDoc) {
      throw new Error("The document to be merged in is falsy, aborting.");
    }
    this.update((doc) => {
      return merge(doc, mergingDoc);
    });
  }
  /**
   * Used in testing to mark this document as unavailable.
   * @hidden
   */
  unavailable() {
    __privateGet(this, _machine).send({ type: DOC_UNAVAILABLE });
  }
  /** Called by the repo when the document is not found in storage.
   * @hidden
   * */
  request() {
    if (__privateGet(this, _DocHandle_instances, state_get) === "loading")
      __privateGet(this, _machine).send({ type: REQUEST });
  }
  /** @hidden */
  awaitNetwork() {
    if (__privateGet(this, _DocHandle_instances, state_get) === "loading")
      __privateGet(this, _machine).send({ type: AWAIT_NETWORK });
  }
  /** @hidden */
  networkReady() {
    if (__privateGet(this, _DocHandle_instances, state_get) === "awaitingNetwork")
      __privateGet(this, _machine).send({ type: NETWORK_READY });
  }
  /** Called by the repo when the document is deleted. */
  delete() {
    __privateGet(this, _machine).send({ type: DELETE });
  }
  /**
   * Sends an arbitrary ephemeral message out to all reachable peers who would receive sync messages
   * from you. It has no guarantee of delivery, and is not persisted to the underlying automerge doc
   * in any way. Messages will have a sending PeerId but this is *not* a useful user identifier (a
   * user could have multiple tabs open and would appear as multiple PeerIds). Every message source
   * must have a unique PeerId.
   */
  broadcast(message) {
    this.emit("ephemeral-message-outbound", {
      handle: this,
      data: encode2(message)
    });
  }
};
_log = new WeakMap();
_machine = new WeakMap();
_prevDocState = new WeakMap();
_timeoutDelay = new WeakMap();
_remoteHeads = new WeakMap();
_DocHandle_instances = new WeakSet();
doc_get = function() {
  var _a;
  return (_a = __privateGet(this, _machine)) == null ? void 0 : _a.getSnapshot().context.doc;
};
state_get = function() {
  var _a;
  return (_a = __privateGet(this, _machine)) == null ? void 0 : _a.getSnapshot().value;
};
/** Returns a promise that resolves when the docHandle is in one of the given states */
statePromise_fn = function(awaitStates) {
  const awaitStatesArray = Array.isArray(awaitStates) ? awaitStates : [awaitStates];
  return waitFor(
    __privateGet(this, _machine),
    (s) => awaitStatesArray.some((state) => s.matches(state)),
    // use a longer delay here so as not to race with other delays
    { timeout: __privateGet(this, _timeoutDelay) * 2 }
  );
};
/**
 * Called after state transitions. If the document has changed, emits a change event. If we just
 * received the document for the first time, signal that our request has been completed.
 */
checkForChanges_fn = function(before, after) {
  const docChanged = after && before && !headsAreSame(getHeads(after), getHeads(before));
  if (docChanged) {
    this.emit("heads-changed", { handle: this, doc: after });
    const patches = diff(after, getHeads(before), getHeads(after));
    if (patches.length > 0) {
      this.emit("change", {
        handle: this,
        doc: after,
        patches,
        // TODO: pass along the source (load/change/network)
        patchInfo: { before, after, source: "change" }
      });
    }
    if (!this.isReady())
      __privateGet(this, _machine).send({ type: DOC_READY });
  }
  __privateSet(this, _prevDocState, after);
};
var HandleState = {
  /** The handle has been created but not yet loaded or requested */
  IDLE: "idle",
  /** We are waiting for storage to finish loading */
  LOADING: "loading",
  /** We are waiting for the network to be come ready */
  AWAITING_NETWORK: "awaitingNetwork",
  /** We are waiting for someone in the network to respond to a sync request */
  REQUESTING: "requesting",
  /** The document is available */
  READY: "ready",
  /** The document has been deleted from the repo */
  DELETED: "deleted",
  /** The document was not available in storage or from any connected peers */
  UNAVAILABLE: "unavailable"
};
var { IDLE, LOADING, AWAITING_NETWORK, REQUESTING, READY, DELETED, UNAVAILABLE } = HandleState;
var CREATE = "CREATE";
var FIND = "FIND";
var REQUEST = "REQUEST";
var DOC_READY = "DOC_READY";
var AWAIT_NETWORK = "AWAIT_NETWORK";
var NETWORK_READY = "NETWORK_READY";
var UPDATE = "UPDATE";
var DELETE = "DELETE";
var DOC_UNAVAILABLE = "DOC_UNAVAILABLE";

// node_modules/@automerge/automerge-repo/dist/network/messages.js
var isRepoMessage = (message) => isSyncMessage(message) || isEphemeralMessage(message) || isRequestMessage(message) || isDocumentUnavailableMessage(message) || isRemoteSubscriptionControlMessage(message) || isRemoteHeadsChanged(message);
var isDocumentUnavailableMessage = (msg) => msg.type === "doc-unavailable";
var isRequestMessage = (msg) => msg.type === "request";
var isSyncMessage = (msg) => msg.type === "sync";
var isEphemeralMessage = (msg) => msg.type === "ephemeral";
var isRemoteSubscriptionControlMessage = (msg) => msg.type === "remote-subscription-change";
var isRemoteHeadsChanged = (msg) => msg.type === "remote-heads-changed";

// node_modules/@automerge/automerge-repo/dist/Repo.js
var import_debug7 = __toESM(require_browser(), 1);

// node_modules/@automerge/automerge-repo/dist/RemoteHeadsSubscriptions.js
var import_debug2 = __toESM(require_browser(), 1);
var _knownHeads, _ourSubscriptions, _theirSubscriptions, _generousPeers, _subscribedDocsByPeer, _log2, _RemoteHeadsSubscriptions_instances, isPeerSubscribedToDoc_fn, changedHeads_fn;
var RemoteHeadsSubscriptions = class extends import_index.default {
  constructor() {
    super(...arguments);
    __privateAdd(this, _RemoteHeadsSubscriptions_instances);
    // Storage IDs we have received remote heads from
    __privateAdd(this, _knownHeads, /* @__PURE__ */ new Map());
    // Storage IDs we have subscribed to via Repo.subscribeToRemoteHeads
    __privateAdd(this, _ourSubscriptions, /* @__PURE__ */ new Set());
    // Storage IDs other peers have subscribed to by sending us a control message
    __privateAdd(this, _theirSubscriptions, /* @__PURE__ */ new Map());
    // Peers we will always share remote heads with even if they are not subscribed
    __privateAdd(this, _generousPeers, /* @__PURE__ */ new Set());
    // Documents each peer has open, we need this information so we only send remote heads of documents that the peer knows
    __privateAdd(this, _subscribedDocsByPeer, /* @__PURE__ */ new Map());
    __privateAdd(this, _log2, (0, import_debug2.default)("automerge-repo:remote-heads-subscriptions"));
  }
  subscribeToRemotes(remotes) {
    __privateGet(this, _log2).call(this, "subscribeToRemotes", remotes);
    const remotesToAdd = [];
    for (const remote of remotes) {
      if (!__privateGet(this, _ourSubscriptions).has(remote)) {
        __privateGet(this, _ourSubscriptions).add(remote);
        remotesToAdd.push(remote);
      }
    }
    if (remotesToAdd.length > 0) {
      this.emit("change-remote-subs", {
        add: remotesToAdd,
        peers: Array.from(__privateGet(this, _generousPeers))
      });
    }
  }
  unsubscribeFromRemotes(remotes) {
    __privateGet(this, _log2).call(this, "subscribeToRemotes", remotes);
    const remotesToRemove = [];
    for (const remote of remotes) {
      if (__privateGet(this, _ourSubscriptions).has(remote)) {
        __privateGet(this, _ourSubscriptions).delete(remote);
        if (!__privateGet(this, _theirSubscriptions).has(remote)) {
          remotesToRemove.push(remote);
        }
      }
    }
    if (remotesToRemove.length > 0) {
      this.emit("change-remote-subs", {
        remove: remotesToRemove,
        peers: Array.from(__privateGet(this, _generousPeers))
      });
    }
  }
  handleControlMessage(control) {
    const remotesToAdd = [];
    const remotesToRemove = [];
    const addedRemotesWeKnow = [];
    __privateGet(this, _log2).call(this, "handleControlMessage", control);
    if (control.add) {
      for (const remote of control.add) {
        let theirSubs = __privateGet(this, _theirSubscriptions).get(remote);
        if (__privateGet(this, _ourSubscriptions).has(remote) || theirSubs) {
          addedRemotesWeKnow.push(remote);
        }
        if (!theirSubs) {
          theirSubs = /* @__PURE__ */ new Set();
          __privateGet(this, _theirSubscriptions).set(remote, theirSubs);
          if (!__privateGet(this, _ourSubscriptions).has(remote)) {
            remotesToAdd.push(remote);
          }
        }
        theirSubs.add(control.senderId);
      }
    }
    if (control.remove) {
      for (const remote of control.remove) {
        const theirSubs = __privateGet(this, _theirSubscriptions).get(remote);
        if (theirSubs) {
          theirSubs.delete(control.senderId);
          if (theirSubs.size == 0 && !__privateGet(this, _ourSubscriptions).has(remote)) {
            remotesToRemove.push(remote);
          }
        }
      }
    }
    if (remotesToAdd.length > 0 || remotesToRemove.length > 0) {
      this.emit("change-remote-subs", {
        peers: Array.from(__privateGet(this, _generousPeers)),
        add: remotesToAdd,
        remove: remotesToRemove
      });
    }
    for (const remote of addedRemotesWeKnow) {
      const subscribedDocs = __privateGet(this, _subscribedDocsByPeer).get(control.senderId);
      if (subscribedDocs) {
        for (const documentId of subscribedDocs) {
          const knownHeads = __privateGet(this, _knownHeads).get(documentId);
          if (!knownHeads) {
            continue;
          }
          const lastHeads = knownHeads.get(remote);
          if (lastHeads) {
            this.emit("notify-remote-heads", {
              targetId: control.senderId,
              documentId,
              heads: lastHeads.heads,
              timestamp: lastHeads.timestamp,
              storageId: remote
            });
          }
        }
      }
    }
  }
  /** A peer we are not directly connected to has changed their heads */
  handleRemoteHeads(msg) {
    __privateGet(this, _log2).call(this, "handleRemoteHeads", msg);
    const changedHeads = __privateMethod(this, _RemoteHeadsSubscriptions_instances, changedHeads_fn).call(this, msg);
    for (const event of changedHeads) {
      if (__privateGet(this, _ourSubscriptions).has(event.storageId)) {
        this.emit("remote-heads-changed", event);
      }
    }
    for (const event of changedHeads) {
      for (const peer of __privateGet(this, _generousPeers)) {
        if (peer === msg.senderId) {
          continue;
        }
        this.emit("notify-remote-heads", {
          targetId: peer,
          documentId: event.documentId,
          heads: event.remoteHeads,
          timestamp: event.timestamp,
          storageId: event.storageId
        });
      }
    }
    for (const event of changedHeads) {
      const theirSubs = __privateGet(this, _theirSubscriptions).get(event.storageId);
      if (theirSubs) {
        for (const peerId of theirSubs) {
          if (__privateMethod(this, _RemoteHeadsSubscriptions_instances, isPeerSubscribedToDoc_fn).call(this, peerId, event.documentId)) {
            this.emit("notify-remote-heads", {
              targetId: peerId,
              documentId: event.documentId,
              heads: event.remoteHeads,
              timestamp: event.timestamp,
              storageId: event.storageId
            });
          }
        }
      }
    }
  }
  /** A peer we are directly connected to has updated their heads */
  handleImmediateRemoteHeadsChanged(documentId, storageId, heads) {
    __privateGet(this, _log2).call(this, "handleLocalHeadsChanged", documentId, storageId, heads);
    const remote = __privateGet(this, _knownHeads).get(documentId);
    const timestamp = Date.now();
    if (!remote) {
      __privateGet(this, _knownHeads).set(documentId, /* @__PURE__ */ new Map([[storageId, { heads, timestamp }]]));
    } else {
      const docRemote = remote.get(storageId);
      if (!docRemote || docRemote.timestamp < Date.now()) {
        remote.set(storageId, { heads, timestamp: Date.now() });
      }
    }
    const theirSubs = __privateGet(this, _theirSubscriptions).get(storageId);
    if (theirSubs) {
      for (const peerId of theirSubs) {
        if (__privateMethod(this, _RemoteHeadsSubscriptions_instances, isPeerSubscribedToDoc_fn).call(this, peerId, documentId)) {
          this.emit("notify-remote-heads", {
            targetId: peerId,
            documentId,
            heads,
            timestamp,
            storageId
          });
        }
      }
    }
  }
  addGenerousPeer(peerId) {
    __privateGet(this, _log2).call(this, "addGenerousPeer", peerId);
    __privateGet(this, _generousPeers).add(peerId);
    if (__privateGet(this, _ourSubscriptions).size > 0) {
      this.emit("change-remote-subs", {
        add: Array.from(__privateGet(this, _ourSubscriptions)),
        peers: [peerId]
      });
    }
    for (const [documentId, remote] of __privateGet(this, _knownHeads)) {
      for (const [storageId, { heads, timestamp }] of remote) {
        this.emit("notify-remote-heads", {
          targetId: peerId,
          documentId,
          heads,
          timestamp,
          storageId
        });
      }
    }
  }
  removePeer(peerId) {
    __privateGet(this, _log2).call(this, "removePeer", peerId);
    const remotesToRemove = [];
    __privateGet(this, _generousPeers).delete(peerId);
    __privateGet(this, _subscribedDocsByPeer).delete(peerId);
    for (const [storageId, peerIds] of __privateGet(this, _theirSubscriptions)) {
      if (peerIds.has(peerId)) {
        peerIds.delete(peerId);
        if (peerIds.size == 0) {
          remotesToRemove.push(storageId);
          __privateGet(this, _theirSubscriptions).delete(storageId);
        }
      }
    }
    if (remotesToRemove.length > 0) {
      this.emit("change-remote-subs", {
        remove: remotesToRemove,
        peers: Array.from(__privateGet(this, _generousPeers))
      });
    }
  }
  subscribePeerToDoc(peerId, documentId) {
    let subscribedDocs = __privateGet(this, _subscribedDocsByPeer).get(peerId);
    if (!subscribedDocs) {
      subscribedDocs = /* @__PURE__ */ new Set();
      __privateGet(this, _subscribedDocsByPeer).set(peerId, subscribedDocs);
    }
    subscribedDocs.add(documentId);
    const remoteHeads = __privateGet(this, _knownHeads).get(documentId);
    if (remoteHeads) {
      for (const [storageId, lastHeads] of remoteHeads) {
        const subscribedPeers = __privateGet(this, _theirSubscriptions).get(storageId);
        if (subscribedPeers && subscribedPeers.has(peerId)) {
          this.emit("notify-remote-heads", {
            targetId: peerId,
            documentId,
            heads: lastHeads.heads,
            timestamp: lastHeads.timestamp,
            storageId
          });
        }
      }
    }
  }
};
_knownHeads = new WeakMap();
_ourSubscriptions = new WeakMap();
_theirSubscriptions = new WeakMap();
_generousPeers = new WeakMap();
_subscribedDocsByPeer = new WeakMap();
_log2 = new WeakMap();
_RemoteHeadsSubscriptions_instances = new WeakSet();
isPeerSubscribedToDoc_fn = function(peerId, documentId) {
  const subscribedDocs = __privateGet(this, _subscribedDocsByPeer).get(peerId);
  return subscribedDocs && subscribedDocs.has(documentId);
};
/** Returns the (document, storageId) pairs which have changed after processing msg */
changedHeads_fn = function(msg) {
  const changedHeads = [];
  const { documentId, newHeads } = msg;
  for (const [storageId, { heads, timestamp }] of Object.entries(newHeads)) {
    if (!__privateGet(this, _ourSubscriptions).has(storageId) && !__privateGet(this, _theirSubscriptions).has(storageId)) {
      continue;
    }
    let remote = __privateGet(this, _knownHeads).get(documentId);
    if (!remote) {
      remote = /* @__PURE__ */ new Map();
      __privateGet(this, _knownHeads).set(documentId, remote);
    }
    const docRemote = remote.get(storageId);
    if (docRemote && docRemote.timestamp >= timestamp) {
      continue;
    } else {
      remote.set(storageId, { timestamp, heads });
      changedHeads.push({
        documentId,
        storageId,
        remoteHeads: heads,
        timestamp
      });
    }
  }
  return changedHeads;
};

// node_modules/@automerge/automerge-repo/dist/helpers/throttle.js
var throttle = (fn, delay) => {
  let lastCall = Date.now();
  let wait;
  let timeout;
  return function(...args) {
    wait = lastCall + delay - Date.now();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
      lastCall = Date.now();
    }, wait);
  };
};

// node_modules/@automerge/automerge-repo/dist/network/NetworkSubsystem.js
var import_debug3 = __toESM(require_browser(), 1);
var getEphemeralMessageSource = (message) => `${message.senderId}:${message.sessionId}`;
var _log3, _adaptersByPeer, _count, _sessionId, _ephemeralSessionCounts, _readyAdapterCount, _adapters;
var NetworkSubsystem = class extends import_index.default {
  constructor(adapters, peerId = randomPeerId(), peerMetadata) {
    super();
    __publicField(this, "peerId");
    __publicField(this, "peerMetadata");
    __privateAdd(this, _log3);
    __privateAdd(this, _adaptersByPeer, {});
    __privateAdd(this, _count, 0);
    __privateAdd(this, _sessionId, Math.random().toString(36).slice(2));
    __privateAdd(this, _ephemeralSessionCounts, {});
    __privateAdd(this, _readyAdapterCount, 0);
    __privateAdd(this, _adapters, []);
    __publicField(this, "isReady", () => {
      return __privateGet(this, _readyAdapterCount) === __privateGet(this, _adapters).length;
    });
    __publicField(this, "whenReady", async () => {
      if (this.isReady()) {
        return;
      } else {
        return new Promise((resolve) => {
          this.once("ready", () => {
            resolve();
          });
        });
      }
    });
    this.peerId = peerId;
    this.peerMetadata = peerMetadata;
    __privateSet(this, _log3, (0, import_debug3.default)(`automerge-repo:network:${this.peerId}`));
    adapters.forEach((a) => this.addNetworkAdapter(a));
  }
  addNetworkAdapter(networkAdapter) {
    __privateGet(this, _adapters).push(networkAdapter);
    networkAdapter.once("ready", () => {
      __privateWrapper(this, _readyAdapterCount)._++;
      __privateGet(this, _log3).call(this, "Adapters ready: ", __privateGet(this, _readyAdapterCount), "/", __privateGet(this, _adapters).length);
      if (__privateGet(this, _readyAdapterCount) === __privateGet(this, _adapters).length) {
        this.emit("ready");
      }
    });
    networkAdapter.on("peer-candidate", ({ peerId, peerMetadata }) => {
      __privateGet(this, _log3).call(this, `peer candidate: ${peerId} `);
      if (!__privateGet(this, _adaptersByPeer)[peerId]) {
        __privateGet(this, _adaptersByPeer)[peerId] = networkAdapter;
      }
      this.emit("peer", { peerId, peerMetadata });
    });
    networkAdapter.on("peer-disconnected", ({ peerId }) => {
      __privateGet(this, _log3).call(this, `peer disconnected: ${peerId} `);
      delete __privateGet(this, _adaptersByPeer)[peerId];
      this.emit("peer-disconnected", { peerId });
    });
    networkAdapter.on("message", (msg) => {
      if (!isRepoMessage(msg)) {
        __privateGet(this, _log3).call(this, `invalid message: ${JSON.stringify(msg)}`);
        return;
      }
      __privateGet(this, _log3).call(this, `message from ${msg.senderId}`);
      if (isEphemeralMessage(msg)) {
        const source = getEphemeralMessageSource(msg);
        if (__privateGet(this, _ephemeralSessionCounts)[source] === void 0 || msg.count > __privateGet(this, _ephemeralSessionCounts)[source]) {
          __privateGet(this, _ephemeralSessionCounts)[source] = msg.count;
          this.emit("message", msg);
        }
        return;
      }
      this.emit("message", msg);
    });
    networkAdapter.on("close", () => {
      __privateGet(this, _log3).call(this, "adapter closed");
      Object.entries(__privateGet(this, _adaptersByPeer)).forEach(([peerId, other]) => {
        if (other === networkAdapter) {
          delete __privateGet(this, _adaptersByPeer)[peerId];
        }
      });
    });
    this.peerMetadata.then((peerMetadata) => {
      networkAdapter.connect(this.peerId, peerMetadata);
    }).catch((err) => {
      __privateGet(this, _log3).call(this, "error connecting to network", err);
    });
  }
  send(message) {
    const peer = __privateGet(this, _adaptersByPeer)[message.targetId];
    if (!peer) {
      __privateGet(this, _log3).call(this, `Tried to send message but peer not found: ${message.targetId}`);
      return;
    }
    const prepareMessage = (message2) => {
      if (message2.type === "ephemeral") {
        if ("count" in message2) {
          return message2;
        } else {
          return {
            ...message2,
            count: ++__privateWrapper(this, _count)._,
            sessionId: __privateGet(this, _sessionId),
            senderId: this.peerId
          };
        }
      } else {
        return {
          ...message2,
          senderId: this.peerId
        };
      }
    };
    const outbound = prepareMessage(message);
    __privateGet(this, _log3).call(this, "sending message %o", outbound);
    peer.send(outbound);
  }
};
_log3 = new WeakMap();
_adaptersByPeer = new WeakMap();
_count = new WeakMap();
_sessionId = new WeakMap();
_ephemeralSessionCounts = new WeakMap();
_readyAdapterCount = new WeakMap();
_adapters = new WeakMap();
function randomPeerId() {
  return `user-${Math.round(Math.random() * 1e5)}`;
}

// node_modules/@automerge/automerge-repo/dist/storage/StorageSubsystem.js
var import_debug4 = __toESM(require_browser(), 1);

// node_modules/@automerge/automerge-repo/dist/helpers/mergeArrays.js
function mergeArrays(myArrays) {
  let length = 0;
  myArrays.forEach((item) => {
    length += item.length;
  });
  const mergedArray = new Uint8Array(length);
  let offset = 0;
  myArrays.forEach((item) => {
    mergedArray.set(item, offset);
    offset += item.length;
  });
  return mergedArray;
}

// node_modules/@automerge/automerge-repo/dist/storage/keyHash.js
var sha256 = __toESM(require_sha2562(), 1);
function keyHash(binary) {
  const hash2 = sha256.hash(binary);
  return bufferToHexString(hash2);
}
function headsHash(heads) {
  const encoder = new TextEncoder();
  const headsbinary = mergeArrays(heads.map((h) => encoder.encode(h)));
  return keyHash(headsbinary);
}
function bufferToHexString(data) {
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// node_modules/@automerge/automerge-repo/dist/storage/chunkTypeFromKey.js
function chunkTypeFromKey(key) {
  if (key.length < 2)
    return null;
  const chunkTypeStr = key[key.length - 2];
  if (chunkTypeStr === "snapshot" || chunkTypeStr === "incremental") {
    return chunkTypeStr;
  }
  return null;
}

// node_modules/@automerge/automerge-repo/dist/storage/StorageSubsystem.js
var _storageAdapter, _storedHeads, _chunkInfos, _compacting, _log4, _StorageSubsystem_instances, saveIncremental_fn, saveTotal_fn, shouldSave_fn, shouldCompact_fn;
var StorageSubsystem = class {
  constructor(storageAdapter) {
    __privateAdd(this, _StorageSubsystem_instances);
    /** The storage adapter to use for saving and loading documents */
    __privateAdd(this, _storageAdapter);
    /** Record of the latest heads we've loaded or saved for each document  */
    __privateAdd(this, _storedHeads, /* @__PURE__ */ new Map());
    /** Metadata on the chunks we've already loaded for each document */
    __privateAdd(this, _chunkInfos, /* @__PURE__ */ new Map());
    /** Flag to avoid compacting when a compaction is already underway */
    __privateAdd(this, _compacting, false);
    __privateAdd(this, _log4, (0, import_debug4.default)(`automerge-repo:storage-subsystem`));
    __privateSet(this, _storageAdapter, storageAdapter);
  }
  async id() {
    const storedId = await __privateGet(this, _storageAdapter).load(["storage-adapter-id"]);
    let id;
    if (storedId) {
      id = new TextDecoder().decode(storedId);
    } else {
      id = v4_default();
      await __privateGet(this, _storageAdapter).save(["storage-adapter-id"], new TextEncoder().encode(id));
    }
    return id;
  }
  // ARBITRARY KEY/VALUE STORAGE
  // The `load`, `save`, and `remove` methods are for generic key/value storage, as opposed to
  // Automerge documents. For example, they're used by the LocalFirstAuthProvider to persist the
  // encrypted team graph that encodes group membership and permissions.
  //
  // The namespace parameter is to prevent collisions with other users of the storage subsystem.
  // Typically this will be the name of the plug-in, adapter, or other system that is using it. For
  // example, the LocalFirstAuthProvider uses the namespace `LocalFirstAuthProvider`.
  /** Loads a value from storage. */
  async load(namespace, key) {
    const storageKey = [namespace, key];
    return await __privateGet(this, _storageAdapter).load(storageKey);
  }
  /** Saves a value in storage. */
  async save(namespace, key, data) {
    const storageKey = [namespace, key];
    await __privateGet(this, _storageAdapter).save(storageKey, data);
  }
  /** Removes a value from storage. */
  async remove(namespace, key) {
    const storageKey = [namespace, key];
    await __privateGet(this, _storageAdapter).remove(storageKey);
  }
  // AUTOMERGE DOCUMENT STORAGE
  /**
   * Loads the Automerge document with the given ID from storage.
   */
  async loadDoc(documentId) {
    const chunks = await __privateGet(this, _storageAdapter).loadRange([documentId]);
    const binaries = [];
    const chunkInfos = [];
    for (const chunk of chunks) {
      if (chunk.data === void 0)
        continue;
      const chunkType = chunkTypeFromKey(chunk.key);
      if (chunkType == null)
        continue;
      chunkInfos.push({
        key: chunk.key,
        type: chunkType,
        size: chunk.data.length
      });
      binaries.push(chunk.data);
    }
    __privateGet(this, _chunkInfos).set(documentId, chunkInfos);
    const binary = mergeArrays(binaries);
    if (binary.length === 0)
      return null;
    const newDoc = loadIncremental(init2(), binary);
    __privateGet(this, _storedHeads).set(documentId, getHeads(newDoc));
    return newDoc;
  }
  /**
   * Saves the provided Automerge document to storage.
   *
   * @remarks
   * Under the hood this makes incremental saves until the incremental size is greater than the
   * snapshot size, at which point the document is compacted into a single snapshot.
   */
  async saveDoc(documentId, doc) {
    if (!__privateMethod(this, _StorageSubsystem_instances, shouldSave_fn).call(this, documentId, doc))
      return;
    const sourceChunks = __privateGet(this, _chunkInfos).get(documentId) ?? [];
    if (__privateMethod(this, _StorageSubsystem_instances, shouldCompact_fn).call(this, sourceChunks)) {
      await __privateMethod(this, _StorageSubsystem_instances, saveTotal_fn).call(this, documentId, doc, sourceChunks);
    } else {
      await __privateMethod(this, _StorageSubsystem_instances, saveIncremental_fn).call(this, documentId, doc);
    }
    __privateGet(this, _storedHeads).set(documentId, getHeads(doc));
  }
  /**
   * Removes the Automerge document with the given ID from storage
   */
  async removeDoc(documentId) {
    await __privateGet(this, _storageAdapter).removeRange([documentId, "snapshot"]);
    await __privateGet(this, _storageAdapter).removeRange([documentId, "incremental"]);
    await __privateGet(this, _storageAdapter).removeRange([documentId, "sync-state"]);
  }
  async loadSyncState(documentId, storageId) {
    const key = [documentId, "sync-state", storageId];
    const loaded = await __privateGet(this, _storageAdapter).load(key);
    return loaded ? decodeSyncState2(loaded) : void 0;
  }
  async saveSyncState(documentId, storageId, syncState) {
    const key = [documentId, "sync-state", storageId];
    await __privateGet(this, _storageAdapter).save(key, encodeSyncState2(syncState));
  }
};
_storageAdapter = new WeakMap();
_storedHeads = new WeakMap();
_chunkInfos = new WeakMap();
_compacting = new WeakMap();
_log4 = new WeakMap();
_StorageSubsystem_instances = new WeakSet();
saveIncremental_fn = async function(documentId, doc) {
  const binary = saveSince(doc, __privateGet(this, _storedHeads).get(documentId) ?? []);
  if (binary && binary.length > 0) {
    const key = [documentId, "incremental", keyHash(binary)];
    __privateGet(this, _log4).call(this, `Saving incremental ${key} for document ${documentId}`);
    await __privateGet(this, _storageAdapter).save(key, binary);
    if (!__privateGet(this, _chunkInfos).has(documentId)) {
      __privateGet(this, _chunkInfos).set(documentId, []);
    }
    __privateGet(this, _chunkInfos).get(documentId).push({
      key,
      type: "incremental",
      size: binary.length
    });
    __privateGet(this, _storedHeads).set(documentId, getHeads(doc));
  } else {
    return Promise.resolve();
  }
};
saveTotal_fn = async function(documentId, doc, sourceChunks) {
  var _a;
  __privateSet(this, _compacting, true);
  const binary = save(doc);
  const snapshotHash = headsHash(getHeads(doc));
  const key = [documentId, "snapshot", snapshotHash];
  const oldKeys = new Set(sourceChunks.map((c) => c.key).filter((k) => k[2] !== snapshotHash));
  __privateGet(this, _log4).call(this, `Saving snapshot ${key} for document ${documentId}`);
  __privateGet(this, _log4).call(this, `deleting old chunks ${Array.from(oldKeys)}`);
  await __privateGet(this, _storageAdapter).save(key, binary);
  for (const key2 of oldKeys) {
    await __privateGet(this, _storageAdapter).remove(key2);
  }
  const newChunkInfos = ((_a = __privateGet(this, _chunkInfos).get(documentId)) == null ? void 0 : _a.filter((c) => !oldKeys.has(c.key))) ?? [];
  newChunkInfos.push({ key, type: "snapshot", size: binary.length });
  __privateGet(this, _chunkInfos).set(documentId, newChunkInfos);
  __privateSet(this, _compacting, false);
};
/**
 * Returns true if the document has changed since the last time it was saved.
 */
shouldSave_fn = function(documentId, doc) {
  const oldHeads = __privateGet(this, _storedHeads).get(documentId);
  if (!oldHeads) {
    return true;
  }
  const newHeads = getHeads(doc);
  if (headsAreSame(newHeads, oldHeads)) {
    return false;
  }
  return true;
};
/**
 * We only compact if the incremental size is greater than the snapshot size.
 */
shouldCompact_fn = function(sourceChunks) {
  if (__privateGet(this, _compacting))
    return false;
  let snapshotSize = 0;
  let incrementalSize = 0;
  for (const chunk of sourceChunks) {
    if (chunk.type === "snapshot") {
      snapshotSize += chunk.size;
    } else {
      incrementalSize += chunk.size;
    }
  }
  return snapshotSize < 1024 || incrementalSize >= snapshotSize;
};

// node_modules/@automerge/automerge-repo/dist/synchronizer/CollectionSynchronizer.js
var import_debug6 = __toESM(require_browser(), 1);

// node_modules/@automerge/automerge-repo/dist/synchronizer/DocSynchronizer.js
var import_debug5 = __toESM(require_browser(), 1);

// node_modules/@automerge/automerge-repo/dist/synchronizer/Synchronizer.js
var Synchronizer = class extends import_index.default {
};

// node_modules/@automerge/automerge-repo/dist/synchronizer/DocSynchronizer.js
var _log5, _peers, _pendingSyncStateCallbacks, _peerDocumentStatuses, _syncStates, _pendingSyncMessages, _syncStarted, _handle, _onLoadSyncState, _DocSynchronizer_instances, syncWithPeers_fn, broadcastToPeers_fn, sendEphemeralMessage_fn, withSyncState_fn, addPeer_fn, initSyncState_fn, setSyncState_fn, sendSyncMessage_fn, processSyncMessage_fn, checkDocUnavailable_fn, processAllPendingSyncMessages_fn;
var DocSynchronizer = class extends Synchronizer {
  constructor({ handle, onLoadSyncState }) {
    super();
    __privateAdd(this, _DocSynchronizer_instances);
    __privateAdd(this, _log5);
    __publicField(this, "syncDebounceRate", 100);
    /** Active peers */
    __privateAdd(this, _peers, []);
    __privateAdd(this, _pendingSyncStateCallbacks, {});
    __privateAdd(this, _peerDocumentStatuses, {});
    /** Sync state for each peer we've communicated with (including inactive peers) */
    __privateAdd(this, _syncStates, {});
    __privateAdd(this, _pendingSyncMessages, []);
    __privateAdd(this, _syncStarted, false);
    __privateAdd(this, _handle);
    __privateAdd(this, _onLoadSyncState);
    __privateSet(this, _handle, handle);
    __privateSet(this, _onLoadSyncState, onLoadSyncState ?? (() => Promise.resolve(void 0)));
    const docId = handle.documentId.slice(0, 5);
    __privateSet(this, _log5, (0, import_debug5.default)(`automerge-repo:docsync:${docId}`));
    handle.on("change", throttle(() => __privateMethod(this, _DocSynchronizer_instances, syncWithPeers_fn).call(this), this.syncDebounceRate));
    handle.on("ephemeral-message-outbound", (payload) => __privateMethod(this, _DocSynchronizer_instances, broadcastToPeers_fn).call(this, payload));
    void (async () => {
      await handle.doc([READY, REQUESTING]);
      __privateMethod(this, _DocSynchronizer_instances, processAllPendingSyncMessages_fn).call(this);
    })();
  }
  get peerStates() {
    return __privateGet(this, _peerDocumentStatuses);
  }
  get documentId() {
    return __privateGet(this, _handle).documentId;
  }
  /// PUBLIC
  hasPeer(peerId) {
    return __privateGet(this, _peers).includes(peerId);
  }
  beginSync(peerIds) {
    const noPeersWithDocument = peerIds.every((peerId) => __privateGet(this, _peerDocumentStatuses)[peerId] in ["unavailable", "wants"]);
    const docPromise = __privateGet(this, _handle).doc([READY, REQUESTING, UNAVAILABLE]).then((doc) => {
      __privateSet(this, _syncStarted, true);
      __privateMethod(this, _DocSynchronizer_instances, checkDocUnavailable_fn).call(this);
      const wasUnavailable = doc === void 0;
      if (wasUnavailable && noPeersWithDocument) {
        return;
      }
      return doc ?? init2();
    });
    __privateGet(this, _log5).call(this, `beginSync: ${peerIds.join(", ")}`);
    peerIds.forEach((peerId) => {
      __privateMethod(this, _DocSynchronizer_instances, withSyncState_fn).call(this, peerId, (syncState) => {
        const reparsedSyncState = decodeSyncState2(encodeSyncState2(syncState));
        __privateMethod(this, _DocSynchronizer_instances, setSyncState_fn).call(this, peerId, reparsedSyncState);
        docPromise.then((doc) => {
          if (doc) {
            __privateMethod(this, _DocSynchronizer_instances, sendSyncMessage_fn).call(this, peerId, doc);
          }
        }).catch((err) => {
          __privateGet(this, _log5).call(this, `Error loading doc for ${peerId}: ${err}`);
        });
      });
    });
  }
  endSync(peerId) {
    __privateGet(this, _log5).call(this, `removing peer ${peerId}`);
    __privateSet(this, _peers, __privateGet(this, _peers).filter((p) => p !== peerId));
  }
  receiveMessage(message) {
    switch (message.type) {
      case "sync":
      case "request":
        this.receiveSyncMessage(message);
        break;
      case "ephemeral":
        this.receiveEphemeralMessage(message);
        break;
      case "doc-unavailable":
        __privateGet(this, _peerDocumentStatuses)[message.senderId] = "unavailable";
        __privateMethod(this, _DocSynchronizer_instances, checkDocUnavailable_fn).call(this);
        break;
      default:
        throw new Error(`unknown message type: ${message}`);
    }
  }
  receiveEphemeralMessage(message) {
    if (message.documentId !== __privateGet(this, _handle).documentId)
      throw new Error(`channelId doesn't match documentId`);
    const { senderId, data } = message;
    const contents = decode(new Uint8Array(data));
    __privateGet(this, _handle).emit("ephemeral-message", {
      handle: __privateGet(this, _handle),
      senderId,
      message: contents
    });
    __privateGet(this, _peers).forEach((peerId) => {
      if (peerId === senderId)
        return;
      this.emit("message", {
        ...message,
        targetId: peerId
      });
    });
  }
  receiveSyncMessage(message) {
    if (message.documentId !== __privateGet(this, _handle).documentId)
      throw new Error(`channelId doesn't match documentId`);
    if (!__privateGet(this, _handle).inState([READY, REQUESTING, UNAVAILABLE])) {
      __privateGet(this, _pendingSyncMessages).push({ message, received: /* @__PURE__ */ new Date() });
      return;
    }
    __privateMethod(this, _DocSynchronizer_instances, processAllPendingSyncMessages_fn).call(this);
    __privateMethod(this, _DocSynchronizer_instances, processSyncMessage_fn).call(this, message);
  }
};
_log5 = new WeakMap();
_peers = new WeakMap();
_pendingSyncStateCallbacks = new WeakMap();
_peerDocumentStatuses = new WeakMap();
_syncStates = new WeakMap();
_pendingSyncMessages = new WeakMap();
_syncStarted = new WeakMap();
_handle = new WeakMap();
_onLoadSyncState = new WeakMap();
_DocSynchronizer_instances = new WeakSet();
syncWithPeers_fn = async function() {
  __privateGet(this, _log5).call(this, `syncWithPeers`);
  const doc = await __privateGet(this, _handle).doc();
  if (doc === void 0)
    return;
  __privateGet(this, _peers).forEach((peerId) => __privateMethod(this, _DocSynchronizer_instances, sendSyncMessage_fn).call(this, peerId, doc));
};
broadcastToPeers_fn = async function({ data }) {
  __privateGet(this, _log5).call(this, `broadcastToPeers`, __privateGet(this, _peers));
  __privateGet(this, _peers).forEach((peerId) => __privateMethod(this, _DocSynchronizer_instances, sendEphemeralMessage_fn).call(this, peerId, data));
};
sendEphemeralMessage_fn = function(peerId, data) {
  __privateGet(this, _log5).call(this, `sendEphemeralMessage ->${peerId}`);
  const message = {
    type: "ephemeral",
    targetId: peerId,
    documentId: __privateGet(this, _handle).documentId,
    data
  };
  this.emit("message", message);
};
withSyncState_fn = function(peerId, callback) {
  __privateMethod(this, _DocSynchronizer_instances, addPeer_fn).call(this, peerId);
  if (!(peerId in __privateGet(this, _peerDocumentStatuses))) {
    __privateGet(this, _peerDocumentStatuses)[peerId] = "unknown";
  }
  const syncState = __privateGet(this, _syncStates)[peerId];
  if (syncState) {
    callback(syncState);
    return;
  }
  let pendingCallbacks = __privateGet(this, _pendingSyncStateCallbacks)[peerId];
  if (!pendingCallbacks) {
    __privateGet(this, _onLoadSyncState).call(this, peerId).then((syncState2) => {
      __privateMethod(this, _DocSynchronizer_instances, initSyncState_fn).call(this, peerId, syncState2 ?? initSyncState2());
    }).catch((err) => {
      __privateGet(this, _log5).call(this, `Error loading sync state for ${peerId}: ${err}`);
    });
    pendingCallbacks = __privateGet(this, _pendingSyncStateCallbacks)[peerId] = [];
  }
  pendingCallbacks.push(callback);
};
addPeer_fn = function(peerId) {
  if (!__privateGet(this, _peers).includes(peerId)) {
    __privateGet(this, _peers).push(peerId);
    this.emit("open-doc", { documentId: this.documentId, peerId });
  }
};
initSyncState_fn = function(peerId, syncState) {
  const pendingCallbacks = __privateGet(this, _pendingSyncStateCallbacks)[peerId];
  if (pendingCallbacks) {
    for (const callback of pendingCallbacks) {
      callback(syncState);
    }
  }
  delete __privateGet(this, _pendingSyncStateCallbacks)[peerId];
  __privateGet(this, _syncStates)[peerId] = syncState;
};
setSyncState_fn = function(peerId, syncState) {
  __privateGet(this, _syncStates)[peerId] = syncState;
  this.emit("sync-state", {
    peerId,
    syncState,
    documentId: __privateGet(this, _handle).documentId
  });
};
sendSyncMessage_fn = function(peerId, doc) {
  __privateGet(this, _log5).call(this, `sendSyncMessage ->${peerId}`);
  __privateMethod(this, _DocSynchronizer_instances, withSyncState_fn).call(this, peerId, (syncState) => {
    const [newSyncState, message] = generateSyncMessage(doc, syncState);
    if (message) {
      __privateMethod(this, _DocSynchronizer_instances, setSyncState_fn).call(this, peerId, newSyncState);
      const isNew = getHeads(doc).length === 0;
      if (!__privateGet(this, _handle).isReady() && isNew && newSyncState.sharedHeads.length === 0 && !Object.values(__privateGet(this, _peerDocumentStatuses)).includes("has") && __privateGet(this, _peerDocumentStatuses)[peerId] === "unknown") {
        this.emit("message", {
          type: "request",
          targetId: peerId,
          documentId: __privateGet(this, _handle).documentId,
          data: message
        });
      } else {
        this.emit("message", {
          type: "sync",
          targetId: peerId,
          data: message,
          documentId: __privateGet(this, _handle).documentId
        });
      }
      if (!isNew) {
        __privateGet(this, _peerDocumentStatuses)[peerId] = "has";
      }
    }
  });
};
processSyncMessage_fn = function(message) {
  if (isRequestMessage(message)) {
    __privateGet(this, _peerDocumentStatuses)[message.senderId] = "wants";
  }
  __privateMethod(this, _DocSynchronizer_instances, checkDocUnavailable_fn).call(this);
  if (decodeSyncMessage2(message.data).heads.length > 0) {
    __privateGet(this, _peerDocumentStatuses)[message.senderId] = "has";
  }
  __privateMethod(this, _DocSynchronizer_instances, withSyncState_fn).call(this, message.senderId, (syncState) => {
    __privateGet(this, _handle).update((doc) => {
      const [newDoc, newSyncState] = receiveSyncMessage(doc, syncState, message.data);
      __privateMethod(this, _DocSynchronizer_instances, setSyncState_fn).call(this, message.senderId, newSyncState);
      __privateMethod(this, _DocSynchronizer_instances, sendSyncMessage_fn).call(this, message.senderId, doc);
      return newDoc;
    });
    __privateMethod(this, _DocSynchronizer_instances, checkDocUnavailable_fn).call(this);
  });
};
checkDocUnavailable_fn = function() {
  if (__privateGet(this, _syncStarted) && __privateGet(this, _handle).inState([REQUESTING]) && __privateGet(this, _peers).every((peerId) => __privateGet(this, _peerDocumentStatuses)[peerId] === "unavailable" || __privateGet(this, _peerDocumentStatuses)[peerId] === "wants")) {
    __privateGet(this, _peers).filter((peerId) => __privateGet(this, _peerDocumentStatuses)[peerId] === "wants").forEach((peerId) => {
      const message = {
        type: "doc-unavailable",
        documentId: __privateGet(this, _handle).documentId,
        targetId: peerId
      };
      this.emit("message", message);
    });
    __privateGet(this, _handle).unavailable();
  }
};
processAllPendingSyncMessages_fn = function() {
  for (const message of __privateGet(this, _pendingSyncMessages)) {
    __privateMethod(this, _DocSynchronizer_instances, processSyncMessage_fn).call(this, message.message);
  }
  __privateSet(this, _pendingSyncMessages, []);
};

// node_modules/@automerge/automerge-repo/dist/synchronizer/CollectionSynchronizer.js
var log2 = (0, import_debug6.default)("automerge-repo:collectionsync");
var _peers2, _docSynchronizers, _docSetUp, _CollectionSynchronizer_instances, fetchDocSynchronizer_fn, initDocSynchronizer_fn, documentGenerousPeers_fn;
var CollectionSynchronizer = class extends Synchronizer {
  constructor(repo) {
    super();
    __privateAdd(this, _CollectionSynchronizer_instances);
    __publicField(this, "repo");
    /** The set of peers we are connected with */
    __privateAdd(this, _peers2, /* @__PURE__ */ new Set());
    /** A map of documentIds to their synchronizers */
    __privateAdd(this, _docSynchronizers, {});
    /** Used to determine if the document is know to the Collection and a synchronizer exists or is being set up */
    __privateAdd(this, _docSetUp, {});
    this.repo = repo;
  }
  // PUBLIC
  /**
   * When we receive a sync message for a document we haven't got in memory, we
   * register it with the repo and start synchronizing
   */
  async receiveMessage(message) {
    log2(`onSyncMessage: ${message.senderId}, ${message.documentId}, ${"data" in message ? message.data.byteLength + "bytes" : ""}`);
    const documentId = message.documentId;
    if (!documentId) {
      throw new Error("received a message with an invalid documentId");
    }
    __privateGet(this, _docSetUp)[documentId] = true;
    const docSynchronizer = __privateMethod(this, _CollectionSynchronizer_instances, fetchDocSynchronizer_fn).call(this, documentId);
    docSynchronizer.receiveMessage(message);
    const peers = await __privateMethod(this, _CollectionSynchronizer_instances, documentGenerousPeers_fn).call(this, documentId);
    docSynchronizer.beginSync(peers.filter((peerId) => !docSynchronizer.hasPeer(peerId)));
  }
  /**
   * Starts synchronizing the given document with all peers that we share it generously with.
   */
  addDocument(documentId) {
    if (__privateGet(this, _docSetUp)[documentId]) {
      return;
    }
    const docSynchronizer = __privateMethod(this, _CollectionSynchronizer_instances, fetchDocSynchronizer_fn).call(this, documentId);
    void __privateMethod(this, _CollectionSynchronizer_instances, documentGenerousPeers_fn).call(this, documentId).then((peers) => {
      docSynchronizer.beginSync(peers);
    });
  }
  // TODO: implement this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeDocument(documentId) {
    throw new Error("not implemented");
  }
  /** Adds a peer and maybe starts synchronizing with them */
  addPeer(peerId) {
    log2(`adding ${peerId} & synchronizing with them`);
    if (__privateGet(this, _peers2).has(peerId)) {
      return;
    }
    __privateGet(this, _peers2).add(peerId);
    for (const docSynchronizer of Object.values(__privateGet(this, _docSynchronizers))) {
      const { documentId } = docSynchronizer;
      void this.repo.sharePolicy(peerId, documentId).then((okToShare) => {
        if (okToShare)
          docSynchronizer.beginSync([peerId]);
      });
    }
  }
  /** Removes a peer and stops synchronizing with them */
  removePeer(peerId) {
    log2(`removing peer ${peerId}`);
    __privateGet(this, _peers2).delete(peerId);
    for (const docSynchronizer of Object.values(__privateGet(this, _docSynchronizers))) {
      docSynchronizer.endSync(peerId);
    }
  }
  /** Returns a list of all connected peer ids */
  get peers() {
    return Array.from(__privateGet(this, _peers2));
  }
};
_peers2 = new WeakMap();
_docSynchronizers = new WeakMap();
_docSetUp = new WeakMap();
_CollectionSynchronizer_instances = new WeakSet();
/** Returns a synchronizer for the given document, creating one if it doesn't already exist.  */
fetchDocSynchronizer_fn = function(documentId) {
  if (!__privateGet(this, _docSynchronizers)[documentId]) {
    const handle = this.repo.find(stringifyAutomergeUrl({ documentId }));
    __privateGet(this, _docSynchronizers)[documentId] = __privateMethod(this, _CollectionSynchronizer_instances, initDocSynchronizer_fn).call(this, handle);
  }
  return __privateGet(this, _docSynchronizers)[documentId];
};
/** Creates a new docSynchronizer and sets it up to propagate messages */
initDocSynchronizer_fn = function(handle) {
  const docSynchronizer = new DocSynchronizer({
    handle,
    onLoadSyncState: async (peerId) => {
      if (!this.repo.storageSubsystem) {
        return;
      }
      const { storageId, isEphemeral } = this.repo.peerMetadataByPeerId[peerId] || {};
      if (!storageId || isEphemeral) {
        return;
      }
      return this.repo.storageSubsystem.loadSyncState(handle.documentId, storageId);
    }
  });
  docSynchronizer.on("message", (event) => this.emit("message", event));
  docSynchronizer.on("open-doc", (event) => this.emit("open-doc", event));
  docSynchronizer.on("sync-state", (event) => this.emit("sync-state", event));
  return docSynchronizer;
};
documentGenerousPeers_fn = async function(documentId) {
  const peers = Array.from(__privateGet(this, _peers2));
  const generousPeers = [];
  for (const peerId of peers) {
    const okToShare = await this.repo.sharePolicy(peerId, documentId);
    if (okToShare)
      generousPeers.push(peerId);
  }
  return generousPeers;
};

// node_modules/@automerge/automerge-repo/dist/Repo.js
var _log6, _handleCache, _synchronizer, _remoteHeadsSubscriptions, _remoteHeadsGossipingEnabled, _Repo_instances, receiveMessage_fn, _throttledSaveSyncStateHandlers, saveSyncState_fn, getHandle_fn;
var Repo = class extends import_index.default {
  constructor({ storage, network = [], peerId, sharePolicy, isEphemeral = storage === void 0, enableRemoteHeadsGossiping = false } = {}) {
    super();
    __privateAdd(this, _Repo_instances);
    __privateAdd(this, _log6);
    /** @hidden */
    __publicField(this, "networkSubsystem");
    /** @hidden */
    __publicField(this, "storageSubsystem");
    /** The debounce rate is adjustable on the repo. */
    /** @hidden */
    __publicField(this, "saveDebounceRate", 100);
    __privateAdd(this, _handleCache, {});
    __privateAdd(this, _synchronizer);
    /** By default, we share generously with all peers. */
    /** @hidden */
    __publicField(this, "sharePolicy", async () => true);
    /** maps peer id to to persistence information (storageId, isEphemeral), access by collection synchronizer  */
    /** @hidden */
    __publicField(this, "peerMetadataByPeerId", {});
    __privateAdd(this, _remoteHeadsSubscriptions, new RemoteHeadsSubscriptions());
    __privateAdd(this, _remoteHeadsGossipingEnabled, false);
    __privateAdd(this, _throttledSaveSyncStateHandlers, {});
    __publicField(this, "subscribeToRemotes", (remotes) => {
      if (__privateGet(this, _remoteHeadsGossipingEnabled)) {
        __privateGet(this, _log6).call(this, "subscribeToRemotes", { remotes });
        __privateGet(this, _remoteHeadsSubscriptions).subscribeToRemotes(remotes);
      } else {
        __privateGet(this, _log6).call(this, "WARN: subscribeToRemotes called but remote heads gossiping is not enabled");
      }
    });
    __publicField(this, "storageId", async () => {
      if (!this.storageSubsystem) {
        return void 0;
      } else {
        return this.storageSubsystem.id();
      }
    });
    __privateSet(this, _remoteHeadsGossipingEnabled, enableRemoteHeadsGossiping);
    __privateSet(this, _log6, (0, import_debug7.default)(`automerge-repo:repo`));
    this.sharePolicy = sharePolicy ?? this.sharePolicy;
    this.on("document", async ({ handle, isNew }) => {
      if (storageSubsystem) {
        const saveFn = ({ handle: handle2, doc }) => {
          void storageSubsystem.saveDoc(handle2.documentId, doc);
        };
        handle.on("heads-changed", throttle(saveFn, this.saveDebounceRate));
        if (isNew) {
          await storageSubsystem.saveDoc(handle.documentId, handle.docSync());
        } else {
          const loadedDoc = await storageSubsystem.loadDoc(handle.documentId);
          if (loadedDoc) {
            handle.update(() => loadedDoc);
          }
        }
      }
      handle.on("unavailable", () => {
        __privateGet(this, _log6).call(this, "document unavailable", { documentId: handle.documentId });
        this.emit("unavailable-document", {
          documentId: handle.documentId
        });
      });
      if (this.networkSubsystem.isReady()) {
        handle.request();
      } else {
        handle.awaitNetwork();
        this.networkSubsystem.whenReady().then(() => {
          handle.networkReady();
        }).catch((err) => {
          __privateGet(this, _log6).call(this, "error waiting for network", { err });
        });
      }
      __privateGet(this, _synchronizer).addDocument(handle.documentId);
    });
    this.on("delete-document", ({ documentId }) => {
      if (storageSubsystem) {
        storageSubsystem.removeDoc(documentId).catch((err) => {
          __privateGet(this, _log6).call(this, "error deleting document", { documentId, err });
        });
      }
    });
    __privateSet(this, _synchronizer, new CollectionSynchronizer(this));
    __privateGet(this, _synchronizer).on("message", (message) => {
      __privateGet(this, _log6).call(this, `sending ${message.type} message to ${message.targetId}`);
      networkSubsystem.send(message);
    });
    if (__privateGet(this, _remoteHeadsGossipingEnabled)) {
      __privateGet(this, _synchronizer).on("open-doc", ({ peerId: peerId2, documentId }) => {
        __privateGet(this, _remoteHeadsSubscriptions).subscribePeerToDoc(peerId2, documentId);
      });
    }
    const storageSubsystem = storage ? new StorageSubsystem(storage) : void 0;
    this.storageSubsystem = storageSubsystem;
    const myPeerMetadata = (async () => ({
      storageId: await (storageSubsystem == null ? void 0 : storageSubsystem.id()),
      isEphemeral
    }))();
    const networkSubsystem = new NetworkSubsystem(network, peerId, myPeerMetadata);
    this.networkSubsystem = networkSubsystem;
    networkSubsystem.on("peer", async ({ peerId: peerId2, peerMetadata }) => {
      __privateGet(this, _log6).call(this, "peer connected", { peerId: peerId2 });
      if (peerMetadata) {
        this.peerMetadataByPeerId[peerId2] = { ...peerMetadata };
      }
      this.sharePolicy(peerId2).then((shouldShare) => {
        if (shouldShare && __privateGet(this, _remoteHeadsGossipingEnabled)) {
          __privateGet(this, _remoteHeadsSubscriptions).addGenerousPeer(peerId2);
        }
      }).catch((err) => {
        console.log("error in share policy", { err });
      });
      __privateGet(this, _synchronizer).addPeer(peerId2);
    });
    networkSubsystem.on("peer-disconnected", ({ peerId: peerId2 }) => {
      __privateGet(this, _synchronizer).removePeer(peerId2);
      __privateGet(this, _remoteHeadsSubscriptions).removePeer(peerId2);
    });
    networkSubsystem.on("message", async (msg) => {
      __privateMethod(this, _Repo_instances, receiveMessage_fn).call(this, msg);
    });
    __privateGet(this, _synchronizer).on("sync-state", (message) => {
      __privateMethod(this, _Repo_instances, saveSyncState_fn).call(this, message);
      const handle = __privateGet(this, _handleCache)[message.documentId];
      const { storageId } = this.peerMetadataByPeerId[message.peerId] || {};
      if (!storageId) {
        return;
      }
      const heads = handle.getRemoteHeads(storageId);
      const haveHeadsChanged = message.syncState.theirHeads && (!heads || !headsAreSame(heads, message.syncState.theirHeads));
      if (haveHeadsChanged && message.syncState.theirHeads) {
        handle.setRemoteHeads(storageId, message.syncState.theirHeads);
        if (storageId && __privateGet(this, _remoteHeadsGossipingEnabled)) {
          __privateGet(this, _remoteHeadsSubscriptions).handleImmediateRemoteHeadsChanged(message.documentId, storageId, message.syncState.theirHeads);
        }
      }
    });
    if (__privateGet(this, _remoteHeadsGossipingEnabled)) {
      __privateGet(this, _remoteHeadsSubscriptions).on("notify-remote-heads", (message) => {
        this.networkSubsystem.send({
          type: "remote-heads-changed",
          targetId: message.targetId,
          documentId: message.documentId,
          newHeads: {
            [message.storageId]: {
              heads: message.heads,
              timestamp: message.timestamp
            }
          }
        });
      });
      __privateGet(this, _remoteHeadsSubscriptions).on("change-remote-subs", (message) => {
        __privateGet(this, _log6).call(this, "change-remote-subs", message);
        for (const peer of message.peers) {
          this.networkSubsystem.send({
            type: "remote-subscription-change",
            targetId: peer,
            add: message.add,
            remove: message.remove
          });
        }
      });
      __privateGet(this, _remoteHeadsSubscriptions).on("remote-heads-changed", (message) => {
        const handle = __privateGet(this, _handleCache)[message.documentId];
        handle.setRemoteHeads(message.storageId, message.remoteHeads);
      });
    }
  }
  /** Returns all the handles we have cached. */
  get handles() {
    return __privateGet(this, _handleCache);
  }
  /** Returns a list of all connected peer ids */
  get peers() {
    return __privateGet(this, _synchronizer).peers;
  }
  getStorageIdOfPeer(peerId) {
    var _a;
    return (_a = this.peerMetadataByPeerId[peerId]) == null ? void 0 : _a.storageId;
  }
  /**
   * Creates a new document and returns a handle to it. The initial value of the document is an
   * empty object `{}` unless an initial value is provided. Its documentId is generated by the
   * system. we emit a `document` event to advertise interest in the document.
   */
  create(initialValue) {
    const { documentId } = parseAutomergeUrl(generateAutomergeUrl());
    const handle = __privateMethod(this, _Repo_instances, getHandle_fn).call(this, {
      documentId,
      isNew: true,
      initialValue
    });
    this.emit("document", { handle, isNew: true });
    return handle;
  }
  /** Create a new DocHandle by cloning the history of an existing DocHandle.
   *
   * @param clonedHandle - The handle to clone
   *
   * @remarks This is a wrapper around the `clone` function in the Automerge library.
   * The new `DocHandle` will have a new URL but will share history with the original,
   * which means that changes made to the cloned handle can be sensibly merged back
   * into the original.
   *
   * Any peers this `Repo` is connected to for whom `sharePolicy` returns `true` will
   * be notified of the newly created DocHandle.
   *
   * @throws if the cloned handle is not yet ready or if
   * `clonedHandle.docSync()` returns `undefined` (i.e. the handle is unavailable).
   */
  clone(clonedHandle) {
    if (!clonedHandle.isReady()) {
      throw new Error(`Cloned handle is not yet in ready state.
        (Try await handle.waitForReady() first.)`);
    }
    const sourceDoc = clonedHandle.docSync();
    if (!sourceDoc) {
      throw new Error("Cloned handle doesn't have a document.");
    }
    const handle = this.create();
    handle.update(() => {
      return next_slim_exports.clone(sourceDoc);
    });
    return handle;
  }
  /**
   * Retrieves a document by id. It gets data from the local system, but also emits a `document`
   * event to advertise interest in the document.
   */
  find(id) {
    const documentId = interpretAsDocumentId(id);
    if (__privateGet(this, _handleCache)[documentId]) {
      if (__privateGet(this, _handleCache)[documentId].isUnavailable()) {
        setTimeout(() => {
          __privateGet(this, _handleCache)[documentId].emit("unavailable", {
            handle: __privateGet(this, _handleCache)[documentId]
          });
        });
      }
      return __privateGet(this, _handleCache)[documentId];
    }
    const handle = __privateMethod(this, _Repo_instances, getHandle_fn).call(this, {
      documentId,
      isNew: false
    });
    this.emit("document", { handle, isNew: false });
    return handle;
  }
  delete(id) {
    const documentId = interpretAsDocumentId(id);
    const handle = __privateMethod(this, _Repo_instances, getHandle_fn).call(this, { documentId, isNew: false });
    handle.delete();
    delete __privateGet(this, _handleCache)[documentId];
    this.emit("delete-document", { documentId });
  }
  /**
   * Exports a document to a binary format.
   * @param id - The url or documentId of the handle to export
   *
   * @returns Promise<Uint8Array | undefined> - A Promise containing the binary document,
   * or undefined if the document is unavailable.
   */
  async export(id) {
    const documentId = interpretAsDocumentId(id);
    const handle = __privateMethod(this, _Repo_instances, getHandle_fn).call(this, { documentId, isNew: false });
    const doc = await handle.doc();
    if (!doc)
      return void 0;
    return next_slim_exports.save(doc);
  }
  /**
   * Imports document binary into the repo.
   * @param binary - The binary to import
   */
  import(binary) {
    const doc = next_slim_exports.load(binary);
    const handle = this.create();
    handle.update(() => {
      return next_slim_exports.clone(doc);
    });
    return handle;
  }
  /**
   * Writes Documents to a disk.
   * @hidden this API is experimental and may change.
   * @param documents - if provided, only writes the specified documents.
   * @returns Promise<void>
   */
  async flush(documents) {
    if (!this.storageSubsystem) {
      return;
    }
    const handles = documents ? documents.map((id) => __privateGet(this, _handleCache)[id]) : Object.values(__privateGet(this, _handleCache));
    await Promise.all(handles.map(async (handle) => {
      const doc = handle.docSync();
      if (!doc) {
        return;
      }
      return this.storageSubsystem.saveDoc(handle.documentId, doc);
    }));
  }
};
_log6 = new WeakMap();
_handleCache = new WeakMap();
_synchronizer = new WeakMap();
_remoteHeadsSubscriptions = new WeakMap();
_remoteHeadsGossipingEnabled = new WeakMap();
_Repo_instances = new WeakSet();
receiveMessage_fn = function(message) {
  switch (message.type) {
    case "remote-subscription-change":
      if (__privateGet(this, _remoteHeadsGossipingEnabled)) {
        __privateGet(this, _remoteHeadsSubscriptions).handleControlMessage(message);
      }
      break;
    case "remote-heads-changed":
      if (__privateGet(this, _remoteHeadsGossipingEnabled)) {
        __privateGet(this, _remoteHeadsSubscriptions).handleRemoteHeads(message);
      }
      break;
    case "sync":
    case "request":
    case "ephemeral":
    case "doc-unavailable":
      __privateGet(this, _synchronizer).receiveMessage(message).catch((err) => {
        console.log("error receiving message", { err });
      });
  }
};
_throttledSaveSyncStateHandlers = new WeakMap();
/** saves sync state throttled per storage id, if a peer doesn't have a storage id it's sync state is not persisted */
saveSyncState_fn = function(payload) {
  if (!this.storageSubsystem) {
    return;
  }
  const { storageId, isEphemeral } = this.peerMetadataByPeerId[payload.peerId] || {};
  if (!storageId || isEphemeral) {
    return;
  }
  let handler = __privateGet(this, _throttledSaveSyncStateHandlers)[storageId];
  if (!handler) {
    handler = __privateGet(this, _throttledSaveSyncStateHandlers)[storageId] = throttle(({ documentId, syncState }) => {
      void this.storageSubsystem.saveSyncState(documentId, storageId, syncState);
    }, this.saveDebounceRate);
  }
  handler(payload);
};
/** Returns an existing handle if we have it; creates one otherwise. */
getHandle_fn = function({ documentId, isNew, initialValue }) {
  if (__privateGet(this, _handleCache)[documentId])
    return __privateGet(this, _handleCache)[documentId];
  if (!documentId)
    throw new Error(`Invalid documentId ${documentId}`);
  const handle = new DocHandle(documentId, { isNew, initialValue });
  __privateGet(this, _handleCache)[documentId] = handle;
  return handle;
};

// node_modules/@automerge/automerge-repo/dist/network/NetworkAdapter.js
var NetworkAdapter = class extends import_index.default {
  constructor() {
    super(...arguments);
    __publicField(this, "peerId");
    __publicField(this, "peerMetadata");
  }
};

// node_modules/@automerge/automerge-repo/dist/storage/StorageAdapter.js
var StorageAdapter = class {
};

export {
  __export,
  __toESM,
  __publicField,
  __privateGet,
  __privateAdd,
  __privateSet,
  __privateMethod,
  Counter,
  RawString,
  UseApi,
  insertAt,
  deleteAt,
  view,
  getChanges,
  getAllChanges,
  applyChanges,
  splice,
  updateText,
  getCursor,
  getCursorPosition,
  mark,
  unmark,
  getConflicts,
  next_slim_exports,
  require_browser,
  parseAutomergeUrl,
  stringifyAutomergeUrl,
  isValidAutomergeUrl,
  isValidDocumentId,
  generateAutomergeUrl,
  interpretAsDocumentId,
  cbor_exports,
  DocHandle,
  isRepoMessage,
  Repo,
  NetworkAdapter,
  StorageAdapter
};
/*! Bundled license information:

@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=chunk-LGBC6PSF.js.map
