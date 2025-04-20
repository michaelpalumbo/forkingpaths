let tableData = [
    {
        "stepChange": "paramUpdate frequency = 1165.61 Oscillator_Basilisk",
        "stepLength": "4n",
        "status": "Active",
        "node": {
            "id": "a8ed4f339c299df7c82bf2f9ee1df07a345adc1420d38f26bdba40165dc16fe4",
            "label": "paramUpdate frequency = 1165.61 Oscillator_Basilisk",
            "branch": "main"
        }
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    },
    {
        "stepChange": "gesture frequency Oscillator_Basilisk",
        "stepLength": "4n",
        "status": "Active",
        "node": {
            "id": "8854cd908d89f09d2ca2fd76ad0caaeadf935d8080107663a13b0d7ed371473f",
            "label": "gesture frequency Oscillator_Basilisk",
            "branch": "main"
        }
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    },
    {
        "stepChange": "(Empty)",
        "stepLength": "4n",
        "status": "Inactive"
    }
]

let tableString = ``

tableData.forEach((step, index) => {
    if(step.stepChange != '(Empty)'){
        
        tableString += `<strong>Step ${index}:</strong> ${step.stepChange}<br>\n<strong>Length:</strong> ${step.stepLength}<br>\n`
    }
})

console.log(tableString)