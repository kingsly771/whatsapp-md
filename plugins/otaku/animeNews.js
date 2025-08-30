module.exports = {
  name: 'Anime News',
  description: 'Shares the latest anime news and announcements',
  version: '1.0.0',
  code: `async function animeNews(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'animenews') {
    const animeNews = [
      "New season of Attack on Titan announced!",
      "Demon Slayer movie breaks box office records",
      "One Piece chapter 1100 reveals shocking twist",
      "Studio Ghibli announces new film for 2024",
      "Crunchyroll adds 50 new titles to catalog",
      "New Naruto spin-off series confirmed",
      "My Hero Academia final season announced",
      "Jujutsu Kaisen season 2 release date revealed"
    ];
    
    const randomNews = animeNews[Math.floor(Math.random() * animeNews.length)];
    await client.sendMessage(message.from, 
      '📰 *Anime News* 📰\\n\\n' + randomNews + '\\n\\nStay tuned for more updates!'
    );
  }
  
  if (message.body === prefix + 'latestnews') {
    let response = '📰 *Latest Anime News* 📰\\n\\n';
    const newsItems = [
      "• Attack on Titan final episode breaks streaming records",
      "• New Dragon Ball movie in production",
      "• Netflix announces live-action One Piece adaptation",
      "• Demon Slayer: Entertainment District Arc wins awards",
      "• Spy x Family season 2 confirmed"
    ];
    
    for (let i = 0; i < 3; i++) {
      response += newsItems[i] + '\\n';
    }
    
    response += '\\n📆 More news coming soon!';
    
    await client.sendMessage(message.from, response);
  }
}`
};
