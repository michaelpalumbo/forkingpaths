import { readdir, readFile, writeFile } from 'fs/promises';
import { extname, resolve, join } from 'path';
import audioNodes from '../modules/webAudioNodes.json' assert { type: 'json'}
import pako from 'pako'

//! note that we pivoted from using RNBO in this project due to many reasons

async function getJsonFiles(directoryPath) {
    try {
        // // Read all files in the directory
        // const files = await readdir(directoryPath);

        // // Filter out only .json files
        // const jsonFiles = files.filter(file => extname(file).toLowerCase() === '.json');
        // const rnboFiles = jsonFiles.filter(item => !['modules.json', 'dependencies.json'].includes(item));


        Object.keys(audioNodes).forEach((module) => {
            console.log(`processed module: ${module}`)
        })
        let modules = {
            webAudioNodes: audioNodes, // this is easy, just add the audioNodes directly
            // rnboDevices: {}
        }
        // const folderPath = join(process.cwd(), './public/export/'); // Folder to process
        /*
        // Loop through the RNBO files
        for (const file of rnboFiles) {
            const filePath = join(folderPath, file);
            // Load the file contents
            const fileContent = await readFile(filePath, 'utf8');
            // console.log(fileContent)
            // Parse the JSON
            const jsonData = JSON.parse(fileContent);

            const moduleName = file.split('.export.json')[0]





            try {
                
                // ✅ Step 1: Decode Base64 to binary
                const compressedBinary = Uint8Array.from(atob(jsonData.src[0].code), c => c.charCodeAt(0));

                // ✅ Step 2: Decompress zlib (using pako.js or similar library)
                let decompressedBinary = pako.inflate(compressedBinary);

                // Write binary data to separate file
                const wasmFilePath = `./src/wasm/${moduleName}.wasm.js`;

                await writeFile(wasmFilePath, decompressedBinary);
                
                // ✅ Step 4: Read the newly written file (await required)
                let content = await readFile(wasmFilePath, 'utf8');

                // ✅ Wrap the entire RNBO script inside a function
                const wrappedContent = 
                `export default async function loadRNBO() {
                    return new Promise((resolve, reject) => {
                        try {
                            let Module = {};
                            (function() {
                                ${content}
                            })();
                            resolve(Module);
                        } catch (error) {
                            reject(error);
                        }
                    });
                };
                        `;
                        
                                // ✅ Write the modified file back
                await writeFile(wasmFilePath, content, 'utf8');
                console.log(`✅ Wrapped RNBO module as ES6: ${wasmFilePath}`);
                


                modules.rnboDevices[moduleName] = {
                    parameters: {},
                    paramNames: [],
                    cvNames: [],
                    cv: {},
                    inputs: [],
                    outputs: [],
                    structure: 'rnboDevice',
                    src: wasmFilePath,
                    desc: jsonData.desc
                }
                
                      // console.log(jsonData.src)
                jsonData.desc.inlets.forEach((input) =>{
                    if(input.meta){
                        modules.rnboDevices[moduleName].inputs.push(input.meta)
                    }else {
                        modules.rnboDevices[moduleName].inputs.push(input.tag)
                    }
                })
                
                jsonData.desc.outlets.forEach((output) =>{
                
                    if(output.meta){
                        modules.rnboDevices[moduleName].outputs.push(output.meta.name)
                    } else {
                        modules.rnboDevices[moduleName].outputs.push(output.tag)
                    }
                })


                jsonData.desc.parameters.forEach((param) =>{
                    
                    const paramName = param.name
                    modules.rnboDevices[moduleName].paramNames.push(paramName)
                    modules.rnboDevices[moduleName].cvNames.push(paramName)

                    modules.rnboDevices[moduleName].parameters[paramName] = param
                    modules.rnboDevices[moduleName].cv[paramName] = param

                    if(param.meta && param.meta.description){
                        modules.rnboDevices[moduleName].parameters[paramName].description = param.description
                        modules.rnboDevices[moduleName].cv[paramName].description = param.description

                    } else {
                        modules.rnboDevices[moduleName].cv[paramName].description = param.name
                        modules.rnboDevices[moduleName].parameters[paramName].description = param.name
                    }
                    
                    
                })
                
                // const decodedCode = atob(jsonData.src.code); // Decode Base64 if necessary
                // modules.rnboDevices[moduleName].src = new Function('"use strict"; return ' + decodedCode)();
                console.log(`✅ RNBO DSP initialized for ${moduleName}`)
                
            } catch (error) {
                console.error(`❌ Failed to initialize RNBO DSP: ${error}`);
            }

        
        }
        */
            
        await writeFile('./src/modules/modules.json', JSON.stringify(modules, null, 2));

    } catch (error) {
        console.error('Error reading directory:', error.message);
        return [];
    }
}



// Replace with your directory path
const folderPath = resolve('./public/export');
getJsonFiles(folderPath)

