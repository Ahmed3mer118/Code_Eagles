// src/features/parent/hooks/useChildPayments.js
import { useState, useEffect, useCallback } from 'react';
import parentPaymentsApi from '../api/payments.api';

export function useChildPayments(childId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    try {
      const res = await parentPaymentsApi.getChildPayments(childId);
      const payload = res?.data ?? res;
      setData(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل مدفوعات الابن');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useChildPayments;
