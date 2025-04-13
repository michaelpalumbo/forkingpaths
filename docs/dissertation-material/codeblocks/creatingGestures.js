    // Listen for mouse down event on the document
    document.addEventListener('mousedown', function(event) {
        hid.mouse.left = true

    });
    
    // Listen for mouse up event on the document
    document.addEventListener('mouseup', function(event) {
        hid.mouse.left = false
      
        // if the user has been playing with a param knob, we need to store it as a param change (or list of param changes) in automerge
        if(Object.keys(groupChange).length > 0){
            // if we are storing a single param change, do a paramUpdate
            if(groupChange.values.length === 1){
                // change is singular
                // Update in Automerge
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.synth.graph.modules[groupChange.parentNode].params[groupChange.paramLabel] = groupChange.values[0];
                    audioGraphDirty = true;
                    // set the change type
                    amDoc.changeType = {
                        msg: 'paramUpdate',
                        param: groupChange.paramLabel,
                        parent: groupChange.parentNode,
                        value: groupChange.values
                    }
                }, onChange, `paramUpdate ${groupChange.paramLabel} = ${groupChange.values[0]}$PARENT ${groupChange.parentNode}`);
            } else if(groupChange.values.length > 1){
                // are storing a gesture
                // Update in Automerge
                amDoc = applyChange(amDoc, (amDoc) => {
                    amDoc.synth.graph.modules[groupChange.parentNode].params[groupChange.paramLabel] = groupChange.values;
                    audioGraphDirty = true;
                    // set the change type
                    amDoc.changeType = {
                        msg: 'gesture',
                        param: groupChange.paramLabel,
                        parent: groupChange.parentNode,
                        values: groupChange.values,
                        timestamps: groupChange.timestamps
                    }
                }, onChange, `gesture ${groupChange.paramLabel}$PARENT ${groupChange.parentNode}`);

            }

            // clear the groupChange
            groupChange = { }
        }


    });