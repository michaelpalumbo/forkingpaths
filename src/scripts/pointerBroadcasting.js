peerPointerDataChannel.send(JSON.stringify({
  peerID: thisPeerID,
  mousePointer: { x: x, y: y }
}));
