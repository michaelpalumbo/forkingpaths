import modules from './src/modules/modules.json' assert { type: 'json'}
import {uuidv7} from 'uuidv7'
import Chance from 'chance';
const chance = new Chance();

const moduleFormat = 'webAudioNodes'
export class ParentNode {
    constructor(module, position, children) {
        this.animal = chance.animal().split(' ').pop()
        const hash = `${this.animal}_${uuidv7().split('-').pop()}`       
        this.moduleName = `${module}_${hash.split('-')[0]}`
        // this.id = id
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled
        this.module = module;
        this.audioGraph = {
            type: module,
            params: {}

        }
        // Set up drag control for child nodes based on the 'e' key
        // this.setupDragControl();o

        if(moduleFormat === 'webAudioNodes'){

        } else if (moduleFormat === 'rnboDevices'){
             // sift through modules.json, construct node
            this.inputs = modules[module].inputs
            this.outputs = modules[module].outputs
            this.params = modules[module].params
            
            for (let i = 0; i<this.inputs.length; i++){
                this.inputs[i].kind = 'input'
                this.children.push(this.inputs[i])
            }
            for (let i = 0; i<this.params.length; i++){
                this.params[i].kind = 'slider'
                this.children.push(this.params[i])
                this.audioGraph.params[this.params[i].name] = this.params[i].initialValue
                if(this.params[i].name === 'oscillator'){
                    this.audioGraph.params[this.params[i].type] = this.params[i].meta.waveform || "sine"
                }
            }
            for (let i = 0; i<this.outputs.length; i++){
                this.outputs[i].kind = 'output'
                this.children.push(this.outputs[i])
            }
        }
       
    }

    getNodeStructure() {
        // Reset or initialize an offset index counter for this instance
        const numChildren = this.children.length;

        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: this.moduleName, label: `${this.module} ${this.animal}`, kind: 'module', rnboName: this.module },
            position: this.position,
            classes: ':parent',
        };

        const childrenNodes = this.children.flatMap((child, index) => {

        // Arrange the child nodes in a vertical line below the parent node
        const offsetY = index * 60; // Each child node is 60px below the previous one
        const offsetX = 0; // Keep the X position the same for a vertical arrangement
            if(child.kind === 'slider'){
                const sliderId = `${this.moduleName}-slider-${child.name}`
                //! important to do: the min and maxvalue should reflect the rnbo device's min and max, and so should the initialValue. 
                //! but for this to work we also need to update the slider updates scaling in on.mousemove. 
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
                            label: child.name || `${this.moduleName}-${sliderTrackId}${index + 1}`,
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
                            label: child.name || `${this.moduleName}-${sliderHandleId}${child.name}`,
                            nameSpace: `${sliderHandleId}.${child.name}`,
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
                            sliderMin: child.minimum,
                            sliderMax: child.maximum,
                            value: child.initialValue
                            
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
                            label: `${child.minimum}`, // Initial value; will be updated dynamically
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
                        label: child.meta.name || child.name || child.tag || `${this.moduleName}-${child.name}${index + 1}`,
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
        let audioGraph = this.audioGraph
        console.log('ag', audioGraph)
        return { parentNode, childrenNodes, audioGraph };
    }
}
