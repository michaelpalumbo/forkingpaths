import React, { useState } from 'react';
import './App.css';
import SynthModule from './src/SynthModule';
import * as Automerge from 'automerge';

function App() {
  // Initialize an Automerge document

  localStorage.removeItem('synthDoc');


  const [doc, setDoc] = useState(() => {
    const initDoc = Automerge.from({
      positions: {} // Initialize with an empty positions object
    });
    console.log("Initial Automerge document:", initDoc);
    return initDoc;
  })
  const [connections, setConnections] = useState([]);

  const handleConnect = (output, input) => {
    setConnections([...connections, { output, input }]);
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
    const saved = Automerge.save(doc);
    localStorage.setItem('synthDoc', saved);
    console.log("Saved document to localStorage:", doc);
  }, [doc]);

  if (!doc) {
    console.error('Automerge document not initialized.');
    return null; // Return null if doc is not initialized to prevent errors
  }

  return (
    <div className="App">
      <h1>Synth Modular System</h1>
      <div className="modules">
        <SynthModule type="Oscillator" onConnect={handleConnect}  doc={doc} setDoc={setDoc} />
        <SynthModule type="Filter" onConnect={handleConnect}  doc={doc} setDoc={setDoc} />
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
