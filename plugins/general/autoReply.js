module.exports = {
  name: 'Auto Reply',
  description: 'Automatically responds to basic commands',
  version: '1.0.0',
  code: `async function autoReply(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'ping') {
    await client.sendMessage(message.from, '🏓 pong');
  }
  
  if (message.body === prefix + 'hello' || message.body === prefix + 'hi') {
    await client.sendMessage(message.from, '👋 Hello! How can I help you today?');
  }
  
  if (message.body === prefix + 'time') {
    await client.sendMessage(message.from, '🕒 Current time: ' + new Date().toLocaleString());
  }
  
  if (message.body === prefix + 'date') {
    await client.sendMessage(message.from, '📅 Today is: ' + new Date().toLocaleDateString());
  }
  
  if (message.body === prefix + 'creator') {
    await client.sendMessage(message.from, '👨‍💻 Created by: WhatsApp Bot Developer\\n🚀 Powered by: whatsapp-web.js');
  }
  
  if (message.body === prefix + 'version') {
    await client.sendMessage(message.from, '📦 Bot Version: 2.0.0\\n🔧 Node.js: ' + process.version);
  }
}`
};
