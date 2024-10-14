import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import Draggable from 'react-draggable';
import * as Automerge from 'automerge';

function SynthModule({ type, onConnect, doc, setDoc }) {
  const [module, setModule] = useState(null);

  useEffect(() => {
    let synthModule;
    if (type === 'Oscillator') {
      synthModule = new Tone.Oscillator().toDestination();
    } else if (type === 'Filter') {
      synthModule = new Tone.Filter().toDestination();
    }
    setModule(synthModule);
  }, [type]);

  const handlePlay = () => {
    if (module && module.start) {
      module.start();
    }
  };

  const handleStop = () => {
    if (module && module.stop) {
      module.stop();
    }
  };

  const handleConnect = () => {
    onConnect(type, 'Filter'); // Example connection to a filter for now
  };

  const handleDrag = (e, data) => {
    console.log(`Module: ${type}, Position X: ${data.x}, Position Y: ${data.y}`);
  
    // Ensure the Automerge doc exists and is valid before modifying it
    if (!doc) {
      console.error("Automerge document is undefined or null.");
      return;
    }
  
    try {
      // Update Automerge document with new position
      const newDoc = Automerge.change(doc, doc => {
        if (!doc.positions) {
          doc.positions = {}; // Initialize positions if not defined
        }
        doc.positions[type] = { x: data.x, y: data.y };
      });
  
      setDoc(newDoc);
    } catch (error) {
      console.error("Error updating Automerge document:", error);
    }
  };
  

  // Safely access positions with a default fallback
  // Ensure doc exists, then positions exists, then type exists, otherwise provide defaults
  const position = (doc && doc.positions && doc.positions[type]) 
                    ? doc.positions[type] 
                    : { x: 0, y: 0 }; // Default position if none exists

  console.log(`Module: ${type}, Initial Position: X: ${position.x}, Y: ${position.y}`);


  return (
    <Draggable onDrag={handleDrag} defaultPosition={{ x: position.x, y: position.y }}>

      <div className="synth-module">
        <h3>{type}</h3>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleConnect}>Connect to Filter</button>
      </div>
    </Draggable>
  );
}

export default SynthModule;
