module.exports = {
  name: 'Watch Party',
  description: 'Organizes anime watch parties with countdowns',
  version: '1.0.0',
  code: `const watchParties = new Map();

async function watchParty(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'createwatchparty')) {
    const params = message.body.split(' ').slice(1);
    if (params.length >= 2) {
      const animeName = params.slice(0, -1).join(' ');
      const time = params[params.length - 1];
      
      watchParties.set(animeName, {
        time: time,
        participants: new Set(),
        creator: message.from
      });
      
      await client.sendMessage(message.from, 
        '🎉 *Watch Party Created!* 🎉\\n\\n' +
        '*Anime:* ' + animeName + '\\n' +
        '*Time:* ' + time + '\\n\\n' +
        'Use ' + prefix + 'joinwatchparty ' + animeName + ' to join!'
      );
    } else {
      await client.sendMessage(message.from, 
        'Usage: ' + prefix + 'createwatchparty <anime> <time>\\n' +
        'Example: ' + prefix + 'createwatchparty "One Piece" 20:00'
      );
    }
  }
  
  if (message.body.startsWith(prefix + 'joinwatchparty')) {
    const animeName = message.body.split(' ').slice(1).join(' ');
    const party = watchParties.get(animeName);
    
    if (party) {
      party.participants.add(message.from);
      await client.sendMessage(message.from, 
        '✅ *You\\'ve joined the watch party!*\\n\\n' +
        '*Anime:* ' + animeName + '\\n' +
        '*Time:* ' + party.time + '\\n' +
        '*Participants:* ' + party.participants.size
      );
    } else {
      await client.sendMessage(message.from, '❌ Watch party not found for: ' + animeName);
    }
  }
  
  if (message.body.startsWith(prefix + 'watchparties')) {
    if (watchParties.size === 0) {
      await client.sendMessage(message.from, 'No watch parties scheduled yet.');
      return;
    }
    
    let response = '📺 *Scheduled Watch Parties* 📺\\n\\n';
    for (const [anime, details] of watchParties.entries()) {
      response += '• *' + anime + '* at ' + details.time + ' (' + details.participants.size + ' participants)\\n';
    }
    
    await client.sendMessage(message.from, response);
  }
}`
};
