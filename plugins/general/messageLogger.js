module.exports = {
  name: 'Message Logger',
  description: 'Logs all incoming messages',
  version: '1.0.0',
  code: `async function messageLogger(message, client, sessionId, require, console, prefix) {
  console.log(\`[\${new Date().toLocaleString()}] Message from \${message.from}: \${message.body}\`);
  
  // Only log non-command messages
  if (!message.body.startsWith(prefix) && !message.body.startsWith('!!')) {
    const fs = require('fs');
    const path = require('path');
    
    const logEntry = \`\${new Date().toISOString()} - \${message.from} - \${message.body}\\n\`;
    const logPath = path.join(process.cwd(), 'logs', 'messages.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(logPath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(logPath, logEntry, 'utf8');
  }
}`
};
