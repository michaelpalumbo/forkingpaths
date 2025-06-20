   // Function to update Cytoscape with the state from forkedDoc
    function updateCytoscapeFromDocument(forkedDoc, cmd, lastGestureValue) {
        App.synth.visual.modules = forkedDoc.synth.graph.modules
        let elements = forkedDoc.elements
        peers.remote = {}
        // only rebuild the UI if needed
        if(cmd === 'buildUI'){
            parentNodePositions = []; // Array to store positions of all parent nodes

            // Step 1: Extract all parent nodes from the given document
            const parentNodes = forkedDoc.elements.filter(el => el.classes === ':parent'); // Adjust based on your schema
            parentNodes.forEach(parentNode => {
                if (parentNode.position) {
                    parentNodePositions.push({
                        id: parentNode.data.id,
                        position: parentNode.position
                    });
                }
            })
            
            // Clear existing elements from Cytoscape instance
            synthGraphCytoscape.elements().remove();

            // remove all dynamicly generated UI overlays (knobs, umenus, etc)
            removeUIOverlay('allNodes')
            
            // ensure their container divs are removed too
            clearparamContainerDivs()

            // I do this from the synthFile because the parentNodes' dimensions respond to their childs' positioning
            synthGraphCytoscape.json(patchHistory.synthFile)
            // synthGraphCytoscape.nodes(':parent').forEach(n => console.log(n.id())); // lock all parent nodes so they can't be dragged
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // add all cables back in with a check to make sure we don't render edges to empty parent nodes
            for (let i = 0; i < syncedElements.length; i++) {
                const el = syncedElements[i];
                if (el.type === 'edge') {
                    const sourceExists = synthGraphCytoscape.getElementById(el.data.source).length > 0;
                    const targetExists = synthGraphCytoscape.getElementById(el.data.target).length > 0;

                    if (!sourceExists || !targetExists) {
                        console.warn(`Skipping edge: ${el.data.id} due to missing source or target`);
                        continue; // Skip this iteration and move to the next element
                    }
                }

                synthGraphCytoscape.add(el);
            }
            
            let index = 0
            elements.forEach((node)=>{
                // set module grabbable to false -- prevents module movements in main view
                if(node.classes === ':parent'){
                    // lock the module's position
                    synthGraphCytoscape.getElementById(node.data.id).lock();
                }
                if(node.classes === 'paramAnchorNode'){
                    let value = App.synth.visual.modules[node.data.parent].params[node.data.label]
                    createFloatingOverlay(node.data.parent, node, index, value)
                    index++
                }
            })
            // Initial position and scale update. delay it to wait for cytoscape rendering to complete. 
            setTimeout(() => {
                updateKnobPositionAndScale('all');
            }, 10); // Wait for the current rendering cycle to complete
            
            // After loading your synth and creating overlays:
            cacheVisibleParamControls(App.synth.visual.modules);
            
        } else if (cmd === 'buildFromSyncMessage'){
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // clear 
            synthGraphCytoscape.elements().remove();

            // 3. Add new elements to Cytoscape
            synthGraphCytoscape.add(syncedElements)

            // check to see if none of the overlays were made. this is the case if peer has a blank document and is syncing to another peer's doc
            const overlaysExist = document.querySelector('[id^="paramControl_parent:"]') !== null;

            if (!overlaysExist) {
                updateCytoscapeFromDocument(forkedDoc, 'buildUI');
                return; // skip the rest, since buildUI handles everything
            }

            refreshParamControls(App.synth.visual.modules, lastGestureValue);
        }
        
        
        else {
            // Sync the positions in `elements`
            const syncedElements = syncPositions(forkedDoc);
            // clear 
            synthGraphCytoscape.elements().remove();

            // 3. Add new elements to Cytoscape
            synthGraphCytoscape.add(syncedElements)

            refreshParamControls(App.synth.visual.modules);
        }
    }   