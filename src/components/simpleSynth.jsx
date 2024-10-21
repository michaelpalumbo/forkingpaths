
import React, { useState } from 'react';
import { RNBO } from '@rnbo/js';
import Draggable from 'react-draggable';

function SynthModule({ id, audioContext, onRemove, deviceFile }) {
  const [rnboDevice, setRnboDevice] = useState(null);

  // set params
  
  const [frequency, setFrequency] = useState(220);
  const [frequencyRange, setFrequencyRange] = useState({ min: 110, max: 880 });
    

  const [mod, setMod] = useState(1);
  const [modRange, setModRange] = useState({ min: -100, max: 100 });
    

  const [volume, setVolume] = useState(0.5);
  const [volumeRange, setVolumeRange] = useState({ min: 0, max: 100 });
    

  // useEffect(() => {
  //   const loadRNBO = async () => {
  //     const response = await fetch('/export/simpleSynth.export.json');
  //     const patchData = await response.json();
  //     const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });
  //     rnbo.node.connect(audioContext.destination);
  //     setRnboDevice(rnbo);
  //   };

  //   loadRNBO();

  //   return () => {
  //     if (rnboDevice) rnboDevice.node.disconnect();
  //   };
  // }, [audioContext]);

  useEffect(() => {
        if (!audioContext) return; // Wait until AudioContext is available

        const loadRNBO = async () => {
        try {
            // Load the RNBO patch data
            const response = await fetch(`/export/${deviceFile}`);            
            const patchData = await response.json();
            console.log(response)
            // Create the RNBO device
            const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });

            // Connect the RNBO device to the destination (speakers)
            rnbo.node.connect(audioContext.destination);

            // Store the RNBO device in the state
            setRnboDevice(rnbo);


        } catch (error) {
            console.error("Error loading RNBO device:", error);
        }
        };

        // Load the RNBO device
        loadRNBO();

        return () => {
        // Cleanup when the component unmounts
        if (rnboDevice) {
            // Stop the RNBO device (if it has a stop method or similar mechanism)
            if (rnboDevice.node) {
                rnboDevice.node.disconnect(); // Disconnect from the audio context
            }
        }
        };
    }, [audioContext]); // Re-run effect if audioContext changes


  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));
    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param) param.value = parseFloat(value);
    }
  };

    const handlePlay = () => {
        
        if (rnboDevice) {
            console.log("AudioContext State:", audioContext.state); // Log the state

            if (audioContext.state !== 'running') {
                audioContext.resume().then(() => {
                console.log("AudioContext resumed");
                });
            }
            
        // Trigger audio or start event in the RNBO device if needed
        console.log('RNBO device started');
        }
    };

    const handleStop = () => {
        if (rnboDevice) {
        // Logic to stop/reset RNBO device if needed
        console.log('RNBO device stopped');
        }
    };

  return (

  <Draggable cancel="input, select">
        <div style={{ padding: '10px', border: '1px solid black', margin: '10px' }}>
        <p>Synth Module (ID: {id})</p>
          
        <div key={frequency}>
          <label htmlFor="frequency">frequency: {values.frequency}</label>
          <input
            type="range"
            id="frequency"
            min={110}
            max={880}
            value={values.frequency}
            onChange={(e) => handleParamChange("frequency", e.target.value)}
          />
        </div>
      

        <div key={mod}>
          <label htmlFor="mod">mod: {values.mod}</label>
          <input
            type="range"
            id="mod"
            min={-100}
            max={100}
            value={values.mod}
            onChange={(e) => handleParamChange("mod", e.target.value)}
          />
        </div>
      

        <div key={volume}>
          <label htmlFor="volume">volume: {values.volume}</label>
          <input
            type="range"
            id="volume"
            min={0}
            max={100}
            value={values.volume}
            onChange={(e) => handleParamChange("volume", e.target.value)}
          />
        </div>
      

        <button onMouseDown={handlePlay}>
            Play
        </button>
        <button onClick={() => {
            if (rnboDevice) {
              rnboDevice.node.disconnect(); // Ensure RNBO is disconnected before removal
              console.log("RNBO device removed and disconnected");
            }
            onRemove(); // Call parent removal function
          }} style={{ marginLeft: '10px', color: 'red' }}>
            Remove
        </button>
        </div>
        </Draggable>
        
  );
}

export default simpleSynth;
