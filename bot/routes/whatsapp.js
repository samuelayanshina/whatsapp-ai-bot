import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { replyTemplate } from "../utils/replyTemplate.js";
import { getAIReply } from "../services/openaiService.js";

dotenv.config();
const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mywhatsapptoken123";
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

console.log("🚦 WhatsApp router loaded");

// ✅ Health check routes
router.get("/ping", (req, res) => {
  console.log("🔥 /ping route hit");
  res.send("✅ WhatsApp router is alive");
});

router.get("/test", (req, res) => {
  res.send("✅ WhatsApp route is active");
});

// ✅ Webhook verification (Meta setup step)
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook verification failed");
    res.sendStatus(403);
  }
});

// ✅ Handle incoming messages from Meta
router.post("/webhook", async (req, res) => {
  console.log("🔥 Webhook POST hit with body:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("⚠️ No message found in webhook payload.");
      return res.status(200).send("No message to process");
    }

    const sender = message.from;
    const text = message.text?.body || "";
    console.log(`📩 Message from ${sender}: ${text}`);

    // 🧠 Test OpenAI reply (temporary log)
    const aiReply = await getAIReply(text);
    console.log("🤖 AI Reply:", aiReply);

    // 🧩 Build reply template
    const replyData = replyTemplate(sender, aiReply);
    console.log("📦 Reply Payload:", replyData);

    // 🚀 Send to WhatsApp Cloud API
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      replyData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    console.log("✅ Reply sent successfully!", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing webhook:", err.response?.data || err.message);
    res.status(500).send({ error: err.message, details: err.response?.data });
  }
});


export default router;
