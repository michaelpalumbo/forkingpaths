import React, { useMemo } from 'react';

// Helper function to generate SVG path for Bezier curve
const generateBezierPath = (from, to) => {
  // Calculate control points for the curve
  const controlPointOffset = Math.abs(to.x - from.x) / 2;
  const controlPoint1 = { x: from.x + controlPointOffset, y: from.y };
  const controlPoint2 = { x: to.x - controlPointOffset, y: to.y };

  // Return the SVG path string for a cubic Bezier curve
  return `
    M ${from.x},${from.y} 
    C ${controlPoint1.x},${controlPoint1.y} 
      ${controlPoint2.x},${controlPoint2.y} 
      ${to.x},${to.y}
  `;
};

function Cable({ fromRef, toRef }) {
  // Calculate the Bezier path based on the coordinates
  const path = useMemo(() => generateBezierPath(fromRef, toRef), [fromRef, toRef]);

  return (
    <svg style={{ 
      position: 'absolute', 
      pointerEvents: 'none', 
      overflow: 'visible', 
      zIndex: 1000, // High z-index to ensure it appears on top
    }}>

      {/* Draw the Bezier path */}

      <path
        d={path}
        stroke="black"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)" // Optional: Add an arrowhead marker
      />
      {/* Add a circle at the start (plug) */}
      <circle
        cx={fromRef.x}
        cy={fromRef.y}
        r="5" // Plug radius
        fill="green" // Color of the plug (adjust as needed)
      />

      {/* Add a circle at the end (plug) */}
      <circle
        cx={toRef.x}
        cy={toRef.y}
        r="5" // Plug radius
        fill="green" // Color of the plug (adjust as needed)
      />
    </svg>
  );
}

export default Cable;
