// src/features/parent/pages/ParentEnrollments.jsx
import { useState } from 'react';
import { Layers, AlertCircle, User, BookOpen, Users, Calendar } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildEnrollments from '../hooks/useChildEnrollments';

export default function ParentEnrollments() {
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
            <Layers size={24} className="text-primary-600" /> المجموعات
          </h1>
          <p className="text-sm text-gray-500 mt-1">المجموعات المشترك بها ابنك</p>
        </div>
        <ChildSelector selectedChildId={selectedChild} onSelect={setSelectedChild} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!selectedChild ? (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
          يرجى اختيار ابن من القائمة أعلاه لعرض مجموعاته.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Layers size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد مجموعات</h3>
          <p className="text-sm text-gray-500 mt-1">الابن غير مشترك في أي مجموعة حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-l from-indigo-500/10 via-primary-500/10 to-violet-500/10 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {group.name || 'مجموعة'}
                </h3>
                {group.subject?.name && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <BookOpen size={12} /> {group.subject.name}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {/* المدرس */}
                {group.teacher?.name && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                      <User size={14} className="text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">المدرس</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {group.teacher.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* المواعيد */}
                {group.schedule && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">المواعيد</p>
                      <p className="font-medium text-gray-900 dark:text-white text-xs">
                        {typeof group.schedule === 'string' ? group.schedule : JSON.stringify(group.schedule)}
                      </p>
                    </div>
                  </div>
                )}

                {/* عدد الطلاب */}
                {group._count?.enrollments !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">عدد الطلاب</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {group._count.enrollments} طالب
                        {group.capacity ? ` (السعة: ${group.capacity})` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
