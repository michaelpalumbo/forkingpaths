### History Graph

This graph shows every change you've made to the patch — like a branching version control system for synthesis.

---

### Interface Overview

Each **circle** in the graph represents a change  (e.g. parameter tweak, cable movement, or gesture) that you made to the synth.

- The **bottom-most node** is your starting point — usually a loaded synth file or a blank patch.
- Arrows pointing **upward** indicate newer changes that build on earlier ones.
- Some changes split into multiple paths (branches), or come back together (merges).

The layout is organized to help you follow the flow of ideas from past to present.

### Actions

You can:
- 🖱 **Click a node** to instantly load that version into the synth, which you will immediately see in the synth and hear in audio. 
- 🧩 **Click + drag one node onto another** to **merge** them  
- 🖍 **Hover** to view tooltips showing timestamps, branch names, and module info  
- 🖼 Zoom and pan freely with your mouse to explore the full patch history  

---

### Node Colors

Each node is styled by its change type.  
Here’s what the colors represent:

- <span style="color:#004cb8">●</span> `connect`: cable connected  
- <span style="color:#b85c00">●</span> `disconnect`: cable disconnected  
- <span style="color:#6b00b8">●</span> `paramUpdate`: knob or slider changed  
- <span style="color:#00ffff">●</span> `gesture`: a modulation gesture was recorded  
- <span style="color:#000000">●</span> `clear`: patch cleared  
- <span style="color:#ccc">●</span> `blank_patch`: a new patch was started from scratch  

---

### Forking: A Non-Destructive Undo

Most software gives you **undo/redo**, but it’s linear — if you go back, make a change, and continue, everything that came after is lost.

**Forking** solves that.

In *Forking Paths*, every time you go back to a previous node and make a new change in the synth, you **create a fork** — a new branch of patch history. Nothing is erased. All directions are preserved and visible.

This means:
- You can explore "what if?" moments without fear
- You don’t lose past ideas when trying something new
- You can compare, combine, or merge paths at any time

**To create a fork:**
1. Click on any earlier node in the graph
2. Make a change to the patch (e.g. move a knob, add a module)
3. A new node appears — this is your **forked path**

Now you’ve started a new timeline of changes, without erasing the others.

---

### Merges

Merging lets you combine two changes into a new hybrid change. 
To create one:
1. **Click + drag** one node onto another  
2. A new merged node will appear with both parents  
3. The synth will reflect the merged patch state

Use merges to experiment, remix, or reconcile different directions in your creative process.


