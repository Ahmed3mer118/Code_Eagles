import DashboardShell from '../../../shared/layouts/DashboardShell';

const navItems = [
  { to: '/dashboard/student/select-academy', labelKey: 'student.selectAcademyTitle' },
  { to: '/dashboard/student', labelKey: 'dashboard.overview', end: true },
  { to: '/dashboard/student/join', labelKey: 'student.joinGroup' },
  { to: '/dashboard/student/courses', labelKey: 'dashboard.myCourses' },
  { to: '/dashboard/student/assignments', labelKey: 'dashboard.assignments' },
  { to: '/dashboard/student/quizzes', labelKey: 'dashboard.quizzes' },
  { to: '/dashboard/student/leaderboard', labelKey: 'dashboard.leaderboard' },
  { to: '/dashboard/student/payments', labelKey: 'dashboard.payments' },
  { to: '/dashboard/student/settings', labelKey: 'dashboard.settings' },
];

export default function StudentDashboard() {
  return <DashboardShell titleKey="dashboard.student" navItems={navItems} />;
}
