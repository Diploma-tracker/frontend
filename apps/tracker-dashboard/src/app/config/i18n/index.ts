import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';

import enLang from './locales/en/en.json';
import ukLang from './locales/uk/uk.json';

const resources = {
  en: {
    translation: enLang,
  },
  uk: {
    translation: ukLang,
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
