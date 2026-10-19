// src/features/parent/hooks/useChildAssignments.js
import { useState, useEffect, useCallback } from 'react';
import parentAssignmentsApi from '../api/assignments.api';

export function useChildAssignments(childId) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    try {
      const res = await parentAssignmentsApi.getChildAssignments(childId);
      const payload = res?.data ?? res;
      setAssignments(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل واجبات الابن');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { assignments, loading, error, refetch: fetchData };
}

export default useChildAssignments;
