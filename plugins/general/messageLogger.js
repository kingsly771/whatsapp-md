module.exports = {
  name: 'Message Logger',
  description: 'Logs all incoming messages',
  version: '1.0.0',
  code: `async function messageLogger(message, client, sessionId, require, console, prefix) {
  const timestamp = new Date().toLocaleString();
  console.log('[' + timestamp + '] Message from ' + message.from + ': ' + message.body);
  
  // Only log non-command messages
  if (!message.body.startsWith(prefix) && !message.body.startsWith('!!')) {
    const fs = require('fs');
    const path = require('path');
    
    const logEntry = new Date().toISOString() + ' - ' + message.from + ' - ' + message.body + '\\n';
    const logPath = path.join(process.cwd(), 'logs', 'messages.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    try {
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }
}`
};
