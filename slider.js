// slider.js
export function createSlider(cy, parentNodeId, sliderId, options = {}) {
    const defaultOptions = {
        length: 100, // Length of the slider track in pixels
        minValue: 0, // Minimum slider value
        maxValue: 100, // Maximum slider value
        initialValue: 50, // Initial slider value
        position: { x: 200, y: 200 }, // Default position
    };

    const config = { ...defaultOptions, ...options };
    const parentNode = cy.getElementById(parentNodeId);

    // Define the track and handle nodes for the slider
    const sliderTrackId = `${sliderId}-track`;
    const sliderHandleId = `${sliderId}-handle`;

    const fixedY = config.position.y;

    let isDragging = false;
    let isDraggingEnabled = false; // Tracks if 'e' is pressed for repositioning


    // Create the slider elements
    cy.add([
        {
            data: { id: sliderTrackId, parent: parentNodeId },
            position: config.position,
            grabbable: false // Prevent track from being dragged
        },
        {
            data: { id: sliderHandleId, parent: parentNodeId },
            position: {
                x: config.position.x - config.length / 2 + (config.length * (config.initialValue - config.minValue)) / (config.maxValue - config.minValue),
                y: fixedY,
            }
        },
    ]);

    // Style the slider elements to remove the focus outline and disable selection
    cy.style()
        .selector(`#${sliderTrackId}`)
        .style({
            'background-color': '#ddd',
            'shape': 'rectangle',
            'width': config.length,
            'height': 10,
            'border-color': '#999',
            'border-width': 1,
            'label': '', // Remove label for track
            'text-opacity': 0, // Ensure no text is shown
            'outline-width': 0, // Remove focus outline
            'user-select': 'none', // Prevent text selection
            'pointer-events': 'none' // Disable pointer events on the track
        })
        .update();

    cy.style()
        .selector(`#${sliderHandleId}`)
        .style({
            'background-color': '#6FB1FC',
            'shape': 'ellipse',
            'width': 20,
            'height': 20,
            'label': '', // Remove label for handle
            'text-opacity': 0, // Ensure no text is shown
            'outline-width': 0, // Remove focus outline
            'user-select': 'none', // Prevent text selection
            'pointer-events': 'auto' // Enable pointer events for handle
        })
        .update();

    const trackStartX = config.position.x - config.length / 2;
    const trackEndX = config.position.x + config.length / 2;


    // Function to get the slider value based on handle's position
    function getSliderValue() {
        const handlePositionX = cy.getElementById(sliderHandleId).position('x');
        const value = config.minValue + ((handlePositionX - trackStartX) / (trackEndX - trackStartX)) * (config.maxValue - config.minValue);
        console.log(`Slider ${sliderId} Value: ${Math.round(value)}`);
        return Math.round(value);
    }

    // Move handle to a specific x-coordinate and update the slider value
    function setHandlePosition(x) {
        // Constrain x to the track boundaries
        const clampedX = Math.max(trackStartX, Math.min(x, trackEndX));

        // Update the handle position
        cy.getElementById(sliderHandleId).position({ x: clampedX, y: fixedY });

        // Report the new slider value
        getSliderValue();
    }

    // Handle dragging behavior of the slider handle along the track
    cy.on('grab', `#${sliderHandleId}`, function () {
        isDragging = true;
    });

    cy.on('drag', `#${sliderHandleId}`, function (evt) {
        if (isDragging) {
            const handleNode = evt.target;
            const newPosX = handleNode.position('x');

            // Constrain the handle to stay within the track on the x-axis
            if (newPosX < trackStartX) {
                handleNode.position({ x: trackStartX, y: fixedY });
            } else if (newPosX > trackEndX) {
                handleNode.position({ x: trackEndX, y: fixedY });
            } else {
                // Allow movement on x-axis only and lock y-axis to fixedY
                handleNode.position({ x: newPosX, y: fixedY });
            }

            // Update slider value based on the new position
            getSliderValue();
        }
    });

    cy.on('free', `#${sliderHandleId}`, function () {
        isDragging = false;
    });

    // Event listener for clicking on the track to set handle position
    cy.on('tap', `#${sliderTrackId}`, function (evt) {
        const clickX = evt.position.x; // X-coordinate of the click
        setHandlePosition(clickX); // Move the handle to this position and update value
    });

    // Event listener for mousedown on the track to start moving the handle
    cy.on('mousedown', `#${sliderTrackId}`, function (evt) {
        const clickX = evt.position.x; // X-coordinate of the click
        setHandlePosition(clickX); // Move the handle to this position
        isDragging = true; // Start dragging
    });

    // Event listener for mousemove on the Cytoscape container to continue dragging the handle
    cy.on('mousemove', function (evt) {
        if (isDragging) {
            const moveX = evt.position.x;
            setHandlePosition(moveX); // Move handle to follow the mouse position
        }
    });

    // Event listener for mouseup to stop dragging
    cy.on('mouseup', function () {
        isDragging = false; // Stop dragging
    });


    // Listen for 'e' key events to toggle repositioning of track and handle
    window.addEventListener('keydown', (event) => {
        if (event.key === 'e') {
            isDraggingEnabled = true;
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'e') {
            isDraggingEnabled = false;
        }
    });

    // Drag control for repositioning track and handle within parent node
    cy.on('grab', `#${sliderTrackId}`, (evt) => {
        if (!isDraggingEnabled) {
            evt.target.ungrabify(); // Prevent dragging if 'e' is not held down
        }
    });

    cy.on('free', `#${sliderTrackId}`, (evt) => {
        evt.target.grabify(); // Restore grabbable state for normal slider use
    });
    return {
        getValue: getSliderValue,
        setPosition: (x, y) => {
            cy.getElementById(sliderTrackId).position({ x, y });
            cy.getElementById(sliderHandleId).position({ x, y });
        },
    };
}
