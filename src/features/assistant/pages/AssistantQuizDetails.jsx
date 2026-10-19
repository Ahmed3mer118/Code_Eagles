// src/features/assistant/pages/AssistantQuizDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Eye,
} from 'lucide-react';
import teacherApi from '../../../shared/api/teacherApi';
import PermissionGate from '../components/PermissionGate';

const STATUS_LABELS = {
  in_progress: 'قيد التنفيذ',
  submitted: 'بانتظار التصحيح',
  graded: 'تم التصحيح',
  cancelled: 'ملغي',
};

const STATUS_COLORS = {
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  submitted: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  graded: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function AssistantQuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attempts');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [quizRes, attemptsRes] = await Promise.allSettled([
          teacherApi.getQuiz(id),
          teacherApi.getQuizAttempts(id, { limit: 100 }),
        ]);

        if (quizRes.status === 'fulfilled') {
          const p = quizRes.value?.data?.data ?? quizRes.value?.data ?? quizRes.value;
          setQuiz(p);
        } else {
          throw new Error(
            quizRes.reason?.response?.data?.message || 'فشل تحميل الاختبار',
          );
        }

        if (attemptsRes.status === 'fulfilled') {
          const p = attemptsRes.value?.data?.data ?? attemptsRes.value?.data ?? attemptsRes.value;
          const items = Array.isArray(p) ? p : p?.data ?? p?.items ?? [];
          setAttempts(items);
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'فشل تحميل بيانات الاختبار');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/assistant/quizzes')}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg"
        >
          رجوع للاختبارات
        </button>
      </div>
    );
  }

  return (
    <PermissionGate
      permission="quizzes.view"
      fallback={
        <div className="text-center py-16">
          <AlertCircle size={36} className="text-amber-500 mb-3" />
          <p className="text-sm text-gray-500">ليس لديك صلاحية لعرض هذا الاختبار.</p>
        </div>
      }
    >
      <div className="space-y-5" dir="rtl">
        <button
          onClick={() => navigate('/assistant/quizzes')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <ArrowRight size={16} /> رجوع للاختبارات
        </button>

        {/* Header */}
        <div className="bg-gradient-to-l from-primary-500 to-indigo-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{quiz?.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm opacity-90 mt-2">
            {quiz?.subject?.name && <span>📚 {quiz.subject.name}</span>}
            <span>⏱ {quiz?.durationMinutes} دقيقة</span>
            <span>📊 {quiz?.totalMarks} درجة</span>
            <span>🎯 نجاح: {quiz?.passingMarks} درجة</span>
            <span>🔄 محاولات: {quiz?.maxAttempts}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={14} className="text-primary-500" />
              <span className="text-xs text-gray-500">الأسئلة</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quiz?._count?.questions ?? quiz?.questions?.length ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-indigo-500" />
              <span className="text-xs text-gray-500">المحاولات</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {attempts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs text-gray-500">ناجحون</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {attempts.filter(a => a.passed === true).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={14} className="text-red-500" />
              <span className="text-xs text-gray-500">راسبون</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {attempts.filter(a => a.passed === false).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('attempts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'attempts'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Users size={16} />
            المحاولات ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'details'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <ClipboardList size={16} />
            تفاصيل الاختبار
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          {activeTab === 'attempts' && (
            <div>
              {attempts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  لا توجد محاولات لهذا الاختبار بعد.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {attempts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 flex flex-wrap items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold shrink-0">
                        {a.student?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {a.student?.name || 'طالب'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {a.student?.email || ''}
                        </p>
                        {a.submittedAt && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {new Date(a.submittedAt).toLocaleString('ar-EG')}
                          </p>
                        )}
                      </div>

                      {/* عدد المحاولة */}
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                        محاولة #{a.attemptNumber}
                      </span>

                      {/* النتيجة */}
                      {a.status === 'graded' ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${
                              a.passed
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {a.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {a.score}/{a.maxScore || quiz?.totalMarks}
                          </span>
                          {a.percentage != null && (
                            <span className="text-xs text-gray-500">
                              {Number(a.percentage).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-bold shrink-0 ${
                            STATUS_COLORS[a.status] || ''
                          }`}
                        >
                          {STATUS_LABELS[a.status] || a.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-3">
              {quiz?.description && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    الوصف
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {quiz.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">وقت البدء</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {quiz?.startDate
                      ? new Date(quiz.startDate).toLocaleString('ar-EG')
                      : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">وقت الانتهاء</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {quiz?.endDate
                      ? new Date(quiz.endDate).toLocaleString('ar-EG')
                      : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">إظهار الإجابات</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {quiz?.showCorrectAnswers ? 'نعم' : 'لا'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">وضع النتائج</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {quiz?.resultMode === 'instant'
                      ? 'فوري'
                      : quiz?.resultMode === 'manual'
                        ? 'يدوي'
                        : 'بعد الانتهاء'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}
