import fs from "fs";

export async function getChromePath() {
  const possiblePaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ];

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) return path;
  }

  console.warn("⚠️ Chrome not found in standard locations — using Puppeteer default.");
  return null;
}
