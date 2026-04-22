import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import enLang from './locales/en/en.json';
import uaLang from './locales/ua/ua.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: enLang,
  },
  ua: {
    translation: uaLang,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
