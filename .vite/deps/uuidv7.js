import "./chunk-SNAQBZPT.js";

// node_modules/uuidv7/dist/index.js
var DIGITS = "0123456789abcdef";
var UUID = class _UUID {
  /** @param bytes - The 16-byte byte array representation. */
  constructor(bytes) {
    this.bytes = bytes;
  }
  /**
   * Creates an object from the internal representation, a 16-byte byte array
   * containing the binary UUID representation in the big-endian byte order.
   *
   * This method does NOT shallow-copy the argument, and thus the created object
   * holds the reference to the underlying buffer.
   *
   * @throws TypeError if the length of the argument is not 16.
   */
  static ofInner(bytes) {
    if (bytes.length !== 16) {
      throw new TypeError("not 128-bit length");
    } else {
      return new _UUID(bytes);
    }
  }
  /**
   * Builds a byte array from UUIDv7 field values.
   *
   * @param unixTsMs - A 48-bit `unix_ts_ms` field value.
   * @param randA - A 12-bit `rand_a` field value.
   * @param randBHi - The higher 30 bits of 62-bit `rand_b` field value.
   * @param randBLo - The lower 32 bits of 62-bit `rand_b` field value.
   * @throws RangeError if any field value is out of the specified range.
   */
  static fromFieldsV7(unixTsMs, randA, randBHi, randBLo) {
    if (!Number.isInteger(unixTsMs) || !Number.isInteger(randA) || !Number.isInteger(randBHi) || !Number.isInteger(randBLo) || unixTsMs < 0 || randA < 0 || randBHi < 0 || randBLo < 0 || unixTsMs > 281474976710655 || randA > 4095 || randBHi > 1073741823 || randBLo > 4294967295) {
      throw new RangeError("invalid field value");
    }
    const bytes = new Uint8Array(16);
    bytes[0] = unixTsMs / 2 ** 40;
    bytes[1] = unixTsMs / 2 ** 32;
    bytes[2] = unixTsMs / 2 ** 24;
    bytes[3] = unixTsMs / 2 ** 16;
    bytes[4] = unixTsMs / 2 ** 8;
    bytes[5] = unixTsMs;
    bytes[6] = 112 | randA >>> 8;
    bytes[7] = randA;
    bytes[8] = 128 | randBHi >>> 24;
    bytes[9] = randBHi >>> 16;
    bytes[10] = randBHi >>> 8;
    bytes[11] = randBHi;
    bytes[12] = randBLo >>> 24;
    bytes[13] = randBLo >>> 16;
    bytes[14] = randBLo >>> 8;
    bytes[15] = randBLo;
    return new _UUID(bytes);
  }
  /**
   * Builds a byte array from a string representation.
   *
   * This method accepts the following formats:
   *
   * - 32-digit hexadecimal format without hyphens: `0189dcd553117d408db09496a2eef37b`
   * - 8-4-4-4-12 hyphenated format: `0189dcd5-5311-7d40-8db0-9496a2eef37b`
   * - Hyphenated format with surrounding braces: `{0189dcd5-5311-7d40-8db0-9496a2eef37b}`
   * - RFC 9562 URN format: `urn:uuid:0189dcd5-5311-7d40-8db0-9496a2eef37b`
   *
   * Leading and trailing whitespaces represents an error.
   *
   * @throws SyntaxError if the argument could not parse as a valid UUID string.
   */
  static parse(uuid) {
    var _a, _b, _c, _d;
    let hex = void 0;
    switch (uuid.length) {
      case 32:
        hex = (_a = /^[0-9a-f]{32}$/i.exec(uuid)) === null || _a === void 0 ? void 0 : _a[0];
        break;
      case 36:
        hex = (_b = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(uuid)) === null || _b === void 0 ? void 0 : _b.slice(1, 6).join("");
        break;
      case 38:
        hex = (_c = /^\{([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\}$/i.exec(uuid)) === null || _c === void 0 ? void 0 : _c.slice(1, 6).join("");
        break;
      case 45:
        hex = (_d = /^urn:uuid:([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(uuid)) === null || _d === void 0 ? void 0 : _d.slice(1, 6).join("");
        break;
      default:
        break;
    }
    if (hex) {
      const inner = new Uint8Array(16);
      for (let i = 0; i < 16; i += 4) {
        const n = parseInt(hex.substring(2 * i, 2 * i + 8), 16);
        inner[i + 0] = n >>> 24;
        inner[i + 1] = n >>> 16;
        inner[i + 2] = n >>> 8;
        inner[i + 3] = n;
      }
      return new _UUID(inner);
    } else {
      throw new SyntaxError("could not parse UUID string");
    }
  }
  /**
   * @returns The 8-4-4-4-12 canonical hexadecimal string representation
   * (`0189dcd5-5311-7d40-8db0-9496a2eef37b`).
   */
  toString() {
    let text = "";
    for (let i = 0; i < this.bytes.length; i++) {
      text += DIGITS.charAt(this.bytes[i] >>> 4);
      text += DIGITS.charAt(this.bytes[i] & 15);
      if (i === 3 || i === 5 || i === 7 || i === 9) {
        text += "-";
      }
    }
    return text;
  }
  /**
   * @returns The 32-digit hexadecimal representation without hyphens
   * (`0189dcd553117d408db09496a2eef37b`).
   */
  toHex() {
    let text = "";
    for (let i = 0; i < this.bytes.length; i++) {
      text += DIGITS.charAt(this.bytes[i] >>> 4);
      text += DIGITS.charAt(this.bytes[i] & 15);
    }
    return text;
  }
  /** @returns The 8-4-4-4-12 canonical hexadecimal string representation. */
  toJSON() {
    return this.toString();
  }
  /**
   * Reports the variant field value of the UUID or, if appropriate, "NIL" or
   * "MAX".
   *
   * For convenience, this method reports "NIL" or "MAX" if `this` represents
   * the Nil or Max UUID, although the Nil and Max UUIDs are technically
   * subsumed under the variants `0b0` and `0b111`, respectively.
   */
  getVariant() {
    const n = this.bytes[8] >>> 4;
    if (n < 0) {
      throw new Error("unreachable");
    } else if (n <= 7) {
      return this.bytes.every((e) => e === 0) ? "NIL" : "VAR_0";
    } else if (n <= 11) {
      return "VAR_10";
    } else if (n <= 13) {
      return "VAR_110";
    } else if (n <= 15) {
      return this.bytes.every((e) => e === 255) ? "MAX" : "VAR_RESERVED";
    } else {
      throw new Error("unreachable");
    }
  }
  /**
   * Returns the version field value of the UUID or `undefined` if the UUID does
   * not have the variant field value of `0b10`.
   */
  getVersion() {
    return this.getVariant() === "VAR_10" ? this.bytes[6] >>> 4 : void 0;
  }
  /** Creates an object from `this`. */
  clone() {
    return new _UUID(this.bytes.slice(0));
  }
  /** Returns true if `this` is equivalent to `other`. */
  equals(other) {
    return this.compareTo(other) === 0;
  }
  /**
   * Returns a negative integer, zero, or positive integer if `this` is less
   * than, equal to, or greater than `other`, respectively.
   */
  compareTo(other) {
    for (let i = 0; i < 16; i++) {
      const diff = this.bytes[i] - other.bytes[i];
      if (diff !== 0) {
        return Math.sign(diff);
      }
    }
    return 0;
  }
};
var V7Generator = class {
  /**
   * Creates a generator object with the default random number generator, or
   * with the specified one if passed as an argument. The specified random
   * number generator should be cryptographically strong and securely seeded.
   */
  constructor(randomNumberGenerator) {
    this.timestamp = 0;
    this.counter = 0;
    this.random = randomNumberGenerator !== null && randomNumberGenerator !== void 0 ? randomNumberGenerator : getDefaultRandom();
  }
  /**
   * Generates a new UUIDv7 object from the current timestamp, or resets the
   * generator upon significant timestamp rollback.
   *
   * This method returns a monotonically increasing UUID by reusing the previous
   * timestamp even if the up-to-date timestamp is smaller than the immediately
   * preceding UUID's. However, when such a clock rollback is considered
   * significant (i.e., by more than ten seconds), this method resets the
   * generator and returns a new UUID based on the given timestamp, breaking the
   * increasing order of UUIDs.
   *
   * See {@link generateOrAbort} for the other mode of generation and
   * {@link generateOrResetCore} for the low-level primitive.
   */
  generate() {
    return this.generateOrResetCore(Date.now(), 1e4);
  }
  /**
   * Generates a new UUIDv7 object from the current timestamp, or returns
   * `undefined` upon significant timestamp rollback.
   *
   * This method returns a monotonically increasing UUID by reusing the previous
   * timestamp even if the up-to-date timestamp is smaller than the immediately
   * preceding UUID's. However, when such a clock rollback is considered
   * significant (i.e., by more than ten seconds), this method aborts and
   * returns `undefined` immediately.
   *
   * See {@link generate} for the other mode of generation and
   * {@link generateOrAbortCore} for the low-level primitive.
   */
  generateOrAbort() {
    return this.generateOrAbortCore(Date.now(), 1e4);
  }
  /**
   * Generates a new UUIDv7 object from the `unixTsMs` passed, or resets the
   * generator upon significant timestamp rollback.
   *
   * This method is equivalent to {@link generate} except that it takes a custom
   * timestamp and clock rollback allowance.
   *
   * @param rollbackAllowance - The amount of `unixTsMs` rollback that is
   * considered significant. A suggested value is `10_000` (milliseconds).
   * @throws RangeError if `unixTsMs` is not a 48-bit positive integer.
   */
  generateOrResetCore(unixTsMs, rollbackAllowance) {
    let value = this.generateOrAbortCore(unixTsMs, rollbackAllowance);
    if (value === void 0) {
      this.timestamp = 0;
      value = this.generateOrAbortCore(unixTsMs, rollbackAllowance);
    }
    return value;
  }
  /**
   * Generates a new UUIDv7 object from the `unixTsMs` passed, or returns
   * `undefined` upon significant timestamp rollback.
   *
   * This method is equivalent to {@link generateOrAbort} except that it takes a
   * custom timestamp and clock rollback allowance.
   *
   * @param rollbackAllowance - The amount of `unixTsMs` rollback that is
   * considered significant. A suggested value is `10_000` (milliseconds).
   * @throws RangeError if `unixTsMs` is not a 48-bit positive integer.
   */
  generateOrAbortCore(unixTsMs, rollbackAllowance) {
    const MAX_COUNTER = 4398046511103;
    if (!Number.isInteger(unixTsMs) || unixTsMs < 1 || unixTsMs > 281474976710655) {
      throw new RangeError("`unixTsMs` must be a 48-bit positive integer");
    } else if (rollbackAllowance < 0 || rollbackAllowance > 281474976710655) {
      throw new RangeError("`rollbackAllowance` out of reasonable range");
    }
    if (unixTsMs > this.timestamp) {
      this.timestamp = unixTsMs;
      this.resetCounter();
    } else if (unixTsMs + rollbackAllowance >= this.timestamp) {
      this.counter++;
      if (this.counter > MAX_COUNTER) {
        this.timestamp++;
        this.resetCounter();
      }
    } else {
      return void 0;
    }
    return UUID.fromFieldsV7(this.timestamp, Math.trunc(this.counter / 2 ** 30), this.counter & 2 ** 30 - 1, this.random.nextUint32());
  }
  /** Initializes the counter at a 42-bit random integer. */
  resetCounter() {
    this.counter = this.random.nextUint32() * 1024 + (this.random.nextUint32() & 1023);
  }
  /**
   * Generates a new UUIDv4 object utilizing the random number generator inside.
   *
   * @internal
   */
  generateV4() {
    const bytes = new Uint8Array(Uint32Array.of(this.random.nextUint32(), this.random.nextUint32(), this.random.nextUint32(), this.random.nextUint32()).buffer);
    bytes[6] = 64 | bytes[6] >>> 4;
    bytes[8] = 128 | bytes[8] >>> 2;
    return UUID.ofInner(bytes);
  }
};
var getDefaultRandom = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues !== "undefined") {
    return new BufferedCryptoRandom();
  } else {
    if (typeof UUIDV7_DENY_WEAK_RNG !== "undefined" && UUIDV7_DENY_WEAK_RNG) {
      throw new Error("no cryptographically strong RNG available");
    }
    return {
      nextUint32: () => Math.trunc(Math.random() * 65536) * 65536 + Math.trunc(Math.random() * 65536)
    };
  }
};
var BufferedCryptoRandom = class {
  constructor() {
    this.buffer = new Uint32Array(8);
    this.cursor = 65535;
  }
  nextUint32() {
    if (this.cursor >= this.buffer.length) {
      crypto.getRandomValues(this.buffer);
      this.cursor = 0;
    }
    return this.buffer[this.cursor++];
  }
};
var defaultGenerator;
var uuidv7 = () => uuidv7obj().toString();
var uuidv7obj = () => (defaultGenerator || (defaultGenerator = new V7Generator())).generate();
var uuidv4 = () => uuidv4obj().toString();
var uuidv4obj = () => (defaultGenerator || (defaultGenerator = new V7Generator())).generateV4();
export {
  UUID,
  V7Generator,
  uuidv4,
  uuidv4obj,
  uuidv7,
  uuidv7obj
};
/*! Bundled license information:

uuidv7/dist/index.js:
  (**
   * uuidv7: A JavaScript implementation of UUID version 7
   *
   * Copyright 2021-2024 LiosK
   *
   * @license Apache-2.0
   * @packageDocumentation
   *)
*/
//# sourceMappingURL=uuidv7.js.map
