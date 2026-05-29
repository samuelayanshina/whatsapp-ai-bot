// server/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import twilio from "twilio";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { handleConversation } from "../bot/services/conversationHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

console.log("🚀 server/server.js BOOTED");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running...");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅ Meta webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const from = req.body.From;
  const text = req.body.Body;

  console.log("📩 MESSAGE FROM:", from, "=>", text);

  // ── Respond to Twilio immediately with empty TwiML ──────────────────
  // This stops Twilio from treating our HTTP response as a message reply
  // (which was causing the "OK" bubble to appear in WhatsApp)
  const twiml = new twilio.twiml.MessagingResponse();
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());

  // ── Process and reply asynchronously ────────────────────────────────
  try {
    const reply = await handleConversation("demo-shop", from, { body: text });

    if (!reply?.text) return;

    // Human-like typing delay — longer replies = longer wait
    const delay = reply.typingMs || 1200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: from,
      body: reply.text,
    });

    console.log(`✅ [${reply.tone}] Reply sent to ${from}: "${reply.text}"`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
