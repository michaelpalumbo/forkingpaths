import {
  NetworkAdapter,
  cbor_exports,
  require_browser
} from "./chunk-3N3NGKXR.js";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet,
  __publicField,
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/isomorphic-ws/browser.js
var ws = null;
if (typeof WebSocket !== "undefined") {
  ws = WebSocket;
} else if (typeof MozWebSocket !== "undefined") {
  ws = MozWebSocket;
} else if (typeof global !== "undefined") {
  ws = global.WebSocket || global.MozWebSocket;
} else if (typeof window !== "undefined") {
  ws = window.WebSocket || window.MozWebSocket;
} else if (typeof self !== "undefined") {
  ws = self.WebSocket || self.MozWebSocket;
}
var browser_default = ws;

// node_modules/@automerge/automerge-repo-network-websocket/dist/BrowserWebSocketClientAdapter.js
var import_debug = __toESM(require_browser(), 1);

// node_modules/@automerge/automerge-repo-network-websocket/dist/messages.js
var isJoinMessage = (message) => message.type === "join";
var isLeaveMessage = (message) => message.type === "leave";
var isPeerMessage = (message) => message.type === "peer";
var isErrorMessage = (message) => message.type === "error";

// node_modules/@automerge/automerge-repo-network-websocket/dist/protocolVersion.js
var ProtocolV1 = "1";

// node_modules/@automerge/automerge-repo-network-websocket/dist/assert.js
function assert(value, message = "Assertion failed") {
  if (value === false || value === null || value === void 0) {
    const error = new Error(trimLines(message));
    error.stack = removeLine(error.stack, "assert.ts");
    throw error;
  }
}
var trimLines = (s) => s.split("\n").map((s2) => s2.trim()).join("\n");
var removeLine = (s = "", targetText) => s.split("\n").filter((line) => !line.includes(targetText)).join("\n");

// node_modules/@automerge/automerge-repo-network-websocket/dist/toArrayBuffer.js
var toArrayBuffer = (bytes) => {
  const { buffer, byteOffset, byteLength } = bytes;
  return buffer.slice(byteOffset, byteOffset + byteLength);
};

// node_modules/@automerge/automerge-repo-network-websocket/dist/BrowserWebSocketClientAdapter.js
var WebSocketNetworkAdapter = class extends NetworkAdapter {
  constructor() {
    super(...arguments);
    __publicField(this, "socket");
  }
};
var _isReady, _retryIntervalId, _log, _BrowserWebSocketClientAdapter_instances, ready_fn;
var BrowserWebSocketClientAdapter = class extends WebSocketNetworkAdapter {
  // this adapter only connects to one remote client at a time
  constructor(url, retryInterval = 5e3) {
    super();
    __privateAdd(this, _BrowserWebSocketClientAdapter_instances);
    __publicField(this, "url");
    __publicField(this, "retryInterval");
    __privateAdd(this, _isReady, false);
    __privateAdd(this, _retryIntervalId);
    __privateAdd(this, _log, (0, import_debug.default)("automerge-repo:websocket:browser"));
    __publicField(this, "remotePeerId");
    __publicField(this, "onOpen", () => {
      __privateGet(this, _log).call(this, "open");
      clearInterval(__privateGet(this, _retryIntervalId));
      __privateSet(this, _retryIntervalId, void 0);
      this.join();
    });
    // When a socket closes, or disconnects, remove it from the array.
    __publicField(this, "onClose", () => {
      __privateGet(this, _log).call(this, "close");
      if (this.remotePeerId)
        this.emit("peer-disconnected", { peerId: this.remotePeerId });
      if (this.retryInterval > 0 && !__privateGet(this, _retryIntervalId))
        setTimeout(() => {
          assert(this.peerId);
          return this.connect(this.peerId, this.peerMetadata);
        }, this.retryInterval);
    });
    __publicField(this, "onMessage", (event) => {
      this.receiveMessage(event.data);
    });
    /** The websocket error handler signature is different on node and the browser.  */
    __publicField(this, "onError", (event) => {
      if ("error" in event) {
        if (event.error.code !== "ECONNREFUSED") {
          throw event.error;
        }
      } else {
      }
      __privateGet(this, _log).call(this, "Connection failed, retrying...");
    });
    this.url = url;
    this.retryInterval = retryInterval;
    __privateSet(this, _log, __privateGet(this, _log).extend(url));
  }
  connect(peerId, peerMetadata) {
    if (!this.socket || !this.peerId) {
      __privateGet(this, _log).call(this, "connecting");
      this.peerId = peerId;
      this.peerMetadata = peerMetadata ?? {};
    } else {
      __privateGet(this, _log).call(this, "reconnecting");
      assert(peerId === this.peerId);
      this.socket.removeEventListener("open", this.onOpen);
      this.socket.removeEventListener("close", this.onClose);
      this.socket.removeEventListener("message", this.onMessage);
      this.socket.removeEventListener("error", this.onError);
    }
    if (!__privateGet(this, _retryIntervalId))
      __privateSet(this, _retryIntervalId, setInterval(() => {
        this.connect(peerId, peerMetadata);
      }, this.retryInterval));
    this.socket = new browser_default(this.url);
    this.socket.binaryType = "arraybuffer";
    this.socket.addEventListener("open", this.onOpen);
    this.socket.addEventListener("close", this.onClose);
    this.socket.addEventListener("message", this.onMessage);
    this.socket.addEventListener("error", this.onError);
    setTimeout(() => __privateMethod(this, _BrowserWebSocketClientAdapter_instances, ready_fn).call(this), 1e3);
    this.join();
  }
  join() {
    assert(this.peerId);
    assert(this.socket);
    if (this.socket.readyState === browser_default.OPEN) {
      this.send(joinMessage(this.peerId, this.peerMetadata));
    } else {
    }
  }
  disconnect() {
    assert(this.peerId);
    assert(this.socket);
    this.send({ type: "leave", senderId: this.peerId });
  }
  send(message) {
    var _a;
    if ("data" in message && ((_a = message.data) == null ? void 0 : _a.byteLength) === 0)
      throw new Error("Tried to send a zero-length message");
    assert(this.peerId);
    assert(this.socket);
    if (this.socket.readyState !== browser_default.OPEN)
      throw new Error(`Websocket not ready (${this.socket.readyState})`);
    const encoded = cbor_exports.encode(message);
    this.socket.send(toArrayBuffer(encoded));
  }
  peerCandidate(remotePeerId, peerMetadata) {
    assert(this.socket);
    __privateMethod(this, _BrowserWebSocketClientAdapter_instances, ready_fn).call(this);
    this.remotePeerId = remotePeerId;
    this.emit("peer-candidate", {
      peerId: remotePeerId,
      peerMetadata
    });
  }
  receiveMessage(messageBytes) {
    const message = cbor_exports.decode(new Uint8Array(messageBytes));
    assert(this.socket);
    if (messageBytes.byteLength === 0)
      throw new Error("received a zero-length message");
    if (isPeerMessage(message)) {
      const { peerMetadata } = message;
      __privateGet(this, _log).call(this, `peer: ${message.senderId}`);
      this.peerCandidate(message.senderId, peerMetadata);
    } else if (isErrorMessage(message)) {
      __privateGet(this, _log).call(this, `error: ${message.message}`);
    } else {
      this.emit("message", message);
    }
  }
};
_isReady = new WeakMap();
_retryIntervalId = new WeakMap();
_log = new WeakMap();
_BrowserWebSocketClientAdapter_instances = new WeakSet();
ready_fn = function() {
  if (__privateGet(this, _isReady))
    return;
  __privateSet(this, _isReady, true);
  this.emit("ready", { network: this });
};
function joinMessage(senderId, peerMetadata) {
  return {
    type: "join",
    senderId,
    peerMetadata,
    supportedProtocolVersions: [ProtocolV1]
  };
}

// node_modules/@automerge/automerge-repo-network-websocket/dist/NodeWSServerAdapter.js
var import_debug2 = __toESM(require_browser(), 1);
var log = (0, import_debug2.default)("WebsocketServer");
var { encode, decode } = cbor_exports;
var _NodeWSServerAdapter_instances, terminate_fn, removeSocket_fn, _peerIdBySocket;
var NodeWSServerAdapter = class extends NetworkAdapter {
  constructor(server, keepAliveInterval = 5e3) {
    super();
    __privateAdd(this, _NodeWSServerAdapter_instances);
    __publicField(this, "server");
    __publicField(this, "keepAliveInterval");
    __publicField(this, "sockets", {});
    __privateAdd(this, _peerIdBySocket, (socket) => {
      const isThisSocket = (peerId) => this.sockets[peerId] === socket;
      const result = Object.keys(this.sockets).find(isThisSocket);
      return result ?? null;
    });
    this.server = server;
    this.keepAliveInterval = keepAliveInterval;
  }
  connect(peerId, peerMetadata) {
    this.peerId = peerId;
    this.peerMetadata = peerMetadata;
    this.server.on("close", () => {
      clearInterval(keepAliveId);
      this.disconnect();
    });
    this.server.on("connection", (socket) => {
      socket.on("close", () => {
        __privateMethod(this, _NodeWSServerAdapter_instances, removeSocket_fn).call(this, socket);
      });
      socket.on("message", (message) => this.receiveMessage(message, socket));
      socket.isAlive = true;
      socket.on("pong", () => socket.isAlive = true);
      this.emit("ready", { network: this });
    });
    const keepAliveId = setInterval(() => {
      const clients = this.server.clients;
      clients.forEach((socket) => {
        if (socket.isAlive) {
          socket.isAlive = false;
          socket.ping();
        } else {
          __privateMethod(this, _NodeWSServerAdapter_instances, terminate_fn).call(this, socket);
        }
      });
    }, this.keepAliveInterval);
  }
  disconnect() {
    const clients = this.server.clients;
    clients.forEach((socket) => {
      __privateMethod(this, _NodeWSServerAdapter_instances, terminate_fn).call(this, socket);
      __privateMethod(this, _NodeWSServerAdapter_instances, removeSocket_fn).call(this, socket);
    });
  }
  send(message) {
    var _a;
    assert("targetId" in message && message.targetId !== void 0);
    if ("data" in message && ((_a = message.data) == null ? void 0 : _a.byteLength) === 0)
      throw new Error("Tried to send a zero-length message");
    const senderId = this.peerId;
    assert(senderId, "No peerId set for the websocket server network adapter.");
    const socket = this.sockets[message.targetId];
    if (!socket) {
      log(`Tried to send to disconnected peer: ${message.targetId}`);
      return;
    }
    const encoded = encode(message);
    const arrayBuf = toArrayBuffer(encoded);
    socket.send(arrayBuf);
  }
  receiveMessage(messageBytes, socket) {
    const message = decode(messageBytes);
    const { type, senderId } = message;
    const myPeerId = this.peerId;
    assert(myPeerId);
    const documentId = "documentId" in message ? "@" + message.documentId : "";
    const { byteLength } = messageBytes;
    log(`[${senderId}->${myPeerId}${documentId}] ${type} | ${byteLength} bytes`);
    if (isJoinMessage(message)) {
      const { peerMetadata, supportedProtocolVersions } = message;
      const existingSocket = this.sockets[senderId];
      if (existingSocket) {
        if (existingSocket.readyState === browser_default.OPEN) {
          existingSocket.close();
        }
        this.emit("peer-disconnected", { peerId: senderId });
      }
      this.emit("peer-candidate", { peerId: senderId, peerMetadata });
      this.sockets[senderId] = socket;
      const selectedProtocolVersion = selectProtocol(supportedProtocolVersions);
      if (selectedProtocolVersion === null) {
        this.send({
          type: "error",
          senderId: this.peerId,
          message: "unsupported protocol version",
          targetId: senderId
        });
        this.sockets[senderId].close();
        delete this.sockets[senderId];
      } else {
        this.send({
          type: "peer",
          senderId: this.peerId,
          peerMetadata: this.peerMetadata,
          selectedProtocolVersion: ProtocolV1,
          targetId: senderId
        });
      }
    } else if (isLeaveMessage(message)) {
      const { senderId: senderId2 } = message;
      const socket2 = this.sockets[senderId2];
      if (!socket2)
        return;
      __privateMethod(this, _NodeWSServerAdapter_instances, terminate_fn).call(this, socket2);
    } else {
      this.emit("message", message);
    }
  }
};
_NodeWSServerAdapter_instances = new WeakSet();
terminate_fn = function(socket) {
  __privateMethod(this, _NodeWSServerAdapter_instances, removeSocket_fn).call(this, socket);
  socket.terminate();
};
removeSocket_fn = function(socket) {
  const peerId = __privateGet(this, _peerIdBySocket).call(this, socket);
  if (!peerId)
    return;
  this.emit("peer-disconnected", { peerId });
  delete this.sockets[peerId];
};
_peerIdBySocket = new WeakMap();
var selectProtocol = (versions) => {
  if (versions === void 0)
    return ProtocolV1;
  if (versions.includes(ProtocolV1))
    return ProtocolV1;
  return null;
};
export {
  BrowserWebSocketClientAdapter,
  NodeWSServerAdapter
};
//# sourceMappingURL=@automerge_automerge-repo-network-websocket.js.map
