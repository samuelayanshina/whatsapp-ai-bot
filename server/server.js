import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { startBaileysClient } from "../bot/services/baileysClient.js";
import { handleConversation } from "../bot/services/conversationHandler.js";
// import connectDB from "./config/db.js";

// WhatsApp Bot
import { startWhatsAppClient } from "../bot/services/whatsappClient.js";

startBaileysClient(async (msg, sock) => {
  const jid = msg.key.remoteJid;
  if (jid === "status@broadcast") return;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  if (!text) return;

  console.log("📩 INCOMING:", jid, text);

  const reply = await handleConversation("demo-shop", jid, {
  body: text
});

console.log("🧠 Handler reply:", reply);

if (!reply) return;

// TEXT
// if (typeof reply === "string") {
//   await sock.sendMessage(jid, { text: reply });
//   return;
// }

if (reply?.text) {
  await sock.sendMessage(jid, { text: reply.text });
}


// IMAGE
if (reply.type === "image") {
  await sock.sendMessage(jid, {
    image: { url: reply.url },
    caption: reply.caption || ""
  });
  return;
}

// AUDIO
if (reply.type === "audio") {
  await sock.sendMessage(jid, {
    audio: { url: reply.url },
    mimetype: "audio/mpeg",
    ptt: true
  });
  return;
}

// PDF
if (reply.type === "pdf") {
  await sock.sendMessage(jid, {
    document: { url: reply.url },
    mimetype: "application/pdf",
    fileName: reply.fileName || "invoice.pdf"
  });
  return;
}

console.warn("⚠️ Unknown reply shape:", reply);

});

dotenv.config();
// connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Default Route
app.get("/", (req, res) => {
  res.send("WhatsApp Business Backend Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Start WhatsApp Bot
// startWhatsAppClient()
//   .then(() => console.log("🤖 WhatsApp Bot Loaded Successfully"))
//   .catch(err => console.error("🔥 WhatsApp Bot Failed to Start:", err));
