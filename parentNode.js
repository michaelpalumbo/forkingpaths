import modules from './modules.json' assert { type: 'json'}
import uuidv7 from 'uuidv7'
export class ParentNode {
    constructor(moduleName, position, children) {
        this.moduleName = moduleName;
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled
        this.module;
        // Set up drag control for child nodes based on the 'e' key
        // this.setupDragControl();
    }

    getNodeStructure() {
        // sift through modules.json, construct node
        let inputs = modules[this.moduleName].inputs
        let outputs = modules[this.moduleName].outputs
        let params = modules[this.moduleName].params
        for (let i = 0; i<inputs.length; i++){
            this.children.push(inputs[i])
        }
        for (let i = 0; i<params.length; i++){
            this.children.push(params[i])
        }
        for (let i = 0; i<outputs.length; i++){
            this.children.push(outputs[i])
        }
        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: uuidv7(), label: this.moduleName, kind: 'module' },
            position: this.position,
            classes: ':parent',
        };

        const childrenNodes = this.children.map((child, index) => {
            const offsetX = Math.cos((index * (360 / this.children.length)) * (Math.PI / 180)) * 60;
            const offsetY = Math.sin((index * (360 / this.children.length)) * (Math.PI / 180)) * 60;
            
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
        });

        return { parentNode, childrenNodes };
    }
}
