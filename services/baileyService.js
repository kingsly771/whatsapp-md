const { DefaultAzureCredential } = require('@azure/identity');
const { Baileys } = require('@whiskeysockets/baileys');
const { sessions } = require('../config/database');
const Session = require('../models/Session');

class BaileyService {
    constructor() {
        this.clients = new Map();
        this.prefix = '!';
        this.adminPrefix = '!!';
    }

    async initializeClient(sessionId, io) {
        try {
            const session = new Session(sessionId);
            sessions.set(sessionId, session);

            // Initialize Bailey client
            const client = new Baileys({
                sessionId: sessionId,
                printQRInTerminal: true,
                browser: ['WhatsApp Bot', 'Chrome', 'Windows']
            });

            // Handle QR code generation
            client.on('qr', (qr) => {
                console.log(`QR received for session ${sessionId}`);
                session.updateStatus('QR_READY');
                session.setQrCode(qr);
                
                if (io) {
                    io.emit('qrCode', { sessionId, qr });
                }
            });

            // Handle authentication
            client.on('authenticated', () => {
                console.log(`Authenticated session ${sessionId}`);
                session.updateStatus('AUTHENTICATED');
                
                if (io) {
                    io.emit('statusUpdate', { sessionId, status: 'AUTHENTICATED' });
                }
            });

            // Handle connection
            client.on('ready', () => {
                console.log(`Client ready for session ${sessionId}`);
                session.updateStatus('READY');
                session.setClient(client);
                
                if (io) {
                    io.emit('statusUpdate', { sessionId, status: 'READY' });
                }
            });

            // Handle messages
            client.on('message', async (message) => {
                console.log(`Message received in session ${sessionId}:`, message.body);
                session.updateStatus('ACTIVE');
                
                // Execute plugins
                const pluginService = require('./pluginService');
                await pluginService.executePlugins(message, client, sessionId);
            });

            // Handle disconnection
            client.on('disconnected', (reason) => {
                console.log(`Client disconnected for session ${sessionId}:`, reason);
                sessions.delete(sessionId);
                this.clients.delete(sessionId);
                
                if (io) {
                    io.emit('statusUpdate', { sessionId, status: 'DISCONNECTED', reason });
                }
            });

            // Initialize the client
            await client.initialize();
            this.clients.set(sessionId, client);
            
            return session;

        } catch (error) {
            console.error('Error initializing Bailey client:', error);
            throw error;
        }
    }

    getClient(sessionId) {
        return this.clients.get(sessionId);
    }

    async disconnectClient(sessionId) {
        const client = this.clients.get(sessionId);
        if (client) {
            await client.logout();
            await client.destroy();
            this.clients.delete(sessionId);
            sessions.delete(sessionId);
            return true;
        }
        return false;
    }

    // Bailey-specific methods
    async sendMessage(client, chatId, message, options = {}) {
        try {
            return await client.sendMessage(chatId, message, options);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async getChats(client) {
        try {
            return await client.getChats();
        } catch (error) {
            console.error('Error getting chats:', error);
            throw error;
        }
    }

    async getContact(client, contactId) {
        try {
            return await client.getContact(contactId);
        } catch (error) {
            console.error('Error getting contact:', error);
            throw error;
        }
    }
}

module.exports = new BaileyService();
