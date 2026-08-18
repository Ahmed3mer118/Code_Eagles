import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export default function PricingTiers({ tiers = [], slug }) {
  const { t } = useTranslation();

  if (!tiers.length) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {tiers.map((tier) => (
        <article
          key={tier.key}
          className={`ce-card flex flex-col p-6 ${tier.featured ? 'ce-gradient-border ring-2 ring-[var(--ce-accent)]/30' : ''}`}
        >
          {tier.featured && (
            <span className="ce-badge ce-badge-accent mb-3 w-fit">{t('academy.mostPopular')}</span>
          )}
          <h3 className="text-xl font-extrabold text-[var(--ce-primary)]">{tier.label}</h3>
          <p className="mt-2 text-3xl font-extrabold text-[var(--ce-accent)]">
            {tier.price > 0 ? `${tier.price} ${t('academy.currency')}` : t('payments.freePlan')}
          </p>
          <ul className="mt-5 flex flex-1 flex-col gap-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-[var(--ce-muted)]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ce-success)]" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            to={`/auth/register?role=student&academy=${slug}`}
            className={`ce-btn mt-6 w-full text-sm ${tier.featured ? 'ce-btn-accent' : 'ce-btn-primary'}`}
          >
            {t('academy.subscribe')}
          </Link>
        </article>
      ))}
    </div>
  );
}
