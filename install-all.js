const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing ALL WhatsApp Bot dependencies...');

const dependencies = [
  'express',
  'dotenv', 
  'qrcode',
  'socket.io',
  '@whiskeysockets/baileys',
  'axios',
  'node-cron',
  'pm2'
];

console.log('🔧 Installing dependencies:');
console.log(dependencies.join(', '));

try {
  // Install all dependencies at once
  execSync('npm install ' + dependencies.join(' '), { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout
  });
  
  console.log('✅ All dependencies installed successfully!');
  console.log('🚀 Starting server...');
  
  // Start the server
  try {
    execSync('node index.js', { stdio: 'inherit' });
  } catch (startError) {
    console.log('💡 Server stopped. You can restart with: node index.js');
  }
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.log('💡 Trying individual installation...');
  
  // Try installing individually
  for (const dep of dependencies) {
    try {
      console.log(`📦 Installing ${dep}...`);
      execSync(`npm install ${dep} --no-optional`, { 
        stdio: 'inherit',
        timeout: 60000 
      });
    } catch (depError) {
      console.error(`⚠️  Failed to install ${dep}:`, depError.message);
    }
  }
  
  console.log('🎉 Installation attempts completed. Trying to start server...');
  try {
    execSync('node index.js', { stdio: 'inherit' });
  } catch (startError) {
    console.log('💡 You can start the server with: node index.js');
  }
}
