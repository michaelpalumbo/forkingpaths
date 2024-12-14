import dagre from 'cytoscape-dagre';
import * as Tone from "tone";
import { uuidv7 } from "uuidv7";
const ws = new WebSocket('ws://localhost:3000');




const historyGraphWorker = new Worker("./workers/historyGraphWorker.js");
// meta doc
let meta;

// * History Graph
let selectedHistoryNodes = []
let existingHistoryNodeIDs
let historyHighlightedNode = null
let historySequencerHighlightedNode = null
let allowMultiSelect = false;
let allowPan = false
let isDraggingEnabled = false;
let highlightedNode = null
let graphStyle = 'DAG'
let graphLayouts = {
    // https://github.com/dagrejs/dagre/wiki#configuring-the-layout
    DAG: {
        name: 'dagre',
        rankDir: 'BT', // Set the graph direction to top-to-bottom
        nodeSep: 300, // Optional: adjust node separation
        edgeSep: 100, // Optional: adjust edge separation
        rankSep: 50, // Optional: adjust rank separation for vertical spacing,
        fit: false,
        padding: 30
    },
    breadthfirst: {
        name: 'breadthfirst',

        fit: false, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 30, // padding on fit
        circle: false, // put depths in concentric circles if true, put depths top down if false
        grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
        spacingFactor: 1.75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        depthSort: undefined, // a sorting function to order nodes at equal depth. e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        animate: false, // whether to transition the node positions
        animationDuration: 500, // duration of animation in ms if enabled
        animationEasing: undefined, // easing of animation if enabled,
        animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts

    }


}

let docHistoryGraphStyling = {
    nodeColours: {
        connect: "#004cb8",
        disconnect: "#b85c00",
        add: "#00b806",
        remove: "#b8000f",
        move: "#b89000",
        paramUpdate: "#6b00b8",
        clear: "#000000",
        blank_patch: "#ccc"
    }
}

// * History Sequencer
let currentIndex = 0;
let historySequencerWindow;

const transport = Tone.getTransport();


// * INPUTS

let hid = {
    key: {
        cmd: false,
        shift: false,
        o: false,
        v: false,
        s: false
    }
}


document.addEventListener("DOMContentLoaded", function () {

    // todo: send a message to main app to request the latest automerge doc
    // todo: note that it might be necessary to only request this later on in the script...

    //*
    //*
    //* CONFIGURE CYTOSCAPE INSTANCES
    //* 
    //*
    /*
        DOCUMENT HISTORY CYTOSCAPE INSTANCE
    */
    cytoscape.use( dagre );
    const historyDAG_cy = cytoscape({
        container: document.getElementById('docHistory-cy'),
        elements: [],
        zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1., 
        // viewport: {
        //     zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1.
        // },
        boxSelectionEnabled: true,
        selectionType: "additive",
        zoomingEnabled: false,
        
        layout: graphLayouts[graphStyle],  
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)', // based on edit type
                    'label': 'data(label)', // Use the custom label attribute
                    'width': 30,
                    'height': 30,
                    'color': '#000',            // Label text color
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'right',      // Horizontally align label to the left of the node
                    'text-margin-x': 15, // 
                    // 'text-margin-y': 15, // move the label down a little to make space for branch edges
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
                }
            
            },
            {
                selector: 'edge',
                style: {
                    'width': 6,
                    'line-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#ccc',
                    'target-arrow-width': 20, // Size of the target endpoint shape
                    'curve-style': 'bezier' // Use a Bezier curve to help arrows render more clearly

                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#228B22', // Highlight color
                    'border-width': 15,
                    'shape': 'rectangle'
                }
            },
            {
                selector: '.sequencerSelectionBox',
                style: {
                    'border-color': 'blue', // Highlight color
                    'border-width': 4,
                    'shape': 'rectangle',
                    'background-color': 'white',
                    "background-opacity": 0,
                    "width": 50,
                    "height": 'data(height)',
                    "label": '',
                    "z-index": -1

                }
            },
            {
                selector: '.sequencerSelectionBox-handle',
                style: {
                    // 'border-color': 'blue', // Highlight color
                    'border-width': 0,
                    'shape': 'ellipse',
                    'background-color': 'blue',
                    // "background-opacity": 0,
                    "width": '10',
                    "height": '10',
                    "label": '',
                    "z-index": 10

                }
            },
            {
                selector: '.sequencerNode',
                style: {
                    'border-color': '#000000',  // Change to your desired color
                    'border-width': '8px',
                    'border-style': 'solid'


                }
            },
            {
                selector: '.sequencerEdge',
                style: {
                    // 'border-color': 'blue', // Highlight color
                    'line-color': 'blue',
                    "width": '10',
                    'target-arrow-color': 'blue'


                }
            },
        ]
    });


    /*
        SELECTED HISTORY CYTOSCAPE INSTANCE
    */
        const historySequencerCy = cytoscape({
        container: document.getElementById('historySequencerCy'), // Your container element
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'text-margin-y': 0, // Offset label vertically
                    'text-margin-x': 5, // Offset label horizontally
                    'text-halign': 'right', // Center-align text
                    'text-valign': 'center', // Vertically align text
                    'width': 20, // Reduce node width to exclude label
                    'height': 20, // Reduce node height to exclude label
                    'color': '#fff'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 6,
                    'line-color': '#ffffff',
                    'target-arrow-color': '#ffffff',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier' // Optional: Makes edges curved for better visualization

                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#228B22', // Highlight color
                    'border-width': 15,
                    'shape': 'rectangle'
                }
            },
            {
                selector: 'edge.highlighted',
                style: {
                    'line-color': '#FF0000',           // Highlight color
                    'target-arrow-color': '#FF0000',    // Highlight arrow color
                    'source-arrow-color': '#FF0000',
                    'width': 10,
                    
                }
            },
        ],
        layout: {
            name: 'circle'
        }
    });

    // *
    // *
    // * COMMUNICATIONS WITH MAIN APP
    // * 
    // *
    window.opener?.postMessage({ cmd: 'historySequencerReady' }, '*');

    // Listen for messages from the main app
    window.addEventListener('message', (event) => {
        if (event.data && event.data.appID === 'forkingPathsMain') {
            // console.log(event.data)
            switch (event.data.cmd){
                case 'reDrawHistoryGraph':
                    
                    meta = event.data.data
                    // reDrawHistoryGraph(meta)
                            // Send the elements to the server for rendering
                    const update = JSON.stringify({
                        cmd: 'updateGraph',
                        meta: meta,
                        // existingHistoryNodeIDs: existingHistoryNodeIDs,
                        docHistoryGraphStyling: docHistoryGraphStyling
                    })
                    
                    ws.send(update);

                    
                    bpmValue.textContent = meta.sequencer.bpm; // Display the current BPM
                    transport.bpm.value = meta.sequencer.bpm; // Dynamically update the BPM
                        
                break
                case 'panToBranch':
                    panToBranch(event.data.data)
                break

                // commented out because this is now handled by the main app
                // case 'clearHistoryGraph':
                //     ws.send(JSON.stringify({
                //         cmd: 'clearHistoryGraph'
                //     }))
 
                // break
                default: console.log('no switch case for message:', event.data)
            }
        }

        // if (event.data.cmd === 'updateGraph') {
        //     const graphData = event.data.data;
        //     updateGraph(graphData);
        // }
    });






    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        // ws.send('Hello, server!');
    };
    
    ws.onmessage = (event) => {
        // console.log('Message from server:', event.data);
    
        const msg = JSON.parse(event.data)
        // console.log(msg)
        historyDAG_cy.json(msg)
        historyDAG_cy.panBy({x: 25, y: 25 })
        highlightNode(historyDAG_cy.nodes().last())
        
    };
    
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };


    // *
    // *
    // * UI UPDATES
    // * 
    // *

    // *
    // * HISTORY GRAPH

    // do this once:
    historyDAG_cy.panBy({x: 25, y: 0 })

    function reDrawHistoryGraph(){
        

        
        
        
        // if (!existingHistoryNodeIDs || existingHistoryNodeIDs.size === 0){
        //     existingHistoryNodeIDs = new Set(historyDAG_cy.nodes().map(node => node.id()));
        // }
        // console.log(existingHistoryNodeIDs, historyDAG_cy.nodes().toArray)

        // historyGraphWorker.onmessage = (event) => {

        //     const { nodes, edges, historyNodes } = event.data;
            
        //     if(nodes.length > 0){
        //         historyDAG_cy.add(nodes);

        //     }
        //     if(edges.length > 0){
        //         historyDAG_cy.add(edges);

        //     }
        //     existingHistoryNodeIDs = historyNodes

        //     // Refresh graph layout
        //     historyDAG_cy.layout(graphLayouts[graphStyle]).run();
            
        //     highlightNode(historyDAG_cy.nodes().last())

        //     // update the current history node ids for the next time we run this function
        //     // existingHistoryNodeIDs = new Set(cy.nodes().map(node => node.id()));
        // };
        
        // Send data to the worker to get any position or parameter updates
        // historyGraphWorker.postMessage({ meta, existingHistoryNodeIDs, docHistoryGraphStyling });      
    }


    
/*

        HISTORY SEQUENCER 

    */

    // history sequencer
    function historySequencerController(cmd, data){
        switch(cmd){
            case 'clear':
                selectedHistoryNodes.length = 0
                historyDAG_cy.edges().removeClass("sequencerEdge");
            break

            case 'removeSteps':
                //
                let nodeIndex = historySequencerCy.nodes().indexOf(data);
                let historyDAG_cyHash = data.data().id.split(' ')[0]
                // selectedHistoryNodes = removeLastInstanceById(selectedHistoryNodes, historyDAG_cyHash)
                selectedHistoryNodes.splice(nodeIndex, 1);
                let connectedNodes = data.connectedEdges().connectedNodes().difference(data);
                // remove node from historySequencerCy
                if (connectedNodes.length === 2) {
                    const [nodeB, nodeA] = connectedNodes;
            
                    // Check if an edge already exists between these two nodes
                    const existingEdge = historySequencerCy.edges().filter(edge =>
                        edge.visible() && // Only consider visible edges
                        (edge.source().id() === nodeA.id() && edge.target().id() === nodeB.id()) ||
                        (edge.source().id() === nodeB.id() && edge.target().id() === nodeA.id())
                    );
            
                    if (existingEdge.empty()) {
                        // Add a new edge connecting the two nodes
                        historySequencerCy.add({
                            group: 'edges',
                            data: {
                                id: `edge-${nodeA.id()}-${nodeB.id()}`,
                                source: nodeA.id(),
                                target: nodeB.id()
                            }
                        });
                    } else {
                        // console.log(`An edge already exists between ${nodeA.id()} and ${nodeB.id()}`);
                    }
                } else {
                    console.log('The clicked node does not have exactly 2 connected nodes.');
                }

                historySequencerCy.remove(data)
                // now close the circle
                historySequencerCy.edges().forEach(edge => {
                    if (!edge.source().visible() || !edge.target().visible()) {
                        edge.remove(); // Remove edges connected to hidden nodes
                    }
                });
  

                // if node no longer is in sequence, remove its border
                if (!selectedHistoryNodes.some(item => item.id === historyDAG_cyHash)){
                    let historyDAG_cyNode = historyDAG_cy.getElementById(historyDAG_cyHash)
                    historyDAG_cyNode.removeClass("sequencerNode");
                }
                
            break
    

        }
    }

     // Function to add a new node
     function modifyHistorySequencerCy(cmd, data) {

        switch(cmd){
            case 'add':
                //
                selectedHistoryNodes.push({
                    data: data.data(),
                    cyNode: data,
                    id: data.data().id
                })
                data.addClass("sequencerNode");


                let node = data
                const nodeId = `${node.data().id} ${uuidv7()}`// first string is the history hash, 2nd, is just for our sequencer
                const nodes = historySequencerCy.nodes();

                // Add the new node
                historySequencerCy.add({
                    group: 'nodes',
                    data: { id: nodeId , label: node.data().label.split('_')[0], color: docHistoryGraphStyling.nodeColours[node.data().label.split(' ')[0]], historyNode: node}
                });

                // If there's a previous node, connect it to the new node
                if (nodes.length > 0) {
                    const lastNode = nodes[nodes.length - 1];
                    historySequencerCy.add({
                        group: 'edges',
                        data: {
                            id: `${lastNode.id()}-to-${nodeId}`,
                            source: lastNode.id(),
                            target: nodeId
                        }
                    });
                }

                // Remove any existing connection to the first node
                if (nodes.length >= 2) {
                    const firstNode = nodes[0];
                    historySequencerCy.edges().forEach(edge => {
                        if (edge.data('target') === firstNode.id()) {
                            edge.remove();
                        }
                    });

                    // Add a new connection from the last node to the first node
                    historySequencerCy.add({
                        group: 'edges',
                        data: {
                            id: `${nodeId}-to-${firstNode.id()}`,
                            source: nodeId,
                            target: firstNode.id()
                        }
                    });
                }
            break

            case 'intersectingEdge':

            
                // Check for existing edges to prevent duplicates
                const existingEdgesBetweenSourceAndDragged = historySequencerCy.edges().filter(e =>
                    (e.source().id() === data.sourceNode.id() && e.target().id() === data.draggedNode.id()) ||
                    (e.source().id() === data.draggedNode.id() && e.target().id() === data.sourceNode.id())
                );

                const existingEdgesBetweenDraggedAndTarget = historySequencerCy.edges().filter(e =>
                    (e.source().id() === data.targetNode.id() && e.target().id() === data.draggedNode.id()) ||
                    (e.source().id() === data.draggedNode.id() && e.target().id() === data.targetNode.id())
                );

                // connect 
                if (existingEdgesBetweenSourceAndDragged.empty()) {
                    historySequencerCy.add({
                        group: 'edges',
                        data: { source: data.draggedNode.id(), target: data.sourceNode.id() }
                    });
                    
                }

                if (existingEdgesBetweenDraggedAndTarget.empty()) {
                    historySequencerCy.add({
                        group: 'edges',
                        data: { source: data.draggedNode.id(), target: data.targetNode.id() }
                    });
                } 

            break

        }
        
        // Reapply the circle layout
        historySequencerCy.layout({ name: 'circle' }).run();
    }

    // Set the initial BPM
    transport.bpm.value = 120;
    let currentNode = null
    // Schedule the sequencer loop
    transport.scheduleRepeat((time) => {
        let sequencerNodes = historySequencerCy.nodes()
        if (meta && !hid.key.shift && sequencerNodes.length > 0) {
            let node


            // let connectedNodes = node.connectedEdges().connectedNodes().difference(node);

            // console.log(connectedNodes[Math.floor(Math.random() * connectedNodes.length)].data())

            if (meta.sequencer.traversalMode === 'Sequential') {
                node = sequencerNodes.eq(currentIndex)
            } else {
                node = sequencerNodes[Math.floor(Math.random() * sequencerNodes.length)]
            }

            if (node && node.data().historyNode) {
                // synth.triggerAttackRelease("C4", "8n", time); // Example note
                // loadVersion(node.data().historyNode.data().id, node.data().historyNode.data().branch); // Your custom logic
                window.opener?.postMessage({ cmd: 'loadVersion', data: { hash: node.data().historyNode.data().id, branch: node.data().historyNode.data().branch} }, '*');

                highlightNode(node.data().historyNode); // Your custom logic
                highlightSequencerNode(node)
            }
            currentNode = node
            // Move to the next step
            currentIndex = (currentIndex + 1) % sequencerNodes.length;
        }
    }, "8n"); // Repeat every eighth note



    // *
    // *
    // * EVENT HANDLERS
    // * 
    // *

    // cmd + scroll = scroll vertically through history graph
    document.addEventListener('wheel', function(event) {
        if(allowPan){
            historyDAG_cy.panBy({
                x: 0,
                y: event.deltaY 
                });
        }
    });

    historyDAG_cy.on('tap', 'node', (event) => {
        console.log(hid.key.shift)
        if(hid.key.shift){
            modifyHistorySequencerCy('add', event.target)

        } else {
            historySequencerController('clear')

            // loadVersion(event.target.data().id, event.target.data().branch)
            window.opener?.postMessage({ cmd: 'loadVersion', data: {hash: event.target.data().id, branch: event.target.data().branch} }, '*');
            highlightNode(event.target)
        }

    })

    // Remove the flag when the graph window is closed
    window.addEventListener('beforeunload', () => {
        if (historySequencerWindow) {
            historySequencerWindow.close();
        }
        localStorage.removeItem('historySequencerWindowOpen');
        console.log('history window closed')
    });


        // Track when the 'e' key is pressed and released
        window.addEventListener('keydown', (event) => {
            if (event.key === 'o' || event.key === 'v' || event.key === 's') {
                hid.key[event.key] = true
            }
            // if (event.key === 'e') {
            //     isDraggingEnabled = true;
            // }
            if (event.key === 'z') {
                historyDAG_cy.zoomingEnabled(true)
            }
            if (event.key === 'Meta' || event.key === 'Control') {
                allowMultiSelect = false
                allowPan = true
                historyDAG_cy.userZoomingEnabled(false)
                hid.key.cmd = true
    
            }
            if (event.key === 'Shift') {
                hid.key.shift = true
            }
        });
    
        window.addEventListener('keyup', (event) => {
            if (event.key === 'o' || event.key === 'v' || event.key === 's') {
                hid.key[event.key] = false
            }
            // if (event.key === 'e') {
            //     isDraggingEnabled = false;
            // }
            if (event.key === 'Meta' || event.key === 'Control') {
                allowMultiSelect = false
                historyBoxSelect = true
                historyDAG_cy.userZoomingEnabled(true)
                hid.key.cmd = false
                // Hide a node by setting display to none
    
            }
            if (event.key === 'z') {
                historyDAG_cy.zoomingEnabled(false)
            }
            if (event.key === 'Shift') {
                hid.key.shift = false
            }
        });

        // right-click tap
    historyDAG_cy.on('cxttap', 'node', (event) => {
        const node = event.target; // The node that was right-clicked
        if(hid.key.shift){
            historySequencerController('removeSteps', event.target)
        }
        
    });

    // right-click tap
    historySequencerCy.on('cxttap', 'node', (event) => {
        const node = event.target; // The node that was right-clicked
        historySequencerController('removeSteps', event.target)
        
    });


    // BPM Slider Control
    const bpmSlider = document.getElementById("bpmSlider");
    // Listen for slider changes
    bpmSlider.addEventListener('input', (event) => {
        let bpm = parseInt(event.target.value, 10)

        const update = JSON.stringify({
            cmd: 'updateBPM',
            bpm: bpm,
            // existingHistoryNodeIDs: existingHistoryNodeIDs,
            // docHistoryGraphStyling: docHistoryGraphStyling
        })
        window.opener?.postMessage(update, '*')
        

        bpmValue.textContent = bpm; // Display the current BPM
        transport.bpm.value = bpm; // Dynamically update the BPM

    });

    // Start/Stop Control
    const startStopButton = document.getElementById("startStopButton");
    let isPlaying = false;

    startStopButton.addEventListener("click", async () => {
        if (isPlaying) {
            transport.stop();
            startStopButton.textContent = "Start Sequencer";
        } else {
            await Tone.start(); // Required to start audio in modern browsers
            transport.start();
            startStopButton.textContent = "Stop Sequencer";
        }
        isPlaying = !isPlaying;
    });


    historySequencerCy.on('position', 'node', (event) => {
        const draggedNode = event.target; // The node being dragged
        const draggedPosition = draggedNode.position(); // Current position of the dragged node
    
        // Reset edge highlights
        historySequencerCy.edges().removeClass('edge.highlighted');
    
        // Find the edge the node is intersecting with
        const intersectingEdge = historySequencerCy.edges().filter((edge) => {
            const sourceNode = edge.source();
            const targetNode = edge.target();
    
            // Skip edges connected to the dragged node itself
            if (sourceNode.id() === draggedNode.id() || targetNode.id() === draggedNode.id()) {
                return false;
            }   
            const sourcePos = sourceNode.position();
            const targetPos = targetNode.position();
    
            // Check if the node intersects with the edge
            return isNodeIntersectingEdge(draggedPosition, sourcePos, targetPos);
        });
    
        // Highlight the intersecting edge
        if (intersectingEdge.length > 0) {
            intersectingEdge.addClass('edge.highlighted');
        }
    });
    
    historySequencerCy.on('dragfree', 'node', (event) => {
        const draggedNode = event.target; // The node being dragged
        const draggedPosition = draggedNode.position();
    
        // Find the intersecting edge (same logic as before)
        const intersectingEdge = historySequencerCy.edges().filter((edge) => {
            const sourceNode = edge.source();
            const targetNode = edge.target();
    
            // Skip edges connected to the dragged node itself
            if (sourceNode.id() === draggedNode.id() || targetNode.id() === draggedNode.id()) {
                return false;
            }
            const sourcePos = sourceNode.position();
            const targetPos = targetNode.position();
    
            return isNodeIntersectingEdge(draggedPosition, sourcePos, targetPos);
        });
    
        if (intersectingEdge.length > 0) {

          

            

            const edge = intersectingEdge[0];
            const sourceNode = edge.source();
            const targetNode = edge.target();

            modifyHistorySequencerCy({
                cmd:'intersectEdge',
                edge: intersectingEdge[0],
                sourceNode: sourceNode,
                targetNode: targetNode,
                draggedNode: draggedNode
            })
    
            // Remove the original edge
            // edge.remove();
            // Check for existing edges to prevent duplicates
            const existingEdgesBetweenSourceAndDragged = historySequencerCy.edges().filter(e =>
                (e.source().id() === sourceNode.id() && e.target().id() === draggedNode.id()) ||
                (e.source().id() === draggedNode.id() && e.target().id() === sourceNode.id())
            );

            const existingEdgesBetweenDraggedAndTarget = historySequencerCy.edges().filter(e =>
                (e.source().id() === targetNode.id() && e.target().id() === draggedNode.id()) ||
                (e.source().id() === draggedNode.id() && e.target().id() === targetNode.id())
            );

            // connect 
            if (existingEdgesBetweenSourceAndDragged.empty()) {
                historySequencerCy.add({
                    group: 'edges',
                    data: { source: draggedNode.id(), target: sourceNode.id() }
                });
                
            }
    
            if (existingEdgesBetweenDraggedAndTarget.empty()) {
                historySequencerCy.add({
                    group: 'edges',
                    data: { source: draggedNode.id(), target: targetNode.id() }
                });
            } 
        }
    });
    

    // Listen for the select event on nodes
    let historyBoxSelect = true // this is necessary because this event listener fires many times otherwise
    historyDAG_cy.on("boxselect", "node", () => {
        if(historyBoxSelect){
            historyBoxSelect = false

            let selected = historyDAG_cy.$("node:selected"); // Get all selected nodes
            
            
            historyDAG_cy.edges().removeClass("sequencerEdge");

            if (selected.length > 1) {
                // Find edges connecting selected nodes
                /* 
                const connectingEdges = selected.connectedEdges().filter(edge => {
                    const source = edge.source();
                    const target = edge.target();
                    return selected.includes(source) && selected.includes(target);
                });
                
                // Apply a custom style to these edges
                connectingEdges.addClass("sequencerEdge");
                */
                selected.addClass("sequencerNode");
                // Update selectedHistoryNodes to match the current selection   
                selectedHistoryNodes.length = 0

                selected.forEach((node) => {
                    let n = {
                        data: node.data(),
                        cyNode: node,
                        id: node.data().id
                    }
                    selectedHistoryNodes.push(n)
                    modifyHistorySequencerCy('add', node)
                });

            }

            // Reset the historyBoxSelect flag after a short delay
            setTimeout(() => {
                historyDAG_cy.$('node:selected').unselect();
                historyBoxSelect = true;
            }, 50); // Adjust the delay as needed to debounce the event
        }
    });
    // *
    // *
    // * UTILITY FUNCTIONS
    // * 
    // *

    function highlightNode(target){

        if(historyHighlightedNode){
            historyHighlightedNode.removeClass('highlighted');
            historyHighlightedNode = target
            target.addClass('highlighted');
        }
        else {
            historyHighlightedNode = target;
            target.addClass('highlighted');
        }
    }

    function highlightSequencerNode(target){

        if(historySequencerHighlightedNode){
            historySequencerHighlightedNode.removeClass('highlighted');
            historySequencerHighlightedNode = target
            target.addClass('highlighted');
        }
        else {
            historySequencerHighlightedNode = target;
            target.addClass('highlighted');
        }
    }

    // pan to new/selected branch
    function panToBranch(hash) {
        const node = historyDAG_cy.getElementById(hash)
        if(!meta.userSettings.focusNewBranch){
            return
        }
        // const node = y.getElementById(nodeId); // Select the node by its ID

        if (node && node.length > 0) { // Check if the node exists
            const position = node.position(); // Get the node's position

            // Pan to the node
            historyDAG_cy.pan({
                x: -position.x + historyDAG_cy.width(), // Adjust for viewport center
                // y: -position.y + historyDAG_cy.height() / 1.5
            });
        } else {
            // console.log(`Node with ID ${nodeId} not found`);
        }
    }
    
    // Utility: Check if a node intersects an edge
    function isNodeIntersectingEdge(nodePos, sourcePos, targetPos) {
        // todo: the text label of the dragged node and other dragged nodes are interfering with the dragged node intersecting an edge
        // todo: the text label is part of the entire node's bounding box, so instead we could set the intersection boundaries of the node
        // todo: ... to just within the node itself, perhaps a square within the node.  
        const distance = pointLineDistance(nodePos, sourcePos, targetPos);
    
        // Check if the point is near the line segment
        const isCloseEnough = distance < 10; // Adjust threshold as needed
    
        // Ensure the intersection lies on the edge (between source and target)
        const withinBounds =
            Math.min(sourcePos.x, targetPos.x) <= nodePos.x &&
            nodePos.x <= Math.max(sourcePos.x, targetPos.x) &&
            Math.min(sourcePos.y, targetPos.y) <= nodePos.y &&
            nodePos.y <= Math.max(sourcePos.y, targetPos.y);
    
        return isCloseEnough && withinBounds;
    }

    // Utility: Calculate the distance of a point to a line segment
    function pointLineDistance(point, lineStart, lineEnd) {
        const x0 = point.x, y0 = point.y;
        const x1 = lineStart.x, y1 = lineStart.y;
        const x2 = lineEnd.x, y2 = lineEnd.y;
    
        const numerator = Math.abs(
            (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1
        );
        const denominator = Math.sqrt(
            Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)
        );
    
        return numerator / denominator;
    }

    // console.log('History graph ready to receive updates.');


    
})



