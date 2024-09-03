import React, { useState } from 'react';

function App() {
    const [deviceUrl, setDeviceUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadDevice = async (url) => {
        setIsLoading(true);
        try {
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const module = await WebAssembly.compile(buffer);
            const instance = await WebAssembly.instantiate(module);

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const rnboNode = audioContext.createGain(); // Replace with RNBO node initialization
            instance.exports.initialize(rnboNode);
            rnboNode.connect(audioContext.destination);

            console.log('RNBO device loaded and connected.');
        } catch (error) {
            console.error('Error loading RNBO device:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>RNBO Web Application</h1>
            <select onChange={(e) => loadDevice(`/device/${e.target.value}`)}>
                <option value="">Select RNBO Device</option>
                <option value="device1.wasm">Device 1</option>
                <option value="device2.wasm">Device 2</option>
                {/* Add more options as needed */}
            </select>
            {isLoading && <p>Loading...</p>}
        </div>
    );
}

export default App;
