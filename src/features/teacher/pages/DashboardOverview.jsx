// src/features/teacher/pages/DashboardOverview.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useI18n } from '../../../shared/i18n';
import teacherApi from '../../../shared/api/teacherApi';
import { Users, BookOpen, Wallet, TrendingUp, Inbox } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary:
      'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue:
      'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber:
      'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 lg:p-5 border border-gray-200 dark:border-gray-800 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { user, activeTenant } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dashRes, statsRes] = await Promise.allSettled([
          teacherApi.getDashboard(),
          teacherApi.getStats(),
        ]);

        if (!mounted) return;

        const merged = {
          ...(dashRes.status === 'fulfilled' ? dashRes.value?.data : {}),
          ...(statsRes.status === 'fulfilled' ? statsRes.value?.data : {}),
        };
        setStats(merged);
      } catch (e) {
        setError(e?.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('teacher.dashboard.welcome')}, {user?.name} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {activeTenant?.tenantName || activeTenant?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('teacher.dashboard.stats.students')}
          value={stats?.studentsCount ?? stats?.totalStudents}
          color="primary"
        />
        <StatCard
          icon={BookOpen}
          label={t('teacher.dashboard.stats.groups')}
          value={stats?.groupsCount ?? stats?.totalGroups}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label={t('teacher.dashboard.stats.subjects')}
          value={stats?.subjectsCount ?? stats?.totalSubjects}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label={t('teacher.dashboard.stats.revenue')}
          value={stats?.revenue ?? stats?.totalRevenue}
          color="green"
        />
      </div>

      {/* Recent Enrollments + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold flex items-center gap-2">
              <Inbox size={18} />
              {t('teacher.dashboard.recentEnrollments')}
            </h2>
            <button
              onClick={() => navigate('/teacher/pending-requests')}
              className="text-xs text-primary-600 hover:underline"
            >
              {t('teacher.dashboard.viewAll')}
            </button>
          </div>
          <div className="p-4 text-sm text-gray-400 text-center">
            {stats?.recentEnrollments?.length ? (
              stats.recentEnrollments.map((e) => (
                <div key={e.id} className="py-2 border-b last:border-0 text-start">
                  {e.student?.name} — {e.group?.name}
                </div>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold flex items-center gap-2">
              <Wallet size={18} />
              {t('teacher.dashboard.recentPayments')}
            </h2>
            <button
              onClick={() => navigate('/teacher/payments/pending')}
              className="text-xs text-primary-600 hover:underline"
            >
              {t('teacher.dashboard.viewAll')}
            </button>
          </div>
          <div className="p-4 text-sm text-gray-400 text-center">
            {stats?.recentPayments?.length ? (
              stats.recentPayments.map((p) => (
                <div key={p.id} className="py-2 border-b last:border-0 text-start">
                  {p.student?.name} — {p.amount}
                </div>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
