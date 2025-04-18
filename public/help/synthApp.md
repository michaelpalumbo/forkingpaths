### Synth App

This is the modular synthesizer interface. Use it to create patches and play sounds.

---

### Getting Started

To begin using the synth:

1. Go to **File > Load Demo Synth**  
   This loads a prebuilt patch and opens the **Patch History** window in a new tab or window.

2. **Don’t close the History window** — you’ll use it for sequencing, editing gestures, and navigating your patch history. If you do close it, you can reopen it via **View > Open Patch History**.

3. For best results, plan to view both windows -- Synth App & Path History-- while playing. So either:
- **resize this window and the Patch History window** so you can view them side-by-side. 
- Use ``Cmd + ` `` (on Mac) or `Alt + Tab` (on PC) to switch between them quickly  

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

**IMPORTANT** You must connect an OUT to the `AudioDestination` module to hear anything. Try Patching the **Oscillator OUT** to the **AudioDestination IN**. If you hear nothing, move to the next section below (Audio Engine)

---

### Audio Engine

- In the top-right corner, you’ll see a button that shows either:  
  - `Pause Audio`: Audio is running  
  - `Resume Audio` (blinking red): Audio is off  
- Click this to toggle the audio engine  
- If you don’t hear anything, try clicking this button first — browsers often block audio until you interact with the page

---

### Toolbar Functions

#### File Menu
- **Load Demo Synth**: Start with a ready-to-use synth and open the Patch History window  
- **Load Synth from Disk**: Load a saved `.fpsynth` file  
- **Save Synth**: Save your current layout

#### View Menu
- **Open Patch History**: Launch the patch history interface if it’s not already open
- **Open Synth Designer**: Launch a separate interface for building your own synth layouts from scratch


#### System Menu
- **Settings**: Adjust system preferences:
  - Volume
  - Cable control point spacing
  - Toggle **RMS Metering** (useful for checking if audio is working, but CPU intensive)

#### Testing Menu
- **Give Feedback**  
  Please *please* take a moment to fill out the [User Testing Feedback Form](https://forms.gle/aerpRUgBR7bH1xpB9). Any feedback is super helpful at this stage!  
- **Bug Report**  
  Found something broken? [Report it on GitHub](https://github.com/michaelpalumbo/forkingpaths/issues/new) (you’ll need a GitHub account)

---

### Tips

- Try patching the **LFO output** into the **Oscillator’s frequency input**   
- Use the **Patch History window** to view and sequence past states, or explore gestures
