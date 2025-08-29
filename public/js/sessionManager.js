// Session management functions
async function createSession() {
    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: `session_${Date.now()}`
            })
        });

        if (response.ok) {
            const data = await response.json();
            window.botApp.showNotification('Session created successfully');
            window.botApp.updateStatus(data.status, data.sessionId);
            
            // Get QR code
            setTimeout(() => checkStatus(), 2000);
        } else {
            window.botApp.showNotification('Failed to create session', 'error');
        }
    } catch (error) {
        console.error('Error creating session:', error);
        window.botApp.showNotification('Error creating session', 'error');
    }
}

async function checkStatus() {
    if (!window.botApp.currentSessionId) {
        window.botApp.showNotification('No active session', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/sessions/${window.botApp.currentSessionId}/status`);
        if (response.ok) {
            const data = await response.json();
            window.botApp.updateStatus(data.status);
            
            if (data.status === 'QR_READY') {
                // Get QR code
                const qrResponse = await fetch(`/api/sessions/${window.botApp.currentSessionId}/qr`);
                if (qrResponse.ok) {
                    const qrData = await qrResponse.json();
                    window.botApp.displayQRCode(qrData.qr);
                }
            }
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

async function disconnectSession() {
    if (!window.botApp.currentSessionId) {
        window.botApp.showNotification('No active session to disconnect', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/sessions/${window.botApp.currentSessionId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.botApp.showNotification('Session disconnected');
            window.botApp.updateStatus('DISCONNECTED');
            document.getElementById('qrcode').innerHTML = 'QR Code will appear here';
        } else {
            window.botApp.showNotification('Failed to disconnect session', 'error');
        }
    } catch (error) {
        console.error('Error disconnecting session:', error);
        window.botApp.showNotification('Error disconnecting session', 'error');
    }
}
