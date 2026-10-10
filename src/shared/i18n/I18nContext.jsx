import { createContext, useContext, useEffect, useState } from 'react';
import ar from './locales/ar.json';
import en from './locales/en.json';

const TRANSLATIONS = { ar, en };
const STORAGE_KEY = 'ce-lang';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'ar';
    return localStorage.getItem(STORAGE_KEY) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (next) => {
    if (next === 'ar' || next === 'en') setLangState(next);
  };

  const toggle = () => setLangState((v) => (v === 'ar' ? 'en' : 'ar'));

  const t = (path) => {
    const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.ar;
    return path.split('.').reduce((acc, key) => acc?.[key], dict) ?? path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // fallback لو مش داخل الـ Provider
    return {
      lang: 'ar',
      setLang: () => {},
      toggle: () => {},
      t: (k) => k,
    };
  }
  return ctx;
}