### Synth App

This is the modular synthesizer interface. Use it to create patches and play sounds. 

**If this is your first time: Click the other HELP button to get started** (located above "Workspace")

---

### Modules

If you've loaded the *Demo Synth* from the *Synth Browser*, it includes:

- **Oscillator:** Produces tones. Try selecting different waveforms  
- **LFO:** A low-frequency oscillator for modulation  
- **SLOWFO:** An even slower LFO  
- **Flutter:** A short delay effect  
- **AudioDestination:** Sends sound to your speakers  

---

### Patching and Sound

- `Inputs`: orange triangles <span style="color:#ff9900">⏴</span>  <span style="color:#ff9900">⏴</span> 
- `Outputs`: blue squares  <span style="color:#004cb8">■</span>  <span style="color:#004cb8">■</span> 
- To connect a cable: **click and drag** from an output to an input or input to an output
- To delete a cable: **click it** & type **delete**
- To reconnect a cable: Drag one of its ends away from the input or output and connect it to another input or output

#### Cable Colours

- Cable colours are randomized at creation by default
- Select a cable colour before drawing: press 1, 2, 3, 4, or 5 on your keyboard, then start a cable
- Change a cable’s colour mid-drag: while holding one end, press 1–5

Colour options:

1. gold <span style="color:#FFD700">●</span> <span style="color:#FFD700">●</span>

2. dark turquoise <span style="color:#00CED1">●</span> <span style="color:#00CED1">●</span>

3. blue violet <span style="color:#8A2BE2">●</span> <span style="color:#8A2BE2">●</span>

4. dark orange <span style="color:#FF8C00">●</span> <span style="color:#FF8C00">●</span>

5. forest green <span style="color:#228B22">●</span> <span style="color:#228B22">●</span>


*Coming Soon: cable colours will be indicated in the history graph*

**IMPORTANT** You must connect an OUT to the `AudioDestination` module to hear anything. Try Patching the **Oscillator OUT** to the **AudioDestination IN**. 

**If you still don't hear sound**, check that the System menu bar isn't blinking red. Go there and click Resume Audio. **(More info about this in the **Workspace Panel Help Button**)

### Patch Notes

You can draw within the synth view. Useful for making patch notes or communicating with another player. Just click and drag anywhere within the canvas that isn't part of the synth. 

---

### Tips

- Try patching the **LFO output** into the **Oscillator’s frequency input**   
- Use the **Patch History window** to view and sequence past states, or explore gestures
