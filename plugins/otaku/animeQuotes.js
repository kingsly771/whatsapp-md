module.exports = {
  name: 'Anime Quotes',
  description: 'Shares famous anime quotes',
  version: '1.0.0',
  code: `const animeQuotes = [
  {
    text: "I'm going to become the King of the Pirates!",
    character: "Monkey D. Luffy",
    anime: "One Piece"
  },
  {
    text: "If you don't take risks, you can't create a future!",
    character: "Monkey D. Luffy",
    anime: "One Piece"
  },
  {
    text: "It's not the face that makes someone a monster, it's the choices they make with their lives.",
    character: "Naruto Uzumaki",
    anime: "Naruto"
  },
  {
    text: "Knowing you're different is only the beginning. If you accept these differences you'll be able to get past them and grow even closer.",
    character: "Misato Katsuragi",
    anime: "Neon Genesis Evangelion"
  }
];

async function animeQuotes(message, client, sessionId) {
  if (message.body === '!quote') {
    const randomQuote = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
    
    await client.sendMessage(message.from, 
      \`"$\{randomQuote.text}"\\n\\n- $\{randomQuote.character} ($\{randomQuote.anime})\`
    );
  }
}`
};
