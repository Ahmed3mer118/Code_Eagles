// src/features/assistant/pages/AssistantDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  Shield,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  BookOpen,
  User as UserIcon,
  TrendingUp,
} from 'lucide-react';
import useAssistantDashboard from '../hooks/useAssistantDashboard';
import { useAuth } from '../../../shared/context/AuthContext';

// دالة لتحويل أكواد الصلاحيات لأسماء مفهومة
const PERMISSION_LABELS = {
  'groups.view': 'عرض المجموعات',
  'groups.manage': 'إدارة المجموعات',
  'students.view': 'عرض الطلاب',
  'students.manage': 'إدارة الطلاب',
  'assignments.view': 'عرض الواجبات',
  'assignments.grade': 'تصحيح الواجبات',
  'quizzes.view': 'عرض الاختبارات',
  'quizzes.grade': 'تصحيح الاختبارات',
  'attendance.manage': 'إدارة الحضور',
  'payments.view': 'عرض المدفوعات',
};

function StatCard({ icon: Icon, label, value, color = 'primary', onClick }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md transition' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={22} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AssistantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, groups, profile, loading, error, refetch } = useAssistantDashboard();
  const [toast, setToast] = useState(null);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
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

  const totalGroups = stats?.totalGroups ?? groups.length ?? 0;
  const totalStudents = stats?.totalStudents ?? 0;
  const permissions = profile?.permissions || [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Header */}
      <div className="bg-gradient-to-l from-primary-500 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-90 mb-1">أهلاً بيك 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {profile?.user?.name || user?.name || 'مساعد'}
            </h1>
            {profile?.teacher?.name && (
              <p className="text-sm opacity-90 mt-1">
                مساعد لدى: {profile.teacher.name}
              </p>
            )}
          </div>
          <div className="hidden sm:block">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <UserIcon size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Layers}
          label="إجمالي المجموعات"
          value={totalGroups}
          color="indigo"
          onClick={() => navigate('/assistant/groups')}
        />
        <StatCard
          icon={Users}
          label="إجمالي الطلاب"
          value={totalStudents}
          color="emerald"
          onClick={() => navigate('/assistant/students')}
        />
        <StatCard
          icon={Shield}
          label="الصلاحيات الممنوحة"
          value={permissions.length}
          color="amber"
        />
      </div>

      {/* Permissions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-primary-500" />
          <h2 className="font-bold text-gray-900 dark:text-white">صلاحياتك</h2>
        </div>
        {permissions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            لم يتم إعطاؤك أي صلاحيات حتى الآن. تواصل مع المدرس.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {permissions.map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium"
              >
                {PERMISSION_LABELS[p] || p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Groups Preview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary-500" />
            <h2 className="font-bold text-gray-900 dark:text-white">مجموعاتي</h2>
          </div>
          <button
            onClick={() => navigate('/assistant/groups')}
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            عرض الكل <ChevronLeft size={14} />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Layers size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">لم يتم تخصيص مجموعات لك بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.slice(0, 6).map((g) => (
              <button
                key={g.id}
                onClick={() => navigate(`/assistant/groups/${g.id}`)}
                className="text-right p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-primary-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{g.name}</p>
                    {g.subject?.name && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <BookOpen size={10} /> {g.subject.name}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-primary-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <Users size={12} className="text-emerald-500" />
                  <span>{g._count?.enrollments || 0} طالب</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/assistant/groups')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-primary-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <Layers size={18} className="text-indigo-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">المجموعات</p>
          <p className="text-xs text-gray-500">{totalGroups} مجموعة</p>
        </button>

        <button
          onClick={() => navigate('/assistant/students')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-emerald-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <Users size={18} className="text-emerald-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">الطلاب</p>
          <p className="text-xs text-gray-500">{totalStudents} طالب</p>
        </button>

        <button
          onClick={() => navigate('/assistant/assignments')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-blue-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <BookOpen size={18} className="text-blue-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">الواجبات</p>
          <p className="text-xs text-gray-500">تصحيح</p>
        </button>

        <button
          onClick={() => navigate('/assistant/profile')}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:border-amber-300 transition text-right group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-2 group-hover:scale-110 transition">
            <UserIcon size={18} className="text-amber-600" />
          </div>
          <p className="font-medium text-sm text-gray-900 dark:text-white">ملفي</p>
          <p className="text-xs text-gray-500">الحساب</p>
        </button>
      </div>
    </div>
  );
}
