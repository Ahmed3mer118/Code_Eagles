// src/features/parent/pages/ParentDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Award,
  Star,
  FileText,
  ClipboardList,
  AlertCircle,
  ChevronLeft,
  User,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useParentDashboard from '../hooks/useParentDashboard';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState(null);
  
  const { reports, assignments, quizzes, loading, error } = useParentDashboard(selectedChild);

  // لو مفيش أبناء مسجلين
  if (!childrenLoading && children.length === 0) {
    return <EmptyChildState />;
  }

  // اختيار أول ابن تلقائياً
  if (!selectedChild && children.length > 0 && !childrenLoading) {
    setSelectedChild(children[0].id);
  }

  const currentChild = children.find(c => c.id === selectedChild);

  // حساب الإحصائيات
  const pendingAssignments = assignments?.filter(
    a => !a.submissions?.[0] || a.submissions[0].status === 'pending'
  ).length || 0;

  const gradedAssignments = assignments?.filter(
    a => a.submissions?.[0]?.status === 'graded'
  ).length || 0;

  const pendingQuizzes = quizzes?.filter(
    q => !q.attempts || q.attempts.length === 0
  ).length || 0;

  const gradedQuizzes = quizzes?.filter(
    q => q.attempts?.some(att => att.status === 'graded')
  ).length || 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-primary-600" />
            نظرة عامة
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة أداء أبنائك بشكل سريع
          </p>
        </div>
        <ChildSelector selectedChildId={selectedChild} onSelect={setSelectedChild} />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {!selectedChild ? (
        <div className="text-center py-16 text-gray-500">يرجى اختيار ابن لمتابعة أدائه.</div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ترحيب بالابن */}
          <div className="bg-gradient-to-l from-primary-500 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 text-2xl font-bold">
                {currentChild?.name?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold">مرحباً بك، {currentChild?.name}</h2>
                <p className="text-sm text-white/90 mt-1 flex items-center gap-2">
                  <User size={14} /> الصف: {currentChild?.gradeLevel || 'غير محدد'}
                </p>
              </div>
            </div>
          </div>

          {/* الإحصائيات الأساسية */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* إجمالي النقاط */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star size={16} />
                </div>
                <span className="text-xs text-gray-500">النقاط</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports?.totalPoints || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">المستوى: {currentChild?.level || 1}</p>
            </div>

            {/* متوسط الدرجات */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <span className="text-xs text-gray-500">متوسط الدرجات</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {reports?.averageAssignmentGrade ? reports.averageAssignmentGrade.toFixed(1) : '-'}
              </p>
              <p className="text-xs text-gray-500 mt-1">من الواجبات المصححة</p>
            </div>

            {/* الواجبات المعلقة */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <span className="text-xs text-gray-500">واجبات معلقة</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {pendingAssignments}
              </p>
              <p className="text-xs text-gray-500 mt-1">من إجمالي {assignments?.length || 0} واجب</p>
            </div>

            {/* الاختبارات المعلقة */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ClipboardList size={16} />
                </div>
                <span className="text-xs text-gray-500">اختبارات لم تُؤدَّ</span>
              </div>
              <p className="text-2xl font-bold text-rose-600">
                {pendingQuizzes}
              </p>
              <p className="text-xs text-gray-500 mt-1">من إجمالي {quizzes?.length || 0} اختبار</p>
            </div>
          </div>

          {/* قوائم النشاطات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* آخر الواجبات */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText size={18} className="text-indigo-500" /> آخر الواجبات
                </h3>
                <button onClick={() => navigate('/parent/assignments')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  عرض الكل <ChevronLeft size={12} />
                </button>
              </div>
              {assignments?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد واجبات.</p>
              ) : (
                <div className="space-y-2">
                  {assignments?.slice(0, 4).map((a) => {
                    const sub = a.submissions?.[0];
                    const isGraded = sub?.status === 'graded';
                    const isSubmitted = sub?.status === 'submitted' || isGraded;
                    return (
                      <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</p>
                          <p className="text-xs text-gray-500">{a.subject?.name || ''}</p>
                        </div>
                        <div className="shrink-0 mr-2">
                          {isGraded ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                              <CheckCircle2 size={12} /> {sub.grade}
                            </span>
                          ) : isSubmitted ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                              <Clock size={12} /> بانتظار التصحيح
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                              <AlertCircle size={12} /> لم يُسلَّم
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* آخر الاختبارات */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClipboardList size={18} className="text-rose-500" /> آخر الاختبارات
                </h3>
                <button onClick={() => navigate('/parent/quizzes')} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  عرض الكل <ChevronLeft size={12} />
                </button>
              </div>
              {quizzes?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">لا توجد اختبارات.</p>
              ) : (
                <div className="space-y-2">
                  {quizzes?.slice(0, 4).map((q) => {
                    const attempt = q.attempts?.[0];
                    const isGraded = attempt?.status === 'graded';
                    return (
                      <div key={q.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{q.title}</p>
                          <p className="text-xs text-gray-500">{q.subject?.name || ''}</p>
                        </div>
                        <div className="shrink-0 mr-2">
                          {isGraded ? (
                            <span className={`flex items-center gap-1 text-xs font-bold ${attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {attempt.passed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                              {attempt.score ?? 0}
                            </span>
                          ) : attempt ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                              <Clock size={12} /> بانتظار التصحيح
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                              <Target size={12} /> لم يُؤدَّ
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ملخص أداء الأكاديمية (Reports) */}
          {reports && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Award size={18} className="text-primary-500" /> ملخص الأداء
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">المجموعات</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{reports.totalEnrollments || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">واجبات مصححة</p>
                  <p className="text-lg font-bold text-emerald-600">{reports.gradedSubmissions || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">اختبارات مصححة</p>
                  <p className="text-lg font-bold text-amber-600">{reports.gradedAttempts || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">نقاط</p>
                  <p className="text-lg font-bold text-primary-600">{reports.totalPoints || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
