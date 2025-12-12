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

/* ----------------------------
   INTENT DETECTION
---------------------------- */
function detectIntent(t) {
  t = String(t || "").toLowerCase();

  if (/^(hi|hello|hey|hiya)/i.test(t)) return "greeting";
  if (/price|how much|cost|price of/i.test(t)) return "price";
  if (/deliver|delivery|ship/i.test(t)) return "delivery";
  if (/pay|payment|transfer|paystack|card/i.test(t)) return "payment";
  if (/order|i want to buy|buy this|i'll take/i.test(t)) return "order";
  if (/catalog|menu|list|items/i.test(t)) return "catalog";

  // cart
  if (/add.*cart|put.*cart/i.test(t)) return "cart:add";
  if (/show.*cart|view cart|my cart/i.test(t)) return "cart:show";
  if (/remove.*cart|delete.*cart/i.test(t)) return "cart:remove";
  if (/checkout|pay now|place order/i.test(t)) return "cart:checkout";
  if (/clear cart|empty cart/i.test(t)) return "cart:clear";

  return "open";
}

/* ----------------------------
   TONE DETECTOR
---------------------------- */
function detectToneFromText(t) {
  t = String(t || "");

  const hasEmoji = /[\p{Emoji}]/u.test(t);
  const pidgin = /\b(abi|wey|na|boss|omo|abeg|no wahala|dey)\b/i.test(t);
  const slang = /\b(bro|bruh|fam|lol|omg)\b/i.test(t);
  const formal = /please|kindly|sir|madam/i.test(t);
  const caps = /^[A-Z0-9 !?.,'"`-]{4,}$/i.test(t);

  if (pidgin || slang || hasEmoji || caps) return "friendly";
  if (formal) return "polite";

  return "neutral";
}

/* ----------------------------
   EMOJI MIRROR
---------------------------- */
function extractTopEmoji(text) {
  const found = Array.from(String(text || "").matchAll(/([\p{Emoji}])/gu)).map(m => m[1]);
  if (!found.length) return "";
  const counts = {};
  for (const e of found) counts[e] = (counts[e] || 0) + 1;
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0] || "";
}

/* ----------------------------
   TEMPLATES
---------------------------- */
const TEMPLATES = {
  friendly: {
    greeting: [
      "Hey boss 👋 Wetin you find?",
      "Omo! How far? 😄",
      "Hi boss — how I fit help you?"
    ],
    price: [
      "Which phone model you wan check?",
      "Tell me the model make I run am quick."
    ],
    fallback: ["One sec boss 👀", "Hold on make I check something…"]
  },

  polite: {
    greeting: ["Hello. How may I assist you today?", "Good day — how can I help you?"],
    price: ["Please tell me the phone model.", "Kindly confirm the item name for pricing."],
    fallback: ["One moment…", "Let me confirm please."]
  },

  neutral: {
    greeting: ["Hello — how can I help?", "Hi — what do you need?"],
    price: ["Which model?", "Tell me the model name."],
    fallback: ["Okay, checking…", "Let me confirm."]
  }
};

function pickTemplate(tone, intent) {
  const set = TEMPLATES[tone] || TEMPLATES.neutral;
  const arr = set[intent] || set.fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ----------------------------
   TYPING ESTIMATOR
---------------------------- */
function estimateTypingMsFor(text) {
  const length = Math.max(10, String(text).length);
  return Math.min(5500, Math.round((length / 20) * 1000) + 400);
}

/* ----------------------------
   CART LOGIC
---------------------------- */
async function handleCartIntent(intent, from, text) {
  const lower = text.toLowerCase();

  if (intent === "cart:add") {
    const m = lower.match(/add (.+?)(?: to cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) return { text: "Which item you wan add boss?", success: false };

    cartService.addToCart(from, { name: item, qty: 1 });
    return { text: `👌 ${item} don enter your cart.`, success: true };
  }

  if (intent === "cart:show") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: "Your cart empty boss 😅", success: true };
    return {
      text: "Your cart:\n" + items.map((x,i)=> `${i+1}. ${x.name} x${x.qty||1}`).join("\n"),
      success: true
    };
  }

  if (intent === "cart:remove") {
    const m = lower.match(/remove (.+?)(?: from cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) return { text: "Which item you wan remove?", success: false };

    cartService.removeFromCart(from, item);
    return { text: `Removed *${item}* from cart.`, success: true };
  }

  if (intent === "cart:clear") {
    cartService.clearCart(from);
    return { text: "Cart cleared 👍", success: true };
  }

  if (intent === "cart:checkout") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: "Cart empty — nothing to checkout 😅", success: false };
    return { text: `Checkout started for ${items.length} item(s).`, success: true };
  }

  return { text: "Cart error.", success: false };
}

/* ----------------------------
   MAIN HANDLER
---------------------------- */
export async function handleConversation(businessId, from, textOrMsg) {
  const business = loadBusiness(businessId);
  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || business.defaultTone || "neutral";

  let text = "";

  // Status replies also stay the same
  if (typeof textOrMsg === "object" && textOrMsg?.message) {
    const msg = textOrMsg;

    const statusInfo = extractStatusInfo(msg);
    if (statusInfo) {
      const product = await matchProductFromStatus(businessId, statusInfo);
      if (product) {
        const reply = `🔎 You replied to *${product.name}*\nPrice: ₦${product.price}\nStock: ${product.stock}\n\nWant to order it?`;
        return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: ["Hold on boss…"], rawIntent: "status" };
      }
      const reply = "👀 I see your status reply but I no recognise the product. Tell me the name.";
      return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "status:unknown" };
    }

    text = msg.message?.conversation ||
           msg.message?.extendedTextMessage?.text ||
           msg.body ||
           "";
  } else {
    text = String(textOrMsg || "");
  }

  text = text.trim();
  if (!text) {
    const fallback = pickTemplate(tone, "fallback");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback) };
  }

  // Auto tone detection
  const autoTone = detectToneFromText(text);
  if (!userMem.tone) {
    tone = autoTone;
    setUserMemory(from, { tone });
  }

  const topEmoji = extractTopEmoji(text);
  const intent = detectIntent(text);

  /* ----------------------
     CART INTENTS
  ----------------------- */
  if (intent.startsWith("cart:")) {
    const cartReply = await handleCartIntent(intent, from, text);
    const output = topEmoji ? `${cartReply.text} ${topEmoji}` : cartReply.text;
    return { text: output, tone, typingMs: estimateTypingMsFor(output), interim: [], rawIntent: intent };
  }

  /* ----------------------
     RULE-BASED (fast)
  ----------------------- */
  if (intent === "greeting") {
    const reply = pickTemplate(tone, "greeting") + (topEmoji ? ` ${topEmoji}` : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  if (intent === "price") {
    const reply = pickTemplate(tone, "price") + (topEmoji ? ` ${topEmoji}` : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  if (intent === "catalog") {
    const catalog = business.catalog || [];
    const list = catalog.map(it => `${it.id} - ${it.name} (${it.price})`).join("\n");
    const reply = list || pickTemplate(tone, "catalog");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ----------------------
     AI FALLBACK (SAFE + SHORT)
  ----------------------- */
  try {
    const prompt = `
You are a Lagos phone-shop WhatsApp assistant.
Reply in ONE short sentence only.
Mirror customer's vibe (pidgin, casual, polite).
Use ${tone} tone.
Never list multiple options.
Never give multiple sentences.
Never write bullet points.
Customer said: "${text}"
`;

    let ai = await askOllama(prompt, { model: "phi3" });

    // Force single sentence
    ai = ai.split(/[.\n]/)[0].trim();

    // Limit length
    if (ai.length > 160) ai = ai.slice(0, 157) + "...";

    const final = topEmoji ? `${ai} ${topEmoji}` : ai;

    return {
      text: final,
      tone,
      typingMs: estimateTypingMsFor(final),
      interim: ["Hold on boss…"],
      rawIntent: "ai_fallback"
    };
  } catch (err) {
    console.error("AI error:", err);
    const fallback = pickTemplate(tone, "fallback");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
  }
}
