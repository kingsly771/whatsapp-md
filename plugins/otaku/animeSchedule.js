module.exports = {
  name: 'Anime Schedule',
  description: 'Provides weekly anime airing schedule',
  version: '1.0.0',
  code: `const weeklySchedule = {
  "Monday": ["One Piece", "Boruto", "Black Clover"],
  "Tuesday": ["Attack on Titan", "My Hero Academia", "Jujutsu Kaisen"],
  "Wednesday": ["Demon Slayer", "Chainsaw Man", "Spy x Family"],
  "Thursday": ["Dr. Stone", "Fire Force", "Vinland Saga"],
  "Friday": ["JoJo's Bizarre Adventure", "Bleach", "One Punch Man"],
  "Saturday": ["Dragon Ball Super", "Naruto", "Hunter x Hunter"],
  "Sunday": ["New episodes various series"]
};

async function animeSchedule(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'schedule') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayAnime = weeklySchedule[today] || ["No scheduled anime today"];
    
    let response = \`📅 Today's Anime Schedule (\${today}):\\n\\n\`;
    todayAnime.forEach(anime => {
      response += \`• \${anime}\\n\`;
    });
    
    await client.sendMessage(message.from, response);
  }
  
  if (message.body.startsWith(prefix + 'schedule')) {
    const day = message.body.split(' ')[1];
    
    if (day && weeklySchedule[day]) {
      let response = \`📅 Anime Schedule for \${day}:\\n\\n\`;
      weeklySchedule[day].forEach(anime => {
        response += \`• \${anime}\\n\`;
      });
      
      await client.sendMessage(message.from, response);
    } else if (day) {
      await client.sendMessage(message.from, 
        \`No schedule found for \${day}.\\n` +
        \`Valid days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\`
      );
    }
  }
}`
};
