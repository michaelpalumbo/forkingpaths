class SequencerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.currentStepIndex = 0;
    this.sequencerData = {}
    this.microTiming = [];
    this.changeNodes = [];
    this.elapsedSamples = 0;
    this.samplesPerStep = 0;
    this.sampleRate = sampleRate;
    this.play = false


    this.port.onmessage = (e) => {
      console.log(e.data)

      switch (e.data.cmd) {
        case 'updateSequence':
          this.sequencerData = e.data.data
          this.microTiming = this.sequencerData.microTiming.map(ms => ms / 1000);
          this.changeNodes = this.sequencerData.changeNodes;
          this.sequencerRowNumber = this.sequencerData.sequencerRowNumber
          this.currentStepIndex = 0;
          this.elapsedSamples = 0;
          this.samplesPerStep = this.microTiming[0] * this.sampleRate;


          console.log(this.sequencerRowNumber)
          break;
        case 'start':
          this.play = true;
          break;
        case 'stop':
          this.play = false;
          this.currentStepIndex = 0;
          this.elapsedSamples = 0;
        break;
      };
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.play || this.microTiming.length === 0 || !this.changeNodes.some(item => item !== 0)) return true;
    const bufferSize = outputs[0][0].length;
    this.elapsedSamples += bufferSize;

    if (this.elapsedSamples >= this.samplesPerStep) {
      this.elapsedSamples -= this.samplesPerStep;

      // Post step to main thread
      this.port.postMessage({
        cmd: 'changeNode',
        data: this.changeNodes[this.currentStepIndex],
        sequencerRowNumber: this.sequencerRowNumber[this.currentStepIndex]
      });

      this.currentStepIndex = (this.currentStepIndex + 1) % this.microTiming.length;
      this.samplesPerStep = this.microTiming[this.currentStepIndex] * this.sampleRate;
    }

    return true;
  }
}

registerProcessor('sequencer-processor', SequencerProcessor);
