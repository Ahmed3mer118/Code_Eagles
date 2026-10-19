// src/features/student/hooks/useStudentSubscription.js
import { useCallback, useEffect, useState } from 'react';
import studentEnrollmentsApi from '../api/enrollments.api';
import studentPaymentsApi from '../api/payments.api';

export function useStudentSubscription() {
  const [data, setData] = useState({
    enrollments: [],
    payments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [enrollmentsRes, paymentsRes] = await Promise.allSettled([
        studentEnrollmentsApi.getMyEnrollments(),
        studentPaymentsApi.getMyPaymentRequests(),
      ]);

      const extract = (res) => {
        if (res.status !== 'fulfilled') return [];
        const payload = res.value?.data ?? res.value;
        return Array.isArray(payload) ? payload : payload?.data ?? [];
      };

      setData({
        enrollments: extract(enrollmentsRes),
        payments: extract(paymentsRes),
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}

export default useStudentSubscription;
