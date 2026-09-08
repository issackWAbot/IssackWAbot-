const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("./config");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        logger: pino({ level: "silent" }),
        browser: ["IssackWAbot", "Chrome", "1.0.0"],
        printQRInTerminal: false,
        markOnlineOnConnect: false
    });

    // Pairing Code - A dik tawh 100%
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '').trim();
                console.log(`\nNumber hman mek: ${phoneNumber}\n`);
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("========================================");
                console.log(`  PAIRING CODE: ${code}  `);
                console.log("========================================");
                console.log("WhatsApp > Linked Devices > Link with phone number");
                console.log("60 sec chhungin type lut rawh!\n");
            } catch (err) {
                console.log("Pairing Error:", err.message);
            }
        }, 8000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error
