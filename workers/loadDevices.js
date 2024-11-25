// Static imports in the worker
import oscillator from '../public/export/oscillator.export.json';
import oscillator2 from '../public/export/oscillator2.export.json';

// Map for dynamic access
const modules = {
    oscillator,
    oscillator2,
};

console.log(oscillator)
// Handle incoming messages
self.addEventListener('message', async (event) => {
    const moduleName  = event.data;

    // Check if the requested file exists
    if (modules[moduleName]) {
        try {
            // Dynamically load the requested file
            const module = modules[moduleName]
            self.postMessage({ status: 'success', data: module });
        } catch (error) {
            self.postMessage({ status: 'error', message: `Failed to load ${moduleName}: ${error.message}` });
        }
    } else {
        self.postMessage({ status: 'error', message: `Module ${moduleName} not found` });
    }
});
