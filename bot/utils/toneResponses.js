// bot/utils/toneResponses.js
// ─── FULL TONE MIRROR SYSTEM ───────────────────────────────────────────────
// Tones: pidgin | excited | slang | formal | casual | neutral

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── GREETING REPLIES ──────────────────────────────────────────────────────
export const GREETINGS = {
  pidgin: [
    "How far boss! 👊 Wetin you wan see today?",
    "Omo how you dey! 😄 Which phone you dey find?",
    "Abeg talk to me — I dey here for you 💪",
    "How far! You reach the right place 🔥 wetin dey your mind?",
  ],
  excited: [
    "Heyyyy! 🎉 Welcome welcome! What can I get for you today?!",
    "OMG hi!! 👋🔥 You came to the right place! What are you looking for?",
    "HELLO! 😍 So excited to help you! What do you need?",
  ],
  slang: [
    "Yo! 👊 What you need fam?",
    "Sup bro! You looking for something? 🔥",
    "Hey hey! What's good? I got you 💯",
    "Bro what do you need? Let's get it 🚀",
  ],
  formal: [
    "Good day. How may I assist you?",
    "Hello, welcome. Kindly let me know what you're looking for.",
    "Good morning/afternoon. I'm here to help — please go ahead.",
  ],
  casual: [
    "Hey! 👋 What are you looking for today?",
    "Hi there! What can I help you with?",
    "Hey, what's up! Looking for something specific?",
  ],
  neutral: [
    "Hello — how can I help you?",
    "Hi — what do you need today?",
    "Hey, what are you looking for?",
  ],
};

// ─── PRICE CHECK REPLIES ───────────────────────────────────────────────────
export const PRICE_ASK = {
  pidgin: [
    "Which model you wan check price? Tell me 🙏",
    "Oya tell me the phone name make I check am for you fast fast.",
    "Which one you dey find? iPhone? Samsung? Tecno? Tell me!",
  ],
  excited: [
    "Ooh nice!! 😍 Which phone? Tell me and I'll pull the price right away!",
    "Let's go!! 🔥 Which model are you checking?",
  ],
  slang: [
    "Which phone fam? Drop the name 🙌",
    "Bro which one? Hit me with the model name.",
    "What model you checking? I got all the prices fr 💯",
  ],
  formal: [
    "Please specify the phone model you'd like a price for.",
    "Kindly provide the model name and I'll give you the price.",
  ],
  casual: [
    "Which model are you looking at?",
    "Tell me the phone name and I'll check the price for you.",
  ],
  neutral: [
    "Which model are you checking?",
    "Tell me the phone name.",
  ],
};

// ─── DELIVERY REPLIES ──────────────────────────────────────────────────────
export const DELIVERY = {
  pidgin: [
    "We dey deliver within Lagos — 1 to 2 days. Outside Lagos na 2 to 4 days. You wan order?",
    "Delivery dey available! Lagos 1–2 days, outside 3–4 days. Wetin you wan order?",
  ],
  excited: [
    "Yes we deliver!! 🚀 Lagos is 1–2 days and outside Lagos is 2–4 days! Want to place an order?!",
  ],
  slang: [
    "Yeah we ship fam 📦 Lagos 1–2 days, everywhere else 3–4 days. You ordering?",
  ],
  formal: [
    "Delivery is available. Within Lagos: 1–2 business days. Outside Lagos: 2–4 business days. Would you like to proceed?",
  ],
  casual: [
    "Yes we deliver! Lagos takes 1–2 days, outside Lagos is 2–4 days. Want to place an order?",
  ],
  neutral: [
    "Delivery: Lagos 1–2 days, outside Lagos 2–4 days. Want to order?",
  ],
};

// ─── PAYMENT REPLIES ──────────────────────────────────────────────────────
export const PAYMENT = {
  pidgin: [
    "We dey accept bank transfer, Opay, PalmPay and cash on delivery. Which one work for you?",
    "You fit pay with transfer or cash. Paystack also dey available. No wahala!",
  ],
  excited: [
    "We take bank transfer, Opay, PalmPay and cash! 💳🔥 Super easy to pay! Which works for you?",
  ],
  slang: [
    "Transfer, Opay, PalmPay or cash on delivery fam. Pick one 💳",
  ],
  formal: [
    "We accept bank transfer, Opay, PalmPay, and cash on delivery. Which would you prefer?",
  ],
  casual: [
    "We take bank transfer, Opay, PalmPay or cash on delivery. Which works for you?",
  ],
  neutral: [
    "Payment: bank transfer, Opay, PalmPay, or cash on delivery.",
  ],
};

// ─── CART REPLIES ─────────────────────────────────────────────────────────
export const CART = {
  added: {
    pidgin: (name) => pick([
      `✅ ${name} don enter your cart boss! Anything else?`,
      `🔥 ${name} locked in! You wan add anything else?`,
      `Omo ${name} don land for cart. You good?`,
    ]),
    excited: (name) => pick([
      `🎉 YES! ${name} is in your cart!! Want anything else?!`,
      `🔥🔥 ${name} added!! You're doing great! Anything else?`,
    ]),
    slang: (name) => pick([
      `Bet! ${name} locked in the cart fam 🙌`,
      `💯 ${name} secured! You need anything else bro?`,
    ]),
    formal: (name) => pick([
      `${name} has been added to your cart. Would you like to add anything else?`,
      `Noted. ${name} is now in your cart.`,
    ]),
    casual: (name) => pick([
      `Done! ${name} is in your cart 🛒 Anything else?`,
      `${name} added! Want to keep shopping?`,
    ]),
    neutral: (name) => `${name} added to cart.`,
  },
  empty: {
    pidgin: "Your cart empty o. Add something first!",
    excited: "Your cart is empty!! 😮 Let's add something amazing!",
    slang: "Cart's empty fam. Add something first 😅",
    formal: "Your cart is currently empty. Please add an item to proceed.",
    casual: "Your cart is empty. Add something first!",
    neutral: "Your cart is empty.",
  },
  cleared: {
    pidgin: "Cart don clear. Fresh start! 🙌",
    excited: "Cart cleared!! Fresh slate!! 🎉",
    slang: "Cleared fam. Starting fresh 💯",
    formal: "Your cart has been cleared.",
    casual: "Cart cleared! Starting fresh.",
    neutral: "Cart cleared.",
  },
  checkout: {
    pidgin: (n) => `Oya! ${n} item(s) ready. Drop your address and let's close this deal 🙏`,
    excited: (n) => `LET'S GO!! 🚀 ${n} item(s) in cart! Drop your address and we'll process it NOW!`,
    slang: (n) => `Aight fam! ${n} item(s) locked. Drop your address and we move 💯`,
    formal: (n) => `You have ${n} item(s) in your cart. Please provide your delivery address to proceed.`,
    casual: (n) => `Ready! ${n} item(s) in your cart. Drop your address and we'll get it moving.`,
    neutral: (n) => `Checkout: ${n} item(s). Please provide your delivery address.`,
  },
};

// ─── PRODUCT REPLY BUILDER ─────────────────────────────────────────────────
export const PRODUCT = {
  found: {
    pidgin: (p) => pick([
      `${p.name} dey available — ₦${p.price.toLocaleString()} 🔥 You wan buy?`,
      `Boss, ${p.name} na ₦${p.price.toLocaleString()}. E still get ${p.stock} units. You ordering?`,
      `${p.name} dey here! Price na ₦${p.price.toLocaleString()} 💪 Abeg you wan add am to cart?`,
    ]),
    excited: (p) => pick([
      `OMG YES we have the ${p.name}!! 🎉 It's ₦${p.price.toLocaleString()} and we still have ${p.stock} units! Want it?!`,
      `🔥🔥 ${p.name} is available at ₦${p.price.toLocaleString()}!! Shall I add it to your cart?!`,
    ]),
    slang: (p) => pick([
      `Bro we got the ${p.name} 🔥 ₦${p.price.toLocaleString()}. You want it?`,
      `${p.name} is available fam — ₦${p.price.toLocaleString()}. It's clean fr 💯`,
    ]),
    formal: (p) => pick([
      `The ${p.name} is available at ₦${p.price.toLocaleString()}. We currently have ${p.stock} units in stock. Would you like to proceed?`,
      `Yes, we have the ${p.name} priced at ₦${p.price.toLocaleString()}. Shall I add it to your cart?`,
    ]),
    casual: (p) => pick([
      `Yeah we have the ${p.name}! It's ₦${p.price.toLocaleString()} and we've got ${p.stock} in stock. Want it?`,
      `${p.name} is available — ₦${p.price.toLocaleString()}. Want me to add it to your cart?`,
    ]),
    neutral: (p) =>
      `${p.name} is available — ₦${p.price.toLocaleString()}. Want to add it to your cart?`,
  },
  notFound: {
    pidgin: "Abeg which phone exactly? I no fit find am. Type the full name.",
    excited: "Hmm I couldn't find that one! 😅 Can you give me the full name?",
    slang: "Couldn't find that fam. What's the full name?",
    formal: "I'm sorry, I couldn't locate that product. Could you please provide the full model name?",
    casual: "I couldn't find that one. Can you give me the full name?",
    neutral: "Product not found. Please give me the full model name.",
  },
};

// ─── FALLBACK REPLIES ──────────────────────────────────────────────────────
export const FALLBACK = {
  pidgin: [
    "Omo I no fully understand. Tell me which phone you want.",
    "Abeg be more specific. Which device you dey find?",
    "I dey here boss. Tell me exactly wetin you need.",
  ],
  excited: [
    "Oops I didn't quite get that! 😅 Can you rephrase? I want to help!!",
    "Hmm not sure I understood! Try again? 😊",
  ],
  slang: [
    "Ngl I'm lost bro 😅 what do you need exactly?",
    "Didn't catch that fam. What are you looking for?",
  ],
  formal: [
    "I'm sorry, I didn't quite understand your request. Could you please rephrase?",
    "Apologies — could you clarify what you're looking for?",
  ],
  casual: [
    "Hmm, I didn't quite get that. What are you looking for?",
    "Not sure I understood. Can you say that again?",
  ],
  neutral: [
    "I'm here. Tell me what you need.",
    "Could you clarify what you're looking for?",
  ],
};

// ─── MAIN TONE REPLY FUNCTION ─────────────────────────────────────────────
export function toneReply(category, tone, data = null) {
  const t = tone || "neutral";

  if (category === "greeting") return pick(GREETINGS[t] || GREETINGS.neutral);
  if (category === "price_ask") return pick(PRICE_ASK[t] || PRICE_ASK.neutral);
  if (category === "delivery") return pick(DELIVERY[t] || DELIVERY.neutral);
  if (category === "payment") return pick(PAYMENT[t] || PAYMENT.neutral);
  if (category === "fallback") return pick(FALLBACK[t] || FALLBACK.neutral);

  if (category === "product_found" && data) {
    const fn = PRODUCT.found[t] || PRODUCT.found.neutral;
    return fn(data);
  }
  if (category === "product_not_found") {
    return PRODUCT.notFound[t] || PRODUCT.notFound.neutral;
  }

  if (category === "cart_added" && data) {
    const fn = CART.added[t] || CART.added.neutral;
    return typeof fn === "function" ? fn(data) : fn;
  }
  if (category === "cart_empty") return CART.empty[t] || CART.empty.neutral;
  if (category === "cart_cleared") return CART.cleared[t] || CART.cleared.neutral;
  if (category === "cart_checkout" && data !== null) {
    const fn = CART.checkout[t] || CART.checkout.neutral;
    return fn(data);
  }

  return pick(FALLBACK[t] || FALLBACK.neutral);
}
