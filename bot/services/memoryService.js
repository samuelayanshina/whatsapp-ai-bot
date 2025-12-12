// services/memoryService.js
import fs from "fs";
import path from "path";

const DATA_DIR = "./data";
const MEMORY_FILE = path.join(DATA_DIR, "memory.json");

// Ensure /data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Ensure memory.json exists
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({}, null, 2));
}

// Read memory
export function getUserMemory(phone) {
  try {
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    return data[phone] || {};
  } catch (err) {
    return {};
  }
}

// Save / merge memory
export function setUserMemory(phone, newMemory) {
  let data = {};

  try {
    data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch (err) {}

  // Merge old memory with new memory
  data[phone] = {
    ...(data[phone] || {}),
    ...newMemory
  };

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf8");
}
