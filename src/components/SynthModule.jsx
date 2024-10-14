import React, { useState, useEffect } from 'react';


import Draggable from 'react-draggable';

import { RNBO } from '@rnbo/js'; // Import RNBO from the package



function SynthModule({id, audioContext, onRemove}) {

    const [rnboPatch, setRnboPatch, synth, setSynth] = useState(null);


    useEffect(() => {
        // Wait until AudioContext is available
        if (!audioContext) return; 

        const loadRNBO = async () => {
            // Load the RNBO patch data
            // todo eventually we'll want to pass the name of a given export patch from the UI when dynamically loading
            const response = await fetch('/simpleSynth.export.json'); // Adjust path if needed
            const patchData = await response.json();
            

            console.log(pathData)
            // Create RNBO patch from JSON
            const rnbo = await RNBO.createFromJSON(audioContext, patchData);
      
            // Prepare the RNBO patch
            await rnbo.prepare();
      
            // Connect the RNBO patch to the destination (speakers)
            rnbo.node.connect(audioContext.destination);
      
            // Store the RNBO patch in the state
            setRnboPatch(rnbo);
          };
      
          // Load the RNBO patch
          loadRNBO();
      
          return () => {
            // Cleanup when the component unmounts
            if (rnboPatch) {
              rnboPatch.node.disconnect();
            }
        };
    }, [audioContext]); // Re-run effect if audioContext changes

    const handlePlay = () => {
        if (rnboPatch) {
          // Start audio context (required in some browsers)
          audioContext.resume();
    
          // Trigger any event or start audio in RNBO patch
        }
      };
    
      const handleStop = () => {
        if (rnboPatch) {
          // Stop or reset RNBO patch if needed
        }
      };


    // Handle drag and log the position
    const handleDrag = (e, data) => {
        console.log(`Module is being dragged. Current position: x=${data.x}, y=${data.y}`);
      };

  return (
    <Draggable cancel="input, select">
      {/* Ensure Draggable wraps only one child (a single div) */}
      <div
        style={{
          width: '220px',
          padding: '10px',
          border: '1px solid black',
          margin: '10px',
          textAlign: 'center',
          backgroundColor: '#e0e0e0',
          cursor: 'move',
          color: 'black',
        }}
      >
        <p>Synth Module (ID: {id})</p>
        <button onMouseDown={handlePlay} onMouseUp={handleStop}>
          Play
        </button>
        <button onClick={onRemove} style={{ marginLeft: '10px', color: 'red' }}>
        Remove
      </button>
        {/* <div style={{ margin: '10px 0' }}>
          <label>
            Frequency:
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            {frequency} Hz
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>
            Waveform:
            <select value={waveform} onChange={(e) => setWaveform(e.target.value)}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>
            Volume:
            <input
              type="range"
              min="-60"
              max="0"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
            {volume} dB
          </label>
        </div> */}
      </div>
    </Draggable>
  );
}

export default SynthModule;
