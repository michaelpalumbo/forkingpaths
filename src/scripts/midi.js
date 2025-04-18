import { WebMidi } from "webmidi"; // skip this line if you're using a script tag


let midiInput


let midiValues = {
    controllers: {

    }
}


let historyGraphNodesArray = [1,2,3,4,5,6,7,8,9]
    WebMidi.enable()
    .then(() => {
        midiInput = WebMidi.inputs[0]; // select your MIDI device
  
      if (!midiInput) {
        console.log("No MIDI input devices found.");
        return;
      }
  
      // Log available controls
      console.log("Listening to MIDI device:", midiInput.name);
  
      // Listen to control change (knobs/faders usually send these)
      midiInput.addListener("controlchange", (e) => {
        // console.log(`Control Change on CC#${e.controller.number}: ${e.rawValue}`);
        // console.log(typeof e.controller.number)

        // cycle through graph
        if (e.controller.number == 8) {

                if(!midiValues.controllers[e.controller.number]){
                    midiValues.controllers[e.controller.number] = {value: null}
                }

                const scaled = scaleMidiValue(e.rawValue, 0, 127, 0, historyGraphNodesArray.length - 1);
                if(midiValues.controllers[e.controller.number].value != scaled){

                 
    
    
    
                    console.log(scaled, historyGraphNodesArray.length, e.rawValue)
                    // console.log(historyGraphNodesArray[scaled]); // ~251.97

                    midiValues.controllers[e.controller.number].value = scaled


                }




            

        }
      });
    })
    .catch((err) => console.error("WebMidi could not be enabled:", err));


