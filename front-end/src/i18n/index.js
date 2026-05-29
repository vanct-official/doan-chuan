import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';
import ja from './locales/ja.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      ja: { translation: ja }
    },
    lng: localStorage.getItem('app_lang') || 'vi', // default language from localStorage
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
