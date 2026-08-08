import { useEffect, useCallback } from 'react';

const PREFIX = 'ce_draft_';

export function useFormDraft(draftKey, values, { enabled = true } = {}) {
  const storageKey = `${PREFIX}${draftKey}`;

  useEffect(() => {
    if (!enabled || !draftKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        // caller restores via onRestore in FormModal
      }
    } catch {
      /* ignore */
    }
  }, [draftKey, enabled, storageKey]);

  useEffect(() => {
    if (!enabled || !draftKey) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(values));
      } catch {
        /* ignore quota */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [values, draftKey, enabled, storageKey]);

  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const hasDraft = useCallback(() => {
    try {
      return Boolean(localStorage.getItem(storageKey));
    } catch {
      return false;
    }
  }, [storageKey]);

  return { loadDraft, clearDraft, hasDraft, storageKey };
}

export default useFormDraft;
