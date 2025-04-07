# Forking Paths
*A Modular Synthesizer with Patch Histories*  

Forking Paths is a modular synthesizer app that uses software version control concepts to capture every change you make to your patch. These records, which I call *Patch Histories*, let you revisit any previous synth state, make modifications without overwriting, and even sequence the playback of different versions of your patches in a sequencer.  

ELI5: Think of it as getting creative with the undo/redo history of a software synthesizer. 

<!-- Forking Paths is a modular synthesizer app that integrates software version control principles, allowing users to capture the complete history of their patch changes—a concept I refer to as *Patch Histories*. Unlike traditional modular synth setups, where changes are ephemeral and difficult to reproduce, Forking Paths preserves every modification, enabling users to revisit, branch, and explore different versions of their patches over time. Patch Histories aren’t just a way to revisit past states; they can also function as a sequencing tool, where changes themselves can be reordered and played back in structured time. By embedding Patch Histories into the workflow, it enhances the iterative process of patching, allowing historical states to be reinterpreted, merged, or used as compositional elements.-->

## About

Created by Michael Palumbo, 2024. 

<a href="https://www.palumbomichael.com" target="_blank" rel="noopener noreferrer">My website</a>
<br>
<a href="https://instagram.com/michaelpalumbo_" target="_blank" rel="noopener noreferrer">Instagram</a>

This work is part of my PhD dissertation. For earlier writings and demonstrations of this work, see:

<a href="https://alicelab.world/msvr/" target="_blank" rel="noopener noreferrer">Affordances and Constraints of Modular Synthesis in Virtual Reality</a> -  Co-authored with Dr. Graham Wakefield
<br>
<a href="https://scholar.google.ca/citations?view_op=view_citation&hl=en&user=iKEglLIAAAAJ&citation_for_view=iKEglLIAAAAJ:d1gkVwhDpl0C" target="_blank" rel="noopener noreferrer">Modular Reality: Analogues of Patching in Immersive Space</a> - Co-authored with Dr. Graham Wakefield and Alexander Zonta
<br>
<a href="https://www.youtube.com/watch?v=kq_0cVode9g" target="_blank" rel="noopener noreferrer">(Video Demo) Mischmasch: Modular Synthesizer in VR</a>


# Instructions
<br>

## First Up
- **Bug Reports** If you encounter any issues, please create a bug report in the <a href="https://github.com/michaelpalumbo/forkingpaths/issues/new" target="_blank" rel="noopener noreferrer">Forking Paths Github Repository</a>

- If you're participating in *User Testing*, <a href="https://forms.gle/aerpRUgBR7bH1xpB9" target="_blank" rel="noopener noreferrer">click here for the questionnaire, thanks!</a>

<br>

## Getting Started

To start playing the synth:

1. **Join a Room:** Click the Join button in an empty room in the Lobby column (left side of this page). This will open the Synth App in a new tab.
2. **Load the Demo Synth:** In the Synth App, use the menubar at the top: click *File > Load Demo Synth*. This action also opens the Patch History window in a new window (please allow this popup).
3. **Explore the Demo Synth Modules:** The demo includes five synth modules:
- **AudioDestination:** The audio output. Connect here to hear sound through your speakers/headphones.
- **LFO:** A low-frequency oscillator with waveform selection.
- **SLOWFO:** A very slow LFO.
- **Oscillator:** A standard oscillator with waveform selection.
- **Flutter:** A delay effect with a very short delay range.

4. **Making a Cable Connection:**
- Inputs are orange triangles, outputs are blue squares.
- Click and drag from an input or output to create a cable, then release when hovering over a valid connection point.
- Note: Inputs can only be connected to outputs, and vice versa.

5. **Hear the Audio:** Patch a cable between the Oscillator's output and the AudioDestination's input. If you don't hear sound:
- Check the audio engine indicator at the top-right of the Synth App:
    - **Pause Audio:** Audio is running.
    - **Resume Audio (with flashing red/grey):** Audio is stopped.

- Click this button to toggle the audio engine state.

6. You should hear audio, but if not, please check the state of the audio engine by viewing the element at the top-right of the window:
- "Pause Audio": If in this state, audio is running.
- "Resume Audio" and flashing red/grey: If in this state, audio has stopped running. 
- Clicking this button in either state will set the audio engine to the other state. 

7. **Additional Patch Connections:** Try patching the LFO output into the Oscillator’s frequency input.

8. **Now Open The Patch History Window:** If you don’t see it, open it from *View > Open Patch History window*.

<br>

## Patch History

The Patch History Window is the primary focus of Forking Paths, offering an interactive timeline that records every patch change and enables you to recall and sequence past states, explore new creative directions from earlier changes, and edit and play back knob gestures.

The Patch History window provides four views:

- **History Graph:**  Displays your patch changes as a graph on the left side. Clicking a dot (a "Change Node") loads that patch state into the synth.
  <!-- Added a brief explanation of what "Change Node" means -->

- **History Query Tool:**  Lets you search for similar changes. Clicking any change will load that patch state into the synth. 
  
- **History Sequencer:**  A simple sequencer to play back changes in any order.
  
- **Gesture Player:**  A sequencer for playing back gestures (like knob turns).


### History Graph Details

1. **Viewing the History Graph:** You can see each change you made to your synth patch.  
- **Change Node Types:**  
    - *paramUpdate:* Individual parameter changes (e.g., when a knob jumps to a new value).
    - *gesture:* Changes that occur over time while you click+drag a knob.
    - *connect:* When you create a patch cable connection.
    - *disconnect:* When you delete a cable.
   <!-- Fixed typos and added ELI5-style clarifications -->

2. **Recalling Past States:** Click on any Change Node to see the synth update both visually and audibly.

3. **Branching:** Loading a previous state starts a new branch in the History Graph. Try it to see how new changes form a new branch.
   <!-- Clarified the branching concept -->

**Tips:**  
Change Nodes can be merged together. To merge, click+drag one Change Node onto another. A new merged node will appear, combining the changes from both parents.  
*NOTE: Merging is a bit buggy at the moment, and the graph might not correctly represent the merged changes.*
<!-- Clarified the merging process with a note -->

The History Sequencer lets you assign any Change Node from the History Graph as a step in a sequence:

1. **Building a Sequence:**  
   - Click on a Change Node, then cmd-click (or ctrl-click on PC) on an empty step cell.  
   - Click another Change Node to assign it to one or more empty step slots.  
   **NOTE:** Active steps can be overwritten.
   <!-- Rephrased for clarity -->

2. **Gesture Sequencing:**  
   Gestures can be applied to sequence steps. The entire gesture will play back within the step's duration. Try changing the BPM to hear this effect.
   
3. **Playing the Sequence:**  
   Click the **Start Sequencer** button to begin playback, and observe how the synth and audio change.
   <!-- Clarified the steps -->

##### Sequencer Options

1. **BPM Slider:**  
   Sets the sequencer BPM (between 30 and 300 BPM).

2. **Step Length:**  
   Currently, there are two options:
   - **Fixed:** Every step is the same length (default is quarter notes).
   - **User Editable:** *Coming soon*
   - **Closeness Centrality:** *Coming soon*
   - **Euclidean Distance:** The note length is determined by the graph distance between Change Nodes (longer distance = longer note length).
   <!-- Reorganized and clarified the options -->

3. **Sequence Order:**  
   - **Entry:** The default order you set the steps (currently broken).
   - **Topological Sort:** *Coming soon*
   - **Random:** Randomizes the sequence order.

**Tip:**  
Shift+Click+Drag over multiple Change Nodes in the History Graph to add them as sequencer steps.  
*Coming soon: Save/Recall History Sequences*
<!-- Clarified the tip and options -->

<br>

#### History Query Tool

This tool returns all Change Nodes of a specific type for easier selection. Click a result to recall that state in the synth, and then assign it to a sequencer step.

- **Graph Based:**  
  - *Leaves:* The latest Change Nodes on a given branch.
  
- **Change Based:**  
  - *Param Changes:* Returns all parameter changes.  
  - *Gesture Changes:* Returns all gestures.  
  - *Cable Changes:* Returns all cable changes.  
  - *Merges:* Returns all merged Change Nodes.
  
- **Selected Module Changes:**  
  If you select a module in the Synth App, this option will return all Change Nodes related to that module.
<!-- Simplified and organized this section -->

<br>


<br>

The Gesture Player is a controller for playing, looping, and editing gestures. It maps parameter changes from one gesture onto any other parameter and can assign gestures (or individual gesture data points) to sequencer steps.

1. **Loading a Gesture:**  
   Select a gesture node from the History Graph. The total time length is displayed along the X-axis, and the minimum/maximum values along the Y-axis.
   
2. **Playing a Gesture:**  
   Click *Play* to listen to the gesture playback.
   
3. **Temporary Mapping:**  
   Use the dropdown menu (default is *default*) to map the gesture’s values to any other synth parameter. Try different parameters and listen for changes.  
   **NOTE:** Multiple gesture parameters can be automatically scaled to match the target parameter’s range.
   
4. **Cloning a Gesture:**  
   Once you find a parameter where the gesture sounds good, click **Clone** to permanently assign the gesture. This creates a new branch in the History Graph.
   
**Tips:**  
- You can play back or assign individual gesture points.  
- Cmd-click a step in the sequencer to assign a specific gesture point.
  
**Editing Gestures:**  
Click+drag vertically any node in the Gesture Player to adjust its value in real time. If the synth is running, you'll hear the change immediately.  
*Coming soon: Save/Recall Gestures*
<!-- Added ELI5 explanations and rephrased steps for clarity -->

<br>

## Multiplayer

You can collaborate with another player by joining the same room via the Lobby. All changes are synced between players’ synths and Patch Histories in real time.  
<!-- Clarified the multiplayer aspect -->

This feature has been tested the least, so please try it out with a friend and let me know if you encounter bugs or have improvement ideas.
<!-- Minor rephrasing -->

---

## Synth Designer

In the Synth App, click *View > Open Synth Designer* to create your own synths.

- **Add Module:**  
  Click any module name from the left panel to add it to your synth.
- **Move Modules:**  
  Click and drag any module to reposition it.
- **Delete Modules:**  
  Click and press delete on any module to remove it.
- **Drag Multiple Modules:**  
  Cmd/Ctrl + click + drag to select multiple modules, then drag one to move them all.
- **Save Synth:**  
  Click *File > Save Synth...* to save your synth to your computer.
- **Load Synth in Synth App:**  
  Click *File > Load Synth From Disk* and select your synth file (with a *.fpsynth* extension).

**NOTE:** Loading a synth file will clear your Patch History.
<!-- Reorganized and clarified the instructions -->