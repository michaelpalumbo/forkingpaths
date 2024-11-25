import modules from './public/export/modules.json' assert { type: 'json'}
import {uuidv7} from 'uuidv7'

export class ParentNode {
    constructor(module, position, children) {

        const hash = uuidv7().split('-').pop()        
        this.moduleName = `${module}_${hash.split('-')[0]}`
        // this.id = id
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled
        this.module = module;
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
        // Reset or initialize an offset index counter for this instance
        const numChildren = this.children.length;

        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: this.moduleName, label: this.moduleName, kind: 'module', rnboName: this.module },
            position: this.position,
            classes: ':parent',
        };

        const childrenNodes = this.children.flatMap((child, index) => {

        // Arrange the child nodes in a vertical line below the parent node
        const offsetY = index * 60; // Each child node is 60px below the previous one
        const offsetX = 0; // Keep the X position the same for a vertical arrangement
            if(child.kind === 'slider'){
                const sliderId = `${this.moduleName}-slider-${child.label}`
                const defaultOptions = {
                    length: 127, // Length of the slider track in pixels
                    minValue: 0, // Minimum slider value
                    maxValue: 100, // Maximum slider value
                    initialValue: 64, // Initial slider value
                    position: { x: this.position.x + offsetX, y: this.position.y + offsetY }, // Default position
                };
  
                const config = { ...defaultOptions };
                    // Define the track and handle nodes for the slider
                const sliderTrackId = `${sliderId}-track`;
                const sliderHandleId = `${sliderId}-handle`;

                const trackStartX = config.position.x - config.length / 2;
                const trackEndX = config.position.x + config.length / 2;

                const fixedY = config.position.y;

                let isDragging = false;
                let isDraggingEnabled = false; // Tracks if 'e' is pressed for repositioning
            
                // Calculate initial handle position within the track
                const initialHandleX = config.position.x - config.length / 2 + (config.length * (config.initialValue - config.minValue)) / (config.maxValue - config.minValue);
            
                return [
                    // slider track
                    {                  
                        data: {
                            id: sliderTrackId,
                            parent: this.moduleName,
                            label: child.label || `${this.moduleName}-${sliderTrackId}${index + 1}`,
                            kind: child.kind,
                            bgcolour: '#CCCCCC',
                            length: config.length,
                            sliderComponent: 'track',
                            hash: sliderId,



                            // ghostCableShape: child.kind === 'input' ? 'rectangle' : 'triangle',
                            // ghostCableColour: child.kind === 'input' ? '#5C9AE3' : '#E68942',
                            
                        },
                        position: {
                            x: config.position.x,
                            y: config.position.y + 10 // add 10 to make space for slider label
                        },
                        classes: 'sliderTrack'
                    },
                    {                  
                        data: {
                            id: sliderHandleId,
                            parent: this.moduleName,
                            label: child.label || `${this.moduleName}-${sliderHandleId}${child.label}`,
                            nameSpace: `${sliderHandleId}.${child.label}`,
                            kind: child.kind,
                            sliderComponent: 'handle',
                            shape: 'ellipse',
                            bgcolour: '#CCCCCC',
                            // set the track dimensions in the handle data for later access
                            trackStartX: trackStartX, 
                            trackEndX: trackEndX,
                            fixedY: config.position.y +10,
                            hash: sliderId,
                            trackID: sliderTrackId,
                            sliderMin: child.min,
                            sliderMax: child.max,
                            value: child.value
                            
                        },
                        position: {
                            x: initialHandleX,
                            y: config.position.y + 10 // Match Y-position with the track
                        },
                        classes: 'sliderHandle'
                    },
                    // Add the text label node
                    {
                        data: {
                            id: `${sliderTrackId}-label`,
                            parent: this.moduleName,
                            label: `${child.min}`, // Initial value; will be updated dynamically
                            kind: 'label',
                            hash: sliderId,
                        },
                        position: {
                            x: config.position.x + (config.length / 2), // Shift left by half the track length plus some margin (adjust 30 as needed)
                            y: config.position.y // Adjust Y-position to place it above the slider
                        },
                        classes: 'sliderLabel' // Define a class for styling if needed
                    }

                ]
                
                    

                
            } else {
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
            }
           
            
        });

        return { parentNode, childrenNodes };
    }
}
