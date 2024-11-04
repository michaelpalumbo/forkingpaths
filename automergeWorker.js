// worker.js

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    // Receive data from the main thread
    const data = event.data;

    // Perform some work (example: simple calculation)
    const result = data.value * 2; // Just an example operation

    // Send the result back to the main thread
    self.postMessage({ result });
});
