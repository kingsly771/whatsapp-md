module.exports = {
  name: 'Anime Quotes',
  description: 'Shares famous anime quotes',
  version: '1.0.0',
  code: `async function animeQuotes(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'quote') {
    const quotes = [
      { 
        text: "I'm going to become the King of the Pirates!", 
        character: "Monkey D. Luffy", 
        anime: "One Piece",
        emoji: "🏴‍☠️"
      },
      { 
        text: "If you don't take risks, you can't create a future!", 
        character: "Monkey D. Luffy", 
        anime: "One Piece",
        emoji: "⚡"
      },
      { 
        text: "It's not the face that makes someone a monster, it's the choices they make with their lives.", 
        character: "Naruto Uzumaki", 
        anime: "Naruto",
        emoji: "🌀"
      },
      { 
        text: "Knowing you're different is only the beginning. If you accept these differences you'll be able to get past them and grow even closer.", 
        character: "Misato Katsuragi", 
        anime: "Neon Genesis Evangelion",
        emoji: "🌟"
      },
      { 
        text: "The world isn't perfect. But it's there for us, doing the best it can. That's what makes it so damn beautiful.", 
        character: "Roy Mustang", 
        anime: "Fullmetal Alchemist",
        emoji: "🌎"
      },
      { 
        text: "I don't know everything, I just know what I know.", 
        character: "Hanekawa Tsubasa", 
        anime: "Monogatari Series",
        emoji: "📚"
      }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    
    let response = randomQuote.emoji + ' *Anime Quote* ' + randomQuote.emoji + '\\n\\n';
    response += '"' + randomQuote.text + '"\\n\\n';
    response += '- *' + randomQuote.character + '*\\n';
    response += '  *' + randomQuote.anime + '*';
    
    await client.sendMessage(message.from, response);
  }
  
  if (message.body === prefix + 'quotes') {
    let response = '🎌 *Anime Quotes Help* 🎌\\n\\n';
    response += 'Get random anime quotes with these commands:\\n\\n';
    response += '• ' + prefix + 'quote - Get a random anime quote\\n';
    response += '• ' + prefix + 'quote list - Show available quote series\\n\\n';
    response += '*Featured anime:* One Piece, Naruto, Evangelion, Fullmetal Alchemist, Monogatari';
    
    await client.sendMessage(message.from, response);
  }
}`
};
