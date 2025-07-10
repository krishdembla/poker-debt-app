const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use process.env.PORT provided by Railway

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// For any other requests, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}`);
});
