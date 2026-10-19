// src/features/student/pages/StudentPoints.jsx
import { useState } from 'react';
import {
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import useStudentPoints from '../hooks/useStudentPoints';

function StatCard({ icon: Icon, label, value, suffix, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-pink-600',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0`}
        >
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-gray-500 ms-1">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ percent = 0 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, percent) / 100);
  return (
    <div className="relative w-28 h-28 shrink-0">
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
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {percent}%
        </span>
        <span className="text-[10px] text-gray-500">للمستوى القادم</span>
      </div>
    </div>
  );
}

export default function StudentPoints() {
  const { data, loading, error, refetch } = useStudentPoints();
  const [toast, setToast] = useState(null);

  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString('ar-EG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
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
          <RefreshCw size={16} /> حاول تاني
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-500">
        لا توجد بيانات
      </div>
    );
  }

  const logs = data.recentLogs || data.logs || [];
  const totalPoints = data.totalPoints ?? 0;
  const level = data.level ?? 1;
  const xp = data.xp ?? 0;
  const nextLevelXp = data.nextLevelXp ?? 0;
  const currentLevelXp = data.currentLevelXp ?? 0;
  const progressPercent = data.progressPercent ?? 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Star size={24} className="text-amber-500" />
          نقاطي
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          تابع نقاطك، مستواك، وتقدمك
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Star}
          label="إجمالي النقاط"
          value={totalPoints}
          color="amber"
        />
        <StatCard
          icon={Award}
          label="المستوى"
          value={`Lv.${level}`}
          color="indigo"
        />
        <StatCard
          icon={Flame}
          label="XP"
          value={xp}
          color="rose"
        />
        <StatCard
          icon={Target}
          label="للمستوى القادم"
          value={`${currentLevelXp}/${nextLevelXp}`}
          color="emerald"
        />
      </div>

      {/* Progress Ring */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-500" />
          التقدم للمستوى القادم
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing percent={progressPercent} />
          <div className="flex-1 text-center sm:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              أنت الآن في <span className="font-bold text-primary-600">المستوى {level}</span>
            </p>
            <p className="text-xs text-gray-500">
              تحتاج <span className="font-bold">{Math.max(0, nextLevelXp - currentLevelXp)} XP</span> للوصول للمستوى {level + 1}
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={16} className="text-primary-500" />
            آخر النقاط
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Star size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              لسه مفيش نقاط. المدرس هيضيفلك نقاط على مشاركتك
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => {
              const pts = Number(log.points || 0);
              const isPositive = pts > 0;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isPositive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {log.reason || '—'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtDate(log.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-base font-bold shrink-0 ${
                      isPositive ? 'text-emerald-600' : 'text-red-600'
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
  );
}
