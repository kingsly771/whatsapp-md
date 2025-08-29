module.exports = {
  name: 'Anime Meme',
  description: 'Shares anime-related memes and funny content',
  version: '1.0.0',
  code: `const animeMemes = [
  "When you realize there's no new episode this week: 😭",
  "Me waiting for One Piece to end: 🧓",
  "That moment when your favorite character dies: 💔",
  "When someone says anime is for kids: 😤",
  "Trying to explain anime plots to non-weebs: 🤯",
  "When the filler arc finally ends: 🎉",
  "That feeling when the opening song is a banger: 🎵",
  "When the main character gets a power-up: 💪",
  "When you binge-watch an entire season in one night: 👁️👄👁️",
  "That awkward moment when anime logic doesn't work in real life: 🤡",
  "When your waifu/husbando appears on screen: 😍",
  "Trying to choose which anime to watch next: 🤔",
  "When the plot twist hits you: 😲",
  "That feeling when the ED is just as good as the OP: 🎶",
  "When you recognize a voice actor from another anime: 👂",
  "Trying to avoid spoilers: 🙈",
  "When the anime adaptation doesn't do justice to the manga: 😔",
  "That moment when you understand a Japanese word without subtitles: 🎓",
  "When the anime has better animation than most movies: 🎬",
  "Waiting for the Blu-ray version to remove censorship: ⏳"
];

// Meme categories for more organized responses
const memeCategories = {
  relatable: [0, 1, 5, 8, 11, 15, 17, 19],
  emotional: [2, 3, 16],
  hype: [4, 6, 7, 9, 12, 13, 14, 18],
  achievement: [10]
};

async function animeMeme(message, client, sessionId, require, console, prefix) {
  // Random meme command
  if (message.body === prefix + 'animeme') {
    const randomMeme = animeMemes[Math.floor(Math.random() * animeMemes.length)];
    await client.sendMessage(message.from, 
      \`😂 Anime Meme:\\n\\n\${randomMeme}\`
    );
  }
  
  // Daily meme command (consistent based on date)
  if (message.body === prefix + 'dailyanimeme') {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const dailyMeme = animeMemes[dayOfYear % animeMemes.length];
    
    await client.sendMessage(message.from, 
      \`📅 Daily Anime Meme:\\n\\n\${dailyMeme}\`
    );
  }
  
  // Categorized meme command
  if (message.body.startsWith(prefix + 'animeme ')) {
    const category = message.body.split(' ')[1]?.toLowerCase();
    
    if (category && memeCategories[category]) {
      const categoryMemes = memeCategories[category].map(index => animeMemes[index]);
      const randomMeme = categoryMemes[Math.floor(Math.random() * categoryMemes.length)];
      
      await client.sendMessage(message.from, 
        \`😂 \${category.toUpperCase()} Anime Meme:\\n\\n\${randomMeme}\`
      );
    } else {
      // Show available categories if invalid category is provided
      await client.sendMessage(message.from, 
        \`Available meme categories: \${Object.keys(memeCategories).join(', ')}\\n` +
        \`Usage: \${prefix}animeme <category>\`
      );
    }
  }
  
  // Meme list command
  if (message.body === prefix + 'animemelist') {
    let response = '😂 Available Anime Memes:\\n\\n';
    animeMemes.forEach((meme, index) => {
      response += \`\${index + 1}. \${meme}\\n\`;
    });
    
    // Split long messages to avoid character limit
    const messageParts = [];
    const maxLength = 16000; // WhatsApp message limit
    
    if (response.length > maxLength) {
      for (let i = 0; i < response.length; i += maxLength) {
        messageParts.push(response.substring(i, i + maxLength));
      }
    } else {
      messageParts.push(response);
    }
    
    for (const part of messageParts) {
      await client.sendMessage(message.from, part);
    }
  }
  
  // Meme search command
  if (message.body.startsWith(prefix + 'findmeme ')) {
    const searchTerm = message.body.split(' ').slice(1).join(' ').toLowerCase();
    const foundMemes = animeMemes.filter(meme => 
      meme.toLowerCase().includes(searchTerm)
    );
    
    if (foundMemes.length > 0) {
      const randomMeme = foundMemes[Math.floor(Math.random() * foundMemes.length)];
      await client.sendMessage(message.from, 
        \`🔍 Meme found for "\${searchTerm}":\\n\\n\${randomMeme}\`
      );
    } else {
      await client.sendMessage(message.from, 
        \`No memes found for "\${searchTerm}". Try a different search term.\`
      );
    }
  }
  
  // Meme count command
  if (message.body === prefix + 'memecount') {
    await client.sendMessage(message.from, 
      \`📊 Total anime memes in database: \${animeMemes.length}\`
    );
  }
}

// Export the function for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports.execute = animeMeme;
}`
};
