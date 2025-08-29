module.exports = {
  name: 'Anime News',
  description: 'Shares the latest anime news and announcements',
  version: '1.0.0',
  code: `const animeNews = [
  "New season of Attack on Titan announced!",
  "Demon Slayer movie breaks box office records",
  "One Piece chapter 1100 reveals shocking twist",
  "Studio Ghibli announces new film for 2024",
  "Crunchyroll adds 50 new titles to catalog"
];

async function animeNews(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'animenews') {
    const randomNews = animeNews[Math.floor(Math.random() * animeNews.length)];
    await client.sendMessage(message.from, 
      \`📰 Anime News: \${randomNews}\\n\\n` +
      \`Stay tuned for more updates!\`
    );
  }
  
  if (message.body === prefix + 'latestnews') {
    let response = '📰 Latest Anime News:\\n\\n';
    for (let i = 0; i < Math.min(3, animeNews.length); i++) {
      response += \`• \${animeNews[i]}\\n\`;
    }
    await client.sendMessage(message.from, response);
  }
}`
};
