const express = require('express');
const app = express();
app.get('/', (req,res)=>res.send('IssackWA-Bot Live 🔥'));
app.listen(process.env.PORT||10000, ()=>console.log('Web Live'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const config = require('./config');

let mode = 'public';

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    logger: pino({level:'silent'}),
    auth: state,
    browser: ["IssackWA","Chrome","1.0"]
  });

  if(!sock.authState.creds.registered){
    setTimeout(async()=>{
      try{
        const num = config.ownerNumber.replace(/[^0-9]/g,'');
        const code = await sock.requestPairingCode(num);
        console.log('PAIRING CODE:', code);
      }catch(e){ console.log(e.message); }
    },5000);
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut){
      console.log('Tlu, 5sec hnuah lut leh ang');
      setTimeout(startBot, 5000);
    }
    if(u.connection==='open') console.log('✅ Connected - Mode:', mode);
  });

  sock.ev.on('messages.upsert', async({messages})=>{
    try{
      const msg = messages[0];
      if(!msg.message || msg.key.fromMe) return;
      const from = msg.key.remoteJid;
      const sender = msg.key.participant || from;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      const isOwner = sender.includes(config.ownerNumber);

      if(mode==='self' &&!isOwner) return;
      if(!text.startsWith(config.prefix)) return;

      const cmd = text.slice(1).trim().split(/ +/)[0].toLowerCase();

      if(cmd==='self' && isOwner){ mode='self'; return sock.sendMessage(from,{text:'✅ Self Mode'}); }
      if(cmd==='public' && isOwner){ mode='public'; return sock.sendMessage(from,{text:'✅ Public Mode'}); }

      if(cmd==='menu'){
        return sock.sendMessage(from,{text:`╭─ *${config.botName}* ─
│ Owner: ${config.ownerName}
│ Mode: ${mode}
╰───────────────
A bulpui a Live e! Folder ami command te a la load ang.`});
      }

      // Hetah hian i folder ami command te a auto load ang
      // Ex:./commands/quiz.js,./commands/games.js etc.

    }catch(e){ console.log(e); }
  });
}
startBot();
