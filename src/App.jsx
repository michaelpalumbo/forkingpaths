import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
/* Components */
import RNBOManager from './components/RNBOManager';
import DeviceSelector from './components/DeviceSelector';
import ModuleManager from './components/ModuleManager';
import SynthModuleContainer from './components/SynthModuleContainer';
import ConnectionManager from './components/ConnectionManager';
import DSPSwitch from './components/UI/DSPSwitch';
import Speaker from './components/UI/Speaker';
import Cable from './components/UI/Cable';

function App() {
  const [RNBO, setRNBO] = useState(null);
  const [modules, setModules] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [isDSPOn, setIsDSPOn] = useState(false);
  const [rnboDevices, setRnboDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  // const [connections, setConnections] = useState([]);
  const handleJackClickRef = useRef(null); // Ref to store the exposed handleJackClick function (in ConnectionManager)
  const updateCablePositionRef = useRef(null); // Ref to store the exposed updateCablePosition function (in ConnectionManager)
  
  const speakerID = useRef(uuidv4());


  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/export/rnboDevices.json');
        if (!response.ok) throw new Error('Failed to fetch RNBO devices');
        const devices = await response.json();
        setRnboDevices(devices);
      } catch (error) {
        console.error('Error fetching RNBO devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const handleDSPToggle = async (newState) => {
    setIsDSPOn(newState);

    if (audioContext) {
      if (newState) {
        // Resume AudioContext when DSP is turned ON
        if (audioContext.state !== 'running') {
          try {
            await audioContext.resume();
            console.log('AudioContext resumed');
          } catch (error) {
            console.error('Failed to resume AudioContext:', error);
          }
        }
      } else {
        // Suspend AudioContext when DSP is turned OFF
        try {
          await audioContext.suspend();
          console.log('AudioContext suspended');
        } catch (error) {
          console.error('Failed to suspend AudioContext:', error);
        }
      }
    }
  };



  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>
        <h1>Forking Paths</h1>

        <h2>Does not work in Brave Browser, use Chrome</h2>
      
        <RNBOManager setRNBO={setRNBO} />

        {/* Pass DSP state and toggle function to DSPSwitch */}
        <DSPSwitch isDSPOn={isDSPOn} onToggle={handleDSPToggle} />

        <DeviceSelector
            devices={rnboDevices}
            selectedDevice={selectedDevice}
            onDeviceChange={(e) => setSelectedDevice(e.target.value)}
        />
        {/* ConnectionManager sets up handleJackClick */}
        <ConnectionManager 
        onJackClick={(fn) => (handleJackClickRef.current = fn)}
        onUpdateCablePosition={(fn) => (updateCablePositionRef.current = fn)}
         />
        

        <ModuleManager 
        RNBO={RNBO} 
        modules={modules} 
        setModules={setModules} 
        selectedDevice={selectedDevice} 
        handleJackClick={handleJackClickRef.current}
        updateCablePosition={updateCablePositionRef.current}
        />


          <>
            <SynthModuleContainer
              modules={modules}
              audioContext={audioContext}
              RNBO={RNBO}
              handleJackClick={handleJackClickRef.current}
              updateCablePosition={updateCablePositionRef.current}
              // onElementClick={handleChildClick}
              removeModule={(id) => setModules(modules.filter((m) => m.id !== id))}
            />

            <Speaker
              key={speakerID.current}
              id={speakerID.current}
              audioContext={audioContext}
              rnbo={RNBO}
              handleJackClick={handleJackClickRef.current}
              updateCablePosition={updateCablePositionRef.current}
            />
          </>


        {/* {connections.map((conn, index) => (
            <Cable key={index} connection={conn} />
        ))} */}
    </div>
  );
}

export default App;
