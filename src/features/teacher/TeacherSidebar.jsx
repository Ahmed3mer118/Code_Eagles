import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  GraduationCap,
  BookOpen,
  BookMarked,
  Video,
  Layers,
  ClipboardList,
  FileText,
  HelpCircle,
  Trophy,
  Star,
  BarChart3,
  TrendingUp,
  CreditCard,
  Wallet,
  Ticket,
  History,
  Package,
  Crown,
  UserCog,
  Bell,
  Settings,
  Building2,
  UserCircle,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react';

// ============================================================
// هيكل الـ Sidebar الكامل
// ============================================================
const SIDEBAR_STRUCTURE = [
  // ===== 1. نظرة عامة =====
  {
    id: 'dashboard',
    label: 'نظرة عامة',
    labelKey: 'sidebar.dashboard',
    icon: LayoutDashboard,
    path: '/teacher/dashboard',
  },

  // ===== 2. إدارة الطلاب =====
  {
    id: 'students-mgmt',
    label: 'إدارة الطلاب',
    labelKey: 'sidebar.studentsManagement',
    icon: Users,
    children: [
      {
        id: 'pending-requests',
        label: 'طلبات الانضمام المعلقة',
        labelKey: 'sidebar.pendingRequests',
        icon: UserPlus,
        path: '/teacher/pending-requests',
        badge: 'pendingRequests', // ديناميكي
      },
      {
        id: 'students',
        label: 'الطلاب',
        labelKey: 'sidebar.students',
        icon: GraduationCap,
        path: '/teacher/students',
      },
      {
        id: 'parents',
        label: 'أولياء الأمور',
        labelKey: 'sidebar.parents',
        icon: UserCheck,
        path: '/teacher/parents', // ⚠️ صفحة ناقصة
      },
    ],
  },

  // ===== 3. المحتوى التعليمي =====
  {
    id: 'content',
    label: 'المحتوى التعليمي',
    labelKey: 'sidebar.content',
    icon: BookOpen,
    children: [
      {
        id: 'subjects',
        label: 'المواد',
        labelKey: 'sidebar.subjects',
        icon: BookOpen,
        path: '/teacher/subjects',
      },
      {
        id: 'courses',
        label: 'الكورسات',
        labelKey: 'sidebar.courses',
        icon: BookMarked,
        path: '/teacher/courses', // ⚠️ صفحة ناقصة
      },
      {
        id: 'lectures',
        label: 'المحاضرات',
        labelKey: 'sidebar.lectures',
        icon: Video,
        path: '/teacher/lectures', // ⚠️ صفحة ناقصة
      },
      {
        id: 'groups',
        label: 'المجموعات',
        labelKey: 'sidebar.groups',
        icon: Layers,
        path: '/teacher/groups',
      },
    ],
  },

  // ===== 4. التقييمات =====
  {
    id: 'assessments',
    label: 'التقييمات',
    labelKey: 'sidebar.assessments',
    icon: ClipboardList,
    children: [
      {
        id: 'quizzes',
        label: 'الاختبارات',
        labelKey: 'sidebar.quizzes',
        icon: ClipboardList,
        path: '/teacher/quizzes',
      },
      {
        id: 'assignments',
        label: 'الواجبات',
        labelKey: 'sidebar.assignments',
        icon: FileText,
        path: '/teacher/assignments',
      },
      {
        id: 'questions-bank',
        label: 'بنك الأسئلة',
        labelKey: 'sidebar.questionsBank',
        icon: HelpCircle,
        path: '/teacher/questions-bank', // ⚠️ صفحة ناقصة
      },
    ],
  },

  // ===== 5. التحفيز والنقاط =====
  {
    id: 'gamification',
    label: 'التحفيز والنقاط',
    labelKey: 'sidebar.gamification',
    icon: Trophy,
    children: [
      {
        id: 'points',
        label: 'النقاط',
        labelKey: 'sidebar.points',
        icon: Star,
        path: '/teacher/points', // ⚠️ صفحة ناقصة
      },
      {
        id: 'leaderboard',
        label: 'لوحة المتصدرين',
        labelKey: 'sidebar.leaderboard',
        icon: Trophy,
        path: '/teacher/leaderboard', // ⚠️ صفحة ناقصة
      },
    ],
  },

  // ===== 6. التقارير =====
  {
    id: 'reports',
    label: 'التقارير',
    labelKey: 'sidebar.reports',
    icon: BarChart3,
    children: [
      {
        id: 'reports-analytics',
        label: 'التقارير والتحليلات',
        labelKey: 'sidebar.reportsAnalytics',
        icon: TrendingUp,
        path: '/teacher/reports',
      },
    ],
  },

  // ===== 7. المدفوعات =====
  {
    id: 'payments',
    label: 'المدفوعات',
    labelKey: 'sidebar.payments',
    icon: CreditCard,
    children: [
      {
        id: 'pending-payments',
        label: 'مدفوعات معلقة',
        labelKey: 'sidebar.pendingPayments',
        icon: Wallet,
        path: '/teacher/payments/pending',
        badge: 'pendingPayments',
      },
      {
        id: 'payment-plans',
        label: 'خطط الدفع',
        labelKey: 'sidebar.paymentPlans',
        icon: CreditCard,
        path: '/teacher/payments/plans',
      },
      {
        id: 'promo-codes',
        label: 'أكواد الخصم',
        labelKey: 'sidebar.promoCodes',
        icon: Ticket,
        path: '/teacher/payments/promo-codes',
      },
      {
        id: 'payment-history',
        label: 'سجل المدفوعات',
        labelKey: 'sidebar.paymentHistory',
        icon: History,
        path: '/teacher/payments/history',
      },
    ],
  },

  // ===== 8. باقة المنصة =====
  {
    id: 'platform-subscription',
    label: 'باقة المنصة',
    labelKey: 'sidebar.platformSubscription',
    icon: Package,
    children: [
      {
        id: 'my-subscription',
        label: 'باقة المنصة',
        labelKey: 'sidebar.mySubscription',
        icon: Package,
        path: '/teacher/subscription',
      },
      {
        id: 'pay-subscription',
        label: 'دفع اشتراك المنصة',
        labelKey: 'sidebar.paySubscription',
        icon: Crown,
        path: '/teacher/subscription/pay',
      },
    ],
  },

  // ===== 9. الفريق =====
  {
    id: 'team',
    label: 'الفريق',
    labelKey: 'sidebar.team',
    icon: UserCog,
    children: [
      {
        id: 'assistants',
        label: 'المساعدين',
        labelKey: 'sidebar.assistants',
        icon: UserCog,
        path: '/teacher/settings/assistants', // موجود في SettingsPage
      },
    ],
  },

  // ===== 10. الإشعارات =====
  {
    id: 'notifications',
    label: 'الإشعارات',
    labelKey: 'sidebar.notifications',
    icon: Bell,
    path: '/teacher/notifications', // ⚠️ صفحة ناقصة
    badge: 'unreadNotifications',
  },

  // ===== 11. الإعدادات =====
  {
    id: 'settings',
    label: 'الإعدادات',
    labelKey: 'sidebar.settings',
    icon: Settings,
    children: [
      {
        id: 'tenant-settings',
        label: 'إعدادات الأكاديمية',
        labelKey: 'sidebar.tenantSettings',
        icon: Building2,
        path: '/teacher/settings/tenant',
      },
      {
        id: 'profile',
        label: 'الملف الشخصي',
        labelKey: 'sidebar.profile',
        icon: UserCircle,
        path: '/teacher/settings/profile',
      },
      {
        id: 'security',
        label: 'الأمان',
        labelKey: 'sidebar.security',
        icon: Shield,
        path: '/teacher/settings/security', // ⚠️ صفحة ناقصة
      },
    ],
  },
];

// ============================================================
// المكوّن الرئيسي
// ============================================================
export default function TeacherSidebar({
  isOpen,
  onClose,
  badges = {},
  collapsed: initialCollapsed = false,
}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // فتح المجموعة اللي فيها الصفحة الحالية تلقائياً
    const activeGroup = SIDEBAR_STRUCTURE.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    return activeGroup ? { [activeGroup.id]: true } : {};
  });

  // فتح المجموعة النشطة لما المسار يتغير
  useEffect(() => {
    const activeGroup = SIDEBAR_STRUCTURE.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    if (activeGroup) {
      setExpandedGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (children) =>
    children?.some((child) => location.pathname.startsWith(child.path));

  // ============================================================
  // Render
  // ============================================================
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full z-50
          bg-white dark:bg-gray-900 border-${isRTL ? 'l' : 'r'} border-gray-200 dark:border-gray-800
          transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? 'w-20' : 'w-72'}
          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img
                src="/images/LOGO.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {t('sidebar.teacherPanel')}
              </span>
            </div>
          )}

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />
            ) : (
              isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
            )}
          </button>

          {/* Close (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===== Navigation ===== */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {SIDEBAR_STRUCTURE.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedGroups[item.id];
            const groupActive = hasChildren && isGroupActive(item.children);
            const itemActive = !hasChildren && isActive(item.path);

            // ===== عنصر بدون children =====
            if (!hasChildren) {
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors duration-200 relative
                    ${
                      itemActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  title={collapsed ? t(item.labelKey, item.label) : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-sm">{t(item.labelKey, item.label)}</span>
                  )}
                  {item.badge && badges[item.badge] > 0 && (
                    <span
                      className={`
                        ${collapsed ? 'absolute top-1 right-1' : ''}
                        bg-red-500 text-white text-xs font-bold
                        rounded-full min-w-[20px] h-5 px-1.5
                        flex items-center justify-center
                      `}
                    >
                      {badges[item.badge] > 99 ? '99+' : badges[item.badge]}
                    </span>
                  )}
                </NavLink>
              );
            }

            // ===== عنصر مع children =====
            return (
              <div key={item.id}>
                <button
                  onClick={() => !collapsed && toggleGroup(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      groupActive
                        ? 'text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                  title={collapsed ? t(item.labelKey, item.label) : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm text-start">
                        {t(item.labelKey, item.label)}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </>
                  )}
                </button>

                {/* Children */}
                {!collapsed && isExpanded && (
                  <div className="mt-1 ms-4 ps-3 border-s-2 border-gray-200 dark:border-gray-700 space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.path);

                      return (
                        <NavLink
                          key={child.id}
                          to={child.path}
                          onClick={onClose}
                          className={`
                            group flex items-center gap-3 px-3 py-2 rounded-lg
                            transition-colors duration-200 relative text-sm
                            ${
                              childActive
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }
                          `}
                        >
                          <ChildIcon size={16} className="flex-shrink-0" />
                          <span className="flex-1">
                            {t(child.labelKey, child.label)}
                          </span>
                          {child.badge && badges[child.badge] > 0 && (
                            <span
                              className="
                                bg-red-500 text-white text-xs font-bold
                                rounded-full min-w-[18px] h-[18px] px-1
                                flex items-center justify-center
                              "
                            >
                              {badges[child.badge] > 99 ? '99+' : badges[child.badge]}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ===== Footer ===== */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="text-xs text-gray-400 text-center">
              © {new Date().getFullYear()} Teacher SaaS
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
