// Admin configuration - hardcoded admin users
const ADMIN_USERS = {
  'QValmont': {
    telegram_id: null, // Will be populated dynamically
    username: 'QValmont',
    role: 'super_admin',
    permissions: ['view_orders', 'edit_orders', 'view_users', 'export_data', 'view_stats', 'manage_admins']
  },
  'netslayer': {
    telegram_id: null, // Will be populated dynamically
    username: 'netslayer',
    role: 'super_admin',
    permissions: ['view_orders', 'edit_orders', 'view_users', 'export_data', 'view_stats', 'manage_admins']
  }
};

// Check if user is admin
function isAdmin(user) {
  if (!user) return false;
  const username = user.username || '';
  return username in ADMIN_USERS || ADMIN_USERS[username]?.telegram_id === user.id;
}

// Get admin info
function getAdminInfo(user) {
  if (!user) return null;
  const username = user.username || '';
  return ADMIN_USERS[username] || null;
}

// Register admin's Telegram ID (called on first contact)
function registerAdminId(user) {
  if (!user) return false;
  const username = user.username || '';
  if (username in ADMIN_USERS && !ADMIN_USERS[username].telegram_id) {
    ADMIN_USERS[username].telegram_id = user.id;
    return true;
  }
  return false;
}

module.exports = {
  ADMIN_USERS,
  isAdmin,
  getAdminInfo,
  registerAdminId
};
