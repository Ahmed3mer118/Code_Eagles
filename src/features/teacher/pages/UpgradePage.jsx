// src/features/teacher/pages/UpgradePage.jsx
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';

const FEATURE_NAMES_AR = {
  groups: 'المجموعات',
  lectures: 'الدروس والمحاضرات',
  assignments: 'الواجبات',
  quizzes: 'الاختبارات',
  questions_bank: 'بنك الأسئلة',
  certificates: 'الشهادات',
  payments: 'المدفوعات',
  discussions: 'النقاشات',
  assistants: 'المساعدين',
  exporters: 'التصدير',
  gamification: 'التحفيز والنقاط',
  reports: 'التقارير والتحليلات',
};

const FEATURE_NAMES_EN = {
  groups: 'Groups',
  lectures: 'Lectures',
  assignments: 'Assignments',
  quizzes: 'Quizzes',
  questions_bank: 'Question Bank',
  certificates: 'Certificates',
  payments: 'Payments',
  discussions: 'Discussions',
  assistants: 'Assistants',
  exporters: 'Export',
  gamification: 'Gamification',
  reports: 'Reports',
};

export default function UpgradePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const isRTL = lang === 'ar';

  // ⬇️ نستخدم useMemo عشان مانحسبش أكتر من مرة
  const displayName = useMemo(() => {
    const featureKey = location.state?.featureName;
    if (!featureKey) return isRTL ? 'هذه الميزة' : 'this feature';
    const map = isRTL ? FEATURE_NAMES_AR : FEATURE_NAMES_EN;
    return map[featureKey] || featureKey;
  }, [location.state?.featureName, isRTL]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
        <Lock size={40} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isRTL ? `ميزة (${displayName}) غير متاحة!` : `"${displayName}" is not available!`}
      </h1>

      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        {isRTL
          ? 'هذه الميزة غير مشمولة في باقتك الحالية. يرجى ترقية باقتك للاستفادة من هذه الميزة.'
          : 'This feature is not included in your current plan. Please upgrade your plan to use it.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/teacher/subscription')}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition inline-flex items-center gap-2"
        >
          <ArrowRight size={18} className={isRTL ? '' : 'rotate-180'} />
          {isRTL ? 'ترقية الباقة' : 'Upgrade plan'}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition inline-flex items-center gap-2"
        >
          <ChevronLeft size={18} className={isRTL ? '' : 'rotate-180'} />
          {isRTL ? 'رجوع' : 'Back'}
        </button>
      </div>
    </div>
  );
}
