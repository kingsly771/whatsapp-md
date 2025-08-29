module.exports = {
  name: 'Waifu Rating',
  description: 'Rates anime waifus with humorous descriptions',
  version: '1.0.0',
  code: `const waifuRatings = {
  "Rem": { rating: 10, comment: "Perfect waifu material! Would protect at all costs." },
  "Asuna": { rating: 9, comment: "Skilled fighter and loyal partner. Top tier!" },
  "Zero Two": { rating: 8, comment: "Mysterious and alluring. Handle with care!" },
  "Miku Nakano": { rating: 9, comment: "The quintessential quintuplet. Adorable!" },
  "Kurisu Makise": { rating: 9, comment: "Brilliant scientist tsundere. Elite class!" }
};

async function waifuRating(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'ratewaifu')) {
    const waifuName = message.body.split(' ').slice(1).join(' ');
    
    if (waifuRatings[waifuName]) {
      const rating = waifuRatings[waifuName];
      await client.sendMessage(message.from, 
        \`💖 Waifu Rating: \${waifuName}\\n\\n` +
        \`⭐ Rating: \${rating.rating}/10\\n` +
        \`💬 Comment: \${rating.comment}\`
      );
    } else {
      // Generate random rating for unknown waifus
      const randomRating = Math.floor(Math.random() * 10) + 1;
      const comments = [
        "Cute but could be better!",
        "Solid choice for a waifu!",
        "Needs more development!",
        "Underrated gem!",
        "Popular choice among fans!"
      ];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      
      await client.sendMessage(message.from, 
        \`💖 Waifu Rating: \${waifuName}\\n\\n` +
        \`⭐ Rating: \${randomRating}/10\\n` +
        \`💬 Comment: \${randomComment}\`
      );
    }
  }
  
  if (message.body === prefix + 'topwaifus') {
    let response = '👑 Top Waifus:\\n\\n';
    const sortedWaifus = Object.entries(waifuRatings)
      .sort((a, b) => b[1].rating - a[1].rating)
      .slice(0, 5);
    
    for (const [name, data] of sortedWaifus) {
      response += \`• \${name}: \${data.rating}/10 - \${data.comment}\\n\`;
    }
    
    await client.sendMessage(message.from, response);
  }
}`
};
