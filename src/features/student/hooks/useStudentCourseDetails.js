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

      // محاولة جلب المحاضرات من course.modules (لو موجودة)
      const modules = course?.modules || [];
      const lectures = course?.lectures || [];

      // لو course.modules فيه عناصر، محتاجين نجيب محاضرات كل module
      if (modules.length > 0) {
        const results = await Promise.allSettled(
          modules.map((m) => studentCoursesApi.getModuleLectures(m.id)),
        );

        const modulesWithLectures = modules.map((m, idx) => {
          const r = results[idx];
          let moduleLectures = [];
          if (r.status === 'fulfilled') {
            const p = r.value?.data ?? r.value;
            moduleLectures = Array.isArray(p)
              ? p
              : p?.data ?? p?.items ?? [];
          }
          return { ...m, lectures: moduleLectures };
        });

        setData({
          course,
          modules: modulesWithLectures,
          lectures: modulesWithLectures.flatMap((m) => m.lectures || []),
        });
      } else {
        setData({
          course,
          modules: [],
          lectures,
        });
      }
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
