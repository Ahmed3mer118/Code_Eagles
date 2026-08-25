import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ArrowRight, Check, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { subscriptionApi, FEATURE_KEYS } from '../../shared/api/platformApi';
import { formatPlanPeriod } from '../../shared/utils/subscriptionDays';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';
import PaymentInstructionsPanel from '../payments/components/PaymentInstructionsPanel';
import {
  AwaitingApprovalBanner,
  SelectedPlanSummary,
  SubscriptionNavTabs,
} from './components/PlatformSubscriptionPaymentFlow';

function PlanCard({ plan, lang, selected, current, onSelect, t }) {
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
      {current && (
        <span className="absolute start-4 top-4 rounded-full bg-[var(--ce-primary)] px-2.5 py-0.5 text-[10px] font-bold text-white">
          {t('platformSub.currentPlanBadge')}
        </span>
      )}
      {selected && !current && (
        <span className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}
      <p className={`pe-10 text-lg font-extrabold text-[var(--ce-primary)] ${current ? 'pt-6' : ''}`}>
        {plan.name?.[lang] || plan.key}
      </p>
      <p className="mt-3 text-3xl font-black text-[var(--ce-accent)]">
        {plan.price} <span className="text-sm">{t('payments.currency')}</span>
      </p>
      <p className="mt-1 text-xs text-[var(--ce-muted)]">{formatPlanPeriod(plan, t)}</p>
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

function estimateAmountDue(activePlan, selectedPlan, active) {
  if (!selectedPlan) return 0;
  if (!active || !activePlan) return selectedPlan.price ?? 0;
  if (active.plan === selectedPlan.key) return selectedPlan.price ?? 0;
  const currentPrice = activePlan.price ?? 0;
  const newPrice = selectedPlan.price ?? 0;
  if (newPrice > currentPrice) return newPrice - currentPrice;
  return 0;
}

export default function TeacherSubscriptionPlanPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');

  const load = async () => {
    const res = await subscriptionApi.mine();
    setData(res);
    if (res.pending?.plan) setSelectedPlan(res.pending.plan);
    else if (res.activePlanKey) setSelectedPlan(res.activePlanKey);
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

  const activePlan = useMemo(
    () => data?.plans?.find((p) => p.key === data?.activePlanKey),
    [data?.plans, data?.activePlanKey]
  );

  const pendingPlan = useMemo(
    () => data?.plans?.find((p) => p.key === data?.pending?.plan),
    [data?.plans, data?.pending?.plan]
  );

  const amountDue = useMemo(
    () => estimateAmountDue(activePlan, plan, data?.active),
    [activePlan, plan, data?.active]
  );

  const pendingAmountDue = data?.pending?.amountDue ?? data?.pending?.amount ?? 0;
  const paymentInfo = data?.paymentInfo || {};
  const hasPaymentInfo =
    paymentInfo.vodafoneNumber ||
    paymentInfo.instapayId ||
    paymentInfo.bankDetails ||
    paymentInfo.paymentInstructions;

  const persistPlan = async () => {
    if (!plan) return null;
    const payload = {
      plan: plan.key,
      periodUnit: plan.periodUnit,
      periodValue: plan.periodValue ?? plan.periodMonths,
    };
    if (data?.pending) {
      const res = await subscriptionApi.updateMine(payload);
      return res;
    }
    const res = await subscriptionApi.request(payload);
    return res;
  };

  const onSavePlan = async (e) => {
    e.preventDefault();
    if (!plan) return;
    setSaving(true);
    try {
      await persistPlan();
      toast.success(t('payments.planSaved'));
      await load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const onGoToPayment = async () => {
    if (!plan) {
      toast.error(t('platformSub.choosePlan'));
      return;
    }
    setSaving(true);
    try {
      await persistPlan();
      navigate('/dashboard/teacher/platform-payments');
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ContentLoader />;

  const { hasAccess, pending, active, academyApproved } = data || {};

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t('platformSub.planNav')} subtitle={t('platformSub.planPageHint')} />

      <SubscriptionNavTabs t={t} active="plan" />

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

      {pending?.requestType === 'admin_change' && (
        <div className="ce-card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t('platformSub.adminPlanChangeNotice')}
        </div>
      )}

      {pending?.receiptImageUrl && <AwaitingApprovalBanner t={t} />}

      {academyApproved && (
        <form onSubmit={onSavePlan} className="space-y-4">
          {pending && !pending.receiptImageUrl && (
            <div className="ce-card flex items-center gap-3 border-blue-200 bg-blue-50 p-4 text-sm">
              <Clock className="h-5 w-5 text-blue-700" />
              <div className="flex-1">
                <p className="font-bold text-blue-900">{t('platformSub.pendingPlanSelected')}</p>
                <StatusBadge status="pending" label={pendingPlan?.name?.[lang] || pending.plan} />
                {pendingAmountDue > 0 && (
                  <p className="mt-2 font-semibold">
                    {t('platformSub.amountDue')}: {pendingAmountDue} {t('payments.currency')}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="ce-btn ce-btn-accent shrink-0 text-xs"
                onClick={onGoToPayment}
                disabled={saving || !!pending?.receiptImageUrl}
              >
                {saving ? t('common.loading') : t('payments.goToPayment')}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <section className="ce-card overflow-hidden">
            <div className="border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <h3 className="font-extrabold text-[var(--ce-primary)]">
                {hasAccess ? t('platformSub.changePlanTitle') : t('platformSub.choosePlan')}
              </h3>
              {hasAccess && (
                <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('platformSub.changePlanHint')}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {(data?.plans || []).map((item) => (
                <PlanCard
                  key={item.key}
                  plan={item}
                  lang={lang}
                  selected={selectedPlan === item.key}
                  current={data?.activePlanKey === item.key}
                  onSelect={() => setSelectedPlan(item.key)}
                  t={t}
                />
              ))}
            </div>
          </section>

          {plan && (
            <div className="ce-card p-4 text-sm">
              {amountDue > 0 ? (
                <p className="font-semibold text-[var(--ce-primary)]">
                  {active && plan.key !== active.plan
                    ? t('platformSub.payDifference', { amount: amountDue, currency: t('payments.currency') })
                    : `${t('platformSub.amountDue')}: ${amountDue} ${t('payments.currency')}`}
                </p>
              ) : (
                <p className="text-[var(--ce-muted)]">{t('platformSub.freePlanChange')}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="ce-btn ce-btn-primary flex-1"
              disabled={saving || !plan || !!pending?.receiptImageUrl}
            >
              {saving ? t('common.loading') : t('payments.savePlan')}
            </button>
            <button
              type="button"
              className="ce-btn ce-btn-accent flex-1"
              onClick={onGoToPayment}
              disabled={saving || !plan || !!pending?.receiptImageUrl}
            >
              {saving ? t('common.loading') : t('payments.goToPayment')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {pending && !pending.receiptImageUrl && (
        <section className="space-y-4">
          <h3 className="text-lg font-extrabold text-[var(--ce-primary)]">{t('platformSub.paymentNav')}</h3>
          <div className="grid gap-6 lg:grid-cols-5">
            {hasPaymentInfo && pendingAmountDue > 0 && (
              <div className="lg:col-span-2">
                <PaymentInstructionsPanel paymentInfo={paymentInfo} step={1} />
              </div>
            )}
            <div className={hasPaymentInfo && pendingAmountDue > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
              <div className="ce-card p-5 space-y-4">
                <SelectedPlanSummary
                  plan={pendingPlan || { key: pending.plan, price: pendingAmountDue, name: { [lang]: pending.plan } }}
                  lang={lang}
                  t={t}
                  amountDue={pendingAmountDue}
                  requestType={pending.requestType}
                  previousPlan={pending.previousPlan}
                />
                <p className="text-sm text-[var(--ce-muted)]">{t('platformSub.uploadReceiptHint')}</p>
                <button
                  type="button"
                  className="ce-btn ce-btn-primary w-full"
                  onClick={onGoToPayment}
                  disabled={saving}
                >
                  <CreditCard className="h-4 w-4" />
                  {saving ? t('common.loading') : t('platformSub.submitReceipt')}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
