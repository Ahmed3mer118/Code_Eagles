import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileUp,
  History,
  ShieldAlert,
  Smartphone,
  Upload,
  Wallet,
} from 'lucide-react';
import { subscriptionApi, uploadApi, FEATURE_KEYS } from '../../shared/api/platformApi';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import PageHeader from '../../shared/ui/PageHeader';
import StatusBadge from '../../shared/ui/StatusBadge';
import ContentLoader from '../../shared/ui/ContentLoader';
import PaymentInstructionsPanel from '../payments/components/PaymentInstructionsPanel';

const METHODS = [
  { value: 'vodafone_cash', labelKey: 'payments.methods.vodafone', icon: Smartphone },
  { value: 'instapay', labelKey: 'payments.methods.instapay', icon: Wallet },
  { value: 'bank_transfer', labelKey: 'payments.methods.bank', icon: Building2 },
];

function StatusBanner({ tone, icon: Icon, title, children }) {
  const tones = {
    amber: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-900',
    blue: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white text-blue-900',
    emerald: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-900',
  };

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">{children ?? <p className="font-bold">{title}</p>}</div>
    </div>
  );
}

function PlanCard({ plan, lang, selected, onSelect, t }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex h-full flex-col rounded-2xl border-2 p-5 text-start transition-all duration-200 ${
        selected
          ? 'border-[var(--ce-accent)] bg-gradient-to-br from-[var(--ce-accent)]/12 to-white shadow-md ring-2 ring-[var(--ce-accent)]/20'
          : 'border-[var(--ce-border)] bg-white hover:-translate-y-0.5 hover:border-[var(--ce-primary)]/25 hover:shadow-md'
      }`}
    >
      {selected && (
        <span className="absolute end-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)] text-white shadow-sm">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      )}

      <p className="pe-10 text-lg font-extrabold text-[var(--ce-primary)]">
        {plan.name?.[lang] || plan.key}
      </p>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-black text-[var(--ce-accent)]">{plan.price}</span>
        <span className="text-sm font-semibold text-[var(--ce-muted)]">{t('payments.currency')}</span>
      </div>

      <p className="mt-1 text-xs text-[var(--ce-muted)]">
        {t('platformSub.perMonth', { months: plan.periodMonths })}
      </p>

      {plan.description?.[lang] && (
        <p className="mt-4 text-sm leading-relaxed text-[var(--ce-muted)]">{plan.description[lang]}</p>
      )}

      {(plan.features || []).length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-[var(--ce-border)] pt-4">
          {[...(plan.features || [])]
            .sort((a, b) => FEATURE_KEYS.indexOf(a) - FEATURE_KEYS.indexOf(b))
            .map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-[var(--ce-primary)]">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ce-accent)]" strokeWidth={3} />
              <span>{t(`features.${feature}`, feature)}</span>
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}

function MethodPicker({ form, setForm, t, disabled = false }) {
  return (
    <div>
      <span className="ce-label">{t('payments.method')}</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {METHODS.map(({ value, labelKey, icon: Icon }) => {
          const active = form.method === value;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => setForm((prev) => ({ ...prev, method: value }))}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition ${
                active
                  ? 'border-[var(--ce-accent)] bg-[var(--ce-accent)]/10 text-[var(--ce-primary)] shadow-sm'
                  : 'border-[var(--ce-border)] bg-white hover:border-[var(--ce-primary)]/20 hover:bg-[var(--ce-bg)]'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-[var(--ce-accent)]' : 'text-[var(--ce-muted)]'}`} />
              <span className="text-xs font-bold leading-tight">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReceiptUploadField({ receiptPreview, onUpload, uploading, t, disabled = false }) {
  return (
    <div>
      <span className="ce-label">{t('payments.receiptUpload')}</span>
      <label
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition ${
          disabled
            ? 'border-[var(--ce-border)] bg-[var(--ce-bg)]/50 opacity-60'
            : 'border-[var(--ce-accent)]/40 bg-[var(--ce-accent)]/5 hover:border-[var(--ce-accent)]'
        }`}
      >
        <Upload className="h-8 w-8 text-[var(--ce-accent)]" />
        <span className="mt-2 text-sm font-semibold text-[var(--ce-primary)]">{t('payments.uploadTap')}</span>
        <span className="mt-1 text-xs text-[var(--ce-muted)]">{t('payments.uploadFormats')}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onUpload}
          disabled={uploading || disabled}
        />
      </label>
      {uploading && <p className="mt-2 text-sm text-[var(--ce-muted)]">{t('payments.uploading')}</p>}
      {receiptPreview && (
        <img
          src={receiptPreview}
          alt=""
          className="mt-4 max-h-56 w-full rounded-2xl border border-[var(--ce-border)] bg-[var(--ce-bg)] object-contain p-2"
        />
      )}
    </div>
  );
}

function PaymentFormCard({
  t,
  form,
  setForm,
  receiptPreview,
  onUpload,
  uploading,
  submitting,
  onSubmit,
  showNotes = true,
  submitLabel,
  planSummary,
  disabled = false,
}) {
  return (
    <section className="ce-card overflow-hidden lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)] text-xs font-bold text-white">
          3
        </span>
        <FileUp className="h-4 w-4 text-[var(--ce-primary)]" />
        <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.uploadReceiptTitle')}</h3>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-sm leading-relaxed text-[var(--ce-muted)]">{t('platformSub.uploadReceiptHint')}</p>

        {planSummary}

        <div className="flex items-start gap-2 rounded-xl bg-[var(--ce-bg)] p-4 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ce-accent)]" />
          <p className="text-[var(--ce-muted)]">{t('platformSub.paymentHint')}</p>
        </div>

        <MethodPicker form={form} setForm={setForm} t={t} disabled={disabled} />
        <ReceiptUploadField
          receiptPreview={receiptPreview}
          onUpload={onUpload}
          uploading={uploading}
          t={t}
          disabled={disabled}
        />

        {showNotes && (
          <label className="block">
            <span className="ce-label">{t('payments.notes')}</span>
            <textarea
              className="ce-input mt-1 min-h-[90px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t('payments.notesPlaceholder')}
              disabled={disabled}
            />
          </label>
        )}

        <button
          type="submit"
          className="ce-btn ce-btn-primary flex w-full items-center justify-center gap-2"
          disabled={submitting || !form.receiptImageUrl || disabled}
        >
          <CreditCard className="h-4 w-4" />
          {submitting ? t('common.loading') : (submitLabel || t('platformSub.submitReceipt'))}
        </button>
      </div>
    </section>
  );
}

function SelectedPlanSummary({ plan, lang, t }) {
  if (!plan) return null;
  return (
    <div className="rounded-xl border border-[var(--ce-accent)]/30 bg-gradient-to-br from-[var(--ce-accent)]/8 to-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
        {t('platformSub.selectedPlan')}
      </p>
      <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{plan.name?.[lang] || plan.key}</p>
      <p className="mt-2 text-2xl font-black text-[var(--ce-accent)]">
        {plan.price} <span className="text-sm font-semibold">{t('payments.currency')}</span>
      </p>
    </div>
  );
}

function ReceiptUploadBlock(props) {
  const { t, paymentInfo, onSubmit, ...formProps } = props;
  const hasPaymentInfo =
    paymentInfo?.vodafoneNumber ||
    paymentInfo?.instapayId ||
    paymentInfo?.bankDetails ||
    paymentInfo?.paymentInstructions;

  return (
    <div className={`grid gap-6 ${hasPaymentInfo ? 'lg:grid-cols-5' : ''}`}>
      {hasPaymentInfo && (
        <div className="space-y-4 lg:col-span-2">
          <PaymentInstructionsPanel paymentInfo={paymentInfo} step={1} />
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className={hasPaymentInfo ? 'lg:col-span-3' : ''}
      >
        <PaymentFormCard t={t} onSubmit={onSubmit} {...formProps} />
      </form>
    </div>
  );
}

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
    method: 'vodafone_cash',
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

  const paymentInfo = data?.paymentInfo || {};

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
    return <ContentLoader />;
  }

  const tenant = data?.tenant;
  const academyApproved = data?.academyApproved;
  const hasAccess = data?.hasAccess;
  const pending = data?.pending;
  const pendingPlanDoc = pending ? data?.plans?.find((p) => p.key === pending.plan) : null;

  const formBlockProps = {
    t,
    form,
    setForm,
    receiptPreview,
    onUpload,
    uploading,
    submitting,
    onSubmit,
    showNotes: !pending,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title={t('platformSub.title')}
        subtitle={t('platformSub.subtitle', { academy: tenant?.name || '—' })}
      />

      {!academyApproved && pending && (
        <div className="space-y-6">
          <StatusBanner tone="amber" icon={Clock}>
            <p className="font-bold">{t('platformSub.academyPendingTitle')}</p>
            <p className="mt-1 text-sm opacity-90">{t('platformSub.academyPendingHint')}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1.5 text-sm">
              <span className="text-[var(--ce-muted)]">{t('platformSub.selectedPlan')}:</span>
              <strong>{pendingPlanDoc?.name?.[lang] || pending.plan}</strong>
            </div>
          </StatusBanner>

          {!pending.receiptImageUrl && (
            <ReceiptUploadBlock
              {...formBlockProps}
              paymentInfo={paymentInfo}
              showNotes={false}
              planSummary={<SelectedPlanSummary plan={pendingPlanDoc || { key: pending.plan, price: pending.amount, name: { [lang]: pending.plan } }} lang={lang} t={t} />}
            />
          )}
        </div>
      )}

      {!academyApproved && !pending && (
        <StatusBanner tone="amber" icon={Clock}>
          <p className="font-bold">{t('platformSub.academyPendingTitle')}</p>
          <p className="mt-1 text-sm opacity-90">{t('platformSub.academyPendingHint')}</p>
        </StatusBanner>
      )}

      {hasAccess && (
        <StatusBanner tone="emerald" icon={CheckCircle2}>
          <p className="font-bold">{t('platformSub.activeTitle')}</p>
          <p className="mt-1 text-sm opacity-90">
            {t('platformSub.activeHint', {
              plan: data.active?.plan,
              date: data.active?.expiresAt
                ? new Date(data.active.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
                : '—',
            })}
          </p>
          <Link to="/dashboard/teacher" className="ce-btn ce-btn-accent mt-4 inline-flex text-sm">
            {t('platformSub.goDashboard')}
          </Link>
        </StatusBanner>
      )}

      {academyApproved && pending && !hasAccess && (
        <div className="space-y-6">
          <StatusBanner tone="blue" icon={Clock}>
            <p className="font-bold">{t('platformSub.pendingTitle')}</p>
            <p className="mt-1 text-sm opacity-90">{t('platformSub.pendingHint')}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status="pending" label={pendingPlanDoc?.name?.[lang] || pending.plan} />
              {pending.amount != null && (
                <span className="rounded-lg bg-white/70 px-3 py-1 text-sm font-bold">
                  {pending.amount} {t('payments.currency')}
                </span>
              )}
            </div>
          </StatusBanner>

          {!pending.receiptImageUrl && (
            <ReceiptUploadBlock
              {...formBlockProps}
              paymentInfo={paymentInfo}
              showNotes={false}
              planSummary={<SelectedPlanSummary plan={pendingPlanDoc || { key: pending.plan, price: pending.amount, name: { [lang]: pending.plan } }} lang={lang} t={t} />}
            />
          )}
        </div>
      )}

      {academyApproved && !hasAccess && !pending && (
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Step 1 — Plans */}
          <section className="ce-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">
                1
              </span>
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.choosePlan')}</h3>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
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

          {/* Steps 2 & 3 */}
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <PaymentInstructionsPanel paymentInfo={paymentInfo} step={2} />
              <SelectedPlanSummary plan={plan} lang={lang} t={t} />
            </div>

            <div className="lg:col-span-3">
              <PaymentFormCard
                {...formBlockProps}
                planSummary={null}
                submitLabel={t('platformSub.submitRequest')}
              />
            </div>
          </div>
        </form>
      )}

      {(data?.history || []).length > 0 && (
        <section className="ce-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3.5">
            <History className="h-4 w-4 text-[var(--ce-primary)]" />
            <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.history')}</h3>
          </div>
          <ul className="divide-y divide-[var(--ce-border)]">
            {data.history.map((item) => (
              <li
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--ce-bg)]/40"
              >
                <div>
                  <p className="font-bold capitalize text-[var(--ce-primary)]">{item.plan}</p>
                  <p className="mt-0.5 text-sm text-[var(--ce-muted)]">
                    {item.amount} {t('payments.currency')}
                    <span className="mx-2 opacity-40">·</span>
                    {new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <StatusBadge
                  status={item.status === 'approved' ? 'approved' : item.status}
                  label={t(`payments.status.${item.status}`, item.status)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
