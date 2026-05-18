// bot/services/conversationHandler.js
// ─── TONE MIRROR CONVERSATION ENGINE ──────────────────────────────────────
import fs from "fs";
import path from "path";
import { askOllama } from "./ollamaService.js";
import { getUserMemory, setUserMemory } from "./memoryService.js";
import * as cartService from "./cartService.js";
import { extractStatusInfo, matchProductFromStatus } from "./statusService.js";
import { searchProduct } from "./productService.js";
import { toneReply } from "../utils/toneResponses.js";

const BUS_FILE = path.resolve("./data/businessProfiles.json");

function loadBusiness(id) {
  try {
    if (!fs.existsSync(BUS_FILE)) return {};
    const arr = JSON.parse(fs.readFileSync(BUS_FILE, "utf8"));
    return arr.find((b) => b.id === id) || {};
  } catch {
    return {};
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   TONE DETECTION
   Returns: pidgin | excited | slang | formal | casual | neutral
───────────────────────────────────────────────────────────────────────── */
function detectToneFromText(text) {
  const t = String(text || "");

  // Nigerian Pidgin — expanded keyword list
  const pidginPattern =
    /\b(abi|wey|na|boss|omo|abeg|no wahala|dey|how far|wetin|make i|no be|sha|ehen|choke|e don|wahala|sabi|joor|biko|nawa|ginger|correct|baller|tobi|chi chi|oga|madam abi|enter|comot|shey|kai|haba|tuale|oya|chai)\b/i;

  // Slang — Gen Z / internet
  const slangPattern =
    /\b(bro|bruh|fam|lol|omg|guy|lit|goat|vibe|lowkey|highkey|fr|ngl|tbh|deadass|bussin|no cap|bet|idk|asap|lmao|lmk|smh|istg|periodt|slay|hits different)\b/i;

  // Formal / polite signals
  const formalPattern =
    /\b(please|kindly|sir|madam|thank you|good morning|good afternoon|good evening|i would like|could you|would you|i am interested|i wish to|i'd like|regards)\b/i;

  // Excitement signals — CAPS, multiple !!, multiple emojis
  const capsRatio =
    t.replace(/\s/g, "").length > 4
      ? (t.replace(/[^A-Z]/g, "").length /
          t.replace(/\s/g, "").replace(/[^a-zA-Z]/g, "").length || 0)
      : 0;
  const exclamations = (t.match(/!/g) || []).length;
  const emojiCount = (t.match(/\p{Emoji_Presentation}/gu) || []).length;
  const isExcited =
    capsRatio > 0.6 || exclamations >= 2 || emojiCount >= 3;

  const isPidgin = pidginPattern.test(t);
  const isSlang = slangPattern.test(t);
  const isFormal = formalPattern.test(t);

  // Priority order
  if (isPidgin && isExcited) return "pidgin";   // excited pidgin still reads as pidgin
  if (isPidgin) return "pidgin";
  if (isExcited && isSlang) return "excited";
  if (isExcited) return "excited";
  if (isSlang) return "slang";
  if (isFormal) return "formal";

  // Short clipped messages → casual
  const wordCount = t.trim().split(/\s+/).length;
  if (wordCount <= 3) return "casual";

  return "neutral";
}

/* ─────────────────────────────────────────────────────────────────────────
   TONE MEMORY — blends detected tone with stored tone so it evolves
   naturally across a conversation, not just locked to the first message
───────────────────────────────────────────────────────────────────────── */
const TONE_WEIGHT = {
  // How "sticky" each tone is (higher = harder to shift away from)
  pidgin: 2,
  excited: 1,
  slang: 1,
  formal: 2,
  casual: 1,
  neutral: 0.5,
};

function blendTone(stored, detected) {
  if (!stored || stored === "neutral") return detected;
  if (stored === detected) return detected;
  // If the customer's tone shifts clearly, follow it
  const strongShift = ["pidgin", "formal", "excited"];
  if (strongShift.includes(detected)) return detected;
  // Otherwise keep stored tone — don't flip on one casual message
  return stored;
}

/* ─────────────────────────────────────────────────────────────────────────
   INTENT DETECTION
───────────────────────────────────────────────────────────────────────── */
function detectIntent(text) {
  text = String(text || "").toLowerCase();

  if (/^(hi|hello|hey|how far|hiya|good morning|good afternoon|good evening|sup|yo|oya|howdy)/i.test(text))
    return "greeting";
  if (/price|how much|cost|cost of|wetin dem dey sell|e cost how much/i.test(text))
    return "price";
  if (/deliver|delivery|ship|send am come|how you go send/i.test(text))
    return "delivery";
  if (/pay|payment|transfer|paystack|opay|palmpay|card|pos|how i go pay/i.test(text))
    return "payment";
  if (/order|i want to buy|buy this|i'll take|i wan buy|make i get|i go take/i.test(text))
    return "order";
  if (/catalog|menu|list|show me|show phones|wetin you get|what you have|your items/i.test(text))
    return "catalog";

  // Cart intents
  if (/add.*cart|put.*cart|add am|i go add/i.test(text)) return "cart:add";
  if (/show.*cart|view cart|my cart|wetin dey my cart/i.test(text)) return "cart:show";
  if (/remove.*cart|delete.*cart|take am comot/i.test(text)) return "cart:remove";
  if (/checkout|pay now|place order|i wan pay/i.test(text)) return "cart:checkout";
  if (/clear cart|empty cart|reset cart/i.test(text)) return "cart:clear";

  return "open";
}

/* ─────────────────────────────────────────────────────────────────────────
   EMOJI EXTRACTION — mirror top emoji back to customer
───────────────────────────────────────────────────────────────────────── */
function extractTopEmoji(text) {
  const list = Array.from(String(text || "").matchAll(/(\p{Emoji_Presentation})/gu)).map(
    (m) => m[0]
  );
  if (list.length === 0) return "";
  const count = {};
  for (const e of list) count[e] = (count[e] || 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}

/* ─────────────────────────────────────────────────────────────────────────
   TYPING TIME — makes delays feel human
───────────────────────────────────────────────────────────────────────── */
function estimateTypingMsFor(text) {
  const length = Math.max(8, String(text).length);
  return Math.min(3500, 400 + length * 18);
}

/* ─────────────────────────────────────────────────────────────────────────
   CART LOGIC
───────────────────────────────────────────────────────────────────────── */
async function handleCartIntent(intent, from, text, tone) {
  const lower = text.toLowerCase();

  if (intent === "cart:add") {
    const m = lower.match(/add (.+?)( to cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) {
      return {
        text: tone === "pidgin"
          ? "Which item you wan add? Tell me the name."
          : "Which item would you like to add?",
        success: false,
      };
    }
    cartService.addToCart(from, { name: item, qty: 1 });
    return { text: toneReply("cart_added", tone, item), success: true };
  }

  if (intent === "cart:show") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: toneReply("cart_empty", tone), success: true };
    const list = items.map((x, i) => `${i + 1}. ${x.name} x${x.qty}`).join("\n");
    const header =
      tone === "pidgin"
        ? "Your cart:\n" + list + "\n\nYou wan checkout?"
        : tone === "slang"
        ? "Here's your cart fam:\n" + list + "\n\nReady to checkout?"
        : "Here's your cart:\n" + list + "\n\nReady to checkout?";
    return { text: header, success: true };
  }

  if (intent === "cart:remove") {
    const m = lower.match(/remove (.+?)( from cart|$)/i);
    const item = m ? m[1].trim() : null;
    if (!item) {
      return {
        text: tone === "pidgin"
          ? "Which item you wan remove?"
          : "Which item would you like to remove?",
        success: false,
      };
    }
    cartService.removeFromCart(from, item);
    const removed =
      tone === "pidgin"
        ? `${item} don remove. 👍`
        : tone === "slang"
        ? `${item} removed fam. 👍`
        : `${item} removed from your cart.`;
    return { text: removed, success: true };
  }

  if (intent === "cart:clear") {
    cartService.clearCart(from);
    return { text: toneReply("cart_cleared", tone), success: true };
  }

  if (intent === "cart:checkout") {
    const items = cartService.getCart(from);
    if (!items.length) return { text: toneReply("cart_empty", tone), success: false };
    return { text: toneReply("cart_checkout", tone, items.length), success: true };
  }

  return { text: toneReply("fallback", tone), success: false };
}

/* ─────────────────────────────────────────────────────────────────────────
   CATALOG BUILDER — pulls from products.json directly
───────────────────────────────────────────────────────────────────────── */
function buildCatalogReply(tone) {
  try {
    const _d = JSON.parse(
      fs.readFileSync(path.resolve("./data/products.json"), "utf8")
    );
    const products = _d.products || _d;
    const lines = products
      .slice(0, 10)
      .map((p, i) => `${i + 1}. ${p.name} — ₦${p.price.toLocaleString()}`)
      .join("\n");

    const headers = {
      pidgin: `Oya see our top phones 👇\n\n${lines}\n\nType any name to get full details!`,
      excited: `Here's what we've got!! 🔥🔥\n\n${lines}\n\nJust tell me which one you want!!`,
      slang: `Check the lineup fam 👇\n\n${lines}\n\nHolla at the one you want 💯`,
      formal: `Here is a selection of our available products:\n\n${lines}\n\nPlease let me know which you'd like more details on.`,
      casual: `Here's what we have:\n\n${lines}\n\nJust tell me which one interests you!`,
      neutral: `Our products:\n\n${lines}\n\nType any name for more details.`,
    };
    return headers[tone] || headers.neutral;
  } catch (err) {
    console.error("❌ CATALOG ERROR:", err.message);
    return toneReply("fallback", tone);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN HANDLER
───────────────────────────────────────────────────────────────────────── */
export async function handleConversation(businessId, from, textOrMsg) {
  loadBusiness(businessId); // kept for future multi-vendor use

  // ── Load user memory ──────────────────────────────────────────────────
  const userMem = getUserMemory(from) || {};
  let tone = userMem.tone || null;

  // ── Extract message text ──────────────────────────────────────────────
  let text = "";
  if (typeof textOrMsg === "object") {
    const msg = textOrMsg;
    const statusInfo = extractStatusInfo(msg);
    if (statusInfo) {
      const product = await matchProductFromStatus(businessId, statusInfo);
      if (product) {
        const reply = toneReply("product_found", tone || "neutral", product);
        return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
      }
      const fallback =
        tone === "pidgin"
          ? "I see your reply but I no fit identify the product. Tell me the name."
          : "I saw your reply but couldn't identify the product. What's the name?";
      return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
    }
    text =
      msg.body ||
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";
  } else {
    text = String(textOrMsg || "");
  }

  text = text.trim();
  if (!text) {
    tone = tone || "neutral";
    const fallback = toneReply("fallback", tone);
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
  }

  // ── Detect and blend tone ─────────────────────────────────────────────
  const detectedTone = detectToneFromText(text);
  tone = blendTone(tone, detectedTone);
  setUserMemory(from, { tone });   // update memory every message

  // ── Extract emoji for mirroring ───────────────────────────────────────
  const emoji = extractTopEmoji(text);

  // ── Detect intent ─────────────────────────────────────────────────────
  const intent = detectIntent(text);

  // ── Append emoji mirror to reply ──────────────────────────────────────
  function withEmoji(reply) {
    // Don't double-up if reply already contains emojis
    if (emoji && !/\p{Emoji_Presentation}/u.test(reply)) return `${reply} ${emoji}`;
    return reply;
  }

  /* ── PRODUCT AUTO-DETECTION ─────────────────────────────────────────── */
  const product = searchProduct(text);
  if (product) {
    const reply = withEmoji(toneReply("product_found", tone, product));
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [], rawIntent: "product_found" };
  }

  /* ── CART ───────────────────────────────────────────────────────────── */
  if (intent.startsWith("cart:")) {
    const result = await handleCartIntent(intent, from, text, tone);
    const output = withEmoji(result.text);
    return { text: output, tone, typingMs: estimateTypingMsFor(output), interim: [] };
  }

  /* ── GREETING ───────────────────────────────────────────────────────── */
  if (intent === "greeting") {
    const reply = withEmoji(toneReply("greeting", tone));
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ── PRICE ──────────────────────────────────────────────────────────── */
  if (intent === "price") {
    const reply = withEmoji(toneReply("price_ask", tone));
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ── DELIVERY ───────────────────────────────────────────────────────── */
  if (intent === "delivery") {
    const reply = withEmoji(toneReply("delivery", tone));
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ── PAYMENT ────────────────────────────────────────────────────────── */
  if (intent === "payment") {
    const reply = withEmoji(toneReply("payment", tone));
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ── CATALOG ────────────────────────────────────────────────────────── */
  if (intent === "catalog") {
    const reply = buildCatalogReply(tone);
    return { text: reply, tone, typingMs: estimateTypingMsFor(reply), interim: [] };
  }

  /* ── AI FALLBACK (Ollama local) ─────────────────────────────────────── */
  try {
    const toneInstructions = {
      pidgin:  "Reply in Nigerian Pidgin English. Short, warm, very natural.",
      excited: "Reply with high energy and enthusiasm. Use emojis. Keep it short.",
      slang:   "Reply in casual Gen-Z slang. Bro, fam, lowkey, etc. Keep it very short.",
      formal:  "Reply formally and professionally. One clear sentence only.",
      casual:  "Reply in casual friendly English. Keep it short.",
      neutral: "Reply naturally and helpfully. One short sentence only.",
    };

    const prompt = `You are a REAL human shop assistant in a Lagos phone store named Sammy's Market.

TONE RULES: ${toneInstructions[tone] || toneInstructions.neutral}

HARD RULES:
- ONE sentence only. No more.
- Never say "I am an AI" or "I am a bot" — ever.
- Never repeat the customer's message back to them.
- If message is not about phones or shopping: reply "Tell me the phone you want."
- Stay warm, calm and real.

Customer message: "${text}"
Your reply:`;

    let ai = await askOllama(prompt);
    ai = String(ai || "")
      .replace(/\n/g, " ")
      .replace(/"/g, "")
      .trim();
    ai = ai.split(/[.!?]/)[0].trim();
    if (ai.length > 160) ai = ai.slice(0, 150) + "...";

    const final = withEmoji(ai);
    return { text: final, tone, typingMs: estimateTypingMsFor(final), interim: [] };
  } catch {
    const fallback = withEmoji(toneReply("fallback", tone));
    return { text: fallback, tone, typingMs: estimateTypingMsFor(fallback), interim: [] };
  }
}
