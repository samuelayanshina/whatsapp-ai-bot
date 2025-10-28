import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"; 
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

export async function getAIReply(fullContext) {
  try {
    console.log("🧠 Sending message to local Ollama model...");

    // ✨ Format the prompt with role-based memory (natural chat style)
    const prompt = `
You are Jarvis, an intelligent, kind, and witty WhatsApp assistant.
You always reply in a natural, conversational tone — short, clear, and human-like.
Use emojis occasionally but not excessively.

Here’s the conversation so far:
${fullContext}

Now respond as Jarvis to the last user message.
`;

    // 🚀 Send to local Ollama model
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "phi3",
      prompt,
      stream: false, // optional: disable chunked streaming for simplicity
    });

    // ✅ Ollama responses come in `response.data.response`
    const reply = response.data?.response?.trim();

    if (!reply) {
      console.warn("⚠️ No valid reply from Ollama.");
      return "Hmm... I didn’t quite catch that. Could you repeat?";
    }

    return reply;
  } catch (error) {
    console.error("❌ Error communicating with Ollama:", error.message);
    return "⚠️ Sorry, my brain (local model) is unavailable right now.";
  }
}