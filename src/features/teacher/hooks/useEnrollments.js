// src/features/teacher/hooks/useEnrollments.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

const EMPTY = { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };

export function useEnrollments(initialParams = {}) {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'pending',
    ...initialParams,
  });
  const [result, setResult] = useState(EMPTY);
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

      const res = await teacherApi.getEnrollments(cleanParams);
      const payload = res?.data ?? res;
      const items =
        payload?.data ??
        payload?.items ??
        (Array.isArray(payload) ? payload : []);

      setResult({
        data: items,
        total: payload?.total ?? items.length,
        page: payload?.page ?? params.page ?? 1,
        limit: payload?.limit ?? params.limit ?? 20,
        totalPages:
          payload?.totalPages ??
          Math.max(1, Math.ceil((payload?.total ?? items.length) / (params.limit || 20))),
      });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض الطلبات'
          : err?.response?.data?.message || 'فشل تحميل الطلبات',
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
    ...result,
    params,
    loading,
    error,
    refetch: fetchData,
    updateParams,
  };
}

export default useEnrollments;
