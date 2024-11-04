import React from 'react';

function DSPSwitch({ onToggle, isDSPOn }) {
  const handleClick = () => {
    onToggle(!isDSPOn); // Call the parent toggle function with the new state
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: isDSPOn ? 'lightblue' : 'lightgrey',
        color: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'absolute',
        top: '10px',
        right: '10px',
      }}
    >
      {isDSPOn ? 'DSP: ON' : 'DSP: OFF'}
    </div>
  );
}

export default DSPSwitch;
