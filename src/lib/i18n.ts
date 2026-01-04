import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from '@/locales/en/common.json';
import arTranslations from '@/locales/ar/common.json';
import frTranslations from '@/locales/fr/common.json';
import esTranslations from '@/locales/es/common.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    
    // Safe fallback behavior
    returnNull: false,
    returnEmptyString: false,
    
    react: {
      useSuspense: false, // Prevent loading flicker
    },
  });

// Set document direction based on language
export const updateDocumentDirection = (lang: string) => {
  const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang);
  const dir = langConfig?.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
};

// Initialize direction on load
updateDocumentDirection(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  localStorage.setItem('lang', lng);
});

export default i18n;
