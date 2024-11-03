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
                    'background-color': '#6FB1FC',
                    'label': 'data(id)',
                    'width': 40,
                    'height': 40,
                    'text-valign': 'center',
                    'color': '#fff'
                }
            },
            {
                selector: ':parent',
                style: {
                    'background-opacity': 0.333,
                    'background-color': '#F5A45D',
                    'border-color': '#F57A41',
                    'border-width': 1
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
    const parentNode1 = new ParentNode(cy, 'parentNode1', { x: 200, y: 200 }, [
        { kind: 'input', label: 'child1' },
        { kind: 'input', label: 'child2' },
        { kind: 'slider', label: 'child3' }
    ]);

    const parentNode2 = new ParentNode(cy, 'parentNode2', { x: 400, y: 200 }, [
        { kind: 'input', label: 'child4' },
        { kind: 'slider', label: 'child5' },
        { kind: 'input', label: 'child9' },
    ]);

    // Add event listener logic for connecting nodes here as before...
});
