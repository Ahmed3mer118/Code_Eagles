// src/shared/i18n/langSync.js
const STORAGE_KEY = 'ce_language';
const EVENT = 'ce-lang-change';

export function setLangExternal(lang) {
  if (lang !== 'ar' && lang !== 'en') return;
  const current = localStorage.getItem(STORAGE_KEY);
  if (current === lang) return;
  localStorage.setItem(STORAGE_KEY, lang);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: lang }));
}

export function subscribeLangExternal(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export const LANG_EVENT = EVENT;