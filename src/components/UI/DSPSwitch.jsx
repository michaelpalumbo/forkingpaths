import React, { useState } from 'react';

const DSPSwitch = ({ onToggle }) => {
  const [isDSPOn, setIsDSPOn] = useState(false);

  const handleToggle = () => {
    setIsDSPOn((prev) => {
      const newState = !prev;
      if (onToggle) {
        onToggle(newState); // Call the provided callback with the new state
      }
      return newState;
    });
  };

  const backgroundColor = isDSPOn ? 'cornflowerblue' : 'lightgrey';
  const text = isDSPOn ? 'DSP: ON' : 'DSP: OFF';

  return (
    <div
      onClick={handleToggle}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '80px',
        height: '40px',
        backgroundColor: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: '5px',
        fontWeight: 'bold',
        color: 'black'
      }}
    >
      {text}
    </div>
  );
};

export default DSPSwitch;
