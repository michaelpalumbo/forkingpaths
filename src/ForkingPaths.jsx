import React, { useCallback, useState } from 'react';
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



const nodeTypes = { customNode: CustomNode };


const initialNodes = [
];

const initialEdges = [];

function App() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar


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

    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        {/* Left Column for Collapsible Components */}
        <div
          style={{
            width: isSidebarCollapsed ? '0px' : '300px', // Adjust width based on collapse state
            transition: 'width 0.3s', // Smooth transition

            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #ccc',
            padding: isSidebarCollapsed ? '0' : '10px',
            isplay: isSidebarCollapsed ? 'none' : 'block',
            overflowY: 'hidden',
          }}
        >
            <h2>Editing</h2>
            {/* Add Node Button */}
            <button
                onClick={addCustomNode}
                style={{
                // position: 'absolute',
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
  
          {/* Placeholder for Additional Components */}
          {/* Future components can be added here as more collapsible sections */}
        </div>
        

        {/* Right Column for React Flow Viewport */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: '10px',
            left: '-15px', // Adjust position based on sidebar state
            zIndex: 100,
            padding: '5px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {isSidebarCollapsed ? '> >' : '< <'}
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
    </div>
  );
}

export default App;
