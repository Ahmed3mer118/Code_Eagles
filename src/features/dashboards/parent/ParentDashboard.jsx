import DashboardShell from '../../../shared/layouts/DashboardShell';

const navItems = [
  { to: '/dashboard/parent', labelKey: 'dashboard.children', end: true },
  { to: '/dashboard/parent/notifications', labelKey: 'parent.notificationsNav' },
  { to: '/dashboard/parent/payments', labelKey: 'dashboard.payments' },
  { to: '/dashboard/parent/settings', labelKey: 'dashboard.settings' },
];

export default function ParentDashboard() {
  return <DashboardShell titleKey="dashboard.parent" navItems={navItems} />;
}
