// src/features/student/hooks/useStudentEnrollments.js
import { useCallback, useEffect, useState } from 'react';
import studentEnrollmentsApi from '../api/enrollments.api';

export function useStudentEnrollments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentEnrollmentsApi.getMyEnrollments();
      const payload = res?.data ?? res;
      setData(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل التسجيلات',
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

export default useStudentEnrollments;
