module.exports = {
  name: 'Character Info',
  description: 'Provides information about anime characters',
  version: '1.0.0',
  code: `async function characterInfo(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'character')) {
    const characterName = message.body.split(' ').slice(1).join(' ');
    
    if (characterName) {
      // Mock character database - in real implementation, use an API
      const characters = {
        'luffy': {
          name: 'Monkey D. Luffy',
          anime: 'One Piece',
          role: 'Main Character',
          abilities: 'Gum-Gum Fruit powers, Haki',
          description: 'Captain of the Straw Hat Pirates aiming to become King of the Pirates'
        },
        'naruto': {
          name: 'Naruto Uzumaki',
          anime: 'Naruto',
          role: 'Main Character',
          abilities: 'Rasengan, Shadow Clone, Sage Mode',
          description: 'Ninja from Hidden Leaf Village who wants to become Hokage'
        },
        'goku': {
          name: 'Son Goku',
          anime: 'Dragon Ball',
          role: 'Main Character',
          abilities: 'Kamehameha, Super Saiyan, Instant Transmission',
          description: 'Saiyan warrior who protects Earth from threats'
        }
      };
      
      const charKey = characterName.toLowerCase();
      const character = characters[charKey];
      
      if (character) {
        let response = '🎌 *Character Information* 🎌\\n\\n';
        response += '*Name:* ' + character.name + '\\n';
        response += '*Anime:* ' + character.anime + '\\n';
        response += '*Role:* ' + character.role + '\\n';
        response += '*Abilities:* ' + character.abilities + '\\n';
        response += '*Description:* ' + character.description;
        
        await client.sendMessage(message.from, response);
      } else {
        await client.sendMessage(message.from, 
          '❌ Character "' + characterName + '" not found in database.\\n' +
          'Try: Luffy, Naruto, or Goku'
        );
      }
    } else {
      await client.sendMessage(message.from, 
        'Usage: ' + prefix + 'character <name>\\n' +
        'Example: ' + prefix + 'character luffy'
      );
    }
  }
}`
};
