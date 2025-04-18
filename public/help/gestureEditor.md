### Gesture Editor

The gesture editor lets you view, edit, and reassign recorded parameter gestures — like knob turns. Gestures can be saved, looped, reshaped, and mapped onto different parameters.

---

### Interface Overview

A gesture is created by clicking and dragging on a knob in the synth interface (single clicks on knobs are stored as discrete *paramChanges*). When you select a gesture node in the History Graph, it opens in the editor, which shows:

- A left-to-right timeline of points
- Nodes connected by arrows, where Y = value and X = time  
- Labels for min, max, and total duration  
- Exact values can be viewed by howvering a gesture node and viewing in the editor toolbar

You can:
- 🖱 Click or drag points to preview their value visuall and audibly (its a little clunky atm, you need to grab+drag the node from slightly above its top)
- ▶️ Press the play button to hear the full gesture  
- 🔁 Loop gestures during playback  
- ✏️ Drag points vertically to adjust their value (horizontal editing is not yet supported)

No edits are committed to history until you click **Save** — allowing for free experimentation.

---

### Parameter Reassignment

Using the **Assign to...** dropdown menu, you can reassign a gesture to any other parameter.

- The gesture is **rescaled** to fit the new target’s range  
- For discrete menus, the gesture sweeps through menu items in a stepped fashion  
- Click play to preview the result
- Click save to add it to the history

Original gestures are never overwritten — each reassignment or edit creates a **fork** from the original gesture node.

---

### Easing Functions

You can apply an easing curve to shape the timing and dynamics of a gesture. Options include:

- `Linear` (default)  
- `Ease In`  
- `Ease Out`  
- `Inverted`  
- `Stepped`  

Eased gestures can be assigned and previewed as well.

---

### Sequencer Integration

Gestures can be added directly to sequencer steps. They play in full during each step’s duration and in *Polyphonic Mode* interact dynamically with other patch changes.

You can also:
- Assign a single gesture **point** to a sequencer step (as a discrete change) by clicking that point and then assigning it to the step (see the History Sequencer *help* for how to assign steps)
- Save and load gestures to/from your computer (Coming soon!)  

---

### Coming Soon

- 🛠 Multi-point editing and segment assignment are planned for future releases  
