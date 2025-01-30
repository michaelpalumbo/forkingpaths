import cloneDeep from 'lodash/cloneDeep';

class DSP extends AudioWorkletProcessor {
    constructor() {
        super();
        this.currentState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
        this.nextState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
        this.signalBuffers = {}; // Persistent signal buffers

        // state persistence for crossfading 
        this.signalBuffersCurrent ={}
        this.signalBuffersNext = {}
        this.feedbackBuffers = {}; // Separate buffers for feedback nodes
        this.crossfadeInProgress = false;
        this.crossfadeProgress = 0;
        this.crossfadeStep = 1 / ((sampleRate / 128) * 0.1); // Adjust for crossfade duration
        console.log(`crossfade step length ${this.crossfadeStep}`)
        this.outputVolume = 0.5;
        this.port.onmessage = (event) => this.handleMessage(event.data);
    }

    getSampleRate(){
        return sampleRate
    }

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
    }

    process(inputs, outputs) {
        const output = outputs[0][0];
        output.fill(0); // Start with silence
        
        if (this.crossfadeInProgress) {
            this.crossfadeProgress += this.crossfadeStep;
            if (this.crossfadeProgress >= 1) {
                this.crossfadeProgress = 1;
                this.crossfadeInProgress = false;
                this.currentState = cloneDeep(this.nextState);
                this.nextState = {
                    nodes: {},
                    signalConnections: [],
                    outputConnections: [],
                    cvConnections: []
                };
            }
        }

        this.signalBuffersCurrent = this.signalBuffersCurrent || {};
        this.signalBuffersNext = this.signalBuffersNext || {};

        //! maybe this is where feedback patching fails, because we're setting the signalBuffersCurrent to new arrays each time?
        // Allocate separate buffers for current state
        for (const id in this.currentState.nodes) {
            if (!this.signalBuffersCurrent[id]) {
                this.signalBuffersCurrent[id] = new Float32Array(128);
            }
        }
        
        for (const id in this.nextState.nodes) {
            if (!this.signalBuffersNext[id]) {
                this.signalBuffersNext[id] = new Float32Array(128);
            }
        }

        const processGraph = (state, signalBuffers, feedbackBuffers) => {
            const visited = new Set();

            const processNode = (id) => {
                if (visited.has(id)) return;
                visited.add(id);
                const node = state.nodes[id];
                // console.log(node)
                if (!node) return;
                
                if (!signalBuffers[id]) signalBuffers[id] = new Float32Array(128);
                const inputBuffer = new Float32Array(128);
                
                // process input connections 
                state.signalConnections.filter(conn => conn.target.includes(id)).forEach(conn => {
                    console.log(`🔌 Connection: ${conn.source} → ${conn.target}`);

                    const sourceId = conn.source.split('.')[0];
                    processNode(sourceId);
                    const sourceBuffer = signalBuffers[sourceId] || new Float32Array(128);
                    for (let i = 0; i < 128; i++) inputBuffer[i] += sourceBuffer[i];
                    if (conn.target.startsWith("feedbackDelayNode")){
                        // feedbackBuffers[sourceId] = sourceBuffer.slice();
                        const feedbackNodeId = conn.target.split('.')[0]; // Get feedback delay node ID
                        if (!feedbackBuffers[feedbackNodeId]) {
                            feedbackBuffers[feedbackNodeId] = new Float32Array(128); // Ensure buffer exists
                        }
                    
                        // Sum all signals feeding into this feedback buffer
                        for (let i = 0; i < 128; i++) {
                            feedbackBuffers[feedbackNodeId][i] += sourceBuffer[i];
                        }
                        console.log(`📡 Stored feedback signal for ${feedbackNodeId} from ${sourceId}`);

                    } 
                });


                state.cvConnections.filter(conn => conn.target.split('.')[0] === id).forEach(conn => {
                    const modSourceId = conn.source.split('.')[0];
                
                    if (!visited.has(modSourceId)) {
                        processNode(modSourceId); // Ensure modulation sources are processed
                    }
                
                    const modBuffer = signalBuffers[modSourceId] || new Float32Array(128);
                    const param = conn.param; // The parameter to modulate
                    
                    if (!node.modulatedParams.hasOwnProperty(param)) {
                        console.warn(`Parameter ${param} not found for node ${id}`);
                        return;
                    }
                
                    // Apply modulation by taking the average CV value over the block
                    let modValue = 0;
                    for (let i = 0; i < 128; i++) {
                        modValue += modBuffer[i];
                    }
                    modValue /= 128; // Compute average modulation value
                
                    // Update the modulated parameter
                    node.modulatedParams[param] = modValue;
                });

                
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
                    for (let i = 0; i < 128; i++) signalBuffers[id][i] = inputBuffer[i] * node.baseParams.gain;
                }
                else if (node.node === 'feedbackDelayNode') {
                    if (!node.delayBuffer) node.delayBuffer = new Float32Array(128);
                    for (let i = 0; i < 128; i++) {
                        // console.log(`🔄 feedbackDelayNode(${id}): feedbackBuffers[${id}] (First 10 Samples):`, feedbackBuffers[id]?.slice(0, 10));

                        const feedbackInput = feedbackBuffers[id]?.[i] || 0;

                        console.log(`🌀 feedbackDelayNode(${id}) | Feedback Input: ${feedbackInput} | Delayed Sample: ${delayedSample}`);
                        const delayedSample = node.delayBuffer[(node.delayIndex - 1 + 128) % 128];
                        signalBuffers[id][i] = delayedSample;
                        node.delayBuffer[node.delayIndex] = feedbackInput;
                        node.delayIndex = (node.delayIndex + 1) % 128;
                    }
                }
            };
            state.outputConnections.forEach(id => processNode(id.split('.')[0]));
        };

        processGraph(this.currentState, this.signalBuffersCurrent, this.feedbackBuffers);
        if (this.nextState.outputConnections) processGraph(this.nextState, this.signalBuffersNext, this.feedbackBuffers);

        for (let i = 0; i < output.length; i++) {
            let currentSample = 0;
            let nextSample = 0;
        
            // Get output from current state buffer
            if (this.currentState.outputConnections.length > 0) {
                const currentOutputId = this.currentState.outputConnections[0].split('.')[0];
                currentSample = this.signalBuffersCurrent[currentOutputId]?.[i] || 0;
            }
        
            // Get output from next state buffer
            if (this.nextState.outputConnections.length > 0) {
                const nextOutputId = this.nextState.outputConnections[0].split('.')[0];
                nextSample = this.signalBuffersNext[nextOutputId]?.[i] || 0;
            }
        
            // 🚀 **Correct Crossfade Logic**
            output[i] = this.crossfadeInProgress
                ? (1 - this.crossfadeProgress) * currentSample + this.crossfadeProgress * nextSample
                : currentSample;
        
            output[i] *= this.outputVolume; // Apply master volume

        }

        // if (this.crossfadeInProgress) {
        //     this.crossfadeProgress += this.crossfadeStep;
        //     if (this.crossfadeProgress >= 1) {
        //         this.crossfadeProgress = 1; // Ensure it's exactly 1
        //         this.crossfadeInProgress = false; // Stop crossfade
        
        //         console.log("🚀 Crossfade complete! Promoting nextState to currentState.");
                
        //         // Make nextState the active one
        //         this.currentState = cloneDeep(this.nextState);
        
        //         // Clear nextState so it's ready for future transitions
        //         this.nextState = {
        //             nodes: {},
        //             signalConnections: [],
        //             outputConnections: [],
        //             cvConnections: []
        //         };
        //     }
        // }

        return true;
    }
}

registerProcessor('DSP', DSP);