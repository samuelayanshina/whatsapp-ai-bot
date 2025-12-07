import fs from "fs";
import path from "path";

const storePath = path.resolve("data/storeData.json");

// 🛍️ Load store data
export function getStoreData() {
  const data = fs.readFileSync(storePath, "utf-8");
  return JSON.parse(data);
}


export function findProduct(query) {
  const store = getStoreData();
  const q = query.toLowerCase().trim();

  // Split query into individual words (e.g., "add iphone 14" → ["add","iphone","14"])
  const words = q.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  for (const category of store.categories) {
    for (const item of category.items) {
      const itemName = item.name.toLowerCase();
      const brandName = item.brand?.toLowerCase() || "";

      // Count how many words match any part of the name or brand
      let score = 0;
      for (const word of words) {
        if (itemName.includes(word) || brandName.includes(word)) score++;
      }

      // Keep the best-scoring match
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { ...item, category: category.name };
      }
    }
  }

  // Require at least 1 matching word to avoid false positives
  return bestScore > 0 ? bestMatch : null;
}




// 💰 Get all products below a price limit
export function findProductsUnder(priceLimit) {
  const store = getStoreData();
  const results = [];

  for (const category of store.categories) {
    for (const item of category.items) {
      if (item.price <= priceLimit) {
        results.push({ ...item, category: category.name });
      }
    }
  }

  return results;
}
