import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { groupApi, paymentApi, promoApi, uploadApi } from '../../shared/api/platformApi';
import resolveMediaUrl from '../../shared/utils/mediaUrl';

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
        toast.error(err?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

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
  }, [
    promoCode,
    form.amount,
    form.enrollmentId,
    paymentLocked,
    selectedEnrollment,
    t,
  ]);

  const onFileChange = async (file) => {
    if (!file) return;
    setUploading(true);
    setReceiptPreview(URL.createObjectURL(file));
    try {
      const data = await uploadApi.uploadReceipt(file);
      setForm((prev) => ({ ...prev, receiptImageUrl: data.url || data.absoluteUrl }));
      toast.success(t('payments.receiptUploaded'));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
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
      toast.error(err?.response?.data?.message || err?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const paymentInfo = tenantInfo?.paymentInfo || {};

  if (loading) return <p className="text-[var(--ce-muted)]">{t('common.loading')}</p>;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="ce-card p-6">
        <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{t('payments.submitTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--ce-muted)]">{t('payments.submitHint')}</p>

        {(paymentInfo.vodafoneNumber || paymentInfo.instapayId || paymentInfo.bankDetails || paymentInfo.paymentInstructions) && (
          <div className="mt-4 rounded-xl bg-[var(--ce-bg)] p-4 text-sm">
            <p className="font-bold text-[var(--ce-primary)]">{t('payments.instructions')}</p>
            {paymentInfo.vodafoneNumber && <p className="mt-2">{t('payments.vodafone')}: {paymentInfo.vodafoneNumber}</p>}
            {paymentInfo.instapayId && <p className="mt-1">{t('payments.instapay')}: {paymentInfo.instapayId}</p>}
            {paymentInfo.bankDetails && <p className="mt-1 whitespace-pre-wrap">{paymentInfo.bankDetails}</p>}
            {paymentInfo.paymentInstructions && <p className="mt-2 whitespace-pre-wrap text-[var(--ce-muted)]">{paymentInfo.paymentInstructions}</p>}
          </div>
        )}
      </div>

      {submittedRequest && (
        <div className="ce-card border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-emerald-900">{t('payments.submitSuccess')}</h3>
              <p className="mt-1 text-sm text-emerald-800">{t('payments.submitSuccessDetail')}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-900">
                {t('payments.amount')}: {submittedRequest.amount} {t('academy.currency')}
              </p>
              <p className="text-sm text-emerald-800">
                {t('common.status')}: {t(`payments.status.${submittedRequest.status}`, submittedRequest.status)}
              </p>
            </div>
          </div>
        </div>
      )}

      {pendingEnrollments.length === 0 ? (
        <div className="ce-card p-6 text-center">
          <p className="text-[var(--ce-muted)]">{t('payments.noPendingEnrollment')}</p>
          <Link to="/dashboard/student/join" className="ce-btn ce-btn-accent mt-4 inline-flex">{t('student.joinGroup')}</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="ce-card space-y-4 p-6">
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
                  {en.groupId?.name} — {en.groupId?.subjectId?.name} — {en.amountDue} {t('academy.currency')}
                </option>
              ))}
            </select>
          </div>

          {selectedEnrollment && (
            <div className="rounded-xl bg-[var(--ce-bg)] p-4 text-sm">
              <p className="font-bold text-[var(--ce-primary)]">{t('payments.package')}</p>
              <p className="mt-1">{t(PACKAGES.find((p) => p.value === selectedEnrollment.packageType)?.labelKey || 'payments.fullPackage')}</p>
              <p className="mt-3 font-bold text-[var(--ce-primary)]">{t('payments.amount')}</p>
              <p className="mt-1 text-lg font-extrabold">{form.amount} {t('academy.currency')}</p>
              {promoPreview && (
                <div className="mt-3 space-y-1 border-t border-[var(--ce-border)] pt-3">
                  <p className="text-[var(--ce-muted)]">{t('promo.discount')}: -{promoPreview.discountAmount} {t('academy.currency')}</p>
                  <p className="font-extrabold text-[var(--ce-accent)]">{t('promo.finalAmount')}: {promoPreview.finalAmount} {t('academy.currency')}</p>
                  {promoPreview.validUntil && (
                    <p className="text-xs text-[var(--ce-muted)]">{t('promo.validUntil', { time: new Date(promoPreview.validUntil).toLocaleTimeString() })}</p>
                  )}
                </div>
              )}
              {isFreePayment && (
                <p className="mt-3 text-sm font-semibold text-emerald-700">{t('payments.freeNoReceipt')}</p>
              )}
            </div>
          )}

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

          {selectedEnrollment && paymentLocked && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {t('payments.pendingLocked', {
                status: t(`payments.status.${selectedPayment.status}`, selectedPayment.status),
              })}
            </div>
          )}

          <div>
            <label className="ce-label">{t('payments.method')}</label>
            <select className="ce-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} disabled={paymentLocked}>
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{t(m.labelKey)}</option>
              ))}
            </select>
          </div>

          {!isFreePayment && (
            <div>
              <label className="ce-label">{t('payments.receiptUpload')}</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="ce-input"
                onChange={(e) => onFileChange(e.target.files?.[0])}
                disabled={uploading || paymentLocked}
              />
              {uploading && <p className="mt-2 text-sm text-[var(--ce-muted)]">{t('payments.uploading')}</p>}
              {receiptPreview && (
                <img src={receiptPreview.startsWith('blob:') ? receiptPreview : resolveMediaUrl(receiptPreview)} alt="" className="mt-3 max-h-48 rounded-xl border border-[var(--ce-border)] object-contain" />
              )}
            </div>
          )}

          <div>
            <label className="ce-label">{t('payments.notes')}</label>
            <textarea className="ce-input min-h-[90px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={paymentLocked} />
          </div>

          <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={submitting || uploading || paymentLocked || (!isFreePayment && !form.receiptImageUrl)}>
            {submitting ? t('common.loading') : t('payments.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
