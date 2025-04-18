### History Sequencer

The sequencer lets you turn historical patch states and gestures into playable musical material. By arranging past changes into timed steps, you can transform nonlinear patch histories into structured compositions.

---

### Interface Overview

The History Sequencer is an 8-step table. Each row can be assigned to a change node from the graph or query tool. 

1. Select a node in either the History Graph or Query Tool. 
2. Next Hover over a sequencer row, specifically under the "Step" column. 
3. While holding **Cmd (Mac)** or **Ctrl (PC)**, click that row to assign the change node to a step. The step’s background color updates to match the node type, and its metadata is stored for playback.
4. To **clear** a step, right-click its row

Each step can also be assigned a duration (note length) and -- coming soon! -- loop behavior, depending on the current mode.

When a step contains a gesture, it's length is automatically quantized to the step's length. 

---

### Sequencer Modes

There are two modes:

#### Monophonic  
- Plays one step at a time, in order  
- Each step plays for its assigned duration (`4n`, `16n`, etc.)

#### Polyphonic  
- Each step loops independently at its own rate  
- Faster steps (e.g., `16n`) loop more often than slower ones (e.g., `2n`)  
- Steps overlap and interfere with each other, creating rich, glitchy textures  

If a gesture and another change node both target the same parameter, they compete — modulating against each other in potentially interesting or unpredictable ways as the system keeps recontextualizing modulation over dynamically recalled values.

---

### Step Order Modes

You can choose how the sequencer advances through steps:

- **Manual**: Fixed order from step 1 to 8 — like a classic step sequencer  
- **Topological Sort**: Steps are ordered based on their position in the patch history graph (Coming soon!)
- **Random**: Each step is chosen randomly on every beat (Coming soon!)

---

### Step Length Functions

Each step’s duration can be set manually or algorithmically:

- **User-Defined**: Choose a note length from a dropdown menu for each step  
- **Closeness Centrality**: Duration is based on how connected the node is in the graph (Coming soon!)
- **Euclidean Distance**: Each step and its next step are located in the history graph, and their spatial distance — scaled relative to the overall graph size — is mapped to a note length.

These mappings let you embed aspects of the structure of your patch history directly into the rhythm of your sequence.

---

### Gesture Playback and Reuse

When a gesture is assigned to a step:

- It is **automatically quantized** to match the step’s duration  
- Its shape is **preserved**, even if stretched or compressed  
- Playback is synced to the current BPM and step timing  

