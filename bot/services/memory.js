import fs from "fs";
import path from "path";
import { getAIReply } from "./openaiService.js";

const dataDir = path.resolve("./data");
const memoryFile = path.join(dataDir, "memory.json");
const backupDir = path.join(dataDir, "backups");

let userMemory = {};
let saveTimeout = null; // ⏳ debounce timer

// 🧠 Load memory from disk
export async function loadMemory() {
  try {
    // Ensure data and backup directories exist
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    if (fs.existsSync(memoryFile)) {
      const data = fs.readFileSync(memoryFile, "utf-8");
      userMemory = JSON.parse(data);
      console.log("🧠 Memory loaded from disk.");
    } else {
      userMemory = {};
      console.log("🆕 No existing memory found. Starting fresh.");
    }

    autoBackupMemory(); // run first backup
  } catch (err) {
    console.error("❌ Error loading memory:", err);
  }
}

// 💾 Debounced save to disk
function saveMemoryDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(memoryFile, JSON.stringify(userMemory, null, 2));
      console.log("💾 Memory saved to disk (debounced).");
      autoBackupMemory();
    } catch (err) {
      console.error("❌ Error saving memory:", err);
    }
  }, 3000);
}

// 💾 Explicit save (manual)
export function saveMemory(userId, memoryData) {
  try {
    // Load or create file
    const existing =
      fs.existsSync(memoryFile) && fs.readFileSync(memoryFile, "utf8")
        ? JSON.parse(fs.readFileSync(memoryFile, "utf8"))
        : {};

    existing[userId] = memoryData;
    userMemory[userId] = memoryData;

    fs.writeFileSync(memoryFile, JSON.stringify(existing, null, 2));
    console.log(`💾 Memory saved for user: ${userId}`);

    autoBackupMemory();
  } catch (err) {
    console.error("❌ Error saving memory:", err);
  }
}

// 🧩 Daily auto-backup
function autoBackupMemory() {
  try {
    const date = new Date().toISOString().split("T")[0]; // e.g., 2025-10-15
    const backupFile = path.join(backupDir, `memory-${date}.json`);

    if (!fs.existsSync(backupFile)) {
      fs.copyFileSync(memoryFile, backupFile);
      console.log(`🗄️  Daily backup created: ${backupFile}`);
    }
  } catch (err) {
    console.error("❌ Error creating daily backup:", err);
  }
}

// ➕ Add message to memory
export function addToMemory(userId, role, message) {
  if (!userMemory[userId]) userMemory[userId] = [];
  userMemory[userId].push({ role, message });

  if (userMemory[userId].length > 20) summarizeUserMemory(userId);
  saveMemoryDebounced();
}

// 📜 Get memory for a user
export function getMemory(userId) {
  return userMemory[userId] || [];
}

// 🧹 Clear memory for a user
export function clearMemory(userId) {
  delete userMemory[userId];
  saveMemoryDebounced();
}

// 🧠 Summarize long histories using AI
async function summarizeUserMemory(userId) {
  const messages = userMemory[userId];
  if (!messages || messages.length < 10) return;

  const oldMessages = messages.slice(0, -8);
  const contextText = oldMessages.map((m) => `${m.role}: ${m.message}`).join("\n");

  console.log(`🪶 Summarizing old memory for ${userId}...`);

  try {
    const summaryPrompt = `Summarize this chat history briefly but keep key details:\n\n${contextText}\n\nSummary:`;
    const summary = await getAIReply(summaryPrompt);

    userMemory[userId] = [
      { role: "system", message: `Conversation summary: ${summary}` },
      ...messages.slice(-8),
    ];

    console.log("✅ Memory summarized for", userId);
    saveMemoryDebounced();
  } catch (err) {
    console.error("❌ Error summarizing memory for", userId, err);
  }
}
