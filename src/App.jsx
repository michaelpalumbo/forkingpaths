import React, { useState } from 'react';
import SynthModule from './components/SynthModule';

function App() {
  const [modules, setModules] = useState([]);

  const addModule = () => {
    // Dynamically add a new SynthModule
    setModules([...modules, <SynthModule key={modules.length} />]);
  };

  return (
    <div className="App">
      <h1>Dynamic Synth Modules</h1>
      <button onClick={addModule} style={{ padding: '10px 20px', marginBottom: '20px' }}>
        Add Synth Module
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {modules}
      </div>
    </div>
  );
}

export default App;
