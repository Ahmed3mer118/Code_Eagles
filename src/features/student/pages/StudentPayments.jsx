// src/features/student/pages/StudentPayments.jsx
import { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import useStudentPayments from '../hooks/useStudentPayments';
import useStudentEnrollments from '../hooks/useStudentEnrollments';
import useStudentPaymentPlans from '../hooks/useStudentPaymentPlans';
import studentPaymentsApi from '../api/payments.api';

function StatusBadge({ status }) {
  const map = {
    pending: {
      label: 'قيد المراجعة',
      cls: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    },
    approved: {
      label: 'مقبول',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'مرفوض',
      cls: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
    },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

// Modal: Create Payment Request
function CreatePaymentModal({ open, onClose, onSuccess, plans, enrollments }) {
  const [form, setForm] = useState({
    enrollmentId: '',
    paymentPlanId: '',
    amount: 0,
    promoCode: '',
    method: 'cash',
    receiptImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoInfo, setPromoInfo] = useState(null);

  if (!open) return null;

  const handleValidatePromo = async () => {
    if (!form.promoCode.trim()) return;
    try {
      setPromoInfo(null);
      const selectedPlan = plans.find((p) => p.id === form.paymentPlanId);
      const selectedEnrollment = enrollments.find((e) => e.id === form.enrollmentId);
      const res = await studentPaymentsApi.validatePromoCode({
        code: form.promoCode.trim(),
        amount: Number(selectedPlan?.price || form.amount),
        groupId: selectedEnrollment?.group?.id || '',
        paymentPlanId: form.paymentPlanId,
      });
      setPromoInfo(res?.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل التحقق من الكود');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.enrollmentId) {
      setError('اختر المجموعة');
      return;
    }
    if (!form.paymentPlanId && !form.amount) {
      setError('اختر خطة أو أدخل المبلغ');
      return;
    }

    setLoading(true);
    try {
      await studentPaymentsApi.createPaymentRequest({
        enrollmentId: form.enrollmentId,
        paymentPlanId: form.paymentPlanId || undefined,
        amount: Number(form.amount) || 0,
        promoCode: form.promoCode.trim() || undefined,
        method: form.method,
        receiptImageUrl: form.receiptImageUrl || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">
            إنشاء طلب دفع
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              المجموعة <span className="text-red-500">*</span>
            </label>
            <select
              value={form.enrollmentId}
              onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              required
            >
              <option value="">— اختر —</option>
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.group?.name || e.groupName || 'مجموعة'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              خطة الدفع
            </label>
            <select
              value={form.paymentPlanId}
              onChange={(e) => {
                const planId = e.target.value;
                const plan = plans.find((p) => p.id === planId);
                setForm({
                  ...form,
                  paymentPlanId: planId,
                  amount: plan ? Number(plan.price) : form.amount,
                });
              }}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">— بدون خطة —</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {Number(p.price).toLocaleString('ar-EG')} ج.م
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              المبلغ (ج.م)
            </label>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              كود الخصم (اختياري)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.promoCode}
                onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                type="button"
                onClick={handleValidatePromo}
                disabled={!form.promoCode.trim()}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                تحقق
              </button>
            </div>
            {promoInfo && (
              <div
                className={`mt-2 p-2 rounded-lg text-xs ${
                  promoInfo.valid
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {promoInfo.message}
                {promoInfo.valid && promoInfo.discountAmount > 0 && (
                  <p className="font-bold mt-1">
                    خصم: {Number(promoInfo.discountAmount).toLocaleString('ar-EG')} ج.م
                    — المبلغ النهائي: {Number(promoInfo.finalAmount).toLocaleString('ar-EG')} ج.م
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              طريقة الدفع
            </label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="cash">كاش</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="online">أونلاين</option>
              <option value="receipt">إيصال</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentPayments() {
  const { data, loading, error, refetch } = useStudentPayments();
  const { data: plans } = useStudentPaymentPlans();
  const { data: enrollments } = useStudentEnrollments();
  const [createOpen, setCreateOpen] = useState(false);

  const fmt = (n) =>
    n === null || n === undefined
      ? '—'
      : Number(n).toLocaleString('ar-EG') + ' ج.م';

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('ar-EG');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet size={24} className="text-primary-600" />
            مدفوعاتي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            سجل مدفوعاتك وحالة كل طلب
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} />
          طلب دفع جديد
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Wallet size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد مدفوعات
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            ابدأ بإرسال طلب دفع
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} />
            طلب دفع جديد
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {fmt(req.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {req.paymentPlan?.name || '—'}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>{fmtDate(req.createdAt)}</span>
                {req.rejectionReason && (
                  <span className="text-red-600">{req.rejectionReason}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreatePaymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          refetch();
        }}
        plans={plans || []}
        enrollments={enrollments || []}
      />
    </div>
  );
}
