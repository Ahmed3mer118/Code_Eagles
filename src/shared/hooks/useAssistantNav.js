import { useEffect, useState } from 'react';
import { assistantApi } from '../api/platformApi';
import NAV_ICONS from '../ui/navIcons';

const NAV = {
  requests: { to: '/dashboard/assistant/requests', labelKey: 'requests.title', icon: NAV_ICONS.requests, end: false },
  groups: { to: '/dashboard/assistant/groups', labelKey: 'dashboard.groups', icon: NAV_ICONS.groups, end: false },
  payments: { to: '/dashboard/assistant/payments', labelKey: 'dashboard.payments', icon: NAV_ICONS.payments, end: false },
  results: { to: '/dashboard/assistant/results', labelKey: 'dashboard.reports', icon: NAV_ICONS.results, end: false },
  content: { to: '/dashboard/assistant/content', labelKey: 'dashboard.subjects', icon: NAV_ICONS.subjects, end: false },
  quizzes: { to: '/dashboard/assistant/quizzes', labelKey: 'dashboard.quizzes', icon: NAV_ICONS.quizzes, end: false },
  assignments: { to: '/dashboard/assistant/assignments', labelKey: 'dashboard.assignments', icon: NAV_ICONS.assignments, end: false },
  activity: { to: '/dashboard/assistant/activity', labelKey: 'activity.nav', icon: NAV_ICONS.activity, end: false },
  settings: { to: '/dashboard/assistant/settings', labelKey: 'dashboard.settings', icon: NAV_ICONS.settings, end: false },
};

const NAV_BY_PERMISSION = {
  enroll_students: [NAV.requests, NAV.groups],
  manage_groups: [NAV.groups],
  review_payments: [NAV.payments],
  view_student_reports: [NAV.results, NAV.activity],
  view_limited_reports: [NAV.results, NAV.activity],
  manage_content: [NAV.content],
  manage_quizzes: [NAV.quizzes, NAV.activity],
  quiz_review: [NAV.quizzes, NAV.activity],
  homework_review: [NAV.assignments, NAV.activity],
};

const BASE = [NAV.activity, NAV.settings];

export function useAssistantNav() {
  const [navItems, setNavItems] = useState(BASE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await assistantApi.myPermissions();
        const perms = data.permissions || [];
        const items = [];
        perms.forEach((p) => {
          (NAV_BY_PERMISSION[p] || []).forEach((item) => {
            if (!items.find((x) => x.to === item.to)) items.push(item);
          });
        });
        setNavItems([...items, ...BASE]);
      } catch {
        setNavItems(BASE);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { navItems, loading };
}
