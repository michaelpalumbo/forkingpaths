const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API route to serve RNBO devices
app.get('/device/:filename', (req, res) => {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, '../rnbo-devices', filename));
});

// Handle all other routes to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
