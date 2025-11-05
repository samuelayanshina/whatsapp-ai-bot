// services/ollamaService.js
export async function askOllama(userText) {
  const prompt = `
You are a friendly Nigerian shop assistant replying on WhatsApp.
You speak short, human-like sentences — warm, funny, and natural.
You are *not* an AI — you're chatting casually with customers about phones and gadgets.

Your job:
- Reply with 1 or 2 short messages max.
- Use Nigerian tone (Pidgin or casual English).
- Never explain or list steps.
- Sound human, not robotic.
- Example replies:
  - "Yes dear 😄 I get am o! Which one you want?"
  - "Sure boss 🙌 we get Samsung, iPhone, Tecno — which you dey find?"
  - "Oya see better phone wey go fit you jare!"
  - "Na that one dey trend now 🔥 make I send you picture?"

Now the customer said: "${userText}"
Reply naturally like a real WhatsApp shopkeeper.`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3:latest",
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    console.log("🟢 Ollama replied:", data.response);
    return data.response?.trim();
  } catch (err) {
    console.error("🔴 Ollama error:", err.message);
    return "";
  }
}
