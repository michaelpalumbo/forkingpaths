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
  - might talk about how this is a limitation to using cytoscape, where the first version of forking paths used cy nodes to make sliders but it was really clunky. the latest version uses floatingUI to position and maintain position of html elements over modules

todo: use the release() method in the .knob() to get the start and end of a knob gesture and store it as an array in the history sequence

I’ve been facing significant performance issues. Maintaining the positioning of floatingUI overlays when modules are added, moved, or when the viewport is panned has slowed the application down considerably. On top of that, Cytoscape.js, the library I’ve been using to manage node-based interfaces, doesn’t handle the storage and retrieval of node positions efficiently. These challenges have led me to consider pivoting to a fixed modular synthesizer design. In this approach, the system will include a predefined set of modules, such as two oscillators, three LFOs, and two filters. Users won’t be able to add or rearrange modules during performance, but the modular functionality—allowing connections and control between modules—will remain intact. Restricting module movement on the synth performance page will eliminate performance bottlenecks caused by floatingUI and pan listeners, while also addressing Cytoscape’s limitations.

To retain flexibility for users, I propose introducing a separate “System Designer” page. This page would allow users to create custom modular systems by selecting modules from a library, arranging them in a freeform or grid-based layout, and establishing connections with virtual cables. Users could save these configurations as files, which would include module types, positions, and connections. These saved configurations could then be loaded into the main app, where the modules would render in fixed positions with their connections intact. This approach ensures stable performance while removing the need for runtime recalculations.

This pivot offers several advantages. A fixed modular synth will improve performance by eliminating the overhead of dynamic module management and simplifying the user interface. It will also reduce complexity, making debugging and testing much easier, and aligns with the manageable scope of my PhD project. The integration of version control features such as saving and loading patch states, tracking parameter changes, and branching configurations will remain central to the system. By separating system design from performance, the main app can focus solely on efficient signal processing. For advanced users, the System Designer will retain flexibility by allowing them to create and customize their own modular setups, while casual users can rely on pre-designed templates.

To implement this system, I plan to develop the System Designer using tools like React Flow or Cytoscape.js for node-based design. A structured, extensible configuration format, such as JSON, will store the modular system designs, which can then be loaded and rendered in the main app. Features like zoom, pan, undo/redo, and validation will enhance usability, and I’ll provide clear instructions to guide users in saving and loading configurations. Challenges such as managing large designs, ensuring compatibility, and preventing invalid setups can be addressed through thoughtful design choices like zoomable interfaces, version compatibility checks, and robust validation.

Looking forward, I see potential for expanding this system to include features like pre-built system templates, community sharing for user-designed configurations, and the ability to introduce dynamic add-ons to fixed systems. This pivot strikes a balance between flexibility, performance, and usability, and I believe it’s the right direction for my PhD project. The combination of the fixed synthesizer and the System Designer will provide a solid foundation for demonstrating the integration of modular synthesis with version control in a practical and innovative way.

in the new system, modules can't be added or removed as part of the main view, which means these actions won't be part of the automerge history either. its ok, it's still addressing the limitation of the position loading too. 

for now: loading a synth doesn't erase the history of the previous synth? can this be effectively sequenced tho? 

see issue #20 for branch legacy/module-placement

when loading a version that contains a param change, this doesn't trigger a rebuild of the audio graph. 