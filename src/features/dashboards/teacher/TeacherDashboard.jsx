import DashboardShell from '../../../shared/layouts/DashboardShell';

const navItems = [
  { to: '/dashboard/teacher', labelKey: 'dashboard.overview', end: true },
  { to: '/dashboard/teacher/requests', labelKey: 'requests.title' },
  { to: '/dashboard/teacher/subjects', labelKey: 'dashboard.subjects' },
  { to: '/dashboard/teacher/groups', labelKey: 'dashboard.groups' },
  { to: '/dashboard/teacher/students', labelKey: 'students.title' },
  { to: '/dashboard/teacher/quizzes', labelKey: 'dashboard.quizzes' },
  { to: '/dashboard/teacher/assignments', labelKey: 'dashboard.assignments' },
  { to: '/dashboard/teacher/results', labelKey: 'dashboard.reports' },
  { to: '/dashboard/teacher/reports', labelKey: 'reports.title' },
  { to: '/dashboard/teacher/payment-plans', labelKey: 'payments.plansTitle' },
  { to: '/dashboard/teacher/promo-codes', labelKey: 'promo.title' },
  { to: '/dashboard/teacher/payment-history', labelKey: 'payments.historyTitle' },
  { to: '/dashboard/teacher/payments', labelKey: 'payments.pendingTitle' },
  { to: '/dashboard/teacher/assistants', labelKey: 'dashboard.assistants' },
  { to: '/dashboard/teacher/settings', labelKey: 'dashboard.settings' },
];

export default function TeacherDashboard() {
  return <DashboardShell titleKey="dashboard.teacher" navItems={navItems} showTeacherSearch />;
}
