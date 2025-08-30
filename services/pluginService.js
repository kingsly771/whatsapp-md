const { plugins, pluginStats } = require('../config/database');
const config = require('../config/config');
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

        console.log(`✅ Loaded ${this.plugins.size} plugins for Bailey`);
    }

    addPlugin(id, name, description, code, category = 'general', version = '1.0.0') {
        const Plugin = require('../models/Plugin');
        this.plugins.set(id, new Plugin(id, name, description, code, category, version));
    }

    getPlugin(id) {
        return this.plugins.get(id);
    }

    enablePlugin(id) {
        const plugin = this.plugins.get(id);
        if (plugin) {
            plugin.enable();
            return true;
        }
        return false;
    }

    disablePlugin(id) {
        const plugin = this.plugins.get(id);
        if (plugin) {
            plugin.disable();
            return true;
        }
        return false;
    }

    listPlugins(category = null) {
        let pluginsList = Array.from(this.plugins.values());
        
        if (category) {
            pluginsList = pluginsList.filter(plugin => plugin.category === category);
        }
        
        return pluginsList.map(plugin => ({
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            category: plugin.category,
            version: plugin.version,
            enabled: plugin.enabled
        }));
    }

    async executePlugins(message, client, sessionId) {
        // Check if message is a command
        if (!this.isCommand(message.body)) {
            return;
        }

        for (const [id, plugin] of this.plugins) {
            if (plugin.enabled) {
                try {
                    await this.executePlugin(id, plugin, message, client, sessionId);
                } catch (error) {
                    console.error(`Error executing plugin ${id}:`, error);
                }
            }
        }
    }

    async executePlugin(pluginId, plugin, message, client, sessionId) {
        try {
            // Create function from plugin code with Bailey-specific context
            const pluginFunction = new Function(
                'message', 'client', 'sessionId', 'require', 'console', 'prefix', 'bailey',
                `"use strict";\n${plugin.code}`
            );
            
            // Bailey helper methods
            const baileyHelpers = {
                sendMessage: async (chatId, content, options = {}) => {
                    return await client.sendMessage(chatId, content, options);
                },
                getChat: async (chatId) => {
                    return await client.getChat(chatId);
                },
                getContacts: async () => {
                    return await client.getContacts();
                },
                // Add more Bailey-specific helpers as needed
            };

            await pluginFunction(message, client, sessionId, require, console, this.prefix, baileyHelpers);
            
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
    }

    isCommand(messageBody) {
        return messageBody.startsWith(this.prefix) || messageBody.startsWith(this.adminPrefix);
    }
}

module.exports = new PluginService();
