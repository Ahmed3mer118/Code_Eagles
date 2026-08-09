import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';

const navItems = [
  { to: '/dashboard/parent', labelKey: 'dashboard.children', icon: NAV_ICONS.children, end: true },
  { to: '/dashboard/parent/notifications', labelKey: 'parent.notificationsNav', icon: NAV_ICONS.notifications },
  { to: '/dashboard/parent/payments', labelKey: 'dashboard.payments', icon: NAV_ICONS.payments },
  { to: '/dashboard/parent/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
];

export default function ParentDashboard() {
  return <DashboardShell titleKey="dashboard.parent" navItems={navItems} />;
}
