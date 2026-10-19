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
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل الاختبارات، حاول تاني.'
      );
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
