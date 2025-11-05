import wppconnect from '@wppconnect-team/wppconnect';
// import nodemailer from 'nodemailer';
// import connectDB from "./services/db.js";
import dotenv from "dotenv";

dotenv.config();
// connectDB();

// ---- CONFIG ----
const SESSION_NAME = 'whatsapp-ai-bot';
const ADMIN_EMAIL = 'your-email@example.com';
// ----------------

async function startClient() {
  try {
    const client = await wppconnect.create({
      session: SESSION_NAME,
      headless: true,
      autoClose: false,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        console.log('📱 Scan this QR code to link WhatsApp:');
        console.log(asciiQR);
      },
      statusFind: (statusSession, session) => {
        console.log('🔍 Session Status:', statusSession);
        console.log('📦 Session Name:', session);
      },
    });

    console.log('🤖 WhatsApp AI bot connected and running!');
    listenToMessages(client);
    monitorConnection(client);

  } catch (error) {
    console.error('❌ Failed to create WhatsApp client:', error);
    console.log('⏳ Retrying connection in 15 seconds...');
    setTimeout(startClient, 15000);
  }
}

// ---- Message Handler ----
function listenToMessages(client) {
  client.onMessage(async (message) => {
    console.log('📩 Message received:', message.body);

    const text = message.body?.trim().toLowerCase();
    if (!text) return;

    if (text === 'hi' || text === 'hello') {
      await client.sendText(message.from, '👋 Hello! Your WhatsApp AI bot is online and resilient 💪');
    }
  });
}

// ---- Connection Watchdog ----
function monitorConnection(client) {
  client.onStateChange((state) => {
    console.log('⚙️ Connection State:', state);

    if (['DISCONNECTED', 'UNPAIRED', 'CONFLICT', 'UNLAUNCHED'].includes(state)) {
      console.warn('🚨 WhatsApp connection lost! Attempting reconnection...');
      alertAdmin('WhatsApp bot lost connection, attempting to reconnect...');
      setTimeout(() => startClient(), 10000);
    }
  });

  client.onLogout(() => {
    console.warn('🚪 Client logged out. Restarting session...');
    alertAdmin('WhatsApp bot logged out, restarting session...');
    setTimeout(() => startClient(), 10000);
  });
}

// ---- Notification System ----
function alertAdmin(message) {
  console.log(`📢 ALERT: ${message}`);
  // Later: add email/WhatsApp alert logic here
}

// ---- Start bot ----
startClient();
