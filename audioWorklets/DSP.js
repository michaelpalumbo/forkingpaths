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
        this.outputVolume = 0.5;
        this.port.onmessage = (event) => this.handleMessage(event.data);
        
        // signal analysis
        this.analyze = false


  
  
    }

    getSampleRate(){
        return sampleRate
    }

    audioNodeBuilder(type, moduleName, params, loadState){
        switch (type){
                
            case 'VCA':
                let vca = {
                    node: 'VCA',
                    structure: 'webAudioNode',
                    baseParams: {
                        gain: parseFloat(1),
                        "gain cv +/-": parseFloat(params["gain cv +/-"]),
                    },
                    modulatedParams: {
                        // offsets for modulation
                        gain: 0, 
                    },
                    output: new Float32Array(128),
                    modulationTarget: null, // Target node or parameter for modulation
                    startTime: null, // Optional: Scheduled start time
                    stopTime: null,  // Optional: Scheduled stop time           
    
                };
                if(loadState){
                    this.nextState.nodes[moduleName] = vca
                } else {
                    this.currentState.nodes[moduleName] = vca
                }
                
            break

            case 'HighPassFilter':
                let hpf = {
                    node: 'HighPassFilter',
                    structure: 'webAudioNode',
                    baseParams: {
                        freq: parseFloat(params.freq),
                        Q: parseFloat(params.Q),
                        "freq cv +/-": parseFloat(params["freq cv +/-"]),
                        "Q cv +/-": parseFloat(params["Q cv +/-"]),
                    },
                    modulatedParams: {
                        // offsets for modulation
                        freq: 0,
                        Q: 0
                    },
                    output: new Float32Array(128),
                    modulationTarget: null, // Target node or parameter for modulation
                    startTime: null, // Optional: Scheduled start time
                    stopTime: null,  // Optional: Scheduled stop time           
    
                };
                if(loadState){
                    this.nextState.nodes[moduleName] = hpf
                } else {
                    this.currentState.nodes[moduleName] = hpf
                }
                
            break
            case 'LFO':
            case 'SLOWFO':
            case 'Oscillator':
                let osc = {
                    node: 'Oscillator',
                    structure: 'webAudioNode',
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

            // case 'LFO2':
            //     let lfo2 = {
            //         node: 'Oscillator',
            //         structure: 'webAudioNode',
            //         baseParams: {
            //             frequency: parseFloat(params.frequency),
            //             gain: parseFloat(1),
            //             "freq cv +/-": parseFloat(params["freq cv +/-"]),
            //         },
            //         modulatedParams: {
            //             // offsets for modulation
            //             frequency: 0, 
            //             gain: 0, 
            //         },
            //         // Separate output buffers for each waveform
            //         output: {
            //             sine: new Float32Array(128),
            //             square: new Float32Array(128),
            //             saw: new Float32Array(128),
            //             tri: new Float32Array(128),
            //         },
            //         phase: 0,
            //         customWaveform: null,
            //         type: params.type,
            //         modulationTarget: null, // Target node or parameter for modulation
            //         startTime: null, // Optional: Scheduled start time
            //         stopTime: null,  // Optional: Scheduled stop time           
    
            //     };
            //     if(loadState){
            //         this.nextState.nodes[moduleName] = lfo2
            //     } else {
            //         this.currentState.nodes[moduleName] = lfo2
            //     }
                
            // break
            case 'Gain':
            case 'ModGain':
                let gain = {
                    node: 'Gain',
                    structure: 'webAudioNode',
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

            case 'Mixer':
                console.warn('Mixer DSP code is not yet working. the inputs are not being processed correctly (returning undefined)')
                let mixer = {
                    node: 'Mixer',
                    structure: 'webAudioNode',
                    baseParams: {
                        gainA: parseFloat(params.gainA) || 1,
                        gainB: parseFloat(params.gainB) || 1,
                    },
                    modulatedParams: { },
                    output: new Float32Array(128),
                }
                if(loadState){
                    this.nextState.nodes[moduleName] = mixer
                } else {
                    this.currentState.nodes[moduleName] = mixer
                }

            break

            case 'Delay':
            case 'Flutter':
                let delay = {
                    node: 'Delay',
                    structure: 'webAudioNode',
                    baseParams: {
                        delayTime: parseFloat(params.delayTime) || 500,
                        'time cv +/-': parseFloat(params['time cv +/-']) || 100,
                        feedback: parseFloat(params.feedback) || 0.5,
                        'feedback cv +/-': parseFloat(params['feedback cv +/-']) || 0.3,
                        dryWet: parseFloat(params.dryWet) || 0.4,
                        'dryWet cv +/-': parseFloat(params['dryWet cv +/-']) || 0,
                    },
                    connections: {
                        feedback: null, // Will store a Web Audio GainNode for feedback
                    },
                    modulatedParams: {
                        delayTime: 0, // Offset for modulation
                        feedback: 0,
                        dryWet: 0
                    },
                    output: new Float32Array(128),
                }

                if(loadState){
                    this.nextState.nodes[moduleName] = delay
                } else {
                    this.currentState.nodes[moduleName] = delay
                }
            break;

            case 'feedbackDelayNode':
                let feedbackDelayNode = {
                    node: 'feedbackDelayNode',
                    structure: 'webAudioNode',
                    output: new Float32Array(128) // Fixed output buffer for block size
                }

                if(loadState){
                    this.nextState.nodes[moduleName] = feedbackDelayNode
                } else {
                    this.currentState.nodes[moduleName] = feedbackDelayNode
                }  
            break;

            case 'Pulses':
                let pulses = {
                    node: 'Pulses',
                    structure: 'webAudioNode',
                    baseParams: {
                        stepCount: parseFloat(params.stepCount) || 8,
                        tempo: parseFloat(params.tempo) || 120,
                        "tempo cv +/-": parseFloat(params["tempo cv +/-"]) || 10,
                        pulseWidth: parseFloat(params.gateLength) || 0.5
                    },
                    modulatedParams: {
                        tempo: 0,
                        pulseWidth: 0
                    },
                    output: new Float32Array(128), // Single output buffer
                    stepIndex: 0,
                    clockPhase: 0
                };

                if (loadState) {
                    this.nextState.nodes[moduleName] = pulses;
                } else {
                    this.currentState.nodes[moduleName] = pulses;
                }
            break;

            case 'Euclid':
                let euclideanPulses = {
                    node: 'Euclid',
                    structure: 'webAudioNode',
                    baseParams: {
                        numSteps: parseInt(params.numSteps) || 8,
                        activeSteps: parseInt(params.activeSteps) || 8,
                        tempo: parseFloat(params.tempo) || 120,
                        "tempo cv +/-": parseFloat(params["tempo cv +/-"]) || 10,
                        ratchet: parseInt(params.ratchet) || 0,
                        "ratchet cv +/-": parseFloat(params["ratchet cv +/-"]) || 10,
                    },
                    modulatedParams: {
                        tempo: 0,
                        ratchet: 0
                    },
                    output: new Float32Array(128), // Single output buffer
                    stepIndex: 0,
                    clockPhase: 0
                };

                if (loadState) {
                    this.nextState.nodes[moduleName] = euclideanPulses;
                } else {
                    this.currentState.nodes[moduleName] = euclideanPulses;
                }
            break;

            default: 
        }     
    } 


    async rnboDeviceBuilder(deviceName, rnboDesc, rnboSrc, loadState) {

            let rnboDevice = {
                node: deviceName,
                structure: 'rnboDevices',
                rnboDesc: rnboDesc, // Store RNBO metadata
                // rnboSrc: rnboSrc,   // Store DSP source code
                baseParams: {},                // Store parameter values
                modulatedParams: {},           // Offsets for modulation
                output: new Float32Array(128), // Single output buffer
                dspInstance: null              // Will store compiled RNBO DSP function
            };
        
            
            // Initialize parameters based on RNBO description
            rnboDesc.parameters.forEach(param => {
                rnboDevice.baseParams[param.paramId] = param.initialValue;
                rnboDevice.modulatedParams[param.paramId] = 0;
            });

            // Store in current or next state
            if (loadState) {
                this.nextState.nodes[deviceName] = rnboDevice;
            } else {
                this.currentState.nodes[deviceName] = rnboDevice;
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
                    if(moduleID.startsWith('feedbackDelayNode')){
                        this.audioNodeBuilder('feedbackDelayNode', moduleID, null, 'loadstate')
                    } 

                    else if(module.structure === 'webAudioNodes'){
                        this.audioNodeBuilder(module.type, moduleID, module.params, 'loadstate')
                    }
                    else if(module.structure === 'rnboDevices'){
                        
                        this.port.postMessage({ cmd: 'fetchRNBOsrc', data: module });
                        // this.rnboDeviceBuilder(module.type, module.moduleSpec.desc, module.moduleSpec.src, 'loadstate')
                        // console.warn('if any module is ade with rnboDevices, need to run it through this.rnboDeviceBuilder')
                    } else {
                        console.warn('node module structure defined for module ', moduleID)
                    }


                })

                synthGraph.connections.forEach((cable)=>{
                    if(cable.target.includes('AudioDestination')){
                        this.nextState.outputConnections.push(cable.source);
                    } else if (cable.target.split('.')[1].startsWith("IN")){
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

            case 'setSignalAnalysis':
                this.analyze = msg.data
                
            break

            case 'addNode':
                if(msg.structure === 'webAudioNodes'){
                    this.audioNodeBuilder(msg.data.moduleName)
   
                } else if (msg.structure === 'feedbackDelayNode'){
                    this.audioNodeBuilder('feedbackDelayNode', msg.data)
                    
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
                
                if(msg.data.target.includes('AudioDestination')){
                    this.currentState.outputConnections.push(msg.data.source);
                } else if (msg.data.target.split('.')[1].startsWith("IN")){
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
                    // remove cv connection

                    const index = this.currentState.cvConnections.findIndex(
                        (item) => 
 
                            // item === msg.data.source
                            item.source === msg.data.source && 
                            item.target === msg.data.target
                    );
                    // Remove the object if it exists
                    if (index !== -1) {
                        let thisCvConnection = this.currentState.cvConnections[index]
                        // reset the modulatedParam value to 0 so that the cv attenuverter doesn't influence the param until a cable is attached again
                        this.currentState.nodes[thisCvConnection.target.split('.')[0]].modulatedParams[thisCvConnection.target.split('.')[1]] = 0
                        // remove the cv connection
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

            
            
            default: console.log(`no switch case exists for ${msg.cmd}`)
        }
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
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
                if (!node) return;
                
                if (!signalBuffers[id]) signalBuffers[id] = new Float32Array(128);
                const inputBuffer = new Float32Array(128);
                
                // process input connections 
                state.signalConnections.filter(conn => conn.target.includes(id)).forEach(conn => {
                    
                    const sourceId = conn.source.split('.')[0];
                    const sourceOutput = conn.source.split('.')[1]

                    processNode(sourceId);
                    
                    // Check if source node has more than one outlet (or any multi-output module)
                    if (state.nodes[sourceId] && state.nodes[sourceId].output && typeof state.nodes[sourceId].output === 'object') {
                        const sourceBuffer = state.nodes[sourceId].output[sourceOutput] || new Float32Array(128);
                        for (let i = 0; i < 128; i++) {
                            inputBuffer[i] += sourceBuffer[i]; // Mix into input buffer
                        }
                    } else {
                        // Fallback: Default single-output case
                        const sourceBuffer = signalBuffers[sourceId] || new Float32Array(128);
                        for (let i = 0; i < 128; i++) {
                            inputBuffer[i] += sourceBuffer[i];
                        }
                    }
                    
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

                else if (node.node === 'LFO2') {
                    const effectiveFrequency = getEffectiveParam(node, 'frequency', node.baseParams['freq cv +/-']);
                    const effectiveGain = getEffectiveParam(node, 'gain');
                
                    for (let i = 0; i < 128; i++) {
                        node.phase += effectiveFrequency / sampleRate;
                        if (node.phase >= 1) node.phase -= 1;
                
                        // Compute each waveform
                        node.output.sine[i] = Math.sin(2 * Math.PI * node.phase) * effectiveGain;
                        node.output.square[i] = (node.phase < 0.5 ? 1 : -1) * effectiveGain;
                        node.output.saw[i] = (2 * node.phase - 1) * effectiveGain;
                        node.output.tri[i] = (node.phase < 0.5 ? 4 * node.phase - 1 : 3 - 4 * node.phase) * effectiveGain;
                    }
                }

                else if (node.node === 'VCA') {
                    const effectiveGain = getEffectiveParam(node, 'gain', node.baseParams['gain cv +/-']);
                
                    // Initialize DC-blocking filter state if not present
                    if (!node.dcBlockState) {
                        node.dcBlockState = { prevInput: 0, prevOutput: 0 };
                    }
                
                    const cutoffFreq = 5; // Cutoff frequency for DC-blocking (5 Hz)
                    const alpha = 1 - Math.exp(-2 * Math.PI * cutoffFreq / sampleRate);
                
                    for (let i = 0; i < 128; i++) {
                        // Get input sample (default to 0 if no input)
                        const inputSample = inputBuffer[i] || 0;
                
                        // Apply modulation from CV input if available
                        let modulatedGain = (node.modulatedParams['gain'] || 0) * node.baseParams['gain cv +/-'];
                
                        // DC-blocking filter (1st-order high-pass filter)
                        const filteredModulation = alpha * (modulatedGain - node.dcBlockState.prevInput) + node.dcBlockState.prevOutput;
                        node.dcBlockState.prevInput = modulatedGain;
                        node.dcBlockState.prevOutput = filteredModulation;
                
                        // Compute final gain (clamped between 0 and 1)
                        const finalGain = this.clamp(effectiveGain + filteredModulation, 0, 1);
                
                        // Apply gain to the input signal
                        signalBuffers[id][i] = inputSample * finalGain;
                    }
                }
                
                
                else if (node.node === 'Gain') {
                    for (let i = 0; i < 128; i++) signalBuffers[id][i] = inputBuffer[i] * node.baseParams.gain;
                }
                else if (node.node === 'feedbackDelayNode') {
                    if (!node.delayBuffer){
                        node.delayBuffer = new Float32Array(128);
                        node.delayIndex = 0;
                    } 
                    for (let i = 0; i < 128; i++) {
                        const feedbackInput = feedbackBuffers[id]?.[i] || 0;
                        const delayIndex = (node.delayIndex - 1 + 128) % 128;

                        // Now define delayedSample after delayIndex is correctly computed
                        const delayedSample = node.delayBuffer[delayIndex] || 0;

                        // const delayedSample = node.delayBuffer[(node.delayIndex - 1 + 128) % 128];
                        signalBuffers[id][i] = delayedSample;
                        node.delayBuffer[node.delayIndex] = feedbackInput;
                        node.delayIndex = (node.delayIndex + 1) % 128;
                    }
                }
                else if (node.node === 'Delay') {
                    // ─── Initialization ─────────────────────────────────────────────
                    if (!node.delayBuffer) {
                        node.delayBuffer = new Float32Array(sampleRate); // 1-second delay buffer
                        node.delayIndex = 0;
                        node.lpfCutoff = node.baseParams.lpfCutoff || 3000;
                        node.lpfPreviousSample = 0;
                        // Instead of using previousDelayTime (with a slew limiter),
                        // we now use two delay time states for crossfading:
                        node.currentDelayTime = Math.min(
                            Math.max(getEffectiveParam(node, 'delayTime', node.baseParams['time cv +/-']), 0),
                            999
                        );
                        node.targetDelayTime = node.currentDelayTime;
                        // Crossfade state (crossfade over 128 samples by default)
                        node.crossfadeActive = false;
                        node.crossfade = 0;
                        node.crossfadeSamples = 128;
                        node.crossfadeIncrement = 1.0 / node.crossfadeSamples;
                        // (The allpass memories remain from your original code but won’t be used now.)
                        node.allpassMem1 = 0;
                        node.allpassMem2 = 0;
                    }
                    
                    // ─── Determine the New Delay Time Parameter ──────────────────────
                    const newDelayTimeParam = Math.min(
                        Math.max(getEffectiveParam(node, 'delayTime', node.baseParams['time cv +/-']), 0),
                        999
                    );
                    // If a new delay time is requested and we aren’t already crossfading,
                    // then start a crossfade from the current to the new delay time.
                    if (newDelayTimeParam !== node.targetDelayTime && !node.crossfadeActive) {
                        node.targetDelayTime = newDelayTimeParam;
                        node.crossfadeActive = true;
                        node.crossfade = 0;
                    }
                    
                    // ─── Lowpass Filter Coefficient (for smoothing the feedback) ──────
                    const RC = 1.0 / (2 * Math.PI * node.lpfCutoff);
                    const alpha = sampleRate / (sampleRate + RC);
                    
                    // ─── Cubic Interpolation Function ─────────────────────────────────
                    // (Catmull–Rom interpolation over four consecutive samples)
                    function cubicInterpolate(buffer, index) {
                        const len = buffer.length;
                        let intIndex = Math.floor(index);
                        let frac = index - intIndex;
                        const i0 = ((intIndex - 1) + len) % len;
                        const i1 = intIndex % len;
                        const i2 = (intIndex + 1) % len;
                        const i3 = (intIndex + 2) % len;
                        const sample0 = buffer[i0];
                        const sample1 = buffer[i1];
                        const sample2 = buffer[i2];
                        const sample3 = buffer[i3];
                        const a0 = -0.5 * sample0 + 1.5 * sample1 - 1.5 * sample2 + 0.5 * sample3;
                        const a1 = sample0 - 2.5 * sample1 + 2.0 * sample2 - 0.5 * sample3;
                        const a2 = -0.5 * sample0 + 0.5 * sample2;
                        const a3 = sample1;
                        return ((a0 * frac + a1) * frac + a2) * frac + a3;
                    }
                    
                    // ─── Process Each Sample in the Block ─────────────────────────────
                    for (let i = 0; i < 128; i++) {
                        let delayedSample;
                        if (node.crossfadeActive) {
                            // When crossfading, compute two delay read positions:
                            // • one using the “old” delay time (node.currentDelayTime)
                            // • one using the “new” target delay time (node.targetDelayTime)
                            const delaySamplesOld = (node.currentDelayTime / 1000) * sampleRate;
                            const delaySamplesNew = (node.targetDelayTime / 1000) * sampleRate;
                            
                            // Calculate the (wrapped) read indices for both delay times
                            let readIndexOld = node.delayIndex - delaySamplesOld;
                            if (readIndexOld < 0) readIndexOld += node.delayBuffer.length;
                            let readIndexNew = node.delayIndex - delaySamplesNew;
                            if (readIndexNew < 0) readIndexNew += node.delayBuffer.length;
                            
                            // Use cubic interpolation for each
                            const delayedOld = cubicInterpolate(node.delayBuffer, readIndexOld);
                            const delayedNew = cubicInterpolate(node.delayBuffer, readIndexNew);
                            
                            // Crossfade between the two based on the current crossfade factor
                            delayedSample = (1 - node.crossfade) * delayedOld + node.crossfade * delayedNew;
                            
                            // Increment crossfade factor and check if the transition is complete
                            node.crossfade += node.crossfadeIncrement;
                            if (node.crossfade >= 1.0) {
                                node.currentDelayTime = node.targetDelayTime;
                                node.crossfadeActive = false;
                                node.crossfade = 0;
                            }
                        } else {
                            // No crossfade: use the current delay time
                            const delaySamples = (node.currentDelayTime / 1000) * sampleRate;
                            let readIndex = node.delayIndex - delaySamples;
                            if (readIndex < 0) readIndex += node.delayBuffer.length;
                            delayedSample = cubicInterpolate(node.delayBuffer, readIndex);
                        }
                        
                        // ─── Feedback Processing ─────────────────────────────────────────
                        // Apply a one-pole lowpass filter to smooth the delayed sample for feedback.
                        let filteredFeedback = alpha * delayedSample + (1 - alpha) * node.lpfPreviousSample;
                        node.lpfPreviousSample = filteredFeedback;
                        
                        // Retrieve any additional feedback input if available
                        const feedbackInput = feedbackBuffers[id]?.[i] || 0;
                        const feedbackParam = typeof node.baseParams.feedback === 'number' ? node.baseParams.feedback : 0.5;
                        const feedbackSample = filteredFeedback * feedbackParam + feedbackInput;
                        
                        // ─── Dry/Wet Mixing and Buffer Writing ────────────────────────────
                        const inputSample = inputBuffer[i] || 0;

                        // set wet mix level based on dryWet knob value
                        const wetMix = Math.min(Math.max(getEffectiveParam(node, 'dryWet', node.baseParams['dryWet cv +/-']), 0), 1)
                        // set dry mix level based on inversion of dryWet knob
                        const dryMix = 1 - Math.min(Math.max(getEffectiveParam(node, 'dryWet', node.baseParams['dryWet cv +/-']), 0), 1)
                        // Combine the (wet) delayed signal plus feedback with the dry input
                        const wetSignal = delayedSample + feedbackSample;
                        const drySignal = inputSample;
                        // output:
                        signalBuffers[id][i] = this.clamp((drySignal * dryMix) + (wetSignal * wetMix), -1.0, 1.0);
                        
                        const feedbackAmount = Math.min(Math.max(getEffectiveParam(node, 'feedback', node.baseParams['feedback cv +/-']), 0),
                        1) || 0.3
                        const feedbackSignal = this.clamp((drySignal) + (wetSignal * feedbackAmount), -1.0, 1.0);

                        // Write the output back into the delay buffer and advance the write pointer.
                        node.delayBuffer[node.delayIndex] = feedbackSignal
                        node.delayIndex = (node.delayIndex + 1) % node.delayBuffer.length;
                    }
                }
                
               
                else if (node.node === 'HighPassFilter') {
                    if (!node.coefficients) {
                        node.coefficients = { a0: 0, a1: 0, a2: 0, b0: 0, b1: 0, b2: 0 };
                        node.inputHistory1 = [0, 0];
                        node.outputHistory1 = [0, 0];
                        node.inputHistory2 = [0, 0];  // Second stage for cascaded filtering
                        node.outputHistory2 = [0, 0];
                    }
                

                    const effectiveFreq = this.clamp(
                        getEffectiveParam(node, 'freq', node.baseParams['freq cv +/-']),
                        80, 
                        10000
                    );
                
                    const effectiveQ = this.clamp(
                        getEffectiveParam(node, 'Q', node.baseParams['Q cv +/-']),
                        0.1,
                        20
                    );
                
                    // Compute filter coefficients for biquad high-pass
                    const omega = (2 * Math.PI * effectiveFreq) / sampleRate;
                    const alpha = Math.sin(omega) / (2 * effectiveQ);
                
                    let b0, b1, b2, a0, a1, a2;
                
                    // High-Pass Filter Coefficients (Biquad formula)
                    b0 = (1 + Math.cos(omega)) / 2;
                    b1 = -(1 + Math.cos(omega));
                    b2 = (1 + Math.cos(omega)) / 2;
                    a0 = 1 + alpha;
                    a1 = -2 * Math.cos(omega);
                    a2 = 1 - alpha;
                
                    // Normalize coefficients
                    b0 /= a0;
                    b1 /= a0;
                    b2 /= a0;
                    a1 /= a0;
                    a2 /= a0;
                
                    // Store computed coefficients
                    node.coefficients = { b0, b1, b2, a1, a2 };
                
                    // Apply cascaded biquad filter for **stronger** high-pass effect
                    for (let i = 0; i < 128; i++) {
                        const inputSample = inputBuffer[i];
                
                        // First stage
                        let filtered1 =
                            node.coefficients.b0 * inputSample +
                            node.coefficients.b1 * node.inputHistory1[0] +
                            node.coefficients.b2 * node.inputHistory1[1] -
                            node.coefficients.a1 * node.outputHistory1[0] -
                            node.coefficients.a2 * node.outputHistory1[1];
                
                        // Update history for first stage
                        node.inputHistory1[1] = node.inputHistory1[0];
                        node.inputHistory1[0] = inputSample;
                        node.outputHistory1[1] = node.outputHistory1[0];
                        node.outputHistory1[0] = filtered1;
                
                        // Second stage for stronger effect
                        let filtered2 =
                            node.coefficients.b0 * filtered1 +
                            node.coefficients.b1 * node.inputHistory2[0] +
                            node.coefficients.b2 * node.inputHistory2[1] -
                            node.coefficients.a1 * node.outputHistory2[0] -
                            node.coefficients.a2 * node.outputHistory2[1];
                
                        // Update history for second stage
                        node.inputHistory2[1] = node.inputHistory2[0];
                        node.inputHistory2[0] = filtered1;
                        node.outputHistory2[1] = node.outputHistory2[0];
                        node.outputHistory2[0] = filtered2;
                
                        // Write final output to buffer
                        signalBuffers[id][i] = filtered2;
                    }
                }
                else if (node.node === 'Pulses') {
                    // Retrieve the effective tempo and compute the duration (in samples) of each step.
                    const effectiveTempo = getEffectiveParam(node, 'tempo', node.baseParams["tempo cv +/-"]);
                    const stepDuration = (60 / effectiveTempo) * sampleRate;
                    // Retrieve the effective pulseWidth (a fraction between 0 and 1). clamp it between 0-0.999 if modulation pushes it to 1.0 or greater
                    const effectivePulseWidth = Math.min(Math.max(getEffectiveParam(node, 'pulseWidth'), 0), 0.999);
                    // Calculate the pulse duration (in samples) as a fraction of the step duration.
                    // If effectivePulseWidth is 0, then no pulse is generated.
                    const pulseSamples = effectivePulseWidth > 0
                        ? Math.max(1, Math.round(effectivePulseWidth * stepDuration))
                        : 0;
                
                    // Ensure that state variables are initialized.
                    node.clockPhase = node.clockPhase || 0;
                    node.stepIndex = node.stepIndex || 0;
                    node.pulseCounter = node.pulseCounter || 0;
                
                    // Process each sample in the block.
                    for (let i = 0; i < 128; i++) {
                        // Advance the clock by one sample.
                        node.clockPhase += 1;
                
                        // If we've reached the end of the current step, reset the clock
                        // and trigger a new pulse with the calculated duration.
                        if (node.clockPhase >= stepDuration) {
                            node.clockPhase = 0;
                            node.stepIndex = (node.stepIndex + 1) % node.baseParams.stepCount;
                            node.pulseCounter = pulseSamples; // Set the pulse counter based on gateLength.
                        }
                        
                        // Output a pulse (1.0) if the pulse counter is active, otherwise output 0.
                        signalBuffers[id][i] = (node.pulseCounter > 0 ? 1.0 : 0.0);
                        
                        // Decrement the pulse counter if it's active.
                        if (node.pulseCounter > 0) {
                            node.pulseCounter -= 1;
                        }
                    }
                }

                else if (node.node === 'Euclid') {
                    // Retrieve the effective tempo and compute the duration (in samples) of each step.
                    const effectiveTempo = getEffectiveParam(node, 'tempo', node.baseParams["tempo cv +/-"]);
                    const stepDuration = (60 / effectiveTempo) * sampleRate;
                    
                    // Retrieve the effective ratchet (a fraction between 0 and 1) and clamp it.
                    // (Though for the ratchet pulse we later use a fixed short duration.)
                    const effectivePulseWidth = Math.min(Math.max(getEffectiveParam(node, 'ratchet'), 0), 1);
                    // Instead of calculating pulseSamples as a fraction of the step,
                    // we use a fixed very short pulse duration of 0.5ms.
                    const pulseSamples = Math.max(1, Math.round(sampleRate * 0.0005)); // 0.5ms pulse
                
                    // Retrieve the numSteps and activeSteps parameters.
                    // (Ensure numSteps is at least 1 and activeSteps is between 0 and numSteps.)
                    const numStepsParam = Math.max(1, Math.floor(getEffectiveParam(node, 'numSteps')));
                    const activeStepsParam = Math.max(0, Math.min(numStepsParam, Math.floor(getEffectiveParam(node, 'activeSteps'))));
                    
                    // Generate the Euclidean pattern for the current step configuration.
                    // The pattern is an array of length numStepsParam containing 1's (active) and 0's (inactive).
                    const pattern = generateEuclideanPattern(activeStepsParam, numStepsParam);
                    
                    // Retrieve the ratchet parameter. If less than 1, default to 1 (i.e. no ratcheting).
                    const effectiveRatchet = Math.max(1, Math.floor(getEffectiveParam(node, 'ratchet', node.baseParams["ratchet cv +/-"])));
                    // For non-ratchet mode, the whole step is used.
                    // For ratchet mode, subdivide the step duration into effectiveRatchet subintervals.
                    let ratchetInterval = stepDuration;
                    let ratchetPulseSamples = pulseSamples;
                    if (effectiveRatchet > 1) {
                        ratchetInterval = stepDuration / effectiveRatchet;
                        // Determine the duration (in samples) of each ratchet pulse.
                        // (Here you can also incorporate effectivePulseWidth if you want it to modulate
                        // the ratchet pulse duration; for now we follow your fixed short pulse approach.)
                        ratchetPulseSamples = effectivePulseWidth > 0 
                            ? Math.max(1, Math.round(effectivePulseWidth * ratchetInterval))
                            : pulseSamples;
                    }
                    
                    // Ensure that state variables are initialized.
                    node.clockPhase = node.clockPhase || 0;
                    node.stepIndex = node.stepIndex || 0;
                    // Set whether the current step is active based on the Euclidean pattern.
                    node.currentStepActive = (pattern[node.stepIndex] === 1);
                    
                    // Process each sample in the block.
                    for (let i = 0; i < 128; i++) {
                        // Advance the clock by one sample.
                        node.clockPhase += 1;
                        
                        // When we reach the end of the current step, wrap the clock and move to the next step.
                        if (node.clockPhase >= stepDuration) {
                            node.clockPhase -= stepDuration;
                            node.stepIndex = (node.stepIndex + 1) % numStepsParam;
                            node.currentStepActive = (pattern[node.stepIndex] === 1);
                        }
                        
                        let outputVal = 0;
                        if (node.currentStepActive) {
                            if (effectiveRatchet > 1) {
                                // In ratchet mode, determine our position within the current ratchet subinterval.
                                const subphase = node.clockPhase % ratchetInterval;
                                if (subphase < ratchetPulseSamples) {
                                    outputVal = 1.0;
                                }
                            } else {
                                // Non-ratchet mode: output a pulse if we're within the fixed pulseSamples at the start of the step.
                                if (node.clockPhase < pulseSamples) {
                                    outputVal = 1.0;
                                }
                            }
                        }
                        // Write the output for this sample.
                        signalBuffers[id][i] = outputVal;
                    }
                    
                    // Helper function: Generate a Euclidean rhythm pattern.
                    // This simple algorithm distributes 'pulses' evenly across 'steps'.
                    function generateEuclideanPattern(pulses, steps) {
                        let pattern = [];
                        let bucket = 0;
                        for (let i = 0; i < steps; i++) {
                            bucket += pulses;
                            if (bucket >= steps) {
                                bucket -= steps;
                                pattern.push(1);
                            } else {
                                pattern.push(0);
                            }
                        }
                        return pattern;
                    }
                }

                else if (node.node === 'Mixer') {
                    // Retrieve  gain parameters for the two input signals.
                    const gainA = node.baseParams['gainA']
                    // getEffectiveParam(node, 'gainA', node.baseParams['gainA']);
                    const gainB = node.baseParams['gainB']
                
                    // Assume that the two input signals come from nodes specified by identifiers.
                    // For example, node.inputA and node.inputB might be strings like "osc1" and "osc2".
                    const sourceA = node.inputA;
                    const sourceB = node.inputB;
                
                    
                    // Retrieve the source identifiers for the two inputs.
                    // These properties (node.inputA and node.inputB) must be set by the patching logic
                    // when cables are connected to the mixer.
                    // if nothing is connected to either input, create a new array to make it silent
                    const bufferA = signalBuffers[node.inputA] || new Float32Array(128);
                    const bufferB = signalBuffers[node.inputB] || new Float32Array(128);
                
                    // Ensure that this mixer node has an allocated output buffer.
                    if (!signalBuffers[id]) {
                        signalBuffers[id] = new Float32Array(128);
                    }
                
                    // Mix the two signals sample-by-sample.
                    // Each output sample is the sum of the corresponding samples in bufferA and bufferB,
                    // scaled by their respective gain parameters.
                    for (let i = 0; i < 128; i++) {
                        signalBuffers[id][i] = (bufferA[i] * gainA) + (bufferB[i] * gainB);
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

        // === Begin Analyzer Code ===

        if(this.analyze === true){
            // Calculate the RMS amplitude of the output buffer
            let sumSq = 0;
            for (let i = 0; i < output.length; i++) {
                sumSq += output[i] * output[i];
            }
            const rms = Math.sqrt(sumSq / output.length);

            this.analyzerFrameCount = (this.analyzerFrameCount || 0) + 1;
            // Throttle the messaging so that it sends every 100 blocks:
            if (this.analyzerFrameCount % 100 === 0) {
                this.port.postMessage({
                    cmd: 'analyzerData',
                    rms: rms                });
            }
        
        }
        
        
        return true;
    }
}

registerProcessor('DSP', DSP);