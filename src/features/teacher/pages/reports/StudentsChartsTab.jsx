// src/features/teacher/pages/reports/StudentsChartsTab.jsx
import { useCallback, useEffect, useState } from 'react';
import { Users, Trophy, Star, Award, TrendingUp, Search, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import teacherApi from '@/shared/api/teacherApi';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const PERIOD_OPTIONS = [
  { value: 'all_time', label: 'كل الأوقات' },
  { value: 'this_week', label: 'هذا الأسبوع' },
  { value: 'this_month', label: 'هذا الشهر' },
];

export default function StudentsChartsTab({ initialStudents = [] }) {
  const [students, setStudents] = useState(initialStudents);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('all_time');
  const [search, setSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getLeaderboard({ limit: 20, period });
      const payload = res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? [];
      setStudents(items);
    } catch {
      // تجاهل
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (initialStudents.length === 0) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.gradeLevel?.toLowerCase().includes(q)
    );
  });

  // ============ 1. أعلى 10 طلاب (Vertical Bar) ============
  const barData = filtered.slice(0, 10).map((s) => ({
    name: s.name?.length > 8 ? s.name.slice(0, 8) + '..' : s.name,
    نقاط: s.totalPoints ?? 0,
    مستوى: s.level ?? 1,
  }));

  // ============ 2. توزيع المستويات (Line/Area) ============
  const levelDistribution = (() => {
    const map = {};
    filtered.forEach((s) => {
      const lv = s.level ?? 1;
      map[lv] = (map[lv] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, count]) => ({
        level: `Lv.${level}`,
        عدد: count,
      }));
  })();

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم..."
            className="w-full pr-9 pl-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">الفترة:</span>
          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setPeriod(o.value);
                fetchStudents();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === o.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          لا يوجد طلاب
        </div>
      ) : (
        <>
          {/* Bar Chart — أعلى الطلاب */}
          <ChartCard
            title="أعلى الطلاب بالنقاط"
            subtitle={`أفضل ${Math.min(barData.length, 10)} طالب`}
            icon={Trophy}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 30 }}
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
                  <Tooltip content={<CustomTooltip suffix=" نقطة" />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                  <Bar
                    dataKey="نقاط"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Line Chart — توزيع المستويات */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="توزيع المستويات"
              subtitle="عدد الطلاب في كل مستوى"
              icon={Award}
            >
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={levelDistribution}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                      dataKey="level"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip suffix=" طالب" />} />
                    <Line
                      type="monotone"
                      dataKey="عدد"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top 3 Podium */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" />
                منصة التتويج
              </h3>
              <div className="space-y-2">
                {filtered.slice(0, 3).map((s, idx) => (
                  <div
                    key={s.studentId || idx}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      idx === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border border-yellow-200'
                        : idx === 1
                          ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        idx === 0
                          ? 'bg-yellow-500 text-white'
                          : idx === 1
                            ? 'bg-gray-400 text-white'
                            : 'bg-amber-600 text-white'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {s.profileImageUrl ? (
                      <img
                        src={s.profileImageUrl}
                        alt={s.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {s.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Lv.{s.level ?? 1}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600 shrink-0">
                      <Star size={14} />
                      <span className="font-bold text-sm">
                        {s.totalPoints}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
