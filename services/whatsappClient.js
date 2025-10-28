// // services/whatsappClient.js
// import pkg from "whatsapp-web.js";
// const { Client, LocalAuth } = pkg;
// import qrcode from "qrcode-terminal";
// import dotenv from "dotenv";
// import { logMessage } from "./logger.js";
// import { handleCommand } from "./commands.js";
// import { getProfile, updateProfile } from "./profiles.js";
// import { getMemory, addToMemory, saveMemory } from "./memory.js";
// import { getAIReply } from "./openaiService.js";
// import { findProduct, findProductsUnder, deductStock, suggestSimilar } from "./productService.js";
// import { addToCart, removeFromCart, getCart, clearCart } from "./cartService.js";
// import { logOrder, getOrdersByUser } from "./orderService.js";
// import { logCartAction } from "./logService.js";
// import { tone } from "../utils/toneResponses.js";
// import { detectTone, getToneStyle } from "../utils/personality.js";
// import { detectGreeting, detectCasualStart, getGreetingReply, getCasualReply } from "./conversationHandler.js";
// import { searchProducts } from "../utils/productEngine.js";
// import { smartProductSearch } from "../utils/productEngine.js";
// import { getChromePath } from "../chromePath.js";
// // import { Client, LocalAuth } from "whatsapp-web.js";









// // 🧠 Store last upsell suggestion per user
// const lastSuggested = {}; // { userId: productObject }



// const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";


// // 💳 Simple checkout summary generator
// function checkoutCart(userId) {
//   const cart = getCart(userId);
//   if (cart.length === 0) return null;

//   const total = cart.reduce((sum, item) => sum + item.price, 0);
//   const summary = {
//     orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
//     timestamp: Date.now(),
//     items: cart,
//     total,
//   };

//   clearCart(userId); // empty cart after checkout
//   logMessage(userId, "event", `CHECKOUT ${summary.orderId}`);
//   return summary;
// }



// dotenv.config();

// // 🕒 Delay helper
// function delay(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// // 🎬 Animate “Jarvis is typing…” dynamically on the same message
// async function animateTyping(typingMessage) {
//   const frames = [
//     "💬 Jarvis is typing",
//     "💬 Jarvis is typing.",
//     "💬 Jarvis is typing..",
//     "💬 Jarvis is typing..."
//   ];
//   let i = 0;

//   const interval = setInterval(async () => {
//     try {
//       await typingMessage.edit(frames[i % frames.length]);
//       i++;
//     } catch (err) {
//       clearInterval(interval); // Stop animation if editing fails
//     }
//   }, 700); // adjust animation speed here

//   return interval; // return interval for later clearing
// }

// // 🗑️ Delete a message safely
// async function deleteMessage(client, chatId, messageId) {
//   try {
//     const chat = await client.getChatById(chatId);
//     const messages = await chat.fetchMessages({ limit: 20, fromMe: true });

//     // Look for a match by _serialized (safer)
//     const msgToDelete = messages.find(
//       (m) => m.id._serialized === messageId
//     );

//     if (msgToDelete) {
//       await msgToDelete.delete(true);
//       console.log(`🗑️ Deleted typing placeholder in ${chatId}`);
//     } else {
//       console.warn("⚠️ Typing message not found for deletion.");
//     }
//   } catch (err) {
//     console.warn("⚠️ Could not delete typing message:", err.message);
//   }
// }

// // try to no-op the LocalWebCache.persist so whatsapp-web.js won't crash
// try {
//   const mod = await import("whatsapp-web.js/src/webCache/LocalWebCache.js");
//   if (mod && mod.default) {
//     const LocalWebCache = mod.default;
//     // override persist to avoid the regex crash in some versions
//     LocalWebCache.prototype.persist = async function () { return; };
//     console.log("⚙️ Patched LocalWebCache.persist() to no-op.");
//   }
// } catch (e) {
//   // If this import fails it's OK — we continue without patching.
//   console.warn("⚠️ Could not patch LocalWebCache (maybe package layout changed):", e.message);
// }



// const client = new Client({
// //   authStrategy: new LocalAuth(),
// authStrategy: new LocalAuth({
//   clientId: "main-session", // or any name
//   dataPath: "./sessions"    // custom folder for session persistence
// }),

//   puppeteer: {
//     headless: true,
//     executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-accelerated-2d-canvas",
//       "--no-first-run",
//       "--no-zygote",
//       "--disable-gpu",
//     ],
//   },
// });




// // 🚀 Start WhatsApp client
// export async function startWhatsAppClient() {
//   // 🔳 Generate QR for first-time login
//   client.on("qr", (qr) => {
//     qrcode.generate(qr, { small: true });
//     console.log("📱 Scan this QR code in WhatsApp (Linked Devices → Link a Device).");
//   });

//   // ✅ Confirm ready
//   client.on("ready", () => {
//     console.log("✅ WhatsApp client ready — session saved (LocalAuth).");
//   });


//   // 🎲 Add randomness to make typing feel human
// function randomDelay(base, variance = 500) {
//   return base + Math.floor(Math.random() * variance);
// }

//   // ❌ Handle auth failure
//   client.on("auth_failure", (msg) => {
//     console.error("❌ Auth failure:", msg);
//   });

//   // ⚠️ Handle disconnection
//   client.on("disconnected", (reason) => {
//     console.warn("⚠️ WhatsApp client disconnected:", reason);
//   });

//   // 💬 Handle incoming messages
//   client.on("message", async (msg) => {

//     const text = msg.body.trim();

// if (detectGreeting(text)) {
//   const chat = await msg.getChat();
//   await delay(randomDelay(400, 800));
//   await chat.sendStateTyping();
//   await delay(randomDelay(1500, 1000));
//   await client.sendMessage(msg.from, getGreetingReply());
//   return;
// }

// if (detectCasualStart(text)) {
//   const chat = await msg.getChat();
//   await delay(randomDelay(400, 800));
//   await chat.sendStateTyping();
//   await delay(randomDelay(2000, 1000)); // 2–3 seconds typing before reply
//   await client.sendMessage(msg.from, getCasualReply());
//   return;
// }


//   try {
//     if (!msg || msg.from === "status@broadcast" || msg.from.endsWith("@g.us")) return;

//     const userId = msg.from;
//     const text = msg.body?.trim();
//     if (!text) return;



// if (text.toLowerCase().includes("show my orders")) {
//   try {
//     const fs = await import("fs");
//     function safeReadJSON(path) {
//       try {
//         if (!fs.existsSync(path)) return [];
//         const data = fs.readFileSync(path, "utf8");
//         return JSON.parse(data || "[]");
//       } catch (error) {
//         console.error("❌ Error reading JSON:", error);
//         return [];
//       }
//     }

//     const logs = safeReadJSON("./data/cartLogs.json");
//     const userOrders = logs.filter(
//       (l) => l.userId === userId && l.action === "CHECKOUT"
//     );

//     if (userOrders.length === 0) {
//       await msg.reply("🧾 You don’t have any past orders yet.");
//       return;
//     }

//     let reply = "🛍 *Your Past Orders:*\n\n";
//     for (const order of userOrders) {
//       const itemsList = (order.items || [])
//         .map((item, i) => `  ${i + 1}. ${item.name || "Unnamed Item"} — ₦${item.price || "?"}`)
//         .join("\n");

//       reply += `🧾 *Order on:* ${new Date(order.timestamp).toLocaleString()}\n${itemsList}\n💰 *Total:* ₦${order.total.toLocaleString()}\n\n`;
//     }

//     await msg.reply(reply.trim());
//     logMessage(userId, "out", reply);
//   } catch (error) {
//     console.error("❌ Error in 'Show my orders':", error);
//     await msg.reply("⚠️ Oops! Something went wrong while fetching your orders.");
//   }
//   return;
// }


// // 💬 SHOW LAST ORDER COMMAND
// if (text.toLowerCase().includes("show last order")) {
//   try {
//     const fs = await import("fs");
//     function safeReadJSON(path) {
//       try {
//         if (!fs.existsSync(path)) return [];
//         const data = fs.readFileSync(path, "utf8");
//         return JSON.parse(data || "[]");
//       } catch (error) {
//         console.error("❌ Error reading JSON:", error);
//         return [];
//       }
//     }

//     const logs = safeReadJSON("./data/cartLogs.json");
//     const userOrders = logs
//       .filter((l) => l.userId === userId && l.action === "CHECKOUT")
//       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

//     if (userOrders.length === 0) {
//       await msg.reply("🧾 You haven’t made any orders yet.");
//       return;
//     }

//     const lastOrder = userOrders[0];
//     const itemsList = (lastOrder.items || [])
//       .map(
//         (item, i) =>
//           `  ${i + 1}. ${item.name || "Unnamed Item"} — ₦${
//             item.price?.toLocaleString() || "?"
//           }`
//       )
//       .join("\n");

//     const reply = `🧾 *Your Most Recent Order:*\n\n📅 *Date:* ${new Date(
//       lastOrder.timestamp
//     ).toLocaleString()}\n${itemsList}\n\n💰 *Total:* ₦${lastOrder.total.toLocaleString()}`;

//     await msg.reply(reply);
//     logMessage(userId, "out", reply);
//   } catch (error) {
//     console.error("❌ Error in 'Show last order':", error);
//     await msg.reply("⚠️ Oops! Something went wrong fetching your last order.");
//   }
//   return;
// }


// // 🧠 Unified Smart Product Understanding Layer
// if (/\b(iphone|samsung|airpods|infinix|tecno|watch|phone|price|under|how much|cost|buy|available)\b/i.test(text)) {
//   const reply = smartProductSearch(text);

//   if (reply) {
//     const chat = await msg.getChat();
//     await chat.sendStateTyping();
//     const typingDelay = Math.min(reply.length * 20, 3000);
//     await delay(typingDelay);
//     await client.sendMessage(msg.from, reply);
//     logMessage(userId, "out", reply);
//     return;
//   } else {
//     await msg.reply("😅 Hmm, I couldn’t find anything matching that. Could you try a more specific name or price range?");
//     return;
//   }
// }





// // 🛒 Handle "Add to cart" — conversational + upsell
// if (text.toLowerCase().includes("add ")) {
//   // 🧠 Extract product name even if the message has extra words
//   const match = text.match(/add\s+(.*)/i);
//   const query = match ? match[1].trim() : null;

//   if (!query) {
//     await msg.reply("⚠️ Please specify a product name, e.g. *Add iPhone 14 Pro*.");
//     return;
//   }

//   const product = findProduct(query);
//   if (!product) {
//     await msg.reply("⚠️ I couldn’t find that product in the store. Try another name, e.g. *Add iPhone 14 Pro*.");
//     return;
//   }

//   // 🧠 Detect tone automatically (bro, please, etc.)
//   const style = detectTone(text, userId);

//   // 🛒 Add to cart
//   addToCart(userId, product);

//   // 💬 Generate human-sounding confirmation + upsell
//   const addedMsg = tone("added", { name: product.name, style });
//   const related = suggestSimilar(product.category).filter(
//     (p) => p.name !== product.name
//   );

//   const suggestion =
//     related.length > 0
//       ? related[Math.floor(Math.random() * related.length)]
//       : null;

//   const upsellMsg = suggestion
//     ? tone("upsell", { name: product.name, suggestion: suggestion.name, style })
//     : "";

//   const composedReply = `${addedMsg}\n\n${upsellMsg}`;
// const typingDelay = Math.min(Math.max(composedReply.length * 25, 600), 4000);
// const chat = await msg.getChat();
// await chat.sendStateTyping();
// await delay(typingDelay);

// await client.sendMessage(userId, composedReply);
// logMessage(userId, "out", composedReply);



//   if (suggestion) lastSuggested[userId] = suggestion;

//   logMessage(userId, "out", `${product.name} added with conversational upsell.`);
//   return; // 🧠 stop AI fallback
// }


// // 🛍 Show all categories
// if (text.toLowerCase().includes("show categories")) {
//   const categories = listCategories();
//   const message = `🛍 Available Categories:\n\n${categories
//     .map((c) => `• ${c}`)
//     .join("\n")}\n\nReply with “Show [category]” to browse.`;
//   await msg.reply(message);
//   return;
// }

// // 🔎 Show products in a category
// if (text.toLowerCase().startsWith("show ")) {
//   const category = text.replace(/show\s+/i, "").trim();
//   const items = findByCategory(category);
//   if (items.length === 0) {
//     await msg.reply(`⚠️ No products found under *${category}* yet.`);
//     return;
//   }

//   const list = items
//     .map((p) => `• *${p.name}* - ₦${p.price.toLocaleString()}`)
//     .join("\n");
//   await msg.reply(`📦 *${category}*\n\n${list}\n\nReply “Add [product name]” to add to your cart.`);
//   return;
// }

// // 💬 Search products
// if (text.toLowerCase().includes("find") || text.toLowerCase().includes("search")) {
//   const q = text.replace(/(find|search)\s+/i, "").trim();
//   const results = searchProducts(q);
//   if (results.length === 0) {
//     await msg.reply(`⚠️ No results found for *${q}*.`);
//     return;
//   }

//   const list = results
//     .map((p) => `• *${p.name}* - ₦${p.price.toLocaleString()} (${p.brand})`)
//     .join("\n");
//   await msg.reply(`🔍 *Search results for:* ${q}\n\n${list}\n\nYou can reply “Add [product name]” to buy.`);
//   return;
// }





// // ✅ Handle confirmation for upsell suggestion
// if (["yes", "yes add it", "sure", "ok add it", "yeah"].some(p => text.toLowerCase().includes(p))) {
//   const suggested = lastSuggested[userId];
//   if (suggested) {
//     addToCart(userId, suggested);
//     const confirmMsg = tone("added", { name: suggested.name });
//     await msg.reply(`${confirmMsg}\n😉 Great pick — you’ll love this one.`);
//     logMessage(userId, "out", `Confirmed upsell: ${suggested.name}`);
//     delete lastSuggested[userId]; // clear after adding
//     return;
//   }
// }






// if (text.toLowerCase().includes("remove")) {
//   const product = findProduct(text);
//   if (product) {
//     removeFromCart(userId, product.name);
//     const reply = `🗑️ Removed *${product.name}* from your cart.`;
//     await msg.reply(reply);
//     logMessage(userId, "out", reply);
//     return;
//   }
// }

// if (text.toLowerCase().includes("show my cart")) {
//   const cart = getCart(userId);
//   if (cart.length === 0) {
//     await msg.reply("🛒 Your cart is empty.");
//     return;
//   }

//   const total = cart.reduce((sum, item) => sum + item.price, 0);
//   const list = cart
//     .map(
//       (item, i) =>
//         `${i + 1}. *${item.name}* — ${new Intl.NumberFormat("en-NG", {
//           style: "currency",
//           currency: "NGN",
//         }).format(item.price)}`
//     )
//     .join("\n");

//   const reply = `🛍️ Your Cart:\n${list}\n\n💰 *Total:* ${new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//   }).format(total)}\n\nSay “clear cart” to empty it.`;

//   await msg.reply(reply);
//   logMessage(userId, "out", reply);
//   return;
// }

// if (text.toLowerCase().includes("clear cart")) {
//   clearCart(userId);
//   await msg.reply("🧹 Cart cleared.");
//   return;
// }

// // 💳 Handle checkout
// if (text.toLowerCase().includes("checkout")) {
//   const summary = checkoutCart(userId);

//   if (!summary) {
//     await msg.reply("🛒 Your cart is empty. Add some items before checkout!");
//     return;
//   }

//   const itemList = summary.items
//     .map((item, i) => `${i + 1}. *${item.name}* — ₦${item.price.toLocaleString()}`)
//     .join("\n");

//   const reply = `✅ *Checkout Complete!*\n\n🧾 *Order ID:* ${summary.orderId}\n📅 *Date:* ${new Date(
//     summary.timestamp
//   ).toLocaleString()}\n\n${itemList}\n\n💰 *Total:* ₦${summary.total.toLocaleString()}\n\nThank you for shopping with us! 🛍️`;

//   await msg.reply(reply);
//   logMessage(userId, "out", reply);

//    // ✅ ADD THIS LINE HERE:
// //   logCartAction(userId, "CHECKOUT", { name: "Order", price: summary.total }, summary.total);
// logCartAction(userId, "CHECKOUT", summary.items, summary.total);
// deductStock(summary.items);




//   return;
// }



// // 💳 Checkout summary
// if (text.toLowerCase().includes("checkout") || text.toLowerCase().includes("buy now")) {
//   const cart = getCart(userId);
//   if (cart.length === 0) {
//     await msg.reply("🛒 Your cart is empty. Add some items before checkout!");
//     return;
//   }

//   const total = cart.reduce((sum, item) => sum + item.price, 0);
//   const orderId = "ORD-" + Math.floor(Math.random() * 1000000);

//   const list = cart
//     .map(
//       (item, i) =>
//         `${i + 1}. *${item.name}* — ${new Intl.NumberFormat("en-NG", {
//           style: "currency",
//           currency: "NGN",
//         }).format(item.price)}`
//     )
//     .join("\n");

//   const reply = `🧾 *Checkout Summary*\n\n${list}\n\n💰 *Total:* ${new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//   }).format(total)}\n\n🆔 *Order ID:* ${orderId}\n\nReply with *confirm order* to place it.`;

//   await msg.reply(reply);
//   logMessage(userId, "out", reply);
//   return;
// }

// if (text.toLowerCase().includes("confirm order")) {
//   const cart = getCart(userId);
//   if (cart.length === 0) {
//     await msg.reply("⚠️ You don’t have any pending checkout to confirm.");
//     return;
//   }

//   const total = cart.reduce((sum, item) => sum + item.price, 0);
//   const order = logOrder(userId, cart, total);
//   const profile = getProfile(userId);

//   const reply = `🎉 Thank you ${profile.name || "valued customer"}!\n\n` +
//                 `✅ Your order has been confirmed!\n` +
//                 `🆔 *Order ID:* ${order.orderId}\n` +
//                 `💰 *Total Paid:* ₦${total.toLocaleString()}\n` +
//                 `📅 *Date:* ${new Date(order.timestamp).toLocaleString()}\n\n` +
//                 `Our team will contact you shortly 🛵`;

//   await msg.reply(reply);
//   clearCart(userId);
//   logMessage(userId, "out", reply);
//   return;
// }

// if (text.toLowerCase().includes("show my orders")) {
//   const orders = getOrdersByUser(userId);
//   if (orders.length === 0) {
//     await msg.reply("🧾 You don’t have any past orders yet.");
//     return;
//   }

//   const summary = orders
//     .slice(-5) // show last 5 orders
//     .map(
//       o =>
//         `🆔 *${o.orderId}* — ₦${o.total.toLocaleString()}\n📅 ${new Date(o.timestamp).toLocaleDateString()}`
//     )
//     .join("\n\n");

//   await msg.reply(`📦 *Your Recent Orders:*\n\n${summary}`);
//   return;
// }




//     // 🧾 Log incoming message
//     logMessage(userId, "in", text);
//     console.log(`📩 Message from ${userId}: ${text}`);



// // 💸 “Under price” requests (e.g. phones under 400k)
// if (text.toLowerCase().includes("under")) {
//   const priceMatch = text.match(/\d+/);
//   if (priceMatch) {
//     const priceLimit = parseInt(priceMatch[0]) * 1000; // support "under 400k"
//     const results = findProductsUnder(priceLimit);

//     if (results.length > 0) {
//       const reply = results
//         .map(
//           (item) =>
//             `📱 *${item.name}* — ${new Intl.NumberFormat("en-NG", {
//               style: "currency",
//               currency: item.currency
//             }).format(item.price)}`
//         )
//         .join("\n");

//       await msg.reply(`🛍️ Products under your budget:\n\n${reply}`);
//       logMessage(userId, "out", reply);
//       return;
//     } else {
//       await msg.reply("⚠️ I couldn’t find any items under that price.");
//       return;
//     }
//   }
// }

// // 🧠 Smart Product Understanding Layer
// if (
//   text.toLowerCase().includes("price") ||
//   text.toLowerCase().includes("under") ||
//   text.toLowerCase().includes("phones") ||
//   text.toLowerCase().includes("between") ||
//   text.toLowerCase().includes("below") ||
//   text.toLowerCase().includes("iphone") ||
//   text.toLowerCase().includes("samsung") ||
//   text.toLowerCase().includes("infinix")
// ) {
//   const reply = smartProductSearch(text);
//   if (reply) {
//     const typingDelay = Math.min(reply.length * 20, 3000);
//     const chat = await msg.getChat();
//     await chat.sendStateTyping();
//     await delay(typingDelay);
//     await client.sendMessage(msg.from, reply);
//     logMessage(userId, "out", reply);
//     return;
//   }
// }



//     // 🧠 Load user profile and memory
//     const profile = getProfile(userId);
//     updateProfile(userId, "lastActive", new Date().toISOString());
//     const memory = getMemory(userId);

//     const aiPrompt = `
// You are Jarvis, a helpful, ${profile.personality || "friendly"} assistant.
// Always address the user as ${profile.name || "friend"}.

// User: ${text}
// `;

//     let botReply = "";
// try {
//   botReply = await getAIReply(aiPrompt);
// } catch (err) {
//   console.error("⚠️ AI service error:", err);
//   botReply = "I'm having a little trouble thinking right now 🤖. Try again in a moment!";
// }

// if (!botReply || botReply.trim().length === 0) {
//   const fallback = "⚠️ Sorry, I couldn’t generate a reply. Try again!";
//   await client.sendMessage(userId, fallback);
//   logMessage(userId, "out", fallback);
//   return;
// }


//     // 💾 Save conversation memory
//     addToMemory(userId, { role: "user", message: text });
//     addToMemory(userId, { role: "assistant", message: botReply });
// saveMemory(userId, getMemory(userId));

// const chat = await msg.getChat();
// const typingDelay = Math.min(Math.max(botReply.length * 25, 600), 4000);
// logMessage(userId, "out", botReply);
// console.log(`🤖 Replied to ${profile.name || userId}: ${botReply}`);



//   } catch (err) {
//     console.error("❌ Error handling message:", err);
//     await msg.reply("⚠️ Oops! Something went wrong while processing your message.");
//   }
// });


//   await client.initialize();
//   console.log("🚀 WhatsApp client initialized and running.");
// }

// // 📤 Helper — send messages manually from backend
// export async function sendMessageTo(number, text) {
//   const id = number.includes("@c.us") ? number : `${number.replace("+", "")}@c.us`;
//   return client.sendMessage(id, text);
// }



// services/whatsappClient.js
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";
import { getChromePath } from "../utils/chromePath.js";

let client;

export async function startWhatsAppClient() {
  console.log("🟡 Starting WhatsApp Web client...");

  const chromePath = await getChromePath();
  console.log("🧭 Chrome Path being used:", chromePath || "Default Puppeteer Chromium");

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./.wwebjs_auth", // ✅ persists sessions locally
    }),
    puppeteer: {
      headless: true,
      executablePath: chromePath || undefined, // ✅ Use found path or Puppeteer's default
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // 🧩 Listen for QR events
  client.on("qr", (qr) => {
    console.log("📱 Scan this QR code in WhatsApp (Linked Devices → Link a Device).");
    qrcode.generate(qr, { small: true });
  });

  // ✅ Fired once logged in successfully
  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
  });

  // 🔁 Fired when authentication is successful
  client.on("authenticated", () => {
    console.log("🔐 Successfully authenticated — session saved!");
  });

  // ⚠️ Handle auth or session issues
  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failure:", msg);
  });

  // 📩 Listen to incoming messages
  client.on("message", (msg) => {
    console.log("💬 Message received:", msg.from, msg.body);
  });

  // 🚀 Start the client
  try {
    await client.initialize();
  } catch (err) {
    console.error("❌ Error initializing WhatsApp client:", err);
  }

  return client;
}

export function getClient() {
  return client;
}
