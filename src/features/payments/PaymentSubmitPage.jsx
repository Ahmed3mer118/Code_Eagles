import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  CreditCard,
  FileUp,
  Receipt,
  Upload,
  Wallet,
} from 'lucide-react';
import { groupApi, paymentApi, promoApi, uploadApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import resolveMediaUrl from '../../shared/utils/mediaUrl';
import getApiErrorMessage from '../../shared/utils/apiError';

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

  const pendingEnrollments = useMemo(
    () => enrollments.filter((en) => en.status === 'pending'),
    [enrollments]
  );

  const paymentByEnrollment = useMemo(() => {
    const map = {};
    paymentRequests.forEach((req) => {
      const key = req.enrollmentId?._id || req.enrollmentId;
      if (key) map[String(key)] = req;
    });
    return map;
  }, [paymentRequests]);

  const selectedPayment = paymentByEnrollment[form.enrollmentId];
  const paymentLocked = ['pending', 'under_review', 'approved'].includes(selectedPayment?.status);

  const selectedEnrollment = useMemo(
    () => pendingEnrollments.find((en) => en._id === form.enrollmentId),
    [pendingEnrollments, form.enrollmentId]
  );

  const finalAmount = promoPreview?.finalAmount ?? form.amount;
  const isFreePayment = finalAmount <= 0;
  const paymentInfo = tenantInfo?.paymentInfo || {};
  const hasPaymentInfo = paymentInfo.vodafoneNumber || paymentInfo.instapayId || paymentInfo.bankDetails || paymentInfo.paymentInstructions;

  useEffect(() => {
    setPromoPreview(null);
    setPromoCode('');
    setPromoError('');
  }, [form.enrollmentId]);

  useEffect(() => {
    if (selectedEnrollment) {
      setForm((prev) => ({
        ...prev,
        packageType: selectedEnrollment.packageType,
        amount: selectedEnrollment.amountDue || 0,
      }));
    }
  }, [selectedEnrollment]);

  useEffect(() => {
    if (!form.enrollmentId && pendingEnrollments.length === 1) {
      setForm((prev) => ({ ...prev, enrollmentId: pendingEnrollments[0]._id }));
    }
  }, [form.enrollmentId, pendingEnrollments]);

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
    if (promoPreview?.validUntil && new Date(promoPreview.validUntil).getTime() <= Date.now()) {
      setPromoPreview(null);
      toast.error(t('promo.holdExpired'));
      return;
    }
    setSubmitting(true);
    try {
      const data = await paymentApi.create({
        enrollmentId: form.enrollmentId,
        packageType: form.packageType,
        amount: form.amount,
        receiptImageUrl: form.receiptImageUrl,
        method: form.method,
        notes: form.notes,
        promoCode: promoPreview?.promoCode || undefined,
      });
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
      setPromoError('');
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t('payments.submitTitle')} subtitle={t('payments.submitHint')} />

      {submittedRequest && (
        <div className="ce-card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold text-emerald-900">{t('payments.submitSuccess')}</h3>
              <p className="mt-1 text-sm text-emerald-800">{t('payments.submitSuccessDetail')}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="font-bold text-emerald-900">
                  {t('payments.amount')}: {submittedRequest.amount} {t('academy.currency')}
                </span>
                <span className="text-emerald-800">
                  {t('common.status')}: {t(`payments.status.${submittedRequest.status}`, submittedRequest.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingEnrollments.length === 0 ? (
        <div className="ce-card p-10 text-center">
          <Receipt className="mx-auto h-12 w-12 text-[var(--ce-muted)]/40" />
          <p className="mt-4 text-[var(--ce-muted)]">{t('payments.noPendingEnrollment')}</p>
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent mt-5 inline-flex">
            {t('student.joinGroup')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
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
                    {pendingEnrollments.map((en) => (
                      <option key={en._id} value={en._id}>
                        {en.groupId?.name} — {en.groupId?.subjectId?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEnrollment && (
                  <div className="rounded-xl bg-[var(--ce-bg)] p-4 text-sm">
                    <p className="text-xs font-bold uppercase text-[var(--ce-muted)]">{t('payments.package')}</p>
                    <p className="mt-1 font-semibold text-[var(--ce-primary)]">
                      {t(PACKAGES.find((p) => p.value === selectedEnrollment.packageType)?.labelKey || 'payments.fullPackage')}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase text-[var(--ce-muted)]">{t('payments.amount')}</p>
                    <p className="mt-1 text-2xl font-extrabold text-[var(--ce-accent)]">
                      {form.amount} {t('academy.currency')}
                    </p>
                    {promoPreview && (
                      <div className="mt-3 space-y-1 border-t border-[var(--ce-border)] pt-3">
                        <p className="text-[var(--ce-muted)]">{t('promo.discount')}: -{promoPreview.discountAmount} {t('academy.currency')}</p>
                        <p className="font-extrabold text-emerald-700">{t('promo.finalAmount')}: {promoPreview.finalAmount} {t('academy.currency')}</p>
                      </div>
                    )}
                    {isFreePayment && (
                      <p className="mt-3 font-semibold text-emerald-700">{t('payments.freeNoReceipt')}</p>
                    )}
                  </div>
                )}

                {selectedEnrollment && paymentLocked && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {t('payments.pendingLocked', {
                      status: t(`payments.status.${selectedPayment.status}`, selectedPayment.status),
                    })}
                  </div>
                )}
              </div>
            </section>

            {hasPaymentInfo && (
              <section className="ce-card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-primary)] text-xs font-bold text-white">2</span>
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
            )}
          </div>

          <section className="ce-card overflow-hidden lg:col-span-3 lg:self-start">
            <div className="flex items-center gap-2 border-b border-[var(--ce-border)] bg-[var(--ce-bg)]/60 px-5 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ce-accent)] text-xs font-bold text-white">
                {hasPaymentInfo ? '3' : '2'}
              </span>
              <FileUp className="h-4 w-4 text-[var(--ce-primary)]" />
              <h3 className="font-extrabold text-[var(--ce-primary)]">{t('payments.stepUpload')}</h3>
            </div>

            <div className="space-y-4 p-5">
              {selectedEnrollment && form.amount > 0 && !paymentLocked && (
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
                  disabled={paymentLocked || !selectedEnrollment}
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
                    paymentLocked || !selectedEnrollment
                      ? 'border-[var(--ce-border)] bg-[var(--ce-bg)]/50 opacity-60'
                      : 'border-[var(--ce-accent)]/40 bg-[var(--ce-accent)]/5 hover:border-[var(--ce-accent)]'
                  }`}>
                    <Upload className="h-8 w-8 text-[var(--ce-accent)]" />
                    <span className="mt-2 text-sm font-semibold text-[var(--ce-primary)]">{t('payments.uploadTap')}</span>
                    <span className="mt-1 text-xs text-[var(--ce-muted)]">{t('payments.uploadFormats')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => onFileChange(e.target.files?.[0])}
                      disabled={uploading || paymentLocked || !selectedEnrollment}
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
                  disabled={paymentLocked || !selectedEnrollment}
                  placeholder={t('payments.notesPlaceholder')}
                />
              </div>

              <button
                type="submit"
                className="ce-btn ce-btn-primary w-full"
                disabled={
                  submitting
                  || uploading
                  || paymentLocked
                  || !selectedEnrollment
                  || (!isFreePayment && !form.receiptImageUrl)
                }
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
