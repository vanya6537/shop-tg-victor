import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ADMIN_USERNAMES = ['QValmont', 'netslayer'];

export default function AdminPanel() {
  const [adminUsername, setAdminUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Mock authentication check (in real app, would validate with backend)
  const handleLogin = () => {
    if (ADMIN_USERNAMES.includes(adminUsername)) {
      setIsAuthenticated(true);
      loadDashboardData();
    } else {
      alert('❌ Access denied. Only authorized admins can access.');
      setAdminUsername('');
    }
  };

  const loadDashboardData = async () => {
    // Load from localStorage (mock data)
    // In real app, would fetch from backend API
    const mockOrders = [
      {
        id: 1,
        order_number: 'ORD_1234567890',
        customer_name: 'John Smith',
        customer_contact: '+1-555-0123',
        status: 'pending',
        subtotal: 45.99,
        currency: 'USD',
        created_at: '2026-01-23',
        items: [
          { title: 'Mini Pocket', qty: 2, lineTotal: 25.98 },
          { title: 'Helmet Cover', qty: 1, lineTotal: 19.99 }
        ]
      },
      {
        id: 2,
        order_number: 'ORD_1234567891',
        customer_name: 'Maria Garcia',
        customer_contact: '+34-555-0123',
        status: 'shipped',
        subtotal: 89.99,
        currency: 'USD',
        created_at: '2026-01-22',
        items: [
          { title: 'Therapy Ergonomic', qty: 2, lineTotal: 49.98 },
          { title: 'Mini Pocket', qty: 2, lineTotal: 25.98 },
          { title: 'Helmet Cover', qty: 1, lineTotal: 19.99 }
        ]
      },
      {
        id: 3,
        order_number: 'ORD_1234567892',
        customer_name: 'Zhang Wei',
        customer_contact: '+86-555-0123',
        status: 'delivered',
        subtotal: 59.98,
        currency: 'USD',
        created_at: '2026-01-21',
        items: [
          { title: 'Acupressure Pro', qty: 2, lineTotal: 39.98 },
          { title: 'Helmet Cover', qty: 1, lineTotal: 19.99 }
        ]
      }
    ];

    setOrders(mockOrders);
    calculateStats(mockOrders);
  };

  const calculateStats = (orderList) => {
    const totalRevenue = orderList.reduce((sum, order) => sum + order.subtotal, 0);
    const ordersByStatus = {
      pending: orderList.filter(o => o.status === 'pending').length,
      confirmed: orderList.filter(o => o.status === 'confirmed').length,
      processing: orderList.filter(o => o.status === 'processing').length,
      shipped: orderList.filter(o => o.status === 'shipped').length,
      delivered: orderList.filter(o => o.status === 'delivered').length,
      cancelled: orderList.filter(o => o.status === 'cancelled').length
    };

    const topProducts = {};
    orderList.forEach(order => {
      order.items.forEach(item => {
        if (!topProducts[item.title]) {
          topProducts[item.title] = { qty: 0, revenue: 0 };
        }
        topProducts[item.title].qty += item.qty;
        topProducts[item.title].revenue += item.lineTotal;
      });
    });

    setStats({
      totalOrders: orderList.length,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: (totalRevenue / orderList.length).toFixed(2),
      ordersByStatus,
      topProducts: Object.entries(topProducts).map(([name, data]) => ({
        name,
        qty: data.qty,
        revenue: data.revenue.toFixed(2)
      }))
    });
  };

  const updateOrderStatus = (orderId, status) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    calculateStats(updatedOrders);
    setSelectedOrder(null);
  };

  const exportToCSV = () => {
    const headers = ['Order#', 'Date', 'Customer', 'Contact', 'Status', 'Amount', 'Items'];
    const rows = orders.map(order => [
      order.order_number,
      order.created_at,
      order.customer_name,
      order.customer_contact,
      order.status,
      `$${order.subtotal}`,
      order.items.map(i => `${i.title}(x${i.qty})`).join(', ')
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-md border border-purple-500">
          <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            🔐 Admin Panel
          </h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Admin Username</label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="e.g., QValmont or netslayer"
                className="w-full px-4 py-2 bg-gray-800 border border-purple-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded transition"
            >
              🔓 Login
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-4">
              ✅ Authorized users: @QValmont, @netslayer
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-900 text-yellow-100',
    confirmed: 'bg-green-900 text-green-100',
    processing: 'bg-blue-900 text-blue-100',
    shipped: 'bg-purple-900 text-purple-100',
    delivered: 'bg-emerald-900 text-emerald-100',
    cancelled: 'bg-red-900 text-red-100'
  };

  const statusEmojis = {
    pending: '⏳',
    confirmed: '✅',
    processing: '⚙️',
    shipped: '📦',
    delivered: '🎉',
    cancelled: '❌'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-purple-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              📊 FlowHammer Admin CRM
            </h1>
            <span className="text-sm bg-purple-600 px-3 py-1 rounded-full">
              👤 {adminUsername}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/#home'}
              className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded transition font-semibold"
              title="Return to shop"
            >
              🏪 Shop
            </button>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setAdminUsername('');
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition font-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-purple-500 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
            { id: 'orders', label: '📦 Orders', icon: '🛒' },
            { id: 'customers', label: '👥 Customers', icon: '👤' },
            { id: 'analytics', label: '📉 Analytics', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-blue-600 to-blue-400' },
                { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰', color: 'from-green-600 to-green-400' },
                { label: 'Avg Order', value: `$${stats.averageOrderValue}`, icon: '💳', color: 'from-purple-600 to-purple-400' },
                { label: 'Customers', value: orders.length, icon: '👥', color: 'from-pink-600 to-pink-400' }
              ].map((metric, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${metric.color} rounded-lg p-6 text-white shadow-lg`}>
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <p className="text-sm opacity-90">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Order Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-lg p-6 border border-purple-500">
                <h3 className="text-lg font-bold mb-4 text-purple-400">📊 Orders by Status</h3>
                <div className="space-y-2">
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span>{statusEmojis[status]}</span>
                        <span className="capitalize text-gray-300">{status}</span>
                      </span>
                      <span className={`${statusColors[status]} px-3 py-1 rounded font-bold`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-purple-500">
                <h3 className="text-lg font-bold mb-4 text-purple-400">🏆 Top Products</h3>
                <div className="space-y-3">
                  {stats.topProducts.slice(0, 5).map((product, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-200">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.qty} units sold</p>
                      </div>
                      <span className="text-green-400 font-bold">${product.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-2 px-6 rounded transition"
              >
                📥 Export to CSV
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2 px-6 rounded transition"
              >
                📦 View All Orders
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">📦 Order Management</h2>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
              >
                📥 Export
              </button>
            </div>

            {selectedOrder ? (
              <div className="bg-gray-900 rounded-lg p-6 border border-purple-500 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">{selectedOrder.order_number}</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="font-semibold text-lg">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Contact</p>
                    <p className="font-semibold text-lg">{selectedOrder.customer_contact}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-800 p-2 rounded">
                        <span>{item.title} x{item.qty}</span>
                        <span className="text-green-400">${item.lineTotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-green-400">${selectedOrder.subtotal}</span>
                </div>

                <div className="bg-gray-800 p-4 rounded">
                  <p className="text-gray-400 text-sm mb-3">Update Status</p>
                  <div className="space-y-2">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`w-full py-2 px-4 rounded transition capitalize font-semibold ${
                          selectedOrder.status === status
                            ? `${statusColors[status]}`
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                      >
                        {statusEmojis[status]} {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {orders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-gray-900 rounded-lg p-4 border border-purple-500 hover:border-pink-500 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-lg">{order.order_number}</p>
                        <p className="text-gray-400">{order.customer_name} • {order.created_at}</p>
                      </div>
                      <div className="text-right">
                        <p className={`${statusColors[order.status]} px-3 py-1 rounded inline-block font-semibold`}>
                          {statusEmojis[order.status]} {order.status}
                        </p>
                        <p className="text-green-400 font-bold text-lg mt-1">${order.subtotal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">👥 Customer Analysis</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-purple-500">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-left">Orders</th>
                    <th className="px-6 py-3 text-left">Total Spent</th>
                    <th className="px-6 py-3 text-left">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(orders.map(o => o.customer_name))).map((name, idx) => {
                    const customerOrders = orders.filter(o => o.customer_name === name);
                    const totalSpent = customerOrders.reduce((sum, o) => sum + o.subtotal, 0);
                    const avgOrder = (totalSpent / customerOrders.length).toFixed(2);
                    return (
                      <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800">
                        <td className="px-6 py-3">{name}</td>
                        <td className="px-6 py-3">{customerOrders.length}</td>
                        <td className="px-6 py-3 text-green-400 font-bold">${totalSpent.toFixed(2)}</td>
                        <td className="px-6 py-3">${avgOrder}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-gray-900 rounded-lg p-6 border border-purple-500">
            <h2 className="text-2xl font-bold text-purple-400 mb-6">📉 Revenue Analytics</h2>
            <p className="text-gray-400">Coming soon: Advanced charts and visualizations</p>
          </div>
        )}
      </div>
    </div>
  );
}
