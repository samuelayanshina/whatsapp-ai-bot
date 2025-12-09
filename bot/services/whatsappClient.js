// services/whatsappClient.js
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import { execSync } from "child_process";

import { extractStatusInfo } from "./statusService.js";
import { matchProductFromStatus } from "./statusService.js";
import { handleConversation } from "./conversationHandler.js";

let client;

// Helper to find Chrome on macOS / Linux / Windows fallback
function getChromePath() {
  try {
    const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    const linux = "/usr/bin/google-chrome";
    const win = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    try { execSync(`test -f "${mac}"`); return mac; } catch {}
    try { execSync(`test -f "${linux}"`); return linux; } catch {}
    return null;
  } catch {
    return null;
  }
}

const chromePath = getChromePath();
console.log("🧭 Using system Chrome:", chromePath || "no system Chrome detected (fallback mode)");

export const startWhatsAppClient = async () => {
  console.log("🟡 Starting WhatsApp Web client...");

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: "./whatsapp-session" }),
    puppeteer: {
      headless: false,
      executablePath: chromePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      protocolTimeout: 120000,
    },
  });

  client.on("qr", (qr) => {
    console.log("📱 Scan this QR code:");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.log("🔐 Authenticated — session saved.");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Auth failure:", msg);
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client ready.");
  });

  client.on("disconnected", (reason) => {
    console.warn("⚠️ WhatsApp disconnected:", reason);
  });

  // ------------------------------------------------------------
  // ⭐ MAIN MESSAGE HANDLER — NOW WITH STATUS INTELLIGENCE
  // ------------------------------------------------------------
  client.on("message", async (msg) => {
    try {
      console.log(`💬 Message from ${msg.from}`);

      // FIRST: Status detection
      const statusInfo = extractStatusInfo(msg);

      if (statusInfo) {
        console.log("📌 User replied to a STATUS:", statusInfo);

        const product = await matchProductFromStatus("defaultShop", statusInfo);

        if (product) {
          await msg.reply(
            `🔎 You replied to a status about *${product.name}*\nPrice: ₦${product.price}\nStock: ${product.stock}\n\nWould you like to order it?`
          );
          return;
        }

        await msg.reply(
          "👀 I saw you replied to a status, but I couldn’t identify the product.\nPlease tell me the product name."
        );
        return;
      }

      // SECOND: Normal conversation flow
      const response = await handleConversation("defaultShop", msg.from, msg);

      await msg.reply(response);

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

export async function sendMessageTo(number, text) {
  if (!client) throw new Error("Client not initialized");
  const id = number.includes("@c.us") ? number : `${number.replace("+", "")}@c.us`;
  return client.sendMessage(id, text);
}

export function getClient() {
  return client;
}
