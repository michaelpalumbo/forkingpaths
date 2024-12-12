import audioNodes from '../src/modules/modules.json' assert { type: 'json'}


class ModularSynthProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.nodes = {}; // Store all nodes
        this.signalConnections = []; // Store connections between nodes
        // Initialize the output node with a fixed ID
        this.outputConnections = []; // Nodes explicitly connected to the audio output
        this.cvConnections = [ ] 
        this.port.onmessage = (event) => this.handleMessage(event.data);



    }

    getGraph(){
        const graph = {
            nodes: this.nodes,
            connections: this.signalConnections,
            outputConnections: this.outputConnections,
            cvConnections: this.cvConnections
        }
        return graph
    }
    handleMessage(data) {
        
        switch (data.cmd){

            case 'loadVersion':
                console.log(data.data)
            break;
            case 'addNode':
                // console.log(data.structure)
                if(data.structure === 'webAudioNodes'){
                    switch (data.data.module){
                    
                        case 'LFO':
                        case 'Oscillator':
                            this.nodes[data.data.moduleName] = {
                                node: 'Oscillator',
                                baseParams: {
                                    frequency: data.data.audioGraph.params.frequency,
                                    gain: 1,
                                },
                                modulatedParams: {
                                    // offsets for modulation
                                    frequency: 0, 
                                    gain: 0, 
                                },
                                output: new Float32Array(128),
                                phase: 0,
                                customWaveform: null,
                                type: data.data.audioGraph.params.type,
                                modulationTarget: null, // Target node or parameter for modulation
                                startTime: null, // Optional: Scheduled start time
                                stopTime: null,  // Optional: Scheduled stop time           
                
                            };
                        break
                        case 'Gain':
                        case 'ModGain':
                            this.nodes[data.data.moduleName] = {
                                node: 'Gain',
                                baseParams: {
                                    gain: data.data.audioGraph.params.gain || 1,
                                },
                                modulatedParams: {
                                    gain: 0, // Offset for modulation
                                },
                                output: new Float32Array(128),
                            }
    
                        break
    
                        default: 
                    }
                } else {
                    console.log('code for loading rnbo devices has not been written')
                }
                
            break

            case 'removeNode':
                delete this.nodes[data.data]

                // Remove all related connections

                // Filter `connections` to exclude those involving the deleted node
                this.signalConnections = this.signalConnections.filter(
                    (item) => item.source !== data.data && item.target !== data.data
                );
                // Filter `outputConnections` to exclude the deleted node
                this.outputConnections = this.outputConnections.filter(
                    (item) => item !== data.data
                );

                // Filter `cvConnections` to exclude those involving the deleted node
                this.cvConnections = this.cvConnections.filter(
                    (item) => item.source !== data.data && item.target !== data.data
                );
            break

            case 'connectNodes':
                this.signalConnections.push(data.data);
            break

            case 'connectToOutput':
                console.log(data.data, this.nodes[data.data.split('.')[0]])
                if (this.nodes[data.data.split('.')[0]] && !this.outputConnections.includes(data.data)) {
                    this.outputConnections.push(data.data);
                    console.log(this.outputConnections)
                }
            break

            case 'connectCV':
                // Add a modulation connection (source modulates target parameter)
                this.cvConnections.push({
                    source: data.data.source,
                    target: data.data.target,
                    param: data.data.param // The parameter to modulate
                });
            break;

            case 'disconnectNodes':
                console.log('before')
                
                console.log(data.data)
                
                if(data.data.target.includes('AudioDestination')){
                    console.log('this.outputConnections', this.outputConnections);
                    const index = this.outputConnections.findIndex(
                        (item) => 
 
                            item === data.data.source
                            // item.source === data.data.source && 
                            // item.target === data.data.target
                    );
                    console.log('found at index', index)
                    // Remove the object if it exists
                    if (index !== -1) {
                        this.outputConnections.splice(index, 1);
                    }
                } else if (data.connection === 'signal'){
                    console.log(this.signalConnections);
                } else if(data.connection === 'cv'){

                    console.log(this.cvConnections);

                }

                console.log('after')
                console.log(this.signalConnections);
                console.log(this.cvConnections);
                console.log(this.outputConnections);

                // console.log('before', this.signalConnections)

                // // Find the index of the connection
                // const index = this.signalConnections.findIndex(
                //     (item) => 
                //         item.source === data.data.source && 
                //         item.target === data.data.target
                // );

                // // Remove the object if it exists
                // if (index !== -1) {
                //     this.signalConnections.splice(index, 1);
                // }
                // console.log('after', this.signalConnections)

                // function removeFromArrays(arrays, connectionToRemove) {
                //     arrays.forEach((array) => {
                //         const index = array.findIndex((item) => {
                //             console.log(`Comparing item:`, item);
                //             console.log(`With connectionToRemove:`, connectionToRemove);
                
                //             const isSourceMatch = item.source === connectionToRemove.source;
                //             const isTargetMatch = item.target === connectionToRemove.target;
                
                //             console.log(`Comparison result:`, {
                //                 itemSource: item.source,
                //                 itemTarget: item.target,
                //                 connectionSource: connectionToRemove.source,
                //                 connectionTarget: connectionToRemove.target,
                //                 isSourceMatch,
                //                 isTargetMatch
                //             });
                
                //             return isSourceMatch && isTargetMatch;
                //         });
                
                //         if (index !== -1) {
                //             console.log(`Removing item at index ${index} from array:`, array[index]);
                //             array.splice(index, 1);
                //         }
                //     });
                // }

                // // Combine the arrays into a single array of arrays
                // const allConnections = [this.signalConnections, this.cvConnections, this.outputConnections];

                // // Remove the object from the relevant array
                // removeFromArrays(allConnections, data.data);


                
            break

            case 'paramChange':
                // this.nodes[data.data.parent][data.data.param] = data.data.value
                // update the baseParam (the value associated with the knob/control)
                const targetNode = this.nodes[data.data.parent];
                if (targetNode && targetNode.baseParams[data.data.param] !== undefined) {
                    const newValue = parseFloat(data.data.value); // Ensure the value is a number
                    if (!isNaN(newValue)) {
                        targetNode.baseParams[data.data.param] = newValue;
                    } else {
                        console.warn(`Invalid value for ${data.data.param}: ${data.data.value}`);
                    }
                } else {
                    console.warn(`Parameter ${data.data.param} not found for node ${data.data.parent}`);
                }
                break;

            break
            
            default: console.log(`no switch case exists for ${data.cmd}`)
        }
        
        /*
        if (cmd === 'addNode') {
            // Add a new node (e.g., oscillator, gain)
            this.nodes[id] = {
                node: 'Oscillator',
                type: 'sine',
                frequency: 220,
                detune: 0, 
                gain: 1,
                output: new Float32Array(128), // Example buffer for node output
                phase: 0, // For oscillators,
                customWaveform: null,
                modulationTarget: null, // Target node or parameter for modulation
                startTime: null, // Optional: Scheduled start time
                stopTime: null,  // Optional: Scheduled stop time           

            };

            console.log(`Node added: ${id} with type ${this.nodes[id].type}`);

        } else if (cmd === 'removeNode') {
            // Remove a node
            delete this.nodes[id];
        } else if (cmd === 'connectNodes') {
            // Add a connection between nodes
            this.signalConnections.push({ source: id, target: targetId });

            console.log(`Connected: ${id} -> ${targetId}`);
        } else if (cmd === 'disconnectNodes') {
            // Remove a connection
            this.signalConnections = this.signalConnections.filter(
                (conn) => !(conn.source === id && conn.target === targetId)
            );
        } 
        else if (cmd === 'connectToOutput') {
            // Connect a node directly to the audio output
            if (this.nodes[id] && !this.outputConnections.includes(id)) {
                this.outputConnections.push(id);
                console.log(`Node ${id} connected to output`);
            }
        } else if (cmd === 'disconnectFromOutput') {
            // Disconnect a node from the audio output
            this.outputConnections = this.outputConnections.filter((nodeId) => nodeId !== id);
            console.log(`Node ${id} disconnected from output`);
        }
        else if (cmd === 'updateNode') {
            // Update parameters for an existing node
            Object.assign(this.nodes[id], params);
            console.log(`Node updated: ${id} with params`, params);

        }
            */
        // console.log('nodes:', this.nodes)
        // console.log('Connections:', this.signalConnections)
        // console.log('outputConnections:', this.outputConnections)
    }

    process(inputs, outputs) {
        const output = outputs[0][0]; // Single-channel output for simplicity
        output.fill(0); // Start with silence


        // Step 1: Prepare buffers for all nodes
        const signalBuffers = {};
        for (const id in this.nodes) {
            signalBuffers[id] = new Float32Array(128); // Temporary storage for node output
        }

        // Step 2: Define a recursive function to process each node
        const visited = new Set();

        const processNode = (id) => {

            if (visited.has(id)) return; // Avoid re-processing the same node
            visited.add(id);

            const node = this.nodes[id];
            if (!node) return;

            // console.log(`Processing node: ${id}, ${node.node}`);

            // Sum inputs from connected nodes
            const inputBuffer = new Float32Array(128);
            const inputConnections = this.signalConnections.filter(conn => conn.target.split('.')[0] === id);

            for (const conn of inputConnections) {
                processNode(conn.source); // Process the source node first
                const sourceBuffer = signalBuffers[conn.source.split('.')[0]];
                if (!sourceBuffer) {
                    console.warn(`Source buffer for node ${conn.source.split('.')[0]} is undefined`);
                    continue; // Skip this modulation if the buffer is unavailable
                }
                for (let i = 0; i < inputBuffer.length; i++) {
                    inputBuffer[i] += sourceBuffer[i]; // Sum signals from inputs
                }
            }

            // Process Modulation Connections
            // const modulationConnections = this.signalConnections.filter(conn => conn.target === id && conn.param);
            const modulations = this.cvConnections.filter((conn) => conn.target.split('.')[0] === id);

            for (const conn of modulations) {
                if (!this.nodes[conn.source.split('.')[0]]) {
                    console.error(`Modulation source node ${conn.source.split('.')[0]} does not exist`);
                    continue; // Skip invalid connection
                }

                processNode(conn.source); // Process the source node first
                const sourceBuffer = signalBuffers[conn.source];

                if (!sourceBuffer) {
                    console.warn(`No signal buffer for modulation source: ${conn.source.split('.')[0]}`);
                    continue; // Skip invalid connections
                }
            
                // Modulate the specified parameter
                const modulationValue = sourceBuffer[0]; // Use the first sample for modulation


                const param = conn.param; // The parameter being modulated
                if (!isNaN(modulationValue) || modulationValue != undefined) {
                    const param = conn.param; // Parameter being modulated
                    if (node.modulatedParams[param] !== undefined) {
                        node.modulatedParams[param] += modulationValue; // Apply modulation
                    } else {
                        console.warn(`Parameter ${param} not found for node ${id}`);
                    }
                } else {
                    console.warn(`Invalid modulation value for ${id}:`, modulationValue);
                    continue
                }
            }
            
            // Dynamically combine baseParams and modulatedParams for each parameter during processing
            const getEffectiveParam = (node, param) => {
                const base = node.baseParams[param] || 0;
                const modulated = node.modulatedParams[param] || 0;
                const result = base + modulated;
            
                // Ensure result is a valid number
                if (typeof result !== 'number' || isNaN(result)) {
                    console.warn(`Invalid value for parameter ${param}:`, result);
                    return 0; // Default to 0 if invalid
                }
            
                return result;
            };

            // Process this node
            if (node.node === 'Oscillator') {
                const effectiveFrequency = getEffectiveParam(node, 'frequency');
                // const formattedFrequency = parseFloat(effectiveFrequency.toFixed(2));
                const effectiveGain = getEffectiveParam(node, 'gain');

                for (let i = 0; i < signalBuffers[id].length; i++) {
                    node.phase += effectiveFrequency / sampleRate;
                    if (node.phase >= 1) node.phase -= 1;
                    signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                }
            } else if (node.node === 'Gain') {
                const effectiveGain = getEffectiveParam(node, 'gain'); // Combines base and modulated gain

                for (let i = 0; i < signalBuffers[id].length; i++) {
                    signalBuffers[id][i] = inputBuffer[i] * effectiveGain;
                }
            } else if (node.node === 'Delay') {
                if (!node.delayBuffer) {
                    node.delayBuffer = new Float32Array(44100); // 1-second delay buffer
                    node.delayIndex = 0;
                }
                const delaySamples = Math.min(node.delayTime * sampleRate, node.delayBuffer.length);
                for (let i = 0; i < signalBuffers[id].length; i++) {
                    const delayedSample = node.delayBuffer[(node.delayIndex - delaySamples + node.delayBuffer.length) % node.delayBuffer.length];
                    signalBuffers[id][i] = inputBuffer[i] + delayedSample * node.feedback;
                    node.delayBuffer[node.delayIndex] = signalBuffers[id][i];
                    node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                }
            }

            // Add processed signal to the node's output buffer
            for (let i = 0; i < signalBuffers[id].length; i++) {
                signalBuffers[id][i] += inputBuffer[i];
            }


            // Reset modulated parameters for the next frame
            for (const param in node.modulatedParams) {
                node.modulatedParams[param] = 0;
            }
        };

        // Step 3: Process all nodes connected to the output
        for (const id of this.outputConnections) {
            processNode(id.split('.')[0]); // process the node first

            // Sum the output of directly connected nodes
            const nodeBuffer = signalBuffers[id.split('.')[0]];
            if (nodeBuffer) {
                for (let i = 0; i < output.length; i++) {
                    output[i] += nodeBuffer[i]; // Sum signals from all connected nodes
                }
            }
        }
        
        // Normalize the mixed signal
        const numConnections = this.outputConnections.length;
        // console.log(this.outputConnections)
        if (numConnections > 0) {
            for (let i = 0; i < output.length; i++) {
                output[i] /= numConnections; // Normalize by the number of contributing nodes
            }
        }

        // Apply an overall gain to limit output signal
        const overallGain = 0.9; // Adjust as needed
        for (let i = 0; i < output.length; i++) {
            output[i] *= overallGain; // Scale the output
        }
        /*
        // Generate output for directly connected nodes
        for (const id of this.outputConnections) {
            const node = this.nodes[id];
            if (node && node.node === 'Oscillator') {
                for (let i = 0; i < output.length; i++) {
                    node.phase += node.frequency / sampleRate;
                    if (node.phase >= 1) node.phase -= 1;
                    output[i] += Math.sin(2 * Math.PI * node.phase) * node.gain;
                }
            }
        }

        // Propagate signals through connections
        for (const conn of this.signalConnections) {
            const sourceNode = this.nodes[conn.source];
            const targetNode = this.nodes[conn.target];

            if (sourceNode && targetNode) {
                for (let i = 0; i < targetNode.output.length; i++) {
                    targetNode.output[i] += sourceNode.output[i] * sourceNode.gain;
                }
            }
        }
        */
        // // Process each node
        // for (const [id, node] of Object.entries(this.nodes)) {
        //     if (node.node === 'Oscillator') {
                
        //         // Generate sine wave output
        //         for (let i = 0; i < node.output.length; i++) {
        //             // Increment the phase based on frequency
        //             node.phase += node.frequency / sampleRate;
        //             // Wrap phase to stay within 0 to 1
        //             if (node.phase >= 1) node.phase -= 1;
            
        //             // Calculate the sine wave value for the current sample
        //             node.output[i] = Math.sin(2 * Math.PI * node.phase) * node.gain;


        //         }
        //     }
        //     // if (node.node === 'Oscillator') {
        //     //     // Generate oscillator output
        //     //     for (let i = 0; i < node.output.length; i++) {
        //     //         node.phase += (node.frequency * Math.pow(2, node.detune / 1200)) / sampleRate;
        //     //         if (node.phase > 1) node.phase -= 1;
        //     //         node.output[i] = Math.sin(2 * Math.PI * node.phase);

        //     //         if (node.modulationTarget) {
        //     //             const targetNode = this.nodes[node.modulationTarget.id];
        //     //             if (targetNode) {
        //     //                 targetNode.frequency += node.output[0] * node.gain; // Example modulation
        //     //             }
        //     //         }
        //     //     }
        //     // }
        // }

        // Propagate signals through connections
        // for (const conn of this.signalConnections) {
        //     const sourceNode = this.nodes[conn.source];
        //     const targetNode = this.nodes[conn.target];

        //     if (sourceNode && targetNode) {
        //         // Add sourceNode's output to targetNode's input
        //         for (let i = 0; i < targetNode.output.length; i++) {
        //             targetNode.output[i] += sourceNode.output[i] * sourceNode.gain;
        //         }
        //     }
        // }

        // // Mix signals reaching the "outputNode"
        // const outputNode = this.nodes['outputNode'];
        // if (outputNode) {
        //     for (let i = 0; i < output.length; i++) {
        //         output[i] = outputNode.output[i];
        //     }
        // }
        

        return true; // Keep the processor alive
    }
}

registerProcessor('modular-synth-processor', ModularSynthProcessor);
