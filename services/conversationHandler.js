// services/conversationHandler.js
import fs from "fs";
import { askOllama } from "./ollamaService.js"; // must exist (I gave this earlier)
import { getUserMemory, setUserMemory } from "./memoryService.js";
import path from "path";

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

// Very small detector for common intents
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/^(hi|hello|hey|\bhowdy\b|\bhiya\b)/i.test(t)) return "greeting";
  if (/(\bprice\b|\bhow much\b|\bhow much is\b|\bprice of\b|\bcost\b)/i.test(t)) return "price";
  if (/(\bdeliver|delivery|ship)/i.test(t)) return "delivery";
  if (/(\bpay|payment|transfer|paystack|card)/i.test(t)) return "payment";
  if (/^order\b|i want to buy|buy this|i'll take|i want (one|two|3|three)/i.test(t)) return "order";
  if (/catalog|menu|list|items/i.test(t)) return "catalog";
  return "open";
}

// tiny short reply templates per tone
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
  },
  friendly_short: {
    // fallback single-sentence replies if we want even shorter
    fallback: ["Sure.", "On it.", "Okay."]
  }
};

function pick(tone, intent) {
  const set = TEMPLATES[tone] || TEMPLATES["neutral"];
  const arr = set[intent] || set["fallback"];
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function handleConversation(businessId, from, text) {
  const business = loadBusiness(businessId) || {};
  const defaultTone = business.defaultTone || "neutral";

  // user memory: check saved tone
  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || defaultTone;
  // ✅ If user has saved favorite brand, bias replies
if (userMem.favoriteBrand) {
  console.log(`User ${from} prefers ${userMem.favoriteBrand}`);
}


  // detect intent & maybe detect tone from message (simple)
  const intent = detectIntent(text);

  // ✅ Detect brand preference
if (/samsung|sammy/i.test(text)) {
  setUserMemory(from, { favoriteBrand: "Samsung" });
}

if (/iphone|apple/i.test(text)) {
  setUserMemory(from, { favoriteBrand: "iPhone" });
}

if (/tecno/i.test(text)) {
  setUserMemory(from, { favoriteBrand: "Tecno" });
}


  // If user explicitly says "talk to me in pidgin" etc (simple check)
  if (/pidgin|pidgin english|naija|local|slang|dear|boss|bro/i.test(text)) {
    tone = "friendly";
    setUserMemory(from, { tone });
  } else if (/formal|please|sir|madam|ma/i.test(text) && tone !== "polite") {
    tone = "polite";
    setUserMemory(from, { tone });
  }

  // RULE-BASED HANDLES: FAQs & catalog
  if (intent === "catalog") {
  const favorite = userMem.favoriteBrand;

  if (favorite) {
    return `Since you like ${favorite}, we have new deals on ${favorite} phones 🤝 Want me to send list?`;
  }

  const cat = (business.catalog || []).map(it => `${it.id} - ${it.name} (${it.price || "-"})`).join("\n");
  if (cat) return `Catalog:\n${cat}`;
  return pick(tone, "catalog");
}


  if (intent === "price") {
    // If user said a known product id or name, try direct lookup
    const catalog = business.catalog || [];
    const found = catalog.find(it => text.toLowerCase().includes(it.id.toLowerCase()) || text.toLowerCase().includes((it.name || "").toLowerCase()));
    if (found) return `${found.name} — ${found.price}`;
    // otherwise ask single short follow-up
    return pick(tone, "price");
  }

  if (intent === "delivery") return pick(tone, "delivery");
  if (intent === "payment") return pick(tone, "payment");
  if (intent === "order") return pick(tone, "order");

  if (intent === "greeting") return pick(tone, "greeting");

  // OPEN / fallback — use Ollama but with a short, constrained prompt
  // keep prompt minimal — ask for 1-line reply
  try {
    const prompt = `You are a Lagos phone-shop assistant. Reply in 1 short sentence (max 2 lines). Use ${tone} tone. Do NOT say you're an AI. Customer: "${text}"`;
    const ai = await askOllama(prompt, { model: "phi3" });
    // if the AI answer is long, truncate to one short line
    const oneLine = ai.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 2).join(" ");
    // keep it human-tight: <= 240 chars
    return oneLine.length > 240 ? oneLine.slice(0, 237) + "..." : oneLine;
  } catch (e) {
    console.error("askOllama fallback error:", e && e.message ? e.message : e);
    return pick(tone, "fallback");
  }
}
