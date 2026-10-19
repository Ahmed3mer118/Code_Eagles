// src/features/student/hooks/useStudentLecture.js
import { useState, useEffect, useCallback } from 'react';
import studentLecturesApi from '../api/lectures.api';

export default function useStudentLecture(lectureId) {
  const [lecture, setLecture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLecture = useCallback(async () => {
    if (!lectureId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await studentLecturesApi.getLectureById(lectureId);
      const data = res?.data ?? res;
      setLecture(data);
    } catch (err) {
      console.error('Failed to load lecture:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل المحاضرة.',
      );
      setLecture(null);
    } finally {
      setIsLoading(false);
    }
  }, [lectureId]);

  useEffect(() => {
    fetchLecture();
  }, [fetchLecture]);

  return { lecture, isLoading, error, refetch: fetchLecture };
}
