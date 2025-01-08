//*
//*
//* INITIALIZATION AND SETUP
//* Set up dependencies, initialize core variables
//*
const ws = new WebSocket('ws://localhost:3000');

import { ParentNode_WebAudioNode } from './parentNode_WebAudioNode.js';
import modules from './src/modules/modules.json' assert { type: 'json'}
import { uuidv7 } from "uuidv7";
import randomColor from 'randomcolor';
import { saveDocument, loadDocument, deleteDocument } from './utilities/indexedDB.js';
import { marked } from 'marked'
import * as Tone from "tone";
import 'jquery-knob';   // Import jQuery Knob plugin
import * as speaker from "./speaker.json"
import { computePosition, flip, shift } from '@floating-ui/dom';

// TODO: look for comments with this: //* old -repo version 
// TODO: when new automerge implementation is working, remove their related code sections

let debugVar
// * Audio 
const rnboDeviceCache = new Map(); // Cache device definitions by module type
let audioGraphDirty = false
let synthWorklet; // the audioWorklet for managing and running the audio graph


// * UI
const baseKnobSize = 45; // Default size in pixels
const knobOffsetAmount = 30; // Horizontal offset for staggering knobs
const knobVerticalSpacing = baseKnobSize * 0.2; // 20% of base knob size for vertical spacing
const baseDropdownWidth = 100; // Base width of the dropdown
// this is session storage of the ui overlays. 
let paramUIOverlays = {}

// store the paramOverlay IDs
let paramUI_IDs = {}
const eventListeners = []; // Array to track event listeners
let virtualElements = {}

// * History Sequencer
let currentIndex = 0;
let historySequencerWindow;

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

// Throttle interval (e.g., 500ms)
const THROTTLE_INTERVAL = 250;
let throttleSend = true
let metaIsDirty = false

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

let currentPan = { x: 0, y: 0 }
let currentZoom = 0.8
let parentNodePositions = []

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
        left: false,
        right: false
    }
}

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

    // Audio context
    const audioContext = new window.AudioContext();

    audioContext.audioWorklet.addModule('./audioWorklets/modular-synth-processor.js').then(() => {
        synthWorklet = new AudioWorkletNode(audioContext, 'modular-synth-processor');
        synthWorklet.connect(audioContext.destination);
    }).catch((error) => {
        console.error('Error loading the worklet:', error);
    });
    


    // on load, check if historySequencer window is already open:
    const historySequencerWindowOpen = localStorage.getItem('historySequencerWindowOpen');
    if (historySequencerWindowOpen) {
        // Try to reconnect to the graph window
        historySequencerWindow = window.open('', 'HistoryGraph'); // Reuse the named window
        if (!historySequencerWindow || historySequencerWindow.closed) {
            openGraphWindow();
        }
    } else {
        openGraphWindow();
    }

    // Remove the flag when the graph window is closed
    window.addEventListener('beforeunload', () => {
        if (historySequencerWindow) {
            historySequencerWindow.close();
            // console.warn('remember to uncomment the line above this warning')
        }
        localStorage.removeItem('historySequencerWindowOpen');
        // console.warn('remember to uncomment the line above this warning')

    });
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

        elements: [ ], // Start with no elements; add them dynamically

        layout: {
            name: 'preset', // Preset layout allows manual positioning
            
        },
        fit: false,
        resize: true,
        userZoomingEnabled: false, // Disable zooming
        userPanningEnabled: false,
        
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
                    'background-opacity': 0.5,
                    'background-color': 'data(bgcolour)',
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
                selector: 'edge.connectedEdges',
                style: {
                    'line-color': '#228B22',           // Highlight color
                    'target-arrow-color': '#228B22',    // Highlight arrow color
                    'source-arrow-color': '#228B22',
                    'width': 6 
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
            // {
            //     selector: '.sliderTrack',
            //     style: {
            //         'background-color': '#ddd', // Color for the remote peer's mouse node
            //         'shape': 'rectangle',
            //             'width': 'data(length)',
            //             'height': 10,
            //             'border-color': '#999',
            //             'border-width': 1,
            //             'label': 'data(label)', // Remove label for track
            //             'text-valign': 'center',    // Vertically center the label
            //             'text-halign': 'left', 
            //             'text-margin-y': -20,
            //             'text-margin-x': 70,
            //             'text-opacity': 1, // Ensure no text is shown
            //             'outline-width': 0, // Remove focus outline
            //             // 'user-select': 'none', // Prevent text selection
            //             // 'pointer-events': 'none' // Disable pointer events on the track
            //     }
            // },
            // {
            //     selector: '.sliderHandle',
            //     style: {
            //         'background-color': '#4CAF6F',
            //         'shape': 'ellipse',
            //         'width': 20,
            //         'height': 20,
            //         'label': '', // Remove label for handle
            //         'text-opacity': 0, // Ensure no text is shown
            //         'outline-width': 0, // Remove focus outline
            //         // 'user-select': 'none', // Prevent text selection
            //         // 'pointer-events': 'auto' // Enable pointer events for handle
            //     }
            // },
            // {
            //     selector: '.sliderLabel',
            //     style: {
            //         'background-color': '#4CAF6F',
            //         'background-opacity': 0, // Transparent background
            //         'color': '#333', // Dark text color for good contrast
            //         'font-size': 12, // Adjust font size as needed
            //         'text-halign': 'right', // Center the text horizontally
            //         'text-valign': 'center', // Center the text vertically
            //         'text-margin-x': -60, // Adjust the margin to position the label above the slider
            //         'text-margin-y': -10, // Adjust the margin to position the label above the slider
            //         'font-weight': 'bold', // Make the label stand out
            //         // 'pointer-events': 'none', // Prevent interaction with the label
            //         'text-background-opacity': 1, // Background for readability (set to 0 if not needed)
            //         'text-background-color': '#FFFFFF', // Light background for better visibility
            //         'text-background-padding': 2, // Add slight padding to the background
            //         'border-width': 0 // No border around the label
            //     }
            // },
            {
                selector: '.paramAnchorNode',
                style: {
                    'background-color': '#F5A45D',
                    'background-opacity': 0.,
                    'shape': 'ellipse',
                    'width': 20,
                    'height': 20,
                    'label': '', // Remove label for handle
                    'text-opacity': 0, // Ensure no text is shown
                    'outline-width': 0, // Remove focus outline
                    'events': 'no' // prevent user from clicking the anchor node
                    // 'user-select': 'none', // Prevent text selection

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
    /*
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

    */
    /*
        SELECTED HISTORY CYTOSCAPE INSTANCE
    */

        /*
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

    */

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
                title: "Forking Paths Synth",
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
                synthFile: {}


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
                amDoc.changeType = {
                    msg: 'blank_patch'
                },
                amDoc.elements = [],
                amDoc.synth = {
                    graph:{
                        modules: {
                        },
                        connections: []
                    }
                },
                paramUIOverlays = {

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
            // document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;

            // send doc to history app
            reDrawHistoryGraph()

            await saveDocument('meta', Automerge.save(meta));

            // addSpeaker()
        
            currentZoom = cy.zoom()
        } else {
            // meta does contain at least one document, so grab whichever is the one that was last looked at
            amDoc = Automerge.load(meta.docs[meta.head.branch]);

            // if(!amDoc.paramUIOverlays){
            //     amDoc = applyChange(amDoc, (amDoc) => {        
            //         amDoc.paramUIOverlays = {}
            //     }, onChange, `setup param overlay obj`);
            // }
            // // store previous head in heads obj
            // branchHeads[branchHeads.current] = {}
            // // update current head to this hash
            // branchHeads.current = meta.head.hash
            // // Step 3: Add node in Cytoscape for this clone point
            // // get info about targetNode (what was clicked by user)
            // branchHeads.previous = Automerge.getHeads(amDoc)[0]
            // wait 1 second before loading content (give the audio worklet a moment to load)
            setTimeout(()=>{
                updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type)

                updateCytoscapeFromDocument(amDoc, 'buildUI');
                
                previousHash = meta.head.hash
                
                // send doc to history app
                reDrawHistoryGraph()
    
                // ion this case we want the highlighted node to be on the current branch
                //! highlightNode(historyDAG_cy.getElementById(meta.head.hash))
    
                // set the document branch (aka title)  in the editor pane
                // document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;
                // addSpeaker()
        
                currentZoom = cy.zoom()

            }, 1000);



        }

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

                
                // panToBranch(historyDAG_cy.getElementById(hash)) //! remove this line when 2nd window is working fully
                
                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'panToBranch',
                    data: hash
                        
                })
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
            audioGraphDirty = false
        }

    };
    
    function paramChange(parentNode, paramLabel, value){

        updateSynthWorklet('paramChange', {
            parent: parentNode,
            param: paramLabel,
            value: value,
        });
        // Update in Automerge
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.synth.graph.modules[parentNode].params[paramLabel] = value;
            audioGraphDirty = true;
            // set the change type
            amDoc.changeType = {
                msg: 'paramUpdate',
                param: paramLabel,
                parent: parentNode,
                value, value
            }
        }, onChange, `paramUpdate ${paramLabel} = ${value}`);
    }


    function removeAllCables(){
        console.warn(`nope, this isn't ready yet. see function removeAllCables. \nits almost ready, but the way that automerge handles array manipulation is super annoying...`)
        /*
        let indexes = []
        const newElements = [];

        amDoc.elements.forEach((el, index)=>{
            if(el.type && el.type == 'edge'){
                newElements.push(el);
                // update audio
                updateSynthWorklet('removeCable', { source: el.data.source, target: el.data.target})


            }
        })        

        amDoc = applyChange(amDoc, (amDoc) => {
            // Create a new array for elements without 'edge' type
            // Remove all elements in-place
            filterAutomergeArray(amDoc, "elements", (el) => el.type !== 'edge');
            
            amDoc.synth.graph.connections = []


        }, onChange, `clear cables`);
        console.log(amDoc.elements)
        cy.edges().remove();
        */
    }
    function createNewSession(synthFile){
        
        // deletes the document in the indexedDB instance
        deleteDocument(docID)
        deleteDocument('meta')
        updateSynthWorklet('clearGraph')
        // ensure their container divs are removed too
        clearparamContainerDivs()
        // clear the sequences
        sendMsgToHistoryApp({
            appID: 'forkingPathsMain',
            cmd: 'newSession'
                
        })
        ws.send(JSON.stringify({
            cmd: 'clearHistoryGraph'
        }))

        // Clear existing elements from Cytoscape instance
        cy.elements().remove();
        
        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        // ensure their container divs are removed too
        clearparamContainerDivs()

        let metaJSON = {
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

        }
        if(synthFile){
            metaJSON.synthFile = synthFile
        } else if (meta.synthFile){
            // if a synth file had been previously loaded, load it again
            metaJSON.synthFile = meta.synthFile
            synthFile = meta.synthFile
        }
        meta = Automerge.from(metaJSON)

        amDoc = Automerge.init();

        if(synthFile){
            let amMsg = makeChangeMessage(firstBranchName, `loaded${synthFile.filename}`)
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
                amDoc.title = firstBranchName;
                amDoc.elements = [ ] 
                synthFile.visualGraph.elements.nodes.forEach((node)=>{
                    amDoc.elements.push(node)
                })
                
                amDoc.synth = {
                    graph: synthFile.audioGraph,
                    connections: []
                }
                
                audioGraphDirty = true
            }, onChange, `loaded ${synthFile.filename}`);

            updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.changeType)
            
            synthFile.visualGraph.elements.nodes.forEach((node, index)=>{
                // set module grabbable to false -- prevents module movements in main view
                if(node.classes === ':parent'){
                    synthFile.visualGraph.elements.nodes[index].grabbable = false
                    console.log(synthFile.visualGraph.elements.nodes[index])
                }
                // create overlays
                if(node.classes === 'paramAnchorNode'){
                    let value = synthFile.audioGraph.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
            
                    // index++
                }
            })
            // load synth graph from file into cytoscape
            cy.json(synthFile.visualGraph)

            setTimeout(() => {
                updateKnobPositionAndScale('all');
                // Make all nodes non-draggable
                
            }, 10); // Wait for the current rendering cycle to complete
        } else { 
            let amMsg = makeChangeMessage(firstBranchName, 'blank_patch')
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
                amDoc.title = firstBranchName;
                amDoc.elements = []
                amDoc.synth = {
                    graph:{
                        modules: {
                        },
                        connections: []
                    }
                }
            });

            updateCytoscapeFromDocument(amDoc, 'buildUI');
            
        }

        let hash = Automerge.getHeads(amDoc)[0]
        previousHash = hash
        branches[amDoc.title] = {
            head: hash,
            root: hash
        }
        let msg = 'blank_patch'
        if (synthFile){
            msg = synthFile.filename
        }
        meta = Automerge.change(meta, (meta) => {
            meta.branches[amDoc.title] = {
                head: hash,
                root: null,
                parent: null,
                // doc: amDoc,
                history: [ {hash: hash, parent: null, msg: msg} ] 
            }
            
            // encode the doc as a binary object for efficiency
            meta.docs[amDoc.title] = Automerge.save(amDoc)
            meta.head.branch = firstBranchName
            meta.head.hash = hash 
            meta.branchOrder.push(amDoc.title)
            
        });
        // set the document branch (aka title) in the editor pane
        // document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;

        
            
        previousHash = meta.head.hash
        // send doc to history app
        reDrawHistoryGraph()

        // addSpeaker()
    }
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

        // Add this to your Cytoscape initialization or script


    function loadSynthGraphFromFile(graphJSON) {
        parentNodePositions = []; // Array to store positions of all parent nodes

        // Extract all parent nodes from the given document
        const parentNodes = graphJSON.elements.nodes.filter(el => el.classes === ':parent');
        parentNodes.forEach(parentNode => {
            if (parentNode.position) {
                parentNodePositions.push({
                    id: parentNode.data.id,
                    position: parentNode.position
                });
            }
        });
    
        let elements = graphJSON.elements.nodes

        // Clear existing elements from Cytoscape instance
        cy.elements().remove();

        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        
        // ensure their container divs are removed too
        clearparamContainerDivs()

        cy.json(graphJSON);
        // cy.add(elements)

        parentNodePositions.forEach(parentNode => {
            const node = cy.getElementById(parentNode.id);

            if (node) {
                // test
                let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                
                // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
                // pos = {x: 273.3788826175895, y: 434.9628649535062};
                // let clonedPos = {...pos}
                node.position(pos); // Set the position manually  
            }
        });
        
        // add overlay UI elements
        let index = 0
        elements.forEach((node)=>{
            
            if(node.classes === 'paramAnchorNode'){
                // let value = graphJSON.synth.graph.modules[node.data.parent].params[node.data.label]
                createFloatingOverlay(node.data.parent, node, index)
        
                index++
            }
        })
        // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
        setTimeout(() => {
            updateKnobPositionAndScale('all');
        }, 10); // Wait for the current rendering cycle to complete
    } 
    
        // Function to update Cytoscape with the state from forkedDoc
    function updateCytoscapeFromDocument(forkedDoc, cmd) {

        let elements = forkedDoc.elements

        // only rebuild the UI if needed
        if(cmd === 'buildUI'){
            parentNodePositions = []; // Array to store positions of all parent nodes

            // Step 1: Extract all parent nodes from the given document
            const parentNodes = forkedDoc.elements.filter(el => el.classes === ':parent'); // Adjust based on your schema
            parentNodes.forEach(parentNode => {
                if (parentNode.position) {
                    parentNodePositions.push({
                        id: parentNode.data.id,
                        position: parentNode.position
                    });
                }
            });


            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            
            // Clear existing elements from Cytoscape instance
            cy.elements().remove();

            // remove all dynamicly generated UI overlays (knobs, umenus, etc)
            removeUIOverlay('allNodes')
            
            // ensure their container divs are removed too
            clearparamContainerDivs()

            // cy.reset()
            // 3. Add new elements to Cytoscape
            cy.add(syncedElements)

            parentNodePositions.forEach(parentNode => {
                const node = cy.getElementById(parentNode.id);
    
                if (node) {
                    // test
                    let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                  
                    // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
                    // pos = {x: 273.3788826175895, y: 434.9628649535062};
                    // let clonedPos = {...pos}
                    node.position(pos); // Set the position manually
          
    
                    
                    
                }
            });
            // make sure viewport is set back to user's position and zoom
            cy.zoom(currentZoom)
            cy.pan(currentPan)
    
            
            // add overlay UI elements
            let index = 0
            elements.forEach((node)=>{
                
                if(node.classes === 'paramAnchorNode'){
                    let value = forkedDoc.synth.graph.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
            
                    index++
                }
            })
            // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
            setTimeout(() => {
                updateKnobPositionAndScale('all');
            }, 10); // Wait for the current rendering cycle to complete
            
        } else {
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // clear 
            cy.elements().remove();

            // 3. Add new elements to Cytoscape
            cy.add(syncedElements)

            // update knob position(s)
            if(forkedDoc.changeType && forkedDoc.changeType.msg === 'paramUpdate'){
                let id = `paramControl_parent:${forkedDoc.changeType.parent}_param:${forkedDoc.changeType.param}`
                let paramControl = document.getElementById(id)
                
                if (paramControl) {

                    switch(paramControl.tagName){
                        case 'INPUT':
                            paramControl.value = forkedDoc.changeType.value;
                            
                            $(paramControl).knobSet(forkedDoc.changeType.value);

                        break

                        case 'SELECT':
                            paramControl.value = forkedDoc.changeType.value;
                        break

                        default: console.warn('NEW UI DETECTED, CREATE A SWITCH CASE FOR IT ABOVE THIS LINE')
                    }


                  } else {
                    console.warn(`param with id "${id}" not found.`);
                  }

            }
        }
        
    
        
 
        


    
        // Finally, run layout
        // cy.layout({ name: 'preset', fit: false}).run(); // `preset` uses the position data directly  


    }    
    

    /*

        DOCUMENT HISTORY CYTOSCAPE (DAG)
    */
 
    function reDrawHistoryGraph(){
        metaIsDirty = true
        if(!throttleSend){
            
            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'reDrawHistoryGraph',
                data: meta
                    
            })
            throttleSend = true
        }


        /* 
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

            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)

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

            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)

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

            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)

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
          
            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)

            updateCytoscapeFromDocument(historicalView);
        }
    }


 
    /*

        HISTORY SEQUENCER 

    */
    // !
    /*
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

    */ //!
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
    // centralize the overlay removal logic
    function removeUIOverlay(cmd, data){

        switch(cmd){
            case 'singleNode':

                const matchingDivs = document.querySelectorAll(`div[id^="paramDivContainer_${data}"]`);

                // Iterate over each matching div
                matchingDivs.forEach(div => {
                    // Find all child elements which are param overlays
                    const paramOverlayDiv = div.querySelector('.paramOverlay'); 
                    if (paramOverlayDiv) {
                        paramOverlayDiv.removeKnob()
                    }
                    div.remove()
                });
                amDoc.paramUIOverlays[data].forEach((childDiv)=>{
                    childDiv.removeKnob()
                    
                    // childDiv.parentNode.removeChild(childDiv);
                })
                //? delete paramUIOverlays[nodeId]
            break

            case 'allNodes':
                // delete all param UI overlays
                /*
                Object.values(amDoc.paramUIOverlays).forEach((parentNode) => {
                    parentNode.forEach((paramUIDiv) => {
                        // paramUIDiv.parentNode.removeChild(paramUIDiv);
                        paramUIDiv.removeKnob()
                    });
                });

                // find all param overlay divs, and remove them
                const matchingDivs2 = document.querySelectorAll(`div[id^="paramDivContainer"]`);

                // Iterate over each matching div
                matchingDivs2.forEach(div => {

                    // Find all child elements which are param overlays
                    const paramOverlayDiv = div.querySelector('.paramOverlay'); 
                    if (paramOverlayDiv) {
                        paramOverlayDiv.removeKnob()
                    }
                    div.remove()
                });
                */
            break
        }

    }
    function setSynthToolTip(description){
        const element = document.getElementById('cytoscapeTooltipText');
        // Set new text content
        element.textContent = description;
        
    }
    const audioToggleButton = document.getElementById('audioToggleButton');

    // Update button text based on Web Audio state
    function updateButtonText() {
        audioToggleButton.textContent = (audioContext.state === 'running') ? 'Pause Audio' : 'Resume Audio';
    }

    // Add event listener to toggle button
    audioToggleButton.addEventListener('click', function () {
        if (audioContext && audioContext.state === 'running') {
            audioContext.suspend();
            updateButtonText();
        } else if (audioContext && audioContext.state === 'suspended'){
            audioContext.resume();
            updateButtonText();

        }
    });

    // Update timer every second
    const checkAudioStatus = setInterval(() => {
        // Initialize the button text on load
        updateButtonText();
        // const sr = synthWorklet.getSampleRate()
  
    }, 1000);
    
    
// Toggle the visibility of the settings overlay
    function toggleSettingsOverlay() {
        const overlay = document.getElementById('settingsOverlay');
        overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
    }

    // Add event listener for the settings button
    document.getElementById('settingsButton').addEventListener('click', toggleSettingsOverlay);

    const closeOverlayButton = document.getElementById('closeOverlayButton');
    closeOverlayButton.addEventListener('click', toggleSettingsOverlay);


    // Function to create and manage an overlay div
    function createFloatingOverlay(parentNodeID, param, index, loadedValue) { // if loadedValue, this is the value from the amDoc to be passed in
        
        // const stepSize = determineStepSize(param.min, param.max, 'logarithmic', 100 )
        if(!virtualElements[parentNodeID]){
            virtualElements[parentNodeID] = {
                elements: [],
                containerDivs: []
            }
        }
        // Create a container div to hold the UI element
        const containerDiv = document.createElement('div');
        containerDiv.dataset.description = param.data.description || 'no description'
        containerDiv.className = '.paramUIOverlayContainer'
        containerDiv.style.position = 'absolute';
        containerDiv.style.zIndex = '1000';
        containerDiv.style.width = `${baseKnobSize}px`;
        containerDiv.style.height = `${baseKnobSize}px`;
        containerDiv.id = `paramDivContainer_${param.data.id}`


        // Create the label element
        const labelDiv = document.createElement('div');
        labelDiv.innerText = param.data.label || `Knob`; // Use parameter label or default
        labelDiv.style.textAlign = 'left';
        labelDiv.style.marginBottom = '2px';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.color = '#333';
        
        // add menu or knob
        let paramDiv
        if(param.data.ui === 'menu'){
            paramDiv = document.createElement('select');
            // store contextual info about the param
            paramDiv.id = `paramControl_parent:${parentNodeID}_param:${param.data.label}`
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label

            paramDiv.style.width = '100%';
            // paramDiv.style.padding = '5px';
            paramDiv.style.borderRadius = '4px';
            // paramDiv.style.border = '1px solid #ccc';
            paramDiv.style.fontSize = '12px';

            // Add options to the select menu
            param.data.menuOptions.forEach((option) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value || option;
                optionElement.textContent = option.label || option;
                if(loadedValue && loadedValue == optionElement.value){
                    optionElement.selected = true
                }
                paramDiv.appendChild(optionElement);
            });
        } else if (param.data.ui === 'knob'){
            // Create an input element for jQuery Knob
            paramDiv = document.createElement('input');
            // store contextual info about the param
            paramDiv.id = `paramControl_parent:${parentNodeID}_param:${param.data.label}`
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label
            // paramDiv.dataset.description = param.data.description
            
            paramDiv.type = 'text';
            paramDiv.value = loadedValue || param.data.default || param.data.value || 50; // Initial value
            // paramDiv.style.position = 'absolute';
            paramDiv.style.width = `100%`;
            paramDiv.style.height = `100%`;
            // paramDiv.id = `knob_${param.data.id}`
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)
        }
        
        paramDiv.className = '.paramOverlay'
        // paramDiv.style.zIndex = '1000';
        // paramDiv.style.pointerEvents = 'auto'; // Ensure interactions are enabled

        // Append the input to the container
        containerDiv.appendChild(labelDiv);
        containerDiv.appendChild(paramDiv);
        document.body.appendChild(containerDiv);
        

        if (param.data.ui === 'knob'){
            let lastValue = null; // use this to filter out repeated values


            const stepSize = determineStepSize(param.data.min, param.data.max, 'logarithmic', 100 )
            // Initialize jQuery Knob on the input
            $(paramDiv).knob({
                min: param.data.min || param.data.sliderMin || 0,
                max: param.data.max || param.data.sliderMax || 100,
                step: stepSize,
                fgColor: "#00aaff",
                bgColor: "#e6e6e6",
                inputColor: "#333",
                thickness: 0.3,
                angleArc: 270,
                angleOffset: -135,
                width: baseKnobSize,          // Set width of the knob
                height: baseKnobSize,  
                // change: function (value) {
                //     $(this.$).trigger('knobChange', [parentNodeID, param.data.label, value]);
                // },
                change: (value) => {
                    
                    let newValue = Math.round(value * 100) / 100
                    // filter out repeated values
                    if (newValue !== lastValue) {
                        lastValue = newValue;
                        // set params in audio graph:
                        paramChange(parentNodeID, param.data.label, newValue)
                        console.warn('version change is triggering paramChange')
                    }
                },
                release: (value) => {
                    console.log(`gesture ended. see \/\/! comment in .knob().release() in createFloatingOverlay for how to use this`);
                    //! could use this to get the start and end of a knob gesture and store it as an array in the history sequence
                },

            });
        } else if (param.data.ui === 'menu'){
            // ignore
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)

        }

        // Create a virtual element for Floating UI
        let virtualElement = {
            getBoundingClientRect: () => {
                const childNode = cy.getElementById(param.data.id);
                const parentNode = cy.getElementById(parentNodeID)
                const parentData = parentNode.data();
                // console.log('param.data.id', param.data.id)
                // console.log('parentNodeID', parentNodeID)
                // console.log('childNode', childNode.data())
                // console.log('parentNode', parentNode.data())
                const parentParams = parentData?.moduleSpec?.paramNames || [];
                if (childNode && parentParams.length > 0) {
                    const containerRect = cy.container().getBoundingClientRect();
                    const zoom = cy.zoom();
                    const pan = cy.pan();
                    const parentNodeHeight = parentNode.renderedBoundingBox().h; // Get height from style
                    
                    // Get parent node's position (base for calculations)
                    const parentPos = parentNode.position();

                    // Calculate knob dimensions
                    const knobWidth = baseKnobSize; // Example knob width (update as needed)
                    const knobHeight = baseKnobSize; // Example knob height (update as needed)
                    const rowSpacing = knobHeight * 1.5; // Adjust row spacing
                    const colSpacing = knobWidth * 1.5; // Adjust column spacing

                    // Calculate layout based on index
                    const totalParams = parentParams.length; // Number of parameters
                    const index = parentParams.findIndex((item)=> item === param.data.label)
                    const row = Math.floor(index / 2); // Current row (2 items per row)
                    const col = index % 2; // Left (0) or right (1)

                    // Center the knobs for odd/even layouts
                    const totalWidth = colSpacing * 2; // Total width for two knobs per row
                    const offsetX =
                        col === 0
                            ? -colSpacing / 2 -20 // Left knob
                            : colSpacing / 2 - 20; // Right knob
                    const offsetY = row * rowSpacing - (parentNodeHeight / 4 - 20); // Row offset

                    // Adjust for odd-numbered parameters (center last knob in the last row)
                    if (totalParams % 2 !== 0 && index === totalParams - 1) {
                        // Center single knob in last row
                        return {
                            width: knobWidth,
                            height: knobHeight,
                            top: containerRect.top + (parentPos.y * zoom) + pan.y + offsetY,
                            left: containerRect.left + (parentPos.x * zoom) + pan.x + offsetX,
                            right: containerRect.left + (parentPos.x * zoom) + pan.x + knobWidth,
                            bottom: containerRect.top + (parentPos.y * zoom) + pan.y + knobHeight,
                        };
                    }

                    // Default (even layout or regular position)
                    return {
                        width: knobWidth,
                        height: knobHeight,
                        top: containerRect.top + (parentPos.y * zoom) + pan.y + offsetY,
                        left: containerRect.left + (parentPos.x * zoom) + pan.x + offsetX,
                        right: containerRect.left + (parentPos.x * zoom) + pan.x + offsetX + knobWidth,
                        bottom: containerRect.top + (parentPos.y * zoom) + pan.y + offsetY + knobHeight,
                    };
                }

                // Fallback if childNode is not found
                return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
            },
        };

        virtualElements[parentNodeID].elements.push(virtualElement)
        virtualElements[parentNodeID].containerDivs.push(containerDiv)


        // Cleanup function
        function removeKnob() {
            $(paramDiv).off()
            // Remove the container div
            if (containerDiv.parentNode) {
                containerDiv.parentNode.removeChild(containerDiv);
                console.log('Knob container removed');
            }

            // Nullify the virtual element
            // virtualElement.getBoundingClientRect = null;
            
            virtualElement = null
            console.log('Knob and virtual element removed');

        }

        // Update position dynamically on pan/zoom
        // cy.on('pan zoom position', updateKnobPositionAndScale);

        return { containerDiv, removeKnob } ;
    }


    // dynamically update all floating ui elements' position and scale 
    function updateKnobPositionAndScale(cmd, node) {
        const zoom = cy.zoom();
        switch(cmd){
            case 'all':
                // get all virtual elements in the DOM
                Object.values(virtualElements).forEach((node) => {
                    node.elements.forEach((virtualElement, index) => {
                        let containerDiv = node.containerDivs[index]
                        // Update position with Floating UI
                        computePosition(virtualElement, containerDiv, {
                            placement: 'top', // Adjust placement as needed
                            middleware: [flip(), shift()], // Prevent the knob from leaving the viewport
                        }).then(({ x, y }) => {
                            
                            containerDiv.style.left = `${x}px`;
                            containerDiv.style.top = `${y}px`;
                            // Dynamically scale the knob size
                            const scaledSize = baseKnobSize / zoom;
                            containerDiv.style.width = `${scaledSize}px`;
                            containerDiv.style.height = `${scaledSize}px`;
                        });
                    });            
                });
            break

            case 'node':
                virtualElements[node].elements.forEach((virtualElement, index) => {
                    let containerDiv = virtualElements[node].containerDivs[index]
                    // Update position with Floating UI
                    computePosition(virtualElement, containerDiv, {
                        placement: 'top', // Adjust placement as needed
                        middleware: [flip(), shift()], // Prevent the knob from leaving the viewport
                    }).then(({ x, y }) => {
                        
                        containerDiv.style.left = `${x}px`;
                        containerDiv.style.top = `${y}px`;
                        // Dynamically scale the knob size
                        const scaledSize = baseKnobSize / zoom;
                        containerDiv.style.width = `${scaledSize}px`;
                        containerDiv.style.height = `${scaledSize}px`;
                    });
                })
            break
        }
        
    }

    let parentConnectedEdges = []
    // highlight all edges connected to a clicked parent node
    function highlightEdges(cmd, node){
        // Get all child nodes of the parent
        const childNodes = node.children();

        // Create a collection to store all connected edges
        let connectedEdges = cy.collection();




        if(cmd === 'show'){
            // Iterate over the child nodes to gather their connected edges
            childNodes.forEach((child) => {
                child.connectedEdges().forEach((edge)=>{
                    edge.addClass('connectedEdges');
                    parentConnectedEdges.push(edge)
                })
            });
        } else if (cmd === 'hide'){
            // Iterate over the child nodes to gather their connected edges
            childNodes.forEach((child) => {
                child.connectedEdges().forEach((edge)=>{
                    edge.removeClass('connectedEdges');
                })
                parentConnectedEdges = []
            });
        }
        

        // .addClass('highlighted');
        // .removeClass('highlighted');
    }
    // generate list of audio nodes for adding to patch
    // function updateModuleLibrary(){
        
    //     const webAudioNodeNames = Object.keys(modules.webAudioNodes).sort()
    //     const RNBODeviceNames = Object.keys(modules.rnboDevices).sort()

    //     // Reference the list element
    //     const listElement = document.getElementById('moduleList');
    //     // RNBO device category
    //     const heading1 = document.createElement('li');
    //     heading1.textContent = 'RNBO Devices';
    //     heading1.style.fontWeight = 'bold'; // Make the heading stand out
    //     heading1.style.pointerEvents = 'none'; // Disable interaction

    //     listElement.appendChild(heading1);
    //      // Loop through the array and create list items
    //      RNBODeviceNames.forEach(item => {
    //         // Create a new <li> element
    //         const listItem = document.createElement('li');
    //         // Set the text of the <li> to the current item
    //         listItem.textContent = item;
    //         listItem.dataset.structure = 'rnboDevices'
    //         // Append the <li> to the list
    //         listElement.appendChild(listItem);
            

    //     });       


    //     // Web Audio Node category
    //     const heading2 = document.createElement('li');
    //     heading2.textContent = 'Web Audio Nodes';
    //     heading2.style.fontWeight = 'bold'; // Make the heading stand out
    //     heading2.style.pointerEvents = 'none'; // Disable interaction

    //     listElement.appendChild(heading2);
    //     // Loop through the array and create list items
    //     webAudioNodeNames.forEach(item => {
    //         if(item != 'AudioDestination' && item != 'AudioWorklet' && item != "OutputLimiter"){
    //             // all that are available at the moment
    //             if(item === 'BiquadFilter' || item === 'Delay' || item === 'LFO' || item === 'Oscillator' || item === 'Gain' || item === 'ModGain'){
    //                 // Create a new <li> element
    //                 const listItem = document.createElement('li');
    //                 // Set the text of the <li> to the current item
    //                 listItem.textContent = item;

    //                 listItem.dataset.structure = 'webAudioNodes'
    //                 // Append the <li> to the list
    //                 listElement.appendChild(listItem);
    //             }
      
    //         }

    //     });
    // }

    // updateModuleLibrary()

    function addSpeaker(){
        // check if graph contains a speaker. if not:
        const nodeIds = cy.nodes().map(node => node.id());
        const AudioDestinationExists = nodeIds.some(id => id.includes('AudioDestination'));
        if(!AudioDestinationExists){
            addModule('AudioDestination', { x: 50, y: 50}, [   ], 'webAudioNodes')
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

    function updateCableControlPointDistances(x, y){
        cy.style()
        .selector(`edge`)
        .style({
            'control-point-distances': [y, x, y]
        })
        .update();
    }

//*
//*
//* SERVER COMMUNICATION
//* Functions that communicate between main app and server
//*

    ws.onopen = () => {
        // console.log('Connected to WebSocket server');
        // ws.send('Hello, server!');
    };
    
    ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
    };
    
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };


//*
//*
//* APP COMMUNICATION
//* Functions that communicate between main app and history app 
//*


    function openGraphWindow() {
        historySequencerWindow = window.open('historySequencer.html', 'HistoryGraph');
        localStorage.setItem('historySequencerWindowOpen', true);
        
    }
    // Example: Send graph data to the history tab
    function sendMsgToHistoryApp(data) {
        if (historySequencerWindow && !historySequencerWindow.closed) {
            historySequencerWindow.postMessage(data, '*');
        } else {
            // console.error('Graph window is not open or has been closed.');
            openGraphWindow()
        }
    }

    // Listen for the historySequencerReady message
    window.addEventListener('message', (event) => {
        
        switch(event.data.cmd){

            case 'historySequencerReady':
                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'reDrawHistoryGraph',
                    data: meta
                        
                })
                
            break
            case 'loadVersion':
                loadVersion(event.data.data.hash, event.data.data.branch)
            break

            case 'updateSequencer':
                meta = Automerge.change(meta, (meta) => {
                    meta.sequencer[event.data.setting] = event.data.data
                });

                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'sequencerUpdate',
                    data: meta
                        
                })
            break
        }

    });

//*
//*
//* EVENT HANDLERS
//* Functions that directly handle UI interactions
//*

    // listen for changes on module selectmenu elements
    $(document).on('change', 'select', function () {
        // only pass inputs that are actually module inputs
        if($(this).data('parentNodeID')){
            paramChange($(this).data('parentNodeID'), $(this).data('param'), $(this).val())
        }
     });

    $(document).on('mouseover', '.paramUIOverlayContainer', function () {
        setSynthToolTip($(this).data('description'))
    });
    
    $(document).on('mouseout', '.paramUIOverlayContainer', function () {
        console.log('Mouseover knob or menu for description...');
    });

    // use this to update UI overlay positions
    cy.on('pan zoom', function (){
        updateKnobPositionAndScale('all')
    } );

    cy.on('position', 'node', function (event) {
        const node = event.target.data().parent;
        // ignore modules that don't have UI overlays
        if(!virtualElements[node]){
            return
        }
        updateKnobPositionAndScale('node', node)
    });


    cy.off('add');

    document.getElementById('openSynthDesigner').addEventListener('click', () => {
        window.open('synthDesigner.html')
    });

    // Open the history sequencer in a new tab
    document.getElementById('openHistoryWindow').addEventListener('click', () => {
        historySequencerWindow = window.open('historySequencer.html', 'HistoryGraph');
        localStorage.setItem('historySequencerWindowOpen', true); 

    });

    // // Reference the module library list element
    // const moduleList = document.getElementById('moduleList');
    // // Add click event listener
    // moduleList.addEventListener('click', (event) => {
    //     let loadedModule = event.target.textContent

    //     if(!loadedModule.includes('RNBO Devices') || !loadedModule.includes('Web Audio Nodes') ){
    //         addModule(loadedModule, { x: 200, y: 200 }, [    ], event.target.dataset.structure )

    //     }
    // });

    cy.on('mouseover', 'node', (event) => {
        const node = event.target;
        // Add hover behavior, e.g., change style or show tooltip
        // node.style('background-color', 'red');

        // Get the element by its ID
        // const element = document.getElementById('cytoscapeTooltipText');
        // let toolTip ='';

        if (node.data().description){
            setSynthToolTip(node.data().description)
        } 
        // // Set new text content
        // element.textContent = toolTip;
        // console.log(toolTip)

    });
    
    cy.on('mouseout', 'node', (event) => {
        // clear the tooltip
        setSynthToolTip('')

    });
    
    // get .forkingpaths files from user's filesystem
    document.getElementById('loadSessionButton').addEventListener('change', async (event) => {
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

                updateCytoscapeFromDocument(amDoc, 'buildUI');
            
                previousHash = meta.head.hash
                
                reDrawHistoryGraph()
    
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

    // get .fpsynth files from user's filesystem
    document.getElementById('loadSynthButton').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        // console.log('snared')
    
        if (!file) {
            alert('No file selected');
            return;
        }
    
        // Ensure the file is a valid Automerge binary (based on extension or type)
        if (!file.name.endsWith('.fpsynth')) {
            alert('Invalid file type. Please select a .fpsynth file.');
            return;
        }
    
        const reader = new FileReader();
    
        reader.onload = () => {
            try {

                localStorage.setItem('synthFile', reader.result);

                // Parse the JSON data
                const jsonData = JSON.parse(reader.result);
                createNewSession(jsonData)
                
                // loop through elements, get parents, pass to addModule
                // visualGraph.elements.nodes.forEach((node) => {
                //     if(node.classes === ':parent'){
                //         // pass name, position, children, an
                //         // console.log(node.position)d structure into addModule()
                //         addModule(node.data.rnboName, node.position, [ ], node.data.structure)
                //     }
                // })


            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        };
        reader.onerror = () => {
            console.error("Error reading the file:", reader.error);
        };

        // Start reading the file
        reader.readAsText(file);
        
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
    // const radioButtons = document.querySelectorAll('input[name="traversalMode"]');
    // radioButtons.forEach((radio) => {
    //     radio.addEventListener('change', (event) => {
    //         meta = Automerge.change(meta, (meta) =>{
    //             meta.sequencer.traversalMode = event.target.value  
    //         })
    //     });
    // });




    // get mousedown events from cytoscape
    cy.on('mousedown', (event) => {
        hid.mouse.left = true
        // handle slider events
        if(event.target.data().kind && event.target.data().kind === 'slider'){
            // switch(event.target.data().sliderComponent){
            //     case 'track':
            //         console.log('slider track clicked')
            //     break;

            //     case 'handle':
            //         currentHandleNode = event.target;
            //         isSliderDragging = true;
            // }
            
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
                if(highlightedNode){
                    highlightedNode.removeClass('highlighted');
                    // remove connected edge highlights
                    highlightEdges('hide', highlightedNode)
                    highlightedNode = null
                }
                
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
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        // * automerge version: 
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);
                            // set the change type
                            amDoc.changeType = {
                                msg: 'disconnect'
                            }
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
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        // also remove the cable from automerge!

                        // * automerge version:      
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);
                            // set the change type
                            amDoc.changeType = {
                                msg: 'disconnect'
                            }
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

            }
        }
    });

   
    cy.on('mousemove', (event) => {
        
        // this is for local Ghost cables only
        // Step 2: Update ghost node position to follow the mouse and track collisons
        if (temporaryCables.local.ghostNode) {
            if(parentConnectedEdges.length > 0){
                parentConnectedEdges.forEach((edge)=>{
                    edge.removeClass('connectedEdges');
                })
                parentConnectedEdges = []
            }
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
        hid.mouse.left = false

        if(isSliderDragging){
            isSliderDragging = false
        }
        if (temporaryCables.local.tempEdge) {
            if (temporaryCables.local.targetNode) {

                let src = temporaryCables.local.source.id()
                let targ = temporaryCables.local.targetNode.id()

                if(targ.includes('OUT')){
                    src = temporaryCables.local.targetNode.id()
                    targ = temporaryCables.local.source.id()
                }
                // update audio right away
                updateSynthWorklet('addCable', { source: src, target: targ})

                // If a target node is highlighted, connect the edge to it
                // tempEdge.data('target', targ); // Update the edge target
                
                // tempEdge.removeClass('tempEdge'); // Remove temporary class if needed
                cy.remove(temporaryCables.local.tempEdge)
                const edgeId = uuidv7()

                cy.add({
                    group: 'edges',
                    data: { id: edgeId, source: src, target: targ, kind: 'cable' },
                    classes: 'edge'
                });
                
                // * automerge version:                
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.elements.push({
                        type: 'edge',
                        id: edgeId,
                        data: { id: edgeId, source: src, target: targ, kind: 'cable' }
                    });
                    // set the change type
                    amDoc.changeType = {
                        msg: 'connect'
                    }
                    amDoc.synth.graph.connections.push( { source: src, target: targ })
                    audioGraphDirty = true
                }, onChange,  `connect ${temporaryCables.local.source.data().label} to ${temporaryCables.local.targetNode.data().label}`);


                //* old -repo version
                // // todo: then push new cable to automerge and make sure it adds it in remote instances
                // handle.change((doc) => {
                //     doc.elements.push({
                //         type: 'edge',
                //         id: edgeId,
                //         data: { id: edgeId, source: src, target: temporaryCables.local.targetNode.id(), kind: 'cable' }
                //     });
                // }, {
                //     message: `connect ${src} to ${temporaryCables.local.targetNode.id()}` // Set a custom change message here
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
            /*
            const elementIndex = amDoc.elements.findIndex(el => el.data.id === heldModule.data().id);

            //  Ensure position values are deeply copied
            const positionCopy = { x: heldModule.position().x, y: heldModule.position().y };
            amDoc = applyChange(amDoc, (amDoc) => {
                
                if (elementIndex !== -1) {
                    // update the position
                    amDoc.elements[elementIndex].position = positionCopy
                    
                    // {
                    //     x: heldModule.position().x,
                    //     y: heldModule.position().y
                    // }      
                    
                }
    
            }, onChange, `move ${heldModule.data().label}`);
            
            */
            
            // toDO: also pass this to automerge handle, and then write a handle.on('change'...) for grabbing this value and passing it to this same function below:
            // updateSliderBoundaries(heldModule)
            
            heldModulePos = { }
            heldModule = null
        }
        // update pan after dragging viewport
        currentPan = cy.pan()


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
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
        } 
        // if highlighted module is clicked again, unhighlighted it
        if( highlightedNode == event.target){
            highlightedNode.removeClass('highlighted');
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
            highlightedNode = null
            
        }
        else {
            // remove any cable highlights
            // highlightEdges('hide', highlightedNode)
            // Highlight the clicked parent node
            highlightedNode = event.target;
            highlightedNode.addClass('highlighted');
            // show connected edge highlights
            highlightEdges('show', highlightedNode)


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
            //! historyDAG_cy.zoomingEnabled(true)
        }
        if (event.key === 'Meta' || event.key === 'Control') {
            allowMultiSelect = false
            allowPan = true
            // ! historyDAG_cy.userZoomingEnabled(false)
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
            //! historyDAG_cy.userZoomingEnabled(true)
            hid.key.cmd = false
            // Hide a node by setting display to none

        }
        if (event.key === 'z') {
            // ! historyDAG_cy.zoomingEnabled(false)
        }
        if (event.key === 'Shift') {
            hid.key.shift = false
        }
    });

     // Handle keydown event to delete a highlighted edge on backspace or delete
     document.addEventListener('keydown', (event) => {


        if (highlightedEdge && (event.key === 'Backspace' || event.key === 'Delete')) {
            
            updateSynthWorklet('removeCable', { source: highlightedEdge.data().source, target: highlightedEdge.data().target})

            amDoc = applyChange(amDoc, (amDoc) => {
                
                // set the change type
                amDoc.changeType = {
                    msg: 'disconnect'
                }
                // Find the index of the object that matches the condition
                const index = amDoc.elements.findIndex(el => el.id === highlightedEdge.data().id);

                // If a match is found, remove the object from the array
                if (index !== -1) {
                    amDoc.elements.splice(index, 1);
                }

                // remove connection from audio graph
                // Find the index of the object that matches the condition
                const graphIndex = amDoc.synth.graph.connections.findIndex(el => el.id === highlightedEdge.data().id);

                // If a match is found, remove the object from the array
                if (graphIndex !== -1) {
                    amDoc.synth.graph.connections.splice(graphIndex, 1);
                }
            }, onChange, `disconnect ${highlightedEdge.data().target} from ${highlightedEdge.data().source}`);

            cy.remove(highlightedEdge)
            highlightedEdge = null; // Clear the reference after deletion
        } else if (highlightedNode && (event.key === 'Backspace' || event.key === 'Delete')){
            /*
            if (highlightedNode.isParent()) {
                const nodeId = highlightedNode.id();

                // update audioGraph right away
                updateSynthWorklet('removeNode', nodeId)



                // * automerge version:
                
                amDoc = applyChange(amDoc, (amDoc) => {
                    delete amDoc.synth.graph.modules[highlightedNode.data().parent]
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

                cy.remove(highlightedNode); // Remove the node from the Cytoscape instance
                highlightedNode = null; // Clear the reference after deletion

                removeUIOverlay('singleNode', nodeId)

                // Update the Automerge document to reflect the deletion


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
            */
        }
    });

    // Select the button element by its ID
    const clearGraphButton = document.getElementById('clearGraph');

    // Add an event listener to the button for the 'click' event
    clearGraphButton.addEventListener('click', function() {

        removeAllCables()
    });

    // Select the button element by its ID
    const newSession = document.getElementById('newSession');

    // open a new session (with empty document)
    newSession.addEventListener('click', function() {

        
        createNewSession()

        // Reload the page with the new URL
        // window.location.href = window.location.origin
    });

    

    // modify graph edge control point distance
    const CPDslider = document.getElementById('settings_controlPointDistance')
    
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

    //!
    /* 
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

    */ 

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

    function addModule(module, position, children, structure) {
        
        // const parentNode = new ParentNode(module, position, children); // old version. 

        const parentNode = new ParentNode_WebAudioNode(module, position, children, structure);

        // parentNode.getModule('oscillator')
        const { parentNode: parentNodeData, childrenNodes, audioGraph, paramOverlays } = parentNode.getNodeStructure();
        console.log(parentNode)
        // Add nodes to Cytoscape
        cy.add(parentNodeData);
        cy.add(childrenNodes);
        
        
        debugVar = parentNodeData.data.id
        // index determines the left or right positioning of each knob
        let index = 0
        paramUIOverlays[parentNodeData.data.id] = []

        // let tempOverlayArray = [ ]
        childrenNodes.forEach((param)=>{
            
            if (param.classes == 'paramAnchorNode' && paramOverlays){
                let uiOverlay = createFloatingOverlay(parentNodeData.data.id, param, index);
                paramUIOverlays[parentNodeData.data.id].push(uiOverlay)
                // tempOverlayArray.push(serializeDivToBase64(uiOverlay))
                index++
            }
        })
        // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
        setTimeout(() => {
            updateKnobPositionAndScale('all');
        }, 10); // Wait for the current rendering cycle to complete
        // * automerge version:        
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.elements.push(parentNodeData);
            amDoc.elements.push(...childrenNodes);
            amDoc.synth.graph.modules[parentNodeData.data.id] = audioGraph
            audioGraphDirty = true

            // amDoc.paramUIOverlays[parentNodeData.data.id] = tempOverlayArray
        }, onChange, `add ${parentNodeData.data.id}`);
        
        // update the synthWorklet
        updateSynthWorklet('addNode', parentNode, structure )


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
    

    // function updateSliderBoundaries(parentNode){
    //     // Update the position constraints for all slider handles that are children of this parent node
    //     cy.nodes(`node[parent="${parentNode.data().id}"]`).forEach((childNode) => {
    //         if (childNode.hasClass('sliderHandle')) {
    //             const trackLength = childNode.data('length') || 100; // Assuming track length is stored in data
    //             const newTrackStartX = parentNode.position().x - trackLength / 2;
    //             const newTrackEndX = parentNode.position().x + trackLength / 2;
    //             const fixedY = parentNode.position().y; // Update if necessary based on your layout logic

    //             // Update data attributes for the handle to use when dragging
    //             childNode.data('trackStartX', newTrackStartX);
    //             childNode.data('trackEndX', newTrackEndX);
    //             childNode.data('fixedY', fixedY);
    //         }
    //     });
    // }

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

    function updateSynthWorklet(cmd, data, structure, changeType){

        switch (cmd) {
            case 'clearGraph':
                synthWorklet.port.postMessage({ 
                    cmd: 'clearGraph'
                });
            break
            case 'loadVersion':
                // if a loaded version is for a paramChange, no need to recreate the graph
                // if(changeType && changeType.msg === 'paramUpdate'){
                //     synthWorklet.port.postMessage({ cmd: 'paramChange', data: changeType });
                // } else {
                synthWorklet.port.postMessage({ 
                    cmd: 'loadVersion', 
                    data: data,
                });
                // }
            break
            
            case 'addNode':
                synthWorklet.port.postMessage({ 
                    cmd: 'addNode', 
                    data: data,
                    structure: structure
                });
                
            break

            case 'removeNode':
                synthWorklet.port.postMessage({ 
                    cmd: 'removeNode', 
                    data: data
                });
            break

            case 'addCable':
                synthWorklet.port.postMessage({
                    cmd: 'addCable',
                    data: { source: data.source, target: data.target }
                });

            break

            case 'removeCable':
                synthWorklet.port.postMessage({
                    cmd: 'removeCable',
                    data: data
                });
            break

            case 'paramChange':

                synthWorklet.port.postMessage({ cmd: 'paramChange', data: data });
            break
        }
    
    }

    
    //*
    //*
    //* UTILITY FUNCTIONS
    //* reusable helper functions and utility code for debugging, logging, etc.
    //*


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

    // messages to historyCy throttling
    setInterval(() => {
        throttleSend = false
        if(metaIsDirty){
            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'reDrawHistoryGraph',
                data: meta
                    
            })
        }

        metaIsDirty = false
    }, THROTTLE_INTERVAL); // Attempt to send updates every interval


    function syncPositions(forkedDoc) {
        // Map positions from forkedDoc by element ID
        const positionsById = forkedDoc.elements.reduce((acc, el) => {
            if (el.position) {
                acc[el.data.id] = el.position; // Map the position by the element ID
            }
            return acc;
        }, {});
    
        // Update the `position` in `elements` with the correct values
        const syncedElements = forkedDoc.elements.map(el => {
            if (positionsById[el.data.id]) {
                return {
                    ...el,
                    position: positionsById[el.data.id], // Overwrite with the correct position
                };
            }
            return el; // Return unchanged if no position is mapped
        });
    
        return syncedElements;
    }


    // // Function to update the position of the floating div
    // const updateFloatingDivPosition = (node) => {
    //     const nodeRenderedPosition = node.renderedPosition();

    //     // Compute the floating position using Floating UI
    //     computePosition(
    //         {
    //             getBoundingClientRect: () => ({
    //                 width: 0,
    //                 height: 0,
    //                 top: nodeRenderedPosition.y,
    //                 left: nodeRenderedPosition.x,
    //                 right: nodeRenderedPosition.x,
    //                 bottom: nodeRenderedPosition.y,
    //             }),
    //         },
    //         floatingDiv,
    //         {
    //             middleware: [offset(10), flip(), shift()],
    //             placement: 'top', // Placement relative to the node
    //         }
    //     ).then(({ x, y }) => {
    //         floatingDiv.style.left = `${x}px`;
    //         floatingDiv.style.top = `${y}px`;
    //     });
    // };
    function popperFactory(ref, content, opts) {
        // see https://floating-ui.com/docs/computePosition#options
        const popperOptions = {
            // matching the default behaviour from Popper@2
            // https://floating-ui.com/docs/migration#configure-middleware
            middleware: [
                flip(),
                shift({limiter: limitShift()})
            ],
            ...opts,
        }
     
        function update() {
            computePosition(ref, content, popperOptions).then(({x, y}) => {
                Object.assign(content.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        }
        update();
        return { update };
    }
    

    
    function determineStepSize(min, max, method = 'linear', divisions = 100) {
        if (min >= max) {
            console.error('Invalid range: min must be less than max');
            return null;
        }
    
        const range = max - min;
    
        if (method === 'logarithmic') {
            const factor = Math.log10(range + 1); // Avoid log10(0)
            return (Math.pow(10, factor / divisions) - 1); // Base step size for log scaling
        } else if (method === 'linear') {
            return range / divisions;
        } else {
            console.error('Invalid method: Choose "logarithmic" or "linear"');
            return null;
        }
    }

    function clearparamContainerDivs(){
        // Directly select divs with IDs starting with "paramDivContainer"
        const matchingDivs = document.querySelectorAll('div[id^="paramDivContainer"]');

        // Remove each matching div
        matchingDivs.forEach(div => div.remove());
    }

    function serializeDivToBase64(div) {
        const htmlString = div.containerDiv.outerHTML; // Get the full HTML of the div
        const encoder = new TextEncoder(); // Convert string to binary
        const binaryData = encoder.encode(htmlString);
        const base64Data = btoa(String.fromCharCode(...binaryData));
        return { base64Div: base64Data, removeKnob: div.removeKnob }
    }
    
    
    // // this helps to ensure that detached elements are removed
    // const observer = new MutationObserver((mutations) => {
    //     mutations.forEach((mutation) => {
    //         mutation.removedNodes.forEach((node) => {
    //             if (node instanceof HTMLElement) {
    //                 // Perform cleanup for detached elements
    //                 node.removeEventListener('click', handleClick); // Example
    //             }
    //         });
    //     });
    // });
    
    // observer.observe(document.body, { childList: true, subtree: true });
    
    //     // Update the position of the overlay div
    //     function updatePosition() {
    //         const node = cy.getElementById(nodeId);
    //         const childNode = cy.getElementById(param.data.id);
            
    //         if (childNode) {
    //             const container = cy.container(); // Cytoscape container
    //             const containerRect = container.getBoundingClientRect();

    //             // Get the graph model position of the child node
    //             const nodePos = childNode.position();

    //                         // Get the size of the node
    //                         const nodeHeight = childNode.renderedBoundingBox().h;

    //             // Cytoscape's zoom and pan
    //             const zoom = cy.zoom();
    //             const pan = cy.pan();

    //             // Map model position to screen position using zoom and pan
    //             const screenX = containerRect.left + pan.x + nodePos.x * zoom;
    //             const screenY = containerRect.top + pan.y + nodePos.y * zoom;

    //             // Push the overlay down by half the node's height
    //             const adjustedY = screenY - nodeHeight ;
                
    //             // Set the overlay position
    //             overlayDiv.style.left = `${screenX}px`;
    //             overlayDiv.style.top = `${adjustedY}px`;
    //         }
        
    //         // if (node && childNode) {
    //         //     const pos = node.renderedPosition();
    //         //     const childPos = childNode.renderedPosition();

    //         //     const nodePos = childNode.position();
                
    //         //     const zoom = cy.zoom(); // Current zoom level
    //         //     const pan = cy.pan(); // Current pan offset
    //         //     console.log(zoom, pan)
    //         //     let paramPos = param.position
    //         //     const containerRect = cy.container().getBoundingClientRect();

    //         //     // Adjust position to account for zoom and pan
    //         //     const adjustedX = containerRect.left + (nodePos.x * zoom) + pan.x;
    //         //     const adjustedY = containerRect.top + (nodePos.y * zoom) + pan.y;

    //         //     // Adjust position relative to the Cytoscape container
    //         //     overlayDiv.style.left = `${adjustedX}px`;
    //         //     overlayDiv.style.top = `${adjustedY}px`;
    //         // }
    //     }

    //     // Update position initially and when the graph changes
    //     updatePosition();
    //     cy.on('pan zoom position', updatePosition);

    //     // Return the div for further customization
    //     return overlayDiv;
    // }

    // Example: Attach overlay to a node


    // cytoscape.use(cytoscapePopper(popperFactory));
    function loadSynthGraphFromFile(graphJSON) {
        parentNodePositions = []; // Array to store positions of all parent nodes

        // Step 1: Extract all parent nodes from the given document
        const parentNodes = graphJSON.elements.nodes.filter(el => el.classes === ':parent'); // Adjust based on your schema
        parentNodes.forEach(parentNode => {
            if (parentNode.position) {
                parentNodePositions.push({
                    id: parentNode.data.id,
                    position: parentNode.position
                });
            }
        });
    
        let elements = graphJSON.elements.nodes

        // Clear existing elements from Cytoscape instance
        cy.elements().remove();

        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        
        // ensure their container divs are removed too
        clearparamContainerDivs()

        cy.json(graphJSON);
        // cy.add(elements)

        parentNodePositions.forEach(parentNode => {
            const node = cy.getElementById(parentNode.id);

            if (node) {
                // test
                let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                
                // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
                    // console.log(`Random`, typeof pos.x, typeof pos.y);
                // pos = {x: 273.3788826175895, y: 434.9628649535062};
                // let clonedPos = {...pos}
                node.position(pos); // Set the position manually  
            }
        });
        
        // add overlay UI elements
        let index = 0
        elements.forEach((node)=>{
            
            if(node.classes === 'paramAnchorNode'){
                // let value = graphJSON.synth.graph.modules[node.data.parent].params[node.data.label]
                createFloatingOverlay(node.data.parent, node, index)
        
                index++
            }
        })
        // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
        setTimeout(() => {
            updateKnobPositionAndScale('all');
        }, 10); // Wait for the current rendering cycle to complete
    }  

    function filterAutomergeArray(doc, arrayKey, condition) {
        const filtered = doc[arrayKey].filter(condition);
        doc[arrayKey] = filtered; // Replace the array
    }
    

    // Define the knobSet method (Extend jquery-knob)
    $.fn.knobSet = function (value) {
        return this.each(function () {
            $(this).val(value).trigger("change"); // Update value and refresh knob display
        });
    };
    
});


