// src/features/student/hooks/useStudentDashboard.js
import { useCallback, useEffect, useState } from 'react';
import studentDashboardApi from '../api/dashboard.api';

export function useStudentDashboard() {
  const [data, setData] = useState({
    points: null,
    leaderboard: [],
    enrollments: [],
    assignments: [],
    quizzes: [],
    notifications: [],
    unreadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');

    // بنستخدم Promise.allSettled عشان لو endpoint فشل، الباقي يكمل
    const results = await Promise.allSettled([
      studentDashboardApi.getPoints(),
      studentDashboardApi.getLeaderboard({ limit: 5, period: 'all_time' }),
      studentDashboardApi.getEnrollments(),
      studentDashboardApi.getAssignments({ limit: 5 }),
      studentDashboardApi.getQuizzes({ limit: 5 }),
      studentDashboardApi.getNotifications({ limit: 5 }),
      studentDashboardApi.getUnreadCount(),
    ]);

    const extract = (result, fallback) => {
      if (result.status !== 'fulfilled') return fallback;
      const payload = result.value?.data ?? result.value;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.items)) return payload.items;
      return payload ?? fallback;
    };

    setData({
      points: extract(results[0], null),
      leaderboard: extract(results[1], []),
      enrollments: extract(results[2], []),
      assignments: extract(results[3], []),
      quizzes: extract(results[4], []),
      notifications: extract(results[5], []),
      unreadCount:
        results[6].status === 'fulfilled'
          ? results[6].value?.data?.count ??
            results[6].value?.data ??
            0
          : 0,
    });

    if (results.every((r) => r.status === 'rejected')) {
      setError('فشل تحميل البيانات');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
}

export default useStudentDashboard;
