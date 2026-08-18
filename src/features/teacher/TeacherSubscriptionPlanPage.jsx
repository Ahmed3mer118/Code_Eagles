import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowRight, Check, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { subscriptionApi, FEATURE_KEYS } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';

function PlanCard({ plan, lang, selected, onSelect, t }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex h-full w-full flex-col rounded-2xl border-2 p-5 text-start transition ${
        selected
          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
          : 'border-[var(--ce-border)] bg-white hover:border-[var(--ce-primary)]/25'
      }`}
    >
      {selected && (
        <span className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
      <p className="pe-10 text-lg font-extrabold text-[var(--ce-primary)]">{plan.name?.[lang] || plan.key}</p>
      <p className="mt-3 text-3xl font-black text-[var(--ce-accent)]">{plan.price} <span className="text-sm">{t('payments.currency')}</span></p>
      {plan.description?.[lang] && (
        <p className="mt-3 text-sm text-[var(--ce-muted)]">{plan.description[lang]}</p>
      )}
      {(plan.features || []).length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-[var(--ce-border)] pt-4">
          {[...(plan.features || [])]
            .sort((a, b) => FEATURE_KEYS.indexOf(a) - FEATURE_KEYS.indexOf(b))
            .map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-xs">
                <Check className="mt-0.5 h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                {t(`features.${feature}`, feature)}
              </li>
            ))}
        </ul>
      )}
    </button>
  );
}

export default function TeacherSubscriptionPlanPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');

  const load = async () => {
    const res = await subscriptionApi.mine();
    setData(res);
    if (res.pending?.plan) setSelectedPlan(res.pending.plan);
    else if (res.plans?.length && !selectedPlan) setSelectedPlan(res.plans[0].key);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (err) {
        toast.error(err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const plan = useMemo(
    () => data?.plans?.find((p) => p.key === selectedPlan),
    [data?.plans, selectedPlan]
  );

  const onSavePlan = async (e) => {
    e.preventDefault();
    if (!plan) return;
    setSaving(true);
    try {
      if (data?.pending) {
        await subscriptionApi.updateMine({
          plan: plan.key,
          amount: plan.price,
          periodMonths: plan.periodMonths,
        });
      } else {
        await subscriptionApi.request({
          plan: plan.key,
          amount: plan.price,
          periodMonths: plan.periodMonths,
        });
      }
      toast.success(t('payments.planSaved'));
      await load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ContentLoader />;

  const { hasAccess, pending, active } = data || {};

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={t('platformSub.planNav')} subtitle={t('platformSub.planPageHint')} />

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard/teacher/subscription" className="ce-btn ce-btn-primary text-sm">{t('platformSub.planNav')}</Link>
        <Link to="/dashboard/teacher/platform-payments" className="ce-btn ce-btn-ghost text-sm">
          <CreditCard className="h-4 w-4" />
          {t('platformSub.paymentNav')}
        </Link>
        <Link to="/dashboard/teacher/payment-plans" className="ce-btn ce-btn-ghost text-sm">{t('payments.plansTitle')}</Link>
      </div>

      {hasAccess && (
        <div className="ce-card flex items-start gap-3 border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-extrabold text-emerald-900">{t('platformSub.activeTitle')}</p>
            <p className="mt-1 text-sm text-emerald-800">
              {t('platformSub.activeHint', {
                plan: active?.plan,
                date: active?.expiresAt ? new Date(active.expiresAt).toLocaleDateString() : '—',
              })}
            </p>
          </div>
        </div>
      )}

      {!hasAccess && (
        <form onSubmit={onSavePlan} className="space-y-4">
          {pending && (
            <div className="ce-card flex items-center gap-3 border-blue-200 bg-blue-50 p-4 text-sm">
              <Clock className="h-5 w-5 text-blue-700" />
              <div>
                <p className="font-bold text-blue-900">{t('platformSub.pendingPlanSelected')}</p>
                <StatusBadge status="pending" label={pending.plan} />
              </div>
            </div>
          )}

          <section className="ce-card overflow-hidden">
            <div className="border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.choosePlan')}</h3>
            </div>
            <div className="flex flex-col gap-3 p-5">
              {(data?.plans || []).map((item) => (
                <PlanCard
                  key={item.key}
                  plan={item}
                  lang={lang}
                  selected={selectedPlan === item.key}
                  onSelect={() => setSelectedPlan(item.key)}
                  t={t}
                />
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="ce-btn ce-btn-primary flex-1" disabled={saving || !plan}>
              {saving ? t('common.loading') : t('payments.savePlan')}
            </button>
            <Link to="/dashboard/teacher/platform-payments" className="ce-btn ce-btn-accent flex-1">
              {t('payments.goToPayment')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
