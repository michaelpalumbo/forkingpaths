import cloneDeep from 'lodash/cloneDeep';

class DSP extends AudioWorkletProcessor {
    constructor() {
        super();
        this.currentState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
        this.nextState = { nodes: {}, signalConnections: [], outputConnections: [], cvConnections: [] };
        this.signalBuffers = {}; // Persistent signal buffers
        this.feedbackBuffers = {}; // Separate buffers for feedback nodes
        this.crossfadeInProgress = false;
        this.crossfadeProgress = 0;
        this.crossfadeStep = 1 / ((sampleRate / 128) * 0.03); // Adjust for crossfade duration
        this.outputVolume = 0.5;
        this.port.onmessage = (event) => this.handleMessage(event.data);
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
                this.nextState = {};
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
                
                state.signalConnections.filter(conn => conn.target.includes(id)).forEach(conn => {
                    const sourceId = conn.source.split('.')[0];
                    processNode(sourceId);
                    const sourceBuffer = signalBuffers[sourceId] || new Float32Array(128);
                    for (let i = 0; i < 128; i++) inputBuffer[i] += sourceBuffer[i];
                    if (conn.target.startsWith("feedbackDelayNode")) feedbackBuffers[sourceId] = sourceBuffer.slice();
                });
                
                if (node.node === 'Oscillator') {
                    for (let i = 0; i < 128; i++) {
                        node.phase = (node.phase + node.baseParams.frequency / sampleRate) % 1;
                        signalBuffers[id][i] = Math.sin(2 * Math.PI * node.phase) * node.baseParams.gain;
                    }
                }
                else if (node.node === 'Gain') {
                    for (let i = 0; i < 128; i++) signalBuffers[id][i] = inputBuffer[i] * node.baseParams.gain;
                }
                else if (node.node === 'feedbackDelayNode') {
                    if (!node.delayBuffer) node.delayBuffer = new Float32Array(128);
                    for (let i = 0; i < 128; i++) {
                        const feedbackInput = feedbackBuffers[id]?.[i] || 0;
                        const delayedSample = node.delayBuffer[(node.delayIndex - 1 + 128) % 128];
                        signalBuffers[id][i] = delayedSample;
                        node.delayBuffer[node.delayIndex] = feedbackInput;
                        node.delayIndex = (node.delayIndex + 1) % 128;
                    }
                }
            };
            state.outputConnections.forEach(id => processNode(id.split('.')[0]));
        };

        processGraph(this.currentState, this.signalBuffers, this.feedbackBuffers);
        if (this.nextState.outputConnections) processGraph(this.nextState, this.signalBuffers, this.feedbackBuffers);

        for (let i = 0; i < output.length; i++) {
            let currentSample = this.signalBuffers[this.currentState.outputConnections?.[0]?.split('.')[0]]?.[i] || 0;
            let nextSample = this.signalBuffers[this.nextState.outputConnections?.[0]?.split('.')[0]]?.[i] || 0;
            output[i] = this.crossfadeInProgress ? (1 - this.crossfadeProgress) * currentSample + this.crossfadeProgress * nextSample : currentSample;
            output[i] *= this.outputVolume;
        }
        return true;
    }
}

registerProcessor('DSP', DSP);