require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const sessionRoutes = require('./routes/sessionRoutes');
const pluginRoutes = require('./routes/pluginRoutes');

// Import services
const baileyService = require('./services/baileyService');
const { ensureDirectories } = require('./utils/helpers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files
app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// Ensure required directories exist
ensureDirectories();

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/plugins', pluginRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WhatsApp Bot with Bailey',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version
  });
});

// Bailey info endpoint
app.get('/api/bailey/info', (req, res) => {
  res.json({
    baileyVersion: require('@whiskeysockets/baileys/package.json').version,
    features: {
      multimedia: true,
      groups: true,
      broadcasts: true,
      status: true,
      reactions: true,
      buttons: true,
      lists: true
    },
    limits: {
      maxFileSize: '16MB',
      maxContacts: 'unlimited',
      maxGroups: 'unlimited'
    }
  });
});

// Server status endpoint
app.get('/api/status', (req, res) => {
  const sessions = require('./config/database').sessions;
  const activeSessions = Array.from(sessions.values()).filter(s => 
    s.status === 'READY' || s.status === 'AUTHENTICATED'
  ).length;

  res.json({
    status: 'operational',
    sessions: {
      total: sessions.size,
      active: activeSessions,
      disconnected: sessions.size - activeSessions
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    timestamp: new Date().toISOString()
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Send initial bot configuration
  socket.emit('bot-config', {
    prefix: process.env.BOT_PREFIX || '!',
    adminPrefix: process.env.BOT_ADMIN_PREFIX || '!!',
    maxCommandLength: process.env.BOT_MAX_COMMAND_LENGTH || 200,
    version: require('./package.json').version
  });

  // Handle session updates
  socket.on('request-sessions', () => {
    const sessions = require('./config/database').sessions;
    socket.emit('sessions-update', Array.from(sessions.values()));
  });

  // Handle QR code requests
  socket.on('request-qr', (sessionId) => {
    const sessions = require('./config/database').sessions;
    const session = sessions.get(sessionId);
    if (session && session.qrCode) {
      socket.emit('qr-code', { sessionId, qr: session.qrCode });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('🔌 Client disconnected:', socket.id, reason);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET    /health',
      'GET    /api/status',
      'GET    /api/bailey/info',
      'POST   /api/sessions',
      'GET    /api/sessions',
      'GET    /api/sessions/:sessionId',
      'DELETE /api/sessions/:sessionId',
      'GET    /api/plugins',
      'POST   /api/plugins/:pluginId/enable',
      'POST   /api/plugins/:pluginId/disable'
    ]
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close all Bailey connections
    const sessions = require('./config/database').sessions;
    for (const [sessionId, session] of sessions.entries()) {
      try {
        await baileyService.disconnectClient(sessionId);
        console.log(`Disconnected session: ${sessionId}`);
      } catch (error) {
        console.error(`Error disconnecting session ${sessionId}:`, error);
      }
    }

    // Close HTTP server
    server.close(() => {
      console.log('✅ HTTP server closed');
      
      // Close database connections if any
      console.log('✅ Cleanup complete');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.log('⚠️  Forcing shutdown after timeout');
      process.exit(1);
    }, 30000);

  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                WhatsApp Bot Server (Bailey)             ║
╠══════════════════════════════════════════════════════════╣
║ 🚀 Server:    http://${HOST}:${PORT}${' '.repeat(25 - (HOST + ':' + PORT).length)}║
║ 📦 Version:   ${require('./package.json').version}${' '.repeat(33 - require('./package.json').version.length)}║
║ 🌐 Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(28 - (process.env.NODE_ENV || 'development').length)}║
║ 🤖 Prefix:     ${process.env.BOT_PREFIX || '!'}${' '.repeat(33 - (process.env.BOT_PREFIX || '!').length)}║
║ ⚡ Bailey:     v${require('@whiskeysockets/baileys/package.json').version}${' '.repeat(33 - require('@whiskeysockets/baileys/package.json').version.length)}║
║ 💾 Storage:    ./storage/${' '.repeat(32)}║
╚══════════════════════════════════════════════════════════╝
  `);

  // Initialize any required services
  console.log('📋 Initializing services...');
  
  // Check storage permissions
  try {
    ensureDirectories();
    console.log('✅ Storage directories ready');
  } catch (error) {
    console.error('❌ Storage setup failed:', error);
  }

  console.log('✅ Server is ready to accept connections');
});

// Export for testing
module.exports = { app, server, io };
