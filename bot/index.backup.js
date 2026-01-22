const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();

// Загружаем переменные окружения из .env файла
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://science-show.example.com';
const ORDERS_CHANNEL_ID = -1003551646271; // ID канала для заказов

// Проверяем наличие BOT_TOKEN
if (!BOT_TOKEN) {
  console.error('❌ Ошибка: BOT_TOKEN не найден в .env файле!');
  console.error('Создай файл .env в папке bot/ с переменной BOT_TOKEN');
  process.exit(1);
}

// Создаём экземпляр бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Хранилище логов (можно заменить на БД)
const messageLogs = [];

// Функция для логирования сообщений
const logMessage = (msg) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    chatId: msg.chat.id,
    chatType: msg.chat.type,
    chatTitle: msg.chat.title || msg.chat.username || 'Private Chat',
    userId: msg.from ? msg.from.id : 'channel_post',
    userName: msg.from ? (msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim()) : msg.chat.title,
    isBot: msg.from ? msg.from.is_bot : false,
    messageId: msg.message_id,
    text: msg.text || msg.caption || '[Non-text message]',
    messageType: msg.text ? 'text' : msg.photo ? 'photo' : msg.video ? 'video' : msg.document ? 'document' : 'other'
  };
  
  messageLogs.push(logEntry);
  
  // Консоль лог с красивым форматированием
  console.log('\n📨 НОВОЕ СООБЩЕНИЕ');
  console.log('─'.repeat(60));
  console.log(`📅 Время: ${logEntry.timestamp}`);
  console.log(`💬 Канал/Чат: ${logEntry.chatTitle} (${logEntry.chatType})`);
  console.log(`🆔 ID Канала/Чата: ${logEntry.chatId}`);
  console.log(`👤 От пользователя: @${logEntry.userName} (ID: ${logEntry.userId})${logEntry.isBot ? ' [БОТ]' : ''}`);
  console.log(`📝 Тип сообщения: ${logEntry.messageType}`);
  console.log(`💭 Текст: ${logEntry.text.substring(0, 100)}${logEntry.text.length > 100 ? '...' : ''}`);
  console.log('─'.repeat(60));
  
  // Лимит логов в памяти (последние 1000)
  if (messageLogs.length > 1000) {
    messageLogs.shift();
  }
};

console.log('🤖 Science Show Bot запущен...');

// Получаем информацию о боте
bot.getMe().then((me) => {
  console.log(`✅ Бот авторизован как: @${me.username}`);
  console.log(`🔐 Bot ID: ${me.id}`);
  console.log(`📝 Может получать сообщения в каналах: Да (если бот - админ в канале)`);
  console.log(`💬 Может получать сообщения в группах: Да`);
  console.log(`🔔 Прослушивание сообщений включено!`);
  console.log('─'.repeat(60));
}).catch(err => {
  console.error('❌ Ошибка авторизации бота:', err);
});

// Обработка всех входящих сообщений из каналов
bot.on('message', (msg) => {
  // Логируем все сообщения из каналов, групп, супергрупп и приватных чатов
  if (msg.chat.type === 'channel' || msg.chat.type === 'supergroup' || msg.chat.type === 'group' || msg.chat.type === 'private') {
    logMessage(msg);
  }
});

// Обработка постов в канале (channel_post приходят когда админ/создатель пишет в канал)
bot.on('channel_post', (msg) => {
  console.log('📢 Получен channel_post из канала:', msg.chat.title);
  logMessage(msg);
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🎪 Открыть Веб-Приложение',
            web_app: { url: WEBAPP_URL }
          }
        ],
        [
          {
            text: '📋 Забронировать Шоу',
            callback_data: 'book_show'
          },
          {
            text: 'ℹ️ О нас',
            callback_data: 'about'
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 
    '🌟 Добро пожаловать в Science Show Da Nang!\n\n' +
    '✨ Невероятная Научная Магия от Виктора Вальмонта\n\n' +
    'Выберите действие:', 
    keyboard
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '📚 Доступные команды:\n' +
    '/start - Главное меню\n' +
    '/shows - Посмотреть все шоу\n' +
    '/book - Забронировать шоу\n' +
    '/contact - Контактная информация\n' +
    '/logs - Показать логи сообщений\n' +
    '/logs-clear - Очистить логи\n' +
    '/status - Диагностика работы бота\n' +
    '/help - Справка'
  );
});

// Команда /shows
bot.onText(/\/shows/, (msg) => {
  const chatId = msg.chat.id;
  const showsMessage = 
    '🎪 *Наши Шоу:*\n\n' +
    '❄️ *Взрыв Сухого Льда* - Завораживающие эффекты дыма\n' +
    '🧊 *Волшебство Жидкого Азота* - Экстремальные холодные демонстрации\n' +
    '⚡ *Молния Катушки Тесла* - Высоковольтное электричество\n' +
    '🔥 *Химический Огонь* - Спектакулярные огненные эффекты\n\n' +
    'Нажми кнопку ниже чтобы забронировать!';
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📋 Открыть форму бронирования',
            web_app: { url: `${WEBAPP_URL}#booking` }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, showsMessage, { parse_mode: 'Markdown', ...keyboard });
});

// Команда /contact
bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '📞 *Контактная информация:*\n\n' +
    '📧 Email: viktorvalmontshow@example.com\n' +
    '📱 Телефон: +84 xxx xxx xxx\n' +
    '📍 Адрес: Da Nang, Vietnam\n\n' +
    'Работаем ежедневно с 10:00 до 22:00',
    { parse_mode: 'Markdown' }
  );
});

// Команда /logs - показать последние логи
bot.onText(/\/logs/, (msg) => {
  const chatId = msg.chat.id;
  
  if (messageLogs.length === 0) {
    bot.sendMessage(chatId, '📭 Пока нет логов сообщений');
    return;
  }
  
  const recentLogs = messageLogs.slice(-10).reverse();
  let logsText = `📊 *Последние ${recentLogs.length} сообщений:*\n\n`;
  
  recentLogs.forEach((log, index) => {
    logsText += `${index + 1}. 📅 ${new Date(log.timestamp).toLocaleString()}\n`;
    logsText += `   💬 Канал: ${log.chatTitle}\n`;
    logsText += `   👤 От: @${log.userName}\n`;
    logsText += `   📝 Тип: ${log.messageType}\n`;
    logsText += `   💭 Текст: ${log.text.substring(0, 50)}${log.text.length > 50 ? '...' : ''}\n\n`;
  });
  
  logsText += `\n*Всего логов в памяти: ${messageLogs.length}*`;
  
  bot.sendMessage(chatId, logsText, { parse_mode: 'Markdown' });
});

// Команда /logs-clear - очистить логи
bot.onText(/\/logs-clear/, (msg) => {
  const chatId = msg.chat.id;
  const clearedCount = messageLogs.length;
  
  messageLogs.length = 0;
  
  bot.sendMessage(chatId, 
    `🗑️ *Логи очищены!*\n\n` +
    `Удалено записей: ${clearedCount}`,
    { parse_mode: 'Markdown' }
  );
});

// Команда /status - диагностика работы бота
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const isAdmin = msg.from.id === 0; // Замени на реальный ID админа если нужно
  
  let status = `🤖 *Статус Science Show Bot*\n\n`;
  status += `📊 Всего логов в памяти: ${messageLogs.length}\n`;
  status += `💬 Тип текущего чата: ${msg.chat.type}\n`;
  status += `📍 Chat ID: ${msg.chat.id}\n\n`;
  status += `ℹ️ *ВАЖНО!*\n`;
  status += `Бот логирует сообщения из:\n`;
  status += `✅ Супергрупп (supergroup)\n`;
  status += `✅ Обычных групп (group)\n`;
  status += `✅ Приватных каналов (private)\n`;
  status += `✅ Публичных каналов (channel) - если бот админ\n\n`;
  status += `⚠️ *Если сообщений нет:*\n`;
  status += `1. Проверь что бот добавлен в канал/группу\n`;
  status += `2. В каналах - бот должен быть админом\n`;
  status += `3. Убедись что люди пишут сообщения`;
  
  bot.sendMessage(chatId, status, { parse_mode: 'Markdown' });
});

// Обработка callback кнопок
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  
  switch(query.data) {
    case 'book_show':
      bot.answerCallbackQuery(query.id, { text: '📋 Откроется форма бронирования...' });
      const bookingKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📋 Перейти к бронированию',
                web_app: { url: `${WEBAPP_URL}#booking` }
              }
            ]
          ]
        }
      };
      bot.sendMessage(chatId, 'Нажми кнопку чтобы забронировать шоу:', bookingKeyboard);
      break;
      
    case 'about':
      bot.answerCallbackQuery(query.id);
      const aboutKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🌐 Больше информации',
                web_app: { url: WEBAPP_URL }
              }
            ]
          ]
        }
      };
      bot.sendMessage(chatId, 
        '🎪 *Science Show Da Nang*\n\n' +
        'Невероятная Научная Магия от Виктора Вальмонта\n\n' +
        '✨ Зрелищные химические демонстрации\n' +
        '⚡ Интерактивные эффекты\n' +
        '🎨 UV/Неоновое оформление\n\n' +
        'Идеально для:\n' +
        '🎓 Образовательных мероприятий\n' +
        '🎉 Детских праздников\n' +
        '👨‍👩‍👧‍👦 Семейных событий\n' +
        '🎯 Корпоративных мероприятий',
        { parse_mode: 'Markdown', ...aboutKeyboard }
      );
      break;
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.log('❌ Ошибка polling:', error);
});

bot.on('error', (error) => {
  console.log('❌ Ошибка бота:', error);
});

// ===== EXPRESS СЕРВЕР ДЛЯ API =====
const app = express();
app.use(express.json());

const PORT = process.env.BOT_API_PORT || 3001;

// API Endpoint для получения заказов с сайта
app.post('/api/booking', async (req, res) => {
  try {
    const { name, email, date, guests, message, userAgent } = req.body;
    
    if (!name || !email || !date) {
      return res.status(400).json({ error: 'Не заполнены обязательные поля' });
    }
    
    // Форматируем сообщение для канала
    const orderMessage = `
🎪 *НОВЫЙ ЗАКАЗ ШОუ!*

📝 *Данные заказчика:*
👤 Имя: ${name}
📧 Email: ${email}

📅 *Детали заказа:*
📆 Дата: ${date}
👥 Количество гостей: ${guests}
📋 Описание: ${message || 'не указано'}

🌐 *Информация о заказчике:*
🔗 User Agent: ${userAgent || 'неизвестно'}
⏰ Время заказа: ${new Date().toLocaleString('ru-RU')}

─────────────────────────────────
⚠️ Требуется подтверждение
    `.trim();
    
    // Отправляем в канал заказов
    await bot.sendMessage(ORDERS_CHANNEL_ID, orderMessage, { parse_mode: 'Markdown' });
    
    console.log(`✅ Заказ от ${name} отправлен в канал`);
    
    res.json({ 
      success: true, 
      message: 'Заказ успешно отправлен! Мы скоро свяжемся с вами.',
      orderId: `ORDER_${Date.now()}`
    });
  } catch (error) {
    console.error('❌ Ошибка при обработке заказа:', error);
    res.status(500).json({ 
      error: 'Ошибка при отправке заказа',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bot API server is running' });
});

// Запускаем Express сервер
app.listen(PORT, () => {
  console.log(`\n🌐 API сервер запущен на http://localhost:${PORT}`);
  console.log(`📮 Endpoint для заказов: POST http://localhost:${PORT}/api/booking`);
  console.log(`📢 Заказы будут отправляться в канал: ${ORDERS_CHANNEL_ID}`);
});

console.log('✅ Бот запущен. Используй /help для справки.');
