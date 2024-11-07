import { ParentNode } from './parentNode.js';
import { uuidv7 } from "https://unpkg.com/uuidv7@^1";
// import { Repo } from "@automerge/automerge-repo";

// import { LocalForageStorageAdapter } from "@automerge/automerge-repo-storage-localforage";
// import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket';

let handle;
let isDraggingEnabled = false;

let localPeerID;

document.addEventListener("DOMContentLoaded", function () {
    const cy = cytoscape({
        container: document.getElementById('cy'),

        elements: [], // Start with no elements; add them dynamically

        layout: {
            name: 'preset' // Preset layout allows manual positioning
        },

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(bgcolour)',
                    'label': 'data(label)', // Use the custom label attribute
                    'width': 30,
                    'height': 30,
                    'text-valign': 'center',
                    'color': '#000',            // Label text color
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'left',      // Horizontally align label to the left of the node
                    'text-margin-x': -10, // Optional: Move the label slightly up if desired
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
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
                    'border-color': '#FFD700', // Highlight color
                    'border-width': 3
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
            }
        ]
    });

    /*
        UI
    */
   
    /*
        AUTOMERGE
    */

    // Import dependencies dynamically
    (async () => {
        const { DocHandle, Repo, isValidAutomergeUrl } = await import('@automerge/automerge-repo');
        const { BrowserWebSocketClientAdapter } = await import('@automerge/automerge-repo-network-websocket');
        const { IndexedDBStorageAdapter } = await import("@automerge/automerge-repo-storage-indexeddb");

        const storage = new IndexedDBStorageAdapter("automerge");
        // Initialize the Automerge repository with WebSocket adapter
        const repo = new Repo({
            network: [new BrowserWebSocketClientAdapter('ws://localhost:3030')],
            // storage: LocalForageStorageAdapter, // Optional: use a storage adapter if needed
            storage: storage, // Optional: use a storage adapter if needed
        });



        // Create or load the document
        // Initialize or load the document with a unique ID
        // Check for a document URL in the fragment
        let docUrl = decodeURIComponent(window.location.hash.substring(1));
        


        try {
            if (docUrl && isValidAutomergeUrl(docUrl)) {
                // Attempt to find the document with the provided URL
                console.log("Attempting to load document from URL in fragment:", docUrl);
                handle = repo.find(docUrl);
            } else {
                throw new Error("No document URL found in fragment.");
            }
        } catch (error) {
            // If document is not found or an error occurs, create a new document
            console.warn("Document not found or invalid URL. Creating a new document:", error.message);
            handle = repo.create({
                elements: []
            });
            docUrl = handle.url;

            // Update the window location to include the new document URL
            window.location.href = `${window.location.origin}/#${encodeURIComponent(docUrl)}`;
            console.log("Created new document and updated URL with handle:", docUrl);
        }

        window.location.href = `${window.location.origin}/#${encodeURIComponent(handle.url)}`;
        console.log("Updated URL with document handle:", window.location.href);
        // Wait until the document handle is ready
        await handle.whenReady();

        cy.layout({ name: 'preset' }).run();
        // Retrieve the local peer ID after the Repo is initialized
        // Access the local peer ID
        localPeerID = repo.networkSubsystem.peerId;

        handle.on('change', (newDoc) => {
            
            // Compare `newDoc.elements` with current `cy` state and update `cy` accordingly
            const newElements = newDoc.doc.elements;
            
            // Add or update elements
            newElements.forEach((newEl) => {
                // console.log('New Element ID:', newEl.data.id);
                // console.log('Existing element check:', cy.getElementById(newEl.data.id));
                if (!cy.getElementById(newEl.data.id).length) {
                    // Add new element if it doesn't exist
                    cy.add(newEl);
                }
            });

            // Remove elements that are no longer in `newDoc`
            cy.elements().forEach((currentEl) => {
                if (!newElements.find(el => el.data.id === currentEl.id())) {
                    cy.remove(currentEl);
                }
            });

            // Optionally, re-run the layout if needed
            
            
        })
        // Set the document URL in the fragment part of the current URL

        // Initialize the document's counter if it's empty
        // Ensure counter is initialized in the document if it's a new document
        /*
        handle.change((doc) => {
            if (doc.counter == null) doc.counter = 0;
        });

        // Update the UI when the document changes
        const counterElement = document.getElementById('counter');

        // Display the initial counter value once the document is ready
        const initialCounterValue = handle.doc.counter ?? 0;

        console.log(handle.doc.counter)
        counterElement.textContent = initialCounterValue;
        
        handle.on('change', (newDoc) => {
            console.log('Document changed:', newDoc);  // Log the entire document structure
            const counterValue = newDoc.doc.counter ?? 0;
            console.log('Updated Counter value:', counterValue);  // Log the counter specifically
            counterElement.textContent = counterValue;
        });

        // Increment the counter when the button is clicked
        document.getElementById('incrementButton').addEventListener('click', () => {
            handle.change((doc) => {
                doc.counter += 1;
                console.log(doc.counter)
            });
        });

        // Initial UI load
        counterElement.textContent = handle.doc.counter || 0;

        */
    })();

    // addNode
    function addNodeToDoc(node) {
        handle.change((doc) => {
            doc.elements.push({
                type: 'node',
                id: node.id(),
                data: node.data(),
                position: node.position()
            });
        });
    }
    
    // addEdge
    function addEdgeToDoc(edge) {
        handle.change((doc) => {
            doc.elements.push({
                type: 'edge',
                id: edge.id(),
                data: edge.data()
            });
        });
    }
    // remove node or edge
    function removeElementFromDoc(id) {
        handle.change((doc) => {
            const index = doc.elements.findIndex(el => el.id === id);
            if (index !== -1) {
                doc.elements.splice(index, 1);
            }
        });
    }

    // cy.on('add', 'node', (event) => {
    //     addNodeToDoc(event.target);
    // });
    
    cy.on('add', 'edge', (event) => {
        
        addEdgeToDoc(event.target);
    });
    
    cy.on('remove', 'node, edge', (event) => {
        
        removeElementFromDoc(event.target.id());
    });
    
    /*
        PATCHING
    */

    let sourceNode = null; // Track the source node
    let tempEdge = null; // Track the temporary edge
    let targetNode = null; // Track the target node
    let ghostNode = null; // Temporary ghost node to follow the mouse
    let highlightedEdge = null; // Variable to store the currently highlighted edge

    // Helper function to detect if the click is near an endpoint of an edge
    function isNearEndpoint(mousePos, endpointPos, threshold = 50) {
        const dx = mousePos.x - endpointPos.x;
        const dy = mousePos.y - endpointPos.y;
        return Math.sqrt(dx * dx + dy * dy) <= threshold;
    }

    // function to create a cable

    function startCable(source, position){
        sourceNode = source;
        const mousePos = position;

        // Get the ghostCable property from the sourceNode, default to 'ellipse' if undefined
        const ghostShape = sourceNode.data('ghostCableShape') || 'ellipse';
        const ghostColour = sourceNode.data('ghostCableColour') || '#5C9AE3';

        // Create a ghost node at the mouse position to act as the moving endpoint
        ghostNode = cy.add({
            group: 'nodes',
            data: { id: 'ghostNode' },
            position: mousePos,
            grabbable: false, // Ghost node shouldn't be draggable
            classes: 'ghostNode'
        });

        // Apply the ghostShape to the ghostNode using a direct style override
        ghostNode.style({
            'shape': ghostShape,
            'background-color': ghostColour
        });
        // Create a temporary edge from sourceNode to ghostNode
        tempEdge = cy.add({
            group: 'edges',
            data: { id: 'tempEdge', source: sourceNode.id(), target: 'ghostNode' },
            classes: 'tempEdge'
        });

        // Set target endpoint to mouse position initially
        tempEdge.style({ 'line-color': '#FFA500' }); // Set temporary edge color
        
    }
    // Step 1: Create temporary edge on mousedown
    cy.on('mousedown', (event) => {
        
        // Check if the click target is not the highlighted edge
        if (highlightedEdge && event.target !== highlightedEdge) {
            highlightedEdge.removeClass('highlighted');
            highlightedEdge = null;
        }
        const target = event.target;
        // Check if the target is a node, edge, or the background
        if (target.isNode && target.isNode()) {
            console.log('snared')
            // first check if clicked node is NOT a parent node, and only an input or output (i.e. ignore other UI such as sliders)
            if (!event.target.isParent() && (event.target.data('kind') === 'input' || event.target.data('kind') === 'output')) {
                // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                let e = event.target
                let p = event.position
                startCable(e, p)
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
                    // create a new ghost cable starting from targetPos (opposite of clicked endpoint), call startCable()
                    // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                    let e = targetNode
                    let p = targetPos
                    startCable(e, p)
                } else if (isNearEndpoint(mousePos, targetPos)) {
                    // delete the cable
                    cy.remove(edge);
                    // create a new ghost cable starting from sourcePos (opposite of clicked endpoint), call startCable()
                    // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                    let e = sourceNode
                    let p = sourcePos
                    startCable(e, p)
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
            addModule(`oscillator`, { x: event.position.x, y: event.position.y }, [    ]);
            console.log("Clicked on the background\nLow priority ToDo: background clicks open module library");
        }


            
    });

    // Handle keydown event to delete a highlighted edge on backspace or delete
    document.addEventListener('keydown', (event) => {
        if (highlightedEdge && (event.key === 'Backspace' || event.key === 'Delete')) {
            cy.remove(highlightedEdge)
            highlightedEdge = null; // Clear the reference after deletion
        }
    });
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
     // Step 2: Update ghost node position to follow the mouse and track collisons
    cy.on('mousemove', (event) => {
        if (ghostNode) {
            const mousePos = event.position;
            ghostNode.position(mousePos); // Update ghost node position

            // Reset targetNode before checking for intersections
            targetNode = null;

            // Get elements under the mouse position using the bounding box check
            const elementsUnderMouse = getElementsAtPoint(cy, mousePos.x, mousePos.y);

            // Determine valid target label based on sourceNode label
            const matchingTargetKind = sourceNode.data('kind') === 'input' ? 'output' : 'input';

            // Filter out ghostNode and sourceNode from elements under the mouse
            
            // Filter elements based on the correct `kind`
            const potentialTarget = elementsUnderMouse.filter((el) => {
                return (
                    el.isNode() &&
                    el !== sourceNode &&
                    el !== ghostNode &&
                    !el.isParent() &&
                    el.data('kind') === matchingTargetKind // Only allow valid target kinds
                );
            });
            // If we have a valid potential target, set it as the targetNode
            if (potentialTarget.length > 0) {
                targetNode = potentialTarget[0];
                targetNode.addClass('highlighted');
            }

            // Remove highlight from all other nodes
            cy.nodes().forEach((node) => {
                if (node !== targetNode) {
                    node.removeClass('highlighted');
                }
            });
        }
    });

    // Step 3: Finalize edge on mouseup
    cy.on('mouseup', (event) => {
        if (tempEdge) {
            if (targetNode) {
                // If a target node is highlighted, connect the edge to it
                // tempEdge.data('target', targetNode.id()); // Update the edge target
                
                // tempEdge.removeClass('tempEdge'); // Remove temporary class if needed
                cy.remove(tempEdge)
                const edgeId = uuidv7()

                cy.add({
                    group: 'edges',
                    data: { id: edgeId, source: sourceNode.id(), target: targetNode.id(), kind: 'cable' },
                    classes: 'edge'
                });
            } else {
                // If no target node, remove the temporary edge
                cy.remove(tempEdge);
            }

            // Clean up by removing ghost node and highlights
            cy.remove(ghostNode);
            cy.nodes().removeClass('highlighted');
            tempEdge = null;
            sourceNode = null;
            targetNode = null;
            ghostNode = null;
        }
    });

    function addModule(module, position, children) {
        console.log(localPeerID)
        const parentNode = new ParentNode(module, position, children, localPeerID);

        // parentNode.getModule('oscillator')
        const { parentNode: parentNodeData, childrenNodes } = parentNode.getNodeStructure();
    
        // Add nodes to Cytoscape
        cy.add(parentNodeData);
        cy.add(childrenNodes);
    
        // Update Automerge document
        handle.change((doc) => {
            doc.elements.push(parentNodeData);
            doc.elements.push(...childrenNodes);

        });
    }
    


    // Listen for drag events on child nodes
    cy.on('grab', (event)=> {
        const node = event.target

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
        } 
    })

    // Track when the 'e' key is pressed and released
    window.addEventListener('keydown', (event) => {
        if (event.key === 'e') {
            isDraggingEnabled = true;
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'e') {
            isDraggingEnabled = false;
        }
    });

});
