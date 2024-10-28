import React, { useState, useCallback,useRef, useEffect } from 'react';
import Cable from '../../src/components/UI/Cable';
import AudioNodeManager from './AudioNodeManager';

function ConnectionManager({ onJackClick, onUpdateCablePosition}) {
  const [clickedJack, setClickedJack] = useState(null);
  const [connections, setConnections] = useState([]);

  const clickedJackRef = useRef(null)

  // Handle clicking a jack
  const handleJackClick = useCallback((moduleId, jackIndex, jackType, jackRef) => {

    if (!clickedJackRef.current) {
      // No jack is currently clicked, set the current jack as clicked
      clickedJackRef.current = { moduleId, jackIndex, jackType, jackRef };
      console.log('first jack clicked for new cable', moduleId, jackIndex, jackType, jackRef)
    } else {
      // If the same type of jack is clicked again
      if (clickedJackRef.current.jackType === jackType) {
        console.warn('Cannot connect two jacks of the same type.');
        return; // Do not reset the state or create a connection
      }

      // Create a new connection if types differ
      const newConnection = {
        fromModule: clickedJackRef.current.jackType === 'output' ? clickedJackRef.current.moduleId : moduleId,
        fromOutput: clickedJackRef.current.jackType === 'output' ? clickedJackRef.current.jackIndex : jackIndex,
        fromRef: clickedJackRef.current.jackRef,
        toModule: clickedJackRef.current.jackType === 'input' ? clickedJackRef.current.moduleId : moduleId,
        toInput: clickedJackRef.current.jackType === 'input' ? clickedJackRef.current.jackIndex : jackIndex,
        toRef: jackRef,
      };

      setConnections((prevConnections) => [...prevConnections, newConnection]);
      // console.log('Connection created:', newConnection);

      // Call handleNewConnection to update the audio graph
      handleNewConnection(newConnection);
      // Reset the clicked jack after a successful connection
      clickedJackRef.current = null;    }
  }, []);
  
  // Function to update cable position based on module movement
  const updateCablePosition = useCallback((moduleId, jackIndex, jackType, newPos) => {
    
    setConnections((prevConnections) =>
      prevConnections.map((conn) => {
        if (
          (jackType === 'output' && conn.fromModule === moduleId && conn.fromOutput === jackIndex) ||
          (jackType === 'input' && conn.toModule === moduleId && conn.toInput === jackIndex)
        ) {
          return {
            ...conn,
            fromRef: jackType === 'output' ? newPos : conn.fromRef,
            toRef: jackType === 'input' ? newPos : conn.toRef,
          };
        }
        return conn;
      })
    );
  }, []);

  // Update signal flow based on cable creation
  const handleNewConnection = useCallback((connection) => {
    const { fromModule, toModule, fromOutput, toInput } = connection;
    AudioNodeManager.connectNodes(fromModule, toModule, fromOutput, toInput);
    console.log(`New connection created: ${fromModule} -> ${toModule}`);
  }, []);

  // Update signal flow based on cable deletion
  const deleteCable = useCallback((index) => {
    const connection = connections[index];
    if (connection) {
      const { fromModule, toModule, fromOutput, toInput } = connection;
      AudioNodeManager.disconnectNodes(fromModule, toModule);
      console.log(`Connection deleted: ${fromModule} -> ${toModule}`);
    }

    setConnections((prev) => prev.filter((_, i) => i !== index));
  }, [connections]);

  // Expose the handleJackClick function to other components via props
  // Expose handleJackClick to parent
  useEffect(() => {
    if (onJackClick) {
      onJackClick(handleJackClick);
    }
  }, [handleJackClick, onJackClick]);

  // Expose updateCablePosition to parent
  useEffect(() => {
    if (onUpdateCablePosition) {
      onUpdateCablePosition(updateCablePosition); // Pass only updateCablePosition
    }
  }, [updateCablePosition, onUpdateCablePosition]);

    // // Update cable endpoints when modules move
    // useEffect(() => {
    //   setConnections((prevConnections) =>
    //     prevConnections.map((conn) => {
    //       const fromModule = modules.find((mod) => mod.id === conn.fromModule);
    //       const toModule = modules.find((mod) => mod.id === conn.toModule);

    //       return {
    //         ...conn,
    //         fromRef: fromModule ? fromModule.output : conn.fromRef,
    //         toRef: toModule ? toModule.input : conn.toRef,
    //       };
    //     })
    //   );
    // }, [modules]);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
      {/* Render cables dynamically */}
      {connections.map((connection, index) => (
        <Cable
          key={index}
          fromRef={connection.fromRef}
          toRef={connection.toRef}
          onDelete={() => deleteCable(index)}

        />
      ))}
    </div>
  ); 
}

export default React.memo(ConnectionManager);
