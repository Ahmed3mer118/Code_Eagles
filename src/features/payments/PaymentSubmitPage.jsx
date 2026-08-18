import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  CreditCard,
  FileUp,
  Layers,
  Receipt,
  Upload,
} from 'lucide-react';
import { groupApi, paymentApi, promoApi, uploadApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import getApiErrorMessage from '../../shared/utils/apiError';
import PaymentInstructionsPanel from './components/PaymentInstructionsPanel';

const PACKAGES = [
  { value: 'lectures_only', labelKey: 'payments.lecturesOnly' },
  { value: 'exams_only', labelKey: 'payments.examsOnly' },
  { value: 'lectures_and_exams', labelKey: 'payments.fullPackage' },
];

const METHODS = [
  { value: 'vodafone_cash', labelKey: 'payments.methods.vodafone' },
  { value: 'instapay', labelKey: 'payments.methods.instapay' },
  { value: 'bank_transfer', labelKey: 'payments.methods.bank' },
];

export default function PaymentSubmitPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [enrollments, setEnrollments] = useState([]);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoPreview, setPromoPreview] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [form, setForm] = useState({
    enrollmentId: params.get('enrollment') || '',
    packageType: 'lectures_and_exams',
    amount: 0,
    receiptImageUrl: '',
    method: 'vodafone_cash',
    notes: '',
  });

  const loadEnrollments = async () => {
    const [enrollmentData, paymentData] = await Promise.all([
      groupApi.myEnrollments(),
      paymentApi.listMine().catch(() => ({ paymentRequests: [] })),
    ]);
    setEnrollments(enrollmentData.enrollments || []);
    setTenantInfo(enrollmentData.tenant || null);
    setPaymentRequests(paymentData.paymentRequests || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadEnrollments();
      } catch (err) {
        toast.error(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const paymentByEnrollment = useMemo(() => {
    const map = {};
    paymentRequests.forEach((req) => {
      const key = req.enrollmentId?._id || req.enrollmentId;
      if (key) map[String(key)] = req;
    });
    return map;
  }, [paymentRequests]);

  const payableEnrollments = useMemo(
    () => enrollments.filter((en) => {
      if (!['pending', 'active'].includes(en.status)) return false;
      const payment = paymentByEnrollment[en._id];
      if (payment && ['pending', 'under_review'].includes(payment.status)) return false;
      return true;
    }),
    [enrollments, paymentByEnrollment]
  );

  const selectedPayment = paymentByEnrollment[form.enrollmentId];
  const paymentLocked = ['pending', 'under_review'].includes(selectedPayment?.status);

  const selectedEnrollment = useMemo(
    () => payableEnrollments.find((en) => en._id === form.enrollmentId),
    [payableEnrollments, form.enrollmentId]
  );

  const finalAmount = promoPreview?.finalAmount ?? form.amount;
  const isFreePayment = finalAmount <= 0;
  const paymentInfo = tenantInfo?.paymentInfo || {};
  const hasPaymentInfo = paymentInfo.vodafoneNumber || paymentInfo.instapayId || paymentInfo.bankDetails || paymentInfo.paymentInstructions;

  const planLabel = selectedEnrollment
    ? (selectedEnrollment.planName
      || t(PACKAGES.find((p) => p.value === selectedEnrollment.packageType)?.labelKey || 'payments.fullPackage'))
    : '';

  useEffect(() => {
    setPromoPreview(null);
    setPromoCode('');
    setPromoError('');
  }, [form.enrollmentId]);

  useEffect(() => {
    if (!selectedEnrollment) return;
    setForm((prev) => ({
      ...prev,
      packageType: selectedEnrollment.packageType,
      amount: selectedEnrollment.amountDue ?? 0,
    }));
  }, [selectedEnrollment]);

  useEffect(() => {
    if (!form.enrollmentId && payableEnrollments.length === 1) {
      setForm((prev) => ({ ...prev, enrollmentId: payableEnrollments[0]._id }));
    }
  }, [form.enrollmentId, payableEnrollments]);

  useEffect(() => {
    if (!promoPreview?.validUntil) return undefined;
    const timer = setInterval(() => {
      if (new Date(promoPreview.validUntil).getTime() <= Date.now()) {
        setPromoPreview(null);
        setPromoError(t('promo.holdExpired'));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [promoPreview?.validUntil, t]);

  useEffect(() => {
    const code = promoCode.trim();
    if (!code || !form.enrollmentId || !form.amount || form.amount <= 0 || paymentLocked) {
      setPromoPreview(null);
      setPromoError('');
      return undefined;
    }

    const timer = setTimeout(async () => {
      setValidatingPromo(true);
      try {
        const data = await promoApi.validate({
          code,
          amount: form.amount,
          groupId: selectedEnrollment?.groupId?._id || selectedEnrollment?.groupId,
          paymentPlanId: selectedEnrollment?.paymentPlanId?._id || selectedEnrollment?.paymentPlanId,
        });
        setPromoPreview(data);
        setPromoError('');
      } catch (err) {
        setPromoPreview(null);
        setPromoError(err?.response?.data?.message || err?.message || t('promo.invalid'));
      } finally {
        setValidatingPromo(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [promoCode, form.amount, form.enrollmentId, paymentLocked, selectedEnrollment, t]);

  const onFileChange = async (file) => {
    if (!file) return;
    setUploading(true);
    setReceiptPreview(URL.createObjectURL(file));
    try {
      const data = await uploadApi.uploadReceipt(file);
      setForm((prev) => ({ ...prev, receiptImageUrl: data.url || data.absoluteUrl }));
      toast.success(t('payments.receiptUploaded'));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setReceiptPreview('');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.enrollmentId) {
      toast.error(t('payments.enrollmentRequired'));
      return;
    }
    if (!isFreePayment && !form.receiptImageUrl) {
      toast.error(t('payments.receiptRequired'));
      return;
    }
    if (paymentLocked) {
      toast.error(t('payments.alreadySubmitted'));
      return;
    }
    if (promoCode.trim() && !promoPreview) {
      toast.error(promoError || t('promo.invalid'));
      return;
    }
    setSubmitting(true);
    try {
      const planId = selectedEnrollment?.paymentPlanId?._id || selectedEnrollment?.paymentPlanId;
      const payload = {
        enrollmentId: form.enrollmentId,
        packageType: form.packageType,
        amount: form.amount,
        receiptImageUrl: form.receiptImageUrl,
        method: form.method,
        notes: form.notes,
        promoCode: promoPreview?.promoCode || undefined,
      };
      if (planId) payload.paymentPlanId = planId;

      const data = await paymentApi.create(payload);
      setSubmittedRequest(data.paymentRequest || null);
      toast.success(data.message || t('payments.submitSuccess'));
      await loadEnrollments();
      setForm({
        enrollmentId: '',
        packageType: 'lectures_and_exams',
        amount: 0,
        receiptImageUrl: '',
        method: 'vodafone_cash',
        notes: '',
      });
      setReceiptPreview('');
      setPromoCode('');
      setPromoPreview(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t('payments.submitTitle')} subtitle={t('payments.paymentOnlyHint')} />

      <div className="flex flex-wrap gap-2">
        <Link to="/dashboard/student/subscription" className="ce-btn ce-btn-ghost text-sm">
          <Layers className="h-4 w-4" />
          {t('dashboard.subscription')}
        </Link>
        <Link to="/dashboard/student/payments" className="ce-btn ce-btn-primary text-sm">
          <CreditCard className="h-4 w-4" />
          {t('dashboard.payments')}
        </Link>
      </div>

      {submittedRequest && (
        <div className="ce-card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-lg font-extrabold text-emerald-900">{t('payments.submitSuccess')}</h3>
              <p className="mt-1 text-sm text-emerald-800">{t('payments.submitSuccessDetail')}</p>
            </div>
          </div>
        </div>
      )}

      {payableEnrollments.length === 0 ? (
        <div className="ce-card p-10 text-center">
          <Receipt className="mx-auto h-12 w-12 text-[var(--ce-muted)]/40" />
          <p className="mt-4 text-[var(--ce-muted)]">{t('payments.noPayableEnrollment')}</p>
          <Link to="/dashboard/student/subscription" className="ce-btn ce-btn-accent mt-5 inline-flex">
            {t('dashboard.subscription')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <section className="ce-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">1</span>
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('payments.stepEnrollment')}</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="ce-label">{t('payments.enrollment')}</label>
                <select
                  className="ce-input"
                  value={form.enrollmentId}
                  onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })}
                  required
                >
                  <option value="">{t('payments.selectEnrollment')}</option>
                  {payableEnrollments.map((en) => (
                    <option key={en._id} value={en._id}>
                      {en.groupId?.name} — {en.groupId?.subjectId?.name}
                      {en.planName ? ` (${en.planName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEnrollment && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm">
                  <p className="text-xs font-bold uppercase text-emerald-800">{t('payments.selectedPlanReadonly')}</p>
                  <p className="mt-1 font-extrabold text-[var(--ce-primary)]">{planLabel}</p>
                  <p className="mt-1 text-xs text-[var(--ce-muted)]">{selectedEnrollment.groupId?.name}</p>
                  <p className="mt-3 text-2xl font-extrabold text-emerald-700">
                    {form.amount} {t('academy.currency')}
                  </p>
                  <Link
                    to={`/dashboard/student/subscription?enrollment=${selectedEnrollment._id}`}
                    className="mt-3 inline-flex text-xs font-bold text-[var(--ce-primary)] underline"
                  >
                    {t('payments.changePlanLink')}
                  </Link>
                </div>
              )}
            </div>
          </section>

          {selectedEnrollment && hasPaymentInfo && (
            <PaymentInstructionsPanel paymentInfo={paymentInfo} step={2} />
          )}

          <section className="ce-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)] text-xs font-bold text-white">
                {hasPaymentInfo ? '3' : '2'}
              </span>
              <FileUp className="h-4 w-4 text-[var(--ce-primary)]" />
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('payments.stepUpload')}</h3>
            </div>
            <div className="space-y-4 p-5">
              {selectedEnrollment && form.amount > 0 && (
                <div>
                  <label className="ce-label">{t('promo.code')}</label>
                  <input
                    className="ce-input uppercase"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder={t('promo.placeholder')}
                  />
                  {validatingPromo && <p className="mt-2 text-xs text-[var(--ce-muted)]">{t('promo.checking')}</p>}
                  {promoError && !validatingPromo && (
                    <p className="mt-2 text-xs font-semibold text-red-600">{promoError}</p>
                  )}
                  {promoPreview && !promoError && (
                    <p className="mt-2 text-xs font-semibold text-emerald-700">{t('promo.applied')}</p>
                  )}
                </div>
              )}

              <div>
                <label className="ce-label">{t('payments.method')}</label>
                <select
                  className="ce-input"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  disabled={!selectedEnrollment}
                >
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
                  ))}
                </select>
              </div>

              {!isFreePayment && (
                <div>
                  <label className="ce-label">{t('payments.receiptUpload')}</label>
                  <label className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 transition ${
                    !selectedEnrollment
                      ? 'border-[var(--ce-border)] bg-[var(--ce-bg)]/50 opacity-60'
                      : 'border-[var(--ce-accent)]/40 bg-[var(--ce-accent)]/5 hover:border-[var(--ce-accent)]'
                  }`}>
                    <Upload className="h-8 w-8 text-[var(--ce-accent)]" />
                    <span className="mt-2 text-sm font-semibold text-[var(--ce-primary)]">{t('payments.uploadTap')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => onFileChange(e.target.files?.[0])}
                      disabled={uploading || !selectedEnrollment}
                    />
                  </label>
                  {uploading && <p className="mt-2 text-sm text-[var(--ce-muted)]">{t('payments.uploading')}</p>}
                  {receiptPreview && (
                    <img
                      src={receiptPreview.startsWith('blob:') ? receiptPreview : resolveMediaUrl(receiptPreview)}
                      alt=""
                      className="mt-4 max-h-56 w-full rounded-2xl border border-[var(--ce-border)] object-contain"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="ce-label">{t('payments.notes')}</label>
                <textarea
                  className="ce-input min-h-[90px]"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  disabled={!selectedEnrollment}
                  placeholder={t('payments.notesPlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="ce-btn ce-btn-primary w-full"
                disabled={submitting || uploading || !selectedEnrollment || (!isFreePayment && !form.receiptImageUrl)}
              >
                <CreditCard className="h-4 w-4" />
                {submitting ? t('common.loading') : t('payments.submit')}
              </button>
            </div>
          </section>
        </form>
      )}
    </div>
  );
}
