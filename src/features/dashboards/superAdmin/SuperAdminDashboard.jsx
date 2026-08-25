import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../../shared/layouts/DashboardShell';
import NAV_ICONS from '../../../shared/ui/navIcons';
import { subscriptionApi } from '../../../shared/api/platformApi';
import { contactApi } from '../../../shared/api/contactApi';

export default function SuperAdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingContact, setPendingContact] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, contactRes] = await Promise.all([
          subscriptionApi.list({ status: 'pending' }),
          contactApi.list(),
        ]);
        setPendingRequests((subsRes.subscriptions || []).length);
        setPendingContact((contactRes.messages || []).filter((item) => !item.isReplied).length);
      } catch {
        setPendingRequests(0);
        setPendingContact(0);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = useMemo(
    () => [
      { to: '/dashboard/super-admin', labelKey: 'dashboard.overview', icon: NAV_ICONS.overview, end: true },
      { to: '/dashboard/super-admin/tenants', labelKey: 'dashboard.tenants', icon: NAV_ICONS.tenants },
      {
        to: '/dashboard/super-admin/subscription-requests',
        labelKey: 'admin.subscriptionRequests',
        icon: NAV_ICONS.subscriptions,
        badge: pendingRequests,
      },
      {
        to: '/dashboard/super-admin/contact-messages',
        labelKey: 'admin.contactMessages',
        icon: NAV_ICONS.contact,
        badge: pendingContact,
      },
      { to: '/dashboard/super-admin/subscriptions', labelKey: 'admin.platformPlans', icon: NAV_ICONS.paymentPlans },
      { to: '/dashboard/super-admin/cms', labelKey: 'admin.cmsTitle', icon: NAV_ICONS.cms },
      { to: '/dashboard/super-admin/activity', labelKey: 'activity.nav', icon: NAV_ICONS.activity },
      { to: '/dashboard/super-admin/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings },
    ],
    [pendingRequests, pendingContact]
  );

  return <DashboardShell titleKey="dashboard.superAdmin" navItems={navItems} brandMode="platform" />;
}
