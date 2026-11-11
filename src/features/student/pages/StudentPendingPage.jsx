// src/features/student/pages/StudentPendingPage.jsx
import { Link } from 'react-router-dom';
import {
  Clock,
  CreditCard,
  Wallet,
  Package,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export default function StudentPendingPage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock size={32} className="text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          حسابك قيد المراجعة
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
          طلب انضمامك قيد المراجعة من قبل المدرس. في الوقت ده، يمكنك تصفح
          الأكاديميات المتاحة، اختيار خطة الدفع، ومتابعة حالة اشتراكك.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-start">
          <Link
            to="/student/payment-plans"
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition group"
          >
            <GraduationCap
              size={22}
              className="text-primary-600 mb-2 group-hover:scale-110 transition"
            />
            <p className="font-semibold text-gray-900 dark:text-white">
              الأكاديميات
            </p>
            <p className="text-xs text-gray-500 mt-1">تصفح وانضم لأكاديمية</p>
          </Link>

          <Link
            to="/student/payment-plans"
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition group"
          >
            <CreditCard
              size={22}
              className="text-primary-600 mb-2 group-hover:scale-110 transition"
            />
            <p className="font-semibold text-gray-900 dark:text-white">
              خطط الدفع
            </p>
            <p className="text-xs text-gray-500 mt-1">اختر الخطة المناسبة</p>
          </Link>

          <Link
            to="/student/payments"
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition group"
          >
            <Wallet
              size={22}
              className="text-primary-600 mb-2 group-hover:scale-110 transition"
            />
            <p className="font-semibold text-gray-900 dark:text-white">
              مدفوعاتي
            </p>
            <p className="text-xs text-gray-500 mt-1">تابع حالة الدفع</p>
          </Link>

          <Link
            to="/student/subscription"
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:shadow-md transition group"
          >
            <Package
              size={22}
              className="text-primary-600 mb-2 group-hover:scale-110 transition"
            />
            <p className="font-semibold text-gray-900 dark:text-white">
              اشتراكي
            </p>
            <p className="text-xs text-gray-500 mt-1">تفاصيل الاشتراك</p>
          </Link>
        </div>

        <Link
          to="/student/enrollments"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
        >
          عرض طلبات الانضمام بتاعتك
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
