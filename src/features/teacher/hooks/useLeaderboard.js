// src/features/teacher/hooks/useLeaderboard.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

export function useLeaderboard(initialParams = {}) {
  const [params, setParams] = useState({
    limit: 50,
    period: 'all_time',
    groupId: '',
    ...initialParams,
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cleanParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) cleanParams[k] = v;
      });

      const res = await teacherApi.getLeaderboard(cleanParams);
      const payload = res?.data ?? res;

      // الـ backend بيرجع مصفوفة مباشرة
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.leaderboard ?? [];

      setData(items);
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض المتصدرين'
          : err?.response?.data?.message || 'فشل تحميل المتصدرين',
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

  return {
    data,
    params,
    loading,
    error,
    refetch: fetchData,
    updateParams,
  };
}

export default useLeaderboard;
