import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use ES module approach for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Directory where RNBO JSON files are stored
const exportDir = path.join(__dirname, 'public', 'export');

// Directory where the generated components will be saved
const outputDir = path.join(__dirname, 'src', 'components');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generateDynamicDeclarations(parameters) {
  return parameters.map((param) => {
    const name = param.name;
    const initialValue = param.value;
    const min = param.minimum;
    const max = param.maximum;
    console.log('param', param)
    // // If required fields are not present, skip generating declaration
    // if (!name || initialValue === undefined || min === undefined || max === undefined) {
    //   // notify
    //   console.log('skipped param for missing required fields', param)
    //   return ''; // skip incomplete parameter entries
    // }

    const stateName = name;
    const rangeName = `${name}Range`;

    return `
const [${stateName}, set${capitalize(stateName)}] = useState(${initialValue});
const [${rangeName}, set${capitalize(rangeName)}] = useState({ min: ${min}, max: ${max} });
    `.trim(); // trim to clean up extra spaces
  }).filter(Boolean).join('\n'); // Filter out empty strings
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// const variableDeclarations = generateDynamicDeclarations(parameters);

// Function to generate a React component from an RNBO device
const generateReactComponent = (fileName, parameters, paramString) => {
  console.log(paramString)
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

  const [values, setValues] = useState(${JSON.stringify(
    parameters.reduce((acc, param) => {
      acc[param.id] = param.value;
      return acc;
    }, {})
  )});

  useEffect(() => {
    const loadRNBO = async () => {
      const response = await fetch('/export/${fileName}');
      const patchData = await response.json();
      const rnbo = await RNBO.createDevice({ context: audioContext, patcher: patchData });
      rnbo.node.connect(audioContext.destination);
      setRnboDevice(rnbo);
    };

    loadRNBO();

    return () => {
      if (rnboDevice) rnboDevice.node.disconnect();
    };
  }, [audioContext]);

  const handleParamChange = (paramId, value) => {
    setValues((prev) => ({ ...prev, [paramId]: value }));
    if (rnboDevice) {
      const param = rnboDevice.parameters.find(p => p.id === paramId);
      if (param) param.value = parseFloat(value);
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid black', margin: '10px' }}>
      <h3>${componentName} Module</h3>
      ${paramControls}
      <button onClick={onRemove} style={{ color: 'red', marginTop: '10px' }}>Remove</button>
    </div>
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
