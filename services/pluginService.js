const { plugins, pluginStats } = require('../config/database');
const config = require('../config/config');
const generalPlugins = require('../plugins/general');
const otakuPlugins = require('../plugins/otaku');

class PluginService {
  constructor() {
    this.plugins = plugins;
    this.prefix = config.bot.prefix;
    this.adminPrefix = config.bot.adminPrefix;
    this.initializePlugins();
  }

  // ... [rest of the constructor remains the same]

  async executePlugins(message, client, sessionId) {
    // Check if message starts with the bot prefix
    if (!message.body.startsWith(this.prefix) && !message.body.startsWith(this.adminPrefix)) {
      return; // Ignore messages without prefix
    }

    const executionPromises = [];
    
    for (const [id, plugin] of this.plugins) {
      if (plugin.enabled) {
        executionPromises.push(
          this.executePlugin(id, plugin, message, client, sessionId)
        );
      }
    }
    
    await Promise.allSettled(executionPromises);
  }

  async executePlugin(pluginId, plugin, message, client, sessionId) {
    // Check if this plugin should handle the command
    const command = this.extractCommand(message.body);
    if (!this.shouldPluginHandleCommand(plugin, command)) {
      return;
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Plugin execution timeout')), config.plugins.maxExecutionTime);
    });
    
    const executionPromise = (async () => {
      try {
        // Create a function from the plugin code with additional context
        const pluginFunction = new Function(
          'message', 'client', 'sessionId', 'require', 'console', 'prefix',
          `"use strict";\n${plugin.code}`
        );
        
        await pluginFunction(message, client, sessionId, require, console, this.prefix);
        
        // Update statistics
        const stats = pluginStats.get(pluginId) || { executionCount: 0, lastExecution: null, errorCount: 0 };
        stats.executionCount++;
        stats.lastExecution = new Date();
        pluginStats.set(pluginId, stats);
        
      } catch (error) {
        console.error(`Error executing plugin ${pluginId}:`, error);
        
        // Update error statistics
        const stats = pluginStats.get(pluginId) || { executionCount: 0, lastExecution: null, errorCount: 0 };
        stats.errorCount++;
        pluginStats.set(pluginId, stats);
      }
    })();
    
    return Promise.race([executionPromise, timeoutPromise]);
  }

  extractCommand(messageBody) {
    // Extract command from message (remove prefix and get first word)
    const prefix = messageBody.startsWith(this.adminPrefix) ? this.adminPrefix : this.prefix;
    return messageBody.slice(prefix.length).trim().split(' ')[0].toLowerCase();
  }

  shouldPluginHandleCommand(plugin, command) {
    // Check if plugin code contains the command
    // This is a simple implementation - in a real system, you'd want a more robust method
    return plugin.code.toLowerCase().includes(`!${command}`) || 
           plugin.code.toLowerCase().includes(`'!${command}'`) ||
           plugin.code.toLowerCase().includes(`"!${command}"`);
  }

  // Helper method to check if a message is a command
  isCommand(messageBody) {
    return messageBody.startsWith(this.prefix) || messageBody.startsWith(this.adminPrefix);
  }
}

module.exports = new PluginService();
