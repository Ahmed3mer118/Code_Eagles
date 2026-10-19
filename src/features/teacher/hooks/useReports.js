// src/features/teacher/hooks/useReports.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

export function useReports() {
  const [data, setData] = useState({
    overview: null,
    groups: [],
    topStudents: [],
    enrollmentsByMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 1. الإحصائيات العامة
      const statsRes = await teacherApi.getStats();
      const stats = statsRes?.data ?? statsRes;

      // 2. المجموعات
      const groupsRes = await teacherApi.getGroups({ limit: 100 });
      const groupsPayload = groupsRes?.data ?? groupsRes;
      const groups = groupsPayload?.data ?? groupsPayload ?? [];

      // 3. المتصدرين
      const leaderboardRes = await teacherApi.getLeaderboard({
        limit: 10,
        period: 'all_time',
      });
      const leaderboardPayload = leaderboardRes?.data ?? leaderboardRes;
      const topStudents = Array.isArray(leaderboardPayload)
        ? leaderboardPayload
        : leaderboardPayload?.data ?? [];

      // 4. التسجيلات الشهرية (نحسبها client-side من enrollments)
      let enrollmentsByMonth = [];
      try {
        const enrollmentsRes = await teacherApi.getEnrollments({
          limit: 100,
        });
        const enrollmentsPayload = enrollmentsRes?.data ?? enrollmentsRes;
        const enrollments = enrollmentsPayload?.data ?? [];

        // تجميع حسب الشهر (آخر 6 شهور)
        const monthMap = {};
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          const label = d.toLocaleDateString('ar-EG', { month: 'short' });
          monthMap[key] = { month: label, count: 0 };
        }

        enrollments.forEach((e) => {
          if (!e.createdAt) return;
          const d = new Date(e.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          if (monthMap[key]) monthMap[key].count += 1;
        });

        enrollmentsByMonth = Object.values(monthMap);
      } catch {
        // تجاهل لو مش متاح
      }

      setData({
        overview: stats,
        groups,
        topStudents,
        enrollmentsByMonth,
      });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض التقارير'
          : err?.response?.data?.message || 'فشل تحميل التقارير',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
}

export default useReports;
