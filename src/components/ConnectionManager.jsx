import React, { useEffect, useState, useCallback } from 'react';

function ConnectionManager({ 
  connections, 
  setConnections, 
  activeConnection, 
  setActiveConnection,
  onStartConnection, 
  onCompleteConnection 
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for temporary cable visualization
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (activeConnection) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeConnection]);

  // Start a connection from an output, using useCallback for stability
  const startConnection = useCallback((moduleId, outputIndex, outputRef) => {
    if (moduleId !== undefined && outputIndex !== undefined) {
      setActiveConnection({ moduleId, outputIndex, outputRef });
      console.log(`Started connection from module ${moduleId}, output ${outputIndex}`);
    } else {
      console.warn('Invalid parameters for startConnection');
    }
  }, [setActiveConnection]);

   // Complete a connection to an input, using useCallback for stability
   const completeConnection = useCallback((moduleId, inputIndex, inputRef) => {
    console.log(activeConnection)
    if (!activeConnection) {
      console.warn('No active connection to complete');
      return;
    }

    console.log('Completing connection from:', activeConnection);

    const newConnection = {
      fromModule: activeConnection.moduleId,
      fromOutput: activeConnection.outputIndex,
      fromRef: activeConnection.outputRef,
      toModule: moduleId,
      toInput: inputIndex,
      toRef: inputRef,
    };

    console.log('newConnection', newConnection)

    setConnections((prevConnections) => [...prevConnections, newConnection]);
    setActiveConnection(null); // Clear the active connection
  }, [activeConnection, setConnections, setActiveConnection]);

    // Expose functions to other components via props
    useEffect(() => {
      if (typeof onStartConnection === 'function') {
        onStartConnection(() => startConnection);
      }
      if (typeof onCompleteConnection === 'function') {
        onCompleteConnection(() => completeConnection);
      }
    }, [onStartConnection, onCompleteConnection]);

    useEffect(() => {
      if (activeConnection) {
        console.log('Active connection updated:', activeConnection);
      } else {
        console.log('Active connection cleared or not set');
      }
    }, [activeConnection]);
  return null; // This component doesn't render anything directly
}
// Using React.memo will ensure that ConnectionManager only re-renders when the props actually change.
export default React.memo(ConnectionManager);
