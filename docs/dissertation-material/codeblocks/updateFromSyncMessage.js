function updateFromSyncMessage(){
    docUpdated = true;

    const requestedDoc = loadAutomergeDoc(meta.head.branch);
    const updatedView = Automerge.view(requestedDoc, [meta.head.hash]);

    updateSynthWorklet('loadVersion', updatedView.synth.graph, null, updatedView.changeType);
    updateCytoscapeFromDocument(updatedView, 'buildFromSyncMessage');
    reDrawHistoryGraph();

    amDoc = Automerge.clone(updatedView);
}
