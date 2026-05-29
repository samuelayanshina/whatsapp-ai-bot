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
  // Acknowledge immediately
  res.sendStatus(200);

  try {
    const body = req.body;

    // Meta sends messages in entry[].changes[].value.messages[]
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const from = message.from; // customer phone number
    const text = message?.text?.body;

    if (!text) return;

    console.log("📩 META MESSAGE FROM:", from, "=>", text);

    const reply = await handleConversation("demo-shop", `whatsapp:${from}`, { body: text });

    if (!reply?.text) return;

    // Human typing delay
    const delay = reply.typingMs || 1200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Reply via Meta API
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: { body: reply.text },
        }),
      }
    );

    const result = await response.json();
    console.log(`✅ [${reply.tone}] Meta reply sent to ${from}: "${reply.text}"`);
    if (result.error) console.error("❌ Meta error:", result.error.message);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
