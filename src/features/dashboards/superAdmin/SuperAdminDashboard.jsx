import DashboardShell from '../../../shared/layouts/DashboardShell';

const navItems = [
  { to: '/dashboard/super-admin', labelKey: 'dashboard.overview', end: true },
  { to: '/dashboard/super-admin/tenants', labelKey: 'dashboard.tenants' },
  { to: '/dashboard/super-admin/subscriptions', labelKey: 'admin.subscriptions' },
  { to: '/dashboard/super-admin/cms', labelKey: 'admin.cmsTitle' },
  { to: '/dashboard/super-admin/settings', labelKey: 'dashboard.settings' },
];

export default function SuperAdminDashboard() {
  return <DashboardShell titleKey="dashboard.superAdmin" navItems={navItems} brandMode="platform" />;
}
