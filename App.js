import React, { useState } from 'react';
import './App.css';
import SynthModule from './SynthModule';

function App() {
  const [connections, setConnections] = useState([]);

  const handleConnect = (output, input) => {
    setConnections([...connections, { output, input }]);
  };

  return (
    <div className="App">
      <h1>Synth Modular System</h1>
      <div className="modules">
        <SynthModule type="Oscillator" onConnect={handleConnect} />
        <SynthModule type="Filter" onConnect={handleConnect} />
      </div>
      <div className="connections">
        {connections.map((conn, index) => (
          <div key={index}>Connected: {conn.output} to {conn.input}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
