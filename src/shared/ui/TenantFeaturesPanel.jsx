import { useTranslation } from 'react-i18next';
import { FEATURE_KEYS } from '../api/platformApi';
import { isFeatureEnabled } from '../hooks/useTenantFeatures';
import StatusBadge from '../ui/StatusBadge';

export default function TenantFeaturesPanel({ features }) {
  const { t } = useTranslation();

  return (
    <div className="ce-card p-6">
      <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('settings.featuresTitle')}</h2>
      <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('settings.featuresHint')}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {FEATURE_KEYS.map((key) => {
          const enabled = isFeatureEnabled(features, key);
          return (
            <li
              key={key}
              className="flex items-center justify-between rounded-xl border border-[var(--ce-border)] bg-[var(--ce-bg)] px-4 py-3"
            >
              <span className="font-semibold text-[var(--ce-primary)]">{t(`features.${key}`)}</span>
              <StatusBadge
                status={enabled ? 'approved' : 'pending'}
                label={enabled ? t('settings.featureEnabled') : t('settings.featureDisabled')}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
