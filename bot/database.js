const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err);
  } else {
    console.log('✅ Подключено к SQLite:', dbPath);
    initDb();
  }
});

// Инициализация БД - создание таблицы если её нет
function initDb() {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      customer_name TEXT,
      customer_contact TEXT,
      customer_note TEXT,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы:', err);
    } else {
      console.log('✅ Таблица orders готова');
    }
  });
}

// Сохранить заказ
function createOrder(data) {
  return new Promise((resolve, reject) => {
    const orderNumber = `ORD_${Date.now()}`;
    const itemsJson = JSON.stringify(data.items || []);
    
    db.run(
      `INSERT INTO orders (
        order_number, user_id, username, customer_name, customer_contact,
        customer_note, items_json, subtotal, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        data.userId,
        data.username,
        data.customerName || '',
        data.customerContact || '',
        data.customerNote || '',
        itemsJson,
        data.subtotal || 0,
        data.currency || 'USD'
      ],
      function(err) {
        if (err) {
          console.error('❌ Ошибка сохранения заказа:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, orderNumber });
        }
      }
    );
  });
}

// Получить все заказы
function getAllOrders() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 100
    `, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Получить заказ по ID
function getOrderById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Получить заказ по номеру заказа
function getOrderByNumber(orderNumber) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM orders WHERE order_number = ?`, [orderNumber], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Получить заказы пользователя
function getUserOrders(userId) {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Обновить статус заказа
function updateOrderStatus(orderId, status) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [status, orderId],
      function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

// Получить статусы для выбора
function getAvailableStatuses() {
  return [
    { value: 'pending', label: '⏳ Pending' },
    { value: 'confirmed', label: '✅ Confirmed' },
    { value: 'processing', label: '⚙️ Processing' },
    { value: 'shipped', label: '📦 Shipped' },
    { value: 'delivered', label: '🎉 Delivered' },
    { value: 'cancelled', label: '❌ Cancelled' }
  ];
}

// Получить русский статус
function getStatusInRussian(status) {
  const statuses = {
    pending: '⏳ Ожидание',
    confirmed: '✅ Подтверждён',
    processing: '⚙️ Обработка',
    shipped: '📦 Отправлен',
    delivered: '🎉 Доставлен',
    cancelled: '❌ Отменён'
  };
  return statuses[status] || status;
}

// Получить русский статус на английском
function getStatusInEnglish(status) {
  const statuses = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    processing: '⚙️ Processing',
    shipped: '📦 Shipped',
    delivered: '🎉 Delivered',
    cancelled: '❌ Cancelled'
  };
  return statuses[status] || status;
}

// Получить статус на языке пользователя
function getStatusLabel(status, lang = 'en') {
  if (lang === 'ru') return getStatusInRussian(status);
  return getStatusInEnglish(status);
}

module.exports = {
  db,
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  updateOrderStatus,
  getAvailableStatuses,
  getStatusLabel
};
