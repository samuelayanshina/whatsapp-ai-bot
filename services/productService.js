// services/productService.js
import fs from "fs";
import path from "path";

const PRODUCT_FILE = path.join("./data", "products.json");

// 🧠 Load products
function loadProducts() {
  try {
    const data = fs.readFileSync(PRODUCT_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Error loading products:", err);
    return [];
  }
}


// 🛍️ Find product by name or keyword (smarter and more forgiving)
export function findProduct(query) {
  const products = loadProducts();
  const q = query.toLowerCase().replace(/add|keep|remove|price|how much|do you have/gi, "").trim();

  // Try exact match first
  let match = products.find(
    (p) =>
      p.name.toLowerCase() === q ||
      q === p.name.toLowerCase().split(" ")[0] // e.g. "iphone" from "iphone 14 pro"
  );

  // If not found, try partial matches
  if (!match) {
    match = products.find(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        q.includes(p.name.toLowerCase()) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  // If still not found, try word-by-word loose match (to handle "add iphone 14")
  if (!match) {
    const words = q.split(/\s+/);
    match = products.find((p) =>
      words.every((w) => p.name.toLowerCase().includes(w))
    );
  }

  return match || null;
}



// 🔍 Find multiple products under a price
export function findProductsUnder(limit) {
  const products = loadProducts();
  const numericLimit = Number(String(limit).replace(/\D/g, "")); // remove ₦ or k
  return products.filter(p => p.price <= numericLimit);
}

// 🧾 Deduct stock after checkout
export function deductStock(cart) {
  const products = loadProducts();
  for (const item of cart) {
    const index = products.findIndex((p) => p.id === item.id);
    if (index >= 0 && products[index].stock > 0) {
      products[index].stock -= 1;
    }
  }
  fs.writeFileSync(PRODUCT_FILE, JSON.stringify(products, null, 2));
}

// 🧠 Get similar products by category
export function suggestSimilar(category) {
  const products = loadProducts();
  return products.filter((p) => p.category === category);
}
