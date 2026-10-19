// src/features/teacher/pages/reports/GroupsChartsTab.jsx
import { Layers, TrendingUp, Users, BarChart3, PieChart as PieIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
];

export default function GroupsChartsTab({ groups }) {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        لا توجد مجموعات
      </div>
    );
  }

  // ============ 1. بيانات المجموعات (Bar) ============
  const groupsBarData = groups.slice(0, 10).map((g) => ({
    name: g.name?.length > 10 ? g.name.slice(0, 10) + '..' : g.name,
    مسجلين: g._count?.enrollments || 0,
    سعة: g.capacity || 0,
  }));

  // ============ 2. توزيع المسجلين (Pie) ============
  const distributionData = groups
    .filter((g) => (g._count?.enrollments || 0) > 0)
    .slice(0, 8)
    .map((g, idx) => ({
      name: g.name || `مجموعة ${idx + 1}`,
      value: g._count?.enrollments || 0,
    }));

  // ============ 3. مجموعات ممتلئة ============
  const fullGroups = groups.filter((g) => {
    const enrolled = g._count?.enrollments || 0;
    const capacity = g.capacity || 0;
    return capacity > 0 && enrolled / capacity >= 0.9;
  });

  const totalCapacity = groups.reduce((s, g) => s + (g.capacity || 0), 0);
  const totalEnrolled = groups.reduce(
    (s, g) => s + (g._count?.enrollments || 0),
    0,
  );
  const overallUsage =
    totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={Layers}
          label="إجمالي المجموعات"
          value={groups.length}
          color="indigo"
        />
        <SummaryCard
          icon={Users}
          label="إجمالي المسجلين"
          value={totalEnrolled}
          color="emerald"
        />
        <SummaryCard
          icon={TrendingUp}
          label="استخدام السعة"
          value={`${overallUsage}%`}
          color={
            overallUsage >= 80
              ? 'red'
              : overallUsage >= 50
                ? 'amber'
                : 'emerald'
          }
        />
        <SummaryCard
          icon={BarChart3}
          label="مجموعات ممتلئة"
          value={fullGroups.length}
          color="red"
        />
      </div>

      {/* Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard
            title="المسجلين مقابل السعة"
            subtitle="لكل مجموعة"
            icon={BarChart3}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupsBarData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="مسجلين" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="سعة" fill="#e5e7eb" radius={[6, 6, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <ChartCard
          title="توزيع الطلاب"
          subtitle="على المجموعات"
          icon={PieIcon}
        >
          {distributionData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-sm text-gray-400">
              لا توجد بيانات
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={70}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distributionData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip suffix=" طالب" />} />
                  <Legend
                    verticalAlign="bottom"
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

      {/* قائمة المجموعات المفصلة */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
          تفاصيل المجموعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {groups.map((g) => {
            const enrolled = g._count?.enrollments || 0;
            const capacity = g.capacity || 0;
            const usage = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;
            return (
              <div
                key={g.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {g.name}
                  </p>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usage >= 90
                          ? 'bg-red-500'
                          : usage >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 shrink-0">
                  {enrolled}/{capacity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
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
