module.exports = {
  name: 'Anime Recommendation',
  description: 'Recommends anime based on genre',
  version: '1.0.0',
  code: `async function animeRecommendation(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'recommend')) {
    const args = message.body.split(' ').slice(1);
    const genre = args[0] || 'action';
    
    const recommendations = {
      action: ['Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen', 'One Punch Man', 'Naruto', 'Bleach'],
      romance: ['Your Lie in April', 'Toradora!', 'Fruits Basket', 'Clannad', 'Horimiya', 'Kaguya-sama: Love is War'],
      comedy: ['Gintama', 'Kaguya-sama: Love is War', 'Daily Lives of High School Boys', 'Grand Blue', 'Prison School', 'Hinamatsuri'],
      fantasy: ['Fullmetal Alchemist: Brotherhood', 'Made in Abyss', 'Mushoku Tensei', 'Re:Zero', 'Sword Art Online', 'No Game No Life'],
      horror: ['Another', 'Higurashi', 'Parasyte', 'Tokyo Ghoul', 'Junji Ito Collection', 'Corpse Party'],
      drama: ['Violet Evergarden', 'Anohana', 'Your Name', 'A Silent Voice', '5 Centimeters per Second', 'I Want to Eat Your Pancreas'],
      adventure: ['One Piece', 'Hunter x Hunter', 'Fairy Tail', 'Dragon Ball', 'Made in Abyss', 'Mushoku Tensei'],
      scifi: ['Steins;Gate', 'Psycho-Pass', 'Cowboy Bebop', 'Neon Genesis Evangelion', 'Ghost in the Shell', 'Dr. Stone']
    };
    
    const genreRecs = recommendations[genre.toLowerCase()] || recommendations.action;
    const randomAnime = genreRecs[Math.floor(Math.random() * genreRecs.length)];
    
    let response = '🎌 *Anime Recommendation* 🎌\\n\\n';
    response += '*Genre:* ' + genre.charAt(0).toUpperCase() + genre.slice(1) + '\\n';
    response += '*Recommendation:* ' + randomAnime + '\\n\\n';
    
    // Add some emoji based on genre
    const genreEmojis = {
      action: '⚔️',
      romance: '💖',
      comedy: '😂',
      fantasy: '🐉',
      horror: '👻',
      drama: '🎭',
      adventure: '🗺️',
      scifi: '🚀'
    };
    
    response += genreEmojis[genre] || '🎬';
    response += ' *Enjoy watching!* ' + (genreEmojis[genre] || '🎬') + '\\n\\n';
    
    response += '*Available genres:* action, romance, comedy, fantasy, horror, drama, adventure, scifi\\n';
    response += '*Example:* ' + prefix + 'recommend romance';
    
    await client.sendMessage(message.from, response);
  }
  
  // Show available genres if user types just "!recommend"
  if (message.body === prefix + 'recommend') {
    let response = '🎌 *Anime Recommendation Help* 🎌\\n\\n';
    response += 'To get anime recommendations, use:\\n';
    response += prefix + 'recommend <genre>\\n\\n';
    response += '*Available genres:*\\n';
    response += '• action ⚔️ - Action-packed anime\\n';
    response += '• romance 💖 - Romantic stories\\n';
    response += '• comedy 😂 - Funny anime\\n';
    response += '• fantasy 🐉 - Fantasy worlds\\n';
    response += '• horror 👻 - Scary anime\\n';
    response += '• drama 🎭 - Emotional stories\\n';
    response += '• adventure 🗺️ - Adventure anime\\n';
    response += '• scifi 🚀 - Science fiction\\n\\n';
    response += '*Examples:*\\n';
    response += '• ' + prefix + 'recommend action\\n';
    response += '• ' + prefix + 'recommend romance\\n';
    response += '• ' + prefix + 'recommend comedy';
    
    await client.sendMessage(message.from, response);
  }
}`
};
