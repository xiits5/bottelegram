// api/bot.js
// Вебхук Telegram-бота для Vercel (Node.js serverless function).
// Токен бота берётся строго из переменной окружения BOT_TOKEN.
// Ключ Gemini берётся строго из переменной окружения GEMINI_KEY.
// Никаких сторонних библиотек — только встроенный fetch.

const TELEGRAM_API = 'https://api.telegram.org';
// С мая 2026 Google перевела Gemini API на новый эндпоинт Interactions API
// (старый /v1beta/models/{model}:generateContent для новых пользователей отдаёт 404)
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/interactions';

// Модель Gemini (в задаче указано «Gemeni 2.5 flash»; gemini-2.5-flash больше
// не выдаётся новым пользователям — Google в ответе API прямо рекомендует
// перейти на gemini-3.6-flash)
const MODEL = 'gemini-3.6-flash';

// Системный промпт: роль, правила и данные фитнес-зала для ИИ
const SYSTEM_PROMPT = `Ты — ассистент фитнес-зал - ФОРС АРЕНА в Семей. Отвечай кратко, дружелюбно, на русском (клиент пишет на казахском — отвечай на казахском). Правила:
- отвечай ТОЛЬКО по данным ниже; нет ответа в данных — скажи: «Уточню у администратора, оставьте номер» — и не придумывай;
- не называй цен и услуг, которых нет в прайсе;
- [скидки, переносы, возвраты] не обещай — решает администратор;
- на вопросы не о фитнес зале отвечай, что помогаешь только по услугам фитнес зала;
- не проси и не пересказывай данные других клиентов.

ДАННЫЕ:
Файл данных для ИИ — Фитнес-зал «Форс Арена»
г. Семей, Казахстан

1. Основная информация
2. Прайс
Актуальный ориентировочный прайс фитнес-зала «Форс Арена».
3. График работы
Режим работы: 5/2, с понедельника по пятницу.
4. Адрес и как нас найти
Фитнес-зал «Форс Арена» находится в городе Семей, Казахстан.
Точный адрес: [указать адрес].
Ориентир: [указать ориентир].
Парковка: [указать информацию].
5. Правила посещения
Посещение осуществляется по действующему абонементу или разовому посещению.
Для тренировок необходимо использовать чистую спортивную обувь и спортивную одежду.
После использования тренажеров необходимо убрать спортивный инвентарь на место.
Посетители обязаны соблюдать технику безопасности и требования сотрудников зала.
Запрещается повреждать оборудование и мешать другим посетителям.
Фото- и видеосъемка других посетителей допускается только с их согласия.
6. Услуги и возможности
Тренажерный зал
Кардиозона
Зона свободных весов
Персональные тренировки
Раздевалки
Душевые
Шкафчики для хранения вещей
Зона разминки и растяжки
7. Частые вопросы и ответы
Вопрос: Можно ли прийти в зал один раз?
Ответ: Да, доступно разовое посещение стоимостью 1 500 тг.
Вопрос: Какой график работы?
Ответ: Фитнес-зал работает 5 дней в неделю, с понедельника по пятницу, с 09:00 до 18:00. Суббота и воскресенье — выходные.
Вопрос: Сколько стоит абонемент на месяц?
Ответ: Стоимость стандартного абонемента на 1 месяц — 12 000 тг.
Вопрос: Есть ли персональные тренировки?
Ответ: Да, доступны персональные тренировки. Стоимость одной тренировки — 4 000 тг.
Вопрос: Есть ли скидка для студентов?
Ответ: Да, предусмотрен студенческий абонемент на 1 месяц за 9 000 тг при наличии студенческого билета.
Вопрос: Что нужно взять с собой?
Ответ: Спортивную одежду, чистую сменную обувь, полотенце и воду.
Вопрос: Можно ли заморозить абонемент?
Ответ: Условия заморозки необходимо уточнить у администратора фитнес-зала.
8. Важные данные для ИИ
ИИ должен использовать только актуальные данные из этого файла. Если информации в файле нет, нельзя придумывать ответ — необходимо предложить посетителю уточнить информацию у администратора «Форс Арены».

Название фитнес-зала: Фитнес-зал «Форс Арена»
Город: Семей, Казахстан
Тип заведения: Фитнес-зал / тренажерный зал
Телефон: +7 (___) ___-__-__
WhatsApp: +7 (___) ___-__-__
Instagram: @__________
Сайт: https://__________

Прайс:
Разовое посещение — 1 500 тг (одно посещение тренажерного зала)
Абонемент на 1 месяц — 12 000 тг (посещение в течение 1 месяца)
Абонемент на 3 месяца — 30 000 тг (посещение в течение 3 месяцев)
Абонемент на 6 месяцев — 54 000 тг (посещение в течение 6 месяцев)
Абонемент на 12 месяцев — 90 000 тг (посещение в течение 12 месяцев)
Студенческий абонемент на 1 месяц — 9 000 тг (при наличии студенческого билета)
Персональная тренировка — 4 000 тг (индивидуальная тренировка с тренером)
Пакет 8 персональных тренировок — 28 000 тг (8 тренировок с тренером)

График работы:
Понедельник 09:00–18:00
Вторник 09:00–18:00
Среда 09:00–18:00
Четверг 09:00–18:00
Пятница 09:00–18:00
Суббота — выходной
Воскресенье — выходной`;

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

// Ответ, когда Gemini недоступен, лимит исчерпан или произошла ошибка
const AI_BUSY_REPLY = 'Сейчас много обращений, попробуйте через минуту 🙏';

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

// Извлекает текст ответа модели из ответа Interactions API
// (steps[].content[].text, где step.type === 'model_output')
function extractInteractionText(data) {
  if (data && typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (!data || !Array.isArray(data.steps)) {
    return null;
  }

  const parts = [];
  for (const step of data.steps) {
    if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const item of step.content) {
      if (item?.type === 'text' && typeof item.text === 'string') {
        parts.push(item.text);
      }
    }
  }

  const text = parts.join('\n').trim();
  return text || null;
}

// Запрос к Gemini API (Interactions API): SYSTEM_PROMPT передаётся как
// системная инструкция перед вопросом пользователя
async function askGemini(geminiKey, userText) {
  const response = await fetch(GEMINI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      system_instruction: SYSTEM_PROMPT,
      input: userText,
    }),
  });

  if (response.status === 429) {
    const err = new Error('Gemini rate limit');
    err.rateLimited = true;
    throw err;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('Gemini API error:', response.status, errorBody);
    throw new Error(`Gemini API error ${response.status}`);
  }

  const data = await response.json();

  if (data?.status === 'failed' || (Array.isArray(data?.errors) && data.errors.length)) {
    console.error('Gemini API: failed interaction', JSON.stringify(data));
    throw new Error('Gemini API: failed interaction');
  }

  const answer = extractInteractionText(data);

  if (!answer) {
    console.error('Gemini API: empty response', JSON.stringify(data));
    throw new Error('Gemini API: empty response');
  }

  return answer;
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

    if (Object.prototype.hasOwnProperty.call(REPLIES, text)) {
      // Известная команда/кнопка — обрабатываем как раньше
      await sendMessage(botToken, chatId, REPLIES[text]);
    } else {
      // Любое другое сообщение — отправляем модели Gemini
      const geminiKey = process.env.GEMINI_KEY;
      let replyText;

      if (!geminiKey) {
        console.error('GEMINI_KEY is not set in environment variables');
        replyText = AI_BUSY_REPLY;
      } else {
        try {
          replyText = await askGemini(geminiKey, text);
        } catch (error) {
          // Ошибка или лимит (429) — не показываем клиенту техническую ошибку
          console.error('Gemini request failed:', error);
          replyText = AI_BUSY_REPLY;
        }
      }

      await sendMessage(botToken, chatId, replyText);
    }

    res.status(200).send('OK');
  } catch (error) {
    // Telegram должен получить 200 в любом случае, чтобы не повторять запрос
    console.error('Bot handler error:', error);
    res.status(200).send('OK');
  }
};
