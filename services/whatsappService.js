const { Client, LocalAuth } = require('whatsapp-web.js');
const Session = require('../models/Session');
const { sessions } = require('../config/database');
const config = require('../config/config');
const pluginService = require('./pluginService');
const path = require('path');

class WhatsAppService {
    constructor() {
        this.clients = new Map();
        this.prefix = config.bot.prefix;
        this.adminPrefix = config.bot.adminPrefix;
        this.cleanupInterval = setInterval(() => this.cleanupSessions(), 5 * 60 * 1000); // Cleanup every 5 minutes
    }

    initializeClient(sessionId, io) {
        // Check if session already exists and is valid
        const existingSession = sessions.get(sessionId);
        if (existingSession && existingSession.status === 'READY') {
            return existingSession;
        }

        const client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: sessionId,
                dataPath: config.whatsapp.sessionPath
            }),
            puppeteer: config.whatsapp.puppeteer
        });

        const session = new Session(sessionId);
        sessions.set(sessionId, session);

        client.on('qr', (qr) => {
            console.log(`QR received for session ${sessionId}`);
            session.updateStatus('QR_READY');
            session.setQrCode(qr);
            
            // Emit QR code to frontend via socket.io
            if (io) {
                io.emit('qrCode', { sessionId, qr });
            }
        });

        client.on('authenticated', () => {
            console.log(`Authenticated session ${sessionId}`);
            session.updateStatus('AUTHENTICATED');
            
            if (io) {
                io.emit('statusUpdate', { sessionId, status: 'AUTHENTICATED' });
            }
        });

        client.on('ready', () => {
            console.log(`Client ready for session ${sessionId}`);
            session.updateStatus('READY');
            session.setClient(client);
            
            // Update metadata with connection info
            session.updateMetadata({
                userAgent: client.info.pushname,
                platform: client.info.platform,
                connectedNumber: client.info.wid.user
            });
            
            if (io) {
                io.emit('statusUpdate', { 
                    sessionId, 
                    status: 'READY', 
                    metadata: session.metadata 
                });
            }
        });

        client.on('message', async (message) => {
            console.log(`Message received in session ${sessionId}: ${message.body}`);
            session.updateStatus('ACTIVE');
            
            // Check if message is a command with the correct prefix
            if (!this.isCommand(message.body)) {
                return;
            }
            
            // Execute all enabled plugins
            try {
                await pluginService.executePlugins(message, client, sessionId);
            } catch (error) {
                console.error(`Error executing plugins for session ${sessionId}:`, error);
            }
        });

        client.on('disconnected', (reason) => {
            console.log(`Client disconnected for session ${sessionId}:`, reason);
            sessions.delete(sessionId);
            this.clients.delete(sessionId);
            
            if (io) {
                io.emit('statusUpdate', { sessionId, status: 'DISCONNECTED', reason });
            }
        });

        client.initialize();
        this.clients.set(sessionId, client);
        
        return session;
    }

    getClient(sessionId) {
        return this.clients.get(sessionId);
    }

    getSession(sessionId) {
        return sessions.get(sessionId);
    }

    getAllSessions() {
        return Array.from(sessions.entries()).map(([id, session]) => ({
            id: session.sessionId,
            status: session.status,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            metadata: session.metadata
        }));
    }

    disconnectClient(sessionId) {
        const client = this.clients.get(sessionId);
        if (client) {
            client.destroy();
            this.clients.delete(sessionId);
            sessions.delete(sessionId);
            return true;
        }
        return false;
    }

    cleanupSessions() {
        let cleanedCount = 0;
        for (const [sessionId, session] of sessions.entries()) {
            if (session.isExpired()) {
                this.disconnectClient(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`Cleaned up ${cleanedCount} expired sessions`);
        }
    }

    // Check if message is a command with the correct prefix
    isCommand(messageBody) {
        return messageBody.startsWith(this.prefix) || messageBody.startsWith(this.adminPrefix);
    }

    // Extract command from message (remove prefix)
    extractCommand(messageBody) {
        if (messageBody.startsWith(this.adminPrefix)) {
            return messageBody.slice(this.adminPrefix.length).trim().split(' ')[0];
        }
        if (messageBody.startsWith(this.prefix)) {
            return messageBody.slice(this.prefix.length).trim().split(' ')[0];
        }
        return null;
    }

    // Extract arguments from command
    extractArgs(messageBody) {
        if (messageBody.startsWith(this.adminPrefix)) {
            return messageBody.slice(this.adminPrefix.length).trim().split(' ').slice(1);
        }
        if (messageBody.startsWith(this.prefix)) {
            return messageBody.slice(this.prefix.length).trim().split(' ').slice(1);
        }
        return [];
    }

    // Check if message is an admin command
    isAdminCommand(messageBody) {
        return messageBody.startsWith(this.adminPrefix);
    }

    // Get the configured prefix
    getPrefix() {
        return this.prefix;
    }

    // Get the configured admin prefix
    getAdminPrefix() {
        return this.adminPrefix;
    }

    // Send message with proper formatting for commands
    async sendCommandResponse(client, chatId, response) {
        // Format response to make it clear it's from the bot
        const formattedResponse = `🤖 *Bot Response:*\n\n${response}`;
        await client.sendMessage(chatId, formattedResponse);
    }

    // Send error message for invalid commands
    async sendCommandError(client, chatId, command) {
        const errorMessage = `❌ *Command Error:*\n\n` +
                            `Command "${command}" not found or invalid.\n` +
                            `Use "${this.prefix}help" to see available commands.`;
        await client.sendMessage(chatId, errorMessage);
    }

    // Send help message with available commands
    async sendHelpMessage(client, chatId) {
        const enabledPlugins = pluginService.listPlugins().filter(plugin => plugin.enabled);
        
        let helpMessage = `🤖 *Bot Help*\n\n` +
                         `*Prefix:* ${this.prefix}\n` +
                         `*Admin Prefix:* ${this.adminPrefix}\n\n` +
                         `*Available Commands:*\n\n`;
        
        // Group commands by category
        const commandsByCategory = {};
        enabledPlugins.forEach(plugin => {
            if (!commandsByCategory[plugin.category]) {
                commandsByCategory[plugin.category] = [];
            }
            // Extract commands from plugin code (simplified)
            const commands = this.extractCommandsFromPlugin(plugin);
            commandsByCategory[plugin.category].push(...commands);
        });
        
        // Add commands to help message by category
        for (const [category, commands] of Object.entries(commandsByCategory)) {
            if (commands.length > 0) {
                helpMessage += `*${category.toUpperCase()}:*\n`;
                commands.forEach(cmd => {
                    helpMessage += `• ${this.prefix}${cmd}\n`;
                });
                helpMessage += '\n';
            }
        }
        
        helpMessage += `\nUse "${this.prefix}help <command>" for more information about a specific command.`;
        
        await client.sendMessage(chatId, helpMessage);
    }

    // Extract commands from plugin code (simplified implementation)
    extractCommandsFromPlugin(plugin) {
        const commands = [];
        const pluginCode = pluginService.getPlugin(plugin.id)?.code || '';
        
        // Simple regex to find command patterns in plugin code
        const commandRegex = /message\.body\.startsWith\(prefix\s*\+\s*'([^']+)'\)/g;
        const commandRegex2 = /message\.body\s*===\s*prefix\s*\+\s*'([^']+)'/g;
        const commandRegex3 = /message\.body\.startsWith\(prefix\s*\+\s*"([^"]+)"\)/g;
        
        let match;
        while ((match = commandRegex.exec(pluginCode)) !== null) {
            commands.push(match[1]);
        }
        while ((match = commandRegex2.exec(pluginCode)) !== null) {
            commands.push(match[1]);
        }
        while ((match = commandRegex3.exec(pluginCode)) !== null) {
            commands.push(match[1]);
        }
        
        return [...new Set(commands)]; // Remove duplicates
    }

    // Graceful shutdown
    shutdown() {
        clearInterval(this.cleanupInterval);
        for (const sessionId of this.clients.keys()) {
            this.disconnectClient(sessionId);
        }
        console.log('WhatsApp service shutdown complete');
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    module.exports.shutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    module.exports.shutdown();
    process.exit(0);
});

module.exports = new WhatsAppService();
