### History Graph

This graph shows every change you've made to the patch — like a branching version control system for synthesis.

---

### Interface Overview

Each **circle** in the graph represents a change  (e.g. parameter tweak, cable movement, or gesture) that you made to the synth.
Each **arrow** indicates the progression from one change to the next 

- The **bottom-most node** is your starting point — usually a loaded synth file or a blank patch.

- Some changes split into multiple paths (branches), or come back together (merges).

The layout is organized to help you follow the flow of ideas from past to present.

### Actions

You can:
- **Click a node** to instantly load that version into the synth, which you will immediately see in the synth and hear in audio. 
- **Combine Changes:** Click + drag one node onto another** to **merge them (this combines both versions into a new 3rd version!) 
- **View infor** by hovering over a changeNode with the mouse
- **Zoom** by holding down *z* and scrolling with the mouse
- **Display the Full Graph** by clicking the 'Show Full Graph' button 
- **Pan** Up and Down using the scrollwheel
- **Pan** Right and Left by holding *shift* and scrolling with the mouse

---

### Node Colors

Each node is styled by its change type.  
Here’s what the colors represent:

- <span style="color: #004cb8">●</span> `connect`: cable connected  
- <span style="color: #b8000f">●</span> `disconnect`: cable disconnected  
- <span style="color: #6b00b8">●</span> `paramUpdate`: knob or slider changed  
- <span style="color: #00ffff">●</span> `gesture`: a modulation gesture was recorded  
- <span style="color: #b89000">●</span> `merge`: a merge between two other changeNodes was recorded  
- <span style="color: #00806b">●</span> `sequence`: a sequence was saved  
- <span style="color: #b85c00">●</span> `draw`: the draw canvas changed  
- <span style="color: #ccc">●</span> `blank_patch`: a new patch was started from scratch  

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


