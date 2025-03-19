# Forking Paths

## About

Created by Michael Palumbo, 2024. 

[My website](www.palumbomichael.com) // [Instagram](https://instagram.com/michaelpalumbo_)

This work is part of my PhD dissertation. Previous related work includes:

[Affordances and Constraints of Modular Synthesis in Virtual Reality](https://alicelab.world/msvr/) Co-authored with Dr. Graham Wakefield

[Modular Reality: Analogues of Patching in Immersive Space](https://scholar.google.ca/citations?view_op=view_citation&hl=en&user=iKEglLIAAAAJ&citation_for_view=iKEglLIAAAAJ:d1gkVwhDpl0C) Co-authored with Dr. Graham Wakefield and Alexander Zonta

[(Video) Mischmasch: Modular Synthesizer in VR](https://www.youtube.com/watch?v=kq_0cVode9g)


# Instructions
<br>

## First Up
- **Bug Reports** If you encounter any bugs or difficulties, please consider creating an issue in the Forking Paths Github Repository by [clicking here](https://github.com/michaelpalumbo/forkingpaths/issues/new). Thank you!
- If participating in *User Testing*, [click here for the questionnaire](https://forms.gle/aerpRUgBR7bH1xpB9). 

<br>

## Getting Started
To begin playing the synth, click the **Join** button in an empty room of the Lobby column to the left of this page. This will open the Synth App in a new tab. 

1. Along the top of the window is the menubar. Click *File > Load Demo Synth*. 
2. In adddition to loading the demo synth, the Patch History window will also open in a new tab. Keep this open, andand try to have it visible alongside the synth at all times. 
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
8. Now look at the Patch History window browser tab. If it isn't open, go to *View > Open Patch History window*

<br>

## Patch History

There are 4 views in this page:
    - **History Graph** The history of your patch changes, reperesented as a graph in the left side of the page. 
    - **History Query Tool** A query tool for returning similar changes 
    - **History Sequencer** A simple sequencer for playing back changes in any order
    - **Gesture Player** Another sequencer which plays back selected regions of the history

1. Lets begin by looking at the **History Graph**. We can see each of the changes you made to the synth path in the other window. If you click on any of the dots representing the changes (we'll refer to them as "Change Nodes"), this will load that state back into the synth. Try that now. 
2. **Branching** Whenever you have loaded a previous state, the History Graph will begin recording all new changes on a new branch in the graph. Try that now to see it. 
3. Let's now try the **History Sequencer**. To build a sequence, click on any change node, and then click on any of the cells marked as *(Empty)*. Now click another change node, and apply it to one or more empty step slots. **NOTE:** Active steps can be overwritten. 
4. Click the **Start Sequencer** button to begin playing the sequence, and then observe the changes in the synth and audio playback. 

<br>

#### Sequencer Options
1. **BMP Slider**: Use to define the sequencer BPM, between 30-300 BPM. 
2. **Step Length**: At present there are 2 options for setting the step lengths:
    - Fixed: Every step is the same length, defaulted to quarter notes
    - User Editable: *Coming soon*
    - Closeness Centrality: *Coming Soon*
    - Euclidean Distance: Since the history is represented as graph, we can compare the distance between the Change Nodes of 2 steps and apply that as a note length. So if the Change Nodes of step 1 and step 2 are very far apart, their note lengths will be longer than if they were closer toghether. 
3. **Sequence Order**:
    - Entry: The default setting. Clicking this will return to the order that you have set the steps. (Currently broken)
    - Topological Sort: *Coming soon*
    - Random: Randomizes the sequence order. 

**Tip:** Shift+Click+Drag over any amount of Change Nodes in the History Graph to apply all of them as sequencer steps. 

*Coming soon: Save/Recall History Sequences* 

<br>

## History Query Tool
This will return all Change Nodes of the same type for easier selection to the Results list. Change Nodes in the Results list can be clicked to recall them in the synth, and also applied as steps in the sequencer by then clicking any step. 
    
- Graph Based
    - Leaves: Leaf Change Nodes are the latest changes on a given branch in the graph

- Change Based
    - Param Changes: Return all parameter changes
    - Cable Changes: Return all cable changes
    - Merges: Return all history graph merges

- Selected Module Changes: If a module is selected in the Synth App (click it), then selecting this menu item will return all Change Nodes related to this module.

<br>

## History Graph: Merging Change Nodes
Change Nodes can be merged together (meaning that changes in either node will be automatically combined in a logical way). To do this, click+drag any Change Node onto any other Change Node. A 3rd new node will appear, notice the combination of changes from both parent nodes. *NOTE: This is kinda buggy, where the graph is currently incorrectly representing these changes within the history*

<br>

## Gesture Player
This is a pretty neat little controller. It allows for playback and looping of a specific region of history, as well as mapping parameter changes onto any other parameter. 
1. Begin by cmd/ctrl+Click+Drag over any number of Change Nodes. Release the mouse and the nodes will appear in the Gesture Player. The total length of time from the first node to the last is displayed in the bottom-right corner. 
2. Click *Play* to play back this sequence. 
3. There is a dropdown menu that currently reads *default*. Open this menu and notice that all parameters in the synth are listed. This menu allows you to temporarily map the values of the gesture onto any other parameter in the synth. Try selecting a few parameters and playback the gesture. **NOTE**: Multiple parameters can be represented in the gesture, each with different value ranges, and the system automatically maps each gesture param's range (min and max) within the target parameter's range. 
4. Once you have found a parameter that the gesture works well on, you can click the **Clone** button to permanently assign this gesture to that parameter. If you check the History Graph, this means that the newly assigned gesture is represented as a new branch. 

- *Coming soon: apply a gesture as a step in the sequencer*
- *Coming soon: Save/Recall Gestures*

<br>

## Multiplayer

You can play Forking Paths with another player, they just have to join the same room that you are in through the Lobby on this page. All changes either of you make will be immediately applied to the other's synth and Patch History. 

<br> 

This is the aspect I have tested the least, so please do try and and let me know if you encountered any bugs or have indeas for improvement. 

<br> 

## Synth Designer
You can create your own synths! In the Synth App, click *View > Open Synth Designer*
- **Add Module**: Click any module name from the left panel to add it to the synth. 
- **Move Modules**: Click + drag any module to reposition it
- **Delete Modules**: Click + delete any module to remove it
- **Drag multiple modules**: Cmd/Ctrl + click + drag to select multiple elements, then drag any module to move them all at once.
- **Save Synth**: Click File > Save Synth... to save it to anywhere in your computer. 
- **Load Synth In Synth App**: In the Synth App, click *File > Load Synth From Disk*, and choose your synth file (it will have the file extension *.fpsynth*)

**NOTE**: Loading a synth file will clear your Patch History


