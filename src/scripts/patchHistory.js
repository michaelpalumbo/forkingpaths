import dagre from 'cytoscape-dagre';
import { min } from 'lodash';
import * as Tone from "tone";
import { uuidv7 } from "uuidv7";
import { WebMidi } from "webmidi"; // skip this line if you're using a script tag
import modules from '../modules/modules.json' assert { type: 'json'}

// Use the correct protocol based on your site's URL
const VITE_WS_URL = import.meta.env.VITE_WS_URL
// const VITE_WS_URL = "wss://historygraphrenderer.onrender.com/10000"
const ws = new WebSocket(VITE_WS_URL);

// const ws = new WebSocket('ws://localhost:3001');

// import NanoTimer from 'nanotimer';


// const historyGraphWorker = new Worker("./workers/historyGraphWorker.js");

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


let stepLength = '4n'
let sequencerMode = "mono";
let polyphonicLoops = []; // Will hold individual loops for each row

let selectedModule = null
// meta doc
let meta;
let gestureNodes;
let gestureRange
let mouseoverState = null

// gestureCy data
let gestureData = {
    nodes: [],
    scheduler: [],
    loop: false,
    startTime: null,
    endTime: null,
    length: null,
    assign: {
        parent: null,
        param: 'default',
        range: null
    },
    gesturePoints: [],
    linearGesturePoints: [], // at times this will be a duplicate of gesturePoints, but we need it for when we want to switch from an ease function back to linear mapping
    values: [],
    timestamps: [], 
    range: null,
    min: null,
    max: null,
    branch: null,
    historyID: null,
    easeFunction: 'linear'
}
// ease functions for applying easing on gestures in the editor
const easeFunctions = {
    inverted: x => 1 - x,

    // Stepped
    stepped: (x, steps = 5) => Math.floor(x * steps) / (steps - 1),
  
    // Quadratic
    easeIn: x => x * x,
    easeOut: x => 1 - (1 - x) * (1 - x),
    easeInOut: x => x < 0.5
      ? 4 * x * x * x
      : 1 - Math.pow(-2 * x + 2, 3) / 2,
  
    // Exponential
    easeInExpo: x => x === 0 ? 0 : Math.pow(2, 10 * (x - 1)),
    easeOutExpo: x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
  
    // Logarithmic
    log: x => Math.log10(9 * x + 1), // mapped to [0,1]
  
    // Sine
    easeInOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
  
    // Back
    easeOutBack: x => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
  
    // Bounce
    easeOutBounce: x => {
      const n1 = 7.5625, d1 = 2.75;
      if (x < 1 / d1) return n1 * x * x;
      else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
      else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
      else return n1 * (x -= 2.625 / d1) * x + 0.984375;
    },
  
    // Elastic
    easeOutElastic: x => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0 || x === 1
        ? x
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
  
    // Triangle
    triangle: x => x < 0.5 ? x * 2 : 2 - x * 2,
  
    // Sawtooth
    saw: x => x % 1,
  
    // Power (adjustable)
    power: (x, p = 2) => Math.pow(x, p),
  
    // Bezier ease (defaults to cubic-ish)
    bezierEase: (x, p1 = 0.42, p2 = 0.58) => {
      const u = 1 - x;
      return 3 * u * u * x * p1 + 3 * u * x * x * p2 + x * x * x;
    }
};


let timestampRange

let synthParamRanges = {

}


let historyCyRectangle;
let gestureCyRectangle;

let gestureHighlightedNode = null


let selectedNode= null
let storedSequencerTable = null
// * History Graph
let existingHistoryNodeIDs
let historyHighlightedNode = null
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
        gesture: "#00ffff",
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
    },
    mouse: {
        x: 0,
        y: 0
    }
}

let midiInput
let historyGraphNodesArray
let midiValues = {
    controllers: {

    }
}


window.addEventListener("load", () => {
   


    WebMidi.enable()
    .then(() => {
        midiInput = WebMidi.inputs[0]; // select your MIDI device
  
      if (!midiInput) {
        console.log("No MIDI input devices found.");
        return;
      }
  
      // Log available controls
      console.log("Listening to MIDI device:", midiInput.name);
  
      // Listen to control change (knobs/faders usually send these)
      midiInput.addListener("controlchange", (e) => {
        console.log(`Control Change on CC#${e.controller.number}: ${e.value}`);
        // cycle through graph
        if (e.controller.number === 8) {
            
            if(!midiValues.controllers[e.controller.number]){
                midiValues.controllers[e.controller.number] = {value: null}
            }

            const scaled = scaleMidiValue(e.rawValue, 0, 127, 0, historyGraphNodesArray.length - 1);
            if(midiValues.controllers[e.controller.number].value != scaled){

                console.log( historyGraphNodesArray[scaled])
                // console.log(historyGraphNodesArray[scaled]); // ~251.97
                let n = historyGraphNodesArray[scaled].data
                loadVersion(n.id, n.branch)

                let historyNode = historyDAG_cy.getElementById(n.id)
                highlightNode(historyNode)


                midiValues.controllers[e.controller.number].value = scaled


            }

        }
      });
    })
    .catch((err) => console.error("WebMidi could not be enabled:", err));

    function scaleMidiValue(input, inMin, inMax, outMin, outMax) {
        return Math.round(((input - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin);
    }

});



document.addEventListener("DOMContentLoaded", function () {
    const assignGestureToParam = document.getElementById("assignGestureToParam")
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

        spacingFactor: 2, // Adjust spacing between nodes
        elements: [],
        zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1., 
        // viewport: {
        //     zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1.
        // },
        boxSelectionEnabled: true,
        selectionType: "single",
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
                    'color': 'transparent',   // This hides the text, NOT the node
                    'text-opacity': 0,        // Double confirm it's invisible
                    'text-outline-width': 0   // No outline either
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

    const gestureCy = cytoscape({
        container: document.getElementById('gestureCy'), // Container ID

        elements: [ ],

        boxSelectionEnabled: true,
        // Optionally, set `autounselectify` to false so that selections can be cleared by clicking on the background.
        autounselectify: false,
        selectable: true,
        selectionType: "single",
        style: [
            // Style for nodes
            {
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'color': '#000', 
                    // 'text-outline-width': 2,
                    // 'text-outline-color': '#0074D9',
                    'width': 15,
                    'height': 15,
                    'font-size': 12,
                    // 'text-rotation': '-90deg', // Rotates the label 45 degrees counter-clockwise
                    'text-halign': 'left',  // Optional: Align text horizontally (default is 'center')
                    'text-valign': 'right',  // Optional: Align text vertically (default is 'center')
                }
            },
            // Style for edges
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#0074D9',
                    'target-arrow-color': '#0074D9',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                }
            },
            {
                selector: 'node.timestamp',
                style: {
                    'background-color': 'transparent', 
                    'label': 'data(label)', // Use the custom label attribute
                    'font-size': 20,
                    'width': 1,
                    'height': 1,
                    'color': '#000',            // Label text color
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'center',      // Horizontally align label to the left of the node
                    'grabbable': false
                    // 'text-margin-x': 15, // 
                    // 'text-margin-y': 15, // move the label down a little to make space for branch edges
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
                }

            },
            {
                selector: 'node.valueStamp',
                style: {
                    'background-color': 'transparent', 
                    'label': 'data(label)', // Use the custom label attribute
                    'font-size': 20,
                    'width': 1,
                    'height': 1,
                    'color': '#000',            // Label text color
                    'text-valign': 'left',    // Vertically center the label
                    'text-halign': 'center',      // Horizontally align label to the left of the node
                    'grabbable': false
                    // 'text-margin-x': 15, // 
                    // 'text-margin-y': 15, // move the label down a little to make space for branch edges
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
                }

            },
            {
                selector: 'node.highlighted',
                style: {
                  'background-color': '#f00',    // highlighted background color
                //   'border-width': '3px',
                //   'border-color': '#ff0'
                }
              }
        ],

        layout: {
            name: 'breadthfirst', // Ensures left-to-right placement
            // directed: true,
            horizontal: true, // Makes the layout left-to-right

            // padding: 10,
            spacingFactor: 1, // Adjust spacing between nodes
            nodeDimensionsIncludeLabels: true,
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

                    bpmValue.textContent = meta.sequencer.bpm; // Display the current BPM
                    transport.bpm.value = meta.sequencer.bpm; // Dynamically update the BPM

                    modifyGestureParamAssign() 


                break
                case 'panToBranch':
                    
                    panToBranch(event.data.data)
                break

                case 'newSession':
                    createSequencerTable()
                    createGestureGraph()
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

                case 'getGestureData':

                    const minVal = Math.min(...event.data.data.values);
                    const maxVal = Math.max(...event.data.data.values);
                    gestureData.range = maxVal - minVal
                    gestureData.min = minVal
                    gestureData.max = maxVal
                    // set the gesture length, start and end times
                    gestureData.startTime = event.data.data.timestamps[0]
                    gestureData.endTime = event.data.data.timestamps[event.data.data.timestamps.length - 1]
                    gestureData.length = gestureData.endTime - gestureData.startTime

                    gestureData.values = event.data.data.values
                    gestureData.timestamps = event.data.data.timestamps
                    
                    // map the gesture values and timestamps to a new array of objects
                    const gestureArray = event.data.data.values.map((value, i) => ({
                        value: value,
                        timestamp: event.data.data.timestamps[i],
                        parent: event.data.data.parent,
                        param: event.data.data.param,
                        msg: 'gesture',
                        historyID: gestureData.historyID,
                        branch: gestureData.branch
                    }));


                    gestureData.gesturePoints = gestureArray
                    gestureData.linearGesturePoints = gestureArray
            
                    let playback = event.data.recallGesture
                    createGestureGraph(gestureArray, playback)
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



    function loadVersion(nodeID, branch, gestureDataPoint){
        // Perform your action with the step data
        sendToMainApp(
            {
                cmd: "loadVersion",
                data: { hash: nodeID, branch: branch },
            }
        );
    }

    function loadVersionWithGestureDataPoint(nodeID, branch, gestureDataPoint){
        // Perform your action with the step data
        sendToMainApp(
            {
                cmd: "loadVersionWithGestureDataPoint",
                data: { hash: nodeID, branch: branch, gestureDataPoint: gestureDataPoint },
            }
        );

    }

    ws.onopen = () => {
        console.log('Connected to WebSocket server at ', VITE_WS_URL);
        // ws.send('Hello, server!');
        sendToMainApp({
            cmd: 'historySequencerReady'
        })

    };
    
    ws.onmessage = (event) => {
        // console.log('Message from server:', event.data);
    
        const msg = JSON.parse(event.data)
        switch(msg.cmd){
            case 'historyGraphRenderUpdate':
                historyGraphNodesArray = msg.data.elements.nodes
                historyDAG_cy.json(msg.data)
                // disable automatic layout so your manual position values are respected
                // historyDAG_cy.layout({ name: 'preset' }).run();
                historyDAG_cy.panBy({x: 25, y: 25 })

                const latestNode = historyDAG_cy.nodes().last()
                highlightGestureNode(latestNode)

                selectedNode = latestNode.data()

                panToBranch(latestNode)
                if(selectedNode.label.split(' ')[0] === 'gesture'){

                    // load the gesture into the gesture viewer
                    sendToMainApp(
                        {
                            cmd: "getGestureData",
                            data: { hash: selectedNode.id, branch: selectedNode.branch },
                        }
                    ); 

                    gestureData.branch = selectedNode.branch
                    gestureData.historyID = selectedNode.id

                }

                
            break
        }

        
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

    // Set the initial BPM
    transport.bpm.value = 120;
    let currentNode = null


    let currentStepIndex = 0; // Tracks the current step in the table

    const loop = new Tone.Loop(function(time){
        // ✅ Set current step's duration immediately
        stepLength = storedSequencerTable[currentStepIndex].stepLength;
        loop.interval = stepLength;
        
        console.log('index', currentStepIndex)
        console.log('current step length:', stepLength)

        // Get the current step
        const currentStep = storedSequencerTable[currentStepIndex];


        // Highlight the current step in the table
        const tableRows = document.querySelectorAll("#dynamicTableBody tr");
        tableRows.forEach((row) => row.classList.remove("table-active"));
        const targetRow = tableRows[currentStepIndex];

        if (targetRow) targetRow.classList.add("table-active");

        
        

        // if step is active, send request to load the version
        if (currentStep.status == "Active"){

            // first check if we're loading a gesture point (a single knob position within a gesture)
            if(targetRow.dataset.isGestureDataPoint){
                let dataPoint = {
                    parent: targetRow.dataset.parent,
                    param: targetRow.dataset.param,
                    value: targetRow.dataset.gestureDataPointValue
                }
                
                // it's a special form of loadVersion, where we want to load the version, but ensure that the associated gesture point value is loaded 
                loadVersionWithGestureDataPoint(currentStep.node.id, currentStep.node.branch, dataPoint)
            
            } else {
                // load the version
                loadVersion(currentStep.node.id, currentStep.node.branch)
                
                if(targetRow.dataset.gesture){
            
                    playGestureFromSequencerStep(JSON.parse(targetRow.dataset.gestureData), loop.interval)
                    // createGestureGraph(targetRow.dataset.gestureData.gesturePoints, targetRow.dataset.gestureData.range, targetRow.dataset.gestureData.min, targetRow.dataset.gestureData.max)
                }
            }

            let historyNode = historyDAG_cy.getElementById(currentStep.node.id)
            highlightNode(historyNode)

            // get the step length of the next row:
            const burstSelect = targetRow.cells[2].querySelector('select'); // adjust index as needed
            const currentValue = burstSelect.value;
            console.log(`Selected burst value: ${currentValue}`);
        }

        currentStepIndex = (currentStepIndex + 1) % storedSequencerTable.length;

    }, stepLength)


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

    function replaceStepSequencerTable(selectedNodes){
        const numberOfRows = selectedNodes.length
        const tableBody = document.getElementById("dynamicTableBody");
        tableBody.innerHTML = ""; // Clear any existing rows

        
        for (let i = 0; i < numberOfRows; i++) {

            const row = document.createElement("tr");
            row.classList.add("is-size-6"); // Apply text size to the entire row
            const node = selectedNodes[i].data()

            // Step (Change) cell
            const changeNodeCell = document.createElement("td");
    
            row.appendChild(changeNodeCell);

            // Step (Change) cell
            const stepCell = document.createElement("td");
            stepCell.textContent = node.label; // Placeholder for step name
            row.appendChild(stepCell);

            // Step Length cell
            const stepLengthTd = document.createElement("td");
            const stepLengthSelect = document.createElement("select");

            // calculate step length based on step length function

            const lengthOptions = ['32n', '16n', '8n', '4n', '2n'];
            lengthOptions.forEach((optionText, index) => {
                const option = document.createElement('option');

                option.value = optionText;
                option.textContent = optionText;

                if(index === 3){
                    option.selected = true
                }

                stepLengthSelect.appendChild(option);
            });

            // 🔊 Add event listener for when user selects an option
            stepLengthSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                console.log(`Burst value changed to: ${selectedValue}`);
                saveSequencerTable(); // Save updated values
            });

            // now that the select is built, add it to the td
            stepLengthTd.appendChild(stepLengthSelect);
            // now add it to the row
            row.appendChild(stepLengthTd);

            // create burst cell
            const burstTd = document.createElement("td");
            const burstSelect = document.createElement("select");
            const burstOptions = [0, 1, 2, 3, 4, 5];
            burstOptions.forEach((optionText, index) => {
                const option = document.createElement('option');

                option.value = optionText;
                option.textContent = optionText;

                if(index === 0){
                    option.selected = true
                }

                burstSelect.appendChild(option);
            });

            // 🔊 Add event listener for when user selects an option
            burstSelect.addEventListener('change', (e) => {
                const selectedValue = e.target.value;
                console.log(`Burst value changed to: ${selectedValue}`);
                saveSequencerTable(); // Save updated values
            });

            
            burstTd.appendChild(burstSelect);
            row.appendChild(burstTd);

            row.dataset.id = node.id
            row.dataset.label = node.label
            row.dataset.branch = node.branch

            // Add click event listener to the row
            // this will make it so that each row can be updated by clicks
            stepCell.addEventListener("click", () => {
                if(selectedNode && hid.key.cmd){
                    // Update row values with data from selectedNode
                    stepCell.textContent = selectedNode.label;
                    // stepLengthCell.textContent = '4n'
                    row.dataset.id = selectedNode.id
                    row.dataset.label = selectedNode.label
                    row.dataset.branch = selectedNode.branch
                    // check if the node is a gesture, because we have additional data to add
                    if(selectedNode.label.split(' ')[0] === 'gesture'){
                        row.dataset.gesture = true
                        row.dataset.gestureData = JSON.stringify(gestureData)
                    }

                    if(selectedNode.gestureDataPoint){
                        // set the label
                        let parentNameAbrv = `${selectedNode.parents.split('_')[0]}_${selectedNode.parents.split('_')[1]}`
                        row.dataset.label = `gesturePoint: ${parentNameAbrv}:${selectedNode.param}:${selectedNode.value}`
                        stepCell.textContent = row.dataset.label
                        
                        // for logic in the main app
                        row.dataset.isGestureDataPoint = true
                        // since this data is coming from a the gesture graph, we need to pull the history ID from the history graph
                        row.dataset.id = selectedNode.historyID
                        // we also need to pull the value
                        row.dataset.gestureDataPointValue = selectedNode.value
                        // and the param
                        row.dataset.param = selectedNode.param
                        // and the parent
                        row.dataset.parent = selectedNode.parents
                    }
                    statusCell.textContent = 'Active'
                    saveSequencerTable()


                }

            });
            tableBody.appendChild(row);
            saveSequencerTable()
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

                // change node cell indicator (set this to the colour of the change node)
                const changeNodeCell = document.createElement("td");
                row.appendChild(changeNodeCell);
                
                // Step (Change) cell
                const stepCell = document.createElement("td");
                stepCell.textContent = rowData.stepChange || `(Empty)`; // Fallback for empty rows
                row.appendChild(stepCell);
        
                // Step Length cell
                const stepLengthTd = document.createElement("td");
                const stepLengthSelect = document.createElement("select");

                // calculate step length based on step length function

                const lengthOptions = ['32n', '16n', '8n', '4n', '2n'];
                lengthOptions.forEach((optionText, index) => {
                    const option = document.createElement('option');

                    option.value = optionText;
                    option.textContent = optionText;

                    if(index === 3){
                        option.selected = true
                    }

                    stepLengthSelect.appendChild(option);
                });

                // 🔊 Add event listener for when user selects an option
                stepLengthSelect.addEventListener('change', (e) => {
                    const selectedValue = e.target.value;
                    console.log(`Burst value changed to: ${selectedValue}`);
                    saveSequencerTable(); // Save updated values
                });

                // now that the select is built, add it to the td
                stepLengthTd.appendChild(stepLengthSelect);
                // now add it to the row
                row.appendChild(stepLengthTd);

                // create burst cell
                const burstTd = document.createElement("td");
                const burstSelect = document.createElement("select");
                const burstOptions = [0, 1, 2, 3, 4, 5];
                burstOptions.forEach((optionText, index) => {
                    const option = document.createElement('option');

                    option.value = optionText;
                    option.textContent = optionText;

                    if(index === 0){
                        option.selected = true
                    }

                    burstSelect.appendChild(option);
                });

                // 🔊 Add event listener for when user selects an option
                burstSelect.addEventListener('change', (e) => {
                    const selectedValue = e.target.value;
                    console.log(`Burst value changed to: ${selectedValue}`);
                    saveSequencerTable(); // Save updated values
                });

                
                burstTd.appendChild(burstSelect);
                row.appendChild(burstTd);
        
                // Re-add click event listener to the step cell
                stepCell.addEventListener("click", () => {
                    if(hid.key.cmd){

                        changeNodeCell.style.backgroundColor = docHistoryGraphStyling.nodeColours[selectedNode.label.split(' ')[0]]
                        stepCell.textContent = selectedNode.label;
                        // stepLengthCell.textContent = "4n"; // Example modification
                        row.dataset.id = selectedNode.id
                        row.dataset.label = selectedNode.label
                        row.dataset.branch = selectedNode.branch

                        if(selectedNode.label.split(' ')[0] === 'gesture'){
                            row.dataset.gesture = true
                            row.dataset.gestureData = JSON.stringify(gestureData)
                        }

                        if(selectedNode.gestureDataPoint){
                            // set the label
                            let parentNameAbrv = `${selectedNode.parents.split('_')[0]}_${selectedNode.parents.split('_')[1]}`
                            row.dataset.label = `gesturePoint: ${parentNameAbrv}:${selectedNode.param}:${selectedNode.value}`
                            stepCell.textContent = row.dataset.label
                            // for logic in the main app
                            row.dataset.isGestureDataPoint = true
                            // since this data is coming from a the gesture graph, we need to pull the history ID from the history graph
                            row.dataset.id = selectedNode.historyID
                            // we also need to pull the value
                            row.dataset.gestureDataPointValue = selectedNode.value
                            // and the param
                            row.dataset.param = selectedNode.param
                            // and the parent
                            row.dataset.parent = selectedNode.parents
                        }

                    }

        

                });
        
                tableBody.appendChild(row);
            });
        } else {
            for (let i = 0; i < numberOfRows; i++) {
                const row = document.createElement("tr");
                row.classList.add("is-size-6"); // Apply text size to the entire row

                // change node cell indicator (set this to the colour of the change node)
                const changeNodeCell = document.createElement("td");
                row.appendChild(changeNodeCell);
                
                // Step (Change) cell
                const stepCell = document.createElement("td");
                stepCell.textContent = `(Empty)`; // Placeholder for step name
                row.appendChild(stepCell);

                // Step Length cell
                const stepLengthTd = document.createElement("td");
                const stepLengthSelect = document.createElement("select");

                // calculate step length based on step length function

                const lengthOptions = ['32n', '16n', '8n', '4n', '2n'];
                lengthOptions.forEach((optionText, index) => {
                    const option = document.createElement('option');

                    option.value = optionText;
                    option.textContent = optionText;

                    if(index === 3){
                        option.selected = true
                    }

                    stepLengthSelect.appendChild(option);
                });

                // 🔊 Add event listener for when user selects an option
                stepLengthSelect.addEventListener('change', (e) => {
                    const selectedValue = e.target.value;
                    console.log(`Burst value changed to: ${selectedValue}`);
                    saveSequencerTable(); // Save updated values
                });

                // now that the select is built, add it to the td
                stepLengthTd.appendChild(stepLengthSelect);
                // now add it to the row
                row.appendChild(stepLengthTd);

                // create burst cell
                const burstTd = document.createElement("td");
                const burstSelect = document.createElement("select");
                const burstOptions = [0, 1, 2, 3, 4, 5];
                burstOptions.forEach((optionText, index) => {
                    const option = document.createElement('option');

                    option.value = optionText;
                    option.textContent = optionText;

                    if(index === 0){
                        option.selected = true
                    }

                    burstSelect.appendChild(option);
                });

                // 🔊 Add event listener for when user selects an option
                burstSelect.addEventListener('change', (e) => {
                    const selectedValue = e.target.value;
                    console.log(`Burst value changed to: ${selectedValue}`);

                    saveSequencerTable(); // Save updated values

                });

                
                burstTd.appendChild(burstSelect);
                row.appendChild(burstTd);
                
                // Add click event listener to the step cell
                stepCell.addEventListener("click", () => {
                    if(selectedNode && hid.key.cmd){
                        changeNodeCell.style.backgroundColor = docHistoryGraphStyling.nodeColours[selectedNode.label.split(' ')[0]]
                        // Update row values with data from selectedNode
                        stepCell.textContent = selectedNode.label;
                        // stepLengthCell.textContent = '4n' //! need to update this value from the dropdown. 

                        row.dataset.branch = selectedNode.branch
                        row.dataset.id = selectedNode.id
                        row.dataset.label = selectedNode.label
                        if(selectedNode.label.split(' ')[0] === 'gesture'){
                            row.dataset.gesture = true
                            row.dataset.gestureData = JSON.stringify(gestureData)
                        }

                        if(selectedNode.gestureDataPoint){
                            // set the label
                            let parentNameAbrv = `${selectedNode.parents.split('_')[0]}_${selectedNode.parents.split('_')[1]}`
                            row.dataset.label = `gesturePoint: ${parentNameAbrv}:${selectedNode.param}:${selectedNode.value}`
                            stepCell.textContent = row.dataset.label
                            // for logic in the main app
                            row.dataset.isGestureDataPoint = true
                            // since this data is coming from a the gesture graph, we need to pull the history ID from the history graph
                            row.dataset.id = selectedNode.historyID
                            // we also need to pull the value
                            row.dataset.gestureDataPointValue = selectedNode.value
                            // and the param
                            row.dataset.param = selectedNode.param
                            // and the parent
                            row.dataset.parent = selectedNode.parents
                        } 
        
      
                        // statusCell.textContent = 'Active'
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
                    stepChange: cells[1].textContent, // Step (Change) cell content
                    stepLength: cells[2].querySelector('select').value, // Step Length selectmenu content
                    stepBurst: cells[3].querySelector('select').value, // burst value
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
                    stepChange: cells[1].textContent, // Step (Change) cell content
                    stepLength: cells[2].querySelector('select').value, // Step Length selectmenu content
                    stepBurst: cells[3].querySelector('select').value, // burst value
                    status: 'Inactive',
                }
            }

        });

        console.log('tableData after saving:', tableData)
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


    function randomSequencerStepOrder(){
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = Array.from(tableBody.querySelectorAll("tr")); // Convert NodeList to Array

        // Shuffle rows using Fisher-Yates algorithm
        for (let i = rows.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rows[i], rows[j]] = [rows[j], rows[i]];
        }

        // Clear the table body
        tableBody.innerHTML = "";

        // Append the rows in the new random order
        rows.forEach(row => tableBody.appendChild(row));


    }
    function setFixedLengths(){
        const tableBody = document.getElementById("dynamicTableBody");
        const rows = tableBody.querySelectorAll("tr");

        if(storedSequencerTable){
            for (let i = 0; i < storedSequencerTable.length - 1; i++) { 
                // Update the 2nd column (Step Length) of the current row
                const stepLengthCell = rows[i].children[1]; // 2nd cell of the current row
                // console.log('stepLengthCell', stepLengthCell)
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

    function setSequenceOrder(order){
        switch(order){
            case 'entry':
                createSequencerTable(storedSequencerTable)
            break
            case 'topologicalSort':

            break
            case 'random':
                randomSequencerStepOrder()

            break
            default: console.log(order)
        }
    }



    // playback a stored gesture from a sequencer step
    function playGestureFromSequencerStep(gesture, stepLength){
        let quantizedGesture = quantizeGesture(gesture, stepLength)
        // create the scheduler
        quantizedGesture.forEach((node) => {
            const delay = node.t * 1000; // (convert to milliseconds)
            
            // Use setTimeout to schedule the callback
            const timeoutID = setTimeout(() => {
                if(gesture.assign.param === 'default'){
                    
                    let data = {
                        parent: node.parent,
                        param: node.param,
                        value: node.value
                    }
                    // console.log(data)
                    
                    //! uncomment this when in patcHistory Script
                    sendToMainApp({
                        cmd: 'playGesture',
                        data: data,
                        kind: 'n/a'
                    })
    
                    
                } else {
                    // process it using the gesturedata assign range data for scaling
    
                    // convert the value from the source value's min and max to gestureData.assign.range
                    // first get the min and max of the source value
                    // synthParamRanges
    
                    
                    let value = node.value
                    
                    let storedParam = meta.synthFile.audioGraph.modules[node.parent].moduleSpec.parameters[node.param]
                    let targetParam = gesture.assign
                    
                    sendToMainApp({
                        cmd: 'playGesture',
                        data: convertParams(storedParam, targetParam, value),
                        kind: targetParam.kind
    
                    })
            
                }
    
                // if(gesture.loop && gesture.length === delay){
                //     playGesture('repeat')
                //     // setTimeout(() => {
                //     //     playGesture('repeat')
                //     // }, 250);
                // }
            }, delay);
    
            gesture.scheduler.push(timeoutID)
        });
    }
    
    function quantizeGesture(gesture, stepLength) {
    
        const duration = gesture.endTime - gesture.startTime;
        const scale = stepLength / duration;
      
        // Map each point's timestamp to the new interval [0, stepLength]
        return gesture.gesturePoints.map(point => ({
          ...point,
          t: (point.timestamp - gesture.startTime) * scale
        }));
    }


    /*

        GESTURE PLAYER

    */

    let previousNodeID
    
    // Function to dynamically generate the graph
    function createGestureGraph(nodes, playback) {

        // store nodes in case window is resized
        gestureNodes = nodes
        // clear the gestureData.nodes
        gestureData.nodes = []

        // Clear the current graph
        gestureCy.elements().remove();



        // in this case, we're just using this function to clear the gestureCy
        if(!nodes){
            return
        }


        // get the web audio node's spec
        let parentWebAudioNode = modules.webAudioNodes[nodes[0].parent.split('_')[0]]

        
        const elements = [];
        const viewportWidth = gestureCy.width(); // Get the width of the Cytoscape container
        const viewportHeight = gestureCy.height(); // Get the height of the Cytoscape container

        timestampRange = nodes[nodes.length - 1].timestamp - nodes[0].timestamp;
        
        // Create nodes and edges dynamically
        for (let i = 0; i < nodes.length; i++) {
            // set the gestureAssign menu to this param
            if(i===0){
                // assignGestureToParam.selectedIndex = 1; // Set to the second option (index is zero-based)
                // assignGestureToParam.dispatchEvent(new Event('change')); // Manually trigger the change event

                for (let i = 0; i < assignGestureToParam.options.length; i++) {
                    if (assignGestureToParam.options[i].text === nodes[0].param && assignGestureToParam.options[i].dataset.parent === nodes[0].parent) {
                        assignGestureToParam.selectedIndex = i;

                        gestureData.assign = {
                            parent: null,
                            param: 'default',
                            range: null
                        }
                        if(gestureData.easeFunction === 'linear'){
                            // disable the gesture clone button
                            setGestureSaveButtonState(true)
                        } else {
                            // enable it so that player can save the eased gesture!
                            setGestureSaveButtonState(false)
                        }

                      break;
                    }
                }
            }

            let node = nodes[i]
            const nodeId = uuidv7()
            // determine the x position of the node
            let timePosition;
            if(i === 0){
                timePosition = 0
            } else {
                timePosition = (node.timestamp - nodes[0].timestamp) / timestampRange
            }
            
            const x = timePosition * viewportWidth; // Interpolate to x-coordinate


            
            // determine the y position of the node
            let valuePosition
            let y
            // check if param is a knob or a menu
            if(parentWebAudioNode.parameters[node.param].values){
                // param is a menu
                let menuOptions = parentWebAudioNode.parameters[node.param].values
            

                let menuIndex = menuOptions.indexOf(node.value)

                valuePosition = menuIndex / (menuOptions.length - 1);
                y = viewportHeight - (valuePosition * viewportHeight); // Inverted y-coordinate
            } else {

                //  param is a knob, this is easier
                valuePosition = (node.value - gestureData.min) / gestureData.range;
                y = viewportHeight - (valuePosition * viewportHeight); // Inverted y-coordinate
            }
            
            
            
            const nodeColor = docHistoryGraphStyling.nodeColours['paramUpdate']
            // const index = node.data().label.indexOf(' ');
            // const trimmedLabel = index !== -1 ? node.data().label.substring(index + 1) : '';
            const param = node.param

            // // extract the param value from the label
            // const valueString = trimmedLabel.split(' = ')[1]
            // const parsedNumber = parseFloat(valueString);
            // const value = isNaN(parsedNumber) ? valueString : parsedNumber;
            
            const gesturePoint = { 
                group: 'nodes',
                data: { id: nodeId, label: '', change: node.param, color: nodeColor, timestamp: node.timestamp, parents: node.parent, param: param, value: node.value, historyID: node.historyID, branch: node.branch, gestureDataPoint: true },
                position: { x: x, y: y } // Set position explicitly
            }
            elements.push(gesturePoint);
            gestureData.nodes.push(gesturePoint)
            // Add edge from the previous node to the current node
            if (i > 0) {
                elements.push({
                    data: {
                        id: `edge${i - 1}-${i}`,
                        source: previousNodeID,
                        target: nodeId
                    }
                });
            }
            previousNodeID = nodeId
        }


        if (timestampRange > 1000){
            timestampRange = `${timestampRange / 1000.0}s`
        } else {
            timestampRange = `${timestampRange}ms`
        }

        let firstNodePosition
        let lastNodePosition

        if(parentWebAudioNode.parameters[nodes[0].param].values){
            // param is a menu
            let menuOptions = parentWebAudioNode.parameters[nodes[0].param].values
        

            let menuIndex = menuOptions.indexOf(nodes[0].value)

            // get the y position of the first node
            firstNodePosition = menuIndex / (menuOptions.length - 1);
            // y = viewportHeight - (valuePosition * viewportHeight); // Inverted y-coordinate

            // get the y position of the last node
            lastNodePosition = menuOptions.length - 1
            // (nodes[nodes.length - 1].value - gestureData.min) / gestureData.range;

            // Add fixed nodes in the viewport for displaying the time and value ranges.
            elements.push(
                // {
                //     group: 'nodes',
                //     classes: 'timestamp',
                //     data: { id: 'bottom-left', label: '0ms' },
                //     position: { x: -30, y: nodeOneY } // 50px padding from bottom
                // },
                {
                    group: 'nodes',
                    classes: 'timestamp',
                    data: { id: 'bottom-right', label: timestampRange },
                    position: { x: viewportWidth + 40, y: lastNodePosition } // 50px padding from bottom
                },
                // {
                //     group: 'nodes',
                //     classes: 'valueStamp',
                //     data: { id: 'bottom-left2', label: gestureData.min },
                //     position: { x: -30, y: viewportHeight - 5} // 50px padding from bottom
                // },
                // {
                //     group: 'nodes',
                //     classes: 'valueStamp',
                //     data: { id: 'top-left', label: gestureData.max },
                //     position: { x: -30, y: 15 } // 50px padding from bottom
                // }
            );

            parentWebAudioNode.parameters[nodes[0].param].values.forEach((option, index)=>{

                // let menuOptions = parentWebAudioNode.parameters[node.param].values
            

                // let menuIndex = menuOptions.indexOf(node.value)

                let valuePosition = index / (parentWebAudioNode.parameters[nodes[0].param].values.length - 1);
                let y = viewportHeight - (valuePosition * viewportHeight); // Inverted y-coordinate

                elements.push(                {
                    group: 'nodes',
                    classes: 'valueStamp',
                    data: { id: 'valueStamp' + index, label: option },
                    position: { x: 10, y: y } // 50px padding from bottom
                })
            })
            
            
        }

        else {

            // param is a knob
            // get the y position of the first node
            firstNodePosition = (nodes[0].value - gestureData.min) / gestureData.range;

            // get the y position of the last node
            lastNodePosition = (nodes[nodes.length - 1].value - gestureData.min) / gestureData.range;

            const nodeOneY = viewportHeight - (firstNodePosition * viewportHeight); // Inverted y-coordinate
        

            const lastNodeY = viewportHeight - (lastNodePosition * viewportHeight); // Inverted y-coordinate
            
            // Add  fixed nodes at the bottom corners of the viewport for displaying the time and value ranges.
            elements.push(
                // {
                //     group: 'nodes',
                //     classes: 'timestamp',
                //     data: { id: 'bottom-left', label: '0ms' },
                //     position: { x: -30, y: nodeOneY } // 50px padding from bottom
                // },
                {
                    group: 'nodes',
                    classes: 'timestamp',
                    data: { id: 'bottom-right', label: timestampRange },
                    position: { x: viewportWidth + 40, y: lastNodeY } // 50px padding from bottom
                },
                {
                    group: 'nodes',
                    classes: 'valueStamp',
                    data: { id: 'bottom-left2', label: gestureData.min },
                    position: { x: -30, y: viewportHeight - 5} // 50px padding from bottom
                },
                {
                    group: 'nodes',
                    classes: 'valueStamp',
                    data: { id: 'top-left', label: gestureData.max },
                    position: { x: -30, y: 15 } // 50px padding from bottom
                }
            );
            
        }

        
        
        // Add elements to the graph
        gestureCy.add(elements);

        // Use the preset layout
        gestureCy.layout({ name: 'preset' }).run();
        
        gestureCy.fit();

        if(playback === true){
            // play that gesture
            // stop sequencer
            transport.stop();
            loop.stop()
            startStopButton.textContent = "Start Sequencer";
            // Call playback with a callback to handle each scheduled node in the gesture
            playGesture();
        }

    }

    // function playbackObjectsInRealTime(objects, onPlayback) {
    //     // Sort objects by timestamp
    //     const sortedObjects = [...objects].sort((a, b) => a.data.timestamp - b.data.timestamp);
    
    //     // Get the starting timestamp (the earliest one)
    //     const startTime = sortedObjects[0].timestamp;
    
    //     // Playback logic
    //     sortedObjects.forEach(obj => {
    //         const delay = obj.data.timestamp - startTime; // Calculate delay from the start
    //         setTimeout(() => {
    //             onPlayback(obj); // Invoke the callback with the current object
    //         }, delay); // Execute after the calculated delay
    //     });
    // }

    let sortedGestureNodes
    function playGesture(mode) {
        gestureCy.nodes().removeClass('highlighted')
        // 'repeat' is passed by the function call when looping is on, so we don't want to have to get the same data again if the loop is on
        if(mode != 'repeat'){
            // reset the gesture scheduler
            gestureData.scheduler = [ ]
            
            // sort objects by timestamp
            // sortedGestureNodes = [...gestureData.nodes].sort((a, b) => a.data.timestamp - b.data.timestamp);
            // Get the starting timestamp (the earliest one)
            // gestureData.startTime = sortedGestureNodes[0].data.timestamp;
            // gestureData.endTime = sortedGestureNodes[sortedGestureNodes.length - 1].data.timestamp;
            // gestureData.length = gestureData.endTime - gestureData.startTime
        }
 
        // create the scheduler
        gestureData.nodes.forEach((node) => {
            const delay = node.data.timestamp - gestureData.startTime; // Calculate delay from the start

            // Use setTimeout to schedule the callback
            const timeoutID = setTimeout(() => {
                
                // highlight the node
                let hNode = gestureCy.getElementById(node.data.id);
                hNode.addClass('highlighted');

                if(gestureData.assign.param === 'default'){
                    
                    let data = {
                        parent: node.data.parents,
                        param: node.data.param,
                        value: node.data.value
                    }
                    sendToMainApp({
                        cmd: 'playGesture',
                        data: data,
                        kind: 'n/a'
                    })

            
                } else {
                    // process it using the gesturedata assign range data for scaling

                    // convert the value from the source value's min and max to gestureData.assign.range
                    // first get the min and max of the source value
                    // synthParamRanges

                    
                    let value = node.data.value
                    
                    let storedParam = meta.synthFile.audioGraph.modules[node.data.parents].moduleSpec.parameters[node.data.param]
                    let targetParam = gestureData.assign
                    
                    sendToMainApp({
                        cmd: 'playGesture',
                        data: convertParams(storedParam, targetParam, value),
                        kind: targetParam.kind

                    })
            
                }

                if(gestureData.loop && gestureData.length === delay){
                    playGesture('repeat')
                    // setTimeout(() => {
                    //     playGesture('repeat')
                    // }, 250);
                }
            }, delay);

            gestureData.scheduler.push(timeoutID)
        });


    }

    
    
    // function animateSlider(duration) {
    //     const slider = document.getElementById('gesturePlayhead');
    //     const startTime = performance.now();

    //     function updateSlider(timestamp) {
    //         const elapsed = timestamp - startTime;
    //         const progress = Math.min((elapsed / duration) * 100, 100); // Calculate progress percentage
    //         slider.value = progress; // Update the slider's position

    //         if (progress < 100) {
    //             requestAnimationFrame(updateSlider); // Continue animation
    //         }
    //     }

    //     requestAnimationFrame(updateSlider); // Start the animation
    // }


    
    // function to modify selectmenu
    function modifyGestureParamAssign(cmd, data){
        assignGestureToParam.innerHTML = '';

        // add first option
        let newOption = document.createElement('option');
        // Set the text and value of the new option
        newOption.text = 'Assign...'
        newOption.disabled = true
        newOption.selected = true
        assignGestureToParam.add(newOption);

        // add option default assignment
        // newOption = document.createElement('option');
        // // Set the text and value of the new option
        // newOption.text = 'default'
        // // newOption.value = "getSelectedModule";
        // // newOption.id = 'selectedModuleOption'
        // // newOption.disabled = true;

        // // Add the new option to the select menu
        // assignGestureToParam.add(newOption);
        
        synthParamRanges = {

        }

        const modules = removeElementsBySubstring(Object.keys(meta.synthFile.audioGraph.modules), 'AudioDestination');
        
        modules.forEach((module, index)=>{
            // start by adding the module to the menu as a disabled option
            // Create a new option element
            let newOption = document.createElement('option');
            // Set the text and value of the new option
            newOption.text = getSubstringBeforeLastInstanceOf(module, '_')
            // newOption.value = "getSelectedModule";
            // newOption.id = 'selectedModuleOption'
            newOption.disabled = true;

            // Add the new option to the select menu
            assignGestureToParam.add(newOption);

            synthParamRanges[module] = { }

            // now add each param under this option
            let paramNames = Object.keys(meta.synthFile.audioGraph.modules[module].params)

            for(let i = 0; i < paramNames.length; i++){
                let metadata = meta.synthFile.audioGraph.modules[module].moduleSpec.parameters[paramNames[i]]
                // Create a new option element
                let newOption = document.createElement('option');
                // Set the text and value of the new option
                newOption.text = paramNames[i]
                newOption.dataset.parent = module

                if(metadata.ui === 'knob'){
                    newOption.dataset.min = metadata.min
                    newOption.dataset.max = metadata.max

                    synthParamRanges[module][paramNames[i]] = {
                        kind: 'knob',
                        min: metadata.min,
                        max: metadata.max
                    }
                } else if (metadata.ui === 'menu'){
                    newOption.dataset.values = metadata.values
                    synthParamRanges[module][paramNames[i]] = {
                        kind: 'menu',
                        min: 0,
                        max: metadata.values.length - 1,
                        values: metadata.values
                    }
                }

                newOption.id = `paramAssign_${paramNames[i]}`

                // Add the new option to the select menu
                assignGestureToParam.add(newOption);
            }

        })

    }

    // *
    // *
    // * EVENT HANDLERS
    // * 
    // *
    // for switching between polyphonic and monophonic sequencing modes
    const modeSelector = document.getElementById("sequencerMode");
    modeSelector.addEventListener("change", (e) => {
        sequencerMode = e.target.value;
        console.warn('see this line in the code for next todo, thanks')
        if (sequencerMode === "poly") {
            // todo: if sequencer playback is active, stop whichever mode is currently running and start the selected mode
            // i.e. comment out these 2 lines:
            // loop.stop()
            // startPolyphonicSequencer();
        } else {
            // todo: if sequencer playback is active, stop whichever mode is currently running and start the selected mode
            // i.e. comment out these 3 lines:
            // stopPolyphonicSequencer();
            // currentStepIndex = 0;
            // loop.start(0); // your global mono loop
        }
    });


    const overlay = document.getElementById('historyNodeOverlay');

    // Show and move the overlay
    historyDAG_cy.on('mouseover', 'node', function(evt) {
        const data = evt.target.data();
       
        let overlayString
        let labelArray = data.label.split(' ')
        switch(data.label.split(' ')[0]){
            case 'loaded':
                overlayString = `
                    <strong>Change Node:</strong> File Load<br>    
                    <strong>File:</strong> ${labelArray[1]}<br><br>
                    <strong>Branch:</strong> ${data.branch}<br>
                `;
            break

            case 'paramUpdate':
                // console.log(parseParamUpdate(labelArray))
                overlayString = `
                    <strong>Change Node:</strong> Param<br>
                    <strong>Module:</strong> ${parseParamUpdate(data.label)[2]}<br>
                    <strong>Parameter:</strong> ${parseParamUpdate(data.label)[0]}<br>
                    <strong>Value:</strong> ${parseParamUpdate(data.label)[1]}<br><br>
                    <strong>Branch:</strong> ${data.branch}<br>
                `;
            break

            case 'gesture':
                overlayString = `
                    <strong>Change Node:</strong> Gesture<br>
                    <strong>Module:</strong> ${labelArray[2]}<br>
                    <strong>Parameter:</strong> ${labelArray[1]}<br><br>
                    <strong>Branch:</strong> ${data.branch}<br>
                `;

            break
            
            case 'connect':
                let parents = data.parents.split(' ')

                if(labelArray[1] === 'OUT'){
                    // cable started at an out
                    overlayString = `
                        <strong>Change Node:</strong> Connect<br><br>
                        <strong>Output Module:</strong> ${parents[0].split('_')[0]}_${parents[0].split('_')[1]}<br>
                        <strong>Output Jack:</strong> ${labelArray[1]}<br><br>

                        <strong>Input Module:</strong> ${parents[1].split('_')[0]}_${parents[1].split('_')[1]}<br>
                        <strong>Input Jack:</strong> ${labelArray[3]}<br><br>

                        <strong>Branch:</strong> ${data.branch}<br>
                    `;
                } else {
                    // cable started at an IN, notice that the array indeces are all inverted from the way they are above
                    overlayString = `
                        <strong>Change Node:</strong> Connect<br><br>
            
                        <strong>Output Module:</strong> ${parents[1].split('_')[0]}_${parents[1].split('_')[1]}<br>
                        <strong>Output Jack:</strong> ${labelArray[3]}<br><br>

                        <strong>Input Module:</strong> ${parents[0].split('_')[0]}_${parents[0].split('_')[1]}<br>
                        <strong>Input Jack:</strong> ${labelArray[1]}<br><br>

                        <strong>Branch:</strong> ${data.branch}<br>
                    `;
                }


            break

            case 'disconnect':
                let parentss = data.parents.split(' ')
                

                if(labelArray[1] != 'OUT'){

                    if(labelArray[1].split('.').length === 1){
  
                        // cable started at an out
                        overlayString = `
                            <strong>Change Node:</strong> Disconnect<br><br>
                            <strong>Output Module:</strong> ${parentss[0].split('_')[0]}_${parentss[0].split('_')[1]}<br>
                            <strong>Output Jack:</strong> ${labelArray[3]}<br><br>
    
                            <strong>Input Module:</strong> ${parentss[1].split('_')[0]}_${parentss[1].split('_')[1]}<br>
                            <strong>Input Jack:</strong> ${labelArray[1]}<br><br>
    
                            <strong>Branch:</strong> ${data.branch}<br>
                        `;
                    } else {
                        // deal with jack disconnections 
                        // the following logic is annoying as hell. i don't know why i programmed the cable-jack removal logic in synthApp.js this way but oh well its done

                        let jack1 = labelArray[1].split('.')[1]
                        if(jack1 === 'OUT'){
                  

                            overlayString = `
                                <strong>Change Node:</strong> Disconnect<br><br>

                                <strong>Output Module:</strong> ${parentss[0].split('_')[0]}_${parentss[0].split('_')[1]}<br>
                                <strong>Output Jack:</strong> ${jack1}<br><br>

                                <strong>Input Module:</strong> ${parentss[1].split('_')[0]}_${parentss[1].split('_')[1]}<br>
                                <strong>Input Jack:</strong> ${labelArray[3].split('.')[1]}<br><br>

                                <strong>Branch:</strong> ${data.branch}<br>
                            `;
                        } else {
    
                            overlayString = `
                                <strong>Change Node:</strong> Disconnect<br><br>

                                <strong>Output Module:</strong> ${parentss[0].split('_')[0]}_${parentss[0].split('_')[1]}<br>
                                <strong>Output Jack:</strong> ${labelArray[3].split('.')[1]}<br><br>

                                <strong>Input Module:</strong> ${parentss[1].split('_')[0]}_${parentss[1].split('_')[1]}<br>
                                <strong>Input Jack:</strong> ${jack1}<br><br>

                                <strong>Branch:</strong> ${data.branch}<br>
                            `;                       
                        }
                    }

                } 

            break

            case "merge":
                console.warn('need to set up merge case for historyNodeOverlay')
            break
        }

        
        overlay.innerHTML = overlayString
        overlay.style.display = 'block';
    });

    historyDAG_cy.on('mousemove', 'node', function(evt) {
        overlay.style.left = `${evt.originalEvent.pageX + 15}px`;
        overlay.style.top = `${evt.originalEvent.pageY + 10}px`;
    });

    historyDAG_cy.on('mouseout', 'node', function() {
        overlay.style.display = 'none';
    });
      

    const saveGestureButton = document.getElementById("saveGestureButton");

    saveGestureButton.addEventListener("click", async () => {
        // re-disable the save button
        setGestureSaveButtonState(true)
        // we need this parentNode to know where to create a new branch from for the cloned gesture
        let sourceGestureNode = historyDAG_cy.getElementById(gestureData.historyID)
        let parentNode = sourceGestureNode.incomers('node').data();
        
        let scaledValues = []        
        let targetParam 
        let data

        
        
        if(gestureData.assign.param === 'default'){
            // in this case, we have simply modified the gesture and want to save it in the history graph
            // so just grab all the values as they are currently
            gestureData.gesturePoints.forEach((point)=>{
                let value = point.value
                scaledValues.push(value)
            })
            // load into obj
            data = { 
                parentNode: parentNode, 
                assignTo: {
                    parent: gestureData.gesturePoints[0].parent,
                    param: gestureData.gesturePoints[0].param,
                    // range: null // not needed for this operation
                },
                scaledValues: scaledValues,
                timestamps: gestureData.timestamps
            }
       
        
        } else {
            // we are cloning the gesture onto a different param, so we now we need to map the values
            targetParam = gestureData.assign

            // if(gestureData.assign.kind === 'menu') {
            //     // we need to handle menu param conversion differently
            //     gestureData.gesturePoints.forEach((point)=>{
            //         let storedParam = meta.synthFile.audioGraph.modules[point.parent].moduleSpec.parameters[point.param]
            //         let value = point.value
            //         convertParams(storedParam, targetParam, value).value
            //     })


            // } else {
                // dealing with a knob
                // get the updated param value (user may have made edits to gesture)
                // scale it to the range of the newly assigned param
                gestureData.gesturePoints.forEach((point)=>{
                    let storedParam = meta.synthFile.audioGraph.modules[point.parent].moduleSpec.parameters[point.param]
                    let value = point.value
                    scaledValues.push(convertParams(storedParam, targetParam, value).value)
                })

            
        
                data = { 
                    parentNode: parentNode, 
                    assignTo: gestureData.assign,
                    scaledValues: scaledValues,
                    timestamps: gestureData.timestamps
                }
            // }
            
        }

        sendToMainApp(
            {
                cmd: "cloneGesture",
                data: data
            }
        );
    })



    document.getElementById("assignGestureToParam").addEventListener("change", (event) => { 
        const selected = event.target.options[event.target.selectedIndex]; // Get the selected <option>
        gestureData.assign.parent = selected.dataset.parent || null
        gestureData.assign.param = selected.text

        // if player hasn't chosen a different param to assign to, don't allow them to save it
        if(selected.text === gestureData.nodes[0].param && selected.dataset.parent === gestureData.nodes[0].parent){
            
            gestureData.assign.range = null
            // disable the gesture clone button
            setGestureSaveButtonState(true)
            
        }
        if(selected.dataset.values){

            // param is a menu
            gestureData.assign.kind = 'menu'
            gestureData.assign.range = selected.dataset.values


            // enable the gesture clone button
            setGestureSaveButtonState(false)
        } else if (selected.dataset.min){
            // param is a knob
            gestureData.assign.kind = 'knob'
            gestureData.assign.range = {
                min: selected.dataset.min,
                max: selected.dataset.max
            }

            // enable the gesture clone button
            setGestureSaveButtonState(false)

        }
    })



    const playGestureButton = document.getElementById("playGestureButton");

    playGestureButton.addEventListener("click", async () => {
        // stop sequencer
        transport.stop();
        loop.stop()
        startStopButton.textContent = "Start Sequencer";
        // Call playback with a callback to handle each scheduled node in the gesture
        playGesture();
        
    })

    const loopGesturesButton = document.getElementById("loopGesturesButton");

    loopGesturesButton.addEventListener("click", async () => {
        gestureData.loop = !gestureData.loop
    })

    // update the viewport boundaries whenever the window resizes
    let resizeTimeout;  
    // get initial sizes
    historyCyRectangle = historyDAG_cy.container().getBoundingClientRect(); // Get the container's position and size
    gestureCyRectangle = gestureCy.container().getBoundingClientRect()
    // calculare cytoscape viewport dimensions after any window or page content resizing
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            historyCyRectangle = historyDAG_cy.container().getBoundingClientRect(); // Get the container's position and size
            gestureCyRectangle = gestureCy.container().getBoundingClientRect()

            gestureCy.layout({ name: 'preset' }).run();
        
            gestureCy.fit();

            if(gestureNodes){
                createGestureGraph(gestureNodes)
            }
        }, 200); // Adjust the delay as needed
    });

    // get node mouseovers for displaying the value
    gestureCy.on('mouseover', 'node', (event)=>{
        const node = event.target.data()

        const displayValue = document.getElementById('displayPointValue');
        displayValue.textContent = `${node.param}: ${node.value.toFixed(2)}`;

        highlightGestureNode(event.target)

    })
    gestureCy.on('tap', 'node', (event) => {
        if(hid.key.shift){
            // add node to sequencer

        } else {
            highlightGestureNode(event.target)
            selectedNode = event.target.data()

            let data = {
                parent: event.target.data().parents,
                param: event.target.data().param,
                value: event.target.data().value,
                // gestureID: event.target.data().historyID,
                // gestureBranch: event.target.data().branch,
                // gestureNode: event.target.data().gestureNode
            }
            // console.log(data)
            
            //! uncomment this when in patcHistory Script
            // sendToMainApp({
            //     cmd: 'playGesture',
            //     data: data,
            //     kind: 'n/a'
            // })
            //!
            // // loadVersion(event.target.data().id, event.target.data().branch)
            // loadVersion(event.target.data().id, event.target.data().branch)

            // selectedNode = event.target.data()
            // // we want to handle gesture nodes differently than the others
            // if(event.target.data().label.split(' ')[0] === 'gesture'){
            //     // node is a gesture
            //     // get the gestureData from the main app
            //     sendToMainApp(
            //         {
            //             cmd: "getGestureData",
            //             data: { hash: event.target.data().id, branch: event.target.data().branch },
            //         }
            //     ); 
            // }
        }
    })


    // When the node is grabbed, store its current x position to later prevent it from moving along the X axis
    gestureCy.on('grab', 'node', (event) => {
        const node = event.target;
        node.scratch('lockedX', node.position('x'));
    });
    
    // During dragging, override the x position so it remains constant
    gestureCy.on('drag', 'node', (event) => {
        const node = event.target;
        const lockedX = node.scratch('lockedX');
        const newY = node.position('y');
        node.position({ x: lockedX, y: newY });

        // get the web audio node's spec
        let parentWebAudioNode = modules.webAudioNodes[node.data().parents.split('_')[0]]
        

        const index = gestureCy.nodes().indexOf(node);
        // console.log(gestureData.gesturePoints[index])
        // console.log(currentY, gestureData.min, gestureData.max, gestureData.range, index, gestureData.gesturePoints[index].value)
        let updatedValue
        // check if param is a menu
        if(parentWebAudioNode.parameters[node.data().param].values){
            let menuOptions = parentWebAudioNode.parameters[node.data().param].values
            let menuIndex = Math.floor(invert01(clamp01((newY / gestureCy.height()))) * (menuOptions.length -1))
 
            updatedValue = menuOptions[menuIndex]
        }
        else {
            // param is a knob
            // Update the node value based on its new y position.
            updatedValue = updateNodeValueFromY(newY, gestureData.gesturePoints[0].value, gestureData.range, gestureCy.height());

            
        }        
        
        gestureData.gesturePoints[index].value = updatedValue
        node.data().value = updatedValue

        let gestureNode = gestureData.gesturePoints[index]
        let data = {
            parent: gestureNode.parent,
            param: gestureNode.param,
            value: updatedValue
        }

        // console.log(data)
        sendToMainApp({
            cmd: 'playGesture',
            data: data,
            kind: 'n/a'
        })

        // set displayPointValue in gesture editor toolbar
        const displayValue = document.getElementById('displayPointValue');
        displayValue.textContent = `${gestureNode.param}: ${updatedValue.toFixed(2)}`;

        if(document.getElementById("saveGestureButton").disabled){
            // enable the gesture clone button
            setGestureSaveButtonState(false)
        }
    });


    document.getElementById("gestureEasing").addEventListener("change", (event) => { 

        // set easeFunction
        gestureData.easeFunction = event.target.value
        
        if(gestureData.easeFunction === 'linear'){
            // return the gesture to its original mapping
            gestureData.gesturePoints = gestureData.linearGesturePoints
            createGestureGraph(gestureData.linearGesturePoints)

        } else {
            // apply the selected easing function based on the easeFunctions object
            gestureData.gesturePoints = applyEasing(gestureData.min, gestureData.max, gestureData.range, gestureData.linearGesturePoints, easeFunctions[gestureData.easeFunction]);
            
            // replot the gesture using the easing function
            createGestureGraph(gestureData.gesturePoints)
        }
        
        // switch(event.target.value){
        //     case "linear":
        //         // return the gesture to its original mapping
        //         createGestureGraph(gestureData.linearGesturePoints)
        //         // console.log(gestureData.gesturePoints, gestureData.min, gestureData.max, gestureData.range)
        //     break

        //     case "inverted":
        //         // invert the gesture
        //         const inverted = invertLinearValuesInRange(gestureData.min, gestureData.max, gestureData.range, gestureData.linearGesturePoints);
        //         createGestureGraph(inverted)
        //     break

        //     case "easeIn":
        //         // apply an ease-in function on the data
        //         const easedIn = easeInValuesInRange(gestureData.min, gestureData.max, gestureData.range, gestureData.linearGesturePoints);
        //         createGestureGraph(easedIn)
        //     break

        //     case "easeOut":
        //         // apply an ease-out function on the data
        //         const easedOut = easeOutValuesInRange(gestureData.min, gestureData.max, gestureData.range, gestureData.linearGesturePoints);

        //         createGestureGraph(easedOut)
        //     break

        //     case "easeInOut":
        //         // apply an ease-in-out function on the data
        //         const easedInOut = easeInOutValuesInRange(gestureData.min, gestureData.max, gestureData.range, gestureData.linearGesturePoints);

        //         createGestureGraph(easedInOut)

        //     break
        // }
    })



    // Listen to mousemove events on the document
    document.addEventListener('mousemove', (event) => {
        hid.mouse.x = event.clientX; // Mouse X position
        hid.mouse.y = event.clientY; // Mouse Y position
    });


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
    // const radioButtons = document.querySelectorAll('input[name="traversalMode"]');
    // console.warn('need to setup the sequencer meta control see the associated code')
    // radioButtons.forEach((radio) => {
    //     radio.addEventListener('change', (event) => {
    //         meta = Automerge.change(meta, (meta) =>{
    //             meta.sequencer.traversalMode = event.target.value  
    //         })
    //     });
    // });
    

    // cmd + scroll = scroll vertically through history graph
    document.addEventListener('wheel', function(event) {

        // Check if the mouse is within the bounds of the viewport and that the pan won't exceed the boundaries
        if  (!willExceedPanLimits(event.deltaX, event.deltaY) &&
            hid.mouse.x >= historyCyRectangle.left &&
            hid.mouse.x <= historyCyRectangle.right &&
            hid.mouse.y >= historyCyRectangle.top &&
            hid.mouse.y <= historyCyRectangle.bottom){
                historyDAG_cy.panBy({
                    x: event.deltaX,
                    y: event.deltaY 
                });
            }
        else if  ( 
            hid.mouse.x >= gestureCyRectangle.left &&
            hid.mouse.x <= gestureCyRectangle.right &&
            hid.mouse.y >= gestureCyRectangle.top &&
            hid.mouse.y <= gestureCyRectangle.bottom){
                console.log('pan gesture player')
            }

        
    });

    historyDAG_cy.on('tap', 'node', (event) => {
        if(hid.key.shift){
            // add node to sequencer

        } else {
            highlightNode(event.target)

            // loadVersion(event.target.data().id, event.target.data().branch)
            loadVersion(event.target.data().id, event.target.data().branch)

            selectedNode = event.target.data()
           
            // we want to handle gesture nodes differently than the others
            if(event.target.data().label.split(' ')[0] === 'gesture'){
          
                // node is a gesture
                // store history info
                gestureData.branch = event.target.data().branch
                gestureData.historyID = event.target.data().id
                // get the gestureData from the main app
                sendToMainApp(
                    {
                        cmd: "getGestureData",
                        data: { hash: event.target.data().id, branch: event.target.data().branch, cmd: 'recallGesture' },
                    }
                ); 

                
            } else {
                // clear the gesture player
                // clear the gestureData.nodes
                gestureData.nodes = []

                // Clear the current graph
                gestureCy.elements().remove();
            }
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

        }
        
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

        switch (sequencerMode){
            case 'mono':
                if (isPlaying) {
                    transport.stop();
                    // sequence.stop(0);
                    loop.stop()
                    startStopButton.textContent = "Start Sequencer";
                } else {
                    await Tone.start(); // Required to start audio in modern browsers
        
                    // set the interval length based on this step's note length
                    loop.interval = storedSequencerTable[0].stepLength
                    stepLength = loop.interval
                    transport.start();
                    // sequence.start(0);
                    loop.start(0)
                    startStopButton.textContent = "Stop Sequencer";
                }
                isPlaying = !isPlaying;
            break

            case 'poly':

            break
        }
        
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
        createSequencerTable() 
    });

    document.getElementById('dynamicTableBody').addEventListener('mouseover', (event) => {
        // Find the closest table row from the event target
        const row = event.target.closest('tr');
        // Ensure the row is within the dynamicTableBody
        if (row && document.getElementById('dynamicTableBody').contains(row) && hid.key.cmd) {
            // You can perform your desired actions here

            // Highlight the current step in the table
            const tableRows = document.querySelectorAll("#dynamicTableBody tr");
            tableRows.forEach((row) => row.classList.remove("table-set-step"));
         
            row.classList.add("table-set-step");
            
        }
    });



    // Listen for the select event on nodes
    let historyBoxSelect = true // this is necessary because this event listener fires many times otherwise
    historyDAG_cy.on("boxselect", "node", () => {
        if(historyBoxSelect){

            historyBoxSelect = false


            // first remove the highlighting of any earlier selected nodes:
            const sequencerNodes = historyDAG_cy.nodes('.sequencerNode');
            if(sequencerNodes.length > 0){
                sequencerNodes.forEach((node) => {
                    node.removeClass("sequencerNode");
                });
            }


            let selected = historyDAG_cy.$("node:selected"); // Get all selected nodes
            
            
            historyDAG_cy.edges().removeClass("sequencerEdge");

            if (selected.length > 1) {
                selected.addClass("sequencerNode");

                if(hid.key.cmd){
                    // if the cmd key was held during selection, set these nodes as a gesture
                    // createGestureGraph(selected)
                }else {
                    // if just shift was held down, update the sequencer table
                    // update sequencer table
                    replaceStepSequencerTable(selected)
                }


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

            case 'getGestures':
                populateAnalysisNodeList(historyDAG_cy.nodes(`[label *= "gesture"]`).map((node) => node.data()), 'All Gestures')

            break

            case 'getCables':
                populateAnalysisNodeList(historyDAG_cy.nodes(`[label *= "connect"]`).map((node) => node.data()), 'All Cable Changes')
            break

            case 'getMerges':
                console.warn('getMerges not setup yet')
            break

            case 'getSelectedModule':
                const option = document.getElementById("selectedModuleOption")
                const matchingChanges = historyDAG_cy.nodes().filter((node) => {
                    const parentString = node.data().parents; // Access the 'parent' field in data
                    return parentString.includes(option.text);
                }).map((node) => node.data())
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
    //     const dijkstra = historyDAG_cy.elements().dijkstra({
    //         root: historyDAG_cy.$(`#${sourceNodeID}`),
    //         directed: true
    //     });
    // });

    // document.getElementById("topologicalSortBtn").addEventListener("click", () => {

    //     const sortedNodes = topologicalSort(historyDAG_cy);
    // });

    // document.getElementById("dependenciesBtn").addEventListener("click", () => {
    //     const selectedNode = historyDAG_cy.$("node:selected");
    //     const dependencies = selectedNode.outgoers("node");
    // });

    // document.getElementById("prerequisitesBtn").addEventListener("click", () => {
    //     const selectedNode = historyDAG_cy.$("node:selected");
    //     const prerequisites = selectedNode.incomers("node");
    // });

    // document.getElementById("connectedComponentsBtn").addEventListener("click", () => {
    //     const components = historyDAG_cy.elements().connectedComponents();
    // });

    // document.getElementById("bfsBtn").addEventListener("click", () => {
    //     const bfs = historyDAG_cy.elements().bfs({
    //         roots: historyDAG_cy.$("#sourceNodeID"),
    //         directed: true
    //     });
    // });

    // document.getElementById("dfsBtn").addEventListener("click", () => {
    //     const dfs = historyDAG_cy.elements().dfs({
    //         roots: historyDAG_cy.$("#sourceNodeID"),
    //         directed: true
    //     });
    // });

    // document.getElementById("pageRankBtn").addEventListener("click", () => {
    //     const pageRank = historyDAG_cy.elements().pageRank();
    //     historyDAG_cy.nodes().forEach(node => {
    //     });
    // });

    // document.getElementById("closenessCentralityBtn").addEventListener("click", () => {
    //     const closeness = historyDAG_cy.elements().closenessCentralityNormalized();
    //     historyDAG_cy.nodes().forEach(node => {
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
            // if we requested a gesture, push it to the gesture player as well
            if(selectedNode.label.split(' ')[0] === 'gesture'){

                sendToMainApp(
                    {
                        cmd: "getGestureData",
                        data: { hash: clickedItem.dataset.id, branch: clickedItem.dataset.branch, cmd: 'recallGesture' },
                    }
                ); 

                gestureData.branch = clickedItem.dataset.branch
                gestureData.historyID = clickedItem.dataset.id
            }
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
        const selectedValue = event.target.value; // Get the selected option's value
        setSequenceOrder(selectedValue)
        const update = {
            cmd: 'updateSequencer',
            setting: 'sequenceOrder',
            data: selectedValue,
        }
        sendToMainApp(update)

        

    });

    

    // Add an event listener for the 'change' event
    stepLengthFunctionSelect.addEventListener("change", (event) => {
        const selectedValue = event.target.value; // Get the selected option's value
        setStepLengthFunction(selectedValue)
        const update = {
            cmd: 'updateSequencer',
            setting: 'stepLengthFunction',
            data: selectedValue,
        }
        sendToMainApp(update)
 

        
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

    function highlightGestureNode(target){

        if(gestureHighlightedNode){
            gestureHighlightedNode.removeClass('highlighted');
            gestureHighlightedNode = target
            target.addClass('highlighted');
        }
        else {
            gestureHighlightedNode = target;
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

    function removeElementsBySubstring(array, substring) {
        return array.filter(element => !element.toLowerCase().includes(substring.toLowerCase()));
    }

    function getSubstringBeforeLastInstanceOf(input, condition) {
        const lastIndex = input.lastIndexOf(condition);
        if (lastIndex === -1) {
            return input; // Return the full string if condition is not found
        }
        return input.substring(0, lastIndex);
    }

    function scaleKnob(value, inputMin, inputMax, outputMin, outputMax){
        return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
    }

    function scaleMenu(value, inputMin, inputMax, outputMin, outputMax){}

    function roundToHundredth(value) {
        return Math.round(value * 100) / 100;
    }

    function calculateAverageDistance() {
        const nodes = gestureCy.nodes();
        const n = nodes.length;
        
        let totalDistance = 0;
        let pairCount = 0;

        nodes.forEach((node1) => {
            const dijkstra = gestureCy.elements().dijkstra({
                root: node1,
                weight: (edge) => edge.data('weight') || 1, // Edge weight, default to 1
                directed: false, // Change to true if your graph is directed
            });

            nodes.forEach((node2) => {
                if (node1 !== node2) {
                    const distance = dijkstra.distanceTo(node2);
                    if (distance < Infinity) { // Ensure the nodes are reachable
                        totalDistance += distance;
                        pairCount++;
                    }
                }
            });
        });

        return pairCount > 0 ? totalDistance / pairCount : 0; // Avoid division by zero
    }

   

    function parseParamUpdate(str) {
        const firstSpace = str.indexOf(' ');
        const equalsSign = str.indexOf('=');
        const lastSpace = str.lastIndexOf(' ');
      
        if (firstSpace === -1 || equalsSign === -1 || lastSpace === -1) return null;
      
        const paramName = str.slice(firstSpace + 1, equalsSign).trim();
        const paramValue = parseFloat(str.slice(equalsSign + 1, lastSpace).trim());
        const moduleName = str.slice(lastSpace + 1).trim();
      
        return [paramName, paramValue, moduleName];
      }
      
    
    // *
    // *
    // * SCALING / INTERPOLATION / EASING
    // * 
    // *

    function updateNodeValueFromY(newY, value, gestureRange, viewportHeight) {
        // Calculate the new value based on the new y position
        const newValue = (value + gestureRange * (1 - newY / viewportHeight));
        
        return newValue;
    }

    function setGestureSaveButtonState(state){
        // enable the gesture clone button
        document.getElementById("saveGestureButton").disabled = state;
    }

    const clamp01 = (value) => Math.max(0, Math.min(1, value));
    const invert01 = (value) => 1 - value;

    // EASING FUNCTIONS FOR GESTURE EDITOR
    function applyEasing(min, max, range, data, easingFn) {
        return data.map(entry => {
          const normalized = (entry.value - min) / range;
          const eased = easingFn(normalized);
          const remapped = min + eased * range;
      
          return { ...entry, value: remapped };
        });
      }

      function convertParams(storedParam, targetParam, value){

        let data;

        // map knob onto a knob
        if(storedParam.ui === 'knob' && targetParam.kind === 'knob'){
            // source and destination params are both knobs
            let inputMin = storedParam.min
            let inputMax = storedParam.max
            
            let outputMin = targetParam.range.min
            let outputMax = targetParam.range.max
            // (value, inputMin, inputMax, outputMin, outputMax)
            let scaledValue = roundToHundredth(scaleKnob(value, Number(inputMin), Number(inputMax), Number(outputMin), Number(outputMax)))
            

            data = {
                parent: targetParam.parent,
                param: targetParam.param,
                value: scaledValue
            }

        }
        // map knob onto a menu 
        else if(storedParam.ui === 'knob' && targetParam.kind === 'menu'){
            // source is a knob
            let inputMin = storedParam.min
            let inputMax = storedParam.max
            // destination is a menu
            let options = targetParam.range.split(',')
            let outputMin = 0
            let outputMax = options.length - 1

            // (value, inputMin, inputMax, outputMin, outputMax)
            let optionIndex = Math.floor(scaleKnob(value, Number(inputMin), Number(inputMax), Number(outputMin), Number(outputMax)))

            data = {
                parent: targetParam.parent,
                param: targetParam.param,
                value: options[optionIndex]
            }
            
        } 
        // map menu onto a menu
        else if(storedParam.ui === 'menu' && targetParam.kind === 'menu'){

            let sourceOptions = storedParam.values
            
            let inputMin = 0
            let inputMax = sourceOptions.length - 1

            let options = targetParam.range.split(',')
            let outputMin = 0
            let outputMax = options.length - 1

            // (value, inputMin, inputMax, outputMin, outputMax)
            let optionIndex = Math.floor(scaleKnob(sourceOptions.indexOf(value), Number(inputMin), Number(inputMax), Number(outputMin), Number(outputMax)))

            data = {
                parent: targetParam.parent,
                param: targetParam.param,
                value: options[optionIndex]
            }

        } 
        // map menu onto a knob
        else if(storedParam.ui === 'menu' && targetParam.kind === 'knob'){
            
            let sourceOptions = storedParam.values
            let menuIndex = sourceOptions.indexOf(value)
            let inputMin = 0
            let inputMax = sourceOptions.length - 1

            let outputMin = targetParam.range.min
            let outputMax = targetParam.range.max

            // (value, inputMin, inputMax, outputMin, outputMax)
            let scaledValue = roundToHundredth(scaleKnob(menuIndex, Number(inputMin), Number(inputMax), Number(outputMin), Number(outputMax)))

            data = {
                parent: targetParam.parent,
                param: targetParam.param,
                value: scaledValue
            }

        }

        return data
    }

})



