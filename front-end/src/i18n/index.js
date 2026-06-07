import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const FALLBACK_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'app_lang';
export const LANGUAGE_COOKIE_KEY = 'app_lang';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', shortName: 'EN', name: 'English', nativeName: 'English', flag: '🇺🇸', dayjsLocale: 'en' },
  { code: 'vi', shortName: 'VI', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dayjsLocale: 'vi' },
  { code: 'ja', shortName: 'JA', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dayjsLocale: 'ja' },
];

export const NAMESPACES = ['common', 'auth', 'tour'];

const localeModules = import.meta.glob('./locales/*/*.json');

const getCookie = (key) => {
  if (typeof document === 'undefined') return null;

  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${key}=`))
    ?.split('=')[1];
};

export const persistLanguage = (language) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${language};path=/;max-age=31536000;samesite=lax`;
};

const normalizeLanguage = (language) => {
  const normalized = String(language || '').toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.some((item) => item.code === normalized)
    ? normalized
    : FALLBACK_LANGUAGE;
};

export const detectInitialLanguage = () => {
  if (typeof window === 'undefined') return FALLBACK_LANGUAGE;

  const persisted = localStorage.getItem(LANGUAGE_STORAGE_KEY) || getCookie(LANGUAGE_COOKIE_KEY);
  if (persisted) return normalizeLanguage(persisted);

  return normalizeLanguage(navigator.language || navigator.languages?.[0]);
};

const lazyJsonBackend = {
  type: 'backend',
  read(language, namespace, callback) {
    const normalizedLanguage = normalizeLanguage(language);
    const normalizedNamespace = NAMESPACES.includes(namespace) ? namespace : 'common';
    const path = `./locales/${normalizedLanguage}/${normalizedNamespace}.json`;
    const fallbackPath = `./locales/${FALLBACK_LANGUAGE}/${normalizedNamespace}.json`;
    const loader = localeModules[path] || localeModules[fallbackPath];

    if (!loader) {
      callback(new Error(`Missing i18n namespace: ${path}`), false);
      return;
    }

    loader()
      .then((module) => callback(null, module.default))
      .catch((error) => callback(error, false));
  },
};

i18n
  .use(lazyJsonBackend)
  .use(initReactI18next)
  .init({
    lng: detectInitialLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map((item) => item.code),
    nonExplicitSupportedLngs: true,
    defaultNS: 'common',
    ns: ['common'],
    fallbackNS: ['common'],
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key "${key}" in namespace "${ns}" for ${lngs.join(', ')}`);
      }
    },
  });

i18n.on('languageChanged', persistLanguage);

export default i18n;
