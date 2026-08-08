import { useTranslation } from 'react-i18next';

export default function PlaceholderPanel({ titleKey }) {
  const { t } = useTranslation();
  return (
    <div className="ce-card p-6 md:p-8">
      <h2 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t(titleKey)}</h2>
      <p className="mt-2 text-[var(--ce-muted)]">{t('dashboard.comingSoon')}</p>
      <p className="mt-4 rounded-xl bg-[var(--ce-bg)] px-4 py-3 text-sm text-slate-600">
        {t('dashboard.moduleHint')}
      </p>
    </div>
  );
}
