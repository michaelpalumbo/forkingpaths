
// DO NOT EDIT THIS FILE. IT IS AUTOMATICALLY GENERATED BY device2component.js

import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import AudioNodeManager from '../AudioNodeManager';


function cycle440({ id, audioContext, onRemove, deviceFile, rnbo, handleJackClick, updateCablePosition }) {
  const [rnboDevice, setRnboDevice] = useState(null);
  const [values, setValues] = useState({frequency: 440 })
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Initial position
  const outputJackRef = useRef(null);
  const inputJackRef = useRef(null);
  const isLoadedRef = useRef(false); // useRef to track if RNBO device has already been loaded
  const rnboDeviceRef = useRef(null);

  // set params
  
  const [frequency, setFrequency] = useState(440);
  const [frequencyRange, setFrequencyRange] = useState({ min: 110, max: 880 });
    

  useEffect(() => {
    if ( !audioContext || !rnbo ) return; // Wait until AudioContext & RNBO is available

    // Avoid running the effect twice in React 18's Strict Mode
    if (isLoadedRef.current) return; // If already loaded, skip
    isLoadedRef.current = true; // Mark as loaded

    let rnboModule = null; // Local variable to track the current RNBO device

    const loadRNBO = async () => {
    try {

      // Load the RNBO patch data
      const response = await fetch(`/export/${deviceFile}`);   
              
      const patchData = await response.json();
      
      // Create the RNBO module
      rnboModule = await rnbo.createDevice({ context: audioContext, patcher: patchData });

      // Register this device in AudioNodeManager
      // Check if the RNBO device exposes an AudioNode
        if (rnboModule.node instanceof AudioNode) {
          // Register this device in AudioNodeManager
          console.log(`RNBO device output registered as AudioNode: ${id}`);
          AudioNodeManager.registerNode(id, rnboModule.node);
        } else {
          console.warn(`RNBO device ${id} does not expose a valid AudioNode.`);
        }

      // Connect the RNBO module to the destination (speakers)
      //! note that this is commented out to experiment with getting audio routed through cables
      // rnboModule.node.connect(audioContext.destination);

      // Store the RNBO device in the state
      setRnboDevice(rnboModule);
      rnboDeviceRef.current = rnboModule;



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
  }, [audioContext, deviceFile, rnbo, id]); // Re-run effect if audioContext changes


  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));

    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param){
        param.value = parseFloat(value);
      } 
    }
  };


  // Handler to click an output jack
  const handleOutputClick = (event) => {
    
    const rect = event.target.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    if (typeof handleJackClick === 'function') {
      handleJackClick(id, 0, 'output', { x: startX, y: startY });
    }
  };

  // Handler to click an input jack
  const handleInputClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    if (typeof handleJackClick === 'function') {
      handleJackClick(id, 0, 'input', { x: endX, y: endY });
    }
  };

    const handleClick = () => {
    if (typeof onElementClick === 'function') {
      onElementClick('Child element clicked!');
    }
  };

  // handle module repositioning. the connection manager will use this to update cable positioning
  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });

    // Update jack positions during dragging
    if (outputJackRef.current) {
      const rect = outputJackRef.current.getBoundingClientRect();
      updateCablePosition(id, 0, 'output', { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    if (inputJackRef.current) {
      const rect = inputJackRef.current.getBoundingClientRect();
      updateCablePosition(id, 0, 'input', { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  };


  return (

  <Draggable 
    position={position}
    onDrag={handleDrag}
    cancel="input, select">

    <div style={{ padding: '10px', border: '1px solid black', margin: '10px',  position: 'absolute'  }}>
      <p>cycle440</p>
        
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
      

        {/* Interactive Output Jack */}
        <div
          ref={outputJackRef}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'red',
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            cursor: 'pointer',
          }}
          title="Output"
          onMouseDown={handleOutputClick} // Start connection on mousedown
        />

        {/* Interactive Input Jack */}
        <div
          ref={inputJackRef}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'blue',
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            cursor: 'pointer',
          }}
          title="Input"
          onMouseUp={handleInputClick} // Complete connection on mouseup
        />

      <button onClick={() => {
        if (rnboDevice) {
          rnboDevice.node.disconnect(); // Ensure RNBO is disconnected before removal
          console.log("RNBO device removed and disconnected");
        }
        onRemove(); // Call parent removal function
          }} style={{ marginLeft: '10px', color: 'red' }}>
        X
      </button>
    </div>
  </Draggable>
        
  );
}

export default cycle440;