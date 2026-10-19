// src/features/teacher/hooks/usePromoCodes.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

const EMPTY = { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };

export function usePromoCodes(initialParams = {}) {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    ...initialParams,
  });
  const [result, setResult] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await teacherApi.getPromoCodes(params);
      const payload = res?.data ?? res;
      const items = payload?.data ?? (Array.isArray(payload) ? payload : []);

      setResult({
        data: items,
        total: payload?.total ?? items.length,
        page: payload?.page ?? 1,
        limit: payload?.limit ?? 20,
        totalPages: payload?.totalPages ?? 1,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل أكواد الخصم',
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

  return { ...result, params, loading, error, refetch: fetchData, updateParams };
}

export default usePromoCodes;
