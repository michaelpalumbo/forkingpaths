//  just use this to put stuff

         // Compare with the previous document
         const prevDoc = prevDocRef.current;
         console.log('\n\nnewDoc', newDoc.doc, '\n\noldDoc', prevDoc)
         // Detect new nodes or changed nodes
         if (newDoc.nodes && prevDoc.nodes) {
             // Find newly added nodes
             const newNodes = newDoc.nodes.filter(
                 (node) => !prevDoc.nodes.some((prevNode) => prevNode.id === node.id)
             );

             // Find changed nodes (e.g., different position or data)
             const changedNodes = newDoc.nodes.filter((node) => {
                 const prevNode = prevDoc.nodes.find((prevNode) => prevNode.id === node.id);
                 return (
                     prevNode &&
                     (prevNode.position?.x !== node.position?.x ||
                     prevNode.position?.y !== node.position?.y ||
                     JSON.stringify(prevNode.data) !== JSON.stringify(node.data))
                 );
             });

             if (newNodes.length > 0) {
                 console.log('Incoming new nodes:', newNodes);
             }

             if (changedNodes.length > 0) {
                 console.log('Changed nodes:', changedNodes);
             }
         }

         // Detect changes in edges
         if (newDoc.edges && prevDoc.edges) {
             const newEdges = newDoc.edges.filter(
                 (edge) => !prevDoc.edges.some((prevEdge) => prevEdge.id === edge.id)
             );
             if (newEdges.length > 0) {
                 console.log('Incoming new edges:', newEdges);
             }
         }

         // Update the previous document reference
         prevDocRef.current = newDoc;