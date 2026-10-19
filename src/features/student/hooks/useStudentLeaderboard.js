// src/features/student/hooks/useStudentLeaderboard.js
import { useCallback, useEffect, useState } from 'react';
import studentPointsApi from '../api/points.api';

export function useStudentLeaderboard(initialParams = {}) {
  const [params, setParams] = useState({
    limit: 20,
    period: 'all_time',
    ...initialParams,
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const clean = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) clean[k] = v;
      });
      const res = await studentPointsApi.getLeaderboard(clean);
      const payload = res?.data ?? res;
      setData(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل المتصدرين',
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = useCallback((patch) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  return { data, params, loading, error, refetch: fetchData, updateParams };
}

export default useStudentLeaderboard;
