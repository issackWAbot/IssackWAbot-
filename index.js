const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Issack Bot Running!'));
app.listen(PORT, () => console.log('Web server running on', PORT));

async function startBot() {
    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = await import('@whiskeysockets/baileys');
    const pino = require('pino');
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode("919863955589");
                console.log("=== PAIRING CODE: " + code + " ===");
            } catch (e) {
                console.log("Pairing error:", e.message);
            }
        }, 8000);
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        console.log("Connection:", connection);
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot Connected Successfully!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message) return;
            const from = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            console.log("Message:", text);
            if (text.toLowerCase() === 'hi') {
                await sock.sendMessage(from, { text: 'Hi! Issack Bot Online ta e 🤖' });
            }
        } catch(e){ console.log(e) }
    });
}
startBot();
