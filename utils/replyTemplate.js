// utils/replyTemplate.js

// ✅ This helper formats messages to send via WhatsApp Cloud API
export function replyTemplate(to, text) {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: text,
    },
  };
}
