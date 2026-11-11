// src/features/teacher/pages/DashboardOverview.jsx
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useI18n } from '../../../shared/i18n';
import teacherApi from '../../../shared/api/teacherApi';
import {
  Users, BookOpen, Wallet, TrendingUp, Layers, AlertCircle,
  ArrowUpRight, ArrowDownRight, Minus, Sparkles, CalendarDays,
  GraduationCap, CircleDollarSign, Banknote, Receipt, CreditCard,
  ArrowRight, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ============================================================
   Helpers
============================================================ */
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);
const num = (v) => (typeof v === 'number' ? v : Number(v) || 0);

function formatCurrency(value, lang) {
  if (value === undefined || value === null) return '—';
  const n = num(value);
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} ج.م`;
  }
}

function formatNumber(value, lang) {
  if (value === undefined || value === null) return '—';
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(num(value));
  } catch {
    return String(num(value));
  }
}

function formatMonthLabel(raw, lang) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    year: '2-digit',
  });
}

/* ============================================================
   Trend Badge
============================================================ */
function TrendBadge({ value }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Minus size={11} /> —
      </span>
    );
  }
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        positive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      }`}
    >
      <Icon size={11} />
      {Math.abs(value)}%
    </span>
  );
}

/* ============================================================
   StatCard
============================================================ */
function StatCard({ icon: Icon, label, value, trend, accent = 'indigo', hint }) {
  const accents = {
    indigo: {
      bar: 'bg-indigo-500',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
      ring: 'ring-indigo-500/10',
      glow: 'group-hover:shadow-indigo-200/50',
    },
    sky: {
      bar: 'bg-sky-500',
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
      ring: 'ring-sky-500/10',
      glow: 'group-hover:shadow-sky-200/50',
    },
    amber: {
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
      ring: 'ring-amber-500/10',
      glow: 'group-hover:shadow-amber-200/50',
    },
    emerald: {
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
      ring: 'ring-emerald-500/10',
      glow: 'group-hover:shadow-emerald-200/50',
    },
  };
  const a = accents[accent] || accents.indigo;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${a.glow} dark:hover:shadow-black/30`}
    >
      <span className={`absolute inset-y-4 start-0 w-1 rounded-e-full ${a.bar} opacity-80`} />

      <div className="flex items-start justify-between ps-3">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ring-4 ${a.iconBg} ${a.ring} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={20} />
        </div>
        <TrendBadge value={trend} />
      </div>

      <div className="mt-4 ps-3">
        <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-[26px] leading-tight font-bold text-gray-900 dark:text-white tracking-tight">
          {value ?? '—'}
        </p>
        {hint && (
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ChartCard
============================================================ */
function ChartCard({ title, subtitle, icon: Icon, iconClass, action, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col ${className}`}
    >
      <header className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}>
            <Icon size={17} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

/* ============================================================
   Custom Tooltip
============================================================ */
function SoftTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-3 py-2 text-xs">
      {label && (
        <div className="font-semibold text-gray-900 dark:text-white mb-1">{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color || p.payload?.fill || '#6366f1' }}
          />
          <span>{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Summary Row
============================================================ */
function SummaryRow({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon size={15} />
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 dark:text-white text-[15px]">{value}</span>
    </div>
  );
}

/* ============================================================
   Skeleton
============================================================ */
function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Revenue Breakdown Section
============================================================ */
function RevenueSection({ stats, lang }) {
  const total = num(stats?.totalRevenue);
  const pending = num(stats?.pendingRevenue);
  const collected = num(stats?.collectedRevenue || total);
  const thisMonth = num(stats?.revenueThisMonth);

  const breakdown = [
    {
      icon: Banknote,
      label: lang === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: formatCurrency(total, lang),
      bg: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      icon: Receipt,
      label: lang === 'ar' ? 'المحصّل' : 'Collected',
      value: formatCurrency(collected, lang),
      bg: 'from-sky-500 to-sky-600',
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    },
    {
      icon: CreditCard,
      label: lang === 'ar' ? 'مدفوعات معلّقة' : 'Pending Payments',
      value: formatCurrency(pending, lang),
      bg: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    },
    {
      icon: TrendingUp,
      label: lang === 'ar' ? 'إيراد هذا الشهر' : 'This Month',
      value: formatCurrency(thisMonth, lang),
      bg: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gradient-to-br from-emerald-50/60 via-white to-sky-50/60 dark:from-emerald-950/20 dark:via-gray-900 dark:to-sky-950/20 p-5 lg:p-6">
      <div className="pointer-events-none absolute -top-20 -end-20 w-64 h-64 rounded-full bg-emerald-200/30 dark:bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-10 w-64 h-64 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CircleDollarSign size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {lang === 'ar' ? 'الإيرادات' : 'Revenue'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'ar'
                ? 'نظرة شاملة على إيرادات أكاديميتك'
                : 'A complete overview of your academy revenue'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {breakdown.map(({ icon: Icon, label, value, bg, iconBg }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-900/70 backdrop-blur border border-gray-200/70 dark:border-gray-800 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${bg}`} />
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
                <Icon size={16} />
              </div>
              <p className="text-[11.5px] font-medium text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Empty State
============================================================ */
function EmptyState({ label }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        <Sparkles size={18} />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label || 'لا توجد بيانات'}</p>
    </div>
  );
}

/* ============================================================
   Main Component
============================================================ */
export default function DashboardOverview() {
  const { user, activeTenant } = useAuth();
  const { t, lang } = useI18n();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashRes, statsRes] = await Promise.allSettled([
          teacherApi.getDashboard(),
          teacherApi.getStats(),
        ]);

        if (!mounted) return;

        const extract = (res) => {
          if (res.status !== 'fulfilled') return {};
          const r = res.value?.data;
          if (!r) return {};
          return r?.data ?? r;
        };

        const dashData = extract(dashRes);
        const statsData = extract(statsRes);

        // السيرفر بيرجع الداتا جوه { stats: { ... } } في الداشبورد
        // وفي getStats بيرجعها دايركت. بنضرب الاتنين في بعض.
        const flatStats = statsData?.stats ? { ...statsData, ...statsData.stats } : statsData;
        const flatDash = dashData?.stats ? { ...dashData, ...dashData.stats } : dashData;

        const merged = { ...flatDash, ...flatStats };

        if (dashRes.status === 'rejected' && statsRes.status === 'rejected') {
          throw new Error(
            dashRes.reason?.message ||
              statsRes.reason?.message ||
              'Failed to load dashboard',
          );
        }

        setStats(merged);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- derive data ---------- */
  const students = num(pick(stats?.totalStudents, stats?.studentsCount, stats?.students?.total));
  const groups = num(pick(stats?.totalGroups, stats?.groupsCount, stats?.groups?.total));
  const subjects = num(pick(stats?.totalSubjects, stats?.subjectsCount, stats?.subjects?.total));
  
  // ✅ قراءة الإيرادات
  const revenue = pick(stats?.totalRevenue, stats?.revenue, stats?.revenue?.total);

  const trends = {
    students: pick(stats?.studentsTrend, stats?.trends?.students),
    groups: pick(stats?.groupsTrend, stats?.trends?.groups),
    subjects: pick(stats?.subjectsTrend, stats?.trends?.subjects),
    revenue: pick(stats?.revenueTrend, stats?.trends?.revenue),
  };

  const studentsGroupsData = useMemo(
    () => [
      { name: t('teacher.dashboard.charts.students'), value: students },
      { name: t('teacher.dashboard.charts.groups'), value: groups },
      { name: t('teacher.dashboard.charts.subjects'), value: subjects },
    ],
    [students, groups, subjects, t],
  );

  const subjectsDistribution = useMemo(() => {
    const arr =
      stats?.subjectsDistribution ||
      stats?.subjects?.distribution ||
      stats?.distribution ||
      [];
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map((s) => ({
        name: s.name || s.subjectName || s.subject || '—',
        value: num(pick(s.count, s.value, s.studentsCount, s.students)),
      }));
    }
    if (subjects > 0) {
      return [{ name: t('teacher.dashboard.charts.subjects'), value: subjects }];
    }
    return [];
  }, [stats, subjects, t]);

  // ✅ قراءة شارت الإيرادات
  const revenueSeries = useMemo(() => {
    const arr = stats?.revenueByMonth || [];
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map((r) => ({
        name: formatMonthLabel(r.month, lang),
        value: num(r.amount),
      }));
    }
    return [];
  }, [stats, lang]);

  const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
  const dateLocale = lang === 'ar' ? 'ar-EG' : 'en-US';

  const todayLabel = new Date().toLocaleDateString(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /* ---------- states ---------- */
  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            {lang === 'ar' ? 'تعذّر تحميل البيانات' : 'Failed to load data'}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950/40 dark:via-gray-900 dark:to-sky-950/30 p-6 lg:p-7">
        <div className="pointer-events-none absolute -top-16 -end-16 w-56 h-56 rounded-full bg-indigo-200/30 dark:bg-indigo-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 w-56 h-56 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-2xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 bg-white/70 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
              <Sparkles size={12} />
              {t('teacher.dashboard.welcome') || 'Welcome back'}
            </div>
            <h1 className="mt-3 text-2xl lg:text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {t('teacher.dashboard.welcome')}, {user?.name || 'Teacher'} 👋
            </h1>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <BookOpen size={14} />
              {activeTenant?.tenantName || activeTenant?.name || 'Academy'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 text-[12.5px] text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-900/70 backdrop-blur px-3.5 py-2 rounded-lg border border-gray-200/70 dark:border-gray-800">
              <CalendarDays size={14} className="text-indigo-500" />
              {todayLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ============ STAT CARDS ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('teacher.dashboard.stats.students')}
          value={formatNumber(students, lang)}
          trend={trends.students}
          accent="indigo"
        />
        <StatCard
          icon={Layers}
          label={t('teacher.dashboard.stats.groups')}
          value={formatNumber(groups, lang)}
          trend={trends.groups}
          accent="sky"
        />
        <StatCard
          icon={GraduationCap}
          label={t('teacher.dashboard.stats.subjects')}
          value={formatNumber(subjects, lang)}
          trend={trends.subjects}
          accent="amber"
        />
        <StatCard
          icon={CircleDollarSign}
          label={t('teacher.dashboard.stats.revenue')}
          value={formatCurrency(revenue, lang)}
          trend={trends.revenue}
          accent="emerald"
        />
      </div>

      {/* ============ REVENUE SECTION ============ */}
      <RevenueSection stats={stats} lang={lang} />

      {/* ============ CHARTS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar */}
        <ChartCard
          title={t('teacher.dashboard.charts.studentsGroups')}
          subtitle={lang === 'ar' ? 'نظرة سريعة على الحجم الكلي' : 'A quick look at overall size'}
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentsGroupsData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.55} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#eef0f3" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                allowDecimals={false}
              />
              <RechartsTooltip cursor={{ fill: 'rgba(99,102,241,0.06)' }} content={<SoftTooltip />} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area — Revenue */}
        <ChartCard
          title={t('teacher.dashboard.charts.revenue')}
          subtitle={lang === 'ar' ? 'تطور الإيراد على مدار الأشهر' : 'Revenue trend over months'}
          icon={Wallet}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
        >
          {revenueSeries.length === 0 ? (
            <EmptyState label={t('teacher.dashboard.charts.noData')} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#eef0f3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={6}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <RechartsTooltip content={<SoftTooltip formatter={(v) => formatCurrency(v, lang)} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#areaFill)"
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Pie */}
        <ChartCard
          title={t('teacher.dashboard.charts.subjectsDistribution')}
          subtitle={lang === 'ar' ? 'توزيع المواد الدراسية' : 'Subjects distribution'}
          icon={PieIcon}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
        >
          {subjectsDistribution.length === 0 ? (
            <EmptyState label={t('teacher.dashboard.charts.noData')} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {subjectsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<SoftTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => (
                    <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Summary */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col">
          <header className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                {t('teacher.dashboard.charts.summary')}
              </h2>
              <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">
                {lang === 'ar' ? 'ملخص سريع للأرقام الرئيسية' : 'Quick summary of key numbers'}
              </p>
            </div>
          </header>

          <div className="mt-1">
            <SummaryRow
              icon={Users}
              label={t('teacher.dashboard.charts.totalStudents')}
              value={formatNumber(students, lang)}
              tone="indigo"
            />
            <SummaryRow
              icon={Layers}
              label={t('teacher.dashboard.charts.totalGroups')}
              value={formatNumber(groups, lang)}
              tone="sky"
            />
            <SummaryRow
              icon={Wallet}
              label={t('teacher.dashboard.charts.totalRevenue')}
              value={formatCurrency(revenue, lang)}
              tone="emerald"
            />
          </div>

          <button
            onClick={() => (window.location.href = '/teacher/subscription')}
            className="mt-4 w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition shadow-md shadow-indigo-500/20"
          >
            <span className="flex items-center gap-2">
              <CreditCard size={16} />
              {lang === 'ar' ? 'إدارة باقة المنصة' : 'Manage plan'}
            </span>
            <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
        </section>
      </div>
    </div>
  );
}
