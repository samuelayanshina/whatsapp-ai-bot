import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";

console.log("🟡 Starting probe...");

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("baileys-auth");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
  if (qr) {
    console.log("📱 SCAN THIS QR:");
    qrcode.generate(qr, { small: true });
  }

  if (connection === "open") {
    console.log("✅ Baileys connected");
  }

  if (connection === "close") {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    console.log("❌ Disconnected:", statusCode);

    if (statusCode !== DisconnectReason.loggedOut) {
      console.log("🔁 Restarting after stream error...");
      start();
    } else {
      console.log("❌ Logged out. Delete baileys-auth and scan again.");
    }
  }
});


  sock.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    console.log("📩 INCOMING MESSAGE:", text);
  });
}

start();
