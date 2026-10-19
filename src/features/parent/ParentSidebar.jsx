// src/features/parent/ParentSidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Bell,
  Award,
  Star,
  ClipboardList,
  FileText,
  Layers,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';

export default function ParentSidebar({ isOpen, onClose }) {
  const { logout } = useAuth();

  // التقسيمة اللي إنتي طلبتيها بالظبط
  const groups = [
    {
      title: 'لوحة ولي الأمر',
      links: [
        { to: '/parent/dashboard', icon: LayoutDashboard, label: 'نظرة عامة' },
        { to: '/parent/children', icon: Users, label: 'الأبناء' },
        { to: '/parent/requests', icon: LinkIcon, label: 'طلبات الربط' },
        { to: '/parent/notifications', icon: Bell, label: 'الإشعارات' },
      ],
    },
    {
      title: 'الأداء الدراسي',
      links: [
        { to: '/parent/grades', icon: Award, label: 'الدرجات' },
        { to: '/parent/points', icon: Star, label: 'النقاط' },
        { to: '/parent/quizzes', icon: ClipboardList, label: 'الاختبارات' },
        { to: '/parent/assignments', icon: FileText, label: 'الواجبات' },
      ],
    },
    {
      title: 'الاشتراكات',
      links: [
        { to: '/parent/enrollments', icon: Layers, label: 'المجموعات' },
        { to: '/parent/payments', icon: CreditCard, label: 'المدفوعات' },
      ],
    },
    {
      title: 'الحساب',
      links: [
        { to: '/parent/profile', icon: User, label: 'الملف الشخصي' },
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
          fixed top-0 bottom-0 start-0 z-50 w-64 bg-white dark:bg-gray-900 border-e border-gray-200
          transform transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0'}
        `}
        dir="rtl"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">لوحة ولي الأمر</h1>
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
                        ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}
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
          <div className="p-4 border-t border-gray-200">
            <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
