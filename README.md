# Forking Paths

## About

Created by Michael Palumbo, 2024. 

[My website](www.palumbomichael.com) // [Instagram](https://instagram.com/michaelpalumbo_)

This work is part of my PhD dissertation. Previous related work includes:

[Affordances and Constraints of Modular Synthesis in Virtual Reality](https://alicelab.world/msvr/) Co-authored with Dr. Graham Wakefield

[Modular Reality: Analogues of Patching in Immersive Space](https://scholar.google.ca/citations?view_op=view_citation&hl=en&user=iKEglLIAAAAJ&citation_for_view=iKEglLIAAAAJ:d1gkVwhDpl0C) Co-authored with Dr. Graham Wakefield and Alexander Zonta

[(Video) Mischmasch: Modular Synthesizer in VR](https://www.youtube.com/watch?v=kq_0cVode9g)


# Instructions

## Getting Started
To begin playing the synth, click the **Join** button in an empty room of the Lobby column to the left of this page. This will open the Synth App in a new tab. 

1. Along the top of the window is the menubar. Click *File > Load Demo Synth*. 
2. In adddition to loading the demo synth, the History Sequencer will also open in a new tab. Keep this open, andand try to have it visible alongside the synth at all times. 
3. Back on the Synth App. In the demo synth, there are 5 synth modules:
    - AudioDestination: The audio output. Connect to here to hear audio play through your speakers/headphones.
    - LFO: Low frequency oscillator with waveform selection
    - SLOWFO: A very slow LFO.
    - Oscillator: Standard oscillator with waveform selection
    - Flutter: A delay effect with a very short delay time range. 

4. **Making a cable connection**
Inputs are orange triangles, outputs are blue squares. Click and drag from either of these elements to spawn a cable. Release the click when hovering over an input or output. Note that inputs can only be connected to outputs and vice versa. 

5. To hear some audio, patch a cable between the output of the oscillator and the input of the AudioDestination.
6. You should hear audio, but if not, please check the state of the audio engine by viewing the element at the top-right of the window:
    - "Pause Audio": If in this state, audio is running.
    - "Resume Audio" and flashing red/grey: If in this state, audio has stopped running. 
    - Clicking this button in either state will set the audio engine to the other state. 
7. Try patching the *LFO output* into the Oscillator *frequency input*
8. Now look at the History Sequencer browser tab. If it isn't open, go to *View > Open History Sequencer*

## History Sequencer

There are 4 views in this page:
    - **History Graph** The history of your patch changes, reperesented as a graph in the left side of the page. 
    - **History Query Tool** A query tool for returning similar changes 
    - **History Sequencer** A simple sequencer for playing back changes in any order
    - **Gesture Player** Another sequencer which plays back selected regions of the history

#### Use

1. Lets begin by looking at the **History Graph**. We can see each of the changes you made to the synth path in the other window. If you click on any of the dots representing the changes (we'll refer to them as "Change Nodes"), this will load that state back into the synth. Try that now. 
2. **Branching** Whenever you have loaded a previous state, the History Graph will begin recording all new changes on a new branch in the graph. Try that now to see it. 
3. Let's now try the **History Sequencer**. To build a sequence, click on any change node, and then click on any of the cells marked as *(Empty)*. Now click another change node, and apply it to one or more empty step slots. 
4. Click the **Start Sequencer** button to begin playing the sequence, and then observe the changes in the synth and audio playback. 





## Synth Designer

**Add Module:**  
Click any module name from the left panel to add it to the synth. 

**Move Modules**
Click + drag any module to reposition it

**Delete Modules**
Click + delete any module to remove it

**Drag multiple modules:**  
Cmd/Ctrl + click + drag to select multiple elements, then drag any module to move them all at once.

**Save Synth**
Click File > Save Synth... to save it to anywhere in your computer. 


# Local Use:

## install
clone this repo from github.com/michaelpalumbo/forkingpaths as well as github.com/historyGraphRender. ensure they are both cloned to the same parent directory. 

