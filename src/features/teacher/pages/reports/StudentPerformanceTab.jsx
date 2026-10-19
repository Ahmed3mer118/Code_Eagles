// src/features/teacher/pages/reports/StudentPerformanceTab.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  Star,
  Trophy,
  Award,
  Search,
  AlertCircle,
  Users,
  Loader2,
} from 'lucide-react';
import teacherApi from '@/shared/api/teacherApi';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';

const PERIOD_OPTIONS = [
  { value: 'all_time', label: 'كل الأوقات' },
  { value: 'this_week', label: 'هذا الأسبوع' },
  { value: 'this_month', label: 'هذا الشهر' },
];

export default function StudentPerformanceTab({ initialStudents = [] }) {
  const [leaderboard, setLeaderboard] = useState(initialStudents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all_time');
  const [limit, setLimit] = useState(50);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await teacherApi.getLeaderboard({ limit, period });
      const payload = res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? [];
      setLeaderboard(items);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل بيانات المتصدرين',
      );
    } finally {
      setLoading(false);
    }
  }, [limit, period]);

  useEffect(() => {
    if (initialStudents.length === 0) {
      fetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // فلترة client-side
  const filtered = leaderboard.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.gradeLevel?.toLowerCase().includes(q)
    );
  });

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="space-y-5">
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
            placeholder="ابحث بالاسم أو الصف..."
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
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === o.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value={10}>أعلى 10</option>
          <option value={20}>أعلى 20</option>
          <option value={50}>أعلى 50</option>
          <option value={100}>أعلى 100</option>
        </select>

        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          تحديث
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-primary-500" size={32} />
          <p className="text-sm text-gray-400">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد طلاب"
          description="لم يتم إضافة نقاط لأي طالب بعد، أو لا توجد نتائج مطابقة للبحث"
        />
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map((entry) => (
                <div
                  key={entry.studentId || entry.name}
                  className={`relative rounded-2xl p-4 text-center border-2 ${
                    entry.rank === 1
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/10 border-yellow-400 dark:border-yellow-700 shadow-lg'
                      : entry.rank === 2
                        ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700'
                        : 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  {entry.rank === 1 && (
                    <Trophy className="absolute top-2 right-2 text-yellow-500" size={20} />
                  )}

                  <div className="flex justify-center mb-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        entry.rank === 1
                          ? 'bg-yellow-500 text-white'
                          : entry.rank === 2
                            ? 'bg-gray-400 text-white'
                            : 'bg-amber-600 text-white'
                      }`}
                    >
                      {entry.rank}
                    </div>
                  </div>

                  {entry.profileImageUrl ? (
                    <img
                      src={entry.profileImageUrl}
                      alt={entry.name}
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white dark:border-gray-800 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold mx-auto mb-2 border-2 border-white dark:border-gray-800 shadow">
                      {entry.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {entry.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star size={14} className="text-primary-600" />
                    <span className="font-bold text-primary-600">
                      {entry.totalPoints}
                    </span>
                    <Award size={14} className="text-amber-600 ml-2" />
                    <span className="text-xs font-medium text-amber-600">
                      Lv.{entry.level ?? 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                ترتيب كامل ({filtered.length})
              </h3>
            </div>
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300 w-16">#</th>
                    <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الطالب</th>
                    <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">الصف</th>
                    <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">المستوى</th>
                    <th className="text-right p-3 font-semibold text-gray-600 dark:text-gray-300">النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((entry) => (
                    <tr
                      key={entry.studentId || entry.name}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="p-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1
                              ? 'bg-yellow-100 text-yellow-700'
                              : entry.rank === 2
                                ? 'bg-gray-200 text-gray-700'
                                : entry.rank === 3
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-50 text-gray-500 dark:bg-gray-800'
                          }`}
                        >
                          {entry.rank}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {entry.profileImageUrl ? (
                            <img
                              src={entry.profileImageUrl}
                              alt={entry.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {entry.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {entry.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 text-xs">
                        {entry.gradeLevel || '—'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                          <Award size={12} />
                          Lv.{entry.level ?? 1}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-primary-600">
                          <Star size={14} />
                          {entry.totalPoints}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((entry) => (
                <div
                  key={entry.studentId || entry.name}
                  className="p-3 flex items-center gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      entry.rank === 1
                        ? 'bg-yellow-100 text-yellow-700'
                        : entry.rank === 2
                          ? 'bg-gray-200 text-gray-700'
                          : entry.rank === 3
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-50 text-gray-500 dark:bg-gray-800'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  {entry.profileImageUrl ? (
                    <img
                      src={entry.profileImageUrl}
                      alt={entry.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {entry.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.gradeLevel || '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-primary-600 flex items-center gap-1">
                      <Star size={12} />
                      {entry.totalPoints}
                    </p>
                    <p className="text-[10px] text-amber-600">
                      Lv.{entry.level ?? 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
