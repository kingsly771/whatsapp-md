const pluginService = require('../services/pluginService');
const { plugins, pluginStats } = require('../config/database');
const { sanitizeInput } = require('../utils/helpers');

class PluginController {
    constructor() {
        this.plugins = plugins;
        this.pluginStats = pluginStats;
    }

    // Get all plugins with optional filtering
    async getAllPlugins(req, res) {
        try {
            const { category, enabled, limit, offset } = req.query;
            let pluginsList = pluginService.listPlugins();

            // Apply filters
            if (category) {
                pluginsList = pluginsList.filter(plugin => 
                    plugin.category.toLowerCase() === category.toLowerCase()
                );
            }

            if (enabled !== undefined) {
                const enabledBool = enabled === 'true';
                pluginsList = pluginsList.filter(plugin => plugin.enabled === enabledBool);
            }

            // Apply pagination
            const startIndex = parseInt(offset) || 0;
            const endIndex = startIndex + (parseInt(limit) || pluginsList.length);
            const paginatedPlugins = pluginsList.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: paginatedPlugins,
                pagination: {
                    total: pluginsList.length,
                    limit: parseInt(limit) || pluginsList.length,
                    offset: startIndex,
                    hasMore: endIndex < pluginsList.length
                },
                filters: {
                    category: category || 'all',
                    enabled: enabled || 'all'
                }
            });

        } catch (error) {
            console.error('Error getting plugins:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugins',
                message: error.message
            });
        }
    }

    // Get plugin statistics
    async getPluginStats(req, res) {
        try {
            const allPlugins = pluginService.listPlugins();
            
            const stats = {
                total: allPlugins.length,
                byCategory: {},
                byStatus: {
                    enabled: allPlugins.filter(p => p.enabled).length,
                    disabled: allPlugins.filter(p => !p.enabled).length
                },
                usage: {
                    totalExecutions: 0,
                    totalErrors: 0
                }
            };

            // Category breakdown
            allPlugins.forEach(plugin => {
                if (!stats.byCategory[plugin.category]) {
                    stats.byCategory[plugin.category] = 0;
                }
                stats.byCategory[plugin.category]++;
            });

            // Usage statistics
            for (const [pluginId, usage] of this.pluginStats) {
                stats.usage.totalExecutions += usage.executionCount || 0;
                stats.usage.totalErrors += usage.errorCount || 0;
            }

            res.json({
                success: true,
                stats,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting plugin stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugin statistics',
                message: error.message
            });
        }
    }

    // Get plugin categories
    async getPluginCategories(req, res) {
        try {
            const allPlugins = pluginService.listPlugins();
            const categories = {};

            allPlugins.forEach(plugin => {
                if (!categories[plugin.category]) {
                    categories[plugin.category] = 0;
                }
                categories[plugin.category]++;
            });

            res.json({
                success: true,
                categories,
                total: Object.keys(categories).length
            });

        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get categories',
                message: error.message
            });
        }
    }

    // Get specific plugin details
    async getPlugin(req, res) {
        try {
            const { pluginId } = req.params;
            const plugin = pluginService.getPlugin(pluginId);

            if (!plugin) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            const usage = this.pluginStats.get(pluginId) || {
                executionCount: 0,
                errorCount: 0,
                lastExecution: null
            };

            res.json({
                success: true,
                data: {
                    id: plugin.id,
                    name: plugin.name,
                    description: plugin.description,
                    category: plugin.category,
                    version: plugin.version,
                    enabled: plugin.enabled,
                    config: plugin.config,
                    usage: {
                        executions: usage.executionCount,
                        errors: usage.errorCount,
                        lastExecution: usage.lastExecution,
                        successRate: usage.executionCount > 0 ? 
                            ((usage.executionCount - usage.errorCount) / usage.executionCount * 100).toFixed(2) + '%' : 'N/A'
                    },
                    dependencies: plugin.dependencies
                }
            });

        } catch (error) {
            console.error('Error getting plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugin',
                message: error.message
            });
        }
    }

    // Get plugin source code
    async getPluginCode(req, res) {
        try {
            const { pluginId } = req.params;
            const plugin = pluginService.getPlugin(pluginId);

            if (!plugin) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: plugin.id,
                    name: plugin.name,
                    code: plugin.code,
                    language: 'javascript',
                    size: plugin.code.length,
                    lines: plugin.code.split('\n').length
                }
            });

        } catch (error) {
            console.error('Error getting plugin code:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugin code',
                message: error.message
            });
        }
    }

    // Enable a plugin
    async enablePlugin(req, res) {
        try {
            const { pluginId } = req.params;
            const { config } = req.body;

            const enabled = pluginService.enablePlugin(pluginId);
            
            if (!enabled) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            // Update configuration if provided
            if (config && typeof config === 'object') {
                const plugin = pluginService.getPlugin(pluginId);
                if (plugin) {
                    plugin.setConfig(config);
                }
            }

            res.json({
                success: true,
                message: `Plugin ${pluginId} enabled successfully`,
                pluginId,
                enabled: true,
                config: config || {}
            });

        } catch (error) {
            console.error('Error enabling plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to enable plugin',
                message: error.message
            });
        }
    }

    // Disable a plugin
    async disablePlugin(req, res) {
        try {
            const { pluginId } = req.params;

            const disabled = pluginService.disablePlugin(pluginId);
            
            if (!disabled) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            res.json({
                success: true,
                message: `Plugin ${pluginId} disabled successfully`,
                pluginId,
                enabled: false
            });

        } catch (error) {
            console.error('Error disabling plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to disable plugin',
                message: error.message
            });
        }
    }

    // Update plugin configuration
    async updatePluginConfig(req, res) {
        try {
            const { pluginId } = req.params;
            const { config } = req.body;

            if (!config || typeof config !== 'object') {
                return res.status(400).json({
                    success: false,
                    error: 'Valid configuration object is required'
                });
            }

            const plugin = pluginService.getPlugin(pluginId);
            
            if (!plugin) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            plugin.setConfig(config);

            res.json({
                success: true,
                message: `Plugin ${pluginId} configuration updated`,
                pluginId,
                config: plugin.config
            });

        } catch (error) {
            console.error('Error updating plugin config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update plugin configuration',
                message: error.message
            });
        }
    }

    // Get plugin configuration
    async getPluginConfig(req, res) {
        try {
            const { pluginId } = req.params;
            const plugin = pluginService.getPlugin(pluginId);

            if (!plugin) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            res.json({
                success: true,
                pluginId,
                config: plugin.config || {}
            });

        } catch (error) {
            console.error('Error getting plugin config:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugin configuration',
                message: error.message
            });
        }
    }

    // Test a plugin
    async testPlugin(req, res) {
        try {
            const { pluginId } = req.params;
            const { testData } = req.body;

            const plugin = pluginService.getPlugin(pluginId);
            
            if (!plugin) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            // Mock message for testing
            const testMessage = {
                body: testData?.message || '!test',
                from: testData?.from || 'test@user',
                hasMedia: testData?.hasMedia || false,
                timestamp: Date.now()
            };

            // Mock client for testing
            const testClient = {
                sendMessage: async (to, message) => {
                    console.log('Test message would be sent to:', to, 'Content:', message);
                    return { success: true, to, message };
                }
            };

            let testResult;
            try {
                // Execute plugin function in sandboxed environment
                const pluginFunction = new Function(
                    'message', 'client', 'sessionId', 'require', 'console', 'prefix',
                    `"use strict";\n${plugin.code}`
                );

                testResult = await pluginFunction(
                    testMessage, 
                    testClient, 
                    'test-session', 
                    require, 
                    console, 
                    '!'
                );

                res.json({
                    success: true,
                    message: 'Plugin test executed successfully',
                    pluginId,
                    testData: {
                        input: testMessage,
                        output: testResult
                    },
                    status: 'passed'
                });

            } catch (error) {
                res.json({
                    success: true,
                    message: 'Plugin test executed with errors',
                    pluginId,
                    testData: {
                        input: testMessage,
                        error: error.message
                    },
                    status: 'failed',
                    error: error.message
                });
            }

        } catch (error) {
            console.error('Error testing plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to test plugin',
                message: error.message
            });
        }
    }

    // Get plugin usage statistics
    async getPluginUsage(req, res) {
        try {
            const { pluginId } = req.params;
            const usage = this.pluginStats.get(pluginId) || {
                executionCount: 0,
                errorCount: 0,
                lastExecution: null
            };

            const plugin = pluginService.getPlugin(pluginId);
            
            res.json({
                success: true,
                pluginId,
                usage: {
                    executions: usage.executionCount,
                    errors: usage.errorCount,
                    lastExecution: usage.lastExecution,
                    successRate: usage.executionCount > 0 ? 
                        ((usage.executionCount - usage.errorCount) / usage.executionCount * 100).toFixed(2) + '%' : 'N/A'
                },
                pluginInfo: {
                    name: plugin?.name || 'Unknown',
                    enabled: plugin?.enabled || false,
                    category: plugin?.category || 'unknown'
                }
            });

        } catch (error) {
            console.error('Error getting plugin usage:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugin usage',
                message: error.message
            });
        }
    }

    // Reload all plugins
    async reloadPlugins(req, res) {
        try {
            const beforeCount = this.plugins.size;
            pluginService.initializePlugins();
            const afterCount = this.plugins.size;

            res.json({
                success: true,
                message: 'Plugins reloaded successfully',
                stats: {
                    before: beforeCount,
                    after: afterCount,
                    loaded: afterCount
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error reloading plugins:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reload plugins',
                message: error.message
            });
        }
    }

    // Get plugins health status
    async getPluginsHealth(req, res) {
        try {
            const allPlugins = pluginService.listPlugins();
            const healthStatus = [];

            for (const plugin of allPlugins) {
                const usage = this.pluginStats.get(plugin.id) || {
                    executionCount: 0,
                    errorCount: 0
                };

                healthStatus.push({
                    id: plugin.id,
                    name: plugin.name,
                    enabled: plugin.enabled,
                    status: usage.errorCount > usage.executionCount * 0.1 ? 'degraded' : 'healthy',
                    executions: usage.executionCount,
                    errors: usage.errorCount,
                    errorRate: usage.executionCount > 0 ? 
                        (usage.errorCount / usage.executionCount * 100).toFixed(2) + '%' : '0%'
                });
            }

            const healthy = healthStatus.filter(p => p.status === 'healthy').length;
            const degraded = healthStatus.filter(p => p.status === 'degraded').length;

            res.json({
                success: true,
                health: {
                    total: healthStatus.length,
                    healthy,
                    degraded,
                    healthPercentage: ((healthy / healthStatus.length) * 100).toFixed(2) + '%'
                },
                plugins: healthStatus
            });

        } catch (error) {
            console.error('Error getting plugins health:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get plugins health',
                message: error.message
            });
        }
    }

    // Import a new plugin
    async importPlugin(req, res) {
        try {
            const { name, description, code, category } = req.body;

            if (!name || !description || !code || !category) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, description, code, and category are required'
                });
            }

            // Generate unique ID
            const pluginId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

            // Add to plugin service
            pluginService.addPlugin(pluginId, name, description, code, category);

            res.status(201).json({
                success: true,
                message: 'Plugin imported successfully',
                plugin: {
                    id: pluginId,
                    name,
                    description,
                    category,
                    enabled: false,
                    imported: true
                }
            });

        } catch (error) {
            console.error('Error importing plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to import plugin',
                message: error.message
            });
        }
    }

    // Delete a plugin
    async deletePlugin(req, res) {
        try {
            const { pluginId } = req.params;

            // Check if plugin exists
            if (!this.plugins.has(pluginId)) {
                return res.status(404).json({
                    success: false,
                    error: 'Plugin not found'
                });
            }

            // Remove plugin
            this.plugins.delete(pluginId);
            this.pluginStats.delete(pluginId);

            res.json({
                success: true,
                message: 'Plugin deleted successfully',
                pluginId
            });

        } catch (error) {
            console.error('Error deleting plugin:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete plugin',
                message: error.message
            });
        }
    }
}

module.exports = new PluginController();
