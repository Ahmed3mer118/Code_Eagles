// src/features/parent/hooks/useParentDashboard.js
import { useState, useEffect, useCallback } from 'react';
import parentDashboardApi from '../api/dashboard.api';

export function useParentDashboard(childId) {
  const [data, setData] = useState({
    reports: null,
    assignments: [],
    quizzes: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    
    try {
      const [reportsRes, assignRes, quizRes] = await Promise.allSettled([
        parentDashboardApi.getChildReports(childId),
        parentDashboardApi.getChildAssignments(childId),
        parentDashboardApi.getChildQuizzes(childId),
      ]);

      const extract = (res, fallback = []) => {
        if (res.status !== 'fulfilled') return fallback;
        const payload = res.value?.data ?? res.value;
        return Array.isArray(payload) ? payload : payload?.data ?? payload;
      };

      setData({
        reports: extract(reportsRes, null),
        assignments: extract(assignRes),
        quizzes: extract(quizRes),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}

export default useParentDashboard;
