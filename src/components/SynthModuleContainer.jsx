import React from 'react';
import * as Components from './modules'; // Dynamically generated components

function SynthModuleContainer({ modules, audioContext, RNBO, removeModule, startConnection, completeConnection, handleJackClick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {modules.map((module) => {
        const componentName = module.deviceFile.replace('.export.json', '');
        const SynthModule = Components[componentName];

        return SynthModule ? (
          <SynthModule
            key={module.id}
            id={module.id}
            audioContext={audioContext}
            deviceFile={module.deviceFile}
            rnbo={RNBO}
            onRemove={() => removeModule(module.id)}
            startConnection={startConnection}
            completeConnection={completeConnection}
            handleJackClick={handleJackClick}
          />
        ) : (
          <div key={module.id}>Component {componentName} not found...</div>
        );
      })}
    </div>
  );
}

export default SynthModuleContainer;
