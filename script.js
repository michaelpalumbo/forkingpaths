import { ParentNode } from './parentNode.js';
import { uuidv7 } from "https://unpkg.com/uuidv7@^1";


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
                    'label': 'data(id)', // Use the node id or any data field as the label
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

    // Create parent nodes with children of different kinds
    const parentNode1 = new ParentNode(cy, 'Oscillator', { x: 200, y: 200 }, [
        { kind: 'input', label: 'frequency' },
        { kind: 'input', label: 'amplitude' },
        { kind: 'output', label: 'out' },
        { kind: 'slider', label: 'frequency' },
    ]);

    const parentNode2 = new ParentNode(cy, 'parentNode2', { x: 500, y: 400 }, [
        { kind: 'input', label: 'child4' },
        { kind: 'slider', label: 'child5' },
        { kind: 'input', label: 'child9' },
        { kind: 'output', label: 'audioOut' },
        { kind: 'output', label: 'envOut' },
    ]);

    // Add event listener logic for connecting nodes here as before...
});
