import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import Draggable from 'react-draggable';

function SynthModule() {
    const [synth, setSynth] = useState(null);
    const [frequency, setFrequency] = useState(440);
    const [waveform, setWaveform] = useState('sine');
    const [volume, setVolume] = useState(-10);

    useEffect(() => {
        const oscillator = new Tone.Oscillator(frequency, waveform).start();
        const volumeControl = new Tone.Volume(volume).toDestination();

        oscillator.connect(volumeControl);
        setSynth(oscillator);

        return () => {
        oscillator.stop();
        };
    }, []);

    useEffect(() => {
        if (synth) {
        synth.frequency.value = frequency;
        synth.type = waveform;
        }
    }, [frequency, waveform]);

    useEffect(() => {
        if (synth) {
        synth.volume.value = volume;
        }
    }, [volume]);

    const handleStart = () => {
        if (synth) {
        Tone.start();
        synth.start();
        }
    };

    const handleStop = () => {
        if (synth) {
        synth.stop();
        }
    };

    // Handle drag and log the position
    const handleDrag = (e, data) => {
        console.log(`Module position: x=${data.x}, y=${data.y}`);
      };

  return (
    <Draggable cancel="input, select"
        onDrag={handleDrag} // Log position while dragging
    >
      {/* Ensure Draggable wraps only one child (a single div) */}
      <div
        style={{
          width: '220px',
          padding: '10px',
          border: '1px solid black',
          margin: '10px',
          textAlign: 'center',
          backgroundColor: '#e0e0e0',
          cursor: 'move',
          color: 'black',
        }}
      >
        <p>Synth Module</p>
        <button onMouseDown={handleStart} onMouseUp={handleStop}>
          Play
        </button>
        <div style={{ margin: '10px 0' }}>
          <label>
            Frequency:
            <input
              type="range"
              min="20"
              max="2000"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            {frequency} Hz
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>
            Waveform:
            <select value={waveform} onChange={(e) => setWaveform(e.target.value)}>
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </label>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>
            Volume:
            <input
              type="range"
              min="-60"
              max="0"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
            {volume} dB
          </label>
        </div>
      </div>
    </Draggable>
  );
}

export default SynthModule;
