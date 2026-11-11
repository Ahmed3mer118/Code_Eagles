// src/features/teacher/TeacherSidebar.jsx
import { NavLink } from 'react-router-dom';
import { useI18n } from '../../shared/i18n';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Video,
  UsersRound, FileQuestion, ClipboardList, Award, Trophy,
  BarChart3, Wallet, CreditCard, Tag, History, Bell,
  UserCog, Settings, Shield,
} from 'lucide-react';

export default function TeacherSidebar({ isOpen, onClose, badges = {} }) {
  const { t, dir } = useI18n();

  // ✅ كل المسارات مطلقة (absolute) بتبدأ بـ /teacher
  const items = [
    { to: '/teacher/dashboard',             icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/teacher/students',              icon: Users,           label: t('sidebar.students') },
    { to: '/teacher/parents',               icon: UsersRound,      label: t('sidebar.parents') },
    { to: '/teacher/subjects',              icon: BookOpen,        label: t('sidebar.subjects') },
    { to: '/teacher/courses',               icon: GraduationCap,   label: t('sidebar.courses') },
    { to: '/teacher/lectures',              icon: Video,           label: t('sidebar.lectures') },
    { to: '/teacher/groups',                icon: UsersRound,      label: t('sidebar.groups') },
    { to: '/teacher/quizzes',               icon: FileQuestion,    label: t('sidebar.quizzes') },
    { to: '/teacher/assignments',           icon: ClipboardList,   label: t('sidebar.assignments') },
    { to: '/teacher/points',                icon: Award,           label: t('sidebar.points') },
    { to: '/teacher/leaderboard',           icon: Trophy,          label: t('sidebar.leaderboard') },
    { to: '/teacher/reports',               icon: BarChart3,       label: t('sidebar.reports') },
    { to: '/teacher/payments/pending',      icon: Wallet,          label: t('sidebar.pendingPayments'), badge: badges.pendingPayments },
    { to: '/teacher/payments/plans',        icon: CreditCard,      label: t('sidebar.paymentPlans') },
    { to: '/teacher/payments/promo-codes',  icon: Tag,             label: t('sidebar.promoCodes') },
    { to: '/teacher/payments/history',      icon: History,         label: t('sidebar.paymentHistory') },
    { to: '/teacher/subscription',          icon: CreditCard,      label: t('sidebar.platformSubscription') },
    { to: '/teacher/notifications',         icon: Bell,            label: t('sidebar.notifications') },
    { to: '/teacher/settings/assistants',   icon: UserCog,         label: t('sidebar.assistants') },
    { to: '/teacher/settings/profile',      icon: Settings,        label: t('sidebar.profile') },
    { to: '/teacher/settings/security',     icon: Shield,          label: t('sidebar.security') },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 ${
          dir === 'rtl' ? 'right-0' : 'left-0'
        } z-50 w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 transform transition-transform lg:transform-none ${
          isOpen
            ? 'translate-x-0'
            : dir === 'rtl'
              ? 'translate-x-full'
              : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold text-lg">{t('teacher.layout.title')}</h2>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {items.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/teacher/dashboard'}  // ⬅️ عشان dashboard ميتعلمش active على باقي الصفحات
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
