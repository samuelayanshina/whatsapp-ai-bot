import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import customerRoutes from "./routes/customerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";

// 🚀 NEW: Start WhatsApp Client
import { startWhatsAppClient } from "../bot/services/whatsappClient.js";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoices", invoiceRoutes);

// Default
app.get("/", (req, res) => {
  res.send("WhatsApp Business Backend Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ START THE WHATSAPP BOT
startWhatsAppClient()
  .then(() => console.log("🤖 WhatsApp Bot Loaded Successfully"))
  .catch(err => console.error("🔥 WhatsApp Bot Failed to Start:", err));
