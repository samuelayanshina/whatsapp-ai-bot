export function productReply(product, tone = "neutral") {
  const price = `₦${product.price.toLocaleString()}`;

  const replies = {
    friendly: [
      `Yes boss 😄 we get *${product.name}* — ${price}`,
      `Omo 🔥 *${product.name}* dey available — ${price}`,
      `Sure boss 🙌 *${product.name}* dey — ${price}`
    ],
    polite: [
      `Yes, we have ${product.name}. Price is ${price}.`,
      `${product.name} is available. It costs ${price}.`
    ],
    neutral: [
      `${product.name} is available — ${price}`,
      `Yes, ${product.name} is in stock — ${price}`
    ]
  };

  const set = replies[tone] || replies.neutral;
  return set[Math.floor(Math.random() * set.length)];
}
