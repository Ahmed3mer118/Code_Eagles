// src/features/parent/pages/ParentAssignments.jsx
import { useState } from 'react';
import { FileText, AlertCircle, Clock, CheckCircle2, XCircle, HelpCircle, Calendar } from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useChildAssignments from '../hooks/useChildAssignments';

export default function ParentAssignments() {
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  const { assignments, loading, error } = useChildAssignments(selectedChild);

  if (!childrenLoading && children.length === 0) return <EmptyChildState />;

  // إحصائيات سريعة
  const totalAssignments = assignments.length;
  const submittedAssignments = assignments.filter(a => a.submissions?.length > 0).length;
  const pendingGrading = assignments.filter(a => a.submissions?.[0]?.status === 'submitted').length;
  const notSubmitted = assignments.filter(a => !a.submissions?.length).length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header + Child Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-primary-600" /> الواجبات
          </h1>
          <p className="text-sm text-gray-500 mt-1">متابعة واجبات الابن وحالتها</p>
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
          يرجى اختيار ابن من القائمة أعلاه لعرض واجباته.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* كروت الإحصائيات */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">إجمالي الواجبات</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalAssignments}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">تم تسليمها</p>
                <p className="text-xl font-bold text-emerald-600">{submittedAssignments}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">بانتظار التصحيح</p>
                <p className="text-xl font-bold text-amber-600">{pendingGrading}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">لم يتم تسليمها</p>
                <p className="text-xl font-bold text-rose-600">{notSubmitted}</p>
              </div>
            </div>
          </div>

          {/* قائمة الواجبات */}
          {assignments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FileText size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">لا توجد واجبات</h3>
              <p className="text-sm text-gray-500 mt-1">لم يتم إضافة أي واجبات للابن حتى الآن.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {assignments.map((assignment, idx) => {
                const submission = assignment.submissions?.[0];
                const isGraded = submission?.status === 'graded';
                const isSubmitted = submission?.status === 'submitted';
                const isNotSubmitted = !submission;

                return (
                  <div key={assignment.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${idx !== 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{assignment.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{assignment.subject?.name || 'مادة'}</span>
                        {assignment.dueDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> 
                              تسليم: {new Date(assignment.dueDate).toLocaleDateString('ar-EG')}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{assignment.maxPoints || 0} درجة</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isGraded ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${Number(submission.grade) >= (assignment.maxPoints || 0) / 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {submission.grade} / {assignment.maxPoints}
                          </span>
                          {Number(submission.grade) >= (assignment.maxPoints || 0) / 2 ? (
                            <CheckCircle2 size={18} className="text-emerald-500" />
                          ) : (
                            <XCircle size={18} className="text-red-500" />
                          )}
                        </div>
                      ) : isSubmitted ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                          <Clock size={12} /> بانتظار التصحيح
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                          <HelpCircle size={12} /> لم يُسلَّم
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
