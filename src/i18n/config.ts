import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import vi from '../locales/vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ru',
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      vi: { translation: vi },
    },
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
