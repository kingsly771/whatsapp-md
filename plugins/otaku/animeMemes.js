module.exports = {
  name: 'Anime Meme',
  description: 'Shares anime-related memes and funny content',
  version: '1.0.0',
  code: `async function animememe(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'animeme') {
    const memes = [
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
    
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    await client.sendMessage(message.from, '😂 *Anime Meme* 😂\\n\\n' + randomMeme);
  }
  
  if (message.body === prefix + 'animeme list') {
    let response = '🎌 *Anime Memes Help* 🎌\\n\\n';
    response += 'Get random anime memes with these commands:\\n\\n';
    response += '• ' + prefix + 'animeme - Get a random anime meme\\n';
    response += '• ' + prefix + 'animeme list - Show this help\\n\\n';
    response += '💡 *Tip:* Memes are randomly selected from a collection of 20+ anime-related jokes!';
    
    await client.sendMessage(message.from, response);
  }
}`
};
