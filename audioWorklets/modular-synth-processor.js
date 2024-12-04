import audioNodes from '../src/modules/modules.json' assert { type: 'json'}


class ModularSynthProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.nodes = {}; // Store all nodes
        this.connections = []; // Store connections between nodes
        // Initialize the output node with a fixed ID
        this.outputConnections = []; // Nodes explicitly connected to the audio output
        this.cvConnections = [ ] 
        this.port.onmessage = (event) => this.handleMessage(event.data);



    }

    handleMessage(data) {
        console.log(data.data)
        switch (data.cmd){
            case 'addNode':
                
                switch (data.data.module){
                    
                    case 'LFO':
                    case 'Oscillator':
                        this.nodes[data.data.moduleName] = {
                            node: 'Oscillator',
                            type: data.data.audioGraph.params.type,
                            frequency: data.data.audioGraph.params.frequency,
                            detune: data.data.audioGraph.params.detune, 
                            gain: 1,
                            output: new Float32Array(128), // Example buffer for node output
                            phase: 0, // For oscillators,
                            customWaveform: null,
                            modulationTarget: null, // Target node or parameter for modulation
                            startTime: null, // Optional: Scheduled start time
                            stopTime: null,  // Optional: Scheduled stop time           
            
                        };
                    break
                    case 'Gain':
                    case 'ModGain':
                        this.nodes[data.data.moduleName] = {
                            node: 'Gain',
                            gain: data.data.audioGraph.params.gain || 1, // Default gain of 1
                            output: new Float32Array(128), // Buffer for node output
                        }

                    break
                }
            break

            case 'removeNode':
                delete this.nodes[data.data]
            break

            case 'connectNodes':
                this.connections.push(data.data);
            break

            case 'connectToOutput':
                console.log(this.nodes)
                if (this.nodes[data.data] && !this.outputConnections.includes(data.data)) {
                    this.outputConnections.push(data.data);
                    console.log(`Node ${data.data} connected to output`);
                    
                }
            break

            case 'connectCV':
                // Add a modulation connection (source modulates target parameter)
                this.cvConnections.push({
                    source: data.data.source,
                    target: data.data.target,
                    param: data.data.param // The parameter to modulate
                });
                console.log(`Modulation connection added: ${data.data.source} -> ${data.data.target}.${data.data.param}`);
            break;

            case 'paramChange':
                this.nodes[data.data.parent][data.data.param] = data.data.value

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
            this.connections.push({ source: id, target: targetId });

            console.log(`Connected: ${id} -> ${targetId}`);
        } else if (cmd === 'disconnectNodes') {
            // Remove a connection
            this.connections = this.connections.filter(
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
        // console.log('Connections:', this.connections)
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
            const inputConnections = this.connections.filter(conn => conn.target === id);

            for (const conn of inputConnections) {
                processNode(conn.source); // Process the source node first
                const sourceBuffer = signalBuffers[conn.source];
                if (!sourceBuffer) {
                    console.warn(`Source buffer for node ${conn.source} is undefined`);
                    continue; // Skip this modulation if the buffer is unavailable
                }
                for (let i = 0; i < inputBuffer.length; i++) {
                    inputBuffer[i] += sourceBuffer[i]; // Sum signals from inputs
                }
            }

            // Process Modulation Connections
            // const modulationConnections = this.connections.filter(conn => conn.target === id && conn.param);
            const modulations = this.cvConnections.filter((conn) => conn.target === id);

            for (const conn of modulations) {
                if (!this.nodes[conn.source]) {
                    console.error(`Modulation source node ${conn.source} does not exist`);
                    continue; // Skip invalid connection
                }

                processNode(conn.source); // Process the source node first
                const sourceBuffer = signalBuffers[conn.source];
                // Modulate the specified parameter
                const modulationValue = sourceBuffer[0]; // Use the first sample for modulation
                if (modulationValue !== undefined) {
                    node[conn.param] += modulationValue; // Apply modulation
                }
            }
            
            // Process this node
            if (node.node === 'Oscillator') {
                for (let i = 0; i < signalBuffers[id].length; i++) {
                    node.phase += node.frequency / sampleRate;
                    if (node.phase >= 1) node.phase -= 1;
                    signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * node.gain;
                    // console.log('osc', signalBuffers[id[i]])
                }
            } else if (node.node === 'Gain') {
                for (let i = 0; i < signalBuffers[id].length; i++) {
                    signalBuffers[id][i] = inputBuffer[i] * node.gain;
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
        };

        // Step 3: Process all nodes connected to the output
        for (const id of this.outputConnections) {
            processNode(id); // process the node first

            // Sum the output of directly connected nodes
            const nodeBuffer = signalBuffers[id];
            if (nodeBuffer) {
                for (let i = 0; i < output.length; i++) {
                    output[i] += nodeBuffer[i]; // Sum signals from all connected nodes
                }
            }
        }
        
        // Normalize the mixed signal
        const numConnections = this.outputConnections.length;
        if (numConnections > 0) {
            for (let i = 0; i < output.length; i++) {
                output[i] /= numConnections; // Normalize by the number of contributing nodes
            }
        }

        // Apply an overall gain to limit output signal
        const overallGain = 0.8; // Adjust as needed
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
        for (const conn of this.connections) {
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
        // for (const conn of this.connections) {
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
