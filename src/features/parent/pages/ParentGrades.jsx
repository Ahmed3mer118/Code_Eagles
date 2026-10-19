// src/features/parent/pages/ParentGrades.jsx
import { useState } from 'react';
import { Award, AlertCircle, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildGrades from '../hooks/useChildGrades';

export default function ParentGrades() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  
  // بنجيب البيانات للابن المختار
  const { reports, assignments, quizzes, loading, error } = useChildGrades(selectedChild);

  if (!childrenLoading && children.length === 0) return <EmptyChildState />;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header + Child Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award size={24} className="text-primary-600" /> الأداء الدراسي
          </h1>
          <p className="text-sm text-gray-500 mt-1">اختر الابن لعرض درجاته ونتائجه</p>
        </div>
        {/* كومبوننت اختيار الابن */}
        <ChildSelector selectedChildId={selectedChild} onSelect={setSelectedChild} />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* الحالة: مفيش ابن مختار أو جاري التحميل */}
      {!selectedChild ? (
        <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
          يرجى اختيار ابن من القائمة أعلاه لعرض درجاته.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports ? (
        <div className="space-y-5">
          {/* كروت الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-emerald-500" />
                <p className="text-xs text-gray-500">متوسط الدرجات</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {reports.averageAssignmentGrade ? reports.averageAssignmentGrade.toFixed(1) : '-'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">واجبات مصححة</p>
              <p className="text-2xl font-bold text-indigo-600">{reports.gradedSubmissions || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">اختبارات مصححة</p>
              <p className="text-2xl font-bold text-amber-600">{reports.gradedAttempts || 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">إجمالي النقاط</p>
              <p className="text-2xl font-bold text-primary-600">{reports.totalPoints || 0}</p>
            </div>
          </div>

          {/* قوائم الواجبات والاختبارات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الواجبات */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                <FileText size={18} className="text-indigo-500" /> الواجبات
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد واجبات مسجلة.</p>
              ) : (
                <ul className="space-y-2">
                  {assignments.map(a => {
                    const grade = a.submissions?.[0]?.grade;
                    return (
                      <li key={a.id} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.subject?.name || ''}</p>
                        </div>
                        <span className={`font-bold shrink-0 mr-2 ${grade !== null && grade !== undefined ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {grade !== null && grade !== undefined ? `${grade} درجة` : 'لم يصحح'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* الاختبارات */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                <ClipboardList size={18} className="text-rose-500" /> الاختبارات
              </h3>
              {quizzes.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد اختبارات مسجلة.</p>
              ) : (
                <ul className="space-y-2">
                  {quizzes.map(q => {
                    const attempt = q.attempts?.[0];
                    return (
                      <li key={q.id} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{q.title}</p>
                          <p className="text-xs text-gray-500">{q.subject?.name || ''}</p>
                        </div>
                        <span className={`font-bold shrink-0 mr-2 ${attempt?.score !== null && attempt?.score !== undefined ? (attempt.passed ? 'text-emerald-600' : 'text-rose-600') : 'text-gray-400'}`}>
                          {attempt?.score !== null && attempt?.score !== undefined ? `${attempt.score} درجة` : 'لم يؤدَّ'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">لا توجد بيانات لهذا الابن.</div>
      )}
    </div>
  );
}
