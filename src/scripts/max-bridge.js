
// import path from ('path');
// import Max from ('max-api');
// import WebSocket from ("ws");

// const path = require("path");
// const Max = require("max-api");
// const WebSocket = require("ws");
// const { OSCQueryDiscovery } = require("oscquery");
// import { OSCQueryDiscovery } from "oscquery";

import path from "path";
import Max from "max-api";
import WebSocket from "ws";
import { OSCQueryDiscovery } from "oscquery";


async function check(ip, port) {
  const d = new OSCQueryDiscovery();
  const svc = await d.queryNewService(ip, port);
  console.log("OSCQuery server found:", svc.address, svc.port);
  console.log("Methods:", svc.flat().map(m => m.full_path));
}

check("127.0.0.1", 30339).catch(err => {
  console.error("No OSCQuery at that ip:port:", err?.message ?? err);
});



console.log("test")
// Create a connection to your WS server
const ws = new WebSocket("ws://localhost:3001");

// Fired when the connection opens
ws.on("open", () => {
  console.log("✅ Connected to WebSocket server on port 3001");

  // Send a test message
  ws.send(JSON.stringify({
    type: "hello",
    payload: "Client connected"
  }));
});

// Fired when a message is received
ws.on("message", (data) => {
  console.log("📩 Message from server:", data.toString());
});

// Fired on error
ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err);
});

// Fired when the connection closes
ws.on("close", (code, reason) => {
  console.log(`🔌 Connection closed (${code})`, reason?.toString());
});



// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler("bang", () => {
	Max.post("Who you think you bangin'?");
});

// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler("echo", (msg) => {
	Max.outlet(msg);
});


Max.addHandler("externalParamUpdate", (param, value) => {

  if(ws){
    let message = JSON.stringify({
      cmd: 'externalParamUpdate',
      param: param,
      value: value
    })
    ws.send(message)
    
  }
	
});

function wrapMessage(msg, target){
  
  let message = JSON.stringify({

  })
  
  return message
}