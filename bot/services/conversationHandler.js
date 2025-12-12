// bot/services/conversationHandler.js
import fs from "fs";
import path from "path";
import { askOllama } from "./ollamaService.js";
import { getUserMemory, setUserMemory } from "./memoryService.js";
import * as cartService from "./cartService.js";
import { extractStatusInfo, matchProductFromStatus } from "./statusService.js";

const BUS_FILE = path.resolve("./data/businessProfiles.json");

function loadBusiness(id) {
  try {
    if (!fs.existsSync(BUS_FILE)) return {};
    const arr = JSON.parse(fs.readFileSync(BUS_FILE, "utf8"));
    return arr.find(b => b.id === id) || {};
  } catch (e) {
    console.error("loadBusiness error:", e);
    return {};
  }
}

// ----------------------------
// Basic intent detection
// ----------------------------
function detectIntent(text) {
  const t = String(text || "").toLowerCase();
  if (/^(hi|hello|hey|\bhowdy\b|\bhiya\b)/i.test(t)) return "greeting";
  if (/(\bprice\b|\bhow much\b|\bhow much is\b|\bprice of\b|\bcost\b)/i.test(t)) return "price";
  if (/(\bdeliver|delivery|ship)/i.test(t)) return "delivery";
  if (/(\bpay|payment|transfer|paystack|card)/i.test(t)) return "payment";
  if (/^order\b|i want to buy|buy this|i'll take|i want (one|two|three|3)/i.test(t)) return "order";
  if (/catalog|menu|list|items/i.test(t)) return "catalog";

  // cart-related
  if (/\badd\b.*\bto cart\b|\badd\b.*cart|\bput.*cart\b|\badd.*to my cart\b/i.test(t)) return "cart:add";
  if (/\bshow\b.*\bcart\b|\bmy cart\b|\bview cart\b/i.test(t)) return "cart:show";
  if (/\bremove\b.*from cart\b|\bdelete\b.*cart\b|\bremove.*cart\b/i.test(t)) return "cart:remove";
  if (/\bcheckout\b|\bpay now\b|\bplace order\b/i.test(t)) return "cart:checkout";
  if (/\bclear cart\b|\bempty cart\b/i.test(t)) return "cart:clear";

  return "open";
}

// ----------------------------
// Tone detection (pidgin/friendly/polite/neutral)
// ----------------------------
function detectToneFromText(text) {
  const t = String(text || "");
  const hasEmoji = /[\p{Emoji}]/u.test(t);
  const hasPidginWords = /\b(abi|wey|na|boss|omo|abeg|no wahala|waka|dey)\b/i.test(t);
  const hasSlang = /\b(bro|bra|fam|bruh|lol|omg|abi|broski)\b/i.test(t);
  const isFormal = /please|kindly|sir|madam|regards|thank you|thanks/i.test(t);
  const manyExclam = (t.match(/!/g) || []).length >= 2;
  const allCaps = /^[^a-z]*[A-Z0-9 !?.,'"`-]{2,}$/.test(t) && /[A-Z]/.test(t);

  if (hasPidginWords || (hasSlang && /abeg|no wahala|omo/i.test(t))) return "friendly";
  if (hasEmoji && (hasSlang || t.trim().length < 40)) return "friendly";
  if (manyExclam || allCaps) return "friendly";
  if (isFormal) return "polite";
  return "neutral";
}

// ----------------------------
// Quick emoji extractor (mirror top emoji)
// ----------------------------
function extractTopEmoji(text) {
  const emojiMatches = Array.from(String(text || "").matchAll(/([\p{Emoji}])/gu)).map(m => m[1]);
  if (!emojiMatches.length) return "";
  // return most frequent emoji
  const counts = {};
  for (const e of emojiMatches) counts[e] = (counts[e] || 0) + 1;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0] || "";
}

// ----------------------------
// Templates for quick replies (tone-aware)
// ----------------------------
const TEMPLATES = {
  friendly: {
    greeting: ["Hey boss 👋 Which phone you dey find?", "Omo! Wetin you want? 😄", "Hi — how can I help you today?"],
    price: ["Which model you dey look for? I go check price now.", "Tell me the model and I go give you price quick."],
    fallback: ["One sec, I go check 👀", "I dey on it — hold on small."]
  },
  polite: {
    greeting: ["Hello. How may I assist you today?", "Good day — how can I help?"],
    price: ["Please tell me the model so I can provide pricing.", "Kindly confirm the model name for the price."],
    fallback: ["One moment, checking...", "I will check and get back."]
  },
  neutral: {
    greeting: ["Hello — how can I help?", "Hi — what do you need?"],
    price: ["Which model would you like the price for?", "Tell me the model name."],
    fallback: ["Okay — checking now.", "Let me confirm and reply."]
  }
};
function pickTemplate(tone, intent) {
  const set = TEMPLATES[tone] || TEMPLATES.neutral;
  const arr = set[intent] || set.fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ----------------------------
// Helper: produce a human-ish typing time (ms) based on message length
// ----------------------------
function estimateTypingMsFor(text) {
  const len = Math.max(10, String(text || "").length);
  // baseline typing speed about 15-25 chars/sec; compute to feel human
  const ms = Math.min(7000, Math.round((len / 18) * 1000) + 500);
  return ms;
}

// ----------------------------
// Shopping / cart helpers (uses cartService)
// ----------------------------
async function handleCartIntent(intent, from, text) {
  const lower = String(text || "").toLowerCase();

  if (intent === "cart:add") {
    // crude product extraction: try "add <product> to cart" or "add <product>"
    const m = lower.match(/(?:add|put)\s+(?:the\s+)?(.+?)(?:\s+to\s+cart|\s*$)/i);
    const itemName = m ? m[1].trim() : null;
    if (!itemName) return { text: "Which item you wan add? Tell me name small.", success: false };

    const item = { name: itemName, qty: 1 };
    cartService.addToCart(from, item);
    return { text: `👌 ${itemName} don enter your cart. Want to checkout or continue shopping?`, success: true };
  }

  if (intent === "cart:show") {
    const cart = cartService.getCart(from);
    if (!cart || cart.length === 0) return { text: "Your cart empty boss — want to add something?", success: true };
    const list = cart.map((it,i)=>`${i+1}. ${it.name} x${it.qty||1}`).join("\n");
    return { text: `Your cart:\n${list}`, success: true };
  }

  if (intent === "cart:remove") {
    const m = lower.match(/(?:remove|delete)\s+(?:the\s+)?(.+?)(?:\s+from\s+cart|\s*$)/i);
    const itemName = m ? m[1].trim() : null;
    if (!itemName) return { text: "Which item you wan remove? tell me name.", success: false };
    cartService.removeFromCart(from, itemName);
    return { text: `Removed *${itemName}* from your cart (if it was there).`, success: true };
  }

  if (intent === "cart:clear") {
    cartService.clearCart(from);
    return { text: "Your cart clear now. Want anything else?", success: true };
  }

  if (intent === "cart:checkout") {
    const cart = cartService.getCart(from);
    if (!cart || cart.length === 0) return { text: "Your cart empty — nothing to checkout.", success: false };
    // simple placeholder: in future integrate real payment
    return { text: `Checkout started. We will contact you to complete payment for ${cart.length} item(s).`, success: true };
  }

  return { text: "Cart error or unknown cart intent.", success: false };
}

// ----------------------------
// MAIN: handleConversation
// returns an object: { text, tone, interim: [], typingMs, rawIntent }
// ----------------------------
export async function handleConversation(businessId, from, textOrMsg) {
  const business = loadBusiness(businessId) || {};
  const defaultTone = business.defaultTone || "neutral";

  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || defaultTone;

  let text = "";

  // 1) If incoming is a message object (from whatsapp library), preserve logic
  if (typeof textOrMsg === "object" && textOrMsg?.message) {
    const msg = textOrMsg;
    try {
      const statusInfo = extractStatusInfo(msg);
      if (statusInfo) {
        const product = await matchProductFromStatus(businessId, statusInfo);
        if (product) {
          const name = product.name || product.title || "product";
          const price = product.price ?? product.amount ?? "–";
          const stock = product.stock ?? product.inventory ?? (product.inStock ? "Yes" : "Unknown");
          const reply = `🔎 You replied to a post about *${name}*\nPrice: ₦${price}\nStock: ${stock}\n\nWould you like to order it?`;
          const typingMs = estimateTypingMsFor(reply);
          return { text: reply, tone, typingMs, interim: [], rawIntent: "status:reply" };
        }
        const reply = `I saw you replied to a status but couldn't identify the product. Please tell me the product name so I can assist you.`;
        return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "status:reply:unknown" };
      }
    } catch (err) {
      console.error("Status handling error:", err);
    }

    // Not a status: extract plain body/extended text
    text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.body || "";
  } else {
    text = String(textOrMsg || "");
  }

  text = text.trim();
  if (!text) {
    const fallback = pickTemplate(tone, "fallback");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [], rawIntent: "empty" };
  }

  // Tone auto-detection (and persist if not set)
  const autoTone = detectToneFromText(text);
  if (!userMem.tone) {
    tone = autoTone || tone;
    setUserMemory(from, { tone });
  }

  // Emoji mirror
  const topEmoji = extractTopEmoji(text);

  // Intent detection
  const intent = detectIntent(text);

  // CART flows
  if (intent.startsWith("cart:")) {
    const cartResult = await handleCartIntent(intent, from, text);
    // attach emoji if exists
    const replyText = topEmoji ? `${cartResult.text} ${topEmoji}` : cartResult.text;
    return { text: replyText, tone, typingMs: estimateTypingMsFor(replyText), interim: [], rawIntent: intent };
  }

  // RULE-BASED: catalog / price / greeting / order / delivery / payment
  if (intent === "catalog") {
    // prefer remembered brand
    const favorite = userMem.favoriteBrand;
    let reply;
    if (favorite) {
      reply = `Since you like ${favorite}, we have new deals on ${favorite} phones 🤝 Want me to send list?`;
    } else {
      const cat = (business.catalog || []).map(it => `${it.id} - ${it.name} (${it.price || "-"})`).join("\n");
      reply = cat ? `Catalog:\n${cat}` : pickTemplate(tone, "catalog");
    }
    if (topEmoji) reply += ` ${topEmoji}`;
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "catalog" };
  }

  if (intent === "price") {
    const catalog = business.catalog || [];
    const found = catalog.find(it =>
      text.toLowerCase().includes((it.id || "").toLowerCase()) ||
      text.toLowerCase().includes(((it.name || "")).toLowerCase())
    );
    if (found) {
      const reply = `${found.name} — ${found.price}${topEmoji ? " " + topEmoji : ""}`;
      return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "price:found" };
    }
    const reply = pickTemplate(tone, "price") + (topEmoji ? " " + topEmoji : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "price" };
  }

  if (intent === "greeting") {
    const reply = pickTemplate(tone, "greeting") + (topEmoji ? " " + topEmoji : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "greeting" };
  }

  // Order/delivery/payment quick templates
  if (intent === "order" || intent === "delivery" || intent === "payment") {
    const reply = pickTemplate(tone, intent) + (topEmoji ? " " + topEmoji : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: intent };
  }

  // FINAL: AI fallback — ask Ollama / OpenAI but instruct it to match tone & be short
  try {
    const basePrompt = `
You are a Lagos phone-shop assistant on WhatsApp. Mirror the customer's personality (pidgin, casual, polite, emojis) and keep replies short (1 sentence, max 2 lines). Use ${tone} tone. Do NOT say you're an AI. Customer: "${text}"
`;
    const ai = await askOllama(basePrompt, { model: "phi3" });
    // tidy
    const oneLine = String(ai || "").split("\n").map(s => s.trim()).filter(Boolean).slice(0,2).join(" ");
    const safeReply = oneLine || pickTemplate(tone, "fallback");
    const reply = topEmoji ? `${safeReply} ${topEmoji}` : safeReply;

    // interim suggestions: small human-like "hold on" for longer thought
    const typingMs = estimateTypingMsFor(reply);
    const interim = typingMs > 2000 ? ["Hold on boss…", "Checking for you…"] : [];
    return { text: reply.length > 240 ? reply.slice(0,237)+"..." : reply, tone, typingMs, interim, rawIntent: "ai_fallback" };
  } catch (err) {
    console.error("askOllama fallback error:", err);
    const fallback = pickTemplate(tone, "fallback") + (topEmoji ? " " + topEmoji : "");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [], rawIntent: "fallback_error" };
  }
}
