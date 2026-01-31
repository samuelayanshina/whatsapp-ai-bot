// server/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { startBaileysClient } from "../bot/services/baileysClient.js";
import { handleConversation } from "../bot/services/conversationHandler.js";

// import connectDB from "./config/db.js";
// import { startWhatsAppClient } from "../bot/services/whatsappClient.js";

dotenv.config();
// connectDB();

/* ============================
   WhatsApp (Baileys)
============================ */

function extractText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.ephemeralMessage?.message?.conversation ||
    msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    ""
  );
}

startBaileysClient(async (msg, sock) => {
  try {
    const jid = msg.key.remoteJid;

    // ignore status updates
    if (jid === "status@broadcast") return;

    const text = extractText(msg);

    if (!text) {
      console.log("⚠️ No text extracted, skipping");
      return;
    }

    console.log("📩 TEXT RECEIVED:", jid, "=>", text);

    const reply = await handleConversation("demo-shop", jid, {
      body: text
    });

    console.log("🧠 Handler reply:", reply);

    if (!reply) return;

    // ✅ TEXT
    if (reply.text) {
      await sock.sendMessage(jid, { text: reply.text });
      return;
    }

    // 🖼 IMAGE
    if (reply.type === "image") {
      await sock.sendMessage(jid, {
        image: { url: reply.url },
        caption: reply.caption || ""
      });
      return;
    }

    // 🔊 AUDIO
    if (reply.type === "audio") {
      await sock.sendMessage(jid, {
        audio: { url: reply.url },
        mimetype: "audio/mpeg",
        ptt: true
      });
      return;
    }

    // 📄 PDF
    if (reply.type === "pdf") {
      await sock.sendMessage(jid, {
        document: { url: reply.url },
        mimetype: "application/pdf",
        fileName: reply.fileName || "invoice.pdf"
      });
      return;
    }

    console.warn("⚠️ Unknown reply shape:", reply);

  } catch (err) {
    console.error("❌ WhatsApp handler crash:", err);
  }
});

/* ============================
   Express Server
============================ */

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("WhatsApp Business Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
