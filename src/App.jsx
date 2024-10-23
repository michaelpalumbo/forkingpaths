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
  const handleJackClickRef = useRef(null); // Ref to store the exposed handleJackClick function

  
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

  // // Centralized handleJackClick function
  // const handleJackClick = useCallback((moduleId, jackIndex, jackType, jackRef) => {
  //   if (!clickedJack.current) {
  //     // No jack currently clicked, store the current jack as clicked
  //     clickedJack.current = { moduleId, jackIndex, jackType, jackRef };
  //     console.log('First jack clicked:', moduleId, jackIndex, jackType, jackRef);
  //   } else {
  //     // Check if the same type of jack is clicked again
  //     if (clickedJack.current.jackType === jackType) {
  //       console.warn('Cannot connect two jacks of the same type.');
  //       return;
  //     }

  //     // Create a new connection if types differ
  //     const newConnection = {
  //       fromModule: clickedJack.current.jackType === 'output' ? clickedJack.current.moduleId : moduleId,
  //       fromOutput: clickedJack.current.jackType === 'output' ? clickedJack.current.jackIndex : jackIndex,
  //       fromRef: clickedJack.current.jackRef,
  //       toModule: clickedJack.current.jackType === 'input' ? clickedJack.current.moduleId : moduleId,
  //       toInput: clickedJack.current.jackType === 'input' ? clickedJack.current.jackIndex : jackIndex,
  //       toRef: jackRef,
  //     };

  //     setConnections((prevConnections) => [...prevConnections, newConnection]);
  //     console.log('Connection created:', newConnection);

  //     // Reset the clicked jack after a successful connection
  //     clickedJack.current = null;
  //   }
  // }, []);

  // // Store the jackClick function as a ref on mount
  // useEffect(() => {
  //   handleJackClickRef.current = handleJackClick;
  // }, [handleJackClick]);

  // // Define the click handler in the parent
  // const handleChildClick = useCallback((message) => {
  //   console.log('Event received from child:', message);
  // }, []);


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
        onJackClick={(fn) => (handleJackClickRef.current = fn)} />

        <ModuleManager 
        RNBO={RNBO} 
        modules={modules} 
        setModules={setModules} 
        selectedDevice={selectedDevice} 
        handleJackClick={handleJackClickRef.current}
        />


          <>
            <SynthModuleContainer
              modules={modules}
              audioContext={audioContext}
              RNBO={RNBO}
              handleJackClick={handleJackClickRef.current}
              // onElementClick={handleChildClick}
              removeModule={(id) => setModules(modules.filter((m) => m.id !== id))}
            />

            <Speaker
              key={speakerID.current}
              id={speakerID.current}
              audioContext={audioContext}
              rnbo={RNBO}
              handleJackClick={handleJackClickRef.current}
            />
          </>


        {/* {connections.map((conn, index) => (
            <Cable key={index} connection={conn} />
        ))} */}
    </div>
  );
}

export default App;
