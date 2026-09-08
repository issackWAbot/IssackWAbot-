const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const pino = require('pino')

const app = express()
app.get('/', (req,res)=> res.send('IssackWA-Bot Alive!'))
app.listen(8000, ()=> console.log('Alive on 8000'))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) })
  sock.ev.on('creds.update', saveCreds)

  if(!sock.authState.creds.registered){
    setTimeout(async ()=>{
      let code = await sock.requestPairingCode('919863955589')
      console.log('PAIR CODE:', code)
    }, 3000)
  }

  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!= 401) startBot()
  })

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]; if(!m.message) return
    const from = m.key.remoteJid
    const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
    if(text === '.ping') await sock.sendMessage(from, {text: 'Pong! IssackWA-Bot Alive 24/7 🚀'})
    if(text === '.menu') await sock.sendMessage(from, {text: '╭─ IssackWA-Bot ─\n│.ping\n│.menu\n╰─ Owner: Issack'})
  })
}
startBot()
