import modules from './modules.json' assert { type: 'json'}
import {uuidv7} from 'uuidv7'
export class ParentNode {
    constructor(module, position, children) {

        const hash = uuidv7().split('-').pop()        
        this.moduleName = `${module}_${hash.split('-')[0]}`
        // this.id = id
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled
        this.module;
        // Set up drag control for child nodes based on the 'e' key
        // this.setupDragControl();

        // sift through modules.json, construct node
        this.inputs = modules[module].inputs
        this.outputs = modules[module].outputs
        this.params = modules[module].params
        for (let i = 0; i<this.inputs.length; i++){
            this.children.push(this.inputs[i])
        }
        for (let i = 0; i<this.params.length; i++){
            this.children.push(this.params[i])
        }
        for (let i = 0; i<this.outputs.length; i++){
            this.children.push(this.outputs[i])
        }
    }

    getNodeStructure() {

        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: this.moduleName, label: this.moduleName, kind: 'module',  },
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
                    ghostCableColour: child.kind === 'input' ? '#5C9AE3' : '#E68942',
                    
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
