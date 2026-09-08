import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('IssackWA Bot Running!'));
app.listen(process.env.PORT || 3000, () => console.log('Server running'));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true
    });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if(qr){ qrcode.generate(qr, { small: true }); }
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
            await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! Issack Bot ka ni e 🤖' });
        }
    });
}
startBot();
