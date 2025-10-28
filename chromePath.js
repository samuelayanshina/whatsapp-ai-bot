// utils/chromePath.js
import fs from "fs";
import puppeteer from "puppeteer";

export async function getChromePath() {
  const possiblePaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ];

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) return path;
  }

  // ✅ Fallback to Puppeteer's bundled Chromium if none found
  try {
    const chromePath = puppeteer.executablePath();
    console.log("✅ Using Puppeteer's bundled Chromium at:", chromePath);
    return chromePath;
  } catch (err) {
    console.warn("⚠️ Could not detect Chrome or Puppeteer executable path:", err);
    return null;
  }
}
