import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { superadminApi } from '../../../shared/api/superadminApi';
import { platformApi } from '../../../lib/platformApi';
import { useI18n } from '../../../shared/i18n';

export default function DashboardOverview() {
  const { t } = useI18n();

  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [publicStats, setPublicStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ov, gr, ps] = await Promise.all([
        superadminApi.getOverview(),
        superadminApi.getGrowth(14),
        platformApi.getStats().catch(() => null),
      ]);
      setOverview(ov);
      setGrowth(gr);
      setPublicStats(ps);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ov, gr, ps] = await Promise.all([
          superadminApi.getOverview(),
          superadminApi.getGrowth(14),
          platformApi.getStats().catch(() => null),
        ]);
        if (!mounted) return;
        setOverview(ov);
        setGrowth(gr);
        setPublicStats(ps);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
      value: overview?.revenue.value ?? 0,
      growth: overview?.revenue.growth ?? 0,
      icon: DollarSign,
      color: 'emerald',
      format: (v) => `${v.toLocaleString('en-US')} EGP`,
    },
    {
      label: t('admin.overview.stats.requests'),
      value: overview?.pendingRequests.value ?? 0,
      growth: overview?.pendingRequests.growth ?? 0,
      icon: FileText,
      color: 'orange',
    },
    {
      label: t('admin.overview.stats.users'),
      value: overview?.totalUsers.value ?? 0,
      growth: overview?.totalUsers.growth ?? 0,
      icon: Users,
      color: 'purple',
      format: (v) => v.toLocaleString('en-US'),
    },
    {
      label: t('admin.overview.stats.academies'),
      value: overview?.totalAcademies.value ?? 0,
      growth: overview?.totalAcademies.growth ?? 0,
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
      <GrowthChart data={growth} t={t} />

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
// Growth Chart
// ============================================================
function GrowthChart({ data, t }) {
  const hasData = data && data.length > 0;

  const maxValue = hasData
    ? Math.max(...data.map((d) => Math.max(d.academies, d.users)), 1)
    : 1;

  const width = 1000;
  const height = 260;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartH = height - paddingTop - paddingBottom;

  const stepX = hasData && data.length > 1 ? width / (data.length - 1) : width;

  const toPath = (key) =>
    data
      .map((d, i) => {
        const x = i * stepX;
        const y = paddingTop + chartH - (d[key] / maxValue) * chartH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

  const toAreaPath = (key) => {
    const line = toPath(key);
    const lastX = (data.length - 1) * stepX;
    return `${line} L ${lastX} ${paddingTop + chartH} L 0 ${paddingTop + chartH} Z`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {t('admin.overview.chart.title')}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {t('admin.overview.chart.subtitle', { days: data.length })}
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {t('admin.overview.chart.academies')}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {t('admin.overview.chart.users')}
          </span>
        </div>
      </div>

      {/* Body */}
      {!hasData ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-slate-400">
            {t('admin.overview.chart.empty')}
          </p>
        </div>
      ) : (
        <div className="p-6">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            preserveAspectRatio="none"
            style={{ height: '260px' }}
          >
            <defs>
              <linearGradient id="academyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
              <line
                key={tick}
                x1="0"
                x2={width}
                y1={paddingTop + chartH * tick}
                y2={paddingTop + chartH * tick}
                stroke="#e2e8f0"
                strokeDasharray="6 6"
                strokeWidth="1"
              />
            ))}

            <path d={toAreaPath('academies')} fill="url(#academyGradient)" />
            <path d={toAreaPath('users')} fill="url(#userGradient)" />

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

            {data.map((d, i) => {
              const x = i * stepX;
              const yA = paddingTop + chartH - (d.academies / maxValue) * chartH;
              const yU = paddingTop + chartH - (d.users / maxValue) * chartH;
              return (
                <g key={d.date}>
                  <circle cx={x} cy={yA} r="5" fill="#fff" stroke="#f59e0b" strokeWidth="2.5" />
                  <circle cx={x} cy={yU} r="5" fill="#fff" stroke="#6366f1" strokeWidth="2.5" />
                </g>
              );
            })}
          </svg>

          <div className="mt-3 flex justify-between text-xs font-semibold text-slate-400">
            {data.map((d) => (
              <span key={d.date}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}