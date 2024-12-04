//*
//*
//* INITIALIZATION AND SETUP
//* Set up dependencies, initialize core variables
//*


import { ParentNode } from './parentNode.js';

import { ParentNode_WebAudioNode } from './parentNode_WebAudioNode.js';
import modules from './src/modules/modules.json' assert { type: 'json'}
import { uuidv7 } from "uuidv7";
import randomColor from 'randomcolor';
import dagre from 'cytoscape-dagre';
import { saveDocument, loadDocument, deleteDocument } from './utilities/indexedDB.js';
import { marked } from 'marked'

import * as Tone from "tone";

import * as speaker from "./speaker.json"
const historyGraphWorker = new Worker("./workers/historyGraphWorker.js");

const speakerModule = speaker.default

// TODO: look for comments with this: //* old -repo version 
// TODO: when new automerge implementation is working, remove their related code sections


const transport = Tone.getTransport();

// * Audio 
const rnboDeviceCache = new Map(); // Cache device definitions by module type
let audioGraphDirty = false
let synthWorklet; // the audioWorklet for managing and running the audio graph

// * History Sequencer
let currentIndex = 0;

// * new automerge implementation
let Automerge;
let amDoc = null
let docID = null
let saveInterval = 1000; // how frequently to store the automerge document in indexedDB
let onChange; // my custom automerge callback for changes made to the doc
let docUpdated = false // set this to true whenever doc has changed so that indexedDB will store it. after set it back to false
let automergeDocuments = {
    newClone: false,
    current: {
        doc: null,
        hash: null
    },
    otherDocs: {

    }
}

let firstBranchName = 'main'
let previousHash;
let meta;
let branches = {
    // branchName: {
        // head: hash
        // root: hash (the node that it started from)
    //}
}
let historyBoundingBox;
let selectedHistoryNodes = []
let historySelectionBoxStatus = false
let existingHistoryNodeIDs
let historyHighlightedNode = null
let historySequencerHighlightedNode = null
let isDraggingEnabled = false;
let moduleDragState = false;

let highlightedNode = null
let heldModule = null
let heldModulePos = { x: null, y: null }

let allowMultiSelect = false;
let allowPan = false;

let isSliderDragging = false;
let currentHandleNode;


// store the heads of all branches
// todo: decide if we should store this in the automerge doc? (consideration: for now it's mostly likely just needed for the history graph)
let branchHeads = {
    current: null,
    previous: null
    // then store all of them here
    // i.e. 'hash': { dependencies: [], mergeHash: null }
}

// * CYTOSCAPE

// double-clicking
let lastClickTime = 0;
const doubleClickDelay = 300; // Delay in milliseconds to register a double-click

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

// * old automerge-repo stuff
// todo: phase out

let handle;
let history;

// automerge methods made global:
let applyNewChanges
let retrieveHistory;
let automergeInit;
let automergeEncodeChange;
let automergeDocument;
let repo;
let getClone;

let historyNodes = []
let previousHistoryLength = 0;





let peers = {
    local: {
        mousePointer: { 
            position: { x: null, y: null },
            shape: null,
        },
        id: null
    },
    remote: {

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
// temporary cables
let temporaryCables = {
    local: {
        source: null,
        ghostNode: null,
        tempEdge: null,
        targetNode: null

    }, 
    
    peers: {
        // example peer pseudocode
        /*'peerID-645': {
            source: null,
            ghostNode: 'cy.add({create ghost node here})',
            ghostEdge: 'cy.add...',
        }*/
    }
}


// *
// *
// *    APP
// *
// *

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('viewReadme').addEventListener('click', () => {
        fetch('./README.md') // Fetch the README file
            .then(response => response.text())
            .then(markdown => {
                const html = marked(markdown); // Convert Markdown to HTML
                const newTab = window.open(); // Open a new tab
                newTab.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>README</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
                            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                            h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; }
                            a { color: #0366d6; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                    </html>
                `);
                newTab.document.close();
            })
            .catch(err => console.error('Error fetching README:', err));
    });


    //*
    //*
    //* CONFIGURE CYTOSCAPE INSTANCES
    //* 
    //*

    const cy = cytoscape({
        container: document.getElementById('cy'),

        elements: [], // Start with no elements; add them dynamically

        layout: {
            name: 'preset', // Preset layout allows manual positioning
            
        },
        fit: false,
        resize: false,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(bgcolour)',
                    'label': 'data(label)', // Use the custom label attribute
                    'font-size': '18px',
                    'width': 30,
                    'height': 30,
                    'color': '#000',            // Label text color
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'left',      // Horizontally align label to the left of the node
                    'text-margin-x': -10, // Optional: Move the label slightly up if desired
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
                }
            },
            {
                selector: 'node[bgcolour]',
                style: {
                    'background-color': 'data(bgcolour)'
                }
            },
            {
                selector: 'node[kind = "input"]',
                style: {
                    'shape': 'triangle' // set this for accessibility (colour blindness)
                }
            },
            {
                selector: 'node[kind = "output"]',
                style: {
                    'shape': 'rectangle' // set this for accessibility (colour blindness)
                }
            },

            {
                selector: ':parent',
                style: {
                    'background-opacity': 0.333,
                    'background-color': '#F5A45D',
                    'border-color': '#F57A41',
                    'border-width': 1,
                    'label': 'data(label)', // Use the node id or any data field as the label
                    'text-valign': 'top', // Position label at the top
                    'text-halign': 'center', // Center label horizontally
                    'color': '#FF0000', // Set the label text color
                    'font-size': 20, // Adjust font size if needed
                    'text-margin-y': -10, // Optional: Move the label slightly up if desired
                
                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#228B22', // Highlight color
                    'border-width': 10
                }
            },
            {
                selector: 'node.ghostNode', // this is used when we create a temporary cable
                style: {
                    'background-color': '#FFFFFF', // Give ghostNode a neutral color
                    'opacity': 0.8, // Make ghost node semi-transparent
                    'width': 27,
                    'height': 27,
                    'border-width': 0, // Remove border for ghostNode
                    'label': ''
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 6,
                    'line-color': '#ccc',
                    'target-arrow-shape': 'triangle',

                    'source-arrow-shape': 'triangle', // Adds a circle at the start
                    'source-arrow-color': '#000',
                    'target-arrow-color': '#000',
                    'target-arrow-width': 20, // Size of the target endpoint shape
                    'source-arrow-width': 50, // Size of the source endpoint shape

                    'curve-style': 'unbundled-bezier',
                    'control-point-weights': [0.25, 0.75], // Control the curve points
                    'control-point-distances': [20, -20], // Adjust distances from the line
                }
            },
            {
                selector: 'edge.highlighted',
                style: {
                    'line-color': '#FF0000',           // Highlight color
                    'target-arrow-color': '#FF0000',    // Highlight arrow color
                    'source-arrow-color': '#FF0000',
                    'width': 10  
                }
            },
            {
                selector: '.peerPointer',
                style: {
                    'background-color': 'data(colour)', // Color for the remote peer's mouse node
                    'width': 15,
                    'height': 15,
                    'shape': 'star',
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'right',      // Horizontally align label to the left of the node
                    'text-margin-x': 10, // Optional: Move the label slightly up if desired
                }
            },
            {
                selector: '.sliderTrack',
                style: {
                    'background-color': '#ddd', // Color for the remote peer's mouse node
                    'shape': 'rectangle',
                        'width': 'data(length)',
                        'height': 10,
                        'border-color': '#999',
                        'border-width': 1,
                        'label': 'data(label)', // Remove label for track
                        'text-valign': 'center',    // Vertically center the label
                        'text-halign': 'left', 
                        'text-margin-y': -20,
                        'text-margin-x': 70,
                        'text-opacity': 1, // Ensure no text is shown
                        'outline-width': 0, // Remove focus outline
                        // 'user-select': 'none', // Prevent text selection
                        // 'pointer-events': 'none' // Disable pointer events on the track
                }
            },
            {
                selector: '.sliderHandle',
                style: {
                    'background-color': '#4CAF6F',
                    'shape': 'ellipse',
                    'width': 20,
                    'height': 20,
                    'label': '', // Remove label for handle
                    'text-opacity': 0, // Ensure no text is shown
                    'outline-width': 0, // Remove focus outline
                    // 'user-select': 'none', // Prevent text selection
                    // 'pointer-events': 'auto' // Enable pointer events for handle
                }
            },
            {
                selector: '.sliderLabel',
                style: {
                    'background-color': '#4CAF6F',
                    'background-opacity': 0, // Transparent background
                    'color': '#333', // Dark text color for good contrast
                    'font-size': 12, // Adjust font size as needed
                    'text-halign': 'right', // Center the text horizontally
                    'text-valign': 'center', // Center the text vertically
                    'text-margin-x': -60, // Adjust the margin to position the label above the slider
                    'text-margin-y': -10, // Adjust the margin to position the label above the slider
                    'font-weight': 'bold', // Make the label stand out
                    // 'pointer-events': 'none', // Prevent interaction with the label
                    'text-background-opacity': 1, // Background for readability (set to 0 if not needed)
                    'text-background-color': '#FFFFFF', // Light background for better visibility
                    'text-background-padding': 2, // Add slight padding to the background
                    'border-width': 0 // No border around the label
                }
            }

            // .selector(`#${sliderTrackId}`)
            // .style({
            //     'background-color': '#ddd',
            //     'shape': 'rectangle',
            //     'width': config.length,
            //     'height': 10,
            //     'border-color': '#999',
            //     'border-width': 1,
            //     'label': '', // Remove label for track
            //     'text-opacity': 0, // Ensure no text is shown
            //     'outline-width': 0, // Remove focus outline
            //     'user-select': 'none', // Prevent text selection
            //     'pointer-events': 'none' // Disable pointer events on the track
            // })


        ]
    });

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
    //*
    //*
    //* DOCUMENT & HISTORY MANAGEMENT 
    //* Implement functions for creating, updating, patching, and reverting document states.
    //*


    //* NEW AUTOMERGE IMPLEMENTATION
    (async () => {
        // Load Automerge asynchronously and assign it to the global variable
        Automerge = await import('@automerge/automerge');
        
        // Forking Paths meta document:
        // contains all branches and branch history
        // will probably eventually contain user preferences, etc. 
        meta = await loadDocument('meta');
        if (!meta) {
            meta = Automerge.from({
                title: "Forking Paths System",
                branches: {},
                branchOrder: [],
                docs: {},
                head: {
                    hash: null,
                    branch: null
                },
                
                userSettings: {
                    focusNewBranch:false 
                },
                sequencer: {
                    bpm: 120,
                    ms: 500,
                    traversalMode: 'Sequential'
                },
                synth: {
                    rnboDeviceCache: null,
                },

            })
            
            // meta = Automerge.change(meta, (meta) => {
            //     meta.title = "Forking Paths System";
            //     meta.branches = {};
            //     meta.branchOrder = []
            //     meta.docs = {}
            //     meta.head = {
            //         hash: null,
            //         branch: null
            //     },
                
            //     meta.userSettings.focusNewBranch = false
            // });
            
            await saveDocument('meta', Automerge.save(meta));

        } else {
            // If loaded, convert saved document state back to Automerge document
            meta = Automerge.load(meta);

            if(!meta.sequencer){

                meta = Automerge.change(meta, (meta) => {
                    meta.sequencer = {
                        bpm: 120
                    }
                });
            }
            
        }

        // * synth changes document
        docID = 'forkingPathsDoc'; // Unique identifier for the document
        // Load the document from meta's store in IndexedDB or create a new one if it doesn't exist

        
        // amDoc = await loadDocument(docID);
        // if meta doesn't contain a document, create a new one
        if (!meta.docs[meta.head.branch]) {
            amDoc = Automerge.init();
            let amMsg = makeChangeMessage(firstBranchName, 'blank_patch')
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
                amDoc.title = firstBranchName;
                amDoc.elements = [],
                amDoc.synth = {
                    graph:{
                        modules: {
                        },
                        connections: []
                    }
                }

            });
            let hash = Automerge.getHeads(amDoc)[0]
            previousHash = hash
            branches[amDoc.title] = {
                head: hash,
                root: hash
            }
            
            meta = Automerge.change(meta, (meta) => {
                meta.branches[amDoc.title] = {
                    head: hash,
                    root: null,
                    parent: null,
                    // doc: amDoc,
                    history: [ {hash: hash, parent: null, msg: 'blank_patch'} ] 
                }
                
                // encode the doc as a binary object for efficiency
                meta.docs[amDoc.title] = Automerge.save(amDoc)
                meta.head.branch = firstBranchName
                meta.head.hash = hash 
                meta.branchOrder.push(amDoc.title)
                
            });
            // set the document branch (aka title) in the editor pane
            document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;


            reDrawHistoryGraph()

            await saveDocument('meta', Automerge.save(meta));
        } else {
            // meta does contain at least one document, so grab whichever is the one that was last looked at
            
            amDoc = Automerge.load(meta.docs[meta.head.branch]);
            // // store previous head in heads obj
            // branchHeads[branchHeads.current] = {}
            // // update current head to this hash
            // branchHeads.current = meta.head.hash
            // // Step 3: Add node in Cytoscape for this clone point
            // // get info about targetNode (what was clicked by user)
            // branchHeads.previous = Automerge.getHeads(amDoc)[0]

            updateCytoscapeFromDocument(amDoc);
            
            previousHash = meta.head.hash
            

            reDrawHistoryGraph()

            // ion this case we want the highlighted node to be on the current branch
            highlightNode(historyDAG_cy.getElementById(meta.head.hash))

            syncAudioGraph(amDoc.synth.graph)
            // set the document branch (aka title)  in the editor pane
            document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;
        }
        addSpeaker()
        // syncAudioGraph(audioGraphMockup2);
    })();

    // Set an interval to periodically save meta to IndexedDB
    setInterval(async () => {
        if(meta){
            // await saveDocument(docID, Automerge.save(amDoc));
            await saveDocument('meta', Automerge.save(meta));
            docUpdated = false
        }

    }, saveInterval);

    // Custom function to handle document changes and call a callback
    function applyChange(doc, changeCallback, onChangeCallback, changeMessage) {
        
        
        // check if we are working from a newly cloned doc or if branch is in head position
        if(automergeDocuments.newClone === false ){
            
            let amMsg = makeChangeMessage(amDoc.title, changeMessage)
            // we are working from a head

            // grab the current hash before making the new change:
            previousHash = Automerge.getHeads(amDoc)[0]
            
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);
            
            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {
                
                let hash = Automerge.getHeads(amDoc)[0]
                
                meta = Automerge.change(meta, (meta) => {

                    // Initialize the branch metadata if it doesn't already exist
                    if (!meta.branches[amDoc.title]) {
                        meta.branches[amDoc.title] = { head: null, history: [] };
                    }
                    // Update the head property
                    meta.branches[amDoc.title].head = hash;

                    // Push the new history entry into the existing array
                    meta.branches[amDoc.title].history.push({
                        hash: hash,
                        parent: previousHash,
                        msg: changeMessage

                    });
                    
                    // encode the doc as a binary object for efficiency
                    meta.docs[amDoc.title] = Automerge.save(amDoc)
                    // store the HEAD info
                    meta.head.hash = hash
                    meta.head.branch = amDoc.title
                    
                });
                
                onChangeCallback(amDoc);
            }

            return amDoc;
        } else {
            // player has made changes to an earlier version, so create a branch and set amDoc to new clone

            // store previous amDoc in automergeDocuments, and its property is the hash of its head
            automergeDocuments.otherDocs[amDoc.title] = amDoc
            // set amDoc to current cloned doc
            amDoc = Automerge.clone(automergeDocuments.current.doc)
            // use the new branch title
            let amMsg = makeChangeMessage(amDoc.title, changeMessage)

            // grab the current hash before making the new change:
            previousHash = Automerge.getHeads(amDoc)[0]
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);
            let hash = Automerge.getHeads(amDoc)[0]
            
            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {   
                
                meta = Automerge.change(meta, (meta) => {

                    // Initialize the branch metadata if it doesn't already exist
                    // if (!meta.branches[amDoc.title]) {
                    //     meta.branches[amDoc.title] = { head: null, parent: null, history: [] };
                        
                    // }
                    // Update the head property
                    meta.branches[amDoc.title].head = hash;

                    // Push the new history entry into the existing array
                    meta.branches[amDoc.title].history.push({
                        hash: hash,
                        msg: changeMessage,
                        parent: previousHash
                    });
                    // store current doc
                    meta.docs[amDoc.title] = Automerge.save(amDoc)
                    
                    // store the HEAD info
                    meta.head.hash = hash
                    meta.head.branch = amDoc.title

                    // store the branch name so that we can ensure its ordering later on
                    meta.branchOrder.push(amDoc.title)
                });
               
                // makeBranch(changeMessage, Automerge.getHeads(newDoc)[0])
                onChangeCallback(amDoc);
                automergeDocuments.newClone = false
                panToBranch(historyDAG_cy.getElementById(hash))
            }
            
            return amDoc;

        }


    }

    // define the onChange Callback
    onChange = () => {
        // update synth audio graph
        // loadSynthGraph()
        // You can add any additional logic here, such as saving to IndexedDB

        // set docUpdated so that indexedDB will save it
        docUpdated = true
        // store the current hash (used by historyDAG_cy)

        branchHeads.current = Automerge.getHeads(amDoc)[0]
       
        // update the historyGraph
        reDrawHistoryGraph()

        if(audioGraphDirty){
            syncAudioGraph(amDoc.synth.graph)
            audioGraphDirty = false
        }
    };
    
    // save forking paths doc (meta) to disk
    function saveAutomergeDocument(fileName) {
        // Generate the binary format of the Automerge document
        const binaryData = Automerge.save(meta);

        // Create a Blob object for the binary data
        const blob = new Blob([binaryData], { type: 'application/octet-stream' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;

        // Optionally, add the link to the DOM and simulate a click
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url); // Release memory
    }

    // save meta to user's computer as .forkingpaths
    async function saveFile(suggestedFilename) {
        // Show the file save dialog
        const fileName = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [
                {
                    description: "Forking Paths CRDT Files",
                    accept: { "application/x-fpsynth": [".fpsynth"] }
                },
            ],
        });
        
        // Create a Blob object for the binary data
        const blob = new Blob([Automerge.save(meta)], { type: 'application/octet-stream' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName.name;

        // Optionally, add the link to the DOM and simulate a click
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url); // Release memory

        // // Write the content to the file
        // const writable = await fileHandle.createWritable();
        // await writable.write(Automerge.save(meta));
        // await writable.close();
    }

    /* 

        SYNTH CYTOSCAPE

    */

    // Function to update Cytoscape with the state from forkedDoc
    function updateCytoscapeFromDocument(forkedDoc) {
           
        let elements = forkedDoc.elements

        // Clear existing elements from Cytoscape instance
        cy.elements().remove();


        // 3. Add new elements to Cytoscape
        cy.add(elements)
        
        // Finally, run layout
        cy.layout({ name: 'preset', fit: false }).run(); // `preset` uses the position data directly  
    }    
    

    /*

        DOCUMENT HISTORY CYTOSCAPE (DAG)
    */
 
    function reDrawHistoryGraph(){


        if (!existingHistoryNodeIDs || existingHistoryNodeIDs.size === 0){
            existingHistoryNodeIDs = new Set(historyDAG_cy.nodes().map(node => node.id()));
        }
        
        historyGraphWorker.onmessage = (event) => {
            const { nodes, edges, historyNodes } = event.data;
            
            if(nodes.length > 0){
                historyDAG_cy.add(nodes);
            }
            if(edges.length > 0){
                historyDAG_cy.add(edges);

            }
            existingHistoryNodeIDs = historyNodes

            // Refresh graph layout
            historyDAG_cy.layout(graphLayouts[graphStyle]).run();
            
            highlightNode(historyDAG_cy.nodes().last())
            // update the current history node ids for the next time we run this function
            // existingHistoryNodeIDs = new Set(cy.nodes().map(node => node.id()));
        };
        
        // Send data to the worker to get any position or parameter updates
        historyGraphWorker.postMessage({ meta, existingHistoryNodeIDs, docHistoryGraphStyling });      



        /*
        // Accessing branches in order, create nodes and edges for each branch
        meta.branchOrder.forEach((branchName) => {            
            const branch = meta.branches[branchName];

            // iterate over each history item in the branch
            branch.history.forEach((item, index) => {
                const nodeId = item.hash
                // 4. Check if the node already exists in the history graph
                if (!existingHistoryNodeIDs.has(nodeId)) {
                    
                    // add node to the history graph
                    historyDAG_cy.add({
                        group: 'nodes',
                        data: { id: nodeId, label: item.msg, color: docHistoryGraphStyling.nodeColours[item.msg.split(' ')[0]], branch: branchName }
                    });

                    // If the history item has a parent, add an edge to connect the parent
                    if (item.parent) {
                        // Make sure the parent node also exists before adding the edge
                        if (existingHistoryNodeIDs.has(item.parent)) {
                            historyDAG_cy.add({
                                group: 'edges',
                                data: {
                                    id: `${item.parent}_to_${nodeId}`,
                                    source: item.parent,
                                    target: nodeId
                                }
                            });
                        }
                    }

                    // Add the newly added node's ID to the set to track it
                    existingHistoryNodeIDs.add(nodeId);

                }
            });            
        });
        
        
        // Refresh graph layout
        historyDAG_cy.layout(graphLayouts[graphStyle]).run();
    
        highlightNode(historyDAG_cy.nodes().last())
        // update the current history node ids for the next time we run this function
        // existingHistoryNodeIDs = new Set(cy.nodes().map(node => node.id()));
        */
    }
    
    // Load a version from the DAG
    async function loadVersion(targetHash, branch) {
        
        // get the head from this branch
        let head = meta.branches[branch].head

        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(amDoc, [targetHash]);
        // Check if we're on the head; reset clone if true (so we don't trigger opening a new branch with changes made to head)
        if (Automerge.getHeads(historicalView)[0] === Automerge.getHeads(amDoc)[0]){
            automergeDocuments.newClone = false
            updateCytoscapeFromDocument(historicalView);

            meta = Automerge.change(meta, (meta) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
            });

            return
        } 
        // if the head of a branch was clicked, we need to load that branch's full history (which traces all the way back to the blank_patch node (root))
        else if (targetHash === head){
            // retrieve the document from the binary store
            let branchDoc = loadAutomergeDoc(branch)    
            let clonedDoc = Automerge.clone(branchDoc)

            automergeDocuments.current = {
                doc: clonedDoc,
                hash: [targetHash],
                history: getHistoryProps(clonedDoc)

                
            }

            meta = Automerge.change(meta, (meta) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
            });

            // set newClone to true
            automergeDocuments.newClone = true

            // update current head to this hash
            branchHeads.current = targetHash
            // Step 3: Add node in Cytoscape for this clone point
            // get info about targetNode (what was clicked by user)
            branchHeads.previous = Automerge.getHeads(amDoc)[0]

            updateCytoscapeFromDocument(branchDoc);
        } 
        // this is necessary for loading a hash on another branch that ISN'T the head
        else if (branch != amDoc.title) {

            // load this branch's doc
            let branchDoc = loadAutomergeDoc(branch)

            // and then point it at target hash's poisiton in history
            const historicalView = Automerge.view(branchDoc, [targetHash]);

            automergeDocuments.current = {
                doc: branchDoc,
                hash: [targetHash],
                history: getHistoryProps(amDoc)

                
            }

            meta = Automerge.change(meta, (meta) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
            });
            // set newClone to true
            automergeDocuments.newClone = true
        
            // store previous head in heads obj
            branchHeads[branchHeads.current] = {}
            // update current head to this hash
            branchHeads.current = targetHash
            // Step 3: Add node in Cytoscape for this clone point
            // get info about targetNode (what was clicked by user)
            branchHeads.previous = Automerge.getHeads(amDoc)[0]

            updateCytoscapeFromDocument(historicalView);

        }
        // the selected hash belongs to the current branch
        else {
            let clonedDoc = Automerge.clone(historicalView)

            clonedDoc.title = uuidv7();
            branches[clonedDoc.title] = {
                head: null,
                root: targetHash
            }

            meta = Automerge.change(meta, (meta) => {
                meta.branches[clonedDoc.title] ={
                    head: null,
                    parent: targetHash,
                    // doc: clonedDoc,
                    history: []
                }
                meta.docs[clonedDoc.title] = {}
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
            });

            automergeDocuments.current = {
                doc: clonedDoc,
                hash: [Automerge.getHeads(clonedDoc)[0]],
                history: getHistoryProps(amDoc)

                
            }
            // set newClone to true
            automergeDocuments.newClone = true
        
            // store previous head in heads obj
            branchHeads[branchHeads.current] = {}
            // update current head to this hash
            branchHeads.current = Automerge.getHeads(historicalView)[0]
            // Step 3: Add node in Cytoscape for this clone point
            // get info about targetNode (what was clicked by user)
            branchHeads.previous = Automerge.getHeads(amDoc)[0]
          
            updateCytoscapeFromDocument(historicalView);
        }


        
        

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
                loadVersion(node.data().historyNode.data().id, node.data().historyNode.data().branch); // Your custom logic
                highlightNode(node.data().historyNode); // Your custom logic
                highlightSequencerNode(node)
            }
            currentNode = node
            // Move to the next step
            currentIndex = (currentIndex + 1) % sequencerNodes.length;
        }
    }, "8n"); // Repeat every eighth note


    //TODO OLD AUTOMERGE-REPO IMPLEMENTATION, PHASE IT OUT EVENTUALLY
    // Import dependencies dynamically
    // (async () => {
    //     const { DocHandle, Repo, isValidAutomergeUrl, DocumentId, Document } = await import('@automerge/automerge-repo');
    //     const { BrowserWebSocketClientAdapter } = await import('@automerge/automerge-repo-network-websocket');
    //     const { IndexedDBStorageAdapter } = await import("@automerge/automerge-repo-storage-indexeddb");
        
    //     const storage = new IndexedDBStorageAdapter("automerge");
    //     // Initialize the Automerge repository with WebSocket adapter
    //     repo = new Repo({
    //         network: [new BrowserWebSocketClientAdapter('ws://localhost:3030')],
    //         // storage: LocalForageStorageAdapter, // Optional: use a storage adapter if needed
    //         storage: storage, // Optional: use a storage adapter if needed
    //     });

    //     automergeDocument = Document

    //     // Create or load the document
    //     // Initialize or load the document with a unique ID
    //     // Check for a document URL in the fragment
    //     let docUrl = decodeURIComponent(window.location.hash.substring(1));
        


    //     try {
    //         if (docUrl && isValidAutomergeUrl(docUrl)) {
    //             // Attempt to find the document with the provided URL
    //             handle = repo.find(docUrl);
    //         } else {
    //             throw new Error("No document URL found in fragment.");
    //         }
    //     } catch (error) {
    //         // If document is not found or an error occurs, create a new document
    //         handle = repo.create({
    //             elements: []
    //         }, {
    //             message: 'set array: elements'
    //         });
    //         docUrl = handle.url;

    //         // Update the window location to include the new document URL
    //         window.location.href = `${window.location.origin}/#${encodeURIComponent(docUrl)}`;
    //     }

    //     window.location.href = `${window.location.origin}/#${encodeURIComponent(handle.url)}`;
    //     // Wait until the document handle is ready
    //     await handle.whenReady();

    //     // Check if a peer ID is already stored in sessionStorage
    //     peers.local.id = sessionStorage.getItem('localPeerID');

    //     if (!peers.local.id) {
    //         // Generate or retrieve the peer ID from the Automerge-Repo instance
    //         peers.local.id = repo.networkSubsystem.peerId;

    //         // Store the peer ID in sessionStorage for the current tab session
    //         sessionStorage.setItem('localPeerID', peers.local.id);
    //     } else { }
        
    //     handle.docSync().elements
    //     // Populate Cytoscape with elements from the document if it exists
    //     if (handle.docSync().elements && handle.docSync().elements.length > 0) {
    //         let currentGraph = handle.docSync().elements
    //         for(let i = 0; i< currentGraph.length; i++){
    //             cy.add(currentGraph[i]);
    //         }
            
    //         cy.layout({ name: 'preset' }).run(); // Run the layout to position the elements
    //     }
    //     cy.layout({ name: 'preset' }).run();

    //     handle.on('change', (newDoc) => {
    //         // Compare `newDoc.elements` with current `cy` state and update `cy` accordingly
    //         const newElements = newDoc.doc.elements;
            
    //         // Add or update elements
    //         newElements.forEach((newEl) => {
    //             if (!cy.getElementById(newEl.data.id).length) {
    //                 // Add new element if it doesn't exist
    //                 cy.add(newEl);
    //             }
    //         });
            
    //         // Remove elements that are no longer in `newDoc`
    //         cy.elements().forEach((currentEl) => {
    //             if (!newElements.find(el => el.data.id === currentEl.id())) {
                    
    //                 cy.remove(currentEl);
    //             }
    //         });

    //         // Optionally, re-run the layout if needed
            
            
    //     })



 

        // // get document history
        // const { getHistory, applyChanges, init, encodeChange, clone } = await import ('@automerge/automerge');
        // retrieveHistory = getHistory; // assign method to global variable
        // applyNewChanges = applyChanges
        // automergeInit = init
        // automergeEncodeChange = encodeChange
        // getClone = clone
        // try {
        //     const currentDoc = handle.docSync();
        //     if (!currentDoc) {
        //         console.error('Document not properly loaded.');
        //         return;
        //     }
    
            // Extract the history from the document using the latest Automerge
            // * automerge version
            //! note that i moved it to the automerge init asyc function

            // * -repo version
            /*
            history = getHistory(currentDoc);
            if (!history || history.length === 0) {
                console.error('No history available for the document.');
            } else {
                const elements = [];

                // Track existing node IDs
                const nodeIds = new Set();

                // Create nodes for each change in the history
                history.forEach((entry) => {

                    // Serialize the change data and store it in the node's data object
                    let serializedChange;
                    try {
                        serializedChange = entry.change.bytes || entry.change.raw || encodeChange(entry.change);
                    } catch (error) {
                        console.error(`Error serializing change at index:`, error);
                        return; // Skip this change if it can't be serialized
                    }
                    
                    const nodeId = entry.change.hash;
                    nodeIds.add(nodeId);
                    let bgColour = "#ccc"
                    // set the node colours according to the edit type
                    if(entry.change.message){
                        bgColour = docHistoryGraphStyling.nodeColours[entry.change.message.split(' ')[0]]
                    }
                    
                    elements.push({
                        data: {
                            id: nodeId,
                            label: entry.change.message || 'new document',
                            actor: entry.change.actor,
                            color: bgColour,
                            serializedChange: serializedChange
                        },
                        classes: 'node'
                    });
                    historyNodes.push({
                        data: {
                            id: nodeId,
                            label: entry.change.message || 'new document',
                            actor: entry.change.actor,
                            color: bgColour,
                            serializedChange: serializedChange
                        },
                        classes: 'node'
                    })
                });

                // Create edges based on dependencies between changes
                history.forEach(entry => {                
                    entry.change.deps.forEach(dep => {
                        if (entry.change.hash && dep && nodeIds.has(dep) && nodeIds.has(entry.change.hash)) {
                            elements.push({
                                data: {
                                    id: `${entry.change.hash}-${dep}`,
                                    source: dep,
                                    target: entry.change.hash
                                },
                                classes: 'edge'
                            });
                            
                        } else {
                            console.warn(`Skipping edge creation: ${entry.changeHash}-${dep} because one or both nodes do not exist`);
                        }
                    });
                });
                // Add elements to Cytoscape
                // historyDAG_cy.add(elements);
                // historyDAG_cy.layout({ name: 'dagre', rankDir: 'BT' }).run();
                // previousHistoryLength = history.length


            }

            */
        // } catch (error) {
        //     console.error('Error extracting or visualizing history:', error);
        // }
                

    //*
    //*
    //* SYNCHRONIZATION
    //* Functions related to custom network and sync handling.
    //*


        // !
        // todo: update this with automerge version when either p2p or websocket server is working
        // handle.on("ephemeral-message", (message) => {

        //     let msg = message.message
        //     switch (msg.msg){

        //         case 'moveModule':
        //             cy.getElementById(msg.module).position(msg.position);

        //             // also update the module internal boundaries for params
        //             updateSliderBoundaries(cy.getElementById(msg.module))
        //         break

        //         case 'startRemoteGhostCable':
        //         case 'updateRemoteGhostCable':
        //         case 'finishRemoteGhostCable':    

        //             handleRemoteCables(msg.msg, msg.data.peer, msg.data.sourceNodeID, msg.data.position)

        //         break

        //         case 'peerMousePosition':
        //             displayPeerPointers(msg.data.peer, msg.data.position)
        //         break



        //         default: console.log("got an ephemeral message: ", message)
        //     }
            
        // })

    // })();

    // function sendEphemeralData (msg){
    //     // only send once doc is ready
    //     if(handle){
    //         handle.broadcast(msg);
    //     }
        
    // }

    

        /*
        async function loadVersion(targetHash) {
            // Set a batch size based on your performance tolerance
            const BATCH_SIZE = 100; // Adjust as needed
        
            // Initialize a blank document to start replaying history
            let forkedDoc = automergeInit();
        
            // Create a document handle via the repo
            let forkedHandle = repo.create({ elements: [] });
        
            // Wait for the handle to be ready
            await forkedHandle.whenReady();
        
            // Find the target index in historyNodes based on the hash
            const targetIndex = historyNodes.findIndex(node => node.data.id === targetHash);
        
            if (targetIndex === -1) {
                console.error('Target hash not found in document history.');
                return;
            }
        
            // Ensure changes are in chronological order (reverse if needed)
            const orderedHistory = historyNodes.slice(0, targetIndex + 1);
            if (orderedHistory[0].data.timestamp > orderedHistory[orderedHistory.length - 1].data.timestamp) {
                orderedHistory.reverse();
            }

            // Apply changes in batches
            let batch = [];
            for (let i = 0; i < orderedHistory.length; i++) {
                const changeBinary = orderedHistory[i].data.serializedChange;
        
                if (!(changeBinary instanceof Uint8Array)) {
                    console.error(`Serialized change at index ${i} is not in Uint8Array format. Found:`, changeBinary);
                    return;
                }
        
                batch.push(changeBinary);
        
                // Apply changes in the batch if it reaches the batch size or if it's the last batch
                if (batch.length >= BATCH_SIZE || i === orderedHistory.length -1) {
                    try {
                        forkedDoc = applyNewChanges(forkedDoc, batch);
                        forkedDoc = getClone(forkedDoc); // Clone only after applying the batch
                        console.log(`After batch ${Math.floor(i / BATCH_SIZE) + 1}, elements:`, forkedDoc.doc.elements);

                        batch = []; // Clear the batch
                    } catch (error) {
                        console.error(`Error applying batch ending at index ${i}`, error);
                        return;
                    }
                }
            }
        
            console.log(`Version loaded successfully at hash ${targetHash}`);
            console.log(forkedHandle)
            // Usage: assuming `cy` is your Cytoscape instance and `forkedDoc` holds the document state
            updateCytoscapeFromDocument(forkedHandle);
        }
        */






//*
//*
//* UI UPDATES
//* Functions that directly handle updating DOM elements & cytoscape
//*

    // generate list of audio nodes for adding to patch
    function updateModuleLibrary(){
        const moduleNames = Object.keys(modules.webAudioNodes).sort()
        // Reference the list element
        const listElement = document.getElementById('moduleList');
        // Loop through the array and create list items
        moduleNames.forEach(item => {
            if(item != 'AudioDestination' && item != 'AudioWorklet' && item != "OutputLimiter"){
                // Create a new <li> element
                const listItem = document.createElement('li');
                // Set the text of the <li> to the current item
                listItem.textContent = item;
                // Append the <li> to the list
                listElement.appendChild(listItem);
            }

        });
    }

    updateModuleLibrary()

    function addSpeaker(){
        // check if graph contains a speaker. if not:
        const nodeIds = cy.nodes().map(node => node.id());
        const AudioDestinationExists = nodeIds.some(id => id.includes('AudioDestination'));
        if(!AudioDestinationExists){
            addModule('AudioDestination', { x: 500, y: 500}, [   ] )
            // OutputLimiter.connect(audioContext.destination);

        }

        // // Get the current viewport's extent
        // const extent = cy.extent();

        // // Bottom-right corner coordinates
        // const x = extent.x2; // Rightmost x-coordinate
        // const y = extent.y2; // Bottom-most y-coordinate
        // // todo: this doesn't seem to have an effect
        // speakerModule[0].position.x = x
        // speakerModule[0].position.y = y

        // cy.add(speakerModule)
    }
    // do this once:
    historyDAG_cy.panBy({x: 25, y: 0 })

    function updateCableControlPointDistances(x, y){
        cy.style()
        .selector(`edge`)
        .style({
            'control-point-distances': [y, x, y]
        })
        .update();
    }

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
    function panToBranch(node) {
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
//*
//*
//* EVENT HANDLERS
//* Functions that directly handle UI interactions
//*
   
    // Reference the module library list element
    const moduleList = document.getElementById('moduleList');
    // Add click event listener
    moduleList.addEventListener('click', (event) => {
        let loadedModule = event.target.textContent

        addModule(loadedModule, { x: 200, y: 200 }, [    ])
    });


    // Ensure the AudioContext starts on a button click
    document.getElementById('start-audio').addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        } else {
            audioContext.suspend()
        }
        // syncAudioGraph(audioGraphMockup2); // Call your graph sync function
    });


    cy.on('mouseover', 'node', (event) => {
        const node = event.target;
        // Add hover behavior, e.g., change style or show tooltip
        // node.style('background-color', 'red');

        // Get the element by its ID
        const element = document.getElementById('cytoscapeTooltipText');
        let toolTip ='';

        if (node.data().description){
            toolTip = node.data().description
        } 
        // Set new text content
        element.textContent = toolTip;

    });
    
    cy.on('mouseout', 'node', (event) => {
        const node = event.target;
        const element = document.getElementById('cytoscapeTooltipText');

        // Set new text content
        element.textContent = '';
    });
    
    // get .forkingpaths files from user's filesystem
    document.getElementById('fileInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
    
        if (!file) {
            alert('No file selected');
            return;
        }
    
        // Ensure the file is a valid Automerge binary (based on extension or type)
        if (!file.name.endsWith('.forkingpaths')) {
            alert('Invalid file type. Please select a .forkingpaths file.');
            return;
        }
    
        const reader = new FileReader();
    
        // Read the file as an ArrayBuffer
        reader.onload = function (e) {
            const binaryData = new Uint8Array(e.target.result); // Convert to Uint8Array
            try {
                // Load the Automerge document
                meta = Automerge.load(binaryData);
                amDoc = Automerge.load(meta.docs.main)

                updateCytoscapeFromDocument(amDoc);
            
                previousHash = meta.head.hash
                
                historyDAG_cy.elements().remove()
                reDrawHistoryGraph()
    
                // ion this case we want the highlighted node to be on the current branch
                highlightNode(historyDAG_cy.getElementById(meta.head.hash))
    
                // set the document branch (aka title)  in the editor pane
                document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;

                saveDocument('meta', Automerge.save(meta));
            } catch (err) {
                console.error('Failed to load Automerge document:', err);
                alert('Failed to load Automerge document. The file may be corrupted.');
            }
        };
    
        // Handle file reading errors
        reader.onerror = function () {
            console.error('Error reading file:', reader.error);
            alert('Failed to read the file.');
        };
    
        reader.readAsArrayBuffer(file); // Start reading the file
    });

    
    
    // save forking paths files to user's file system
    document.getElementById("saveButton").addEventListener("click", () => {
        // check if browser supports the File System Access API
        if(!!window.showSaveFilePicker){
            
            saveFile("filename.forkingpaths");
        } else {
            saveAutomergeDocument('session.forkingpaths');
        }
        
    });


    // Listen for changes to the radio buttons
    const radioButtons = document.querySelectorAll('input[name="traversalMode"]');
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
            historyDAG_cy.panBy({
                x: 0,
                y: event.deltaY 
                });
        }
    });
    historyDAG_cy.on('tap', 'node', (event) => {
        if(hid.key.shift){
            modifyHistorySequencerCy('add', event.target)

        } else {
            historySequencerController('clear')

            loadVersion(event.target.data().id, event.target.data().branch)
            highlightNode(event.target)
        }

    })

    historyDAG_cy.on('tap', (event) => {
        
        if(hid.key.cmd){
            // clear the bounding box
        }
        

    })

    // get mousedown events from cytoscape
    cy.on('mousedown', (event) => {
        // handle slider events
        if(event.target.data().kind && event.target.data().kind === 'slider'){
            switch(event.target.data().sliderComponent){
                case 'track':
                    console.log('slider track clicked')
                break;

                case 'handle':
                    currentHandleNode = event.target;
                    isSliderDragging = true;
            }
            
        } else {

       
            // Check if the click target is not the highlighted edge
            if (highlightedEdge && event.target !== highlightedEdge) {
                highlightedEdge.removeClass('highlighted');
                highlightedEdge = null;
            }
            const target = event.target;
            // Check if the target is a node, edge, or the background
            if (target.isNode && target.isNode()) {
                
                // first check if clicked node is NOT a parent node, and only an input or output (i.e. ignore other UI such as sliders)
                if (!event.target.isParent() && (event.target.data('kind') === 'input' || event.target.data('kind') === 'output')) {
                    // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                    let e = event.target
                    let p = event.position
                    startCable(e, p)

                    // !
                    // todo: update this with automerge version when either p2p or websocket server is working
                    // sendEphemeralData({
                    //     msg: 'startRemoteGhostCable',
                    //     data: {
                    //         sourceNodeID: e.data().id,
                    //         position: p,
                    //         peer: peers.local.id
                    //     }
                    // })
                } else if (event.target.isParent()){
                    
                    heldModule = event.target
                }
            } else if (target.isEdge && target.isEdge()) {
                const edge = event.target
                const mousePos = event.position

                // Get the source and target nodes of the edge
                const sourceNode = cy.getElementById(edge.data('source'));
                const targetNode = cy.getElementById(edge.data('target'));

                if (sourceNode && targetNode) {
                    // Extract positions to simple variables to avoid potential issues
                    const sourcePos = { x: sourceNode.position('x'), y: sourceNode.position('y') };
                    const targetPos = { x: targetNode.position('x'), y: targetNode.position('y') };
            
                    // Check if the click is near the source or target endpoint
                    if (isNearEndpoint(mousePos, sourcePos)) {
                        // delete the cable
                        cy.remove(edge);
                        // also remove the cable from automerge!

                        // * automerge version: 
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);

                            // If a match is found, remove the object from the array
                            if (index !== -1) {
                                amDoc.elements.splice(index, 1);
                            }
                        }, onChange, `disconnect ${edge.data().source} from ${edge.data().target}`);


                        //* old -repo version
                        // handle.change((newDoc) => {
                        //     // Assuming the array is `doc.elements` and you have an object `targetObj` to match and remove
                            
                        //     // Find the index of the object that matches the condition
                        //     const index = newDoc.elements.findIndex(el => el.id === edge.data().id);
                        
                        //     // If a match is found, remove the object from the array
                        //     if (index !== -1) {
                            
                        //         newDoc.elements.splice(index, 1);
                        //     }
                        // }, {
                        //     message: 'disconnect' // Set a custom change message here
                        // });

                        // create a new ghost cable starting from targetPos (opposite of clicked endpoint), call startCable()
                        // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                        let e = targetNode
                        let p = targetPos
                        startCable(e, p)
                        // tell remotes to create a new ghost cable
                        // !
                        // todo: update this with automerge version when either p2p or websocket server is working
                        // sendEphemeralData({
                        //     msg: 'startRemoteGhostCable',
                        //     data: {
                        //         sourceNodeID: e.data().id,
                        //         position: p,
                        //         peer: peers.local.id
                        //     }
                        // })

                    } else if (isNearEndpoint(mousePos, targetPos)) {
                        // delete the cable
                        cy.remove(edge);

                        // also remove the cable from automerge!

                        // * automerge version:      
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);

                            // If a match is found, remove the object from the array
                            if (index !== -1) {
                                amDoc.elements.splice(index, 1);
                            }
                        }, onChange, `disconnect ${edge.data().target} from ${edge.data().source}`);


                        //* old -repo version
                        // handle.change((newDoc) => {
                        //     // Assuming the array is `doc.elements` and you have an object `targetObj` to match and remove
                            
                        //     // Find the index of the object that matches the condition
                        //     const index = newDoc.elements.findIndex(el => el.id === edge.data().id);
                        
                        //     // If a match is found, remove the object from the array
                        //     if (index !== -1) {
                                
                        //         newDoc.elements.splice(index, 1);
                        //     }
                        // }, {
                        //     message: 'disconnect' // Set a custom change message here
                        // });
                        // create a new ghost cable starting from sourcePos (opposite of clicked endpoint), call startCable()
                        // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                        let e = sourceNode
                        let p = sourcePos
                        startCable(e, p)
                        // tell remotes to create a new ghost cable

                        // !
                        // todo: update this with automerge version when either p2p or websocket server is working
                        // sendEphemeralData({
                        //     msg: 'startRemoteGhostCable',
                        //     data: {
                        //         sourceNodeID: e.data().id,
                        //         position: p,
                        //         peer: peers.local.id
                        //     }
                        // })

                    } else {
                        // Remove highlight from any previously highlighted edge
                        if (highlightedEdge) {
                            highlightedEdge.removeClass('highlighted');
                        }
                        // Set the clicked edge as the highlighted edge
                        edge.addClass('highlighted');
                        highlightedEdge = edge;
                    }
                } else {
                    console.warn("Edge has an undefined source or target node:", edge.id());
                }

                // cy.remove(tempEdge)
            } else {
                // allowMultiSelect is set to false if cmd or ctrl is held down to allow for multiple selection
                // if(!allowMultiSelect){

                //     const currentTime = new Date().getTime();
                //     if (currentTime - lastClickTime < doubleClickDelay) {
                //         // Double-click detected
                //         if(hid.key.o){
                //             addModule(`oscillator`, { x: event.position.x, y: event.position.y }, [    ]);
                //         }
                //         else if(hid.key.v){
                //             addModule(`vca`, { x: event.position.x, y: event.position.y }, [    ]);
                //         }
                //         else if(hid.key.s){
                //             addModule(`simpleSynth`, { x: event.position.x, y: event.position.y }, [    ]);
                //         } else {
                //             console.log('must hold down a letter while double-clicking to spawn associated module (temporary):\no: oscillator \nv: vca \ns: simpleSynth')
                //         }
                        
                //         // console.log("Double-clicked on the background\nLow priority ToDo: background clicks open module library");
                //     }
                //     lastClickTime = currentTime; // Update the last click time
                // }
            }
        }
    });

   
    cy.on('mousemove', (event) => {
        // if(event.target.data() && event.target.data().sliderComponent === 'handle'){
            
            if (isSliderDragging) {
                
                // Get the new mouse position relative to the Cytoscape container
                // const cyContainer = cy.container();
                // const rect = cyContainer.getBoundingClientRect();
                const newMouseX = event.position.x;

                // Get the track's start and end positions from the handle's data
                const trackStartX = currentHandleNode.data('trackStartX');
                const trackEndX = currentHandleNode.data('trackEndX');
                const fixedY = cy.getElementById(currentHandleNode.data().trackID).position().y;

                // Ensure trackStartX and trackEndX are numbers before clamping
                if (typeof trackStartX === 'number' && typeof trackEndX === 'number') {
                    const newSliderValue = Math.max(trackStartX, Math.min(newMouseX, trackEndX));
                    currentHandleNode.position({ x: newSliderValue, y: fixedY });

                    // Normalize newSliderValue to a range of 0 to 1
                    const normalizedValue = (newSliderValue - trackStartX) / (trackEndX - trackStartX);

                    // Scale to the min and max range
                    const sliderMin = currentHandleNode.data('sliderMin');
                    const sliderMax = currentHandleNode.data('sliderMax');
                    const scaledValue = (sliderMin + (normalizedValue * (sliderMax - sliderMin))).toFixed(2);

                    // Check if the new scaled value is different from the last emitted value
                    // Update the node's data and write to Automerge only if the value has changed
                    if (scaledValue !== currentHandleNode.data('value')) {
                        // set params in audio graph:
                        updateSynthWorklet('paramChange', { parent: currentHandleNode.data().parent, param: currentHandleNode.data().label, value: scaledValue})
                        // updateParameter(currentHandleNode.data().parent, currentHandleNode.data().label, scaledValue)

                        currentHandleNode.data('value', scaledValue);
                        
                        // Find the label node and update its displayed text
                        const labelNode = cy.getElementById(`${currentHandleNode.data('trackID')}-label`);
                        
                        labelNode.data('label', scaledValue); // Display the value with 2 decimal places
                        // const cyHandleNode = cy.getElementById(`${currentHandleNode.data('id')}`)
                        // cyHandleNode.data('value', scaledValue.toFixed(2) )
                        // update in automerge
                        const elementIndex = amDoc.elements.findIndex(el => el.data.id === currentHandleNode.data().id);
                        
                        amDoc = applyChange(amDoc, (amDoc) => {
                            amDoc.elements[elementIndex].data.value = scaledValue
                            amDoc.elements[elementIndex].position = {
                                x: currentHandleNode.position().x,
                                y: currentHandleNode.position().y
                            }
                            // todo: update the web audio graph with the param values. 
                            // amDoc.synth.graph.connections.push( { source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id() })
                        }, onChange,  `paramUpdate ${currentHandleNode.data().label}`);
        

                        // Optionally, trigger an Automerge update here if necessary
                        // handle.change((doc) => {
                        //     // Update the document with the new value
                        //     // Example: doc.elements.find(el => el.id === currentHandleNode.id()).data.slidervalue = scaledValue;
                        // }, {
                            // message: `paramUpdate ${labelNode.data('label')}` // Set a custom change message here
                        // });
                    }

                
                } else {
                    console.error('Invalid trackStartX or trackEndX:', trackStartX, trackEndX);
                }

            }
        // }
        // this is for local Ghost cables only
        // Step 2: Update ghost node position to follow the mouse and track collisons
        if (temporaryCables.local.ghostNode) {
            const mousePos = event.position;
            temporaryCables.local.ghostNode.position(mousePos); // Update ghost node position
            // send the localGhostNode position to all connected peers
            // !
            // todo: update this with automerge version when either p2p or websocket server is working
            // sendEphemeralData({
            //     msg: 'updateRemoteGhostCable',
            //     data: {
            //         sourceNodeID: temporaryCables.local.ghostNode.data().id,
            //         position: mousePos,
            //         peer: peers.local.id
            //     }
            // })
            // Reset temporaryCables.local.targetNode before checking for intersections
            temporaryCables.local.targetNode = null;

            // Get elements under the mouse position using the bounding box check
            const elementsUnderMouse = getElementsAtPoint(cy, mousePos.x, mousePos.y);

            // Determine valid target label based on temporaryCables.local.source label
            const matchingTargetKind = temporaryCables.local.source.data('kind') === 'input' ? 'output' : 'input';

            // Filter out temporaryCables.local.ghostNode and temporaryCables.local.source from elements under the mouse
            
            // Filter elements based on the correct `kind`
            const potentialTarget = elementsUnderMouse.filter((el) => {
                return (
                    el.isNode() &&
                    el !== temporaryCables.local.source &&
                    el !== temporaryCables.local.ghostNode &&
                    !el.isParent() &&
                    el.data('kind') === matchingTargetKind // Only allow valid target kinds
                );
            });
            // If we have a valid potential target, set it as the temporaryCables.local.targetNode
            if (potentialTarget.length > 0) {
                temporaryCables.local.targetNode = potentialTarget[0];
                temporaryCables.local.targetNode.addClass('highlighted');
            }

            // Remove highlight from all other nodes
            cy.nodes().forEach((node) => {
                if (node !== temporaryCables.local.targetNode) {
                    node.removeClass('highlighted');
                }
            });
        } else if (heldModule){

            // !
            // todo: update this with automerge version when either p2p or websocket server is working
            // handle.broadcast({
            //     msg: "moveModule",
            //     module: heldModule.data().id,
            //     position: event.position
            // });
            heldModulePos = event.position

  
            
        }
        // Send the data with the relative position
        // !
        // todo: update this with automerge version when either p2p or websocket server is working
        // sendEphemeralData({
        //     msg: 'peerMousePosition',
        //     data: {
        //         position: event.position,
        //         peer: peers.local.id
        //     }
        // });
    });

    // Step 3: Finalize edge on mouseup
    cy.on('mouseup', (event) => {
        if(isSliderDragging){
            isSliderDragging = false
        }
        if (temporaryCables.local.tempEdge) {
            if (temporaryCables.local.targetNode) {

                // update audio right away
                updateSynthWorklet('connectNodes', { source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id()})

                // If a target node is highlighted, connect the edge to it
                // tempEdge.data('target', temporaryCables.local.targetNode.id()); // Update the edge target
                
                // tempEdge.removeClass('tempEdge'); // Remove temporary class if needed
                cy.remove(temporaryCables.local.tempEdge)
                const edgeId = uuidv7()

                cy.add({
                    group: 'edges',
                    data: { id: edgeId, source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id(), kind: 'cable' },
                    classes: 'edge'
                });
                
                // * automerge version:                
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.elements.push({
                        type: 'edge',
                        id: edgeId,
                        data: { id: edgeId, source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id(), kind: 'cable' }
                    });
                    amDoc.synth.graph.connections.push( { source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id() })
                    audioGraphDirty = true
                }, onChange,  `connect ${temporaryCables.local.source.data().label} to ${temporaryCables.local.targetNode.data().label}`);


                //* old -repo version
                // // todo: then push new cable to automerge and make sure it adds it in remote instances
                // handle.change((doc) => {
                //     doc.elements.push({
                //         type: 'edge',
                //         id: edgeId,
                //         data: { id: edgeId, source: temporaryCables.local.source.id(), target: temporaryCables.local.targetNode.id(), kind: 'cable' }
                //     });
                // }, {
                //     message: `connect ${temporaryCables.local.source.id()} to ${temporaryCables.local.targetNode.id()}` // Set a custom change message here
                // });
            } else {
                // If no target node, remove the temporary edge
                cy.remove(temporaryCables.local.tempEdge);
            }

            // update the remote peers:
            // tell remote to remove the temporary cable from cy instance
            // !
            // todo: update this with automerge version when either p2p or websocket server is working
            // sendEphemeralData({
            //     msg: 'finishRemoteGhostCable',
            //     data: {
            //         peer: peers.local.id
            //     }
            // })

            // Clean up by removing ghost node and highlights
            cy.remove(temporaryCables.local.ghostNode);
            cy.nodes().removeClass('highlighted');


            temporaryCables.local.tempEdge = null;
            temporaryCables.local.source = null;
            temporaryCables.local.targetNode = null;
            temporaryCables.local.ghostNode = null;
        } else if (heldModule){
            // * automerge version: 
            const elementIndex = amDoc.elements.findIndex(el => el.data.id === heldModule.data().id);
            amDoc = applyChange(amDoc, (amDoc) => {
                
                if (elementIndex !== -1) {
                    // update the position
                    amDoc.elements[elementIndex].position = {
                        x: heldModule.position().x,
                        y: heldModule.position().y
                    }        
                }
    
            }, onChange, `move ${heldModule.data().label}`);
            
            
            //* old -repo version
            // handle.change((newDoc) => {                
                
            //     const elementIndex = newDoc.elements.findIndex(el => el.data.id === heldModule.data().id);
            //     if (elementIndex !== -1) {
            //         // update the position
                    
            //         newDoc.elements[elementIndex].position.x = heldModule.position().x;
            //         newDoc.elements[elementIndex].position.y = heldModule.position().y;
            //     }

            // }, {
            //     message: `move ${heldModule.data().label}` // Set a custom change message here
            // });

            // if module has any param UI, need to update the internal positioning 
            // toDO: also pass this to automerge handle, and then write a handle.on('change'...) for grabbing this value and passing it to this same function below:
            updateSliderBoundaries(heldModule)
            
            heldModulePos = { }
            heldModule = null
        }
    });

    // Listen for drag events on nodes
    cy.on('grab', (event)=> {
        const node = event.target
        // for child nodes
        if(node.data('kind') && node.data('kind') != 'module'){
            // for all elements that aren't modules, determine whether to allow dragging (for rearranging the UI)
            if(isDraggingEnabled){
                // if enabled, begin dragging node with mouse
                node.grabify()
            } else {
                // If dragging is not enabled, release the node immediately
                // this allows for cables to spawn or controller elements to be engaged with (i.e. sliders)
                node.ungrabify(); 
            }
        } else {

        }
    })

    // removing modules
    // Click event to highlight a parent node
    cy.on('click', 'node:parent', (event) => {


        // Remove highlight class from any previously highlighted node
        if (highlightedNode) {
            highlightedNode.removeClass('highlighted');
        } 
        // if highlighted module is clicked again, unhighlighted it
        if( highlightedNode == event.target){
            highlightedNode.removeClass('highlighted');
            highlightedNode = null
        }
        else {
            // Highlight the clicked parent node
            highlightedNode = event.target;
            highlightedNode.addClass('highlighted');


        }
    });

    // Track when the 'e' key is pressed and released
    window.addEventListener('keydown', (event) => {
        if (event.key === 'o' || event.key === 'v' || event.key === 's') {
            hid.key[event.key] = true
        }
        if (event.key === 'e') {
            isDraggingEnabled = true;
        }
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
        if (event.key === 'e') {
            isDraggingEnabled = false;
        }
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

     // Handle keydown event to delete a highlighted edge on backspace or delete
     document.addEventListener('keydown', (event) => {


        if (highlightedEdge && (event.key === 'Backspace' || event.key === 'Delete')) {
            

            amDoc = applyChange(amDoc, (amDoc) => {
                // Find the index of the object that matches the condition
                const index = amDoc.elements.findIndex(el => el.id === highlightedEdge.data().id);

                // If a match is found, remove the object from the array
                if (index !== -1) {
                    amDoc.elements.splice(index, 1);
                }
            }, onChange, `disconnect ${highlightedEdge.data().target} from ${highlightedEdge.data().source}`);

            cy.remove(highlightedEdge)
            highlightedEdge = null; // Clear the reference after deletion
        } else if (highlightedNode && (event.key === 'Backspace' || event.key === 'Delete')){
            if (highlightedNode.isParent()) {
                const nodeId = highlightedNode.id();

                // update audioGraph right away
                updateSynthWorklet('removeNode', nodeId)

                cy.remove(highlightedNode); // Remove the node from the Cytoscape instance
                highlightedNode = null; // Clear the reference after deletion

                // Update the Automerge document to reflect the deletion

                // * automerge version:
                
                amDoc = applyChange(amDoc, (amDoc) => {

                    const elementIndex = amDoc.elements.findIndex(el => el.data.id === nodeId);
                    // IMPORTANT: here we need to remove elements in this order:
                    // 1. connected edges
                    // 2. children belonging to the parentNode
                    // 3. the parentNode
                    // any other order, and cytoscape throws an error because it attempts to draw the descendents

                    // Collect IDs of child nodes to remove edges connected to them
                    const childNodeIds = [];
                    for (let i = amDoc.elements.length - 1; i >= 0; i--) {
                        if (amDoc.elements[i].data.parent === nodeId) {
                            childNodeIds.push(amDoc.elements[i].data.id); // Collect the child node ID
                        }
                    }

                    // Remove edges connected to the child nodes
                    for (let i = amDoc.elements.length - 1; i >= 0; i--) {
                        const element = amDoc.elements[i];
                        if (element.type === 'edge' &&
                            (childNodeIds.includes(element.data.source) || childNodeIds.includes(element.data.target))) {
                                amDoc.elements.splice(i, 1); // Remove the edge
                        }
                    }

                    // Iterate through the array to remove child nodes
                    for (let i = amDoc.elements.length - 1; i >= 0; i--) {
                        if (amDoc.elements[i].data.parent === nodeId) {
                            amDoc.elements.splice(i, 1);
                        }
                    }
                    
                    if (elementIndex !== -1) {
                        amDoc.elements.splice(elementIndex, 1); // Remove the node from the Automerge document
                    }
                }, onChange, `remove ${nodeId}`);



                //* old -repo version

                // handle.change((doc) => {
                //     const elementIndex = doc.elements.findIndex(el => el.data.id === nodeId);
                //     // IMPORTANT: here we need to remove elements in this order:
                //     // 1. connected edges
                //     // 2. children belonging to the parentNode
                //     // 3. the parentNode
                //     // any other order, and cytoscape throws an error because it attempts to draw the descendents

                //     // Collect IDs of child nodes to remove edges connected to them
                //     const childNodeIds = [];
                //     for (let i = doc.elements.length - 1; i >= 0; i--) {
                //         if (doc.elements[i].data.parent === nodeId) {
                //             childNodeIds.push(doc.elements[i].data.id); // Collect the child node ID
                //         }
                //     }

                //     // Remove edges connected to the child nodes
                //     for (let i = doc.elements.length - 1; i >= 0; i--) {
                //         const element = doc.elements[i];
                //         if (element.type === 'edge' &&
                //             (childNodeIds.includes(element.data.source) || childNodeIds.includes(element.data.target))) {
                //             doc.elements.splice(i, 1); // Remove the edge
                //         }
                //     }

                //     // Iterate through the array to remove child nodes
                //     for (let i = doc.elements.length - 1; i >= 0; i--) {
                //         if (doc.elements[i].data.parent === nodeId) {
                //             doc.elements.splice(i, 1);
                //         }
                //     }
                    
                //     if (elementIndex !== -1) {
                //         doc.elements.splice(elementIndex, 1); // Remove the node from the Automerge document
                //     }


                // },{
                //     message: `remove ${nodeId}` // Set a custom change message here
                // });
            }
        }
    });

    // Select the button element by its ID
    const clearGraphButton = document.getElementById('clearGraph');

    // Add an event listener to the button for the 'click' event
    clearGraphButton.addEventListener('click', function() {
        cy.elements().remove()

        // * automerge version: 
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.elements = [ ]
        }, onChange, `clear`);

        //* old -repo version
        // handle.change((doc) => {
        //     doc.elements = []
        // },{
        //     message: `clear` // Set a custom change message here
        // });
    });

    // Select the button element by its ID
    const newSession = document.getElementById('newSession');

    // open a new session (with empty document)
    newSession.addEventListener('click', function() {
        // deletes the document in the indexedDB instance
        deleteDocument(docID)
        deleteDocument('meta')
        
        // Reload the page with the new URL
        window.location.href = window.location.origin
    });

    

    // modify graph edge control point distance
    const CPDslider = document.getElementById('controlPointDistance')
    
    CPDslider.addEventListener('input', function() {
        let x = this.value
        let y = this.value * -1
        updateCableControlPointDistances(x, y)

        localStorage.setItem('sliderValue', CPDslider.value);

    });




    // Retrieve the saved slider value from localStorage and set it
    const savedValue = localStorage.getItem('sliderValue');
    if (savedValue !== null) {
        CPDslider.value = savedValue;
        let x = savedValue
        let y = x * -1 
        updateCableControlPointDistances(x, y)
    }


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
        meta = Automerge.change(meta, (meta) => {
            meta.sequencer.bpm = bpm
        });

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
    //*
    //* PATCHING
    //*

    let highlightedEdge = null; // Variable to store the currently highlighted edge

    // function to create a cable

    function startCable(source, position){
        temporaryCables.local.source = source;
        const mousePos = position;

        // Get the ghostCable property from the temporaryCables.local.ghostNode, default to 'ellipse' if undefined
        const ghostShape =  temporaryCables.local.source.data('ghostCableShape') || 'ellipse';
        const ghostColour =  temporaryCables.local.source.data('ghostCableColour') || '#5C9AE3';

        // Create a ghost node at the mouse position to act as the moving endpoint
        temporaryCables.local.ghostNode = cy.add({
            group: 'nodes',
            data: { id: 'localGhostNode' },
            position: mousePos,
            grabbable: false, // Ghost node shouldn't be draggable
            classes: 'ghostNode'
        });

        // Apply the ghostShape to the ghostNode using a direct style override
        temporaryCables.local.ghostNode.style({
            'shape': ghostShape,
            'background-color': ghostColour
        });
        // Create a temporary edge from ghostNodes.local.source to temporaryCables.local.ghostNode
        temporaryCables.local.tempEdge = cy.add({
            group: 'edges',
            data: { id: 'localTempEdge', source: temporaryCables.local.source.id(), target: 'localGhostNode' },
            classes: 'tempEdge'
        });

        // Set target endpoint to mouse position initially
        temporaryCables.local.tempEdge.style({ 'line-color': '#FFA500', 'line-style': 'dashed' }); // Set temporary edge color        
    }

    function handleRemoteCables(cmd,  peerID, sourceID, position){
        
        switch(cmd){
            
            case 'startRemoteGhostCable':
                let ghostId = `ghostNode-${peerID}`
                let tempEdgeID = `tempEdge-${peerID}`
                
                temporaryCables.peers[peerID] = {
                    source: cy.getElementById(sourceID),
                    // Create a ghost node at the mouse position to act as the moving endpoint
                    ghostNode: cy.add({
                        group: 'nodes',
                        data: { id: ghostId },
                        position: position,
                        grabbable: false, // Ghost node shouldn't be draggable
                        classes: 'ghostNode'
                    }),
                    // Create a temporary edge from temporaryCables.local.source to ghostNode
                    tempEdge: cy.add({
                        group: 'edges',
                        data: { id: tempEdgeID, source: sourceID, target: ghostId },
                        classes: 'tempEdge'
                    }),
                    targetNode: null
                }
                
                // set ghostNode Style according to opposite of source Node
                const ghostShape = temporaryCables.peers[peerID].source.data('ghostCableShape') || 'ellipse';
                const ghostColour = temporaryCables.peers[peerID].source.data('ghostCableColour') || '#5C9AE3';
                temporaryCables.peers[peerID].ghostNode.style({
                    'shape': ghostShape,
                    'background-color': ghostColour
                });

                temporaryCables.peers[peerID].tempEdge.style({ 'line-color': '#228B22', 'line-style': 'dashed' }); // Set peer temporary edge color
            break;

            case 'updateRemoteGhostCable':
                // update the tmporary cable's position
                temporaryCables.peers[peerID].ghostNode.position(position)
            break

            case 'finishRemoteGhostCable':
                // remove the tempEdge
                cy.remove(temporaryCables.peers[peerID].tempEdge)
                // remove remote ghostnode
                cy.remove(temporaryCables.peers[peerID].ghostNode);
                cy.nodes().removeClass('highlighted');

                // remove remote peer's temporary cable from object
                delete temporaryCables.peers[peerID]

            break;

        }

    } 

    function addModule(module, position, children) {
        
        // const parentNode = new ParentNode(module, position, children); // old version. 

        const parentNode = new ParentNode_WebAudioNode(module, position, children);

        // parentNode.getModule('oscillator')
        const { parentNode: parentNodeData, childrenNodes, audioGraph } = parentNode.getNodeStructure();
    
        // Add nodes to Cytoscape
        cy.add(parentNodeData);
        cy.add(childrenNodes);

        // * automerge version:        
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.elements.push(parentNodeData);
            amDoc.elements.push(...childrenNodes);
            amDoc.synth.graph.modules[parentNodeData.data.id] = audioGraph
            audioGraphDirty = true
        }, onChange, `add ${parentNodeData.data.id}`);
        
        // update the synthWorklet

        updateSynthWorklet('addNode', parentNode )


        // syncAudioGraph(amDoc.synth.graph)
        // addNode(parentNode.data())
        // todo: remove the -repo version once AM is working
        // Update Automerge-repo document
    //     handle.change((doc) => {
    //         doc.elements.push(parentNodeData);
    //         doc.elements.push(...childrenNodes);

    //     },{
    //         message: `add ${parentNodeData.data.id}` // Set a custom change message here
    //     });
    }
    

    function updateSliderBoundaries(parentNode){
        // Update the position constraints for all slider handles that are children of this parent node
        cy.nodes(`node[parent="${parentNode.data().id}"]`).forEach((childNode) => {
            if (childNode.hasClass('sliderHandle')) {
                const trackLength = childNode.data('length') || 100; // Assuming track length is stored in data
                const newTrackStartX = parentNode.position().x - trackLength / 2;
                const newTrackEndX = parentNode.position().x + trackLength / 2;
                const fixedY = parentNode.position().y; // Update if necessary based on your layout logic

                // Update data attributes for the handle to use when dragging
                childNode.data('trackStartX', newTrackStartX);
                childNode.data('trackEndX', newTrackEndX);
                childNode.data('fixedY', fixedY);
            }
        });
    }

    function displayPeerPointers(peer, position){
        if(!peers.remote[peer]){
            peers.remote[peer] = {
                mousePointer: cy.add({
                    group: 'nodes',
                    data: { id: peer, label: peer, colour: randomColor()}, // Add a default color if needed },
                    position: position,
                    grabbable: false, // Prevents dragging
                    selectable: false, // Prevents selection
                    classes: 'peerPointer'

                })
            }
        }else {
            peers.remote[peer].mousePointer.position(position)

        }
    }

    //*
    //*
    //* AUDIO
    //* 
    //*

    const audioGraphMockup = {
        modules: {
          osc1: {
            type: "oscillator",
            params: {
              frequency: 440,
              type: "sine"
            }
          },
          gain1: {
            type: "gain",
            params: {
              gain: 0.5
            }
          }
        },
        connections: [
          { source: "osc1", target: "gain1" },
          { source: "gain1", target: "destination" }
        ]
    };

    const audioGraphMockup2 = {
        modules: {
            osc1: {
                type: "oscillator",
                params: {
                    frequency: 440,
                    type: "sine"
                }
            },
            osc2: {
                type: "oscillator",
                params: {
                    frequency: 200, // Modulation frequency (e.g., 2 Hz for vibrato)
                    type: "square"
                }
            },
            gainMod: {
                type: "gain",
                params: { 
                    gain: 1000 // Modulation depth (e.g., 50 Hz)
                }
            },
            gain1: {
                type: "gain",
                params: {
                    gain: 0.5
                }
            }
        },
        connections: [
            { source: "osc1", target: "gain1" }, // osc1 -> gain1
            { source: "gain1", target: "destination" }, // gain1 -> speakers
            { source: "osc2", target: "gainMod" }, // osc2 -> gainMod
            { source: "gainMod", target: "osc1.frequency" } // gainMod -> osc1.frequency
        ]
    };
    
    
    
    // Audio context
    const audioContext = new window.AudioContext();

    audioContext.audioWorklet.addModule('./audioWorklets/modular-synth-processor.js').then(() => {
        synthWorklet = new AudioWorkletNode(audioContext, 'modular-synth-processor');
        synthWorklet.connect(audioContext.destination);
    
    }).catch((error) => {
        console.error('Error loading the worklet:', error);
    });



    // setTimeout(() => {
    //     // Example usage
    //     // addNode('osc1', 'oscillator', { frequency: 440 });
    //     // addNode('output', 'output');
    //     // connectNodes('osc1', 'outputNode'); // Connect oscillator to output

    //     synthWorklet.port.postMessage({
    //         cmd: 'connectToOutput',
    //         id: 'osc1'
    //     });
    // }, 2000); // Change frequency after 2 seconds


    // setTimeout(() => updateNode('osc1', { frequency: 880 }), 5000); // Change frequency after 2 seconds

    function updateSynthWorklet(cmd, data){
        switch (cmd) {
            case 'addNode':
                synthWorklet.port.postMessage({ 
                    cmd: 'addNode', 
                    data: data
                });
                
            break

            case 'removeNode':
                synthWorklet.port.postMessage({ 
                    cmd: 'removeNode', 
                    data: data
                });
            break

            case 'connectNodes':
                // check here if target is audioDestination, if so, pass cmd as 'connectToOutput'
                if(data.target.includes('AudioDestination')){
                    synthWorklet.port.postMessage({
                        cmd: 'connectToOutput',
                        data: data.source.split('.')[0]
                    });
                } else if (data.target.split('.')[1] === 'IN'){
                    console.log('snared')
                    // handle direct node inputs
                    synthWorklet.port.postMessage({
                        cmd: 'connectNodes',
                        data: { source: data.source.split('.')[0], target: data.target.split('.')[0] }
                    });
                } else {
                    // handle CV modulation inputs
                    synthWorklet.port.postMessage({
                        cmd: 'connectCV',
                        data: { source: data.source.split('.')[0], target: data.target.split('.')[0], param: data.target.split('.')[1] }
                    });
                }

            break

            case 'paramChange':

                synthWorklet.port.postMessage({ cmd: 'paramChange', data: data });
            break
        }
    }
    // Add a node
    function addNode(id, type, params) {
        synthWorklet.port.postMessage({ cmd: 'addNode', type: type, id, params });
    }

    // Remove a node
    function removeNode(id) {
        synthWorklet.port.postMessage({ cmd: 'removeNode', id });
    }

    // Connect two nodes
    function connectNodes(sourceId, targetId) {
        synthWorklet.port.postMessage({ cmd: 'connectNodes', id: sourceId, targetId });
    }

    // Disconnect two nodes
    function disconnectNodes(sourceId, targetId) {
        synthWorklet.port.postMessage({ cmd: 'disconnectNodes', id: sourceId, targetId });
    }

    // Update a node's parameters
    function updateNode(id, params) {
        synthWorklet.port.postMessage({ cmd: 'updateNode', id, params });
    }


    // * previous main-thread implementation of audio
    const synthNodes = new Map();

    // const addedModules = new Set(); // Tracks added module IDs
    // const addedConnections = new Set(); // Tracks added connection strings
    
    // // this will be used at the output to protect users' ears
    // const OutputLimiter = audioContext.createDynamicsCompressor();
    // OutputLimiter.threshold.setValueAtTime(-1, audioContext.currentTime); // Limit at -1 dB
    // OutputLimiter.knee.setValueAtTime(0, audioContext.currentTime); // No smoothing
    // OutputLimiter.ratio.setValueAtTime(20, audioContext.currentTime); // High compression ratio
    // OutputLimiter.attack.setValueAtTime(0.003, audioContext.currentTime); // Fast attack
    // OutputLimiter.release.setValueAtTime(0.25, audioContext.currentTime); // Fast release

    // synthNodes.set("OutputLimiter", OutputLimiter);

    function syncAudioGraph(doc) {
        /*
        // Create modules
        for (const [id, module] of Object.entries(doc.modules)) {

            if (addedModules.has(id)) {
                // Skip modules that are already added
                continue;
            }

            let audioNode;
            if (module.type === "AudioDestination") {
                const gain = audioContext.createGain();
                gain.gain.setValueAtTime(module.params.gain || 0.5, audioContext.currentTime);
                gain.connect(audioContext.destination);
                synthNodes.set(id, gain);
            } 
            else if (module.type === "Oscillator" || module.type === 'LFO') {
                audioNode = createWebAudioNode("Oscillator");
                // audioNode.type = module.params.type || "sine";
                // audioNode.frequency.setValueAtTime(module.params.frequency || 440, audioContext.currentTime);
                
                synthNodes.set(id, audioNode);
            }
            else if (module.type === "Gain" || module.type === 'ModGain') {
                audioNode = createWebAudioNode("Gain");
                // gain.gain.setValueAtTime(module.params.gain || 0.5, audioContext.currentTime);
                // gain.connect(audioContext.destination);
                synthNodes.set(id, audioNode);
            }

            else if (module.type){
                audioNode = createWebAudioNode(module.type);
                synthNodes.set(id, audioNode);
            }
            
            else {
                console.log(`missing node creation logic in function syncAudioGraph() for module ${module.type}`)
            }

            module.moduleSpec.paramNames.forEach((paramName) => {
                const value = module.params[paramName]
                console.log(paramName, value)
                if (audioNode[paramName] instanceof AudioParam) {
                    // For AudioParam properties, use .value
                    audioNode[paramName].setValueAtTime(value, audioContext.currentTime);
                } else {
 
                    // make sure source (i.e. oscillator) nodes get started
                    if(module.type === "Oscillator" || module.type === 'LFO' && paramName === 'type'){
                        audioNode.start();
                    } 
                    // For regular properties, assign directly
                    audioNode[paramName] = value;
                    
                    
                    
                }


            })

            // Mark this module as added
            addedModules.add(id);
        }

        // Create connections
        for (const connection of doc.connections) {
            const connectionKey = `${connection.source}-${connection.target}`; // Unique string for each connection
            if (addedConnections.has(connectionKey)) {
                // Skip connections that are already added
                continue;
            }
            const sourceNode = synthNodes.get(connection.source.split('.')[0]);
            // console.log(sourceNode)
            if (connection.target.includes(".")) {
                // Handle parameter connections, e.g., "osc1.frequency"
                let [targetId, param] = connection.target.split(".");
                const targetNode = synthNodes.get(targetId);

                // Check if the connection is to an input or a parameter
                if (param === 'IN') {
                    if (sourceNode && targetNode) {
                        if (connection.target.includes('AudioDestination')){
                            // connect sourceNode to the OutputLimiter (which is already connected to the audioContext.destination)
                            sourceNode.connect(OutputLimiter);
                        } else {
                            // just connect them
                            sourceNode.connect(targetNode); // Connect to the node directly
                        }
                    
                    } else {
                        console.warn(`Failed to connect ${connection.source} to input of ${targetId}`);
                    }
                }
                else if (targetNode && param && targetNode[param]) {
                    sourceNode.connect(targetNode[param]); // Connect to parameter
                } else {
                    console.warn(`Failed to connect ${connection.source} to ${connection.target}`);
                }
            } 
            // else {
            //     // Handle regular node-to-node connections
            //     const targetNode = connection.target === "destination" ? audioContext.destination : synthNodes.get(connection.target);
            //     if (sourceNode && targetNode) {
            //         sourceNode.connect(targetNode);
            //         console.log('here', targetNode)
            //     } else {
            //         console.warn(`Failed to connect ${connection.source} to ${connection.target}`);
            //     }
            // }

            // Mark this connection as added
            addedConnections.add(connectionKey);
        }

        
    }

    function updateParameter(moduleID, param, value) {
        console.log(synthNodes, moduleID)
        // Update the Web Audio graph
        const node = synthNodes.get(moduleID);
        if (node) {
            console.log(node)
            node[param].setValueAtTime(value, audioContext.currentTime);


            // if (param === "frequency" && node.frequency) {
            //     node.frequency.setValueAtTime(value, audioContext.currentTime);
            // } else if (param === "gain" && node.gain) {
            //     node.gain.setValueAtTime(value, audioContext.currentTime);
            // }
        }
            
        
        */
    }

    


    // const dynamicParams = {
    //     "oscillator-hash454545-frequency": 440, // Default frequency
    // };
    
    // // Audio context
    // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // // Store references to the oscillator
    // let oscillator;
    
    // // Code string with dynamic variable reference
    // const codeString = `
    // oscillator = audioContext.createOscillator();
    // oscillator.type = 'sine';
    // oscillator.frequency.setValueAtTime(dynamicParams["oscillator-hash454545-frequency"], audioContext.currentTime);
    // const gainNode = audioContext.createGain();
    // gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    // oscillator.connect(gainNode);
    // gainNode.connect(audioContext.destination);
    // oscillator.start();
    // `;
    
    // // Execute the code, passing `dynamicParams` and `audioContext`
    // const executeCode = new Function('audioContext', 'dynamicParams', 'oscillator', codeString);
    // executeCode(audioContext, dynamicParams, null);
    
    // // Function to update the frequency dynamically
    // function updateFrequency(newFrequency) {
    //     dynamicParams["oscillator-hash454545-frequency"] = newFrequency;
    //     if (oscillator) {
    //         oscillator.frequency.setValueAtTime(newFrequency, audioContext.currentTime);
    //     }
    //     console.log(`Updated frequency to: ${newFrequency}`);
    // }
    
    // // Fetch slider element and attach event listener
    // const slider = document.getElementById('frequency-slider');
    // slider.addEventListener('input', (event) => {
    //     const newFrequency = parseFloat(event.target.value);
    //     updateFrequency(newFrequency); // Update the frequency
    // });
    


    /*
    // Initialize Audio Context
    const audioContext = new AudioContext();

    // Map to store RNBO devices (key: node ID, value: RNBO device)
    const rnboDevices = new Map();

    // dynamically load an RNBO device
    async function loadSynthGraph() {
        const rnboDeviceCache = new Map(); // Store RNBO device instances by parent node ID
        const childNodes = new Map(); // Store child nodes by ID for connections
    
        // Process parent nodes (modules)
        const parentNodes = cy.nodes(':parent');
        for (const parentNode of parentNodes) {
            const data = parentNode.data();
            const moduleType = data.rnboName; // e.g., "oscillator"
            const moduleId = data.id;
    
            let deviceDef;
    
            // Check if the device definition is already cached
            if (rnboDeviceCache.has(moduleType)) {
                deviceDef = rnboDeviceCache.get(moduleType);
            } else {
                // Fetch and cache the device definition
                const response = await fetch(`/path/to/${moduleType}.export.json`);
                deviceDef = await response.json();
                rnboDeviceCache.set(moduleType, deviceDef);
            }
    
            // Create a new RNBO device instance
            const rnboDevice = await RNBO.createDevice({ context: audioContext, deviceDef });
    
            // Connect RNBO node to the audio destination by default
            rnboDevice.node.connect(audioContext.destination);
    
            rnboDevices.set(moduleId, rnboDevice);
    
            // Process child nodes
            const children = parentNode.descendants(); // Get child nodes
            for (const child of children) {
                childNodes.set(child.data().id, { parent: moduleId, data: child.data() });
            }
        }
    
        // Process edges (connections)
        const edges = cy.edges();
        for (const edge of edges) {
            const source = edge.source().data().id;
            const target = edge.target().data().id;
    
            // Handle connections between child nodes
            if (childNodes.has(source) && childNodes.has(target)) {
                const sourceInfo = childNodes.get(source);
                const targetInfo = childNodes.get(target);
    
                const sourceParent = rnboDevices.get(sourceInfo.parent);
                const targetParent = rnboDevices.get(targetInfo.parent);
    
                if (sourceParent && targetParent) {
                    // Connect source RNBO output to target RNBO input
                    sourceParent.node.connect(targetParent.node);
                    console.log(`Connected ${source} (${sourceInfo.data.label}) to ${target} (${targetInfo.data.label})`);
                }
            }
        }
    
        console.log('Synth graph loaded successfully');
    }
    
    */
    
    //*
    //*
    //* UTILITY FUNCTIONS
    //* reusable helper functions and utility code for debugging, logging, etc.
    //*

    function createWebAudioNode(type) {
        const creators = {
            Oscillator: () => audioContext.createOscillator(),
            Gain: () => audioContext.createGain(),
            Delay: () => audioContext.createDelay(),
            BiquadFilter: () => audioContext.createBiquadFilter(),
            Panner: () => audioContext.createPanner(),
            ConstantSource: () => audioContext.createConstantSource(),
            BufferSource: () => audioContext.createBufferSource(),
            Analyser: () => audioContext.createAnalyser(),
            WaveShaper: () => audioContext.createWaveShaper(),
            
        };
    
        if (!creators[type]) {
            throw new Error(`Node type "${type}" is not supported. see function createWebAudioNode() and check if you need to add ${type} to it`);
        }
    
        return creators[type]();
    }

    // Helper function to detect if the click is near an endpoint of an edge
    function isNearEndpoint(mousePos, endpointPos, threshold = 50) {
        const dx = mousePos.x - endpointPos.x;
        const dy = mousePos.y - endpointPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= threshold;
    }

    // Helper function to find elements at a specific point
    function getElementsAtPoint(cy, x, y) {
        return cy.elements().filter((ele) => {
            const bb = ele.boundingBox();
            return (
                x >= bb.x1 &&
                x <= bb.x2 &&
                y >= bb.y1 &&
                y <= bb.y2
            );
        });
    }

    function getCytoscapeTextWidth(text, node) {
        // Create a temporary element
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap'; // Prevents text wrapping
        tempDiv.style.fontSize = node.style('font-size'); // Retrieve font size from Cytoscape style
        tempDiv.style.fontFamily = node.style('font-family') // Retrieve font family
    
        // Set the text
        tempDiv.innerText = text;
    
        // Append to the body to get dimensions
        document.body.appendChild(tempDiv);
        const width = tempDiv.offsetWidth; // Measure width in pixels
        document.body.removeChild(tempDiv); // Clean up
    
        return width;
    }

    function makeChangeMessage(branchName, msg){
        let amMsg = JSON.stringify({
            branch: branchName,
            msg: msg
        })
        return amMsg
    }

    function getChangeMessage(msg){
        return [ JSON.parse(msg).branch, JSON.parse(msg).msg ] 
    }

    function getHistoryProps(doc){
        const historyProps = Automerge.getHistory(doc).map(entry => {
            return {
              actor: entry.change.actor,
              hash: entry.change.hash,
              seq: entry.change.seq,
              startOp: entry.change.startOp,
              time: entry.change.time,
              message: entry.change.message,
              deps: entry.change.deps
            };
        });
        return historyProps
    }

    function loadAutomergeDoc(branch){
        if (!meta.docs[branch]) throw new Error(`Branchname ${branch} not found`);
        return Automerge.load(meta.docs[branch]); // Load the document
    }

    function removeLastInstanceById(array, id) {
        const index = array.map(item => item.id).lastIndexOf(id); // Find the last occurrence of the id
        if (index !== -1) {
            array.splice(index, 1); // Remove the object at the found index
        }
        return array; // Return the modified array
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






});


