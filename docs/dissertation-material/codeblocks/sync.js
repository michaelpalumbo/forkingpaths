function sendSyncMessage() {
    if (syncMessageDataChannel && syncMessageDataChannel.readyState === "open") {
        let msg = Uint8Array | null;
        [syncState, msg] = Automerge.generateSyncMessage(meta, syncState);
        if (msg != null) {
            syncMessageDataChannel.send(msg);
        }
    }
}
