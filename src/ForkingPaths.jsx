import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './ForkingPaths.css';

import CustomNode from './components/CustomNode';
import CustomEdge from './components/CustomEdge'; // Import the custom edge


const nodeTypes = { customNode: CustomNode };


const initialNodes = [
  {
    id: '1',
    type: 'customNode',
    position: { x: 150, y: 150 },
    data: { label: 'My Custom Node' },
  },
  { id: '2', type: 'input', position: { x: 50, y: 50 }, data: { label: 'Input Node' } },
  { id: '3', type: 'output', position: { x: 250, y: 250 }, data: { label: 'Output Node' } },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   const onConnect = useCallback(
//     (params) => setEdges((eds) => addEdge(params, eds)),
//     []
//   );

    function getEdgeColor(){
        const edgeColors = [ '#FF3333', '#080FF', '#00FF00', '#9933FF', '#CCCC00', '#FF00FF']

        const randomIndex = Math.floor(Math.random() * edgeColors.length);
        return edgeColors[randomIndex];
    }
const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 3, stroke: getEdgeColor() } }, eds)),
    []
  );
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        dragHandle=".custom-drag-handle"
      >
        <Background variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default App;
