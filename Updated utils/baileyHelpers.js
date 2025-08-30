const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

class BaileyHelpers {
    static async downloadMedia(message) {
        try {
            if (message.hasMedia) {
                const stream = await downloadContentFromMessage(message, 'image');
                const buffer = await this.streamToBuffer(stream);
                return {
                    data: buffer.toString('base64'),
                    mimetype: message.mimetype,
                    filename: message.filename
                };
            }
            return null;
        } catch (error) {
            console.error('Error downloading media:', error);
            return null;
        }
    }

    static async streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

    static async sendButtonMessage(client, chatId, text, buttons) {
        return await client.sendMessage(chatId, {
            text: text,
            footer: 'WhatsApp Bot',
            buttons: buttons,
            headerType: 1
        });
    }

    static async sendListMessage(client, chatId, text, sections, buttonText = 'Select Option') {
        return await client.sendMessage(chatId, {
            text: text,
            footer: 'WhatsApp Bot',
            title: 'Options',
            buttonText: buttonText,
            sections: sections
        });
    }
}

module.exports = BaileyHelpers;
