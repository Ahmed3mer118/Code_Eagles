import { useMemo } from 'react';
import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';
import useTenantFeatures, { filterNavByFeatures } from '../../../shared/hooks/useTenantFeatures';
import { filterNavByPackage } from '../../../shared/utils/packageAccess';
import StudentAcademySwitcher from '../../student/components/StudentAcademySwitcher';
import { StudentAcademyProvider, useStudentAcademyContext } from '../../student/StudentAcademyContext';

const allNavItems = [
  { to: '/dashboard/student', labelKey: 'dashboard.overview', icon: NAV_ICONS.overview, end: true },
  { to: '/dashboard/student/select-academy', labelKey: 'student.switchAcademy', icon: NAV_ICONS.selectAcademy },
  { to: '/dashboard/student/join', labelKey: 'student.joinGroup', icon: NAV_ICONS.joinGroup, featureKey: 'groups' },
  { to: '/dashboard/student/courses', labelKey: 'dashboard.myCourses', icon: NAV_ICONS.myCourses, packageAccess: 'lectures' },
  { to: '/dashboard/student/assignments', labelKey: 'dashboard.assignments', icon: NAV_ICONS.assignments, featureKey: 'assignments', packageAccess: 'assignments' },
  { to: '/dashboard/student/quizzes', labelKey: 'dashboard.quizzes', icon: NAV_ICONS.quizzes, featureKey: 'quizzes', packageAccess: 'exams' },
  { to: '/dashboard/student/leaderboard', labelKey: 'dashboard.leaderboard', icon: NAV_ICONS.leaderboard, featureKey: 'leaderboard' },
  { to: '/dashboard/student/subscription', labelKey: 'dashboard.subscription', icon: NAV_ICONS.platformSubscription, featureKey: 'payments' },
  { to: '/dashboard/student/payments', labelKey: 'dashboard.payments', icon: NAV_ICONS.payments, featureKey: 'payments' },
  { to: '/dashboard/student/link-requests', labelKey: 'linkRequest.nav', icon: NAV_ICONS.linkRequests },
  { to: '/dashboard/student/activity', labelKey: 'activity.nav', icon: NAV_ICONS.activity },
  { to: '/dashboard/student/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
];

function StudentDashboardShell() {
  const { features, packageAccess } = useTenantFeatures();
  const {
    currentAcademy,
    academies,
    loading,
    requiresSelection,
  } = useStudentAcademyContext();

  const navItems = useMemo(
    () => filterNavByPackage(filterNavByFeatures(allNavItems, features), packageAccess),
    [features, packageAccess]
  );

  const enterableCount = academies.filter(
    (item) => item.activeCount > 0 || item.pendingCount > 0 || item.isCatalog
  ).length;

  const switcherProps = {
    academy: currentAcademy,
    academyCount: requiresSelection ? enterableCount : academies.length,
    loading,
  };

  return (
    <DashboardShell
      titleKey="dashboard.student"
      navItems={navItems}
      headerExtra={<StudentAcademySwitcher {...switcherProps} variant="header" />}
      sidebarExtra={<StudentAcademySwitcher {...switcherProps} variant="sidebar" />}
    />
  );
}

export default function StudentDashboard() {
  return (
    <StudentAcademyProvider>
      <StudentDashboardShell />
    </StudentAcademyProvider>
  );
}
