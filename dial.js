// dial.js
export function createDial(cy, parentNodeId, dialId, options = {}) {
    const defaultOptions = {
        minValue: 0, // Minimum dial value
        maxValue: 100, // Maximum dial value
        initialValue: 50, // Initial dial value
        position: { x: 200, y: 200 }, // Default position
        radius: 20 // Radius of the dial
    };

    const config = { ...defaultOptions, ...options };
    const parentNode = cy.getElementById(parentNodeId);

    // Define the dial and indicator nodes
    const dialBaseId = `${dialId}-base`;
    const dialIndicatorId = `${dialId}-indicator`;

    // Calculate the initial angle based on the initial value
    const initialAngle = ((config.initialValue - config.minValue) / (config.maxValue - config.minValue)) * 270 - 135;

    // Create the dial elements
    cy.add([
        {
            data: { id: dialBaseId, parent: parentNodeId },
            position: config.position,
        },
        {
            data: { id: dialIndicatorId, parent: parentNodeId },
            position: {
                x: config.position.x + config.radius * Math.cos((initialAngle * Math.PI) / 180),
                y: config.position.y + config.radius * Math.sin((initialAngle * Math.PI) / 180)
            }
        }
    ]);

    // Style the dial elements
    cy.style()
        .selector(`#${dialBaseId}`)
        .style({
            'background-color': '#ddd',
            'shape': 'ellipse',
            'width': config.radius * 2,
            'height': config.radius * 2,
            'border-color': '#999',
            'border-width': 1,
            'label': '', // Remove label
            'text-opacity': 0
        })
        .update();

    cy.style()
        .selector(`#${dialIndicatorId}`)
        .style({
            'background-color': '#6FB1FC',
            'shape': 'ellipse',
            'width': 10,
            'height': 10,
            'label': '', // Remove label
            'text-opacity': 0
        })
        .update();

    let isDragging = false;

    // Function to get the dial value based on the indicator's angle
    function getDialValue(angle) {
        const normalizedAngle = angle + 135; // Normalize angle to be in [0, 270]
        const value = config.minValue + (normalizedAngle / 270) * (config.maxValue - config.minValue);
        console.log(`Dial ${dialId} Value: ${Math.round(value)}`);
        return Math.round(value);
    }

    // Helper to update the indicator's position based on angle
    function updateIndicatorPosition(angle) {
        const indicatorX = config.position.x + config.radius * Math.cos((angle * Math.PI) / 180);
        const indicatorY = config.position.y + config.radius * Math.sin((angle * Math.PI) / 180);
        const indicatorNode = cy.getElementById(dialIndicatorId);
        if (indicatorNode) {
            indicatorNode.position({ x: indicatorX, y: indicatorY });
        }
    }

    // Event listener for dragging the indicator
    cy.on('grab', `#${dialIndicatorId}`, function () {
        isDragging = true;
    });

    cy.on('drag', `#${dialIndicatorId}`, function (evt) {
        if (isDragging && evt.position) {
            const centerX = config.position.x;
            const centerY = config.position.y;
            const mouseX = evt.position.x;
            const mouseY = evt.position.y;

            // Calculate the angle based on the mouse position relative to the dial center
            let angle = (Math.atan2(mouseY - centerY, mouseX - centerX) * 180) / Math.PI;
            
            // Restrict angle to -135° to 135° range
            if (angle < -135) angle = -135;
            if (angle > 135) angle = 135;

            // Update the indicator position along the circumference based on clamped angle
            updateIndicatorPosition(angle);
            getDialValue(angle); // Convert angle to value calculation directly
        }
    });

    cy.on('free', `#${dialIndicatorId}`, function () {
        isDragging = false;
    });

    return {
        getValue: () => getDialValue(initialAngle), // Initial dial value based on config
        setPosition: (x, y) => {
            cy.getElementById(dialBaseId).position({ x, y });
            updateIndicatorPosition(initialAngle); // Position indicator based on initial angle
        },
    };
}
