// src/features/parent/hooks/useChildPoints.js
import { useState, useEffect, useCallback } from 'react';
import parentPointsApi from '../api/points.api';

export function useChildPoints(childId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    try {
      const res = await parentPointsApi.getChildPoints(childId);
      setData(res?.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل نقاط الابن');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useChildPoints;
