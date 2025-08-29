module.exports = {
  name: 'Help',
  description: 'Shows available commands and plugin information',
  version: '1.0.0',
  code: `const pluginService = require('../../services/pluginService');

async function help(message, client, sessionId, require, console, prefix) {
  if (message.body === prefix + 'help') {
    const plugins = pluginService.listPlugins().filter(p => p.enabled);
    
    let response = `🤖 Bot Commands (Prefix: ${prefix})\\n\\n`;
    response += `Available Plugins:\\n\\n`;
    
    // Group plugins by category
    const pluginsByCategory = {};
    plugins.forEach(plugin => {
      if (!pluginsByCategory[plugin.category]) {
        pluginsByCategory[plugin.category] = [];
      }
      pluginsByCategory[plugin.category].push(plugin);
    });
    
    for (const [category, categoryPlugins] of Object.entries(pluginsByCategory)) {
      response += `**${category.toUpperCase()}**:\\n`;
      categoryPlugins.forEach(plugin => {
        response += `• ${plugin.name} - ${plugin.description}\\n`;
      });
      response += `\\n`;
    }
    
    response += `Use ${prefix}help <plugin> for more information about a specific plugin.`;
    
    await client.sendMessage(message.from, response);
  }
  
  if (message.body.startsWith(prefix + 'help ')) {
    const pluginName = message.body.split(' ').slice(1).join(' ').toLowerCase();
    const plugins = pluginService.listPlugins();
    const plugin = plugins.find(p => p.name.toLowerCase() === pluginName);
    
    if (plugin) {
      await client.sendMessage(message.from, 
        `ℹ️ Plugin: ${plugin.name}\\n\\n` +
        `Description: ${plugin.description}\\n` +
        `Category: ${plugin.category}\\n` +
        `Version: ${plugin.version}\\n` +
        `Status: ${plugin.enabled ? 'Enabled' : 'Disabled'}\\n\\n` +
        `Use ${prefix}plugins to see all available plugins.`
      );
    } else {
      await client.sendMessage(message.from, 
        `Plugin "${pluginName}" not found. Use ${prefix}help to see available plugins.`
      );
    }
  }
}`
};
