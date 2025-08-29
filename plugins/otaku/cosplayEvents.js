module.exports = {
  name: 'Cosplay Events',
  description: 'Shares information about upcoming cosplay events',
  version: '1.0.0',
  code: `const cron = require('node-cron');

// Schedule weekly event updates (runs every Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  // This would send weekly event updates to subscribed groups
  console.log('Sending weekly cosplay event updates...');
});

async function cosplayEvents(message, client, sessionId) {
  if (message.body.startsWith('!cosplayevents')) {
    const location = message.body.split(' ')[1] || 'online';
    
    await client.sendMessage(message.from, 
      \`🎭 Upcoming Cosplay Events (\${location.toUpperCase()}):\\n\\n` +
      \`• Anime Convention - June 15-16, 2024\\n` +
      \`• Cosplay Contest - July 20, 2024\\n` +
      \`• Virtual CosMeet - August 5, 2024\\n\\n` +
      \`Use !eventinfo <eventname> for more details.\`
    );
  }
  
  if (message.body.startsWith('!eventinfo')) {
    const eventName = message.body.split(' ').slice(1).join(' ');
    await client.sendMessage(message.from, 
      \`📅 Event: \${eventName}\\n` +
      \`📍 Location: Virtual/Online\\n` +
      \`🎫 Tickets: Available at event website\\n` +
      \`👥 Guests: Professional cosplayers TBA\`
    );
  }
}`
};
