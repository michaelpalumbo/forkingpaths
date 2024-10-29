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
  BackgroundVariant,

  MiniMap
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

const nodeTypes = { customNode: CustomNode };


function ForkingPaths() {
    // automerge
    const doc = useAutomergeStore((state) => state.doc);
    const setDoc = useAutomergeStore((state) => state.setDoc);
    const setHandle = useAutomergeStore((state) => state.setHandle);
    const handle = useAutomergeStore((state) => state.handle); // Retrieve handle from Zustand
    // State for the current document hash and simulated peers
    const [currentHash, setCurrentHash] = useState('');
    const [peers, setPeers] = useState([]);
    // UI
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // State for sidebar
    const [menu, setMenu] = useState(null);
    const contextRef = useRef(null);
    // Patching

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [clickedEdge, setClickedEdge] = useState(null); // State for clicked edge

    
    // Handler to log nodes changes
        // can be useful for direct renders (i.e. it may be optimal to update the audio state locally)
        const handleNodesChange = useCallback(
            (changes) => {
              onNodesChange(changes);
          
              changes.forEach((change) => {
                if (change.type === 'position') {
                  // Only update Automerge when dragging stops
                  if (!change.dragging && handle) {
                    handle.change((d) => {
                      const node = d.nodes.find((n) => n.id === change.id);
                      if (node) {
                        node.position = { ...change.position };
                      }
                    });
                  }
                }
              });
            },
            [onNodesChange, handle]
          );
          
          
    
    // Handler to log edges changes
    // can be useful for direct renders (i.e. it may be optimal to update the audio state locally)
    const handleEdgesChange = useCallback(
        (changes) => {
        onEdgesChange(changes);

        },
        [onEdgesChange, edges]
    );


    /*

        AUTOMERGE
    */
    // update document in automerge-repo:
    useEffect(() => {
        const rootDocUrl = document.location.hash.substring(1);
        
        let handle;
    
        if (isValidAutomergeUrl(rootDocUrl)) {
            handle = repo.find(rootDocUrl);
            // store document url hash
            setCurrentHash(rootDocUrl.split(':')[1]);
        } else {
            handle = repo.create({ nodes: [], edges: [] });
            document.location.hash = handle.url;
            // store document url hash
            setCurrentHash(handle.url.split(':')[1]);
        }
    
        setHandle(handle);

        // Sync Automerge Repo document with Zustand
        const initialDoc = handle.doc();
        setDoc(() => initialDoc);

        if (initialDoc.nodes) setNodes(initialDoc.nodes);
        if (initialDoc.edges) setEdges(initialDoc.edges);

        
        // Listen for document changes from this client and peers
        handle.on('change', (newDoc) => {
            setDoc(() => newDoc);

            // Only update ReactFlow if there's a change in nodes or edges
            if (newDoc.doc.nodes && JSON.stringify(newDoc.doc.nodes) !== JSON.stringify(nodes)) {
                setNodes((prevNodes) => [...newDoc.doc.nodes]);
            }
        
            if (newDoc.doc.edges && JSON.stringify(newDoc.doc.edges) !== JSON.stringify(edges)) {
                setEdges((prevEdges) => [...newDoc.doc.edges]);
            }

            console.log(newDoc)
        });

        // Simulate the initial list of peers
        setPeers([
            { id: 1, hash: currentHash || 'No active session' },
            // Add more simulated peers as needed
        ]);
    }, [setDoc, setHandle, setNodes, setEdges, nodes, edges, currentHash]);

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
        (params) => {
          const newEdge = addEdge({ ...params, style: { strokeWidth: 3, stroke: getEdgeColor() } }, edges);
      
          setEdges((eds) => newEdge);
      
          // Add the new edge to the Automerge document
          if (handle) {
            handle.change((d) => {
              if (!d.edges) d.edges = [];
              d.edges.push(newEdge[newEdge.length - 1]);
            });
          }
        },
        [edges, handle]
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
        if (!handle) return;
        
        const newNode = {
            id: (nodes.length + 1).toString(),
            type: 'customNode',
            position: { x: Math.random() * 250, y: Math.random() * 250 }, // Random position
            data: { label: `Custom Node ${nodes.length + 1}` },
        };
        setNodes((nds) => nds.concat(newNode));

        // Add the new node to the Automerge document
        handle.change((d) => {
            if (!d.nodes) d.nodes = []; // Initialize the 'nodes' array if it doesn't exist
            d.nodes.push(newNode);
        });
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

                {/* <p>Count: {doc.count}</p> */}
                {/* <button onClick={increment}>Increment</button> */}
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
            
            {/*  separator */}
            <div style={{ margin: '10px 0', borderBottom: '5px solid #000', width: '100%' }} />
            {/* Display Current Session Hash as clickable link */}
            <div style={{ marginBottom: '10px' }}>
            <strong>Current Room ID:</strong>
            <p>
                {currentHash ? (
                <a
                    href={document.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4CAF50', textDecoration: 'none' }}
                >
                    {currentHash}
                </a>
                ) : (
                'Generating...'
                )}
                <h3>Peers in Session</h3>
                <ul>
                {peers.map(peer => (
                    <li key={peer.id}>
                    Peer {peer.id}
                    </li>
                ))}
                </ul>
            </p>
            </div>

            {/* List of Peers Across the Network */}
            <div style={{ marginBottom: '10px' }}>
            <h3>Peers Across Network</h3>
            <ul>
                {Array.from({ length: 5 }, (_, i) => ({
                id: i + 2,
                hash: `network-hash-${i + 1}`,
                })).map(peer => (
                <li key={peer.id}>
                    <a
                    href={`#${peer.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4CAF50', textDecoration: 'none' }}
                    >
                    Peer {peer.id} - Room ID: {peer.hash}
                    </a>
                </li>
                ))}
            </ul>
            </div>

            {/* List of Available Room IDs */}
            <div style={{ marginBottom: '10px' }}>
            <h3>Available Room IDs</h3>
            <ul>
                {/* Display the current room ID first, with " (Joined)" appended */}
                <li style={{ fontWeight: 'bold' }}>
                <a
                    href={`#${currentHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4CAF50', textDecoration: 'none' }}
                >
                    {currentHash} (Joined)
                </a>
                </li>
                {/* Display the remaining room IDs, excluding the current one */}
                {['room1', 'room2', 'room4', 'room5']
                .filter(roomId => roomId !== currentHash)
                .map(roomId => (
                    <li key={roomId}>
                    <a
                        href={`#${roomId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4CAF50', textDecoration: 'none' }}
                    >
                        {roomId}
                    </a>
                    </li>
                ))}
            </ul>
            </div>
            
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
                // fitView

                // PATCHING
                nodes={nodes}
                onNodesChange={handleNodesChange}
                onNodeDragStop={(event, node) => {
                    // Update Automerge when node drag stops
                    if (handle) {
                      handle.change((d) => {
                        const updatedNode = d.nodes.find((n) => n.id === node.id);
                        if (updatedNode) {
                          updatedNode.position = { ...node.position };
                        }
                      });
                    }
                  }}
                edges={edges}
                onEdgesChange={handleEdgesChange}
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

                <Background 
                    id="3"
                    variant={BackgroundVariant.Cross} 
                    color='#0AF' 
                />
                
                {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
                <Controls />
                <MiniMap />
            </ReactFlow>
            </div>
        </div>
   
    );
}

export default ForkingPaths;
