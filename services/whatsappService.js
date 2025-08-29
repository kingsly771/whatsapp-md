const { Client, LocalAuth } = require('whatsapp-web.js');
const Session = require('../models/Session');
const { sessions } = require('../config/database');
const config = require('../config/config');
const pluginService = require('./pluginService');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupSessions(), 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  initializeClient(sessionId, io) {
    // Check if session already exists and is valid
    const existingSession = sessions.get(sessionId);
    if (existingSession && existingSession.status === 'READY') {
      return existingSession;
    }

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: sessionId,
        dataPath: config.whatsapp.sessionPath
      }),
      puppeteer: config.whatsapp.puppeteer
    });

    const session = new Session(sessionId);
    sessions.set(sessionId, session);

    client.on('qr', (qr) => {
      console.log(`QR received for session ${sessionId}`);
      session.updateStatus('QR_READY');
      session.setQrCode(qr);
      
      // Emit QR code to frontend via socket.io
      if (io) {
        io.emit('qrCode', { sessionId, qr });
      }
    });

    client.on('authenticated', () => {
      console.log(`Authenticated session ${sessionId}`);
      session.updateStatus('AUTHENTICATED');
      
      if (io) {
        io.emit('statusUpdate', { sessionId, status: 'AUTHENTICATED' });
      }
    });

    client.on('ready', () => {
      console.log(`Client ready for session ${sessionId}`);
      session.updateStatus('READY');
      session.setClient(client);
      
      // Update metadata with connection info
      session.updateMetadata({
        userAgent: client.info.pushname,
        platform: client.info.platform,
        connectedNumber: client.info.wid.user
      });
      
      if (io) {
        io.emit('statusUpdate', { sessionId, status: 'READY', metadata: session.metadata });
      }
    });

    client.on('message', async (message) => {
      console.log(`Message received in session ${sessionId}: ${message.body}`);
      session.updateStatus('ACTIVE');
      
      // Execute all enabled plugins
      try {
        await pluginService.executePlugins(message, client, sessionId);
      } catch (error) {
        console.error(`Error executing plugins for session ${sessionId}:`, error);
      }
    });

    client.on('disconnected', (reason) => {
      console.log(`Client disconnected for session ${sessionId}:`, reason);
      sessions.delete(sessionId);
      this.clients.delete(sessionId);
      
      if (io) {
        io.emit('statusUpdate', { sessionId, status: 'DISCONNECTED', reason });
      }
    });

    client.initialize();
    this.clients.set(sessionId, client);
    
    return session;
  }

  getClient(sessionId) {
    return this.clients.get(sessionId);
  }

  getSession(sessionId) {
    return sessions.get(sessionId);
  }

  getAllSessions() {
    return Array.from(sessions.entries()).map(([id, session]) => ({
      id: session.sessionId,
      status: session.status,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      metadata: session.metadata
    }));
  }

  disconnectClient(sessionId) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.destroy();
      this.clients.delete(sessionId);
      sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  cleanupSessions() {
    let cleanedCount = 0;
    for (const [sessionId, session] of sessions.entries()) {
      if (session.isExpired()) {
        this.disconnectClient(sessionId);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Graceful shutdown
  shutdown() {
    clearInterval(this.cleanupInterval);
    for (const sessionId of this.clients.keys()) {
      this.disconnectClient(sessionId);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  module.exports.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  module.exports.shutdown();
  process.exit(0);
});

module.exports = new WhatsAppService();
