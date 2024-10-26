import React from 'react';
import { getBezierPath } from 'reactflow';

function CustomEdge({ id, sourceX, sourceY, targetX, targetY, style }) {
  // Get the bezier path for the edge
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    curvature: 0.25,
  });

  return (
    <g className="custom-edge">
      <path
        id={id}
        d={edgePath}
        style={{
          ...style,
          stroke: '#333',
          strokeWidth: 3,
          zIndex: 10, // Ensure the edge is on top
        }}
        markerEnd="url(#arrow)"
      />
    </g>
  );
}

export default CustomEdge;
