### Synth App

This is the modular synthesizer interface. Use it to create patches and play sounds.

---

### Modules

The demo synth includes:

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

**IMPORTANT** You must connect an OUT to the `AudioDestination` module to hear anything. Try Patching the **Oscillator OUT** to the **AudioDestination IN**. 

**If you still don't hear sound**, check that the System menu bar isn't blinking red. Go there and click Resume Audio. (More info about this in the **Workspace Panel Help Button**)

---

### Tips

- Try patching the **LFO output** into the **Oscillator’s frequency input**   
- Use the **Patch History window** to view and sequence past states, or explore gestures
