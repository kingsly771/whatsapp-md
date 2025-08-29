// Plugin management functions
async function loadPlugins() {
    try {
        const response = await fetch('/api/plugins');
        if (response.ok) {
            const plugins = await response.json();
            displayPlugins(plugins);
            document.getElementById('pluginCount').textContent = plugins.length;
        }
    } catch (error) {
        console.error('Error loading plugins:', error);
    }
}

function displayPlugins(plugins) {
    const container = document.getElementById('pluginsContainer');
    container.innerHTML = '';

    plugins.forEach(plugin => {
        const pluginCard = document.createElement('div');
        pluginCard.className = 'plugin-card';
        pluginCard.dataset.category = plugin.category;
        pluginCard.dataset.enabled = plugin.enabled;

        pluginCard.innerHTML = `
            <div class="plugin-header">
                <div class="plugin-name">${plugin.name}</div>
                <span class="plugin-category">${plugin.category}</span>
            </div>
            <div class="plugin-description">${plugin.description}</div>
            <div class="plugin-actions">
                <button class="toggle-btn ${plugin.enabled ? 'enabled' : 'disabled'}" 
                        onclick="togglePlugin('${plugin.id}', ${!plugin.enabled})">
                    ${plugin.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn" onclick="viewPluginCode('${plugin.id}')">
                    View Code
                </button>
            </div>
        `;

        container.appendChild(pluginCard);
    });
}

async function togglePlugin(pluginId, enable) {
    try {
        const endpoint = enable ? 'enable' : 'disable';
        const response = await fetch(`/api/plugins/${pluginId}/${endpoint}`, {
            method: 'POST'
        });

        if (response.ok) {
            window.botApp.showNotification(`Plugin ${enable ? 'enabled' : 'disabled'} successfully`);
            loadPlugins(); // Reload plugins to update UI
        } else {
            window.botApp.showNotification('Failed to toggle plugin', 'error');
        }
    } catch (error) {
        console.error('Error toggling plugin:', error);
        window.botApp.showNotification('Error toggling plugin', 'error');
    }
}

async function viewPluginCode(pluginId) {
    try {
        const response = await fetch(`/api/plugins/${pluginId}/code`);
        if (response.ok) {
            const data = await response.json();
            // Show code in a modal or alert (simplified)
            alert(`Plugin Code:\n\n${data.code}`);
        }
    } catch (error) {
        console.error('Error fetching plugin code:', error);
    }
}

// Load plugins when page loads
document.addEventListener('DOMContentLoaded', loadPlugins);
