module.exports = {
  name: 'Cosplay Contest',
  description: 'Organizes and manages cosplay contests',
  version: '1.0.0',
  code: `const cosplayContests = new Map();
const contestEntries = new Map();

async function cosplayContest(message, client, sessionId) {
  if (message.body.startsWith('!createcontest')) {
    const contestName = message.body.split(' ').slice(1).join(' ');
    
    if (contestName) {
      cosplayContests.set(contestName, {
        creator: message.from,
        participants: new Set(),
        status: 'open',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
      await client.sendMessage(message.from, 
        \`🎭 Cosplay Contest Created!\\n\\n` +
        \`Name: \${contestName}\\n` +
        \`Ends: \${cosplayContests.get(contestName).endDate.toDateString()}\\n\\n` +
        \`Use !entercontest \${contestName} to participate!\`
      );
    }
  }
  
  if (message.body.startsWith('!entercontest')) {
    const contestName = message.body.split(' ').slice(1).join(' ');
    const contest = cosplayContests.get(contestName);
    
    if (contest && contest.status === 'open') {
      contest.participants.add(message.from);
      await client.sendMessage(message.from, 
        \`✅ You've entered the \${contestName} cosplay contest!\\n` +
        \`Submit your photos before \${contest.endDate.toDateString()}\`
      );
    }
  }
  
  if (message.body.startsWith('!contestinfo')) {
    const contestName = message.body.split(' ').slice(1).join(' ');
    const contest = cosplayContests.get(contestName);
    
    if (contest) {
      await client.sendMessage(message.from, 
        \`🎭 Contest: \${contestName}\\n` +
        \`Status: \${contest.status}\\n` +
        \`Participants: \${contest.participants.size}\\n` +
        \`Ends: \${contest.endDate.toDateString()}\`
      );
    }
  }
}`
};
