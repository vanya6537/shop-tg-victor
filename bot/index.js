const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { t, getUserLanguage } = require('./i18n');
const { getLanguageForUser, setUserLanguage } = require('./user-languages');
const { createOrder, getAllOrders, getOrderById, getOrderByNumber, getUserOrders, updateOrderStatus, getStatusLabel } = require('./database');
const { isAdmin, registerAdminId, getAdminInfo } = require('./admin-config');
const { getDashboardStats, formatStatsMessage, exportOrdersToCSV, getCustomerDetails } = require('./admin-utils');

// Загружаем переменные окружения из .env файла
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://science-show.example.com';
const ORDERS_CHANNEL_ID = -5010977237; // ID канала для заказов
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) || [];

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

console.log('🤖 Flow Hammer Shop Bot запущен...');

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

// ⚠️ ВАЖНО: Данные из Telegram.WebApp.sendData() приходят как message.web_app_data
// Обработка данных от Telegram Mini App (веб-приложение)
bot.on('message', async (msg) => {
  // Обработка данных из Mini App (ReplyKeyboard с web_app)
  if (msg.web_app_data && msg.web_app_data.data) {
    console.log('\n✨✨✨ ПОЛУЧЕНЫ WEB_APP_DATA! ✨✨✨');
    console.log('─'.repeat(60));
    
    try {
      const data = JSON.parse(msg.web_app_data.data);
      console.log('📦 Распарсенные данные:', JSON.stringify(data, null, 2));
      
      // Извлекаем данные из структуры order_v1
      const customer = data.customer || {};
      const cart = data.cart || {};
      const items = cart.items || [];
      const userId = msg.from.id;
      const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`.trim();
      const timestamp = data.timestamp;
      const lang = getUserLanguage(msg.from);
      
      console.log('\n✉️ ПОЛУЧЕНЫ ДАННЫЕ ЗАКАЗА ИЗ ВЕБ-ПРИЛОЖЕНИЯ');
      console.log('─'.repeat(60));
      console.log('👤 Заказчик:', customer.name);
      console.log('📞 Контакт:', customer.contact);
      console.log('📝 Примечание:', customer.note);
      console.log('🛒 Товаров в заказе:', items.length);
      console.log('💰 Сумма:', cart.subtotal, cart.currency);
      console.log('🕐 Время отправки:', timestamp);
      
      // Сохраняем заказ в БД
      const orderResult = await createOrder({
        userId: userId,
        username: username,
        customerName: customer.name,
        customerContact: customer.contact,
        customerNote: customer.note,
        items: items,
        subtotal: cart.subtotal,
        currency: cart.currency
      });
      
      console.log(`✅ Заказ сохранён в БД: ${orderResult.orderNumber} (ID: ${orderResult.id})`);
      
      // Форматируем товары в красивый список
      let itemsList = '';
      items.forEach((item, idx) => {
        itemsList += `${idx + 1}. *${item.title}*\n`;
        itemsList += `   Количество: ${item.qty}\n`;
        itemsList += `   Цена: $${item.lineTotal}\n\n`;
      });
      
      // Отправляем подтверждение юзеру в личку
      await bot.sendMessage(msg.chat.id, 
        `✅ *Спасибо за заказ, ${customer.name || 'друже'}!*\n\n` +
        `Мы получили ваш заказ на сумму *$${cart.subtotal} ${cart.currency}*\n\n` +
        `📦 *Товары:*\n${itemsList}\n` +
        `Мы свяжемся с вами по номеру *${customer.contact}* в течение часа\n\n` +
        `📌 Номер заказа: \`${orderResult.orderNumber}\`\n` +
        `❓ Чтобы проверить статус, используй: /my-orders`,
        { parse_mode: 'Markdown' }
      );
      console.log(`✅ Подтверждение отправлено пользователю ${username}`);
      
      // Уведомляем администраторов
      const adminMessage = `🛍️ *НОВЫЙ ЗАКАЗ!*\n\n` +
        `📌 Номер: \`${orderResult.orderNumber}\`\n` +
        `👤 Имя: ${customer.name || 'не указано'}\n` +
        `📞 Контакт: ${customer.contact || 'не указано'}\n` +
        `👥 Telegram: @${username} (ID: ${userId})\n\n` +
        `📦 *Товары:*\n${itemsList}\n` +
        `💰 *Итого: $${cart.subtotal} ${cart.currency}*\n\n` +
        `📋 *Примечание:* ${customer.note || 'не указано'}\n\n` +
        `⏰ Время: ${new Date(timestamp).toLocaleString('ru-RU')}\n` +
        `📊 Статус: ⏳ Pending\n\n` +
        `Используй /orders чтобы управлять заказами`;
      
      for (const adminId of ADMIN_IDS) {
        try {
          await bot.sendMessage(adminId, adminMessage, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error(`⚠️ Не удалось отправить уведомление админу ${adminId}:`, err.message);
        }
      }
      
      console.log('─'.repeat(60));
      return; // Не логируем web_app_data как обычное сообщение
    } catch (error) {
      console.error('❌ Ошибка при обработке web_app_data:', error);
      await bot.sendMessage(msg.chat.id, 
        '❌ Ошибка при обработке заказа. Пожалуйста, попробуйте позже.',
        { parse_mode: 'Markdown' }
      );
      return;
    }
  }
  
  // Логируем все остальные сообщения из каналов, групп, супергрупп и приватных чатов
  if (msg.chat.type === 'channel' || msg.chat.type === 'supergroup' || msg.chat.type === 'group' || msg.chat.type === 'private') {
    logMessage(msg);
  }
});

// Обработка постов в канале (channel_post приходят когда админ/создатель пишет в канал)
bot.on('channel_post', (msg) => {
  console.log('📢 Получен channel_post из канала:', msg.chat.title);
  logMessage(msg);
});

// Команда /start - смешанное меню (ReplyKeyboard + Inline)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const lang = getLanguageForUser(msg.from);
  
  // Кнопки выбора языка
  const languageKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
          { text: '🇬🇧 English', callback_data: 'lang_en' },
          { text: '🇻🇳 Tiếng Việt', callback_data: 'lang_vi' }
        ]
      ]
    }
  };
  
  // Сначала отправляем ReplyKeyboard с web_app кнопками
  const replyKeyboard = {
    reply_markup: {
      keyboard: [
        [
          {
            text: '🛒 ' + (lang === 'ru' ? 'Магазин' : lang === 'vi' ? 'Cửa hàng' : 'Shop'),
            web_app: { url: WEBAPP_URL }
          },
          {
            text: '🛒 ' + (lang === 'ru' ? 'Оформить заказ' : lang === 'vi' ? 'Đặt hàng' : 'Order'),
            web_app: { url: `${WEBAPP_URL}#booking` }
          }
        ]
      ],
      resize_keyboard: true
    }
  };

  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t(lang, 'buttons.products'),
            callback_data: 'products_list'
          },
          {
            text: t(lang, 'buttons.contacts'),
            callback_data: 'contact_info'
          }
        ]
      ]
    }
  };

  // Отправляем выбор языка первым
  bot.sendMessage(chatId, 
    (lang === 'ru' ? '🌐 *Выберите язык / Chọn ngôn ngữ / Select language*' : 
     lang === 'vi' ? '🌐 *Chọn ngôn ngữ / Выберите язык / Select language*' : 
     '🌐 *Select language / Выберите язык / Chọn ngôn ngữ*'), 
    languageKeyboard
  );

  // Отправляем основное сообщение с inline кнопками
  bot.sendMessage(chatId, 
    t(lang, 'start.title') + '\n\n' +
    t(lang, 'start.description'), 
    inlineKeyboard
  );
  
  // Отправляем отдельное сообщение с web_app кнопками для бронирования
  bot.sendMessage(chatId,
    '🛒 ' + t(lang, 'start.catalog'),
    replyKeyboard
  );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '📚 Доступные команды:\n' +
    '/start - Главное меню\n' +
    '/products - Наши три звёзды (массажные палки)\n' +
    '/trust - Почему вам стоит нам верить\n' +
    '/book - Оформить заказ\n' +
    '/contact - Контактная информация\n' +
    '/logs - Показать логи сообщений\n' +
    '/logs-clear - Очистить логи\n' +
    '/status - Диагностика работы бота\n' +
    '/help - Справка'
  );
});

// Команда /products - подробная информация о трёх хедлайнерских палках
bot.onText(/\/products/, (msg) => {
  const chatId = msg.chat.id;
  const productsMessage = 
    '🛍️ *ТРИ ЗВЕЗДЫ НАШЕГО МАГАЗИНА*\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '🧊 *КОМПАКТНАЯ: Mini Pocket (12.99$)*\n' +
    '📏 Длина: 10 см — в сумку, в карман\n' +
    '✨ Идеальна для: офиса, путешествий, быстрых сессий\n' +
    '💪 Материал: пластик ABS + силикон\n' +
    '⭐ Техника: удобная в ладони\n\n' +
    '💆 *СРЕДНЯЯ: Therapy Ergonomic (24.99$)*\n' +
    '📏 Длина: 30 см — универсальная\n' +
    '✨ Идеальна для: дома, спортзала, повседневного использования\n' +
    '💪 Материал: гибкий корпус + мягкий наконечник\n' +
    '⭐ Техника: точное попадание в триггер-точки\n\n' +
    '🥇 *ПРОФЕССИОНАЛЬНАЯ: Acupressure Pro (19.99$)*\n' +
    '📏 Длина: 45 см — для серьёзной работы\n' +
    '✨ Идеальна для: глубокого массажа, спины, ног\n' +
    '💪 Материал: хардкорный ABS + жёсткий силикон\n' +
    '⭐ Техника: традиционная акупрессура\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '🎯 *ПЛЮС: Character Helmet Cover (8.99$)*\n' +
    '😊 Милый дизайн full-face для мотоциклистов\n' +
    '🛡️ Защита шлема + стиль на фото\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '✅ *3000+ довольных клиентов*\n' +
    '✅ Гарантия качества 30 дней\n' +
    '✅ Бесплатная доставка на первый заказ\n\n' +
    'Нажми кнопку ниже чтобы добавить в корзину!';
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🛒 Открыть магазин',
            web_app: { url: `${WEBAPP_URL}#products` }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, productsMessage, { parse_mode: 'Markdown', ...keyboard });
  
  // Send helmet cover image - try with a simpler approach
  console.log('📸 Отправляю фото товара...');
  try {
    // Using the real helmet cover image
    const helmetImageUrl = 'https://i.ibb.co/mrBvbTL5/2026-01-23-03-55-03.jpg';
    bot.sendPhoto(chatId, helmetImageUrl, {
      caption: '🧸 *Character Helmet Cover - Стиль & Защита*\n💙 Милый дизайн | ✨ Высокое качество\n🏍️ Для мотоциклистов | 💰 8.99$',
      parse_mode: 'Markdown'
    }).then(msg => {
      console.log('✅ Фото отправлено (ID: ' + msg.photo[0].file_id + ')');
    }).catch(err => {
      console.error('❌ Ошибка фото:', err.message);
      // Fallback: send text description if photo fails
      bot.sendMessage(chatId, '🧸 *Character Helmet Cover*\n💙 Милый дизайн full-face шлема\n💰 Цена: 8.99$', { parse_mode: 'Markdown' });
    });
  } catch (e) {
    console.error('❌ Exception:', e.message);
  }
});

// Команда /trust - доверие и маркетинг
bot.onText(/\/trust/, (msg) => {
  const chatId = msg.chat.id;
  const trustMessage = 
    '💎 *ПОЧЕМУ МЫ — ВАШ ВЫБОР*\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '🏆 *ЭКСПЕРТ В ДЕЛЕ*\n' +
    'Наша команда прошла тренинги в Таиланде и Вьетнаме.\n' +
    'Каждый товар тестирован лично.\n\n' +
    '⭐ *ОТЗЫВЫ РЕАЛЬНЫХ ЛЮДЕЙ*\n' +
    '"Палка помогла избавиться от боли в спине!" — Мария\n' +
    '"Беру везде с собой, спасает от стресса!" — Том\n' +
    '"Качество — выше всяких похвал!" — Анна\n\n' +
    '🔐 *ДОВЕРИЕ = КАЧЕСТВО*\n' +
    '✅ Сертифицированные материалы (не токсичны)\n' +
    '✅ Прошли дерматологические тесты\n' +
    '✅ Соответствуют международным стандартам\n\n' +
    '💰 *СПРАВЕДЛИВАЯ ЦЕНА*\n' +
    'Прямые поставки от производителя = минимум наценки.\n' +
    'Промокод WELCOME10 даёт вам 10% на первый заказ.\n\n' +
    '🚀 *БЫСТРО И УДОБНО*\n' +
    '📦 Доставка в Da Nang за 24-48 часов\n' +
    '📦 По Вьетнаму: 2-3 дня\n' +
    '📦 Международная доставка disponible\n\n' +
    '❤️ *ГАРАНТИЯ 30 ДНЕЙ*\n' +
    'Не доволен — возвращаем деньги, без вопросов.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'Давай начнём твой путь к здоровью! 💪';
  
  bot.sendMessage(chatId, trustMessage, { parse_mode: 'Markdown' });
});


bot.onText(/\/book/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        [
          {
            text: '📋 Забронировать Шоу',
            web_app: { url: `${WEBAPP_URL}#booking` }
          }
        ]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, 
    '📋 Нажми кнопку ниже чтобы открыть форму бронирования:', 
    keyboard
  );
});

// Команда /contact - контактная информация
bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId,
    '💎 *КОНТАКТЫ FLOW HAMMER SHOP*\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '👤 *Flow Hammer Shop Da Nang*\n' +
    '🛍️ Массажные палки & Нашлемники\n\n' +
    '📧 *Email:*\n' +
    '`wellness.shop.dn@gmail.com`\n\n' +
    '📱 *Телефон:*\n' +
    '`+84 949197496`\n\n' +
    '📍 *Адрес:*\n' +
    'Da Nang, Vietnam\n\n' +
    '🕐 *Режим работы:*\n' +
    'Ежедневно с 09:00 до 21:00\n\n' +
    '💬 *Telegram Support:*\n' +
    'Ответим в течении 1 часа\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '🛒 Для заказа используй команду `/book`\n' +
    '⭐ Используй код *WELCOME10* для скидки 10%\n' +
    '🌐 Посети наш магазин через веб-приложение',
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
  
  let status = `🤖 *Статус Flow Hammer Shop Bot*\n\n`;
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
  const userId = query.from.id;
  const userName = query.from.username || `${query.from.first_name} ${query.from.last_name}`.trim();
  
  console.log(`\n🔘 CALLBACK QUERY ПОЛУЧЕНА`);
  console.log('─'.repeat(60));
  console.log(`👤 От пользователя: @${userName} (ID: ${userId})`);
  console.log(`📍 Chat ID: ${chatId}`);
  console.log(`🔘 Кнопка (callback_data): ${query.data}`);
  console.log('─'.repeat(60));
  
  // Обработка выбора языка
  if (query.data === 'lang_ru') {
    setUserLanguage(userId, 'ru');
    bot.answerCallbackQuery(query.id, { text: '✅ Язык: Русский', show_alert: true });
    bot.editMessageText('🌐 ✅ *Язык установлен: Русский (РУ)*', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
    return;
  }
  if (query.data === 'lang_en') {
    setUserLanguage(userId, 'en');
    bot.answerCallbackQuery(query.id, { text: '✅ Language: English', show_alert: true });
    bot.editMessageText('🌐 ✅ *Language: English (EN)*', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
    return;
  }
  if (query.data === 'lang_vi') {
    setUserLanguage(userId, 'vi');
    bot.answerCallbackQuery(query.id, { text: '✅ Ngôn ngữ: Tiếng Việt', show_alert: true });
    bot.editMessageText('🌐 ✅ *Ngôn ngữ: Tiếng Việt (VI)*', {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown'
    });
    return;
  }
  
  switch(query.data) {
    case 'products_list':
      console.log('✅ Обработка: products_list');
      bot.answerCallbackQuery(query.id);
      
      // Send the same products message as /products command
      const productsMessage = 
        '🛍️ *ТРИ ЗВЕЗДЫ НАШЕГО МАГАЗИНА*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🧊 *КОМПАКТНАЯ: Mini Pocket (12.99$)*\n' +
        '📏 Длина: 10 см — в сумку, в карман\n' +
        '✨ Идеальна для: офиса, путешествий, быстрых сессий\n' +
        '💪 Материал: пластик ABS + силикон\n' +
        '⭐ Техника: удобная в ладони\n\n' +
        '💆 *СРЕДНЯЯ: Therapy Ergonomic (24.99$)*\n' +
        '📏 Длина: 30 см — универсальная\n' +
        '✨ Идеальна для: дома, спортзала, повседневного использования\n' +
        '💪 Материал: гибкий корпус + мягкий наконечник\n' +
        '⭐ Техника: точное попадание в триггер-точки\n\n' +
        '🥇 *ПРОФЕССИОНАЛЬНАЯ: Acupressure Pro (19.99$)*\n' +
        '📏 Длина: 45 см — для серьёзной работы\n' +
        '✨ Идеальна для: глубокого массажа, спины, ног\n' +
        '💪 Материал: хардкорный ABS + жёсткий силикон\n' +
        '⭐ Техника: традиционная акупрессура\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🎯 *ПЛЮС: Character Helmet Cover (8.99$)*\n' +
        '😊 Милый дизайн full-face для мотоциклистов\n' +
        '🛡️ Защита шлема + стиль на фото\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '✅ *3000+ довольных клиентов*\n' +
        '✅ Гарантия качества 30 дней\n' +
        '✅ Бесплатная доставка на первый заказ\n\n' +
        'Нажми кнопку ниже чтобы добавить в корзину!';
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🛒 Открыть магазин',
                web_app: { url: `${WEBAPP_URL}#products` }
              }
            ]
          ]
        }
      };

      console.log('📤 Отправляю товары...');
      bot.sendMessage(chatId, productsMessage, { parse_mode: 'Markdown', ...keyboard });
      
      // Send helmet cover image
      console.log('📸 Отправляю фото товара...');
      try {
        const helmetImageUrl = 'https://i.ibb.co/mrBvbTL5/2026-01-23-03-55-03.jpg'
        bot.sendPhoto(chatId, helmetImageUrl, {
          caption: '🧸 *Character Helmet Cover - Стиль & Защита*\n💙 Милый дизайн | ✨ Высокое качество\n🏍️ Для мотоциклистов | 💰 8.99$',
          parse_mode: 'Markdown'
        }).then(msg => {
          console.log('✅ Фото отправлено (ID: ' + msg.photo[0].file_id + ')');
        }).catch(err => {
          console.error('❌ Ошибка фото:', err.message);
        });
      } catch (e) {
        console.error('❌ Exception:', e.message);
      }
      break;
      
    case 'shows_info':
      console.log('✅ Обработка: shows_info');
      bot.answerCallbackQuery(query.id);
      const showsMessage = 
        '🛍️ *ТРИ ЗВЕЗДЫ НАШЕГО МАГАЗИНА*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🧊 *КОМПАКТНАЯ: Mini Pocket (12.99$)* — 10 см\n' +
        '✨ Карман, спешка, путешествия\n\n' +
        '💆 *СРЕДНЯЯ: Therapy Ergonomic (24.99$)* — 30 см\n' +
        '✨ Домашняя работа, спортзал, повседневное\n\n' +
        '🥇 *ПРОФЕССИОНАЛЬНАЯ: Acupressure Pro (19.99$)* — 45 см\n' +
        '✨ Глубокий массаж, спина, ноги\n\n' +
        '🎯 *ПЛЮС: Character Helmet Cover (8.99$)*\n' +
        '😊 Фирменный нашлемник для мотоциклистов\n\n' +
        '✅ Первый заказ: промокод WELCOME10 = −10%\n' +
        '✅ Доставка бесплатна от 50$';
      console.log('📤 Отправляю информацию о товарах...');
      bot.sendMessage(chatId, showsMessage, { parse_mode: 'Markdown' })
        .then(() => console.log('✅ Сообщение о товарах отправлено'))
        .catch(err => console.error('❌ Ошибка отправки:', err));
      break;
      
    case 'contact_info':
      console.log('✅ Обработка: contact_info');
      bot.answerCallbackQuery(query.id);
      console.log('📤 Отправляю контактную информацию...');
      bot.sendMessage(
        chatId,
        '💎 *КОНТАКТЫ FLOW HAMMER SHOP*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '👤 *Flow Hammer Shop Da Nang*\n' +
        '🛍️ Лучшие массажные палки Вьетнама\n\n' +
        '📧 *Email:*\n' +
        '`wellness.shop.dn@gmail.com`\n\n' +
        '📱 *Телефон:*\n' +
        '`+84 949197496`\n\n' +
        '📍 *Адрес:*\n' +
        'Da Nang, Vietnam\n\n' +
        '🕐 *Режим работы:*\n' +
        'Ежедневно с 09:00 до 21:00\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '🛒 Для заказа: /book\n' +
        '💎 Доверие, качество, результат! 💪',
        { parse_mode: 'Markdown' }
      )
        .then(() => console.log('✅ Контакты отправлены'))
        .catch(err => console.error('❌ Ошибка отправки:', err));
      break;
      
    case 'book_show':
      bot.answerCallbackQuery(query.id, { text: '� Откроется форма заказа...' });
      const bookingKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🛒 Перейти к заказу',
                web_app: { url: `${WEBAPP_URL}#booking` }
              }
            ]
          ]
        }
      };
      bot.sendMessage(chatId, 'Нажми кнопку чтобы оформить заказ:', bookingKeyboard);
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
        '💎 *FLOW HAMMER SHOP DA NANG*\n\n' +
        'Профессиональные массажные палки + Фирменный нашлемник\n\n' +
        '✨ 3 хедлайнера по длине (10см, 30см, 45см)\n' +
        '💪 Для спортсменов, йогов, путешественников\n' +
        '🏆 3000+ довольных клиентов\n\n' +
        'Гарантия качества:\n' +
        '✅ 30-дневная гарантия\n' +
        '✅ Бесплатная доставка от 50$\n' +
        '✅ Сертифицированные материалы\n' +
        '✅ Сеть 4* отзывов',
        { parse_mode: 'Markdown', ...aboutKeyboard }
      )
        .then(() => console.log('✅ Информация отправлена'))
        .catch(err => console.error('❌ Ошибка отправки:', err));
      break;
      
    default:
      console.log(`⚠️ Неизвестная кнопка: ${query.data}`);
      bot.answerCallbackQuery(query.id, { text: '⚠️ Неизвестная команда' });
      break;
  }
});

// ========== ADMIN COMMANDS ==========

// Команда /orders - список всех заказов для администраторов
bot.onText(/\/orders/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Проверяем, администратор ли пользователь
  if (!ADMIN_IDS.includes(msg.from.id)) {
    await bot.sendMessage(chatId, '❌ У вас нет доступа к этой команде');
    return;
  }
  
  try {
    const orders = await getAllOrders();
    
    if (orders.length === 0) {
      await bot.sendMessage(chatId, '📭 Нет заказов в базе данных');
      return;
    }
    
    // Группируем заказы по статусам
    const ordersByStatus = {
      pending: [],
      confirmed: [],
      processing: [],
      shipped: [],
      delivered: [],
      cancelled: []
    };
    
    orders.forEach(order => {
      if (ordersByStatus[order.status]) {
        ordersByStatus[order.status].push(order);
      }
    });
    
    // Формируем сообщение с заказами
    let message = `📊 *СТАТИСТИКА ЗАКАЗОВ* (всего: ${orders.length})\n\n`;
    
    const statusEmojis = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '❌'
    };
    
    const statusLabels = {
      pending: 'Ожидание',
      confirmed: 'Подтвержден',
      processing: 'Обработка',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменен'
    };
    
    for (const [status, statusOrders] of Object.entries(ordersByStatus)) {
      if (statusOrders.length > 0) {
        message += `${statusEmojis[status]} *${statusLabels[status]}* (${statusOrders.length})\n`;
        statusOrders.forEach((order, idx) => {
          message += `  ${idx + 1}. #${order.order_number} - ${order.customer_name} - $${order.subtotal}\n`;
        });
        message += '\n';
      }
    }
    
    message += '━━━━━━━━━━━━━━━━━━\n\n' +
      'Используй /order-details <номер> чтобы увидеть детали заказа\n' +
      'Используй /order-status <номер> чтобы изменить статус';
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Ошибка при получении заказов:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении списка заказов');
  }
});

// Команда /order-details <номер> - детали конкретного заказа
bot.onText(/\/order-details\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const orderNumber = match[1].trim();
  
  // Проверяем, администратор ли пользователь
  if (!ADMIN_IDS.includes(msg.from.id)) {
    await bot.sendMessage(chatId, '❌ У вас нет доступа к этой команде');
    return;
  }
  
  try {
    const order = await getOrderByNumber(orderNumber);
    
    if (!order) {
      await bot.sendMessage(chatId, `❌ Заказ #${orderNumber} не найден`);
      return;
    }
    
    const items = JSON.parse(order.items_json);
    let itemsList = '';
    items.forEach((item, idx) => {
      itemsList += `${idx + 1}. ${item.title} x${item.qty} = $${item.lineTotal}\n`;
    });
    
    const statusEmojis = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '❌'
    };
    
    const message = `📋 *ДЕТАЛИ ЗАКАЗА #${orderNumber}*\n\n` +
      `👤 *Заказчик:* ${order.customer_name}\n` +
      `📞 *Контакт:* ${order.customer_contact}\n` +
      `👥 *Telegram:* @${order.username} (ID: ${order.user_id})\n\n` +
      `📦 *Товары:*\n${itemsList}\n` +
      `💰 *Итого:* $${order.subtotal} ${order.currency}\n\n` +
      `📋 *Примечание:* ${order.customer_note || 'не указано'}\n\n` +
      `${statusEmojis[order.status]} *Статус:* ${getStatusLabel(order.status, 'ru')}\n` +
      `📅 *Создан:* ${new Date(order.created_at).toLocaleString('ru-RU')}\n` +
      `📅 *Обновлен:* ${new Date(order.updated_at).toLocaleString('ru-RU')}\n\n` +
      `Используй /order-status ${orderNumber} чтобы изменить статус`;
    
    // Создаём inline-кнопки для изменения статуса
    const statusSequence = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const nextStatus = statusSequence[statusSequence.indexOf(order.status) + 1];
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: []
      }
    };
    
    if (nextStatus) {
      keyboard.reply_markup.inline_keyboard.push([
        {
          text: `✅ Перейти на "${getStatusLabel(nextStatus, 'ru')}"`,
          callback_data: `order_status_${orderNumber}_${nextStatus}`
        }
      ]);
    }
    
    keyboard.reply_markup.inline_keyboard.push([
      {
        text: '❌ Отменить заказ',
        callback_data: `order_status_${orderNumber}_cancelled`
      }
    ]);
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('❌ Ошибка при получении деталей заказа:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении деталей заказа');
  }
});

// Команда /my-orders - мои заказы для пользователей
bot.onText(/\/my-orders/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    const userOrders = await getUserOrders(userId);
    
    if (userOrders.length === 0) {
      await bot.sendMessage(chatId, 
        '📭 У вас пока нет заказов\n\n' +
        '🛒 Используй /start чтобы перейти в каталог и сделать заказ',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    const statusEmojis = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '❌'
    };
    
    let message = `📦 *МОИ ЗАКАЗЫ* (всего: ${userOrders.length})\n\n`;
    
    userOrders.forEach((order, idx) => {
      const createdDate = new Date(order.created_at).toLocaleDateString('ru-RU');
      message += `${idx + 1}. Заказ #${order.order_number}\n` +
        `   ${statusEmojis[order.status]} Статус: ${getStatusLabel(order.status, 'ru')}\n` +
        `   💰 Сумма: $${order.subtotal} ${order.currency}\n` +
        `   📅 Дата: ${createdDate}\n\n`;
    });
    
    message += 'Используй /order-status <номер> чтобы узнать больше о конкретном заказе';
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Ошибка при получении заказов пользователя:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении ваших заказов');
  }
});

// Callback для изменения статуса заказа
bot.on('callback_query', async (query) => {
  if (!query.data.startsWith('order_status_')) return;
  
  const chatId = query.message.chat.id;
  
  // Проверяем, администратор ли пользователь
  if (!ADMIN_IDS.includes(query.from.id)) {
    await bot.answerCallbackQuery(query.id, { 
      text: '❌ У вас нет доступа к этой функции',
      show_alert: true 
    });
    return;
  }
  
  try {
    const parts = query.data.replace('order_status_', '').split('_');
    const orderNumber = parts[0];
    const newStatus = parts[1];
    
    // Получаем заказ для проверки
    const order = await getOrderByNumber(orderNumber);
    if (!order) {
      await bot.answerCallbackQuery(query.id, { 
        text: '❌ Заказ не найден',
        show_alert: true 
      });
      return;
    }
    
    // Обновляем статус
    await updateOrderStatus(order.id, newStatus);
    
    const statusLabel = getStatusLabel(newStatus, 'ru');
    const statusEmoji = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '📦',
      delivered: '🎉',
      cancelled: '❌'
    }[newStatus];
    
    // Уведомляем администратора
    await bot.answerCallbackQuery(query.id, { 
      text: `✅ Статус изменён на "${statusLabel}"`,
      show_alert: false 
    });
    
    // Отправляем обновлённые детали заказа
    await bot.editMessageText(
      `${statusEmoji} *Заказ #${orderNumber} - Статус обновлён!*\n\n` +
      `Новый статус: *${statusLabel}*\n\n` +
      `Используй /order-details ${orderNumber} чтобы вернуться к деталям`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown'
      }
    );
    
    // Уведомляем пользователя об изменении статуса
    const updatedOrder = await getOrderByNumber(orderNumber);
    const notificationMessage = `📦 *Статус вашего заказа #${orderNumber} изменился!*\n\n` +
      `${statusEmoji} Новый статус: *${statusLabel}*\n\n` +
      `Спасибо за заказ! 🙏`;
    
    try {
      await bot.sendMessage(updatedOrder.user_id, notificationMessage, { parse_mode: 'Markdown' });
    } catch (err) {
      console.warn(`⚠️ Не удалось отправить уведомление пользователю ${updatedOrder.user_id}`);
    }
    
    console.log(`✅ Статус заказа #${orderNumber} обновлён на "${statusLabel}"`);
  } catch (error) {
    console.error('❌ Ошибка при изменении статуса заказа:', error);
    await bot.answerCallbackQuery(query.id, { 
      text: '❌ Ошибка при изменении статуса',
      show_alert: true 
    });
  }
});

// ========== ADVANCED ADMIN CRM COMMANDS ==========

// Регистрируем админов при первом контакте
bot.on('message', (msg) => {
  if (msg.from && msg.from.username) {
    registerAdminId(msg.from);
  }
});

// Команда /admin - главное меню админов (только для @QValmont и @netslayer)
bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from)) {
    await bot.sendMessage(chatId, '❌ У вас нет доступа к админ-панели. Только @QValmont и @netslayer могут использовать эту команду.');
    return;
  }
  
  const adminInfo = getAdminInfo(msg.from);
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📊 Панель управления', callback_data: 'admin_dashboard' }],
        [{ text: '📈 Статистика', callback_data: 'admin_stats' }],
        [{ text: '👥 Клиенты', callback_data: 'admin_customers' }],
        [{ text: '📥 Экспортировать данные', callback_data: 'admin_export' }],
        [{ text: '⚙️ Все заказы', callback_data: 'admin_all_orders' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, 
    `🔐 *АДМИН-ПАНЕЛЬ FLOWHAMMERR SHOP*\n\n` +
    `👤 Вход как: *@${msg.from.username}*\n` +
    `🎖️ Роль: *${adminInfo.role === 'super_admin' ? 'Супер Администратор' : 'Администратор'}*\n\n` +
    `Выбери раздел для управления:`,
    { parse_mode: 'Markdown', ...keyboard }
  );
});

// Команда /admin-dashboard - детальная панель управления
bot.onText(/\/admin-dashboard/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from)) {
    await bot.sendMessage(chatId, '❌ Доступ запрещён');
    return;
  }
  
  try {
    await bot.sendMessage(chatId, '⏳ Загружаю данные панели управления...');
    const stats = await getDashboardStats();
    const message = formatStatsMessage(stats);
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Обновить', callback_data: 'admin_dashboard' }],
          [{ text: '📥 Экспортировать', callback_data: 'admin_export' }],
          [{ text: '⬅️ Назад', callback_data: 'admin_menu' }]
        ]
      }
    };
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('❌ Ошибка панели управления:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при загрузке панели управления');
  }
});

// Команда /admin-stats - детальная статистика
bot.onText(/\/admin-stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from)) {
    await bot.sendMessage(chatId, '❌ Доступ запрещён');
    return;
  }
  
  try {
    const stats = await getDashboardStats();
    
    let message = `📊 *ДЕТАЛЬНАЯ СТАТИСТИКА*\n\n`;
    
    // Daily revenue
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💵 *ВЫРУЧКА ПО ДНЯМ (ПОСЛЕДНИЕ 7)*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    const sortedDays = Object.entries(stats.revenueByDay)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .slice(0, 7);
    
    sortedDays.forEach(([day, revenue]) => {
      const orders = stats.ordersByDay[day];
      message += `📅 ${day}: *$${revenue.toFixed(2)}* (${orders} заказов)\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏆 *ПРОДУКТЫ - ПОЛНЫЙ РЕЙТИНГ*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    Object.entries(stats.topProducts)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 10)
      .forEach(([product, data], idx) => {
        message += `${idx + 1}. *${product}*\n`;
        message += `   📦 Продано: ${data.qty} шт.\n`;
        message += `   💰 Выручка: $${data.revenue.toFixed(2)}\n\n`;
      });
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⬅️ Назад в меню', callback_data: 'admin_menu' }]
        ]
      }
    };
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('❌ Ошибка статистики:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении статистики');
  }
});

// Команда /admin-customers - информация о клиентах
bot.onText(/\/admin-customers/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from)) {
    await bot.sendMessage(chatId, '❌ Доступ запрещён');
    return;
  }
  
  try {
    const stats = await getDashboardStats();
    
    let message = `👥 *АНАЛИЗ КЛИЕНТОВ*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📊 Всего уникальных клиентов: *${stats.topCustomers.length}*\n\n`;
    
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🌟 *ТОП 10 ПОКУПАТЕЛЕЙ (ПОЛНЫЙ СПИСОК)*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    stats.topCustomers.slice(0, 10).forEach((customer, idx) => {
      message += `${idx + 1}. *${customer.name}*\n`;
      message += `   📞 ${customer.contact || '❓'}\n`;
      message += `   🛒 Заказов: ${customer.count}\n`;
      message += `   💳 Потратил: $${customer.totalSpent.toFixed(2)}\n`;
      message += `   💲 Средний заказ: $${(customer.totalSpent / customer.count).toFixed(2)}\n\n`;
    });
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⬅️ Назад в меню', callback_data: 'admin_menu' }]
        ]
      }
    };
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('❌ Ошибка клиентов:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при получении данных клиентов');
  }
});

// Команда /admin-export - экспортировать данные
bot.onText(/\/admin-export/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (!isAdmin(msg.from)) {
    await bot.sendMessage(chatId, '❌ Доступ запрещён');
    return;
  }
  
  try {
    await bot.sendMessage(chatId, '⏳ Подготавливаю экспорт...');
    const csv = await exportOrdersToCSV();
    
    if (!csv) {
      await bot.sendMessage(chatId, '❌ Ошибка при создании экспорта');
      return;
    }
    
    // Отправляем CSV файл
    const buffer = Buffer.from(csv, 'utf-8');
    const timestamp = new Date().toISOString().split('T')[0];
    
    await bot.sendDocument(chatId, buffer, {
      filename: `orders_export_${timestamp}.csv`,
      caption: `📊 Экспорт заказов (${timestamp})`
    });
    
    await bot.sendMessage(chatId, 
      '✅ *Экспорт готов!*\n\n' +
      '📥 CSV файл со всеми заказами отправлен.\n' +
      'Используйте Excel или Google Sheets для анализа.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
    await bot.sendMessage(chatId, '❌ Ошибка при экспорте данных');
  }
});

// Callback для админ-меню
bot.on('callback_query', async (query) => {
  if (!isAdmin(query.from)) {
    await bot.answerCallbackQuery(query.id, { 
      text: '❌ Доступ запрещён',
      show_alert: true 
    });
    return;
  }
  
  const chatId = query.message.chat.id;
  
  try {
    if (query.data === 'admin_menu') {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📊 Панель управления', callback_data: 'admin_dashboard' }],
            [{ text: '📈 Статистика', callback_data: 'admin_stats' }],
            [{ text: '👥 Клиенты', callback_data: 'admin_customers' }],
            [{ text: '📥 Экспортировать данные', callback_data: 'admin_export' }],
            [{ text: '⚙️ Все заказы', callback_data: 'admin_all_orders' }]
          ]
        }
      };
      
      await bot.editMessageText(
        `🔐 *АДМИН-ПАНЕЛЬ FLOWHAMMERR SHOP*\n\n` +
        `👤 Вход как: *@${query.from.username}*\n\n` +
        `Выбери раздел для управления:`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'Markdown',
          reply_markup: keyboard.reply_markup
        }
      );
    } else if (query.data === 'admin_dashboard') {
      await bot.answerCallbackQuery(query.id);
      const stats = await getDashboardStats();
      const message = formatStatsMessage(stats);
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Обновить', callback_data: 'admin_dashboard' }],
            [{ text: '📥 Экспортировать', callback_data: 'admin_export' }],
            [{ text: '⬅️ Назад', callback_data: 'admin_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } else if (query.data === 'admin_stats') {
      await bot.answerCallbackQuery(query.id);
      const stats = await getDashboardStats();
      
      let message = `📊 *ДЕТАЛЬНАЯ СТАТИСТИКА*\n\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💵 *ВЫРУЧКА ПО ДНЯМ (ПОСЛЕДНИЕ 7)*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      
      const sortedDays = Object.entries(stats.revenueByDay)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 7);
      
      sortedDays.forEach(([day, revenue]) => {
        const orders = stats.ordersByDay[day];
        message += `📅 ${day}: *$${revenue.toFixed(2)}* (${orders} заказов)\n`;
      });
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад в меню', callback_data: 'admin_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    } else if (query.data === 'admin_customers') {
      await bot.answerCallbackQuery(query.id);
      const stats = await getDashboardStats();
      
      let message = `👥 *АНАЛИЗ КЛИЕНТОВ*\n\n`;
      message += `📊 Всего уникальных клиентов: *${stats.topCustomers.length}*\n\n`;
      message += `🌟 *ТОП ПОКУПАТЕЛЕЙ*\n`;
      
      stats.topCustomers.slice(0, 5).forEach((customer, idx) => {
        message += `${idx + 1}. *${customer.name}* - $${customer.totalSpent.toFixed(2)}\n`;
      });
      
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад в меню', callback_data: 'admin_menu' }]
          ]
        }
      };
      
      await bot.editMessageText(message, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: keyboard.reply_markup
      });
    }
  } catch (error) {
    console.error('❌ Ошибка callback:', error);
    await bot.answerCallbackQuery(query.id, { 
      text: '❌ Ошибка обработки',
      show_alert: true 
    });
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.log('❌ Ошибка polling:', error);
});

bot.on('error', (error) => {
  console.log('❌ Ошибка бота:', error);
});

console.log('✅ Бот запущен. Используй /help для справки.');


