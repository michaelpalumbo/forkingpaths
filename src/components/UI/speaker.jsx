
// DO NOT EDIT THIS FILE. IT IS AUTOMATICALLY GENERATED BY device2component.js

import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';


function Speaker({ id, audioContext, onRemove, deviceFile, rnbo, startConnection, completeConnection }) {
  const [rnboDevice, setRnboDevice] = useState(null);
  const [values, setValues] = useState({})

    const isLoadedRef = useRef(false); // useRef to track if RNBO device has already been loaded


  // set params
  

  useEffect(() => {
    if ( !audioContext || !rnbo ) return; // Wait until AudioContext & RNBO is available

    // Avoid running the effect twice in React 18's Strict Mode
    if (isLoadedRef.current) return; // If already loaded, skip
    isLoadedRef.current = true; // Mark as loaded

    let rnboModule = null; // Local variable to track the current RNBO device

    const loadRNBO = async () => {
    try {

      // Load the RNBO patch data
      const response = await fetch(`/export/speaker.export.json`);   
              
      const patchData = await response.json();


      
      // Create the RNBO module
      rnboModule = await rnbo.createDevice({ context: audioContext, patcher: patchData });

      // Connect the RNBO module to the destination (speakers)
      rnboModule.node.connect(audioContext.destination);

      // Store the RNBO device in the state
      setRnboDevice(rnboModule);


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
  }, [audioContext, deviceFile, rnbo]); // Re-run effect if audioContext changes

  // Handler to start a cable connection from the output jack
  const handleOutputClick = () => {
    startConnection(id, 0); // Assume a single output for now
  };

  // Handler to complete a connection at an input jack
  const handleInputClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    // Use completeConnection to finish the connection
    if (typeof completeConnection === 'function') {
      completeConnection(id, 0, { x: endX, y: endY });
    } else {
      console.error('completeConnection is not a function');
    }
  };


  return (

  <Draggable cancel="input, select">
    <div style={{
        width: '100px',
        height: '100px',
        border: '2px solid black',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: '#eee',
        color: 'black'
      }}>
      <p>Audio Out</p>

      <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>Input</div>

      {/* Visual input jack */}
      {/* Interactive Input Jack */}
      <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'blue',
            position: 'absolute',
            bottom: '5px',
            left: 'calc(50% - 10px)', // Center the jack horizontally
            cursor: 'pointer',
          }}
          title="Input"
          onMouseUp={handleInputClick} // Complete connection on mouseup
        />
    </div>
  </Draggable>
        
  );
}

export default Speaker;
