// Load environment variables with fallback
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded successfully');
} catch (error) {
  console.log('⚠️  dotenv not available, using default environment variables');
  // Set essential environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  process.env.PORT = process.env.PORT || '3000';
  process.env.BOT_PREFIX = process.env.BOT_PREFIX || '!';
  process.env.BOT_ADMIN_PREFIX = process.env.BOT_ADMIN_PREFIX || '!!';
  process.env.STORAGE_PATH = process.env.STORAGE_PATH || './storage';
}

// Import dependencies with error handling
let express, http, socketIo, fs, path;

try {
  express = require('express');
  http = require('http');
  socketIo = require('socket.io');
  fs = require('fs');
  path = require('path');
} catch (error) {
  console.error('❌ Missing critical dependencies:', error.message);
  console.log('📦 Please run: npm install express socket.io');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Socket.io with error handling
let io;
try {
  io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
} catch (error) {
  console.error('❌ Socket.io initialization failed:', error.message);
  // Continue without Socket.io support
  console.log('⚠️  Continuing without real-time features');
}

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files if public directory exists
if (fs.existsSync('./public')) {
  app.use(express.static('public'));
}

// Ensure storage directories exist
try {
  const storagePath = process.env.STORAGE_PATH || './storage';
  const directories = [
    path.join(storagePath, 'sessions'),
    path.join(storagePath, 'media'),
    path.join(storagePath, 'backups'),
    'logs'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created directory:', dir);
    }
  });
} catch (error) {
  console.error('❌ Failed to create storage directories:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WhatsApp Bot',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    dependencies: {
      express: !!express,
      socketIo: !!socketIo,
      dotenv: !!require('dotenv')
    }
  });
});

// Basic routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/api/status']
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════╗
║           WhatsApp Bot Server           ║
╠══════════════════════════════════════════╣
║ 🚀 Server:    http://${HOST}:${PORT}${' '.repeat(33 - (HOST + ':' + PORT).length)}║
║ 🌐 Environment: ${process.env.NODE_ENV}${' '.repeat(28 - process.env.NODE_ENV.length)}║
║ 🤖 Prefix:     ${process.env.BOT_PREFIX || '!'}${' '.repeat(33 - (process.env.BOT_PREFIX || '!').length)}║
╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

module.exports = { app, server };
