# 🛍️ FlowHammer Shop - Admin Setup Guide

## Database & Order Management System

This bot now includes a **SQLite-based order management system** with admin controls for tracking and updating order statuses.

---

## 📋 Features

### Customer Features
- **Automatic Order Storage**: Orders are saved to SQLite database automatically when customers checkout
- **Order Confirmation**: Customers receive order number and confirmation message
- **Order Tracking**: `/my-orders` command to check their orders and statuses

### Admin Features
- **Order Management**: `/orders` - View all orders grouped by status
- **Order Details**: `/order-details <order_number>` - See full order information
- **Status Updates**: Change order status with inline buttons (⏳ → ✅ → ⚙️ → 📦 → 🎉)
- **Admin Notifications**: Instant notifications when new orders arrive
- **User Notifications**: Customers are notified when their order status changes

---

## 🔧 Configuration

### Step 1: Set ADMIN_IDS in .env

Edit `bot/.env` and add admin Telegram user IDs:

```bash
BOT_TOKEN=your_bot_token_here
WEBAPP_URL=https://your-webapp-url.com
ADMIN_IDS=123456789,987654321,555555555
```

**How to find your Telegram ID:**
1. Start the bot and type `/start`
2. Check bot logs or send a message
3. Your ID will be printed in the logs

### Step 2: Database File

The SQLite database is automatically created at:
```
bot/orders.db
```

No manual setup needed - it's created on first bot run.

---

## 📊 Order Status Flow

```
⏳ pending
   ↓
✅ confirmed
   ↓
⚙️ processing
   ↓
📦 shipped
   ↓
🎉 delivered

❌ cancelled (can be set from any status)
```

---

## 🎮 Admin Commands

### View All Orders
```
/orders
```
Shows all orders grouped by status with statistics.

**Output:**
```
📊 СТАТИСТИКА ЗАКАЗОВ (всего: 42)

⏳ Ожидание (5)
  1. #ORD_1234567890 - John Smith - $45.99
  2. #ORD_1234567891 - Maria Garcia - $89.99
  ...
```

### View Order Details
```
/order-details ORD_1234567890
```
Shows full order information with inline buttons to update status.

**Shows:**
- Customer name, contact, Telegram username
- Full list of items with quantities and prices
- Current status, creation/update dates
- Status update buttons

### Change Order Status
Click the inline button in order details view, or use callback system.

**Status Transition:**
- ⏳ → ✅ (Confirm order)
- ✅ → ⚙️ (Start processing)
- ⚙️ → 📦 (Mark as shipped)
- 📦 → 🎉 (Mark as delivered)
- Any → ❌ (Cancel order)

### User Commands
```
/my-orders
```
Customers can check their own orders and statuses.

---

## 📨 Notifications

### When Order is Placed
- ✅ Customer receives order confirmation with order number
- ✅ Admin(s) receive detailed order notification

### When Status Changes
- ✅ Customer is notified of status change
- ✅ Admin receives confirmation of update

**Example Notifications:**

**To Customer:**
```
📦 Статус вашего заказа #ORD_1234567890 изменился!

📦 Новый статус: Отправлен

Спасибо за заказ! 🙏
```

**To Admin:**
```
🛍️ НОВЫЙ ЗАКАЗ!

📌 Номер: `ORD_1234567890`
👤 Имя: John Smith
📞 Контакт: +1-555-0123
👥 Telegram: @john_smith (ID: 123456789)

📦 Товары:
1. Mini Pocket x2 = $25.98
2. Full Helmet Cover x1 = $19.99
...
```

---

## 💾 Database Schema

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,           -- ORD_1234567890
  user_id INTEGER NOT NULL,                     -- Telegram user ID
  username TEXT NOT NULL,                       -- Telegram username
  customer_name TEXT,                           -- Full name
  customer_contact TEXT,                        -- Phone/email
  customer_note TEXT,                           -- Order notes
  items_json TEXT NOT NULL,                     -- JSON array of items
  subtotal REAL NOT NULL,                       -- Order total
  currency TEXT DEFAULT 'USD',                  -- Currency code
  status TEXT DEFAULT 'pending',                -- Order status
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔍 Troubleshooting

### Admin not receiving notifications
- ❌ Check if ADMIN_IDS is set correctly in `.env`
- ❌ Verify Telegram IDs are comma-separated
- ❌ Check bot logs for connection errors

### Database errors
- ❌ Ensure `bot/orders.db` has read/write permissions
- ❌ Database is auto-created - delete if corrupted and restart bot
- ❌ Check disk space for SQLite file

### Order not showing in `/orders`
- ❌ Wait a moment for database to sync
- ❌ Try `/my-orders` to check if order was saved
- ❌ Check bot logs for errors during order creation

---

## 📝 Example Workflow

### 1. Customer Places Order
```
Customer: Uses website → Completes checkout → Order sent to Telegram bot
Bot: Saves to SQLite → Sends confirmation to customer → Notifies admins
```

### 2. Admin Reviews Order
```
Admin: /orders
Bot: Shows all orders grouped by status
Admin: /order-details ORD_1234567890
Bot: Shows full details with status buttons
```

### 3. Admin Updates Status
```
Admin: Clicks "✅ Перейти на Подтвержден"
Bot: Updates database → Confirms to admin → Notifies customer
```

### 4. Customer Checks Status
```
Customer: /my-orders
Bot: Shows all their orders with current status
```

---

## 🚀 Deployment Notes

- Database file (`orders.db`) should be **persistent** across bot restarts
- Keep `bot/.env` with ADMIN_IDS in your deployment environment
- Ensure bot has **read/write permissions** to `bot/` directory
- Consider **backing up** orders.db regularly

---

## 📞 Support

For issues or questions, check:
1. Bot logs for error messages
2. Ensure all environment variables are set
3. Verify admin IDs are correct
4. Check database file exists and has correct permissions

