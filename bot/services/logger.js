import fs from "fs";
import path from "path";

const logDir = path.resolve("./logs");

// 🗂 Ensure logs folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  console.log("📁 Created logs folder.");
}

/**
 * Log a message interaction (incoming/outgoing)
 * @param {string} userId - WhatsApp user ID
 * @param {string} direction - "in" or "out"
 * @param {string} text - message content
 */
export function logMessage(userId, direction, text) {
  try {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    const filePath = path.join(logDir, `messages-${dateStr}.json`);

    // Load existing logs for today
    let logs = [];
    if (fs.existsSync(filePath)) {
      logs = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Add new entry
    logs.push({
      timestamp: date.toISOString(),
      userId,
      direction, // "in" or "out"
      message: text,
    });

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));

    console.log(
      direction === "in"
        ? `📥 Logged incoming message from ${userId}`
        : `📤 Logged outgoing message to ${userId}`
    );
  } catch (err) {
    console.error("❌ Error writing message log:", err);
  }
}
