// get mousedown events from cytoscape
    synthGraphCytoscape.on('mousedown', (event) => {

        // first check if we are not interacting with the cytoscape elements (i.e. if outside, we want to active the pen tool instead)
        const pos = synthGraphCytoscape.renderer().projectIntoViewport(event.originalEvent.clientX, event.originalEvent.clientY);
        const target = synthGraphCytoscape.renderer().findNearestElement(pos[0], pos[1], true);
        if (target && (target.isNode() || target.isEdge())) {
            // Clicked on a module, port, or cable: stay in Cytoscape interaction
            disableDrawingMode();
            UI.draw.drawing = false;
        } else {
            // forceCytoscapeMouseup()
            // Clicked on empty canvas background
            enableDrawingMode();
            UI.draw.drawing = true;
            return
        }

        hid.cyMouse.left = true
        // handle slider events
        if(event.target.data().kind && event.target.data().kind === 'slider'){
            
        } else {

       
            // Check if the click target is not the highlighted edge
            if (highlightedEdge && event.target !== highlightedEdge) {
                highlightedEdge.removeClass('highlighted');
                highlightedEdge = null;
            }
            const target = event.target;
            // Check if the target is a node, edge, or the background
            if (target.isNode && target.isNode()) {
                
                // first check if clicked node is NOT a parent node, and only an input or output (i.e. ignore other UI such as sliders)
                if (!event.target.isParent() && (event.target.data('kind') === 'input' || event.target.data('kind') === 'output')) {
                    // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                    let e = event.target
                    let p = event.position
                    startCable(e, p)

                    // !
                    // todo: update this with automerge version when either p2p or websocket server is working
                    // sendEphemeralData({
                    //     msg: 'startRemoteGhostCable',
                    //     data: {
                    //         sourceNodeID: e.data().id,
                    //         position: p,
                    //         peer: peers.local.id
                    //     }
                    // })

                    const message = {
                        cmd: 'startRemoteGhostCable',
                        data: {
                            sourceID: e.data().id,
                            position: p,
                            peerID: thisPeerID
                        }
                    };
                    sendDataChannelMessage(message)
                } else if (event.target.isParent()){
                    
                    heldModule = event.target
                }
            } else if (target.isEdge && target.isEdge()) {
                if(highlightedNode){
                    highlightedNode.removeClass('highlighted');
                    // remove connected edge highlights
                    highlightEdges('hide', highlightedNode)
                    highlightedNode = null
                }
                
                const edge = event.target
                const mousePos = event.position

                // Get the source and target nodes of the edge
                const sourceNode = synthGraphCytoscape.getElementById(edge.data('source'));
                const targetNode = synthGraphCytoscape.getElementById(edge.data('target'));

                if (sourceNode && targetNode) {
                    // Extract positions to simple variables to avoid potential issues
                    const sourcePos = { x: sourceNode.position('x'), y: sourceNode.position('y') };
                    const targetPos = { x: targetNode.position('x'), y: targetNode.position('y') };
                    const parentSourceID = sourceNode.parent().data().id
                    const parentTargetID = targetNode.parent().data().id
                    
                    // Check if the click is near the source or target endpoint
                    if (isNearEndpoint(mousePos, sourcePos)) {
                        let cableSource =  edge.data().source
                        let cableTarget =  edge.data().target
                        let audioGraphConnections = amDoc.synth.graph.connections

                        // delete the cable
                        synthGraphCytoscape.remove(edge);
                        // also remove the cable from automerge!
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        
                        console.warn('todo: check if this cable was part of a cycle, if it is, ensure that whichever edge in the cycle that has the feedback:true prop set in the audio graph is now set to false')                        

                        // * automerge version: 
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Within the visual graph, Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);
                            // set the change type
                            amDoc.changeType = {
                                msg: 'disconnect'
                            }
                            // If a match is found, remove the object from the array
                            if (index !== -1) {
                                amDoc.elements.splice(index, 1);
                            }
                            
                            // remove connection from audio graph
                            // Find the index of the object that matches the condition
                            let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
                            // If a match is found, remove the object from the array
                            if (audioConnectionIndex !== -1) {
                                amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
                            }                
                        }, onChange, `disconnect ${edge.data().source} from ${edge.data().target}$PARENTS ${parentSourceID} ${parentTargetID}`);


                        //* old -repo version
                        // handle.change((newDoc) => {
                        //     // Assuming the array is `doc.elements` and you have an object `targetObj` to match and remove
                            
                        //     // Find the index of the object that matches the condition
                        //     const index = newDoc.elements.findIndex(el => el.id === edge.data().id);
                        
                        //     // If a match is found, remove the object from the array
                        //     if (index !== -1) {
                            
                        //         newDoc.elements.splice(index, 1);
                        //     }
                        // }, {
                        //     message: 'disconnect' // Set a custom change message here
                        // });

                        // create a new ghost cable starting from targetPos (opposite of clicked endpoint), call startCable()
                        // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                        let e = targetNode
                        let p = targetPos
                        startCable(e, p)
                        // tell remotes to create a new ghost cable
                        // !
                        // todo: update this with automerge version when either p2p or websocket server is working
                        // sendEphemeralData({
                        //     msg: 'startRemoteGhostCable',
                        //     data: {
                        //         sourceNodeID: e.data().id,
                        //         position: p,
                        //         peer: peers.local.id
                        //     }
                        // })
                        const message = {
                            cmd: 'startRemoteGhostCable',
                            data: {
                                sourceID: e.data().id,
                                position: p,
                                peerID: thisPeerID
                            }
                        };

                        sendDataChannelMessage(message)

                    } else if (isNearEndpoint(mousePos, targetPos)) {
                        let cableSource =  edge.data().source
                        let cableTarget =  edge.data().target
                        let audioGraphConnections = amDoc.synth.graph.connections

                        // delete the cable
                        synthGraphCytoscape.remove(edge);
                        updateSynthWorklet('removeCable', { source: edge.data().source, target: edge.data().target})
                        // also remove the cable from automerge!
                        console.warn('todo: check if this cable was part of a cycle, if it is, ensure that whichever edge in the cycle that has the feedback:true prop set in the audio graph is now set to false')

                        // * automerge version:      
                        amDoc = applyChange(amDoc, (amDoc) => {
                            // Find the index of the object that matches the condition
                            const index = amDoc.elements.findIndex(el => el.id === edge.data().id);
                            // set the change type
                            amDoc.changeType = {
                                msg: 'disconnect'
                            }
                            // If a match is found, remove the object from the array
                            if (index !== -1) {
                                amDoc.elements.splice(index, 1);
                            }

                            // remove connection from audio graph
                            // Find the index of the object that matches the condition
                            let audioConnectionIndex = audioGraphConnections.findIndex(el => el.source === cableSource && el.target === cableTarget);
                            // If a match is found, remove the object from the array
                            if (audioConnectionIndex !== -1) {
                                amDoc.synth.graph.connections.splice(audioConnectionIndex, 1);
                            }

                        }, onChange, `disconnect ${edge.data().target} from ${edge.data().source}$PARENTS ${parentSourceID} ${parentTargetID}`);


                        //* old -repo version
                        // handle.change((newDoc) => {
                        //     // Assuming the array is `doc.elements` and you have an object `targetObj` to match and remove
                            
                        //     // Find the index of the object that matches the condition
                        //     const index = newDoc.elements.findIndex(el => el.id === edge.data().id);
                        
                        //     // If a match is found, remove the object from the array
                        //     if (index !== -1) {
                                
                        //         newDoc.elements.splice(index, 1);
                        //     }
                        // }, {
                        //     message: 'disconnect' // Set a custom change message here
                        // });
                        // create a new ghost cable starting from sourcePos (opposite of clicked endpoint), call startCable()
                        // we have to assign these to temp variables, as otherwise cy acts kinda funky when passing them to helper functions
                        let e = sourceNode
                        let p = sourcePos
                        startCable(e, p)
                        // tell remotes to create a new ghost cable

                        // !
                        // todo: update this with automerge version when either p2p or websocket server is working
                        // sendEphemeralData({
                        //     msg: 'startRemoteGhostCable',
                        //     data: {
                        //         sourceNodeID: e.data().id,
                        //         position: p,
                        //         peer: peers.local.id
                        //     }
                        // })

                        const message = {
                            cmd: 'startRemoteGhostCable',
                            data: {
                                sourceID: e.data().id,
                                position: p,
                                peerID: thisPeerID
                            }
                        };
                        sendDataChannelMessage(message)

                    } else {
                        // Remove highlight from any previously highlighted edge
                        if (highlightedEdge) {
                            highlightedEdge.removeClass('highlighted');
                        }
                        // Set the clicked edge as the highlighted edge
                        edge.addClass('highlighted');
                        highlightedEdge = edge;
                    }
                } else {
                    console.warn("Edge has an undefined source or target node:", edge.id());
                }

            }
        }
    });