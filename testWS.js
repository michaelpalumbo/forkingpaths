import WebSocket from 'ws';

const ws = new WebSocket('wss://historygraphrenderer.onrender.com/10000');

ws.on('open', () => {
  console.log('Connected to the websocket server');
  ws.send('Hello from Node.js client using ES modules!');
});

ws.on('message', (data) => {
  console.log('Received message:', data);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Connection closed');
});
