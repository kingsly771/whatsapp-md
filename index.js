// Emergency minimal server - works without Express
console.log('🚀 Starting WhatsApp Bot Server...');

// Set basic environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;
process.env.BOT_PREFIX = process.env.BOT_PREFIX || '!';

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create basic HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Content-Type', 'application/json');

  // Health endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      service: 'WhatsApp Bot (Minimal Mode)',
      timestamp: new Date().toISOString(),
      message: 'Express.js not installed - running in minimal mode'
    }));
    return;
  }

  // Status endpoint
  if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'operational',
      mode: 'minimal',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Endpoint not found',
    availableEndpoints: ['/health', '/api/status']
  }));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║       WhatsApp Bot (Minimal Mode)       ║
╠══════════════════════════════════════════╣
║ 🚀 Server: http://localhost:${PORT}${' '.repeat(51 - PORT.toString().length)}║
║ 🌐 Mode:    Minimal (Express not found)${' '.repeat(25)}║
║ 💡 Run:     npm install express${' '.repeat(35)}║
╚══════════════════════════════════════════╝
  `);
  console.log('📋 Available endpoints:');
  console.log(`   • http://localhost:${PORT}/health`);
  console.log(`   • http://localhost:${PORT}/api/status`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
