import React from 'react';

function Cable({ startX, startY, endX, endY }) {
  const pathData = `M${startX},${startY} C${startX + 50},${startY} ${endX - 50},${endY} ${endX},${endY}`;

  return (
    <svg style={{ position: 'absolute', pointerEvents: 'none' }}>
      <path
        d={pathData}
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export default Cable;
