// src/bot/telegram.bot.js
// Telegram bot setup and conversation flow.

const TelegramBot = require("node-telegram-bot-api");
const ownerService = require("../services/owner.service");
const violationService = require("../services/violation.service");

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
  console.warn("[BOT] BOT_TOKEN not provided. Telegram bot will not start.");
}

// In-memory conversation state: chatId -> { step, data }
const conversationState = new Map();

function resetConversation(chatId) {
  conversationState.delete(chatId);
}

function initTelegramBot() {
  if (!BOT_TOKEN) {
    return null;
  }

  const bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log("[BOT] Telegram bot started with polling.");

  // /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "🚦 مرحباً بك في نظام إدارة المخالفات المرورية\n\nاكتب /add لإضافة مخالفة"
    );
  });

  // /add command - begin interactive flow
  bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;

    conversationState.set(chatId, {
      step: "CAR_NUMBER",
      data: {},
    });

    bot.sendMessage(chatId, "أدخل رقم السيارة:");
  });

  // Handle regular messages for the interactive flow
  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const text = (msg.text || "").trim();

      // Ignore commands (handled separately)
      if (text.startsWith("/")) {
        return;
      }

      const state = conversationState.get(chatId);
      if (!state) {
        return;
      }

      if (state.step === "CAR_NUMBER") {
        if (!text) {
          bot.sendMessage(chatId, "رقم السيارة لا يمكن أن يكون فارغاً. الرجاء إدخال رقم السيارة.");
          return;
        }

        state.data.carNumber = text;
        state.step = "VIOLATION_TYPE";
        conversationState.set(chatId, state);

        bot.sendMessage(chatId, "أدخل نوع المخالفة (مثال: سرعة زائدة، إشارة حمراء).");
        return;
      }

      if (state.step === "VIOLATION_TYPE") {
        if (!text) {
          bot.sendMessage(chatId, "نوع المخالفة لا يمكن أن يكون فارغاً. الرجاء إدخال نوع المخالفة.");
          return;
        }

        state.data.violationType = text;
        state.step = "AMOUNT";
        conversationState.set(chatId, state);

        bot.sendMessage(chatId, "أدخل قيمة المخالفة (رقم).");
        return;
      }

      if (state.step === "AMOUNT") {
        const amount = parseFloat(text);
        if (Number.isNaN(amount) || amount <= 0) {
          bot.sendMessage(chatId, "قيمة المخالفة يجب أن تكون رقماً أكبر من صفر. حاول مرة أخرى.");
          return;
        }

        state.data.amount = amount;
        state.step = "LOCATION";
        conversationState.set(chatId, state);

        bot.sendMessage(chatId, "أدخل موقع المخالفة.");
        return;
      }

      if (state.step === "LOCATION") {
        if (!text) {
          bot.sendMessage(chatId, "الموقع لا يمكن أن يكون فارغاً. الرجاء إدخال موقع المخالفة.");
          return;
        }

        state.data.location = text;
        conversationState.set(chatId, state);

        const { carNumber, violationType, amount, location } = state.data;

        // Lookup owner by car number
        const owner = await ownerService.getOwnerByCarNumber(carNumber);
        if (!owner) {
          bot.sendMessage(chatId, "🚫 لم يتم العثور على سيارة بهذا الرقم في النظام.");
          resetConversation(chatId);
          return;
        }

        // Create violation
        const violation = await violationService.createViolation({
          ownerId: owner.id,
          violationType,
          amount,
          location,
        });

        const confirmation =
          "✅ تم تسجيل المخالفة بنجاح.\n\n" +
          `المالك: ${owner.full_name}\n` +
          `رقم السيارة: ${owner.car_number}\n` +
          `نوع المخالفة: ${violation.violation_type}\n` +
          `القيمة: ${violation.amount}\n` +
          `الموقع: ${violation.location}\n` +
          `الحالة: ${violation.status}\n` +
          `معرّف المخالفة: ${violation.id}`;

        bot.sendMessage(chatId, confirmation);
        resetConversation(chatId);
        return;
      }
    } catch (err) {
      console.error("[BOT] Error handling message:", err);
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, "❌ حدث خطأ أثناء معالجة طلبك. حاول مرة أخرى.");
      resetConversation(chatId);
    }
  });

  return bot;
}

// Initialize immediately on import
const botInstance = initTelegramBot();

module.exports = botInstance;

