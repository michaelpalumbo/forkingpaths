
import cloneDeep from 'lodash/cloneDeep';

class ModularSynthProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // console.log('Sample rate:', sampleRate); // Logs the sample rate of the audio context
        this.currentState = {
            nodes: {}, // store all nodes
            signalConnections: [], // Array of signal connections
            outputConnections: [], // Array of output connections
            cvConnections: [] 
}
        // The next synth graph state (initialized as null)
        this.nextState = {
            nodes: {},
            signalConnections: [],
            outputConnections: [],
            cvConnections: [] 
        };
        // this.nodes = {}; // Store all nodes
        this.signalConnections = []; // Store connections between nodes
        // Initialize the output node with a fixed ID
        this.outputConnections = []; // Nodes explicitly connected to the audio output
        this.cvConnections = [ ] 
        this.port.onmessage = (event) => this.handleMessage(event.data);
      
        // Crossfade properties
        this.crossfadeInProgress = false; // Flag to indicate if a crossfade is happening
        this.crossfadeProgress = 0; // Crossfade interpolation progress (0 to 1)
        this.crossfadeStep = 0; // Increment step for crossfade progress

        const crossfadeDurationSeconds = 0.03; // Adjust as needed
        console.log(`audiograph crossfade set to ${crossfadeDurationSeconds} seconds`)
        this.crossfadeStep = 1 / ((sampleRate / 128) * crossfadeDurationSeconds); // Calculate step size
        this.outputVolume = 0.5


        this.signalBuffers = {}; // Initialize an empty object for signal buffers


    }


    getSampleRate(){
        return sampleRate
    }
    // getGraph(){
    //     const graph = {
    //         nodes: this.currentState.nodes,
    //         connections: this.currentState.signalConnections,
    //         outputConnections: this.outputConnections,
    //         cvConnections: this.cvConnections
    //     }
    //     return graph
    // }

    audioNodeBuilder(type, moduleName, params, loadState){
        switch (type){
                
            case 'LFO':
            case 'Oscillator':
                let osc = {
                    node: 'Oscillator',
                    baseParams: {
                        frequency: parseFloat(params.frequency),
                        gain: parseFloat(1),
                        "freq cv +/-": parseFloat(params["freq cv +/-"]),
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
                if(loadState){
                    this.nextState.nodes[moduleName] = osc
                } else {
                    this.currentState.nodes[moduleName] = osc
                }
                
            break
            case 'Gain':
            case 'ModGain':
                let gain = {
                    node: 'Gain',
                    baseParams: {
                        gain: parseFloat(params.gain) || 1,
                    },
                    modulatedParams: {
                        gain: 0, // Offset for modulation
                    },
                    output: new Float32Array(128),
                }
                if(loadState){
                    this.nextState.nodes[moduleName] = gain
                } else {
                    this.currentState.nodes[moduleName] = gain
                }

            break

            case 'Delay':
                let delay = {
                    node: 'Delay',
                    baseParams: {
                        delayTime: parseFloat(params.delayTime) || 500,
                        'time cv +/-': parseFloat(params['time cv +/-']) || 100,
                        feedback: 0.5,
                        wetMix: 0.4
                    },
                    connections: {
                        feedback: null, // Will store a Web Audio GainNode for feedback
                    },
                    modulatedParams: {
                        delayTime: 0, // Offset for modulation
                    },
                    output: new Float32Array(128),
                }

                if(loadState){
                    this.nextState.nodes[moduleName] = delay
                } else {
                    this.currentState.nodes[moduleName] = delay
                }
            break;

            case 'BiquadFilter':
                let biquad = {
                    node: 'BiquadFilter',
                    baseParams: {
                        frequency: parseFloat(params.frequency) || 350,
                        "freq cv +/-": parseFloat(params["freq cv +/-"]),
                        detune: parseFloat(params.detune) || 0,
                        Q: parseFloat(params.Q) || 1,
                        "Q cv +/-": parseFloat(params["Q cv +/-"]),
                        gain: parseFloat(params.gain) || 0,
                        type: params.type
                    },
                    modulatedParams: {
                        frequency: 0,
                        detune: 0,
                        Q: 0,
                        gain: 0
                    },
                    output: new Float32Array(128),
                }
                if(loadState){
                    this.nextState.nodes[moduleName] = biquad
                } else {
                    this.currentState.nodes[moduleName] = biquad
                }
            break

            case 'feedbackDelayNode':
                let feedbackDelayNode = {
                    node: 'feedbackDelayNode',
                    output: new Float32Array(128) // Fixed output buffer for block size
                }

                if(loadState){
                    this.nextState.nodes[moduleName] = feedbackDelayNode
                    // console.log(this.nextState.nodes[moduleName])
                } else {
                    this.currentState.nodes[moduleName] = feedbackDelayNode
                    // console.log(this.currentState.nodes[moduleName])
                }
                // console.log(feedbackDelayNode)

                

                
            break;

            default: 
        }

        
    } 

    cableBuilder(){

    }
    
 

    handleMessage(msg) {
        
        switch (msg.cmd){
            case 'setOutputVolume':
                this.outputVolume = msg.data
            break
            
            case 'clearGraph':
                // clear the audioWorklet's own graph:
                this.currentState.nodes = {};
                this.currentState.signalConnections = [];
                this.currentState.outputConnections = [];
                this.currentState.cvConnections = [] 
            break

            case 'loadVersion':
                
                const synthGraph = msg.data

                // clear the audioWorklet's own graph:
                // this.nodes = {};
                // this.signalConnections = [];
                // this.outputConnections = [];
                // this.cvConnections = [] 
                if (this.crossfadeInProgress) return; // Prevent loading mid-crossfade
    
                this.nextState = {
                    nodes: {},
                    signalConnections: [],
                    outputConnections: [],
                    cvConnections: [] 
                };


                // repopulate given automerge version of synth graph
                Object.keys(synthGraph.modules).forEach((moduleID)=>{
                    const module = synthGraph.modules[moduleID]
                    let moduleParams = null // set to null in case the node is a feedbackDelayNode
                    if(module.params){
                        moduleParams = module.params // node is a webAudioNode and we want its params
                    }
                    this.audioNodeBuilder(module.type, moduleID, module.params, 'loadstate')
                })

                synthGraph.connections.forEach((cable)=>{
                    if(cable.target.includes('AudioDestination')){
                        
                        this.nextState.outputConnections.push(cable.source);
                    } else if (cable.target.split('.')[1] === 'IN'){
                        this.nextState.signalConnections.push(cable);
                        // handle direct node inputs
                    } else {
                        // handle CV modulation inputs
                        // Add a modulation connection (source modulates target parameter)
                        cable.param = cable.target.split('.')[1] // The parameter to modulate

                        this.nextState.cvConnections.push(cable);
                    }
                })


                // Begin crossfade
                this.crossfadeInProgress = true;
                this.crossfadeProgress = 0;

            break;
            case 'addNode':
                if(msg.structure === 'webAudioNodes'){
                    this.audioNodeBuilder(msg.data.module, msg.data.moduleName, msg.data.audioGraph.params)
   
                } else if (msg.structure === 'feedbackDelayNode'){
                    this.audioNodeBuilder('feedbackDelayNode', msg.data)
                    
                } else {
                    console.log('code for loading rnbo devices has not been written')
                    // todo: run this in this.rnboDeviceBuilder()
                    // todo reason: similar to audioNodeBuilder(), we need to be able to both build devices through addNode, and also through case 'loadVersion'
                }
                
            break

            case 'removeNode':
                delete this.currentState.nodes[msg.data]

                // Remove all related connections

                // Filter `connections` to exclude those involving the deleted node
                this.currentState.signalConnections = this.currentState.signalConnections.filter(
                    (item) => item.source.split('.')[0] !== msg.data && item.target.split('.')[0] !== msg.data
                );
                // Filter `outputConnections` to exclude the deleted node
                this.currentState.outputConnections = this.currentState.outputConnections.filter(
                    (item) => item !== msg.data
                );

                // Filter `cvConnections` to exclude those involving the deleted node
                this.currentState.cvConnections = this.currentState.cvConnections.filter(
                    (item) => item.source.split('.')[0] !== msg.data && item.target.split('.')[0] !== msg.data
                );
            break

            case 'addCable':
                
                console.log(msg.data)
                if(msg.data.target.includes('AudioDestination')){
                    this.currentState.outputConnections.push(msg.data.source);
                } else if (msg.data.target.split('.')[1] === 'IN'){
                    this.currentState.signalConnections.push(msg.data);
                } else {
                    msg.data.param = msg.data.target.split('.')[1] // The parameter to modulate
                    this.currentState.cvConnections.push(msg.data);
                }
            break

            case 'connectToOutput':
                if (this.currentState.nodes[msg.data.split('.')[0]] && !this.currentState.outputConnections.includes(msg.data)) {
                    
                }
            break

            case 'connectCV':
                // Add a modulation connection (source modulates target parameter)
                this.currentState.cvConnections.push({
                    source: msg.data.source,
                    target: msg.data.target,
                    param: msg.data.param // The parameter to modulate
                });
            break;

            case 'removeCable':
                if(msg.data.target.includes('AudioDestination')){
                    const index = this.currentState.outputConnections.findIndex(
                        (item) => 
 
                            item === msg.data.source
                            // item.source === msg.data.source && 
                            // item.target === msg.data.target
                    );
                    // Remove the object if it exists
                    if (index !== -1) {
                        this.currentState.outputConnections.splice(index, 1);
                    }
                } else if (msg.data.target.split('.')[1] === 'IN'){
                    const index = this.currentState.signalConnections.findIndex(
                        (item) => 
 
                            // item === msg.data.source
                            item.source === msg.data.source && 
                            item.target === msg.data.target
                    );

                    // Remove the object if it exists
                    if (index !== -1) {
                        this.currentState.signalConnections.splice(index, 1);
                    }
                } else{
                    const index = this.currentState.cvConnections.findIndex(
                        (item) => 
 
                            // item === msg.data.source
                            item.source === msg.data.source && 
                            item.target === msg.data.target
                    );
                    // Remove the object if it exists
                    if (index !== -1) {
                        this.currentState.cvConnections.splice(index, 1);
                    }

                }         
            break

            case 'paramChange':

                // this.currentState.nodes[msg.data.parent][msg.data.param] = msg.data.value
                // update the baseParam (the value associated with the knob/control)
                const targetNode = this.currentState.nodes[msg.data.parent];
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

        // Crossfade progress (0 = current state, 1 = next state)
        if (this.crossfadeInProgress) {
            this.crossfadeProgress += this.crossfadeStep; // Increment progress
            if (this.crossfadeProgress >= 1) {
                // crossfade is complete
                this.crossfadeProgress = 1;
                this.crossfadeInProgress = false;
                // Deep copy this.nextState to this.currentState
                this.currentState = cloneDeep(this.nextState);
                this.nextState = {}; // Clear the next state
            }
        }

        // Prepare buffers for both states
        const signalBuffersCurrent = {};
        const signalBuffersNext = {};

        for (const id in this.currentState.nodes) {
            signalBuffersCurrent[id] = new Float32Array(128);
        }

        if (this.nextState) {
            for (const id in this.nextState.nodes) {
                signalBuffersNext[id] = new Float32Array(128);
            }
        }

        // Step 1: Prepare buffers for all nodes
        // const signalBuffers = {};
        // for (const id in this.nodes) {
        //     signalBuffers[id] = new Float32Array(128); // Temporary storage for node output
        // }

        const signalBuffers = this.signalBuffers || {}; // Preserve previous buffers if they exist
        for (const id in this.nodes) {
            if (!signalBuffers[id]) {
                signalBuffers[id] = new Float32Array(128); // Allocate only if missing
            }
        }
        this.signalBuffers = signalBuffers; // Store it persistently

        // Process each state
        const processGraph = (state, signalBuffers, stateVersion) => {

            // Step 2: Define a recursive function to process each node
            const visited = new Set();

            // Initialize separate buffers for feedback connections
            const feedbackSignalBuffers = {};
            for (const id in state.nodes) {
                feedbackSignalBuffers[id] = new Float32Array(128); // Same block size
            }

            const processNode = (id) => {
                // console.log(`🔄 Processing order: ${id}`);
                if (visited.has(id)) return; // Avoid re-processing the same node
                visited.add(id);


                const node = state.nodes[id];
                if (!node) return;


                // Sum inputs from connected nodes
                const inputBuffer = new Float32Array(128);
                //! const inputConnections = state.signalConnections.filter(conn => conn.target.split('.')[0] === id);

                // console.log('Signal Connections:', state.signalConnections);
                // console.log('CV Connections:', state.cvConnections);
                // console.log(`Connections for ${id}:`, inputConnections);

                // ✅ Ensure all source nodes are processed FIRST
                const inputConnections = state.signalConnections.filter(conn => conn.target.includes(id));


                for (const conn of inputConnections) {
                    const sourceId = conn.source.split('.')[0];
                    if (!visited.has(sourceId)) {
                        processNode(sourceId); // Process the source FIRST
                    }
                    // console.log('conn', conn)
                    const sourceBuffer = signalBuffers[conn.source.split('.')[0]];
                    if (!sourceBuffer) {
                        console.warn(`Source buffer for node ${conn.source.split('.')[0]} is undefined`);
                        continue; // Skip this modulation if the buffer is unavailable
                    }

                    for (let i = 0; i < inputBuffer.length; i++) {
                        inputBuffer[i] += sourceBuffer[i]; // Sum signals from inputs
                    }

                    // if this connection leads to a feedbackDelayNode, store it separately
                    if (conn.target.startsWith("feedbackDelayNode")) {
                        if (!feedbackSignalBuffers[sourceId]) {
                            feedbackSignalBuffers[sourceId] = new Float32Array(128); // Ensure buffer exists
                        }


                        for (let i = 0; i < feedbackSignalBuffers[sourceId].length; i++) {

                            feedbackSignalBuffers[sourceId][i] = sourceBuffer[i]; // Copy feedback signal
                    
                        }
                    }
                    
                }
                // console.log(`⚡ feedbackDelayNode Input Connections:`, inputConnections);
                // console.log(`⚡ feedbackDelayNode inputBuffer BEFORE processing:`, inputBuffer);

                // Process Modulation Connections
                // const modulationConnections = this.signalConnections.filter(conn => conn.target === id && conn.param);
                const modulations = state.cvConnections.filter((conn) => conn.target.split('.')[0] === id);

                for (const conn of modulations) {
                    if (!state.nodes[conn.source.split('.')[0]]) {
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
                            
                            console.warn(`Parameter ${param} not found for node ${id}\nconn = ${JSON.stringify(conn)}`);
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

                const clamp = (value, min, max) => {
                    return Math.min(Math.max(value, min), max)
                }
                // Process this node
                if (node.node === 'Oscillator') {
                    const effectiveFrequency = getEffectiveParam(node, 'frequency', node.baseParams['freq cv +/-']);
                    // const formattedFrequency = parseFloat(effectiveFrequency.toFixed(2));
                    const effectiveGain = getEffectiveParam(node, 'gain');
                    
                    for (let i = 0; i < signalBuffers[id].length; i++) {
                        node.phase += effectiveFrequency/ sampleRate;
                        if (node.phase >= 1) node.phase -= 1;
                        // signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                        // Select the waveform based on node.baseParams['waveform']

                        // console.log(`🎵 Oscillator Output BEFORE Writing to Buffer (${id}):`, signalBuffers[id].slice(0, 10));

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

                }
                    
            
                else if (node.node === 'Gain') {
                    const effectiveGain = getEffectiveParam(node, 'gain', node.baseParams['gain']); // Combines base and modulated gain

                    for (let i = 0; i < signalBuffers[id].length; i++) {
                        signalBuffers[id][i] = inputBuffer[i] * effectiveGain;
                    }
                } 
                // else if (node.node === 'VCA') {
                //     // Retrieve effective gain, combining base gain and modulation
                //     const effectiveGain = getEffectiveParam(node, 'gain', node.baseParams['gain cv +/-']); // Includes base gain and CV modulation
                //     const baseGain = params.baseGain || 1; // Gain knob (default: 1)
                //     const gainCVAttenuator = params.gainCVAttenuator || 1; // Gain CV attenuator knob (default: 1)


                //     for (let i = 0; i < signalBuffers[id].length; i++) {
                //                 // Calculate effective gain
                //         const gainCV = gainCVBuffer[i] || 0; // Gain CV input
                //         const effectiveGain = baseGain + gainCV * gainCVAttenuator;
                //         signalBuffers[id][i] = inputBuffer[i] * effectiveGain;
                //     }
                // }
                
                // node.webAudioNode.delayTime.setValueAtTime(effectiveDelayTime, this.audioContext.currentTime);

                // else if (node.node === 'Delay') {
                //     if (!node.delayBuffer) {
                //         console.log(`Initializing Delay Buffer for (${id})`);
                
                //         // Allocate buffer for max delay time (1 sec)
                //         node.delayBuffer = new Float32Array(sampleRate);
                //         node.delayIndex = 0; // Write position in the delay buffer
                //     }
                
                //     const effectiveDelayTime = getEffectiveParam(node, 'delayTime', node.baseParams['timeAttenuverter']);

                //     // Convert delay time (ms) to samples
                //     const delaySamples = Math.round((effectiveDelayTime / 1000) * sampleRate);

                
                //     // Make sure delay time doesn't exceed buffer size
                //     const safeDelaySamples = Math.min(delaySamples, node.delayBuffer.length - 1);
                
                //     // Ensure feedback is a valid number
                //     const feedback = typeof node.baseParams.feedback === 'number' ? node.baseParams.feedback : 0;
                
                //     for (let i = 0; i < signalBuffers[id].length; i++) {
                //         // Read the delayed sample
                //         const readIndex = (node.delayIndex - safeDelaySamples + node.delayBuffer.length) % node.delayBuffer.length;
                //         const delayedSample = node.delayBuffer[readIndex];
                
                //         // Compute output (mix input with delayed sample, applying feedback)
                //         const inputSample = inputBuffer[i] || 0;
                //         const outputSample = inputSample + delayedSample * feedback;
                
                //         // Write output sample to the delay buffer
                //         node.delayBuffer[node.delayIndex] = outputSample;
                
                //         // Store the delayed output
                //         signalBuffers[id][i] = outputSample;
                
                //         // Increment buffer index, wrap around circular buffer
                //         node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                //     }
                // }
                
                else if (node.node === 'feedbackDelayNodeZZ') {
                    console.log(`🔎 signalBuffers BEFORE processing feedbackDelayNode:`, JSON.stringify(signalBuffers));

                    // console.log(`Processing feedbackDelayNode for ID: ${id}`);
                    if (!node.delayBuffer) {
                        // create delaybuffer
                        node.delayBuffer = new Float32Array(128); // 1-blockSize delay buffer
                        node.delayIndex = 0;
                        console.log('feedback cable added')
                    }
                    const delaySamples = 128

                    for (let i = 0; i < signalBuffers[id].length; i++) {
                        const delayedSampleIndex = (node.delayIndex - delaySamples + node.delayBuffer.length) % node.delayBuffer.length;
                        const delayedSample = node.delayBuffer[delayedSampleIndex];


                        // ✅ Use feedbackSignalBuffers instead of inputBuffer
                        const feedbackSourceId = state.signalConnections.find(conn => conn.target.split('.')[0] === id)?.source.split('.')[0];
                        const feedbackInput = feedbackSourceId && feedbackSignalBuffers[feedbackSourceId]
                            ? feedbackSignalBuffers[feedbackSourceId][i]
                            : 0; // Default to 0 if no valid feedback input

                        
                        signalBuffers[id][i] = delayedSample
                        // console.log(`feedbackDelayNode Output [${i}]: ${signalBuffers[id][i]}`);

                        // Get the current input sample
                        // const inputSample = (inputBuffer[i] !== 0) ? inputBuffer[i] : Math.sin(2 * Math.PI * i / 128) * 0.5;

                        // console.log(`🔄 feedbackDelayNode: inputBuffer BEFORE writing to delayBuffer:`, inputBuffer.slice(0, 10));
                        // console.log('inputSample', inputSample)
                        // Store the current input in the delay buffer
                        // console.log(`Before Update - delayBuffer[${node.delayIndex}]: ${node.delayBuffer[node.delayIndex]}`);
                        node.delayBuffer[node.delayIndex] = feedbackInput
                        // console.log(`After Update - delayBuffer[${node.delayIndex}]: ${node.delayBuffer[node.delayIndex]}`);


                        // Increment buffer index
                        node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                        
                    }
                }
                
                else if (node.node === 'Delay') {
                    if (!node.delayBuffer) {
                        const effectiveDelayTime = getEffectiveParam(node, 'delayTime', node.baseParams['time cv +/-']);
                        const delayTime = Math.round(effectiveDelayTime * sampleRate / 1000)
                        node.delayBuffer = new Float32Array(sampleRate); // 1-second delay buffer
                        node.delayIndex = 0;

                        // Initialize Lowpass Filter State (Simple 1-Pole)
                        node.lpfCutoff = node.baseParams.lpfCutoff || 3000; // Default cutoff at 3kHz
                        node.lpfPreviousSample = 0; // Filter memory
                    }
                        const effectiveDelayTime = getEffectiveParam(node, 'delayTime', node.baseParams['time cv +/-']);    
                        const delayTime = Math.round((effectiveDelayTime / 1000) * sampleRate)

                        // const delayTime = Math.min(getEffectiveParam(node, 'delayTime', node.baseParams['time cv +/-']) * sampleRate, node.delayBuffer.length);
                        const feedbackParam = typeof node.baseParams.feedback === 'number' ? node.baseParams.feedback : 0.5;
                        
                        const wetMix = node.baseParams.wetMix || 0.2; // Default wet/dry balance (0.5 = 50/50)
                        const dryMix = 0.05; // Ensure proper mix balance
                        
                        // console.log(wetMix, dryMix)
                        // Set up Lowpass Filter Coefficient
                        const RC = 1.0 / (2 * Math.PI * node.lpfCutoff);
                        const alpha = sampleRate / (sampleRate + RC); // 1st order LPF coefficient
                        
                    for (let i = 0; i < signalBuffers[id].length; i++) {
                        const delayedSampleIndex = (node.delayIndex - delayTime + node.delayBuffer.length) % node.delayBuffer.length;
                        const delayedSample = node.delayBuffer[delayedSampleIndex];

                        // Apply Lowpass Filter to Feedback Signal
                        let filteredFeedback = alpha * delayedSample + (1 - alpha) * node.lpfPreviousSample;
                        node.lpfPreviousSample = filteredFeedback; // Store for next iteration

                        // Attenuate feedback before applying it
                        const feedbackGain = 0.8; // Adjust this (lower = less buildup, higher = more resonance)

                        const feedbackSample = filteredFeedback * feedbackParam * feedbackGain

                        // Mix Input and Filtered Feedback Using Dry/Wet Control
                        const inputSample = inputBuffer[i] || 0;
                        const wetSignal = delayedSample + feedbackSample;
                        const drySignal = inputSample;
                        
             
                        // Compute the final signal with proper mix balance
                        signalBuffers[id][i] = clamp((drySignal * dryMix) + (wetSignal * wetMix), -1.0, 1.0);

                        // 
                        node.delayBuffer[node.delayIndex] = signalBuffers[id][i];
                        node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                    }
                } 
                
                if (node.node === 'BiquadFilter') {
                    const effectiveFrequency = clamp(
                        getEffectiveParam(node, 'frequency', node.baseParams['freq cv +/-']),
                        10, 
                        (sampleRate/2)
                    );

                    const effectiveDetune = clamp(
                        getEffectiveParam(node, 'detune', node.baseParams['detune cv +/-']),
                        -1000,
                        1000
                    )

                    const effectiveQ = clamp(
                        getEffectiveParam(node, 'Q', node.baseParams['Q cv +/-']),
                        0.0001,
                        1000
                    )
                    const effectiveGain = clamp(
                        node.baseParams['gain'], // getEffectiveParam(node, 'gain', node.baseParams['gain cv +/-']);
                        -40,
                        40,
                    )
                        
                    const filterType = node.baseParams['type'] || 'lowpass';
            
                    // Convert detune to frequency adjustment
                    const detunedFrequency = effectiveFrequency * Math.pow(2, effectiveDetune / 1200);
            
                    // Initialize filter coefficients if not done already
                    if (!node.coefficients) {
                        node.coefficients = { a0: 0, a1: 0, a2: 0, b0: 0, b1: 0, b2: 0 };
                        node.inputHistory = [0, 0];
                        node.outputHistory = [0, 0];
                    }
            
                    // Calculate filter coefficients based on filter type
                    const omega = (2 * Math.PI * detunedFrequency) / sampleRate;
                    const alpha = Math.sin(omega) / (2 * effectiveQ);
                    const A = Math.pow(10, effectiveGain / 40);
            
                    let b0, b1, b2, a0, a1, a2;
            
                    switch (filterType) {
                        case 'lowpass':
                            b0 = (1 - Math.cos(omega)) / 2;
                            b1 = 1 - Math.cos(omega);
                            b2 = (1 - Math.cos(omega)) / 2;
                            a0 = 1 + alpha;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha;
                            break;
                        case 'highpass':
                            b0 = (1 + Math.cos(omega)) / 2;
                            b1 = -(1 + Math.cos(omega));
                            b2 = (1 + Math.cos(omega)) / 2;
                            a0 = 1 + alpha;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha;
                            break;
                        case 'bandpass':
                            b0 = alpha;
                            b1 = 0;
                            b2 = -alpha;
                            a0 = 1 + alpha;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha;
                            break;
                        case 'peaking':
                            b0 = 1 + alpha * A;
                            b1 = -2 * Math.cos(omega);
                            b2 = 1 - alpha * A;
                            a0 = 1 + alpha / A;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha / A;
                            break;
                        case 'notch':
                            b0 = 1;
                            b1 = -2 * Math.cos(omega);
                            b2 = 1;
                            a0 = 1 + alpha;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha;
                            break;
                        case 'allpass':
                            b0 = 1 - alpha;
                            b1 = -2 * Math.cos(omega);
                            b2 = 1 + alpha;
                            a0 = 1 + alpha;
                            a1 = -2 * Math.cos(omega);
                            a2 = 1 - alpha;
                            break;
                        case 'lowshelf':
                            b0 = A * ((A + 1) - (A - 1) * Math.cos(omega) + 2 * Math.sqrt(A) * alpha);
                            b1 = 2 * A * ((A - 1) - (A + 1) * Math.cos(omega));
                            b2 = A * ((A + 1) - (A - 1) * Math.cos(omega) - 2 * Math.sqrt(A) * alpha);
                            a0 = (A + 1) + (A - 1) * Math.cos(omega) + 2 * Math.sqrt(A) * alpha;
                            a1 = -2 * ((A - 1) + (A + 1) * Math.cos(omega));
                            a2 = (A + 1) + (A - 1) * Math.cos(omega) - 2 * Math.sqrt(A) * alpha;
                            break;
                        case 'highshelf':
                            b0 = A * ((A + 1) + (A - 1) * Math.cos(omega) + 2 * Math.sqrt(A) * alpha);
                            b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(omega));
                            b2 = A * ((A + 1) + (A - 1) * Math.cos(omega) - 2 * Math.sqrt(A) * alpha);
                            a0 = (A + 1) - (A - 1) * Math.cos(omega) + 2 * Math.sqrt(A) * alpha;
                            a1 = 2 * ((A - 1) - (A + 1) * Math.cos(omega));
                            a2 = (A + 1) - (A - 1) * Math.cos(omega) - 2 * Math.sqrt(A) * alpha;
                            break;
                            
                        default:
                            console.warn(`Unsupported filter type: ${filterType}`);
                            return;
                    }
            
                    // Normalize coefficients
                    b0 /= a0;
                    b1 /= a0;
                    b2 /= a0;
                    a1 /= a0;
                    a2 /= a0;
            
                    // Update coefficients
                    node.coefficients = { b0, b1, b2, a0: 1, a1, a2 };
            
                    // Process input signal
                    for (let i = 0; i < signalBuffers[id].length; i++) {
                        const input = inputBuffer[i];
            
                        const output =
                            b0 * input +
                            b1 * node.inputHistory[0] +
                            b2 * node.inputHistory[1] -
                            a1 * node.outputHistory[0] -
                            a2 * node.outputHistory[1];
            
                        // Update histories
                        node.inputHistory[1] = node.inputHistory[0];
                        node.inputHistory[0] = input;
                        node.outputHistory[1] = node.outputHistory[0];
                        node.outputHistory[0] = output;
            
                        signalBuffers[id][i] = output;
                    }
                }
                /*
                else if (node.node === 'feedbackDelayNode') {
                    // console.log(`Feedback Delay Node (${id}) input:`, inputBuffer);
                    // Initialize the delay buffer if it doesn't exist
                    if (!node.delayBuffer) {
                        console.log(`Initializing delay buffer for node ${id}`);

                        node.delayBuffer = new Float32Array(128); // Fixed-size delay buffer for one block
                        node.delayIndex = 0; // Write position in the delay buffer
                    }
                
                    // Process the signal
                    const input = inputBuffer; // Input signal to be delayed
                    const output = signalBuffers[id]; // Output signal after delay

                    // console.log('Input:', inputBuffer);
                    
                
                    for (let i = 0; i < input.length; i++) {
                        // Read the delayed sample
                        const delayedSample = node.delayBuffer[node.delayIndex];
                
                        // Write the delayed sample to the output
                        output[i] = delayedSample;
                
                        // Store the current input sample in the delay buffer
                        node.delayBuffer[node.delayIndex] = input[i];
                
                        // Increment the delay buffer index (with wraparound)
                        node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                    }

                    // console.log('Output:', output);
                }
            
                */
                // Add processed signal to the node's output buffer
                for (let i = 0; i < signalBuffers[id].length; i++) {
                    signalBuffers[id][i] += inputBuffer[i];
                }


                // Reset modulated parameters for the next frame
                for (const param in node.modulatedParams) {
                    node.modulatedParams[param] = 0;
                }

                // console.log(`📡 AFTER processNode(${id}), signalBuffers[${id}] (First 10 Samples):`, signalBuffers[id]?.slice(0, 10));

            };
            

      
            // Step 3: Process all nodes connected to the output
            for (const id of state.outputConnections) {
                processNode(id.split('.')[0]); // process the node first
            }

            // Ensure ALL feedback delay nodes are processed
            Object.keys(state.nodes).forEach(nodeId => {
                if (nodeId.startsWith('feedbackDelayNode_')) {
                    processNode(nodeId);
                }
            });
          
   
        }


        // Process current and next state
        if(this.currentState.outputConnections){
            processGraph(this.currentState, signalBuffersCurrent, 'current');

        }

        if (this.nextState.outputConnections) {
            processGraph(this.nextState, signalBuffersNext, 'next');
        }
        // process both states and, if crossfade is enabled due to loading a version state, crossfade between them
        for (let i = 0; i < output.length; i++) {
            let currentSample = 0;
            let nextSample = 0;
            
            // Process currentState if it has valid outputConnections
            if (this.currentState && this.currentState.outputConnections?.length > 0) {
                const currentOutputId = this.currentState.outputConnections[0].split('.')[0];
                const currentBuffer = signalBuffersCurrent[currentOutputId];
                currentSample = currentBuffer ? currentBuffer[i] || 0 : 0;
            }
        
            // Process nextState if it has valid outputConnections
            if (this.nextState && this.nextState.outputConnections?.length > 0) {
                const nextOutputId = this.nextState.outputConnections[0].split('.')[0];
                const nextBuffer = signalBuffersNext[nextOutputId];
                nextSample = nextBuffer ? nextBuffer[i] || 0 : 0;
   
            }

            // Crossfade between currentSample and nextSample
            // Use only currentSample if crossfade is complete
            if (!this.crossfadeInProgress) {
                output[i] = currentSample;
            } else {
                // Crossfade between currentSample and nextSample
                output[i] = (1 - this.crossfadeProgress) * currentSample + this.crossfadeProgress * nextSample;
            }
        }

        // Apply an overall gain to limit output signal
        for (let i = 0; i < output.length; i++) {
            output[i] *= this.outputVolume; // Scale the output
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
