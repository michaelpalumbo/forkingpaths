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


const initialNodes = [];

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
    
    // Function to add a new custom node
    const addCustomNode = () => {
        const newNode = {
        id: (nodes.length + 1).toString(),
        type: 'customNode',
        position: { x: Math.random() * 250, y: Math.random() * 250 }, // Random position
        data: { label: `Custom Node ${nodes.length + 1}` },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>

        {/* Add Node Button */}
        <button
            onClick={addCustomNode}
            style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 100, // Ensure button is above the React Flow canvas
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            }}
        >
            Add Custom Node
        </button>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            nodeTypes={nodeTypes}
        >
            <Background variant="dots" />
            <Controls />
        </ReactFlow>
    </div>
  );
}

export default App;
