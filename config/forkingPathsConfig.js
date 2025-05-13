export const config = {
    UI:{
        moduleLayout: {
            maxRows: 3, 
            cellWidth: 120, 
            cellHeight: 100,
            horizontalPadding: 20,
            verticalPadding: 5
        },
        knob:{
            baseKnobSize: 60,
            thickness: 0.3,
            labelFontSize: '19px',
            labelMarginBottom: '3px',
            labelAlign: 'center',
            labelColour: 'black'
        },
        selectMenu: {
    
        }
    },
    indexedDB:{
        saveInterval: 1000 // how frequently to store the automerge document in indexedDB (ms)
    },
    patchHistory:{
        firstBranchName: 'main'
    },
    appCommunication:{
        throttleInterval: 250 // limit throughput to history sequencer
    },
    cytoscape:{
        synthGraph:{
            style: {
                nodeWidth: 40,
                nodeHeight: 40,
                parentNode: {
                    textColour: 'black',
                    fontSize: 25
                },
                edge:{
                    arrowSize: 30
                }
            }
        },
        historyGraph:{
            render: {
                textureOnViewPort: false // set to true only if dealing with very, very large graphs. I needed this before I was condensing gestures to a single node
            }
        }
    },
    audio: {
        initialVolume: 0.5 // this is overrided by localStorage after user changes it for the first time
    }
    
    
    
};