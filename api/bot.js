// api/bot.js
// Вебхук Telegram-бота для Vercel (Node.js serverless function).
// Токен бота берётся строго из переменной окружения BOT_TOKEN.
// Никаких сторонних библиотек — только встроенный fetch.

const TELEGRAM_API = 'https://api.telegram.org';

// Главная клавиатура с кнопками меню
const mainKeyboard = {
  keyboard: [
    [{ text: 'Услуги' }, { text: 'Цены' }, { text: 'Контакты' }],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
};

// Тексты ответов на кнопки меню
const REPLIES = {
  '/start': '[ПРИВЕТСТВИЕ]',
  'Услуги': '[ТЕКСТ]',
  'Цены': '[ТЕКСТ]',
  'Контакты': '[ТЕКСТ]',
};

const FALLBACK_REPLY = 'Нажмите одну из кнопок меню 👇';

async function sendMessage(botToken, chatId, text) {
  const url = `${TELEGRAM_API}/bot${botToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: mainKeyboard,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('Telegram sendMessage error:', response.status, errorBody);
  }
}

module.exports = async (req, res) => {
  try {
    // Telegram присылает обновления только через POST
    if (req.method !== 'POST') {
      res.status(200).send('OK');
      return;
    }

    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      console.error('BOT_TOKEN is not set in environment variables');
      res.status(200).send('OK');
      return;
    }

    // Vercel автоматически парсит JSON-тело в req.body
    const update = req.body || {};
    const message = update.message;

    // Нет текстового сообщения — отвечаем Telegram 200 и ничего не делаем
    if (!message || typeof message.text !== 'string') {
      res.status(200).send('OK');
      return;
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    const replyText = Object.prototype.hasOwnProperty.call(REPLIES, text)
      ? REPLIES[text]
      : FALLBACK_REPLY;

    await sendMessage(botToken, chatId, replyText);

    res.status(200).send('OK');
  } catch (error) {
    // Telegram должен получить 200 в любом случае, чтобы не повторять запрос
    console.error('Bot handler error:', error);
    res.status(200).send('OK');
  }
};
