import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ar } from './ar';
import { en } from './en';

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'ar';

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes((value ?? '') as SupportedLocale);
}

export function applyDocumentDirection(locale: SupportedLocale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
    lookupLocalStorage: 'platform-locale',
  },
  returnNull: false,
});

i18n.on('languageChanged', (lng) => {
  if (isSupportedLocale(lng)) {
    applyDocumentDirection(lng);
  }
});

if (typeof document !== 'undefined' && isSupportedLocale(i18n.language)) {
  applyDocumentDirection(i18n.language);
}

export default i18n;
