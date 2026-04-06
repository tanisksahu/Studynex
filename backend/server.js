const express = require('express');
const app = express();
const PORT = 5000;

// Test routes
app.get('/', (req, res) => {
    res.send('Welcome to Studynex!');
});

app.get('/test', (req, res) => {
    res.send('This is a test route for Studynex.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});