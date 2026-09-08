const express = require('express');
const app = express();
app.get('/', (r,s)=>s.send('IssackWA-Bot Live 🔥 - No Quiz'));
app.listen(process.env.PORT||10000);

const fs = require('fs-extra');
const config = require('./config');
let mode = 'public';
let coins = fs.existsSync('./coins.json')? JSON.parse(fs.readFileSync('./coins.json')) : {};
const saveCoins = ()=>fs.writeFileSync('./coins.json', JSON.stringify(coins));
const getCoin = (id)=> id.includes(config.ownerNumber)? 999999 : (coins[id]?.coin||0);
const cutCoin = (id)=>{ if(id.includes(config.ownerNumber)) return true; if(getCoin(id)<5) return false; coins[id].coin-=5; saveCoins(); return true; };

async function startBot(){
 const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys');
 const pino = require('pino');
 const { state, saveCreds } = await useMultiFileAuthState('auth');
 const sock = makeWASocket({
    logger: pino({level:'silent'}),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) },
    printQRInTerminal:false,
    browser: ["IssackWAbot", "Chrome", "1.0"]
 });

 if(!sock.authState.creds.registered){
   setTimeout(async()=>{
     try{ const c = await sock.requestPairingCode(config.ownerNumber); console.log("PAIRING CODE:", c); }catch(e){ console.log(e.message) }
   },7000);
 }
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{
   if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot();
   if(u.connection==='open') console.log('IssackWA-Bot Connected Mode:',mode);
 });

 sock.ev.on('messages.upsert', async ({messages})=>{
  try{
   const msg = messages[0];
   if(!msg.message || msg.key.fromMe) return;
   const from = msg.key.remoteJid;
   const sender = msg.key.participant || from;
   const isGroup = from.endsWith('@g.us');
   const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
   if(!text.startsWith(config.prefix)) return;
   if(mode==='self' &&!sender.includes(config.ownerNumber)) return;

   const args = text.slice(1).trim().split(/ +/);
   const cmd = args.shift().toLowerCase();

   // COIN CHECK - Free commands
   if(!['menu','claim','buy','gpay','tobe','self','public','myinfo','ping'].includes(cmd)){
     if(getCoin(sender)<5 &&!sender.includes(config.ownerNumber)){
       return sock.sendMessage(from,{text:`❌ Coin bo!.claim hmang rawh. I coin: ${getCoin(sender)}`});
     }
     cutCoin(sender);
   }

   if(cmd==='menu'){
     return sock.sendMessage(from,{text:`╭─ *${config.botName}* ─
│ Owner: ${config.ownerName}
│ Mode: ${mode}
│ Coin: ${getCoin(sender)}
│ Prefix: ${config.prefix}
├───────────────
│ *DOWNLOAD:*
│.song /.video /.status
│ *MEDIA:*
│.setdp.retouch.aitalk
│ *GROUP GAME:*
│ tunge hmelchhe ber / chhelo / cute / phakar / hur
│.myinfo
│ *VIP:*
│ crush ship2 loyalty expose
│ confess secretmsg detective
│ roast simp tunge bankheist
│ stalker nightmode truth18
│ *ECONOMY:*
│.claim.buy.gpay.tobe
│ *AI:*
│.aigf.aibf
╰───────────────
Bot Live ✅`});
   }
   if(cmd==='ping') return sock.sendMessage(from,{text:`Pong! ${config.botName} Live ✅`});
   if(cmd==='self'){ if(!sender.includes(config.ownerNumber)) return; mode='self'; return sock.sendMessage(from,{text:'✅ Self Mode'}); }
   if(cmd==='public'){ if(!sender.includes(config.ownerNumber)) return; mode='public'; return sock.sendMessage(from,{text:'✅ Public Mode'}); }
   if(cmd==='claim'){
     const last = coins[sender]?.last||0;
     if(Date.now()-last<86400000) return sock.sendMessage(from,{text:'⏳ 24hr nghak rawh!'});
     if(!coins[sender]) coins[sender]={coin:0}; coins[sender].coin+=50; coins[sender].last=Date.now(); saveCoins();
     return sock.sendMessage(from,{text:`✅ 50 coin claim! Total: ${coins[sender].coin}`});
   }
   if(cmd==='buy'||cmd==='gpay'){
     return sock.sendMessage(from,{text:`*GPAY BUY*\n250c=60₹ 500c=100₹\n1000c=200₹ 2000c=350₹\n3000c=500₹ Unlimited=1000₹\nNo: ${config.gpayNumber}\n\n*TOBEBOT:* 1day 20₹ 1week 60₹ 1month 150₹ 3month 400₹ Unlimited 1000₹`});
   }
   if(cmd==='song'||cmd==='play'){
     try{
     const yts = require('yt-search'); const ytdl = require('@distube/ytdl-core');
     const query = args.join(' '); if(!query) return sock.sendMessage(from,{text:'Hla hming dah rawh!'});
     await sock.sendMessage(from,{text:`🔍 "${query}" zawng mek...`});
     const s = await yts(query); const v = s.videos[0];
     if(!v) return sock.sendMessage(from,{text:'Hmu lo!'});
     await sock.sendMessage(from,{image:{url:v.thumbnail}, caption:`*${v.title}*\nDownloading...`});
     const stream = ytdl(v.url,{filter:'audioonly', quality:'highestaudio'});
     await sock.sendMessage(from,{audio:{url:v.url}, mimetype:'audio/mpeg'});
     }catch(e){ sock.sendMessage(from,{text:'Error: '+e.message}) }
   }
   if(cmd==='video'){
     try{
     const ytdl = require('@distube/ytdl-core'); const url=args[0];
     const info = await ytdl.getInfo(url); const f = ytdl.chooseFormat(info.formats,{quality:'18'});
     await sock.sendMessage(from,{video:{url:f.url}, caption:info.videoDetails.title});
     }catch(e){ sock.sendMessage(from,{text:'Link dik lo!'}) }
   }
   if(cmd==='setdp'){ return sock.sendMessage(from,{text:'✅.setdp - Thlalak nen.setdp ti la, DP ah ka dah ang!'}); }
   if(cmd==='retouch'){ const type=args[0]||'flash'; return sock.sendMessage(from,{text:`✨ Retouch ${type} - Thlalak nen.retouch ${type} ti rawh!`}); }
   if(cmd==='aitalk'){ return sock.sendMessage(from,{text:`🗣️.aitalk "text" + pic - Thlalak tawng tir!`}); }
   if(cmd==='tunge'){
     if(!isGroup) return;
     const meta = await sock.groupMetadata(from); const members=meta.participants;
     const target=members[Math.floor(Math.random()*members.length)];
     const cat=args.join(' ')||'hmelchhe ber';
     return sock.sendMessage(from,{text:`😂 Tunge ${cat}?\n\n👉 @${target.id.split('@')[0]} a ni e!`, mentions:[target.id]});
   }
   if(cmd==='myinfo'){ return sock.sendMessage(from,{text:`*My Info*\nNumber: @${sender.split('@')[0]}\nCoin: ${getCoin(sender)}\nGroup: ${isGroup?'Yes':'No'}`, mentions:[sender]}); }
   if(['crush','ship2','loyalty','roast','simp','detective','killer','bankheist','stalker','expose'].includes(cmd)){
     return sock.sendMessage(from,{text:`🔥 VIP ${cmd} Result:\n@${sender.split('@')[0]} i ${cmd} chu 85% a ni e!`, mentions:[sender]});
   }
   if(cmd==='confess'){ return sock.sendMessage(from,{text:`🤫 Confess: "${args.join(' ')}" - Anonymous`}); }
   if(cmd==='nightmode'){
     if(args[0]==='on'){ await sock.groupSettingUpdate(from,'announcement'); return sock.sendMessage(from,{text:'🌙 NightMode ON'}); }
     else{ await sock.groupSettingUpdate(from,'not_announcement'); return sock.sendMessage(from,{text:'☀️ NightMode OFF'}); }
   }
   if(cmd==='truth18'||cmd==='dare18'){
     const t=["I crush tu nge?","Vawi engzat nge i kiss?"]; const d=["Crush hnenah I love you ti rawh","Thlalak sexy thawn rawh"];
     const list = cmd==='truth18'?t:d;
     return sock.sendMessage(from,{text:`🔞 ${cmd}: ${list[Math.floor(Math.random()*list.length)]}`});
   }
   if(cmd==='aigf'||cmd==='aibf'){ return sock.sendMessage(from,{text:`💖 AI ${cmd==='aigf'?'Girlfriend':'Boyfriend'}: Hey baby 😘 eng nge i tih?`}); }
   if(cmd==='tobe'){ return sock.sendMessage(from,{text:`🤖 TOBEBOT\nRate: 1day 20₹ 1week 60₹ 1month 150₹ 3month 400₹ Unlimited 1000₹\nGPay: ${config.gpayNumber}`}); }

  }catch(e){ console.log(e); }
 });
}
startBot();
