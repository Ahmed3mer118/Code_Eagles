// src/features/teacher/hooks/useTeacherStats.js
import { useEffect, useState, useCallback } from 'react';
import teacherApi from '../../../shared/api/teacherApi';

/**
 * useTeacherStats
 * بيجيب أرقام الـ badges للـ sidebar:
 *  - pendingEnrollments
 *  - pendingPayments
 *  - unreadNotifications
 *  - unreadMessages (لو موجود)
 * وبيحدّثها كل 60 ثانية
 */
export function useTeacherStats() {
  const [badges, setBadges] = useState({
    pendingEnrollments: 0,
    pendingPayments: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    try {
      const [enrollRes, payRes, notifRes] = await Promise.allSettled([
        teacherApi.getEnrollments({ status: 'pending', limit: 1 }),
        teacherApi.getPaymentRequests({ status: 'pending', limit: 1 }),
        teacherApi.getUnreadCount(),
      ]);

      const pickTotal = (res) => {
        if (res.status !== 'fulfilled') return 0;
        const d = res.value?.data;
        return d?.total ?? d?.count ?? (Array.isArray(d) ? d.length : 0);
      };

      setBadges({
        pendingEnrollments: pickTotal(enrollRes),
        pendingPayments: pickTotal(payRes),
        unreadNotifications:
          notifRes.status === 'fulfilled'
            ? (notifRes.value?.data?.count ?? notifRes.value?.data ?? 0)
            : 0,
        unreadMessages: 0,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
    const interval = setInterval(fetchBadges, 60000);
    return () => clearInterval(interval);
  }, [fetchBadges]);

  return { badges, loading, refresh: fetchBadges };
}

export default useTeacherStats;
