
import React, { useState } from 'react';
import { RNBO } from '@rnbo/js';
import Draggable from 'react-draggable';

function cycle440({ audioContext, onRemove }) {
  const [rnboDevice, setRnboDevice] = useState(null);
  const [values, setValues] = useState({});

  useEffect(() => {
    const loadRNBO = async () => {
      const response = await fetch('/export/cycle440.export.json');
      const patchData = await response.json();
      const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });
      rnbo.node.connect(audioContext.destination);
      setRnboDevice(rnbo);
    };

    loadRNBO();

    return () => {
      if (rnboDevice) rnboDevice.node.disconnect();
    };
  }, [audioContext]);

  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));
    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param) param.value = parseFloat(value);
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid black', margin: '10px' }}>
      <h3>cycle440 Module</h3>
      
        <div key={undefined}>
          <label htmlFor="undefined">frequency: {values.undefined}</label>
          <input
            type="range"
            id="undefined"
            min={undefined}
            max={undefined}
            value={values.undefined}
            onChange={(e) => handleParamChange("undefined", e.target.value)}
          />
        </div>
      
      <button onClick={onRemove} style={{ color: 'red', marginTop: '10px' }}>Remove</button>
    </div>
  );
}

export default cycle440;
