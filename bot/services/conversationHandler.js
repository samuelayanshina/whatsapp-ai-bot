// services/conversationHandler.js
import fs from "fs";
import path from "path";
import { askOllama } from "./ollamaService.js";
import { getUserMemory, setUserMemory } from "./memoryService.js";

import { extractStatusInfo, matchProductFromStatus } from "./statusService.js";

const BUS_FILE = path.resolve("./data/businessProfiles.json");

function loadBusiness(id) {
  try {
    if (!fs.existsSync(BUS_FILE)) return null;
    const arr = JSON.parse(fs.readFileSync(BUS_FILE, "utf8"));
    return arr.find(b => b.id === id) || null;
  } catch (e) {
    console.error("loadBusiness error:", e);
    return null;
  }
}

// ------------------------------------------------------------
// INTENT DETECTOR
// ------------------------------------------------------------
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|\bhowdy\b|\bhiya\b)/i.test(t)) return "greeting";
  if (/(\bprice\b|\bhow much\b|\bhow much is\b|\bprice of\b|\bcost\b)/i.test(t)) return "price";
  if (/(\bdeliver|delivery|ship)/i.test(t)) return "delivery";
  if (/(\bpay|payment|transfer|paystack|card)/i.test(t)) return "payment";
  if (/^order\b|i want to buy|buy this|i'll take|i want (one|two|three|3)/i.test(t)) return "order";
  if (/catalog|menu|list|items/i.test(t)) return "catalog";
  return "open";
}

// ------------------------------------------------------------
// TONE TEMPLATES
// ------------------------------------------------------------
const TEMPLATES = {
  friendly: {
    greeting: ["Hey 👋 Which phone you dey find?", "Hi dear 👋 what phone you want?"],
    price: ["Which model? I go give price quick.", "Tell me model name so I fit check price."],
    delivery: ["Yes we deliver. Where you stay?", "We fit deliver — which area?"],
    payment: ["We accept cash, bank transfer and Paystack.", "Cash or bank transfer; I fit send Paystack link."],
    order: ["Nice! Which model and how many?", "Okay — model and delivery address please."],
    catalog: ["We get Tecno, Samsung, iPhone — which brand?", "I can send the list — you prefer Tecno, Samsung or iPhone?"],
    fallback: ["Okay — lemme check.", "I dey on it."]
  },
  polite: {
    greeting: ["Hello. How may I help you today?", "Good day — what are you looking for?"],
    price: ["Please tell me the model to provide price.", "Kindly confirm the model name."],
    delivery: ["We can deliver; please share your area.", "Delivery available — which area are you in?"],
    payment: ["We accept cash, bank transfer and Paystack.", "Payment options: cash, bank transfer, Paystack."],
    order: ["Please provide model and delivery details.", "Kindly confirm item and address so we can take your order."],
    catalog: ["I can send the product list. Which brand do you prefer?", "Please choose a brand: Tecno, Samsung, iPhone."],
    fallback: ["One moment, checking...", "I will check and get back."]
  },
  neutral: {
    greeting: ["Hello — how can I help?", "Hi — what do you need?"],
    price: ["Which model would you like the price for?", "Tell me the model name."],
    delivery: ["We deliver — where are you located?", "Delivery depends on location. Which area?"],
    payment: ["We accept cash and transfers.", "Cash, bank transfer, Paystack."],
    order: ["Please send model and address.", "Which model and where to deliver?"],
    catalog: ["I can share the catalog — what brand?", "Which brand are you interested in?"],
    fallback: ["Okay — checking now.", "Let me confirm and reply."]
  }
};

function pick(tone, intent) {
  const set = TEMPLATES[tone] || TEMPLATES.neutral;
  const arr = set[intent] || set.fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------------------------------------------------------------
// MAIN HANDLER
// ------------------------------------------------------------
export async function handleConversation(businessId, from, textOrMsg) {
  const business = loadBusiness(businessId) || {};
  const defaultTone = business.defaultTone || "neutral";

  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || defaultTone;

  let text = ""; // safe final message text

  // ------------------------------------------------------------
  // 1. STATUS DETECTION — SUPER SAFE
  // ------------------------------------------------------------
  if (typeof textOrMsg === "object" && textOrMsg?.message) {
    const msg = textOrMsg;

    try {
      const statusInfo = extractStatusInfo(msg);

      if (statusInfo) {
        const product = await matchProductFromStatus(businessId, statusInfo);

        if (product) {
          const name = product.name || product.title || "product";
          const price = product.price ?? product.amount ?? "–";
          const stock =
            product.stock ??
            product.inventory ??
            (product.inStock ? "Yes" : "Unknown");

          return `🔎 You replied to a post about *${name}*\nPrice: ₦${price}\nStock: ${stock}\n\nWould you like to order it?`;
        }

        return `I saw you replied to a status but couldn't identify the product.\nPlease tell me the product name so I can assist you.`;
      }
    } catch (err) {
      console.error("Status handling error:", err);
    }

    // Not a status → extract user text
    text =
      msg.message.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";
  } else {
    text = textOrMsg || "";
  }

  // ------------------------------------------------------------
  // 2. EXISTING CHAT LOGIC — UNTOUCHED
  // ------------------------------------------------------------

  const intent = detectIntent(text);

  // Brand preference learning
  if (/samsung|sammy/i.test(text)) setUserMemory(from, { favoriteBrand: "Samsung" });
  if (/iphone|apple/i.test(text)) setUserMemory(from, { favoriteBrand: "iPhone" });
  if (/tecno/i.test(text)) setUserMemory(from, { favoriteBrand: "Tecno" });

  if (userMem.favoriteBrand) {
    console.log(`User ${from} prefers ${userMem.favoriteBrand}`);
  }

  // Tone switching
  if (/pidgin|naija|slang|dear|boss|bro/i.test(text)) {
    tone = "friendly";
    setUserMemory(from, { tone });
  } else if (/formal|please|sir|madam|ma/i.test(text)) {
    tone = "polite";
    setUserMemory(from, { tone });
  }

  // RULE-BASED RESPONSES
  if (intent === "catalog") {
    const favorite = userMem.favoriteBrand;

    if (favorite) {
      return `Since you like ${favorite}, we have new deals on ${favorite} phones 🤝 Want me to send list?`;
    }

    const cat = (business.catalog || [])
      .map(it => `${it.id} - ${it.name} (${it.price || "-"})`)
      .join("\n");

    if (cat) return `Catalog:\n${cat}`;

    return pick(tone, "catalog");
  }

  if (intent === "price") {
    const catalog = business.catalog || [];
    const found = catalog.find(it =>
      text.toLowerCase().includes(it.id.toLowerCase()) ||
      text.toLowerCase().includes((it.name || "").toLowerCase())
    );

    if (found) return `${found.name} — ${found.price}`;
    return pick(tone, "price");
  }

  if (intent === "delivery") return pick(tone, "delivery");
  if (intent === "payment") return pick(tone, "payment");
  if (intent === "order") return pick(tone, "order");
  if (intent === "greeting") return pick(tone, "greeting");

  // AI fallback
  try {
    const prompt = `You are a Lagos phone-shop assistant. Reply in 1 short sentence (max 2 lines). Use ${tone} tone. Do NOT say you're an AI. Customer: "${text}"`;

    const ai = await askOllama(prompt, { model: "phi3" });
    const oneLine = ai
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join(" ");

    return oneLine.length > 240 ? oneLine.slice(0, 237) + "..." : oneLine;
  } catch (e) {
    console.error("askOllama fallback error:", e.message || e);
    return pick(tone, "fallback");
  }
}
