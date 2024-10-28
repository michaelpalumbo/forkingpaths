/*
    LIBRARIES
*/
import React, { 
    useCallback, 
    useState, 
    useEffect, 
    useRef,
    createContext, // for global state management. i will use this with automerge
    useContext
} from 'react';

import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Background,
  Controls,
  BackgroundVariant
} from 'reactflow';

import * as Automerge from 'automerge';
import { isValidAutomergeUrl } from '@automerge/automerge-repo';

/*
    COMPONENTS
*/
import CustomNode from './components/CustomNode';
import ContextMenu from './components/UI/ContextMenu';
import useAutomergeStore from './components/utility/automergeStore'; // Adjust path as needed
import repo from './components/utility/automergeRepo'; // Adjust the path based on where automergeRepo.js is located

/*
    STYLE
*/
import './ForkingPaths.css';
import 'reactflow/dist/style.css';


const initialDoc = Automerge.from({ count: 0 });

const nodeTypes = { customNode: CustomNode };


function App() {
    // automerge
      // Access Zustand store
    const doc = useAutomergeStore((state) => state.doc);
    const setDoc = useAutomergeStore((state) => state.setDoc);

    // const [doc, setDoc] = useState(initialDoc);
    const [renderState, setRenderState] = useState(doc.count);


    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar

    const [clickedEdge, setClickedEdge] = useState(null); // State for clicked edge

    const [menu, setMenu] = useState(null);
    const contextRef = useRef(null);


    /*

        AUTOMERGE
    */
    useEffect(() => {
        // Update renderState when doc changes
        setRenderState(doc.count);
    }, [doc]);

    const increment = () => {
        setDoc((d) => {
          d.count = (d.count || 0) + 1;
        });
      };

    let colorIndex = 0
    function getEdgeColor(){
        const edgeColors = [
            '#FF0000', // Red (Primary)
            '#00FFFF', // Cyan (Complementary to Red)
            '#0000FF', // Blue (Primary)
            '#FFFF00', // Yellow (Complementary to Blue)
            '#00FF00', // Green (Primary)
            '#FF00FF', // Magenta (Complementary to Green)
            '#FFA500', // Orange
            '#2E8B57', // Sea Green (Complementary to Orange)
            '#8B00FF', // Violet
            '#FFD700'  // Gold (Complementary to Violet)
          ];
          const color = edgeColors[colorIndex];
  colorIndex = (colorIndex + 1) % edgeColors.length; // Cycle to the next index, reset if it reaches the end
  return color;
    }
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, style: { strokeWidth: 3, stroke: getEdgeColor() } }, eds)),
        []
    );
    

    /* 
    
        EDITOR UI
    */

    // Nodes context menu 
    const onNodeContextMenu = useCallback(
        (event, node) => {
            // Prevent native context menu from showing
            event.preventDefault();
    
            // Calculate position of the context menu. We want to make sure it
            // doesn't get positioned off-screen.
            const pane = contextRef.current.getBoundingClientRect();
            setMenu({
            id: node.id,
            top: event.clientY < pane.height - 100 && event.clientY,
            left: event.clientX < pane.width - 200 && event.clientX,
            right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
            bottom:
                event.clientY >= pane.height - 200 && pane.height - event.clientY,
            });
        },
        [setMenu],
    );

    // Close the context menu if it's open whenever the window is clicked.
    const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

    
    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    /* 

        PATCHING
    */
    // Function to add a new custom node
    const addCustomNode = () => {
        const newNode = {
            id: (nodes.length + 1).toString(),
            type: 'customNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 }, // Random position
            data: { label: `Custom Node ${nodes.length + 1}` },
        };
        setNodes((nds) => nds.concat(newNode));

        // Add the new node to Automerge document
        setDoc((d) => {
            if (!d.nodes) d.nodes = []; // Initialize the 'nodes' array if it doesn't exist
            d.nodes.push(newNode);
        });
        console.log(doc)
    };


    // Handle delete key press to remove the clicked edge
    const handleKeyDown = useCallback(
        (event) => {
        if (event.key === 'Delete' && clickedEdge || event.key === 'Backspace' && clickedEdge) {
            setEdges((eds) => eds.filter((edge) => edge.id !== clickedEdge.id));
            setClickedEdge(null); // Reset clicked edge state
        }
        },
        [clickedEdge, setEdges]
    );

    // Add event listener for keydown
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
      // Log when an edge is clicked
    const onEdgeClick = useCallback((event, edge) => {
        console.log('Edge clicked:', edge);
        setClickedEdge(edge); // Set the clicked edge

    }, []);
    
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

                <p>Count: {doc.count}</p>
                <button onClick={increment}>Increment</button>
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

                <p>To delete cables: click a cable and press 'delete' or 'backspace' key</p>
                <p>Right click a module to delete or duplicate it</p>
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

                // EDITOR UI
                ref={contextRef}
                onPaneClick={onPaneClick}
                onNodeContextMenu={onNodeContextMenu}
                fitView

                // PATCHING
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgeClick={onEdgeClick}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                deleteKeyCode={46} // Set Delete key (keyCode 46) for edge deletion
            >
                <Background
                    id="1"
                    gap={10}
                    color="#f1f1f1"
                    variant={BackgroundVariant.Lines}
                />
            
                <Background
                    id="2"
                    gap={100}
                    color="#ccc"
                    variant={BackgroundVariant.Lines}
                />
                
                {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
                <Controls />
            </ReactFlow>
            </div>
        </div>

  );
}

export default App;
