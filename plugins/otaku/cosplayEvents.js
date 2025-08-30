module.exports = {
  name: 'Cosplay Events',
  description: 'Shares information about upcoming cosplay events',
  version: '1.0.0',
  code: `const cron = require('node-cron');

// Schedule weekly event updates (runs every Monday at 9 AM)
cron.schedule('0 9 * * 1', async () => {
  console.log('Sending weekly cosplay event updates...');
  // This would send weekly event updates to subscribed groups
});

async function cosplayEvents(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'cosplayevents')) {
    const location = message.body.split(' ')[1] || 'online';
    
    let response = '🎭 *Upcoming Cosplay Events* 🎭\\n\\n';
    response += '*Location:* ' + location.toUpperCase() + '\\n\\n';
    
    response += '📅 *June 2024*\\n';
    response += '• Anime Convention - June 15-16, 2024\\n';
    response += '• Cosplay Contest - June 22, 2024\\n\\n';
    
    response += '📅 *July 2024*\\n';
    response += '• Summer Cosplay Festival - July 6-7, 2024\\n';
    response += '• Virtual CosMeet - July 20, 2024\\n\\n';
    
    response += '📅 *August 2024*\\n';
    response += '• International Cosplay Day - August 1, 2024\\n';
    response += '• Cosplay Championship - August 17-18, 2024\\n\\n';
    
    response += '💡 Use ' + prefix + 'eventinfo <eventname> for more details.';
    
    await client.sendMessage(message.from, response);
  }
  
  if (message.body.startsWith(prefix + 'eventinfo')) {
    const eventName = message.body.split(' ').slice(1).join(' ');
    
    let response = '📅 *Event Information* 📅\\n\\n';
    response += '*Event:* ' + (eventName || 'Anime Convention') + '\\n';
    response += '*Location:* Virtual/Online\\n';
    response += '*Date:* June 15-16, 2024\\n';
    response += '*Time:* 10:00 AM - 8:00 PM\\n';
    response += '*Tickets:* Available at event website\\n';
    response += '*Guests:* Professional cosplayers TBA\\n\\n';
    
    response += '🌟 *Activities:*\\n';
    response += '• Cosplay competition\\n';
    response += '• Photo shoots\\n';
    response += '• Workshops\\n';
    response += '• Vendor booths\\n';
    response += '• Guest panels';
    
    await client.sendMessage(message.from, response);
  }
}`
};
