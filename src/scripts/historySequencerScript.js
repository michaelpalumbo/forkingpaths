import dagre from 'cytoscape-dagre';
import * as Tone from "tone";
import { uuidv7 } from "uuidv7";
const ws = new WebSocket('ws://localhost:3000');




const historyGraphWorker = new Worker("./workers/historyGraphWorker.js");

// App settings
let appSettings = {}
if(!localStorage.appSettings){
    let settings = {
        sequencer: {
            stepLengthFunction: 'fixed'
        }
    }
    localStorage.setItem('appSettings', JSON.stringify(settings))

    
}else {
    
    appSettings = localStorage.getItem('appSettings')

}

let selectedModule = null
// meta doc
let meta;

let selectedNode= null
let storedSequencerTable = null
// * History Graph
let selectedHistoryNodes = []
let existingHistoryNodeIDs
let historyHighlightedNode = null
let historySequencerHighlightedNode = null
let allowMultiSelect = false;
let allowPan = true
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

    // UI
    // Get the select element by its ID
    const stepLengthFunctionSelect = document.getElementById("stepLengthFunction");
    const sequenceOrderSelect = document.getElementById("sequenceOrder");
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

        // optimization settings:
        hideEdgesOnViewport: true,
        pixelRatio: 1,
        textureOnViewport: true,


        elements: [],
        zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1., 
        // viewport: {
        //     zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1.
        // },
        boxSelectionEnabled: true,
        selectionType: "additive",
        zoomingEnabled: false,

        panningEnabled: true,
        userPanningEnabled: true, // Allows user to pan with scroll gestures

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
                selector: 'node.intersected',
                style: {
                    'border-color': 'black', // Highlight color
                    'border-width': 7,
                    'shape': 'triangle'
                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#228B22', // Highlight color
                    'border-width': 12,
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

    function sendToMainApp(msg){
        window.opener?.postMessage(msg, '*');
    }
    

    // Listen for messages from the main app
    window.addEventListener('message', (event) => {
        if (event.data && event.data.appID === 'forkingPathsMain') {
            // console.log(event.data)
            switch (event.data.cmd){
                case 'reDrawHistoryGraph':
                    console.log('redraw')
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

                    // sequencer settings:
                    stepLengthFunctionSelect.value = meta.sequencer.stepLengthFunction || 'fixed'
                    setStepLengthFunction(stepLengthFunctionSelect.value)

                    // createSequencerTable(meta.sequencer.tableData)

                    bpmValue.textContent = meta.sequencer.bpm; // Display the current BPM
                    transport.bpm.value = meta.sequencer.bpm; // Dynamically update the BPM
                        
                break
                case 'panToBranch':
                    panToBranch(event.data.data)
                break

                case 'newSession':
                    historySequencerCy.elements().remove();
                    createSequencerTable()
                break

                case 'sequencerUpdate': 

                break

                case 'selectedNode':
                    console.warn('node selection for history analysis not setup yet, see section associated with this line')

                    if(event.data.data === 'unselected'){
                        // clear global variable
                        // selectedModule = null
                        // remove results in history analysis 

                        // remove it as an option in the selectmenu
                        modifyHistoryAnalysisMenu('removeSelectedModule')
                    }else {
                        // store selected node in global variable
                        // selectedModule = event.data.data
                        // set it as an option in the selectmenu
                        modifyHistoryAnalysisMenu('setSelectedModule', event.data.data)
                        // when user selects it, retrieve all changes related to that node
                    }

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



    function loadVersion(nodeID, branch){
        // Perform your action with the step data
        console.log('loadVersion called', new Date())
        sendToMainApp(
            {
                cmd: "loadVersion",
                data: { hash: nodeID, branch: branch },
            }
        );
    }


    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        // ws.send('Hello, server!');
        sendToMainApp({
            cmd: 'historySequencerReady'
        })

    };
    
    ws.onmessage = (event) => {
        // console.log('Message from server:', event.data);
    
        const msg = JSON.parse(event.data)
        // console.log(msg)
        historyDAG_cy.json(msg)
        historyDAG_cy.panBy({x: 25, y: 25 })

        const latestNode = historyDAG_cy.nodes().last()
        highlightNode(latestNode)
        panToBranch(latestNode)
        
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
    let stepLength = '4n'

    let currentStepIndex = 0; // Tracks the current step in the table

    currentStepIndex = 0
    const loop = new Tone.Loop(function(time){
        // Get the current step
        const currentStep = storedSequencerTable[currentStepIndex];
        // set interval based on step length
        loop.interval  = currentStep.stepLength

        // Highlight the current step in the table
        const tableRows = document.querySelectorAll("#dynamicTableBody tr");
        tableRows.forEach((row) => row.classList.remove("is-selected"));
        const targetRow = tableRows[currentStepIndex];
        if (targetRow) targetRow.classList.add("is-selected");

        currentStepIndex = (currentStepIndex + 1) % storedSequencerTable.length;

        // if step is active, send request to load the version
        if (currentStep.status == "Active"){
            // load the version
            loadVersion(currentStep.node.id, currentStep.node.branch)
        }
    }, "4n")



    // *
    // *
    // * EVENT HANDLERS
    // * 
    // *

    // Track the current node being dragged and any node it's intersecting
    let draggedNode = null;
    let intersectedNode = null;

    

    // Event: Start dragging
    historyDAG_cy.on('grab', 'node', (e) => {
        draggedNode = e.target;
        intersectedNode = null; // Reset intersected node
    });

    // Event: Dragging
    historyDAG_cy.on('drag', 'node', (e) => {
        const currentNode = e.target;

        if (draggedNode !== currentNode) return;

        let foundIntersection = false;

        historyDAG_cy.nodes().not(currentNode).forEach((otherNode) => {
            if (isIntersecting(currentNode, otherNode)) {
                if (intersectedNode !== otherNode) {
                    // Highlight the newly intersected node
                    if (intersectedNode) removeIntersectedHighlight(intersectedNode);
                    highlightIntersectedNode(otherNode);
                    intersectedNode = otherNode;
                }
                foundIntersection = true;
            }
        });

        if (!foundIntersection && intersectedNode) {
            // Remove highlight if no intersection
            removeIntersectedHighlight(intersectedNode);
            intersectedNode = null;
        }
    });

    // Event: Dragging stopped
    historyDAG_cy.on('free', 'node', (e) => {
        const releasedNode = e.target;

        if (draggedNode === releasedNode && intersectedNode) {
            const node1 = draggedNode.data()
            const node2 = intersectedNode.data()
            sendToMainApp({
                cmd: 'merge',
                nodes: [node1, node2]
            })
            // Perform actions for dropping on intersected node
            removeIntersectedHighlight(intersectedNode);
        }

        // Clean up
        draggedNode = null;
        intersectedNode = null;
    });

    // Listen for changes to the radio buttons
    const radioButtons = document.querySelectorAll('input[name="traversalMode"]');
    console.warn('need to setup the sequencer meta control see the associated code')
    radioButtons.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            meta = Automerge.change(meta, (meta) =>{
                meta.sequencer.traversalMode = event.target.value  
            })
        });
    });
    
    // cmd + scroll = scroll vertically through history graph
    document.addEventListener('wheel', function(event) {
        if(allowPan){

            if(!willExceedPanLimits(event.deltaX, event.deltaY)){
                historyDAG_cy.panBy({
                    x: event.deltaX,
                    y: event.deltaY 
                });
            }
            //  else {
            //     historyDAG_cy.panBy({
            //         x: event.deltaX,
            //         y: event.deltaY 
            //     });
            // }

        }
    });

    historyDAG_cy.on('tap', 'node', (event) => {
        if(hid.key.shift){
            modifyHistorySequencerCy('add', event.target)

        } else {
            historySequencerController('clear')

            // loadVersion(event.target.data().id, event.target.data().branch)
            loadVersion(event.target.data().id, event.target.data().branch)
            highlightNode(event.target)

            selectedNode = event.target.data()
        }

    })

    // Remove the flag when the graph window is closed
    window.addEventListener('beforeunload', () => {
        if (historySequencerWindow) {
            historySequencerWindow.close();
        }
        localStorage.removeItem('historySequencerWindowOpen');

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
                // allowPan = true
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
        console.log(node)
        
    });


    // BPM Slider Control
    const bpmSlider = document.getElementById("bpmSlider");
    // Listen for slider changes
    bpmSlider.addEventListener('input', (event) => {
        let bpm = parseInt(event.target.value, 10)

        const update = {
            cmd: 'updateSequencer',
            setting: 'bpm',
            data: bpm,
            // existingHistoryNodeIDs: existingHistoryNodeIDs,
            // docHistoryGraphStyling: docHistoryGraphStyling
        }
        sendToMainApp(update)


        bpmValue.textContent = bpm; // Display the current BPM
        transport.bpm.value = bpm; // Dynamically update the BPM

    });

    // Start/Stop Control
    const startStopButton = document.getElementById("startStopButton");
    let isPlaying = false;

    startStopButton.addEventListener("click", async () => {
        if (isPlaying) {
            transport.stop();
            // sequence.stop(0);
            loop.stop()
            startStopButton.textContent = "Start Sequencer";
        } else {
            await Tone.start(); // Required to start audio in modern browsers
            transport.start();
            // sequence.start(0);
            loop.start(0)
            startStopButton.textContent = "Stop Sequencer";
        }
        isPlaying = !isPlaying;
    });

    // Clear sequencer button
    const clearSequencerButton = document.getElementById("clearSequencerButton");


    clearSequencerButton.addEventListener("click", async () => {
        // stop the sequencer
        if (isPlaying) {
            transport.stop();
            startStopButton.textContent = "Start Sequencer";
            isPlaying = !isPlaying;
        } 
        // clear sequencer steps
        historySequencerCy.elements().remove();        
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
    // * HISTORY GRAPH ANALYSIS
    // * 
    // *
    // Add an event listener for the 'change' event
    document.getElementById("getHistoryAnalysisMenu").addEventListener("change", (event) => {
        // console.log(localStorage.getItem(appSettings.sequencer.stepLengthFunction)
        const selected = event.target.value; // Get the selected option's value

        switch(selected){

            case 'getLeaves':
                // Filter nodes with no outgoing edges
                const leaves = historyDAG_cy.nodes().filter(node => node.outgoers('edge').length === 0);
                const leafNodes = leaves.map(node => node.data());

                populateAnalysisNodeList(leafNodes, 'Leaf Nodes')
            break

            case 'paramUpdate':
                populateAnalysisNodeList(historyDAG_cy.nodes(`[label *= "paramUpdate"]`).map((node) => node.data()), 'All Param Changes')

            break
            case 'getCables':
                populateAnalysisNodeList(historyDAG_cy.nodes(`[label *= "connect"]`).map((node) => node.data()), 'All Cable Changes')
            break

            case 'getMerges':
                console.warn('getMerges not setup yet')
            break

            case 'getSelectedModule':
                const option = document.getElementById("selectedModuleOption")

                console.log(option.text)
                const matchingChanges = historyDAG_cy.nodes().filter((node) => {
                    const parentString = node.data().parents; // Access the 'parent' field in data
                    console.log(parentString)
                    return parentString.includes(option.text);
                }).map((node) => node.data())
                console.log(matchingChanges)
                // // console.log(historyDAG_cy.nodes().map((node) => node.data()))
                // console.log(historyDAG_cy.nodes().filter((node) => {
                //     const parentString = node.data('parents'); // Access the 'parent' field in data
                    
                //     return Array.isArray(parentArray) && parentArray.includes(option.text);
                // }).map((node) => node.data()))
                populateAnalysisNodeList(matchingChanges, option.text.split('_')[0] + '_' + option.text.split('_')[1])
            break

            default: console.warn('no switch case exists for analysis type of ', selected)
        }

        
    });

    // function to modify selectmenu
    function modifyHistoryAnalysisMenu(cmd, data){
        switch(cmd){

            case 'setSelectedModule':
                const menu = document.getElementById("getHistoryAnalysisMenu")
                if(!document.getElementById("selectedModuleOption")){
                    // Create a new option element
                    let newOption = document.createElement('option');
                    // Set the text and value of the new option
                    newOption.text = data
                    newOption.value = "getSelectedModule";
                    newOption.id = 'selectedModuleOption'
                    // Add the new option to the select menu
                    menu.add(newOption);
                } else {
                    // retrieve option element
                    let updateOption = document.getElementById('selectedModuleOption');
                    // Set the text and value of the new option
                    updateOption.text = data;
                    updateOption.value = "getSelectedModule";
                    updateOption.id = 'selectedModuleOption'
                    // Add the new option to the select menu
                    // menu.add(updateOption);
                }
            break;
            case 'removeSelectedModule':
                document.getElementById('selectedModuleOption').remove()
            break
        }
    }
    // document.getElementById("getLeavesBtn").addEventListener("click", () => {
    //     // Filter nodes with no outgoing edges
    //     const leaves = historyDAG_cy.nodes().filter(node => node.outgoers('edge').length === 0);
    //     const leafNodes = leaves.map(node => node.data());

    //     populateAnalysisNodeList(leafNodes, 'Leaf Nodes')
    // });

    // document.getElementById("dijkstraBtn").addEventListener("click", () => {
    //     const sourceNodeID = topologicalSort(historyDAG_cy)[0].data().id
    //     console.log(sourceNodeID)
    //     const dijkstra = historyDAG_cy.elements().dijkstra({
    //         root: historyDAG_cy.$(`#${sourceNodeID}`),
    //         directed: true
    //     });
    //     console.log("Dijkstra's Algorithm Results:", dijkstra);
    // });

    // document.getElementById("topologicalSortBtn").addEventListener("click", () => {

    //     const sortedNodes = topologicalSort(historyDAG_cy);
    //     console.log("Topologically Sorted Nodes:", sortedNodes);
    // });

    // document.getElementById("dependenciesBtn").addEventListener("click", () => {
    //     const selectedNode = historyDAG_cy.$("node:selected");
    //     const dependencies = selectedNode.outgoers("node");
    //     console.log("Dependencies:", dependencies);
    // });

    // document.getElementById("prerequisitesBtn").addEventListener("click", () => {
    //     const selectedNode = historyDAG_cy.$("node:selected");
    //     const prerequisites = selectedNode.incomers("node");
    //     console.log("Prerequisites:", prerequisites);
    // });

    // document.getElementById("connectedComponentsBtn").addEventListener("click", () => {
    //     const components = historyDAG_cy.elements().connectedComponents();
    //     console.log("Connected Components:", components);
    // });

    // document.getElementById("bfsBtn").addEventListener("click", () => {
    //     const bfs = historyDAG_cy.elements().bfs({
    //         roots: historyDAG_cy.$("#sourceNodeID"),
    //         directed: true
    //     });
    //     console.log("Breadth-First Search Path:", bfs.path);
    // });

    // document.getElementById("dfsBtn").addEventListener("click", () => {
    //     const dfs = historyDAG_cy.elements().dfs({
    //         roots: historyDAG_cy.$("#sourceNodeID"),
    //         directed: true
    //     });
    //     console.log("Depth-First Search Path:", dfs.path);
    // });

    // document.getElementById("pageRankBtn").addEventListener("click", () => {
    //     const pageRank = historyDAG_cy.elements().pageRank();
    //     historyDAG_cy.nodes().forEach(node => {
    //         console.log(`PageRank for ${node.id()}:`, pageRank.rank(node));
    //     });
    // });

    // document.getElementById("closenessCentralityBtn").addEventListener("click", () => {
    //     const closeness = historyDAG_cy.elements().closenessCentralityNormalized();
    //     historyDAG_cy.nodes().forEach(node => {
    //         console.log(`Closeness Centrality for ${node.id()}:`, closeness.closeness(node));
    //     });
    // });

    const listElement = document.getElementById("analysisNodeList");

    // Add a single click event listener to the parent <ul>
    listElement.addEventListener("click", (event) => {
        const clickedItem = event.target;
        if (clickedItem.tagName === "LI") { // Ensure the target is a list item
            // Remove highlight from all items
            listElement.querySelectorAll(".list-item").forEach(item => item.classList.remove("is-active"));

            // Highlight the clicked item
            clickedItem.classList.add("is-active");
            selectedNode = {
                label: clickedItem.dataset.label, 
                id: clickedItem.dataset.id,
                branch: clickedItem.dataset.branch
            }

            loadVersion(clickedItem.dataset.id, clickedItem.dataset.branch)
        }
    });
    const titleElement = document.getElementById("analysisResultTitle");

    function populateAnalysisNodeList(nodes, group) {
        
        titleElement.textContent = group; // Update the text content

        
        listElement.innerHTML = ""; // Clear any existing content
    
        // Populate the list with node IDs
        nodes.forEach(node => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-item"); // Optional Bulma class
            listItem.textContent = node.label; // Add the node ID as the content
            listItem.dataset.label = node.label
            listItem.dataset.id = node.id
            listItem.dataset.branch = node.branch
            listElement.appendChild(listItem);
        });
    }



    // SEQUENCER


    
    // Add an event listener for the 'change' event
    sequenceOrderSelect.addEventListener("change", (event) => {
        // console.log(localStorage.getItem(appSettings.sequencer.stepLengthFunction)
        const selectedValue = event.target.value; // Get the selected option's value
        setSequenceOrder(selectedValue)
        const update = {
            cmd: 'updateSequencer',
            setting: 'sequenceOrder',
            data: selectedValue,
        }
        sendToMainApp(update)
    });

    function setSequenceOrder(order){
        switch(order){
            // case 'entry':

            // break
            default: console.warn('nothing is setup for changing the order of the sequencer rows (low priority')
        }
    }


    // Add an event listener for the 'change' event
    stepLengthFunctionSelect.addEventListener("change", (event) => {
        // console.log(localStorage.getItem(appSettings.sequencer.stepLengthFunction)
        const selectedValue = event.target.value; // Get the selected option's value
        setStepLengthFunction(selectedValue)
        const update = {
            cmd: 'updateSequencer',
            setting: 'stepLengthFunction',
            data: selectedValue,
        }
        sendToMainApp(update)
 

        
    });

    function setStepLengthFunction(func){
            // Perform actions based on the selected value
        if (func === "fixed") {
            setFixedLengths()
        } else if (func === "userEditable") {
            console.log("Step Length Function set to: User Editable");
            // Add logic for user-editable step length
        } else if (func === "closenessCentrality") {
            calculateDistancesFromTableRows()
        }
        else if (func === "euclideanDistance") {
            calculateEuclideanDistances()
        }
    }
    // Function to populate the table with a fixed number of rows (8)
    function createSequencerTable(storedTable) {
        const tableBody = document.getElementById("dynamicTableBody");
        tableBody.innerHTML = ""; // Clear any existing rows

        const numberOfRows = 8; // Fixed number of rows

        if(storedTable){
            savedData.forEach((rowData, index) => {
                const row = document.createElement("tr");
                row.classList.add("is-size-6"); // Apply text size to the entire row
                // Step (Change) cell
                const stepCell = document.createElement("td");
                stepCell.textContent = rowData.stepChange || `(Empty)`; // Fallback for empty rows
                row.appendChild(stepCell);
        
                // Step Length cell
                const stepLengthCell = document.createElement("td");
                stepLengthCell.textContent = rowData.stepLength || "4n"; // Fallback for default step length
                row.appendChild(stepLengthCell);
        
                // Re-add click event listener to the row
                row.addEventListener("click", () => {
                    stepCell.textContent = selectedNode.label;
                    stepLengthCell.textContent = "4n"; // Example modification
                    row.dataset.id = selectedNode.id
                    row.dataset.label = selectedNode.label
                    row.dataset.branch = selectedNode.branch
                });
        
                tableBody.appendChild(row);
            });
        } else {
            for (let i = 0; i < numberOfRows; i++) {
                const row = document.createElement("tr");
                row.classList.add("is-size-6"); // Apply text size to the entire row

                // Step (Change) cell
                const stepCell = document.createElement("td");
                stepCell.textContent = `(Empty)`; // Placeholder for step name
                row.appendChild(stepCell);
    
                // Step Length cell
                const stepLengthCell = document.createElement("td");

                // calculate step length based on step length function

                stepLengthCell.textContent = "4n"; // Placeholder for step length
                row.appendChild(stepLengthCell);
    
                // create status cell
                const statusCell = document.createElement("td");
                statusCell.textContent = `Inactive`; // Placeholder for step name
                row.appendChild(statusCell);
                
                        // Add click event listener to the row
                row.addEventListener("click", () => {
                    if(selectedNode){
                        // Update row values with data from selectedNode
                        stepCell.textContent = selectedNode.label;
                        stepLengthCell.textContent = '4n'
                        row.dataset.id = selectedNode.id
                        row.dataset.label = selectedNode.label
                        row.dataset.branch = selectedNode.branch
        
                        statusCell.textContent = 'Active'
                        saveSequencerTable()
                    }

                });



                tableBody.appendChild(row);
            }
        }
        
    }

    // Function to save the table's contents as a JS object
    function saveSequencerTable() {
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = tableBody.querySelectorAll("tr");

        // Extract the contents of each row into an array of objects
        const tableData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll("td");
            if(row.dataset.id){
                return {
                    stepChange: cells[0].textContent, // Step (Change) cell content
                    stepLength: cells[1].textContent, // Step Length cell content
                    status: 'Active',
                    node: {
                        id: row.dataset.id,
                        label: row.dataset.label,
                        branch: row.dataset.branch
                    }
                };
            } else {
                // row doesn't have an assigned history node
                return {
                    stepChange: cells[0].textContent, // Step (Change) cell content
                    stepLength: cells[1].textContent, // Step Length cell content
                    status: 'Inactive',
                }
            }

        });

        const update = {
            cmd: 'updateSequencer',
            setting: 'tableData',
            data: tableData,
        }
        sendToMainApp(update)

        storedSequencerTable = tableData

        // localStorage.sequencerTable = tableData
        return tableData; // Return the table data
    }

    // Populate the table with 8 rows on page load
    createSequencerTable();


    function setFixedLengths(){
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = tableBody.querySelectorAll("tr");
    
        if(storedSequencerTable){
            for (let i = 0; i < storedSequencerTable.length - 1; i++) { 
                // Update the 2nd column (Step Length) of the current row
                const stepLengthCell = rows[i].children[1]; // 2nd cell of the current row
                stepLengthCell.textContent = "4n"
                storedSequencerTable[i].stepLength = "4n"
            }
            saveSequencerTable()
        }
    }
    function calculateEuclideanDistances(){
        if(!storedSequencerTable){
            return
        }
        const maxDistance = calculateMaxEuclideanDistance()

        
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = tableBody.querySelectorAll("tr");


        for (let i = 0; i < storedSequencerTable.length - 1; i++) {
            if(!storedSequencerTable[i].node){
                continue
            }
            const currentNodeID = storedSequencerTable[i].node.id;

            // Get the ID of the next node (circular for the last row)
            const nextNodeID = i < storedSequencerTable.length - 1
            ? storedSequencerTable[i + 1].node.id // Next row for all except last
            : storedSequencerTable[0].node.id;    // get value of first row for the last row's length

            // compute the euclidean distance between 2 nodes
            const currentPosition = historyDAG_cy.$(`#${currentNodeID}`).position();
            const nextPosition = historyDAG_cy.$(`#${nextNodeID}`).position();

            let distance = Math.sqrt(
                Math.pow(currentPosition.x - nextPosition.x, 2) +
                Math.pow(currentPosition.y - nextPosition.y, 2)
            );
    
            

            // Update the 2nd column (Step Length) of the current row
            const stepLengthCell = rows[i].children[1]; // 2nd cell of the current row
            // Map a distance value to a corresponding musical note length in Tone.js based on a defined range.
            stepLengthCell.textContent = mapDistanceToNoteLength(distance.toFixed(2), maxDistance)
            storedSequencerTable[i].stepLength = stepLengthCell.textContent

        }
        saveSequencerTable()
        
    }
    function calculateDistancesFromTableRows() {
        if(!storedSequencerTable){
            return
        }
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = tableBody.querySelectorAll("tr");
        
        for (let i = 0; i < storedSequencerTable.length - 1; i++) {
            const currentNodeID = storedSequencerTable[i].node.id;
            // Get the ID of the next node (circular for the last row)
            const nextNodeID = i < storedSequencerTable.length - 1
            ? storedSequencerTable[i + 1].node.id // Next row for all except last
            : storedSequencerTable[0].node.id;    // First row for the last row

    
            // Compute the shortest path distance using Dijkstra
            const dijkstra = historyDAG_cy.elements().dijkstra({
                root: historyDAG_cy.$(`#${currentNodeID}`), // Current node
                directed: true // Set to false if the graph is undirected
            });
    
            const distance = dijkstra.distanceTo(historyDAG_cy.$(`#${nextNodeID}`));
    
            // Update the 2nd column (Step Length) of the current row
            const stepLengthCell = rows[i].children[1]; // 2nd cell of the current row
            stepLengthCell.textContent = isFinite(distance) ? distance.toFixed(2) : "No Path";

            if(stepLengthCell.textContent === 'No Path'){
                // set the active step setting to 'skip'
                rows[i].children[2].textContent = 'Inactive'
            }else {
                rows[i].children[2].textContent = 'Active'
            }

        }
    
            // Handle the last row's Step Length column (no "next" node)
            // rows[storedSequencerTable.length - 1].children[1].textContent = "N/A";
        saveSequencerTable()
    }

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

    // Highlight function
    function highlightIntersectedNode(node) {
        node.addClass('intersected'); // Add a class for styling
    }

    // Remove highlight function
    function removeIntersectedHighlight(node) {
        node.removeClass('intersected');
    }

    // Check intersection
    function isIntersecting(node1, node2) {
        const bb1 = node1.renderedBoundingBox();
        const bb2 = node2.renderedBoundingBox();
        return (
            bb1.x2 > bb2.x1 &&
            bb1.x1 < bb2.x2 &&
            bb1.y2 > bb2.y1 &&
            bb1.y1 < bb2.y2
        );
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
    function panToBranch(node) {
        
        if(!node){
            console.warn('no node')
            return
        }
        // only pan if new node is outside of the viewport
        // Get the current viewport extent
        const extent = historyDAG_cy.extent();
        const position = node.position(); // Get the node's position

        // Check if the node is outside the viewport
        const isOutsideViewport =
        position.x < extent.x1 || position.x > extent.x2 ||
        position.y < extent.y1 || position.y > extent.y2;

        if (isOutsideViewport) {
            // Pan to the node
            historyDAG_cy.pan({
                x: -position.x + (historyDAG_cy.width() /2), // Adjust for viewport center
                y: -position.y + (historyDAG_cy.height() / 1.5)
            });
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

    function setHistoryToolTip(description){
        const element = document.getElementById('cytoscapeTooltipText');
        // Set new text content
        element.textContent = description;
        
    }
    

    function topologicalSort(graph) {
        const nodes = graph.nodes();
        const inDegree = new Map();
        const queue = [];
        const sorted = [];
    
        // Initialize in-degree counts
        nodes.forEach(node => {
            inDegree.set(node.id(), node.incomers('edge').length);
            if (inDegree.get(node.id()) === 0) {
                queue.push(node);
            }
        });
    
        // Process nodes with zero in-degree
        while (queue.length > 0) {
            const current = queue.shift();
            sorted.push(current);
    
            current.outgoers('edge').targets().forEach(target => {
                const targetId = target.id();
                inDegree.set(targetId, inDegree.get(targetId) - 1);
                if (inDegree.get(targetId) === 0) {
                    queue.push(target);
                }
            });
        }
    
        // Check for cycles
        if (sorted.length !== nodes.length) {
            console.error("The graph contains a cycle and cannot be sorted topologically.");
            return [];
        }
    
        return sorted;
    }

    function calculateMaxEuclideanDistance() {
        // Find the root node (no incoming edges)
        const root = historyDAG_cy.nodes().filter(node => node.indegree() === 0)[0];
        if (!root) {
            console.error("No root node found.");
            return null;
        }
    
        // Get the position of the root node
        const rootPosition = root.position();
    
        // Find all leaf nodes (no outgoing edges)
        const leaves = historyDAG_cy.nodes().filter(node => node.outdegree() === 0);
    
        // Calculate the Euclidean distance to each leaf node
        let maxDistance = 0;
    
        leaves.forEach(leaf => {
            const leafPosition = leaf.position();
            const distance = Math.sqrt(
                Math.pow(leafPosition.x - rootPosition.x, 2) +
                Math.pow(leafPosition.y - rootPosition.y, 2)
            );
    
            // Update maxDistance if the current distance is greater
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        });
        return maxDistance;
    }

    function mapDistanceToNoteLength(distance, maxDistance) {
        // Note lengths array (smallest to largest)
        const noteLengths = ["32n", "16n", "8n", "4n", "2n", "1n"];
        const minDistance = 50; // Minimum threshold for distances
    
        // If distance is less than or equal to minDistance, return smallest note length
        if (distance <= minDistance) return "32n";
    
        // If distance is greater than or equal to maxDistance, return largest note length
        if (distance >= maxDistance) return "1n";
    
        // Map the distance to an index in the note lengths array
        const normalizedDistance = (distance - minDistance) / (maxDistance - minDistance); // Normalize to [0, 1]
        const noteIndex = Math.floor(normalizedDistance * (noteLengths.length - 1)); // Map to array index
    
        return noteLengths[noteIndex];
    }
    // prevent panning beyond position of any node in the graph
    function calculatePanLimits(){
        // Get the bounding box of the graph
        const boundingBox = historyDAG_cy.elements().boundingBox();

        // Calculate the limits for panning
        const padding = 100; // Add some padding around the edges for aesthetics
        const viewportWidth = historyDAG_cy.width();
        const viewportHeight = historyDAG_cy.height();

        return {
            xMin: boundingBox.x1 - padding,
            xMax: boundingBox.x2 + padding - viewportWidth,
            yMin: boundingBox.y1 - padding,
            yMax: boundingBox.y2 + padding - viewportHeight,
        };
    }

    // Function to check if a panBy operation will exceed pan limits
    function willExceedPanLimits(deltaX, deltaY) {
        const currentPan = historyDAG_cy.pan(); // Get the current pan position
        const panLimits = calculatePanLimits();

        // Calculate the new pan position
        const newPan = {
            x: currentPan.x + deltaX,
            y: currentPan.y + deltaY,
        };

        // Check if the new pan position exceeds the limits for the given direction
        const exceedsX =
            (deltaX > 0 && newPan.x > -panLimits.xMin) || // Panning right
            (deltaX < 0 && newPan.x < -panLimits.xMax); // Panning left
        const exceedsY =
            (deltaY > 0 && newPan.y > -panLimits.yMin) || // Panning down
            (deltaY < 0 && newPan.y < -panLimits.yMax); // Panning up

        return exceedsX || exceedsY;
    }

})



