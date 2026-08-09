import { useTranslation } from 'react-i18next';
import { StatCards } from '../../shared/ui/Charts';

export default function OverviewCards({ cards = [] }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="ce-card p-6">
        <h2 className="text-2xl font-extrabold text-[var(--ce-primary)]">{t('dashboard.overview')}</h2>
        <p className="mt-2 text-[var(--ce-muted)]">{t('dashboard.moduleHint')}</p>
      </div>
      <StatCards items={cards.map((card) => ({ ...card, label: t(card.labelKey) }))} />
    </div>
  );
}
