const connections = [
    { source: "Oscillator_Ant_2e40b7c13698.OUT", target: "AudioDestination_Drongo_7366cd713de1.IN" },
    { source: "LFO_Bird_12345.OUT", target: "Gain_Sparrow_67890.IN" }
];

const objectToRemove = {
    source: "Oscillator_Ant_2e40b7c13698.OUT",
    target: "AudioDestination_Drongo_7366cd713de1.IN"
};

// Find the index of the object
const index = connections.findIndex(
    (item) => 
        item.source === objectToRemove.source && 
        item.target === objectToRemove.target
);

// Remove the object if it exists
if (index !== -1) {
    connections.splice(index, 1);
}

console.log(connections);