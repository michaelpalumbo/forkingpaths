import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SynthModule from './components/SynthModule';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [modules, setModules] = useState([]);
  // setup webaudio context
  const [audioContext, setAudioContext] = useState(null); // Store a shared AudioContext
  
  const [rnboDevices, setRnboDevices] = useState([]); // State to hold the RNBO devices
  const [selectedDevice, setSelectedDevice] = useState(''); // State for selected device

  let menu = {}
  // Fetch the list of RNBO devices when the component mounts
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/export/rnboDevices.json');
        if (!response.ok) {
          throw new Error('Failed to fetch RNBO devices');
        }
        const devices = await response.json();
        setRnboDevices(devices);
        
        // setSelectedDevice(devices[0]); // Set the first device as default selection
      } catch (error) {
        console.error('Error fetching RNBO devices:', error);
      }
    };

    fetchDevices();
  }, []);
  // Create the shared AudioContext when the app loads
  useEffect(() => {
    const context = new AudioContext();
    setAudioContext(context);
  }, []);

  const addModule = () => {
    let id = uuidv4()
    if (!selectedDevice) {
      alert("Please select a device before adding a module.");
      return;
    }
    const newModule = {
      id: id,
      deviceFile: selectedDevice, // Add the selected RNBO device file to the module
    };
    setModules([...modules, newModule]); // Add new module to the list
    // // Store the id as metadata in the state
    // setModules([...modules, {
    //   id: id,
    //   deviceFile: selectedDevice
    // }]);
  };

  // remove modules
  const removeModule = (id) => {
    console.log('module', id, 'was removed')
    setModules(modules.filter(module => module.id !== id)); // Remove the module by id
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value); // Update the selected device
    // addModule()
  };
  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
      <h1>Dynamic Synth Modules</h1>

      <h2>Does not work in Brave Browser, use Chrome</h2>

      {/* Dropdown to select RNBO device */}
      <label htmlFor="rnbo-device-select">Select RNBO Device:</label>
      <select id="rnbo-device-select" value={selectedDevice} onChange={handleDeviceChange}>
      <option value="" disabled>Select a device...</option>
        {rnboDevices.map((device, index) => (
          <option key={index} value={device}>
            {device}
          </option>
        ))}
      </select>

      <button onClick={addModule} style={{ padding: '10px 20px', marginBottom: '20px' }}>
        Add Synth Module
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        { 
        modules.map((module) => {
          return (<SynthModule
            key={module.id}
            id={module.id}
            audioContext={audioContext} // Pass the shared AudioContext
            deviceFile={module.deviceFile}
            onRemove={ () => removeModule(module.id) }
          />
        )
        }
        
      )}
        
      </div>

      {/* Trash Bin Icon in the bottom left */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faTrash} size="2x" color="red" />
      </div>
    </div>
  );
}

export default App;
