import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use `import.meta.url` to get the current file's URL and derive `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the export folder
const exportDir = path.join(__dirname, 'public', 'export');
const outputFile = path.join(exportDir, 'rnboDevices.json');

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
