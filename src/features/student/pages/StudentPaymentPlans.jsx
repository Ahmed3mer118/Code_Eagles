// src/features/student/pages/StudentPaymentPlans.jsx
import { CreditCard, Package, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import useStudentPaymentPlans from '../hooks/useStudentPaymentPlans';

const PACKAGE_LABELS = {
  monthly: 'شهري',
  term: 'ترم',
  yearly: 'سنوي',
  session: 'بالجلسة',
};

export default function StudentPaymentPlans() {
  const { data, loading, error, refetch } = useStudentPaymentPlans();

  const fmt = (n) =>
    n === null || n === undefined
      ? '—'
      : Number(n).toLocaleString('ar-EG') + ' ج.م';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">جاري التحميل...</p>
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
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard size={24} className="text-primary-600" />
          خطط الدفع
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          اختر الخطة المناسبة للاشتراك في المجموعات
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            لا توجد خطط متاحة
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            تواصل مع المدرس لإضافة خطط دفع
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 p-5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {plan.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mt-1">
                    <Package size={12} />
                    {PACKAGE_LABELS[plan.packageType] || plan.packageType}
                  </span>
                </div>
              </div>

              {plan.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {plan.description}
                </p>
              )}

              <div className="mb-4">
                <p className="text-3xl font-bold text-primary-600">
                  {fmt(plan.price)}
                </p>
                {plan.durationDays && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {plan.durationDays} يوم
                    {plan.trialDays > 0 && ` + ${plan.trialDays} تجريبي`}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  // TODO: navigate to payments page with plan
                  window.location.href = `/student/payments?plan=${plan.id}`;
                }}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
              >
                اشترك الآن
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
