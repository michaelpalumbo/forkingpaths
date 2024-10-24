import React, { useState, useCallback } from 'react';
import ReactFlow, { addEdge, Background, Controls } from 'react-flow-renderer';
import './App.css';

// Create audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Create audio nodes
const oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 440; // A4 note
oscillator.start();

const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
const noiseData = noiseBuffer.getChannelData(0);
for (let i = 0; i < noiseData.length; i++) {
  noiseData[i] = Math.random() * 2 - 1; // White noise
}

const noiseSource = audioCtx.createBufferSource();
noiseSource.buffer = noiseBuffer;
noiseSource.loop = true;

const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.5; // Set initial volume

// Define initial React Flow nodes
const initialNodes = [
  { id: '1', type: 'default', data: { label: 'Oscillator' }, position: { x: 100, y: 100 } },
  { id: '2', type: 'default', data: { label: 'Noise Source' }, position: { x: 100, y: 250 } },
  { id: '3', type: 'default', data: { label: 'Gain Node' }, position: { x: 400, y: 175 } }
];

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  // Handle edge creation (connection between nodes)
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
    handleAudioConnection(params);
  }, []);

  // Function to handle audio connections
  const handleAudioConnection = ({ source, target }) => {
    // Stop any active audio
    // stopAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
        console.log('Audio context resumed');
        });
    }

    if (source === '1' && target === '3') {
      oscillator.connect(gainNode).connect(audioCtx.destination);
    } else if (source === '2' && target === '3') {
      noiseSource.connect(gainNode).connect(audioCtx.destination);
      noiseSource.start(0);
    }
  };

  // Function to disconnect all audio nodes
  const stopAudio = () => {
    oscillator.disconnect();
    noiseSource.disconnect();
  };

    // Function to resume the audio context
    const resumeAudioContext = () => {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
            console.log('Audio context resumed');
            });
        }
        };

  return (
    <div style={{ height: '100vh' }}>
        <div className="controls">
        <button onClick={resumeAudioContext}>Resume Audio</button>
        <button onClick={stopAudio}>Stop Audio</button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

    </div>
  );
}

export default App;
