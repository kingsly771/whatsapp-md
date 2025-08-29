// Main application script
class WhatsAppBotFrontend {
    constructor() {
        this.socket = io();
        this.currentSessionId = null;
        this.botConfig = {
            prefix: '!',
            adminPrefix: '!!'
        };
        
        this.init();
    }

    init() {
        this.setupSocketListeners();
        this.setupEventListeners();
        this.loadBotConfig();
        this.loadPlugins();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.showNotification('Connected to server');
        });

        this.socket.on('disconnect', () => {
            this.showNotification('Disconnected from server', 'error');
        });

        this.socket.on('bot-config', (config) => {
            this.botConfig = config;
            this.updatePrefixDisplay();
        });

        this.socket.on('qrCode', (data) => {
            this.displayQRCode(data.qr);
        });

        this.socket.on('statusUpdate', (data) => {
            this.updateStatus(data.status, data.sessionId);
        });
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterPlugins(filter);
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    async loadBotConfig() {
        try {
            const response = await fetch('/api/bot/info');
            if (response.ok) {
                this.botConfig = await response.json();
                this.updatePrefixDisplay();
            }
        } catch (error) {
            console.error('Failed to load bot config:', error);
        }
    }

    updatePrefixDisplay() {
        document.getElementById('botPrefix').textContent = this.botConfig.prefix;
        document.getElementById('commandPrefix').textContent = this.botConfig.prefix;
        document.getElementById('adminPrefix').textContent = this.botConfig.adminPrefix;
        document.getElementById('helpPrefix').textContent = this.botConfig.prefix;
        
        // Update command examples
        const examples = document.querySelectorAll('.command-examples code');
        examples.forEach(code => {
            code.textContent = code.textContent.replace(/^\!/, this.botConfig.prefix);
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        
        messageEl.textContent = message;
        notification.className = `notification ${type}`;
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    displayQRCode(qrData) {
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = `<img src="${qrData}" alt="QR Code" style="max-width: 100%; height: auto;">`;
    }

    updateStatus(status, sessionId = null) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        const sessionIdDisplay = document.getElementById('sessionIdDisplay');
        
        statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        if (sessionId) {
            this.currentSessionId = sessionId;
            sessionIdDisplay.textContent = `Session ID: ${sessionId}`;
        }
        
        // Update status dot color
        statusDot.style.background = status === 'READY' ? '#25d366' : 
                                   status === 'AUTHENTICATED' ? '#ffa500' : '#ff4d4d';
    }

    filterPlugins(filter) {
        const plugins = document.querySelectorAll('.plugin-card');
        plugins.forEach(plugin => {
            const category = plugin.dataset.category;
            const isEnabled = plugin.dataset.enabled === 'true';
            
            let show = false;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'general':
                    show = category === 'general';
                    break;
                case 'otaku':
                    show = category === 'otaku';
                    break;
                case 'enabled':
                    show = isEnabled;
                    break;
                case 'disabled':
                    show = !isEnabled;
                    break;
                default:
                    show = true;
            }
            
            plugin.style.display = show ? 'block' : 'none';
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.botApp = new WhatsAppBotFrontend();
});
