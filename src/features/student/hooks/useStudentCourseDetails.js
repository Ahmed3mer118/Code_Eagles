// src/features/student/hooks/useStudentCourseDetails.js
import { useCallback, useEffect, useState } from 'react';
import studentCoursesApi from '../api/courses.api';

export function useStudentCourseDetails(courseId) {
  const [data, setData] = useState({
    course: null,
    modules: [],
    lectures: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await studentCoursesApi.getCourse(courseId);
      const payload = res?.data ?? res;
      const course = payload?.data ?? payload;

      // ✅ الباك دلوقتي بيرجع الـ modules جواها الـ lectures
      const modules = course?.modules || [];
      const lectures = modules.flatMap((m) => m.lectures || []);

      setData({
        course,
        modules,
        lectures,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('الكورس غير موجود');
      } else {
        setError(err?.response?.data?.message || 'فشل تحميل الكورس');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}

export default useStudentCourseDetails;
