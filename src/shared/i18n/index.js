import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { createElement } from 'react';

const DICTS = { ar, en };
const STORAGE_KEY = 'ce_language';
const DEFAULT_LANG = 'ar';

const I18nContext = createContext(null);

/* -------------------- Provider -------------------- */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
    return DEFAULT_LANG;
  });

  // Apply dir + lang on <html>
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  }, [lang, setLang]);

  // t('auth.login') or t('key', { name: 'X' })
  const t = useCallback(
    (key, vars) => {
      const parts = key.split('.');
      let node = DICTS[lang];
      for (const p of parts) {
        node = node?.[p];
        if (node === undefined) return key;
      }
      if (typeof node === 'string' && vars) {
        return node.replace(/\{(\w+)\}/g, (_, k) =>
          vars[k] !== undefined ? vars[k] : `{${k}}`,
        );
      }
      return node;
    },
    [lang],
  );

  const value = { lang, setLang, toggleLang, t };
  return createElement(I18nContext.Provider, { value }, children);
}

/* -------------------- Hooks -------------------- */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>');
  return ctx;
}

/* -------------------- Non-hook helper (للاستخدام خارج React) -------------------- */
export function getCurrentLang() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
}

export default { useI18n, LanguageProvider };