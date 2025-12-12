// // services/whatsappClient.js
// import pkg from "whatsapp-web.js";
// const { Client, LocalAuth } = pkg;
// import qrcode from "qrcode-terminal";
// import { execSync } from "child_process";

// import { extractStatusInfo } from "./statusService.js";
// import { matchProductFromStatus } from "./statusService.js";
// import { handleConversation } from "./conversationHandler.js";

// // helper in whatsappClient.js
// async function delay(ms){ return new Promise(r => setTimeout(r, ms)); }

// async function sendHumanReply(msg, replyObj) {
//   // replyObj: { text, typingMs, interim: [], tone }
//   const chat = await msg.getChat();

//   // send intermittent short messages if provided (human feel)
//   if (Array.isArray(replyObj.interim) && replyObj.interim.length) {
//     for (const interimText of replyObj.interim) {
//       await chat.sendStateTyping();
//       // small typing for each interim
//       await delay(Math.min(1200, Math.max(600, interimText.length * 20)));
//       await chat.clearState();
//       // send interim as a short message (optional), keep minimal
//       await msg.reply(interimText);
//       // small pause after interim
//       await delay(400);
//     }
//   }

//   // now final typing for the main reply using replyObj.typingMs
//   const typingMs = replyObj.typingMs || Math.min(3000, Math.max(700, String(replyObj.text || "").length * 20));
//   await chat.sendStateTyping();
//   await delay(typingMs);
//   await chat.clearState();

//   // final reply
//   await msg.reply(replyObj.text);
// }


// let client;

// // Helper to find Chrome
// function getChromePath() {
//   try {
//     const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
//     const linux = "/usr/bin/google-chrome";
//     const win = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

//     try { execSync(`test -f "${mac}"`); return mac; } catch {}
//     try { execSync(`test -f "${linux}"`); return linux; } catch {}

//     return null;
//   } catch {
//     return null;
//   }
// }

// const chromePath = getChromePath();
// console.log("🧭 Using system Chrome:", chromePath || "no system Chrome detected (fallback mode)");

// // small helper delay
// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// // compute typing duration based on characters (ms)
// function typingDurationMs(text) {
//   const chars = Math.max(1, (text || "").length);
//   // baseline: 35ms/char (typing speed) + random variance
//   const base = Math.min(6000, Math.round(chars * 35));
//   const jitter = Math.round(Math.random() * 600); // up to 600ms jitter
//   return base + jitter;
// }

// // send typing state and wait before sending message
// async function simulateTypingAndSend(msg, replyText) {
//   try {
//     const chat = await msg.getChat();
//     if (!chat) {
//       await msg.reply(replyText);
//       return;
//     }

//     // start typing
//     try {
//       await chat.sendStateTyping();
//     } catch (e) {
//       // some chats may not support sendStateTyping — ignore
//     }

//     const waitMs = Math.min(8000, typingDurationMs(replyText)); // cap at 8s
//     await delay(waitMs);

//     // clear typing and send
//     try {
//       await chat.clearState();
//     } catch (e) { /* ignore */ }

//     await msg.reply(replyText);
//   } catch (err) {
//     // fallback: try direct reply
//     try {
//       await msg.reply(replyText);
//     } catch (e) {
//       console.error("Failed to send reply:", e);
//     }
//   }
// }

// export const startWhatsAppClient = async () => {
//   console.log("🟡 Starting WhatsApp Web client...");

//   client = new Client({
//     authStrategy: new LocalAuth({ dataPath: "./whatsapp-session" }),
//     puppeteer: {
//       headless: true,
//       executablePath: chromePath,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//         "--remote-debugging-port=9222"
//       ],
//     },
//   });

//   client.on("qr", (qr) => {
//     console.log("📱 Scan this QR code:");
//     qrcode.generate(qr, { small: true });
//   });

//   client.on("authenticated", () => {
//     console.log("🔐 Authenticated — session saved.");
//   });

//   client.on("auth_failure", (msg) => {
//     console.error("❌ Auth failure:", msg);
//   });

//   client.on("ready", () => {
//     console.log("✅ WhatsApp client ready.");
//   });

//   client.on("disconnected", (reason) => {
//     console.warn("⚠️ WhatsApp disconnected:", reason);
//   });

//   // MAIN MESSAGE HANDLER with typing simulation
//   client.on("message", async (msg) => {
//     try {
//       // ignore status broadcasts and non-user chats
//       if (msg.from === "status@broadcast") return;
//       if (!msg.from || !msg.from.endsWith("@c.us")) return;
//       if (!msg.body || msg.body.trim() === "") return;

//       console.log(`💬 Message from ${msg.from}`);

//       // ensure client is ready
//       if (!client || !client.info) {
//         console.log("⚠️ Cannot reply — client not ready.");
//         return;
//       }

//       // FIRST: Status detection (if message object contains quoted media)
//       const statusInfo = extractStatusInfo(msg);
//       if (statusInfo) {
//         const product = await matchProductFromStatus("defaultShop", statusInfo);
//         if (product) {
//           const reply = `🔎 You replied to a status about *${product.name}*\nPrice: ₦${product.price}\nStock: ${product.stock}\n\nWould you like to order it?`;
//           await simulateTypingAndSend(msg, reply);
//           return;
//         }
//         await simulateTypingAndSend(msg, "👀 I saw you replied to a status, but I couldn’t identify the product.\nPlease tell me the product name.");
//         return;
//       }

//       // SECOND: Normal conversation flow — pass plain text to handler for best results
//       const userText = (msg.body || "").trim();
//       const response = await handleConversation("defaultShop", msg.from, userText);

//       if (response && client.info) {
//         await simulateTypingAndSend(msg, response);
//       } else {
//         // nothing to say — optionally send a fallback
//       }
//     } catch (err) {
//       console.error("❌ Message error:", err);
//     }
//   });

//   try {
//     await client.initialize();
//     console.log("🚀 WhatsApp client initialized.");
//   } catch (err) {
//     console.error("❌ Initialization error:", err);
//   }

//   return client;
// };

// // Safe sender
// export async function sendMessageTo(number, text) {
//   if (!client || !client.info) throw new Error("Client not ready");
//   const id = number.includes("@c.us") ? number : `${number.replace("+", "")}@c.us`;
//   return client.sendMessage(id, text);
// }

// export function getClient() {
//   return client;
// }


// services/whatsappClient.js
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import { execSync } from "child_process";

import { extractStatusInfo } from "./statusService.js";
import { matchProductFromStatus } from "./statusService.js";
import { handleConversation } from "./conversationHandler.js";

// ------------------------------------------------------
// HELPERS (NEW + FIXED)
// ------------------------------------------------------
async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Human-typing message sender
async function sendHumanReply(msg, replyObj) {
  // replyObj: { text, typingMs, interim: [] }

  const chat = await msg.getChat();

  // ---- INTERIM MESSAGES ----
  if (Array.isArray(replyObj.interim) && replyObj.interim.length) {
    for (const interimText of replyObj.interim) {
      await chat.sendStateTyping();
      await delay(Math.min(1200, Math.max(600, interimText.length * 20)));
      await chat.clearState();
      await msg.reply(interimText);
      await delay(400);
    }
  }

  // ---- MAIN FINAL REPLY ----
  const typingMs =
    replyObj.typingMs ||
    Math.min(3000, Math.max(700, String(replyObj.text || "").length * 20));

  await chat.sendStateTyping();
  await delay(typingMs);
  await chat.clearState();

  await msg.reply(replyObj.text);
}

// ------------------------------------------------------
// FIND CHROME
// ------------------------------------------------------
function getChromePath() {
  try {
    const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    const linux = "/usr/bin/google-chrome";

    try { execSync(`test -f "${mac}"`); return mac; } catch {}
    try { execSync(`test -f "${linux}"`); return linux; } catch {}

    return null;
  } catch {
    return null;
  }
}

const chromePath = getChromePath();
console.log("🧭 Using system Chrome:", chromePath || "no system Chrome detected (fallback mode)");

let client;

export const startWhatsAppClient = async () => {
  console.log("🟡 Starting WhatsApp Web client...");

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: "./whatsapp-session" }),
    puppeteer: {
      headless: true,
      executablePath: chromePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--remote-debugging-port=9222"
      ],
    },
  });

  // ------------------------------------------------------
  // EVENT HANDLERS
  // ------------------------------------------------------
  client.on("qr", (qr) => {
    console.log("📱 Scan this QR code:");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () => console.log("🔐 Authenticated — session saved."));
  client.on("auth_failure", msg => console.error("❌ Auth failure:", msg));
  client.on("ready", () => console.log("✅ WhatsApp client ready."));
  client.on("disconnected", reason => console.warn("⚠️ WhatsApp disconnected:", reason));

  // ------------------------------------------------------
  // MAIN MESSAGE LISTENER (UPDATED)
  // ------------------------------------------------------
  client.on("message", async (msg) => {
    try {
      // ignore non-user chats
      if (msg.from === "status@broadcast") return;
      if (!msg.from.endsWith("@c.us")) return;

      console.log(`💬 Message from ${msg.from}`);

      if (!client || !client.info) return;

      // STATUS REPLY HANDLING
      const statusInfo = extractStatusInfo(msg);
      if (statusInfo) {
        const product = await matchProductFromStatus("defaultShop", statusInfo);

        if (product) {
          return await sendHumanReply(msg, {
            text: `🔎 You replied to a status about *${product.name}*\nPrice: ₦${product.price}\nStock: ${product.stock}\n\nWould you like to order it?`,
            interim: ["Hold on boss, checking 👀"],
          });
        }

        return await sendHumanReply(msg, {
          text: "👀 I saw you replied to a status but I couldn’t identify the product. Tell me the name?",
        });
      }

      // PASS RAW MESSAGE OBJECT TO CONVERSATION ENGINE
      const result = await handleConversation("defaultShop", msg.from, msg);

      // RESULT IS AN OBJECT (new system)
      if (result && typeof result === "object") {
        return await sendHumanReply(msg, result);
      }

      // RESULT IS NORMAL STRING (fallback)
      if (typeof result === "string") {
        return await sendHumanReply(msg, {
          text: result,
          typingMs: Math.min(2000, result.length * 12),
          interim: []
        });
      }

    } catch (err) {
      console.error("❌ Message error:", err);
    }
  });

  try {
    await client.initialize();
    console.log("🚀 WhatsApp client initialized.");
  } catch (err) {
    console.error("❌ Initialization error:", err);
  }

  return client;
};

// ------------------------------------------------------
// EXTERNAL SENDER
// ------------------------------------------------------
export async function sendMessageTo(number, text) {
  if (!client || !client.info) throw new Error("Client not ready");
  const id = number.includes("@c.us") ? number : `${number.replace("+", "")}@c.us`;
  return client.sendMessage(id, text);
}

export function getClient() {
  return client;
}
