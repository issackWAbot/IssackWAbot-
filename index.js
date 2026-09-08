import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import express from 'express';

const app = express();
app.get('/', (req, res) => res.send('IssackWA Bot Running!'));
app.listen(process.env.PORT || 10000, () => console.log('Server running'));

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
            } catch(e){ console.log(e) }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close'){
            if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
                startBot();
            }
        } else if(connection === 'open'){
            console.log('Bot Connected!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if(!msg.message) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if(text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello'){
            await sock.sendMessage(msg.key.remoteJid, { text: 'Hello! Issack Bot Online ta e 🤖' });
        }
        if(text.toLowerCase() === 'ping'){
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! 🏓' });
        }
    });
}
startBot();}
startBot();
