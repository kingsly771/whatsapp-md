module.exports = {
  name: 'Japanese Learning',
  description: 'Helps users learn Japanese with anime phrases',
  version: '1.0.0',
  code: `const japanesePhrases = [
  { japanese: "おはようございます", romaji: "Ohayou gozaimasu", english: "Good morning" },
  { japanese: "ありがとう", romaji: "Arigatou", english: "Thank you" },
  { japanese: "すみません", romaji: "Sumimasen", english: "Excuse me / I'm sorry" },
  { japanese: "大好きだ", romaji: "Daisuki da", english: "I love you" },
  { japanese: "頑張って", romaji: "Ganbatte", english: "Do your best" }
];

async function japaneseLearning(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'learnjapanese') {
    const randomPhrase = japanesePhrases[Math.floor(Math.random() * japanesePhrases.length)];
    
    await client.sendMessage(message.from, 
      \`🎌 Japanese Phrase of the Day:\\n\\n` +
      \`Japanese: \${randomPhrase.japanese}\\n` +
      \`Romaji: \${randomPhrase.romaji}\\n` +
      \`English: \${randomPhrase.english}\`
    );
  }
  
  if (message.body.startsWith(prefix + 'translate')) {
    const text = message.body.split(' ').slice(1).join(' ');
    
    if (text) {
      // Simple translation simulation
      const translations = {
        "hello": "こんにちは",
        "thank you": "ありがとう",
        "i love you": "愛してる",
        "goodbye": "さようなら",
        "delicious": "美味しい"
      };
      
      const translation = translations[text.toLowerCase()] || "Translation not available";
      await client.sendMessage(message.from, 
        \`🎌 Translation:\\n\\n` +
        \`English: \${text}\\n` +
        \`Japanese: \${translation}\`
      );
    }
  }
}`
};
