// src/features/student/hooks/useStudentPoints.js
import { useCallback, useEffect, useState } from 'react';
import studentPointsApi from '../api/points.api';

export function useStudentPoints() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentPointsApi.getMyPoints();
      setData(res?.data ?? res);
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? 'ليس لديك صلاحية لعرض النقاط'
          : err?.response?.data?.message || 'فشل تحميل النقاط',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useStudentPoints;
