import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[var(--ce-border)] bg-[var(--ce-surface)] p-1 text-sm ${className}`}
      role="group"
      aria-label={t('nav.language')}
    >
      <button
        type="button"
        onClick={() => setLang('ar')}
        className={`rounded-full px-3 py-1 font-semibold transition ${
          current === 'ar' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
        }`}
      >
        ع
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-3 py-1 font-semibold transition ${
          current === 'en' ? 'bg-[var(--ce-brand)] text-white' : 'text-[var(--ce-muted)]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
