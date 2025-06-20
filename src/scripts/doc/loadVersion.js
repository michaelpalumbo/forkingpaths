// Load a version from the DAG
    async function loadVersion(targetHash, branch, fromPeer, fromPeerSequencer) {
        // store the hash and branch for if a new peer joins
        // newPeerHash = targetHash
        // newPeerBranch = branch

        // get the head from this branch
        let head = patchHistory.branches[branch].head
        // get the automerge doc associated with the requested hash
        let requestedDoc = loadAutomergeDoc(branch)


 
        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(requestedDoc, [targetHash]);

        if(historicalView.drawing){
            loadCanvasVersion(historicalView.drawing)
        }
        // ⬇️ Optional sync logic for collaboration mode
        // const versionSyncMode = localStorage.getItem('syncMode') || 'shared';

        // if (versionSyncMode === 'shared') {
        //     // Propose to replace current state for both peers
        //     requestMergeOrReplace('replace', Automerge.save(historicalView));
        //     return; // Stop here — the update will happen after peer accepts
        // }
         
        // Check if we're on the head; reset clone if true (so we don't trigger opening a new branch with changes made to head)
        // compare the point in history we want (targetHash) against the head of its associated branch (head)
        if (head === targetHash){
   
            // no need to create a new branch if the user makes changes after this operation
            automergeDocuments.newClone = false
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // update patchHistory to set the current head and change hash
            patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                patchHistory.head.hash = targetHash
                patchHistory.head.branch = branch
            });
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }

            
        } 

        // this is necessary for loading a hash on another branch that ISN'T the head
        else if (branch != patchHistory.head.branch) {

            // if we are dealing with a blank patch, then clear the audio graph
            if(!historicalView.synth){
                updateSynthWorklet('clearGraph')
            } else {
                // send the synth graph from this point in the history to the DSP worklet first
                updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)
            }

            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }
            // update patchHistory to set the current head and change hash
            patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                patchHistory.head.hash = targetHash
                patchHistory.head.branch = branch
            });
            // set newClone to true
            automergeDocuments.newClone = true
    


        }
        // the selected hash belongs to the current branch
        else {
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // create a clone of the branch in case the player begins making changes
            let clonedDoc = Automerge.clone(historicalView)
            // store it
            automergeDocuments.current = {
                doc: clonedDoc
            }
            // set newClone to true
            automergeDocuments.newClone = true

            // update patchHistory to set the current head and change hash
            patchHistory = Automerge.change(patchHistory, (patchHistory) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                patchHistory.head.hash = targetHash
                patchHistory.head.branch = branch
            });
        }

        if(fromPeer){
            // send message to 
        }
        // ⬇️ Optional sync/permission handling AFTER local load
        const recallMode = getVersionRecallMode();
        // ensure that loadVersion calls from the peer don't make past this point, becuase otherwise they'd send it back and forth forever 
        if (recallMode === 'openLoadVersion' && !fromPeer && !fromPeerSequencer) {
            console.log('openVersionRecall')
            openVersionRecall(targetHash, branch);
        }

        if (recallMode === 'requestOpenLoadVersion'  && !fromPeer) {
            // requestVersionRecallWithPermission(amDoc, Automerge.getHeads(amDoc)[0], patchHistory.head.branch);
            console.warn('not set up yet')
        }

    } 