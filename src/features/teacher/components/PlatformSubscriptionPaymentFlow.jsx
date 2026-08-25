import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  FileUp,
  ShieldAlert,
  Smartphone,
  Upload,
  Wallet,
} from 'lucide-react';
import PaymentInstructionsPanel from '../../payments/components/PaymentInstructionsPanel';

export const PAYMENT_METHODS = [
  { value: 'vodafone_cash', labelKey: 'payments.methods.vodafone', icon: Smartphone },
  { value: 'instapay', labelKey: 'payments.methods.instapay', icon: Wallet },
  { value: 'bank_transfer', labelKey: 'payments.methods.bank', icon: CreditCard },
];

export function SubscriptionNavTabs({ t, active = 'plan' }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to="/dashboard/teacher/subscription"
        className={`ce-btn text-sm ${active === 'plan' ? 'ce-btn-primary' : 'ce-btn-ghost'}`}
      >
        {t('platformSub.planNav')}
      </Link>
      <Link
        to="/dashboard/teacher/platform-payments"
        className={`ce-btn text-sm ${active === 'payment' ? 'ce-btn-primary' : 'ce-btn-ghost'}`}
      >
        <CreditCard className="h-4 w-4" />
        {t('platformSub.paymentNav')}
      </Link>
    </div>
  );
}

export function SelectedPlanSummary({ plan, lang, t, amountDue, requestType, previousPlan }) {
  if (!plan) return null;
  const displayAmount = amountDue ?? plan.price ?? 0;
  return (
    <div className="rounded-xl border border-[var(--ce-accent)]/30 bg-gradient-to-br from-[var(--ce-accent)]/8 to-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--ce-muted)]">
        {t('platformSub.selectedPlan')}
      </p>
      <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{plan.name?.[lang] || plan.key}</p>
      {previousPlan && previousPlan !== plan.key && (
        <p className="mt-1 text-xs text-[var(--ce-muted)]">
          {previousPlan} → {plan.key}
          {requestType === 'upgrade' && displayAmount > 0 && (
            <span className="ms-1 font-semibold text-[var(--ce-primary)]"> · {t('platformSub.upgradeDifference')}</span>
          )}
        </p>
      )}
      <p className="mt-2 text-2xl font-black text-[var(--ce-accent)]">
        {displayAmount}{' '}
        <span className="text-sm font-semibold">{t('payments.currency')}</span>
      </p>
    </div>
  );
}

function MethodPicker({ form, setForm, t, disabled = false }) {
  return (
    <div>
      <span className="ce-label">{t('payments.method')}</span>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {PAYMENT_METHODS.map(({ value, labelKey, icon: Icon }) => {
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
  requireReceipt = true,
  step = 3,
  children,
}) {
  return (
    <section className="ce-card overflow-hidden lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)] text-xs font-bold text-white">
          {step}
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

        {children}

        {requireReceipt ? (
          <>
            <MethodPicker form={form} setForm={setForm} t={t} disabled={disabled} />
            <ReceiptUploadField
              receiptPreview={receiptPreview}
              onUpload={onUpload}
              uploading={uploading}
              t={t}
              disabled={disabled}
            />
          </>
        ) : null}

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
          disabled={submitting || (requireReceipt && !form.receiptImageUrl) || disabled}
        >
          <CreditCard className="h-4 w-4" />
          {submitting ? t('common.loading') : (submitLabel || t('platformSub.submitReceipt'))}
        </button>
      </div>
    </section>
  );
}

export function PeriodModeSelector({ periodMode, setPeriodMode, t, step = 2 }) {
  return (
    <section className="ce-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">
          {step}
        </span>
        <h3 className="font-extrabold text-[var(--ce-primary)]">{t('platformSub.periodModeTitle')}</h3>
      </div>
      <div className="space-y-3 p-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--ce-border)] p-4">
          <input
            type="radio"
            name="periodMode"
            checked={periodMode === 'extend'}
            onChange={() => setPeriodMode('extend')}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold">{t('platformSub.periodModeExtend')}</span>
            <span className="text-sm text-[var(--ce-muted)]">{t('platformSub.periodModeExtendHint')}</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--ce-border)] p-4">
          <input
            type="radio"
            name="periodMode"
            checked={periodMode === 'reset'}
            onChange={() => setPeriodMode('reset')}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold">{t('platformSub.periodModeReset')}</span>
            <span className="text-sm text-[var(--ce-muted)]">{t('platformSub.periodModeResetHint')}</span>
          </span>
        </label>
      </div>
    </section>
  );
}

export function AwaitingApprovalBanner({ t }) {
  return (
    <div className="ce-card border-amber-200 bg-amber-50 p-5 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-amber-600" />
      <p className="mt-3 font-extrabold text-amber-900">{t('payments.awaitingApproval')}</p>
      <p className="mt-2 text-sm text-amber-800">{t('payments.awaitingApprovalHint')}</p>
    </div>
  );
}

export default function PlatformSubscriptionPaymentFlow({
  t,
  paymentInfo = {},
  onSubmit,
  form,
  setForm,
  receiptPreview,
  onUpload,
  uploading,
  submitting,
  planSummary,
  showNotes = true,
  submitLabel,
  disabled = false,
  requireReceipt = true,
  periodModeBlock = null,
  instructionsStep = 1,
  uploadStep = 3,
  freePlanNote = null,
}) {
  const hasPaymentInfo =
    paymentInfo?.vodafoneNumber ||
    paymentInfo?.instapayId ||
    paymentInfo?.bankDetails ||
    paymentInfo?.paymentInstructions;

  const showInstructions = hasPaymentInfo && (requireReceipt || freePlanNote);

  return (
    <div className={`grid gap-6 ${showInstructions || periodModeBlock ? 'lg:grid-cols-5' : ''}`}>
      <div className={`space-y-4 ${showInstructions || periodModeBlock ? 'lg:col-span-2' : ''}`}>
        {showInstructions && (
          <PaymentInstructionsPanel paymentInfo={paymentInfo} step={instructionsStep} />
        )}
        {periodModeBlock}
      </div>

      <form
        onSubmit={onSubmit}
        className={showInstructions || periodModeBlock ? 'lg:col-span-3' : ''}
      >
        <PaymentFormCard
          t={t}
          form={form}
          setForm={setForm}
          receiptPreview={receiptPreview}
          onUpload={onUpload}
          uploading={uploading}
          submitting={submitting}
          onSubmit={onSubmit}
          showNotes={showNotes}
          submitLabel={submitLabel}
          planSummary={planSummary}
          disabled={disabled}
          requireReceipt={requireReceipt}
          step={uploadStep}
        >
          {freePlanNote}
        </PaymentFormCard>
      </form>
    </div>
  );
}
