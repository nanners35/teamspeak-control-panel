// Main server file for AmpDiscordBot
const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Import server registry
const { serverTypes } = require('./server-registry');

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'AmpDiscordBot API ready',
    servers: Object.keys(serverTypes),
    version: '1.0.0'
  });
});

app.get('/api/teamspeak/status', async (req, res) => {
  try {
    // This is where you'll connect to your TeamSpeak server
    res.json({ 
      connected: true,
      server: 'TeamSpeak',
      status: 'online',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`AmpDiscordBot server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /api/status');
  console.log('- GET /api/teamspeak/status');
  console.log('');
  console.log('Server registry loaded:', Object.keys(serverTypes));
});

console.log('AmpDiscordBot initialized successfully!');