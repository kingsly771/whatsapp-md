const baileyService = require('../services/baileyService');
const { sessions } = require('../config/database');
const { validateSessionId, generateSessionId, sanitizeInput } = require('../utils/helpers');

class SessionController {
    constructor() {
        this.sessions = sessions;
    }

    async createSession(req, res) {
        try {
            const { sessionId, metadata } = req.body;
            
            // Validate or generate session ID
            let finalSessionId;
            if (sessionId) {
                if (!validateSessionId(sessionId)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid session ID format'
                    });
                }
                finalSessionId = sanitizeInput(sessionId);
            } else {
                finalSessionId = generateSessionId();
            }

            // Check if session already exists
            if (this.sessions.has(finalSessionId)) {
                const existingSession = this.sessions.get(finalSessionId);
                return res.status(409).json({
                    success: false,
                    error: 'Session already exists',
                    sessionId: finalSessionId,
                    status: existingSession.status
                });
            }

            const io = req.app.get('io');
            const session = await baileyService.initializeClient(finalSessionId, io);

            // Add metadata if provided
            if (metadata && typeof metadata === 'object') {
                session.updateMetadata(metadata);
            }

            res.status(201).json({
                success: true,
                message: 'Session created successfully',
                sessionId: finalSessionId,
                status: session.status,
                qrCode: session.qrCode ? 'Available' : 'Pending'
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

    // ... (keep other methods similar but update whatsappService to baileyService)
}

module.exports = new SessionController();
