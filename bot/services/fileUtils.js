// services/fileUtils.js
import fs from "fs";
import path from "path";

export function ensureFile(filePath, defaultContent = "[]") {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultContent);
}

export function safeReadJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    if (!data || data.trim() === "") return [];
    return JSON.parse(data);
  } catch (err) {
    console.warn("⚠️ Could not read or parse", filePath, err.message);
    return [];
  }
}

export function safeWriteJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Could not write JSON to", filePath, err.message);
  }
}
