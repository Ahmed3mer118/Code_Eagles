import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, CreditCard, Upload } from 'lucide-react';
import { subscriptionApi, uploadApi } from '../../shared/api/platformApi';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';
import PaymentInstructionsPanel from '../payments/components/PaymentInstructionsPanel';

const METHODS = [
  { value: 'vodafone_cash', labelKey: 'payments.methods.vodafone' },
  { value: 'instapay', labelKey: 'payments.methods.instapay' },
  { value: 'bank_transfer', labelKey: 'payments.methods.bank' },
];

export default function TeacherPlatformPaymentPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [form, setForm] = useState({ method: 'vodafone_cash', receiptImageUrl: '', notes: '' });

  const load = async () => {
    const res = await subscriptionApi.mine();
    setData(res);
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
  const hasPaymentInfo = paymentInfo.vodafoneNumber || paymentInfo.instapayId || paymentInfo.bankDetails || paymentInfo.paymentInstructions;

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
    if (!form.receiptImageUrl) {
      toast.error(t('platformSub.receiptRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await subscriptionApi.updateMine({
        plan: pending.plan,
        amount: pending.amount,
        periodMonths: pending.periodMonths,
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t('platformSub.paymentNav')} subtitle={t('platformSub.paymentPageHint')} />

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard/teacher/subscription" className="ce-btn ce-btn-ghost text-sm">{t('platformSub.planNav')}</Link>
        <Link to="/dashboard/teacher/platform-payments" className="ce-btn ce-btn-primary text-sm">
          <CreditCard className="h-4 w-4" />
          {t('platformSub.paymentNav')}
        </Link>
      </div>

      {data?.hasAccess && (
        <div className="ce-card border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <CheckCircle2 className="mb-2 h-6 w-6" />
          {t('platformSub.activeTitle')}
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

      {pending && !pending.receiptImageUrl && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="ce-card flex items-start gap-3 border-blue-200 bg-blue-50 p-5">
            <Clock className="h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="font-extrabold text-blue-900">{t('platformSub.pendingTitle')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status="pending" label={pendingPlan?.name?.[lang] || pending.plan} />
                <span className="font-bold">{pending.amount} {t('payments.currency')}</span>
              </div>
              <Link to="/dashboard/teacher/subscription" className="mt-3 inline-flex text-xs font-bold text-[var(--ce-primary)] underline">
                {t('payments.changePlanLink')}
              </Link>
            </div>
          </div>

          {hasPaymentInfo && <PaymentInstructionsPanel paymentInfo={paymentInfo} step={1} />}

          <section className="ce-card p-5 space-y-4">
            <div>
              <label className="ce-label">{t('payments.method')}</label>
              <select className="ce-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ce-label">{t('payments.receiptUpload')}</label>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--ce-accent)]/40 bg-[var(--ce-accent)]/5 px-4 py-8">
                <Upload className="h-8 w-8 text-[var(--ce-accent)]" />
                <span className="mt-2 text-sm font-semibold">{t('payments.uploadTap')}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onUpload} disabled={uploading} />
              </label>
              {receiptPreview && (
                <img src={receiptPreview} alt="" className="mt-4 max-h-56 w-full rounded-2xl border object-contain" />
              )}
            </div>
            <textarea
              className="ce-input min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('payments.notesPlaceholder')}
            />
            <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={submitting || !form.receiptImageUrl}>
              {submitting ? t('common.loading') : t('platformSub.submitReceipt')}
            </button>
          </section>
        </form>
      )}

      {pending?.receiptImageUrl && (
        <div className="ce-card border-amber-200 bg-amber-50 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-amber-600" />
          <p className="mt-3 font-extrabold text-amber-900">{t('payments.awaitingApproval')}</p>
          <p className="mt-2 text-sm text-amber-800">{t('payments.awaitingApprovalHint')}</p>
        </div>
      )}
    </div>
  );
}
