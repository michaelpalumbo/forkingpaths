import React from 'react';
import { v4 as uuidv4 } from 'uuid';

function ModuleManager({ RNBO, modules, setModules, selectedDevice }) {
  const addModule = () => {
    if (!RNBO) {
      console.error('RNBO is not loaded yet');
      return;
    }

    if (!selectedDevice) {
      alert('Please select a device before adding a module.');
      return;
    }

    const newModule = {
      id: uuidv4(),
      deviceFile: selectedDevice,
    };
    console.log(newModule)
    setModules((prevModules) => [...prevModules, newModule]);
  };

  return (
    <button onClick={addModule} style={{ padding: '10px 20px', marginBottom: '20px' }}>
      Add Synth Module
    </button>
  );
}

export default ModuleManager;
