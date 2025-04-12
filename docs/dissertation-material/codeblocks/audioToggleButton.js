audioToggleButton.addEventListener('click', function () {
    if (audioContext.state === 'running') {
        audioContext.suspend();
    } else {
        audioContext.resume();
    }
});
