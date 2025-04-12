cy.on('mousedown', (event) => {
  if (clickedInputOrOutput) {
    startCable()
  }
});

cy.on('mousemove', (event) => {
  updateGhostCablePosition()
});

cy.on('mouseup', (event) => {
  if (validTargetFound) {
    commitCableToAutomerge()
  }
});
