import {
  Counter,
  DocHandle,
  NetworkAdapter,
  RawString,
  Repo,
  StorageAdapter,
  UseApi,
  applyChanges,
  cbor_exports,
  deleteAt,
  generateAutomergeUrl,
  getAllChanges,
  getChanges,
  getConflicts,
  getCursor,
  getCursorPosition,
  insertAt,
  interpretAsDocumentId,
  isRepoMessage,
  isValidAutomergeUrl,
  isValidDocumentId,
  mark,
  next_slim_exports,
  parseAutomergeUrl,
  splice,
  stringifyAutomergeUrl,
  unmark,
  updateText,
  view
} from "./chunk-3N3NGKXR.js";
import {
  __export
} from "./chunk-WOOG5QLI.js";

// node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/bundler/automerge_wasm.js
var automerge_wasm_exports = {};
__export(automerge_wasm_exports, {
  Automerge: () => Automerge,
  SyncState: () => SyncState,
  TextRepresentation: () => TextRepresentation,
  __wbg_String_91fba7ded13ba54c: () => __wbg_String_91fba7ded13ba54c,
  __wbg_apply_0a5aa603881e6d79: () => __wbg_apply_0a5aa603881e6d79,
  __wbg_assign_496d2d14fecafbcf: () => __wbg_assign_496d2d14fecafbcf,
  __wbg_buffer_12d079cc21e14bdb: () => __wbg_buffer_12d079cc21e14bdb,
  __wbg_call_27c0f87801dedf93: () => __wbg_call_27c0f87801dedf93,
  __wbg_call_b3ca7c6051f9bec1: () => __wbg_call_b3ca7c6051f9bec1,
  __wbg_concat_3de229fe4fe90fea: () => __wbg_concat_3de229fe4fe90fea,
  __wbg_crypto_1d1f22824a6a080c: () => __wbg_crypto_1d1f22824a6a080c,
  __wbg_defineProperty_cc00e2de8a0f5141: () => __wbg_defineProperty_cc00e2de8a0f5141,
  __wbg_deleteProperty_13e721a56f19e842: () => __wbg_deleteProperty_13e721a56f19e842,
  __wbg_done_298b57d23c0fc80c: () => __wbg_done_298b57d23c0fc80c,
  __wbg_entries_95cc2c823b285a09: () => __wbg_entries_95cc2c823b285a09,
  __wbg_error_f851667af71bcfc6: () => __wbg_error_f851667af71bcfc6,
  __wbg_for_27c67e2dbdce22f6: () => __wbg_for_27c67e2dbdce22f6,
  __wbg_freeze_cc6bc19f75299986: () => __wbg_freeze_cc6bc19f75299986,
  __wbg_from_89e3fc3ba5e6fb48: () => __wbg_from_89e3fc3ba5e6fb48,
  __wbg_getRandomValues_3aa56aa6edec874c: () => __wbg_getRandomValues_3aa56aa6edec874c,
  __wbg_getTime_2bc4375165f02d15: () => __wbg_getTime_2bc4375165f02d15,
  __wbg_get_bd8e338fbd5f5cc8: () => __wbg_get_bd8e338fbd5f5cc8,
  __wbg_get_e3c254076557e348: () => __wbg_get_e3c254076557e348,
  __wbg_globalThis_d1e6af4856ba331b: () => __wbg_globalThis_d1e6af4856ba331b,
  __wbg_global_207b558942527489: () => __wbg_global_207b558942527489,
  __wbg_instanceof_ArrayBuffer_836825be07d4c9d2: () => __wbg_instanceof_ArrayBuffer_836825be07d4c9d2,
  __wbg_instanceof_Date_f65cf97fb83fc369: () => __wbg_instanceof_Date_f65cf97fb83fc369,
  __wbg_instanceof_Object_71ca3c0a59266746: () => __wbg_instanceof_Object_71ca3c0a59266746,
  __wbg_instanceof_Uint8Array_2b3bbecd033d19f6: () => __wbg_instanceof_Uint8Array_2b3bbecd033d19f6,
  __wbg_isArray_2ab64d95e09ea0ae: () => __wbg_isArray_2ab64d95e09ea0ae,
  __wbg_iterator_2cee6dadfd956dfa: () => __wbg_iterator_2cee6dadfd956dfa,
  __wbg_keys_91e412b4b222659f: () => __wbg_keys_91e412b4b222659f,
  __wbg_length_c20a40f15020d68a: () => __wbg_length_c20a40f15020d68a,
  __wbg_length_cd7af8117672b8b8: () => __wbg_length_cd7af8117672b8b8,
  __wbg_length_dee433d4c85c9387: () => __wbg_length_dee433d4c85c9387,
  __wbg_log_1746d5c75ec89963: () => __wbg_log_1746d5c75ec89963,
  __wbg_log_5bb5f88f245d7762: () => __wbg_log_5bb5f88f245d7762,
  __wbg_msCrypto_eb05e62b530a1508: () => __wbg_msCrypto_eb05e62b530a1508,
  __wbg_new_16b304a2cfa7ff4a: () => __wbg_new_16b304a2cfa7ff4a,
  __wbg_new_28c511d9baebfa89: () => __wbg_new_28c511d9baebfa89,
  __wbg_new_63b92bc8671ed464: () => __wbg_new_63b92bc8671ed464,
  __wbg_new_72fb9a18b5ae2624: () => __wbg_new_72fb9a18b5ae2624,
  __wbg_new_abda76e883ba8a5f: () => __wbg_new_abda76e883ba8a5f,
  __wbg_new_cf3ec55744a78578: () => __wbg_new_cf3ec55744a78578,
  __wbg_new_dd6a5dd7b538af21: () => __wbg_new_dd6a5dd7b538af21,
  __wbg_newnoargs_e258087cd0daa0ea: () => __wbg_newnoargs_e258087cd0daa0ea,
  __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb: () => __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb,
  __wbg_newwithlength_e9b4878cebadb3d3: () => __wbg_newwithlength_e9b4878cebadb3d3,
  __wbg_next_196c84450b364254: () => __wbg_next_196c84450b364254,
  __wbg_next_40fc327bfc8770e6: () => __wbg_next_40fc327bfc8770e6,
  __wbg_node_104a2ff8d6ea03a2: () => __wbg_node_104a2ff8d6ea03a2,
  __wbg_ownKeys_658942b7f28d1fe9: () => __wbg_ownKeys_658942b7f28d1fe9,
  __wbg_process_4a72847cc503995b: () => __wbg_process_4a72847cc503995b,
  __wbg_push_a5b05aedc7234f9f: () => __wbg_push_a5b05aedc7234f9f,
  __wbg_randomFillSync_5c9c955aa56b6049: () => __wbg_randomFillSync_5c9c955aa56b6049,
  __wbg_require_cca90b1a94a0255b: () => __wbg_require_cca90b1a94a0255b,
  __wbg_self_ce0dbfc45cf2f5be: () => __wbg_self_ce0dbfc45cf2f5be,
  __wbg_set_1f9b04f170055d33: () => __wbg_set_1f9b04f170055d33,
  __wbg_set_20cbc34131e76824: () => __wbg_set_20cbc34131e76824,
  __wbg_set_a47bac70306a19a7: () => __wbg_set_a47bac70306a19a7,
  __wbg_set_d4638f722068f043: () => __wbg_set_d4638f722068f043,
  __wbg_set_wasm: () => __wbg_set_wasm,
  __wbg_slice_52fb626ffdc8da8f: () => __wbg_slice_52fb626ffdc8da8f,
  __wbg_stack_658279fe44541cf6: () => __wbg_stack_658279fe44541cf6,
  __wbg_subarray_a1f73cd4b5b42fe1: () => __wbg_subarray_a1f73cd4b5b42fe1,
  __wbg_toString_7df3c77999517c20: () => __wbg_toString_7df3c77999517c20,
  __wbg_unshift_e22df4b34bcf5070: () => __wbg_unshift_e22df4b34bcf5070,
  __wbg_value_d93c65011f51a456: () => __wbg_value_d93c65011f51a456,
  __wbg_values_9c75e6e2bfbdb70d: () => __wbg_values_9c75e6e2bfbdb70d,
  __wbg_versions_f686565e586dd935: () => __wbg_versions_f686565e586dd935,
  __wbg_window_c6fb939a7f436783: () => __wbg_window_c6fb939a7f436783,
  __wbindgen_bigint_from_i64: () => __wbindgen_bigint_from_i64,
  __wbindgen_bigint_from_u64: () => __wbindgen_bigint_from_u64,
  __wbindgen_boolean_get: () => __wbindgen_boolean_get,
  __wbindgen_debug_string: () => __wbindgen_debug_string,
  __wbindgen_error_new: () => __wbindgen_error_new,
  __wbindgen_is_array: () => __wbindgen_is_array,
  __wbindgen_is_function: () => __wbindgen_is_function,
  __wbindgen_is_null: () => __wbindgen_is_null,
  __wbindgen_is_object: () => __wbindgen_is_object,
  __wbindgen_is_string: () => __wbindgen_is_string,
  __wbindgen_is_undefined: () => __wbindgen_is_undefined,
  __wbindgen_json_serialize: () => __wbindgen_json_serialize,
  __wbindgen_jsval_loose_eq: () => __wbindgen_jsval_loose_eq,
  __wbindgen_memory: () => __wbindgen_memory,
  __wbindgen_number_get: () => __wbindgen_number_get,
  __wbindgen_number_new: () => __wbindgen_number_new,
  __wbindgen_object_clone_ref: () => __wbindgen_object_clone_ref,
  __wbindgen_object_drop_ref: () => __wbindgen_object_drop_ref,
  __wbindgen_string_get: () => __wbindgen_string_get,
  __wbindgen_string_new: () => __wbindgen_string_new,
  __wbindgen_throw: () => __wbindgen_throw,
  create: () => create,
  decodeChange: () => decodeChange,
  decodeSyncMessage: () => decodeSyncMessage,
  decodeSyncState: () => decodeSyncState,
  encodeChange: () => encodeChange,
  encodeSyncMessage: () => encodeSyncMessage,
  encodeSyncState: () => encodeSyncState,
  exportSyncState: () => exportSyncState,
  importSyncState: () => importSyncState,
  initSyncState: () => initSyncState,
  load: () => load
});
import * as wasm2 from "/Users/michaelpalumbo/forkingpaths/node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/bundler/automerge_wasm_bg.wasm";

// node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/bundler/automerge_wasm_bg.js
var wasm;
function __wbg_set_wasm(val) {
  wasm = val;
}
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
var lTextEncoder = typeof TextEncoder === "undefined" ? (0, module.require)("util").TextEncoder : TextEncoder;
var cachedTextEncoder = new lTextEncoder("utf-8");
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
var lTextDecoder = typeof TextDecoder === "undefined" ? (0, module.require)("util").TextDecoder : TextDecoder;
var cachedTextDecoder = new lTextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
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
function encodeChange(change) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.encodeChange(retptr, addHeapObject(change));
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
function decodeChange(change) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.decodeChange(retptr, addHeapObject(change));
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
function handleError(f, args) {
  try {
    return f.apply(this, args);
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
function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
}
function __wbindgen_string_get(arg0, arg1) {
  const obj = getObject(arg1);
  const ret = typeof obj === "string" ? obj : void 0;
  var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}
function __wbindgen_error_new(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
function __wbindgen_string_new(arg0, arg1) {
  const ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
}
function __wbindgen_number_new(arg0) {
  const ret = arg0;
  return addHeapObject(ret);
}
function __wbindgen_object_clone_ref(arg0) {
  const ret = getObject(arg0);
  return addHeapObject(ret);
}
function __wbindgen_number_get(arg0, arg1) {
  const obj = getObject(arg1);
  const ret = typeof obj === "number" ? obj : void 0;
  getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
  getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
}
function __wbindgen_is_undefined(arg0) {
  const ret = getObject(arg0) === void 0;
  return ret;
}
function __wbindgen_boolean_get(arg0) {
  const v = getObject(arg0);
  const ret = typeof v === "boolean" ? v ? 1 : 0 : 2;
  return ret;
}
function __wbindgen_is_null(arg0) {
  const ret = getObject(arg0) === null;
  return ret;
}
function __wbindgen_is_string(arg0) {
  const ret = typeof getObject(arg0) === "string";
  return ret;
}
function __wbindgen_is_function(arg0) {
  const ret = typeof getObject(arg0) === "function";
  return ret;
}
function __wbindgen_is_object(arg0) {
  const val = getObject(arg0);
  const ret = typeof val === "object" && val !== null;
  return ret;
}
function __wbindgen_is_array(arg0) {
  const ret = Array.isArray(getObject(arg0));
  return ret;
}
function __wbindgen_json_serialize(arg0, arg1) {
  const obj = getObject(arg1);
  const ret = JSON.stringify(obj === void 0 ? null : obj);
  const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}
function __wbg_new_abda76e883ba8a5f() {
  const ret = new Error();
  return addHeapObject(ret);
}
function __wbg_stack_658279fe44541cf6(arg0, arg1) {
  const ret = getObject(arg1).stack;
  const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}
function __wbg_error_f851667af71bcfc6(arg0, arg1) {
  let deferred0_0;
  let deferred0_1;
  try {
    deferred0_0 = arg0;
    deferred0_1 = arg1;
    console.error(getStringFromWasm0(arg0, arg1));
  } finally {
    wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
  }
}
function __wbindgen_jsval_loose_eq(arg0, arg1) {
  const ret = getObject(arg0) == getObject(arg1);
  return ret;
}
function __wbg_String_91fba7ded13ba54c(arg0, arg1) {
  const ret = String(getObject(arg1));
  const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}
function __wbindgen_bigint_from_i64(arg0) {
  const ret = arg0;
  return addHeapObject(ret);
}
function __wbindgen_bigint_from_u64(arg0) {
  const ret = BigInt.asUintN(64, arg0);
  return addHeapObject(ret);
}
function __wbg_set_20cbc34131e76824(arg0, arg1, arg2) {
  getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
}
function __wbg_getRandomValues_3aa56aa6edec874c() {
  return handleError(function(arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
  }, arguments);
}
function __wbg_randomFillSync_5c9c955aa56b6049() {
  return handleError(function(arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
  }, arguments);
}
function __wbg_crypto_1d1f22824a6a080c(arg0) {
  const ret = getObject(arg0).crypto;
  return addHeapObject(ret);
}
function __wbg_process_4a72847cc503995b(arg0) {
  const ret = getObject(arg0).process;
  return addHeapObject(ret);
}
function __wbg_versions_f686565e586dd935(arg0) {
  const ret = getObject(arg0).versions;
  return addHeapObject(ret);
}
function __wbg_node_104a2ff8d6ea03a2(arg0) {
  const ret = getObject(arg0).node;
  return addHeapObject(ret);
}
function __wbg_require_cca90b1a94a0255b() {
  return handleError(function() {
    const ret = module.require;
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_msCrypto_eb05e62b530a1508(arg0) {
  const ret = getObject(arg0).msCrypto;
  return addHeapObject(ret);
}
function __wbg_log_5bb5f88f245d7762(arg0) {
  console.log(getObject(arg0));
}
function __wbg_log_1746d5c75ec89963(arg0, arg1) {
  console.log(getObject(arg0), getObject(arg1));
}
function __wbg_get_bd8e338fbd5f5cc8(arg0, arg1) {
  const ret = getObject(arg0)[arg1 >>> 0];
  return addHeapObject(ret);
}
function __wbg_length_cd7af8117672b8b8(arg0) {
  const ret = getObject(arg0).length;
  return ret;
}
function __wbg_new_16b304a2cfa7ff4a() {
  const ret = new Array();
  return addHeapObject(ret);
}
function __wbg_newnoargs_e258087cd0daa0ea(arg0, arg1) {
  const ret = new Function(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
function __wbg_next_40fc327bfc8770e6(arg0) {
  const ret = getObject(arg0).next;
  return addHeapObject(ret);
}
function __wbg_next_196c84450b364254() {
  return handleError(function(arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_done_298b57d23c0fc80c(arg0) {
  const ret = getObject(arg0).done;
  return ret;
}
function __wbg_value_d93c65011f51a456(arg0) {
  const ret = getObject(arg0).value;
  return addHeapObject(ret);
}
function __wbg_iterator_2cee6dadfd956dfa() {
  const ret = Symbol.iterator;
  return addHeapObject(ret);
}
function __wbg_get_e3c254076557e348() {
  return handleError(function(arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_call_27c0f87801dedf93() {
  return handleError(function(arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_new_72fb9a18b5ae2624() {
  const ret = new Object();
  return addHeapObject(ret);
}
function __wbg_length_dee433d4c85c9387(arg0) {
  const ret = getObject(arg0).length;
  return ret;
}
function __wbg_set_d4638f722068f043(arg0, arg1, arg2) {
  getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
}
function __wbg_from_89e3fc3ba5e6fb48(arg0) {
  const ret = Array.from(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_isArray_2ab64d95e09ea0ae(arg0) {
  const ret = Array.isArray(getObject(arg0));
  return ret;
}
function __wbg_push_a5b05aedc7234f9f(arg0, arg1) {
  const ret = getObject(arg0).push(getObject(arg1));
  return ret;
}
function __wbg_unshift_e22df4b34bcf5070(arg0, arg1) {
  const ret = getObject(arg0).unshift(getObject(arg1));
  return ret;
}
function __wbg_instanceof_ArrayBuffer_836825be07d4c9d2(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof ArrayBuffer;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}
function __wbg_new_28c511d9baebfa89(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
function __wbg_call_b3ca7c6051f9bec1() {
  return handleError(function(arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_instanceof_Date_f65cf97fb83fc369(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof Date;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}
function __wbg_getTime_2bc4375165f02d15(arg0) {
  const ret = getObject(arg0).getTime();
  return ret;
}
function __wbg_new_cf3ec55744a78578(arg0) {
  const ret = new Date(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_instanceof_Object_71ca3c0a59266746(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof Object;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}
function __wbg_assign_496d2d14fecafbcf(arg0, arg1) {
  const ret = Object.assign(getObject(arg0), getObject(arg1));
  return addHeapObject(ret);
}
function __wbg_defineProperty_cc00e2de8a0f5141(arg0, arg1, arg2) {
  const ret = Object.defineProperty(getObject(arg0), getObject(arg1), getObject(arg2));
  return addHeapObject(ret);
}
function __wbg_entries_95cc2c823b285a09(arg0) {
  const ret = Object.entries(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_freeze_cc6bc19f75299986(arg0) {
  const ret = Object.freeze(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_keys_91e412b4b222659f(arg0) {
  const ret = Object.keys(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_values_9c75e6e2bfbdb70d(arg0) {
  const ret = Object.values(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_new_dd6a5dd7b538af21(arg0, arg1) {
  const ret = new RangeError(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
function __wbg_apply_0a5aa603881e6d79() {
  return handleError(function(arg0, arg1, arg2) {
    const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_deleteProperty_13e721a56f19e842() {
  return handleError(function(arg0, arg1) {
    const ret = Reflect.deleteProperty(getObject(arg0), getObject(arg1));
    return ret;
  }, arguments);
}
function __wbg_ownKeys_658942b7f28d1fe9() {
  return handleError(function(arg0) {
    const ret = Reflect.ownKeys(getObject(arg0));
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_set_1f9b04f170055d33() {
  return handleError(function(arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
  }, arguments);
}
function __wbg_buffer_12d079cc21e14bdb(arg0) {
  const ret = getObject(arg0).buffer;
  return addHeapObject(ret);
}
function __wbg_concat_3de229fe4fe90fea(arg0, arg1) {
  const ret = getObject(arg0).concat(getObject(arg1));
  return addHeapObject(ret);
}
function __wbg_slice_52fb626ffdc8da8f(arg0, arg1, arg2) {
  const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
function __wbg_for_27c67e2dbdce22f6(arg0, arg1) {
  const ret = Symbol.for(getStringFromWasm0(arg0, arg1));
  return addHeapObject(ret);
}
function __wbg_toString_7df3c77999517c20(arg0) {
  const ret = getObject(arg0).toString();
  return addHeapObject(ret);
}
function __wbg_self_ce0dbfc45cf2f5be() {
  return handleError(function() {
    const ret = self.self;
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_window_c6fb939a7f436783() {
  return handleError(function() {
    const ret = window.window;
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_globalThis_d1e6af4856ba331b() {
  return handleError(function() {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_global_207b558942527489() {
  return handleError(function() {
    const ret = global.global;
    return addHeapObject(ret);
  }, arguments);
}
function __wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb(arg0, arg1, arg2) {
  const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
function __wbg_new_63b92bc8671ed464(arg0) {
  const ret = new Uint8Array(getObject(arg0));
  return addHeapObject(ret);
}
function __wbg_set_a47bac70306a19a7(arg0, arg1, arg2) {
  getObject(arg0).set(getObject(arg1), arg2 >>> 0);
}
function __wbg_length_c20a40f15020d68a(arg0) {
  const ret = getObject(arg0).length;
  return ret;
}
function __wbg_instanceof_Uint8Array_2b3bbecd033d19f6(arg0) {
  let result;
  try {
    result = getObject(arg0) instanceof Uint8Array;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}
function __wbg_newwithlength_e9b4878cebadb3d3(arg0) {
  const ret = new Uint8Array(arg0 >>> 0);
  return addHeapObject(ret);
}
function __wbg_subarray_a1f73cd4b5b42fe1(arg0, arg1, arg2) {
  const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
}
function __wbindgen_debug_string(arg0, arg1) {
  const ret = debugString(getObject(arg1));
  const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len1;
  getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}
function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
function __wbindgen_memory() {
  const ret = wasm.memory;
  return addHeapObject(ret);
}

// node_modules/@automerge/automerge/dist/mjs/wasm_bindgen_output/bundler/automerge_wasm.js
__wbg_set_wasm(wasm2);

// node_modules/@automerge/automerge/dist/mjs/entrypoints/fullfat_bundler.js
UseApi(automerge_wasm_exports);

// node_modules/@automerge/automerge-repo/dist/entrypoints/fullfat.js
next_slim_exports.init();
export {
  Counter,
  DocHandle,
  NetworkAdapter,
  RawString,
  Repo,
  StorageAdapter,
  applyChanges,
  cbor_exports as cbor,
  deleteAt,
  generateAutomergeUrl,
  getAllChanges,
  getChanges,
  getConflicts,
  getCursor,
  getCursorPosition,
  insertAt,
  interpretAsDocumentId,
  isRepoMessage,
  isValidAutomergeUrl,
  isValidDocumentId,
  mark,
  parseAutomergeUrl,
  splice,
  stringifyAutomergeUrl,
  unmark,
  updateText,
  view
};
//# sourceMappingURL=@automerge_automerge-repo.js.map
