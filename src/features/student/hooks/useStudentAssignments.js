import { useState, useEffect, useCallback } from 'react';
import { getStudentAssignments } from '../api/assignments.api';

export default function useStudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل الواجبات، حاول تاني.'
      );
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, isLoading, error, refetch: fetchAssignments };
}
