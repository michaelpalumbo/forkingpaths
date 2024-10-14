import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import SynthModule from './components/SynthModule';
import { v4 as uuidv4 } from 'uuid';


function App() {
  const [modules, setModules] = useState([]);
  // setup webaudio context
  const [audioContext, setAudioContext] = useState(null); // Store a shared AudioContext
  
  // Create the shared AudioContext when the app loads
  useEffect(() => {
    const context = new AudioContext();
    setAudioContext(context);
  }, []);

  const addModule = () => {
    let id = uuidv4()
    console.log(id)
    // Store the id as metadata in the state
    setModules([...modules, {id: id}]);
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
        { 
        modules.map((module) => {
          console.log(module.id)
          return (<SynthModule
            key={module.id}
            id={module.id}
            audioContext={audioContext} // Pass the shared AudioContext
            onRemove={() => removeModule(module.id)}
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
