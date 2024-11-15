//*
//*
//* INITIALIZATION AND SETUP
//* Set up dependencies, initialize core variables
//*
import { ParentNode } from './parentNode.js';
import { uuidv7 } from "https://unpkg.com/uuidv7@^1";
import randomColor from 'randomcolor';
import dagre from 'cytoscape-dagre';
import { openDB } from 'idb'; // indexedDB
import { saveDocument, loadDocument, deleteDocument } from './indexedDB.js';

// TODO: look for comments with this: //* old -repo version 
// TODO: when new automerge implementation is working, remove their related code sections

// * new automerge implementation
let Automerge;
let amDoc = null
let docID = null
let saveInterval = 2000; // how frequently to store the automerge document in indexedDB
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
// store the heads of all branches
// todo: decide if we should store this in the automerge doc? (consideration: for now it's mostly likely just needed for the history graph)
let branchHeads = {
    current: null,
    // then store all of them here
    // i.e. 'hash': { dependencies: [], mergeHash: null }
}
// let graphStyle = 'DAG'
let graphStyle = 'DAG'
let graphLayouts = {
    DAG: {
        name: 'dagre',
        rankDir: 'BT', // Set the graph direction to top-to-bottom
        nodeSep: 300, // Optional: adjust node separation
        edgeSep: 100, // Optional: adjust edge separation
        rankSep: 50, // Optional: adjust rank separation for vertical spacing,
        fit: true,
        padding: 30
    },
    breadthfirst: {
        name: 'breadthfirst',

        fit: true, // whether to fit the viewport to the graph
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
let historyHighlightedNode = null
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
let previousHistoryLength;

let isDraggingEnabled = false;
let moduleDragState = false;

let highlightedNode = null
let heldModule = null
let heldModulePos = { x: null, y: null }

let allowMultiSelect = false;
let allowPan = false;

let isSliderDragging = false;
let currentHandleNode;

// double-clicking
let lastClickTime = 0;
const doubleClickDelay = 300; // Delay in milliseconds to register a double-click

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
        clear: "#000000"
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

document.addEventListener("DOMContentLoaded", function () {

    


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
                    'font-size': 12, // Adjust font size if needed
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
    const historyCy = cytoscape({
        container: document.getElementById('docHistory-cy'),
        elements: [],
        zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1., 
        // viewport: {
        //     zoom: parseFloat(localStorage.getItem('docHistoryCy_Zoom')) || 1.
        // },
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
                    'text-margin-x': 10, // 
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
        ]
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
    
        // todo: if we set a different string as docId and pass it into await loadDocument(), it will return a new document for the user
        docID = 'forkingPathsDoc'; // Unique identifier for the document
        // Load the document from IndexedDB or create a new one if it doesn't exist
        amDoc = await loadDocument(docID);
        if (!amDoc) {
            amDoc = Automerge.init();
            
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, (amDoc) => {
                amDoc.title = "ForkingPaths_initial_branch";
                amDoc.elements = [];
            });

            // set the document branch (aka title) in the editor pane
            document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;

            updateHistory()

            await saveDocument(docID, Automerge.save(amDoc));
        } else {
            // If loaded, convert saved document state back to Automerge document
            amDoc = Automerge.load(amDoc);
            
            updateHistory()

            // set the document branch (aka title)  in the editor pane
            document.getElementById('documentName').textContent = `Current Branch:\n${amDoc.title}`;
        }
    })();

    // Set an interval to periodically save the document to IndexedDB
    setInterval(async () => {
        if(amDoc && docUpdated){
            await saveDocument(docID, Automerge.save(amDoc));
            docUpdated = false
        }
    }, saveInterval);

    // Custom function to handle document changes and call a callback
    function applyChange(doc, changeCallback, onChangeCallback, changeMessage) {
        
        // check if we are working from a newly cloned doc or if branch is in HEAD position
        if(automergeDocuments.newClone === false ){
            console.log(amDoc)
            // we are working from a HEAD
            // Apply the change using Automerge.change
            const newDoc = Automerge.change(amDoc, { message: changeMessage }, changeCallback);
            
            // If there was a change, call the onChangeCallback
            if (newDoc !== doc && typeof onChangeCallback === 'function') {
                onChangeCallback(newDoc);
            }

            return newDoc;
        } else {
            // player has made changes to an earlier version, so create a branch and set amDoc to new clone

            // store previous amDoc in automergeDocuments, and its property is the hash of its HEAD
            automergeDocuments.otherDocs[amDoc.title] = amDoc
            
            // set amDoc to current cloned doc
            amDoc = Automerge.load(automergeDocuments.current.doc)

            console.log(amDoc)

            // Apply the change using Automerge.change
            const newDoc = Automerge.change(amDoc, { message: changeMessage }, changeCallback);

            // If there was a change, call the onChangeCallback
            if (newDoc !== doc && typeof onChangeCallback === 'function') {

                console.log(amDoc)
                onChangeCallback(newDoc);
                automergeDocuments.newClone = false
            }


        }


    }

    // define the onChange Callback
    onChange = (updatedDoc) => {
        console.log('PLO Document changed:', updatedDoc.title);
        console.log('elements:', updatedDoc.elements);
        // You can add any additional logic here, such as saving to IndexedDB

        // set docUpdated so that indexedDB will save it
        docUpdated = true

        // store the current hash (used by historyCy)
        branchHeads.current = Automerge.getHeads(amDoc)[0]

        // update the historyGraph
        updateHistory()
    };
    


    function addToHistoryGraph(elements){
        // is the document in an earlier point in history?
        if(automergeDocuments.current.hash){
            // 
        } else {
            // Add elements to Cytoscape
            historyCy.add(elements);
            
            historyCy.layout(graphLayouts[graphStyle]).run();
            previousHistoryLength = history.length
        }

    }

    function updateHistory(){
        // Extract the history from the document using the latest Automerge
        // history = retrieveHistory(handle.docSync());
        history = Automerge.getHistory(amDoc)
        // get only the latest changes     
        let arrayLengthDifference = history.length - previousHistoryLength
        let historyUpdates = history.slice(-arrayLengthDifference)
        // temporary array to store nodes and edges that we'll add to cytoscape instance
        const elements = [];

        // Track existing node IDs, including those already in the full history
        const nodeIds = new Set(history.map(entry => entry.change.hash));

        // Create nodes for each change in the history updates
        historyUpdates.forEach((entry) => {
            
            const nodeId = entry.change.hash;
            nodeIds.add(nodeId);
            let bgColour = "#ccc"
            if(entry.change.message){
                bgColour = docHistoryGraphStyling.nodeColours[entry.change.message.split(' ')[0]]
            }
            elements.push({
                data: {
                    id: nodeId,
                    label: entry.change.message || 'new document',
                    actor: entry.change.actor,
                    color: bgColour,
                    // serializedChange: serializedChange
                },
                classes: 'node'
            });

            historyNodes.push({
                data: {
                    id: nodeId,
                    label: entry.change.message || 'new document',
                    actor: entry.change.actor,
                    color: bgColour,
                    // serializedChange: serializedChange
                },
                classes: 'node'
            })
        });
        
        // Create edges based on dependencies between changes
        historyUpdates.forEach(entry => {                
            entry.change.deps.forEach(dep => {
                if (entry.change.hash && dep && nodeIds.has(dep) && nodeIds.has(dep)) {
                    elements.push({
                        data: {
                            id: `${entry.change.hash}-${dep}`,
                            source: dep,
                            target: entry.change.hash
                        },
                        classes: 'edge'
                    });
                } else {
                    console.warn(`Skipping edge creation: ${entry.change.hash}-${dep} because one or both nodes do not exist`);
                }
            });
        });
        
        // Add elements to Cytoscape
        addToHistoryGraph(elements)
    }

    // Function to update Cytoscape with the state from forkedDoc
    function updateCytoscapeFromDocument(forkedDoc) {
        let elements = forkedDoc.elements
        // 2. Clear existing elements from Cytoscape instance
        cy.elements().remove();
        
        // 3. Add new elements to Cytoscape
        cy.add(elements)

        // Optional: Run layout
        cy.layout({ name: 'preset' }).run(); // `preset` uses the position data directly
        
    }

    /*

        DOCUMENT HISTORY CYTOSCAPE
    */

    //

    async function makeBranch(targetNode, targetHash){

        // the clicked-on change in the automerge history
        const targetChange = history.find(obj => obj.change.hash === targetHash)
        
        let targetColor = targetNode.data().color
            let targetPosition = targetNode.position()
            let targetMessage = targetChange.change.message
            // position the new node to the right of the clickedNode's text label
            // let xOffset = getCytoscapeTextWidth(targetMessage, targetNode) + 100
            const branchId = `branch_${automergeDocuments.current.hash[0]}`;  // unique ID based on the hash
            historyCy.add({
                group: 'nodes',
                data: { id: branchId, label: `Clone from ${targetHash.slice(0, 6)}`, color: docHistoryGraphStyling.nodeColours[targetMessage.split(' ')[0]] },
                // docHistoryGraphStyling.nodeColours[targetNode.data().color.change.message.split(' ')[0]] },
                classes: "node",
                // position: {
                //     x: targetPosition.x + xOffset,
                //     y: targetPosition.y - 30
                // }
            });

            // Step 4: Connect this node to the main document node to show a branch
            const mainNodeId = targetHash;  // ID of the original node
            historyCy.add({
                group: 'edges',
                data: { source: mainNodeId, target: branchId, color: '#ccc'},
                classes: "edge"
            });

            historyCy.layout(graphLayouts[graphStyle]).run();

    }
    // WOOHOO this is working!!!
    async function loadVersion(targetHash, targetNode) {
        console.log('loadVersion fired')

        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(amDoc, [targetHash]);

        // Check if we're on the HEAD; reset clone if true (so we don't trigger opening a new branch with changes made to HEAD)
        if (Automerge.getHeads(historicalView)[0] === Automerge.getHeads(amDoc)[0]){
            automergeDocuments.newClone = false
            console.log('at head state')
            return
        } else {
            // user has selected an earlier hash, so clone that view in case they make updates
            let clonedDoc = Automerge.clone(historicalView)
            // update the doc's branch name (title)
            clonedDoc = Automerge.change(clonedDoc, (clonedDoc) => {
                clonedDoc.title = `ForkingPaths_${"headless"}`;
            });
            automergeDocuments.current = {
                doc: clonedDoc,
                hash: [Automerge.getHeads(historicalView)[0]]
            }
            // set newClone to true
            automergeDocuments.newClone = true
            // store previous HEAD in heads obj
            branchHeads[branchHeads.current] = {}
            // update current HEAD to this hash
            branchHeads.current = Automerge.getHeads(historicalView)[0]
            // Step 3: Add node in Cytoscape for this clone point
            // get info about targetNode (what was clicked by user)
            
            console.log(automergeDocuments.current.doc)
            updateCytoscapeFromDocument(historicalView);
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

    //         // update the focumentHistory graph:
    //         updateHistory()
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
                // historyCy.add(elements);
                // historyCy.layout({ name: 'dagre', rankDir: 'BT' }).run();
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
//* UI UPDATES & EVENT HANDLERS
//* Functions that directly handle UI interactions and update elements in cytoscape
//*
    // cmd + scroll = scroll vertically through history graph
    document.addEventListener('wheel', function(event) {
        if(allowPan){
            historyCy.panBy({
                x: 0,
                y: event.deltaY 
                });
        }
    });
    historyCy.on('tap', 'node', (event) => {
        
        loadVersion(event.target.data().id, event.target)
        if(historyHighlightedNode){
            historyHighlightedNode.removeClass('highlighted');
            historyHighlightedNode = event.target
            event.target.addClass('highlighted');
        }
        else {
            historyHighlightedNode = event.target;
            event.target.addClass('highlighted');
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
                if(!allowMultiSelect){

                    const currentTime = new Date().getTime();
                    if (currentTime - lastClickTime < doubleClickDelay) {
                        // Double-click detected
                        addModule(`oscillator`, { x: event.position.x, y: event.position.y }, [    ]);
                        console.log("Double-clicked on the background\nLow priority ToDo: background clicks open module library");
                    }
                    lastClickTime = currentTime; // Update the last click time
                }
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
                    const scaledValue = sliderMin + (normalizedValue * (sliderMax - sliderMin));

                    // Check if the new scaled value is different from the last emitted value
                    if (scaledValue !== currentHandleNode.data('value')) {
                        // Update the node's data and write to Automerge only if the value has changed
                        currentHandleNode.data('value', scaledValue);
                        
                        // Find the label node and update its displayed text
                        const labelNode = cy.getElementById(`${currentHandleNode.data('trackID')}-label`);
                        labelNode.data('label', scaledValue.toFixed(2)); // Display the value with 2 decimal places
                        
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
                }, onChange,  `connect ${temporaryCables.local.source.id()} to ${temporaryCables.local.targetNode.id()}`);


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
            
            amDoc = applyChange(amDoc, (amDoc) => {
                const elementIndex = amDoc.elements.findIndex(el => el.data.id === heldModule.data().id);
                if (elementIndex !== -1) {
                    // update the position
                    amDoc.elements[elementIndex].position = {
                        x: heldModule.position().x,
                        y: heldModule.position().y
                    };
                    // console.log("Position object:", JSON.stringify(amDoc.elements[elementIndex].position));
                    // console.log(heldModule.position().x)
                    // amDoc.elements[elementIndex].position.x = heldModule.position().x;
                    // amDoc.elements[elementIndex].position.y = heldModule.position().y;
             
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
        if (event.key === 'e') {
            isDraggingEnabled = true;
        }
        if (event.key === 'z') {
            historyCy.zoomingEnabled(true)
        }
        if (event.key === 'Meta' || event.key === 'Control') {
            allowMultiSelect = false
            allowPan = true
            historyCy.userZoomingEnabled(false)
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'e') {
            isDraggingEnabled = false;
        }
        if (event.key === 'Meta' || event.key === 'Control') {
            allowMultiSelect = false
            historyCy.userZoomingEnabled(true)
        }
        if (event.key === 'z') {
            historyCy.zoomingEnabled(false)
        }
    });

     // Handle keydown event to delete a highlighted edge on backspace or delete
     document.addEventListener('keydown', (event) => {


        if (highlightedEdge && (event.key === 'Backspace' || event.key === 'Delete')) {
            cy.remove(highlightedEdge)
            highlightedEdge = null; // Clear the reference after deletion
        } else if (highlightedNode && (event.key === 'Backspace' || event.key === 'Delete')){
            if (highlightedNode.isParent()) {
                const nodeId = highlightedNode.id();
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
    const button = document.getElementById('clearGraph');

    // Add an event listener to the button for the 'click' event
    button.addEventListener('click', function() {
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

    function updateCableControlPointDistances(x, y){
        cy.style()
        .selector(`edge`)
        .style({
            'control-point-distances': [y, x, y]
        })
        .update();
    }

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
        
        const parentNode = new ParentNode(module, position, children);

        // parentNode.getModule('oscillator')
        const { parentNode: parentNodeData, childrenNodes } = parentNode.getNodeStructure();
    
        // Add nodes to Cytoscape
        cy.add(parentNodeData);
        cy.add(childrenNodes);
    
        console.log(amDoc)
        // * automerge version:        
        amDoc = applyChange(amDoc, (amDoc) => {
            amDoc.elements.push(parentNodeData);
            amDoc.elements.push(...childrenNodes);
        }, onChange, `add ${parentNodeData.data.id}`);
        

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
});


