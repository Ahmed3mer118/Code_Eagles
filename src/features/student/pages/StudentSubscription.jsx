// src/features/student/pages/StudentSubscription.jsx
import {
  CreditCard,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  XCircle,
  Layers,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStudentSubscription from '../hooks/useStudentSubscription';

// ============ Helpers ============
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const fmtMoney = (n) => {
  if (n === null || n === undefined) return '—';
  return `${Number(n).toLocaleString('ar-EG')} ج.م`;
};

// ============ Main Component ============
export default function StudentSubscription() {
  const navigate = useNavigate();
  const { enrollments, payments, loading, error, refetch } = useStudentSubscription();

  // فلترة الاشتراكات النشطة فقط
  const activeEnrollments = enrollments.filter((e) => e.status === 'active');

  // إحصائيات عامة
  const totalPaid = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> حاول تاني
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={24} className="text-primary-600" />
          اشتراكاتي
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          تفاصيل المجموعات النشطة وحالة المدفوعات الخاصة بك
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-primary-500" />
            <span className="text-sm text-gray-500">المجموعات النشطة</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeEnrollments.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-sm text-gray-500">إجمالي المدفوع</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {fmtMoney(totalPaid)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm text-gray-500">مدفوعات معلقة</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {pendingPayments}
          </p>
        </div>
      </div>

      {/* Active Enrollments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={18} className="text-primary-500" />
            المجموعات المشترك بها
          </h2>
          <button
            onClick={() => navigate('/student/enrollments')}
            className="text-sm text-primary-600 hover:underline"
          >
            عرض الكل
          </button>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Layers size={28} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              لا توجد اشتراكات نشطة
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              أنت غير مشترك في أي مجموعة حالياً.
            </p>
            <button
              onClick={() => navigate('/student/enrollments')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
              تصفح المجموعات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEnrollments.map((enrollment) => {
              const group = enrollment.group || {};
              const subject = group.subject || {};
              const plan = enrollment.paymentPlan || {};

              // البحث عن دفعة مرتبطة بهذا الاشتراك
              const relatedPayment = payments.find(
                (p) => p.enrollmentId === enrollment.id && p.status === 'approved',
              );

              return (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-l from-emerald-500 to-teal-600 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{group.name || 'مجموعة'}</h3>
                        {subject.name && (
                          <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                            <BookOpen size={12} /> {subject.name}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-white/20 rounded-md text-xs font-bold backdrop-blur">
                        نشط
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Package size={14} /> خطة الدفع
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {plan.name || 'خطة افتراضية'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> تاريخ البداية
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {fmtDate(enrollment.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={14} /> تاريخ النهاية
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {enrollment.endDate ? fmtDate(enrollment.endDate) : 'مفتوح'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <CheckCircle2 size={14} /> حالة الدفع
                      </span>
                      {relatedPayment ? (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 size={12} /> مدفوع ({fmtMoney(relatedPayment.amount)})
                        </span>
                      ) : plan.price ? (
                        <span className="text-amber-600 font-bold text-xs flex items-center gap-1">
                          <Clock size={12} /> بانتظار الدفع ({fmtMoney(plan.price)})
                        </span>
                      ) : (
                        <span className="text-gray-500 font-bold text-xs">غير محدد</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History Preview */}
      {payments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={18} className="text-primary-500" />
              سجل المدفوعات الأخير
            </h2>
            <button
              onClick={() => navigate('/student/payments')}
              className="text-sm text-primary-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {payments.slice(0, 3).map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 ${
                  idx !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      p.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-600'
                        : p.status === 'pending'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {p.status === 'approved' ? (
                      <CheckCircle2 size={16} />
                    ) : p.status === 'pending' ? (
                      <Clock size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {p.paymentPlan?.name || 'دفعة'}
                    </p>
                    <p className="text-xs text-gray-500">{fmtDate(p.createdAt)}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {fmtMoney(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
