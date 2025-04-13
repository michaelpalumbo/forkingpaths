function updateSynthWorklet(cmd, data, structure, changeType){

    switch (cmd) {
        case 'setOutputVolume':
            synthWorklet.port.postMessage({ 
                cmd: 'setOutputVolume',
                data: data
            });
        break
        case 'clearGraph':
            synthWorklet.port.postMessage({ 
                cmd: 'clearGraph'
            });
        break
        case 'loadVersion':
            // if a loaded version is for a paramChange, no need to recreate the graph
            // if(changeType && changeType.msg === 'paramUpdate'){
            //     synthWorklet.port.postMessage({ cmd: 'paramChange', data: changeType });
            // } else {
            synthWorklet.port.postMessage({ 
                cmd: 'loadVersion', 
                data: data,
            });
            // }
        break

        case 'setSignalAnalysis':
            synthWorklet.port.postMessage({ 
                cmd: 'setSignalAnalysis', 
                data: data
            });
        break
        
        case 'addNode':
            synthWorklet.port.postMessage({ 
                cmd: 'addNode', 
                data: data,
                structure: structure
            });
        break

        case 'removeNode':
            synthWorklet.port.postMessage({ 
                cmd: 'removeNode', 
                data: data
            });
        break

        case 'addCable':
            synthWorklet.port.postMessage({
                cmd: 'addCable',
                data: data
            });

        break

        case 'removeCable':
            synthWorklet.port.postMessage({
                cmd: 'removeCable',
                data: data
            });
        break

        case 'paramChange':

            synthWorklet.port.postMessage({ cmd: 'paramChange', data: data });
        break
    }

}