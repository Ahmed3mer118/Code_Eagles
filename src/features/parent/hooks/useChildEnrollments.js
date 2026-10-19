// src/features/parent/hooks/useChildEnrollments.js
import { useState, useEffect, useCallback } from 'react';
import parentEnrollmentsApi from '../api/enrollments.api';

export function useChildEnrollments(childId) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    try {
      const res = await parentEnrollmentsApi.getChildEnrollments(childId);
      const payload = res?.data ?? res;
      setGroups(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل مجموعات الابن');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { groups, loading, error, refetch: fetchData };
}

export default useChildEnrollments;
