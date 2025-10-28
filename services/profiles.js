import fs from "fs";
import path from "path";

const profilesFile = path.resolve("./profiles.json");
let profiles = {};
let saveTimeout = null;

// 🧠 Load profiles from disk
export async function loadProfiles() {
  try {
    if (fs.existsSync(profilesFile)) {
      const data = fs.readFileSync(profilesFile, "utf-8");
      profiles = JSON.parse(data);
      console.log("👤 Profiles loaded from disk.");
    } else {
      profiles = {};
      console.log("🆕 No profiles found. Starting fresh.");
    }
  } catch (err) {
    console.error("❌ Error loading profiles:", err);
  }
}

// 💾 Save profiles (debounced)
function saveProfilesDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(profilesFile, JSON.stringify(profiles, null, 2));
      console.log("💾 Profiles saved (debounced).");
    } catch (err) {
      console.error("❌ Error saving profiles:", err);
    }
  }, 3000);
}

// 🔍 Get a user’s profile (create default if missing)
export function getProfile(userId) {
  if (!profiles[userId]) {
    profiles[userId] = {
      name: "User",
      personality: "helpful and friendly",
      lastActive: new Date().toISOString(),
    };
    saveProfilesDebounced();
  }
  return profiles[userId];
}

// 🧩 Update a field in a user profile
export function updateProfile(userId, field, value) {
  const profile = getProfile(userId);
  profile[field] = value;
  profile.lastActive = new Date().toISOString();
  saveProfilesDebounced();
  return profile;
}

// 🧹 Optional: remove inactive users (e.g., >30 days)
export function cleanOldProfiles(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  for (const [id, p] of Object.entries(profiles)) {
    if (new Date(p.lastActive).getTime() < cutoff) {
      delete profiles[id];
    }
  }
  saveProfilesDebounced();
  console.log("🧹 Old profiles cleaned.");
}
