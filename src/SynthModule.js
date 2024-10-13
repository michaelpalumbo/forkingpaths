import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import Draggable from 'react-draggable';

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
    onConnect(type, 'Filter'); // Example connection to a filter for now
  };

  return (
    <Draggable>
      <div className="synth-module">
        <h3>{type}</h3>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleConnect}>Connect to Filter</button>
      </div>
    </Draggable>
  );
}

export default SynthModule;
