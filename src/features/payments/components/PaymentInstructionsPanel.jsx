import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PaymentInstructionsPanel({ paymentInfo = {}, step = 2, className = '' }) {
  const { t } = useTranslation();

  const hasPaymentInfo =
    paymentInfo.vodafoneNumber ||
    paymentInfo.instapayId ||
    paymentInfo.bankDetails ||
    paymentInfo.paymentInstructions;

  if (!hasPaymentInfo) return null;

  return (
    <section className={`ce-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">
          {step}
        </span>
        <Wallet className="h-4 w-4 text-[var(--ce-primary)]" />
        <h3 className="font-extrabold text-[var(--ce-primary)]">{t('payments.instructions')}</h3>
      </div>
      <div className="space-y-3 p-5 text-sm">
        {paymentInfo.vodafoneNumber && (
          <div className="rounded-xl bg-[var(--ce-bg)] px-4 py-3">
            <p className="text-xs font-bold text-[var(--ce-muted)]">{t('payments.vodafone')}</p>
            <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{paymentInfo.vodafoneNumber}</p>
          </div>
        )}
        {paymentInfo.instapayId && (
          <div className="rounded-xl bg-[var(--ce-bg)] px-4 py-3">
            <p className="text-xs font-bold text-[var(--ce-muted)]">{t('payments.instapay')}</p>
            <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{paymentInfo.instapayId}</p>
          </div>
        )}
        {paymentInfo.bankDetails && (
          <div className="rounded-xl bg-[var(--ce-bg)] px-4 py-3 whitespace-pre-wrap">{paymentInfo.bankDetails}</div>
        )}
        {paymentInfo.paymentInstructions && (
          <p className="text-[var(--ce-muted)] whitespace-pre-wrap">{paymentInfo.paymentInstructions}</p>
        )}
      </div>
    </section>
  );
}
