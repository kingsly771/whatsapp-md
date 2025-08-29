module.exports = {
  name: 'Anime Memes',
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
  "When the main character gets a power-up: 💪"
];

async function animeMemes(message, client, sessionId) {
  if (message.body === '!animeme') {
    const randomMeme = animeMemes[Math.floor(Math.random() * animeMemes.length)];
    await client.sendMessage(message.from, 
      \`😂 Anime Meme:\\n\\n\${randomMeme}\`
    );
  }
  
  if (message.body === '!dailyanimeme') {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const dailyMeme = animeMemes[dayOfYear % animeMemes.length];
    
    await client.sendMessage(message.from, 
      \`📅 Daily Anime Meme:\\n\\n\${dailyMeme}\`
    );
  }
}`
};
