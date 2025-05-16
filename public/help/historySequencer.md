# History Sequencer

The History Sequencer is an 8-step table. Each row can be assigned to a change node from the graph or query tool. 

---

## Quick Start

1. Select a node in either the History Graph or Query Tool. 
2. Next, hover over a sequencer row, specifically under the "Step" column. 
3. While holding **Cmd (Mac)** or **Ctrl (PC)**, click that row to assign the change node to a step. The step’s background color updates to match the node type, and its metadata is stored for playback.
4. To **clear** a step, right-click its row
5. Click **start sequence** to start the sequencer. Click it again to stop it. 

- To adjust the tempo, drag the BPM slider 

When a step contains a gesture, it's length is automatically quantized to the step's length. 

Recap:

- Add step: Click node in history Graph. Cmd/Ctrl-Click a step in sequencer
- Remove step: Right-Click a step in the sequencer

---

## Saving and Recalling Sequences

Sequences themselves can be saved and reused like change nodes. This lets you embed compositional structure into your patch history — or even nest sequences inside other sequences.

To **save** a sequence:

1. Add one or more steps to the sequencer.
2. Once the sequencer contains at least one step, the **Save** button will become available.
3. Click **Save** to commit the current 8-step sequence as a **sequence changeNode** in the History Graph.
4. A new sequence changeNode will appear in the graph: <span style="color: #00806b">●</span> 

To **load** sequence:

1. Hover over a <span style="color: #00806b">●</span> **sequence changeNode** in the History Graph  
2. Hold **Cmd (Mac)** or **Ctrl (PC)** and **click** the node  

> This will **overwrite** the current sequencer contents.

---

## Modes

There are 4 menus in the top-right corner of the sequencer which select different modes of the Sequencer. 

### Playback

**Monophonic:** Steps play one after another, in order.
- Each step plays for a set duration (e.g., "4n", "16n").

**Polyphonic:** Each step is an independent loop. (Currently Disabled -- Fixes coming soon!)
- Step duration determines how often it loops.
- Steps can overlap and play asynchronously.

### Step Order

You can choose how the sequencer advances through steps:

- **Manual:** Plays steps 1 to 8 in order (like a traditional step sequencer).
- **Topological Sort:** Follows the version history graph’s order (based on patch change relationships) (Currently Disabled -- Fixes coming soon!)
- **Random:** Chooses a new random step each time


### Step Length

Each step’s duration can be set manually or algorithmically. These function can embed aspects of the structure of your patch history directly into the rhythm of your sequence.

- **User-Defined:** Set step length manually using note values (e.g., "8n", "4n").
- **Closeness Centrality:** Step length is based on how central the step’s node is in the history graph.
- **Euclidean Distance:** Step length is based on how far the step’s node is from the first step in the graph layout.

#### Empty Step Modes
**Pass-Through:** Keeps the previous state active for the full step duration.
**Blank Patch:** Loads a silent, empty patch for the duration of the step.
**Skip:** Immediately moves to the next step without playing anything.

---

## Gesture Playback and Reuse

When a gesture is assigned to a step:

- It is **automatically quantized** to match the step’s duration  
- Its shape is **preserved**, even if stretched or compressed  
- Playback is synced to the current BPM and step timing  

---

## updates coming soon:

- loop behavior, depending on the current mode.

### Adding a Sequence as a Step (Moved here until it's totally ready)

You can also assign a saved sequence as a single step in another sequence (i.e., nested sequencing):

- Click a **sequence changeNode** in the History Graph  
- Then **Cmd (Mac)** or **Ctrl (PC)** + **click** on a step in the sequencer table  

> This feature is **in progress** and not yet available in the current build.