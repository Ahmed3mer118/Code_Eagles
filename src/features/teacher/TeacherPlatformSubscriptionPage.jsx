import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { subscriptionApi, uploadApi } from '../../shared/api/platformApi';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';

const METHODS = [
  { value: 'vodafone_cash', labelKey: 'payments.methods.vodafone' },
  { value: 'instapay', labelKey: 'payments.methods.instapay' },
  { value: 'bank_transfer', labelKey: 'payments.methods.bank' },
];

export default function TeacherPlatformSubscriptionPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ar';
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [form, setForm] = useState({
    method: 'bank_transfer',
    receiptImageUrl: '',
    notes: '',
  });

  const load = async () => {
    const res = await subscriptionApi.mine();
    setData(res);
    if (res.plans?.length && !selectedPlan) {
      setSelectedPlan(res.plans[0].key);
    }
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

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      const url = res.url || res.absoluteUrl || '';
      setForm((prev) => ({ ...prev, receiptImageUrl: url }));
      setReceiptPreview(resolveMediaUrl(url));
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const pendingReq = data?.pending;
    const selected = pendingReq
      ? data?.plans?.find((p) => p.key === pendingReq.plan)
      : data?.plans?.find((p) => p.key === selectedPlan);

    if (!pendingReq && !selected) return;
    if (!form.receiptImageUrl) {
      toast.error(t('platformSub.receiptRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        plan: pendingReq?.plan || selected.key,
        amount: pendingReq?.amount ?? selected.price,
        periodMonths: pendingReq?.periodMonths ?? selected.periodMonths,
        method: form.method,
        receiptImageUrl: form.receiptImageUrl,
        notes: form.notes,
      };

      if (pendingReq) {
        await subscriptionApi.updateMine(payload);
      } else {
        await subscriptionApi.request(payload);
      }
      toast.success(t('platformSub.requestSent'));
      await load();
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;
  }

  const tenant = data?.tenant;
  const academyApproved = data?.academyApproved;
  const hasAccess = data?.hasAccess;
  const pending = data?.pending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('platformSub.title')}
        subtitle={t('platformSub.subtitle', { academy: tenant?.name || '—' })}
      />

      {!academyApproved && pending && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <Clock className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">{t('platformSub.academyPendingTitle')}</p>
              <p className="mt-1 text-sm">{t('platformSub.academyPendingHint')}</p>
              <p className="mt-2 text-sm">{t('platformSub.selectedPlan')}: <strong>{pending.plan}</strong></p>
            </div>
          </div>
          {!pending.receiptImageUrl && (
            <form onSubmit={onSubmit} className="ce-card max-w-xl space-y-4 p-6">
              <h3 className="font-bold text-[var(--ce-primary)]">{t('platformSub.uploadReceiptTitle')}</h3>
              <label className="block">
                <span className="ce-label">{t('payments.receipt')}</span>
                <input type="file" accept="image/*" className="ce-input" onChange={onUpload} disabled={uploading} />
                {receiptPreview && (
                  <img src={receiptPreview} alt="" className="mt-3 max-h-40 rounded-xl border border-[var(--ce-border)]" />
                )}
              </label>
              <button type="submit" className="ce-btn ce-btn-accent" disabled={submitting || !form.receiptImageUrl}>
                {submitting ? t('common.loading') : t('platformSub.submitReceipt')}
              </button>
            </form>
          )}
        </div>
      )}

      {!academyApproved && !pending && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <Clock className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">{t('platformSub.academyPendingTitle')}</p>
            <p className="mt-1 text-sm">{t('platformSub.academyPendingHint')}</p>
          </div>
        </div>
      )}

      {hasAccess && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">{t('platformSub.activeTitle')}</p>
            <p className="mt-1 text-sm">
              {t('platformSub.activeHint', {
                plan: data.active?.plan,
                date: data.active?.expiresAt
                  ? new Date(data.active.expiresAt).toLocaleDateString()
                  : '—',
              })}
            </p>
            <Link to="/dashboard/teacher" className="ce-btn ce-btn-accent mt-3 inline-flex text-sm">
              {t('platformSub.goDashboard')}
            </Link>
          </div>
        </div>
      )}

      {academyApproved && pending && !hasAccess && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
            <Clock className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">{t('platformSub.pendingTitle')}</p>
              <p className="mt-1 text-sm">{t('platformSub.pendingHint')}</p>
              <StatusBadge status="pending" label={pending.plan} />
            </div>
          </div>

          {!pending.receiptImageUrl && (
            <form onSubmit={onSubmit} className="ce-card max-w-xl space-y-4 p-6">
              <h3 className="font-bold text-[var(--ce-primary)]">{t('platformSub.uploadReceiptTitle')}</h3>
              <p className="text-sm text-[var(--ce-muted)]">{t('platformSub.uploadReceiptHint')}</p>
              <label className="block">
                <span className="ce-label">{t('payments.method')}</span>
                <select className="ce-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="ce-label">{t('payments.receipt')}</span>
                <input type="file" accept="image/*" className="ce-input" onChange={onUpload} disabled={uploading} />
                {receiptPreview && (
                  <img src={receiptPreview} alt="" className="mt-3 max-h-40 rounded-xl border border-[var(--ce-border)]" />
                )}
              </label>
              <button type="submit" className="ce-btn ce-btn-accent" disabled={submitting || !form.receiptImageUrl}>
                {submitting ? t('common.loading') : t('platformSub.submitReceipt')}
              </button>
            </form>
          )}
        </div>
      )}

      {academyApproved && !hasAccess && !pending && (
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.choosePlan')}</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(data?.plans || []).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedPlan(item.key)}
                  className={`rounded-2xl border p-5 text-start transition ${
                    selectedPlan === item.key
                      ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10 shadow-sm'
                      : 'border-[var(--ce-border)] bg-white hover:border-[var(--ce-primary)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-[var(--ce-primary)]">{item.name?.[lang] || item.key}</p>
                    {selectedPlan === item.key && <CheckCircle2 className="h-5 w-5 text-[var(--ce-accent)]" />}
                  </div>
                  <p className="mt-2 text-2xl font-black text-[var(--ce-accent)]">
                    {item.price} {t('payments.currency')}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ce-muted)]">
                    {t('platformSub.perMonth', { months: item.periodMonths })}
                  </p>
                  <p className="mt-3 text-sm text-[var(--ce-muted)]">{item.description?.[lang]}</p>
                  <ul className="mt-3 space-y-1 text-xs">
                    {(item.features || []).map((feature) => (
                      <li key={feature}>• {t(`features.${feature}`, feature)}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          <div className="ce-card space-y-4 p-6">
            <div className="flex items-start gap-2 rounded-xl bg-[var(--ce-bg)] p-4 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
              <p>{t('platformSub.paymentHint')}</p>
            </div>

            <label className="block">
              <span className="ce-label">{t('payments.method')}</span>
              <select
                className="ce-input"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="ce-label">{t('payments.receipt')}</span>
              <input type="file" accept="image/*" className="ce-input" onChange={onUpload} disabled={uploading} />
              {receiptPreview && (
                <img src={receiptPreview} alt="" className="mt-3 max-h-40 rounded-xl border border-[var(--ce-border)]" />
              )}
            </label>

            <label className="block">
              <span className="ce-label">{t('payments.notes')}</span>
              <textarea
                className="ce-input min-h-[80px]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <button type="submit" className="ce-btn ce-btn-accent w-full" disabled={submitting || !plan}>
              {submitting ? t('common.loading') : t('platformSub.submitRequest')}
            </button>
          </div>
        </form>
      )}

      {(data?.history || []).length > 0 && (
        <div className="ce-card p-6">
          <h3 className="mb-4 font-extrabold text-[var(--ce-primary)]">{t('platformSub.history')}</h3>
          <ul className="divide-y divide-[var(--ce-border)]">
            {data.history.map((item) => (
              <li key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-bold">{item.plan}</p>
                  <p className="text-[var(--ce-muted)]">
                    {item.amount} {t('payments.currency')} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={item.status === 'approved' ? 'approved' : item.status} label={item.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
