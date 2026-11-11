// src/features/student/pages/StudentPaymentPlans.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Send,
  Ban,
  Clock,
  Wallet,
  ArrowRightCircle,
  Tag,
  X,
} from 'lucide-react';

import usePaymentPlansWizard from '../hooks/usePaymentPlansWizard';
import AcademySelector from '../components/AcademySelector';
import PlanSelector from '../components/PlanSelector';
import PaymentProofUploader from '../components/PaymentProofUploader';

export default function StudentPaymentPlans() {
  const navigate = useNavigate();
  const w = usePaymentPlansWizard();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSuccess(false);
  }, []);

  const handleSubmit = async () => {
    const result = await w.submit();
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/payments');
      }, 2000);
    }
  };

  /* ─────── Success ─────── */
  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center" dir="rtl">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          تم إرسال طلبك بنجاح! 🎉
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          سيتم مراجعة طلبك من قبل المدرس. جاري تحويلك...
        </p>
        <Loader2
          className="animate-spin mx-auto mt-6 text-primary-600"
          size={24}
        />
      </div>
    );
  }

  /* ─────── Blocked ─────── */
  if (!w.canSubmit && w.academy) {
    return (
      <div className="max-w-2xl mx-auto py-10" dir="rtl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Ban size={32} className="text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            لا يمكنك الاشتراك في هذه الأكاديمية حالياً
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {w.blockReason ||
              'لديك طلب قيد المراجعة أو اشتراك نشط في هذه الأكاديمية'}
          </p>

          {w.blockingRequest && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-start">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-amber-600" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  الطلب الحالي
                </p>
              </div>
              {w.blockingRequest.tenant?.name && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  الأكاديمية:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {w.blockingRequest.tenant.name}
                  </span>
                </p>
              )}
              {w.blockingRequest.paymentPlan?.name && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  الخطة:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {w.blockingRequest.paymentPlan.name}
                  </span>
                </p>
              )}
              {w.blockingRequest.status && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  الحالة:{' '}
                  <span
                    className={`font-medium ${
                      w.blockingRequest.status === 'approved'
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {w.blockingRequest.status === 'approved'
                      ? 'مقبول'
                      : 'قيد المراجعة'}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                w.reset();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
            >
              <ArrowRightCircle size={16} />
              اختيار أكاديمية تانية
            </button>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/student/payments"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Wallet size={14} />
                عرض مدفوعاتي
              </Link>
              <Link
                to="/student/subscription"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                عرض اشتراكي
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────── Normal wizard ─────── */
  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          خطط الدفع والاشتراك
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          اختر أكاديمية، ثم خطة الدفع، ثم ارفع إثبات التحويل
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                w.step >= n
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {n}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                w.step >= n ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {n === 1
                ? 'الأكاديمية'
                : n === 2
                ? 'الخطة والمجموعة'
                : 'إثبات الدفع'}
            </span>
            {n < 3 && (
              <div
                className={`flex-1 h-0.5 ${
                  w.step > n
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        {w.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{w.error}</span>
          </div>
        )}

        {w.step === 1 && <AcademySelector onSelect={w.selectAcademy} />}

        {w.step === 2 && w.loadingAcademy && (
          <div className="py-16 text-center text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-3" size={24} />
            جاري تحميل خطط الدفع...
          </div>
        )}

        {w.step === 2 && !w.loadingAcademy && (
          <PlanSelector
            academy={w.academy}
            plans={w.plans}
            groups={w.groups}
            selectedPlan={w.selectedPlan}
            selectedGroup={w.selectedGroup}
            onSelectPlan={w.selectPlan}
            onSelectGroup={w.selectGroup}
          />
        )}

        {w.step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                الخطوة 3: إثبات الدفع
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                ارفع صورة إيصال التحويل البنكي أو المحفظة
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">الأكاديمية</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {w.academy?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الخطة</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {w.selectedPlan?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المجموعة</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {w.selectedGroup?.name}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">المبلغ</span>
                <div className="text-end">
                  {w.appliedPromo ? (
                    <>
                      <span className="block text-xs text-gray-400 line-through">
                        {w.selectedPlan?.price} ج.م
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        {w.appliedPromo.finalAmount} ج.م
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-primary-600 text-lg">
                      {w.selectedPlan?.price} ج.م
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Promo Code */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag size={16} className="text-primary-600" />
                كود الخصم (اختياري)
              </label>
              
              {!w.appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={w.promoCode}
                    onChange={(e) => w.setPromoCode(e.target.value.toUpperCase())}
                    placeholder="مثال: AYA10"
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                  />
                  <button
                    type="button"
                    onClick={w.applyPromoCode}
                    disabled={!w.promoCode.trim() || w.validatingPromo}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition"
                  >
                    {w.validatingPromo ? 'جاري التحقق...' : 'تطبيق'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <span className="text-green-700 dark:text-green-400 font-medium text-sm">
                      ✅ تم تطبيق الكود: {w.appliedPromo.code}
                    </span>
                    <span className="text-xs text-green-600 block mt-0.5">
                      خصم {w.appliedPromo.discountAmount} ج.م
                    </span>
                  </div>
                  <button
                    onClick={w.removePromoCode}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              )}
              
              {w.promoError && (
                <p className="text-xs text-red-500 mt-2">{w.promoError}</p>
              )}
            </div>

            <PaymentProofUploader
              preview={w.proofPreview}
              onPick={w.pickFile}
              onClear={() => {
                w.pickFile(null);
                w.setError(null);
              }}
              disabled={w.uploading || w.submitting}
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={w.back}
            disabled={w.step === 1 || w.submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRight size={16} className="rotate-180" />
            السابق
          </button>

          {w.step === 2 && (
            <button
              type="button"
              onClick={w.confirmStep2}
              disabled={!w.selectedPlan || !w.selectedGroup}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
              <ArrowRight size={16} />
            </button>
          )}

          {w.step === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!w.proofFile || w.submitting || w.uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {w.submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send size={16} />
                  إرسال الطلب
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
