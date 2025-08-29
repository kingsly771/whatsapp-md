module.exports = {
  name: 'Virtual YouTubers',
  description: 'Information about popular VTubers and their activities',
  version: '1.0.0',
  code: `const vtubers = {
  "Gawr Gura": {
    agency: "Hololive EN",
    debut: "2020-09-13",
    subscribers: "4M+",
    description: "Shark girl from the Atlantis who's a bit of a dork"
  },
  "Kizuna AI": {
    agency: "Independent",
    debut: "2016-11-29",
    subscribers: "3M+",
    description: "The world's first virtual YouTuber"
  },
  "Kiryu Coco": {
    agency: "Hololive JP (Graduated)",
    debut: "2019-12-28",
    subscribers: "1M+",
    description: "Yakuza dragon who was known for her Asacoco news segment"
  }
};

async function virtualYouTubers(message, client, sessionId) {
  if (message.body.startsWith('!vtuber')) {
    const vtuberName = message.body.split(' ').slice(1).join(' ');
    
    if (vtubers[vtuberName]) {
      const vtuber = vtubers[vtuberName];
      await client.sendMessage(message.from, 
        \`🎤 VTuber: \${vtuberName}\\n\\n` +
        \`Agency: \${vtuber.agency}\\n` +
        \`Debut: \${vtuber.debut}\\n` +
        \`Subscribers: \${vtuber.subscribers}\\n` +
        \`Description: \${vtuber.description}\`
      );
    } else {
      await client.sendMessage(message.from, 
        \`No information found for VTuber: \${vtuberName}\\n` +
        \`Try: Gawr Gura, Kizuna AI, or Kiryu Coco\`
      );
    }
  }
  
  if (message.body === '!vtubers') {
    let response = '🎤 Popular VTubers:\\n\\n';
    for (const [name, info] of Object.entries(vtubers)) {
      response += \`• \${name} (\${info.agency})\\n\`;
    }
    
    await client.sendMessage(message.from, response);
  }
}`
};
