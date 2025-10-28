const fs = require("fs");
const path = require("path");

// Load product data from JSON
const productFilePath = path.join(__dirname, "../data/products.json");

function loadProducts() {
  try {
    const data = fs.readFileSync(productFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading product file:", error);
    return [];
  }
}

// 🔍 Search for a product by keyword
function searchProducts(query) {
  const products = loadProducts();
  query = query.toLowerCase();

  return products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
  );
}

// 💰 Filter by price range
function filterByPrice(maxPrice) {
  const products = loadProducts();
  return products.filter(p => p.price <= maxPrice);
}

module.exports = {
  loadProducts,
  searchProducts,
  filterByPrice,
};
