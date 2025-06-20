   function createNewPatchHistory(synthFile, fromPeer){

        // clear the pen tool interface
        resetDrawing()
        // delete the document in the indexedDB instance
        deleteDocument('patchHistory')
        // clear DSP
        updateSynthWorklet('clearGraph')
        // ensure floating UI container divs are removed
        clearparamContainerDivs()
        // clear the sequencer
        sendMsgToHistoryApp({
            appID: 'forkingPathsMain',
            cmd: 'newPatchHistory'
                
        })
        // tell server to erase the patchHistory & send a blank DAG to client(s)
        ws.send(JSON.stringify({
            cmd: 'clearHistoryGraph'
        }))

        // Clear existing elements from Cytoscape instance
        synthGraphCytoscape.elements().remove();
        
        // remove all dynamicly generated UI overlays (knobs, umenus, etc)
        removeUIOverlay('allNodes')
        // ensure their container divs are removed too
        clearparamContainerDivs()
        // init new patch history for Automerge
        let patchHistoryJSON = {
            title: "Forking Paths Patch History",
            forked_from_id: null, // used by the database to either determine this as the root of a tree of patch histories, or a fork from a stored history 
            authors: [], // this will get added to as the doc is forked from the database
            branches: {},
            branchOrder: [],
            docs: {},
            head: {
                hash: null,
                branch: config.patchHistory.firstBranchName
            },
            
            userSettings: {
                focusNewBranch:false 
            },
            sequencer: {
                bpm: 120,
                ms: 500,
                traversalMode: 'Sequential'
            },
            synth: {
                rnboDeviceCache: null,
            },

        }
        if(synthFile){
            patchHistoryJSON.synthFile = synthFile
        } else if (patchHistory.synthFile){
            // if a synth file had been previously loaded, load it again
            patchHistoryJSON.synthFile = patchHistory.synthFile
            synthFile = patchHistory.synthFile
        }
        // assign patch history to automerge
        patchHistory = Automerge.from(patchHistoryJSON)
        // clear the current automerge doc
        amDoc = Automerge.init();

        if(synthFile || patchHistory.synthFile){

            if(!patchHistory.synthFile) { synthFile = patchHistory.synthFile }

            let amMsg = makeChangeMessage(config.patchHistory.firstBranchName, `loaded ${synthFile.filename}`)
        
            // Apply initial changes to the new document
            amDoc = Automerge.change(amDoc, amMsg, (amDoc) => {
                amDoc.title = config.patchHistory.firstBranchName;
                amDoc.elements = [ ] 
                patchHistory.synthFile.visualGraph.elements.nodes.forEach((node)=>{
                    amDoc.elements.push(node)
                })
                
                amDoc.synth = {
                    graph: synthFile.audioGraph,
                    connections: []
                }
                
                audioGraphDirty = true

                amDoc.drawing = []
            }, onChange, `loaded ${synthFile.filename}`);

            updateSynthWorklet('loadVersion', amDoc.synth.graph, null, amDoc.changeType)
         
            // load synth graph from file into cytoscape
            synthGraphCytoscape.json(patchHistory.synthFile.visualGraph)

            synthFile.visualGraph.elements.nodes.forEach((node, index)=>{
                // set module grabbable to false -- prevents module movements in main view
                if(node.classes === ':parent'){
                    // synthFile.visualGraph.elements.nodes[index].grabbable = false
                    // lock the module's position
                    synthGraphCytoscape.getElementById(node.data.id).lock();
                }
                // create overlays
                if(node.classes === 'paramAnchorNode'){
                    let value = patchHistory.synthFile.audioGraph.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
            
                    // index++
                }
            })


            setTimeout(() => {
                updateKnobPositionAndScale('all');
                // Make all nodes non-draggable
                
            }, 10); // Wait for the current rendering cycle to complete
        } else { 
            console.log('non synthFile')
            console.warn('synthFile nor patchHistory.synthFile not found')
            
        }

        let hash = Automerge.getHeads(amDoc)[0]
        previousHash = hash

        let msg = 'blank_patch'
        if (synthFile){
            msg = `loaded ${synthFile.filename}`
        }
        patchHistory = Automerge.change(patchHistory, (patchHistory) => {
            patchHistory.branches[config.patchHistory.firstBranchName] = {
                head: hash,
                root: null,
                parent: null,
                // doc: amDoc,
                history: [ {hash: hash, parent: null, msg: msg} ] 
            }
            
            // encode the doc as a binary object for efficiency
            patchHistory.docs[config.patchHistory.firstBranchName] = Automerge.save(amDoc)
            patchHistory.head.branch = config.patchHistory.firstBranchName
            patchHistory.head.hash = hash 
            patchHistory.branchOrder.push(patchHistory.head.branch)
            patchHistory.synthFile = synthFile
            
        });     
            
        docUpdated = true
        previousHash = patchHistory.head.hash
        // send doc to history app
        reDrawHistoryGraph()

        // store it in the database
        const patch_binary = fromByteArray(Automerge.save(patchHistory))
        ws.send(JSON.stringify({
            cmd: 'newPatchHistory',
            data: {
                name: `${chance.animal()} ${uuidv7().split('-')[2]}`,
                authors: [ thisPeerID ],
                description: null,
                modules: ['test'], // can be pulled from your patch graph
                synth_template: patchHistory.synthFile, // JSON object
                patch_binary: patch_binary, // base64-encoded string
                forked_from_id: patchHistory.forked_from_id, // or null if this is a root version
            }
        }))

        // get a binary from the new patchHistory
        const fullBinary = Automerge.save(patchHistory);
        // send it to any connected peer(s)
        let message = {
            cmd: 'replacePatchHistory',
            data: fromByteArray(fullBinary)  // base64 encoded or send as Uint8Array directly if channel supports it
        }
        // sync with peer(s)
        sendDataChannelMessage(message)
    }