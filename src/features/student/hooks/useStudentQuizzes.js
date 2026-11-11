// src/features/student/hooks/useStudentQuizzes.js
import { useState, useEffect, useCallback } from 'react';
import { getStudentQuizzes } from '../api/quizzes.api';

export default function useStudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentQuizzes();
      console.log('🔍 [useStudentQuizzes] Data from API:', data); // 👈 هنبص على ده
      
      // الباك بيرجع array مباشرة أو { data: [...] }
      const list = Array.isArray(data) ? data : (data?.data || []);
      setQuizzes(list);
    } catch (err) {
      console.error('❌ [useStudentQuizzes] Error:', err);
      setError(err?.response?.data?.message || err?.message || 'حدث خطأ');
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, isLoading, error, refetch: fetchQuizzes };
}
