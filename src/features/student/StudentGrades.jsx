import { useMemo, useState } from 'react';
import {
  Award,
  FileText,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  XCircle,
  BarChart3,
  Trophy,
  Target,
  Clock
} from 'lucide-react';
import useStudentGrades from '../hooks/useStudentGrades';

// ===== Helpers =====
function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function pct(part, total) {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 100);
}

// ===== Stat Card =====
function StatCard({ icon: Icon, label, value, suffix, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0`}
        >
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-gray-500 ms-1">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== Grade Row (Assignment) =====
function AssignmentGradeRow({ submission }) {
  const a = submission.assignment;
  const graded = submission.status === 'graded';
  const percentage = graded ? pct(submission.grade || 0, a?.maxPoints || 0) : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {a?.title || 'واجب'}
          </h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {submission.submittedAt && (
              <span>سلّمت {formatDate(submission.submittedAt)}</span>
            )}
            {graded && submission.gradedAt && (
              <span>اتصحح {formatDate(submission.gradedAt)}</span>
            )}
          </div>
          {graded && submission.feedback && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
              <span className="font-semibold">ملاحظات: </span>
              {submission.feedback}
            </p>
          )}
        </div>

        <div className="shrink-0 text-end">
          {graded ? (
            <>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {submission.grade}/{a?.maxPoints}
              </p>
              <p
                className={`text-xs font-semibold ${
                  percentage >= 50
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {percentage}%
              </p>
            </>
          ) : submission.status === 'returned' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-semibold">
              <RefreshCw size={12} />
              مرتجع
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <Clock size={12} />
              في انتظار التصحيح
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Grade Row (Quiz attempt) =====
function QuizAttemptGradeRow({ attempt, quizTitle, maxMarks }) {
  const graded = attempt.status === 'graded' && attempt.score != null;
  const percentage = graded
    ? Math.round(attempt.percentage || pct(attempt.score, attempt.maxScore || maxMarks))
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {quizTitle}
            <span className="text-xs text-gray-400 ms-2">
              (محاولة {attempt.attemptNumber})
            </span>
          </h3>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            {attempt.submittedAt && (
              <span>سلّمت {formatDate(attempt.submittedAt)}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-end">
          {graded ? (
            <>
              <p
                className={`text-lg font-bold ${
                  attempt.passed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {attempt.score}/{attempt.maxScore ?? maxMarks}
              </p>
              <p className="text-xs font-semibold inline-flex items-center gap-1">
                {attempt.passed ? (
                  <>
                    <CheckCircle2 size={12} className="text-green-600" />
                    <span className="text-green-600 dark:text-green-400">
                      ناجح
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={12} className="text-red-600" />
                    <span className="text-red-600 dark:text-red-400">
                      راسب
                    </span>
                  </>
                )}
                <span className="text-gray-400 ms-1">· {percentage}%</span>
              </p>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              في انتظار التصحيح
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Main =====
export default function StudentGrades() {
  const { submissions, quizzes, isLoading, error, refetch } = useStudentGrades();
  const [tab, setTab] = useState('overview');

  // حساب الإحصائيات
  const stats = useMemo(() => {
    // الواجبات المصححة
    const gradedAssignments = submissions.filter(
      (s) => s.status === 'graded' && s.grade != null
    );
    const assignmentPercentages = gradedAssignments.map((s) =>
      pct(s.grade, s.assignment?.maxPoints || 0)
    );

    // محاولات الاختبارات المصححة
    const gradedAttempts = [];
    quizzes.forEach((q) => {
      (q.attempts || []).forEach((a) => {
        if (a.status === 'graded' && a.score != null) {
          gradedAttempts.push({ ...a, quizTitle: q.title, totalMarks: q.totalMarks });
        }
      });
    });
    const attemptPercentages = gradedAttempts.map((a) =>
      Math.round(a.percentage || pct(a.score, a.maxScore || a.totalMarks))
    );

    const allPercentages = [...assignmentPercentages, ...attemptPercentages];
    const average =
      allPercentages.length > 0
        ? Math.round(
            allPercentages.reduce((a, b) => a + b, 0) / allPercentages.length
          )
        : 0;
    const highest =
      allPercentages.length > 0 ? Math.max(...allPercentages) : 0;

    const passedQuizzes = gradedAttempts.filter((a) => a.passed === true).length;

    return {
      gradedAssignments,
      gradedAttempts,
      average,
      highest,
      passedQuizzes,
      totalGraded: allPercentages.length,
    };
  }, [submissions, quizzes]);

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    {
      key: 'assignments',
      label: 'الواجبات',
      icon: FileText,
      count: stats.gradedAssignments.length,
    },
    {
      key: 'quizzes',
      label: 'الاختبارات',
      icon: ClipboardList,
      count: stats.gradedAttempts.length,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={36} className="text-red-500 mb-3" />
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
        >
          <RefreshCw size={16} /> حاول تاني
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award size={24} className="text-primary-600" />
          الدرجات
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          درجاتك في الواجبات والاختبارات
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="المتوسط العام"
          value={stats.average}
          suffix="%"
          color="blue"
        />
        <StatCard
          icon={Trophy}
          label="أعلى درجة"
          value={stats.highest}
          suffix="%"
          color="amber"
        />
        <StatCard
          icon={Target}
          label="اختبارات ناجحة"
          value={stats.passedQuizzes}
          color="green"
        />
        <StatCard
          icon={Award}
          label="عناصر مصححة"
          value={stats.totalGraded}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {t.count != null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {stats.totalGraded === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Inbox size={36} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                لسه مفيش درجات
              </h3>
              <p className="mt-1 text-sm text-gray-500 max-w-md">
                درجاتك هتظهر هنا أول ما المدرس يصحح واجباتك أو اختباراتك.
              </p>
            </div>
          ) : (
            <>
              {/* Average ring */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  المتوسط العام
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-800"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 42 * (1 - stats.average / 100)
                        }`}
                        className="text-primary-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.average}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">أعلى درجة</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.highest}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">عناصر مصححة</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalGraded}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent grades */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  آخر الدرجات
                </h3>
                <div className="space-y-2">
                  {stats.gradedAssignments.slice(0, 3).map((s) => (
                    <AssignmentGradeRow key={s.id} submission={s} />
                  ))}
                  {stats.gradedAttempts.slice(0, 3).map((a) => (
                    <QuizAttemptGradeRow
                      key={a.id}
                      attempt={a}
                      quizTitle={a.quizTitle}
                      maxMarks={a.totalMarks}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {tab === 'assignments' && (
        <div>
          {stats.gradedAssignments.length === 0 &&
          submissions.filter((s) => s.status !== 'graded').length === 0 ? (
            <EmptyState
              icon={FileText}
              title="مفيش واجبات مصححة"
              description="لسه مفيش واجبات اتصححت. أول ما المدرس يصحح، الدرجة هتظهر هنا."
            />
          ) : (
            <div className="space-y-2">
              {stats.gradedAssignments.map((s) => (
                <AssignmentGradeRow key={s.id} submission={s} />
              ))}
              {/* غير المصححة */}
              {submissions
                .filter((s) => s.status !== 'graded')
                .map((s) => (
                  <AssignmentGradeRow key={s.id} submission={s} />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {tab === 'quizzes' && (
        <div>
          {stats.gradedAttempts.length === 0 &&
          quizzes.every((q) => !q.attempts || q.attempts.length === 0) ? (
            <EmptyState
              icon={ClipboardList}
              title="مفيش اختبارات"
              description="لسه معملتش أي اختبار، أو مفيش اختبارات مصححة."
            />
          ) : (
            <div className="space-y-2">
              {stats.gradedAttempts.map((a) => (
                <QuizAttemptGradeRow
                  key={a.id}
                  attempt={a}
                  quizTitle={a.quizTitle}
                  maxMarks={a.totalMarks}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Empty State =====
function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon size={36} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 max-w-md">{description}</p>
    </div>
  );
}
