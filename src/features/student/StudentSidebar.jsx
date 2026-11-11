// src/features/student/StudentSidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
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
  Package,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';

export default function StudentSidebar({ isOpen, onClose, isPending = false }) {
  const { logout } = useAuth();

  // حالة فتح وقفل الأقسام (أول قسم مفتوح افتراضياً)
  const [openSections, setOpenSections] = useState({
    learning: true,
    subscription: true,
    assessment: true,
    gamification: true,
    account: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const allowedWhilePending = [
    '/student/payment-plans',
    '/student/payments',
    '/student/subscription',
    '/student/profile',
    '/student/notifications',
  ];

  // الأقسام والروابط
  const groups = [
    {
      id: 'learning',
      title: 'التعلم',
      links: [
        { to: '/student/dashboard', icon: LayoutDashboard, label: 'نظرة عامة' },
        { to: '/student/subjects', icon: BookOpen, label: 'المواد' },
        { to: '/student/courses', icon: BookOpen, label: 'الكورسات' },
        // ❌ تم شيل "المحاضرات" من هنا
      ],
    },
    {
      id: 'subscription',
      title: 'الاشتراك',
      links: [
        { to: '/student/payment-plans', icon: CreditCard, label: 'خطط الدفع' },
        { to: '/student/payments', icon: Wallet, label: 'مدفوعاتي' },
        { to: '/student/subscription', icon: Package, label: 'اشتراكي' },
      ],
    },
    {
      id: 'assessment',
      title: 'التقييم',
      links: [
        { to: '/student/assignments', icon: FileText, label: 'الواجبات' },
        { to: '/student/quizzes', icon: ClipboardList, label: 'الاختبارات' },
        { to: '/student/grades', icon: Award, label: 'الدرجات' },
      ],
    },
    {
      id: 'gamification',
      title: 'التحفيز',
      links: [
        { to: '/student/points', icon: Star, label: 'نقاطي' },
        { to: '/student/leaderboard', icon: Trophy, label: 'المتصدرين' },
      ],
    },
    {
      id: 'account',
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
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
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
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-primary-600">لوحة الطالب</h1>
            {isPending && (
              <p className="text-[11px] text-amber-600 mt-1">
                ⏳ حسابك قيد المراجعة — يمكنك تفعيل الاشتراك من خطط الدفع
              </p>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {groups.map((group) => {
              const isSectionOpen = openSections[group.id];
              
              return (
                <div key={group.id} className="border-b border-gray-100 dark:border-gray-800/50 pb-2 last:border-0">
                  {/* Section Header (Toggle) */}
                  <button
                    onClick={() => toggleSection(group.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-gray-400 uppercase hover:text-gray-600 dark:hover:text-gray-200 transition"
                  >
                    <span>{group.title}</span>
                    {isSectionOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {/* Section Links */}
                  {isSectionOpen && (
                    <div className="space-y-0.5 mt-1">
                      {group.links.map((link) => {
                        const isLocked =
                          isPending && !allowedWhilePending.includes(link.to);

                        if (isLocked) {
                          return (
                            <div
                              key={link.to}
                              title="متاح بعد قبول اشتراكك"
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60"
                            >
                              <link.icon size={18} />
                              <span className="flex-1">{link.label}</span>
                              <Lock size={12} />
                            </div>
                          );
                        }

                        return (
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
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer (Logout) */}
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
