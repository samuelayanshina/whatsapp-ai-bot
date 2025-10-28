// orderService.js
import { ensureFile, safeReadJSON, safeWriteJSON } from "./fileUtils.js";

const ORDER_LOG_FILE = "./data/cartLogs.json";
ensureFile(ORDER_LOG_FILE);

export function logOrder(userId, orderData) {
  const logs = safeReadJSON(ORDER_LOG_FILE);
  logs.push({
    userId,
    ...orderData,
    timestamp: new Date().toISOString(),
  });
  safeWriteJSON(ORDER_LOG_FILE, logs);
  console.log(`🧾 Order logged for ${userId}`);
}

export function getOrdersByUser(userId) {
  const logs = safeReadJSON("./data/cartLogs.json");
  const userOrders = logs.filter(l => l.userId === userId && l.action === "CHECKOUT");

  if (userOrders.length === 0) {
    return "🧾 You don’t have any past orders yet.";
  }

  let reply = "🛍 *Your Past Orders:*\n\n";
  for (const order of userOrders) {
    reply += `🧾 Order on ${new Date(order.timestamp).toLocaleString()}\n💰 Total: ₦${order.total.toLocaleString()}\n\n`;
  }

  return reply.trim();
}
