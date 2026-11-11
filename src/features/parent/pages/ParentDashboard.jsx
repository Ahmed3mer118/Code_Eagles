// src/features/parent/pages/ParentDashboard.jsx  (النسخة النهائية)
import { useState, useEffect } from 'react';
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
  RefreshCw,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import ChildSelector from '../components/ChildSelector';
import EmptyChildState from '../components/EmptyChildState';
import useParentChildren from '../hooks/useParentChildren';
import useParentDashboard from '../hooks/useParentDashboard';

/* ═══════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════ */
const formatArabicDate = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatRelativeTime = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return formatArabicDate(date);
};

const daysUntil = (d) => {
  if (!d) return null;
  const now = new Date();
  return Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const ACTIVITY_COLORS = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
};

/* ═══════════════════════════════════════════════════
   Small UI sub-components
   ═══════════════════════════════════════════════════ */

/** بطاقة إحصائية */
function StatCard({ icon: Icon, label, value, suffix, tone = 'primary', hint }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon size={20} />
        </div>
        {hint && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {hint}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
        {suffix && <span className="text-sm font-medium text-gray-400 mr-1">{suffix}</span>}
      </p>
    </div>
  );
}

/** شريط تقدم */
function ProgressBar({ value = 0, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };
  const safe = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full ${tones[tone]} transition-all duration-500`}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

/** Empty state صغير */
function EmptyBlock({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
        <Icon size={26} className="text-gray-400" />
      </div>
      <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */
export default function ParentDashboard() {
  const navigate = useNavigate();
  const { children, loading: childrenLoading } = useParentChildren();
  const [selectedChildId, setSelectedChildId] = useState(null);

  // ✅ اختيار أول ابن تلقائياً — جوه useEffect (مش render)
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const {
    reports,
    assignments,
    quizzes,
    points,
    stats,
    recentActivity,
    upcomingDeadlines,
    loading,
    error,
    lastUpdated,
    refetch,
  } = useParentDashboard(selectedChildId);

  const currentChild = children.find((c) => c.id === selectedChildId);

  /* ─── 1. مفيش أبناء ─── */
  if (childrenLoading) {
    return (
      <div className="flex justify-center items-center py-32" dir="rtl">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (children.length === 0) {
    return <EmptyChildState />;
  }

  /* ─── 2. الصفحة الكاملة ─── */
  return (
    <div className="space-y-6 pb-10" dir="rtl">
      {/* ═══ Header ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-primary-600" />
            نظرة عامة
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            متابعة أداء أبنائك بشكل سريع
            {lastUpdated && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                • آخر تحديث {formatRelativeTime(lastUpdated)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <ChildSelector selectedChildId={selectedChildId} onSelect={setSelectedChildId} />
        </div>
      </div>

      {/* ═══ Error ═══ */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm flex items-center gap-2 border border-red-200 dark:border-red-800">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ═══ Loading ═══ */}
      {loading && !reports && assignments.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ═══ Hero: welcome + level ═══ */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary-600 via-indigo-600 to-violet-600 p-6 text-white">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 text-2xl font-bold overflow-hidden">
                  {currentChild?.profileImageUrl ? (
                    <img
                      src={currentChild.profileImageUrl}
                      alt={currentChild.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentChild?.name?.charAt(0) || '?'
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">مرحباً بك، {currentChild?.name}</h2>
                  <p className="text-sm text-white/90 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User size={14} /> الصف: {currentChild?.gradeLevel || 'غير محدد'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={14} /> المستوى: {stats.level}
                    </span>
                  </p>
                </div>
              </div>

              {/* Level progress */}
              <div className="sm:w-64">
                <div className="flex items-center justify-between text-xs text-white/90 mb-1.5">
                  <span className="flex items-center gap-1"><Zap size={12} /> {stats.xp} XP</span>
                  <span>{stats.totalPoints} نقطة</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.xp % 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/70 mt-1.5">
                  باقي {100 - (stats.xp % 100)} XP للمستوى {stats.level + 1}
                </p>
              </div>
            </div>
          </div>

          {/* ═══ Stats grid ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Star}
              label="النقاط الكلية"
              value={stats.totalPoints}
              tone="amber"
              hint={`Lv. ${stats.level}`}
            />
            <StatCard
              icon={TrendingUp}
              label="متوسط الدرجات"
              value={stats.avgGrade}
              suffix={stats.avgGrade !== '—' ? '%' : ''}
              tone="emerald"
              hint="من الواجبات المصححة"
            />
            <StatCard
              icon={FileText}
              label="واجبات معلقة"
              value={stats.pendingAssignments}
              tone="indigo"
              hint={`من ${stats.totalAssignments}`}
            />
            <StatCard
              icon={ClipboardList}
              label="اختبارات لم تُؤدَّ"
              value={stats.notAttemptedQuizzes}
              tone="rose"
              hint={`من ${stats.totalQuizzes}`}
            />
          </div>

          {/* ═══ Progress overview ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* نسبة الإنجاز */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Target size={16} className="text-primary-500" /> نسبة الإنجاز
                </h3>
                <span className="text-2xl font-bold text-primary-600">{stats.completionRate}%</span>
              </div>
              <ProgressBar value={stats.completionRate} tone="primary" />
              <p className="text-xs text-gray-500 mt-2">
                من إجمالي {stats.totalAssignments + stats.totalQuizzes} مهمة
              </p>
            </div>

            {/* الواجبات */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <FileText size={16} className="text-indigo-500" /> الواجبات
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={12} /> مصححة</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.gradedAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-600"><Clock size={12} /> بانتظار التصحيح</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.pendingAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-rose-600"><AlertCircle size={12} /> لم تُسلَّم</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.notSubmittedAssignments}</span>
                </div>
              </div>
            </div>

            {/* الاختبارات */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm mb-3">
                <ClipboardList size={16} className="text-rose-500" /> الاختبارات
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-600"><Award size={12} /> ناجحة</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.passedQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-amber-600"><Clock size={12} /> بانتظار التصحيح</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.pendingQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-500"><Target size={12} /> لم تُؤدَّ</span>
                  <span className="font-bold text-gray-900 dark:text-white">{stats.notAttemptedQuizzes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Two columns: Upcoming + Activity ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ═ أقرب المواعيد ═ */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-amber-500" /> أقرب المواعيد
                </h3>
                <span className="text-[10px] text-gray-400 font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {upcomingDeadlines.length}
                </span>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <EmptyBlock
                  icon={CheckCircle2}
                  title="لا توجد مواعيد قريبة"
                  subtitle="كل حاجة محدّثة ✨"
                />
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((item) => {
                    const days = daysUntil(item.dueDate);
                    const isUrgent = days !== null && days <= 2;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isUrgent
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                          }`}
                        >
                          {item.type === 'assignment' ? <FileText size={18} /> : <ClipboardList size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.subject} • {formatArabicDate(item.dueDate)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg ${
                            isUrgent
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                          }`}
                        >
                          {days === 0 ? 'اليوم' : days === 1 ? 'غداً' : `بعد ${days} يوم`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═ آخر الأنشطة ═ */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-primary-500" /> آخر الأنشطة
                </h3>
              </div>
              {recentActivity.length === 0 ? (
                <EmptyBlock
                  icon={Sparkles}
                  title="لا توجد أنشطة بعد"
                  subtitle="هتظهر هنا آخر التصحيحات والتسليمات"
                />
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((act, i) => {
                    const tone = ACTIVITY_COLORS[act.color] || ACTIVITY_COLORS.indigo;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone.bg}`}
                        >
                          {act.icon === 'check' ? (
                            <CheckCircle2 size={14} className={tone.text} />
                          ) : (
                            <Clock size={14} className={tone.text} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {act.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {act.subtitle} • {formatRelativeTime(act.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ═══ Quick links ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'الواجبات', icon: FileText, to: '/parent/assignments', tone: 'indigo' },
              { label: 'الاختبارات', icon: ClipboardList, to: '/parent/quizzes', tone: 'rose' },
              { label: 'الدرجات', icon: Award, to: '/parent/grades', tone: 'emerald' },
              { label: 'النقاط', icon: Star, to: '/parent/points', tone: 'amber' },
            ].map((link) => {
              const tone = ACTIVITY_COLORS[link.tone] || ACTIVITY_COLORS.indigo;
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone.bg}`}>
                      <link.icon size={18} className={tone.text} />
                    </div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{link.label}</span>
                  </div>
                  <ChevronLeft size={16} className="text-gray-400 group-hover:text-primary-600 transition" />
                </button>
              );
            })}
          </div>

          {/* ═══ Reports summary (لو reports موجود) ═══ */}
          {reports && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <Award size={16} className="text-primary-500" /> ملخص الأداء العام
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">المجموعات</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalEnrollments}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">واجبات مصححة</p>
                  <p className="text-xl font-bold text-emerald-600">{stats.gradedSubmissions}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">اختبارات مصححة</p>
                  <p className="text-xl font-bold text-amber-600">{stats.gradedAttempts}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">نقاط</p>
                  <p className="text-xl font-bold text-primary-600">{stats.totalPoints}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}