// services/commands.js
import axios from "axios";
import { clearMemory } from "./memory.js";
import { getProfile, updateProfile } from "./profiles.js";

export async function handleCommand(commandText, userId) {
  const parts = commandText.trim().split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    // 🧹 Clear memory (old)
    case "/clear":
    case "/forget":
      clearMemory(userId);
      return "🧹 Memory cleared! I’ve forgotten our previous chat.";

    // 😂 Joke command
    case "/joke":
      return await getJoke();

    // 💭 Quote command
    case "/quote":
      return await getQuote();

    // 🧩 Set name (new)
    case "/setname": {
      if (args.length === 0) return "❌ Usage: /setname [your name]";
      const name = args.join(" ");
      updateProfile(userId, "name", name);
      return `✅ Got it! I'll call you *${name}* from now on.`;
    }

    // 🧠 Set personality (new)
    case "/setpersonality": {
      if (args.length === 0)
        return "❌ Usage: /setpersonality [e.g. witty, calm, professional]";
      const personality = args.join(" ");
      updateProfile(userId, "personality", personality);
      return `🧠 Personality updated! I’ll now sound more *${personality}*.`;
    }

    // 👤 Show profile (new)
    case "/profile": {
      const profile = getProfile(userId);
      return `👤 *Your Profile:*\n\n• Name: ${profile.name}\n• Personality: ${profile.personality}\n• Last Active: ${new Date(
        profile.lastActive
      ).toLocaleString()}`;
    }

    // 📘 Help (merged)
    case "/help":
      return `🤖 *Available commands:*

🧹 /clear or /forget — Reset chat memory  
😂 /joke — Hear something funny  
💭 /quote — Get an inspiring quote  
👤 /setname [your name] — Set your display name  
🧠 /setpersonality [style] — Change how I talk  
📄 /profile — View your current profile  
❓ /help — Show this help menu`;

    // ❓ Unknown
    default:
      return null; // no match, let bot handle as normal chat
  }
}

// === Helper functions ===
async function getJoke() {
  try {
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
    return `😂 ${res.data.setup} — ${res.data.punchline}`;
  } catch {
    return "😅 I couldn't fetch a joke right now!";
  }
}

async function getQuote() {
  try {
    const res = await axios.get("https://api.quotable.io/random");
    return `💬 "${res.data.content}" — ${res.data.author}`;
  } catch {
    return "💭 I couldn’t fetch a quote right now, sorry!";
  }
}
