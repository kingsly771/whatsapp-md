const { v4: uuidv4 } = require('uuid');

class Session {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `session_${uuidv4()}`;
    this.status = 'INITIALIZING';
    this.qrCode = null;
    this.client = null;
    this.createdAt = new Date();
    this.lastActivity = new Date();
    this.metadata = {
      userAgent: null,
      platform: null,
      connectedNumber: null
    };
  }
  
  updateStatus(status) {
    this.status = status;
    this.lastActivity = new Date();
  }
  
  setQrCode(qr) {
    this.qrCode = qr;
    this.lastActivity = new Date();
  }
  
  setClient(client) {
    this.client = client;
    this.lastActivity = new Date();
  }
  
  updateMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    this.lastActivity = new Date();
  }
  
  isExpired() {
    const now = new Date();
    const diffMs = now - this.lastActivity;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 60; // Expire after 60 minutes of inactivity
  }
}

module.exports = Session;
