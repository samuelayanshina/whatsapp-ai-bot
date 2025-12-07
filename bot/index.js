// index.js
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { handleConversation } from "./services/conversationHandler.js";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const sock = makeWASocket({ auth: state });

  sock.ev.on("connection.update", update => {
    const { connection, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === "open") console.log("✅ WhatsApp Connected!");
    if (connection === "close") {
      console.log("❌ Connection closed. Restarting...");
      startBot();
    }
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async m => {
    try {
      const msg = m.messages[0];
      if (!msg || !msg.message || msg.key.fromMe) return;

      const from = msg.key.remoteJid;
      const text =
        msg.message.conversation ||
        msg.message?.extendedTextMessage?.text ||
        "";

      console.log("📩 Message from", from, "=>", text);

      const reply = await handleConversation("demo-shop", from, text);

      // ✅ Typing animation
      await sock.presenceSubscribe(from);
      await sock.sendPresenceUpdate("composing", from);
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      await sock.sendPresenceUpdate("paused", from);

      // ✅ If reply contains voice note
      if (reply && reply.type === "audio") {
        await sock.sendMessage(from, {
          audio: { url: reply.url },
          mimetype: "audio/mpeg",
          ptt: true
        });
      }

      // ✅ If reply contains image
      else if (reply && reply.type === "image") {
        await sock.sendMessage(from, {
          image: { url: reply.url },
          caption: reply.caption || ""
        });
      }

      // ✅ If reply includes PDF invoice
else if (reply && reply.type === "pdf") {
  await sock.sendMessage(from, {
    document: { url: reply.url },
    mimetype: "application/pdf",
    fileName: reply.fileName || "invoice.pdf"
  });
}


      // ✅ Normal text reply
      else if (typeof reply === "string") {
        await sock.sendMessage(from, { text: reply });
      }

    } catch (err) {
      console.error("❌ message handler error:", err);
    }
  });
}

startBot();
