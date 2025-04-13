// might need to grab the entire bit of code for this

$(paramDiv).knob({
    min: param.data.min,
    max: param.data.max,
    change: (value) => {
        let newValue = Math.round(value * 100) / 100;
        if (newValue !== lastValue) {
            lastValue = newValue;
            paramChange(parentNodeID, param.data.label, newValue);
        }
    }
});
