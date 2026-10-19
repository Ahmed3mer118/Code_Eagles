// src/features/teacher/pages/DashboardOverview.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { useI18n } from '../../../shared/i18n';
import teacherApi from '../../../shared/api/teacherApi';
import { Users, BookOpen, Wallet, TrendingUp, Clock } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// مكوّن كارت الإحصائيات
function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 lg:p-5 border border-gray-200 dark:border-gray-800 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
}

// مكوّن الرسم البياني
function ChartCard({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className={iconColor} />
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="h-64 w-full">
        {children}
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { user, activeTenant } = useAuth();
  const { t, lang } = useI18n(); // ⬅️ ضفنا lang عشان نحدد لغة التواريخ
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
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
        setError(e?.message || 'Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
        {error}
      </div>
    );
  }

  // === تجهيز البيانات للرسوم البيانية ===
  
  // 1. بيانات الطلاب والمجموعات (Bar Chart)
  const studentsGroupsData = [
    { name: t('teacher.dashboard.charts.students'), value: stats?.studentsCount ?? stats?.totalStudents ?? 0 },
    { name: t('teacher.dashboard.charts.groups'), value: stats?.groupsCount ?? stats?.totalGroups ?? 0 },
  ];

  // 2. بيانات المواد (Pie Chart)
  const subjectsData = [
    { name: t('teacher.dashboard.charts.subjects'), value: stats?.subjectsCount ?? stats?.totalSubjects ?? 0 },
    { name: t('teacher.dashboard.charts.other'), value: 1 }, // قيمة وهمية عشان الرسمة متبقاش فاضية
  ];
  const COLORS = ['#3b82f6', '#e5e7eb'];

  // 3. بيانات الإيرادات (Line Chart - وهمية لو مفيش داتا تاريخية)
  const revenueData = [
    { name: t('teacher.dashboard.charts.months.jan'), value: 4000 },
    { name: t('teacher.dashboard.charts.months.feb'), value: 3000 },
    { name: t('teacher.dashboard.charts.months.mar'), value: 5000 },
    { name: t('teacher.dashboard.charts.months.apr'), value: 4500 },
    { name: t('teacher.dashboard.charts.months.may'), value: 6000 },
    { name: t('teacher.dashboard.charts.months.jun'), value: 5500 },
  ];

  // تحديد لغة التواريخ
  const dateLocale = lang === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('teacher.dashboard.welcome')}, {user?.name} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <BookOpen size={14} />
            {activeTenant?.tenantName || activeTenant?.name || 'Academy'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800">
          <Clock size={16} />
          {new Date().toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={t('teacher.dashboard.stats.students')}
          value={stats?.studentsCount ?? stats?.totalStudents ?? 0}
          color="primary"
        />
        <StatCard
          icon={BookOpen}
          label={t('teacher.dashboard.stats.groups')}
          value={stats?.groupsCount ?? stats?.totalGroups ?? 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label={t('teacher.dashboard.stats.subjects')}
          value={stats?.subjectsCount ?? stats?.totalSubjects ?? 0}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label={t('teacher.dashboard.stats.revenue')}
          value={stats?.revenue ?? stats?.totalRevenue ?? '0 ج.م'}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* 1. رسم بياني للطلاب والمجموعات */}
        <ChartCard title={t('teacher.dashboard.charts.studentsGroups')} icon={Users} iconColor="text-primary-500">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studentsGroupsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. رسم بياني للإيرادات */}
        <ChartCard title={t('teacher.dashboard.charts.revenue')} icon={Wallet} iconColor="text-emerald-500">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <RechartsTooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. رسم بياني للمواد */}
        <ChartCard title={t('teacher.dashboard.charts.subjectsDistribution')} icon={TrendingUp} iconColor="text-amber-500">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {subjectsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. ملخص سريع */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col justify-center">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('teacher.dashboard.charts.summary')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('teacher.dashboard.charts.totalStudents')}</span>
              <span className="font-bold text-lg text-primary-600">{stats?.studentsCount ?? stats?.totalStudents ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('teacher.dashboard.charts.totalGroups')}</span>
              <span className="font-bold text-lg text-blue-600">{stats?.groupsCount ?? stats?.totalGroups ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('teacher.dashboard.charts.totalSubjects')}</span>
              <span className="font-bold text-lg text-amber-600">{stats?.subjectsCount ?? stats?.totalSubjects ?? 0}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
