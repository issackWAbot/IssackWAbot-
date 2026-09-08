const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('IssackWA Bot Running!'));
app.listen(process.env.PORT || 10000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        const number = "919863955589";
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(number);
                console.log(`PAIRING CODE: ${code}`);
            } catch(e){ console.log("Error getting code:", e) }
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close'){
            if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
                startBot();
            }
        } else if(connection === 'open'){
            console.log('Connected!');
        }
    });
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if(!msg.message) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if(text.toLowerCase() === 'hi'){
            await sock.sendMessage(msg.key.remoteJid, { text: 'Hi! Bot Online e 🤖' });
        }
    });
}
startBot();
