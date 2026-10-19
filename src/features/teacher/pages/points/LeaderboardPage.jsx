// src/features/teacher/pages/points/LeaderboardPage.jsx
import { useState } from 'react';
import {
  Trophy,
  Crown,
  Award,
  AlertCircle,
  TrendingUp,
  Medal,
  Star,
} from 'lucide-react';
import useLeaderboard from '../../hooks/useLeaderboard';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const PERIOD_OPTIONS = [
  { value: 'all_time', label: 'كل الأوقات' },
  { value: 'this_week', label: 'هذا الأسبوع' },
  { value: 'this_month', label: 'هذا الشهر' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg shadow-yellow-500/30">
        <Crown size={20} />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white font-bold shadow">
        <Medal size={18} />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold shadow">
        <Award size={18} />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
      {rank}
    </div>
  );
}

export default function LeaderboardPage() {
  const { data, params, loading, error, refetch, updateParams } = useLeaderboard();

  const [toast, setToast] = useState(null);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="space-y-5" dir="rtl">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-white text-sm shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {toast.text}
        </div>
      )}

      <PageHeader
        title="لوحة المتصدرين"
        subtitle="ترتيب الطلاب حسب النقاط"
        onRefresh={refetch}
        loading={loading}
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 ml-1">الفترة:</span>
        <div className="flex gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => updateParams({ period: o.value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                params.period === o.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mr-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">العدد:</span>
          <select
            value={params.limit}
            onChange={(e) => updateParams({ limit: Number(e.target.value) })}
            className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>أعلى {n}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">جاري التحميل...</p>
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="لا يوجد متصدرون بعد"
          description="سيظهر هنا ترتيب الطلاب بعد إضافة نقاط لهم"
        />
      ) : (
        <>
          {/* Podium — top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map((entry) => {
                const isFirst = entry.rank === 1;
                return (
                  <div
                    key={entry.studentId}
                    className={`relative rounded-2xl p-5 text-center overflow-hidden border-2 transition ${
                      isFirst
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/10 border-yellow-400 dark:border-yellow-700 sm:scale-105 sm:-translate-y-1 shadow-lg shadow-yellow-500/20'
                        : entry.rank === 2
                          ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-300 dark:border-gray-700'
                          : 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {isFirst && (
                      <div className="absolute top-2 right-2">
                        <Crown className="text-yellow-500" size={20} />
                      </div>
                    )}

                    <div className="flex justify-center mb-2">
                      <RankBadge rank={entry.rank} />
                    </div>

                    {entry.profileImageUrl ? (
                      <img
                        src={entry.profileImageUrl}
                        alt={entry.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-white dark:border-gray-800 shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-xl font-bold mx-auto mb-2 border-2 border-white dark:border-gray-800 shadow">
                        {entry.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}

                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {entry.name}
                    </h3>
                    {entry.gradeLevel && (
                      <p className="text-xs text-gray-500 mb-2">
                        {entry.gradeLevel}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-3 mt-3">
                      <div className="flex items-center gap-1 text-primary-600">
                        <Star size={14} />
                        <span className="font-bold">
                          {entry.totalPoints}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Award size={14} />
                        <span className="text-xs font-medium">
                          Lv.{entry.level ?? 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of list */}
          {rest.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary-500" />
                  باقي الترتيب
                </h3>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {rest.map((entry) => (
                  <div
                    key={entry.studentId}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400 shrink-0">
                      {entry.rank}
                    </div>

                    {entry.profileImageUrl ? (
                      <img
                        src={entry.profileImageUrl}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {entry.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {entry.name}
                      </p>
                      {entry.gradeLevel && (
                        <p className="text-xs text-gray-500 truncate">
                          {entry.gradeLevel}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Award size={14} />
                        <span className="text-xs font-medium">
                          Lv.{entry.level ?? 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600">
                        <Star size={14} />
                        <span className="font-bold text-sm">
                          {entry.totalPoints}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
