const path = require('path');

module.exports = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // WhatsApp session configuration
  whatsapp: {
    sessionPath: process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '../storage/sessions'),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  },
  
  // Media storage
  media: {
    storagePath: process.env.MEDIA_STORAGE_PATH || path.join(__dirname, '../storage/media')
  },
  
  // External APIs
  apis: {
    anilist: process.env.ANILIST_API_URL || 'https://graphql.anilist.co',
    mal: process.env.MYANIMELIST_API_URL || 'https://api.myanimelist.net/v2'
  },
  
  // Plugin settings
  plugins: {
    maxExecutionTime: 10000, // 10 seconds
    enableAllByDefault: false
  }
};
