require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sessionRoutes = require('./routes/sessionRoutes');
const pluginRoutes = require('./routes/pluginRoutes');
const { ensureDirectories } = require('./utils/helpers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Ensure required directories exist
ensureDirectories();

app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/plugins', pluginRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to our router
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
