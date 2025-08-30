require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Middleware to handle CORS for browsers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Serve static files from public directory
app.use(express.static('public'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health endpoint - works in browsers
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WhatsApp Bot',
    timestamp: new Date().toISOString(),
    message: 'Server is running correctly!',
    endpoints: {
      health: '/health',
      status: '/api/status',
      sessions: '/api/sessions',
      plugins: '/api/plugins'
    }
  });
});

// API Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    },
    timestamp: new Date().toISOString()
  });
});

// Import routes (make sure these files exist)
try {
  const sessionRoutes = require('./routes/sessionRoutes');
  const pluginRoutes = require('./routes/pluginRoutes');
  
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/plugins', pluginRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.log('⚠️  Routes not available, using basic endpoints only');
}

// Serve frontend if index.html exists
app.get('/', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.json({
      message: 'WhatsApp Bot Server is running!',
      endpoints: {
        health: '/health',
        status: '/api/status',
        sessions: '/api/sessions',
        plugins: '/api/plugins'
      },
      documentation: 'Add frontend files to /public directory'
    });
  }
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET  /health',
      'GET  /api/status',
      'GET  /api/sessions',
      'GET  /api/plugins',
      'POST /api/sessions'
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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
║ 🌐 Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(33 - (process.env.NODE_ENV || 'development').length)}║
║ 📍 Endpoints:                            ║
║   • http://${HOST}:${PORT}/health${' '.repeat(47 - (HOST + ':' + PORT).length)}║
║   • http://${HOST}:${PORT}/api/status${' '.repeat(45 - (HOST + ':' + PORT).length)}║
║   • http://${HOST}:${PORT}/api/sessions${' '.repeat(44 - (HOST + ':' + PORT).length)}║
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
