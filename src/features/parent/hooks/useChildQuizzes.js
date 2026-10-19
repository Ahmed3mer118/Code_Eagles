// src/features/parent/hooks/useChildQuizzes.js
import { useState, useEffect, useCallback } from 'react';
import parentQuizzesApi from '../api/quizzes.api';

export function useChildQuizzes(childId) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError('');
    try {
      const res = await parentQuizzesApi.getChildQuizzes(childId);
      const payload = res?.data ?? res;
      setQuizzes(Array.isArray(payload) ? payload : payload?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تحميل اختبارات الابن');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { quizzes, loading, error, refetch: fetchData };
}

export default useChildQuizzes;
