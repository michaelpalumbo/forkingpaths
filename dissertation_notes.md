- HEADs need to be kept track of;
    - - the history graph only cares about the whatever head is the latest head. 
    - - - the latest head should always be highlighted << todo >>
    - - DONE when we load an old version, add currentHEAD to HEADs obj, set old version hash to branchHEADs.current: hash, 
    - - to figure out: when making a change at a given HEAD, the new HEAD which comes from it is a node which will need its own hash, but we need to set the source HEAD as the new node's dependency?

     let branchHEADs = {
    current: null,
    // then store all of them here
    // i.e. 'hash': { dependencies: [], mergeHash: null }
}

click hash
set clonedState = true
when next edit, check clonedState, if yes, create the branch then

Automerge DOCUMENTS ARE BRANCHES!!!

// >> no longer true: historyGraphCy is just a representation of the partial history of the document (i.e. it doesn't include the doc.title changes which forkingPaths automatically does to set and use branch names. there will probably be other meta stuff it will need to ignore too. this should not break automerge, as all we need to do is call a branch name (document title) & hash from the historyGraph which AM will have)

meta.branches stores branch history, and head & parent hashes
meta.docs stores entire automerge docs

slider updates in AM:

todo: make a button to print the namespace of all parameter IDs (later we can use this to make OSC mappings)

the synth cytoscape (cy.) is just a representation of the synth in automerge, so we can clear and re-render the entire cy.instance each time there's an edit or version recall.

history selection: can resize or shift/move the selection over history. question of how to maintain playback of a history sequence while also playing with other parts of history (would need to find a way to do something similar to the git worktrees concept -- can cite the alicenode editor for this too)

use cytoscape graph/network analysis to come up with sequencer patterns!

Flexibility: Your structure includes nested data for inputs, outputs, and sliders. Modifying the script allows you to preserve the richness of your representation.
Dynamic Parameter Binding: Child nodes like sliders directly map to RNBO parameters, making dynamic updates seamless.
Graph Consistency: The parent-child relationship in Cytoscape mirrors the modular synthesizer's structure, ensuring connections and parameters align with the RNBO device.

meta contains 2 representations of the synth: the cytoscape graph (visual), and a synth graph (audio):

```javascript
// cytoscape
{
  nodes: [
    { id: "oscillator-owl-f62hfk92hf8", data: { frequency: 440, type: "sine" } /* etc */},
    { id: "vca-wombat-h82gf0k37fh", data: { frequency: 440, type: "sine" } /* etc */},
  ],
  edges: [
    { source: "osc1", target: "gain1" },
    { source: "gain1", target: "destination" }
  ]
} // todo! check for acurracy on the cytoscape part, this model is likely out of date


// synth graph (audio)
{
  modules: {
    "osc1": { type: "oscillator", params: { frequency: 440, type: "sine" } },
    "gain1": { type: "gain", params: { gain: 0.5 } }
  },
  connections: [
    { source: "osc1", target: "gain1" },
    { source: "gain1", target: "destination" }
  ]
}

```

has a limiter on the output


# optimization
there are 3 components of this app that use significant resources: cytoscape, automerge, and web audio. 

The first iteration of web audio used function syncAudioGraph(doc) (see commit 5ca62d09b608309e562400b0b17a0d360df965b8). but this caused significant overload in the main thread, so i've switched to a method using an audio worklet that will manage the modular patching logic. 
one critical aspect of doing this makes me think that using an audio worklet for the entire graph might make it so that i can have multiple graphs running (i.e. if i wanted to experiment with running more than one history sequence running, or one history sequence running alongside live patching) 

another optimization issue was having all of the cytoscape instances running in the same tab. so i've moved the history graph and history sequencing to a separate page which can be opened either in a new window or new tab. This approach offloads the graph processing and rendering to a separate browser tab or window, while maintaining synchronization with the main application.

new optimization: rendering of history graph is handled server-side using headless cytoscape, and then updates are sent via json to the client at a polling rate. 

am throttling updates sent from main app to history-tab at a rate of 1000ms. (only one update per 1000 ms)



note that the audio worklet doesn't process at the sample-level, but the block size. most browsers have a block size of 128 samples. 

using floatingUI to overlay knobs and drop-down menus onto the modules