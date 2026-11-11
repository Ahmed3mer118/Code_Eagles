// src/features/teacher/components/PendingApprovalBanner.jsx
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useI18n } from '@/shared/i18n';

export default function PendingApprovalBanner({ status }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  if (!status) return null;

  const { approvalStatus, rejectionReason } = status;

  if (approvalStatus === 'approved') return null;

  const isRejected = approvalStatus === 'rejected';

  return (
    <div
      className={`relative border-b-2 ${
        isRejected
          ? 'border-rose-300 bg-rose-50'
          : 'border-amber-300 bg-amber-50'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isRejected ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            {isRejected ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className={`text-sm font-bold ${
                isRejected ? 'text-rose-900' : 'text-amber-900'
              }`}
            >
              {isRejected
                ? isAr
                  ? '❌ تم رفض أكاديميتك'
                  : '❌ Your academy was rejected'
                : isAr
                ? '⏳ أكاديميتك قيد المراجعة'
                : '⏳ Your academy is pending approval'}
            </h3>
            <p
              className={`mt-0.5 text-xs ${
                isRejected ? 'text-rose-700' : 'text-amber-700'
              }`}
            >
              {isRejected
                ? isAr
                  ? 'لا يمكنك استخدام المنصة حالياً. تواصل مع الدعم لمعرفة سبب الرفض.'
                  : 'You cannot use the platform currently. Contact support to know the rejection reason.'
                : isAr
                ? 'فريق المراجعة بيفحص أكاديميتك حالياً. هتقدر تستخدم كل المميزات أول ما يتم قبولها.'
                : 'Our review team is checking your academy. You will be able to use all features once approved.'}
            </p>
            {isRejected && rejectionReason && (
              <p className="mt-2 rounded-lg bg-rose-100 px-3 py-2 text-xs text-rose-800">
                <strong>{isAr ? 'سبب الرفض: ' : 'Reason: '}</strong>
                {rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
