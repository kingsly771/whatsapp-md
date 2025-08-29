// services/pluginService.js
const { plugins, pluginStats } = require('../config/database');
const config = require('../config/config');

// Import plugins correctly
const generalPlugins = require('../plugins/general');
const otakuPlugins = require('../plugins/otaku');

class PluginService {
  constructor() {
    this.plugins = plugins;
    this.initializePlugins();
  }

  initializePlugins() {
    // Clear existing plugins
    this.plugins.clear();

    // Load general plugins
    for (const [id, pluginModule] of Object.entries(generalPlugins)) {
      this.addPlugin(
        id,
        pluginModule.name,
        pluginModule.description,
        pluginModule.code,
        'general',
        pluginModule.version || '1.0.0'
      );
    }

    // Load otaku plugins
    for (const [id, pluginModule] of Object.entries(otakuPlugins)) {
      this.addPlugin(
        id,
        pluginModule.name,
        pluginModule.description,
        pluginModule.code,
        'otaku',
        pluginModule.version || '1.0.0'
      );
    }

    console.log(`✅ Loaded ${this.plugins.size} plugins (${this.getPluginsByCategory('general').length} general, ${this.getPluginsByCategory('otaku').length} otaku)`);
  }

  // ... rest of the plugin service code remains the same ...
}

module.exports = new PluginService();
