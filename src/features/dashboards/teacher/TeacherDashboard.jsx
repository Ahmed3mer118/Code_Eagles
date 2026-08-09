import { useMemo } from 'react';
import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';
import useTenantFeatures, { filterNavByFeatures } from '../../../shared/hooks/useTenantFeatures';

const allNavItems = [
  { to: '/dashboard/teacher', labelKey: 'dashboard.overview', icon: NAV_ICONS.overview, end: true },
  { to: '/dashboard/teacher/requests', labelKey: 'requests.title', icon: NAV_ICONS.requests },
  { to: '/dashboard/teacher/groups', labelKey: 'dashboard.groups', icon: NAV_ICONS.groups, featureKey: 'groups' },
  { to: '/dashboard/teacher/subjects', labelKey: 'dashboard.subjects', icon: NAV_ICONS.subjects },
  { to: '/dashboard/teacher/students', labelKey: 'students.title', icon: NAV_ICONS.students },
  { to: '/dashboard/teacher/quizzes', labelKey: 'dashboard.quizzes', icon: NAV_ICONS.quizzes, featureKey: 'quizzes' },
  { to: '/dashboard/teacher/assignments', labelKey: 'dashboard.assignments', icon: NAV_ICONS.assignments, featureKey: 'assignments' },
  { to: '/dashboard/teacher/assistants', labelKey: 'dashboard.assistants', icon: NAV_ICONS.assistants },
  { to: '/dashboard/teacher/results', labelKey: 'dashboard.reports', icon: NAV_ICONS.results },
  { to: '/dashboard/teacher/reports', labelKey: 'reports.title', icon: NAV_ICONS.reports },
  { to: '/dashboard/teacher/payments', labelKey: 'payments.pendingTitle', icon: NAV_ICONS.payments, featureKey: 'payments' },
  { to: '/dashboard/teacher/payment-plans', labelKey: 'payments.plansTitle', icon: NAV_ICONS.paymentPlans, featureKey: 'payments' },
  { to: '/dashboard/teacher/promo-codes', labelKey: 'promo.title', icon: NAV_ICONS.promoCodes, featureKey: 'payments' },
  { to: '/dashboard/teacher/payment-history', labelKey: 'payments.historyTitle', icon: NAV_ICONS.paymentHistory, featureKey: 'payments' },
  { to: '/dashboard/teacher/platform-subscription', labelKey: 'platformSub.nav', icon: NAV_ICONS.platformSubscription },
  { to: '/dashboard/teacher/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
];

export default function TeacherDashboard() {
  const { features } = useTenantFeatures();
  const navItems = useMemo(() => filterNavByFeatures(allNavItems, features), [features]);

  return <DashboardShell titleKey="dashboard.teacher" navItems={navItems} showTeacherSearch />;
}
