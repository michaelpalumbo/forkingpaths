import { parse } from 'marked';
import audioNodes from '../src/modules/modules.json' assert { type: 'json'}


class ModularSynthProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        console.log('Sample rate:', sampleRate); // Logs the sample rate of the audio context

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

    audioNodeBuilder(type, moduleName, params){
        switch (type){
                
            case 'LFO':
            case 'Oscillator':
                this.nodes[moduleName] = {
                    node: 'Oscillator',
                    baseParams: {
                        frequency: parseFloat(params.frequency),
                        gain: parseFloat(1),
                        freqAttenuverter: parseFloat(params.freqAttenuverter),
                        type: params.type
                    },
                    modulatedParams: {
                        // offsets for modulation
                        frequency: 0, 
                        gain: 0, 
                    },
                    output: new Float32Array(128),
                    phase: 0,
                    customWaveform: null,
                    type: params.type,
                    modulationTarget: null, // Target node or parameter for modulation
                    startTime: null, // Optional: Scheduled start time
                    stopTime: null,  // Optional: Scheduled stop time           
    
                };

            break
            case 'Gain':
            case 'ModGain':
                this.nodes[moduleName] = {
                    node: 'Gain',
                    baseParams: {
                        gain: parseFloat(params.gain) || 1,
                    },
                    modulatedParams: {
                        gain: 0, // Offset for modulation
                    },
                    output: new Float32Array(128),
                }

            break

            case 'Delay':
                this.nodes[moduleName] = {
                    node: 'Delay',
                    baseParams: {
                        delayTime: parseFloat(params.delayTime) || 500,
                        timeAttenuverter: parseFloat(params.timeAttenuverter) || 100,
                    },
                    modulatedParams: {
                        delayTime: 0, // Offset for modulation
                    },
                    output: new Float32Array(128),
                }
            break;
            default: 
        }


    } 

    cableBuilder(){

    }
    
    handleMessage(msg) {
        
        switch (msg.cmd){
            case 'clearGraph':
                // clear the audioWorklet's own graph:
                this.nodes = {};
                this.signalConnections = [];
                this.outputConnections = [];
                this.cvConnections = [] 
            break

            case 'loadVersion':
                
                const synthGraph = msg.data

                // clear the audioWorklet's own graph:
                this.nodes = {};
                this.signalConnections = [];
                this.outputConnections = [];
                this.cvConnections = [] 

                // repopulate given automerge version of synth graph
                Object.keys(synthGraph.modules).forEach((moduleID)=>{
                    const module = synthGraph.modules[moduleID]
                    this.audioNodeBuilder(module.type, moduleID, module.params)
                })

                synthGraph.connections.forEach((cable)=>{
                    if(cable.target.includes('AudioDestination')){
                        
                        this.outputConnections.push(cable.source);
                    } else if (cable.target.split('.')[1] === 'IN'){
                        this.signalConnections.push(cable);
                        // handle direct node inputs
                    } else {
                        // handle CV modulation inputs
                        // Add a modulation connection (source modulates target parameter)
                        this.cvConnections.push(cable);
                    }
                })
            break;
            case 'addNode':
                // console.log(msg.structure)
                if(msg.structure === 'webAudioNodes'){
                    
                    this.audioNodeBuilder(msg.data.module, msg.data.moduleName, msg.data.audioGraph.params)
   
                } else {
                    console.log('code for loading rnbo devices has not been written')
                    // todo: run this in this.rnboDeviceBuilder()
                    // todo reason: similar to audioNodeBuilder(), we need to be able to both build devices through addNode, and also through case 'loadVersion'
                }
                
            break

            case 'removeNode':
                delete this.nodes[msg.data]

                // Remove all related connections

                // Filter `connections` to exclude those involving the deleted node
                this.signalConnections = this.signalConnections.filter(
                    (item) => item.source.split('.')[0] !== msg.data && item.target.split('.')[0] !== msg.data
                );
                // Filter `outputConnections` to exclude the deleted node
                this.outputConnections = this.outputConnections.filter(
                    (item) => item !== msg.data
                );

                // Filter `cvConnections` to exclude those involving the deleted node
                this.cvConnections = this.cvConnections.filter(
                    (item) => item.source.split('.')[0] !== msg.data && item.target.split('.')[0] !== msg.data
                );
            break

            case 'addCable':
                

                if(msg.data.target.includes('AudioDestination')){
                    this.outputConnections.push(msg.data.source);
                } else if (msg.data.target.split('.')[1] === 'IN'){
                    this.signalConnections.push(msg.data);
                } else {
                    msg.data.param = msg.data.target.split('.')[1] // The parameter to modulate
                    this.cvConnections.push(msg.data);
                }
            break

            case 'connectToOutput':
                if (this.nodes[msg.data.split('.')[0]] && !this.outputConnections.includes(msg.data)) {
                    
                }
            break

            case 'connectCV':
                // Add a modulation connection (source modulates target parameter)
                this.cvConnections.push({
                    source: msg.data.source,
                    target: msg.data.target,
                    param: msg.data.param // The parameter to modulate
                });
            break;

            case 'removeCable':
                console.log(msg.data)
                if(msg.data.target.includes('AudioDestination')){
                    console.log('ad', msg.data.target, this.outputConnections)
                    const index = this.outputConnections.findIndex(
                        (item) => 
 
                            item === msg.data.source
                            // item.source === msg.data.source && 
                            // item.target === msg.data.target
                    );
                    // Remove the object if it exists
                    if (index !== -1) {
                        this.outputConnections.splice(index, 1);
                    }
                } else if (msg.data.target.split('.')[1] === 'IN'){
                    const index = this.signalConnections.findIndex(
                        (item) => 
 
                            // item === msg.data.source
                            item.source === msg.data.source && 
                            item.target === msg.data.target
                    );

                    // Remove the object if it exists
                    if (index !== -1) {
                        this.signalConnections.splice(index, 1);
                    }
                } else{
                    const index = this.cvConnections.findIndex(
                        (item) => 
 
                            // item === msg.data.source
                            item.source === msg.data.source && 
                            item.target === msg.data.target
                    );
                    console.log(msg.data, this.cvConnections)
                    // Remove the object if it exists
                    if (index !== -1) {
                        this.cvConnections.splice(index, 1);
                    }

                }         
            break

            case 'paramChange':


                // this.nodes[msg.data.parent][msg.data.param] = msg.data.value
                // update the baseParam (the value associated with the knob/control)
                const targetNode = this.nodes[msg.data.parent];
                console.log(targetNode, msg.data.value)
                if (targetNode && targetNode.baseParams[msg.data.param] !== undefined) {
                    const newValue = parseFloat(msg.data.value); // Ensure the value is a number
                    if (!isNaN(newValue)) {
                        targetNode.baseParams[msg.data.param] = newValue;
                    } else {
                        targetNode.baseParams[msg.data.param] = msg.data.value;
                        // console.warn(`Invalid value for ${msg.data.param}: ${msg.data.value}`);
                    }
                } else {
                    
                    console.warn(`Parameter ${msg.data.param} not found for node ${msg.data.parent}`);
                }
                break;

            break
            
            default: console.log(`no switch case exists for ${msg.cmd}`)
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
        } else if (cmd === 'addCable') {
            // Add a connection between nodes
            this.signalConnections.push({ source: id, target: targetId });

            console.log(`Connected: ${id} -> ${targetId}`);
        } else if (cmd === 'removeCable') {
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
                processNode(conn.source.split('.')[0]); // Process the source node first
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

                processNode(conn.source.split('.')[0]); // Process the source node first
                const sourceBuffer = signalBuffers[conn.source.split('.')[0]];

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
            const getEffectiveParam = (node, param, attenuverter) => {
                const base = node.baseParams[param] || 0;
                let modulated = node.modulatedParams[param] || 0;
                // multiply modulator param by attenuverter value
                if(attenuverter){
                    modulated = modulated * attenuverter
                }
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
                const effectiveFrequency = getEffectiveParam(node, 'frequency', node.baseParams['freqAttenuverter']);
                // const formattedFrequency = parseFloat(effectiveFrequency.toFixed(2));
                const effectiveGain = getEffectiveParam(node, 'gain');
                
                for (let i = 0; i < signalBuffers[id].length; i++) {
                    node.phase += effectiveFrequency/ sampleRate;
                    if (node.phase >= 1) node.phase -= 1;
                    // signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                    // Select the waveform based on node.baseParams['waveform']
                    switch (node.baseParams['type']) {
                   
                        case 'sine':
                            signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                            break;
                        case 'square':
                            signalBuffers[id][i] = (node.phase < 0.5 ? 1 : -1) * effectiveGain * Math.SQRT1_2; // Scale by 1/sqrt(2)
                            break;
                        case 'sawtooth':
                            signalBuffers[id][i] = (2 * node.phase - 1) * effectiveGain; // Scale by sqrt(1/3)
                            break;
                        case 'triangle':
                            signalBuffers[id][i] = (node.phase < 0.5 ? 4 * node.phase - 1 : 3 - 4 * node.phase) * effectiveGain; // Scale by sqrt(1/3)
                            break;
                    
                        
                        default:
                            // Fallback to sine wave if the waveform is undefined or unrecognized
                            signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                    }
                }
            } else if (node.node === 'Gain') {
                const effectiveGain = getEffectiveParam(node, 'gain'); // Combines base and modulated gain

                for (let i = 0; i < signalBuffers[id].length; i++) {
                    signalBuffers[id][i] = inputBuffer[i] * effectiveGain;
                }
            } else if (node.node === 'Delay') {
                if (!node.delayBuffer) {
                    const effectiveDelayTime = getEffectiveParam(node, 'delayTime', node.baseParams['timeAttenuverter']);
                    const delayTime = Math.round(effectiveDelayTime * sampleRate / 1000)
                    node.delayBuffer = new Float32Array(sampleRate); // 1-second delay buffer
                    node.delayIndex = 0;
                }
                const delaySamples = Math.min(getEffectiveParam(node, 'delayTime', node.baseParams['timeAttenuverter']) * sampleRate, node.delayBuffer.length);
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
