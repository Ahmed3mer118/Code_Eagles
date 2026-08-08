import { useTranslation } from 'react-i18next';

export default function OverviewCards({ cards = [] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="ce-card p-6">
        <h2 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t('dashboard.overview')}</h2>
        <p className="mt-2 text-[var(--ce-muted)]">{t('dashboard.moduleHint')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.labelKey} className="ce-card p-5">
            <div className="text-sm font-semibold text-[var(--ce-muted)]">{t(card.labelKey)}</div>
            <div className="mt-2 text-3xl font-extrabold text-[var(--ce-primary)]">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
