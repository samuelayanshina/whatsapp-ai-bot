// services/whatsappClient.js
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import { execSync } from "child_process";

let client;

// Helper to find Chrome on macOS / Linux / Windows fallback
function getChromePath() {
  try {
    // macOS path
    const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    // Linux common path
    const linux = "/usr/bin/google-chrome";
    // Windows (example)
    const win = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    // try mac
    try {
      execSync(`test -f "${mac}"`);
      return mac;
    } catch {}
    // try linux
    try {
      execSync(`test -f "${linux}"`);
      return linux;
    } catch {}
    // fallback: windows (won't be checked via execSync easily on mac)
    return null;
  } catch (e) {
    return null;
  }
}

const chromePath = getChromePath();
console.log("🧭 Using system Chrome:", chromePath || "no system Chrome detected (will fallback)");

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
    console.log("📱 Scan this QR code (Linked Devices → Link a Device):");
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", () => {
    console.log("🔐 Authenticated — session stored.");
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Auth failure:", msg);
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client ready.");
  });

  client.on("disconnected", (reason) => {
    console.warn("⚠️ Client disconnected:", reason);
  });

  client.on("message", async (msg) => {
    try {
      console.log(`💬 Message from ${msg.from}: ${msg.body}`);
      const text = (msg.body || "").toLowerCase().trim();
      if (text === "hi" || text === "hello") {
        await msg.reply("👋 Hey! I'm your WhatsApp AI bot. How can I help?");
      } else if (text.includes("order")) {
        await msg.reply("🛍️ Send order details and I'll process.");
      } else if (text.includes("price")) {
        await msg.reply("💰 Pricing starts at $10 per item.");
      } else if (text === "help") {
        await msg.reply("🧠 Try: order, price, hi");
      } else {
        await msg.reply("🤖 I didn't understand. Try *help*.");
      }
    } catch (err) {
      console.error("❌ Error handling message:", err);
    }
  });

  try {
    await client.initialize();
    console.log("🚀 WhatsApp client initialized.");
  } catch (err) {
    console.error("❌ Error initializing WhatsApp client:", err);
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
