import { useTranslation } from 'react-i18next';
import { Check, RefreshCw, Shuffle } from 'lucide-react';

export function UpdateIntentPicker({ value = 'renew', onChange, disabled = false }) {
  const { t } = useTranslation();
  const options = [
    {
      id: 'renew',
      icon: RefreshCw,
      title: t('payments.renewSamePlan'),
      hint: t('payments.renewSamePlanHint'),
    },
    {
      id: 'change',
      icon: Shuffle,
      title: t('payments.changePlan'),
      hint: t('payments.changePlanHint'),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map(({ id, icon: Icon, title, hint }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`flex h-full flex-col rounded-2xl border-2 p-4 text-start transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-[var(--ce-border)] bg-white hover:border-[var(--ce-primary)]/25'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ce-primary)]/10 text-[var(--ce-primary)]">
                <Icon className="h-5 w-5" />
              </div>
              {selected && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </div>
            <p className="mt-3 font-extrabold text-[var(--ce-primary)]">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ce-muted)]">{hint}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function PlanPickerGrid({
  plans = [],
  value = '',
  onChange,
  currentPlanId = '',
  disabled = false,
  disableCurrentPlan = false,
  layout = 'stack',
}) {
  const { t } = useTranslation();

  if (!plans.length) return null;

  const containerClass = layout === 'stack'
    ? 'flex flex-col gap-3'
    : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className={containerClass}>
      {plans.map((plan) => {
        const selected = value === plan._id;
        const isCurrent = currentPlanId && currentPlanId === plan._id;
        const isDisabled = disabled || (disableCurrentPlan && isCurrent);
        return (
          <button
            key={plan._id}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(plan._id, plan)}
            className={`relative flex w-full flex-col rounded-2xl border-2 p-4 text-start transition ${
              selected
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-[var(--ce-border)] bg-white hover:border-[var(--ce-primary)]/25 hover:shadow-sm'
            } ${isDisabled && !selected ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-[var(--ce-primary)]">{plan.name}</p>
                <p className={`mt-1 text-2xl font-extrabold ${selected ? 'text-emerald-700' : 'text-[var(--ce-accent)]'}`}>
                  {plan.price > 0 ? `${plan.price} ${t('academy.currency')}` : t('payments.freePlan')}
                </p>
              </div>
              {selected && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
            </div>
            {plan.description && (
              <p className="mt-3 text-xs leading-relaxed text-[var(--ce-muted)] whitespace-pre-line">
                {plan.description}
              </p>
            )}
            {isCurrent && (
              <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                {t('payments.currentPlan')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function CurrentPlanSummary({ planName, packageLabel, amount, t }) {
  return (
    <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-emerald-800">{t('payments.currentPlan')}</p>
          <p className="mt-1 text-lg font-extrabold text-[var(--ce-primary)]">{planName}</p>
          {packageLabel && (
            <p className="mt-1 text-sm text-[var(--ce-muted)]">{packageLabel}</p>
          )}
          <p className="mt-3 text-2xl font-extrabold text-emerald-700">
            {amount} {t('academy.currency')}
          </p>
          <p className="mt-2 text-xs text-emerald-800">{t('payments.samePlanRenewal')}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}
