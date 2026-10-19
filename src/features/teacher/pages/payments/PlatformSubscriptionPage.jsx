import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlatformSubscription } from '../../hooks/usePlatformSubscription';

export default function PlatformSubscriptionPage() {
  const {
    plans,
    currentSubscription,
    history,
    loading,
    actionLoading,
    error,
    requestSubscription,
  } = usePlatformSubscription();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const current = currentSubscription?.currentPlan;
  const pending = currentSubscription?.subscription;

  const handleSelectPlan = (plan) => {
    // لو الباقة دي هي المفعلة حالياً، مفيش داعي نعمل حاجة
    if (current?.slug === plan.slug) return;
    setSelectedPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedPlan) return;
    const res = await requestSubscription(selectedPlan.slug, selectedPlan.periodMonths || 1);
    if (res.success) {
      setShowConfirm(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">باقة المنصة</h1>
        <p className="text-gray-500">اشتراك الأكاديمية في المنصة</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* الاشتراك الحالي */}
      {current && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="font-bold text-green-800 mb-2">الخطة الحالية المفعلة</h2>
          <p className="text-green-700">
            <span className="font-semibold">{current.name}</span> —{' '}
            {current.price} ج.م / {current.periodMonths} شهر
          </p>
        </div>
      )}

      {/* الطلب المعلق */}
      {pending && pending.status !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-yellow-800 mb-1">لديك طلب اشتراك (قيد المراجعة / الدفع)</h2>
            <p className="text-yellow-700 text-sm">
              الخطة: {pending.plan} — الحالة: {pending.status}
            </p>
          </div>
          <Link
            to="/teacher/subscription/pay"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
          >
            إتمام الدفع
          </Link>
        </div>
      )}

      {/* الباقات المتاحة */}
      <div>
        <h2 className="text-lg font-bold mb-4">الباقات المتاحة</h2>
        {plans.length === 0 ? (
          <p className="text-gray-500">لا توجد باقات متاحة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = current?.slug === plan.slug;
              return (
                <div
                  key={plan.id}
                  className={`border rounded-xl p-5 flex flex-col ${
                    isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-2xl font-extrabold mt-2">
                    {plan.price} <span className="text-sm font-normal">ج.م</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    لمدة {plan.periodMonths} شهر
                  </p>

                  <ul className="text-sm space-y-1 mb-4 flex-1">
                    {plan.maxStudents != null && (
                      <li>✓ حتى {plan.maxStudents} طالب</li>
                    )}
                    {plan.maxAssistants != null && (
                      <li>✓ حتى {plan.maxAssistants} مساعد</li>
                    )}
                    {plan.features &&
                      Object.entries(plan.features)
                        .filter(([, v]) => v)
                        .map(([k]) => <li key={k}>✓ {k}</li>)}
                  </ul>

                  {/* الزرار: لو الباقة الحالية مفعلة مفيش زرار، غير كده فيه زرار */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-lg text-sm font-medium bg-green-600 text-white cursor-default"
                    >
                      مُفعّلة حالياً
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      اشترك في هذه الباقة
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* سجل الاشتراكات */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3">سجل الاشتراكات</h2>
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الباقة</th>
                  <th className="text-right px-4 py-3 font-medium">المبلغ</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.plan}</td>
                    <td className="px-4 py-3">{row.amount} ج.م</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">
                      {new Date(row.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal تأكيد */}
      {showConfirm && selectedPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">تأكيد الاشتراك</h3>
            <p className="text-sm text-gray-600 mb-4">
              هل أنت متأكد من الاشتراك في باقة{' '}
              <span className="font-semibold">{selectedPlan.name}</span> بسعر{' '}
              {selectedPlan.price} ج.م؟
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border text-sm"
                disabled={actionLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRequest}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-60"
              >
                {actionLoading ? 'جارٍ الإرسال...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
