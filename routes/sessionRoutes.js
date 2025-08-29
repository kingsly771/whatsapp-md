const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

/**
 * @route   POST /api/sessions
 * @desc    Create a new WhatsApp session
 * @access  Public
 * @body    {sessionId?} - Optional custom session ID
 * @body    {metadata?} - Optional session metadata
 */
router.post('/', sessionController.createSession);

/**
 * @route   GET /api/sessions
 * @desc    Get all active sessions
 * @access  Public
 * @query   {status?} - Filter by status (READY, AUTHENTICATED, QR_READY, etc.)
 * @query   {limit?} - Limit number of results
 * @query   {offset?} - Pagination offset
 */
router.get('/', sessionController.getAllSessions);

/**
 * @route   GET /api/sessions/stats
 * @desc    Get session statistics
 * @access  Public
 */
router.get('/stats', sessionController.getSessionStats);

/**
 * @route   GET /api/sessions/:sessionId
 * @desc    Get session status and information
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.get('/:sessionId', sessionController.getSessionStatus);

/**
 * @route   GET /api/sessions/:sessionId/qr
 * @desc    Get QR code for session authentication
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.get('/:sessionId/qr', sessionController.getSessionQR);

/**
 * @route   GET /api/sessions/:sessionId/logs
 * @desc    Get session logs
 * @access  Public
 * @param   {sessionId} - Session ID
 * @query   {limit?} - Number of log entries to return (default: 50)
 * @query   {level?} - Filter by log level (INFO, DEBUG, WARN, ERROR)
 */
router.get('/:sessionId/logs', sessionController.getSessionLogs);

/**
 * @route   DELETE /api/sessions/:sessionId
 * @desc    Disconnect and remove a session
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.delete('/:sessionId', sessionController.disconnectSession);

/**
 * @route   POST /api/sessions/cleanup
 * @desc    Clean up expired sessions
 * @access  Public
 */
router.post('/cleanup', sessionController.cleanupSessions);

/**
 * @route   POST /api/sessions/:sessionId/test-message
 * @desc    Send a test message through a session
 * @access  Public
 * @param   {sessionId} - Session ID
 * @body    {to} - Recipient (phone number or group ID)
 * @body    {message} - Message content
 */
router.post('/:sessionId/test-message', sessionController.sendTestMessage);

/**
 * @route   GET /api/sessions/:sessionId/health
 * @desc    Get session health status
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.get('/:sessionId/health', (req, res) => {
    const { sessionId } = req.params;
    res.json({
        success: true,
        sessionId,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * @route   POST /api/sessions/:sessionId/restart
 * @desc    Restart a session
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.post('/:sessionId/restart', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionController = require('../controllers/sessionController');
        
        // First disconnect the session
        await sessionController.disconnectSession(req, res);
        
        if (res.statusCode === 200) {
            // Then create a new session with the same ID
            req.body = { sessionId };
            await sessionController.createSession(req, {
                ...res,
                status: (code) => ({ json: (data) => {
                    if (code === 201) {
                        res.json({
                            success: true,
                            message: 'Session restarted successfully',
                            sessionId,
                            restarted: true
                        });
                    }
                }})
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to restart session',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/sessions/:sessionId/metadata
 * @desc    Get session metadata
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.get('/:sessionId/metadata', (req, res) => {
    const { sessions } = require('../config/database');
    const { sessionId } = req.params;
    const { sanitizeInput } = require('../utils/helpers');
    
    const sanitizedSessionId = sanitizeInput(sessionId);
    
    if (!sessions.has(sanitizedSessionId)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
    
    const session = sessions.get(sanitizedSessionId);
    res.json({
        success: true,
        sessionId: sanitizedSessionId,
        metadata: session.metadata || {},
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
    });
});

/**
 * @route   PUT /api/sessions/:sessionId/metadata
 * @desc    Update session metadata
 * @access  Public
 * @param   {sessionId} - Session ID
 * @body    {metadata} - Metadata to update
 */
router.put('/:sessionId/metadata', (req, res) => {
    const { sessions } = require('../config/database');
    const { sessionId } = req.params;
    const { metadata } = req.body;
    const { sanitizeInput } = require('../utils/helpers');
    
    const sanitizedSessionId = sanitizeInput(sessionId);
    
    if (!sessions.has(sanitizedSessionId)) {
        return res.status(404).json({
            success: false,
            error: 'Session not found'
        });
    }
    
    if (!metadata || typeof metadata !== 'object') {
        return res.status(400).json({
            success: false,
            error: 'Valid metadata object is required'
        });
    }
    
    const session = sessions.get(sanitizedSessionId);
    session.updateMetadata(metadata);
    
    res.json({
        success: true,
        message: 'Metadata updated successfully',
        sessionId: sanitizedSessionId,
        metadata: session.metadata
    });
});

/**
 * @route   GET /api/sessions/:sessionId/clients
 * @desc    Get client information for a session
 * @access  Public
 * @param   {sessionId} - Session ID
 */
router.get('/:sessionId/clients', (req, res) => {
    const whatsappService = require('../services/whatsappService');
    const { sessionId } = req.params;
    const { sanitizeInput } = require('../utils/helpers');
    
    const sanitizedSessionId = sanitizeInput(sessionId);
    const client = whatsappService.getClient(sanitizedSessionId);
    
    if (!client) {
        return res.status(404).json({
            success: false,
            error: 'Client not found for session'
        });
    }
    
    res.json({
        success: true,
        sessionId: sanitizedSessionId,
        clientInfo: {
            isConnected: client.info ? true : false,
            userAgent: client.info?.pushname || null,
            platform: client.info?.platform || null,
            connectedNumber: client.info?.wid?.user || null,
            wid: client.info?.wid || null
        }
    });
});

/**
 * @route   GET /api/sessions/info/prefix
 * @desc    Get bot prefix information
 * @access  Public
 */
router.get('/info/prefix', (req, res) => {
    const config = require('../config/config');
    res.json({
        success: true,
        prefix: config.bot.prefix,
        adminPrefix: config.bot.adminPrefix,
        maxCommandLength: config.bot.maxCommandLength,
        cooldown: config.bot.cooldown
    });
});

/**
 * @route   GET /api/sessions/info/version
 * @desc    Get bot version information
 * @access  Public
 */
router.get('/info/version', (req, res) => {
    const packageJson = require('../../package.json');
    res.json({
        success: true,
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
    });
});

// Error handling middleware for session routes
router.use((err, req, res, next) => {
    console.error('Session route error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler for invalid session routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Session endpoint not found',
        availableEndpoints: [
            'POST   /api/sessions',
            'GET    /api/sessions',
            'GET    /api/sessions/stats',
            'GET    /api/sessions/:sessionId',
            'GET    /api/sessions/:sessionId/qr',
            'GET    /api/sessions/:sessionId/logs',
            'DELETE /api/sessions/:sessionId',
            'POST   /api/sessions/cleanup',
            'POST   /api/sessions/:sessionId/test-message',
            'GET    /api/sessions/:sessionId/health',
            'POST   /api/sessions/:sessionId/restart',
            'GET    /api/sessions/:sessionId/metadata',
            'PUT    /api/sessions/:sessionId/metadata',
            'GET    /api/sessions/:sessionId/clients',
            'GET    /api/sessions/info/prefix',
            'GET    /api/sessions/info/version'
        ]
    });
});

module.exports = router;
