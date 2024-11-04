

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';


import AudioNodeManager from '../AudioNodeManager';


function cycle440({ id, audioContext, deviceFile, rnbo }) {
  const [rnboDevice, setRnboDevice] = useState(null);
  const [values, setValues] = useState({frequency: 440 })

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




  return (



    <div style={{ padding: '10px', border: '1px solid black', margin: '10px',  position: 'absolute'  }}>
      <p>cycle440</p>
        {/* Input handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555' }}
      />
      
      {/* Output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555' }}
      />
        {/* <div key={frequency}>
          <label htmlFor="frequency">frequency: {values.frequency}</label>
          <input
            type="range"
            id="frequency"
            min={110}
            max={880}
            value={values.frequency}
            onChange={(e) => handleParamChange("frequency", e.target.value)}
          />
        </div> */}
    </div>

        
  );
}

export default cycle440;
