    // handle document changes and call a callback
    function applyChange(doc, changeCallback, onChangeCallback, changeMessage) {
        // in this condition, we are applying a change on the current branch
        if(automergeDocuments.newClone === false ){
            let amMsg = makeChangeMessage(patchHistory.head.branch, changeMessage)
            // we are working from a head

            // grab the current hash before making the new change:
            previousHash = patchHistory.head.hash
            
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);


            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {
                let hash = Automerge.getHeads(amDoc)[0]
                
                patchHistory = Automerge.change(patchHistory, (patchHistory) => {

                    // if the current patchHistory was loaded from the database, then we need to create a fork for this new change
                    if (patchHistory.hasBeenModified === false) {
                        patchHistory.forked_from_id = patchHistory.databaseID
                        patchHistory.hasBeenModified = true
                        forkHistoryInDatabase(patchHistory.databaseID)
                    }
                    // Initialize the branch patchHistorydata if it doesn't already exist
                    if (!patchHistory.branches[patchHistory.head.branch]) {
                        patchHistory.branches[patchHistory.head.branch] = { head: null, history: [] };
                    }
                    // Update the head property
                    patchHistory.branches[patchHistory.head.branch].head = hash;

                    // Push the new history entry into the existing array
                    patchHistory.branches[patchHistory.head.branch].history.push({
                        hash: hash,
                        parent: previousHash,
                        msg: changeMessage,
                        timeStamp: new Date().getTime()

                    });

                    // encode the doc as a binary object for efficiency
                    patchHistory.docs[patchHistory.head.branch] = Automerge.save(amDoc)
                    // store the HEAD info
                    patchHistory.head.hash = hash
                    patchHistory.timeStamp = new Date().getTime()
                    //? patchHistory.head.branch = amDoc.title
                    
                });


                
                updatePatchHistoryDatabase()

                onChangeCallback(amDoc);
            }
            return amDoc;
        } else {
            // player has made changes to an earlier version, so create a branch and set amDoc to new clone

            // store previous amDoc in automergeDocuments, and its property is the hash of its head
            automergeDocuments.otherDocs[patchHistory.head.branch] = amDoc
            // set amDoc to current cloned doc
            amDoc = Automerge.clone(automergeDocuments.current.doc)

            // create a new branch name
            const newBranchName = uuidv7();
            // use the new branch title
            let amMsg = makeChangeMessage(patchHistory.head.branch, changeMessage)

            // grab the current hash before making the new change:
            previousHash = Automerge.getHeads(amDoc)[0]
            
            // Apply the change using Automerge.change
            amDoc = Automerge.change(amDoc, amMsg, changeCallback);
            let hash = Automerge.getHeads(amDoc)[0]
            
            // If there was a change, call the onChangeCallback
            if (amDoc !== doc && typeof onChangeCallback === 'function') {   
                const timestamp = new Date().getTime()
                patchHistory = Automerge.change(patchHistory, (patchHistory) => {

                    // create the branch
                    patchHistory.branches[newBranchName] = {
                        head: hash,
                        parent: previousHash,
                        history: [{
                            hash: hash,
                            msg: changeMessage,
                            parent: previousHash,
                            timeStamp: timestamp
                        }]
                    }

                    // store current doc
                    patchHistory.docs[newBranchName] = Automerge.save(amDoc)
                    
                    // store the HEAD info
                    patchHistory.head.hash = hash
                    patchHistory.head.branch = newBranchName

                    patchHistory.timeStamp = timestamp

                    // store the branch name so that we can ensure its ordering later on
                    patchHistory.branchOrder.push(newBranchName)

                    // if the current patchHistory was loaded from the database, then we need to create a fork for this new change
                    if (patchHistory.hasBeenModified === false) {
                        patchHistory.forked_from_id = patchHistory.databaseID
                        patchHistory.hasBeenModified = true
                        forkHistoryInDatabase(patchHistory.databaseID)
                    }
                });
               
                // makeBranch(changeMessage, Automerge.getHeads(newDoc)[0])
                onChangeCallback(amDoc);

                updatePatchHistoryDatabase()
                automergeDocuments.newClone = false

            }
            return amDoc;

        }
        

    }

    // define the onChange Callback
    onChange = () => {
        // send to peer(s)
        sendSyncMessage()
        // update synth audio graph
        // loadSynthGraph()
        // You can add any additional logic here, such as saving to IndexedDB

        // set docUpdated so that indexedDB will save it
        docUpdated = true

       
        // update the historyGraph
        reDrawHistoryGraph()

        if(audioGraphDirty){
            audioGraphDirty = false
        }

    };