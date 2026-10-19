// src/features/student/StudentSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  Award,
  Bell,
  User,
  LogOut,
  Star,
  Trophy,
  CreditCard,
  Wallet,
  Layers,
  Package,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';

export default function StudentSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  const groups = [
    {
      title: 'التعلم',
      links: [
        { to: '/student/dashboard', icon: LayoutDashboard, label: 'نظرة عامة' },
        { to: '/student/subjects', icon: BookOpen, label: 'المواد' },
        { to: '/student/courses', icon: BookOpen, label: 'الكورسات' },
        { to: '/student/lectures', icon: Video, label: 'المحاضرات' },
        { to: '/student/enrollments', icon: Layers, label: 'مجموعاتي' },
      ],
    },
    {
      title: 'التقييم',
      links: [
        { to: '/student/assignments', icon: FileText, label: 'الواجبات' },
        { to: '/student/quizzes', icon: ClipboardList, label: 'الاختبارات' },
        { to: '/student/grades', icon: Award, label: 'الدرجات' },
      ],
    },
    {
      title: 'التحفيز',
      links: [
        { to: '/student/points', icon: Star, label: 'نقاطي' },
        { to: '/student/leaderboard', icon: Trophy, label: 'المتصدرين' },
      ],
    },
    {
      title: 'الاشتراك',
      links: [
        { to: '/student/payment-plans', icon: CreditCard, label: 'خطط الدفع' },
        { to: '/student/payments', icon: Wallet, label: 'مدفوعاتي' },
        { to: '/student/subscription', icon: Package, label: 'اشتراكي' },
      ],
    },
    {
      title: 'الحساب',
      links: [
        { to: '/student/notifications', icon: Bell, label: 'الإشعارات' },
        { to: '/student/profile', icon: User, label: 'الملف الشخصي' },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 start-0 z-50 w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-primary-600">لوحة الطالب</h1>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                        ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <link.icon size={18} />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
