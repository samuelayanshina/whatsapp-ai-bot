import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import whatsappRoutes from "./routes/whatsapp.js";
import { loadMemory } from "./services/memory.js";
import { startWhatsAppClient } from "./services/whatsappClient.js";

dotenv.config();
const app = express();

// ✅ Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Confirm the route file is loaded
console.log("🧭 WhatsApp route loaded:", typeof whatsappRoutes);

// ✅ Default test route
app.get("/", (req, res) => {
  res.send("✅ WhatsApp AI Bot is running");
});

// ✅ Mount the WhatsApp routes
app.use("/api/whatsapp", whatsappRoutes);

// ✅ Define the port BEFORE using it
const PORT = process.env.PORT || 5050;

// ✅ Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ✅ Debug all registered routes
  if (app._router && app._router.stack) {
    console.log("📜 Registered Routes:");
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log("🔹", middleware.route.path);
      } else if (middleware.name === "router") {
        middleware.handle.stack.forEach((handler) => {
          const routePath = handler.route?.path;
          if (routePath) console.log("🔸", routePath);
        });
      }
    });
  }
});

// ✅ Start WhatsApp bot with persistent memory
async function startApp() {
  await loadMemory(); // 🧠 Load saved memory
  await startWhatsAppClient(); // 💬 Start WhatsApp client
}

startApp().catch((err) => console.error("❌ Error starting app:", err));
