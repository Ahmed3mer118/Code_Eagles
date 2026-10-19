import { useState, useEffect, useCallback } from 'react';
import { getStudentLecturesByModule } from '../api/lectures.api';

export default function useStudentLectures(moduleId) {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLectures = useCallback(async () => {
    if (!moduleId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStudentLecturesByModule(moduleId);
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load lectures:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تحميل المحاضرات، حاول تاني.'
      );
      setLectures([]);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  return { lectures, isLoading, error, refetch: fetchLectures };
}
