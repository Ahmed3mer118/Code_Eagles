import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock } from 'lucide-react';
import { subscriptionApi, uploadApi } from '../../shared/api/platformApi';
import { formatPlanPeriod } from '../../shared/utils/subscriptionDays';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';
import PlatformSubscriptionPaymentFlow, {
  AwaitingApprovalBanner,
  PeriodModeSelector,
  SelectedPlanSummary,
  SubscriptionNavTabs,
} from './components/PlatformSubscriptionPaymentFlow';

export default function TeacherPlatformPaymentPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [periodMode, setPeriodMode] = useState('reset');
  const [form, setForm] = useState({ method: 'vodafone_cash', receiptImageUrl: '', notes: '' });

  const load = async () => {
    const res = await subscriptionApi.mine();
    setData(res);
    if (res.pending?.periodMode) setPeriodMode(res.pending.periodMode);
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

  const pending = data?.pending;
  const pendingPlan = pending ? data?.plans?.find((p) => p.key === pending.plan) : null;
  const paymentInfo = data?.paymentInfo || {};
  const showPeriodMode = !!data?.active && pending && pending.requestType !== 'new';
  const amountDue = pending?.amountDue ?? pending?.amount ?? 0;
  const requiresPayment = amountDue > 0;

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.url || res.absoluteUrl || '';
      setForm((prev) => ({ ...prev, receiptImageUrl: url }));
      setReceiptPreview(resolveMediaUrl(url));
      toast.success(t('payments.receiptUploaded'));
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!pending) {
      toast.error(t('platformSub.noPendingPlan'));
      return;
    }
    if (requiresPayment && !form.receiptImageUrl) {
      toast.error(t('platformSub.receiptRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionApi.updateMine({
        plan: pending.plan,
        periodUnit: pending.periodUnit ?? pendingPlan?.periodUnit,
        periodValue: pending.periodValue ?? pendingPlan?.periodValue ?? pendingPlan?.periodMonths,
        periodMode: showPeriodMode ? periodMode : 'reset',
        method: form.method,
        receiptImageUrl: form.receiptImageUrl,
        notes: form.notes,
      });
      toast.success(t('platformSub.requestSent'));
      await load();
      setForm({ method: 'vodafone_cash', receiptImageUrl: '', notes: '' });
      setReceiptPreview('');
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ContentLoader />;

  const planSummary = pendingPlan || pending ? (
    <SelectedPlanSummary
      plan={pendingPlan || { key: pending.plan, price: amountDue, name: { [lang]: pending.plan } }}
      lang={lang}
      t={t}
      amountDue={amountDue}
      requestType={pending?.requestType}
      previousPlan={pending?.previousPlan}
    />
  ) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t('platformSub.paymentNav')} subtitle={t('platformSub.paymentPageHint')} />

      <SubscriptionNavTabs t={t} active="payment" />

      {data?.hasAccess && !pending && (
        <div className="ce-card border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <CheckCircle2 className="mb-2 h-6 w-6" />
          <p>{t('platformSub.activeTitle')}</p>
          <Link to="/dashboard/teacher/subscription" className="ce-btn ce-btn-accent mt-4 inline-flex text-xs">
            {t('platformSub.changePlanTitle')}
          </Link>
        </div>
      )}

      {!pending && !data?.hasAccess && (
        <div className="ce-card p-10 text-center">
          <p className="text-[var(--ce-muted)]">{t('platformSub.noPendingPlan')}</p>
          <Link to="/dashboard/teacher/subscription" className="ce-btn ce-btn-accent mt-5 inline-flex">
            {t('platformSub.planNav')}
          </Link>
        </div>
      )}

      {pending && pending.requestType === 'admin_change' && (
        <div className="ce-card border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t('platformSub.adminPlanChangeNotice')}
        </div>
      )}

      {pending && !pending.receiptImageUrl && (
        <>
          <div className="ce-card flex items-start gap-3 border-blue-200 bg-blue-50 p-5">
            <Clock className="h-5 w-5 shrink-0 text-blue-700" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-blue-900">{t('platformSub.pendingTitle')}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status="pending" label={pendingPlan?.name?.[lang] || pending.plan} />
                <span className="font-bold">
                  {amountDue} {t('payments.currency')}
                </span>
              </div>
              {pending.previousPlan && pending.previousPlan !== pending.plan && (
                <p className="mt-2 text-xs text-blue-800">
                  {pending.previousPlan} → {pending.plan}
                  {(amountDue > 0 && (pending.requestType === 'upgrade' || pending.requestType === 'admin_change')) && (
                    <span> · {t('platformSub.upgradeDifference')}</span>
                  )}
                </p>
              )}
              {pendingPlan && (
                <p className="mt-1 text-xs text-blue-800">{formatPlanPeriod(pendingPlan, t)}</p>
              )}
              <Link
                to="/dashboard/teacher/subscription"
                className="mt-3 inline-flex text-xs font-bold text-[var(--ce-primary)] underline"
              >
                {t('payments.changePlanLink')}
              </Link>
            </div>
          </div>

          <PlatformSubscriptionPaymentFlow
            t={t}
            paymentInfo={paymentInfo}
            onSubmit={onSubmit}
            form={form}
            setForm={setForm}
            receiptPreview={receiptPreview}
            onUpload={onUpload}
            uploading={uploading}
            submitting={submitting}
            planSummary={planSummary}
            requireReceipt={requiresPayment}
            submitLabel={requiresPayment ? t('platformSub.submitReceipt') : t('platformSub.submitRequest')}
            instructionsStep={1}
            uploadStep={showPeriodMode ? 3 : 2}
            periodModeBlock={
              showPeriodMode ? (
                <PeriodModeSelector
                  periodMode={periodMode}
                  setPeriodMode={setPeriodMode}
                  t={t}
                  step={2}
                />
              ) : null
            }
            freePlanNote={
              !requiresPayment ? (
                <p className="rounded-xl bg-[var(--ce-bg)] p-3 text-sm text-[var(--ce-muted)]">
                  {t('platformSub.freePlanChange')}
                </p>
              ) : null
            }
          />
        </>
      )}

      {pending?.receiptImageUrl && <AwaitingApprovalBanner t={t} />}
    </div>
  );
}
