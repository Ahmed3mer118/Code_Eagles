// src/features/parent/pages/ParentQuizzes.jsx
import { useState } from 'react';
import { ClipboardList, AlertCircle, Clock, CheckCircle2, XCircle, HelpCircle, Award } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildQuizzes from '../hooks/useChildQuizzes';

export default function ParentQuizzes() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  const { quizzes, loading, error } = useChildQuizzes(selectedChild);

  if (!childrenLoading && children.length === 0) return <EmptyChildState />;

  // إحصائيات سريعة
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(q => q.attempts?.length > 0).length;
  const pendingQuizzes = quizzes.filter(q => q.attempts?.some(a => a.status === 'pending' || a.status === 'in_progress')).length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header + Child Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList size={24} className="text-primary-600" /> الاختبارات
          </h1>
          <p className="text-sm text-gray-500 mt-1">متابعة اختبارات الابن ونتائجها</p>
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
          يرجى اختيار ابن من القائمة أعلاه لعرض اختباراته.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* كروت الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي الاختبارات</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalQuizzes}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">تم أداؤها</p>
                <p className="text-xl font-bold text-emerald-600">{completedQuizzes}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">بانتظار التصحيح</p>
                <p className="text-xl font-bold text-amber-600">{pendingQuizzes}</p>
              </div>
            </div>
          </div>

          {/* قائمة الاختبارات */}
          {quizzes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد اختبارات</h3>
              <p className="text-sm text-gray-500 mt-1">لم يتم إضافة أي اختبارات للابن حتى الآن.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {quizzes.map((quiz, idx) => {
                const attempt = quiz.attempts?.[0]; // آخر محاولة
                const isGraded = attempt?.status === 'graded';
                const isPending = attempt && !isGraded;
                const isNotAttempted = !attempt;

                return (
                  <div key={quiz.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{quiz.subject?.name || 'مادة'}</span>
                        <span>•</span>
                        <span>{quiz._count?.questions || 0} سؤال</span>
                        {quiz.startDate && <><span>•</span><span>يبدأ: {new Date(quiz.startDate).toLocaleDateString('ar-EG')}</span></>}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isGraded ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${attempt.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {attempt.passed ? 'ناجح' : 'راسب'} ({attempt.score} درجة)
                          </span>
                          {attempt.passed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                        </div>
                      ) : isPending ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                          <Clock size={12} /> بانتظار التصحيح
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                          <HelpCircle size={12} /> لم يتم الأداء
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
