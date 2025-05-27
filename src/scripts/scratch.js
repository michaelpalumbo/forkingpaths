 // merge 2 versions & create a new node in the graph
    function createMerge(nodes){
        let doc1 = nodes[0]
        let doc2 = nodes[1]

        console.log(doc1, doc2)
        // load historical views of both docs

        let head1 = patchHistory.branches[doc1.branch].head
        let requestedDoc1 = loadAutomergeDoc(doc1.branch)
        // const historicalView1 = Automerge.view(requestedDoc1, [doc1.id]);

        let head2 = patchHistory.branches[doc2.branch].head
        let requestedDoc2 = loadAutomergeDoc(doc2.branch)
        // const historicalView2 = Automerge.view(requestedDoc2, [doc2.id]);

        // console.log(requestedDoc1, requestedDoc2)

        let mergedDoc = Automerge.merge(requestedDoc1, requestedDoc2)

        
        // store previous amDoc in automergeDocuments, and its property is the hash of its head
        //? automergeDocuments.otherDocs[patchHistory.head.branch] = amDoc

        // grab the current hash before making the new change:
        // previousHash = Automerge.getHeads(amDoc)[0]
        // we previously used this to get the hashes, but it means it grabs just the leaves of both branches, when what we want are the actual parent nodes (see next line that is not commented out)
        // let hashes = Automerge.getHeads(mergedDoc)
        let hashes = [ doc1.id, doc2.id ]

        // create empty change to 'flatten' the merged Doc
        amDoc = Automerge.emptyChange(mergedDoc);

        console.log('mergedDoc w/empty change: ', mergedDoc);
        // -> "mergedDoc w/empty change:  { key1: 'Value from doc1', key2: 'Value from doc2' }"
        console.log('mergedDoc heads w/empty change: ', Automerge.getHeads(mergedDoc));
        // -> "mergedDoc heads w/empty change:  [ 'f4bef4aa01db0967714c5d8909310376f0e4fd72ab6ce4d477e00ae62a1683de' ]"

        let hash = Automerge.getHeads(amDoc)[0]

        const newBranchName = uuidv7()

        patchHistory = Automerge.change(patchHistory, { message: `merge parents: ${doc1.id} ${doc2.id} `}, (patchHistory) => {

            // Initialize the branch patchHistorydata if it doesn't already exist
            if (!patchHistory.branches[newBranchName]) {
                patchHistory.branches[newBranchName] = { head: null, parent: [ doc1.id, doc2.id ], history: [] };
                
            }

            // Update the head property
            patchHistory.branches[newBranchName].head = hash;

            // Push the new history entry into the existing array
            patchHistory.branches[newBranchName].history.push({
                hash: hash,
                msg: 'merge',
                parent: hashes,
                nodes: [doc1, doc2]

            });
            // store current doc
            patchHistory.docs[newBranchName] = Automerge.save(amDoc)
            
            // store the HEAD info
            patchHistory.head.hash = hash
            patchHistory.head.branch = newBranchName

            // store the branch name so that we can ensure its ordering later on
            patchHistory.branchOrder.push(newBranchName)
        });

        // set docUpdated so that indexedDB will save it
        docUpdated = true
       
        updateSynthWorklet('loadVersion', amDoc.synth.graph)

        updateCytoscapeFromDocument(amDoc, 'buildUI');

        // update the historyGraph
        reDrawHistoryGraph()

        if(audioGraphDirty){
            audioGraphDirty = false
        }

    }