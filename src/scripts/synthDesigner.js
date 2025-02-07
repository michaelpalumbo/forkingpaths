//*
//*
//* INITIALIZATION AND SETUP
//* Set up dependencies, initialize core variables
//*

import { ParentNode_WebAudioNode } from '../utilities/parentNode_WebAudioNode.js';
import modules from '../modules/modules.json' assert { type: 'json'}
import { marked } from 'marked'
import 'jquery-knob';   // Import jQuery Knob plugin
import { computePosition, flip, shift } from '@floating-ui/dom';
import { config } from '../../config/forkingPathsConfig.js';


// * UI
const baseKnobSize = config.knob.baseKnobSize; // Default size in pixels
const knobOffsetAmount = 30; // Horizontal offset for staggering knobs
const knobVerticalSpacing = baseKnobSize * 0.2; // 20% of base knob size for vertical spacing
const baseDropdownWidth = 100; // Base width of the dropdown
// this is session storage of the ui overlays. 
let paramUIOverlays = {}

let virtualElements = {}

let debugVar;

let isDraggingEnabled = false;


let highlightedNode = null

// * CYTOSCAPE

let parentNodePositions = []

// * INPUTS

let hid = {
    key: {
        cmd: false,
        shift: false,
        o: false,
        v: false,
        s: false
    }
}

let synthGraph = {
    modules: {
    },
    connections: []
}

// *
// *
// *    APP
// *
// *

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById('viewReadme').addEventListener('click', () => {
        fetch('./README.md') // Fetch the README file
            .then(response => response.text())
            .then(markdown => {
                const html = marked(markdown); // Convert Markdown to HTML
                const newTab = window.open(); // Open a new tab
                newTab.document.write(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>README</title>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow: auto; }
                            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                            h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; }
                            a { color: #0366d6; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        ${html}
                    </body>
                    </html>
                `);
                newTab.document.close();
            })
            .catch(err => console.error('Error fetching README:', err));
    });


    //*
    //*
    //* CONFIGURE CYTOSCAPE INSTANCES
    //* 
    //*
    
    // cytoscape.use(cytoscapeGridGuide);

    const cy = cytoscape({
        container: document.getElementById('cy'),

        elements: [ ], // Start with no elements; add them dynamically

        layout: {
            name: 'preset', // Preset layout allows manual positioning
            
        },
        fit: true,
        resize: true,
        userZoomingEnabled: false, // Disable zooming
        userPanningEnabled: false,

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(bgcolour)',
                    'label': 'data(label)', // Use the custom label attribute
                    'font-size': '18px',
                    'width': 30,
                    'height': 30,
                    'color': '#000',            // Label text color
                    'text-valign': 'top',    // Vertically center the label
                    'text-halign': 'center',      // Horizontally align label to the left of the node
                    'text-margin-x': -10, // Optional: Move the label slightly up if desired
                    // 'shape': 'data(shape)' // set this for accessibility (colour blindness)
                }
            },
            {
                selector: 'node[bgcolour]',
                style: {
                    'background-color': 'data(bgcolour)'
                }
            },
            {
                selector: 'node[kind = "input"]',
                style: {
                    'shape': 'triangle' // set this for accessibility (colour blindness)
                }
            },
            {
                selector: 'node[kind = "output"]',
                style: {
                    'shape': 'rectangle' // set this for accessibility (colour blindness)
                }
            },

            {
                selector: ':parent',
                style: {
                    'background-opacity': 0.5,
                    'padding': '40px', // Increase padding around child nodes
                    'background-color': 'data(bgcolour)',
                    'border-color': '#F57A41',
                    'border-width': 1,
                    'label': 'data(label)', // Use the node id or any data field as the label
                    'text-valign': 'top', // Position label at the top
                    'text-halign': 'center', // Center label horizontally
                    'color': '#FF0000', // Set the label text color
                    'font-size': 20, // Adjust font size if needed
                    'text-margin-y': -10, // Optional: Move the label slightly up if desired
                
                }
            },
            {
                selector: 'node.highlighted',
                style: {
                    'border-color': '#228B22', // Highlight color
                    'border-width': 10
                }
            },
            {
                selector: 'node.ghostNode', // this is used when we create a temporary cable
                style: {
                    'background-color': '#FFFFFF', // Give ghostNode a neutral color
                    'opacity': 0.8, // Make ghost node semi-transparent
                    'width': 27,
                    'height': 27,
                    'border-width': 0, // Remove border for ghostNode
                    'label': ''
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 6,
                    'line-color': '#ccc',
                    'target-arrow-shape': 'triangle',

                    'source-arrow-shape': 'triangle', // Adds a circle at the start
                    'source-arrow-color': '#000',
                    'target-arrow-color': '#000',
                    'target-arrow-width': 20, // Size of the target endpoint shape
                    'source-arrow-width': 50, // Size of the source endpoint shape

                    'curve-style': 'unbundled-bezier',
                    'control-point-weights': [0.25, 0.75], // Control the curve points
                    'control-point-distances': [20, -20], // Adjust distances from the line
                }
            },
            {
                selector: 'edge.highlighted',
                style: {
                    'line-color': '#FF0000',           // Highlight color
                    'target-arrow-color': '#FF0000',    // Highlight arrow color
                    'source-arrow-color': '#FF0000',
                    'width': 10  
                }
            },
            {
                selector: 'edge.connectedEdges',
                style: {
                    'line-color': '#228B22',           // Highlight color
                    'target-arrow-color': '#228B22',    // Highlight arrow color
                    'source-arrow-color': '#228B22',
                    'width': 6 
                }
            },
            {
                selector: '.peerPointer',
                style: {
                    'background-color': 'data(colour)', // Color for the remote peer's mouse node
                    'width': 15,
                    'height': 15,
                    'shape': 'star',
                    'text-valign': 'center',    // Vertically center the label
                    'text-halign': 'right',      // Horizontally align label to the left of the node
                    'text-margin-x': 10, // Optional: Move the label slightly up if desired
                }
            },
            {
                selector: '.paramAnchorNode',
                style: {
                    'background-color': '#F5A45D',
                    'background-opacity': 0.,
                    'shape': 'ellipse',
                    'width': 20,
                    'height': 20,
                    'label': '', // Remove label for handle
                    'text-opacity': 0, // Ensure no text is shown
                    'outline-width': 0, // Remove focus outline
                    'events': 'no' // prevent user from clicking the anchor node
                    // 'user-select': 'none', // Prevent text selection

                }
            }
        ]
    });


    // Enable Grid-Guide Extension
    cy.gridGuide({
        drawGrid: true,
        snapToGrid: true,
        gridSpacing: 20,
        gridColor: '#dedede',
        lineWidth: 1
    });

    console.warn('gridGuide is being used but not appearing. see code just above this message')

    function createNewSynth(){

        cy.elements().remove();

        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        
        // ensure their container divs are removed too
        clearparamContainerDivs()

        addSpeaker()
    }

    createNewSynth()
    
    // save synth to disk
    function saveSynth(fileName) {
        const synthDef = {
            filename: fileName,
            visualGraph: cy.json(),
            paramUIOverlays: paramUIOverlays,
            audioGraph: synthGraph
        }
        // generate the data
        const data = JSON.stringify(synthDef, null, 2)

        // Create a Blob object for the binary data
        const blob = new Blob([data], { type: 'application/json' });

        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;

        // Optionally, add the link to the DOM and simulate a click
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url); // Release memory
    }

    // save synth to user's computer as .fpsynth
    async function saveFile(fileName) {
        const synthDef = {
            filename: fileName,
            visualGraph: cy.json(),
            paramUIOverlays: paramUIOverlays,
            audioGraph: synthGraph
        }
        // Show the file save dialog
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
                {
                    description: "Forking Paths Synth File",
                    accept: { "application/x-fpsynth": [".fpsynth"] }
                },
            ],
        });
        let cytoscapeSynthGraph = JSON.stringify(synthDef, null, 2)

        // Create a writable stream for the file
        const writableStream = await fileHandle.createWritable();

        // Write the data to the file
        await writableStream.write(cytoscapeSynthGraph);

        // Close the writable stream
        await writableStream.close();
    }

    /* 

        SYNTH CYTOSCAPE

    */

    function loadSynthGraphFromFile(graphJSON) {
        parentNodePositions = []; // Array to store positions of all parent nodes

        // Step 1: Extract all parent nodes from the given document
        const parentNodes = graphJSON.elements.nodes.filter(el => el.classes === ':parent'); // Adjust based on your schema
        parentNodes.forEach(parentNode => {
            if (parentNode.position) {
                parentNodePositions.push({
                    id: parentNode.data.id,
                    position: parentNode.position
                });
            }
        });
    
        let elements = graphJSON.elements.nodes

        // Clear existing elements from Cytoscape instance
        cy.elements().remove();

        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        
        // ensure their container divs are removed too
        clearparamContainerDivs()

        cy.json(graphJSON);
        // cy.add(elements)

        parentNodePositions.forEach(parentNode => {
            const node = cy.getElementById(parentNode.id);

            if (node) {
                // test
                let pos = {x: parseFloat(parentNode.position.x), y: parseFloat(parentNode.position.y)}
                
                // pos = {x: Math.random() * 100 + 200, y: Math.random() * 100 + 200};
                    // console.log(`Random`, typeof pos.x, typeof pos.y);
                // pos = {x: 273.3788826175895, y: 434.9628649535062};
                // let clonedPos = {...pos}
                node.position(pos); // Set the position manually  
            }
        });
        
        // add overlay UI elements
        let index = 0
        elements.forEach((node)=>{
            
            if(node.classes === 'paramAnchorNode'){
                // let value = graphJSON.synth.graph.modules[node.data.parent].params[node.data.label]
                createFloatingOverlay(node.data.parent, node, index)
        
                index++
            }
        })
        // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
        setTimeout(() => {
            updateKnobPositionAndScale('all');
        }, 10); // Wait for the current rendering cycle to complete
    }    

//*
//*
//* UI UPDATES
//* Functions that directly handle updating DOM elements & cytoscape
//*
    // centralize the overlay removal logic
    function removeUIOverlay(cmd, data){

        switch(cmd){
            case 'singleNode':

                const matchingDivs = document.querySelectorAll(`div[id^="paramDivContainer_${data}"]`);

                // Iterate over each matching div
                matchingDivs.forEach(div => {
                    // Find all child elements which are param overlays
                    const paramOverlayDiv = div.querySelector('.paramOverlay'); 
                    if (paramOverlayDiv) {
                        paramOverlayDiv.removeKnob()
                    }
                    div.remove()
                });
                paramUIOverlays[data].forEach((childDiv)=>{
                    childDiv.removeKnob()
                    
                    // childDiv.parentNode.removeChild(childDiv);
                })
                //? delete paramUIOverlays[nodeId]
            break

            case 'allNodes':
                // delete all param UI overlays
                /*
                Object.values(amDoc.paramUIOverlays).forEach((parentNode) => {
                    parentNode.forEach((paramUIDiv) => {
                        // paramUIDiv.parentNode.removeChild(paramUIDiv);
                        paramUIDiv.removeKnob()
                    });
                });

                // find all param overlay divs, and remove them
                const matchingDivs2 = document.querySelectorAll(`div[id^="paramDivContainer"]`);

                // Iterate over each matching div
                matchingDivs2.forEach(div => {

                    // Find all child elements which are param overlays
                    const paramOverlayDiv = div.querySelector('.paramOverlay'); 
                    if (paramOverlayDiv) {
                        paramOverlayDiv.removeKnob()
                    }
                    div.remove()
                });
                */
            break
        }

    }
    function setSynthToolTip(description){
        const element = document.getElementById('cytoscapeTooltipText');
        // Set new text content
        element.textContent = description;
        
    } 
    
// Toggle the visibility of the settings overlay
    function toggleSettingsOverlay() {
        const overlay = document.getElementById('settingsOverlay');
        overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
    }

    // Add event listener for the settings button
    document.getElementById('settingsButton').addEventListener('click', toggleSettingsOverlay);

    const closeOverlayButton = document.getElementById('closeOverlayButton');
    closeOverlayButton.addEventListener('click', toggleSettingsOverlay);


    // Function to create and manage an overlay div
    function createFloatingOverlay(parentNodeID, param, index, loadedValue) { // if loadedValue, this is the value from the amDoc to be passed in
       
        // const stepSize = determineStepSize(param.min, param.max, 'logarithmic', 100 )
        if(!virtualElements[parentNodeID]){
            virtualElements[parentNodeID] = {
                elements: [],
                containerDivs: []
            }
        }
        // Create a container div to hold the UI element
        const containerDiv = document.createElement('div');
        containerDiv.dataset.description = param.data.description || 'no description'
        containerDiv.className = '.paramUIOverlayContainer'
        containerDiv.style.position = 'absolute';
        containerDiv.style.zIndex = '1000';
        containerDiv.style.width = `${baseKnobSize}px`;
        containerDiv.style.height = `${baseKnobSize}px`;
        containerDiv.id = `paramDivContainer_${param.data.id}`


        // Create the label element
        const labelDiv = document.createElement('div');
        labelDiv.innerText = param.data.label || `Knob`; // Use parameter label or default
        labelDiv.style.textAlign = 'left';
        labelDiv.style.marginBottom = '2px';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.color = '#333';
        
        // add menu or knob
        let paramDiv
        if(param.data.ui === 'menu'){
            paramDiv = document.createElement('select');
            // store contextual info about the param
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label

            paramDiv.style.width = '100%';
            // paramDiv.style.padding = '5px';
            paramDiv.style.borderRadius = '4px';
            // paramDiv.style.border = '1px solid #ccc';
            paramDiv.style.fontSize = '12px';

            // Add options to the select menu
            param.data.menuOptions.forEach((option) => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value || option;
                optionElement.textContent = option.label || option;
                if(loadedValue && loadedValue == optionElement.value){
                    optionElement.selected = true
                }
                paramDiv.appendChild(optionElement);
            });
        } else if (param.data.ui === 'knob'){
            // Create an input element for jQuery Knob
            paramDiv = document.createElement('input');
            // store contextual info about the param
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label
            // paramDiv.dataset.description = param.data.description
            
            paramDiv.type = 'text';
            paramDiv.value = loadedValue || param.data.default || param.data.value || 50; // Initial value
            // paramDiv.style.position = 'absolute';
            paramDiv.style.width = `100%`;
            paramDiv.style.height = `100%`;
            paramDiv.id = `knob_${param.data.id}`
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)
        }
        
        paramDiv.className = '.paramOverlay'
        // paramDiv.style.zIndex = '1000';
        // paramDiv.style.pointerEvents = 'auto'; // Ensure interactions are enabled

        // Append the input to the container
        containerDiv.appendChild(labelDiv);
        containerDiv.appendChild(paramDiv);
        document.body.appendChild(containerDiv);
        

        if (param.data.ui === 'knob'){
            const stepSize = determineStepSize(param.data.min, param.data.max, 'logarithmic', 100 )
            // Initialize jQuery Knob on the input
            $(paramDiv).knob({
                min: param.data.min || param.data.sliderMin || 0,
                max: param.data.max || param.data.sliderMax || 100,
                step: stepSize,
                fgColor: "#00aaff",
                bgColor: "#e6e6e6",
                inputColor: "#333",
                thickness: config.knob.thickness,
                angleArc: 270,
                angleOffset: -135,
                width: config.knob.baseKnobSize,          // Set width of the knob
                height: config.knob.baseKnobSize,  
                // change: function (value) {
                //     $(this.$).trigger('knobChange', [parentNodeID, param.data.label, value]);
                // // },
                // change: (value) => {
                //     value = Math.round(value * 100) / 100
                //     // set params in audio graph:
                //     paramChange(parentNodeID, param.data.label, value)
                // },
                // release: (value) => {
                //     console.log(`gesture ended. see \/\/! comment in .knob().release() in createFloatingOverlay for how to use this`);
                //     //! could use this to get the start and end of a knob gesture and store it as an array in the history sequence
                // },
            });
        } else if (param.data.ui === 'menu'){
            // ignore
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)

        }

        // Create a virtual element for Floating UI
        let virtualElement = {
            getBoundingClientRect: () => {
                const childNode = cy.getElementById(param.data.id);
                const parentNode = cy.getElementById(parentNodeID)
                const parentData = parentNode.data();

                const parentParams = parentData?.moduleSpec?.paramNames || [];
                if (childNode && parentParams.length > 0) {
                    const containerRect = cy.container().getBoundingClientRect();
       
                    // set virtual element position based on childNode.position()
                    return {
                        width: config.knob.baseKnobSize,
                        height: config.knob.baseKnobSize,
                        top: containerRect.top + childNode.position().y,
                        left: containerRect.left + childNode.position().x,
                        right: containerRect.left + childNode.position().x + config.knob.baseKnobSize,
                        bottom: containerRect.top + childNode.position().y + config.knob.baseKnobSize,
                        // top: containerRect.top + (parentPos.y * zoom) + pan.y + offsetY,
                        // left: containerRect.left + (parentPos.x * zoom) + pan.x + offsetX,
                        // right: containerRect.left + (parentPos.x * zoom) + pan.x + offsetX + knobWidth,
                        // bottom: containerRect.top + (parentPos.y * zoom) + pan.y + offsetY + knobHeight,
                    };
                }

                // Fallback if childNode is not found
                return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
            },
        };

        virtualElements[parentNodeID].elements.push(virtualElement)
        virtualElements[parentNodeID].containerDivs.push(containerDiv)


        // Cleanup function
        function removeKnob() {
            $(paramDiv).off()
            // Remove the container div
            if (containerDiv.parentNode) {
                containerDiv.parentNode.removeChild(containerDiv);
            }

            // Nullify the virtual element
            // virtualElement.getBoundingClientRect = null;
            
            virtualElement = null

        }

        // Update position dynamically on pan/zoom
        // cy.on('pan zoom position', updateKnobPositionAndScale);

        return { containerDiv, removeKnob } ;
    }


    // dynamically update all floating ui elements' position and scale 
    function updateKnobPositionAndScale(cmd, node) {
        const zoom = cy.zoom();
        switch(cmd){
            case 'all':
                // get all virtual elements in the DOM
                Object.values(virtualElements).forEach((node) => {
                    node.elements.forEach((virtualElement, index) => {
                        let containerDiv = node.containerDivs[index]
                        // Update position with Floating UI
                        computePosition(virtualElement, containerDiv, {
                            placement: 'top', // Adjust placement as needed
                            middleware: [flip(), shift()], // Prevent the knob from leaving the viewport
                        }).then(({ x, y }) => {
                            
                            containerDiv.style.left = `${x}px`;
                            containerDiv.style.top = `${y}px`;
                            // Dynamically scale the knob size
                            const scaledSize = baseKnobSize / zoom;
                            containerDiv.style.width = `${scaledSize}px`;
                            containerDiv.style.height = `${scaledSize}px`;
                        });
                    });            
                });
            break

            case 'node':
                virtualElements[node].elements.forEach((virtualElement, index) => {
                    let containerDiv = virtualElements[node].containerDivs[index]
                    // Update position with Floating UI
                    computePosition(virtualElement, containerDiv, {
                        placement: 'top', // Adjust placement as needed
                        middleware: [flip(), shift()], // Prevent the knob from leaving the viewport
                    }).then(({ x, y }) => {
                        
                        containerDiv.style.left = `${x}px`;
                        containerDiv.style.top = `${y}px`;
                        // Dynamically scale the knob size
                        const scaledSize = baseKnobSize / zoom;
                        containerDiv.style.width = `${scaledSize}px`;
                        containerDiv.style.height = `${scaledSize}px`;
                    });
                })
            break
        }
        
    }

    let parentConnectedEdges = []
    // highlight all edges connected to a clicked parent node
    function highlightEdges(cmd, node){
        // Get all child nodes of the parent
        const childNodes = node.children();

        // Create a collection to store all connected edges
        let connectedEdges = cy.collection();




        if(cmd === 'show'){
            // Iterate over the child nodes to gather their connected edges
            childNodes.forEach((child) => {
                child.connectedEdges().forEach((edge)=>{
                    edge.addClass('connectedEdges');
                    parentConnectedEdges.push(edge)
                })
            });
        } else if (cmd === 'hide'){
            // Iterate over the child nodes to gather their connected edges
            childNodes.forEach((child) => {
                child.connectedEdges().forEach((edge)=>{
                    edge.removeClass('connectedEdges');
                })
                parentConnectedEdges = []
            });
        }
        

        // .addClass('highlighted');
        // .removeClass('highlighted');
    }
    // generate list of audio nodes for adding to patch
    function updateModuleLibrary(){
        
        const webAudioNodeNames = Object.keys(modules.webAudioNodes).sort()
        // const RNBODeviceNames = Object.keys(modules.rnboDevices).sort()

        // Reference the list element
        const listElement = document.getElementById('moduleList');
        // RNBO device category
        // const heading1 = document.createElement('li');
        // heading1.textContent = 'RNBO Devices';
        // heading1.style.fontWeight = 'bold'; // Make the heading stand out
        // heading1.style.pointerEvents = 'none'; // Disable interaction

        // listElement.appendChild(heading1);
        //  // Loop through the array and create list items
        //  RNBODeviceNames.forEach(item => {
        //     // Create a new <li> element
        //     const listItem = document.createElement('li');
        //     // Set the text of the <li> to the current item
        //     listItem.textContent = item;
        //     listItem.dataset.structure = 'rnboDevices'
        //     // Append the <li> to the list
        //     listElement.appendChild(listItem);
            

        // });       


        // Web Audio Node category
        const heading2 = document.createElement('li');
        heading2.textContent = 'Web Audio Nodes';
        heading2.style.fontWeight = 'bold'; // Make the heading stand out
        heading2.style.pointerEvents = 'none'; // Disable interaction

        listElement.appendChild(heading2);
        // Loop through the array and create list items
        webAudioNodeNames.forEach(item => {
            if(item != 'AudioDestination' && item != 'AudioWorklet' && item != "OutputLimiter" && item != "feedbackDelayNode"){
                // all that are available at the moment
                    // Create a new <li> element
                    const listItem = document.createElement('li');
                    // Set the text of the <li> to the current item
                    listItem.textContent = item;

                    listItem.dataset.structure = 'webAudioNodes'
                    // Append the <li> to the list
                    listElement.appendChild(listItem);
                
      
            }

        });
    }

    updateModuleLibrary()

    function addSpeaker(){
        // check if graph contains a speaker. if not:
        const nodeIds = cy.nodes().map(node => node.id());
        const AudioDestinationExists = nodeIds.some(id => id.includes('AudioDestination'));
        if(!AudioDestinationExists){
            const x = cy.width() - 100;
            const y = cy.height() - 50;

            addModule('AudioDestination', { x: x, y: y}, [   ], 'webAudioNodes')
            // OutputLimiter.connect(audioContext.destination);

        }

        // // Get the current viewport's extent
        // const extent = cy.extent();

        // // Bottom-right corner coordinates
        // const x = extent.x2; // Rightmost x-coordinate
        // const y = extent.y2; // Bottom-most y-coordinate
        // // todo: this doesn't seem to have an effect
        // speakerModule[0].position.x = x
        // speakerModule[0].position.y = y

        // cy.add(speakerModule)
    }
    // do this once:

//*
//*
//* EVENT HANDLERS
//* Functions that directly handle UI interactions
//*

    // listen for changes on module selectmenu elements
    $(document).on('change', 'select', function () {
        // only pass inputs that are actually module inputs
        if($(this).data('parentNodeID')){
            paramChange($(this).data('parentNodeID'), $(this).data('param'), $(this).val())
        }
     });

    $(document).on('mouseover', '.paramUIOverlayContainer', function () {
        setSynthToolTip($(this).data('description'))
    });
    
    $(document).on('mouseout', '.paramUIOverlayContainer', function () {
        console.log('Mouseover knob or menu for description...');
    });

    // use this to update UI overlay positions
    cy.on('pan zoom', function (){
        updateKnobPositionAndScale('all')
    } );

    cy.on('position', 'node', function (event) {
        const node = event.target.data().parent;
        // ignore modules that don't have UI overlays
        if(!virtualElements[node]){
            return
        }
        updateKnobPositionAndScale('node', node)
    });


    cy.off('add');

    // Reference the module library list element
    const moduleList = document.getElementById('moduleList');
    // Add click event listener
    moduleList.addEventListener('click', (event) => {
        let loadedModule = event.target.textContent

        if(!loadedModule.includes('RNBO Devices') || !loadedModule.includes('Web Audio Nodes') ){
            addModule(loadedModule, { x: 200, y: 200 }, [    ], event.target.dataset.structure )

        }
    });

    cy.on('mouseover', 'node', (event) => {
        const node = event.target;
        // Add hover behavior, e.g., change style or show tooltip
        // node.style('background-color', 'red');

        // Get the element by its ID
        // const element = document.getElementById('cytoscapeTooltipText');
        // let toolTip ='';

        if (node.data().description){
            setSynthToolTip(node.data().description)
        } 
        // // Set new text content
        // element.textContent = toolTip;
        // console.log(toolTip)

    });
    
    cy.on('mouseout', 'node', (event) => {
        // clear the tooltip
        setSynthToolTip('')

    });
    
    // get .fpsynth files from user's filesystem
    document.getElementById('fileInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
    
        if (!file) {
            alert('No file selected');
            return;
        }
    
        // Ensure the file is a valid Automerge binary (based on extension or type)
        if (!file.name.endsWith('.fpsynth')) {
            alert('Invalid file type. Please select a .fpsynth file.');
            return;
        }
    
        const reader = new FileReader();
    
        reader.onload = () => {
            try {
                // Parse the JSON data
                const jsonData = JSON.parse(reader.result);

                loadSynthGraphFromFile(jsonData.visualGraph)

            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        };
        reader.onerror = () => {
            console.error("Error reading the file:", reader.error);
        };

        // Start reading the file
        reader.readAsText(file);
        
    });

    
    
    // save forking paths files to user's file system
    document.getElementById("saveButton").addEventListener("click", () => {
        // check if browser supports the File System Access API
        if(!!window.showSaveFilePicker){
            saveFile("filename.fpsynth");
        } else {
            
            saveSynth('filename.fpsynth');
        }
        
    });

    // Listen for drag events on nodes
    cy.on('grab', (event)=> {
        const node = event.target
        // for child nodes
        if(node.data('kind') && node.data('kind') != 'module'){
            // for all elements that aren't modules, determine whether to allow dragging (for rearranging the UI)
            if(isDraggingEnabled){
                // if enabled, begin dragging node with mouse
                node.grabify()
            } else {
                // If dragging is not enabled, release the node immediately
                // this allows for cables to spawn or controller elements to be engaged with (i.e. sliders)
                node.ungrabify(); 
            }
        } else {

        }
    })

    // removing modules
    // Click event to highlight a parent node
    cy.on('click', 'node:parent', (event) => {


        // Remove highlight class from any previously highlighted node
        if (highlightedNode) {
            highlightedNode.removeClass('highlighted');
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
        } 
        // if highlighted module is clicked again, unhighlighted it
        if( highlightedNode == event.target){
            highlightedNode.removeClass('highlighted');
            // remove connected edge highlights
            highlightEdges('hide', highlightedNode)
            highlightedNode = null
            
        }
        else {
            // remove any cable highlights
            // highlightEdges('hide', highlightedNode)
            // Highlight the clicked parent node
            highlightedNode = event.target;
            highlightedNode.addClass('highlighted');
            // show connected edge highlights
            highlightEdges('show', highlightedNode)


        }
    });

    // Track when the 'e' key is pressed and released
    window.addEventListener('keydown', (event) => {
        if (event.key === 'o' || event.key === 'v' || event.key === 's') {
            hid.key[event.key] = true
        }
        if (event.key === 'e') {
            isDraggingEnabled = true;
        }
        if (event.key === 'z') {
            //! historyDAG_cy.zoomingEnabled(true)
        }
        if (event.key === 'Meta' || event.key === 'Control') {
            // allowMultiSelect = false
            // allowPan = true
            // ! historyDAG_cy.userZoomingEnabled(false)
            hid.key.cmd = true

        }
        if (event.key === 'Shift') {
            hid.key.shift = true
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'o' || event.key === 'v' || event.key === 's') {
            hid.key[event.key] = false
        }
        if (event.key === 'e') {
            isDraggingEnabled = false;
        }
        if (event.key === 'Meta' || event.key === 'Control') {
            // allowMultiSelect = false
            //! historyDAG_cy.userZoomingEnabled(true)
            hid.key.cmd = false
            // Hide a node by setting display to none

        }
        if (event.key === 'z') {
            // ! historyDAG_cy.zoomingEnabled(false)
        }
        if (event.key === 'Shift') {
            hid.key.shift = false
        }
    });

     // Handle keydown event to delete a highlighted edge on backspace or delete
     document.addEventListener('keydown', (event) => {
        if (highlightedNode && (event.key === 'Backspace' || event.key === 'Delete')){
            if (highlightedNode.isParent()) {
                const nodeId = highlightedNode.id();

                cy.remove(highlightedNode); // Remove the node from the Cytoscape instance
                highlightedNode = null; // Clear the reference after deletion

                removeUIOverlay('singleNode', nodeId)
            }
        }
    });

    // Select the button element by its ID
    const newSession = document.getElementById('newSession');

    // open a new session (with empty document)
    newSession.addEventListener('click', function() {
        createNewSynth()
    });

    

    //*
    //* PATCHING
    //*

    function addModule(module, position, children, structure) {
        
        // const parentNode = new ParentNode(module, position, children); // old version. 

        const parentNode = new ParentNode_WebAudioNode(module, position, children, structure, config.moduleLayout);

        // parentNode.getModule('oscillator')
        const { parentNode: parentNodeData, childrenNodes, audioGraph, paramOverlays } = parentNode.getNodeStructure();
    
        // Add nodes to Cytoscape
        cy.add(parentNodeData);
        cy.add(childrenNodes);
        
        debugVar = parentNodeData.data.id
        // index determines the left or right positioning of each knob
        let index = 0
        paramUIOverlays[parentNodeData.data.id] = []
        // let tempOverlayArray = [ ]
        childrenNodes.forEach((param)=>{
            
            if (param.classes == 'paramAnchorNode' && paramOverlays){
                let uiOverlay = createFloatingOverlay(parentNodeData.data.id, param, index);
                paramUIOverlays[parentNodeData.data.id].push(uiOverlay)
                // tempOverlayArray.push(serializeDivToBase64(uiOverlay))
                index++
            }
        })
        // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
        setTimeout(() => {
            updateKnobPositionAndScale('all');
        }, 10); // Wait for the current rendering cycle to complete
        synthGraph.modules[parentNodeData.data.id] = audioGraph
    }  


    
    //*
    //*
    //* UTILITY FUNCTIONS
    //* reusable helper functions and utility code for debugging, logging, etc.
    //*


    function syncPositions(forkedDoc) {
        // Map positions from forkedDoc by element ID
        const positionsById = forkedDoc.elements.reduce((acc, el) => {
            if (el.position) {
                acc[el.data.id] = el.position; // Map the position by the element ID
            }
            return acc;
        }, {});
    
        // Update the `position` in `elements` with the correct values
        const syncedElements = forkedDoc.elements.map(el => {
            if (positionsById[el.data.id]) {
                return {
                    ...el,
                    position: positionsById[el.data.id], // Overwrite with the correct position
                };
            }
            return el; // Return unchanged if no position is mapped
        });
    
        return syncedElements;
    }
    
    function determineStepSize(min, max, method = 'linear', divisions = 100) {
        if (min >= max) {
            console.error('Invalid range: min must be less than max');
            return null;
        }
    
        const range = max - min;
    
        if (method === 'logarithmic') {
            const factor = Math.log10(range + 1); // Avoid log10(0)
            return (Math.pow(10, factor / divisions) - 1); // Base step size for log scaling
        } else if (method === 'linear') {
            return range / divisions;
        } else {
            console.error('Invalid method: Choose "logarithmic" or "linear"');
            return null;
        }
    }

    function clearparamContainerDivs(){
        // Directly select divs with IDs starting with "paramDivContainer"
        const matchingDivs = document.querySelectorAll('div[id^="paramDivContainer"]');

        // Remove each matching div
        matchingDivs.forEach(div => div.remove());
    }



});


