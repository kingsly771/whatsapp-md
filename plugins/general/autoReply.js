module.exports = {
  name: 'Auto Reply',
  description: 'Automatically responds to messages',
  version: '1.0.0',
  code: `async function autoReply(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'ping') {
    await client.sendMessage(message.from, 'pong');
  }
  
  if (message.body === prefix + 'hello') {
    await client.sendMessage(message.from, 'Hello! How can I help you?');
  }
  
  if (message.body === prefix + 'time') {
    await client.sendMessage(message.from, 'Current time: ' + new Date().toLocaleString());
  }
}`
};
