import { useState, useEffect, useCallback } from 'react';
import { getStudentSubmissions } from '../api/assignments.api';
import { getStudentQuizzes } from '../api/quizzes.api';

export default function useStudentGrades() {
  const [submissions, setSubmissions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [submissionsData, quizzesData] = await Promise.all([
        getStudentSubmissions().catch(() => []),
        getStudentQuizzes().catch(() => []),
      ]);

      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (err) {
      console.error('Failed to load grades:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل الدرجات، حاول تاني.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { submissions, quizzes, isLoading, error, refetch: fetchAll };
}
