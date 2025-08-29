require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sessionRoutes = require('./routes/sessionRoutes');
const pluginRoutes = require('./routes/pluginRoutes');
const { ensureDirectories } = require('./utils/helpers');
const config = require('./config/config');

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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    bot: {
      prefix: config.bot.prefix,
      adminPrefix: config.bot.adminPrefix
    }
  });
});

// Bot info endpoint
app.get('/api/bot/info', (req, res) => {
  res.json({
    prefix: config.bot.prefix,
    adminPrefix: config.bot.adminPrefix,
    maxCommandLength: config.bot.maxCommandLength,
    cooldown: config.bot.cooldown
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send bot configuration to connected clients
  socket.emit('bot-config', {
    prefix: config.bot.prefix,
    adminPrefix: config.bot.adminPrefix
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io and config accessible to our router
app.set('io', io);
app.set('config', config);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`╔══════════════════════════════════════════╗`);
  console.log(`║           WhatsApp Bot Server           ║`);
  console.log(`╠══════════════════════════════════════════╣`);
  console.log(`║ Status:    Running                       ║`);
  console.log(`║ Port:      ${PORT}${' '.repeat(33 - PORT.toString().length)}║`);
  console.log(`║ Prefix:    '${config.bot.prefix}'${' '.repeat(33 - config.bot.prefix.length)}║`);
  console.log(`║ Admin:     '${config.bot.adminPrefix}'${' '.repeat(33 - config.bot.adminPrefix.length)}║`);
  console.log(`║ Env:       ${config.environment}${' '.repeat(33 - config.environment.length)}║`);
  console.log(`╚══════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

module.exports = { app, io, config };
