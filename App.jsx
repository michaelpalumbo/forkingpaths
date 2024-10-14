import React, { useState, useEffect } from 'react';
import './App.css';
import SynthModule from './SynthModule.jsx';


function App() {


  const handleConnect = (output, input) => {
    console.log(`Connected ${output} to ${input}`);
  };

  return (
    <div className="App">
      <h1>Synth Modular System with Automerge</h1>
      <div className="modules">
        <SynthModule type="Oscillator" onConnect={handleConnect} doc={doc} setDoc={setDoc} />
        <SynthModule type="Filter" onConnect={handleConnect} doc={doc} setDoc={setDoc} />
      </div>
    </div>
  );
}

export default App;
