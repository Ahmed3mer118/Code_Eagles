// src/features/student/pages/StudentPayments.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Plus,
  Eye,
  Loader2,
  X,
  Download,
  ExternalLink,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Tag,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';

import paymentPlansApi from '../api/paymentPlans.api';

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const STATUS_MAP = {
  pending: {
    label: 'قيد المراجعة',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    Icon: Clock,
  },
  under_review: {
    label: 'تحت المراجعة',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    Icon: Clock,
  },
  approved: {
    label: 'مقبول',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    Icon: CheckCircle2,
  },
  rejected: {
    label: 'مرفوض',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    Icon: XCircle,
  },
  cancelled: {
    label: 'ملغي',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
    Icon: XCircle,
  },
};

const getProofUrl = (payment) => {
  if (!payment) return null;
  return (
    payment?.proofImageUrl ||
    payment?.metadata?.proofImageUrl ||
    payment?.metadata?.receiptImageUrl ||
    null
  );
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('ar-EG') + ' ج.م';
};

const formatDate = (date, withTime = false) => {
  if (!date) return '—';
  try {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' }),
    };
    return new Date(date).toLocaleString('ar-EG', options);
  } catch {
    return '—';
  }
};

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || STATUS_MAP.pending;
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.text}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 text-xs shrink-0">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-end break-words">
        {value || '—'}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Payment Detail Modal
   ═══════════════════════════════════════════ */

function PaymentDetailModal({ payment, onClose }) {
  if (!payment) return null;

  const proofUrl = getProofUrl(payment);
  const meta = STATUS_MAP[payment.status] || STATUS_MAP.pending;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              تفاصيل الطلب
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status + Amount */}
        <div className="p-4">
          <div className={`rounded-xl p-4 ${meta.bg}`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              <p className={`text-sm font-semibold ${meta.text}`}>
                {meta.label}
              </p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {formatCurrency(payment.amount)}
            </p>
            {payment.originalAmount &&
              Number(payment.originalAmount) !== Number(payment.amount) && (
                <p className="text-xs text-gray-500 mt-1 line-through">
                  {formatCurrency(payment.originalAmount)}
                </p>
              )}
          </div>
        </div>

        {/* Details */}
        <div className="px-4">
          <InfoRow
            icon={CreditCard}
            label="الخطة"
            value={payment.paymentPlan?.name}
          />
          <InfoRow
            icon={Building2}
            label="الأكاديمية"
            value={payment.tenant?.name}
          />
          {payment.enrollment?.group?.name && (
            <InfoRow
              icon={CreditCard}
              label="المجموعة"
              value={payment.enrollment.group.name}
            />
          )}
          <InfoRow
            icon={Calendar}
            label="تاريخ الطلب"
            value={formatDate(payment.createdAt, true)}
          />
          {Number(payment.discountAmount) > 0 && (
            <InfoRow
              icon={Tag}
              label="الخصم"
              value={formatCurrency(payment.discountAmount)}
            />
          )}
          {payment.promoCode?.code && (
            <InfoRow
              icon={Tag}
              label="كود الخصم"
              value={payment.promoCode.code}
            />
          )}
          {payment.rejectionReason && (
            <InfoRow
              icon={AlertCircle}
              label="سبب الرفض"
              value={payment.rejectionReason}
            />
          )}
        </div>

        {/* Proof */}
        {proofUrl ? (
          <div className="p-4">
            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Receipt size={14} />
              إيصال الدفع
            </p>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={proofUrl}
                alt="إثبات الدفع"
                className="w-full max-h-96 object-contain bg-gray-50 dark:bg-gray-800"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
            <a
              href={proofUrl}
              download
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:underline"
            >
              <Download size={14} />
              تحميل الصورة
            </a>
          </div>
        ) : (
          <div className="p-4 pt-0">
             <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                لم يتم إرفاق صورة إيصال لهذا الطلب
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-end gap-2">
          {payment.status === 'rejected' && (
            <Link
              to="/student/payment-plans"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              <RefreshCw size={14} />
              إعادة المحاولة
            </Link>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function StudentPayments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  /* ─────── Fetch ─────── */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentPlansApi.getMyPaymentRequests();
      const list = res?.data?.data ?? res?.data ?? [];
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchRequests error:', err);
      setError(
        err?.response?.data?.message ||
          'تعذر تحميل المدفوعات. حاول مرة أخرى.'
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /* ─────── Filtered ─────── */
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  /* ─────── Stats ─────── */
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    const totalPaid = requests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return { total, pending, approved, rejected, totalPaid };
  }, [requests]);

  /* ─────── Loading ─────── */
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500" dir="rtl">
        <Loader2 className="animate-spin mx-auto mb-3" size={28} />
        جاري تحميل المدفوعات...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      {/* ─────── Header ─────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مدفوعاتي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            تابع كل طلبات الدفع والاشتراك في أكاديمياتك
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            to="/student/payment-plans"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition"
          >
            <Plus size={16} />
            اشتراك جديد
          </Link>
        </div>
      </div>

      {/* ─────── Stats ─────── */}
      {requests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-gray-500 mb-1">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-amber-600 mb-1">قيد المراجعة</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs text-green-600 mb-1">مقبولة</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.approved}
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white">
            <p className="text-xs text-white/80 mb-1">إجمالي المدفوع</p>
            <p className="text-xl font-bold">
              {formatCurrency(stats.totalPaid)}
            </p>
          </div>
        </div>
      )}

      {/* ─────── Filters ─────── */}
      {requests.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: 'all', label: 'الكل', count: stats.total },
            { value: 'pending', label: 'قيد المراجعة', count: stats.pending },
            { value: 'approved', label: 'مقبول', count: stats.approved },
            { value: 'rejected', label: 'مرفوض', count: stats.rejected },
          ]
            .filter((f) => f.value === 'all' || f.count > 0)
            .map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === f.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
                <span className="ms-1 opacity-70">({f.count})</span>
              </button>
            ))}
        </div>
      )}

      {/* ─────── Error ─────── */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchRequests}
            className="text-xs underline shrink-0"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* ─────── Empty ─────── */}
      {!error && requests.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Wallet size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            لا توجد طلبات دفع بعد
          </p>
          <Link
            to="/student/payment-plans"
            className="text-primary-600 hover:underline text-sm"
          >
            اختر خطة واشترك الآن
          </Link>
        </div>
      )}

      {/* ─────── Empty filtered ─────── */}
      {!error && requests.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 text-sm">لا توجد طلبات بهذه الحالة</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-primary-600 hover:underline text-xs mt-2"
          >
            عرض الكل
          </button>
        </div>
      )}

      {/* ─────── List ─────── */}
      {!error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((req) => {
            const proofUrl = getProofUrl(req);
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`bg-white dark:bg-gray-900 rounded-xl border p-4 transition ${
                  isRejected
                    ? 'border-red-200 dark:border-red-800/50'
                    : 'border-gray-200 dark:border-gray-800 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {proofUrl ? (
                    <a
                      href={proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800"
                      title="عرض الإيصال"
                    >
                      <img
                        src={proofUrl}
                        alt="إثبات الدفع"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 shrink-0 flex items-center justify-center text-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {req.paymentPlan?.name || 'خطة دفع'}
                        </h3>
                        {req.tenant?.name && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Building2 size={12} />
                            <span className="truncate">{req.tenant.name}</span>
                          </p>
                        )}
                      </div>
                      <StatusBadge status={req.status} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="font-bold text-primary-600 text-base">
                        {formatCurrency(req.amount)}
                      </span>
                      {Number(req.discountAmount) > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Tag size={12} />
                          خصم {formatCurrency(req.discountAmount)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(req.createdAt)}
                      </span>
                    </div>

                    {req.rejectionReason && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded flex items-start gap-1.5">
                        <AlertCircle size={12} className="shrink-0 mt-0.5" />
                        <span>سبب الرفض: {req.rejectionReason}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => setSelected(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <Eye size={14} />
                        التفاصيل
                      </button>

                      {proofUrl && (
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition"
                        >
                          <ExternalLink size={14} />
                          عرض الإيصال
                        </a>
                      )}

                      {isRejected && (
                        <Link
                          to="/student/payment-plans"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition"
                        >
                          <RefreshCw size={14} />
                          إعادة المحاولة
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────── Modal ─────── */}
      {selected && (
        <PaymentDetailModal
          payment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
