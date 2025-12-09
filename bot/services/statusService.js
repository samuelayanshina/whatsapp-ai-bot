// // bot/services/statusService.js
// import fs from "fs/promises";
// import path from "path";
// import { downloadContentFromMessage, proto } from "@whiskeysockets/baileys"; // optional helper
// import { findProductByKeywords, findProductById } from "./productService.js";

// /**
//  * Determine whether a message is a reply-to-status and extract quoted content.
//  * @param {Object} msg - raw Baileys message object
//  * @returns {Object|null} statusInfo or null
//  */
// export function extractStatusInfo(msg) {
//   const context = msg?.message?.extendedTextMessage?.contextInfo
//                || msg?.message?.imageMessage?.contextInfo
//                || msg?.message?.videoMessage?.contextInfo
//                || null;
//   if (!context) return null;

//   const quoted = context.quotedMessage || null;
//   if (!quoted) return null;

//   // Build a lightweight status summary
//   const summary = {
//     quotedText:
//       quoted?.conversation ||
//       quoted?.extendedTextMessage?.text ||
//       quoted?.imageMessage?.caption ||
//       quoted?.videoMessage?.caption ||
//       "",
//     hasImage: !!quoted?.imageMessage,
//     hasVideo: !!quoted?.videoMessage,
//     quotedMessage: quoted,
//   };

//   return summary;
// }

// /**
//  * Try to resolve the product the user is referencing from status info.
//  * This uses quick keyword matching against the vendor product list.
//  * @param {string} shopId
//  * @param {Object} statusInfo
//  * @returns {Object|null} product
//  */
// export async function matchProductFromStatus(shopId, statusInfo) {
//   // 1) try match by keyword/title using the caption or quotedText
//   const maybe = statusInfo.quotedText || "";

//   if (maybe && maybe.trim().length > 0) {
//     const product = await findProductByKeywords(shopId, maybe);
//     if (product) return product;
//   }

//   // 2) If image present: optionally attempt to download and run image matching (placeholder)
//   if (statusInfo.hasImage) {
//     // Placeholder - return null now but we log for future image-match.
//     return null;
//   }

//   return null;
// }

// bot/services/statusService.js
import { findProductByKeywords } from "./productService.js";

/**
 * Extract quoted status info from a message.
 */
export function extractStatusInfo(msg) {
  const context =
    msg?.message?.extendedTextMessage?.contextInfo ||
    msg?.message?.imageMessage?.contextInfo ||
    msg?.message?.videoMessage?.contextInfo ||
    null;

  if (!context) return null;
  if (!context.quotedMessage) return null;

  const quoted = context.quotedMessage;

  return {
    quotedText:
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      quoted?.imageMessage?.caption ||
      quoted?.videoMessage?.caption ||
      "",
    hasImage: !!quoted?.imageMessage,
    hasVideo: !!quoted?.videoMessage,
    quotedMessage: quoted,
  };
}

/**
 * Match a product from extracted status information.
 */
export async function matchProductFromStatus(shopId, statusInfo) {
  if (!statusInfo) return null;

  const maybe = (statusInfo.quotedText || "").trim();

  if (maybe.length > 0) {
    try {
      const product = await findProductByKeywords(shopId, maybe);
      if (product) return product;
    } catch (e) {
      console.error("matchProductFromStatus error:", e);
    }
  }

  // Future: image detection coming later
  return null;
}
