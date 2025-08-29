const whatsappService = require('../services/whatsappService');
const { sessions } = require('../config/database');
const { validateSessionId, generateSessionId, sanitizeInput } = require('../utils/helpers');

class SessionController {
    constructor() {
        this.sessions = sessions;
    }

    // Create a new WhatsApp session
    async createSession(req, res) {
        try {
            const { sessionId, metadata } = req.body;
            
            // Validate or generate session ID
            let finalSessionId;
            if (sessionId) {
                if (!validateSessionId(sessionId)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid session ID format. Use only letters, numbers, hyphens, and underscores.'
                    });
                }
                finalSessionId = sanitizeInput(sessionId);
            } else {
                finalSessionId = generateSessionId();
            }

            // Check if session already exists
            if (this.sessions.has(finalSessionId)) {
                const existingSession = this.sessions.get(finalSessionId);
                if (existingSession.status === 'READY' || existingSession.status === 'AUTHENTICATED') {
                    return res.status(409).json({
                        success: false,
                        error: 'Session already exists and is active',
                        sessionId: finalSessionId,
                        status: existingSession.status
                    });
                }
            }

            const io = req.app.get('io');
            const session = whatsappService.initializeClient(finalSessionId, io);

            // Add metadata if provided
            if (metadata && typeof metadata === 'object') {
                session.updateMetadata(metadata);
            }

            res.status(201).json({
                success: true,
                message: 'Session created successfully',
                sessionId: finalSessionId,
                status: session.status,
                qrCode: session.qrCode ? 'Available' : 'Pending',
                createdAt: session.createdAt
            });

        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create session',
                message: error.message
            });
        }
    }

    // Get session status
    async getSessionStatus(req, res) {
        try {
            const { sessionId } = req.params;
            const sanitizedSessionId = sanitizeInput(sessionId);

            if (!this.sessions.has(sanitizedSessionId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            const session = this.sessions.get(sanitizedSessionId);
            
            res.json({
                success: true,
                sessionId: sanitizedSessionId,
                status: session.status,
                qrCode: session.qrCode || null,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                metadata: session.metadata,
                isExpired: session.isExpired ? session.isExpired() : false
            });

        } catch (error) {
            console.error('Error getting session status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get session status',
                message: error.message
            });
        }
    }

    // Get QR code for session
    async getSessionQR(req, res) {
        try {
            const { sessionId } = req.params;
            const sanitizedSessionId = sanitizeInput(sessionId);

            if (!this.sessions.has(sanitizedSessionId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            const session = this.sessions.get(sanitizedSessionId);
            
            if (!session.qrCode) {
                return res.status(404).json({
                    success: false,
                    error: 'QR code not available yet',
                    status: session.status
                });
            }

            // Generate QR code image
            const qrcode = require('qrcode');
            const qrImage = await qrcode.toDataURL(session.qrCode);

            res.json({
                success: true,
                sessionId: sanitizedSessionId,
                qrCode: qrImage,
                status: session.status,
                expiresAt: new Date(session.lastActivity.getTime() + 5 * 60000) // QR expires in 5 minutes
            });

        } catch (error) {
            console.error('Error getting session QR:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate QR code',
                message: error.message
            });
        }
    }

    // Disconnect session
    async disconnectSession(req, res) {
        try {
            const { sessionId } = req.params;
            const sanitizedSessionId = sanitizeInput(sessionId);

            if (!this.sessions.has(sanitizedSessionId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            const disconnected = whatsappService.disconnectClient(sanitizedSessionId);
            
            if (disconnected) {
                res.json({
                    success: true,
                    message: 'Session disconnected successfully',
                    sessionId: sanitizedSessionId
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to disconnect session'
                });
            }

        } catch (error) {
            console.error('Error disconnecting session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to disconnect session',
                message: error.message
            });
        }
    }

    // Get all active sessions
    async getAllSessions(req, res) {
        try {
            const sessions = whatsappService.getAllSessions();
            
            res.json({
                success: true,
                count: sessions.length,
                sessions: sessions.map(session => ({
                    sessionId: session.id,
                    status: session.status,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity,
                    metadata: session.metadata,
                    isExpired: session.isExpired ? session.isExpired() : false
                }))
            });

        } catch (error) {
            console.error('Error getting all sessions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get sessions',
                message: error.message
            });
        }
    }

    // Clean up expired sessions
    async cleanupSessions(req, res) {
        try {
            const beforeCount = this.sessions.size;
            whatsappService.cleanupSessions();
            const afterCount = this.sessions.size;
            const cleanedCount = beforeCount - afterCount;

            res.json({
                success: true,
                message: `Cleaned up ${cleanedCount} expired sessions`,
                before: beforeCount,
                after: afterCount,
                cleaned: cleanedCount
            });

        } catch (error) {
            console.error('Error cleaning up sessions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clean up sessions',
                message: error.message
            });
        }
    }

    // Get session statistics
    async getSessionStats(req, res) {
        try {
            const sessions = whatsappService.getAllSessions();
            
            const stats = {
                total: sessions.length,
                byStatus: {
                    READY: sessions.filter(s => s.status === 'READY').length,
                    AUTHENTICATED: sessions.filter(s => s.status === 'AUTHENTICATED').length,
                    QR_READY: sessions.filter(s => s.status === 'QR_READY').length,
                    INITIALIZING: sessions.filter(s => s.status === 'INITIALIZING').length,
                    DISCONNECTED: sessions.filter(s => s.status === 'DISCONNECTED').length
                },
                expired: sessions.filter(s => s.isExpired && s.isExpired()).length,
                active: sessions.filter(s => s.status === 'READY' || s.status === 'AUTHENTICATED').length
            };

            res.json({
                success: true,
                stats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting session stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get session statistics',
                message: error.message
            });
        }
    }

    // Send test message through a session
    async sendTestMessage(req, res) {
        try {
            const { sessionId } = req.params;
            const { to, message } = req.body;
            const sanitizedSessionId = sanitizeInput(sessionId);

            if (!this.sessions.has(sanitizedSessionId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            const session = this.sessions.get(sanitizedSessionId);
            
            if (session.status !== 'READY') {
                return res.status(400).json({
                    success: false,
                    error: 'Session is not ready',
                    status: session.status
                });
            }

            const client = whatsappService.getClient(sanitizedSessionId);
            
            if (!client) {
                return res.status(500).json({
                    success: false,
                    error: 'Client not available'
                });
            }

            // Validate recipient format (could be phone number or group ID)
            if (!to || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Recipient and message are required'
                });
            }

            // Send message
            await client.sendMessage(to, message);

            res.json({
                success: true,
                message: 'Test message sent successfully',
                sessionId: sanitizedSessionId,
                to: to,
                message: message
            });

        } catch (error) {
            console.error('Error sending test message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send test message',
                message: error.message
            });
        }
    }

    // Get session logs
    async getSessionLogs(req, res) {
        try {
            const { sessionId } = req.params;
            const sanitizedSessionId = sanitizeInput(sessionId);
            const { limit = 50 } = req.query;

            if (!this.sessions.has(sanitizedSessionId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            // In a real implementation, you would fetch logs from a logging system
            // For now, we'll return mock log data
            const logs = this.generateMockLogs(sanitizedSessionId, parseInt(limit));

            res.json({
                success: true,
                sessionId: sanitizedSessionId,
                logs: logs,
                count: logs.length
            });

        } catch (error) {
            console.error('Error getting session logs:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get session logs',
                message: error.message
            });
        }
    }

    // Helper method to generate mock logs
    generateMockLogs(sessionId, limit) {
        const logLevels = ['INFO', 'DEBUG', 'WARN', 'ERROR'];
        const activities = [
            'Session initialized',
            'QR code generated',
            'Authentication successful',
            'Message received',
            'Message sent',
            'Plugin executed',
            'Connection established',
            'Session disconnected'
        ];

        const logs = [];
        for (let i = 0; i < limit; i++) {
            logs.push({
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                level: logLevels[Math.floor(Math.random() * logLevels.length)],
                activity: activities[Math.floor(Math.random() * activities.length)],
                message: `Session activity for ${sessionId}`,
                sessionId: sessionId
            });
        }

        // Sort by timestamp descending
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

module.exports = new SessionController();
