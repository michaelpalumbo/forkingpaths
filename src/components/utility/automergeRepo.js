import { Repo } from '@automerge/automerge-repo';
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';

// Initialize the Automerge repository
const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter('wss://sync.automerge.org')], // Replace with your WebSocket server if needed
    storage: null // disable local storage for now, if any
});

export default repo;