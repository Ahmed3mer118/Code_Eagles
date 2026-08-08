import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { groupApi, paymentApi, uploadApi } from '../../shared/api/platformApi';

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
  const [receiptPreview, setReceiptPreview] = useState('');
  const [form, setForm] = useState({
    enrollmentId: params.get('enrollment') || '',
    packageType: 'lectures_and_exams',
    amount: 0,
    receiptImageUrl: '',
    method: 'vodafone_cash',
    notes: '',
  });

  const loadEnrollments = async () => {
    const data = await groupApi.myEnrollments();
    setEnrollments(data.enrollments || []);
    setTenantInfo(data.tenant || null);
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

  const selectedEnrollment = useMemo(
    () => pendingEnrollments.find((en) => en._id === form.enrollmentId),
    [pendingEnrollments, form.enrollmentId]
  );

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

  const onFileChange = async (file) => {
    if (!file) return;
    setUploading(true);
    setReceiptPreview(URL.createObjectURL(file));
    try {
      const data = await uploadApi.uploadReceipt(file);
      setForm((prev) => ({ ...prev, receiptImageUrl: data.url }));
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
    if (!form.receiptImageUrl) {
      toast.error(t('payments.receiptRequired'));
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
            </div>
          )}

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
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="ce-input"
              onChange={(e) => onFileChange(e.target.files?.[0])}
              disabled={uploading}
            />
            {uploading && <p className="mt-2 text-sm text-[var(--ce-muted)]">{t('payments.uploading')}</p>}
            {receiptPreview && (
              <img src={receiptPreview} alt="" className="mt-3 max-h-48 rounded-xl border border-[var(--ce-border)] object-contain" />
            )}
          </div>

          <div>
            <label className="ce-label">{t('payments.notes')}</label>
            <textarea className="ce-input min-h-[90px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button type="submit" className="ce-btn ce-btn-primary w-full" disabled={submitting || uploading || !form.receiptImageUrl}>
            {submitting ? t('common.loading') : t('payments.submit')}
          </button>
        </form>
      )}
    </div>
  );
}
