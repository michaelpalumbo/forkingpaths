import React, { useState, useCallback } from 'react';

function ConnectionManager({ connections, setConnections, onJackClick }) {
  const [clickedJack, setClickedJack] = useState(null);

  // Handle clicking a jack
  const handleJackClick = useCallback((moduleId, jackIndex, jackType, jackRef) => {
    if (!clickedJack) {
      // No jack is currently clicked, set the current jack as clicked
      setClickedJack({ moduleId, jackIndex, jackType, jackRef });
      console.log(moduleId, jackIndex, jackType, jackRef)
    } else {
      // If the same type of jack is clicked again
      if (clickedJack.jackType === jackType) {
        console.warn('Cannot connect two jacks of the same type.');
        return; // Do not reset the state or create a connection
      }

      // Create a new connection if types differ
      const newConnection = {
        fromModule: clickedJack.jackType === 'output' ? clickedJack.moduleId : moduleId,
        fromOutput: clickedJack.jackType === 'output' ? clickedJack.jackIndex : jackIndex,
        fromRef: clickedJack.jackRef,
        toModule: clickedJack.jackType === 'input' ? clickedJack.moduleId : moduleId,
        toInput: clickedJack.jackType === 'input' ? clickedJack.jackIndex : jackIndex,
        toRef: jackRef,
      };

      setConnections((prevConnections) => [...prevConnections, newConnection]);
      console.log('Connection created:', newConnection);

      // Reset the clicked jack after a successful connection
      setClickedJack(null);
    }
  }, [clickedJack, setConnections]);

  // Expose the handleJackClick function to other components via props
  if (onJackClick) {
    onJackClick(handleJackClick);
  }
  return null; // No direct rendering
}

export default React.memo(ConnectionManager);
