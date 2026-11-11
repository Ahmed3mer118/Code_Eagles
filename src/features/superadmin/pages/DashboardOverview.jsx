// src/features/superadmin/pages/DashboardOverview.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  GraduationCap,
  MessageSquare,
  Bell,
  RefreshCw,
  Award,
  BarChart3,
  Sparkles,
  Calendar,
  Inbox,
} from 'lucide-react';
import { superadminApi } from '../../../shared/api/superadminApi';
import { platformApi } from '../../../lib/platformApi';
import { useI18n } from '../../../shared/i18n';

const PERIODS = [
  { days: 7, ar: '7 أيام', en: '7 days' },
  { days: 14, ar: '14 يوم', en: '14 days' },
  { days: 30, ar: '30 يوم', en: '30 days' },
  { days: 60, ar: '60 يوم', en: '60 days' },
];

export default function DashboardOverview() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [publicStats, setPublicStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState(14);
  const [growthLoading, setGrowthLoading] = useState(false);

  const loadData = async (days = period) => {
    try {
      setGrowthLoading(true);
      const [ov, gr, ps] = await Promise.all([
        superadminApi.getOverview(),
        superadminApi.getGrowth(days),
        platformApi.getStats().catch(() => null),
      ]);
      setOverview(ov);
      setGrowth(gr || []);
      setPublicStats(ps);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setGrowthLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ov, gr, ps] = await Promise.all([
          superadminApi.getOverview(),
          superadminApi.getGrowth(period),
          platformApi.getStats().catch(() => null),
        ]);
        if (!mounted) return;
        setOverview(ov);
        setGrowth(gr || []);
        setPublicStats(ps);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // لما المستخدم يغير الفترة → reload
  useEffect(() => {
    if (loading) return;
    loadData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(period);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            {t('admin.overview.loadingData')}
          </p>
        </div>
      </div>
    );
  }

  const mainCards = [
    {
      label: t('admin.overview.stats.revenue'),
      value: overview?.revenue?.value ?? 0,
      growth: overview?.revenue?.growth ?? 0,
      icon: DollarSign,
      color: 'emerald',
      format: (v) => `${v.toLocaleString('en-US')} ${isAr ? 'ج.م' : 'EGP'}`,
    },
    {
      label: t('admin.overview.stats.requests'),
      value: overview?.pendingRequests?.value ?? 0,
      growth: overview?.pendingRequests?.growth ?? 0,
      icon: FileText,
      color: 'orange',
    },
    {
      label: t('admin.overview.stats.users'),
      value: overview?.totalUsers?.value ?? 0,
      growth: overview?.totalUsers?.growth ?? 0,
      icon: Users,
      color: 'purple',
      format: (v) => v.toLocaleString('en-US'),
    },
    {
      label: t('admin.overview.stats.academies'),
      value: overview?.totalAcademies?.value ?? 0,
      growth: overview?.totalAcademies?.growth ?? 0,
      icon: GraduationCap,
      color: 'blue',
    },
  ];

  const secondaryStats = [
    {
      label: t('admin.overview.stats.publishedCourses'),
      value: publicStats?.totalCourses ?? 0,
      icon: BarChart3,
      color: 'sky',
    },
    {
      label: t('admin.overview.stats.completedQuizzes'),
      value: publicStats?.totalQuizAttempts ?? 0,
      icon: Award,
      color: 'amber',
    },
    {
      label: t('admin.overview.stats.newMessages'),
      value: overview?.badges?.pendingMessages ?? 0,
      icon: MessageSquare,
      color: 'rose',
    },
    {
      label: t('admin.overview.stats.unreadNotifications'),
      value: overview?.badges?.unreadNotifications ?? 0,
      icon: Bell,
      color: 'violet',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('admin.overview.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('admin.overview.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin.overview.refresh')}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            {t('admin.overview.exportReport')}
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mainCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Growth Chart */}
      <GrowthChart
        data={growth}
        period={period}
        onPeriodChange={setPeriod}
        loading={growthLoading}
        lang={lang}
        t={t}
      />

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {secondaryStats.map((stat) => (
          <MiniStatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Stat Card
// ============================================================
function StatCard({ label, value, growth, icon: Icon, color, format }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      ring: 'ring-emerald-500/20',
      hover: 'hover:border-emerald-300',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      ring: 'ring-orange-500/20',
      hover: 'hover:border-orange-300',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      ring: 'ring-purple-500/20',
      hover: 'hover:border-purple-300',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      ring: 'ring-blue-500/20',
      hover: 'hover:border-blue-300',
    },
  };
  const c = colorMap[color];
  const isPositive = growth >= 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${c.hover}`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60 ${c.bg}`}
      />

      <div className="relative flex items-start justify-between">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-4 ${c.bg} ${c.text} ${c.ring}`}
        >
          <Icon className="h-6 w-6" />
        </span>

        {growth !== 0 && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {isPositive ? '+' : ''}
            {growth}%
          </span>
        )}
      </div>

      <p className="relative mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
        {format ? format(value) : value.toLocaleString('en-US')}
      </p>
      <p className="relative mt-1.5 text-sm font-semibold text-slate-500">
        {label}
      </p>
    </div>
  );
}

// ============================================================
// Mini Stat Card
// ============================================================
function MiniStatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  };
  const c = colorMap[color] ?? colorMap.sky;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.text}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-xl font-extrabold text-slate-900">
          {value.toLocaleString('en-US')}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Growth Chart — محدّث بالكامل
// ============================================================
function GrowthChart({ data, period, onPeriodChange, loading, lang, t }) {
  const isAr = lang === 'ar';
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // احسب الإجماليات
  const totals = useMemo(() => {
    const users = data.reduce((sum, d) => sum + (d.users || 0), 0);
    const academies = data.reduce((sum, d) => sum + (d.academies || 0), 0);
    return { users, academies };
  }, [data]);

  const hasData = data && data.length > 0;
  const hasAnyValue = totals.users > 0 || totals.academies > 0;

  // احسب أقصى قيمة للـ Y-axis
  const maxValue = useMemo(() => {
    if (!hasData) return 1;
    const m = Math.max(
      ...data.map((d) => Math.max(d.users || 0, d.academies || 0)),
      1,
    );
    // قرب لأقرب عدد صحيح أو 5 عشان المحاور تبقى أنضف
    if (m <= 5) return 5;
    if (m <= 10) return 10;
    if (m <= 20) return 20;
    if (m <= 50) return 50;
    return Math.ceil(m / 10) * 10;
  }, [data, hasData]);

  // قيم المحاور الـ Y (5 ticks)
  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) =>
      Math.round((maxValue / steps) * i),
    );
  }, [maxValue]);

  const width = 1000;
  const height = 300;
  const paddingTop = 20;
  const paddingBottom = 40;
  const paddingLeft = 50;
  const paddingRight = 20;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const stepX =
    hasData && data.length > 1 ? chartW / (data.length - 1) : chartW;

  const toPath = (key) =>
    data
      .map((d, i) => {
        const x = paddingLeft + i * stepX;
        const y = paddingTop + chartH - ((d[key] || 0) / maxValue) * chartH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const toAreaPath = (key) => {
    if (!hasData) return '';
    const line = toPath(key);
    const lastX = paddingLeft + (data.length - 1) * stepX;
    return `${line} L ${lastX} ${paddingTop + chartH} L ${paddingLeft} ${
      paddingTop + chartH
    } Z`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            {t('admin.overview.chart.title')}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {isAr
              ? `آخر ${period} يوم — الأكاديميات والمستخدمون الجدد`
              : `Last ${period} days — new academies and users`}
          </p>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <Calendar className="ms-2 h-3.5 w-3.5 text-slate-400" />
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => onPeriodChange(p.days)}
              disabled={loading}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                period === p.days
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-white/60'
              } disabled:opacity-50`}
            >
              {isAr ? p.ar : p.en}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {isAr ? 'مستخدمون جدد' : 'New Users'}
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {totals.users.toLocaleString('en-US')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <GraduationCap className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {isAr ? 'أكاديميات جديدة' : 'New Academies'}
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {totals.academies.toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {t('admin.overview.chart.academies')}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          {t('admin.overview.chart.users')}
        </span>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : !hasData || !hasAnyValue ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Inbox className="h-12 w-12 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            {isAr
              ? 'لا توجد بيانات في هذه الفترة'
              : 'No data in this period'}
          </p>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'جرّب فترة زمنية أطول'
              : 'Try a longer time period'}
          </p>
        </div>
      ) : (
        <div className="p-6">
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full"
              preserveAspectRatio="none"
              style={{ height: '300px' }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="academyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y-axis labels + grid lines */}
              {yTicks.map((tick, i) => {
                const y = paddingTop + chartH - (tick / maxValue) * chartH;
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      x2={width - paddingRight}
                      y1={y}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400"
                      style={{ fontSize: '11px', fontWeight: 600 }}
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Areas */}
              <path d={toAreaPath('academies')} fill="url(#academyGradient)" />
              <path d={toAreaPath('users')} fill="url(#userGradient)" />

              {/* Lines */}
              <path
                d={toPath('academies')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={toPath('users')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points + Hover areas */}
              {data.map((d, i) => {
                const x = paddingLeft + i * stepX;
                const yA = paddingTop + chartH - ((d.academies || 0) / maxValue) * chartH;
                const yU = paddingTop + chartH - ((d.users || 0) / maxValue) * chartH;
                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={d.date}
                    onMouseEnter={() => setHoveredIdx(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* invisible vertical line on hover */}
                    {isHovered && (
                      <line
                        x1={x}
                        x2={x}
                        y1={paddingTop}
                        y2={paddingTop + chartH}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={yA}
                      r={isHovered ? 7 : 5}
                      fill="#fff"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      style={{ transition: 'r 0.15s' }}
                    />
                    <circle
                      cx={x}
                      cy={yU}
                      r={isHovered ? 7 : 5}
                      fill="#fff"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      style={{ transition: 'r 0.15s' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIdx !== null && data[hoveredIdx] && (
              <div
                className="pointer-events-none absolute rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg"
                style={{
                  left: `${
                    ((paddingLeft + hoveredIdx * stepX) / width) * 100
                  }%`,
                  top: '10px',
                  transform: 'translateX(-50%)',
                }}
              >
                <p className="text-[10px] font-semibold text-slate-400">
                  {data[hoveredIdx].date}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {data[hoveredIdx].users || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-slate-700">
                      {data[hoveredIdx].academies || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* X-axis labels */}
          <div
            className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400"
            style={{
              paddingLeft: `${(paddingLeft / width) * 100}%`,
              paddingRight: `${(paddingRight / width) * 100}%`,
            }}
          >
            {data.map((d, i) => {
              // اعرض بس كل N تاريخ عشان ما يزدحمش
              const totalPoints = data.length;
              const showEvery = totalPoints > 20 ? Math.ceil(totalPoints / 10) : 1;
              if (i % showEvery !== 0 && i !== totalPoints - 1) return null;
              return <span key={d.date}>{d.date.slice(5)}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
