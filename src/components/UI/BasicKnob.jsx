import React, { useEffect, useRef } from 'react';
import Knob from 'rc-knob';

const BasicKnob = ({  }) => {
  const [value, setValue] = useState(50);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <Knob
        size={100}
        angleOffset={-125}
        angleRange={250}
        min={0}
        max={100}
        value={value}
        onChange={(newValue) => setValue(newValue)}
        ariaLabelledBy="knob-label"
      />
      <p id="knob-label">Current Value: {value}</p>
    </div>
  );
};

export default BasicKnob;
