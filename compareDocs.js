// Listen for messages from the main thread
self.addEventListener("message", (event) => {
    const { cytoscapeElements, automergeElements } = event.data;

    // Helper function to create a map of elements by ID
    function createElementMap(elements) {
        return elements.reduce((map, element) => {
            map[element.data.id] = element;
            return map;
        }, {});
    }

    const cytoscapeMap = createElementMap(cytoscapeElements);
    const automergeMap = createElementMap(automergeElements);

    const array1 = automergeElements.filter(
        (element) => !cytoscapeMap[element.data.id]
    );

    const array2 = cytoscapeElements.filter(
        (element) => !automergeMap[element.data.id]
    );

    const array3 = automergeElements.filter((element) => {
        const matchingElement = cytoscapeMap[element.data.id];
        if (matchingElement) {
            return Object.keys(element.data).some(
                (key) =>
                    key !== "id" &&
                    element.data[key] !== matchingElement.data[key]
            );
        }
        return false;
    });
    // console.log(array1, array2, array3)  
    // Send results back to the main thread
    self.postMessage({ array1, array2, array3 });
});
