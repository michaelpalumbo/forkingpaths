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
const outputDir = path.join(__dirname, 'src', 'components', 'modules');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// components index (dynamically generated)
const indexFilePath = path.join(__dirname, 'src', 'components', 'modules', 'index.js');
fs.writeFileSync(indexFilePath, '// DO NOT EDIT THIS FILE. IT IS AUTOMATICALLY GENERATED BY device2component.js\n\n')

// Ensure the directory exists
const dirPath = path.dirname(indexFilePath);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Function to generate the JSON file
const generateDeviceList = () => {
  fs.readdir(exportDir, (err, files) => {
    if (err) {
      console.error('Error reading export directory:', err);
      return;
    }

    // Filter JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'dependencies.json'  && file !== 'rnboDevices.json' && file !== 'speaker.export.json');

    // Write the list of JSON files to rnboDevices.json
    fs.writeFile(outputFile, JSON.stringify(jsonFiles, null, 2), (err) => {
      if (err) {
        console.error('Error writing rnboDevices.json:', err);
        return;
      }
      console.log('RNBO device list generated');
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
  let valueString = ``
  for(let i=0; i<parameters.length; i++){
    // set comma
    if(i < (parameters.length - 1)){
      valueString = valueString + ` ${parameters[i].name}: ${parameters[i].value}, `
    } else {
      valueString = valueString + `${parameters[i].name}: ${parameters[i].value} `
    }
    
  }

  const paramControls = parameters
    .map(
      (param) => 
        
        `
        <div key={${param.id}}>
          <label htmlFor="${param.id}">${param.name}: {values.${param.name}}</label>
          <input
            type="range"
            id="${param.id}"
            min={${param.min}}
            max={${param.max}}
            value={values.${param.name}}
            onChange={(e) => handleParamChange("${param.id}", e.target.value)}
          />
        </div>
      `
      
    )
    .join('\n');

  // Generate the full JSX component code
  return `
// DO NOT EDIT THIS FILE. IT IS AUTOMATICALLY GENERATED BY device2component.js

import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';


function ${componentName}({ id, audioContext, onRemove, deviceFile, rnbo, handleJackClick }) {
  const [rnboDevice, setRnboDevice] = useState(null);
  const [values, setValues] = useState({${valueString}})

  const isLoadedRef = useRef(false); // useRef to track if RNBO device has already been loaded


  // set params
  ${paramString}

  useEffect(() => {
    if ( !audioContext || !rnbo ) return; // Wait until AudioContext & RNBO is available

    // Avoid running the effect twice in React 18's Strict Mode
    if (isLoadedRef.current) return; // If already loaded, skip
    isLoadedRef.current = true; // Mark as loaded

    let rnboModule = null; // Local variable to track the current RNBO device

    const loadRNBO = async () => {
    try {

      // Load the RNBO patch data
      const response = await fetch(\`/export/\${deviceFile}\`);   
              
      const patchData = await response.json();


      
      // Create the RNBO module
      rnboModule = await rnbo.createDevice({ context: audioContext, patcher: patchData });

      // Connect the RNBO module to the destination (speakers)
      rnboModule.node.connect(audioContext.destination);

      // Store the RNBO device in the state
      setRnboDevice(rnboModule);


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
  }, [audioContext, deviceFile, rnbo]); // Re-run effect if audioContext changes


  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));

    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param){
        param.value = parseFloat(value);
      } 
    }
  };


  // Handler to click an output jack
  const handleOutputClick = (event) => {
    
    const rect = event.target.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    if (typeof handleJackClick === 'function') {
      handleJackClick(id, 0, 'output', { x: startX, y: startY });
    }
  };

  // Handler to click an input jack
  const handleInputClick = (event) => {
    const rect = event.target.getBoundingClientRect();
    const endX = rect.left + rect.width / 2;
    const endY = rect.top + rect.height / 2;

    if (typeof handleJackClick === 'function') {
      handleJackClick(id, 0, 'input', { x: endX, y: endY });
    }
  };

    const handleClick = () => {
    if (typeof onElementClick === 'function') {
      onElementClick('Child element clicked!');
    }
  };

  return (

  <Draggable cancel="input, select">
    <div style={{ padding: '10px', border: '1px solid black', margin: '10px' }}>
      <p>${componentName}</p>
        ${paramControls}

        {/* Interactive Output Jack */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'red',
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            cursor: 'pointer',
          }}
          title="Output"
          onMouseDown={handleOutputClick} // Start connection on mousedown
        />

        {/* Interactive Input Jack */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'blue',
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            cursor: 'pointer',
          }}
          title="Input"
          onMouseUp={handleInputClick} // Complete connection on mouseup
        />
            <button onClick={handleClick}>Click Me</button>

      <button onClick={() => {
        if (rnboDevice) {
          rnboDevice.node.disconnect(); // Ensure RNBO is disconnected before removal
          console.log("RNBO device removed and disconnected");
        }
        onRemove(); // Call parent removal function
          }} style={{ marginLeft: '10px', color: 'red' }}>
        X
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
    files.filter((file) => (file.endsWith('.export.json'))  && file !== 'dependencies.json'  && file !== 'rnboDevices.json' && file !== 'speaker.export.json').forEach((file) => {
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
            console.log('Generated component for:', file);
          }
        });
        // update index.js
        fs.appendFile(indexFilePath, `export { default as '${file.split('.export.json')[0]}' } from './${file.split('.export.json')[0]}';\n`, (err) => {
          if (err) {
              console.log(err);
          }
          else {

          }
      }); 


      });
    });

  });




};

// Run the script to process all RNBO JSON files
processRnboFiles();

