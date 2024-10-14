import React, { useState, useEffect } from 'react';
import './App.css';
import SynthModule from './SynthModule.jsx';
import * as Automerge from 'automerge';

function App() {
  // Initialize an Automerge document with positions
  const [doc, setDoc] = useState(() =>
    Automerge.from({
      positions: {} // Initialize with an empty positions object
    })
  );

  const handleConnect = (output, input) => {
    console.log(`Connected ${output} to ${input}`);
  };

  // Simulate loading the document or merging with another version
  useEffect(() => {
    const savedDoc = localStorage.getItem('synthDoc');
    if (savedDoc) {
      try {
        const loadedDoc = Automerge.load(savedDoc);
        setDoc(loadedDoc);
        console.log("Loaded document from localStorage:", loadedDoc);
      } catch (error) {
        console.error("Failed to load Automerge document from localStorage:", error);
      }
    }
  }, []);

  // Simulate saving the document
  useEffect(() => {
    if (doc) {
      const saved = Automerge.save(doc);
      localStorage.setItem('synthDoc', saved);
      console.log("Saved document to localStorage:", doc);
    }
  }, [doc]);

  if (!doc) {
    console.error('Automerge document not initialized.');
    return null; // Return null if doc is not initialized to prevent errors
  }else {
    console.log('doc\n\n', doc)
  }

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
