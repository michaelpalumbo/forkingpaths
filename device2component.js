import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use ES module approach for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Directory where RNBO JSON files are stored
const exportDir = path.join(__dirname, 'public', 'export');

// path for list of rnbo devices
const outputFile = path.join(exportDir, 'rnboDevices.json');

// Directory where the generated components will be saved
const outputDir = path.join(__dirname, 'src', 'components');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate the JSON file
const generateDeviceList = () => {
  fs.readdir(exportDir, (err, files) => {
    if (err) {
      console.error('Error reading export directory:', err);
      return;
    }

    // Filter JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'dependencies.json'  && file !== 'rnboDevices.json');

    // Write the list of JSON files to rnboDevices.json
    fs.writeFile(outputFile, JSON.stringify(jsonFiles, null, 2), (err) => {
      if (err) {
        console.error('Error writing rnboDevices.json:', err);
        return;
      }
      console.log('RNBO device list successfully generated!');
    });
  });
};


// Run the function
generateDeviceList();

function generateDynamicDeclarations(parameters) {
  return parameters.map((param) => {
    const name = param.name;
    const initialValue = param.value;
    const min = param.min;
    const max = param.max;
    console.log('param', param)

    const stateName = name;
    const rangeName = `${name}Range`;

    return `
  const [${stateName}, set${capitalize(stateName)}] = useState(${initialValue});
  const [${rangeName}, set${capitalize(rangeName)}] = useState({ min: ${min}, max: ${max} });
    `; // trim to clean up extra spaces
  }).filter(Boolean).join('\n'); // Filter out empty strings
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// const variableDeclarations = generateDynamicDeclarations(parameters);

// Function to generate a React component from an RNBO device
const generateReactComponent = (fileName, parameters, paramString) => {
  const componentName = path.basename(fileName, '.export.json'); // Use filename without extension as component name
  const paramControls = parameters
    .map(
      (param) => `
        <div key={${param.id}}>
          <label htmlFor="${param.id}">${param.name}: {values.${param.id}}</label>
          <input
            type="range"
            id="${param.id}"
            min={${param.min}}
            max={${param.max}}
            value={values.${param.id}}
            onChange={(e) => handleParamChange("${param.id}", e.target.value)}
          />
        </div>
      `
    )
    .join('\n');

  // Generate the full JSX component code
  return `
import React, { useState } from 'react';
import { RNBO } from '@rnbo/js';
import Draggable from 'react-draggable';

function SynthModule({ id, audioContext, onRemove, deviceFile }) {
  const [rnboDevice, setRnboDevice] = useState(null);

  // set params
  ${paramString}

  // useEffect(() => {
  //   const loadRNBO = async () => {
  //     const response = await fetch('/export/${fileName}');
  //     const patchData = await response.json();
  //     const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });
  //     rnbo.node.connect(audioContext.destination);
  //     setRnboDevice(rnbo);
  //   };

  //   loadRNBO();

  //   return () => {
  //     if (rnboDevice) rnboDevice.node.disconnect();
  //   };
  // }, [audioContext]);

  useEffect(() => {
        if (!audioContext) return; // Wait until AudioContext is available

        const loadRNBO = async () => {
        try {
            // Load the RNBO patch data
            const response = await fetch(\`/export/\${deviceFile}\`);            
            const patchData = await response.json();
            console.log(response)
            // Create the RNBO device
            const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });

            // Connect the RNBO device to the destination (speakers)
            rnbo.node.connect(audioContext.destination);

            // Store the RNBO device in the state
            setRnboDevice(rnbo);


        } catch (error) {
            console.error("Error loading RNBO device:", error);
        }
        };

        // Load the RNBO device
        loadRNBO();

        return () => {
        // Cleanup when the component unmounts
        if (rnboDevice) {
            // Stop the RNBO device (if it has a stop method or similar mechanism)
            if (rnboDevice.node) {
                rnboDevice.node.disconnect(); // Disconnect from the audio context
            }
        }
        };
    }, [audioContext]); // Re-run effect if audioContext changes


  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));
    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param) param.value = parseFloat(value);
    }
  };

    const handlePlay = () => {
        
        if (rnboDevice) {
            console.log("AudioContext State:", audioContext.state); // Log the state

            if (audioContext.state !== 'running') {
                audioContext.resume().then(() => {
                console.log("AudioContext resumed");
                });
            }
            
        // Trigger audio or start event in the RNBO device if needed
        console.log('RNBO device started');
        }
    };

    const handleStop = () => {
        if (rnboDevice) {
        // Logic to stop/reset RNBO device if needed
        console.log('RNBO device stopped');
        }
    };

  return (

  <Draggable cancel="input, select">
        <div style={{ padding: '10px', border: '1px solid black', margin: '10px' }}>
        <p>Synth Module (ID: {id})</p>
          ${paramControls}

        <button onMouseDown={handlePlay}>
            Play
        </button>
        <button onClick={() => {
            if (rnboDevice) {
              rnboDevice.node.disconnect(); // Ensure RNBO is disconnected before removal
              console.log("RNBO device removed and disconnected");
            }
            onRemove(); // Call parent removal function
          }} style={{ marginLeft: '10px', color: 'red' }}>
            Remove
        </button>
        </div>
        </Draggable>
        
  );
}

export default ${componentName};
`;
};

// Function to process all RNBO JSON files and generate corresponding React components
const processRnboFiles = () => {
  fs.readdir(exportDir, (err, files) => {
    if (err) {
      console.error('Error reading export directory:', err);
      return;
    }
    files.filter((file) => (file.endsWith('.export.json'))  && file !== 'dependencies.json'  && file !== 'rnboDevices.json').forEach((file) => {
      const filePath = path.join(exportDir, file);

      // Read the RNBO JSON file
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', filePath, err);
          return;
        }
        // Parse the RNBO JSON file to get the parameters
        const rnboPatch = JSON.parse(data);
        fs.writeFileSync('test.json', JSON.stringify(rnboPatch, null, 2))
        const parameters = rnboPatch.desc.parameters.map((param) => ({
          id: param.paramId,
          name: param.name,
          min: param.minimum,
          max: param.maximum,
          value: param.initialValue,
          exponent: param.exponent,
          steps: param.steps,
          // to do, get other keys in the desc object, like "outputs"
        }));
        let paramString = generateDynamicDeclarations(parameters)
        // Generate the React component
        const componentCode = generateReactComponent(file, parameters, paramString);

        // Write the React component to a new .jsx file in the output directory
        const componentFileName = path.join(outputDir, `${path.basename(file, '.export.json')}.jsx`);
        fs.writeFile(componentFileName, componentCode, (err) => {
          if (err) {
            console.error('Error writing component file:', componentFileName, err);
          } else {
            console.log('Successfully generated component for:', file);
          }
        });
      });
    });
  });
};

// Run the script to process all RNBO JSON files
processRnboFiles();
