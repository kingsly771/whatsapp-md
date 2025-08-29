module.exports = {
  name: 'Husbando Rating',
  description: 'Rates anime husbandos with humorous descriptions',
  version: '1.0.0',
  code: `const husbandoRatings = {
  "Levi": { rating: 10, comment: "Clean freak with unmatched skills. Perfect!" },
  "Lelouch": { rating: 9, comment: "Brilliant strategist with a commanding presence." },
  "Killua": { rating: 8, comment: "Loyal friend with deadly assassin skills." },
  "Gojo": { rating: 9, comment: "Overpowered with a cool personality. Top tier!" },
  "Roy Mustang": { rating: 8, comment: "Flame alchemist with ambition and style." }
};

async function husbandoRating(message, client, sessionId) {
  if (message.body.startsWith('!ratehusbando')) {
    const husbandoName = message.body.split(' ').slice(1).join(' ');
    
    if (husbandoRatings[husbandoName]) {
      const rating = husbandoRatings[husbandoName];
      await client.sendMessage(message.from, 
        \`🤵 Husbando Rating: \${husbandoName}\\n\\n` +
        \`⭐ Rating: \${rating.rating}/10\\n` +
        \`💬 Comment: \${rating.comment}\`
      );
    } else {
      // Generate random rating for unknown husbandos
      const randomRating = Math.floor(Math.random() * 10) + 1;
      const comments = [
        "Strong and reliable!",
        "Could use more character development!",
        "Underappreciated character!",
        "Fan favorite with good reason!",
        "Solid choice for a husbando!"
      ];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      
      await client.sendMessage(message.from, 
        \`🤵 Husbando Rating: \${husbandoName}\\n\\n` +
        \`⭐ Rating: \${randomRating}/10\\n` +
        \`💬 Comment: \${randomComment}\`
      );
    }
  }
  
  if (message.body === '!tophusbandos') {
    let response = '👑 Top Husbandos:\\n\\n';
    const sortedHusbandos = Object.entries(husbandoRatings)
      .sort((a, b) => b[1].rating - a[1].rating)
      .slice(0, 5);
    
    for (const [name, data] of sortedHusbandos) {
      response += \`• \${name}: \${data.rating}/10 - \${data.comment}\\n\`;
    }
    
    await client.sendMessage(message.from, response);
  }
}`
};
