import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SynthModule from './components/SynthModule';

function App() {
  const [modules, setModules] = useState([]);
  
  const addModule = () => {
    setModules([...modules, <SynthModule key={modules.length} />]);
  };

  // remove modules
  const removeModule = (id) => {
    setModules(modules.filter(module => module.id !== id)); // Remove the module by id
  };
  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
      <h1>Dynamic Synth Modules</h1>
      <button onClick={addModule} style={{ padding: '10px 20px', marginBottom: '20px' }}>
        Add Synth Module
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {modules}
      </div>

      {/* Trash Bin Icon in the bottom left */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faTrash} size="2x" color="red" />
      </div>
    </div>
  );
}

export default App;
