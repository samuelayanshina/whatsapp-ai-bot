// utils/toneResponses.js
export function tone(type, data = {}) {
  const { name = "", suggestion = "", style = "neutral" } = data;

  const toneStyles = {
    neutral: {
      added: [
        `✅ I've added *${name}* to your cart.`,
        `😉 *${name}* has been added successfully.`,
        `🔥 *${name}* is now in your cart.`,
      ],
      upsell: suggestion
        ? [
            `💡 You might also like *${suggestion}*!`,
            `✨ *${suggestion}* goes perfectly with *${name}*!`,
            `👀 *${suggestion}* could be a nice match.`,
          ]
        : [""],
    },
    casual: {
      added: [
        `Cool bro 😎 — *${name}* is in your cart.`,
        `✅ *${name}* locked in!`,
        `🔥 You’ve got taste — *${name}* added!`,
      ],
      upsell: suggestion
        ? [
            `🔥 You might dig *${suggestion}* too!`,
            `👀 *${suggestion}* would go hard with *${name}*!`,
          ]
        : [""],
    },
    polite: {
      added: [
        `Certainly! I’ve added *${name}* to your cart.`,
        `Gladly — *${name}* has been included.`,
      ],
      upsell: suggestion
        ? [`May I also suggest *${suggestion}*?`, `Perhaps *${suggestion}* might interest you.`]
        : [""],
    },
    excited: {
      added: [
        `🎉 Awesome! *${name}* just got added to your cart!`,
        `🚀 *${name}* locked and loaded!`,
      ],
      upsell: suggestion
        ? [
            `🔥 Check out *${suggestion}* too — it’s trending!`,
            `🚀 *${suggestion}* is super popular right now!`,
          ]
        : [""],
    },
    formal: {
      added: [
        `*${name}* has been successfully added to your cart.`,
        `🛒 Thank you. *${name}* is now saved.`,
      ],
      upsell: suggestion
        ? [
            `Perhaps you might also consider *${suggestion}*.`,
            `💡 *${suggestion}* complements *${name}* nicely.`,
          ]
        : [""],
    },
    slang: {
      added: [
        `Yo fam 🙌 *${name}* locked in the cart!`,
        `🔥 *${name}* secured, boss man!`,
      ],
      upsell: suggestion
        ? [
            `👀 Peep *${suggestion}* — it’s mad clean!`,
            `💯 *${suggestion}* slaps too, you want in?`,
          ]
        : [""],
    },
  };

  // randomize message to keep replies lively
  const options = toneStyles[style]?.[type] || toneStyles.neutral[type];
  return Array.isArray(options)
    ? options[Math.floor(Math.random() * options.length)]
    : options;
}
