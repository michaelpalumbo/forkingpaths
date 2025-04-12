function updateHistoryGraph(ws, meta, docHistoryGraphStyling) {
    const { nodes, edges, historyNodes } = buildHistoryGraph(meta, existingHistoryNodeIDs, docHistoryGraphStyling);
    historyDAG_cy.add(nodes);
    historyDAG_cy.add(edges);
    historyDAG_cy.layout(graphLayouts[graphStyle]).run();

    const graphJSON = historyDAG_cy.json();
    ws.send(JSON.stringify({
        cmd: "historyGraphRenderUpdate", 
        data: graphJSON
    }));
}
