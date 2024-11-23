
// Listen for messages from the main thread
self.addEventListener("message", (event) => {
    const { meta, existingHistoryNodeIDs, docHistoryGraphStyling } = event.data;

    
    let nodes = []
    let edges = []
    // Accessing branches in order, create nodes and edges for each branch
    meta.branchOrder.forEach((branchName) => {            
        const branch = meta.branches[branchName];

        // iterate over each history item in the branch
        branch.history.forEach((item, index) => {
            const nodeId = item.hash
            // 4. Check if the node already exists in the history graph
            if (!existingHistoryNodeIDs.has(nodeId)) {
                
                // add node to the history graph
                nodes.push({
                    group: 'nodes',
                    data: { id: nodeId, label: item.msg, color: docHistoryGraphStyling.nodeColours[item.msg.split(' ')[0]], branch: branchName }
                });

                // If the history item has a parent, add an edge to connect the parent
                if (item.parent) {
                    // Make sure the parent node also exists before adding the edge
                    if (existingHistoryNodeIDs.has(item.parent)) {
                        edges.push({
                            group: 'edges',
                            data: {
                                id: `${item.parent}_to_${nodeId}`,
                                source: item.parent,
                                target: nodeId
                            }
                        });
                    }
                }

                // Add the newly added node's ID to the set to track it
                existingHistoryNodeIDs.add(nodeId);

            }
        });            
    });

    self.postMessage({ nodes, edges, existingHistoryNodeIDs });
});