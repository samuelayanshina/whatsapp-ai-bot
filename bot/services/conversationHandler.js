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

// ----------------------------
// Intent detector (unchanged)
// ----------------------------
function detectIntent(text) {
  const t = String(text || "").toLowerCase();
  if (/^(hi|hello|hey|\bhowdy\b|\bhiya\b)/i.test(t)) return "greeting";
  if (/(\bprice\b|\bhow much\b|\bhow much is\b|\bprice of\b|\bcost\b)/i.test(t)) return "price";
  if (/(\bdeliver|delivery|ship)/i.test(t)) return "delivery";
  if (/(\bpay|payment|transfer|paystack|card)/i.test(t)) return "payment";
  if (/^order\b|i want to buy|buy this|i'll take|i want (one|two|three|3)/i.test(t)) return "order";
  if (/catalog|menu|list|items/i.test(t)) return "catalog";
  return "open";
}

// ----------------------------
// Tone detection (NEW & robust)
// ----------------------------
function detectToneFromText(text) {
  const t = String(text || "");

  const hasEmoji = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(t);
  const hasPidginWords = /\b(abi|wey|na|boss|omo|abeg|no wahala|waka)\b/i.test(t);
  const hasSlang = /\b(bro|bra|fam|bruh|wtf|lol|omg|shi(t)?|boss)\b/i.test(t);
  const isFormal = /please|kindly|sir|madam|regards|thank you|thanks/i.test(t);
  const isShort = t.trim().length <= 20;
  const manyExclam = (t.match(/!/g) || []).length >= 2;
  const allCaps = /^[^a-z]*[A-Z0-9 !?.,'"`-]{2,}$/.test(t) && /[A-Z]/.test(t);

  if (hasPidginWords || (hasSlang && /abeg|no wahala|omo/i.test(t))) return "friendly";
  if (hasEmoji && (hasSlang || isShort)) return "friendly";
  if (manyExclam || allCaps) return "friendly";
  if (isFormal) return "polite";
  // default: neutral
  return "neutral";
}

// ----------------------------
// Rich templates (expanded)
// ----------------------------
const TEMPLATES = {
  friendly: {
    greeting: [
      "Hey boss 👋 Which phone you dey find?",
      "Omo! Wetin you want? 😄",
      "Hi — how can I help you today?"
    ],
    price: [
      "Which model you dey look for? I go check price now.",
      "Tell me the model and I go give you price quick."
    ],
    delivery: [
      "Yes we deliver — which area you dey?",
      "We fit deliver; which side you stay?"
    ],
    payment: [
      "We accept cash, bank transfer and Paystack. Which one you prefer?",
      "Cash or card? I fit send Paystack link."
    ],
    order: [
      "Nice — which model and the delivery address?",
      "Okay boss, model and how many you want?"
    ],
    catalog: [
      "We get Tecno, Samsung, iPhone — which brand you wan see?",
      "I go drop the catalogue for you — which brand first?"
    ],
    fallback: ["One sec, I go check 👀", "I dey on it — hold on small."]
  },
  polite: {
    greeting: [
      "Hello. How may I assist you today?",
      "Good day — how can I help?"
    ],
    price: [
      "Please tell me the model so I can provide pricing.",
      "Kindly confirm the model name for the price."
    ],
    delivery: [
      "We can deliver; please provide your area.",
      "Delivery is available — which location should we send to?"
    ],
    payment: [
      "We accept cash, bank transfer and Paystack.",
      "Payment options: cash, bank transfer, Paystack."
    ],
    order: [
      "Please provide the model and delivery details.",
      "Kindly confirm item and address so we can take your order."
    ],
    catalog: [
      "I can share the product list. Which brand do you prefer?",
      "Please choose a brand: Tecno, Samsung, iPhone."
    ],
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

// ----------------------------
// MAIN HANDLER
// ----------------------------
export async function handleConversation(businessId, from, textOrMsg) {
  const business = loadBusiness(businessId) || {};
  const defaultTone = business.defaultTone || "neutral";

  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || defaultTone;

  let text = ""; // safe final message text

  // 1) If an object message arrives (status/media), keep original logic
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

    // Not a status — fallback to extracting text from the message object safely
    text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.body ||
      "";
  } else {
    // If we were passed plain string (e.g. whatsappClient sends userText), use it
    text = String(textOrMsg || "");
  }

  // Normalize whitespace
  text = text.trim();

  // if empty after trim, return nothing
  if (!text) return pick(tone, "fallback");

  // -------- Tone auto-detection & memory
  const autoTone = detectToneFromText(text);
  // if user has not explicitly set a tone by memory, use auto-detected
  if (!userMem.tone) {
    tone = autoTone || tone;
    setUserMemory(from, { tone }); // persist chosen tone
  }

  // Intent detection
  const intent = detectIntent(text);

  // Learn brand preference
  if (/samsung|sammy/i.test(text)) setUserMemory(from, { favoriteBrand: "Samsung" });
  if (/iphone|apple/i.test(text)) setUserMemory(from, { favoriteBrand: "iPhone" });
  if (/tecno/i.test(text)) setUserMemory(from, { favoriteBrand: "Tecno" });

  if (userMem.favoriteBrand) {
    console.log(`User ${from} prefers ${userMem.favoriteBrand}`);
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
      text.toLowerCase().includes((it.id || "").toLowerCase()) ||
      text.toLowerCase().includes(((it.name || "")).toLowerCase())
    );
    if (found) return `${found.name} — ${found.price}`;
    return pick(tone, "price");
  }

  if (intent === "delivery") return pick(tone, "delivery");
  if (intent === "payment") return pick(tone, "payment");
  if (intent === "order") return pick(tone, "order");
  if (intent === "greeting") return pick(tone, "greeting");

  // AI fallback — preserve tone
  try {
    // Build the prompt so the AI mirrors tone and short length
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
    // final safe fallback that matches tone
    return pick(tone, "fallback");
  }
}
