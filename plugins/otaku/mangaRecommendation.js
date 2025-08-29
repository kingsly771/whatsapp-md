module.exports = {
  name: 'Manga Recommendation',
  description: 'Recommends manga based on preferences',
  version: '1.0.0',
  code: `const mangaRecommendations = {
  "action": ["One Piece", "Attack on Titan", "Berserk", "Kingdom", "Vinland Saga"],
  "romance": ["Fruits Basket", "Horimiya", "Kaguya-sama: Love is War", "Nana", "Orange"],
  "comedy": ["Gintama", "Grand Blue", "Prison School", "Hinamatsuri", "Kaguya-sama: Love is War"],
  "horror": ["Junji Ito Collection", "Parasyte", "Tokyo Ghoul", "Uzumaki", "I Am a Hero"],
  "sliceoflife": ["Yotsuba&!", "Barakamon", "Silver Spoon", "Aria", "Natsume's Book of Friends"]
};

async function mangaRecommendation(message, client, sessionId) {
  if (message.body.startsWith('!recommendmanga')) {
    const genre = message.body.split(' ')[1] || 'action';
    
    if (mangaRecommendations[genre]) {
      const recommendations = mangaRecommendations[genre];
      const randomManga = recommendations[Math.floor(Math.random() * recommendations.length)];
      
      await client.sendMessage(message.from, 
        \`📚 Manga Recommendation (\${genre}):\\n\\n` +
        \`\${randomManga}\\n\\n` +
        \`Available genres: action, romance, comedy, horror, sliceoflife\`
      );
    } else {
      await client.sendMessage(message.from, 
        \`Unknown genre: \${genre}\\n` +
        \`Available genres: action, romance, comedy, horror, sliceoflife\`
      );
    }
  }
  
  if (message.body === '!mangagenres') {
    await client.sendMessage(message.from, 
      \`📖 Manga Genres Available:\\n\\n` +
      \`• action\\n` +
      \`• romance\\n` +
      \`• comedy\\n` +
      \`• horror\\n` +
      \`• sliceoflife\\n\\n` +
      \`Use !recommendmanga <genre> for recommendations\`
    );
  }
}`
};
