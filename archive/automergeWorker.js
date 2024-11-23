// automergeWorker.js
import * as Automerge from "@automerge/automerge/next";
// import { Repo } from "@automerge/automerge-repo";

// //todo: import { LocalForageStorageAdapter } from "@automerge/automerge-repo-storage-localforage";
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';


// // const wss = new WebSocketServer({ noServer: true });

// // Initialize the Automerge repository
// const repo = new Repo({
//     network: [new BrowserWebSocketClientAdapter('wss://sync.automerge.org')], // Replace with your WebSocket server if needed
//       storage: null //todo set localstorage using LocalForageStorageAdapter
//   });
let repo
let doc
// Load Repo dynamically to avoid blocking
(async () => {
    const { Repo } = await import("@automerge/automerge-repo");
    
    // Initialize repo or perform further operations
    repo = new Repo({
        network: [
            new BrowserWebSocketClientAdapter('wss://sync.automerge.org', {
                onError: (error) => {
                    console.error('WebSocket error:', error);
                    // Optionally, you could try to reconnect or handle errors here
                },
            })
        ],
        storage: null
    });
    
    // Proceed with the rest of your script after the import
    console.log("Repo initialized", repo);

    self.postMessage({ 
        msg: 'repoInitialized',
        data: true
     });
})();





// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    // Receive data from the main thread
    const data = event.data;
    console.log('[worker]: ', data)

    if(repo){
        doc = repo.create();
        // Perform some work (example: simple calculation)
        const result = data.value * 2; // Just an example operation
        console.log(doc)
        // Make a change ourselves and send that to everyone else
        doc.change((d) => (d.text = "hello world"));
        // Listen for changes from other peers
        doc.on("change", ({ doc }) => {
            console.log("new text is ", doc.text);
        });
    }


    // Send the result back to the main thread
    // self.postMessage({ result });
});
