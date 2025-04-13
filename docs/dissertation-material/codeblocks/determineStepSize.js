function determineStepSize(min, max, method = 'linear', divisions = 100) {
    if (min >= max) {
        console.error('Invalid range: min must be less than max');
        return null;
    }

    const range = max - min;

    if (method === 'logarithmic') {
        const factor = Math.log10(range + 1); // Avoid log10(0)
        return (Math.pow(10, factor / divisions) - 1); // Base step size for log scaling
    } else if (method === 'linear') {
        return range / divisions;
    } else {
        console.error('Invalid method: Choose "logarithmic" or "linear"');
        return null;
    }
}