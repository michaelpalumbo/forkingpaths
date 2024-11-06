import { createSlider } from './slider.js';

export class ParentNode {
    constructor(moduleName, position, children) {
        this.moduleName = moduleName;
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled

        // Set up drag control for child nodes based on the 'e' key
        // this.setupDragControl();
    }

    getNodeStructure() {
        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: this.moduleName, label: this.moduleName },
            position: this.position,
            classes: ':parent',
        };

        const childrenNodes = this.children.map((child, index) => {
            const offsetX = Math.cos((index * (360 / this.children.length)) * (Math.PI / 180)) * 60;
            const offsetY = Math.sin((index * (360 / this.children.length)) * (Math.PI / 180)) * 60;
            
            // check for child kind
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
            } else {
                return {
                    data: {
                        id: `${this.moduleName}-${child.kind}${index + 1}`,
                        parent: this.moduleName,
                        label: child.label || `${this.moduleName}-${child.kind}${index + 1}`,
                        kind: child.kind,
                        bgcolour: child.kind === 'input' ? '#FC9A4F' : child.kind === 'output' ? '#6FB1FC' : '#CCCCCC',
                        ghostCableShape: child.kind === 'input' ? 'rectangle' : 'triangle',
                        ghostCableColour: child.kind === 'input' ? '#5C9AE3' : '#E68942'
                    },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    }
                };
            }

            
        });

        return { parentNode, childrenNodes };
    }
}
