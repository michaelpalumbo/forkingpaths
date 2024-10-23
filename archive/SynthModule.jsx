
import React, { useEffect, useState } from 'react';
import RNBO from '@rnbo/js'; // Import RNBO from the package
import Draggable from 'react-draggable';

function SynthModule({ id, audioContext, onRemove, deviceFile }) {
    const [rnboDevice, setRnboDevice] = useState(null);

    // set params
    const [frequency, setFrequency] = useState(440); // Default value of 440Hz for the slider
    const [frequencyRange, setFrequencyRange] = useState({ min: 20, max: 20000 }); // Default range


    useEffect(() => {
        if (!audioContext) return; // Wait until AudioContext is available

        const loadRNBO = async () => {
        try {
            // Load the RNBO patch data
            const response = await fetch(`/export/${deviceFile}`);            const patchData = await response.json();
            console.log(response)
            // Create the RNBO device
            const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });

            // Connect the RNBO device to the destination (speakers)
            rnbo.node.connect(audioContext.destination);

            // Find the frequency parameter (use .parametersById or .parameters)
            const frequencyParam = rnbo.parameters.find(param => param.name === 'frequency');

            if (frequencyParam) {
                frequencyParam.value = 440; // Set initial frequency to 440Hz
                setFrequencyRange({
                    min: frequencyParam.min, // Dynamically set the min value
                    max: frequencyParam.max, // Dynamically set the max value
                });
            }
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

        // Handle frequency change from the slider
        const handleFrequencyChange = (event) => {
            const newFrequency = event.target.value;
            setFrequency(newFrequency); // Update the slider value in the state
        
            if (rnboDevice) {
            // Find and update the frequency parameter
            const frequencyParam = rnboDevice.parameters.find(param => param.name === 'frequency');
            if (frequencyParam) {
                frequencyParam.value = newFrequency; // Update the RNBO parameter
            }
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

            {/* Slider to control frequency */}
            <label htmlFor="frequency-slider">Frequency: {frequency} Hz</label>
            <input
                type="range"
                id="frequency-slider"
                min={frequencyRange.min} // Dynamically set min value
                max={frequencyRange.max} // Dynamically set max value
                value={frequency}
                onChange={handleFrequencyChange}
                step="1" // Adjust precision as needed
            />
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

export default SynthModule;


// import React, { useState, useEffect } from 'react';


// import Draggable from 'react-draggable';

// import { createDevice } from '@rnbo/js'; // Import RNBO from the package

// // todo: get the simpleSynth.export.json file to load correctly from the server. it might not be in the right file path

// function SynthModule({id, audioContext, onRemove}) {

//     const [rnboPatch, setRnboPatch, synth, setSynth] = useState(null);


//     useEffect(() => {
//         // Wait until AudioContext is available
//         if (!audioContext) return; 

//         const loadRNBO = async () => {
//             // Load the RNBO patch data
//             // todo eventually we'll want to pass the name of a given export patch from the UI when dynamically loading
//             const response = await fetch('/export/simpleSynth.export.json'); // Adjust path if needed
//             const patchData = await response.json();
            
            
//             // Create RNBO patch from JSON
//             const rnbo = createDevice({ audioContext, patchData });

//             // const rnbo = await RNBO.createFromJSON(audioContext, patchData);
      
//             // Prepare the RNBO patch
//             // await rnbo.prepare();
      
//             // Connect the RNBO patch to the destination (speakers)
//             rnbo.node.connect(audioContext.destination);
      
//             // Store the RNBO patch in the state
//             setRnboPatch(rnbo);
//           };
      
//           // Load the RNBO patch
//           loadRNBO();
      
//           return () => {
//             // Cleanup when the component unmounts
//             if (rnboPatch) {
//               rnboPatch.node.disconnect();
//             }
//         };
//     }, [audioContext]); // Re-run effect if audioContext changes

//     const handlePlay = () => {
//         if (rnboPatch) {
//           // Start audio context (required in some browsers)
//           audioContext.resume();
    
//           // Trigger any event or start audio in RNBO patch
//         }
//       };
    
//       const handleStop = () => {
//         if (rnboPatch) {
//           // Stop or reset RNBO patch if needed
//         }
//       };


//     // Handle drag and log the position
//     const handleDrag = (e, data) => {
//         console.log(`Module is being dragged. Current position: x=${data.x}, y=${data.y}`);
//       };

//   return (
//     <Draggable cancel="input, select">
//       {/* Ensure Draggable wraps only one child (a single div) */}
//       <div
//         style={{
//           width: '220px',
//           padding: '10px',
//           border: '1px solid black',
//           margin: '10px',
//           textAlign: 'center',
//           backgroundColor: '#e0e0e0',
//           cursor: 'move',
//           color: 'black',
//         }}
//       >
//         <p>Synth Module (ID: {id})</p>
//         <button onMouseDown={handlePlay} onMouseUp={handleStop}>
//           Play
//         </button>
//         <button onClick={onRemove} style={{ marginLeft: '10px', color: 'red' }}>
//         Remove
//       </button>
//         {/* <div style={{ margin: '10px 0' }}>
//           <label>
//             Frequency:
//             <input
//               type="range"
//               min="20"
//               max="2000"
//               value={frequency}
//               onChange={(e) => setFrequency(e.target.value)}
//             />
//             {frequency} Hz
//           </label>
//         </div>
//         <div style={{ margin: '10px 0' }}>
//           <label>
//             Waveform:
//             <select value={waveform} onChange={(e) => setWaveform(e.target.value)}>
//               <option value="sine">Sine</option>
//               <option value="square">Square</option>
//               <option value="sawtooth">Sawtooth</option>
//               <option value="triangle">Triangle</option>
//             </select>
//           </label>
//         </div>
//         <div style={{ margin: '10px 0' }}>
//           <label>
//             Volume:
//             <input
//               type="range"
//               min="-60"
//               max="0"
//               value={volume}
//               onChange={(e) => setVolume(e.target.value)}
//             />
//             {volume} dB
//           </label>
//         </div> */}
//       </div>
//     </Draggable>
//   );
// }

// export default SynthModule;
