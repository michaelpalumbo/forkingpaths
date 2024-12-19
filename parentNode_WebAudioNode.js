import audioNodes from './src/modules/modules.json' assert { type: 'json'}
import {uuidv7} from 'uuidv7'
import Chance from 'chance';
const chance = new Chance();

// const modules = audioNodes.webAudioNodes
export class ParentNode_WebAudioNode {
    constructor(module, position, children, structure) {
        this.animal = chance.animal().split(' ').pop()
        const hash = `${this.animal}_${uuidv7().split('-').pop()}`       
        this.moduleName = `${module}_${hash.split('-')[0]}`
        // this.id = id
        this.position = position;
        this.children = children;
        this.isDraggingEnabled = false; // Flag to track if dragging is enabled
        this.module = module;

        // console.log(modules, module)

      
        this.audioGraph = {
            type: module,
            params: {},
            moduleSpec: audioNodes[structure][module],
            nodeIDs: [],
            structure: structure

        }
        this.nodeIDs = [] // store parent and child ids for later reference
        // sift through modules.json, construct node

        
        this.moduleSpec = audioNodes[structure][module]
        this.structure = structure // whether it is a basic web audio node or a rnboDevice
        this.inputs = this.moduleSpec.inputs
        this.outputs = this.moduleSpec.outputs
        this.params = this.moduleSpec.paramNames

        this.paramOverlays = []
        this.cv = this.moduleSpec.cvNames        
        
        this.knobs = []

        if(this.params){
            for (let i = 0; i<this.params.length; i++){
                let param = this.moduleSpec.parameters[this.params[i]]
                console.log(param)
                param.kind = 'paramAnchorNode'
                param.name = this.params[i]
                
                this.children.push(param)
                
                this.audioGraph.params[this.params[i]] = param.default

                this.paramOverlays.push(param)
            }
        }
        if(this.cv){
            for (let i = 0; i<this.cv.length; i++){
                let cv = this.moduleSpec.cv[this.cv[i]]
                cv.kind = 'input'
                cv.name = this.cv[i]
                
                this.children.push(cv)
            }
        }

        if(this.inputs){
            for (let i = 0; i<this.inputs.length; i++){
                let input = {
                    kind: 'input',
                    name: this.inputs[i]
                }
                this.children.push(input)
            }
        }

        if(this.outputs){
            for (let i = 0; i<this.outputs.length; i++){
                let output = {
                    kind: 'output',
                    name: this.outputs[i]
                }
                this.children.push(output)
            }
        }

            



        
       
    }

    findMatchingObject(obj, searchKey) {
        for (const [key, value] of Object.entries(obj)) {
            // Recursively search through nested objects
            if (typeof value === "object" && !Array.isArray(value)) {
                for (const [innerKey, innerValue] of Object.entries(value)) {
                    if (innerKey.toLowerCase() === searchKey.toLowerCase()) {
                        return { structure: key, code: innerValue }; // Return the parent property and the matching object
                    }
                }
            }
        }
        return null; // Return null if no match is found
    }
    getNodeStructure() {
        
        // Reset or initialize an offset index counter for this instance
        const numChildren = this.children.length;

        // Returns the structure of the parent node and its children
        const parentNode = {
            data: { id: this.moduleName, label: `${this.module} ${this.animal}`, kind: 'module', rnboName: this.module, moduleSpec: this.moduleSpec, structure: this.structure },
            position: this.position,
            classes: ':parent',
        };
        this.nodeIDs.push(this.moduleName)
        const childrenNodes = this.children.flatMap((child, index) => {

        // Arrange the child nodes in a vertical line below the parent node
        const offsetY = index * 60; // Each child node is 60px below the previous one
        const offsetX = 0; // Keep the X position the same for a vertical arrangement
        if(typeof child.default === 'string'){
            // make it a dropdown menu
            child.ui = 'menu'
        } else {
            child.ui = 'knob'
        }

        if(child.kind === 'paramAnchorNode'){
            const paramAnchorNodeID = `${this.moduleName}_${child.name}`

            this.nodeIDs.push(`${paramAnchorNodeID}-anchorNode`)

            return [{                  
                data: {
                    id: paramAnchorNodeID,
                    parent: this.moduleName,
                    label: child.name || `${this.moduleName}-${paramAnchorNodeID}-${child.name}`,
                    nameSpace: `${paramAnchorNodeID}.${child.name}`,
                    kind: child.kind,
                    // sliderComponent: 'handle',
                    shape: 'ellipse',
                    bgcolour: '#CCCCCC',
                    // set the track dimensions in the handle data for later access
                    // trackStartX: trackStartX, 
                    // trackEndX: trackEndX,
                    // fixedY: config.position.y +10,
                    hash: `${this.moduleName}_${child.name}`,
                    ui: child.ui,
                    min: child.min || child.minimum || 0,
                    max: child.max || child.maximum || 1,
                    value: child.default || child.value,
                    menuOptions: child.values || 'none',
                    description: child.description
                    
                },
                position: {
                    x: this.position.x + 20,
                    y: this.position.y + offsetY + 10// Match Y-position with the track
                },
                classes: 'paramAnchorNode'
            }]

        } else if(child.kind === 'slider'){
                const sliderId = `${this.moduleName}_${child.name}`
                
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
                const sliderTrackLabelId = `${sliderTrackId}-label`;
                const sliderHandleId = `${sliderId}-handle`;
                
                
                this.nodeIDs.push(sliderTrackId, sliderTrackLabelId, sliderHandleId)
                const trackStartX = config.position.x - config.length / 2;
                const trackEndX = config.position.x + config.length / 2;

                const fixedY = config.position.y;

                let isDragging = false;
                let isDraggingEnabled = false; // Tracks if 'e' is pressed for repositioning
            
                // Calculate initial handle position within the track
                const initialHandleX = config.position.x - config.length / 2 + (config.length * (config.initialValue - config.minValue)) / (config.maxValue - config.minValue);
               
                // this is a parameter with strings for steps, i.e. ["sine", "square", "sawtooth", "triangle", "custom"],
                if(child.name === 'type'){
                    child.min = child.values[0],
                    child.max = child.values[child.values.length - 1]
                }
                
                return [
                    // slider track
                    // {                  
                    //     data: {
                    //         id: sliderTrackId,
                    //         parent: this.moduleName,
                    //         label: child.name || `${this.moduleName}-${sliderTrackId}${index + 1}`,
                    //         kind: child.kind,
                    //         bgcolour: '#CCCCCC',
                    //         length: config.length,
                    //         sliderComponent: 'track',
                    //         hash: sliderId,
                    //         description: child.description



                    //         // ghostCableShape: child.kind === 'input' ? 'rectangle' : 'triangle',
                    //         // ghostCableColour: child.kind === 'input' ? '#5C9AE3' : '#E68942',
                            
                    //     },
                    //     position: {
                    //         x: config.position.x,
                    //         y: config.position.y + 10 // add 10 to make space for slider label
                    //     },
                    //     classes: 'sliderTrack'
                    // },
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
                            sliderMin: child.min || child.minimum || 0,
                            sliderMax: child.max || child.maximum,
                            value: child.default,
                            description: child.description
                            
                        },
                        position: {
                            x: initialHandleX,
                            y: config.position.y + 10 // Match Y-position with the track
                        },
                        classes: 'sliderHandle'
                    },
                    // Add the text label node
                    // {
                    //     data: {
                    //         id: sliderTrackLabelId,
                    //         parent: this.moduleName,
                    //         label: `${child.default}`, // Initial value; will be updated dynamically
                    //         kind: 'label',
                    //         hash: sliderId,
                    //     },
                    //     position: {
                    //         x: config.position.x + (config.length / 2), // Shift left by half the track length plus some margin (adjust 30 as needed)
                    //         y: config.position.y // Adjust Y-position to place it above the slider
                    //     },
                    //     classes: 'sliderLabel' // Define a class for styling if needed
                    // }

                ]
                
                    

                
            } 
            
            else {
                
                const portID = `${this.moduleName}.${child.name}`

                this.nodeIDs.push(portID)
                return {
                    
                    data: {
                        id: portID,
                        parent: this.moduleName,
                        label: child.name || child.tag || `${this.moduleName}-${child.name}${index + 1}`,
                        kind: child.kind,
                        bgcolour: child.kind === 'input' ? '#FC9A4F' : child.kind === 'output' ? '#6FB1FC' : '#CCCCCC',
                        ghostCableShape: child.kind === 'input' ? 'rectangle' : 'triangle',
                        ghostCableColour: child.kind === 'input' ? '#5C9AE3' : '#E68942',
                        description: child.modulationDescription || null
                        
                    },
                    position: {
                        x: this.position.x + offsetX,
                        y: this.position.y + offsetY
                    }
                };
            }
           
            
        });
        this.audioGraph.nodeIDs = this.nodeIDs
        let audioGraph = this.audioGraph
        let paramOverlays = this.paramOverlays
        if(paramOverlays.length === 0){
            paramOverlays = false
        }
        
        return { parentNode, childrenNodes, audioGraph, paramOverlays };
    }
}
