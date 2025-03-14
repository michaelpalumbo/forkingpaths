// Use the correct protocol based on your site's URL (requires Vite environment)
const VITE_WS_URL = import.meta.env.VITE_WS_URL;
// Alternatively, if you're not using Vite, you can use the URL directly:
// const VITE_WS_URL = "wss://historygraphrenderer.onrender.com/10000";

const ws = new WebSocket(VITE_WS_URL);

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    // You can send a message to the server if needed:
    // ws.send("Hello Server!");
};

ws.onmessage = (event) => {
    console.log('Received message:', event.data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};