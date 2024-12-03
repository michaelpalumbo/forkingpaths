class ModularSynthProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.nodes = {};
        this.connections = [];
        this.outputConnections = []; // List of nodes connected to the output
        this.port.onmessage = (event) => this.handleMessage(event.data);
    }

    handleMessage(data) {
        const { cmd, id, targetId, params } = data;

        if (cmd === 'addNode') {
            if (!this.nodes[id]) {
                this.nodes[id] = {
                    node: params.node || 'Oscillator',
                    frequency: params.frequency || 440,
                    gain: params.gain || 1,
                    output: new Float32Array(128),
                    phase: 0,
                };
                console.log(`Added node ${id}`);
            } else {
                console.warn(`Node ${id} already exists`);
            }
        } else if (cmd === 'connectToOutput') {
            if (this.nodes[id] && !this.outputConnections.includes(id)) {
                this.outputConnections.push(id);
                console.log(`Connected node ${id} to output`);
            }
        } else if (cmd === 'disconnectFromOutput') {
            const index = this.outputConnections.indexOf(id);
            if (index >= 0) {
                this.outputConnections.splice(index, 1);
                console.log(`Disconnected node ${id} from output`);
            }
        } else if (cmd === 'updateNode') {
            if (this.nodes[id]) {
                Object.assign(this.nodes[id], params);
                console.log(`Updated node ${id}:`, this.nodes[id]);
            } else {
                console.warn(`Node ${id} not found for update`);
            }
        } else if (cmd === 'removeNode') {
            if (this.nodes[id]) {
                delete this.nodes[id];
                console.log(`Removed node ${id}`);
            }
        }
    }

    process(inputs, outputs) {
        const output = outputs[0][0];
        output.fill(0);

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

        return true;
    }
}

registerProcessor('modular-synth-processor', ModularSynthProcessor);
