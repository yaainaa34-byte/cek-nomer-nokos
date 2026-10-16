
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("ERROR: BOT_TOKEN belum diisi di .env");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    [
      "🔎 CEK NOMOR NOKOS",
      "",
      "Gunakan perintah:",
      "/cek 6281234567890",
      "",
      "Bot memeriksa format dan validitas nomor",
      "berdasarkan aturan penomoran negara.",
      "Status aktif dan kemampuan menerima OTP",
      "tidak bisa dipastikan dari format saja."
    ].join("\n")
  );
});

bot.onText(/^\/cek(?:@\w+)?(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match[1]?.trim();

  if (!input) {
    return bot.sendMessage(
      chatId,
      "❌ Masukkan nomor.\nContoh: /cek 6281234567890"
    );
  }

  // Hanya menerima satu nomor, tanpa teks tambahan.
  if (!/^\+?[0-9\s()-]+$/.test(input)) {
    return bot.sendMessage(chatId, "❌ Format input nomor tidak valid.");
  }

  try {
    const phone = parsePhoneNumberFromString(input, "ID");

    if (!phone) {
      return bot.sendMessage(chatId, "❌ Nomor tidak dapat dibaca.");
    }

    const valid = phone.isValid();
    const possible = phone.isPossible();

    const result = [
      "🔎 HASIL CEK NOMOR",
      "",
      `📱 Nomor: ${phone.formatInternational()}`,
      `🌍 Negara: ${phone.country || "Tidak diketahui"}`,
      `📏 Panjang nomor: ${possible ? "Sesuai perkiraan" : "Tidak sesuai"}`,
      `✅ Validitas format: ${valid ? "Valid" : "Tidak valid"}`,
      "",
      valid
        ? "⚠️ Nomor belum tentu aktif atau bisa menerima OTP."
        : "Nomor tidak cocok dengan aturan penomoran yang dikenali."
    ].join("\n");

    await bot.sendMessage(chatId, result);
  } catch (error) {
    console.error("Kesalahan pengecekan:", error.message);
    await bot.sendMessage(chatId, "❌ Terjadi kesalahan saat memeriksa nomor.");
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("Bot cek nomor berjalan.");
    
