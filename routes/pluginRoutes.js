const express = require('express');
const pluginController = require('../controllers/pluginController');
const { validatePluginId, validateEnableDisable } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/plugins
 * @desc    Get all plugins with their status
 * @access  Public
 * @query   {category?} - Filter by category (general, otaku)
 * @query   {enabled?} - Filter by enabled status (true/false)
 * @query   {limit?} - Number of plugins to return
 * @query   {offset?} - Pagination offset
 * @returns {Array} List of plugins with metadata
 */
router.get('/', pluginController.getAllPlugins);

/**
 * @route   GET /api/plugins/stats
 * @desc    Get plugin statistics and usage data
 * @access  Public
 * @returns {Object} Plugin statistics
 */
router.get('/stats', pluginController.getPluginStats);

/**
 * @route   GET /api/plugins/categories
 * @desc    Get list of all plugin categories
 * @access  Public
 * @returns {Array} List of categories
 */
router.get('/categories', pluginController.getPluginCategories);

/**
 * @route   GET /api/plugins/:pluginId
 * @desc    Get detailed information about a specific plugin
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Plugin details
 */
router.get('/:pluginId', validatePluginId, pluginController.getPlugin);

/**
 * @route   GET /api/plugins/:pluginId/code
 * @desc    Get the source code of a plugin
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Plugin code
 */
router.get('/:pluginId/code', validatePluginId, pluginController.getPluginCode);

/**
 * @route   POST /api/plugins/:pluginId/enable
 * @desc    Enable a plugin
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @body    {config?} - Optional configuration for the plugin
 * @returns {Object} Success message
 */
router.post('/:pluginId/enable', validatePluginId, validateEnableDisable, pluginController.enablePlugin);

/**
 * @route   POST /api/plugins/:pluginId/disable
 * @desc    Disable a plugin
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Success message
 */
router.post('/:pluginId/disable', validatePluginId, validateEnableDisable, pluginController.disablePlugin);

/**
 * @route   PUT /api/plugins/:pluginId/config
 * @desc    Update plugin configuration
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @body    {config} - New configuration object
 * @returns {Object} Updated plugin configuration
 */
router.put('/:pluginId/config', validatePluginId, pluginController.updatePluginConfig);

/**
 * @route   GET /api/plugins/:pluginId/config
 * @desc    Get plugin configuration
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Plugin configuration
 */
router.get('/:pluginId/config', validatePluginId, pluginController.getPluginConfig);

/**
 * @route   POST /api/plugins/:pluginId/test
 * @desc    Test a plugin with sample data
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @body    {testData} - Test data for the plugin
 * @returns {Object} Test results
 */
router.post('/:pluginId/test', validatePluginId, pluginController.testPlugin);

/**
 * @route   GET /api/plugins/:pluginId/usage
 * @desc    Get plugin usage statistics
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Usage statistics
 */
router.get('/:pluginId/usage', validatePluginId, pluginController.getPluginUsage);

/**
 * @route   POST /api/plugins/reload
 * @desc    Reload all plugins from disk
 * @access  Public
 * @returns {Object} Reload status
 */
router.post('/reload', pluginController.reloadPlugins);

/**
 * @route   GET /api/plugins/health
 * @desc    Get plugins health status
 * @access  Public
 * @returns {Object} Health status of all plugins
 */
router.get('/health', pluginController.getPluginsHealth);

/**
 * @route   POST /api/plugins/import
 * @desc    Import a new plugin
 * @access  Public
 * @body    {name} - Plugin name
 * @body    {description} - Plugin description
 * @body    {code} - Plugin code
 * @body    {category} - Plugin category
 * @returns {Object} Imported plugin details
 */
router.post('/import', pluginController.importPlugin);

/**
 * @route   DELETE /api/plugins/:pluginId
 * @desc    Delete a plugin (only for imported plugins)
 * @access  Public
 * @param   {pluginId} - Plugin ID
 * @returns {Object} Deletion status
 */
router.delete('/:pluginId', validatePluginId, pluginController.deletePlugin);

// Error handling middleware for plugin routes
router.use((err, req, res, next) => {
    console.error('Plugin route error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler for invalid plugin routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Plugin endpoint not found',
        availableEndpoints: [
            'GET    /api/plugins',
            'GET    /api/plugins/stats',
            'GET    /api/plugins/categories',
            'GET    /api/plugins/:pluginId',
            'GET    /api/plugins/:pluginId/code',
            'POST   /api/plugins/:pluginId/enable',
            'POST   /api/plugins/:pluginId/disable',
            'PUT    /api/plugins/:pluginId/config',
            'GET    /api/plugins/:pluginId/config',
            'POST   /api/plugins/:pluginId/test',
            'GET    /api/plugins/:pluginId/usage',
            'POST   /api/plugins/reload',
            'GET    /api/plugins/health',
            'POST   /api/plugins/import',
            'DELETE /api/plugins/:pluginId'
        ]
    });
});

module.exports = router;
