// In-memory storage for demo purposes
// In production, use a proper database like MongoDB or PostgreSQL

const sessions = new Map();
const plugins = new Map();

// Plugin usage statistics
const pluginStats = new Map();

module.exports = {
  sessions,
  plugins,
  pluginStats
};
