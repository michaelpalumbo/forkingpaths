function startCable(source, position){
    temporaryCables.local.source = source;
    const mousePos = position;

    // Get the ghostCable property from the temporaryCables.local.ghostNode, default to 'ellipse' if undefined
    const ghostShape =  temporaryCables.local.source.data('ghostCableShape') || 'ellipse';
    const ghostColour =  temporaryCables.local.source.data('ghostCableColour') || '#5C9AE3';

    // Create a ghost node at the mouse position to act as the moving endpoint
    temporaryCables.local.ghostNode = synthGraphCytoscape.add({
        group: 'nodes',
        data: { id: 'localGhostNode' },
        position: mousePos,
        grabbable: false, // Ghost node shouldn't be draggable
        classes: 'ghostNode'
    });

    // Apply the ghostShape to the ghostNode using a direct style override
    temporaryCables.local.ghostNode.style({
        'shape': ghostShape,
        'background-color': ghostColour
    });
    // Create a temporary edge from ghostNodes.local.source to temporaryCables.local.ghostNode
    temporaryCables.local.tempEdge = synthGraphCytoscape.add({
        group: 'edges',
        data: { id: 'localTempEdge', source: temporaryCables.local.source.id(), target: 'localGhostNode' },
        classes: 'tempEdge'
    });

    // Set target endpoint to mouse position initially
    temporaryCables.local.tempEdge.style({ 'line-color': '#FFA500', 'line-style': 'dashed',  'source-arrow-shape': 'none'  }); // Set temporary edge color        
}