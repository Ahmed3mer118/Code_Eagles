// src/features/teacher/hooks/usePoints.js
import { useCallback, useEffect, useState } from 'react';
import teacherApi from '@/shared/api/teacherApi';

const EMPTY = { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };

export function usePoints(initialParams = {}) {
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    studentId: '',
    source: '',
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

      const res = await teacherApi.getPoints(cleanParams);
      // الـ client بيرجع axios response، الـ data جواه
      const payload = res?.data ?? res;

      setResult({
        data: payload?.data ?? [],
        total: payload?.total ?? 0,
        page: payload?.page ?? params.page ?? 1,
        limit: payload?.limit ?? params.limit ?? 20,
        totalPages: payload?.totalPages ?? 1,
      });
    } catch (err) {
      const status = err?.response?.status;
      setError(
        status === 403
          ? 'ليس لديك صلاحية لعرض النقاط'
          : err?.response?.data?.message || 'فشل تحميل النقاط',
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

export default usePoints;
