// WebRTC client code that uses your signaling server for "newPeer" messages

// --- Configuration ---
const signalingServerUrl = 'ws://localhost:3001'; // Adjust as needed
const ws = new WebSocket(signalingServerUrl);

// ICE server configuration (using a public STUN server)
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
    // Optionally add TURN servers here
  ]
};

// Create the RTCPeerConnection.
const peerConnection = new RTCPeerConnection(configuration);
let dataChannel;

// --- WebSocket Signaling ---
// When connection opens, log it.
ws.onopen = () => {
  console.log("Connected to signaling server");
};

// Handle incoming messages from the signaling server.
ws.onmessage = async (event) => {
  let data;
  try {
    // Your server wraps the signaling message in an object with cmd and msg.
    data = JSON.parse(event.data);
  } catch (err) {
    console.error("Error parsing incoming message:", err);
    return;
  }
  
  // We only process messages with cmd 'newPeer'
  if (data.cmd !== 'newPeer') return;
  
  // The actual signaling payload is in data.msg (as a JSON string)
  let msg;
  try {
    msg = JSON.parse(data.msg);
  } catch (err) {
    console.error("Error parsing nested signaling message:", err);
    return;
  }
  
  console.log("Received signaling message:", msg);

  // Process the signaling message based on its type.
  if (msg.type === 'offer') {
    // Received an offer: set it as the remote description.
    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg));
    // Create an answer and set as local description.
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    // Send the answer via the signaling channel.
    sendSignalingMessage(answer);
  } else if (msg.type === 'answer') {
    // Received an answer for our offer.
    await peerConnection.setRemoteDescription(new RTCSessionDescription(msg));
  } else if (msg.candidate) {
    // Received an ICE candidate.
    try {
      await peerConnection.addIceCandidate(msg);
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  }
};

// Helper function to send signaling messages using the "newPeer" command.
function sendSignalingMessage(message) {
  // Stringify the SDP or candidate message.
  const msgString = JSON.stringify(message);
  // Wrap it in an object with cmd 'newPeer'
  const payload = JSON.stringify({ cmd: 'newPeer', msg: msgString });
  ws.send(payload);
}

// --- ICE Candidate Handling ---
peerConnection.onicecandidate = event => {
  if (event.candidate) {
    console.log("Sending ICE candidate:", event.candidate);
    sendSignalingMessage({ candidate: event.candidate });
  }
};

// --- Data Channel Handling ---
// If you're the initiating peer, you'll create the data channel.
// Otherwise, listen for the remote data channel.
peerConnection.ondatachannel = event => {
  console.log("Data channel received from remote peer");
  dataChannel = event.channel;
  setupDataChannel();
};

// Function to set up the data channel events.
function setupDataChannel() {
  dataChannel.onopen = () => {
    console.log("Data channel is open");
  };
  dataChannel.onmessage = event => {
    console.log("Data channel message:", event.data);
  };
}

// --- Initiating Connection ---
// This function is called when you want this client to start the connection.
async function initiateConnection() {
  // Create a data channel (only on initiating peer)
  dataChannel = peerConnection.createDataChannel("myDataChannel");
  setupDataChannel();
  
  // Create an SDP offer.
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  // Send the offer through the signaling channel.
  sendSignalingMessage(offer);
}

// Attach the initiation to a button click (ensure the button exists in your HTML)
document.getElementById("startConnectionButton").addEventListener("click", () => {
  initiateConnection().catch(err => console.error("Error initiating connection:", err));
});
