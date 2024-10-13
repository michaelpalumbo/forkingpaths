import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

function SynthModule({ type, onConnect }) {
  const [module, setModule] = useState(null);

  useEffect(() => {
    let synthModule;
    if (type === 'Oscillator') {
      synthModule = new Tone.Oscillator().toDestination();
    } else if (type === 'Filter') {
      synthModule = new Tone.Filter().toDestination();
    }
    setModule(synthModule);
  }, [type]);

  const handlePlay = () => {
    if (module && module.start) {
      module.start();
    }
  };

  const handleStop = () => {
    if (module && module.stop) {
      module.stop();
    }
  };

  const handleConnect = () => {
    // Dynamic connection handling can be expanded here
    onConnect(type, 'Filter'); // Connecting Oscillator to Filter for now
  };

  return (
    <div className="synth-module">
      <h3>{type}</h3>
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleConnect}>Connect to Filter</button>
    </div>
  );
}

export default SynthModule;
