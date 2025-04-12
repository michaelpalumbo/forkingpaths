    // Load a version from the DAG
    async function loadVersion(targetHash, branch) {

        // get the head from this branch
        let head = meta.branches[branch].head
        // get the automerge doc associated with the requested hash
        let requestedDoc = loadAutomergeDoc(branch)

        // Use `Automerge.view()` to view the state at this specific point in history
        const historicalView = Automerge.view(requestedDoc, [targetHash]);
         
        // Check if we're on the head; reset clone if true (so we don't trigger opening a new branch with changes made to head)
        // compare the point in history we want (targetHash) against the head of its associated branch (head)
        if (head === targetHash){
            // no need to create a new branch if the user makes changes after this operation
            automergeDocuments.newClone = false
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // update meta to set the current head and change hash
            meta = Automerge.change(meta, (meta) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
            });
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }

            return
        } 

        // this is necessary for loading a hash on another branch that ISN'T the head
        else if (branch != meta.head.branch) {
            // send the synth graph from this point in the history to the DSP worklet first
            updateSynthWorklet('loadVersion', historicalView.synth.graph, null, historicalView.changeType)
            // send the visual graph from this point in the history to the synth cytoscape
            updateCytoscapeFromDocument(historicalView);
            // set global var for easy checking
            automergeDocuments.current = {
                doc: requestedDoc
            }
            // update meta to set the current head and change hash
            meta = Automerge.change(meta, (meta) => {
                // store the HEAD info (the most recent HEAD and branch that were viewed or operated on)
                meta.head.hash = targetHash
                meta.head.branch = branch
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
        }
    }