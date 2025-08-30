module.exports = {
  name: 'Waifu Rating',
  description: 'Rates anime waifus with humorous descriptions',
  version: '1.0.0',
  code: `async function waifuRating(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'ratewaifu')) {
    const waifuName = message.body.split(' ').slice(1).join(' ');
    
    const waifuRatings = {
      "rem": { rating: 10, comment: "Perfect waifu material! Would protect at all costs. Best girl forever! 💙" },
      "asuna": { rating: 9, comment: "Skilled fighter and loyal partner. Top tier waifu material! ⚔️" },
      "zero two": { rating: 8, comment: "Mysterious and alluring. Handle with care! Dangerous but worth it. 🌸" },
      "miku nakano": { rating: 9, comment: "The quintessential quintuplet. Adorable and talented! 🎧" },
      "kurisu makise": { rating: 9, comment: "Brilliant scientist tsundere. Elite class waifu! 🔬" },
      "mai sakurajima": { rating: 9, comment: "Beautiful senpai with bunny girl outfit. Absolutely stunning! 🐰" },
      "marin kitagawa": { rating: 8, comment: "Energetic cosplayer. Always brings positive vibes! ✨" }
    };
    
    if (waifuName && waifuRatings[waifuName.toLowerCase()]) {
      const rating = waifuRatings[waifuName.toLowerCase()];
      await client.sendMessage(message.from, 
        '💖 *Waifu Rating* 💖\\n\\n' +
        '*Name:* ' + waifuName + '\\n' +
        '*Rating:* ' + rating.rating + '/10\\n' +
        '*Comment:* ' + rating.comment
      );
    } else {
      // Generate random rating for unknown waifus
      const randomRating = Math.floor(Math.random() * 10) + 1;
      const comments = [
        "Cute but could be better! Maybe next season? 🌸",
        "Solid choice for a waifu! Good taste! 👍",
        "Needs more character development! Maybe in the manga? 📖",
        "Underrated gem! You have unique taste! 💎",
        "Popular choice among fans! Good pick! 🎯",
        "Controversial choice! But we respect it! 🤔",
        "Classic waifu material! Never goes out of style! 👑"
      ];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      
      await client.sendMessage(message.from, 
        '💖 *Waifu Rating* 💖\\n\\n' +
        '*Name:* ' + (waifuName || 'Unknown Waifu') + '\\n' +
        '*Rating:* ' + randomRating + '/10\\n' +
        '*Comment:* ' + randomComment
      );
    }
  }
  
  if (message.body === prefix + 'topwaifus') {
    let response = '👑 *Top Waifus* 👑\\n\\n';
    const topWaifus = [
      "1. Rem (Re:Zero) - 10/10 💙",
      "2. Asuna (SAO) - 9/10 ⚔️",
      "3. Mai Sakurajima (Bunny Girl) - 9/10 🐰",
      "4. Miku Nakano (Quintuplets) - 9/10 🎧",
      "5. Kurisu Makise (Steins;Gate) - 9/10 🔬"
    ];
    
    topWaifus.forEach(waifu => {
      response += waifu + '\\n';
    });
    
    response += '\\n💡 Based on community ratings';
    
    await client.sendMessage(message.from, response);
  }
}`
};
