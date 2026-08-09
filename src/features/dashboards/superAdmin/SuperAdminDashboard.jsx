import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';

const navItems = [
  { to: '/dashboard/super-admin', labelKey: 'dashboard.overview', icon: NAV_ICONS.overview, end: true },
  { to: '/dashboard/super-admin/tenants', labelKey: 'dashboard.tenants', icon: NAV_ICONS.tenants },
  { to: '/dashboard/super-admin/subscriptions', labelKey: 'admin.subscriptions', icon: NAV_ICONS.subscriptions },
  { to: '/dashboard/super-admin/cms', labelKey: 'admin.cmsTitle', icon: NAV_ICONS.cms },
  { to: '/dashboard/super-admin/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
];

export default function SuperAdminDashboard() {
  return <DashboardShell titleKey="dashboard.superAdmin" navItems={navItems} brandMode="platform" />;
}
