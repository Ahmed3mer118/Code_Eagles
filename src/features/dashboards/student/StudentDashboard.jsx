import { useMemo } from 'react';
import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';
import useTenantFeatures, { filterNavByFeatures } from '../../../shared/hooks/useTenantFeatures';

const allNavItems = [
  { to: '/dashboard/student', labelKey: 'dashboard.overview', icon: NAV_ICONS.overview, end: true },
  { to: '/dashboard/student/select-academy', labelKey: 'student.selectAcademyTitle', icon: NAV_ICONS.selectAcademy },
  { to: '/dashboard/student/join', labelKey: 'student.joinGroup', icon: NAV_ICONS.joinGroup, featureKey: 'groups' },
  { to: '/dashboard/student/courses', labelKey: 'dashboard.myCourses', icon: NAV_ICONS.myCourses },
  { to: '/dashboard/student/assignments', labelKey: 'dashboard.assignments', icon: NAV_ICONS.assignments, featureKey: 'assignments' },
  { to: '/dashboard/student/quizzes', labelKey: 'dashboard.quizzes', icon: NAV_ICONS.quizzes, featureKey: 'quizzes' },
  { to: '/dashboard/student/leaderboard', labelKey: 'dashboard.leaderboard', icon: NAV_ICONS.leaderboard, featureKey: 'leaderboard' },
  { to: '/dashboard/student/payments', labelKey: 'dashboard.payments', icon: NAV_ICONS.payments, featureKey: 'payments' },
  { to: '/dashboard/student/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
];

export default function StudentDashboard() {
  const { features } = useTenantFeatures();
  const navItems = useMemo(() => filterNavByFeatures(allNavItems, features), [features]);

  return <DashboardShell titleKey="dashboard.student" navItems={navItems} />;
}
