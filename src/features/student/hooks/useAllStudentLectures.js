// src/features/student/hooks/useAllStudentLectures.js
import { useCallback, useEffect, useState } from 'react';
import studentLecturesApi from '../api/lectures.api';

/**
 * بيجيب كل محاضرات الطالب
 * الطريقة:
 * 1. courses → modules
 * 2. لكل module → lectures
 */
export function useAllStudentLectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 1. جلب كل الكورسات
      const coursesRes = await studentLecturesApi.getCourses();
      const coursesPayload = coursesRes?.data ?? coursesRes;
      const courses = Array.isArray(coursesPayload)
        ? coursesPayload
        : coursesPayload?.data ?? [];

      if (courses.length === 0) {
        setLectures([]);
        setLoading(false);
        return;
      }

      // 2. لكل كورس، نجيب الـ modules (لو مش موجودة)
      const coursesWithModules = await Promise.all(
        courses.map(async (course) => {
          if (course.modules && Array.isArray(course.modules) && course.modules.length > 0) {
            return course;
          }
          try {
            const detailRes = await studentLecturesApi.getCourse(course.id);
            const detail = detailRes?.data ?? detailRes;
            return { ...course, modules: detail?.modules || [] };
          } catch {
            return { ...course, modules: [] };
          }
        }),
      );

      // 3. جمع كل الـ modules من كل الكورسات
      const allModules = [];
      coursesWithModules.forEach((course) => {
        (course.modules || []).forEach((m) => {
          allModules.push({ ...m, _course: course });
        });
      });

      if (allModules.length === 0) {
        setLectures([]);
        setLoading(false);
        return;
      }

      // 4. لكل module، نجيب المحاضرات
      const lectureResults = await Promise.allSettled(
        allModules.map((m) => studentLecturesApi.getModuleLectures(m.id)),
      );

      const allLectures = [];
      lectureResults.forEach((result, idx) => {
        if (result.status !== 'fulfilled') return;
        const payload = result.value?.data ?? result.value;
        const moduleLectures = Array.isArray(payload)
          ? payload
          : payload?.data ?? [];

        const mod = allModules[idx];
        moduleLectures.forEach((lecture) => {
          allLectures.push({
            ...lecture,
            _course: mod._course,
            _module: mod,
          });
        });
      });

      setLectures(allLectures);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        setLectures([]);
      } else {
        setError(err?.response?.data?.message || 'فشل تحميل المحاضرات');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { lectures, loading, error, refetch: fetchData };
}

export default useAllStudentLectures;
