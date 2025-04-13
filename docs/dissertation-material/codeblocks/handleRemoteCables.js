function handleRemoteCables(cmd,  peerID, sourceID, position){
        
    switch(cmd){
        
        case 'startRemoteGhostCable':
            let ghostId = `ghostNode-${peerID}`
            let tempEdgeID = `tempEdge-${peerID}`
            
            temporaryCables.peers[peerID] = {
                source: synthGraphCytoscape.getElementById(sourceID),
                // Create a ghost node at the mouse position to act as the moving endpoint
                ghostNode: synthGraphCytoscape.add({
                    group: 'nodes',
                    data: { id: ghostId },
                    position: position,
                    grabbable: false, // Ghost node shouldn't be draggable
                    classes: 'ghostNode'
                }),
                // Create a temporary edge from temporaryCables.local.source to ghostNode
                tempEdge: synthGraphCytoscape.add({
                    group: 'edges',
                    data: { id: tempEdgeID, source: sourceID, target: ghostId },
                    classes: 'tempEdge'
                }),
                targetNode: null
            }
            
            // set ghostNode Style according to opposite of source Node
            const ghostShape = temporaryCables.peers[peerID].source.data('ghostCableShape') || 'ellipse';
            const ghostColour = temporaryCables.peers[peerID].source.data('ghostCableColour') || '#5C9AE3';
            temporaryCables.peers[peerID].ghostNode.style({
                'shape': ghostShape,
                'background-color': ghostColour
            });

            temporaryCables.peers[peerID].tempEdge.style({ 'line-color': '#228B22', 'line-style': 'dashed', 'source-arrow-shape': 'none' }); // Set peer temporary edge color
        break;

        case 'updateRemoteGhostCable':
            // update the tmporary cable's position
            temporaryCables.peers[peerID].ghostNode.position(position)
        break

        case 'finishRemoteGhostCable':
            // remove the tempEdge
            synthGraphCytoscape.remove(temporaryCables.peers[peerID].tempEdge)
            // remove remote ghostnode
            synthGraphCytoscape.remove(temporaryCables.peers[peerID].ghostNode);
            synthGraphCytoscape.nodes().removeClass('highlighted');

            // remove remote peer's temporary cable from object
            delete temporaryCables.peers[peerID]

        break;

    }

} 