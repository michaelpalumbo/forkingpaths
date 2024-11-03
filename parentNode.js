// Import the createSlider function for adding slider nodes
import { createSlider } from './slider.js';

export class ParentNode {
    constructor(cy, parentId, position, children) {
        this.cy = cy;
        this.parentId = parentId;
        this.position = position;
        this.children = children;

        // Create the parent node
        this.cy.add({
            data: { id: this.parentId },
            position: this.position
        });

        // Calculate positions for child nodes with at least 30px spacing
        this.layoutChildNodes();
    }

    layoutChildNodes() {
        const spacing = 60; // Increase spacing to accommodate different node types
        const numChildren = this.children.length;
        const angleIncrement = 360 / numChildren; // Angle for circular distribution

        // Place each child around the parent node based on its kind
        this.children.forEach((child, index) => {
            const angle = index * angleIncrement * (Math.PI / 180); // Convert to radians
            const offsetX = Math.cos(angle) * spacing;
            const offsetY = Math.sin(angle) * spacing;

            // Check the kind of node and create accordingly
            if (child.kind === 'slider') {
                // Create a slider node
                createSlider(this.cy, this.parentId, `${this.parentId}-slider${index + 1}`, {
                    position: { x: this.position.x + offsetX, y: this.position.y + offsetY },
                    length: 100,
                    minValue: 0,
                    maxValue: 100,
                    initialValue: 50,
                });
            } else if (child.kind === 'input') {
                // Create a basic input node
                this.cy.add({
                    data: { id: `${this.parentId}-input${index + 1}`, parent: this.parentId },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    },
                    style: {
                        'background-color': '#6FB1FC',
                        'width': 40,
                        'height': 40,
                        'label': child.label || `${this.parentId}-input${index + 1}`
                    }
                });
            } else {
                // Default to a basic child node if kind is unspecified
                this.cy.add({
                    data: { id: `${this.parentId}-child${index + 1}`, parent: this.parentId },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    },
                    style: {
                        'background-color': '#6FB1FC',
                        'width': 40,
                        'height': 40,
                        'label': child.label || `${this.parentId}-child${index + 1}`
                    }
                });
            }
        });
    }

    // Method to get child nodes of this parent node
    getChildNodes() {
        return this.cy.$(`node[parent = "${this.parentId}"]`);
    }
}
