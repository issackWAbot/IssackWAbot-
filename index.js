const express = require('express');
const app = express();
app.get('/', (r,s)=>s.send('IssackWA-Bot Live 🔥 Quiz + All'));
app.listen(process.env.PORT||10000);

const fs = require('fs-extra');
const config = require('./config');
let mode = 'public';
let coins = fs.existsSync('./coins.json')? JSON.parse(fs.readFileSync('./coins.json')) : {};
let quizActive = {}; // quiz tan
const saveCoins = ()=>fs.writeFileSync('./coins.json', JSON.stringify(coins));
const getCoin = (id)=> id.includes(config.ownerNumber)? 999999 : (coins[id]?.coin||0);
const cutCoin = (id)=>{ if(id.includes(config.ownerNumber)) return true; if(getCoin(id)<5) return false; coins[id].coin-=5; saveCoins(); return true; };

async function startBot(){
 const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = await import('@whiskeysockets/baileys');
 const pino = require('pino');
 const { state, saveCreds } = await useMultiFileAuthState('auth');
 const sock = makeWASocket({ logger: pino({level:'silent'}), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'})) }, browser: ["IssackWAbot","Chrome","1.0"] });
 if(!sock.authState.creds.registered){ setTimeout(async()=>{ try{ const c = await sock.requestPairingCode(config.ownerNumber); console.log("PAIRING CODE:",c); }catch(e){} },7000); }
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', u=>{ if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot(); if(u.connection==='open') console.log('Connected'); });
 sock.ev.on('messages.upsert', async ({messages})=>{
  try{
   const msg = messages[0]; if(!msg.message || msg.key.fromMe) return;
   const from = msg.key.remoteJid; const sender = msg.key.participant || from; const isGroup = from.endsWith('@g.us');
   const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";
   if(!text.startsWith(config.prefix)) return;
   if(mode==='self' &&!sender.includes(config.ownerNumber)) return;
   const args = text.slice(1).trim().split(/ +/); const cmd = args.shift().toLowerCase();

   if(!['menu','claim','buy','gpay','tobe','self','public','myinfo','ping','quiz','qz','chhang','ans'].includes(cmd)){
     if(getCoin(sender)<5 &&!sender.includes(config.ownerNumber)) return sock.sendMessage(from,{text:`❌ Coin bo!.claim hmang rawh. I coin: ${getCoin(sender)}`});
     cutCoin(sender);
   }

   if(cmd==='menu'){
     return sock.sendMessage(from,{text:`╭─ *${config.botName}* ─\n│ Owner: ${config.ownerName}\n│ Mode: ${mode} | Coin: ${getCoin(sender)}\n├───────────────\n│ *DOWNLOAD:*\n│.song.video.status\n│ *MEDIA:*\n│.setdp.retouch.aitalk\n│ *GROUP GAME:*\n│ tunge.myinfo\n│ *QUIZ:*\n│.quiz.qz.chhang\n│ *VIP:*\n│ crush ship2 loyalty expose\n│ confess secretmsg detective\n│ roast simp bankheist stalker\n│ nightmode truth18\n│ *ECONOMY:*\n│.claim.buy.gpay.tobe\n│ *AI:*\n│.aigf.aibf\n╰───────────────\nLive ✅`});
   }
   if(cmd==='ping') return sock.sendMessage(from,{text:'Pong ✅'});
   if(cmd==='self'){ if(!sender.includes(config.ownerNumber)) return; mode='self'; return sock.sendMessage(from,{text:'✅ Self'}); }
   if(cmd==='public'){ if(!sender.includes(config.ownerNumber)) return; mode='public'; return sock.sendMessage(from,{text:'✅ Public'}); }
   if(cmd==='claim'){ const last = coins[sender]?.last||0; if(Date.now()-last<86400000) return sock.sendMessage(from,{text:'⏳ 24hr nghak rawh!'}); if(!coins[sender]) coins[sender]={coin:0}; coins[sender].coin+=50; coins[sender].last=Date.now(); saveCoins(); return sock.sendMessage(from,{text:`✅ 50 coin claim! Total: ${coins[sender].coin}`}); }
   if(cmd==='buy'||cmd==='gpay'||cmd==='tobe') return sock.sendMessage(from,{text:`*GPAY*\n250c=60₹ 500c=100₹\n1000c=200₹\nNo: ${config.gpayNumber}`});

   // QUIZ - A KIM VEK, PAIH LO
   if(cmd==='quiz'||cmd==='qz'){
     try{
       let qData = null;
       if(fs.existsSync('./quiz/quiz.json')) qData = JSON.parse(fs.readFileSync('./quiz/quiz.json'));
       else if(fs.existsSync('./quiz.json')) qData = JSON.parse(fs.readFileSync('./quiz.json'));

       if(!qData){ return sock.sendMessage(from,{text:'❌ quiz folder ah quiz.json a awm lo!'}); }

       const questions = Array.isArray(qData)? qData : qData.questions || [qData];
       const q = questions[Math.floor(Math.random()*questions.length)];

       quizActive[from] = q.answer || q.correct || 'A';

       let quizText = `🧠 *QUIZ TIME!*\n\n❓ ${q.question || q.q}\n\n`;
       if(q.options) quizText += `A) ${q.options[0]}\nB) ${q.options[1]}\nC) ${q.options[2]}\nD) ${q.options[3]||''}\n\n`;
       quizText += `*.chhang A/B/C/D* ti in chhang rawh!\n50 Coin i hmu ang!`;

       return sock.sendMessage(from,{text:quizText});
     }catch(e){ return sock.sendMessage(from,{text:'❌ Quiz Error: '+e.message}); }
   }
   if(cmd==='chhang'||cmd==='ans'){
     if(!quizActive[from]) return sock.sendMessage(from,{text:'❌ Quiz i la start lo!.quiz ti rawh!'});
     const ans = args[0]?.toUpperCase();
     if(ans === quizActive[from].toString().toUpperCase()){
       if(!coins[sender]) coins[sender]={coin:0}; coins[sender].coin+=20; saveCoins();
       delete quizActive[from];
       return sock.sendMessage(from,{text:`✅ Dik! 20 Coin i hmu! Total: ${getCoin(sender)}`});
     }else{
       return sock.sendMessage(from,{text:`❌ Dik lo! A dik chu ${quizActive[from]} a ni!`});
     }
   }

   // A DANG ZAWNG - PAIH LO
   if(cmd==='song'||cmd==='play'){ try{ const yts=require('yt-search'); const s=await yts(args.join(' ')); const v=s.videos[0]; return sock.sendMessage(from,{image:{url:v.thumbnail}, caption:`*${v.title}*`}); }catch(e){ return sock.sendMessage(from,{text:'Error'}); } }
   if(cmd==='video') return sock.sendMessage(from,{text:'📹 Video - Link dah rawh'});
   if(cmd==='status') return sock.sendMessage(from,{text:'📥 Status saver'});
   if(cmd==='setdp') return sock.sendMessage(from,{text:'✅.setdp - Thlalak nen ti rawh'});
   if(cmd==='retouch') return sock.sendMessage(from,{text:`✨ Retouch ${args[0]||'flash'}`});
   if(cmd==='aitalk') return sock.sendMessage(from,{text:'🗣️.aitalk "text" + pic'});
   if(cmd==='tunge'){ if(!isGroup) return; const meta=await sock.groupMetadata(from); const m=meta.participants; const t=m[Math.floor(Math.random()*m.length)]; return sock.sendMessage(from,{text:`😂 Tunge ${args.join(' ')}? 👉 @${t.id.split('@')[0]}`, mentions:[t.id]}); }
   if(cmd==='myinfo') return sock.sendMessage(from,{text:`*My Info*\nCoin: ${getCoin(sender)}`, mentions:[sender]});
   if(['crush','ship2','loyalty','roast','simp','detective','bankheist','stalker','expose','killer'].includes(cmd)) return sock.sendMessage(from,{text:`🔥 ${cmd}: @${sender.split('@')[0]} 85%`, mentions:[sender]});
   if(cmd==='confess'||cmd==='secretmsg') return sock.sendMessage(from,{text:`🤫 Confess: "${args.join(' ')}"`});
   if(cmd==='nightmode'){
     if(!isGroup) return; if(args[0]==='on'){ await sock.groupSettingUpdate(from,'announcement'); return sock.sendMessage(from,{text:'🌙 NIGHTMODE ON ✅'}); }
     if(args[0]==='off'){ await sock.groupSettingUpdate(from,'not_announcement'); return sock.sendMessage(from,{text:'☀️ NIGHTMODE OFF ✅'}); }
     return sock.sendMessage(from,{text:'.nightmode on/off'});
   }
   if(cmd==='truth18'||cmd==='dare18'){ const l=["I crush tu nge?","Vawi engzat nge i kiss?"]; return sock.sendMessage(from,{text:`🔞 ${cmd}: ${l[Math.floor(Math.random()*l.length)]}`}); }
   if(cmd==='aigf'||cmd==='aibf') return sock.sendMessage(from,{text:`💖 AI ${cmd}: Hey baby 😘`});

  }catch(e){ console.log(e); }
 });
}
startBot();
