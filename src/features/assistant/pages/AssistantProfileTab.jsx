// src/features/assistant/pages/AssistantProfileTab.jsx
import { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Lock,
  Users,
  BookOpen,
} from 'lucide-react';
import assistantApi from '../api/assistantApi';

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

export default function AssistantProfileTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await assistantApi.getMe();
        const data = res?.data ?? res;
        setProfile(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex flex-col items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl max-w-md">
          <p className="font-medium">حدث خطأ</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const user = profile?.user || {};
  const teacher = profile?.teacher || {};
  const permissions = profile?.permissions || [];
  const groups = profile?.groups || [];

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-l from-indigo-600 via-indigo-500 to-violet-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden shrink-0">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{user.name || 'مساعد'}</h2>
            <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
              <Mail size={14} /> {user.email}
            </p>
            {teacher.name && (
              <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                <UserIcon size={14} /> مساعد لدى: {teacher.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserIcon size={18} className="text-indigo-500" /> بياناتي
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">الاسم</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
              <Mail size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email || '—'}
                </p>
                <Lock size={12} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 py-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
              <Phone size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">رقم الهاتف</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.phoneNumber || '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs text-amber-700 dark:text-amber-400">
          🔒 لتعديل بياناتك، تواصل مع المدرس.
        </div>
      </div>

      {/* Permissions Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Shield size={18} className="text-amber-500" /> الصلاحيات الممنوحة
        </h3>

        {permissions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            لم يتم إعطاؤك أي صلاحيات حتى الآن.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {permissions.map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium"
              >
                {PERMISSION_LABELS[p] || p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Groups Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Users size={18} className="text-emerald-500" /> مجموعاتي
        </h3>

        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            لم يتم تخصيص أي مجموعات لك.
          </p>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {g.name}
                  </p>
                  {g.subject && (
                    <p className="text-xs text-gray-500">{g.subject}</p>
                  )}
                </div>
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
