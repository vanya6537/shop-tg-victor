// User language preferences storage (in-memory, can be upgraded to database)
const userLanguages = {};

// Set user language preference
function setUserLanguage(userId, lang) {
  if (['en', 'ru', 'vi'].includes(lang)) {
    userLanguages[userId] = lang;
    return true;
  }
  return false;
}

// Get user language preference
function getUserLanguagePreference(userId) {
  return userLanguages[userId] || null;
}

// Get language for user (prefers stored preference, falls back to Telegram language)
function getLanguageForUser(user) {
  if (!user) return 'ru';
  
  // Check stored preference first
  if (user.id && userLanguages[user.id]) {
    return userLanguages[user.id];
  }
  
  // Fall back to Telegram language
  if (!user.language_code) return 'ru';
  
  const lang = user.language_code.toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('vi')) return 'vi';
  return 'ru'; // Default to Russian
}

module.exports = {
  setUserLanguage,
  getUserLanguagePreference,
  getLanguageForUser
};
