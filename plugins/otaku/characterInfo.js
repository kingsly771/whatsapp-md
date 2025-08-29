module.exports = {
  name: 'Character Info',
  description: 'Provides information about anime characters',
  version: '1.0.0',
  code: `async function characterInfo(message, client, sessionId) {
  if (message.body.startsWith('!character')) {
    const characterName = message.body.split(' ').slice(1).join(' ');
    
    if (characterName) {
      // This would call an actual character API in a real implementation
      await client.sendMessage(message.from, 
        \`🔍 Character: \${characterName}\\n\\n` +
        \`Anime: Unknown\\n` +
        \`Role: Main Character\\n` +
        \`Voice Actor: Unknown\\n\\n` +
        \`*This is a demo response. In a real implementation, I would fetch real character data from an API.*\`
      );
    }
  }
}`
};
