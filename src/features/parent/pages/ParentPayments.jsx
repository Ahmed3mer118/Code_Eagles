// src/features/parent/pages/ParentPayments.jsx
import { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildEnrollments from '../hooks/useChildEnrollments';

export default function ParentPayments() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  const { groups, loading, error } = useChildEnrollments(selectedChild);

  if (!childrenLoading && children.length === 0) return <EmptyChildState />;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header + Child Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={24} className="text-primary-600" /> المدفوعات
          </h1>
          <p className="text-sm text-gray-500 mt-1">متابعة اشتراكات ومدفوعات الابن</p>
        </div>
        <ChildSelector selectedChildId={selectedChild} onSelect={setSelectedChild} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* رسالة توضيحية */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <Info size={18} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">متابعة الاشتراكات</h3>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
            هنا تظهر المجموعات اللي ابنك مشترك فيها. تفاصيل المدفوعات المباشرة (الفواتير، الإيصالات) هتتوفر قريباً. للاستفسار عن حالة الدفع، تواصل مع إدارة الأكاديمية.
          </p>
        </div>
      </div>

      {!selectedChild ? (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
          يرجى اختيار ابن من القائمة أعلاه.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد اشتراكات</h3>
          <p className="text-sm text-gray-500 mt-1">الابن غير مشترك في أي مجموعة حالياً.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              الاشتراكات النشطة ({groups.length})
            </h3>
          </div>
          {groups.map((group, idx) => (
            <div key={group.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                  {group.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {group.subject?.name || 'مادة'} • المدرس: {group.teacher?.name || 'غير محدد'}
                </p>
              </div>
              <div className="shrink-0">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  <CheckCircle2 size={12} /> مشترك
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
