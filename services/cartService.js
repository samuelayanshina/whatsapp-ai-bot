// services/cartService.js
import fs from "fs";
import path from "path";

const DATA_DIR = "./data";
const CART_FILE = path.join(DATA_DIR, "userCarts.json");

// 🧩 Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// 🧠 Helper — safely read/write cart data
function safeRead() {
  try {
    if (!fs.existsSync(CART_FILE)) return {};
    const data = fs.readFileSync(CART_FILE, "utf8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("❌ Error reading cart data:", error);
    return {};
  }
}

function safeWrite(data) {
  try {
    fs.writeFileSync(CART_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error writing cart data:", error);
  }
}

// 🛒 Cart functions
export function getCart(userId) {
  const allCarts = safeRead();
  return allCarts[userId] || [];
}

export function addToCart(userId, item) {
  const allCarts = safeRead();
  allCarts[userId] = allCarts[userId] || [];
  allCarts[userId].push(item);
  safeWrite(allCarts);
}

export function removeFromCart(userId, itemName) {
  const allCarts = safeRead();
  allCarts[userId] = (allCarts[userId] || []).filter(
    (item) => item.name.toLowerCase() !== itemName.toLowerCase()
  );
  safeWrite(allCarts);
}

export function clearCart(userId) {
  const allCarts = safeRead();
  allCarts[userId] = [];
  safeWrite(allCarts);
}

export function saveCart(userId, cart) {
  const allCarts = safeRead();
  allCarts[userId] = cart;
  safeWrite(allCarts);
}
