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
        containerDiv.style.width = `${config.UI.knob.baseKnobSize}px`;
        containerDiv.style.height = `${config.UI.knob.baseKnobSize}px`;
        containerDiv.id = `paramDivContainer_${param.data.id}`


        // Create the label element
        const labelDiv = document.createElement('div');
        labelDiv.innerText = param.data.label || `Knob`; // Use parameter label or default
        labelDiv.style.textAlign = config.UI.knob.labelAlign;
        labelDiv.style.marginBottom = config.UI.knob.labelMarginBottom;
        labelDiv.style.marginTop = config.UI.knob.labelMarginTop || '10px';
        labelDiv.style.fontSize = config.UI.knob.labelFontSize;
        labelDiv.style.color = config.UI.knob.labelColour;
        
        // add menu or knob
        let paramDiv
        if(param.data.ui === 'menu'){
            paramDiv = document.createElement('select');
            // store contextual info about the param
            paramDiv.id = `paramControl_parent:${parentNodeID}_param:${param.data.label}`
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label

            paramDiv.style.width = '180%';
            paramDiv.style.padding = '5px';
            paramDiv.style.borderRadius = '4px';
            paramDiv.style.border = '3px solid black';
            paramDiv.style.fontSize = '20px';

            // New custom styling:
            paramDiv.style.backgroundColor = '#f0f0f0'; // Set the background color
            paramDiv.style.marginTop = '10px';          // Move it down by 10px (adjust as needed)
            paramDiv.style.color = '#333';              // Set the font color

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
            paramDiv.id = `paramControl_parent:${parentNodeID}_param:${param.data.label}`
            paramDiv.dataset.parentNodeID = parentNodeID
            paramDiv.dataset.param = param.data.label
            // paramDiv.dataset.description = param.data.description
            
            paramDiv.type = 'text';
            paramDiv.value = loadedValue || param.data.default || param.data.value || 50; // Initial value
            // paramDiv.style.position = 'absolute';
            paramDiv.style.width = `100%`;
            paramDiv.style.height = `100%`;
            // paramDiv.id = `knob_${param.data.id}`
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)
        }
        
        paramDiv.className = '.paramOverlay'
        // paramDiv.style.zIndex = '1000';
        // paramDiv.style.pointerEvents = 'auto'; // Ensure interactions are enabled



        // Create a small wrapper div for each knob
        const knobWrapper = document.createElement('div');
        knobWrapper.style.position = 'relative';
        knobWrapper.style.width = '100%';
        knobWrapper.style.height = '100%';


        // Append the knob into this wrapper
        knobWrapper.appendChild(paramDiv);

        // Append the input to the container
        containerDiv.appendChild(labelDiv);
        containerDiv.appendChild(knobWrapper);
        document.body.appendChild(containerDiv);
        

        if (param.data.ui === 'knob'){
            let lastValue = null; // use this to filter out repeated values

            let unit = 'float'

            let stepSize = determineStepSize(param.data.min, param.data.max, 'logarithmic', 100 )

            if(param.data.units === 'steps' || param.data.units === 'BPM'){
                unit = 'integer'
                if(stepSize < 1) stepSize++
                stepSize = parseInt(stepSize, 10)
            }
            
        

            // Initialize jQuery Knob on the input
            $(paramDiv).knob({
                min: param.data.min || param.data.sliderMin || 0,
                max: param.data.max || param.data.sliderMax || 100,
                step: stepSize,
                fgColor: "#00aaff",
                bgColor: "#e6e6e6",
                inputColor: "#333",
                thickness: config.UI.knob.thickness,
                angleArc: 270,
                angleOffset: -135,
                width: config.UI.knob.baseKnobSize,          // Set width of the knob
                height: config.UI.knob.baseKnobSize,  
                // change: function (value) {
                //     $(this.$).trigger('knobChange', [parentNodeID, param.data.label, value]);
                // },
                draw: function() {
                    $(paramDiv).css('font-size', '11pt');
                },
                change: (value) => {
                    
                    let newValue = Math.round(value * 100) / 100
                    if(unit === 'integer'){
                        
                        newValue = parseInt(newValue, 10)
                    }
                    // filter out repeated values
                    if (newValue !== lastValue) {
                        lastValue = newValue;
                        // set params in audio graph:
                        paramChange(parentNodeID, param.data.label, newValue)
                    }
                },
                release: (value) => {
                    // console.log(`gesture ended. see \/\/! comment in .knob().release() in createFloatingOverlay for how to use this`);
                    //! could use this to get the start and end of a knob gesture and store it as an array in the history sequence
                },

            });

            // fix input text to centre of knob
            Object.assign(paramDiv.style, {
                position: 'absolute',
                top: '15%',
                left: '125%',
                transform: 'translate(-50%, -50%)',
                width: '40%',
                height: 'auto',
                textAlign: 'center',
                fontSize: '14px',
                pointerEvents: 'none',
                background: 'transparent',
                border: 'none'
            });
        } else if (param.data.ui === 'menu'){
            // ignore
        } else {
            console.warn('missing param ui type in param.data.ui', param.data)

        }

        // Create a virtual element for Floating UI
        let virtualElement = {
            getBoundingClientRect: () => {
                const childNode = synthGraphCytoscape.getElementById(param.data.id);
                const parentNode = synthGraphCytoscape.getElementById(parentNodeID)
                const parentData = parentNode.data();

                const parentParams = parentData?.moduleSpec?.paramNames || [];
                if (childNode && parentParams.length > 0) {
                    const containerRect = synthGraphCytoscape.container().getBoundingClientRect();
                    const zoom = synthGraphCytoscape.zoom();
                    const pan = synthGraphCytoscape.pan();
                    const parentNodeHeight = parentNode.renderedBoundingBox().h; // Get height from style
                    
                    // Get parent node's position (base for calculations)
                    const parentPos = parentNode.position();

                    // Calculate knob dimensions
                    const knobWidth = config.UI.knob.baseKnobSize; // Example knob width (update as needed)
                    const knobHeight = config.UI.knob.baseKnobSize; // Example knob height (update as needed)

                    // Default (even layout or regular position)
                    return {
                        width: config.UI.knob.baseKnobSize,
                        height: config.UI.knob.baseKnobSize,
                        top: containerRect.top + childNode.position().y,
                        left: containerRect.left + childNode.position().x,
                        right: containerRect.left + childNode.position().x + config.UI.knob.baseKnobSize,
                        bottom: containerRect.top + childNode.position().y + config.UI.knob.baseKnobSize,
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
        // synthGraphCytoscape.on('pan zoom position', updateKnobPositionAndScale);

        return { containerDiv, removeKnob } ;
    }


    // dynamically update all floating ui elements' position and scale 
    function updateKnobPositionAndScale(cmd, node) {
        const zoom = synthGraphCytoscape.zoom();
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
                            const scaledSize = config.UI.knob.baseKnobSize / zoom;
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
                        const scaledSize = config.UI.knob.baseKnobSize / zoom;
                        containerDiv.style.width = `${scaledSize}px`;
                        containerDiv.style.height = `${scaledSize}px`;
                    });
                })
            break
        }
        
    }