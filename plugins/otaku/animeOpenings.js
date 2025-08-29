module.exports = {
  name: 'Anime Openings',
  description: 'Shares anime opening themes and information',
  version: '1.0.0',
  code: `const animeOpenings = {
  "Attack on Titan": {
    season1: "Guren no Yumiya by Linked Horizon",
    season2: "Shinzo wo Sasageyo! by Linked Horizon",
    season3: "Red Swan by Yoshiki feat. Hyde",
    season4: "My War by Shinsei Kamattechan"
  },
  "Naruto": {
    season1: "Rocks by Hound Dog",
    shippuden: "Hero's Come Back!! by nobodyknows+"
  },
  "Demon Slayer": {
    season1: "Gurenge by LiSA",
    season2: "Akeboshi by LiSA"
  }
};

async function animeOpenings(message, client, sessionId, require, console, prefix) {
  if (message.body.startsWith(prefix + 'opening')) {
    const animeName = message.body.split(' ').slice(1).join(' ');
    
    if (animeOpenings[animeName]) {
      let response = \`🎵 Openings for \${animeName}:\\n\\n\`;
      for (const [season, opening] of Object.entries(animeOpenings[animeName])) {
        response += \`• Season \${season}: \${opening}\\n\`;
      }
      await client.sendMessage(message.from, response);
    } else {
      await client.sendMessage(message.from, 
        \`No opening information found for \${animeName}.\\n` +
        \`Try: Attack on Titan, Naruto, or Demon Slayer\`
      );
    }
  }
  
  if (message.body === prefix + 'randomopening') {
    const animes = Object.keys(animeOpenings);
    const randomAnime = animes[Math.floor(Math.random() * animes.length)];
    const seasons = Object.keys(animeOpenings[randomAnime]);
    const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];
    const opening = animeOpenings[randomAnime][randomSeason];
    
    await client.sendMessage(message.from, 
      \`🎵 Random Opening Theme:\\n\\n` +
      \`Anime: \${randomAnime}\\n` +
      \`Season: \${randomSeason}\\n` +
      \`Opening: \${opening}\`
    );
  }
}`
};
