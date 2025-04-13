function isEdgeInCycle(edgeToCheck) {
    const parentEdges = new Map();
    const selfLoopEdges = []; // Store self-loop edges for same parent connections

    // Step 1: Build a directed graph of parent nodes with child information
    synthGraphCytoscape.edges().forEach((edge) => {
        const sourceParent = edge.data().source.split('.')[0]; // Parent of the source node
        const targetParent = edge.data().target.split('.')[0]; // Parent of the target node
        const sourceChild = edge.data().source.split('.')[1]; // Source child
        const targetChild = edge.data().target.split('.')[1]; // Target child

        if (targetParent.includes('AudioDestination')) {
            return; // Ignore connections to the audio destination
        }

        if (sourceParent === targetParent) {
            // Detect self-loop: connections within the same parent node
            selfLoopEdges.push({
                sourceParent,
                targetParent,
                sourceChild,
                targetChild,
            });
        } else {
            // Add normal inter-parent edges
            if (!parentEdges.has(sourceParent)) {
                parentEdges.set(sourceParent, []);
            }
            parentEdges.get(sourceParent).push({
                targetParent,
                sourceChild,
                targetChild,
            });
        }
    });

    // Step 2: Detect self-loop cycles
    const selfLoopMatch = selfLoopEdges.some(
        (edge) =>
            edge.sourceParent === edgeToCheck.data().source.split('.')[0] &&
            edge.targetParent === edgeToCheck.data().target.split('.')[0] &&
            edge.sourceChild === edgeToCheck.data().source.split('.')[1] &&
            edge.targetChild === edgeToCheck.data().target.split('.')[1]
    );

    if (selfLoopMatch) {
        // console.log(
        //     `Edge ${edgeToCheck.id()} forms a self-loop cycle within ${edgeToCheck.data().source.split('.')[0]}`
        // );
        return true;
    }

    // Step 3: Detect inter-parent cycles using Depth-First Search (DFS)
    const visited = new Set();
    const recStack = new Set();
    let edgeInCycle = false;

    function dfs(node, path = [], edgePath = []) {
        if (!visited.has(node)) {
            visited.add(node); // Mark the node as visited
            recStack.add(node); // Add the node to the recursion stack

            const neighbors = parentEdges.get(node) || [];
            for (const neighbor of neighbors) {
                const currentEdge = {
                    sourceParent: node,
                    targetParent: neighbor.targetParent,
                    sourceChild: neighbor.sourceChild,
                    targetChild: neighbor.targetChild,
                };

                if (!visited.has(neighbor.targetParent)) {
                    if (
                        dfs(
                            neighbor.targetParent,
                            [...path, node],
                            [...edgePath, currentEdge]
                        )
                    ) {
                        return true; // Cycle detected
                    }
                } else if (recStack.has(neighbor.targetParent)) {
                    // Cycle detected: back edge
                    const cycleStartIndex = path.indexOf(neighbor.targetParent);
                    const cycleEdges = [
                        ...edgePath.slice(cycleStartIndex),
                        currentEdge,
                    ]; // Edges in the cycle

                    // Check if the edgeToCheck belongs to this cycle
                    if (
                        cycleEdges.some(
                            (edge) =>
                                edge.sourceParent ===
                                    edgeToCheck.data().source.split('.')[0] &&
                                edge.targetParent ===
                                    edgeToCheck.data().target.split('.')[0] &&
                                edge.sourceChild ===
                                    edgeToCheck.data().source.split('.')[1] &&
                                edge.targetChild ===
                                    edgeToCheck.data().target.split('.')[1]
                        )
                    ) {
                        edgeInCycle = true;
                        return true;
                    }
                }
            }
        }

        recStack.delete(node);
        return false;
    }

    for (const node of parentEdges.keys()) {
        if (!visited.has(node)) {
            dfs(node);
            if (edgeInCycle) break; // Exit early if the edge is found in a cycle
        }
    }

    return edgeInCycle; // Return true if the edge belongs to any cycle
}