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

todo: write about the preprocessing handled by rnboDevice2modules.js: Preprocessing RNBO WebAssembly for Efficient Modular Synthesis Integration
In order to integrate Cycling '74’s RNBO-generated DSP modules into a web-based modular synthesizer, a preprocessing script was developed to efficiently handle the WebAssembly (WASM) binaries associated with each RNBO device. RNBO exports DSP code as Base64-encoded and zlib-compressed WASM binaries within JSON files, which, if used directly, would significantly increase application load times and memory overhead. To address this, the preprocessing script performs the following transformations:

File Processing and Filtering
The script scans a designated directory for RNBO .export.json files while excluding non-relevant files such as modules.json and dependencies.json. Each valid RNBO export file is parsed and processed independently.

Decoding and Decompression
The RNBO .export.json files store WASM binaries in a compressed, Base64-encoded format. The script first decodes the Base64 string into a binary Uint8Array and subsequently applies pako.inflate() to decompress the zlib-compressed data, restoring the original WASM binary.

Binary File Storage
Instead of embedding the decompressed WASM binary within the main JSON configuration file, the script writes the binary to a dedicated .wasm file stored in a designated directory (./public/wasm/). This separation improves application efficiency by reducing the size of modules.json and enabling direct WebAssembly instantiation from a pre-processed binary.

Generating a Lightweight JSON Metadata File
The script constructs a modules.json file that retains metadata about each RNBO module, including its parameters, input/output definitions, and file path reference to the external .wasm binary. This modular approach ensures that the WebAssembly code is fetched and instantiated dynamically during runtime, reducing memory consumption and improving load times.

Web-Based Loading and Instantiation
The web application fetches and loads the preprocessed RNBO modules dynamically. When a user selects an RNBO-based module, the system retrieves the corresponding .wasm file using fetch(), converts it into an ArrayBuffer, and instantiates the WebAssembly module using WebAssembly.instantiate(). This ensures that DSP execution is handled in a performant and scalable manner.

This preprocessing workflow optimizes the handling of RNBO-generated DSP modules in a web-based environment by reducing unnecessary data processing at runtime, minimizing network payloads, and enabling efficient, modular synthesis performance.

In exploring the possibility of integrating RNBO exports as a feature add in my AudioWorklet, I encountered several trade-offs that ultimately led me to decide against its implementation. Here’s my reasoning, expressed from my personal experience:

1. Initialization and Timing:
RNBO’s export model is inherently appealing because it allows for designing modules in a more declarative manner and offloads much of the DSP boilerplate. However, I discovered that RNBO modules typically initialize asynchronously—often relying on a “ready” promise and dynamic evaluation to set up the DSP code. In contrast, my AudioWorklet’s process() method demands strictly synchronous, sample-accurate processing. This fundamental timing mismatch raised concerns about potential glitches and timing inconsistencies during audio processing.

2. State Management and DSP Graph Integration:
My project already features a custom DSP architecture, complete with its own state management, node graph, and crossfade logic. Integrating RNBO’s patch-based approach into this established system would have required reconciling two very different paradigms. This integration not only would have increased the overall complexity of my design but also introduced extra overhead in translating between RNBO’s model and my existing, carefully tuned DSP graph.

3. Real-Time Performance Constraints:
The real-time nature of audio processing in an AudioWorklet is non-negotiable. Any extra abstraction layer—especially one that might introduce asynchronous behavior or other unpredictable delays—could compromise performance, leading to unwanted latency or even audio dropouts. Given that RNBO’s model wasn’t a one-to-one fit with my synchronous processing requirements, I was reluctant to risk the stability of the project.

4. Development Trade-Offs:
While RNBO offered the promise of rapid prototyping and simplified module design, I realized that the cost of refactoring my system to accommodate it would be substantial. I had already built a stable, working solution that met my needs. In this context, introducing RNBO would have meant a pivot toward increased complexity without a clear benefit that justified the additional risk and development effort.

Conclusion:
I pushed my exploration of RNBO far enough to thoroughly understand its benefits and limitations. Despite its appealing approach to module design, the added complexity, timing issues, and integration challenges with my AudioWorklet led me to conclude that it is not appropriate to implement in my project. Ultimately, I decided that sticking with my custom DSP architecture was the better choice for maintaining the real-time performance and stability required by my work.

In my exploration of importing code exports into the AudioWorklet, I encountered several limitations and challenges that ultimately influenced my decision not to pursue the RNBO approach further. Reflecting on these experiences, I observed the following:

1. **Boilerplate and Wrapping Requirements:**  
   I found that the RNBO exports are not immediately compatible with the AudioWorklet environment. The exported code typically assumes the availability of asynchronous initialization and a broader runtime context (such as DOM or Node.js APIs), which the AudioWorklet simply doesn’t offer. To use these exports, I needed to wrap them with additional boilerplate code—often using dynamic evaluation via `new Function()`—to transform the export into a factory function that would return a usable DSP instance. This extra layer of wrapping not only added complexity to my codebase but also introduced potential points of failure, making the overall system more fragile.

2. **Synchronous vs. Asynchronous Execution:**  
   The AudioWorklet’s `process()` method requires that all computations occur synchronously and with sample-accurate timing. However, the RNBO modules were designed to handle asynchronous initialization (using promises and callbacks). Aligning these two paradigms forced me to add considerable boilerplate to force the RNBO exports into a synchronous mold, which undermined one of the key advantages of using RNBO—the elegant, modular design of DSP components.

3. **Environment Limitations:**  
   The AudioWorklet operates in a highly constrained environment. Unlike a full browser context or a Node.js process, the worklet does not have access to a full set of APIs (e.g., DOM, certain network APIs, etc.). Many of the code exports I attempted to import were written with assumptions about their runtime environment that simply did not hold true in the worklet context. This meant that, beyond just adding boilerplate wrappers, I often had to refactor parts of the exported code to remove or replace unsupported functionality.

4. **Interface Inconsistencies and Integration Overhead:**  
   Another significant issue was the inconsistency in the interfaces provided by the RNBO exports. Depending on how the module was generated, I encountered variations such as a direct factory function, a default export, or even a nested `factory` property. This variability made it difficult to design a one-size-fits-all integration strategy. I ended up writing conditional logic to detect and correctly extract the factory function—further complicating the integration process and increasing maintenance overhead.

5. **Successes Amid the Challenges:**  
   Despite these challenges, I did achieve some success in dynamically evaluating and loading the RNBO exports. I was able to extract a DSP function using dynamic evaluation and even run some basic processing tasks. This confirmed that the RNBO modules were fundamentally sound and that the approach had merit in terms of modular design. However, the necessity for extensive boilerplate modifications and the ongoing struggle to align asynchronous patterns with the synchronous AudioWorklet process ultimately outweighed these benefits.

6. **Overall Reflection:**  
   I made it this far to explore RNBO as a potential feature add because I was drawn to its promise of simplifying module design and DSP component integration. Yet, the practical realities—namely, the extensive modifications required to adapt the exported code to the strict, synchronous environment of the AudioWorklet—demonstrated that the additional complexity was not justifiable. In the end, while there were moments of success that confirmed RNBO’s potential, the challenges with importing and adapting its code exports revealed that it was not an appropriate fit for my project’s real-time processing requirements.

In summary, the journey of attempting to import RNBO code exports into my AudioWorklet provided valuable insights. It highlighted the trade-offs between adopting a modular, export-driven DSP design and maintaining the strict performance and timing guarantees necessary for real-time audio processing. This reflection ultimately guided my decision to stick with my custom DSP architecture, which, while perhaps less elegant in theory, proved to be the more reliable and practical choice given the constraints of the AudioWorklet environment. To view the progress I made with RNBO in Forking Paths, please see "31a1fb9aa97f5e7c18896d17ed90b3f17e5bddf6" on branch 'legacy/rnbo'.


## module DSP discussion:

Module: "Euclid"

A Euclidean rhythm generator, which evenly distributes active pulses across a sequence of steps, as well as an optional ratchet effect that subdivides each step into multiple pulses.

How It Works:

Tempo and Step Duration: The module calculates the duration of each step in samples by converting the tempo (in beats per minute) to a time interval using the formula:
stepDuration = (60 / tempo) * sampleRate
This determines how many samples constitute one rhythmic step.
Pulse Width and Fixed Pulse Duration:
The pulse width parameter, defined as a fraction between 0 and 1, theoretically determines the fraction of the step during which the pulse is active. However, for non‐ratchet (i.e., single-pulse) operation, a fixed very short pulse duration (e.g., 0.5 ms) is used to ensure that the pulse triggers only once at the beginning of the step.
Euclidean Pattern Generation:
An internal helper function uses a simple bucket algorithm to generate an array (the “pattern”) that indicates which steps should be active. The parameters stepCount and activeSteps define the total number of steps and the number of pulses to distribute, respectively.
Ratchet Subdivision:
When the ratchet parameter is greater than 1, each step is subdivided into smaller intervals. The code computes a ratchetInterval (the length of each subdivision) and a corresponding ratchetPulseSamples value, which controls the duration of each subpulse. This allows for multiple, closely spaced pulses (or “ratchets”) to occur within a single step.
Clock and Pulse Generation:
A running clock (tracked in node.clockPhase) advances sample by sample. When the clock exceeds the step duration, it resets and the step index is advanced. For active steps—as determined by the Euclidean pattern—the code checks the current phase within the step (or within each ratchet subdivision) and outputs a high signal (1.0) for the duration of the pulse, while outputting 0 otherwise.
Parameters and Calculations:

Tempo: Determines the step duration via (60 / tempo) * sampleRate.
Pulse Width: A normalized value (0–1) that, in theory, scales the pulse duration relative to the step duration; for non‐ratchet mode, a fixed 0.5 ms pulse is enforced.
Step Count and Active Steps: Define the overall rhythmic structure; these values are used by the Euclidean algorithm to distribute pulses evenly.
Ratchet: When set above 1, the step duration is divided into ratchetInterval = stepDuration / ratchet segments, and the pulse length for each subpulse is computed accordingly.
Reasoning Behind the Design:
The goal was to create a versatile, real-time pulse generator that could serve as the backbone for complex rhythmic sequences. The use of the Euclidean algorithm was chosen for its musical utility—allowing even distribution of pulses across a measure—while the ratchet functionality offers additional rhythmic variation. The design had to balance precision (in terms of timing) with computational efficiency within the constraints of an audio worklet environment.

Development Steps:

Basic Gate Sequencer: Began with a simple pulse generator that produced a gate (on/off signal) based on tempo and a fixed pulse width.
Integration of Euclidean Algorithm: Added logic to compute an even distribution of pulses using stepCount and activeSteps parameters.
Incorporation of Ratchet Effect: Extended the sequencer to support subdividing a step into multiple pulses, based on a ratchet parameter.
Refinement: Adjusted pulse durations (e.g., enforcing a very short fixed pulse for non‐ratchet cases) and ensured state variables (clock phase, step index) were properly managed to avoid unintended triggers.
Pulses
What It Is:
The Pulses module is a dedicated DSP routine designed to generate discrete pulse signals as part of a rhythmic sequence. It is a simpler variant of the general gate sequencer and is intended to serve as a building block for more complex modulation and triggering schemes. This module focuses on generating a single pulse per step based on the pulse width and tempo parameters.

How It Works:

Step Duration: Similar to the general sequencer, the step duration is computed from the tempo using the formula:
stepDuration = (60 / tempo) * sampleRate
This value defines the number of samples per rhythmic step.
Pulse Width and Pulse Duration:
The module takes an effective pulse width—a fractional value between 0 and 1—and clamps it to ensure it does not exceed a maximum value (typically slightly less than 1). The pulse duration (in samples) is then calculated as a fraction of the step duration. In some iterations, the pulse duration is overridden by a fixed value (e.g., 0.5 ms) to ensure a clean, single trigger.
State Management:
State variables such as clockPhase, stepIndex, and pulseCounter are used to track the progression through each step and to control when a pulse should be generated.
Pulse Generation:
The clock advances sample by sample, and when it exceeds the step duration, it resets and triggers a pulse by setting the pulse counter to the calculated pulse duration. The output signal is set high (1.0) for the duration that the pulse counter is active and remains low (0.0) otherwise.
Parameters and Calculations:

Tempo: As before, used to calculate the step duration.
Pulse Width: Determines the fraction of the step during which the pulse is active; this value is clamped to avoid overflow (e.g., to a maximum of 0.999).
Step Count: While the basic Pulses module may not use a Euclidean algorithm for pulse distribution, it still relies on the concept of dividing the rhythmic timeline into discrete steps.
Pulse Duration Calculation:
The pulse duration is typically calculated as:
pulseSamples = Math.max(1, Math.round(effectivePulseWidth * stepDuration))
In some cases, a fixed duration (e.g., 0.5 ms) is enforced to prevent double triggering.
Reasoning Behind the Design:
The Pulses module was developed to provide a straightforward method for generating precise, time-based pulses within a rhythmic framework. Its simplicity makes it well-suited for applications where a consistent trigger is needed on each step, and it serves as a precursor to more advanced modules (such as the Euclid node) that incorporate additional rhythmic complexity. The focus was on ensuring timing accuracy and flexibility in pulse duration relative to the musical tempo.

Development Steps:

Initial Prototype: The module was first implemented as a basic gate sequencer that generated a pulse at the start of each step based on the current tempo and pulse width.
Parameter Integration: Added support for dynamically adjusting pulse width and step count, with real-time modulation capabilities.
Timing Refinements: Adjusted the clock and pulse counter logic to ensure that pulses were triggered correctly and only once per step.
Optimization: Incorporated clamping and fixed pulse duration overrides (e.g., a 0.5 ms pulse) to ensure robust operation even when modulation inputs pushed parameter values beyond their intended range.

Delay DSP Module
What It Is:
The Delay module implements a time‐based effect that delays the incoming audio signal while allowing for modulation of the delay time, feedback, and mix. It uses a circular buffer (sized for one second of audio) to store past samples and employs allpass interpolation to achieve fractional delays, ensuring smooth transitions when the delay time is modulated.

How It Works:

Buffer Initialization:
On the first run, a delay buffer is allocated with a length equal to the sample rate (i.e., one second of delay). State variables such as delayIndex, lowpass filter cutoff (lpfCutoff), previous delay time, and allpass filter memory (allpassMem1, allpassMem2) are initialized.
Delay Time Modulation:
The module reads the current delay time (using both a base value and modulation via a CV input) and smooths the transition between delay times by slowly updating the previous delay time toward the new value (using a weighted average with a factor of 0.1).
Sample Conversion and Interpolation:
The smoothed delay time (in milliseconds) is converted to delay samples. The integer and fractional parts are separated: the integer part is used to index the delay buffer, while the fractional part is used in an allpass interpolation formula. This interpolation creates a smoothly varying delay even when the delay time does not fall exactly on a sample boundary.
Feedback and Mixing:
The delayed sample is processed through a simple lowpass filter (using a coefficient computed from the cutoff frequency) to shape the feedback signal. The filtered feedback is then combined with the current input (using defined wet and dry mix ratios) to produce the final output sample.
Buffer Update:
After processing, the output sample is stored back into the delay buffer in a circular fashion, ensuring continuous delay processing.
Parameters and Calculations:

Delay Time: Controlled by a base parameter and modulated via a CV input.
Feedback: A numerical value (defaulting to 0.5 if not specified) that determines the intensity of the delayed signal fed back into the delay line.
Wet/Dry Mix: Defines how much of the delayed (wet) signal versus the original (dry) signal appears in the output.
Lowpass Filter: Uses a cutoff frequency (defaulting to 3000 Hz if unspecified) to compute an RC constant and smoothing coefficient, thereby shaping the feedback.
Reasoning and Development:
The design of the Delay module was driven by the need for a natural-sounding delay effect that responds smoothly to modulation. Allpass interpolation was added to handle fractional delay times, and the lowpass filtering of the feedback path was implemented to mimic the frequency roll-off observed in analog delay circuits. Iterative testing ensured that the module remains stable and musically responsive under various modulation conditions.

Development Steps:

Initialize the delay buffer and state variables.
Implement smoothing for delay time modulation to avoid abrupt changes.
Add fractional delay capability via allpass interpolation.
Integrate feedback processing with a lowpass filter and wet/dry mix.
Test and fine-tune the module for musical responsiveness.
High-Pass Filter DSP Module
What It Is:
The High-Pass Filter module is designed to attenuate low-frequency content while allowing higher frequencies to pass through. It uses a cascaded biquad filter approach to achieve a steeper roll-off and more effective filtering.

How It Works:

Coefficient Calculation:
Based on the effective cutoff frequency (derived from the base parameter and any modulation) and the Q factor, the module computes the biquad filter coefficients using standard equations. The coefficients are normalized to ensure filter stability.
Cascaded Filtering:
To achieve a stronger high-pass effect, two stages of biquad filtering are applied sequentially. The first stage processes the incoming signal, and its output is fed into the second stage.
State Management:
History arrays are maintained for both filter stages, storing the previous two input and output samples necessary for the recursive filter equations.
Processing Loop:
For each sample, the module applies the biquad formula of the first stage, updates the history arrays, and then processes the result through the second stage. The final output is written to the signal buffer.
Parameters and Calculations:

Effective Frequency: Clamped between 80 Hz and 10,000 Hz to ensure musically relevant cutoff frequencies.
Q Factor: Typically clamped between 0.1 and 20, controlling the filter’s resonance.
Biquad Coefficients: Calculated using the cosine and sine of the normalized angular frequency and the Q factor, then normalized by dividing by the coefficient a0.
Cascaded Stages: Two passes through the filter provide a steeper attenuation of low frequencies.
Reasoning and Development:
The High-Pass Filter was implemented to clean up low-frequency rumble and unwanted noise while preserving the clarity of higher frequencies. Cascading two biquad stages allowed for a more pronounced filtering effect without significantly increasing computational complexity. Stability and smooth performance were key priorities, leading to careful clamping of parameter values.

Development Steps:

Compute biquad coefficients from the effective frequency and Q parameters.
Set up history arrays for two filtering stages.
Implement the per-sample filtering loop with cascaded stages.
Validate the filter performance across a range of input conditions and adjust parameter clamping as needed.
VCA (Voltage-Controlled Amplifier) DSP Module
What It Is:
The VCA module controls the amplitude of an input signal based on a gain parameter, which can be modulated by additional control voltage (CV) inputs. It incorporates a DC-blocking filter to prevent low-frequency drift from affecting the gain control.

How It Works:

Gain Calculation:
The effective gain is computed by combining a base gain value with modulation inputs. The modulation is filtered using a simple DC-blocking filter to remove any unwanted DC offset.
DC-Blocking Filter:
Implemented as a first-order high-pass filter with a cutoff frequency (around 5 Hz), the filter uses an exponential decay function based on the sample rate. It maintains state (previous input and output) to ensure smooth filtering.
Per-Sample Processing:
For each sample, the module multiplies the input signal by the effective (and clamped) gain value, resulting in amplitude modulation that follows the control voltage while avoiding DC-induced distortions.
Parameters and Calculations:

Base Gain: The primary amplitude setting, which is modulated by an offset from CV inputs.
Modulation Input: Scaled and filtered to remove DC components using a high-pass filter with a cutoff around 5 Hz.
Clamping: The final gain is clamped between 0 and 1 to ensure that the output remains within the acceptable range without clipping.
Reasoning and Development:
The VCA module was developed to allow precise, dynamic control of signal amplitude within the synthesis chain. By including a DC-blocking filter, the design prevents slow, unwanted changes (drift) from corrupting the gain modulation. This results in cleaner audio output, particularly when modulation sources are involved.

Development Steps:

Compute the effective gain by combining the base parameter with the modulated value.
Implement a first-order high-pass filter to remove DC offset from the modulation.
Apply the computed gain to the input signal on a per-sample basis.
Test the module to ensure that the gain control is both responsive and free of unwanted artifacts.
Oscillator DSP Module
What It Is:
The Oscillator module generates periodic waveforms (sine, square, sawtooth, triangle) that serve as fundamental sound sources in synthesis. It is responsible for creating the basic tonal material that can be further processed or modulated by other modules.

How It Works:

Phase Increment:
The oscillator maintains a phase value that is incremented for each sample. The increment is determined by the effective frequency (which can be modulated by CV inputs) and the sample rate. The phase is wrapped back to zero when it reaches or exceeds 1, ensuring a continuous cycle.
Waveform Generation:
Depending on the selected waveform type (provided as a parameter), the module calculates the output sample using the appropriate mathematical function:
Sine: Uses Math.sin(2 * Math.PI * phase).
Square: Outputs 1 or –1 based on whether the phase is in the first or second half of the cycle.
Sawtooth: Computes a linear ramp from –1 to 1.
Triangle: Generates a symmetric ramp up and down.
Gain Application:
The calculated waveform is multiplied by an effective gain parameter, controlling the amplitude of the oscillator’s output.
Processing Loop:
For every sample in the processing block, the oscillator updates its phase, computes the corresponding waveform value, and writes it to the signal buffer.
Parameters and Calculations:

Effective Frequency: Determines the rate of phase increment; derived from a base frequency and any modulation.
Effective Gain: Controls the amplitude of the output signal.
Waveform Type: Determines the mathematical function used to generate the waveform.
Phase Wrapping: Ensures that the phase variable remains within the [0, 1] interval by subtracting 1 when necessary.
Reasoning and Development:
The Oscillator module is a cornerstone of digital synthesis. It was designed for flexibility, supporting multiple waveform types and dynamic modulation of frequency and gain. Emphasis was placed on precise phase management and efficient per-sample processing to ensure high-quality, artifact-free sound generation.

Development Steps:

Implement the basic oscillator loop that updates phase and computes waveform values.
Add support for multiple waveform types through a switch-case construct.
Integrate frequency and gain modulation to allow dynamic control.
Optimize the phase wrapping and processing loop to ensure consistent performance in real time.
