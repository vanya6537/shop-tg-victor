const en = require('./locales/en.json');
const ru = require('./locales/ru.json');
const vi = require('./locales/vi.json');

const locales = { en, ru, vi };

/**
 * Get translation string for a user's language
 * @param {string} lang - Language code (en, ru, vi)
 * @param {string} key - Translation key (e.g., 'start.title')
 * @returns {string} Translated string
 */
function t(lang, key) {
  const normalizedLang = (lang || 'ru').toLowerCase();
  const locale = locales[normalizedLang] || locales.ru;
  
  const keys = key.split('.');
  let value = locale;
  
  for (const k of keys) {
    value = value[k];
    if (!value) return key; // Return key if translation not found
  }
  
  return value;
}

/**
 * Get user's language from Telegram user object
 * @param {object} user - Telegram user object from msg.from or query.from
 * @returns {string} Language code (en, ru, vi)
 */
function getUserLanguage(user) {
  if (!user || !user.language_code) return 'ru'; // Default to Russian
  
  const lang = user.language_code.toLowerCase();
  if (lang.startsWith('ru')) return 'ru';
  if (lang.startsWith('vi')) return 'vi';
  return 'ru'; // Default to Russian instead of English
}

module.exports = { t, getUserLanguage, locales };
