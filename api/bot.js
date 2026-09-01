// api/bot.js
const TELEGRAM_API = 'https://api.telegram.org';
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/interactions';

const MODEL = 'gemini-3.6-flash';
const SYSTEM_PROMPT = "Ты — ассистент фитнес-зала «Форс Арена» в Семее. Отвечай кратко, дружелюбно, на русском (если клиент пишет на казахском — отвечай на казахском).\nПравила:\n- отвечай ТОЛЬКО по данным ниже; если ответа в данных нет — скажи: «Уточню у администратора, оставьте номер» — и не придумывай;\n- не называй цен и услуг, которых нет в прайсе;\n- скидки, переносы и возвраты не обещай — решает администратор;\n- на вопросы не о фитнес-зале отвечай, что помогаешь только по услугам фитнес-зала;\n- не проси и не пересказывай данные других клиентов.\n\nДАННЫЕ:\nФитнес-зал «Форс Арена», Семей, Казахстан.\nАдрес: г. Семей, ул. Абая, 118, вход со стороны парковки.\nТелефон: +7 (700) 123-45-67 (в файле указан как примерный контакт).\nГрафик: понедельник–суббота 09:00–23:00, воскресенье — выходной.\nУслуги: тренажёрный зал, кардиозона, свободные веса, силовые тренажёры, персональные тренировки, вводная консультация.\nПрайс:\nРазовое посещение — 2 000 ₸, 1 посещение.\nАбонемент 1 месяц — 12 000 ₸, безлимитное посещение.\nАбонемент 3 месяца — 30 000 ₸, безлимитное посещение.\nАбонемент 6 месяцев — 52 000 ₸, безлимитное посещение.\nАбонемент 12 месяцев — 90 000 ₸, безлимитное посещение.\nУтренняя карта — 8 000 ₸, 09:00–14:00.\nПерсональная тренировка — 5 000 ₸, 1 занятие с тренером.\nПерсональная тренировка — 10 занятий — 42 000 ₸.\nВводная тренировка — бесплатно, для новых клиентов.\nПравила: соблюдать требования сотрудников и технику безопасности; перед первой тренировкой рекомендуется инструктаж; нужна чистая спортивная одежда и сменная обувь; инвентарь после использования возвращать на место; нельзя бросать инвентарь и создавать опасные ситуации; при плохом самочувствии прекратить тренировку и обратиться к сотруднику; несовершеннолетние — по внутренним правилам клуба и с согласия родителей/представителей; абонемент персональный; фото/видео других посетителей только с их согласия; при нарушениях безопасности доступ может быть временно ограничен.\nРекомендуется взять спортивную одежду, сменную обувь, полотенце и воду.";
const mainKeyboard = {"keyboard": [[{"text": "💪 Услуги"}, {"text": "💰 Цены"}], [{"text": "🕐 График работы"}, {"text": "📍 Адрес"}], [{"text": "📋 Правила"}, {"text": "🎯 Вводная тренировка"}], [{"text": "🏋️ Персональные тренировки"}, {"text": "🎒 Что взять с собой"}]], "resize_keyboard": true, "one_time_keyboard": false, "is_persistent": true};
const REPLIES = {"/start": "Здравствуйте! 👋\nДобро пожаловать в «Форс Арена» — фитнес-зал в Семее! 💪\nУ нас есть тренажёрный зал, кардиозона, свободные веса, силовые тренажёры и персональные тренировки.\nДля новых клиентов предусмотрена бесплатная вводная тренировка.\nВыберите интересующий раздел ниже 👇", "💪 Услуги": "💪 Услуги «Форс Арены»:\n\n• Тренажёрный зал\n• Кардиозона\n• Свободные веса\n• Силовые тренажёры\n• Персональные тренировки\n• Вводная консультация", "💰 Цены": "💰 Цены:\n\n• Разовое посещение — 2 000 ₸\n• 1 месяц — 12 000 ₸\n• 3 месяца — 30 000 ₸\n• 6 месяцев — 52 000 ₸\n• 12 месяцев — 90 000 ₸\n• Утренняя карта — 8 000 ₸ (09:00–14:00)\n• Персональная тренировка — 5 000 ₸\n• 10 персональных тренировок — 42 000 ₸\n• Вводная тренировка — бесплатно для новых клиентов", "🕐 График работы": "🕐 Понедельник–суббота: 09:00–23:00\nВоскресенье — выходной.", "📍 Адрес": "📍 «Форс Арена»\nг. Семей, ул. Абая, 118\nВход со стороны парковки.", "📋 Правила": "📋 Правила посещения:\n\n• Соблюдайте требования сотрудников и технику безопасности.\n• Перед первой тренировкой рекомендуется пройти инструктаж.\n• Нужны чистая спортивная одежда и сменная обувь.\n• Возвращайте инвентарь на место.\n• Не бросайте инвентарь и не создавайте опасных ситуаций.\n• При плохом самочувствии прекратите тренировку и обратитесь к сотруднику.\n• Несовершеннолетние — по правилам клуба и с согласия родителей/представителей.\n• Абонемент персональный.\n• Фото/видео других посетителей — только с их согласия.", "🎯 Вводная тренировка": "🎯 Для новых клиентов вводная тренировка — бесплатно.\nПеред первой тренировкой рекомендуется пройти инструктаж по технике безопасности.", "🏋️ Персональные тренировки": "🏋️ Персональные тренировки:\n\n• 1 занятие — 5 000 ₸\n• 10 занятий — 42 000 ₸", "🎒 Что взять с собой": "🎒 Рекомендуется взять:\n\n• спортивную одежду\n• сменную обувь\n• полотенце\n• воду"};
const AI_BUSY_REPLY = 'Сейчас много обращений, попробуйте через минуту 🙏';

async function sendMessage(botToken, chatId, text) {
  const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: mainKeyboard })
  });
  if (!response.ok) console.error('Telegram sendMessage error:', response.status, await response.text().catch(() => ''));
}

function extractInteractionText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  if (!Array.isArray(data?.steps)) return null;
  const parts = [];
  for (const step of data.steps || []) {
    if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
    for (const item of step.content) if (item?.type === 'text' && typeof item.text === 'string') parts.push(item.text);
  }
  return parts.join('\n').trim() || null;
}

async function askGemini(geminiKey, userText) {
  const input = `${SYSTEM_PROMPT}\n\nВопрос пользователя:\n${userText}`;
  const response = await fetch(GEMINI_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
    body: JSON.stringify({ model: MODEL, input })
  });
  if (response.status === 429) throw new Error('RATE_LIMIT');
  if (!response.ok) {
    console.error('Gemini API error:', response.status, await response.text().catch(() => ''));
    throw new Error(`Gemini API error ${response.status}`);
  }
  const data = await response.json();
  if (data?.status === 'failed' || (Array.isArray(data?.errors) && data.errors.length)) throw new Error('Gemini failed');
  const answer = extractInteractionText(data);
  if (!answer) throw new Error('Gemini empty response');
  return answer;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(200).send('OK');
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) { console.error('BOT_TOKEN is not set'); return res.status(200).send('OK'); }
    const message = (req.body || {}).message;
    if (!message || typeof message.text !== 'string') return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (Object.prototype.hasOwnProperty.call(REPLIES, text)) {
      await sendMessage(botToken, chatId, REPLIES[text]);
      return res.status(200).send('OK');
    }

    let replyText = AI_BUSY_REPLY;
    const geminiKey = process.env.GEMINI_KEY;
    if (geminiKey) {
      try { replyText = await askGemini(geminiKey, text); }
      catch (error) { console.error('Gemini request failed:', error); }
    } else console.error('GEMINI_KEY is not set');

    await sendMessage(botToken, chatId, replyText);
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Bot handler error:', error);
    return res.status(200).send('OK');
  }
};
