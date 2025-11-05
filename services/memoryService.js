// // services/memoryService.js
// import fs from "fs";
// import path from "path";

// const FILE = path.resolve("./data/memory.json");

// function ensureFile() {
//   if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
//   if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}, null, 2), "utf8");
// }

// export function readMemory() {
//   try {
//     ensureFile();
//     return JSON.parse(fs.readFileSync(FILE, "utf8") || "{}");
//   } catch (e) {
//     console.error("readMemory error:", e);
//     return {};
//   }
// }

// export function writeMemory(obj) {
//   try {
//     ensureFile();
//     fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), "utf8");
//     return true;
//   } catch (e) {
//     console.error("writeMemory error:", e);
//     return false;
//   }
// }

// export function getUserMemory(userId) {
//   const mem = readMemory();
//   return mem[userId] || null;
// }

// export function setUserMemory(userId, value) {
//   const mem = readMemory();
//   mem[userId] = { ...(mem[userId] || {}), ...value };
//   return writeMemory(mem);
// }


// services/memoryService.js
import fs from "fs";

const MEMORY_FILE = "./data/memory.json";

// ✅ Read memory file
export function getUserMemory(phone) {
  try {
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    return data[phone] || {};
  } catch (err) {
    return {};
  }
}

// ✅ Write memory to disk
export function setUserMemory(phone, memory) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch (err) {}

  data[phone] = memory;

  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf8");
}
