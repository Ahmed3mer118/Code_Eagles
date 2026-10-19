// src/features/student/pages/StudentDashboard.jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Award,
  Flame,
  Target,
  Layers,
  FileText,
  ClipboardList,
  Bell,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  BookOpen,
  Calendar,
  Zap,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import useStudentDashboard from '../hooks/useStudentDashboard';

// ============ Helpers ============
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const fmtTime = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const isUpcoming = (dateStr, daysAhead = 7) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= daysAhead;
};

const isPast = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

// ============ Components ============

function StatCard({ icon: Icon, label, value, suffix, color = 'indigo', hint }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-pink-600',
    violet: 'from-violet-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0 shadow-md`}
        >
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-gray-500 ms-1">
                {suffix}
              </span>
            )}
          </p>
          {hint && (
            <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ percent = 0, size = 140 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, percent) / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-500"
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {percent}%
        </span>
        <span className="text-[10px] text-gray-500">للمستوى القادم</span>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Icon size={16} className="text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          {action}
          <ArrowLeft size={12} />
        </button>
      )}
    </div>
  );
}

function UpcomingItem({ type, title, date, onClick }) {
  const isQuiz = type === 'quiz';
  const urgent = isUpcoming(date, 2);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-right"
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isQuiz
            ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
        }`}
      >
        {isQuiz ? <ClipboardList size={16} /> : <FileText size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar size={10} />
          {fmtDate(date)}
          {urgent && (
            <span className="text-red-600 font-bold">
              · {fmtTime(date)}
            </span>
          )}
        </p>
      </div>
      {urgent && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 font-bold">
          قريب
        </span>
      )}
    </button>
  );
}

// ============ Main ============
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    points,
    leaderboard,
    enrollments,
    assignments,
    quizzes,
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
  } = useStudentDashboard();

  // ============ Computed Data ============
  const computed = useMemo(() => {
    const totalPoints = points?.totalPoints ?? 0;
    const level = points?.level ?? 1;
    const xp = points?.xp ?? 0;
    const nextLevelXp = points?.nextLevelXp ?? 0;
    const currentLevelXp = points?.currentLevelXp ?? 0;
    const progressPercent = points?.progressPercent ?? 0;

    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'active',
    );

    // الواجبات والاختبارات القادمة (خلال 7 أيام)
    const upcomingAssignments = assignments
      .filter((a) => a.dueDate && isUpcoming(a.dueDate, 7))
      .map((a) => ({
        id: a.id,
        type: 'assignment',
        title: a.title,
        date: a.dueDate,
      }));

    const upcomingQuizzes = quizzes
      .filter(
        (q) =>
          (q.dueDate || q.endDate || q.availableUntil) &&
          isUpcoming(q.dueDate || q.endDate || q.availableUntil, 7),
      )
      .map((q) => ({
        id: q.id,
        type: 'quiz',
        title: q.title,
        date: q.dueDate || q.endDate || q.availableUntil,
      }));

    const upcoming = [...upcomingAssignments, ...upcomingQuizzes].sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    // آخر النقاط
    const recentLogs = (points?.recentLogs || points?.logs || []).slice(0, 5);

    return {
      totalPoints,
      level,
      xp,
      nextLevelXp,
      currentLevelXp,
      progressPercent,
      activeEnrollments,
      upcoming,
      recentLogs,
    };
  }, [points, enrollments, assignments, quizzes]);

  // ============ Loading ============
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
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
          حاول تاني
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {/* Welcome Header */}
      <div className="bg-gradient-to-l from-primary-500 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-90 mb-1">
              أهلاً بيك تاني 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user?.name || 'طالب'}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              استمر في التقدم وحقق أهدافك
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Star}
          label="إجمالي النقاط"
          value={computed.totalPoints}
          color="amber"
        />
        <StatCard
          icon={Award}
          label="المستوى"
          value={`Lv.${computed.level}`}
          color="indigo"
          hint={`${computed.xp} XP`}
        />
        <StatCard
          icon={Layers}
          label="المجموعات"
          value={computed.activeEnrollments.length}
          color="emerald"
          hint="نشطة"
        />
        <StatCard
          icon={Bell}
          label="إشعارات"
          value={unreadCount}
          color="rose"
          hint="غير مقروءة"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Level Progress + Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Level Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-orange-500" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                تقدمك في المستوى
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ProgressRing percent={computed.progressPercent} />
              <div className="flex-1 text-center sm:text-right">
                <p className="text-2xl font-bold text-primary-600 mb-1">
                  المستوى {computed.level}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {computed.currentLevelXp} / {computed.nextLevelXp} XP
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Target size={14} className="text-amber-600" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    تحتاج{' '}
                    {Math.max(
                      0,
                      computed.nextLevelXp - computed.currentLevelXp,
                    )}{' '}
                    XP للوصول للمستوى {computed.level + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <SectionHeader
              icon={TrendingUp}
              title="آخر نشاطاتك"
              subtitle="النقاط الأخيرة"
              action="عرض الكل"
              onAction={() => navigate('/student/points')}
            />

            {computed.recentLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Star size={28} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  لسه مفيش نشاطات. المدرس هيضيفلك نقاط على مشاركتك
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {computed.recentLogs.map((log) => {
                  const pts = Number(log.points || 0);
                  const isPositive = pts > 0;
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isPositive
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {log.reason || '—'}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {fmtDate(log.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold shrink-0 ${
                          isPositive
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {pts}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming + Leaderboard */}
        <div className="space-y-4">
          {/* Upcoming */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <SectionHeader
              icon={Calendar}
              title="القادم قريباً"
              subtitle="خلال 7 أيام"
              action="الكل"
              onAction={() => navigate('/student/assignments')}
            />

            {computed.upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  مفيش حاجة قادمة. أنت متابع كويس!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {computed.upcoming.slice(0, 4).map((item) => (
                  <UpcomingItem
                    key={item.id}
                    type={item.type}
                    title={item.title}
                    date={item.date}
                    onClick={() =>
                      navigate(
                        item.type === 'quiz'
                          ? `/student/quizzes`
                          : `/student/assignments`,
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Top 3 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <SectionHeader
              icon={Trophy}
              title="المتصدرين"
              subtitle="أفضل 5 طلاب"
              action="الكل"
              onAction={() => navigate('/student/leaderboard')}
            />

            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Crown size={28} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  لسه مفيش متصدرين
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {leaderboard.slice(0, 5).map((entry, idx) => {
                  const rank = entry.rank || idx + 1;
                  return (
                    <div
                      key={entry.studentId || entry.id || idx}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        rank === 1
                          ? 'bg-gradient-to-l from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          rank === 1
                            ? 'bg-yellow-500 text-white'
                            : rank === 2
                              ? 'bg-gray-400 text-white'
                              : rank === 3
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {rank}
                      </div>
                      {entry.profileImageUrl ? (
                        <img
                          src={entry.profileImageUrl}
                          alt={entry.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {entry.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {entry.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 shrink-0">
                        <Star size={10} />
                        <span className="text-xs font-bold">
                          {entry.totalPoints}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Preview */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <SectionHeader
            icon={Bell}
            title="آخر الإشعارات"
            subtitle={`${unreadCount} غير مقروء`}
            action="الكل"
            onAction={() => navigate('/student/notifications')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {notifications.slice(0, 6).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border ${
                  !n.read
                    ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      !n.read ? 'bg-primary-500' : 'bg-gray-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                      {typeof n.title === 'object'
                        ? n.title?.ar || n.title?.en
                        : n.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {typeof n.body === 'object'
                        ? n.body?.ar || n.body?.en
                        : n.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/student/assignments')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <FileText size={18} className="text-blue-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            الواجبات
          </p>
          <p className="text-xs text-gray-500">{assignments.length} واجب</p>
        </button>

        <button
          onClick={() => navigate('/student/quizzes')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-violet-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <ClipboardList size={18} className="text-violet-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            الاختبارات
          </p>
          <p className="text-xs text-gray-500">{quizzes.length} اختبار</p>
        </button>

        <button
          onClick={() => navigate('/student/grades')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-emerald-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <Award size={18} className="text-emerald-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            درجاتي
          </p>
          <p className="text-xs text-gray-500">شوف نتائجك</p>
        </button>

        <button
          onClick={() => navigate('/student/points')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-amber-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <Star size={18} className="text-amber-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">
            نقاطي
          </p>
          <p className="text-xs text-gray-500">{computed.totalPoints} نقطة</p>
        </button>
      </div>
    </div>
  );
}
