import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";

let sock;

export async function startBaileysClient(onMessage) {
  const { state, saveCreds } = await useMultiFileAuthState("baileys-auth");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ Baileys connected");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("🔁 Reconnecting...");
        startBaileysClient(onMessage);
      } else {
        console.log("❌ Logged out — delete baileys-auth and rescan");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
  if (type !== "notify") return;

  const msg = messages[0];
  if (!msg?.message) return;
  if (msg.key.fromMe) return;

  // ⛔ ignore history & protocol noise
  if (
    msg.message.protocolMessage ||
    msg.message.reactionMessage ||
    msg.message.senderKeyDistributionMessage
  ) {
    return;
  }

  // ⛔ ignore history sync messages
  if (msg.key.id?.startsWith("BAE5")) {
    return;
  }

  await onMessage(msg, sock);
});



  return sock;
}

export function getBaileysClient() {
  return sock;
}
