import { ParentNode } from './parentNode.js';

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
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#ccc'
                }
            }
        ]
    });

    // Create parent nodes with children of different kinds
    const parentNode1 = new ParentNode(cy, 'Oscillator', { x: 200, y: 200 }, [
        { kind: 'input', label: 'frequency' },
        { kind: 'input', label: 'amplitude' },
        { kind: 'slider', label: 'frequency' },
        { kind: 'output', label: 'out' },
    ]);

    const parentNode2 = new ParentNode(cy, 'parentNode2', { x: 400, y: 200 }, [
        { kind: 'input', label: 'child4' },
        { kind: 'slider', label: 'child5' },
        { kind: 'input', label: 'child9' },
    ]);

    // Add event listener logic for connecting nodes here as before...
});
