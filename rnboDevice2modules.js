import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import audioNodes from './src/modules/webAudioNodes.json' assert { type: 'json'}


async function processFiles() {
    let modules = {
        webAudioNodes: audioNodes,
        rnboDevices: {}
    }
    const folderPath = join(process.cwd(), './public/export/'); // Folder to process

    try {

        // Read all files in the folder
        const files = await readdir(folderPath);

        // Filter only `.export.json` files
        const jsonFiles = files.filter((file) => file.endsWith('.export.json'));

        // Loop through the files
        for (const file of jsonFiles) {
            const filePath = join(folderPath, file);

            // Load the file contents
            const fileContent = await readFile(filePath, 'utf8');

            // Parse the JSON
            const jsonData = JSON.parse(fileContent);

            // Your custom code here
            let moduleName = file.split('.export.json')[0]
            modules.rnboDevices[moduleName]= {
                inputs: jsonData.desc.inlets,
                params: jsonData.desc.parameters,
                outputs: jsonData.desc.outlets
            }
            

            // Example: If you want to modify the JSON
            // jsonData.newKey = "newValue";

            // Example: If you want to save the modified JSON
            
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }


    await writeFile('./src/modules/modules.json', JSON.stringify(modules, null, 2));

}

processFiles();
