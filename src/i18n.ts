import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationID from './locales/id.json';
import translationEN from './locales/en.json';

const resources = {
  id: {
    translation: translationID
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
