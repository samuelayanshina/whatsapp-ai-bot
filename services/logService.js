import fs from "fs";
import { ensureFile, safeReadJSON, safeWriteJSON } from "./fileUtils.js";

const CART_LOG_FILE = "./data/cartLogs.json";
ensureFile(CART_LOG_FILE);

export function logCartAction(userId, action, product, total = 0) {
  // Safely read the log file (returns [] if empty or broken)
  const logs = safeReadJSON(CART_LOG_FILE);

  // Push a new log entry
  logs.push({
    userId,
    action,
    product: product?.name || "unknown",
    price: product?.price || 0,
    total,
    timestamp: new Date().toISOString(),
  });

  // Safely write back to file
  safeWriteJSON(CART_LOG_FILE, logs);

  // Console feedback
  console.log(`📦 Cart Log: ${action} (${product?.name || "unknown"}) for ${userId}`);
}
