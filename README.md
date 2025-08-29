# WhatsApp Bot with Otaku Group Plugins

A powerful WhatsApp bot with 70+ plugins, including specialized plugins for Otaku groups.

## Features

- QR code authentication
- Session management
- 50+ general plugins
- 20+ specialized Otaku group plugins
- Real-time updates via Socket.io
- Plugin system with enable/disable functionality

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Start the server: `npm start`

## API Endpoints

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId/status` - Get session status
- `DELETE /api/sessions/:sessionId` - Disconnect session
- `GET /api/plugins` - List all plugins
- `POST /api/plugins/:pluginId/enable` - Enable a plugin
- `POST /api/plugins/:pluginId/disable` - Disable a plugin

## Otaku Plugins

Specialized plugins for anime/manga enthusiast groups:
- Anime recommendations
- Manga tracking
- Character information
- Cosplay events
- And many more!

## License

MIT
