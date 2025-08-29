module.exports = {
  name: 'Anime Music',
  description: 'Shares information about anime music and soundtracks',
  version: '1.0.0',
  code: `const animeMusic = {
  "Attack on Titan": {
    composer: "Hiroyuki Sawano",
    famousTracks: ["YouSeeBIGGIRL/T:T", "Apple Seed", "Before Lights Out", "Vogel im Käfig"]
  },
  "Naruto": {
    composer: "Yasuharu Takanashi",
    famousTracks: ["Sadness and Sorrow", "The Raising Fighting Spirit", "Naruto Main Theme"]
  },
  "Your Name": {
    composer: "Radwimps",
    famousTracks: ["Sparkle", "Nandemonaiya", "Dream Lantern", "Zenzenzense"]
  }
};

async function animeMusic(message, client, sessionId) {
  if (message.body.startsWith('!animesoundtrack')) {
    const animeName = message.body.split(' ').slice(1).join(' ');
    
    if (animeMusic[animeName]) {
      const musicInfo = animeMusic[animeName];
      let response = \`🎵 Soundtrack for \${animeName}:\\n\\n\`;
      response += \`Composer: \${musicInfo.composer}\\n\\n\`;
      response += \`Famous Tracks:\\n\`;
      
      musicInfo.famousTracks.forEach(track => {
        response += \`• \${track}\\n\`;
      });
      
      await client.sendMessage(message.from, response);
    } else {
      await client.sendMessage(message.from, 
        \`No music information found for \${animeName}.\\n` +
        \`Try: Attack on Titan, Naruto, or Your Name\`
      );
    }
  }
  
  if (message.body === '!randomost') {
    const animes = Object.keys(animeMusic);
    const randomAnime = animes[Math.floor(Math.random() * animes.length)];
    const musicInfo = animeMusic[randomAnime];
    const randomTrack = musicInfo.famousTracks[Math.floor(Math.random() * musicInfo.famousTracks.length)];
    
    await client.sendMessage(message.from, 
      \`🎵 Random Anime OST:\\n\\n` +
      \`Anime: \${randomAnime}\\n` +
      \`Composer: \${musicInfo.composer}\\n` +
      \`Track: \${randomTrack}\`
    );
  }
}`
};
