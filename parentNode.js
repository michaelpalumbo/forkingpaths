// Import the createSlider function for adding slider nodes
import { createSlider } from './slider.js';

export class ParentNode {
    constructor(cy, moduleName, position, children) {
        this.cy = cy;
        this.moduleName = moduleName;
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled

        // Create the parent node
        this.cy.add({
            data: { id: this.moduleName },
            position: this.position,
        });

        // Calculate positions for child nodes with at least 30px spacing
        this.layoutChildNodes();

        // Set up drag control for child nodes based on the 'e' key
        this.setupDragControl();
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
                createSlider(this.cy, this.moduleName, `${this.moduleName}-slider${index + 1}`, {
                    position: { x: this.position.x + offsetX, y: this.position.y + offsetY },
                    length: 100,
                    minValue: 0,
                    maxValue: 100,
                    initialValue: 50,
                });
            } else if (child.kind === 'input') {
                // Create a basic input node
                this.cy.add({
                    data: { 
                        id: `${this.moduleName}-input${index + 1}`, 
                        parent: this.moduleName,
                        label: child.label || `${this.parentId}-input${index + 1}`, // Use custom label if provided
                        bgcolour: '#FC9A4F'
                    },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    },
                });
            } else if (child.kind === 'output') {
                // Create a basic input node
                this.cy.add({
                    data: { 
                        id: `${this.moduleName}-output${index + 1}`, 
                        parent: this.moduleName,
                        label: child.label || `${this.parentId}-output${index + 1}`, // Use custom label if provided
                        bgcolour: '#6FB1FC'
                    },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    },
                });
            } 
            
            
            else {
                // Default to a basic child node if kind is unspecified
                this.cy.add({
                    data: { 
                        id: `${this.moduleName}-child${index + 1}`, 
                        parent: this.moduleName,
                        label: child.label || `${this.parentId}-input${index + 1}` // Use custom label if provided 
                    },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    },
                    // grabbable: false, // Disable dragging initially

                    style: {
                        'background-color': '#6FB1FC',
                        'width': 40,
                        'height': 40,
                        'label': child.label || `${this.moduleName}-child${index + 1}`
                    }
                });
            }
        });
    }


    setupDragControl() {
        // Track when the 'e' key is pressed and released
        window.addEventListener('keydown', (event) => {
            if (event.key === 'e') {
                this.isDraggingEnabled = true;
            }
        });

        window.addEventListener('keyup', (event) => {
            if (event.key === 'e') {
                this.isDraggingEnabled = false;
            }
        });

        // Listen for drag events on child nodes
        this.cy.on('grab', `node[parent = "${this.moduleName}"]`, (evt) => {
            const node = evt.target;
            if (!this.isDraggingEnabled) {
                // If dragging is not enabled, release the node immediately
                node.ungrabify();
            }
        });

        this.cy.on('free', `node[parent = "${this.moduleName}"]`, (evt) => {
            const node = evt.target;
            // Restore the node's grabbable state after releasing it
            node.grabify();
        });
    }

    // Method to get child nodes of this parent node
    getChildNodes() {
        return this.cy.$(`node[parent = "${this.moduleName}"]`);
    }
}
