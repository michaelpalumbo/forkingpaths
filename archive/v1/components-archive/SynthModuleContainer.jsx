import React from 'react';
import * as Components from '../../src/components/modules'; // Dynamically generated components

function SynthModuleContainer({ modules, audioContext, RNBO, removeModule, handleJackClick, updateCablePosition }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {modules.map((module) => {
        const componentName = module.deviceFile.replace('.export.json', '');
        const SynthModule = Components[componentName];
        console.log(module.id)
        return SynthModule ? (
          <SynthModule
            key={module.id}
            id={module.id}
            audioContext={audioContext}
            deviceFile={module.deviceFile}
            rnbo={RNBO}
            onRemove={() => removeModule(module.id)}
            handleJackClick={handleJackClick}
            updateCablePosition={updateCablePosition}
          />
        ) : (
          <div key={module.id}>Component {componentName} not found...</div>
        );
      })}
    </div>
  );
}

export default SynthModuleContainer;
