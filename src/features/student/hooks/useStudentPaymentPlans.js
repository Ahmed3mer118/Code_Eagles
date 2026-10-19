// src/features/student/hooks/useStudentPaymentPlans.js
import { useCallback, useEffect, useState } from 'react';
import studentPaymentsApi from '../api/payments.api';

export function useStudentPaymentPlans() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentPaymentsApi.getPaymentPlans();
      const payload = res?.data ?? res;
      setData(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'فشل تحميل الخطط',
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

export default useStudentPaymentPlans;
