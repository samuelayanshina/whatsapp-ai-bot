// utils/personality.js
import fs from "fs";

const personalityFile = "./data/personality.json";

// 🧠 Simple JSON persistence
function loadPersonalities() {
  try {
    if (!fs.existsSync(personalityFile)) return {};
    const data = fs.readFileSync(personalityFile, "utf8");
    return JSON.parse(data || "{}");
  } catch (err) {
    console.error("⚠️ Could not load personality memory:", err);
    return {};
  }
}

function savePersonalities(data) {
  try {
    fs.writeFileSync(personalityFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Could not save personality memory:", err);
  }
}

const personalities = loadPersonalities();

// 🧩 Tone detection based on message style
export function detectTone(message, userId) {
  const text = message.toLowerCase();
  let tone = "neutral";

  if (text.includes("bro") || text.includes("lol") || text.includes("😂") || text.includes("man")) tone = "casual";
  else if (text.includes("please") || text.includes("thanks") || text.includes("thank you")) tone = "polite";
  else if (text.endsWith("!") || text.includes("so cool") || text.includes("awesome")) tone = "excited";
  else if (text.match(/\b(sir|madam|dear)\b/)) tone = "formal";
  else if (text.includes("nah") || text.includes("yoo") || text.includes("fam")) tone = "slang";

  // Save user tone
  personalities[userId] = tone;
  savePersonalities(personalities);

  return tone;
}

// 🧠 Get tone style for a user
export function getToneStyle(userId) {
  return personalities[userId] || "neutral";
}
