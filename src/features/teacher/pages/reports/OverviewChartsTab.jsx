// src/features/teacher/pages/reports/OverviewChartsTab.jsx
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Users,
  Layers,
  BookOpen,
  UserCog,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
];

export default function OverviewChartsTab({
  overview,
  groups,
  topStudents,
  enrollmentsByMonth,
}) {
  if (!overview) {
    return (
      <div className="text-center py-16 text-gray-500">
        لا توجد بيانات
      </div>
    );
  }

  // ============ 1. بيانات الإحصائيات العامة (Bar Chart) ============
  const statsData = [
    { name: 'الطلاب', value: overview.totalStudents ?? 0, fill: '#6366f1' },
    { name: 'المساعدون', value: overview.totalAssistants ?? 0, fill: '#10b981' },
    { name: 'المواد', value: overview.totalSubjects ?? 0, fill: '#f59e0b' },
    { name: 'الكورسات', value: overview.totalCourses ?? 0, fill: '#8b5cf6' },
    { name: 'المجموعات', value: overview.totalGroups ?? 0, fill: '#06b6d4' },
    { name: 'التسجيلات', value: overview.totalEnrollments ?? 0, fill: '#ec4899' },
  ];

  // ============ 2. توزيع الطلاب على المجموعات (Pie Chart) ============
  const groupsDistribution = (groups || [])
    .filter((g) => (g._count?.enrollments || 0) > 0)
    .slice(0, 8)
    .map((g, idx) => ({
      name: g.name || `مجموعة ${idx + 1}`,
      value: g._count?.enrollments || 0,
    }));

  // ============ 3. أعلى 8 طلاب (Horizontal Bar) ============
  const top8Students = (topStudents || []).slice(0, 8).map((s) => ({
    name: s.name?.length > 12 ? s.name.slice(0, 12) + '...' : s.name,
    نقاط: s.totalPoints ?? 0,
    level: s.level ?? 1,
  }));

  // ============ 4. استخدام السعة (Radar) ============
  const capacityData = (groups || [])
    .slice(0, 6)
    .map((g) => {
      const enrolled = g._count?.enrollments || 0;
      const capacity = g.capacity || 0;
      return {
        group: g.name?.length > 10 ? g.name.slice(0, 10) + '..' : g.name,
        usage: capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0,
      };
    });

  // ============ 5. التسجيلات الشهرية (Line Chart) ============
  const monthlyData = enrollmentsByMonth || [];

  return (
    <div className="space-y-4">
      {/* Row 1: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart — إحصائيات عامة */}
        <div className="lg:col-span-2">
          <ChartCard
            title="الإحصائيات العامة"
            subtitle="نظرة شاملة على كل عناصر الأكاديمية"
            icon={BarChart3}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Bar
                    dataKey="value"
                    name="العدد"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  >
                    {statsData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Pie Chart — توزيع الطلاب */}
        <ChartCard
          title="توزيع الطلاب"
          subtitle="على المجموعات"
          icon={PieIcon}
        >
          {groupsDistribution.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupsDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {groupsDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip suffix=" طالب" />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 2: Line Chart — التسجيلات الشهرية */}
      {monthlyData.length > 0 && (
        <ChartCard
          title="نمو التسجيلات"
          subtitle="آخر 6 أشهر"
          icon={TrendingUp}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradientEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip suffix=" طلب" />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="التسجيلات"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#gradientEnrollments)"
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Row 3: Top Students + Capacity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Students — Horizontal Bar */}
        <ChartCard
          title="أفضل الطلاب"
          subtitle="حسب إجمالي النقاط"
          icon={Users}
        >
          {top8Students.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top8Students}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip suffix=" نقطة" />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Bar
                    dataKey="نقاط"
                    fill="#6366f1"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Capacity Radar */}
        <ChartCard
          title="استخدام سعة المجموعات"
          subtitle="نسبة الامتلاء لكل مجموعة"
          icon={Layers}
        >
          {capacityData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={capacityData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="group"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: '#9ca3af' }}
                  />
                  <Radar
                    name="نسبة الامتلاء"
                    dataKey="usage"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Tooltip content={<CustomTooltip suffix="%" />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Stat Cards — تحت الرسومات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          icon={Users}
          label="الطلاب"
          value={overview.totalStudents ?? 0}
          color="indigo"
        />
        <MiniStat
          icon={UserCog}
          label="المساعدون"
          value={overview.totalAssistants ?? 0}
          color="emerald"
        />
        <MiniStat
          icon={BookOpen}
          label="المواد"
          value={overview.totalSubjects ?? 0}
          color="amber"
        />
        <MiniStat
          icon={GraduationCap}
          label="الكورسات"
          value={overview.totalCourses ?? 0}
          color="violet"
        />
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
