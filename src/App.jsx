import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SynthModule from './components/SynthModule';
import { v4 as uuidv4 } from 'uuid';
// import all components from index.js (these are RNBO devices that have been dynamically turned into react components)
import * as Components from './components'


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

  // check for module scene updates
  useEffect(() => {
    console.log('Updated modules:', modules);
  }, [modules]);

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
    // setModules([...modules, newModule]); // Add new module to the list
    setModules((prevModules) => [...prevModules, newModule]);
  };


  // Function to load a component by its name
  const getComponentByName = (name) => {
    // Find the component in the imported index
    const component = Components[name];
    if (!component) {
      console.error(`Component ${name} not found in index.`);
    }
    return component;
  };

  
  // remove modules
  const removeModule = (id) => {
    console.log('module', id, 'was removed')
    setModules(modules.filter(module => module.id !== id)); // Remove the module by id
    RNBOStatus()
    handleStop()
  };

  
  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value); // Update the selected device
    // addModule()
  };

  function RNBOStatus({ rnboDevice }) {
    const [deviceCount, setDeviceCount] = useState(0);
    const [parameters, setParameters] = useState([]);
  
    useEffect(() => {
      if (!rnboDevice) {
        console.log("No RNBO device is connected.");
        return;
      }
  
      // Log the RNBO device object
      console.log("RNBO Device:", rnboDevice);
  
      // Example: Checking the number of devices
      const numDevices = rnboDevice ? 1 : 0; // If there's a device, count it as 1
      setDeviceCount(numDevices);
      console.log(deviceCount)
  
      // Example: Get parameters of the device
      if (rnboDevice.parameters) {
        setParameters(rnboDevice.parameters);
        console.log("RNBO Device Parameters:", rnboDevice.parameters);
      }
  
    }, [rnboDevice]);
  }

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
      {modules.map((module) => {
        // Assume the component name matches the device file name
        const componentName = module.deviceFile.replace('.export.json', '');
        const SynthModule = getComponentByName(componentName);

        return SynthModule ? (
          <SynthModule
            key={module.id}
            id={module.id}
            audioContext={audioContext}
            deviceFile={module.deviceFile}
            onRemove={() => removeModule(module.id) } // Adjust to actual removal logic
          />
        ) : (
          <div key={module.id}>Component {componentName} not found...</div>
        );
      })}

        
      </div>
      {/* Trash Bin Icon in the bottom left */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faTrash} size="2x" color="red" />
      </div>
    </div>
  );
}

export default App;
