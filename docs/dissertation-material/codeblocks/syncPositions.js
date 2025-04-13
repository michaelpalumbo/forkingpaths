function syncPositions(forkedDoc) {
    // Map positions from forkedDoc by element ID
    const positionsById = forkedDoc.elements.reduce((acc, el) => {
        if (el.position) {
            acc[el.data.id] = el.position; // Map the position by the element ID
        }
        return acc;
    }, {});

    // Update the `position` in `elements` with the correct values
    const syncedElements = forkedDoc.elements.map(el => {
        if (positionsById[el.data.id]) {
            return {
                ...el,
                position: positionsById[el.data.id], // Overwrite with the correct position
            };
        }
        return el; // Return unchanged if no position is mapped
    });

    return syncedElements;
}