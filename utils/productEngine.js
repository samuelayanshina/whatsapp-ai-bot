// utils/productEngine.js
import fuzzysort from "fuzzysort";

// product data (your existing list)
const products = [
  { name: "iPhone 15 Pro Max", brand: "Apple", category: "Phone", price: 1450000, stock: 8, description: "Flagship Apple device with A17 chip." },
  { name: "iPhone 14", brand: "Apple", category: "Phone", price: 950000, stock: 10, description: "Previous generation iPhone with A16 chip." },
  { name: "Samsung S24 Ultra", brand: "Samsung", category: "Phone", price: 1200000, stock: 6, description: "Powerful Android with 200MP camera." },
  { name: "Samsung A35", brand: "Samsung", category: "Phone", price: 480000, stock: 12, description: "Affordable Samsung smartphone." },
  { name: "Infinix Note 40", brand: "Infinix", category: "Phone", price: 320000, stock: 10, description: "Budget-friendly with smooth display." },
  { name: "AirPods Pro 2", brand: "Apple", category: "Accessory", price: 185000, stock: 15, description: "Noise cancellation, wireless charging." },
  { name: "Samsung Buds 2", brand: "Samsung", category: "Accessory", price: 120000, stock: 10, description: "Wireless earbuds with rich sound." },
  { name: "Infinix Charger 65W", brand: "Infinix", category: "Accessory", price: 35000, stock: 20, description: "Fast charging USB-C adapter." },
];

function extractPrices(text) {
  const matches = text.match(/\d+(\.\d+)?\s*[km]?/gi);
  if (!matches) return [];
  return matches.map(p => {
    let num = parseFloat(p.replace(/[^\d.]/g, ""));
    if (/k/i.test(p)) num *= 1000;
    if (/m/i.test(p)) num *= 1000000;
    return num;
  });
}

export function searchProducts(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return products.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function filterByPrice(maxPrice) {
  if (!maxPrice || isNaN(maxPrice)) return [];
  return products.filter(p => p.price <= Number(maxPrice));
}

export function smartProductSearch(message) {
  const text = (message || "").toLowerCase();
  const prices = extractPrices(text);
  let minPrice = 0, maxPrice = Infinity;

  if (prices.length === 1) {
    if (text.includes("under") || text.includes("below")) maxPrice = prices[0];
    else if (text.includes("above") || text.includes("over")) minPrice = prices[0];
    else maxPrice = prices[0];
  } else if (prices.length >= 2) {
    [minPrice, maxPrice] = prices.slice(0,2).sort((a,b)=>a-b);
  }

  // fuzzy searches
  const q = text;
  const brandResults = fuzzysort.go(q, products, { key: "brand", threshold: -10000 });
  const categoryResults = fuzzysort.go(q, products, { key: "category", threshold: -10000 });
  const nameResults = fuzzysort.go(q, products, { key: "name", threshold: -10000 });

  // start with price-filter, then intersect with fuzzy picks if present
  let filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

  if (brandResults.length > 0) filtered = brandResults.map(r => r.obj).filter(p => p.price >= minPrice && p.price <= maxPrice);
  else if (categoryResults.length > 0) filtered = categoryResults.map(r => r.obj).filter(p => p.price >= minPrice && p.price <= maxPrice);
  else if (nameResults.length > 0) filtered = nameResults.map(r => r.obj).filter(p => p.price >= minPrice && p.price <= maxPrice);

  if (filtered.length === 0) {
    const suggestions = products
      .filter(p => p.price <= (maxPrice === Infinity ? Number.MAX_SAFE_INTEGER : maxPrice * 1.2))
      .slice(0,3)
      .map(p => `• ${p.name} (${p.brand}) — ₦${p.price.toLocaleString()}`)
      .join("\n");
    return `😕 I couldn’t find an exact match for "${message}". Here are some related options:\n\n${suggestions}`;
  }

  const formatted = filtered.slice(0, 8).map(p =>
    `*${p.name}* (${p.brand}) — ₦${p.price.toLocaleString()}\n${p.description}`
  ).join("\n\n");

  return `Here’s what I found for *"${message}"*:\n\n${formatted}`;
}

export default products;
