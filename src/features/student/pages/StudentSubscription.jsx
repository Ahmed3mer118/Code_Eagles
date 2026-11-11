// src/features/student/pages/StudentSubscription.jsx
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  Building2,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

import apiClient from '@/shared/api/client';

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const ENROLLMENT_STATUS = {
  active: {
    label: 'نشط',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'قيد المراجعة',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    Icon: Clock,
  },
  cancelled: {
    label: 'ملغي / مرفوض',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    Icon: XCircle,
  },
  expired: {
    label: 'منتهي',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
    Icon: XCircle,
  },
  left: {
    label: 'غادر',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
    Icon: XCircle,
  },
};

const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return Number(amount).toLocaleString('ar-EG') + ' ج.م';
};

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function EnrollmentBadge({ status }) {
  const meta = ENROLLMENT_STATUS[status] || ENROLLMENT_STATUS.pending;
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

function SubscriptionCard({ enrollment }) {
  const tenant = enrollment.tenant || {};
  const group = enrollment.group || {};
  const plan = enrollment.paymentPlan || {};

  const isActive = enrollment.status === 'active';
  const isPending = enrollment.status === 'pending';

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden transition shadow-sm hover:shadow-md ${
        isActive
          ? 'border-green-500 dark:border-green-600'
          : isPending
          ? 'border-amber-400 dark:border-amber-600'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 ${
          isActive
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
            : isPending
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-12 h-12 rounded-lg bg-white object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center text-xl font-bold">
                {tenant.name?.[0] || 'A'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg">
                {tenant.name || 'أكاديمية'}
              </h3>
              {tenant.slug && (
                <p className="text-xs opacity-80">@{tenant.slug}</p>
              )}
            </div>
          </div>
          {/* لو الكارت ملون، نخلي البادج أبيض عشان يبان */}
          <div className={isActive || isPending ? 'bg-white/20 rounded-full px-2 py-1' : ''}>
             <EnrollmentBadge status={enrollment.status} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Plan & Group Info */}
        <div className="grid grid-cols-2 gap-4">
          {plan.name && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <CreditCard size={14} /> الخطة
              </p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {plan.name}
              </p>
              {plan.price && (
                <p className="text-xs text-primary-600 font-bold mt-0.5">
                  {formatCurrency(plan.price)}
                </p>
              )}
            </div>
          )}

          {group.name && (
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Users size={14} /> المجموعة
              </p>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {group.name}
              </p>
              {group.gradeLevel && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {group.gradeLevel}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
          {enrollment.startDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> بداية: {formatDate(enrollment.startDate)}
            </span>
          )}
          {enrollment.endDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> نهاية: {formatDate(enrollment.endDate)}
            </span>
          )}
        </div>

        {/* Messages */}
        {enrollment.rejectionReason && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex items-start gap-1.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>سبب الرفض: {enrollment.rejectionReason}</span>
          </div>
        )}

        {isPending && (
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg flex items-start gap-2">
            <Clock size={16} className="shrink-0 mt-0.5" />
            <span>
              طلبك قيد المراجعة من قبل المدرس. سيتم إشعارك عند الموافقة.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          {isActive ? (
            <Link
              to="/student/subjects"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
            >
              ابدأ التعلم الآن
            </Link>
          ) : (enrollment.status === 'cancelled' || enrollment.status === 'expired') ? (
            <Link
              to="/student/payment-plans"

              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <RefreshCw size={16} />
              تجديد / اشتراك جديد
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */

export default function StudentSubscription() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ استخدام الـ endpoint الخاص بالطالب
      const res = await apiClient.get('/student/enrollments');
      const list = res?.data?.data ?? res?.data ?? [];
      setEnrollments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchEnrollments error:', err);
      setError(
        err?.response?.data?.message || 'تعذر تحميل الاشتراكات'
      );
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // تصنيف الاشتراكات
  const active = enrollments.filter((e) => e.status === 'active');
  const pending = enrollments.filter((e) => e.status === 'pending');
  const past = enrollments.filter(
    (e) => !['active', 'pending'].includes(e.status)
  );

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500" dir="rtl">
        <Loader2 className="animate-spin mx-auto mb-3 text-primary-600" size={28} />
        <p>جاري تحميل الاشتراكات...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            اشتراكاتي
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            تابع حالة انضمامك في مختلف الأكاديميات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnrollments}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button onClick={fetchEnrollments} className="text-xs underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!error && enrollments.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Package size={56} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            لا يوجد اشتراك بعد
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
            أنت غير منضم لأي أكاديمية حتى الآن. تصفح الأكاديميات واختر الخطة
            المناسبة لك لتبدأ التعلم.
          </p>
          <Link
            to="/student/payment-plans"

            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} />
            تصفح الأكاديميات
          </Link>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            الاشتراكات النشطة
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
              {active.length}
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {active.map((e) => (
              <SubscriptionCard key={e.id} enrollment={e} />
            ))}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-600" />
            قيد المراجعة
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {pending.map((e) => (
              <SubscriptionCard key={e.id} enrollment={e} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <XCircle size={20} className="text-gray-400" />
            السجل السابق (ملغي / منتهي)
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {past.length}
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-5 opacity-80">
            {past.map((e) => (
              <SubscriptionCard key={e.id} enrollment={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
