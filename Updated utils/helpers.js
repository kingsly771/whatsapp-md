const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const helpers = {
  validateSessionId: (sessionId) => {
    return typeof sessionId === 'string' && sessionId.length > 0 && /^[a-zA-Z0-9_-]+$/.test(sessionId);
  },
  
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return '';
    return input.replace(/[^a-zA-Z0-9_\-\s]/g, '');
  },
  
  ensureDirectories: () => {
    const directories = [
      config.whatsapp.sessionPath,
      config.media.storagePath,
      path.join(config.media.storagePath, 'images'),
      path.join(config.media.storagePath, 'videos'),
      path.join(config.media.storagePath, 'documents')
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  },
  
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getTimestamp: () => {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  },
  
  // Command parsing utilities
  extractCommand: (messageBody, prefix = config.bot.prefix) => {
    if (!messageBody.startsWith(prefix)) return null;
    return messageBody.slice(prefix.length).trim().split(' ')[0].toLowerCase();
  },
  
  extractArgs: (messageBody, prefix = config.bot.prefix) => {
    if (!messageBody.startsWith(prefix)) return [];
    return messageBody.slice(prefix.length).trim().split(' ').slice(1);
  },
  
  isCommand: (messageBody, prefix = config.bot.prefix) => {
    return messageBody.startsWith(prefix);
  },
  
  isAdminCommand: (messageBody) => {
    return messageBody.startsWith(config.bot.adminPrefix);
  },
  
  // Otaku-specific helpers
  sanitizeAnimeTitle: (title) => {
    return title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  },
  
  extractSeasonFromDate: (date) => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Fall';
    return 'Winter';
  }
};

module.exports = helpers;
