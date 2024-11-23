function generateDynamicDeclarations(parameters) {
    return parameters.map((param) => {
      const name = param.name;
      const initialValue = param.initialValue;
      const min = param.minimum;
      const max = param.maximum;
  
      // If required fields are not present, skip generating declaration
      if (!name || initialValue === undefined || min === undefined || max === undefined) {
        // notify
        console.log('skipped param for missing required fields')
        return ''; // skip incomplete parameter entries
      }
  
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
  
  // Example usage with dynamic parameters
  const parameters = [
    {
      "type": "ParameterTypeNumber",
      "index": 0,
      "name": "frequency",
      "paramId": "frequency",
      "minimum": 110,
      "maximum": 880,
      "exponent": 1,
      "steps": 0,
      "initialValue": 220,
      "isEnum": false,
      "enumValues": [],
      "displayName": "",
      "unit": "",
      "order": 0,
      "debug": false,
      "visible": true,
      "signalIndex": null,
      "ioType": "IOTypeUndefined"
    },
    {
      "type": "ParameterTypeNumber",
      "index": 1,
      "name": "gain",
      "paramId": "gain",
      "minimum": 0,
      "maximum": 1,
      "initialValue": 0.5,
      "isEnum": false,
    }
  ];
  
  const variableDeclarations = generateDynamicDeclarations(parameters);
  console.log(variableDeclarations);
  