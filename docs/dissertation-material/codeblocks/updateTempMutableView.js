// we use this to update a knob position from a gesture point recall from the history sequencer
function updateTempMutableView(jsonObject, parent, param, updatedValue) {

    let targetId = `${parent}_${param}`
    // Find the element in the "elements" array with a matching data.id
    const element = jsonObject.elements.find(el => el.data && el.data.id === targetId);
    
    // update the visual graph 
    if (element) {
      // Update the value property
      element.data.value = updatedValue;
      
    } else {
      console.warn(`Element with id "${targetId}" not found.`);
    
    }

    // update the synth graph
    if (
        jsonObject.synth.graph.modules &&
        jsonObject.synth.graph.modules[parent] &&
        jsonObject.synth.graph.modules[parent].params &&
        Object.prototype.hasOwnProperty.call(jsonObject.synth.graph.modules[parent].params, param)
      ) {
        jsonObject.synth.graph.modules[parent].params[param] = updatedValue;
      } else {
        console.warn(`Module "${parent}" or parameter "${param}" not found.`);

      }


    // return it
    return jsonObject
}
