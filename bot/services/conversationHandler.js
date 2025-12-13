// bot/services/conversationHandler.js
import fs from "fs";
import path from "path";
import { askOllama } from "./ollamaService.js";
import { getUserMemory, setUserMemory } from "./memoryService.js";
import * as cartService from "./cartService.js";
import { extractStatusInfo, matchProductFromStatus } from "./statusService.js";
import { searchProduct } from "./productService.js";
import { productReply } from "./productReplies.js";


const BUS_FILE = path.resolve("./data/businessProfiles.json");

function loadBusiness(id) {
  try {
    if (!fs.existsSync(BUS_FILE)) return {};
    const arr = JSON.parse(fs.readFileSync(BUS_FILE, "utf8"));
    return arr.find(b => b.id === id) || {};
  } catch {
    return {};
  }
}

/* ----------------------------
   INTENT DETECTION
---------------------------- */
function detectIntent(text) {
  text = String(text || "").toLowerCase();

  if (/^(hi|hello|hey|how far|hiya|good morning|good afternoon|good evening)/i.test(text)) return "greeting";
  if (/price|how much|cost|price of/i.test(text)) return "price";
  if (/deliver|delivery|ship/i.test(text)) return "delivery";
  if (/pay|payment|transfer|paystack|card|pos/i.test(text)) return "payment";
  if (/order|i want to buy|buy this|i'll take|i wan buy/i.test(text)) return "order";
  if (/catalog|menu|list|items|show phones/i.test(text)) return "catalog";

  // cart
  if (/add.*cart|put.*cart/i.test(text)) return "cart:add";
  if (/show.*cart|view cart|my cart/i.test(text)) return "cart:show";
  if (/remove.*cart|delete.*cart/i.test(text)) return "cart:remove";
  if (/checkout|pay now|place order/i.test(text)) return "cart:checkout";
  if (/clear cart|empty cart/i.test(text)) return "cart:clear";

  return "open";
}

/* ----------------------------
   TONE DETECTOR
---------------------------- */
function detectToneFromText(text) {
  const t = String(text || "");

  const pidgin = /\b(abi|wey|na|boss|omo|abeg|no wahala|dey|how far)\b/i.test(t);
  const slang = /\b(bro|bruh|fam|lol|omg|guy)\b/i.test(t);
  const polite = /please|kindly|sir|madam|thank/i.test(t);

  if (pidgin || slang) return "friendly";
  if (polite) return "polite";
  return "neutral";
}

/* ----------------------------
   EMOJI MIRROR
---------------------------- */
function extractTopEmoji(text) {
  const list = Array.from(String(text || "").matchAll(/([\p{Emoji}])/gu)).map(m => m[1]);
  if (list.length === 0) return "";
  const count = {};
  for (const e of list) count[e] = (count[e] || 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}


/* ----------------------------
   QUICK TEMPLATES
---------------------------- */
const TEMPLATES = {
  friendly: {
    greeting: ["How far boss? 👋", "Omo how you dey? 😄", "Wetin you need boss?"],
    price: ["Which phone model you wan check?", "Tell me the model make I check am for you."],
    fallback: ["I dey here for you.", "Tell me wetin you need boss."]
  },
  polite: {
    greeting: ["Hello, how may I assist you today?", "Good day, how can I help you?"],
    price: ["Please tell me the phone model.", "Kindly confirm the item name for pricing."],
    fallback: ["I'm here to help.", "Kindly tell me what you need."]
  },
  neutral: {
    greeting: ["Hello — how can I help you?", "Hi — what do you need today?"],
    price: ["Which model are you checking?", "Tell me the model name."],
    fallback: ["I'm here.", "Tell me what you need."]
  }
};

function pickTemplate(tone, intent) {
  const set = TEMPLATES[tone] || TEMPLATES.neutral;
  const list = set[intent] || set.fallback;
  return list[Math.floor(Math.random() * list.length)];
}


/* ----------------------------
   TYPING TIME
---------------------------- */
function estimateTypingMsFor(text) {
  const length = Math.max(8, String(text).length);
  return Math.min(3500, 300 + length * 15);
}

/* ----------------------------
   CART LOGIC
---------------------------- */
async function handleCartIntent(intent, from, text) {
  const lower = text.toLowerCase();

  if (intent === "cart:add") {
    const m = lower.match(/add (.+?)( to cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) return { text: "Which item you wan add?", success: false };
    cartService.addToCart(from, { name: item, qty: 1 });
    return { text: `${item} added to cart.`, success: true };
  }

  if (intent === "cart:show") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: "Your cart is empty.", success: true };
    return { text: "Your cart:\n" + items.map((x, i) => `${i + 1}. ${x.name} x${x.qty}`).join("\n"), success: true };
  }

  if (intent === "cart:remove") {
    const m = lower.match(/remove (.+?)( from cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) return { text: "Which item you wan remove?", success: false };
    cartService.removeFromCart(from, item);
    return { text: `${item} removed.`, success: true };
  }

  if (intent === "cart:clear") {
    cartService.clearCart(from);
    return { text: "Cart cleared.", success: true };
  }

  if (intent === "cart:checkout") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: "Nothing to checkout.", success: false };
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
  let tone = userMem.tone || "neutral";

  let text = "";

  // extract message
  if (typeof textOrMsg === "object") {
    const msg = textOrMsg;
    const statusInfo = extractStatusInfo(msg);

    if (statusInfo) {
      const product = await matchProductFromStatus(businessId, statusInfo);
      if (product) {
        const reply = `You replied to *${product.name}*. Price: ₦${product.price}. Want it?`;
        return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
      }
      const reply = "I see your reply but I no fit identify the product. Tell me name.";
      return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
    }

    text = msg.body || msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  } else {
    text = String(textOrMsg || "");
  }

  text = text.trim();
  if (!text) {
    const fallback = pickTemplate(tone, "fallback");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
  }

  // detect tone automatically
  const autoTone = detectToneFromText(text);
  if (!userMem.tone) {
    tone = autoTone;
    setUserMemory(from, { tone });
  }

  const emoji = extractTopEmoji(text);
  const intent = detectIntent(text);

  /* ----------------------
   PRODUCT AUTO-DETECTION
----------------------- */
const product = searchProduct(text);

if (product) {
  const reply = productReply(product, tone);
  const final = emoji ? `${reply} ${emoji}` : reply;

  return {
    text: final,
    tone,
    typingMs: estimateTypingMsFor(final),
    interim: [],
    rawIntent: "product_found"
  };
}


  /* CART */
  if (intent.startsWith("cart:")) {
    const result = await handleCartIntent(intent, from, text);
    const output = emoji ? `${result.text} ${emoji}` : result.text;
    return { text: output, tone, typingMs: estimateTypingMsFor(output), interim: [] };
  }

  /* RULE-BASED */
  if (intent === "greeting") {
    const reply = pickTemplate(tone, "greeting") + (emoji ? ` ${emoji}` : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  if (intent === "price") {
    const reply = pickTemplate(tone, "price") + (emoji ? ` ${emoji}` : "");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  if (intent === "catalog") {
    const list = (business.catalog || []).map(it => `${it.id} - ${it.name} (${it.price})`).join("\n");
    const reply = list || pickTemplate(tone, "fallback");
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* AI FALLBACK */
  try {
    const prompt = `
You are a REAL human shop assistant inside a Lagos phone shop.

RULES:
- If customer greets, reply with greeting.
- Match their language (Pidgin or English).
- Reply in ONE short natural sentence only.
- Never argue.
- Never give long replies.
- Never repeat their message.
- If message no relate to phones: reply "Tell me the phone you want."
- Stay calm, warm and human.

Customer: "${text}"
Reply:`;

    let ai = await askOllama(prompt);

    ai = String(ai || "")
      .replace(/\n/g, " ")
      .replace(/\"/g, "")
      .trim();

    ai = ai.split(/[.!?]/)[0];

    if (ai.length > 150) ai = ai.slice(0, 140) + "...";

    const final = emoji ? `${ai} ${emoji}` : ai;

    return {
      text: final,
      tone,
      typingMs: estimateTypingMsFor(final),
      interim: []
    };
  } catch {
    const fallback = pickTemplate(tone, "fallback");
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
  }
}
