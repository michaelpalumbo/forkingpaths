import { readdir, readFile, writeFile } from 'fs/promises';
import { extname, resolve, join } from 'path';
import audioNodes from './src/modules/webAudioNodes.json' assert { type: 'json'}

async function getJsonFiles(directoryPath) {
    try {
        // Read all files in the directory
        const files = await readdir(directoryPath);

        // Filter out only .json files
        const jsonFiles = files.filter(file => extname(file).toLowerCase() === '.json');
        const rnboFiles = jsonFiles.filter(item => !['modules.json', 'dependencies.json'].includes(item));


        // console.log(jsons)
    let modules = {
        webAudioNodes: audioNodes,
        rnboDevices: {}
    }
    // const folderPath = join(process.cwd(), './public/export/'); // Folder to process

    // Loop through the files
    for (const file of rnboFiles) {
        const filePath = join(folderPath, file);
        // Load the file contents
        const fileContent = await readFile(filePath, 'utf8');
        // console.log(fileContent)
        // Parse the JSON
        const jsonData = JSON.parse(fileContent);

        const moduleName = file.split('.export.json')[0]

        modules.rnboDevices[moduleName] = {
            parameters: {},
            paramNames: [],
            cvNames: [],
            cv: {},
            inputs: [],
            outputs: []
        }
        jsonData.desc.inlets.forEach((input) =>{
            if(input.meta){
                modules.rnboDevices[moduleName].inputs.push(input.meta)
            }else {
                modules.rnboDevices[moduleName].inputs.push(input.tag)
            }
        })
        
        jsonData.desc.outlets.forEach((output) =>{
            console.log(moduleName, output)
            if(output.meta){
                modules.rnboDevices[moduleName].outputs.push(output.meta.name)
            }else {
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

        // console.log(modules)
        // Example: If you want to modify the JSON
        // jsonData.newKey = "newValue";

        // Example: If you want to save the modified JSON
        
    }

    await writeFile('./src/modules/modules.json', JSON.stringify(modules, null, 2));

    // console.log(modules.rnboDevices)
        // console.log('JSON files:', rnboModules);
        // return rnboModules;
    } catch (error) {
        console.error('Error reading directory:', error.message);
        return [];
    }
}

// Replace with your directory path
const folderPath = resolve('./public/export');
getJsonFiles(folderPath)

// .then(rnboFiles => {

//     // console.log(jsons)
//     let modules = {
//         webAudioNodes: audioNodes,
//         rnboDevices: {}
//     }
//     // const folderPath = join(process.cwd(), './public/export/'); // Folder to process

//     // Loop through the files
//     for (const file of rnboFiles) {
//         const filePath = join(folderPath, file);
//         console.log(filePath)
//         // Load the file contents
//         const fileContent = readFile(filePath, 'utf8');
//         console.log(fileContent)
//         // Parse the JSON
//         // const jsonData = JSON.parse(fileContent);

//         // // Your custom code here
//         // let moduleName = file.split('.export.json')[0]
//         // modules.rnboDevices[moduleName]= {
//         //     inputs: jsonData.desc.inlets,
//         //     params: jsonData.desc.parameters,
//         //     outputs: jsonData.desc.outlets
//         // }
        

//         // Example: If you want to modify the JSON
//         // jsonData.newKey = "newValue";

//         // Example: If you want to save the modified JSON
        
//     }
//     // try {

//     //     // Read all files in the folder
//     //     // const files = await readdir(folderPath);

//     //     // Filter only `.export.json` files
//     //     // const jsonFiles = files.filter((file) => file.endsWith('.export.json'));

//     //     // Loop through the files
//     //     for (const file of rnboFiles) {
//     //         const filePath = join(folderPath, file);
//     //         console.log(filePath)
//     //         // Load the file contents
//     //         const fileContent = readFile(filePath, 'utf8');
//     //         console.log(fileContent)
//     //         // Parse the JSON
//     //         // const jsonData = JSON.parse(fileContent);

//     //         // // Your custom code here
//     //         // let moduleName = file.split('.export.json')[0]
//     //         // modules.rnboDevices[moduleName]= {
//     //         //     inputs: jsonData.desc.inlets,
//     //         //     params: jsonData.desc.parameters,
//     //         //     outputs: jsonData.desc.outlets
//     //         // }
            

//     //         // Example: If you want to modify the JSON
//     //         // jsonData.newKey = "newValue";

//     //         // Example: If you want to save the modified JSON
            
//     //     }
//     // } catch (error) {
//     //     console.error('Error processing files:', error);
//     // }


//     // await writeFile('./src/modules/modules.json', JSON.stringify(modules, null, 2));


// });



//     import { readdir, readFile, writeFile } from 'fs/promises';
// import { join } from 'path';
// import audioNodes from './src/modules/webAudioNodes.json' assert { type: 'json'}


// async function processFiles() {
//     let modules = {
//         webAudioNodes: audioNodes,
//         rnboDevices: {}
//     }
//     const folderPath = join(process.cwd(), './public/export/'); // Folder to process

//     try {

//         // Read all files in the folder
//         const files = await readdir(folderPath);

//         // Filter only `.export.json` files
//         const jsonFiles = files.filter((file) => file.endsWith('.export.json'));

//         // Loop through the files
//         for (const file of jsonFiles) {
//             const filePath = join(folderPath, file);

//             // Load the file contents
//             const fileContent = await readFile(filePath, 'utf8');

//             // Parse the JSON
//             const jsonData = JSON.parse(fileContent);

//             // Your custom code here
//             let moduleName = file.split('.export.json')[0]
//             modules.rnboDevices[moduleName]= {
//                 inputs: jsonData.desc.inlets,
//                 params: jsonData.desc.parameters,
//                 outputs: jsonData.desc.outlets
//             }
            

//             // Example: If you want to modify the JSON
//             // jsonData.newKey = "newValue";

//             // Example: If you want to save the modified JSON
            
//         }
//     } catch (error) {
//         console.error('Error processing files:', error);
//     }


//     await writeFile('./src/modules/modules.json', JSON.stringify(modules, null, 2));

// }

// processFiles();
