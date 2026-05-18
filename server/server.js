// // server/server.js
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import dotenv from "dotenv";
// import axios from "axios";
// import { handleConversation } from "../bot/services/conversationHandler.js";

// dotenv.config();

// console.log("🚀 server/server.js BOOTED");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));

// const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "myverifytoken123";
// const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
// const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// /* ============================
//    Health Check
// ============================ */
// app.get("/", (req, res) => {
//   res.send("WhatsApp Business Backend Running...");
// });

// /* ============================
//    Webhook Verification (Meta)
// ============================ */
// app.get("/webhook", (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     console.log("✅ Webhook verified");
//     res.status(200).send(challenge);
//   } else {
//     console.log("❌ Webhook verification failed");
//     res.sendStatus(403);
//   }
// });

// /* ============================
//    Receive Messages (Meta)
// ============================ */
// app.post("/webhook", async (req, res) => {
//   res.sendStatus(200); // always respond fast to Meta

//   try {
//     const entry = req.body?.entry?.[0];
//     const change = entry?.changes?.[0];
//     const value = change?.value;
//     const message = value?.messages?.[0];

//     if (!message) return;

//     const from = message.from; // customer phone number
//     const text = message.text?.body || "";

//     if (!text) return;

//     console.log("📩 MESSAGE FROM:", from, "=>", text);

//     const reply = await handleConversation("demo-shop", from, { body: text });

//     if (!reply?.text) return;

//     console.log("🧠 REPLY:", reply.text);

//     // Send reply via Meta API
//     await axios.post(
//       `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to: from,
//         type: "text",
//         text: { body: reply.text }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${WHATSAPP_TOKEN}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     console.log("✅ Reply sent to", from);

//   } catch (err) {
//     console.error("❌ Webhook error:", err.message);
//   }
// });

// /* ============================
//    Start Server
// ============================ */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import twilio from "twilio";
import { handleConversation } from "../bot/services/conversationHandler.js";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log("🚀 server/server.js BOOTED");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.get("/", (req, res) => {
  res.send("WhatsApp Bot Running...");
});

app.post("/webhook", async (req, res) => {
  try {
    const from = req.body.From;
    const text = req.body.Body;

    console.log("📩 MESSAGE FROM:", from, "=>", text);

    const reply = await handleConversation("demo-shop", from, { body: text });

    if (!reply?.text) return res.sendStatus(200);

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: from,
      body: reply.text
    });

    console.log("✅ Reply sent to", from);
    res.sendStatus(200);

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});