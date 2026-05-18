// import {
//   makeWASocket,
//   useMultiFileAuthState,
//   fetchLatestBaileysVersion,
//   DisconnectReason
// } from "baileys";
// import pino from "pino";

// let sock;

// export async function startBaileysClient(onMessage) {
//   const { state, saveCreds } = await useMultiFileAuthState("baileys-auth");
//   const { version } = await fetchLatestBaileysVersion();

//   sock = makeWASocket({
//   version,
//   auth: state,
//   logger: pino({ level: "silent" }),

//   // 🔑 FORCE NEW DEVICE REGISTRATION
//   generateHighQualityLinkPreview: false,
//   syncFullHistory: false,
//   markOnlineOnConnect: false,
//   keepAliveIntervalMs: 30_000,

//   browser: ["Mac OS", "Chrome", "114.0.0"]
// });



//   sock.ev.on("creds.update", saveCreds);

//   sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
//   if (connection === "open") {
//     console.log("✅ Baileys connected");
//   }

//   if (connection === "close") {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;

//     console.log("❌ Connection closed with code:", statusCode);

//     if (statusCode === DisconnectReason.loggedOut) {
//       console.log("🚪 Logged out — delete baileys-auth and restart");
//       process.exit(1);
//     }

//     // ⛔ DO NOTHING ELSE
//     // Baileys handles reconnection internally
//   }
// });


//   sock.ev.on("messages.upsert", async ({ messages, type }) => {
//   if (type !== "notify") return;

//   const msg = messages[0];
//   if (!msg?.message) return;
//   if (msg.key.fromMe) return;

//   // ⛔ ignore history & protocol noise
//   if (
//     msg.message.protocolMessage ||
//     msg.message.reactionMessage ||
//     msg.message.senderKeyDistributionMessage
//   ) {
//     return;
//   }

//   // ⛔ ignore history sync messages
//   if (msg.key.id?.startsWith("BAE5")) {
//     return;
//   }

//   await onMessage(msg, sock);
// });



//   return sock;
// }

// export function getBaileysClient() {
//   return sock;
// }




import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

let sock;

export async function startBaileysClient(onMessage) {
  const { state, saveCreds } = await useMultiFileAuthState("baileys-auth");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
  version,
  auth: state,
  logger: pino({ level: "warn" }),
  generateHighQualityLinkPreview: false,
  syncFullHistory: false,
  markOnlineOnConnect: false,
  keepAliveIntervalMs: 30_000
});

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("📱 Scan this QR code with your WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Baileys connected — bot is live!");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log("❌ Connection closed with code:", statusCode);
      if (statusCode === DisconnectReason.loggedOut) {
        console.log("🚪 Logged out — delete baileys-auth and restart");
        process.exit(1);
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    const msg = messages[0];
    if (!msg?.message) return;
    if (msg.key.fromMe) return;
    if (msg.message.protocolMessage || msg.message.reactionMessage || msg.message.senderKeyDistributionMessage) return;
    if (msg.key.id?.startsWith("BAE5")) return;
    await onMessage(msg, sock);
  });

  return sock;
}

export function getBaileysClient() {
  return sock;
}