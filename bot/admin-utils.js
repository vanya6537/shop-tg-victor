// Advanced admin utilities and analytics
const { getAllOrders, getUserOrders } = require('./database');

// Get comprehensive dashboard statistics
async function getDashboardStats() {
  try {
    const orders = await getAllOrders();
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: 0,
      ordersByStatus: {},
      ordersByDay: {},
      topCustomers: [],
      averageOrderValue: 0,
      topProducts: {},
      revenueByDay: {},
      conversionMetrics: {}
    };
    
    // Initialize status counters
    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].forEach(status => {
      stats.ordersByStatus[status] = 0;
    });
    
    // Process each order
    orders.forEach(order => {
      // Revenue and status
      stats.totalRevenue += parseFloat(order.subtotal) || 0;
      if (stats.ordersByStatus[order.status] !== undefined) {
        stats.ordersByStatus[order.status]++;
      }
      
      // Orders by day
      const date = new Date(order.created_at).toISOString().split('T')[0];
      stats.ordersByDay[date] = (stats.ordersByDay[date] || 0) + 1;
      stats.revenueByDay[date] = (stats.revenueByDay[date] || 0) + (parseFloat(order.subtotal) || 0);
      
      // Top customers
      const customerKey = order.customer_name || order.username;
      const existingCustomer = stats.topCustomers.find(c => c.name === customerKey);
      if (existingCustomer) {
        existingCustomer.count++;
        existingCustomer.totalSpent += parseFloat(order.subtotal) || 0;
      } else {
        stats.topCustomers.push({
          name: customerKey,
          contact: order.customer_contact,
          count: 1,
          totalSpent: parseFloat(order.subtotal) || 0
        });
      }
      
      // Top products
      try {
        const items = JSON.parse(order.items_json || '[]');
        items.forEach(item => {
          if (!stats.topProducts[item.title]) {
            stats.topProducts[item.title] = { qty: 0, revenue: 0 };
          }
          stats.topProducts[item.title].qty += item.qty || 0;
          stats.topProducts[item.title].revenue += parseFloat(item.lineTotal) || 0;
        });
      } catch (e) {
        // Ignore JSON parse errors
      }
    });
    
    // Calculate averages and sort
    stats.averageOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0;
    stats.topCustomers = stats.topCustomers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    // Conversion metrics
    const delivered = stats.ordersByStatus.delivered || 0;
    const cancelled = stats.ordersByStatus.cancelled || 0;
    stats.conversionMetrics = {
      completionRate: stats.totalOrders > 0 ? ((delivered / stats.totalOrders) * 100).toFixed(1) : 0,
      cancellationRate: stats.totalOrders > 0 ? ((cancelled / stats.totalOrders) * 100).toFixed(1) : 0,
      inProgressRate: stats.totalOrders > 0 ? 
        (((stats.ordersByStatus.pending + stats.ordersByStatus.confirmed + stats.ordersByStatus.processing) / stats.totalOrders) * 100).toFixed(1) : 0
    };
    
    return stats;
  } catch (error) {
    console.error('❌ Ошибка при получении статистики:', error);
    return null;
  }
}

// Format stats for display
function formatStatsMessage(stats) {
  if (!stats) return '❌ Ошибка при получении статистики';
  
  let message = `📊 *УПРАВЛЕНЧЕСКАЯ ПАНЕЛЬ FLOWHAMMERR SHOP*\n\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *ФИНАНСОВЫЕ ПОКАЗАТЕЛИ*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📈 Всего заказов: *${stats.totalOrders}*\n`;
  message += `💵 Общая выручка: *$${stats.totalRevenue.toFixed(2)}*\n`;
  message += `💳 Средний чек: *$${stats.averageOrderValue}*\n\n`;
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *СТАТУСЫ ЗАКАЗОВ*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
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
    confirmed: 'Подтверждён',
    processing: 'Обработка',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён'
  };
  
  for (const [status, count] of Object.entries(stats.ordersByStatus)) {
    message += `${statusEmojis[status]} ${statusLabels[status]}: *${count}*\n`;
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📊 *МЕТРИКИ КОНВЕРСИИ*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✅ Завершено: *${stats.conversionMetrics.completionRate}%*\n`;
  message += `⏳ В процессе: *${stats.conversionMetrics.inProgressRate}%*\n`;
  message += `❌ Отменено: *${stats.conversionMetrics.cancellationRate}%*\n\n`;
  
  if (stats.topCustomers.length > 0) {
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👥 *ТОП ПОКУПАТЕЛИ*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    stats.topCustomers.slice(0, 5).forEach((customer, idx) => {
      message += `${idx + 1}. ${customer.name}\n`;
      message += `   📞 ${customer.contact || 'N/A'}\n`;
      message += `   🛒 ${customer.count} заказ(ов) / $${customer.totalSpent.toFixed(2)}\n`;
    });
    message += '\n';
  }
  
  if (Object.keys(stats.topProducts).length > 0) {
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🏆 *ТОП ПРОДУКТЫ*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    Object.entries(stats.topProducts)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .forEach(([product, data]) => {
        message += `• ${product}\n`;
        message += `  📦 ${data.qty} шт. / $${data.revenue.toFixed(2)}\n`;
      });
  }
  
  return message;
}

// Export orders to CSV format
async function exportOrdersToCSV() {
  try {
    const orders = await getAllOrders();
    
    let csv = 'Order#,Date,Customer,Contact,Status,Subtotal,Currency,Items Count\n';
    
    orders.forEach(order => {
      const items = JSON.parse(order.items_json || '[]');
      const date = new Date(order.created_at).toLocaleDateString('ru-RU');
      csv += `"${order.order_number}","${date}","${order.customer_name}","${order.customer_contact}","${order.status}","${order.subtotal}","${order.currency}","${items.length}"\n`;
    });
    
    return csv;
  } catch (error) {
    console.error('❌ Ошибка при экспорте:', error);
    return null;
  }
}

// Get detailed user/customer info
async function getCustomerDetails(username) {
  try {
    const orders = await getAllOrders();
    const customerOrders = orders.filter(o => o.username === username || o.customer_name === username);
    
    if (customerOrders.length === 0) return null;
    
    const details = {
      name: customerOrders[0].customer_name,
      username: customerOrders[0].username,
      contact: customerOrders[0].customer_contact,
      orderCount: customerOrders.length,
      totalSpent: 0,
      orders: [],
      lastOrderDate: null
    };
    
    customerOrders.forEach(order => {
      details.totalSpent += parseFloat(order.subtotal) || 0;
      details.orders.push({
        number: order.order_number,
        date: order.created_at,
        status: order.status,
        total: order.subtotal
      });
      if (!details.lastOrderDate || new Date(order.created_at) > new Date(details.lastOrderDate)) {
        details.lastOrderDate = order.created_at;
      }
    });
    
    return details;
  } catch (error) {
    console.error('❌ Ошибка при получении деталей клиента:', error);
    return null;
  }
}

module.exports = {
  getDashboardStats,
  formatStatsMessage,
  exportOrdersToCSV,
  getCustomerDetails
};
