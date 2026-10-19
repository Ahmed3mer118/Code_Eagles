// src/features/student/hooks/useStudentCourses.js
import { useCallback, useEffect, useState } from 'react';
import studentCoursesApi from '../api/courses.api';

export function useStudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentCoursesApi.getCourses();
      const payload = res?.data ?? res;
      const items = Array.isArray(payload)
        ? payload
        : payload?.data ?? payload?.items ?? [];
      setCourses(items);
    } catch (err) {
      const status = err?.response?.status;
      // 403 = مفيش صلاحية، 404 = endpoint مش موجود
      if (status === 403 || status === 404) {
        setCourses([]);
      } else {
        setError(err?.response?.data?.message || 'فشل تحميل الكورسات');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { courses, loading, error, refetch: fetchData };
}

export default useStudentCourses;
