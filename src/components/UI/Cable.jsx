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
    <svg style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible' }}>
      <path
        d={path}
        stroke="black"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)" // Optional: Add an arrowhead marker
      />
      {/* Optional: Arrowhead Marker Definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
    </svg>
  );
}

export default Cable;
