import audioNodes from '../modules/modules.json' assert { type: 'json'}
import {uuidv7} from 'uuidv7'
import Chance from 'chance';

import { config } from '../../config/forkingPathsConfig.js';

const chance = new Chance();

const moduleBackgrounds = {
    blue: "#99CCFF",
    green: "#B3FFB3",
    red: "#FFCCCC",
    yellow: "#FFFFCC",
    purple: "#E6CCFF",
    orange: "#CCCCCC"
}




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
        this.moduleColour = null
        this.knobs = []


        // module layouts
        // Layout configuration parameters:
        this.maxRows = config.moduleLayout.maxRows; // Maximum number of rows per module
        this.cellWidth = config.moduleLayout.cellWidth;      // Width of each cell (adjust as needed)
        this.cellHeight = config.moduleLayout.cellHeight;      // Height of each cell (adjust as needed)
        this.horizontalPadding = config.moduleLayout.horizontalPadding; // Horizontal spacing between cells
        this.verticalPadding = config.moduleLayout.verticalPadding;   // Vertical spacing between cells
       
        // module background colour:
        switch(this.module){
            case 'Oscillator':
            case 'LFO':
                this.moduleColour = moduleBackgrounds.orange
            break
            case 'HighPassFilter':
                this.moduleColour = moduleBackgrounds.green

            break

            default: this.moduleColour = moduleBackgrounds.purple
        }

        if(this.params){
            for (let i = 0; i<this.params.length; i++){
                let param = this.moduleSpec.parameters[this.params[i]]
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
            data: { id: this.moduleName, label: `${this.module} ${this.animal}`, kind: 'module', rnboName: this.module, moduleSpec: this.moduleSpec, structure: this.structure, bgcolour: this.moduleColour },
            position: this.position,
            classes: ':parent',
            
        };
        this.nodeIDs.push(this.moduleName)
        const childrenNodes = this.children.flatMap((child, index) => {

            // Calculate the row and column based on the index
            const row = index % this.maxRows;           // Row: cycles 0,1,2,0,1,2,…
            const col = Math.floor(index / this.maxRows); // Column: increases after every 3 elements

            if(typeof child.default === 'string'){
                // make it a dropdown menu
                child.ui = 'menu'
            } else {
                child.ui = 'knob'
            }

            // If the element is a parameter (knob) anchor, create a paramAnchorNode:
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
                        value: child.default || child.value || 0,
                        menuOptions: child.values || 'none',
                        description: child.description,
                        units: child.units || 'unspecified'
                        
                    },
                    position: {
                        x: this.position.x + col * (this.cellWidth + this.horizontalPadding),
                        y: this.position.y + row * (this.cellHeight + this.verticalPadding)
                    },
                    classes: 'paramAnchorNode'
                }]

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
                            x: this.position.x + col * (this.cellWidth + this.horizontalPadding),
                            y: this.position.y + row * (this.cellHeight + this.verticalPadding)
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
