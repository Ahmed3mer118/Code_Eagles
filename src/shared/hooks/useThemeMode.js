import { useEffect, useState } from 'react';

function readDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/** Keeps React trees in sync when html.dark toggles (ThemeToggle / system preference). */
export default function useThemeMode() {
  const [dark, setDark] = useState(readDarkMode);

  useEffect(() => {
    const sync = () => setDark(readDarkMode());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', sync);
    };
  }, []);

  return dark;
}
