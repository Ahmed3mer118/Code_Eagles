import { useEffect, useState } from 'react';
import { assistantApi } from '../api/platformApi';

const NAV_BY_PERMISSION = {
  enroll_students: [{ to: '/dashboard/assistant/requests', labelKey: 'requests.title', end: false }, { to: '/dashboard/assistant/groups', labelKey: 'dashboard.groups', end: false }],
  manage_groups: [{ to: '/dashboard/assistant/groups', labelKey: 'dashboard.groups', end: false }],
  review_payments: [{ to: '/dashboard/assistant/payments', labelKey: 'dashboard.payments', end: false }],
  view_student_reports: [{ to: '/dashboard/assistant/results', labelKey: 'dashboard.reports', end: false }],
  view_limited_reports: [{ to: '/dashboard/assistant/results', labelKey: 'dashboard.reports', end: false }],
  manage_content: [{ to: '/dashboard/assistant/content', labelKey: 'dashboard.subjects', end: false }],
  manage_quizzes: [{ to: '/dashboard/assistant/quizzes', labelKey: 'dashboard.quizzes', end: false }],
  quiz_review: [{ to: '/dashboard/assistant/quizzes', labelKey: 'dashboard.quizzes', end: false }],
  homework_review: [{ to: '/dashboard/assistant/assignments', labelKey: 'dashboard.assignments', end: false }],
};

const BASE = [{ to: '/dashboard/assistant/settings', labelKey: 'dashboard.settings', end: false }];

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
