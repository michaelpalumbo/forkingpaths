
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

    // const array1 = automergeElements.filter(
    //     (element) => !cytoscapeMap[element.data.id]
    // );

    // const array2 = cytoscapeElements.filter(
    //     (element) => !automergeMap[element.data.id]
    // );

    // const array3 = automergeElements.filter((element) => {
    //     const matchingElement = cytoscapeMap[element.data.id];
       
    //     if (matchingElement) {
    //         if (element.data.sliderComponent == 'handle' && matchingElement.data.sliderComponent == 'handle') {
    //             // Compare `value` for sliders
                
    //             if(element.data.value !== matchingElement.data.value){
    //                 console.log(element.data.id, element.data.value, '\n', matchingElement.data.id, matchingElement.data.value)
    //                 let paramUpdate = {
    //                     elementID: element.data.id,
    //                     value: element.data.value 
    //                 }
    //                 console.log(paramUpdate)
    //                 return paramUpdate
    //             }
                
    //         } else if (element.classes === ":parent" && matchingElement.classes === ":parent") {
    //             // Compare `position` for parent elements
    //             const { x: x1, y: y1 } = element.position;
    //             const { x: x2, y: y2 } = matchingElement.position;
    //             return x1 !== x2 || y1 !== y2;
    //         }
    //     }
    //     return false;
    // });

    // Deep clone automergeElements to avoid shared references
    const automergeElementsCopy = JSON.parse(JSON.stringify(automergeElements));

    const array3 = automergeElementsCopy
    .filter((element) => {
        const matchingElement = cytoscapeMap[element.data.id];
        // Check if the element is a handle and its value differs
        return (
            matchingElement &&
            element.data.sliderComponent === "handle" &&
            matchingElement.data.sliderComponent === "handle" &&
            element.data.value !== matchingElement.data.value
        );
    })
    .map((element) => {        
        // Return the simplified paramUpdate object
        return {
            id: element.data.id,
            element: element,
            kind: "slider",
            value: element.data.value,
            position: element.position
        };
    });
    

    // console.log(array1, array2, array3)  
    // Send results back to the main thread
    self.postMessage({ array3 });
});
