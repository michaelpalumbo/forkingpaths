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

when loading a version that contains a param change, this doesn't trigger a rebuild of the audio graph. I tried this, but it also means that if i do this sequence : 1. load a version that involves disconnecting a cable. 2. load a later version with say a param change. then the later version load will not contain the addition of the cable. in order to do this properly, i need to do a diff operation on every version load, and that might be too expensive. 

as of version 543b194e, the sequencer works well, but each version recall causes audio clicks. these occur because the graph completely changes during non-zero crossing updates. To handle abrupt changes and avoid clicks caused by non-zero crossing updates in the audio graph, I implemented a crossfading mechanism within the block size of the audio worklet. This approach involves:

1. Dual Graph Rendering: Maintaining the current and next graph in memory and rendering both during a transition phase.
2. Buffer-based Interpolation: Using linear interpolation across the block's frames to mix the output of the current and next graph, ensuring a smooth transition.
3. Block-aware Transition: Computing and completing the crossfade within the block duration (e.g., 128 frames at 44.1 kHz ≈ 2.9 ms) to meet real-time audio constraints.

This method ensures seamless updates to the audio graph while preventing audible artifacts, supporting dynamic reconfiguration in real-time audio synthesis.



### DAG graph analyses for sequencing:

1. Centrality-Based Metrics
Closeness Centrality
What it tells you: Finds commits that are "central" in terms of their reachability to all other commits.
Possible Insight: Central commits may represent key turning points where significant changes or experiments were made.
Betweenness Centrality
What it tells you: Measures how often a commit lies on the shortest path between other commits.
Possible Insight: Identifies "bridging" commits that connect separate chains of experiments or feature branches, potentially acting as integrative points.
PageRank
What it tells you: Highlights commits that are more "important" based on the structure of incoming edges.
Possible Insight: Prioritizes commits that have many dependent changes or are frequently merged.
2. Degree-Based Metrics
Indegree (Dependencies)
What it tells you: The number of incoming edges to a commit.
Possible Insight: Commits with high indegree are foundational changes upon which many others depend.
Outdegree (Impact)
What it tells you: The number of outgoing edges from a commit.
Possible Insight: High outdegree commits may represent branching points where significant experimentation occurred.
3. Topological Insights
Roots (Initial Commits)
What it tells you: Nodes with no incoming edges.
Possible Insight: These are the earliest changes in the graph, representing starting points of ideas or experiments.
Leaves (Final Commits)
What it tells you: Nodes with no outgoing edges.
Possible Insight: These represent final or currently active states in the synthesizer's history, such as stable versions or ongoing experiments.
4. Path Analysis
Longest Path
What it tells you: The longest sequence of commits without revisiting a node.
Possible Insight: Identifies the most sustained chain of sequential changes, possibly indicating a linear feature development or bug fix history.
Shortest Path
What it tells you: The shortest path between two commits.
Possible Insight: Useful for determining the minimal steps or changes required to move between two specific states of the synthesizer.
5. Subgraph Analysis
Connected Components
What it tells you: Identifies disconnected subgraphs in the DAG.
Possible Insight: Separate components could represent independent experiments or development branches that are isolated from the main history.
Branching Factor
What it tells you: Evaluates how often commits diverge into multiple branches.
Possible Insight: A high branching factor might indicate periods of intense experimentation or parallel development.
6. Temporal Analysis
Commit Activity Over Time
What it tells you: Measures how many commits were made during specific periods.
Possible Insight: Peaks in activity may correspond to focused development periods or deadlines.
Staleness
What it tells you: Identifies nodes that haven't been touched in a long time.
Possible Insight: These commits might represent abandoned features or stable functionality.
7. Structural Patterns
Merges
What it tells you: Identifies nodes with multiple incoming edges.
Possible Insight: Represents integration points where parallel branches or experiments were combined.
Forks
What it tells you: Identifies nodes with multiple outgoing edges.
Possible Insight: Highlights points where the synthesizer's development branched into multiple experimental paths.
8. Experimental Diversity
Most Divergent Paths
What it tells you: Tracks branches that deviate the most from the main history.
Possible Insight: Highlights unique or highly experimental changes.
Convergence Points
What it tells you: Identifies nodes where previously independent branches merged.
Possible Insight: Represents consolidation of ideas or features.
9. Content-Specific Metrics
Since your graph stores synthesizer-specific data like parameter changes and cable connections, you can analyze:

Parameter Change Impact
What it tells you: Analyze commits where parameter changes occurred frequently or had significant cascading effects on later commits.
Possible Insight: Identify parameter tweaks that were foundational to subsequent experiments.
Cable Change Density
What it tells you: Measures the number of cable changes (connections/disconnections) in each commit.
Possible Insight: Highlights commits where substantial reconfiguration occurred.
10. Version Quality
Stable vs. Experimental Versions
What it tells you: Analyzes metadata to distinguish between "stable" and "experimental" commits.
Possible Insight: Helps classify commits into reliable states and ongoing experiments.
Visualization Ideas
Highlight Central Commits: Use node size or color to reflect centrality metrics like closeness or PageRank.
Branch Heatmap: Visualize branching density to show regions of intense experimentation.
Temporal Layers: Use layers or timelines to group commits based on time or development phases.



### step sequencer table:

step length function: determines the length of each step. "Euclidean Distance" calculates the step length based on the euclidean distance between the step in the graph, and the following row's node position in the graph. Closeness Centrality calculates the path distance between 2 nodes (how many nodes there are between them).  

using the table as a sequencer is A LOT more efficient than the graph, and it's not slowing down!

### determining note lengths
using the euclidean distance note length function:

Define Note Lengths:

Map the smallest distance (≤ 50) to a 32nd note ("32n").
Map the largest distance (max distance) to a whole note ("1n").
Interpolate distances in between to corresponding note lengths.
Linear Interpolation:

Use the formula:
mappedValue
=
minValue
+
(
distance
−
minDistance
)
×
maxValue
−
minValue
maxDistance
−
minDistance
mappedValue=minValue+(distance−minDistance)× 
maxDistance−minDistance
maxValue−minValue
​
 
Here, minValue and maxValue represent indices of note lengths ("32n", "1n").
Define Note Lengths Array:

Use an array of note divisions: [ "32n", "16n", "8n", "4n", "2n", "1n" ].
Clamp Values:

Ensure values below 50 are mapped to "32n" and values equal to or greater than max are mapped to "1n".


### future work:
if i could start this over again, i would build the forking paths as just the history sequencer, not build a synth too. so i would make it something that can be connected to a MIDI device or OSC namespace, and use it with existing hardware or software

Automerge uses last-writer-wins (LWW) conflict resolution for most properties.

To detect cycles at the parent node level (modules) in your modular synth patching interface, we need to abstract the graph to focus solely on parent nodes and their connections, ignoring the child nodes. Then, we perform cycle detection on this higher-level graph.

Here's how you can implement this:

Approach
Abstract Parent Nodes:

Identify parent nodes and treat them as the main graph elements for cycle detection.
Connections between child nodes (like module1.out > module2.in) translate to connections between their parent nodes.
Create a Reduced Graph:

Build a virtual graph where edges represent connections between parent nodes (modules).
Include self-loops for connections within a module (module1.out > module1.in).
Detect Cycles:

Use a depth-first search (DFS) or another algorithm (e.g., Tarjan's strongly connected components) to check for cycles in this reduced graph.