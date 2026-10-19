import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Award,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Calendar,
  Trophy,
} from 'lucide-react';
import useStudentQuizzes from '../hooks/useStudentQuizzes';

// ===== Helpers =====
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * تحديد حالة الاختبار من منظور الطالب
 */
function getQuizStatus(quiz) {
  const now = new Date();
  const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
  const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

  const attempts = quiz.attempts || [];
  const bestAttempt = attempts[0]; // الأحدث
  const attemptsUsed = attempts.length;
  const maxAttempts = quiz.maxAttempts || 1;

  // لو مفيش محاولات
  if (attemptsUsed === 0) {
    if (startDate && now < startDate) return 'not_started';
    if (endDate && now > endDate) return 'ended';
    return 'available';
  }

  // لو في محاولة جارية
  const inProgress = attempts.find((a) => a.status === 'in_progress');
  if (inProgress) return 'in_progress';

  // لو استهلك كل المحاولات أو خلص ونجح
  if (bestAttempt?.passed === true) return 'passed';
  if (attemptsUsed >= maxAttempts) return 'failed_attempts';

  return 'retry_available';
}

const STATUS_META = {
  available: {
    label: 'متاح',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    icon: PlayCircle,
  },
  in_progress: {
    label: 'قيد الأداء',
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  not_started: {
    label: 'لم يبدأ بعد',
    color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
    icon: Calendar,
  },
  ended: {
    label: 'انتهى',
    color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    icon: XCircle,
  },
  passed: {
    label: 'ناجح',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    icon: CheckCircle2,
  },
  failed_attempts: {
    label: 'انتهت المحاولات',
    color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    icon: AlertCircle,
  },
  retry_available: {
    label: 'تقدر تعيد',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    icon: RefreshCw,
  },
};

// ===== Skeleton =====
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20" />
      </div>
    </div>
  );
}

// ===== Quiz Card =====
function QuizCard({ quiz }) {
  const navigate = useNavigate();
  const status = getQuizStatus(quiz);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const attempts = quiz.attempts || [];
  const latestAttempt = attempts[0];
  const attemptsUsed = attempts.length;
  const maxAttempts = quiz.maxAttempts || 1;

  const canStart =
    status === 'available' ||
    status === 'retry_available' ||
    status === 'in_progress';

  const handleClick = () => {
    if (status === 'in_progress' && latestAttempt) {
      // كمل المحاولة اللي بدأت
      navigate(`/student/quizzes/${quiz.id}/take?attempt=${latestAttempt.id}`);
    } else if (canStart) {
      navigate(`/student/quizzes/${quiz.id}/take`);
    } else if (latestAttempt) {
      navigate(`/student/quizzes/${quiz.id}/result/${latestAttempt.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
          {quiz.title}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${meta.color}`}
        >
          <StatusIcon size={12} />
          {meta.label}
        </span>
      </div>

      {quiz.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {quiz.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
        {quiz.subject?.name && (
          <span className="inline-flex items-center gap-1">
            <ClipboardList size={12} />
            {quiz.subject.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          {quiz.durationMinutes} دقيقة
        </span>
        <span className="inline-flex items-center gap-1">
          <Award size={12} />
          {quiz.totalMarks} درجة
        </span>
      </div>

      {/* Attempts info */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            المحاولات
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {attemptsUsed} / {maxAttempts}
          </span>
        </div>

        {/* Best score */}
        {latestAttempt?.score != null && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Trophy size={12} />
              أفضل نتيجة
            </span>
            <span
              className={`font-bold ${
                latestAttempt.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {Math.round(latestAttempt.percentage || 0)}%
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={handleClick}
        disabled={!canStart && !latestAttempt}
        className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
          canStart
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : latestAttempt
            ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
        }`}
      >
        {status === 'in_progress'
          ? 'كمل المحاولة'
          : canStart
          ? 'ابدأ الاختبار'
          : latestAttempt
          ? 'شوف النتيجة'
          : 'غير متاح'}
      </button>
    </div>
  );
}

// ===== Main =====
export default function StudentQuizzes() {
  const { quizzes, isLoading, error, refetch } = useStudentQuizzes();
  const [activeFilter, setActiveFilter] = useState('all');

  const counts = useMemo(() => {
    const c = {
      all: quizzes.length,
      available: 0,
      in_progress: 0,
      completed: 0,
    };
    quizzes.forEach((q) => {
      const s = getQuizStatus(q);
      if (s === 'available' || s === 'retry_available' || s === 'not_started') c.available += 1;
      else if (s === 'in_progress') c.in_progress += 1;
      else c.completed += 1;
    });
    return c;
  }, [quizzes]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return quizzes;
    return quizzes.filter((q) => {
      const s = getQuizStatus(q);
      if (activeFilter === 'available')
        return s === 'available' || s === 'retry_available' || s === 'not_started';
      if (activeFilter === 'in_progress') return s === 'in_progress';
      return s === 'passed' || s === 'failed_attempts' || s === 'ended';
    });
  }, [quizzes, activeFilter]);

  const filters = [
    { key: 'all', label: 'الكل', count: counts.all },
    { key: 'available', label: 'متاح', count: counts.available },
    { key: 'in_progress', label: 'قيد الأداء', count: counts.in_progress },
    { key: 'completed', label: 'خلصت', count: counts.completed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList size={24} className="text-indigo-600" />
          الاختبارات
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isLoading
            ? 'جاري التحميل...'
            : quizzes.length > 0
            ? `${quizzes.length} اختبار`
            : 'الاختبارات المتاحة ليك'}
        </p>
      </div>

      {!isLoading && quizzes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {f.label} ({f.count})
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle size={36} className="text-red-500 mb-3" />
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold"
          >
            <RefreshCw size={16} /> حاول تاني
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Inbox size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مفيش اختبارات
          </h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md">
            {activeFilter === 'all'
              ? 'مفيش اختبارات متاحة ليك دلوقتي.'
              : 'مفيش اختبارات في الفلتر ده.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      )}
    </div>
  );
}
