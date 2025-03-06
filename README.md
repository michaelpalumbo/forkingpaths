# Forking Paths

## About

Created by Michael Palumbo, 2024. 

[My website](www.palumbomichael.com) // [Instagram](https://instagram.com/michaelpalumbo_)

This work is part of my PhD dissertation. Previous related work includes:

[Affordances and Constraints of Modular Synthesis in Virtual Reality](https://alicelab.world/msvr/) Co-authored with Dr. Graham Wakefield

[Modular Reality: Analogues of Patching in Immersive Space](https://scholar.google.ca/citations?view_op=view_citation&hl=en&user=iKEglLIAAAAJ&citation_for_view=iKEglLIAAAAJ:d1gkVwhDpl0C) Co-authored with Dr. Graham Wakefield and Alexander Zonta

[(Video) Mischmasch: Modular Synthesizer in VR](https://www.youtube.com/watch?v=kq_0cVode9g)

## Main window: Synthesizer 

**First time**
Start by loading a synth file. 

**Make cable connections**
Inputs are orange triangles, outputs are blue squares. Click and drag from either of these elements to spawn a cable. Release the click when hovering over an input or output. Note that inputs can only be connected out outputs and vice versa. 

## History Graph

**Scroll:**  
`cmd`/`Ctrl` + `scroll`.

**Zoom:**  
Press `z` + `scroll`

**Recall Synth State**
Click any node to recall that point in the history. If you make any changes to the synth while in this earlier state, the history will spawn a new history path.

## History Sequencing

**Add node as a step**
Hold `shift` then `click` one or more nodes. You can add the same node multiple times and at different points in the sequence. 

**Pause sequencer (momentary)**
Hold `shift`. release to resume sequence. 

**Remove node step**
Hold `shift` and then `right-click` a node. Note that this only removes the last-added instance of this node. Keep right-clicking to remove all instances of this node in the sequence. 


## Synth Designer

**Add Module:**  
Click any module name from the left panel to add it to the synth. 

**Move Modules**
Click + drag any module to reposition it

**Drag multiple modules:**  
Cmd/Ctrl + click + drag to select multiple elements, then drag any module to move them all at once.

**Save Synth**
Click File > Save Synth... to save it to anywhere in your computer. 


# Local Use:

## install

clone this repo from github.com/michaelpalumbo/forkingpaths as well as github.com/historyGraphRender. ensure they are both cloned to the same parent directory. 

