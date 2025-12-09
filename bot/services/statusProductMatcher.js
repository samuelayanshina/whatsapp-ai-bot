// bot/services/statusProductMatcher.js
import { findProduct } from "./productService.js";

// Very lightweight connector: reuse your existing findProduct
export function matchProductFromStatus(statusInfo) {
  const text = statusInfo?.quotedText || "";
  if (!text) return null;

  // try using your existing smart finder
  const product = findProduct(text);

  return product || null;
}
