/**
 * Generates nodes and edges for a history graph.
 *
 * @param {Object} meta - Metadata containing branch order and history details.
 * @param {Set} existingHistoryNodeIDs - Set of existing node IDs to avoid duplicates.
 * @param {Object} docHistoryGraphStyling - Styling information for nodes.
 * @returns {Object} - An object containing nodes, edges, and updated existingHistoryNodeIDs.
 */
function buildHistoryGraph(meta, existingHistoryNodeIDs, docHistoryGraphStyling) {
    const nodes = [];
    const edges = [];

    // Accessing branches in order, create nodes and edges for each branch
    meta.branchOrder.forEach((branchName) => {
            const branch = meta.branches[branchName];

            // Iterate over each history item in the branch
            branch.history.forEach((item) => {
            const nodeId = item.hash;
            // Check if the node already exists in the history graph
            if (!existingHistoryNodeIDs.has(nodeId)) {
                // Add node to the history graph
                nodes.push({
                    group: "nodes",
                    data: {
                        id: nodeId,
                        label: item.msg,
                        color: docHistoryGraphStyling.nodeColours[item.msg.split(" ")[0]] || "#ccc",
                        branch: branchName,
                    },
                });



                // Add the newly added node's ID to the set to track it
                existingHistoryNodeIDs.add(nodeId);
            }
        });
    });

    // now that all nodes are made, create their edges

    meta.branchOrder.forEach((branchName) => {
        const branch = meta.branches[branchName];

        // Iterate over each history item in the branch
        branch.history.forEach((item) => {
        const nodeId = item.hash;

        // ! this is where we'll also figure out how to deal with 2 parents in the case of a merge!
        // If the history item has a parent, add an edge to connect the parent
        if (item.parent) {
            // //Make sure the parent node also exists before adding the edge
            // if (existingHistoryNodeIDs.has(item.parent)) {
                edges.push({
                    group: "edges",
                    data: {
                        id: `${item.parent}_to_${nodeId}`,
                        source: item.parent,
                        target: nodeId,
                    },
                });
            // }
        }
        
    });
});


    return { nodes, edges, existingHistoryNodeIDs };
}

export default buildHistoryGraph;
  