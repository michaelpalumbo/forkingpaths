//*
//*
//* INITIALIZATION AND SETUP
//* Set up dependencies, initialize core variables
//*
// const ws = new WebSocket('ws://localhost:3000');

export const forceBundle = true;

const DISABLE_HISTORY_WINDOW_CLOSE = import.meta.env.VITE_DISABLE_HISTORY_WINDOW_CLOSE

// const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
// const ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws`);

// Use the correct protocol based on your site's URL
const VITE_WS_URL = import.meta.env.VITE_WS_URL
// const VITE_WS_URL = "wss://historygraphrenderer.onrender.com/10000"
const ws = new WebSocket(VITE_WS_URL);

import { uuidv7 } from "uuidv7";
import randomColor from 'randomcolor';
import { saveDocument, loadDocument, deleteDocument } from '../utilities/indexedDB.js';
import { marked } from 'marked'
import 'jquery-knob';   // Import jQuery Knob plugin
import { computePosition, flip, shift } from '@floating-ui/dom';
import { config } from '../../config/forkingPathsConfig.js';

// TODO: look for comments with this: //* old -repo version 
// TODO: when new automerge implementation is working, remove their related code sections


const App = {
    synth: {
        visual:{ 
            modules: null
        }
    }
}

// ICE server configuration (using a public STUN server)
const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
      // Optionally add TURN servers here
    ]
  };
  
// Create the RTCPeerConnection.
let syncMessageDataChannel;
let peerPointerDataChannel

let thisPeerID

let dbSynthFiles = {

}
// * Audio 
let audioGraphDirty = false
let synthWorklet; // the audioWorklet for managing and running the audio graph
let signalAnalysisSetting = false

// * UI

let virtualElements = {}

// * History Sequencer
let currentIndex = 0;
let patchHistoryWindow;

// * new automerge implementation
let Automerge;
let amDoc = null
let docID = null
let onChange; // my custom automerge callback for changes made to the doc

let automergeDocuments = {
    newClone: false,
    newMerge: false,
    current: {
        doc: null
    },
    otherDocs: {

    }
}
let docUpdated = false

let previousHash;
let patchHistory;
let syncState;

let collaborationSettings = {
    local: {
        versionRecallMode: null
    },
    remotePeer: {
        versionRecallMode: null
    }
}

let throttleSend = true
let patchHistoryIsDirty = false

let isDraggingEnabled = false;
let highlightedNode = null
let heldModule = null

let allowMultiSelect = false;
let allowPan = false;

let isSliderDragging = false;

// store param changes belonging to a single param within a gesture as a list     
let groupChange = { }

// * CYTOSCAPE

let parentNodePositions = []


// * INPUTS

let hid = {
    key: {
        cmd: false,
        shift: false,
        o: false,
        v: false,
        s: false,
        num: false
    },
    mouse: {
        left: false,
        right: false
    },
    cyMouse: {
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
            ghostNode: 'synthGraphCytoscape.add({create ghost node here})',
            ghostEdge: 'synthGraphCytoscape.add...',
        }*/
    }
}


// fetch the overlay markdown files

let synthAppHelpOverlay

fetch(`/help/synthApp.md`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${key}.md — status ${response.status}`);
      }
      return response.text();
    })
    .then(markdownText => {
        synthAppHelpOverlay = marked(markdownText);
  
    })
    .catch(error => {
        synthAppHelpOverlay = '<em>Help not available.</em>';
        console.error(`Error loading ${key}.md:`, error);
    });

let workspaceAndCollabPanelHelpOverlay;

fetch(`/help/myWorkspaceAndCollabPanel.md`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to fetch myWorkspaceAndCollabPanel.md — status ${response.status}`);
    }
    return response.text();
  })
  .then(markdownText => {
    workspaceAndCollabPanelHelpOverlay = marked(markdownText);
  })
  .catch(error => {
    workspaceAndCollabPanelHelpOverlay = '<em>Help not available.</em>';
    console.error(`Error loading myWorkspaceAndCollabPanel.md:`, error);
  });

const penCursorImage = new Image();
penCursorImage.src = './assets/pen-cursor.png';

// *
// *
// *    APP
// *
// *

document.addEventListener("DOMContentLoaded", function () {
    let UI = null
    function initUI(){
        if(UI) return UI // prevents these elements from being attached twice
        return {

            synth: {
                visual:{
                    cytoscape: document.getElementById('cy'),
                    mouseTracker:  document.getElementById('mouseTracker'),
                    cytoscapeTooltipText: document.getElementById('cytoscapeTooltipText'),
                    signalAnalysisDisplay: document.getElementById('signalAnalysisDisplay'),
                    paramControls: {
                        // a place to store all visible controls (prevents us from hammering the DOM each time we receive sync messages)
                        //* NOTE This gets auto populated by cacheVisibleParamControls() and updated by refreshParamControls()
                        // don't edit this directly or remove it
                    },
                    patchCableColors: [
                        '#FFD700', // Gold
                        '#00CED1', // Dark Turquoise
                        '#8A2BE2', // Blue Violet
                        '#FF8C00', // Dark Orange
                        '#228B22'  // Forest Green
                    ],
                    ghostCableColour: '#5C9AE3',
                    
                }
            },
            draw: {
                canvas: document.getElementById('draw'),
                drawing: false,
                ctx: null, // define this afterward
                cursor: penCursorImage,
                currentStrokePoints: [], // for storing in automerge on mouseup
                canvasStrokes: [],
                eraser: document.getElementById('eraseDrawing'),
            },
            panel: {
                collaboration: {
                    roomInfo: document.getElementById('roomInfo'),
                    username: document.getElementById("username"),
                    recallMode: {
                        selectmenu: document.getElementById('versionRecallModeSelect'),
                        remote: document.getElementById("remoteVersionRecallMode")
                    },
                    remotePeerUsername: document.getElementById("remotePeerUsername")
                },
            },
            menus:{
                file: {
                    loadDemoSynth: document.getElementById('loadDemoSynthButton'),
                    loadSynthFile: document.getElementById('loadSynthButton'), 
                    openSynthBrowser: document.getElementById('openSynthBrowser'),
                    
                    newPatchHistory: document.getElementById('newPatchHistory'),
                    loadPatchHistory: document.getElementById('loadPatchHistory'),
                    savePatchHistory: document.getElementById("saveButton")
                },
                view: {
                    openSynthDesigner: document.getElementById('openSynthDesigner'),
                    openHistoryWindow: document.getElementById('openHistoryWindow')
                },
                settings: {
                    
                    audioToggleButton: document.getElementById('audioToggleButton')
                },
                testing: {
                    bugReport: document.getElementById("createGithubIssue")
                }
            },
            overlays: {
                firstTime: {
                    overlay: document.getElementById('firstTimeOverlay'),
                    close: document.getElementById('closeFirstTimeOverlay')
                },
                settings: {
                    overlay: document.getElementById('settingsOverlay'),
                    settingsButton: document.getElementById('settingsButton'),
                    close: document.getElementById('closeOverlayButton'),
                    displaySignalAnalysisButton: document.getElementById('displaySignalAnalysisButton'),
                    volumeSlider: document.getElementById('volumeSlider'),
                    volumeValue: document.getElementById('volumeValue')
                },
                help: {
                    synth:{
                        overlay: document.getElementById("synthAppHelpOverlay"),
                        content: document.getElementById("synthAppHelpOverlayContent"),
                        button: document.getElementById("synthAppHelp"),
                        close: document.getElementById("closeHelpOverlay")
                    },
                    workspaceAndCollab: {
                        overlay: document.getElementById("workspaceAndCollabPanelHelpOverlay"),
                        content: document.getElementById("workspaceAndCollabPanelHelpContent"),
                        button: document.getElementById("workspaceAndCollabPanelHelp"),
                        close: document.getElementById("closeWorkspaceAndCollabPanelHelpOverlay")
                    }
                },
                synthBrowser: {
                    
                    overlay: document.getElementById("synthBrowserOverlay"),
                    close: document.getElementById("closeSynthBrowserOverlay")
                }
            }
        }
        
    }
    
    UI = initUI();

    UI.draw.ctx = UI.draw.canvas.getContext('2d')


    // first make sure that the mouseTracker div is positioned directly over the cytoscape div
    const divA = UI.synth.visual.cytoscape
    const divB = UI.synth.visual.mouseTracker
    const rect = divA.getBoundingClientRect();

    divB.style.position = 'absolute';
    divB.style.top = rect.top + 'px';
    divB.style.left = rect.left + 'px';

    // setup the drawing canvas dimensions
    UI.draw.canvas.width = rect.width
    UI.draw.canvas.height = rect.height
    

    // Parse the query parameter to get the room name.
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');


    // set room info in collab panel
    UI.panel.collaboration.roomInfo.textContent = room;

    // set text in panel
    // document.getElementById("roomInfo").textContent = room;
    const peerCount = parseInt(params.get('peerCount') || '0');
    let patchHistoryKey = room ? `patchHistory-${room}` : 'patchHistory';


    // get username
    if(!localStorage.getItem('username')){
        let username = prompt("please type a username (any)")
        if(username === ''){
            username = 'user'
        }
        thisPeerID = username + '-' + uuidv7().split('-')[3]
        localStorage.setItem('username', thisPeerID)
        // set peer id in status panel
        UI.panel.collaboration.username.textContent = thisPeerID;
        // Show the first-time overlay
        const overlay = UI.overlays.firstTime.overlay;
        overlay.style.display = 'block';

        // Close button
        UI.overlays.firstTime.close.onclick = () => {
            overlay.style.display = 'none';
        };
        
    } else {
        thisPeerID = localStorage.getItem('username')
        // set peer id in status panel
        UI.panel.collaboration.username.textContent = thisPeerID;
    }



    // Get the saved volume level from localStorage, default to 0.5 (50%)
    const savedVolume = parseFloat(localStorage.getItem('volume')) || config.audio.initialVolume;

    // Audio context
    const audioContext = new window.AudioContext();

    async function setupAudioWorklet() {
        try {
            // assuming we're in development Load the worklet module from /src/
            let dspPath = '../audioWorklets/DSP.js'
            // check if we're in production mode
            if(import.meta.env.MODE === 'production'){
                // this path is the result of the build:worklet script in package.json
                dspPath = '/audioWorklets/DSP.js';
            }

            await audioContext.audioWorklet.addModule(dspPath);
          
            // Now we safely create the worklet **after** it has loaded
            synthWorklet = new AudioWorkletNode(audioContext, 'DSP');
            synthWorklet.connect(audioContext.destination);
         

            // Set volume after the worklet is ready
            updateSynthWorklet('setOutputVolume', savedVolume);

            // ✅ Safely attach event listeners now
            synthWorklet.port.onmessage = (event) => {
                switch(event.data.cmd){
                    case 'analyzerData':
                        
                        UI.synth.visual.signalAnalysisDisplay.textContent = `rms: ${event.data.rms}`
                    break
                    default: console.warn('no switch case exists for message from synthWorklet:', event.data)
                   
                }
                if (event.data.type === 'status-update') {
                    console.log('🎛️ DSP Status:', event.data.message);
                } else if (event.data.type === 'performance-metrics') {
                    console.log('📊 DSP Load:', event.data.load.toFixed(2), '%');
                }
            };

        } catch (error) {
            console.error("❌ Failed to initialize AudioWorklet:", error);
        }
    }

    // 🚀 Call setup function
    setupAudioWorklet();


    // on load, check if patchHistory window is already open:
    const patchHistoryWindowOpen = localStorage.getItem('patchHistoryWindowOpen');
    if (patchHistoryWindowOpen) {
        // Try to reconnect to the graph window
        patchHistoryWindow = window.open('', 'HistoryGraph'); // Reuse the named window
        if (!patchHistoryWindow || patchHistoryWindow.closed) {
            openGraphWindow();
        }
    } else {
        openGraphWindow();
    }
    // console.warn('make sure to uncomment the code below this message when finished making big changes to the history seq page')
    // Remove the flag when the graph window is closed
    window.addEventListener('beforeunload', () => {
        console.log(DISABLE_HISTORY_WINDOW_CLOSE)
        if(DISABLE_HISTORY_WINDOW_CLOSE === "1") {
            console.warn('remember to set VITE_DISABLE_HISTORY_WINDOW_CLOSE to 0 in .env.development')
   
            return
        }
        if (patchHistoryWindow) {
            patchHistoryWindow.close();
        }
        localStorage.removeItem('patchHistoryWindowOpen');

    });


    //*
    //*
    //* CONFIGURE CYTOSCAPE INSTANCES
    //* 
    //*
    
    const synthGraphCytoscape = cytoscape({
        container: UI.synth.visual.cytoscape,

        elements: [ ], // Start with no elements; add them dynamically

        layout: {
            name: 'preset', // Preset layout allows manual positioning
        },
        fit: false,
        resize: true,
        userZoomingEnabled: false, // Disable zooming
        userPanningEnabled: false,
        boxSelectionEnabled: false,
        
        style: [
            {
                selector: 'core',
                style: {
                    'active-bg-color': 'transparent', // no color
                    'active-bg-opacity': 0,            // fully transparent
                    'active-bg-size': 1                // zero size
                }
            },

            {
                selector: 'node',
                style: {
                    'background-color': 'data(bgcolour)',
                    'label': 'data(label)', // Use the custom label attribute
                    'font-size': '18px',
                    'width': config.cytoscape.synthGraph.style.nodeWidth,
                    'height': config.cytoscape.synthGraph.style.nodeHeight,
                    'color': '#000',            // Label text color
                    'text-valign': 'top',    // Vertically center the label
                    'text-halign': 'center',      // Horizontally align label to the center of the node
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
                    'color': config.cytoscape.synthGraph.style.parentNode.textColour, // Set the label text color
                    'font-size': config.cytoscape.synthGraph.style.parentNode.fontSize, // Adjust font size if needed
                    'text-margin-y': -10, // Optional: Move the label slightly up if desired
                    // 'grabbable': false // prevent modules from being moved by cursor
                
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
                    'width': 9,
                    // 'line-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'line-color': 'data(colour)',
                    'source-arrow-shape': 'none', 
                    // 'source-arrow-color': '#000',
                    'target-arrow-color': '#000',
                    'target-arrow-width': config.cytoscape.synthGraph.style.edge.arrowSize, // Size of the target endpoint shape
                    // 'source-arrow-width': 50, // Size of the source endpoint shape

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
                    // 'source-arrow-color': '#FF0000',
                    'source-arrow-shape': 'none',
                    'width': 10  
                }
            },
            {
                selector: 'edge.connectedEdges',
                style: {
                    'line-color': '#228B22',           // Highlight color
                    'target-arrow-color': '#228B22',    // Highlight arrow color
                    // 'source-arrow-color': '#228B22',
                    'source-arrow-shape': 'none',
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



 
    //* AUTOMERGE IMPLEMENTATION
    (async () => {
        // Load Automerge asynchronously and assign it to the global variable
        Automerge = await import('@automerge/automerge');
        
        // Forking Paths patchHistory document:
        // contains all branches and branch history
        // will probably eventually contain user preferences, etc. 
        console.log('peercount', peerCount)
        if (room && peerCount > 0) {
            patchHistory = Automerge.init();
            syncState = Automerge.initSyncState(); // ✅ this must exist here
            console.log("Joining active room. Waiting for sync.");

            return
        } else {
            const saved = await loadDocument(patchHistoryKey);
            
            if (saved) {
                patchHistory = Automerge.load(saved);
            } else {
                patchHistory = Automerge.from({
                    title: "Forking Paths Synth",
                    branches: {},
                    branchOrder: [],
                    docs: {},
                    head: {
                        hash: null,
                        branch: null
                    } ,
                    userSettings: {
                        focusNewBranch: true 
                    },
                    sequencer: {
                        bpm: 120,
                        ms: 500,
                        traversalMode: 'Sequential'
                    },
                    synth: {
                        rnboDeviceCache: null,
                    }
                });
                console.log("No saved patchHistory found. Starting fresh:", patchHistoryKey);
                await saveDocument(patchHistoryKey, Automerge.save(patchHistory));
            }
        }
                
        syncState = Automerge.initSyncState()

        // * synth changes document
        docID = 'forkingPathsDoc'; // Unique identifier for the document
        // Load the document from patchHistory's store in IndexedDB or create a new one if it doesn't exist

        // amDoc = await loadDocument(docID);
        // if patchHistory doesn't contain a document, create a new one
        if (!patchHistory.docs[patchHistory.head.branch]) {

            console.log('starting from blank patch')
            amDoc = Automerge.init();

            // load synthFile from indexedDB
            // let synthFile = JSON.parse(localStorage.getItem('synthFile'))
            // console.log('synthFile', synthFile)
            if (patchHistory.synthFile) {
                console.log('here')
               
                createNewPatchHistory(patchHistory.synthFile)
                // const firstChangeLabel = synthFile.name
                // ? `load_synth:${synthFile.name}`
                // : 'load_synth:unnamed';
            
                // amDoc = Automerge.change(amDoc, firstChangeLabel, (amDoc) => {
                //     amDoc.title = config.patchHistory.firstBranchName;
                //     amDoc.changeType = { msg: firstChangeLabel };
                //     amDoc.elements = synthFile.visualGraph?.elements?.nodes || [];
                //     amDoc.synth = {
                //         graph: synthFile.audioGraph || {
                //         modules: {},
                //         connections: []
                //         }
                //     };
                //     amDoc.sequencer = { tableData: [] };
                // });
            
                // const hash = Automerge.getHeads(amDoc)[0];
                // previousHash = hash;
            
                // patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                //     patchHistory.branches[config.patchHistory.firstBranchName] = {
                //         head: hash,
                //         root: null,
                //         parent: null,
                //         history: [{ hash: hash, parent: null, msg: firstChangeLabel }]
                //     };
                
                //     patchHistory.docs[config.patchHistory.firstBranchName] = Automerge.save(amDoc);
                //     patchHistory.head.branch = config.patchHistory.firstBranchName;
                //     patchHistory.head.hash = hash;
                //     patchHistory.branchOrder.push(config.patchHistory.firstBranchName);
                // });

                // // send doc to history app
                // reDrawHistoryGraph()
            
            } else {
                console.log("No synth file found. amDoc initialized but not changed.");
                previousHash = null;

                try {
                        // Fetch the Demo Synth
                    const response = await fetch(`/assets/synths/${import.meta.env.VITE_FIRST_SYNTH}.fpsynth`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    // Parse the response as JSON
                    const fileContent = await response.json();
                    
                    // Store the JSON string in localStorage if needed
                    localStorage.setItem('synthFile', JSON.stringify(fileContent));
                    
                    // Process the JSON content
                    createNewPatchHistory(fileContent);
            
                    // enable new history button now that a synth has been loaded
                    // UI.menus.file.newPatchHistory.disabled = false
                  
                } catch (error) {
                    console.error("Error loading template file:", error);
                }
           

            
                // patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                //     // Only set up empty branch patchHistorydata — no doc yet
                //     patchHistory.branches[config.patchHistory.firstBranchName] = {
                //         head: null,
                //         root: null,
                //         parent: null,
                //         history: []
                //     };
                //     patchHistory.head.branch = config.patchHistory.firstBranchName;
                //     patchHistory.head.hash = null;
                //     patchHistory.branchOrder.push(config.patchHistory.firstBranchName);
                // });
            }

        } else {

            // patchHistory does contain at least one document, so grab whichever is the one that was last looked at
            amDoc = Automerge.load(patchHistory.docs[patchHistory.head.branch]);

            // wait 1 second before loading content (give the audio worklet a moment to load)
            setTimeout(()=>{
                updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type)

                updateCytoscapeFromDocument(amDoc, 'buildUI');
                
                previousHash = patchHistory.head.hash
                
                // send doc to history app
                reDrawHistoryGraph()

                // load the draw canvas
                if(amDoc.drawing){
                    loadCanvasVersion(amDoc.drawing)
                }
    
            }, 1000);



        }
    })();
    
    // Set an interval to periodically save patchHistory to IndexedDB
    setInterval(async () => {
       
        // if(patchHistory && syncMessageDataChannel && syncMessageDataChannel.readyState === 'closed'){
        if(patchHistory && docUpdated){
            // await saveDocument(docID, Automerge.save(amDoc));
            await saveDocument(patchHistoryKey, Automerge.save(patchHistory));
            docUpdated = false
        }

    }, config.indexedDB.saveInterval);

    // handle document changes and call a callback
    function applyChange(doc, changeCallback, onChangeCallback, changeMessage) {
        // in this condition, we are applying a change on the current branch
        if(automergeDocuments.newClone === false ){
            let amMsg = makeChangeMessage(patchHistory.head.branch, changeMessage)
            // we are working from a head

            // grab the current hash before making the new change:
            previousHash = patchHistory.head.hash
            
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);


            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {
                let hash = Automerge.getHeads(amDoc)[0]
                
                patchHistory = Automerge.change(patchHistory, (patchHistory) => {

                    // Initialize the branch patchHistorydata if it doesn't already exist
                    if (!patchHistory.branches[patchHistory.head.branch]) {
                        patchHistory.branches[patchHistory.head.branch] = { head: null, history: [] };
                    }
                    // Update the head property
                    patchHistory.branches[patchHistory.head.branch].head = hash;

                    // Push the new history entry into the existing array
                    patchHistory.branches[patchHistory.head.branch].history.push({
                        hash: hash,
                        parent: previousHash,
                        msg: changeMessage,
                        timeStamp: new Date().getTime()

                    });

                    // encode the doc as a binary object for efficiency
                    patchHistory.docs[patchHistory.head.branch] = Automerge.save(amDoc)
                    // store the HEAD info
                    patchHistory.head.hash = hash
                    patchHistory.timeStamp = new Date().getTime()
                    //? patchHistory.head.branch = amDoc.title
                    
                });
                
                
                onChangeCallback(amDoc);
            }
            return amDoc;
        } else {
            // player has made changes to an earlier version, so create a branch and set amDoc to new clone

            // store previous amDoc in automergeDocuments, and its property is the hash of its head
            automergeDocuments.otherDocs[patchHistory.head.branch] = amDoc
            // set amDoc to current cloned doc
            amDoc = Automerge.clone(automergeDocuments.current.doc)

            // create a new branch name
            const newBranchName = uuidv7();
            // use the new branch title
            let amMsg = makeChangeMessage(patchHistory.head.branch, changeMessage)

            // grab the current hash before making the new change:
            previousHash = Automerge.getHeads(amDoc)[0]
            //! if any issues with graph arise, try switching above code to this:
            //! previousHash = patchHistory.head.hash
            
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);
            let hash = Automerge.getHeads(amDoc)[0]
            
            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {   
                const timestamp = new Date().getTime()
                patchHistory = Automerge.change(patchHistory, (patchHistory) => {

                    // create the branch
                    patchHistory.branches[newBranchName] = {
                        head: hash,
                        parent: previousHash,
                        history: [{
                            hash: hash,
                            msg: changeMessage,
                            parent: previousHash,
                            timeStamp: timestamp
                        }]
                    }

                    // store current doc
                    patchHistory.docs[newBranchName] = Automerge.save(amDoc)
                    
                    // store the HEAD info
                    patchHistory.head.hash = hash
                    patchHistory.head.branch = newBranchName

                    patchHistory.timeStamp = timestamp

                    // store the branch name so that we can ensure its ordering later on
                    patchHistory.branchOrder.push(newBranchName)
                });
               
                // makeBranch(changeMessage, Automerge.getHeads(newDoc)[0])
                onChangeCallback(amDoc);
                automergeDocuments.newClone = false

            }
            return amDoc;

        }
        

    }

    // define the onChange Callback
    onChange = () => {
        // send to peer(s)
        sendSyncMessage()
        // update synth audio graph
        // loadSynthGraph()
        // You can add any additional logic here, such as saving to IndexedDB

        // set docUpdated so that indexedDB will save it
        docUpdated = true

       
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

        if(hid.mouse.left === true){
            
            groupChange.values.push(value),
            groupChange.timestamps.push(new Date().getTime())
            
        }
        else {
            // clear the groupChange object
            groupChange = {}
            // set new groupChange
            groupChange.parentNode = parentNode
            groupChange.paramLabel = paramLabel
            groupChange.values = [value],
            groupChange.timestamps = [new Date().getTime()]

            //! important: see the 'mouseup' event listener in this script (not the synthGraphCytoscape. one, the one for the entire DOM) for how paramChanges are handled by automerge. 
        }
       
        
    }


    function removeAllCables(){
        console.warn(`nope, this isn't ready yet. see function removeAllCables. \nits almost ready, but the way that automerge handles array manipulation is super annoying...`)
        alert('feature not yet ready')
        // let cableSource =  highlightedEdge.data().source
        // let cableTarget =  highlightedEdge.data().target
        // let audioGraphConnections = amDoc.synth.graph.connections
        // updateSynthWorklet('removeCable', { source: cableSource, target: cableTarget})
        
        // // let cycle = isEdgeInCycle(synthGraphCytoscape.$(`#${edgeId}`))

        // // console.warn('todo: check if this cable was part of a cycle, if it is, ensure that its associated feedbackDelayNode is also removed from the synth.graph along with its 2 edges')

        // // console.log('connections:', amDoc.synth.graph.connections)
        // // console.log('cable data', highlightedEdge.data())

        // amDoc = applyChange(amDoc, (amDoc) => {
            
        //     // set the change type
        //     amDoc.changeType = {
        //         msg: 'disconnect'
        //     }
        //     // Find the index of the object that matches the condition
        //     const index = amDoc.elements.findIndex(el => el.id === highlightedEdge.data().id);

        //     // If a match is found, remove the object from the array
        //     if (index !== -1) {
        //         amDoc.elements.splice(index, 1);
        //     }
            
        //     // remove connection from audio graph
        //     // Find the index of the object that matches the condition
        //     let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
        //     // If a match is found, remove the object from the array
        //     if (audioConnectionIndex !== -1) {
        //         amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
        //     }
        // }, onChange, `disconnect ${cableTarget.split('.')[1]} from ${cableSource.split('.')[1]}$PARENTS ${cableSource.split('.')[0]} ${cableTarget.split('.')[0]}`);

        // synthGraphCytoscape.remove(highlightedEdge)
        // highlightedEdge = null; // Clear the reference after deletion
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
        synthGraphCytoscape.edges().remove();
        */
    }
    
    function createNewPatchHistory(synthFile){
        resetDrawing()
        // deletes the document in the indexedDB instance
        deleteDocument(docID)
        deleteDocument('patchHistory')
        updateSynthWorklet('clearGraph')
        // ensure their container divs are removed too
        clearparamContainerDivs()
        // clear the sequences
        sendMsgToHistoryApp({
            appID: 'forkingPathsMain',
            cmd: 'newPatchHistory'
                
        })
        ws.send(JSON.stringify({
            cmd: 'clearHistoryGraph'
        }))

        // Clear existing elements from Cytoscape instance
        synthGraphCytoscape.elements().remove();
        
        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        // ensure their container divs are removed too
        clearparamContainerDivs()

        let patchHistoryJSON = {
            title: "Forking Paths Patch History",
            branches: {},
            branchOrder: [],
            docs: {},
            head: {
                hash: null,
                branch: config.patchHistory.firstBranchName
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
            patchHistoryJSON.synthFile = synthFile
        } else if (patchHistory.synthFile){
            // if a synth file had been previously loaded, load it again
            patchHistoryJSON.synthFile = patchHistory.synthFile
            synthFile = patchHistory.synthFile
        }

        patchHistory = Automerge.from(patchHistoryJSON)

        amDoc = Automerge.init();

        if(synthFile || patchHistory.synthFile){

            if(!patchHistory.synthFile) { synthFile = patchHistory.synthFile }

            let amMsg = makeChangeMessage(config.patchHistory.firstBranchName, `loaded ${synthFile.filename}`)
            console.log(amMsg)
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
                amDoc.title = config.patchHistory.firstBranchName;
                amDoc.elements = [ ] 
                patchHistory.synthFile.visualGraph.elements.nodes.forEach((node)=>{
                    amDoc.elements.push(node)
                })
                
                amDoc.synth = {
                    graph: synthFile.audioGraph,
                    connections: []
                }
                
                audioGraphDirty = true

                amDoc.drawing = []
            }, onChange, `loaded ${synthFile.filename}`);

            updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.changeType)
         
            // load synth graph from file into cytoscape
            synthGraphCytoscape.json(patchHistory.synthFile.visualGraph)

            synthFile.visualGraph.elements.nodes.forEach((node, index)=>{
                // set module grabbable to false -- prevents module movements in main view
                if(node.classes === ':parent'){
                    // synthFile.visualGraph.elements.nodes[index].grabbable = false
                    // lock the module's position
                    synthGraphCytoscape.getElementById(node.data.id).lock();
                }
                // create overlays
                if(node.classes === 'paramAnchorNode'){
                    let value = patchHistory.synthFile.audioGraph.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
            
                    // index++
                }
            })


            setTimeout(() => {
                updateKnobPositionAndScale('all');
                // Make all nodes non-draggable
                
            }, 10); // Wait for the current rendering cycle to complete
        } else { 
            console.log('non synthFile')
            console.warn('synthFile nor patchHistory.synthFile not found')
            // let amMsg = makeChangeMessage(config.patchHistory.firstBranchName, 'blank_patch')
            // // Apply initial changes to the new document
            // amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
            //     amDoc.title = config.patchHistory.firstBranchName;
            //     amDoc.elements = []
            //     amDoc.synth = {
            //         graph:{
            //             modules: {
            //             },
            //             connections: []
            //         }
            //     }
            // });

            // updateCytoscapeFromDocument(amDoc, 'buildUI');
            
        }

        let hash = Automerge.getHeads(amDoc)[0]
        previousHash = hash

        let msg = 'blank_patch'
        if (synthFile){
            msg = `loaded ${synthFile.filename}`
        }
        patchHistory = Automerge.change(patchHistory, (patchHistory) => {
            patchHistory.branches[config.patchHistory.firstBranchName] = {
                head: hash,
                root: null,
                parent: null,
                // doc: amDoc,
                history: [ {hash: hash, parent: null, msg: msg} ] 
            }
            
            // encode the doc as a binary object for efficiency
            patchHistory.docs[config.patchHistory.firstBranchName] = Automerge.save(amDoc)
            patchHistory.head.branch = config.patchHistory.firstBranchName
            patchHistory.head.hash = hash 
            patchHistory.branchOrder.push(patchHistory.head.branch)
            patchHistory.synthFile = synthFile
            
        });     
            
        docUpdated = true
        previousHash = patchHistory.head.hash
        // send doc to history app
        reDrawHistoryGraph()

        // addSpeaker()
    }
    // save forking paths doc (patchHistory) to disk
    function saveAutomergeDocument(fileName) {
        // Generate the binary format of the Automerge document
        const binaryData = Automerge.save(patchHistory);

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

    // save patchHistory to user's computer as .patchhistory
    async function saveFile(suggestedFilename) {
        // Show the file save dialog
        const fileName = await window.showSaveFilePicker({
            suggestedName: suggestedFilename,
            types: [
                {
                    description: "Forking Paths CRDT Files",
                    accept: { "application/x-fpsynth": [".patchhistory"] }
                },
            ],
        });
        
        // Create a Blob object for the binary data
        const blob = new Blob([Automerge.save(patchHistory)], { type: 'application/octet-stream' });

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
        // await writable.write(Automerge.save(patchHistory));
        // await writable.close();
    }


    function branchManagement(cmd, ){
        switch(cmd){

        }


    }
    /* 

        SYNTH CYTOSCAPE

    */

        // Add this to your Cytoscape initialization or script


    // function loadSynthGraphFromFile(graphJSON) {
    //     parentNodePositions = []; // Array to store positions of all parent nodes

    //     // Extract all parent nodes from the given document
    //     const parentNodes = graphJSON.elements.nodes.filter(el => el.classes === ':parent');
    //     parentNodes.forEach(parentNode => {
    //         if (parentNode.position) {
    //             parentNodePositions.push({
    //                 id: parentNode.data.id,
    //                 position: parentNode.position
    //             });
    //         }
    //     });
    
    //     let elements = graphJSON.elements.nodes

    //     // Clear existing elements from Cytoscape instance
    //     synthGraphCytoscape.elements().remove();

    //     // remove all dynamicly generated UI overlays (knobs, umenus, etc)
    //     removeUIOverlay('allNodes')
        
    //     // ensure their container divs are removed too
    //     clearparamContainerDivs()

    //     synthGraphCytoscape.json(graphJSON);
    //     // synthGraphCytoscape.add(elements)

    //     parentNodePositions.forEach(parentNode => {
    //         const node = synthGraphCytoscape.getElementById(parentNode.id);

    //         if (node) {
    //             // test
    //             let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                
    //             // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
    //             // pos = {x: 273.3788826175895, y: 434.9628649535062};
    //             // let clonedPos = {...pos}
    //             node.position(pos); // Set the position manually  
    //         }
    //     });
        
    //     // add overlay UI elements
    //     let index = 0
    //     elements.forEach((node)=>{
            
    //         if(node.classes === 'paramAnchorNode'){
    //             // let value = graphJSON.synth.graph.modules[node.data.parent].params[node.data.label]
    //             createFloatingOverlay(node.data.parent, node, index)
        
    //             index++
    //         }
    //     })
    //     // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
    //     setTimeout(() => {
    //         updateKnobPositionAndScale('all');
    //     }, 10); // Wait for the current rendering cycle to complete
    // } 
    
        // Function to update Cytoscape with the state from forkedDoc
    function updateCytoscapeFromDocument(forkedDoc, cmd) {
        App.synth.visual.modules = forkedDoc.synth.graph.modules
        let elements = forkedDoc.elements
        peers.remote = {}
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
            })
            
            // Clear existing elements from Cytoscape instance
            synthGraphCytoscape.elements().remove();

            // remove all dynamicly generated UI overlays (knobs, umenus, etc)
            removeUIOverlay('allNodes')
            
            // ensure their container divs are removed too
            clearparamContainerDivs()
            
            // synthGraphCytoscape.reset()
            // pull modules from synthfile and populate cytoscape with parentNodes:
            
            // if this is the user's first time accessing the site (or from a private browser, etc), load the basic synth

            // let synthFile = JSON.parse(localStorage.getItem('synthFile'))
            
                
                
            // I do this from the synthFile because the parentNodes' dimensions respond to their childs' positioning
            synthGraphCytoscape.json(patchHistory.synthFile)
            // synthGraphCytoscape.nodes(':parent').forEach(n => console.log(n.id())); // lock all parent nodes so they can't be dragged
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // add all cables back in with a check to make sure we don't render edges to empty parent nodes
            syncedElements.forEach((el) => {
                if (el.type === 'edge') {
                  const sourceExists = synthGraphCytoscape.getElementById(el.data.source).length > 0;
                  const targetExists = synthGraphCytoscape.getElementById(el.data.target).length > 0;
              
                  if (!sourceExists || !targetExists) {
                    console.warn(`Skipping edge: ${el.data.id} due to missing source or target`);
                    return;
                  }
                }
              
                synthGraphCytoscape.add(el);
              });
            
            let index = 0
            elements.forEach((node)=>{
                // set module grabbable to false -- prevents module movements in main view
                if(node.classes === ':parent'){
                    // lock the module's position
                    synthGraphCytoscape.getElementById(node.data.id).lock();
                }
                if(node.classes === 'paramAnchorNode'){
                    let value = App.synth.visual.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
                    index++
                }
            })
            // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
            setTimeout(() => {
                updateKnobPositionAndScale('all');
            }, 10); // Wait for the current rendering cycle to complete
            
            // After loading your synth and creating overlays:
            cacheVisibleParamControls(App.synth.visual.modules);
            
        } else if (cmd === 'buildFromSyncMessage'){
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // clear 
            synthGraphCytoscape.elements().remove();

            // 3. Add new elements to Cytoscape
            synthGraphCytoscape.add(syncedElements)

            // loop through UI, update each param
            // const synthModules = forkedDoc.synth.graph.modules

            // check to see if none of the overlays were made. this is the case if peer has a blank document and is syncing to another peer's doc
            // const overlaysExist = document.querySelectorAll(".paramUIOverlayContainer").length > 0;
            const overlaysExist = document.querySelector('[id^="paramControl_parent:"]') !== null;

            if (!overlaysExist) {
                updateCytoscapeFromDocument(forkedDoc, 'buildUI');
                return; // skip the rest, since buildUI handles everything
            }

            refreshParamControls(App.synth.visual.modules);
        }
        
        
        else {
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // clear 
            synthGraphCytoscape.elements().remove();

            // 3. Add new elements to Cytoscape
            synthGraphCytoscape.add(syncedElements)

            refreshParamControls(App.synth.visual.modules);
        }
    }    
    

    /*

        DOCUMENT HISTORY CYTOSCAPE (DAG)
    */
 
    function reDrawHistoryGraph(){
        patchHistoryIsDirty = true
        // if(!throttleSend){
            
        //     sendMsgToHistoryApp({
        //         appID: 'forkingPathsMain',
        //         cmd: 'reDrawHistoryGraph',
        //         data: patchHistory
                    
        //     })
        //     throttleSend = true
        // }
   
        sendMsgToHistoryApp({
            appID: 'forkingPathsMain',
            cmd: 'reDrawHistoryGraph',
            data: patchHistory
                
        })
    }

    // merge 2 versions & create a new node in the graph
    function createMerge(nodes){
        let doc1 = nodes[0]
        let doc2 = nodes[1]

        console.log(doc1, doc2)
        // load historical views of both docs

        let head1 = patchHistory.branches[doc1.branch].head
        let requestedDoc1 = loadAutomergeDoc(doc1.branch)
        // const historicalView1 = Automerge.view(requestedDoc1, [doc1.id]);

        let head2 = patchHistory.branches[doc2.branch].head
        let requestedDoc2 = loadAutomergeDoc(doc2.branch)
        // const historicalView2 = Automerge.view(requestedDoc2, [doc2.id]);

        // console.log(requestedDoc1, requestedDoc2)

        let mergedDoc = Automerge.merge(requestedDoc1, requestedDoc2)

        
        // store previous amDoc in automergeDocuments, and its property is the hash of its head
        //? automergeDocuments.otherDocs[patchHistory.head.branch] = amDoc

        // grab the current hash before making the new change:
        // previousHash = Automerge.getHeads(amDoc)[0]
        // we previously used this to get the hashes, but it means it grabs just the leaves of both branches, when what we want are the actual parent nodes (see next line that is not commented out)
        // let hashes = Automerge.getHeads(mergedDoc)
        let hashes = [ doc1.id, doc2.id ]

        // create empty change to 'flatten' the merged Doc
        amDoc = Automerge.emptyChange(mergedDoc);

        console.log('mergedDoc w/empty change: ', mergedDoc);
        // -> "mergedDoc w/empty change:  { key1: 'Value from doc1', key2: 'Value from doc2' }"
        console.log('mergedDoc heads w/empty change: ', Automerge.getHeads(mergedDoc));
        // -> "mergedDoc heads w/empty change:  [ 'f4bef4aa01db0967714c5d8909310376f0e4fd72ab6ce4d477e00ae62a1683de' ]"

        let hash = Automerge.getHeads(amDoc)[0]

        const newBranchName = uuidv7()

        patchHistory = Automerge.change(patchHistory, { message: `merge parents: ${doc1.id} ${doc2.id} `}, (patchHistory) => {

            // Initialize the branch patchHistorydata if it doesn't already exist
            if (!patchHistory.branches[newBranchName]) {
                patchHistory.branches[newBranchName] = { head: null, parent: [ doc1.id, doc2.id ], history: [] };
                
            }

            // Update the head property
            patchHistory.branches[newBranchName].head = hash;

            // Push the new history entry into the existing array
            patchHistory.branches[newBranchName].history.push({
                hash: hash,
                msg: 'merge',
                parent: hashes,
                nodes: [doc1, doc2]

            });
            // store current doc
            patchHistory.docs[newBranchName] = Automerge.save(amDoc)
            
            // store the HEAD info
            patchHistory.head.hash = hash
            patchHistory.head.branch = newBranchName

            // store the branch name so that we can ensure its ordering later on
            patchHistory.branchOrder.push(newBranchName)
        });

        // set docUpdated so that indexedDB will save it
        docUpdated = true
       
        updateSynthWorklet('loadVersion', amDoc.synth.graph)

        updateCytoscapeFromDocument(amDoc, 'buildUI');

        // update the historyGraph
        reDrawHistoryGraph()

        if(audioGraphDirty){
            audioGraphDirty = false
        }

    }

    async function loadVersionWithGestureDataPoint(targetHash, branch, gestureDataPoint){

        // get the head from this branch
        let head = patchHistory.branches[branch].head

        let requestedDoc = loadAutomergeDoc(branch)

        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(requestedDoc, [targetHash]);
        let tempMutableView = JSON.parse(JSON.stringify(historicalView));
        
        let updatedView = updateTempMutableView(tempMutableView, gestureDataPoint.parent, gestureDataPoint.param, Number(gestureDataPoint.value))
        
        updateSynthWorklet('loadVersion', updatedView.synth.graph)

        updateCytoscapeFromDocument(updatedView);
        
        // updateSynthWorklet('loadVersion', historicalView.synth.graph)
        // console.log(updateModuleParam(tempMutableView.synth.graph, moduleName, paramName, updatedValue))
        // updateCytoscapeFromDocument(historicalView);


        // if(gestureDataPoint){
        //     // if a gesture data point was recalled by the sequencer, then we need to apply its param values to the temporary mutable historical view
        //     let propName = `${gestureDataPoint.parent}_${gestureDataPoint.param}`
            
        //     // apply it to the visual graph
        //     updateVisualGraphElement(tempMutableView, propName, Number(gestureDataPoint.value))

        //     // apply it to the audio graph
        //     updateModuleParam(tempMutableView.synth.graph, moduleName, paramName, updatedValue)
        // }

    }
    // Load a version from the DAG
    async function loadVersion(targetHash, branch, fromPeer) {

        // get the head from this branch
        let head = patchHistory.branches[branch].head
        // get the automerge doc associated with the requested hash
        let requestedDoc = loadAutomergeDoc(branch)


 
        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(requestedDoc, [targetHash]);

        if(historicalView.drawing){
            loadCanvasVersion(historicalView.drawing)
        }
        // ⬇️ Optional sync logic for collaboration mode
        // const versionSyncMode = localStorage.getItem('syncMode') || 'shared';

        // if (versionSyncMode === 'shared') {
        //     // Propose to replace current state for both peers
        //     requestMergeOrReplace('replace', Automerge.save(historicalView));
        //     return; // Stop here — the update will happen after peer accepts
        // }
         
        // Check if we're on the head; reset clone if true (so we don't trigger opening a new branch with changes made to head)
        // compare the point in history we want (targetHash) against the head of its associated branch (head)
        if (head === targetHash){
   
            // no need to create a new branch if the user makes changes after this operation
            automergeDocuments.newClone = false
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // update patchHistory to set the current head and change hash
            patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                patchHistory.head.hash = targetHash
                patchHistory.head.branch = branch
            });
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }

            return
        } 

        // this is necessary for loading a hash on another branch that ISN'T the head
        else if (branch != patchHistory.head.branch) {
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }
            // update patchHistory to set the current head and change hash
            patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                patchHistory.head.hash = targetHash
                patchHistory.head.branch = branch
            });
            // set newClone to true
            automergeDocuments.newClone = true
    


        }
        // the selected hash belongs to the current branch
        else {
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // create a clone of the branch in case the player begins making changes
            let clonedDoc = Automerge.clone(historicalView)
            // store it
            automergeDocuments.current = {
                doc: clonedDoc
            }
            // set newClone to true
            automergeDocuments.newClone = true
        }

        if(fromPeer){
            // send message to 
        }
        // ⬇️ Optional sync/permission handling AFTER local load
        const recallMode = getVersionRecallMode();
        // ensure that loadVersion calls from the peer don't make past this point, becuase otherwise they'd send it back and forth forever 
        if (recallMode === 'openLoadVersion' && !fromPeer) {
            openVersionRecall(targetHash, branch);
        }

        if (recallMode === 'requestOpenLoadVersion'  && !fromPeer) {
            // requestVersionRecallWithPermission(amDoc, Automerge.getHeads(amDoc)[0], patchHistory.head.branch);
            console.warn('not set up yet')
        }

    }

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
    //             synthGraphCytoscape.add(currentGraph[i]);
    //         }
            
    //         synthGraphCytoscape.layout({ name: 'preset' }).run(); // Run the layout to position the elements
    //     }
    //     synthGraphCytoscape.layout({ name: 'preset' }).run();

    //     handle.on('change', (newDoc) => {
    //         // Compare `newDoc.elements` with current `cy` state and update `cy` accordingly
    //         const newElements = newDoc.doc.elements;
            
    //         // Add or update elements
    //         newElements.forEach((newEl) => {
    //             if (!synthGraphCytoscape.getElementById(newEl.data.id).length) {
    //                 // Add new element if it doesn't exist
    //                 synthGraphCytoscape.add(newEl);
    //             }
    //         });
            
    //         // Remove elements that are no longer in `newDoc`
    //         synthGraphCytoscape.elements().forEach((currentEl) => {
    //             if (!newElements.find(el => el.data.id === currentEl.id())) {
                    
    //                 synthGraphCytoscape.remove(currentEl);
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

    function sendSyncMessage() {
        if (syncMessageDataChannel && syncMessageDataChannel.readyState === "open") {
            // syncState = Automerge.initSyncState();
            let msg = Uint8Array | null
            // Generate a sync message from the current doc and sync state.
            ;[syncState, msg] = Automerge.generateSyncMessage(patchHistory, syncState);
            // syncState = newSyncState; // update sync state with any changes from generating a message
            
            if(msg != null){
                syncMessageDataChannel.send(msg)
    
            }
        }

    }

    function updateFromSyncMessage(branch, hash){
        if(!branch){
            branch = patchHistory.head.branch
        }

        if(!hash){
            hash = patchHistory.head.hash
        }
        // set docUpdated so that indexedDB will save it
        docUpdated = true
                // // need the branch
        // // need the current hash
        let requestedDoc = loadAutomergeDoc(branch)
        // Use `Automerge.view()` to view the state at this specific point in history
        const updatedView = Automerge.view(requestedDoc, [hash]);
        
        updateSynthWorklet('loadVersion', updatedView.synth.graph, null, updatedView.changeType)

        
        updateCytoscapeFromDocument(updatedView, 'buildFromSyncMessage')

        // update the historyGraph
        reDrawHistoryGraph()

        // update local branch
        amDoc = Automerge.clone(updatedView)
        // if(audioGraphDirty){
        //     audioGraphDirty = false
        // }
    }

    function getVersionRecallMode() {
        let mode = localStorage.getItem('versionRecallMode') || 'openLoadVersion';
        collaborationSettings.local.versionRecallMode = mode
        
        return mode
    }

    // 
    function openVersionRecall(hash, branch) {
        if (!syncMessageDataChannel || syncMessageDataChannel.readyState !== 'open') {
          console.warn("Cannot send open version recall: Data channel is not open.");
          return;
        }
      
        const message = {
          cmd: 'version_recall_open',
          hash,
          branch,
          from: thisPeerID
        };
      
        syncMessageDataChannel.send(JSON.stringify(message));
      
    }
      
      

        // !
        // todo: update this with automerge version when either p2p or websocket server is working
        // handle.on("ephemeral-message", (message) => {

        //     let msg = message.message
        //     switch (msg.msg){

        //         case 'moveModule':
        //             synthGraphCytoscape.getElementById(msg.module).position(msg.position);

        //             // also update the module internal boundaries for params
        //             updateSliderBoundaries(synthGraphCytoscape.getElementById(msg.module))
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
    // * DRAWING

    function canStartDrawing(e) {
        const topElement = document.elementFromPoint(e.clientX, e.clientY);

        // First, it must be the canvas
        if (topElement !== UI.draw.canvas) {
            return false;
        }
        
        // Second, no Cytoscape node/edge should be under the mouse
        const pos = synthGraphCytoscape.renderer().projectIntoViewport(e.clientX, e.clientY);
        // const eles = synthGraphCytoscape.elements().filter(ele => {
        //     return ele.isNode() || ele.isEdge();
        // }).filter(ele => ele.boundingBox().x1 <= pos[0] && pos[0] <= ele.boundingBox().x2
        //             && ele.boundingBox().y1 <= pos[1] && pos[1] <= ele.boundingBox().y2);

        // if (eles.length > 0) {
        //     // Cytoscape has a node or edge here — don't draw
        //     return false;
        // }

        const target = synthGraphCytoscape.renderer().findNearestElement(pos[0], pos[1], true);

        if (!target) {
            // No cytoscape element under pointer = OK to draw
            return true;
        }

        // Otherwise: Check if target is something we should still block
        if (target.isNode()) {
            // If you want to allow dragging from childNodes (ports), you need to allow nodes here
            return false;
        }

        if (target.isEdge()) {
            // Hovering over an edge = don't draw
            return false;
        }
        return true;
    }

    // selectively toggle pointer events on the draw canvas depending on whether mouse is over cytoscape
    function enableDrawingMode() {
        UI.draw.canvas.style.pointerEvents = 'auto';
    }
    
    function disableDrawingMode() {
        UI.draw.canvas.style.pointerEvents = 'none';
    }

    function draw(e) {
        const rect = UI.draw.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
  
        UI.draw.ctx.lineWidth = 5;
        UI.draw.ctx.lineCap = 'round';
        UI.draw.ctx.strokeStyle = '#000';
        
        UI.draw.ctx.lineTo(x, y);
        UI.draw.ctx.stroke();
        UI.draw.ctx.beginPath();
        UI.draw.ctx.moveTo(x, y);

        // apply points to temp array for storing in automerge on mouseup
        UI.draw.currentStrokePoints.push({ x, y });
    }

    UI.draw.eraser.addEventListener("click", async () => {
        eraseDrawing()
    })

    function eraseDrawing(){
        UI.draw.ctx.clearRect(0, 0, UI.draw.canvas.width, UI.draw.canvas.height);

        // clear the temp array of strokes
        UI.draw.currentStrokePoints = []
        // clear the drawing array
        UI.draw.canvasStrokes = []
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.drawing = []
        }, onChange,  `draw Erase_Drawing`);
    }

    function resetDrawing(){
        // this is different, in this case we don't want to add to the version history
        // this function is being called by newPatchHistory(), which already applies amDoc.drawing = [ ] within the patch init
        UI.draw.ctx.clearRect(0, 0, UI.draw.canvas.width, UI.draw.canvas.height);

        // clear the temp array of strokes
        UI.draw.currentStrokePoints = []
        // clear the drawing array
        UI.draw.canvasStrokes = []
    }
    // // use this to ensure the cytoscape doesn't draw a mousedown circle when we are drawing with the pen tool
    // function forceCytoscapeMouseup() {
    //     // Simulate a mouseup event into Cytoscape
    //     const event = new MouseEvent('mouseup', {
    //         bubbles: true,
    //         cancelable: true,
    //         view: window
    //     });
    //     synthGraphCytoscape.container().dispatchEvent(event);
    // }


    function loadCanvasVersion(strokes){
        if (!strokes || strokes.length === 0) {
            UI.draw.ctx.clearRect(0, 0, UI.draw.canvas.width, UI.draw.canvas.height);

            return
        };

        const ctx = UI.draw.ctx; // Your canvas 2D context
        const canvas = UI.draw.canvas;

        // 1. Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Loop through each stroke
        for (const stroke of strokes) {
            if (!stroke.points || stroke.points.length < 2) continue;

            ctx.beginPath();
            ctx.strokeStyle = stroke.color || '#000';
            ctx.lineWidth = stroke.thickness || 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            // 3. Move to the first point
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            // 4. Draw lines to the next points
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            ctx.stroke();
            ctx.closePath();
        }
    }

    function updateCursor(event) {

        //! ignore this for now. not as important

        // const topElement = document.elementFromPoint(event.clientX, event.clientY);
    
        // const container = synthGraphCytoscape.container();

        // // Pointer is over something that allows drawing
        // if (topElement === UI.draw.canvas) {
            
        //     // const cy = UI.synth.visual.cytoscape;
        //     const pos = synthGraphCytoscape.renderer().projectIntoViewport(event.clientX, event.clientY);
        //     const target = synthGraphCytoscape.renderer().findNearestElement(pos[0], pos[1], true);
    
        //     if (!target) {
        //         // console.log()
        //         // console.log('pen')
        //         // No node or edge under pointer — empty space = drawing mode
        //         // container.style.cursor = 'url("./assets/pencil.png"), auto'; // or 'crosshair'
        //         // console.log(container.style.cursor)
        //     } else {
        //         // console.log('synth')
        //         // Over a node or edge — normal interaction
        //         // container.style.cursor = 'default';
        //     }
        // } else {
        //     console.log('other')
        //     // Over some other floating UI element
        //     container.style.cursor = 'default';
        // }
    }


    //* BROWSERS

    // synth file browser
    document.getElementById('authorList').addEventListener('change', updateSynths);
    document.getElementById('tagList').addEventListener('change', updateSynths);

    function populateAuthors(synthFiles) {
        const uniqueAuthors = [...new Set(synthFiles.map(t => t.author))].sort();
        const authorList = document.getElementById('authorList');
        authorList.innerHTML = '';
      
        const allItem = document.createElement('li');
        allItem.textContent = 'All';
        allItem.dataset.value = 'all';
        allItem.classList.add('selected');
        allItem.onclick = () => onAuthorClick('all');
        authorList.appendChild(allItem);
      
        uniqueAuthors.forEach(author => {
          const li = document.createElement('li');
          li.textContent = author;
          li.dataset.value = author;
          li.onclick = () => onAuthorClick(author);
          authorList.appendChild(li);
        });
      }
      
      function populateTags(synthFiles) {
        const tagSet = new Set();
        synthFiles.forEach(t => (t.tags || []).forEach(tag => tagSet.add(tag)));
        const tags = Array.from(tagSet).sort();
        const tagList = document.getElementById('tagList');
        tagList.innerHTML = '';
      
        const allItem = document.createElement('li');
        allItem.textContent = 'All';
        allItem.dataset.value = 'all';
        allItem.classList.add('selected');
        allItem.onclick = () => onTagClick('all');
        tagList.appendChild(allItem);
      
        tags.forEach(tag => {
          const li = document.createElement('li');
          li.textContent = tag;
          li.dataset.value = tag;
          li.onclick = () => onTagClick(tag);
          tagList.appendChild(li);
        });
      }
      
      function updateSynths(synthFiles, selectedAuthor = 'all', selectedTag = 'all') {
        const synthList = document.getElementById('synthList');
        const tooltip = document.getElementById('synthListTooltip');
        synthList.innerHTML = '';
      
        const filtered = synthFiles.filter(t => {
          const matchAuthor = selectedAuthor === 'all' || t.author === selectedAuthor;
          const matchTag = selectedTag === 'all' || (t.tags || []).includes(selectedTag);
          return matchAuthor && matchTag;
        });
      
        if (filtered.length === 0) {
          const li = document.createElement('li');
          li.textContent = '(no matching synths)';
          li.style.fontStyle = 'italic';
          synthList.appendChild(li);
          return;
        }
      
        filtered.forEach(t => {
          const li = document.createElement('li');
          li.textContent = t.name;
          li.dataset.id = t.id;
          li.onmouseenter = (e) => {
                tooltip.textContent = t.description || '(no description)';
                tooltip.style.display = 'block';
          };
          li.onmousemove = (e) => {
                tooltip.style.left = e.pageX + 10 + 'px';
                tooltip.style.top = e.pageY + 10 + 'px';
          };
          li.onmouseleave = () => {
            tooltip.style.display = 'none';
          };
          li.onclick = () => onSynthClick(t.id);
          synthList.appendChild(li);
        });
      }
      

    function onSynthClick(id){
        ws.send(JSON.stringify({
            cmd: 'getSynthFile',
            id: id
        }))
    }

    function onTagClick(tag){
        if(tag ==='all'){
            ws.send(JSON.stringify({ cmd: 'getSynthTemplates'}));
        } else {
            ws.send(JSON.stringify({ cmd: 'getSynthTemplates', filter: 'tags', query: tag }));
        }

    }

    function onAuthorClick(author){
        if(author ==='all'){
            ws.send(JSON.stringify({ cmd: 'getSynthTemplates'}));
        } else {
            ws.send(JSON.stringify({ cmd: 'getSynthTemplates', filter: 'authors', query: author }));
        }

    }
    // * HELP OVERLAYS

    // synth pathcing interface help overlay
    let activeHelpKey = null;

    function toggleHelpOverlay(key, columnSide = "left") {
        const overlay = UI.overlays.help.synth.overlay
        const content = UI.overlays.help.synth.content
        
        if (activeHelpKey === key && !overlay.classList.contains("hidden")) {
            overlay.classList.add("hidden");
            
            activeHelpKey = null;
            return;
        }
        // console.log(key, columnSide, helpTexts[key])
        content.innerHTML = synthAppHelpOverlay || "<em>Help not available.</em>";
        // document.getElementById('synthAppHelpOverlayContent').innerHTML = "<h3>Hello</h3><p>This is a test.</p>";


        overlay.style.left = columnSide === "left" ? "50%" : "0%";
        overlay.classList.remove("hidden");
        activeHelpKey = key;
    }

    // My Workspace & Collab Panel Help Overlay
    let activeWorkspaceHelp = false;

    function toggleWorkspaceAndCollabPanelHelp() {
    const overlay = UI.overlays.help.workspaceAndCollab.overlay;
    const content = UI.overlays.help.workspaceAndCollab.content;

    if (activeWorkspaceHelp && !overlay.classList.contains("hidden")) {
        overlay.classList.add("hidden");
        activeWorkspaceHelp = false;
        return;
    }

    content.innerHTML = workspaceAndCollabPanelHelpOverlay || "<em>Help not available.</em>";
    overlay.classList.remove("hidden");
    activeWorkspaceHelp = true;
    }


    

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

   

    UI.overlays.settings.displaySignalAnalysisButton.addEventListener("click", async () => {
        signalAnalysisSetting = !signalAnalysisSetting
        updateSynthWorklet('setSignalAnalysis', signalAnalysisSetting)
    })

    function setSynthToolTip(description){
        const element = UI.synth.visual.cytoscapeTooltipText;
        // Set new text content
        element.textContent = description;
        
    }


    // Update button text based on Web Audio state
    function updateButtonText() {
        UI.menus.settings.audioToggleButton.textContent = (audioContext.state === 'running') ? 'Pause Audio' : 'Resume Audio';
    }
    let audioToggleButton = UI.menus.settings.audioToggleButton
    // Add event listener to toggle button
    audioToggleButton.addEventListener('click', async function () {
        if (!audioContext) return;

        //  if running, suspend immediately
        if (audioContext && audioContext.state === 'running') {
            // drop any pending statechange hook
            audioContext.onstatechange = null;
            // suspend DSP
            await audioContext.suspend();
            // update button styling
            audioToggleButton.style.backgroundColor = 'red'
            systemDropdown.style.backgroundColor = 'red'
            updateButtonText();
        } 
        // If suspended → resume, then sync only once we’re actually “running”
        else {
            await audioContext.resume();

            // wait 500ms before syncing the graph
            setTimeout(() => {
              updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type);
            }, 500);
        
            audioToggleButton.style.backgroundColor = '#444';
            systemDropdown.style.backgroundColor = '#444';
            updateButtonText();
        }
        // else if (audioContext && audioContext.state === 'suspended'){
            
        //     audioContext.onstatechange = () => {
        //         console.log('>>> audioContext state is now', audioContext.state);

        //         if (audioContext.state === 'running') {
        //                 // wait 500ms before syncing the graph
        //             setTimeout(() => {
        //                 updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type);

        //                                     // clear this handler so it only fires once
        //                  audioContext.onstatechange = null;

        //             }, 500);
        //             // // now that the worklet is processing, push the graph
        //             // updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type);
            

        //         }
        //     };
        //     await audioContext.resume();

        //     // // re-sync the current synth state in the worklet
        //     // updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.type)
        //     console.log('should resume')
        //     audioToggleButton.style.backgroundColor = '#444'
        //     systemDropdown.style.backgroundColor = '#444'
        //     updateButtonText();

        // }
    });


    // check for audio status every second
    let currentAudioStatusCheckIndex = 0;
    let audioToggleButtonUpdate = 0
    const checkAudioStatus = setInterval(() => {
        // Initialize the button text on load
        updateButtonText();
        const colors = ['red', '#444'];
       

        if(audioContext.state != 'running'){
            currentAudioStatusCheckIndex = (currentAudioStatusCheckIndex + 1) % colors.length;
            audioToggleButton.style.backgroundColor = colors[currentAudioStatusCheckIndex];
            audioToggleButtonUpdate = 1

            // set it's dropdwon menu title (System) to the same colour to help the player
            systemDropdown.style.backgroundColor = colors[currentAudioStatusCheckIndex];
        } else {
            if(audioToggleButtonUpdate === 1){
                audioToggleButton.style.backgroundColor = '#444'
                audioToggleButtonUpdate = 0

                // set it's dropdwon menu title (System) to the same colour to help the player
                systemDropdown.style.backgroundColor = '#444'
            }
            
            
        }
        // const sr = synthWorklet.getSampleRate()
  
    }, 1000);



// Toggle the visibility of the settings overlay
    function toggleSettingsOverlay() {
        
        UI.overlays.settings.overlay.style.display = UI.overlays.settings.overlay.style.display === 'flex' ? 'none' : 'flex';
    }

    // Add event listener for the settings button
    UI.overlays.settings.settingsButton.addEventListener('click', toggleSettingsOverlay);

    UI.overlays.settings.close.addEventListener('click', toggleSettingsOverlay);


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
        containerDiv.style.width = `${config.UI.knob.baseKnobSize}px`;
        containerDiv.style.height = `${config.UI.knob.baseKnobSize}px`;
        containerDiv.id = `paramDivContainer_${param.data.id}`


        // Create the label element
        const labelDiv = document.createElement('div');
        labelDiv.innerText = param.data.label || `Knob`; // Use parameter label or default
        labelDiv.style.textAlign = config.UI.knob.labelAlign;
        labelDiv.style.marginBottom = config.UI.knob.labelMarginBottom;
        labelDiv.style.marginTop = config.UI.knob.labelMarginTop || '10px';
        labelDiv.style.fontSize = config.UI.knob.labelFontSize;
        labelDiv.style.color = config.UI.knob.labelColour;
        
        // add menu or knob
        let paramDiv
        if(param.data.ui === 'menu'){
            paramDiv = document.createElement('select');
            // store contextual info about the param
            paramDiv.id = `paramControl_parent:${parentNodeID}_param:${param.data.label}`
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label

            paramDiv.style.width = '180%';
            paramDiv.style.padding = '5px';
            paramDiv.style.borderRadius = '4px';
            paramDiv.style.border = '3px solid black';
            paramDiv.style.fontSize = '20px';

            // New custom styling:
            paramDiv.style.backgroundColor = '#f0f0f0'; // Set the background color
            paramDiv.style.marginTop = '10px';          // Move it down by 10px (adjust as needed)
            paramDiv.style.color = '#333';              // Set the font color

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



        // Create a small wrapper div for each knob
        const knobWrapper = document.createElement('div');
        knobWrapper.style.position = 'relative';
        knobWrapper.style.width = '100%';
        knobWrapper.style.height = '100%';


        // Append the knob into this wrapper
        knobWrapper.appendChild(paramDiv);

        // Append the input to the container
        containerDiv.appendChild(labelDiv);
        containerDiv.appendChild(knobWrapper);
        document.body.appendChild(containerDiv);
        

        if (param.data.ui === 'knob'){
            let lastValue = null; // use this to filter out repeated values

            let unit = 'float'

            let stepSize = determineStepSize(param.data.min, param.data.max, 'logarithmic', 100 )

            if(param.data.units === 'steps' || param.data.units === 'BPM'){
                unit = 'integer'
                if(stepSize < 1) stepSize++
                stepSize = parseInt(stepSize, 10)
            }
            
        

            // Initialize jQuery Knob on the input
            $(paramDiv).knob({
                min: param.data.min || param.data.sliderMin || 0,
                max: param.data.max || param.data.sliderMax || 100,
                step: stepSize,
                fgColor: "#00aaff",
                bgColor: "#e6e6e6",
                inputColor: "#333",
                thickness: config.UI.knob.thickness,
                angleArc: 270,
                angleOffset: -135,
                width: config.UI.knob.baseKnobSize,          // Set width of the knob
                height: config.UI.knob.baseKnobSize,  
                // change: function (value) {
                //     $(this.$).trigger('knobChange', [parentNodeID, param.data.label, value]);
                // },
                draw: function() {
                    $(paramDiv).css('font-size', '11pt');
                },
                change: (value) => {
                    
                    let newValue = Math.round(value * 100) / 100
                    if(unit === 'integer'){
                        
                        newValue = parseInt(newValue, 10)
                    }
                    // filter out repeated values
                    if (newValue !== lastValue) {
                        lastValue = newValue;
                        // set params in audio graph:
                        paramChange(parentNodeID, param.data.label, newValue)
                    }
                },
                release: (value) => {
                    // console.log(`gesture ended. see \/\/! comment in .knob().release() in createFloatingOverlay for how to use this`);
                    //! could use this to get the start and end of a knob gesture and store it as an array in the history sequence
                },

            });

            // fix input text to centre of knob
            Object.assign(paramDiv.style, {
                position: 'absolute',
                top: '15%',
                left: '125%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
                height: 'auto',
                textAlign: 'center',
                fontSize: '14px',
                pointerEvents: 'none',
                background: 'transparent',
                border: 'none'
            });
        } else if (param.data.ui === 'menu'){
            // ignore
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)

        }

        // Create a virtual element for Floating UI
        let virtualElement = {
            getBoundingClientRect: () => {
                const childNode = synthGraphCytoscape.getElementById(param.data.id);
                const parentNode = synthGraphCytoscape.getElementById(parentNodeID)
                const parentData = parentNode.data();

                const parentParams = parentData?.moduleSpec?.paramNames || [];
                if (childNode && parentParams.length > 0) {
                    const containerRect = synthGraphCytoscape.container().getBoundingClientRect();
                    const zoom = synthGraphCytoscape.zoom();
                    const pan = synthGraphCytoscape.pan();
                    const parentNodeHeight = parentNode.renderedBoundingBox().h; // Get height from style
                    
                    // Get parent node's position (base for calculations)
                    const parentPos = parentNode.position();

                    // Calculate knob dimensions
                    const knobWidth = config.UI.knob.baseKnobSize; // Example knob width (update as needed)
                    const knobHeight = config.UI.knob.baseKnobSize; // Example knob height (update as needed)

                    // Default (even layout or regular position)
                    return {
                        width: config.UI.knob.baseKnobSize,
                        height: config.UI.knob.baseKnobSize,
                        top: containerRect.top + childNode.position().y,
                        left: containerRect.left + childNode.position().x,
                        right: containerRect.left + childNode.position().x + config.UI.knob.baseKnobSize,
                        bottom: containerRect.top + childNode.position().y + config.UI.knob.baseKnobSize,
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
        // synthGraphCytoscape.on('pan zoom position', updateKnobPositionAndScale);

        return { containerDiv, removeKnob } ;
    }


    // dynamically update all floating ui elements' position and scale 
    function updateKnobPositionAndScale(cmd, node) {
        const zoom = synthGraphCytoscape.zoom();
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
                            const scaledSize = config.UI.knob.baseKnobSize / zoom;
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
                        const scaledSize = config.UI.knob.baseKnobSize / zoom;
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
        let connectedEdges = synthGraphCytoscape.collection();




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
   
    // do this once:

    function updateCableControlPointDistances(x, y){
        synthGraphCytoscape.style()
        .selector(`edge`)
        .style({
            'control-point-distances': [y, x, y]
        })
        .update();
    }

    //*
//*
//* webRTC COMMUNICATION
//* Functions that communicate between main app and server
//*   

    // ICE server configuration (using a public STUN server)
    const configuration = {
        iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
        // Optionally add TURN servers here
        ]
    };
    
    // Create the RTCPeerConnection.
    const peerConnection = new RTCPeerConnection(configuration);

    // Helper function to send signaling messages using the "newPeer" command.
    function sendSignalingMessage(message) {
        // Wrap message in an object with cmd 'newPeer'
        const payload = JSON.stringify({ cmd: 'newPeer', msg: message, peerID: thisPeerID });
        ws.send(payload);
    }
    
    // --- ICE Candidate Handling ---
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            // console.log("Sending ICE candidate:", event.candidate);
            sendSignalingMessage({ candidate: event.candidate });
        }
    };

    // --- Data Channel Handling ---
    // If you're the initiating peer, you'll create the data channel.
    // Otherwise, listen for the remote data channel.
    peerConnection.ondatachannel = event => {
        const channel = event.channel;
        channel.binaryType = 'arraybuffer';
        if (channel.label === "syncChannel" || channel.label === "myDataChannel") {
            syncMessageDataChannel = channel;
            setupDataChannel(syncMessageDataChannel);
        } else if (channel.label === "peerPointerChannel") {
            peerPointerDataChannel = channel;
            setupPeerPointerDataChannel(peerPointerDataChannel);
        }
    };
    
    // Function to set up the data channel events.
    function setupDataChannel() {
        syncMessageDataChannel.onopen = () => {

            const message = {
                cmd: 'remotePeerCollaborationSettings',
                from: thisPeerID,
                data: collaborationSettings
            };
            syncMessageDataChannel.send(JSON.stringify(message));

            sendSyncMessage()
        };
        syncMessageDataChannel.onmessage = event => {
            let incomingData;
            // handle Custom JSON messages (like version recalls, merge requests, etc.)
            if (typeof event.data === "string") {
                try {
                    const msg = JSON.parse(event.data);
        
                    console.log(msg)
                    try {
                        switch (msg.cmd) {
                            case 'version_recall_open': 
                                loadVersion(msg.hash, msg.branch, 'fromPeer');
                            break;
                        
                        
                            case 'version_recall_mode_announcement':
                                const remoteMode = msg.mode;
                                UI.panel.collaboration.recallMode.remote.innerText = `Remote peer mode: ${remoteMode}`;
                        
                                collaborationSettings.remotePeer.versionRecallMode = remoteMode;
                                
                            break;

                            case 'remotePeerCollaborationSettings':
                                collaborationSettings.remotePeer.versionRecallMode = msg.data.local.versionRecallMode
                                UI.panel.collaboration.recallMode.remote.innerText = `Remote peer mode: ${msg.data.local.versionRecallMode}`;
                            break
                  
                        default:
                            console.warn("Unknown custom message cmd:", msg.cmd);
                        }
                      } catch (err) {
                        console.error("Error handling JSON message:", err);
                      }
                } catch (err) {
                    console.error("Failed to parse custom JSON message:", event.data);
                }
        
                return; // Do not proceed to Automerge sync handling
            }
            // handle binary blobs (automerge sync messages)
            if (event.data instanceof ArrayBuffer) {
                incomingData = new Uint8Array(event.data);

            } else {
                console.error("Expected ArrayBuffer but got:", event.data);
                return;
            }

            try {
                [patchHistory, syncState] = Automerge.receiveSyncMessage(patchHistory, syncState, incomingData);
                
                const syncBranch = patchHistory.head?.branch;
                const syncHash = patchHistory.head?.hash;
                
                if (syncBranch && syncHash && patchHistory.docs?.[syncBranch]) {
                  updateFromSyncMessage(syncBranch, syncHash);
                } else {
                  console.warn("Sync message received but state incomplete — skipping update.");
                }
                // After processing, check if there is an outgoing sync message to send.
                sendSyncMessage();
            } catch (error) {
                console.error("Error processing sync message:", error);
            }
        };
    }
    

    function setupPeerPointerDataChannel(channel) {
        channel.onopen = () => {
            // You could send an initial message if needed:
            // channel.send(JSON.stringify({ type: 'pointerInit', data: ... }));
        };
        channel.onmessage = event => {
            let msg = JSON.parse(event.data)
            
            displayPeerPointers(msg.peerID, msg.mousePointer)
            // if (event.data instanceof ArrayBuffer) {
            //     incomingData = new Uint8Array(event.data);
            //     // Process pointer messages accordingly.
            //     console.log("Received peer pointer data:", incomingData);
            //     // For example, convert to JSON (if you sent JSON as binary) or handle as needed.
            // } else {
            //     console.error("Expected ArrayBuffer on peer pointer channel but got:", event.data);
            // }
        };
    }

    

    // --- Initiating Connection ---
    // This function is called when you want this client to start the connection.
    async function initiateConnection() {
        // Create the sync channel (for Automerge sync)
        syncMessageDataChannel = peerConnection.createDataChannel("syncChannel");
        setupDataChannel();
        
        // Create the peer pointer channel (for pointer messages)
        peerPointerDataChannel = peerConnection.createDataChannel("peerPointerChannel");
        setupPeerPointerDataChannel(peerPointerDataChannel);
        
        // Create an SDP offer.
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        // Send the offer through the signaling channel.
        sendSignalingMessage(offer);
    }
    
    // // Attach the initiation to a button click (ensure the button exists in your HTML)
    // document.getElementById("startConnectionButton").addEventListener("click", () => {
    //     initiateConnection().catch(err => console.error("Error initiating connection:", err));
    // });




//*
//*
//* SERVER COMMUNICATION
//* Functions that communicate between main app and server
//*

    ws.onopen = () => {
        // console.log('Connected to WebSocket server');
        ws.send(JSON.stringify({
            cmd: 'joinRoom',
            peerID: thisPeerID,
            room: room
        }));

        ws.send(JSON.stringify({
            cmd: 'getRooms'
        }))

        initiateConnection().catch(err => console.error("Error initiating connection:", err))
    };
    
    ws.onmessage = async (event) => {
        let msg = JSON.parse(event.data)
        switch(msg.cmd){

            case 'roomsInfo':
                // ignore (meant for other ws clients)
            break

            case 'newPeer':
                const peerMessage = JSON.parse(msg.msg).msg
                UI.panel.collaboration.remotePeerUsername.textContent = JSON.parse(msg.msg).peerID;

                // Process the signaling message based on its type.
                if (peerMessage.type === 'offer') {
                    // Received an offer: set it as the remote description.
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(peerMessage));
                    // Create an answer and set as local description.
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    // Send the answer via the signaling channel.
                    sendSignalingMessage(answer);
                } else if (peerMessage.type === 'answer') {

                    // Received an answer for our offer.
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(peerMessage));
                } else if (peerMessage.candidate) {
                    // Received an ICE candidate.
                    try {
                    await peerConnection.addIceCandidate(peerMessage.candidate);
                    } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                    }
                }
            break

            case 'roomInfo':
                console.log('roomsInfo', msg)
            break
            case 'roomFull':
                alert('cannot connect to room, too many peers are active. please choose another room in the lobby')
            break

            case 'synthTemplatesList':
                dbSynthFiles = msg.data // store locally for when we want to filter results in the synth filebrowser panel
                populateAuthors(msg.data);
                populateTags(msg.data);
                updateSynths(msg.data);

            break

            case 'retrievedSynthFile':
                const file = msg.data.rows[0].synth_json
                if (!file) {
                    alert('No file selected');
                    return;
                }
            
                localStorage.setItem('synthFile', file);

                // Parse the JSON data
                // const jsonData = JSON.parse(reader.result);
                createNewPatchHistory(file)
                // Ensure the file is a valid Automerge binary (based on extension or type)
                // if (!file.name.endsWith('.fpsynth')) {
                //     alert('Invalid file type. Please select a .fpsynth file.');
                //     return;
                // }
            
                // const reader = new FileReader();
            
                // reader.onload = () => {
                //     try {

                //         localStorage.setItem('synthFile', reader.result);

                //         // Parse the JSON data
                //         const jsonData = JSON.parse(reader.result);
                //         createNewPatchHistory(jsonData)

                //     } catch (error) {
                //         console.error("Failed to parse JSON:", error);
                //     }
                // };
                // reader.onerror = () => {
                //     console.error("Error reading the file:", reader.error);
                // };

                // // Start reading the file
                // reader.readAsText(file);
            break

            default: console.warn('no switch case exists for message:', msg)
        }
    };
    
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };



    
//*
//*
//* AUDIO WORKLET COMMUNICATION
//* Functions that communicate between main app and audio worklet
//*



//*
//*
//* APP COMMUNICATION
//* Functions that communicate between main app and history app 
//*


    function openGraphWindow() {
        patchHistoryWindow = window
        // Get the current window's outer dimensions
        const width = window.outerWidth;
        const height = window.outerHeight;
        
        // Optionally, get the current window's position on the screen
        const left = window.screenX;
        const top = window.screenY;
        
        // Build the feature string
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        
        
        patchHistoryWindow = window.open('patchHistory.html', 'HistoryGraph', features);
        localStorage.setItem('patchHistoryWindowOpen', true);
        
    }
    // Example: Send graph data to the history tab
    function sendMsgToHistoryApp(data) {
        if (patchHistoryWindow && !patchHistoryWindow.closed) {
            patchHistoryWindow.postMessage(data, '*');
        } else {
            // console.error('Graph window is not open or has been closed.');
            openGraphWindow()
        }
    }

    // Listen for messages from the history window
    window.addEventListener('message', (event) => {
        if(!event.data.cmd){
            return
        }
        switch(event.data.cmd){

            case 'historySequencerReady':
                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'reDrawHistoryGraph',
                    data: patchHistory
                        
                })
                
            break
            case 'loadVersion':
                loadVersion(event.data.data.hash, event.data.data.branch, event.data.data.gestureDataPoint)
            break

            case 'loadVersionWithGestureDataPoint':
                loadVersionWithGestureDataPoint(event.data.data.hash, event.data.data.branch, event.data.data.gestureDataPoint)
            break
            
            case 'saveSequence':

                console.log('received sequence for saving:', event.data)
                amDoc = applyChange(amDoc, (amDoc) => {
                    // set the sequencer table data
                    if(!amDoc.sequencer){
                        amDoc.sequencer = {
                            tableData: []
                        }
                    }
                    amDoc.sequencer.tableData = event.data.data
                    // set the change type
                    amDoc.changeType = {
                        msg: 'sequence',
                        tableData: event.data.data,
                        timestamp: new Date().getTime()
                    }
                }, onChange, `sequence todo:sequenceNaming tableData:${JSON.stringify(event.data.data)}`);

            break
            case 'updateSequencer':
                patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                    patchHistory.sequencer[event.data.setting] = event.data.data
                });

                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'sequencerUpdate',
                    data: patchHistory
                        
                })
            break

            case 'merge':
                createMerge(event.data.nodes)
                
            break

            case 'hydrateGesture':
                // we've recalled a sequence node into the entire sequencer, so hydrate the sequencerData.gestures array in the patchHistory.js
                let hydratedDoc = loadAutomergeDoc(event.data.data.branch)

                // Use `Automerge.view()` to view the state at this specific point in history
                const hydratedView = Automerge.view(hydratedDoc, [event.data.data.hash]);

                console.log(hydratedView, event.data.data.index)
                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'hydrateGesture',
                    data: hydratedView.changeType,   
                    index: event.data.data.index   
                })
            break

            case 'getGestureData':
                // get the head from this branch
                let head = patchHistory.branches[event.data.data.branch].head

                let gestureDoc = loadAutomergeDoc(event.data.data.branch)

                // Use `Automerge.view()` to view the state at this specific point in history
                const gestureView = Automerge.view(gestureDoc, [event.data.data.hash]);
                
                let recallGesture = false
                if(event.data.data.cmd === 'recallGesture'){
                    recallGesture = true
                }

                sendMsgToHistoryApp({
                    appID: 'forkingPathsMain',
                    cmd: 'getGestureData',
                    data: gestureView.changeType,
                    recallGesture: recallGesture
                        
                })
            break
            case 'playGesture':
                const node = event.data.data
                const data = {
                    parent: node.parent,
                    param: node.param, 
                    value: node.value,
                    kind: node.kind
                }
                updateSynthWorklet('paramChange', data)

                // set param value visually
                let paramID = `paramControl_parent:${data.parent}_param:${data.param}`
                const paramElement = UI.synth.visual.paramControls[node.parent][node.param];
                paramElement.value = data.value;
                // for all non-menu UIs
                if(event.data.kind != 'menu'){
                    $(paramElement).val(data.value).trigger('change');
                }


            break

            case 'cloneGesture':
                let msg = event.data.data

           
                // prepare to create a new branch from the position of the parentNode, which is the node just before the start of the gesture we are cloning
                let requestedDoc = loadAutomergeDoc(msg.parentNode.branch)

                // Use `Automerge.view()` to view the state at this specific point in history
                const historicalView = Automerge.view(requestedDoc, [msg.parentNode.id]);

                let clonedDoc = Automerge.clone(historicalView)

                automergeDocuments.current = {
                    doc: clonedDoc
                }
                // set newClone to true
                automergeDocuments.newClone = true

                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.synth.graph.modules[msg.assignTo.parent].params[msg.assignTo.param] = msg.scaledValues;
                    audioGraphDirty = true;
                    // set the change type
                    amDoc.changeType = {
                        msg: 'gesture',
                        param: msg.assignTo.param,
                        parent: msg.assignTo.parent,
                        values: msg.scaledValues,
                        timestamps: msg.timestamps
                    }
                }, onChange, `gesture ${msg.assignTo.param}$PARENT ${msg.assignTo.parent}`);
            break

            default: console.warn('switch case doesnt exist for:', event.data.cmd)
        }

    });

//*
//*
//* EVENT HANDLERS
//* Functions that directly handle UI interactions
//*

    UI.panel.collaboration.recallMode.selectmenu.value = getVersionRecallMode();

    UI.panel.collaboration.recallMode.selectmenu.addEventListener('change', (e) => {
        localStorage.setItem('versionRecallMode', e.target.value);
        collaborationSettings.local.versionRecallMode = e.target.value
      
        // Send to peer
        if (syncMessageDataChannel?.readyState === "open") {
            const message = {
                cmd: 'version_recall_mode_announcement',
                from: thisPeerID,
                mode: e.target.value
            };
            syncMessageDataChannel.send(JSON.stringify(message));
        }
        

    });
    // https://forms.gle/aerpRUgBR7bH1xpB9
 
    // opens the GitHub issue page in a new browser tab.
    UI.menus.testing.bugReport.addEventListener("click", function() {
        window.open("https://github.com/michaelpalumbo/forkingpaths/issues/new", "_blank");
    });

        
    // synth patching help overlay
    UI.overlays.help.synth.button.addEventListener("click", () => {
        toggleHelpOverlay("synthAppHelp", "left");
    });
    
    UI.overlays.help.synth.close.addEventListener("click", () => {
        UI.overlays.help.synth.overlay.classList.add("hidden");
        activeHelpKey = null;
    });

    // My Workspace and Collab Panel Help Overlay
    UI.overlays.help.workspaceAndCollab.button.addEventListener("click", () => {
        toggleWorkspaceAndCollabPanelHelp();
    });
      
    UI.overlays.help.workspaceAndCollab.close.addEventListener("click", () => {
        UI.overlays.help.workspaceAndCollab.overlay.classList.add("hidden");
        activeWorkspaceHelp = false;
    });
      

    // });

    // Listen for mouse down event on the document
    document.addEventListener('mousedown', function(event) {
        hid.mouse.left = true

        // enable the mouse drawing tool
        if (canStartDrawing(event)) {
            UI.draw.currentStrokePoints = []

            enableDrawingMode();
            UI.draw.drawing = true;
            draw(event); // start drawing immediately
        } else {
            disableDrawingMode();
            UI.draw.drawing = false;
        }

    });
    
    // Listen for mouse up event on the document
    document.addEventListener('mouseup', function(event) {
        hid.mouse.left = false
        
        // if the user has been playing with a param knob, we need to store it as a param change (or list of param changes) in automerge
        if(Object.keys(groupChange).length > 0){
            // if we are storing a single param change, do a paramUpdate
            if(groupChange.values.length === 1){
                // change is singular
                // Update in Automerge
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.synth.graph.modules[groupChange.parentNode].params[groupChange.paramLabel] = groupChange.values[0];
                    audioGraphDirty = true;
                    // set the change type
                    amDoc.changeType = {
                        msg: 'paramUpdate',
                        param: groupChange.paramLabel,
                        parent: groupChange.parentNode,
                        value: groupChange.values
                    }
                }, onChange, `paramUpdate ${groupChange.paramLabel} = ${groupChange.values[0]}$PARENT ${groupChange.parentNode}`);

            } else if(groupChange.values.length > 1){
                // are storing a gesture
                // Update in Automerge
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.synth.graph.modules[groupChange.parentNode].params[groupChange.paramLabel] = groupChange.values;
                    audioGraphDirty = true;
                    // set the change type
                    amDoc.changeType = {
                        msg: 'gesture',
                        param: groupChange.paramLabel,
                        parent: groupChange.parentNode,
                        values: groupChange.values,
                        timestamps: groupChange.timestamps
                    }
                }, onChange, `gesture ${groupChange.paramLabel}$PARENT ${groupChange.parentNode}`);

            }

            // clear the groupChange
            groupChange = { }
        }

        // disable drawing
        disableDrawingMode();
        UI.draw.drawing = false;
        UI.draw.ctx.beginPath(); // Reset path to avoid artifacts
        if(UI.draw.currentStrokePoints.length > 1){

            // Push the new finished stroke into the full strokes array
            UI.draw.canvasStrokes.push({
                points: [...UI.draw.currentStrokePoints],
                color: UI.draw.color || '#000',
                thickness: UI.draw.lineWidth || 2,
                timestamp: Date.now()
            });
            
            amDoc = applyChange(amDoc, (amDoc) => {
                amDoc.drawing = UI.draw.canvasStrokes
            }, onChange,  `draw added_strokes: ${UI.draw.currentStrokePoints.length}`);

            UI.draw.currentStrokePoints = [ ]
        }


    });


   

      // You can attach a mousemove listener on the document or the tracker div.
    // Note: If you attach it to tracker and it has pointer-events: none, 
    // you may not get events reliably, so attaching to document is often best.
    document.addEventListener('mousemove', (event) => {
        // Compute the position relative to the tracker div.
        const rect = UI.synth.visual.mouseTracker.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (peerPointerDataChannel && peerPointerDataChannel.readyState === "open") {

            // if(msg != null){
                peerPointerDataChannel.send(JSON.stringify({
                    peerID: thisPeerID,
                    mousePointer: { x: x, y: y }
                }))
    
            // }
        }

        // // also update the drawing canvas dimensions
        // UI.draw.canvas.width = rect.width
        // UI.draw.canvas.height = rect.height

        // set mousecursor
        updateCursor(event);

        // Only draw if actively drawing
        if (UI.draw.drawing) {
            draw(event);
        }
    });


    

    // updateSynthWorklet(setOutputVolume, gainLevel)

    // Slider functionality
    const volumeSlider = UI.overlays.settings.volumeSlider
    const volumeValue = UI.overlays.settings.volumeValue

    // Initialize the GainNode and slider with the saved volume
    volumeValue.textContent = `${Math.round(savedVolume * 100)}%`; // Update percentage display
    volumeSlider.value = savedVolume;

    volumeSlider.addEventListener('input', (event) => {
        const volume = parseFloat(event.target.value);
        updateSynthWorklet('setOutputVolume', volume)
        volumeValue.textContent = `${Math.round(volume * 100)}%`; // Update percentage display

        localStorage.setItem('volume', volume); // Save to localStorage

    });
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
    synthGraphCytoscape.on('pan zoom', function (){
        updateKnobPositionAndScale('all')
    } );

    synthGraphCytoscape.on('position', 'node', function (event) {
        const node = event.target.data().parent;
        // ignore modules that don't have UI overlays
        if(!virtualElements[node]){
            return
        }
        updateKnobPositionAndScale('node', node)
    });


    synthGraphCytoscape.off('add');

    UI.menus.view.openSynthDesigner.addEventListener('click', () => {
        window.open(`synthDesigner.html?username=${encodeURIComponent(UI.panel.collaboration.username.innerHTML)}`)
    });

    // Open the history sequencer in a new tab
    UI.menus.view.openHistoryWindow.addEventListener('click', () => {
        openGraphWindow()
        localStorage.setItem('patchHistoryWindowOpen', true); 

    });



    synthGraphCytoscape.on('mouseover', 'node', (event) => {
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

    });
    
    synthGraphCytoscape.on('mouseout', 'node', (event) => {
        // clear the tooltip
        setSynthToolTip('')

    });
    
    // get .forkingpaths files from user's filesystem
    UI.menus.file.loadPatchHistory.addEventListener('change', async (event) => {
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
                console.log('loading', binaryData)
                // Load the Automerge document
                patchHistory = Automerge.load(binaryData);
                amDoc = Automerge.load(patchHistory.docs.main)

                updateCytoscapeFromDocument(amDoc, 'buildUI');
            
                previousHash = patchHistory.head.hash
                
                reDrawHistoryGraph()
    
                // set the document branch (aka title)  in the editor pane
                // document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;

                saveDocument(patchHistoryKey, Automerge.save(patchHistory));
                // enable new history button now that a synth has been loaded
                // UI.menus.file.newPatchHistory.disabled = false
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

    // load the demo synth from /public/assets
    

    function toggleSynthBrowserOverlay(){
        UI.overlays.synthBrowser.overlay.style.display = UI.overlays.synthBrowser.overlay.style.display === 'flex' ? 'none' : 'flex';
    }

    UI.overlays.synthBrowser.close.addEventListener('click', toggleSynthBrowserOverlay);
    
    UI.menus.file.openSynthBrowser.addEventListener('click', toggleSynthBrowserOverlay)
    
    UI.menus.file.loadDemoSynth.addEventListener('click', async (event) => {
        try {
            // Fetch the JSON file (with a custom extension)
          const response = await fetch(`/assets/synths/demoApril2025.fpsynth`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          
          // Parse the response as JSON
          const fileContent = await response.json();
          
          // Store the JSON string in localStorage if needed
          localStorage.setItem('synthFile', JSON.stringify(fileContent));
          
          // Process the JSON content
          createNewPatchHistory(fileContent);

          // enable new history button now that a synth has been loaded
        //   UI.menus.file.newPatchHistory.disabled = false
          
        } catch (error) {
          console.error("Error loading template file:", error);
        }
    });
    // // get .fpsynth files from user's filesystem
    // document.getElementById('loadDemoSynthButton').addEventListener('click', async (event) => {
    //     let file = await fetch(`/assets/synths/${import.patchHistory.env.VITE_FIRST_SYNTH}.fpsynth`).json()
    
    //     console.log(file)
    //     if (!file) {
    //         alert('No file selected');
    //         return;
    //     }
    
    //     // Ensure the file is a valid Automerge binary (based on extension or type)
    //     if (!file.name.endsWith('.fpsynth')) {
    //         alert('Invalid file type. Please select a .fpsynth file.');
    //         return;
    //     }
    
    //     const reader = new FileReader();
    
    //     reader.onload = () => {
    //         try {

    //             localStorage.setItem('synthFile', reader.result);

    //             // Parse the JSON data
    //             const jsonData = JSON.parse(reader.result);
    //             createNewPatchHistory(jsonData)

    //         } catch (error) {
    //             console.error("Failed to parse JSON:", error);
    //         }
    //     };
    //     reader.onerror = () => {
    //         console.error("Error reading the file:", reader.error);
    //     };

    //     // Start reading the file
    //     reader.readAsText(file);
        
    // });
    
    // get .fpsynth files from user's filesystem
    UI.menus.file.loadSynthFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
    
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
                createNewPatchHistory(jsonData)

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
    UI.menus.file.savePatchHistory.addEventListener("click", () => {
        // check if browser supports the File System Access API
        if(!!window.showSaveFilePicker){
            
            saveFile("filename");
        } else {
            saveAutomergeDocument('session');
        }
        
    });


    // Listen for changes to the radio buttons
    // const radioButtons = document.querySelectorAll('input[name="traversalMode"]');
    // radioButtons.forEach((radio) => {
    //     radio.addEventListener('change', (event) => {
    //         patchHistory = Automerge.change(patchHistory, (patchHistory) =>{
    //             patchHistory.sequencer.traversalMode = event.target.value  
    //         })
    //     });
    // });




    // get mousedown events from cytoscape
    synthGraphCytoscape.on('mousedown', (event) => {

        // first check if we are not interacting with the cytoscape elements (i.e. if outside, we want to active the pen tool instead)
        const pos = synthGraphCytoscape.renderer().projectIntoViewport(event.originalEvent.clientX, event.originalEvent.clientY);
        const target = synthGraphCytoscape.renderer().findNearestElement(pos[0], pos[1], true);
        if (target && (target.isNode() || target.isEdge())) {
            // Clicked on a module, port, or cable: stay in Cytoscape interaction
            disableDrawingMode();
            UI.draw.drawing = false;
        } else {
            // forceCytoscapeMouseup()
            // Clicked on empty canvas background
            enableDrawingMode();
            UI.draw.drawing = true;
            return
        }

        hid.cyMouse.left = true
        // handle slider events
        if(event.target.data().kind && event.target.data().kind === 'slider'){
            
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
                const sourceNode = synthGraphCytoscape.getElementById(edge.data('source'));
                const targetNode = synthGraphCytoscape.getElementById(edge.data('target'));

                if (sourceNode && targetNode) {
                    // Extract positions to simple variables to avoid potential issues
                    const sourcePos = { x: sourceNode.position('x'), y: sourceNode.position('y') };
                    const targetPos = { x: targetNode.position('x'), y: targetNode.position('y') };
                    const parentSourceID = sourceNode.parent().data().id
                    const parentTargetID = targetNode.parent().data().id
                    
                    // Check if the click is near the source or target endpoint
                    if (isNearEndpoint(mousePos, sourcePos)) {
                        let cableSource =  edge.data().source
                        let cableTarget =  edge.data().target
                        let audioGraphConnections = amDoc.synth.graph.connections

                        // delete the cable
                        synthGraphCytoscape.remove(edge);
                        // also remove the cable from automerge!
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        
                        console.warn('todo: check if this cable was part of a cycle, if it is, ensure that whichever edge in the cycle that has the feedback:true prop set in the audio graph is now set to false')                        

                        // * automerge version: 
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Within the visual graph, Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);
                            // set the change type
                            amDoc.changeType = {
                                msg: 'disconnect'
                            }
                            // If a match is found, remove the object from the array
                            if (index !== -1) {
                                amDoc.elements.splice(index, 1);
                            }
                            
                            // remove connection from audio graph
                            // Find the index of the object that matches the condition
                            let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
                            // If a match is found, remove the object from the array
                            if (audioConnectionIndex !== -1) {
                                amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
                            }                
                        }, onChange, `disconnect ${edge.data().source} from ${edge.data().target}$PARENTS ${parentSourceID} ${parentTargetID}`);


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
                        let cableSource =  edge.data().source
                        let cableTarget =  edge.data().target
                        let audioGraphConnections = amDoc.synth.graph.connections

                        // delete the cable
                        synthGraphCytoscape.remove(edge);
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        // also remove the cable from automerge!
                        console.warn('todo: check if this cable was part of a cycle, if it is, ensure that whichever edge in the cycle that has the feedback:true prop set in the audio graph is now set to false')

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

                            // remove connection from audio graph
                            // Find the index of the object that matches the condition
                            let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
                            // If a match is found, remove the object from the array
                            if (audioConnectionIndex !== -1) {
                                amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
                            }

                        }, onChange, `disconnect ${edge.data().target} from ${edge.data().source}$PARENTS ${parentSourceID} ${parentTargetID}`);


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

   
    synthGraphCytoscape.on('mousemove', (event) => {
        
        // this is for local Ghost cables only
        // Step 2: Update ghost node position to follow the mouse and track collisons
        if (temporaryCables.local.ghostNode) {
            // if player is holding down a number key, assign a colour to the ghost cable
            if(hid.key.num){
                UI.synth.visual.ghostCableColour = UI.synth.visual.patchCableColors[hid.key.num - 1]
            } 

            temporaryCables.local.tempEdge.style({ 'line-color': UI.synth.visual.ghostCableColour})
            
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
            synthGraphCytoscape.nodes().forEach((node) => {
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
            // heldModulePos = event.position

  
            
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
    synthGraphCytoscape.on('mouseup', (event) => {
        hid.cyMouse.left = false

        if(isSliderDragging){
            isSliderDragging = false
        }
        if (temporaryCables.local.tempEdge) {
            if (temporaryCables.local.targetNode) {
                let cableColour = UI.synth.visual.ghostCableColour

                let src = temporaryCables.local.source.id()
                let targ = temporaryCables.local.targetNode.id()

                if(targ.includes('OUT')){
                    src = temporaryCables.local.targetNode.id()
                    targ = temporaryCables.local.source.id()
                }

                                    


                // If a target node is highlighted, connect the edge to it
                // tempEdge.data('target', targ); // Update the edge target
                
                // tempEdge.removeClass('tempEdge'); // Remove temporary class if needed
                synthGraphCytoscape.remove(temporaryCables.local.tempEdge)
                const edgeId = uuidv7()

                synthGraphCytoscape.add({
                    group: 'edges',
                    data: { id: edgeId, source: src, target: targ, kind: 'cable', colour: cableColour },
                    classes: 'edge'
                });


                // Grab it and force its colour (even tho we set it above, it was sometimes not rendering still)
                synthGraphCytoscape.getElementById(edgeId).style({
                    'line-color':         cableColour,
                    'target-arrow-color': cableColour
                });
                const parentSourceID = temporaryCables.local.source.parent().data().id
                const parentTargetID = temporaryCables.local.targetNode.parent().data().id
                
                let cycle = isEdgeInCycle(synthGraphCytoscape.$(`#${edgeId}`))

                // todo: inserting a blockSize delay in the worklet is clunky...
                if(cycle){
                    // ...  therefore, need to create a feedbackDelayNode that gets added to the synth.graph.modules
                    // ...  and has 2 connections: {source: src, target: feedbackDelayNode.IN} & {source: feedbackDelayNode.IN, target: targ}
                    // ...  then we need to add in the audioWorklet a 128-sample delay to the if statement for processing module kinds:
                    // ...  i.e. process this node
                    // ...  if (node.node === 'feedbackDelayNode') {
                    // ...      // code for the blockSize delay
                    // ...  }

                    // add the feedbackDelayNode
                    let feedbackDelayNodeID = `feedbackDelayNode_${uuidv7()}`
                    updateSynthWorklet('addNode', feedbackDelayNodeID, 'feedbackDelayNode' )

                    // updateSynthWorklet: add 2 connections: {source: src, target: feedbackDelayNode.IN} & {source: feedbackDelayNode.IN, target: targ}
                    updateSynthWorklet('addCable', { source: src, target: feedbackDelayNodeID + '.IN', feedback: cycle})                    
                    updateSynthWorklet('addCable', { source: feedbackDelayNodeID + '.OUT', target: targ, feedback: cycle})  
                    
                    //todo to amDoc.synth.graph.connections: add 2 connections: {source: src, target: feedbackDelayNode.IN} & {source: feedbackDelayNode.IN, target: targ}

                    amDoc = applyChange(amDoc, (amDoc) => {
                        amDoc.elements.push({
                            type: 'edge',
                            id: edgeId,
                            data: { id: edgeId, source: src, target: targ, kind: 'cable', colour: cableColour }
                        });
                        // set the change type
                        amDoc.changeType = {
                            msg: 'connect'
                        }
                        // todo add feedbackDelayNode to synth.graph
                        amDoc.synth.graph.modules[feedbackDelayNodeID] = {}
                        // todo figure out synth.graph.connections 
                        amDoc.synth.graph.connections.push( { source: src, target: feedbackDelayNodeID + '.IN', feedback: cycle} )
                        amDoc.synth.graph.connections.push( { source: feedbackDelayNodeID + '.OUT', target: targ, feedback: cycle} )

                        audioGraphDirty = true
                     }, onChange,  `connect ${temporaryCables.local.source.data().label} to ${temporaryCables.local.targetNode.data().label}$PARENTS ${parentSourceID} ${parentTargetID}`);
                    

                } else {
                    // update audio
                    updateSynthWorklet('addCable', { source: src, target: targ, feedback: cycle })
                    
                    // * automerge version:                
                    amDoc = applyChange(amDoc, (amDoc) => {
                        amDoc.elements.push({
                            type: 'edge',
                            id: edgeId,
                            data: { id: edgeId, source: src, target: targ, kind: 'cable', colour: cableColour }
                        });
                        // set the change type
                        amDoc.changeType = {
                            msg: 'connect'
                        }
                        amDoc.synth.graph.connections.push( { source: src, target: targ, feedback: cycle })
                        audioGraphDirty = true
                    }, onChange,  `connect ${temporaryCables.local.source.data().label} to ${temporaryCables.local.targetNode.data().label}$PARENTS ${parentSourceID} ${parentTargetID}`);

                }






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
                synthGraphCytoscape.remove(temporaryCables.local.tempEdge);
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
            synthGraphCytoscape.remove(temporaryCables.local.ghostNode);
            synthGraphCytoscape.nodes().removeClass('highlighted');


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
            
            // heldModulePos = { }
            // heldModule = null
        }
        // update pan after dragging viewport
        // currentPan = synthGraphCytoscape.pan()

        // synthGraphCytoscape.autoungrabify(true)

    });

    // Listen for drag events on nodes
    synthGraphCytoscape.on('grab', (event)=> {
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
    synthGraphCytoscape.on('click', 'node:parent', (event) => {


        // Remove highlight class from any previously highlighted node
        if (highlightedNode) {
            highlightedNode.removeClass('highlighted');
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'selectedNode',
                data: 'unselected'
                    
            })
        } 
        // if highlighted module is clicked again, unhighlighted it
        if( highlightedNode == event.target){
            highlightedNode.removeClass('highlighted');
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
            highlightedNode = null

            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'selectedNode',
                data: 'unselected'
                    
            })
            
        }
        else {
            // Highlight the clicked parent node
            highlightedNode = event.target;
            highlightedNode.addClass('highlighted');
            // show connected edge highlights
            highlightEdges('show', highlightedNode)

            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'selectedNode',
                data: highlightedNode.data().id
                    
            })
            
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

        if (['1','2','3','4','5'].includes(event.key)) {
            const n = Number(event.key);
            hid.key.num = n

            if(hid.mouse.left){
                UI.synth.visual.ghostCableColour = UI.synth.visual.patchCableColors[hid.key.num - 1]
                temporaryCables.local.tempEdge.style({ 'line-color': UI.synth.visual.ghostCableColour})
            }
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
        if (['1','2','3','4','5'].includes(event.key)) {
            // const n = Number(event.key);
            hid.key.num = false

        }
    });

     // Handle keydown event to delete a highlighted edge on backspace or delete
     document.addEventListener('keydown', (event) => {


        if (highlightedEdge && (event.key === 'Backspace' || event.key === 'Delete')) {
            let cableSource =  highlightedEdge.data().source
            let cableTarget =  highlightedEdge.data().target
            let audioGraphConnections = amDoc.synth.graph.connections
            updateSynthWorklet('removeCable', { source: cableSource, target: cableTarget})
            

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
                let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
                // If a match is found, remove the object from the array
                if (audioConnectionIndex !== -1) {
                    amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
                }
            }, onChange, `disconnect ${cableTarget.split('.')[1]} from ${cableSource.split('.')[1]}$PARENTS ${cableSource.split('.')[0]} ${cableTarget.split('.')[0]}`);

            synthGraphCytoscape.remove(highlightedEdge)
            highlightedEdge = null; // Clear the reference after deletion
        } else if (highlightedNode && (event.key === 'Backspace' || event.key === 'Delete')){
            /*
            if (highlightedNode.isParent()) {
                const nodeId = highlightedNode.id();

                // update audioGraph right away
                updateSynthWorklet('removeNode', nodeId)
-d 


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

                synthGraphCytoscape.remove(highlightedNode); // Remove the node from the Cytoscape instance
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

 

    // open a new session (with empty document)
    UI.menus.file.newPatchHistory.addEventListener('click', function() {

        
        createNewPatchHistory()

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

    //*
    //* PATCHING
    //*

    let highlightedEdge = null; // Variable to store the currently highlighted edge

    // function to create a cable

    function startCable(source, position){
        temporaryCables.local.source = source;
        const mousePos = position;


        // if player is holding down a number key, assign a colour to the ghost cable
        if(hid.key.num){
            UI.synth.visual.ghostCableColour = UI.synth.visual.patchCableColors[hid.key.num - 1]
        } else {
            // if not, set it to random colour
            UI.synth.visual.ghostCableColour = UI.synth.visual.patchCableColors[Math.floor(Math.random() * UI.synth.visual.patchCableColors.length)]
        }

        // Get the ghostCable property from the temporaryCables.local.ghostNode, default to 'ellipse' if undefined
        const ghostShape =  temporaryCables.local.source.data('ghostCableShape') || 'ellipse';
        const ghostColour =  temporaryCables.local.source.data('ghostCableColour') || '#5C9AE3';

        // Create a ghost node at the mouse position to act as the moving endpoint
        temporaryCables.local.ghostNode = synthGraphCytoscape.add({
            group: 'nodes',
            data: { id: 'localGhostNode' },
            position: mousePos,
            grabbable: false, // Ghost node shouldn't be draggable
            classes: 'ghostNode'
        });

        // Apply the ghostShape to the ghostNode using a direct style override
        temporaryCables.local.ghostNode.style({
            'shape': ghostShape,
            'background-color': ghostColour,
          
            // 'target-arrow-color': cableColour
        });
        // Create a temporary edge from ghostNodes.local.source to temporaryCables.local.ghostNode
        temporaryCables.local.tempEdge = synthGraphCytoscape.add({
            group: 'edges',
            data: { id: 'localTempEdge', source: temporaryCables.local.source.id(), target: 'localGhostNode', colour: UI.synth.visual.ghostCableColour },
            classes: 'tempEdge'
        });

        // Set target endpoint to mouse position initially
        temporaryCables.local.tempEdge.style({ 'line-color': UI.synth.visual.ghostCableColour, 'line-style': 'dashed',  'source-arrow-shape': 'none'  }); // Set temporary edge color        
    }

    function handleRemoteCables(cmd,  peerID, sourceID, position){
        
        switch(cmd){
            
            case 'startRemoteGhostCable':
                let ghostId = `ghostNode-${peerID}`
                let tempEdgeID = `tempEdge-${peerID}`
                
                temporaryCables.peers[peerID] = {
                    source: synthGraphCytoscape.getElementById(sourceID),
                    // Create a ghost node at the mouse position to act as the moving endpoint
                    ghostNode: synthGraphCytoscape.add({
                        group: 'nodes',
                        data: { id: ghostId },
                        position: position,
                        grabbable: false, // Ghost node shouldn't be draggable
                        classes: 'ghostNode'
                    }),
                    // Create a temporary edge from temporaryCables.local.source to ghostNode
                    tempEdge: synthGraphCytoscape.add({
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

                temporaryCables.peers[peerID].tempEdge.style({ 'line-color': '#228B22', 'line-style': 'dashed', 'source-arrow-shape': 'none' }); // Set peer temporary edge color
            break;

            case 'updateRemoteGhostCable':
                // update the tmporary cable's position
                temporaryCables.peers[peerID].ghostNode.position(position)
            break

            case 'finishRemoteGhostCable':
                // remove the tempEdge
                synthGraphCytoscape.remove(temporaryCables.peers[peerID].tempEdge)
                // remove remote ghostnode
                synthGraphCytoscape.remove(temporaryCables.peers[peerID].ghostNode);
                synthGraphCytoscape.nodes().removeClass('highlighted');

                // remove remote peer's temporary cable from object
                delete temporaryCables.peers[peerID]

            break;

        }

    } 

    // function addModule(module, position, children, structure) {
        
    //     // const parentNode = new ParentNode(module, position, children); // old version. 

    //     const parentNode = new ParentNode_WebAudioNode(module, position, children, structure, config.UI.moduleLayout);
  

    //     // parentNode.getModule('oscillator')
    //     const { parentNode: parentNodeData, childrenNodes, audioGraph, paramOverlays } = parentNode.getNodeStructure();
    //     // Add nodes to Cytoscape
    //     synthGraphCytoscape.add(parentNodeData);
    //     synthGraphCytoscape.add(childrenNodes);
        
        
    //     debugVar = parentNodeData.data.id
    //     // index determines the left or right positioning of each knob
    //     let index = 0
    //     paramUIOverlays[parentNodeData.data.id] = []

    //     // let tempOverlayArray = [ ]
    //     childrenNodes.forEach((param)=>{
            
    //         if (param.classes == 'paramAnchorNode' && paramOverlays){
    //             let uiOverlay = createFloatingOverlay(parentNodeData.data.id, param, index);
    //             paramUIOverlays[parentNodeData.data.id].push(uiOverlay)
    //             // tempOverlayArray.push(serializeDivToBase64(uiOverlay))
    //             index++
    //         }
    //     })
    //     // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
    //     setTimeout(() => {
    //         updateKnobPositionAndScale('all');
    //     }, 10); // Wait for the current rendering cycle to complete
    //     // * automerge version:        
    //     amDoc = applyChange(amDoc, (amDoc) => {
    //         amDoc.elements.push(parentNodeData);
    //         amDoc.elements.push(...childrenNodes);
    //         amDoc.synth.graph.modules[parentNodeData.data.id] = audioGraph
    //         audioGraphDirty = true

    //         // amDoc.paramUIOverlays[parentNodeData.data.id] = tempOverlayArray
    //     }, onChange, `add ${parentNodeData.data.id}`);
        
    //     // update the synthWorklet
    //     updateSynthWorklet('addNode', parentNode, structure )


    //     // addNode(parentNode.data())
    //     // todo: remove the -repo version once AM is working
    //     // Update Automerge-repo document
    // //     handle.change((doc) => {
    // //         doc.elements.push(parentNodeData);
    // //         doc.elements.push(...childrenNodes);

    // //     },{
    // //         message: `add ${parentNodeData.data.id}` // Set a custom change message here
    // //     });
    // }
    

    // // function updateSliderBoundaries(parentNode){
    // //     // Update the position constraints for all slider handles that are children of this parent node
    // //     cy.nodes(`node[parent="${parentNode.data().id}"]`).forEach((childNode) => {
    // //         if (childNode.hasClass('sliderHandle')) {
    // //             const trackLength = childNode.data('length') || 100; // Assuming track length is stored in data
    // //             const newTrackStartX = parentNode.position().x - trackLength / 2;
    // //             const newTrackEndX = parentNode.position().x + trackLength / 2;
    // //             const fixedY = parentNode.position().y; // Update if necessary based on your layout logic

    // //             // Update data attributes for the handle to use when dragging
    // //             childNode.data('trackStartX', newTrackStartX);
    // //             childNode.data('trackEndX', newTrackEndX);
    // //             childNode.data('fixedY', fixedY);
    // //         }
    // //     });
    // // }

    function displayPeerPointers(peer, position){
        if(!peers.remote[peer]){
            peers.remote[peer] = {
                mousePointer: synthGraphCytoscape.add({
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

        //! this version is for multiple peers and worked in the earliest forking paths version:
        // if(!peers.remote[peer]){
        //     peers.remote[peer] = {
        //         mousePointer: synthGraphCytoscape.add({
        //             group: 'nodes',
        //             data: { id: peer, label: peer, colour: randomColor()}, // Add a default color if needed },
        //             position: position,
        //             grabbable: false, // Prevents dragging
        //             selectable: false, // Prevents selection
        //             classes: 'peerPointer'

        //         })
        //     }
        // }else {
        //     peers.remote[peer].mousePointer.position(position)

        // }
    }

    //*
    //*
    //* AUDIO
    //* 
    //*

    
    function updateSynthWorklet(cmd, data, structure, changeType){

        switch (cmd) {
            case 'setOutputVolume':
                synthWorklet.port.postMessage({ 
                    cmd: 'setOutputVolume',
                    data: data
                });
            break
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

            case 'setSignalAnalysis':
                synthWorklet.port.postMessage({ 
                    cmd: 'setSignalAnalysis', 
                    data: data
                });
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
                    data: data
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
        return synthGraphCytoscape.elements().filter((ele) => {
            const bb = ele.boundingBox();
            return (
                x >= bb.x1 &&
                x <= bb.x2 &&
                y >= bb.y1 &&
                y <= bb.y2
            );
        });
    }


    function makeChangeMessage(branchName, msg){
        let amMsg = JSON.stringify({
            branch: branchName,
            msg: msg
        })
        return amMsg
    }

    function loadAutomergeDoc(branch){
        if (!patchHistory.docs[branch]) throw new Error(`Branchname ${branch} not found`);
        return Automerge.load(patchHistory.docs[branch]); // Load the document
    }

    function removeLastInstanceById(array, id) {
        const index = array.map(item => item.id).lastIndexOf(id); // Find the last occurrence of the id
        if (index !== -1) {
            array.splice(index, 1); // Remove the object at the found index
        }
        return array; // Return the modified array
    }
    

    // messages to historyCy throttling
    setInterval(() => {
        throttleSend = false
        if(patchHistoryIsDirty){
            sendMsgToHistoryApp({
                appID: 'forkingPathsMain',
                cmd: 'reDrawHistoryGraph',
                data: patchHistory
                    
            })
        }

        patchHistoryIsDirty = false
    }, config.appCommunication.throttleInterval); // Attempt to send updates every interval


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
    
    
   


    // // cytoscape.use(cytoscapePopper(popperFactory));
    // function loadSynthGraphFromFile(graphJSON) {
    //     parentNodePositions = []; // Array to store positions of all parent nodes

    //     // Step 1: Extract all parent nodes from the given document
    //     const parentNodes = graphJSON.elements.nodes.filter(el => el.classes === ':parent'); // Adjust based on your schema
    //     parentNodes.forEach(parentNode => {
    //         if (parentNode.position) {
    //             parentNodePositions.push({
    //                 id: parentNode.data.id,
    //                 position: parentNode.position
    //             });
    //         }
    //     });
    
    //     let elements = graphJSON.elements.nodes

    //     // Clear existing elements from Cytoscape instance
    //     synthGraphCytoscape.elements().remove();

    //     // remove all dynamicly generated UI overlays (knobs, umenus, etc)
    //     removeUIOverlay('allNodes')
        
    //     // ensure their container divs are removed too
    //     clearparamContainerDivs()

    //     synthGraphCytoscape.json(graphJSON);
    //     // synthGraphCytoscape.add(elements)

    //     parentNodePositions.forEach(parentNode => {
    //         const node = synthGraphCytoscape.getElementById(parentNode.id);

    //         if (node) {
    //             // test
    //             let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                
    //             // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
    //                 // console.log(`Random`, typeof pos.x, typeof pos.y);
    //             // pos = {x: 273.3788826175895, y: 434.9628649535062};
    //             // let clonedPos = {...pos}
    //             node.position(pos); // Set the position manually  
    //         }
    //     });
        
    //     // add overlay UI elements
    //     let index = 0
    //     elements.forEach((node)=>{
            
    //         if(node.classes === 'paramAnchorNode'){
    //             // let value = graphJSON.synth.graph.modules[node.data.parent].params[node.data.label]
    //             createFloatingOverlay(node.data.parent, node, index)
        
    //             index++
    //         }
    //     })
    //     // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
    //     setTimeout(() => {
    //         updateKnobPositionAndScale('all');
    //     }, 10); // Wait for the current rendering cycle to complete
    // }  

    // function filterAutomergeArray(doc, arrayKey, condition) {
    //     const filtered = doc[arrayKey].filter(condition);
    //     doc[arrayKey] = filtered; // Replace the array
    // }
    

    // Define the knobSet method (Extend jquery-knob)
    $.fn.knobSet = function (value) {
        return this.each(function () {
            $(this).val(value).trigger("change"); // Update value and refresh knob display
        });
    };

    function isEdgeInCycle(edgeToCheck) {
        const parentEdges = new Map();
        const selfLoopEdges = []; // Store self-loop edges for same parent connections
    
        // Step 1: Build a directed graph of parent nodes with child information
        synthGraphCytoscape.edges().forEach((edge) => {
            const sourceParent = edge.data().source.split('.')[0]; // Parent of the source node
            const targetParent = edge.data().target.split('.')[0]; // Parent of the target node
            const sourceChild = edge.data().source.split('.')[1]; // Source child
            const targetChild = edge.data().target.split('.')[1]; // Target child
    
            if (targetParent.includes('AudioDestination')) {
                return; // Ignore connections to the audio destination
            }
    
            if (sourceParent === targetParent) {
                // Detect self-loop: connections within the same parent node
                selfLoopEdges.push({
                    sourceParent,
                    targetParent,
                    sourceChild,
                    targetChild,
                });
            } else {
                // Add normal inter-parent edges
                if (!parentEdges.has(sourceParent)) {
                    parentEdges.set(sourceParent, []);
                }
                parentEdges.get(sourceParent).push({
                    targetParent,
                    sourceChild,
                    targetChild,
                });
            }
        });
    
        // Step 2: Detect self-loop cycles
        const selfLoopMatch = selfLoopEdges.some(
            (edge) =>
                edge.sourceParent === edgeToCheck.data().source.split('.')[0] &&
                edge.targetParent === edgeToCheck.data().target.split('.')[0] &&
                edge.sourceChild === edgeToCheck.data().source.split('.')[1] &&
                edge.targetChild === edgeToCheck.data().target.split('.')[1]
        );
    
        if (selfLoopMatch) {
            // console.log(
            //     `Edge ${edgeToCheck.id()} forms a self-loop cycle within ${edgeToCheck.data().source.split('.')[0]}`
            // );
            return true;
        }
    
        // Step 3: Detect inter-parent cycles using Depth-First Search (DFS)
        const visited = new Set();
        const recStack = new Set();
        let edgeInCycle = false;
    
        function dfs(node, path = [], edgePath = []) {
            if (!visited.has(node)) {
                visited.add(node); // Mark the node as visited
                recStack.add(node); // Add the node to the recursion stack
    
                const neighbors = parentEdges.get(node) || [];
                for (const neighbor of neighbors) {
                    const currentEdge = {
                        sourceParent: node,
                        targetParent: neighbor.targetParent,
                        sourceChild: neighbor.sourceChild,
                        targetChild: neighbor.targetChild,
                    };
    
                    if (!visited.has(neighbor.targetParent)) {
                        if (
                            dfs(
                                neighbor.targetParent,
                                [...path, node],
                                [...edgePath, currentEdge]
                            )
                        ) {
                            return true; // Cycle detected
                        }
                    } else if (recStack.has(neighbor.targetParent)) {
                        // Cycle detected: back edge
                        const cycleStartIndex = path.indexOf(neighbor.targetParent);
                        const cycleEdges = [
                            ...edgePath.slice(cycleStartIndex),
                            currentEdge,
                        ]; // Edges in the cycle
    
                        // Check if the edgeToCheck belongs to this cycle
                        if (
                            cycleEdges.some(
                                (edge) =>
                                    edge.sourceParent ===
                                        edgeToCheck.data().source.split('.')[0] &&
                                    edge.targetParent ===
                                        edgeToCheck.data().target.split('.')[0] &&
                                    edge.sourceChild ===
                                        edgeToCheck.data().source.split('.')[1] &&
                                    edge.targetChild ===
                                        edgeToCheck.data().target.split('.')[1]
                            )
                        ) {
                            edgeInCycle = true;
                            return true;
                        }
                    }
                }
            }
    
            recStack.delete(node);
            return false;
        }
    
        for (const node of parentEdges.keys()) {
            if (!visited.has(node)) {
                dfs(node);
                if (edgeInCycle) break; // Exit early if the edge is found in a cycle
            }
        }
    
        return edgeInCycle; // Return true if the edge belongs to any cycle
    }
    
    // we use this to update a knob position from a gesture point recall from the history sequencer
    function updateTempMutableView(jsonObject, parent, param, updatedValue) {

        let targetId = `${parent}_${param}`
        // Find the element in the "elements" array with a matching data.id
        const element = jsonObject.elements.find(el => el.data && el.data.id === targetId);
        
        // update the visual graph 
        if (element) {
          // Update the value property
          element.data.value = updatedValue;
          
        } else {
          console.warn(`Element with id "${targetId}" not found.`);
        
        }

        // update the synth graph
        if (
            jsonObject.synth.graph.modules &&
            jsonObject.synth.graph.modules[parent] &&
            jsonObject.synth.graph.modules[parent].params &&
            Object.prototype.hasOwnProperty.call(jsonObject.synth.graph.modules[parent].params, param)
          ) {
            jsonObject.synth.graph.modules[parent].params[param] = updatedValue;
          } else {
            console.warn(`Module "${parent}" or parameter "${param}" not found.`);
  
          }


        // return it
        return jsonObject
    }

    // we use this to update a synth param from a gesture point recall from the history sequencer
    function updateModuleParam(jsonObject, moduleName, paramName, updatedValue) {
        if (
          jsonObject.modules &&
          jsonObject.modules[moduleName] &&
          jsonObject.modules[moduleName].params &&
          Object.prototype.hasOwnProperty.call(jsonObject.modules[moduleName].params, paramName)
        ) {
          jsonObject.modules[moduleName].params[paramName] = updatedValue;
          return jsonObject;
        } else {
          console.warn(`Module "${moduleName}" or parameter "${paramName}" not found.`);

        }
    }

    function getSyncMode() {
        return localStorage.getItem('syncMode') || 'shared';
    }
      
    function setSyncMode(mode) {
        localStorage.setItem('syncMode', mode);
    }

    // ——————————————————————————————
    // 2) Cache only the elements for nodes you can actually see
    // ——————————————————————————————
    function cacheVisibleParamControls() {
        // reset the cache
        UI.synth.visual.paramControls = {};
    
        // get all the visible module nodes in Cytoscape
        const visible = synthGraphCytoscape.nodes(':visible');
    
        visible.forEach(node => {
        const moduleID = node.id();
        const params   = App.synth.visual.modules[moduleID]?.params;
        if (!params) return;
    
        UI.synth.visual.paramControls[moduleID] = {};
    
        Object.keys(params).forEach(param => {
            const id = `paramControl_parent:${moduleID}_param:${param}`;
            const el = document.getElementById(id);
            if (el) {
            UI.synth.visual.paramControls[moduleID][param] = el;
            }
        });
        });
    }
    
    // ——————————————————————————————
    // 3) Re‑cache whenever the viewport pans/zooms
    // ——————————————————————————————
    let cacheTimeout;
    synthGraphCytoscape.on('pan zoom', () => {
        clearTimeout(cacheTimeout);
        cacheTimeout = setTimeout(cacheVisibleParamControls, 100);
    });
    
    // ——————————————————————————————
    // 4) Update only your cached controls
    // ——————————————————————————————
    function refreshParamControls() {
        Object.entries(UI.synth.visual.paramControls).forEach(
        ([moduleID, params]) => {
            const values = App.synth.visual.modules[moduleID].params;
            Object.entries(params).forEach(([paramName, el]) => {
            const val = values[paramName];
            switch (el.tagName) {
                case 'INPUT':
                el.value = val;
                $(el).knobSet(val);
                break;
                case 'SELECT':
                el.value = val;
                break;
                default:
                console.warn(
                    'NEW UI DETECTED, create a case for',
                    el
                );
            }
            });
        }
        );
    }


    // const canvas = document.getElementById('draw');
    // const ctx = canvas.getContext('2d');

    // // Make the canvas fill the whole window
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    // let drawing = false;

    // // function startDrawing(e) {
    // //     if (e.target !== canvas) return;

    // //     drawing = true;
    // //     draw(e); // Start drawing immediately
    // // }

    // function startDrawing(e) {
    //     const clientX = e.clientX;
    //     const clientY = e.clientY;
      
    //     // 1. Check if mouse is over Cytoscape node or edge
    //     const cyElement = synthGraphCytoscape.renderer().findNearestElement(clientX, clientY, true);
      
    //     if (cyElement) {
    //       // If it finds any node or edge, block drawing
    //       return;
    //     }
      
    //     // 2. Check if mouse is over a floating knob element
    //     const domElements = document.elementsFromPoint(clientX, clientY);
    //     for (let el of domElements) {
    //       if (el.classList.contains('knob') || el.closest('.knob-container')) {
    //         return;
    //       }
    //     }
      
    //     // 3. Otherwise allow drawing
    //     drawing = true;
    //     draw(e);
    //   }
      
      
      

    // function endDrawing() {
    //     drawing = false;
    //     ctx.beginPath(); // Reset the path
    // }

    // function draw(e) {
    //     if (!drawing) return;

    //     ctx.lineWidth = 5;
    //     ctx.lineCap = 'round';
    //     ctx.strokeStyle = '#000';

    //     ctx.lineTo(e.clientX, e.clientY);
    //     ctx.stroke();
    //     ctx.beginPath();
    //     ctx.moveTo(e.clientX, e.clientY);
    // }

    // canvas.addEventListener('mousedown', startDrawing);
    // canvas.addEventListener('mouseup', endDrawing);
    // canvas.addEventListener('mousemove', draw);
    // canvas.addEventListener('mouseout', endDrawing);

    window.addEventListener('resize', () => {
        resizeCanvas()
    });
    
    function resizeCanvas (){
        UI.draw.canvas.width = window.innerWidth;
        UI.draw.canvas.height = window.innerHeight;
    }

    // also call it after page load:
    resizeCanvas()
});


