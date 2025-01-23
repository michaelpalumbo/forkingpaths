function scaleKnob(value, inputMin, inputMax, outputMin, outputMax){
    return ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;
}

console.log(

    scaleKnob(5.3, 0, 10, 0, 101)

)